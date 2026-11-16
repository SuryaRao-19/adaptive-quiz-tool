const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const testHtml = path.join(__dirname, 'test.html');
const testPdf = path.join(__dirname, 'test.pdf');

fs.writeFileSync(testHtml, '<html><body><h1>Test AdaptIQ PDF</h1></body></html>');

const args = [
  '--headless=new',
  '--disable-gpu',
  `--print-to-pdf=${testPdf}`,
  testHtml
];

execFile(chromePath, args, (err) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('PDF Generated successfully! Exists:', fs.existsSync(testPdf), 'Size:', fs.existsSync(testPdf) ? fs.statSync(testPdf).size : 0);
  }
  try {
    fs.unlinkSync(testHtml);
    fs.unlinkSync(testPdf);
  } catch(e){}
});

