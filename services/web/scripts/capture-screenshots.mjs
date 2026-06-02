// Captures README screenshots of the running app with Playwright, then
// downscales them for web (retina capture -> 1440px wide via sips on macOS).
// Usage: start the app (npm run dev or preview), then:
//   BASE_URL=http://localhost:5173 node scripts/capture-screenshots.mjs
// Output: <repo-root>/screenshots/*.png
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB_WIDTH = 1440; // downscale target; capture is 2x for crisp supersampling

function optimiseForWeb(file) {
  if (process.platform !== 'darwin') return; // sips is macOS-only; skip elsewhere
  try {
    execFileSync('sips', ['--resampleWidth', String(WEB_WIDTH), file], { stdio: 'ignore' });
  } catch {
    // sips unavailable - leave the full-resolution capture in place
  }
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const outDir = path.join(repoRoot, 'screenshots');
const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';

const shots = [
  { name: '01-home', path: '/', fullPage: true },
  { name: '02-application-control-ml1', path: '/control/1/ml1', fullPage: true },
  { name: '03-maturity-with-m365-additions', path: '/control/1/ml3', storage: { 'e8kb.licenseMode': 'e5' }, fullPage: true },
  { name: '04-m365-settings-nested', path: '/m365', storage: { 'e8kb.licenseMode': 'e3P1' }, fullPage: true },
  { name: '05-dark-mode', path: '/control/7/ml1', storage: { 'e8kb.theme': 'dark' }, fullPage: true },
  { name: '06-about', path: '/about', fullPage: true },
  { name: '07-search', path: '/', search: 'macro' }
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  if (shot.storage) {
    await context.addInitScript((data) => {
      for (const [key, value] of Object.entries(data)) window.localStorage.setItem(key, value);
    }, shot.storage);
  }

  const page = await context.newPage();
  await page.goto(`${baseURL}${shot.path}`, { waitUntil: 'networkidle' });

  if (shot.search) {
    await page.getByRole('searchbox').fill(shot.search);
    await page.waitForSelector('.search-results');
  }

  await page.waitForTimeout(400);
  const file = path.join(outDir, `${shot.name}.png`);
  await page.screenshot({ path: file, fullPage: Boolean(shot.fullPage) });
  optimiseForWeb(file);
  console.log(`captured ${shot.name}.png`);
  await context.close();
}

await browser.close();
console.log(`Saved ${shots.length} screenshots to ${outDir}`);
