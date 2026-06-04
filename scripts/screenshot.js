const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('Navigating to local site http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('Waiting 12 seconds for globe loading and tiles to load...');
    await new Promise(resolve => setTimeout(resolve, 12000));

    // Capture Realistic Mode screenshot
    const realisticPath = path.join(__dirname, 'realistic_mode_actual.png');
    console.log(`Saving Realistic Mode screenshot to: ${realisticPath}`);
    await page.screenshot({ path: realisticPath });

    // Click Cyber 2050 button
    console.log('Looking for Cyber 2050 mode toggle button...');
    const buttons = await page.$$('button');
    let cyberButton = null;
    for (let button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('CYBER 2050')) {
        cyberButton = button;
        break;
      }
    }

    if (cyberButton) {
      console.log('Clicking Cyber 2050 mode toggle...');
      await cyberButton.click();
      console.log('Waiting 6 seconds for transition and flight choreography...');
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Capture Cyber 2050 Mode screenshot
      const cyberPath = path.join(__dirname, 'cyber_mode_actual.png');
      console.log(`Saving Cyber 2050 Mode screenshot to: ${cyberPath}`);
      await page.screenshot({ path: cyberPath });
    } else {
      console.error('Could not find CYBER 2050 toggle button on screen.');
    }

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
