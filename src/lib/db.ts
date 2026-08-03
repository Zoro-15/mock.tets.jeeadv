import { Test, Attempt, Question, QuestionResponse, LeaderboardEntry, User } from './types';
import { allTests, generateQuestionsForTest } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

let cachedUniqueTestNames: string[] | null = null;

function findDatabaseTestName(test: Test, uniqueNames: string[]): string | null {
  // If the test has an explicit sourceFileName configured, check it first
  if (test.sourceFileName && uniqueNames.includes(test.sourceFileName)) {
    return test.sourceFileName;
  }

  const titleLower = test.title.toLowerCase();

  // 1. JEE Main mapping
  if (test.category === 'jee_main') {
    const yearMatch = test.title.match(/(20\d{2})/);
    const year = yearMatch ? yearMatch[1] : '';
    const dateMatch = test.title.match(/(\d+)\s+(January|April|June|July|February|March|September)/i);
    const date = dateMatch ? dateMatch[1] : '';
    const month = dateMatch ? dateMatch[2].substring(0, 3) : ''; // e.g. "Jan"
    const shiftMatch = test.title.match(/(Shift \d+)/i);
    const shift = shiftMatch ? shiftMatch[1] : '';

    if (year && date && month && shift) {
      const matched = uniqueNames.find(name => {
        const nLower = name.toLowerCase();
        return nLower.includes('main') &&
               nLower.includes(year) &&
               nLower.includes(date) &&
               nLower.includes(month.toLowerCase()) &&
               nLower.includes(shift.toLowerCase());
      });
      if (matched) return matched;
    }
  }

  // 2. JEE Advanced mapping
  if (test.category === 'jee_advanced') {
    const yearMatch = test.title.match(/(20\d{2})/);
    const year = yearMatch ? yearMatch[1] : '';
    const paperMatch = test.title.match(/Paper\s*(\d)/i);
    const paperNum = paperMatch ? paperMatch[1] : '';

    if (year && paperNum) {
      const matched = uniqueNames.find(name => {
        const nLower = name.toLowerCase();
        return nLower.includes('advanced') &&
               nLower.includes(year) &&
               (nLower.includes(`paper ${paperNum}`) || nLower.includes(`paper-${paperNum}`));
      });
      if (matched) return matched;
    }
  }

  // 3. Exemplar mapping
  if (test.category === 'exemplar') {
    const parts = test.title.split(':');
    const chapterName = parts.length > 1 ? parts[1].trim() : test.title;
    const cleanChapter = chapterName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const matched = uniqueNames.find(name => {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanName.includes(cleanChapter) || cleanChapter.includes(cleanName) ||
             (cleanChapter.startsWith('probability') && cleanName.startsWith('probability')) ||
             (cleanChapter.startsWith('threedimensional') && cleanName.startsWith('threedimensional')) ||
             (cleanChapter.startsWith('three-dimensional') && cleanName.startsWith('three-dimensional'));
    });
    if (matched) return matched;
  }

  const cleanTitle = test.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchedDirect = uniqueNames.find(name => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanName.includes(cleanTitle) || cleanTitle.includes(cleanName);
  });
  
  return matchedDirect || null;
}

const USER_SESSION_KEY = 'jee_mock_user_session';
const ATTEMPTS_KEY = 'jee_mock_attempts';

// ========================================================
// 0. TEST CONFIGURATIONS AND LOOKUP
// ========================================================
export function getTests(): Test[] {
  return allTests;
}

export function getTestById(id: string): Test | undefined {
  return allTests.find(t => t.id === id);
}

// ========================================================
// 1. USER SESSION MANAGEMENT (AUTH)
// ========================================================

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading user session:', e);
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error writing user session:', e);
  }
}

