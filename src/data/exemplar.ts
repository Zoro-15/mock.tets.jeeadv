import { Test } from '../lib/types';

const class11PhysicsChapters = [
  "Units and Measurements",
  "Motion in a Straight Line",
  "Motion in a Plane",
  "Laws of Motion",
  "Work, Energy and Power",
  "System of Particles and Rotational Motion",
  "Gravitation",
  "Mechanical Properties of Solids",
  "Mechanical Properties of Fluids",
  "Thermal Properties of Matter",
  "Thermodynamics",
  "Kinetic Theory",
  "Oscillations",
  "Waves"
];

const class11ChemistryChapters = [
  "Some Basic Concepts of Chemistry",
  "Structure of Atom",
  "Classification of Elements and Periodicity",
  "Chemical Bonding and Molecular Structure",
  "Thermodynamics",
  "Equilibrium",
  "Redox Reactions",
  "The p-Block Elements",
  "Organic Chemistry"
];

const class11MathsChapters = [
  "Sets",
  "Relations and Functions",
  "Trigonometric Functions",
  "Principle of Mathematical Induction",
  "Complex Numbers and Quadratic Equations",
  "Linear Inequalities",
  "Permutations and Combinations",
  "Binomial Theorem",
  "Sequence and Series",
  "Straight Lines",
  "Conic Sections",
  "Introduction to Three-Dimensional Geometry",
  "Limits and Derivatives",
  "Statistics",
  "Probability"
];

const class12PhysicsChapters = [
  "Electric Charges and Fields",
  "Electrostatic Potential and Capacitance",
  "Current Electricity",
  "Moving Charges and Magnetism",
  "Magnetism and Matter",
  "Electromagnetic Induction",
  "Alternating Current",
  "Electromagnetic Waves",
  "Ray Optics and Optical Instruments",
  "Wave Optics",
  "Dual Nature of Radiation and Matter",
  "Atoms",
  "Nuclei",
  "Semiconductor Electronics",
  "Communication Systems"
];

const class12ChemistryChapters = [
  "Solutions",
  "Electrochemistry",
  "Chemical Kinetics",
  "The p-Block Elements",
  "The d- and f-Block Elements",
  "Coordination Compounds",
  "Haloalkanes and Haloarenes",
  "Alcohols, Phenols and Ethers",
  "Aldehydes, Ketones and Carboxylic Acids",
  "Amines",
  "Biomolecules"
];

const class12MathsChapters = [
  "Relations and Functions",
  "Inverse Trigonometric Functions",
  "Matrices",
  "Determinants",
  "Continuity and Differentiability",
  "Application of Derivatives",
  "Integrals",
  "Application of Integrals",
  "Differential Equations",
  "Vector Algebra",
  "Three-Dimensional Geometry",
  "Probability"
];

export const exemplarTests: Test[] = [];

function getDbTestName(ch: string, classVal: 'class11' | 'class12', subject: 'physics' | 'chemistry' | 'math'): string {
  if (subject === 'math' && classVal === 'class12' && ch === 'Probability') return 'Probability (1)';
  if (subject === 'math' && classVal === 'class12' && ch === 'Relations and Functions') return 'Relations and Functions (1)';
  if (subject === 'chemistry' && classVal === 'class12' && ch === 'The p-Block Elements') return 'The p-block Elements';
  if (subject === 'chemistry' && classVal === 'class11' && ch === 'The p-Block Elements') return 'The p -block Elements';
  if (subject === 'chemistry' && classVal === 'class11' && ch === 'Thermodynamics') return 'Thermodynamics (1)';
  
  const map: Record<string, string> = {
    // Class 12 Maths
    "Three-Dimensional Geometry": "Three Dimensional Geometry",
    
    // Class 12 Chemistry
    "The d- and f-Block Elements": "The d-and f-Block Elements",
    "Alcohols, Phenols and Ethers": "Alcohols_ Phenols and Ethers",
    "Aldehydes, Ketones and Carboxylic Acids": "Aldehydes_ Ketones and Carboxylic Acids",

    // Class 12 Physics
    "Electric Charges and Fields": "Electric Charges And Fields",
    "Electrostatic Potential and Capacitance": "Electrostatic Potential And Capacitance",
    "Moving Charges and Magnetism": "Moving Charges And Magnetism",
    "Magnetism and Matter": "Magnetism And Matter",
    "Ray Optics and Optical Instruments": "Ray Optics And Optical Instruments",
    "Dual Nature of Radiation and Matter": "Dual Nature Of Radiation And Matter",

    // Class 11 Maths
    "Introduction to Three-Dimensional Geometry": "Introduction to Three Dimensional Geometry",

    // Class 11 Chemistry
    "Structure of Atom": "Structure of  Atom",
    "Classification of Elements and Periodicity": "Classification of Elements and Periodicity in Properties",

    // Class 11 Physics
    "Motion in a Straight Line": "Motion In a Straight Line",
    "Motion in a Plane": "Motion In a Plane",
    "Work, Energy and Power": "Work_ Energy and Power"
  };

  return map[ch] || ch;
}

// Helper to push tests
function addExemplarTests(chapters: string[], classVal: 'class11' | 'class12', subject: 'physics' | 'chemistry' | 'math') {
  chapters.forEach((ch, index) => {
    const dbName = getDbTestName(ch, classVal, subject);
    exemplarTests.push({
      id: `exemplar-${classVal}-${subject}-${index + 1}`,
      title: `${subject.toUpperCase()} Ch ${index + 1}: ${ch}`,
      category: 'exemplar',
      subCategory: classVal,
      subject,
      questionsCount: 10,
      duration: 20,
      marks: 40,
      negativeMarking: 1,
      syllabus: [ch],
      sourceFileName: dbName
    });
  });
}

addExemplarTests(class11PhysicsChapters, 'class11', 'physics');
addExemplarTests(class11ChemistryChapters, 'class11', 'chemistry');
addExemplarTests(class11MathsChapters, 'class11', 'math');

addExemplarTests(class12PhysicsChapters, 'class12', 'physics');
addExemplarTests(class12ChemistryChapters, 'class12', 'chemistry');
addExemplarTests(class12MathsChapters, 'class12', 'math');
