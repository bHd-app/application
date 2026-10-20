import puppeteer from 'puppeteer-core';

const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:3000';
const OUT = process.env.OUT ?? '/tmp/wardrobe';

// progress fractions of the whole page scroll to capture
const shots = process.argv.slice(2).map(Number);
const fractions = shots.length
  ? shots
  : [0.0, 0.21, 0.25, 0.29, 0.5, 0.75, 1.0];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle0' });

const maxScroll = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight,
);

for (const f of fractions) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(maxScroll * f));
  // let the spring settle
  await new Promise((r) => setTimeout(r, 900));
  const name = `${OUT}-${f.toFixed(3)}.png`;
  await page.screenshot({ path: name });
  console.log('shot', name);
}

await browser.close();
