import { Test } from '../lib/types';

export const jeeMainTests: Test[] = [];

interface YearConfig {
  year: number;
  sessions: {
    name: string;
    papersCount: number;
    dates: string[];
  }[];
}

const yearConfigs: YearConfig[] = [
  {
    year: 2026,
    sessions: [
      { name: "January Session", papersCount: 10, dates: ["22 January", "23 January", "24 January", "25 January", "26 January"] }
    ]
  },
  {
    year: 2025,
    sessions: [
      { name: "January Session", papersCount: 9, dates: ["22 January", "23 January", "24 January", "25 January", "26 January"] },
      { name: "April Session", papersCount: 10, dates: ["2 April", "3 April", "4 April", "5 April", "6 April"] }
    ]
  },
  {
    year: 2024,
    sessions: [
      { name: "January Session", papersCount: 10, dates: ["24 January", "27 January", "29 January", "30 January", "31 January"] },
      { name: "April Session", papersCount: 10, dates: ["4 April", "5 April", "6 April", "8 April", "9 April"] }
    ]
  },
  {
    year: 2023,
    sessions: [
      { name: "January Session", papersCount: 12, dates: ["24 January", "25 January", "29 January", "30 January", "31 January", "1 February"] },
      { name: "April Session", papersCount: 12, dates: ["6 April", "8 April", "10 April", "11 April", "12 April", "13 April"] }
    ]
  },
  {
    year: 2022,
    sessions: [
      { name: "June Session", papersCount: 10, dates: ["23 June", "24 June", "25 June", "26 June", "27 June"] },
      { name: "July Session", papersCount: 9, dates: ["25 July", "26 July", "27 July", "28 July", "29 July"] }
    ]
  },
  {
    year: 2021,
    sessions: [
      { name: "February Session", papersCount: 6, dates: ["23 February", "24 February", "25 February"] },
      { name: "March Session", papersCount: 6, dates: ["16 March", "17 March", "18 March"] },
      { name: "July Session", papersCount: 3, dates: ["20 July", "22 July", "25 July"] }
    ]
  },
  {
    year: 2020,
    sessions: [
      { name: "January Session", papersCount: 6, dates: ["7 January", "8 January", "9 January"] },
      { name: "September Session", papersCount: 5, dates: ["2 September", "3 September", "4 September", "5 September", "6 September"] }
    ]
  },
  {
    year: 2019,
    sessions: [
      { name: "January Session", papersCount: 8, dates: ["9 January", "10 January", "11 January", "12 January"] },
      { name: "April Session", papersCount: 8, dates: ["8 April", "9 April", "10 April", "12 April"] }
    ]
  }
];

// Generate exactly 134 papers
yearConfigs.forEach((cfg) => {
  cfg.sessions.forEach((sess) => {
    for (let i = 0; i < sess.papersCount; i++) {
      const dateVal = sess.dates[Math.floor(i / 2) % sess.dates.length];
      const shiftVal = i % 2 === 0 ? "Shift 1" : "Shift 2";
      
      const id = `jee-main-${cfg.year}-${sess.name.split(' ')[0].toLowerCase()}-p${i + 1}`;
      jeeMainTests.push({
        id,
        title: `JEE Main ${cfg.year} ${sess.name} (${dateVal} - ${shiftVal})`,
        category: 'jee_main',
        subCategory: 'both',
        questionsCount: 75,
        duration: 180,
        marks: 300,
        negativeMarking: 1,
        syllabus: ['Physics (Complete Syllabus)', 'Chemistry (Complete Syllabus)', 'Mathematics (Complete Syllabus)'],
        year: cfg.year,
        session: sess.name
      });
    }
  });
});
