import { Question, QuestionResponse } from './types';

export interface TopicInsight {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeSpent: number; // in seconds
  accuracy: number; // percentage
}

export interface PacingCategory {
  count: number;
  totalTime: number;
  avgTime: number;
  questionNumbers: number[];
}

export interface PacingAnalytics {
  idealPace: PacingCategory;     // Correct <= 90s
  slowAndSteady: PacingCategory; // Correct > 90s
  rushedGuess: PacingCategory;   // Incorrect < 20s
  timeTrap: PacingCategory;      // Incorrect > 120s
  moderateWrong: PacingCategory; // Incorrect 20s - 120s
  wastedTimeSeconds: number;     // Time spent on incorrect questions
}

export interface NdaQualificationStatus {
  sectionalCutoffPercentage: number;
  isSectionalQualified: boolean;
  marksObtained: number;
  totalMarks: number;
  sectionalRequiredMarks: number;
  estimatedCutoffMarks: number;
  percentageScore: number;
  verdict: 'Qualified' | 'Borderline' | 'Needs Improvement';
  verdictMessage: string;
}

// Highly granular keyword matcher for chapter-wise NDA syllabus
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Matrices & Determinants': ['matrix', 'matrices', 'determinant', 'adjoint', 'inverse matrix', 'singular', 'eigen'],
  'Sets, Relations & Functions': ['set', 'relation', 'function', 'subset', 'domain', 'range', 'injective', 'surjective', 'bijective', 'equivalence'],
  'Complex Numbers': ['complex number', 'iota', 'argand', 'modulus', 'argument', 'conjugate', 'euler'],
  'Quadratic Equations': ['quadratic', 'roots', 'discriminant', 'polynomial equation'],
  'Sequence & Series': ['progression', 'arithmetic', 'geometric', 'harmonic', 'series', 'sequence', 'a.p.', 'g.p.', 'h.p.', 'sum to n terms'],
  'Permutations & Combinations': ['permutation', 'combination', 'arrange', 'factorial', 'ways to choose', 'selection'],
  'Binomial Theorem': ['binomial', 'expansion', 'coefficient', 'general term', 'middle term'],
  'Logarithms': ['logarithm', 'log_', '\\log', 'ln '],
  'Trigonometry': ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'cosec', 'triangle', 'radian', 'heights and distances', 'inverse trigonometric'],
  'Differential Calculus': ['derivative', 'differentiation', 'limit', 'continuous', 'continuity', 'differentiable', 'dy/dx', 'maxima', 'minima', 'tangent', 'normal'],
  'Integral Calculus': ['integral', 'integrate', 'integration', 'area under', 'differential equation', '\\int'],
  '2D & 3D Geometry': ['coordinate', 'parabola', 'ellipse', 'hyperbola', 'straight line', 'circle', 'plane', 'direction ratio', 'direction cosine', 'sphere'],
  'Vector Algebra': ['vector', 'magnitude', 'dot product', 'cross product', 'scalar triple', 'coplanar', 'collinear vector'],
  'Statistics & Probability': ['mean', 'median', 'mode', 'variance', 'standard deviation', 'probability', 'dice', 'coin', 'playing card', 'mutually exclusive', 'bayes', 'binomial distribution'],
  'English Language': ['synonym', 'antonym', 'idiom', 'phrase', 'grammar', 'spot the error', 'sentence improvement', 'comprehension', 'preposition', 'vocabulary'],
  'Physics & Chemistry': ['force', 'velocity', 'acceleration', 'light', 'sound', 'electricity', 'current', 'magnet', 'resistance', 'atom', 'molecule', 'acid', 'base', 'chemical reaction', 'optics', 'thermodynamics'],
  'General Studies': ['history', 'geography', 'polity', 'constitution', 'monsoon', 'river', 'climate', 'economy', 'current affairs', 'parliament', 'treaty', 'article', 'fundamental rights', 'cell', 'disease']
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pre-build word-boundary regexes
const TOPIC_REGEXES: Record<string, RegExp[]> = {};
for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
  TOPIC_REGEXES[topic] = keywords.map(kw => {
    const trimmed = kw.trim();
    if (/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
      return new RegExp(`\\b${escapeRegExp(trimmed)}\\b`, 'i');
    }
    return new RegExp(escapeRegExp(trimmed), 'i');
  });
}