export async function loginUser(studentCode: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const deviceToken = getOrGenerateDeviceToken();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_code', studentCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'PIN not found. Please register first.' };
        }
        throw error;
      }

      if (data) {
        // Update last login
        await supabase
          .from('users')
          .update({
            last_login: new Date().toISOString(),
            device_token: deviceToken
          })
          .eq('id', data.id);

        const user: User = {
          id: data.id,
          name: data.name,
          rollNumber: data.cadet_number, // Map db cadet_number to rollNumber
          studentCode: data.student_code
        };

        setCurrentUser(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.warn('Supabase login failed, entering offline fallback:', err);
      return { success: false, error: 'Database connection error. Try again.' };
    }
  }

  // Local storage offline fallback check
  const fallbackUsers = getFallbackUsers();
  const localUser = fallbackUsers.find(u => u.studentCode === studentCode);
  if (localUser) {
    setCurrentUser(localUser);
    return { success: true, user: localUser };
  }

  return { success: false, error: 'Offline PIN not found. Please register.' };
}

export async function registerUser(name: string, rollNumber: string, studentCode: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const deviceToken = getOrGenerateDeviceToken();

  if (isSupabaseConfigured && supabase) {
    try {
      // Check if roll number or code already exists in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`cadet_number.eq.${rollNumber},student_code.eq.${studentCode}`)
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        return { success: false, error: 'Roll Number or PIN already registered.' };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name,
          cadet_number: rollNumber,
          student_code: studentCode,
          device_token: deviceToken,
          last_login: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          rollNumber: data.cadet_number,
          studentCode: data.student_code
        };

        setCurrentUser(user);
        return { success: true, user };
      }
    } catch (err: any) {
      console.error('Supabase registration failed:', err);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  // Local storage offline fallback registration
  const fallbackUsers = getFallbackUsers();
  const exists = fallbackUsers.some(u => u.rollNumber === rollNumber || u.studentCode === studentCode);
  if (exists) {
    return { success: false, error: 'Roll Number or PIN already registered locally.' };
  }

  const localUser: User = {
    id: `local-user-${Date.now()}`,
    name,
    rollNumber,
    studentCode
  };

  fallbackUsers.push(localUser);
  saveFallbackUsers(fallbackUsers);
  setCurrentUser(localUser);

  return { success: true, user: localUser };
}

function getFallbackUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('jee_mock_fallback_users');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveFallbackUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('jee_mock_fallback_users', JSON.stringify(users));
  } catch (e) {}
}

function getOrGenerateDeviceToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('jee_mock_device_token');
  if (!token) {
    token = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem('jee_mock_device_token', token);
  }
  return token;
}

// ========================================================
// 2. DYNAMIC QUESTION FETCHING
// ========================================================

const questionsCache: Record<string, Question[]> = {};

