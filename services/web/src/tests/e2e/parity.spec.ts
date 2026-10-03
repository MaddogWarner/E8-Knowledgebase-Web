import { expect, test } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
const fixture = path.resolve('src/tests/fixtures/ios-backup-v2.json');
const auditCsv = path.resolve('src/tests/fixtures/audit-sample.csv');
async function about(page: import('@playwright/test').Page) { await page.getByRole('link', { name: 'About & Privacy' }).click(); }

test('deep audit note, cancellation, N/A fallback and history are accessible and persistent', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByLabel('Deep Audit Mode')).not.toBeChecked();
  await page.getByLabel('Deep Audit Mode').check();
  await page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true }).click();
  const step = page.locator('[id="1-ml1-1"]');
  const implemented = step.getByRole('radio', { name: 'Implemented', exact: true });
  await implemented.click();
  const dialog = page.getByRole('dialog', { name: 'Add Audit Note' });
  await expect(dialog.getByLabel('Optional audit note')).toBeFocused();
  await dialog.getByLabel('Optional audit note').fill('Change verified on the workstation fleet');
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(implemented).toBeFocused();
  await step.getByText('History (1)').click();
  await expect(step.getByText('Not implemented → Implemented')).toBeVisible();
  await expect(step.getByText('Change verified on the workstation fleet')).toBeVisible();
  await step.getByRole('radio', { name: 'Not implemented', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(implemented).toHaveAttribute('aria-checked', 'true');
  await step.getByRole('radio', { name: 'N/A', exact: true }).click();
  const na = page.getByRole('dialog', { name: 'N/A reason' });
  await na.getByLabel('N/A reason').fill('Retired environment');
  await na.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(step.getByText('History (2)')).toBeVisible();
  await expect(step.locator('.audit-history').getByText('Retired environment')).toBeVisible();
  await page.reload();
  await expect(step.getByText('History (2)')).toBeVisible();
});

test('technique chips open a modal and follow links to control and level without losing evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Upload CSV').setInputFiles(auditCsv);
  await page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true }).click();
  const trigger = page.locator('[id="1-ml1-3"]').getByRole('button', { name: 'T1059.001 PowerShell', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'T1059.001 PowerShell' });
  await expect(dialog.getByRole('heading', { name: 'Detect', exact: true })).toBeVisible();
  await dialog.getByRole('link', { name: 'Enable PowerShell logging', exact: true }).click();
  await expect(page).toHaveURL(/\/control\/4\/ml2#4-ml2-1/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('[id="4-ml2-1"] .status-badge.failed')).toBeVisible();
});

test('ATT&CK coverage reacts to target maturity and is legible in both themes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Threat Coverage MITRE ATT&CK® Coverage' }).click();
  await expect(page.getByRole('heading', { name: 'MITRE ATT&CK® Coverage' })).toBeVisible();
  const before = await page.locator('.coverage-tile.notCovered strong').innerText();
  await page.getByRole('link', { name: 'Essential 8 Knowledge Base', exact: true }).click();
  await page.getByLabel('Target maturity').selectOption('ml3');
  await page.getByRole('link', { name: 'MITRE ATT&CK® Coverage', exact: true }).click();
  expect(Number(await page.locator('.coverage-tile.notCovered strong').innerText())).toBeGreaterThan(Number(before));
  await expect(page.getByText('Measured against your target of ML3, Both scope.')).toBeVisible();
  await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.locator('.coverage-row').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.coverage-row').first()).toBeFocused();
  await page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true }).click();
  await page.getByRole('link', { name: /Threat Coverage · .* ATT&CK techniques mapped/ }).click();
  await expect(page).toHaveURL(/\/attack\?control=1/);
  await expect(page.getByRole('heading', { name: 'Application Control — ATT&CK' })).toBeVisible();
});