export function generateSubjectAnalytics(
  questions: Question[],
  responses: Record<string, QuestionResponse>
): TopicInsight[] {
  const insights: Record<string, TopicInsight> = {};

  // Initialize insights
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    insights[topic] = { topic, total: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0, accuracy: 0 };
  });
  insights['Other / Mixed'] = { topic: 'Other / Mixed', total: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpent: 0, accuracy: 0 };

  for (const q of questions) {
    const textToSearch = `${q.questionText} ${q.comprehension || ''} ${q.assertionText || ''} ${q.reasonText || ''}`.toLowerCase();
    let assignedTopic = 'Other / Mixed';

    // Section context check
    const isEnglishSection = q.section?.toLowerCase().includes('english');
    const isGKSection = q.section?.toLowerCase().includes('gk') || q.section?.toLowerCase().includes('general knowledge');

    if (isEnglishSection) {
      assignedTopic = 'English Language';
    } else if (isGKSection) {
      // Prioritize Physics & Chemistry or General Studies
      const isScience = TOPIC_REGEXES['Physics & Chemistry'].some(re => re.test(textToSearch));
      assignedTopic = isScience ? 'Physics & Chemistry' : 'General Studies';
    } else {
      // Math or general matching with word-boundary regex
      for (const [topic, regexList] of Object.entries(TOPIC_REGEXES)) {
        if (regexList.some(re => re.test(textToSearch))) {
          assignedTopic = topic;
          break;
        }
      }
    }

    const resp = responses[q.id];
    const stat = insights[assignedTopic];
    stat.total += 1;
    
    if (resp) {
      stat.timeSpent += resp.timeSpent || 0;
      if (resp.selectedOptionIndex === null) {
        stat.unattempted += 1;
      } else if (resp.selectedOptionIndex === q.correctOptionIndex) {
        stat.correct += 1;
      } else {
        stat.incorrect += 1;
      }
    } else {
      stat.unattempted += 1;
    }
  }

  // Filter out empty topics and calculate accuracy
  const result = Object.values(insights).filter(t => t.total > 0);
  
  result.forEach(t => {
    const attempted = t.correct + t.incorrect;
    t.accuracy = attempted > 0 ? Math.round((t.correct / attempted) * 100) : 0;
  });

  return result.sort((a, b) => b.total - a.total);
}

export function generatePacingAnalytics(
  questions: Question[],
  responses: Record<string, QuestionResponse>
): PacingAnalytics {
  const result: PacingAnalytics = {
    idealPace: { count: 0, totalTime: 0, avgTime: 0, questionNumbers: [] },
    slowAndSteady: { count: 0, totalTime: 0, avgTime: 0, questionNumbers: [] },
    rushedGuess: { count: 0, totalTime: 0, avgTime: 0, questionNumbers: [] },
    timeTrap: { count: 0, totalTime: 0, avgTime: 0, questionNumbers: [] },
    moderateWrong: { count: 0, totalTime: 0, avgTime: 0, questionNumbers: [] },
    wastedTimeSeconds: 0,
  };

  questions.forEach((q, idx) => {
    const resp = responses[q.id];
    if (!resp || resp.selectedOptionIndex === null) return;

    const time = resp.timeSpent || 0;
    const isCorrect = resp.selectedOptionIndex === q.correctOptionIndex;
    const qNum = idx + 1;

    if (isCorrect) {
      if (time <= 90) {
        result.idealPace.count++;
        result.idealPace.totalTime += time;
        result.idealPace.questionNumbers.push(qNum);
      } else {
        result.slowAndSteady.count++;
        result.slowAndSteady.totalTime += time;
        result.slowAndSteady.questionNumbers.push(qNum);
      }
    } else {
      result.wastedTimeSeconds += time;
      if (time < 20) {
        result.rushedGuess.count++;
        result.rushedGuess.totalTime += time;
        result.rushedGuess.questionNumbers.push(qNum);
      } else if (time > 120) {
        result.timeTrap.count++;
        result.timeTrap.totalTime += time;
        result.timeTrap.questionNumbers.push(qNum);
      } else {
        result.moderateWrong.count++;
        result.moderateWrong.totalTime += time;
        result.moderateWrong.questionNumbers.push(qNum);
      }
    }
  });

  // Calculate averages
  const calcAvg = (cat: PacingCategory) => {
    cat.avgTime = cat.count > 0 ? Math.round(cat.totalTime / cat.count) : 0;
  };
  calcAvg(result.idealPace);
  calcAvg(result.slowAndSteady);
  calcAvg(result.rushedGuess);
  calcAvg(result.timeTrap);
  calcAvg(result.moderateWrong);

  return result;
}

export function calculateNdaQualification(score: number, totalMarks: number): NdaQualificationStatus {
  const sectionalCutoffMarks = Math.round(totalMarks * 0.25);
  const estimatedCutoffMarks = Math.round(totalMarks * 0.38); // ~38% expected aggregate cutoff
  const isSectionalQualified = score >= sectionalCutoffMarks;
  const percentageScore = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 10) / 10 : 0;

  let verdict: 'Qualified' | 'Borderline' | 'Needs Improvement' = 'Needs Improvement';
  let verdictMessage = `Score is below the mandatory 25% (${sectionalCutoffMarks}/${totalMarks}) qualifying threshold. Focus on high-scoring core chapters to clear the baseline.`;

  if (score >= estimatedCutoffMarks) {
    verdict = 'Qualified';
    verdictMessage = `Outstanding performance! You cleared both the mandatory 25% sectional threshold (${sectionalCutoffMarks} marks) and the estimated aggregate NDA merit cutoff (~${estimatedCutoffMarks} marks).`;
  } else if (score >= sectionalCutoffMarks) {
    verdict = 'Borderline';
    verdictMessage = `Cleared the 25% sectional qualifying cutoff (${sectionalCutoffMarks} marks). Push higher to comfortably clear the expected merit list aggregate cutoff (~${estimatedCutoffMarks} marks).`;
  }

  return {
    sectionalCutoffPercentage: 25,
    isSectionalQualified,
    marksObtained: score,
    totalMarks,
    sectionalRequiredMarks: sectionalCutoffMarks,
    estimatedCutoffMarks,
    percentageScore,
    verdict,
    verdictMessage,
  };
}
