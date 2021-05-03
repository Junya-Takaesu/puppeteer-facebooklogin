const puppeteer = require('puppeteer');
const fs = require('fs');

const config = require('./config.json');
const cookies = require('./cookies.json');

(async () => {
  console.log('Hello World');

  let browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowmo: 1000
  });
  const context = browser.defaultBrowserContext();
  context.overridePermissions("https://www.facebook.com", []);

  let page = await browser.newPage();
  await page.setDefaultNavigationTimeout(100000);
  await page.setViewport({width: 1200, height: 800});

  try {
    if (!Object.keys(cookies).length) {
      await page.goto("https://www.facebook.com/login", {waitUntil: "networkidle2"});
      await page.type("#email", config.username, {delay: 30});
      await page.type("#pass", config.password, {delay: 30});
      await page.click('#loginbutton', {delay: 30});
      await page.waitForNavigation({waitUntil: "networkidle0"});
      await page.waitForSelector('[aria-label="アカウント"]');
      let currentCookies = await page.cookies();
      fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies));
    } else {
      await page.setCookie(...cookies);
      await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2" });
    }

    browser.close();
  } catch (e) {
    browser.close();
  }
})();