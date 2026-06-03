// Captures README screenshots of the running app with Playwright, then
// downscales them for web (retina capture -> WEB_WIDTH via sips on macOS).
// Usage: start the app (npm run dev or preview), then:
//   BASE_URL=http://localhost:5173 node scripts/capture-screenshots.mjs
// Output: <repo-root>/screenshots/*.png
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB_WIDTH = 1280; // downscale target for web; capture is 2x for crisp supersampling

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
const fixtureCsv = path.resolve(scriptDir, '../src/tests/fixtures/audit-sample.csv');
const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';

// Seed a few manual implementation ticks for Control 1 so the progress bars and
// card progress show real state in the captures.
const progressSeed = JSON.stringify({ '1-ml1-1': true, '1-ml1-2': true, '1-ml1-3': true });

const shots = [
  { name: '01-home', path: '/', fullPage: true, storage: { 'e8kb.progress': progressSeed, 'e8kb.targetMaturity': 'ml1' } },
  { name: '02-application-control-ml1', path: '/control/1/ml1', fullPage: true, storage: { 'e8kb.progress': progressSeed } },
  { name: '03-maturity-with-m365-additions', path: '/control/1/ml3', storage: { 'e8kb.licenseMode': 'e5' }, fullPage: true },
  { name: '04-m365-settings-nested', path: '/m365', storage: { 'e8kb.licenseMode': 'e3P1' }, fullPage: true },
  { name: '05-dark-mode', path: '/control/7/ml1', storage: { 'e8kb.theme': 'dark' }, fullPage: true },
  { name: '06-about', path: '/about', fullPage: true },
  { name: '07-search', path: '/', search: 'macro' },
  { name: '08-evidence', evidence: true, fullPage: true }
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

  if (shot.evidence) {
    // Upload the sample audit CSV on the home page, then navigate within the SPA
    // (a full page load would correctly clear the in-memory evidence) so the
    // capture shows the "Evidence provided" / "Audit: non-compliant" badges.
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
    await page.locator('input[type="file"]').setInputFiles(fixtureCsv);
    await page.getByText(/Matched \d+ of \d+ E8 checks/).waitFor();
    await page.getByRole('link', { name: 'Mitigation 5 Restrict Administrative Privileges', exact: true }).click();
    await page.getByRole('tab', { name: 'ML2' }).click();
    await page.waitForSelector('.status-badge.evidenced');
  } else {
    await page.goto(`${baseURL}${shot.path}`, { waitUntil: 'networkidle' });
    if (shot.search) {
      await page.getByRole('searchbox').fill(shot.search);
      await page.waitForSelector('.search-results');
    }
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
