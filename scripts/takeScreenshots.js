const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const pages = [
  { name: '01_landing_hero.png', url: 'http://localhost:5173' },
  { name: '02_auth_portal.png', url: 'http://localhost:5173/login' },
  { name: '03_subject_selection.png', url: 'http://localhost:5173/select?demo=student' },
  { name: '04_student_dashboard.png', url: 'http://localhost:5173/dashboard?demo=student' },
  { name: '05_adaptive_practice.png', url: 'http://localhost:5173/practice?demo=student' },
  { name: '06_ai_tutor_chat.png', url: 'http://localhost:5173/ai-tutor?demo=student' },
  { name: '07_ai_learning_hub.png', url: 'http://localhost:5173/ai-hub?demo=teacher' },
  { name: '08_performance_analytics.png', url: 'http://localhost:5173/analytics?demo=student' },
  { name: '09_teacher_classroom_hub.png', url: 'http://localhost:5173/classroom?demo=teacher' },
  { name: '10_question_bank_manager.png', url: 'http://localhost:5173/questions?demo=teacher' },
  { name: '11_reference_library.png', url: 'http://localhost:5173/library?demo=student' }
];

async function capture() {
  for (const page of pages) {
    const dest = path.join(outDir, page.name);
    console.log(`Capturing ${page.name} from ${page.url}...`);

    await new Promise((resolve) => {
      const args = [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,820',
        '--virtual-time-budget=3000',
        `--screenshot=${dest}`,
        page.url
      ];
      execFile(chromePath, args, (err) => {
        if (err) {
          console.error(`Error capturing ${page.name}:`, err.message);
        } else {
          const exists = fs.existsSync(dest);
          const size = exists ? fs.statSync(dest).size : 0;
          console.log(`Saved: ${page.name} (${size} bytes)`);
        }
        resolve();
      });
    });
  }
}

capture().then(() => console.log('All screenshots captured successfully.'));