export async function getQuestionsForTest(testId: string): Promise<Question[]> {
  if (questionsCache[testId]) {
    return questionsCache[testId];
  }
  const test = getTestById(testId);
  if (!test) return [];

  if (isSupabaseConfigured && supabase) {
    try {
      if (!cachedUniqueTestNames) {
        const { data: nameData, error: nameError } = await supabase
          .from('jee_questions')
          .select('Test_Name');
        if (!nameError && nameData) {
          cachedUniqueTestNames = Array.from(new Set(nameData.map((r: any) => r.Test_Name)));
        }
      }

      let matchedTestName: string | null = null;
      if (cachedUniqueTestNames) {
        matchedTestName = findDatabaseTestName(test, cachedUniqueTestNames);
      }

      let query = supabase.from('jee_questions').select('*');
      
      if (matchedTestName) {
        query = query.eq('Test_Name', matchedTestName);
      } else {
        if (test.sourceFileName) {
          query = query.eq('Test_Name', test.sourceFileName);
        } else {
          if (test.category === 'exemplar') {
            query = query.ilike('Test_Name', `%${test.title.replace(/chapter\s+/gi, '')}%`);
          } else if (test.category === 'jee_main') {
            const match = test.title.match(/(20\d{2})/);
            const year = match ? match[1] : '';
            if (year) {
              query = query.ilike('Test_Name', `%${year}%`).ilike('Test_Name', '%main%');
            }
          } else if (test.category === 'jee_advanced') {
            const match = test.title.match(/(20\d{2})/);
            const year = match ? match[1] : '';
            if (year) {
              query = query.ilike('Test_Name', `%${year}%`).ilike('Test_Name', '%advanced%');
            }
          }
        }
      }

      const { data, error } = await query.order('Question_Number', { ascending: true, nullsFirst: false }).order('id', { ascending: true });
      if (error) throw error;

      if (data && data.length > 0) {
        const uniqueSourceFiles = Array.from(new Set(data.map((r: any) => r.Test_Name)));
        let selectedSourceFile = uniqueSourceFiles[0];

        if (uniqueSourceFiles.length > 1 && (test.category === 'jee_main' || test.category === 'jee_advanced')) {
          const shiftMatch = test.title.match(/(Shift \d+|Paper \d+)/i);
          const matchVal = shiftMatch ? shiftMatch[1] : null;
          if (matchVal) {
            const matchedFile = uniqueSourceFiles.find((sf: any) => 
              typeof sf === 'string' && (sf.toLowerCase().includes(matchVal.toLowerCase()))
            );
            if (matchedFile) {
              selectedSourceFile = matchedFile;
            }
          }
        }

        const isolatedData = data.filter((row: any) => row.Test_Name === selectedSourceFile);
        console.log(`[Supabase] Loaded ${isolatedData.length} questions for test: ${testId} from ${selectedSourceFile}`);

        // Map database columns to Question interface
        const mapped = isolatedData.map((row: any) => ({
          id: row.id.toString(),
          type: (row.Question_Text?.includes('pmatrix') || row.Question_Text?.includes('\\frac') ? 'latex' : 'text') as 'latex' | 'text',
          questionText: row.Question_Text || '',
          comprehension: row.Comprehension || undefined,
          options: [row.Option_1 || '', row.Option_2 || '', row.Option_3 || '', row.Option_4 || ''],
          correctOptionIndex: (Number(row.Correct_Answer) || 1) - 1,
          explanation: row.Solution || '',
          questionNumber: Number(row.Question_Number) || undefined,
          positiveMarks: row.Positive_Marks !== undefined && row.Positive_Marks !== null ? Number(row.Positive_Marks) : undefined,
          negativeMarks: row.Negative_Marks !== undefined && row.Negative_Marks !== null ? Number(row.Negative_Marks) : undefined
        }));
        questionsCache[testId] = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn(`[Supabase] Question fetch failed for ${testId}, using local fallback:`, err);
    }
  }

  console.log(`[Local Fallback] Using mock fallback questions for test: ${testId}`);
  // Fallback to local generated data
  const fallback = generateQuestionsForTest(testId);
  questionsCache[testId] = fallback;
  return fallback;
}

// ========================================================
// 3. ATTEMPTS SYNCING
// ========================================================

function getLocalAttempts(): Record<string, Attempt> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalAttempts(attempts: Record<string, Attempt>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (e) {}
}

export async function syncAttemptProgress(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number,
  currentQuestionIndex: number
): Promise<Attempt | null> {
  const attempts = getLocalAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  attempt.responses = responses;
  attempt.timeLeft = timeLeft;
  attempt.currentQuestionIndex = currentQuestionIndex;

  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  // Sync to Supabase
  const currentUser = getCurrentUser();
  if (isSupabaseConfigured && supabase && currentUser) {
    try {
      await supabase
        .from('test_attempts')
        .upsert({
          id: attemptId,
          user_id: currentUser.id,
          test_id: attempt.testId,
          score: attempt.score,
          correct_count: attempt.correctCount,
          incorrect_count: attempt.incorrectCount,
          unattempted_count: attempt.unattemptedCount,
          accuracy: attempt.accuracy,
          time_taken: attempt.timeTaken,
          responses: responses,
          completed_at: null
        });
    } catch (err) {
      console.warn('Supabase attempt sync failed:', err);
    }
  }

  return attempt;
}

export async function submitAttemptToSupabase(
  attemptId: string,
  responses: Record<string, QuestionResponse>,
  timeLeft: number
): Promise<Attempt | null> {
  const attempts = getLocalAttempts();
  const attempt = attempts[attemptId];
  if (!attempt) return null;

  const test = getTestById(attempt.testId);
  if (!test) return null;

  const questions = await getQuestionsForTest(attempt.testId);
  
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let scoreRaw = 0;

  const marksPerQuestion = test.marks / test.questionsCount;

  questions.forEach((q) => {
    const resp = responses[q.id];
    const posMarks = q.positiveMarks !== undefined && q.positiveMarks !== null && q.positiveMarks !== 0 ? q.positiveMarks : marksPerQuestion;
    const negMarks = q.negativeMarks !== undefined && q.negativeMarks !== null && q.negativeMarks !== 0 ? q.negativeMarks : test.negativeMarking;

    if (!resp) {
      unattemptedCount++;
      return;
    }

    const isMultiple = q.correctOptionIndices && q.correctOptionIndices.length > 0;
    const isTextBased = q.type === 'integer' || q.type === 'numeric';

    let isAttempted = false;
    let isCorrect = false;

    if (isTextBased) {
      if (!resp.textResponse || resp.textResponse.trim() === '') {
        unattemptedCount++;
      } else {
        isAttempted = true;
        if (resp.textResponse.trim() === q.correctTextResponse?.trim()) {
          isCorrect = true;
        }
      }
    } else if (isMultiple) {
      const selected = resp.selectedOptionIndices || [];
      const correct = q.correctOptionIndices || [];
      const isCorrectCheck = selected.length === correct.length && selected.every(val => correct.includes(val));
      if (selected.length === 0) {
        unattemptedCount++;
      } else {
        isAttempted = true;
        if (isCorrectCheck) {
          isCorrect = true;
        }
      }
    } else {
      if (resp.selectedOptionIndex === null) {
        unattemptedCount++;
      } else {
        isAttempted = true;
        if (resp.selectedOptionIndex === q.correctOptionIndex) {
          isCorrect = true;
        }
      }
    }

    if (isAttempted) {
      if (isCorrect) {
        correctCount++;
        scoreRaw += posMarks;
      } else {
        incorrectCount++;
        scoreRaw -= negMarks;
      }
    }
  });
  const score = Math.round(scoreRaw * 100) / 100;

  const totalAttempted = correctCount + incorrectCount;
  const accuracy = totalAttempted > 0 
    ? Math.round((correctCount / totalAttempted) * 100 * 100) / 100 
    : 0;

  // Relative percentile
  let percentile = 75;
  if (totalAttempted > 0) {
    const ratio = score / test.marks;
    percentile = 70 + ratio * 28 + (Math.random() * 2 - 1);
    percentile = Math.max(5.5, Math.min(99.9, Math.round(percentile * 100) / 100));
  }

  attempt.responses = responses;
  attempt.timeLeft = timeLeft;
  attempt.completed = true;
  attempt.score = score;
  attempt.accuracy = accuracy;
  attempt.percentile = percentile;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.unattemptedCount = unattemptedCount;
  attempt.timeTaken = test.duration * 60 - timeLeft;
  attempt.completedAt = new Date().toISOString();

  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  // Send completed attempt to Supabase (Fire and Forget Background Sync)
  const currentUser = getCurrentUser();
  if (isSupabaseConfigured && supabase && currentUser) {
    (async () => {
      try {
        await supabase
          .from('test_attempts')
          .upsert({
            id: attemptId,
            user_id: currentUser.id,
            test_id: attempt.testId,
            score: score,
            correct_count: correctCount,
            incorrect_count: incorrectCount,
            unattempted_count: unattemptedCount,
            accuracy: accuracy,
            time_taken: attempt.timeTaken,
            responses: responses,
            completed_at: new Date().toISOString()
          });
        console.log('[Background Sync] Successfully synced test attempt to Supabase');
      } catch (err) {
        console.error('Failed to submit attempt to Supabase:', err);
      }
    })();
  }

  return attempt;
}

export function createAttempt(testId: string): Attempt | null {
  const test = getTestById(testId);
  if (!test) return null;

  // Note: questions will load dynamically in the active test, so we prepare layout empty responses
  const attemptId = `attempt-${Date.now()}`;
  const attempt: Attempt = {
    id: attemptId,
    testId,
    responses: {},
    timeLeft: test.duration * 60,
    currentQuestionIndex: 0,
    completed: false,
    score: 0,
    accuracy: 0,
    percentile: 0,
    correctCount: 0,
    incorrectCount: 0,
    unattemptedCount: test.questionsCount,
    timeTaken: 0,
    startedAt: new Date().toISOString()
  };

  const attempts = getLocalAttempts();
  attempts[attemptId] = attempt;
  saveLocalAttempts(attempts);

  return attempt;
}

export function getAttempt(attemptId: string): Attempt | null {
  const attempts = getLocalAttempts();
  return attempts[attemptId] || null;
}

export function getRecentAttempts(): Attempt[] {
  const attempts = getLocalAttempts();
  return Object.values(attempts)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function fetchRecentAttemptsFromSupabase(userId: string): Promise<Attempt[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((row: any) => ({
          id: row.id,
          testId: row.test_id,
          responses: row.responses,
          timeLeft: 0, // not needed for reports
          currentQuestionIndex: 0,
          completed: row.completed_at !== null,
          score: Number(row.score),
          accuracy: Number(row.accuracy),
          percentile: 85, // default simulation relative percentile
          correctCount: row.correct_count,
          incorrectCount: row.incorrect_count,
          unattempted_count: row.unattempted_count,
          timeTaken: row.time_taken,
          startedAt: row.completed_at || new Date().toISOString()
        } as unknown as Attempt));
      }
    } catch (err) {
      console.warn('Failed to load attempts from Supabase, using local:', err);
    }
  }
  return getRecentAttempts();
}

