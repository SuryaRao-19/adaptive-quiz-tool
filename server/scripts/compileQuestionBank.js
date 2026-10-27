const fs = require('fs');
const path = require('path');

const seedDataDir = path.join(__dirname, 'seedData');

// 5 Math topics
const mathFiles = [
  'math_fractions.json',
  'math_decimals_percentages.json',
  'math_ratios_proportions.json',
  'math_basic_algebra.json',
  'math_geometry.json'
];

// 5 Science topics
const scienceFiles = [
  'science_cells.json',
  'science_forces_motion.json',
  'science_matter_reactions.json',
  'science_ecosystems.json',
  'science_energy.json'
];

let allMathQuestions = [];
let allScienceQuestions = [];

console.log('--- Validating Math Topics ---');
for (const file of mathFiles) {
  const filePath = path.join(seedDataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Checking ${file}: ${data.length} questions`);
  
  if (data.length !== 15) {
    throw new Error(`File ${file} has ${data.length} questions; expected 15.`);
  }

  const easy = data.filter(q => q.difficulty === 'easy').length;
  const medium = data.filter(q => q.difficulty === 'medium').length;
  const hard = data.filter(q => q.difficulty === 'hard').length;
  console.log(`  -> Easy: ${easy} (exp 5), Med: ${medium} (exp 6), Hard: ${hard} (exp 4)`);

  if (easy !== 5 || medium !== 6 || hard !== 4) {
    throw new Error(`Difficulty mismatch in ${file}: easy=${easy}, med=${medium}, hard=${hard}`);
  }

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (!q.questionText || !q.options || q.options.length !== 4) {
      throw new Error(`Question ${i} in ${file} has invalid options or text`);
    }
    if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
      throw new Error(`Question ${i} in ${file} has invalid correctAnswerIndex: ${q.correctAnswerIndex}`);
    }
    if (!q.explanation || !q.steps || q.steps.length < 2) {
      throw new Error(`Question ${i} in ${file} has missing explanation or steps`);
    }
    q.source = 'seed';
    q.status = 'approved';
    q.isActive = true;
  }

  allMathQuestions.push(...data);
}

console.log('--- Validating Science Topics ---');
for (const file of scienceFiles) {
  const filePath = path.join(seedDataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Checking ${file}: ${data.length} questions`);
  
  if (data.length !== 15) {
    throw new Error(`File ${file} has ${data.length} questions; expected 15.`);
  }

  const easy = data.filter(q => q.difficulty === 'easy').length;
  const medium = data.filter(q => q.difficulty === 'medium').length;
  const hard = data.filter(q => q.difficulty === 'hard').length;
  console.log(`  -> Easy: ${easy} (exp 5), Med: ${medium} (exp 6), Hard: ${hard} (exp 4)`);

  if (easy !== 5 || medium !== 6 || hard !== 4) {
    throw new Error(`Difficulty mismatch in ${file}: easy=${easy}, med=${medium}, hard=${hard}`);
  }

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (!q.questionText || !q.options || q.options.length !== 4) {
      throw new Error(`Question ${i} in ${file} has invalid options or text`);
    }
    if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
      throw new Error(`Question ${i} in ${file} has invalid correctAnswerIndex: ${q.correctAnswerIndex}`);
    }
    if (!q.explanation || !q.steps || q.steps.length < 2) {
      throw new Error(`Question ${i} in ${file} has missing explanation or steps`);
    }
    q.source = 'seed';
    q.status = 'approved';
    q.isActive = true;
  }

  allScienceQuestions.push(...data);
}

console.log(`\nTotal Math Questions: ${allMathQuestions.length}`);
console.log(`Total Science Questions: ${allScienceQuestions.length}`);
console.log(`Total Bank Size: ${allMathQuestions.length + allScienceQuestions.length}`);

// Write combined JSON files
fs.writeFileSync(
  path.join(seedDataDir, 'mathQuestions.json'),
  JSON.stringify(allMathQuestions, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(seedDataDir, 'scienceQuestions.json'),
  JSON.stringify(allScienceQuestions, null, 2),
  'utf8'
);

console.log('Successfully written mathQuestions.json and scienceQuestions.json!');
