const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate demo tokens using server's jsonwebtoken
const jwt = require(path.join(__dirname, '..', 'server', 'node_modules', 'jsonwebtoken'));
const JWT_SECRET = 'super_secret_school_jwt_key_change_in_production_987654321';
const studentUser = {
  id: 'student_demo_01',
  name: 'Aarav Sharma',
  email: 'aarav@school.edu',
  role: 'student',
  gradeLevel: 7,
  themePreference: 'student-indigo',
  avatar: 'avatar-1'
};
const studentToken = jwt.sign(studentUser, JWT_SECRET, { expiresIn: '7d' });

const teacherUser = {
  id: 'teacher_demo_01',
  name: 'Dr. Priya Mehta',
  email: 'priya@school.edu',
  role: 'teacher',
  gradeLevel: 7,
  themePreference: 'teacher-navy',
  avatar: 'avatar-4'
};
const teacherToken = jwt.sign(teacherUser, JWT_SECRET, { expiresIn: '7d' });

const tempDir = path.join(__dirname, '..', 'temp_cdp_profile');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function run() {
  console.log('Launching Chrome with CDP on port 9222...');
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempDir}`,
    '--disable-gpu',
    '--window-size=1280,820',
    'http://localhost:5173'
  ]);

  // Give Chrome 2 seconds to bind port
  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const targetTab = tabs[0];
    if (!targetTab || !targetTab.webSocketDebuggerUrl) {
      throw new Error('No target tab found in Chrome CDP');
    }

    console.log('Connecting to WebSocket:', targetTab.webSocketDebuggerUrl);
    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);

    let messageId = 1;
    const pendingPromises = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pendingPromises.has(data.id)) {
        const { resolve } = pendingPromises.get(data.id);
        pendingPromises.delete(data.id);
        resolve(data);
      }
    };

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const sendCDP = (method, params = {}) => {
      return new Promise((resolve) => {
        const id = messageId++;
        pendingPromises.set(id, { resolve });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    // Enable Page domain
    await sendCDP('Page.enable');
    await sendCDP('Runtime.enable');

    // Screenshot helper
    const captureScreen = async (filename) => {
      const res = await sendCDP('Page.captureScreenshot', { format: 'png' });
      if (res && res.result && res.result.data) {
        const buffer = Buffer.from(res.result.data, 'base64');
        const dest = path.join(outDir, filename);
        fs.writeFileSync(dest, buffer);
        console.log(`Successfully saved ${filename} (${buffer.length} bytes)`);
      } else {
        console.warn(`Failed to capture ${filename}`);
      }
    };

    // 1. Landing Page
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('01_landing_hero.png');

    // 2. Auth / Login Screen
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/login' });
    await new Promise(r => setTimeout(r, 2000));
    await captureScreen('02_auth_portal.png');

    // Inject Student Auth Token
    const injectStudent = `
      localStorage.setItem('token', ${JSON.stringify(studentToken)});
      localStorage.setItem('user', ${JSON.stringify(JSON.stringify(studentUser))});
    `;
    await sendCDP('Runtime.evaluate', { expression: injectStudent });

    // 3. Subject & Diagnostic Selection
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/select' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('03_subject_selection.png');

    // 4. Student Dashboard
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/dashboard' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('04_student_dashboard.png');

    // 5. Adaptive Practice Mode
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/practice' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('05_adaptive_practice.png');

    // 6. AI Tutor 3.0 Chat
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/ai-tutor' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('06_ai_tutor_3_0_chat.png');

    // 7. AI Learning Hub
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/ai-hub' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('07_ai_learning_hub.png');

    // 8. Performance Analytics Hub
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/analytics' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('08_analytics_hub.png');

    // Inject Teacher Auth Token
    const injectTeacher = `
      localStorage.setItem('token', ${JSON.stringify(teacherToken)});
      localStorage.setItem('user', ${JSON.stringify(JSON.stringify(teacherUser))});
    `;
    await sendCDP('Runtime.evaluate', { expression: injectTeacher });

    // 9. Teacher Dashboard & Classroom Hub
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/classroom' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('09_teacher_classroom_hub.png');

    // 10. Question Bank Manager
    await sendCDP('Page.navigate', { url: 'http://localhost:5173/questions' });
    await new Promise(r => setTimeout(r, 2500));
    await captureScreen('10_question_bank_manager.png');

    ws.close();
  } catch (err) {
    console.error('CDP Capture Error:', err);
  } finally {
    chromeProcess.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
    console.log('Capture script finished.');
  }
}

run();
