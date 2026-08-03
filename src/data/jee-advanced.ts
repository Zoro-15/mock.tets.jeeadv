import { Test } from '../lib/types';

export const jeeAdvancedTests: Test[] = [];

for (let year = 2025; year >= 2021; year--) {
  jeeAdvancedTests.push({
    id: `jee-advanced-${year}-paper-1`,
    title: `JEE Advanced ${year} Paper 1`,
    category: 'jee_advanced',
    subCategory: 'paper1',
    questionsCount: 54,
    duration: 180,
    marks: 180,
    negativeMarking: 1,
    syllabus: ['Physics (Advanced Syllabus)', 'Chemistry (Advanced Syllabus)', 'Mathematics (Advanced Syllabus)'],
    year
  });

  jeeAdvancedTests.push({
    id: `jee-advanced-${year}-paper-2`,
    title: `JEE Advanced ${year} Paper 2`,
    category: 'jee_advanced',
    subCategory: 'paper2',
    questionsCount: 54,
    duration: 180,
    marks: 180,
    negativeMarking: 1,
    syllabus: ['Physics (Advanced Syllabus)', 'Chemistry (Advanced Syllabus)', 'Mathematics (Advanced Syllabus)'],
    year
  });
}
