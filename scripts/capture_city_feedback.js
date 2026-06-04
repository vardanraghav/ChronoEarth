const puppeteer = require('puppeteer');
const path = require('path');

const routes = [
  { path: '/city/tokyo', file: 'audit_city_tokyo.png', wait: 5000 },
  { path: '/city/delhi', file: 'audit_city_delhi.png', wait: 5000 },
  { path: '/feedback', file: 'audit_feedback_new.png', wait: 5000 }
];

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const artifactsDir = 'C:\\Users\\varda\\.gemini\\antigravity\\brain\\21b67ebf-1377-4a78-b46f-43250a0d482d';

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 725 });

    for (const r of routes) {
      const url = `http://localhost:3000${r.path}`;
      console.log(`Navigating to ${url}...`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log(`Waiting ${r.wait}ms for animations...`);
        await new Promise(resolve => setTimeout(resolve, r.wait));
        
        const savePath = path.join(artifactsDir, r.file);
        await page.screenshot({ path: savePath });
        console.log(`Saved screenshot to ${savePath}`);
      } catch (err) {
        console.error(`Failed to capture route ${r.path}:`, err);
      }
    }

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
