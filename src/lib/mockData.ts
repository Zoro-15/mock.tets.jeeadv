import { Test, Question } from './types';
import { exemplarTests } from '../data/exemplar';
import { jeeMainTests } from '../data/jee-main';
import { jeeAdvancedTests } from '../data/jee-advanced';

// Combine all dynamic test lists
export const allTests: Test[] = [
  ...exemplarTests,
  ...jeeMainTests,
  ...jeeAdvancedTests
];

// Helper functions for Physics, Chemistry, and Math question templates
function getPhysicsQuestion(num: number, seed: number): Omit<Question, 'id'> {
  const coeff = (seed * num) % 9 + 2;
  const val = (seed + num) % 5 + 1;
  const templates = [
    {
      type: 'latex' as const,
      questionText: `A block of mass $m = ${coeff}\\text{ kg}$ is sliding down a frictionless inclined plane of angle $\\theta = 30^\\circ$. Find the acceleration of the block down the incline. (Take $g = 10\\text{ m/s}^2$)`,
      options: [
        `$5\\text{ m/s}^2$`,
        `$5\\sqrt{3}\\text{ m/s}^2$`,
        `$${coeff}\\text{ m/s}^2$`,
        `$10\\text{ m/s}^2$`
      ],
      correctOptionIndex: 0,
      explanation: `The component of gravitational force along the incline is $mg \\sin\\theta$. Thus, acceleration $a = g \\sin\\theta = 10 \\sin(30^\\circ) = 5\\text{ m/s}^2$.`
    },
    {
      type: 'latex' as const,
      questionText: `An electric dipole of dipole moment $p = ${coeff} \\times 10^{-6}\\text{ C}\\cdot\\text{m}$ is placed in a uniform electric field of magnitude $E = ${val} \\times 10^{4}\\text{ N/C}$. What is the maximum torque experienced by the dipole?`,
      options: [
        `$${coeff * val} \\times 10^{-2}\\text{ N}\\cdot\\text{m}$`,
        `$${Math.round(coeff * val / 2 * 100) / 100} \\times 10^{-2}\\text{ N}\\cdot\\text{m}$`,
        `$0\\text{ N}\\cdot\\text{m}$`,
        `$${coeff * val} \\times 10^{-6}\\text{ N}\\cdot\\text{m}$`
      ],
      correctOptionIndex: 0,
      explanation: `Torque $\\tau = pE \\sin\\theta$. The maximum torque occurs when $\\theta = 90^\\circ$, giving $\\tau_{\\max} = pE = (${coeff} \\times 10^{-6}) \\times (${val} \\times 10^4) = ${coeff * val} \\times 10^{-2}\\text{ N}\\cdot\\text{m}$.`
    },
    {
      type: 'latex' as const,
      questionText: `A capacitor of capacitance $C = ${coeff}\\mu\\text{F}$ is charged to a potential difference of $V = ${val * 10}\\text{ V}$. Find the electrostatic energy stored in the capacitor.`,
      options: [
        `$${0.5 * coeff * val * val * 100} \\times 10^{-6}\\text{ J}$`,
        `$${coeff * val * 10} \\times 10^{-6}\\text{ J}$`,
        `$${0.5 * coeff * val * 10} \\times 10^{-6}\\text{ J}$`,
        `$${coeff * val * val * 100} \\times 10^{-6}\\text{ J}$`
      ],
      correctOptionIndex: 0,
      explanation: `The energy stored is $U = \\frac{1}{2} C V^2 = \\frac{1}{2} \\times (${coeff} \\times 10^{-6}) \\times (${val * 10})^2 = ${0.5 * coeff * val * val * 100} \\times 10^{-6}\\text{ J}$.`
    },
    {
      type: 'latex' as const,
      questionText: `Find the de Broglie wavelength of an electron accelerated through a potential difference of $V = 100\\text{ V}$.`,
      options: [
        `$1.227\\text{ \\AA}$`,
        `$0.123\\text{ \\AA}$`,
        `$12.27\\text{ \\AA}$`,
        `$1.227\\text{ m}$`
      ],
      correctOptionIndex: 0,
      explanation: `For an electron, the de Broglie wavelength is given by $\\lambda = \\frac{12.27}{\\sqrt{V}}\\text{ \\AA}$. For $V = 100\\text{ V}$, $\\lambda = \\frac{12.27}{\\sqrt{100}} = 1.227\\text{ \\AA}$.`
    },
    {
      type: 'latex' as const,
      questionText: `A Carnot engine operates between temperatures $T_1 = 500\\text{ K}$ and $T_2 = 300\\text{ K}$. Find the efficiency of the engine.`,
      options: [
        `$40\\%$`,
        `$60\\%$`,
        `$50\\%$`,
        `$30\\%$`
      ],
      correctOptionIndex: 0,
      explanation: `Efficiency $\\eta = 1 - \\frac{T_2}{T_1} = 1 - \\frac{300}{500} = 1 - 0.6 = 0.4$ or $40\\%$.`
    }
  ];
  const tmpl = templates[num % templates.length];
  const correctIdx = (num + seed) % 4;
  const options = [...tmpl.options];
  const correctAns = options[0];
  options[0] = options[correctIdx];
  options[correctIdx] = correctAns;
  
  return {
    type: tmpl.type,
    questionText: tmpl.questionText,
    options,
    correctOptionIndex: correctIdx,
    explanation: tmpl.explanation
  };
}

