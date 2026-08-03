export interface Question {
  id: string;
  type: 'text' | 'latex' | 'table' | 'assertion-reason' | 'single' | 'multiple' | 'integer' | 'numeric' | 'passage';
  questionText: string;
  comprehension?: string; // Used for passage/comprehension questions
  assertionText?: string; // Used for assertion-reason questions
  reasonText?: string;    // Used for assertion-reason questions
  tableData?: string[][]; // Header row + data rows for tables
  options: string[];      // 4 choices
  correctOptionIndex: number;
  correctOptionIndices?: number[]; // For multiple correct MCQs
  correctTextResponse?: string;    // For integer/numeric questions
  explanation: string;
  questionNumber?: number; // Original question number from DB
  section?: string;        // E.g., 'Section A: English', 'Section B: GK'
}

export type TestCategory = 'exemplar' | 'jee_main' | 'jee_advanced';
export type TestSubCategory = 'class11' | 'class12' | 'physics' | 'chemistry' | 'math' | 'paper1' | 'paper2' | 'both';

export interface Test {
  id: string;
  title: string;
  category: TestCategory;
  subCategory: TestSubCategory;
  questionsCount: number;
  duration: number; // in minutes
  marks: number;
  negativeMarking: number; // raw value to subtract
  syllabus?: string[];
  sourceFileName?: string;
  subject?: 'physics' | 'chemistry' | 'math'; // Additional field for NCERT exemplar grouping
  year?: number;
  session?: string;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIndex: number | null; // null if unattempted (stores first choice for multiple MCQ fallback)
  selectedOptionIndices?: number[];    // for multiple correct MCQs
  textResponse?: string;              // for integer/numeric questions
  timeSpent: number;                  // time spent in seconds
  status: 'unseen' | 'unattempted' | 'attempted' | 'marked' | 'marked-attempted';
}

export interface Attempt {
  id: string;
  testId: string;
  responses: Record<string, QuestionResponse>; // key: questionId
  timeLeft: number;                            // in seconds
  currentQuestionIndex: number;
  completed: boolean;
  score: number;
  accuracy: number;       // in percentage
  percentile: number;     // calculated placeholder
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeTaken: number;      // in seconds
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  timeTaken: string;
  isCurrentUser?: boolean;
}

export interface User {
  id: string;
  name: string;
  rollNumber: string;
  studentCode: string;
}

