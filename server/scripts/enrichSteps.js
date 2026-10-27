const fs = require('fs');
const path = require('path');

const seedDataDir = path.join(__dirname, 'seedData');
const files = fs.readdirSync(seedDataDir).filter(f => f.endsWith('.json') && f !== 'mathQuestions.json' && f !== 'scienceQuestions.json');

for (const file of files) {
  const filePath = path.join(seedDataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updated = false;

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (!q.steps) q.steps = [];

    // If only 1 step, expand to 3 steps
    if (q.steps.length === 1) {
      const step1 = q.steps[0];
      q.steps = [
        {
          step: step1.step || "Step 1: Understand the Core Concept",
          desc: step1.desc || "Identify the given conditions and key scientific/mathematical principles.",
          math: step1.math || "Analyze given information"
        },
        {
          step: "Step 2: Apply the Principle",
          desc: q.explanation.split('.')[0] + ".",
          math: "Application of principle"
        },
        {
          step: "Step 3: Conclude and Verify",
          desc: q.conceptSummary || "Verify the solution against known boundary conditions and definitions.",
          math: "Correct Option: " + q.options[q.correctAnswerIndex]
        }
      ];
      updated = true;
    } else if (q.steps.length === 2) {
      // Expand from 2 to 3 steps
      q.steps.push({
        step: "Step 3: Conclude and Verify",
        desc: q.conceptSummary || "Confirm that the final answer is consistent with standard definitions.",
        math: "Result = " + q.options[q.correctAnswerIndex]
      });
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Enriched steps in ${file}`);
  }
}