function getChemistryQuestion(num: number, seed: number): Omit<Question, 'id'> {
  const coeff = (seed * num) % 9 + 2;
  const val = (seed + num) % 5 + 1;
  const templates = [
    {
      type: 'latex' as const,
      questionText: `What is the hybridization of the central atom in a $\\text{SF}_{6}$ molecule?`,
      options: [
        `$sp^3d^2$`,
        `$sp^3d$`,
        `$sp^3$`,
        `$dsp^2$`
      ],
      correctOptionIndex: 0,
      explanation: `In $\\text{SF}_6$, the central Sulfur atom has 6 valence electrons, all bonded to Fluorine atoms, forming 6 bond pairs and 0 lone pairs. Thus, the steric number is 6, which corresponds to $sp^3d^2$ hybridization.`
    },
    {
      type: 'text' as const,
      questionText: `Identify the major product in the acid-catalyzed hydration of propene.`,
      options: [
        `Propan-2-ol`,
        `Propan-1-ol`,
        `Propane`,
        `Propanone`
      ],
      correctOptionIndex: 0,
      explanation: `Acid-catalyzed hydration of propene follows Markovnikov's rule. The proton adds to the double bond to form the more stable secondary carbocation, which is then attacked by water to yield Propan-2-ol as the major product.`
    },
    {
      type: 'latex' as const,
      questionText: `A first-order reaction has a rate constant $k = ${coeff} \\times 10^{-3}\\text{ s}^{-1}$. Calculate the half-life ($t_{1/2}$) of the reaction.`,
      options: [
        `$${Math.round(0.693 / coeff * 1000 * 100) / 100}\\text{ s}$`,
        `$${Math.round(0.693 * coeff * 1000 * 100) / 100}\\text{ s}$`,
        `$${coeff}\\text{ s}$`,
        `$${Math.round(1 / coeff * 1000 * 100) / 100}\\text{ s}$`
      ],
      correctOptionIndex: 0,
      explanation: `For a first-order reaction, $t_{1/2} = \\frac{\\ln(2)}{k} = \\frac{0.693}{${coeff} \\times 10^{-3}} = ${Math.round(0.693 / coeff * 1000 * 100) / 100}\\text{ s}$.`
    },
    {
      type: 'text' as const,
      questionText: `Which of the following compounds is aromatic?`,
      options: [
        `Benzene`,
        `Cyclooctatetraene`,
        `Cyclopentadiene`,
        `Cyclobutadiene`
      ],
      correctOptionIndex: 0,
      explanation: `Benzene is planar, cyclic, fully conjugated, and has $6\\pi$ electrons ($4n+2$ where $n=1$), satisfying Huckel's rule for aromaticity.`
    },
    {
      type: 'latex' as const,
      questionText: `Calculate the magnetic moment (in Bohr Magnetons) of a $\\text{Fe}^{2+}$ ion ($Z = 26$).`,
      options: [
        `$4.90\\text{ BM}$`,
        `$3.87\\text{ BM}$`,
        `$5.92\\text{ BM}$`,
        `$2.83\\text{ BM}$`
      ],
      correctOptionIndex: 0,
      explanation: `$\\text{Fe}^{2+}$ has configuration $3d^6$, which contains 4 unpaired electrons. The spin-only magnetic moment is $\\mu = \\sqrt{n(n+2)} = \\sqrt{4(4+2)} = \\sqrt{24} \\approx 4.90\\text{ BM}$.`
    }
  ];
  const tmpl = templates[num % templates.length];
  const correctIdx = (num + seed) % 4;
  const options = [...tmpl.options];
  const correctAns = options[0];
  options[0] = options[correctIdx];
  options[correctIdx] = correctAns;
  
  return {
    type: tmpl.type,
    questionText: tmpl.questionText,
    options,
    correctOptionIndex: correctIdx,
    explanation: tmpl.explanation
  };
}

