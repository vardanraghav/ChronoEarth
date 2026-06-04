const puppeteer = require('puppeteer');
const path = require('path');

const routes = [
  { path: '/', file: 'audit_telemetry_new.png', wait: 12000 }, // Wait longer for Cesium to init
  { path: '/feed', file: 'audit_feed_new.png', wait: 4000 },
  { path: '/predictions', file: 'audit_predictions_new.png', wait: 4000 },
  { path: '/predictions/ai-decides-regional-agriculture', file: 'audit_prediction_detail_new.png', wait: 4000 },
  { path: '/knowledge', file: 'audit_kb_new.png', wait: 4000 },
  { path: '/futurologists', file: 'audit_futurologists_new.png', wait: 4000 },
  { path: '/futurologists/evelyn-wright', file: 'audit_futurologist_detail_new.png', wait: 4000 },
  { path: '/about', file: 'audit_about_new.png', wait: 4000 }
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
    await page.setViewport({ width: 1280, height: 720 });

    for (const r of routes) {
      const url = `http://localhost:3000${r.path}`;
      console.log(`Navigating to ${url}...`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log(`Waiting ${r.wait}ms...`);
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
