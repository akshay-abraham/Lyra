// Copyright (C) 2025 Akshay K Rooben abraham
import { allSubjects, type SubjectName } from './subjects-data'

const loadingTexts: Record<SubjectName, string[]> = {
  // Grade 1-5
  English: [
    'Consulting the thesaurus...',
    'Diagramming the sentence structure...',
    'Finding the perfect metaphor...',
    'Scanning epic poems...',
    'Asking Shakespeare for advice...',
    'Brewing a cup of tea for literary inspiration...',
  ],
  Malayalam: [
    'Exploring beautiful Malayalam poetry...',
    "Finding the right 'paryayam'...",
    'Consulting with Ezhuthachan...',
  ],
  Hindi: [
    'Revisiting classic Hindi literature...',
    'Practicing varnamala...',
    'Looking up meanings in Shabdkosh...',
  ],
  EVS: [
    'Exploring the ecosystem...',
    'Learning about our community helpers...',
    'Understanding the water cycle...',
  ],
  'Social Science': [
    'Dusting off ancient scrolls...',
    'Consulting with Herodotus...',
    'Navigating the annals of time...',
    'Checking the historical records...',
  ],
  Maths: [
    'Calculating the hypotenuse...',
    'Solving for x...',
    'Dividing by zero... just kidding!',
    'Consulting with Pythagoras...',
    'Finding the area under the curve...',
    'Running the numbers...',
  ],
  GK: [
    'Scanning world atlases...',
    'Checking the latest world records...',
    'Updating my knowledge base on current affairs...',
  ],
  // Grade 6-8
  Science: [
    'Analyzing the molecular structure...',
    'Calibrating the Bunsen burner...',
    'Sequencing the DNA...',
    'Polishing the microscope lens...',
    "Consulting Newton's laws...",
    'Mixing the chemicals (safely!)...',
  ],
  AI: [
    'Training a neural network...',
    'Processing large datasets...',
    'Understanding machine learning models...',
    'Compiling the source code...',
    'Resolving merge conflicts...',
    'Searching Stack Overflow...',
  ],
  // Grade 9-10
  German: [
    'Practicing verb conjugations...',
    'Consulting the Duden dictionary...',
    'Building long compound words...',
  ],
  Physics: [
    'Calculating projectile motion...',
    'Exploring quantum mechanics...',
    "Applying Einstein's theories...",
  ],
  Chemistry: [
    'Balancing chemical equations...',
    'Understanding atomic bonds...',
    'Checking the periodic table...',
  ],
  Biology: [
    'Observing cellular processes...',
    'Studying the Krebs cycle...',
    'Classifying new species...',
  ],
  History: [
    'Revisiting ancient civilizations...',
    'Analyzing primary source documents...',
    'Understanding the causes of world wars...',
  ],
  'Democratic Politics': [
    'Reviewing constitutional articles...',
    'Understanding electoral systems...',
    'Analyzing political ideologies...',
  ],
  Geography: [
    'Plotting tectonic plate movements...',
    'Studying climate patterns...',
    'Exploring different biomes...',
  ],
  Economics: [
    'Analyzing supply and demand curves...',
    'Calculating GDP growth...',
    'Understanding market structures...',
  ],
  // Grade 11-12
  'Maths Core': [
    'Integrating complex functions...',
    'Solving differential equations...',
    'Working with matrices...',
  ],
  'Applied Maths': [
    'Applying statistical models...',
    'Optimizing linear programming problems...',
    'Creating financial models...',
  ],
  'Computer Science': [
    'Designing complex algorithms...',
    'Optimizing data structures...',
    'Working with operating system kernels...',
  ],
  'Informatics Practices': [
    'Querying SQL databases...',
    'Developing web applications...',
    'Analyzing data with Pandas...',
  ],
  'Political Science': [
    'Analyzing international relations...',
    'Comparing political systems...',
    'Debating political theory...',
  ],
  'Law Studies': [
    'Interpreting legal precedents...',
    'Drafting a legal argument...',
    'Citing constitutional law...',
  ],
  'Business Studies': [
    'Developing a marketing strategy...',
    'Analyzing financial statements...',
    'Understanding organizational behavior...',
  ],
  Accountancy: [
    'Balancing the ledger...',
    'Auditing financial records...',
    'Applying GAAP principles...',
  ],
  // Other
  Other: [
    'Opening textbooks...',
    'Consulting with the great thinkers...',
    'Finding where Napoleon left his keys...',
    'Brewing some fresh ideas...',
    'Untangling a knot of knowledge...',
    'Shuffling the library cards...',
  ],
}

// Function to get a random loading text for a given subject
export function getLoadingText(subject: string | null): string {
  const validSubject =
    subject && allSubjects.find((s) => s.name === subject)
      ? (subject as SubjectName)
      : 'Other'
  const texts = loadingTexts[validSubject]
  return texts[Math.floor(Math.random() * texts.length)]
}
