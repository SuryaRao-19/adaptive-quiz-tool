const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const projectRoot = path.join(__dirname, '..');
const reportHtmlPath = path.join(projectRoot, 'PROJECT REPORT FOLDER', '02_PRINTABLE_REPORT_AND_PDF.html');

const screenshotsBaseDir = path.join(projectRoot, 'PROJECT REPORT FOLDER', 'screenshots');
const uiDir = path.join(screenshotsBaseDir, 'ui');
const codeDir = path.join(screenshotsBaseDir, 'code');

const targetFolders = [
  path.join(projectRoot, 'PROJECT REPORT FOLDER'),
  path.join(projectRoot, 'PROJECR REPORT FOLDER')
];

async function generate() {
  console.log('Reading base HTML report...');
  let html = fs.readFileSync(reportHtmlPath, 'utf8');

  // Insert Code Snippet Visual Cards into Section 4.0 if not already present
  if (!html.includes('01_bkt_mastery_engine.png')) {
    console.log('Injecting Code Snippet image figures into Chapter 4...');

    // 4.1 BKT Snippet
    html = html.replace(
      '<!-- ALGORITHM 2 -->',
      `    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/01_bkt_mastery_engine.png" alt="BKT Engine Source Snippet">
      <div class="img-caption"><strong>Figure 4.1:</strong> Production implementation of Bayesian Knowledge Tracing updating $P(L_t \\mid obs)$ and $P(L_{t+1})$.</div>
    </div>\n\n    <!-- ALGORITHM 2 -->`
    );

    // 4.2 Rasch Snippet
    html = html.replace(
      '<!-- ALGORITHM 3 -->',
      `    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/02_rasch_1pl_calibration.png" alt="Rasch IRT Calibration Snippet">
      <div class="img-caption"><strong>Figure 4.2:</strong> 1PL Rasch Log-odds Difficulty Calibration ($b_i$) with extreme-score continuity smoothing.</div>
    </div>\n\n    <!-- ALGORITHM 3 -->`
    );

    // 4.3 Leitner Snippet
    html = html.replace(
      '<!-- ALGORITHM 4 -->',
      `    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/04_leitner_spaced_repetition.png" alt="Leitner Spaced Repetition Snippet">
      <div class="img-caption"><strong>Figure 4.3:</strong> Leitner 5-Box Spaced Repetition Memory Scheduling with Fibonacci day intervals.</div>
    </div>\n\n    <!-- ALGORITHM 4 -->`
    );

    // 4.4 Adaptive Stepping Snippet
    html = html.replace(
      '<!-- ALGORITHM 5 -->',
      `    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/03_unified_adaptive_stepping.png" alt="Adaptive Stepping Snippet">
      <div class="img-caption"><strong>Figure 4.4:</strong> Multi-Factor Unified Adaptive Stepping Logic (3-streak promotion, 2-streak demotion).</div>
    </div>\n\n    <!-- ALGORITHM 5 -->`
    );

    // 4.5 Hake Gain Snippet
    html = html.replace(
      '<!-- ALGORITHM 6 -->',
      `    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/10_hake_normalized_gain.png" alt="Normalized Gain Snippet">
      <div class="img-caption"><strong>Figure 4.5:</strong> Hake's Normalized Learning Gain ($g$) Engine with division-by-zero boundary protection.</div>
    </div>\n\n    <!-- ALGORITHM 6 -->`
    );

    // Circuit Breaker & SSE Streaming figures in Chapter 5
    const archFigures = `
    <!-- Additional Production Architecture Code Snippets -->
    <h3>5.3 Architectural Code Snippets: SSE Streaming & Circuit Breaker</h3>
    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/05_sse_streaming_gateway.png" alt="SSE Streaming Gateway Snippet">
      <div class="img-caption"><strong>Figure 5.1:</strong> Server-Sent Events (SSE) Streaming Lifecycle with Granular Sub-Timeouts and Heartbeats.</div>
    </div>

    <div class="img-box" style="margin: 12px 0;">
      <img src="screenshots/code/06_circuit_breaker_health.png" alt="Circuit Breaker Health Snippet">
      <div class="img-caption"><strong>Figure 5.2:</strong> 3-State AI Provider Circuit Breaker (Closed, Open, Half-Open) with Cooldown Timer.</div>
    </div>
    `;

    html = html.replace('<!-- CHAPTER 6: LIVE IMPLEMENTATION & UI SHOWCASE -->', archFigures + '\n\n    <!-- CHAPTER 6: LIVE IMPLEMENTATION & UI SHOWCASE -->');
  }

  // Convert all referenced images (UI + Code) to Base64 Data URIs
  console.log('Embedding all images as Base64 Data URIs...');
  const anyImgRegex = /src=["']([^"']+\.png)["']/g;

  html = html.replace(anyImgRegex, (match, srcPath) => {
    // If already data uri, skip
    if (srcPath.startsWith('data:')) return match;

    const baseName = path.basename(srcPath);

    // Look in codeDir, uiDir, screenshotsBaseDir, and docs/screenshots
    const candidatePaths = [
      path.join(codeDir, baseName),
      path.join(uiDir, baseName),
      path.join(screenshotsBaseDir, baseName),
      path.join(projectRoot, 'docs', 'screenshots', baseName)
    ];

    let resolvedPath = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        resolvedPath = p;
        break;
      }
    }

    if (resolvedPath) {
      const data = fs.readFileSync(resolvedPath);
      const b64 = data.toString('base64');
      console.log(`  Embedded: ${baseName} (${Math.round(data.length / 1024)} KB)`);
      return `src="data:image/png;base64,${b64}"`;
    } else {
      console.warn(`  Warning: Image not found on disk: ${srcPath} (${baseName})`);
      return match;
    }
  });

  // Save the self-contained HTML to both report folders
  for (const folder of targetFolders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    const destHtml = path.join(folder, '02_PRINTABLE_REPORT_AND_PDF.html');
    fs.writeFileSync(destHtml, html, 'utf8');
    console.log(`Updated HTML saved to: ${destHtml} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
  }

  // Generate PDF from the self-contained HTML using Chrome
  const sourceHtml = path.join(targetFolders[0], '02_PRINTABLE_REPORT_AND_PDF.html');
  const primaryPdf = path.join(targetFolders[0], 'AdaptIQ_Complete_Project_Report.pdf');

  console.log(`Generating Master PDF via Headless Chrome: ${primaryPdf}...`);
  const chromeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-software-rasterizer',
    '--no-pdf-header-footer',
    `--print-to-pdf=${primaryPdf}`,
    sourceHtml
  ];

  await new Promise((resolve, reject) => {
    execFile(chromePath, chromeArgs, { timeout: 90000 }, (error, stdout, stderr) => {
      if (error) {
        console.error('Chrome execution error:', error);
        return reject(error);
      }
      resolve();
    });
  });

  if (fs.existsSync(primaryPdf)) {
    const pdfStats = fs.statSync(primaryPdf);
    console.log(`SUCCESS! Generated primary PDF: ${primaryPdf}`);
    console.log(`File Size: ${(pdfStats.size / (1024 * 1024)).toFixed(2)} MB (${pdfStats.size} bytes)`);

    // Copy to PROJECR REPORT FOLDER and synchronize all files
    const secondaryPdf = path.join(targetFolders[1], 'AdaptIQ_Complete_Project_Report.pdf');
    fs.copyFileSync(primaryPdf, secondaryPdf);
    console.log(`Copied PDF to: ${secondaryPdf}`);

    const allFiles = fs.readdirSync(targetFolders[0]);
    for (const file of allFiles) {
      if (file === 'screenshots') continue;
      const src = path.join(targetFolders[0], file);
      const dst = path.join(targetFolders[1], file);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dst);
      }
    }
    console.log(`Synchronized all files to ${targetFolders[1]}`);
  } else {
    throw new Error('PDF file was not created by Chrome.');
  }
}

generate().catch(err => {
  console.error('Fatal error during PDF generation:', err);
  process.exit(1);
});
