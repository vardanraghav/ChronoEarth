const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log(`Created screenshots directory at ${screenshotsDir}`);
  }

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseUrl = 'https://chronoearth.vercel.app';

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // 1. Cyber 2050 Mode (Home Page defaults to Cyber)
    console.log(`Navigating to ${baseUrl} (Cyber Mode by default)...`);
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Waiting 15 seconds for Cesium Globe and Cyber HUD to load in production...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    const cyberPath = path.join(screenshotsDir, 'cyber_mode.png');
    await page.screenshot({ path: cyberPath });
    console.log(`Saved Cyber Mode screenshot to ${cyberPath}`);

    // 2. Realistic Mode (Home Page)
    console.log('Looking for REALISTIC mode button to toggle...');
    const buttons = await page.$$('button');
    let realisticButton = null;
    for (let button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('REALISTIC')) {
        realisticButton = button;
        break;
      }
    }

    if (realisticButton) {
      console.log('Clicking REALISTIC mode button...');
      await realisticButton.click();
      console.log('Waiting 6 seconds for transition to realistic mode...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const homePath = path.join(screenshotsDir, 'home.png');
      await page.screenshot({ path: homePath });
      console.log(`Saved Realistic Home Mode screenshot to ${homePath}`);
    } else {
      console.log('REALISTIC button not found, taking home screenshot in current view...');
      const homePath = path.join(screenshotsDir, 'home.png');
      await page.screenshot({ path: homePath });
    }

    // 3. City Intelligence Page (Tokyo)
    const cityUrl = `${baseUrl}/city/tokyo`;
    console.log(`Navigating to ${cityUrl}...`);
    await page.goto(cityUrl, { waitUntil: 'networkidle2', timeout: 50000 });
    console.log('Waiting 6 seconds for City details load...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    const cityPath = path.join(screenshotsDir, 'city_page.png');
    await page.screenshot({ path: cityPath });
    console.log(`Saved City Intelligence screenshot to ${cityPath}`);

    // 4. Predictions Page
    const predUrl = `${baseUrl}/predictions`;
    console.log(`Navigating to ${predUrl}...`);
    await page.goto(predUrl, { waitUntil: 'networkidle2', timeout: 40000 });
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const predPath = path.join(screenshotsDir, 'predictions_page.png');
    await page.screenshot({ path: predPath });
    console.log(`Saved Predictions screenshot to ${predPath}`);

    // 5. Feedback Page
    const feedbackUrl = `${baseUrl}/feedback`;
    console.log(`Navigating to ${feedbackUrl}...`);
    await page.goto(feedbackUrl, { waitUntil: 'networkidle2', timeout: 40000 });
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const feedbackPath = path.join(screenshotsDir, 'feedback_page.png');
    await page.screenshot({ path: feedbackPath });
    console.log(`Saved Feedback screenshot to ${feedbackPath}`);

  } catch (err) {
    console.error('Error occurred during capturing production screenshots:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
