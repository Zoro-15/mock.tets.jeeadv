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

// Helper to push tests
function addExemplarTests(chapters: string[], classVal: 'class11' | 'class12', subject: 'physics' | 'chemistry' | 'math') {
  chapters.forEach((ch, index) => {
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
      syllabus: [ch]
    });
  });
}

addExemplarTests(class11PhysicsChapters, 'class11', 'physics');
addExemplarTests(class11ChemistryChapters, 'class11', 'chemistry');
addExemplarTests(class11MathsChapters, 'class11', 'math');

addExemplarTests(class12PhysicsChapters, 'class12', 'physics');
addExemplarTests(class12ChemistryChapters, 'class12', 'chemistry');
addExemplarTests(class12MathsChapters, 'class12', 'math');