function getMathQuestion(num: number, seed: number): Omit<Question, 'id'> {
  const coeff = (seed * num) % 9 + 2;
  const val = (seed + num) % 5 + 1;
  const templates = [
    {
      type: 'latex' as const,
      questionText: `Find the value of the limit:\n\n$$\\lim_{x \\to 0} \\frac{\\sin(${coeff}x)}{x}$$`,
      options: [
        `$${coeff}$`,
        `$1$`,
        `$\\frac{1}{${coeff}}$`,
        `$0$`
      ],
      correctOptionIndex: 0,
      explanation: `Using the standard limit $\\lim_{y \\to 0} \\frac{\\sin(y)}{y} = 1$, we can multiply the numerator and denominator by ${coeff}: $\\lim_{x \\to 0} \\frac{${coeff} \\cdot \\sin(${coeff}x)}{${coeff}x} = ${coeff} \\cdot 1 = ${coeff}$.`
    },
    {
      type: 'latex' as const,
      questionText: `If a matrix $A$ is defined as:\n\n$$A = \\begin{pmatrix} ${coeff} & 3 \\\\ 1 & ${val} \\end{pmatrix}$$\n\nFind the determinant of the matrix $A$.`,
      options: [
        `$${coeff * val - 3}$`,
        `$${coeff * val + 3}$`,
        `$${coeff + val}$`,
        `$${coeff - val}$`
      ],
      correctOptionIndex: 0,
      explanation: `The determinant of $A$ is $\\det(A) = (${coeff} \\times ${val}) - (3 \\times 1) = ${coeff * val} - 3 = ${coeff * val - 3}$.`
    },
    {
      type: 'latex' as const,
      questionText: `Evaluate the integral:\n\n$$\\int_{0}^{\\pi/2} \\sin^2(x) \\, dx$$`,
      options: [
        `$\\frac{\\pi}{4}$`,
        `$\\frac{\\pi}{2}$`,
        `$\\pi$`,
        `$\\frac{\\pi}{8}$`
      ],
      correctOptionIndex: 0,
      explanation: `Let $I = \\int_{0}^{\\pi/2} \\sin^2(x) dx$. Using the property $\\int_{a}^{b} f(x) dx = \\int_{a}^{b} f(a+b-x) dx$, we get $I = \\int_{0}^{\\pi/2} \\cos^2(x) dx$. Adding both equations gives $2I = \\int_{0}^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.`
    },
    {
      type: 'latex' as const,
      questionText: `Find the general solution of the differential equation:\n\n$$\\frac{dy}{dx} + y = e^{-x}$$`,
      options: [
        `$y = (x + C)e^{-x}$`,
        `$y = xe^{-x} + C$`,
        `$y = e^{-x} + C$`,
        `$y = x^2e^{-x} + C$`
      ],
      correctOptionIndex: 0,
      explanation: `This is a linear differential equation of the form $\\frac{dy}{dx} + Py = Q$, where $P=1$ and $Q=e^{-x}$. Integrating factor is $I.F. = e^{\\int 1 dx} = e^x$. The solution is $y \\cdot e^x = \\int e^{-x} \\cdot e^x dx = \\int 1 dx = x + C \\implies y = (x + C)e^{-x}$.`
    },
    {
      type: 'latex' as const,
      questionText: `Find the projection of vector $\\vec{a} = 2\\hat{i} + 3\\hat{j} + 2\\hat{k}$ on vector $\\vec{b} = \\hat{i} + 2\\hat{j} + \\hat{k}$.`,
      options: [
        `$\\frac{10}{\\sqrt{6}}$`,
        `$\\frac{10}{6}$`,
        `$\\sqrt{6}$`,
        `$2\\sqrt{6}$`
      ],
      correctOptionIndex: 0,
      explanation: `The projection of $\\vec{a}$ on $\\vec{b}$ is $\\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|}$. $\\vec{a} \\cdot \\vec{b} = (2)(1) + (3)(2) + (2)(1) = 2 + 6 + 2 = 10$. The magnitude $|\\vec{b}| = \\sqrt{1^2 + 2^2 + 1^2} = \\sqrt{6}$. Hence, projection = $\\frac{10}{\\sqrt{6}}$.`
    }
  ];
  const tmpl = templates[num % templates.length];
  const correctIdx = (num + seed) % 4;
  const options = [...tmpl.options];
  const correctAns = options[0];
  options[0] = options[correctIdx];
  options[correctIdx] = correctAns;
  
  return {
    type: tmpl.type,
    questionText: tmpl.questionText,
    options,
    correctOptionIndex: correctIdx,
    explanation: tmpl.explanation
  };
}

