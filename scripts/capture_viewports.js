const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function capture(url, width, height, filename) {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log(`Launching browser for ${width}x${height} to capture ${url}...`);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`Waiting 15 seconds for Cesium and Cyber HUD to load...`);
    await new Promise(resolve => setTimeout(resolve, 15000));

    const savePath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: savePath });
    console.log(`Saved screenshot to ${savePath}`);
  } catch (err) {
    console.error(`Failed to capture ${url} at ${width}x${height}:`, err);
  } finally {
    await browser.close();
  }
}

async function run() {
  const localUrl = 'http://localhost:3000/';
  const prodUrl = 'https://chronoearth.vercel.app/';

  // Localhost Viewports
  await capture(localUrl, 1366, 768, 'cyber_1366_local.png');
  await capture(localUrl, 1920, 1080, 'cyber_1920_local.png');

  // Production Viewports
  await capture(prodUrl, 1366, 768, 'cyber_1366_prod.png');
  await capture(prodUrl, 1920, 1080, 'cyber_1920_prod.png');

  console.log('Capture viewports completed.');
}

run();
