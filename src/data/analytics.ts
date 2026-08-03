export interface ChapterStat {
  chapter: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  accuracy: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
}

export interface SubjectStat {
  subject: string;
  accuracy: number;
  attempted: number;
  correct: number;
}

export interface AttemptLog {
  testTitle: string;
  date: string;
  score: number;
  maxMarks: number;
  accuracy: number;
}

export interface TimeStat {
  subject: string;
  correctAvgTime: number; // in seconds
  incorrectAvgTime: number;
}

export interface BookmarkItem {
  id: string;
  testTitle: string;
  questionNumber: number;
  questionText: string;
}

export const overallStats = {
  accuracy: 68.5,
  testsTaken: 24,
  timeSpentSeconds: 43200, // 12 Hours
  questionsAttempted: 840,
  correctQuestions: 575
};

export const subjectStats: SubjectStat[] = [
  { subject: 'Physics', accuracy: 72, attempted: 280, correct: 202 },
  { subject: 'Chemistry', accuracy: 65, attempted: 270, correct: 176 },
  { subject: 'Mathematics', accuracy: 69, attempted: 290, correct: 200 }
];

export const chapterStats: ChapterStat[] = [
  { chapter: 'Electrostatics', subject: 'Physics', accuracy: 82, totalQuestions: 40, correct: 33, incorrect: 7 },
  { chapter: 'Rotational Motion', subject: 'Physics', accuracy: 48, totalQuestions: 35, correct: 17, incorrect: 18 },
  { chapter: 'Thermodynamics', subject: 'Physics', accuracy: 75, totalQuestions: 30, correct: 23, incorrect: 7 },
  { chapter: 'Chemical Bonding', subject: 'Chemistry', accuracy: 85, totalQuestions: 50, correct: 43, incorrect: 7 },
  { chapter: 'Chemical Kinetics', subject: 'Chemistry', accuracy: 52, totalQuestions: 25, correct: 13, incorrect: 12 },
  { chapter: 'Equilibrium', subject: 'Chemistry', accuracy: 44, totalQuestions: 30, correct: 13, incorrect: 17 },
  { chapter: 'Matrices & Determinants', subject: 'Mathematics', accuracy: 90, totalQuestions: 45, correct: 41, incorrect: 4 },
  { chapter: 'Definite Integrals', subject: 'Mathematics', accuracy: 70, totalQuestions: 40, correct: 28, incorrect: 12 },
  { chapter: 'Probability', subject: 'Mathematics', accuracy: 55, totalQuestions: 35, correct: 19, incorrect: 16 },
  { chapter: 'Quadratic Equations', subject: 'Mathematics', accuracy: 80, totalQuestions: 30, correct: 24, incorrect: 6 }
];

export const timeStats: TimeStat[] = [
  { subject: 'Physics', correctAvgTime: 92, incorrectAvgTime: 145 },
  { subject: 'Chemistry', correctAvgTime: 58, incorrectAvgTime: 85 },
  { subject: 'Mathematics', correctAvgTime: 132, incorrectAvgTime: 198 }
];

export const attemptHistory: AttemptLog[] = [
  { testTitle: 'JEE Main 2025 January Session (22 Jan - Shift 1)', date: '2026-07-28', score: 215, maxMarks: 300, accuracy: 76.5 },
  { testTitle: 'JEE Advanced 2025 Paper 1', date: '2026-07-25', score: 108, maxMarks: 180, accuracy: 65.2 },
  { testTitle: 'NCERT Exemplar MATH Ch 3: Trigonometric Functions', date: '2026-07-20', score: 52, maxMarks: 60, accuracy: 90 },
  { testTitle: 'NCERT Exemplar PHY Ch 6: Rotational Motion', date: '2026-07-18', score: 28, maxMarks: 60, accuracy: 50 }
];

export const bookmarkedQuestions: BookmarkItem[] = [
  {
    id: 'bm-1',
    testTitle: 'JEE Main 2025 January Session (22 Jan - Shift 1)',
    questionNumber: 14,
    questionText: 'If $\\int \\frac{dx}{x^2 + 2x + 2} = f(x) + C$, then find the range of the function $f(x)$ for positive real inputs.'
  },
  {
    id: 'bm-2',
    testTitle: 'JEE Advanced 2025 Paper 1',
    questionNumber: 8,
    questionText: 'A block of mass $m$ is attached to a spring of stiffness $k$. If the system is placed in a lift moving upwards with an acceleration $a$, find the time period of oscillation.'
  }
];