// ========================================================
// 4. LEADERBOARD RANKINGS
// ========================================================

export async function getLeaderboardForTest(testId: string): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Query the dynamic SQL view we created
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('test_id', testId)
        .order('rank', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const currentUser = getCurrentUser();
        return data.map((row: any) => ({
          rank: row.rank,
          name: row.name,
          score: Number(row.score),
          accuracy: Number(row.accuracy),
          timeTaken: formatDuration(row.time_taken),
          isCurrentUser: currentUser ? row.cadet_number === currentUser.rollNumber : false
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch Supabase leaderboard, using fallback:', err);
    }
  }

  // Fallback: No real leaderboard data is available yet, return empty list.
  return [];
}

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

// ========================================================
// 5. MOTIVATIONAL QUOTES
// ========================================================

const MOTIVATIONAL_QUOTES = [
  "Discipline is choosing between what you want now and what you want most.",
  "Every equation solved today brings you one step closer to IIT.",
  "Focus on the concepts, speed and accuracy will follow.",
  "JEE is not just an exam, it's a test of resilience, consistency, and passion.",
  "Success in JEE isn't about being the smartest; it's about being the most persistent.",
  "The doors of IIT open to those who dare to dream and refuse to yield.",
  "Sweat more in practice, score higher in the exam.",
  "Mistakes are proof that you are trying. Analyze them and keep going."
];

export function getMotivationalQuote(): string {
  if (typeof window === 'undefined') return MOTIVATIONAL_QUOTES[0];
  const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[idx];
}
