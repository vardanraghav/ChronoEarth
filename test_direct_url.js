const puppeteer = require('puppeteer');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 960 });

    console.log('Navigating directly to http://localhost:3000/?city=Tokyo ...');
    await page.goto('http://localhost:3000/?city=Tokyo', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Check if CityPreviewCard is rendered in DOM
    const cardExists = await page.evaluate(() => {
      const hasText = document.body.textContent.includes('Opening Intelligence Page in');
      const hasCancel = document.body.textContent.includes('CANCEL');
      return { hasText, hasCancel };
    });
    console.log('Direct URL: Is Preview Card in DOM?', cardExists);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