test('downloads an iOS-compatible backup and restores progress after reset', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();
  await about(page);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export this profile', exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/^e8kb-backup-\d{4}-\d\d-\d\d\.json$/);
  const file = await download.path();
  const text = await fs.readFile(file!, 'utf8');
  expect(JSON.parse(text).profiles[0].stepProgress['1-1-0'].state).toBe('Implemented');
  expect(text).not.toMatch(/\.\d{3}Z/);
  await page.getByRole('button', { name: 'Delete all app data', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm reset', exact: true }).click();
  await page.getByLabel('Import backup').setInputFiles(file!);
  await expect(page.getByText('Backup imported.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true }).click();
  await expect(page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true })).toHaveAttribute('aria-checked', 'true');
});

test('full restore cancel leaves profiles, audit settings and evidence intact; confirmed restore clears evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Upload CSV').setInputFiles(auditCsv);
  await about(page);
  const original = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
  const data = JSON.parse(await fs.readFile(fixture, 'utf8'));
  data.globalSettings = { deepAuditEnabled: true };
  const file = { name: 'restore.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) };
  await page.getByLabel('Import backup').setInputFiles(file);
  const dialog = page.getByRole('dialog', { name: 'Replace everything?' });
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))))).toBe(original);
  await page.getByRole('link', { name: 'Essential 8 Knowledge Base', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeEnabled();
  await about(page);
  await page.getByLabel('Import backup').setInputFiles(file);
  await dialog.getByRole('button', { name: 'Replace everything', exact: true }).click();
  await expect(page.getByLabel('Deep Audit Mode')).toBeChecked();
  await page.getByRole('link', { name: 'Essential 8 Knowledge Base', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
});

test('import as new also clears uploaded evidence', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Upload CSV').setInputFiles(auditCsv);
  await about(page);
  await page.getByLabel('Import backup').setInputFiles(fixture);
  await page.getByRole('link', { name: 'Essential 8 Knowledge Base', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled();
});

test('production assets support backup, audit and ATT&CK under the nginx CSP', async ({ page }) => {
  const nginx = await fs.readFile(path.resolve('../../nginx/nginx.conf'), 'utf8');
  const csp = nginx.match(/add_header Content-Security-Policy "([^"]+)"/)![1];
  const violations: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') violations.push(message.text()); });
  page.on('pageerror', (error) => violations.push(error.message));
  const requests: string[] = [];
  const dist = path.resolve('dist');
  await page.route('https://e8kb.test/**', async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    const file = url.pathname.startsWith('/assets/') ? url.pathname.slice(1) : 'index.html';
    await route.fulfill({ status: 200, body: await fs.readFile(path.join(dist, file)), headers: { 'Content-Security-Policy': csp, 'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html' } });
  });
  await page.goto('https://e8kb.test/about');
  await page.getByLabel('Deep Audit Mode').check();
  await page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true }).click();
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Optional audit note').fill('CSP verified');
  await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click();
  await about(page);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export this profile', exact: true }).click();
  const download = await downloadEvent;
  await page.getByLabel('Import backup').setInputFiles((await download.path())!);
  await expect(page.getByText('Backup imported.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'MITRE ATT&CK® Coverage', exact: true }).click();
  for (const theme of ['light', 'dark']) {
    await expect(page.locator('.coverage-row').first()).toBeVisible();
    const contrasts = await page.locator('.attack-chip, .coverage-badge, .coverage-tile').evaluateAll((elements) => {
      function rgb(colour: string): number[] {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = colour;
        ctx.fillRect(0, 0, 1, 1);
        return Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3);
      }
      function luminance(colour: string): number {
        const channels = rgb(colour).map((x) => { const v = x / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      }
      return elements.map((element) => {
        let parent: Element | null = element;
        let background = 'transparent';
        while (parent && (background === 'transparent' || background === 'rgba(0, 0, 0, 0)')) { background = getComputedStyle(parent).backgroundColor; parent = parent.parentElement; }
        const a = luminance(getComputedStyle(element).color);
        const b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      });
    });
    expect(Math.min(...contrasts)).toBeGreaterThanOrEqual(4.5);
    await page.screenshot({ path: `/private/tmp/e8kb-attack-${theme}.png`, fullPage: true });
    if (theme === 'light') await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  }
  await page.locator('.coverage-row').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(violations).toEqual([]);
  expect(requests.every((url) => new URL(url).origin === 'https://e8kb.test')).toBe(true);
});

test('CSV evidence never enters audit history or a backup, even with Deep Audit enabled', async ({ page }) => {
  await page.goto('/about');
  await page.getByLabel('Deep Audit Mode').check();
  await page.getByRole('link', { name: 'Essential 8 Knowledge Base', exact: true }).click();
  await page.getByLabel('Upload CSV').setInputFiles(auditCsv);
  await expect(page.locator('.evidence-summary')).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.endsWith('.auditTrail')))).toEqual([]);
  await about(page);
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export all profiles', exact: true }).click();
  const file = await (await event).path();
  const backup = JSON.parse(await fs.readFile(file!, 'utf8'));
  expect(backup.profiles[0].stepProgress).toEqual({});
  expect(backup.profiles[0].auditTrail).toEqual({});
  expect(backup.globalSettings.deepAuditEnabled).toBe(true);
  expect(Object.keys(backup)).toEqual(['schemaVersion', 'appVersion', 'exportedAt', 'profiles', 'globalSettings']);
});
