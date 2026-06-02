import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // Simulate a mobile screen for the mobile-first design
    await page.setViewport({ width: 390, height: 844 }); 
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Path corresponding to the artifact directory
    const savePath = 'C:/Users/LENEVO/.gemini/antigravity/brain/99e0421f-cc12-4934-9933-84fff16491ce/magro_screenshot.png';
    await page.screenshot({ path: savePath, fullPage: true });
    await browser.close();
    console.log('Screenshot saved successfully to ' + savePath);
  } catch (err) {
    console.error('Screenshot error:', err);
  }
})();