export function generateQuestionsForTest(testId: string): Question[] {
  const test = allTests.find(t => t.id === testId);
  if (!test) return [];

  const list: Question[] = [];
  const testNumber = parseInt(testId.replace(/\D/g, '')) || 1;

  for (let i = 0; i < test.questionsCount; i++) {
    const num = i + 1;
    const qId = `${testId}-q-${num}`;
    
    let qDetails: Omit<Question, 'id'>;
    let section = 'Syllabus Core';

    // 1. If it's an NCERT exemplar chapter test, generate questions specifically for its subject
    if (test.category === 'exemplar') {
      const subject = test.subject || 'math';
      section = `${subject.toUpperCase()} - Chapter Questions`;
      if (subject === 'physics') {
        qDetails = getPhysicsQuestion(num, testNumber);
      } else if (subject === 'chemistry') {
        qDetails = getChemistryQuestion(num, testNumber);
      } else {
        qDetails = getMathQuestion(num, testNumber);
      }
    } else {
      // 2. If it's a full paper (JEE Main / JEE Advanced), split questions equally between Physics, Chemistry, and Math
      const totalQ = test.questionsCount;
      const secSize = Math.floor(totalQ / 3);
      
      if (num <= secSize) {
        section = 'Section A: Physics';
        qDetails = getPhysicsQuestion(num, testNumber);
      } else if (num <= secSize * 2) {
        section = 'Section B: Chemistry';
        qDetails = getChemistryQuestion(num - secSize, testNumber);
      } else {
        section = 'Section C: Mathematics';
        qDetails = getMathQuestion(num - secSize * 2, testNumber);
      }
    }

    list.push({
      id: qId,
      ...qDetails,
      questionNumber: num,
      section
    });
  }

  return list;
}
