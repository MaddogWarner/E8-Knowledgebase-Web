import { expect, test } from '@playwright/test';
import path from 'node:path';

test('core navigation, maturity tabs, M365 additions and about page work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Mitigation 1 Application Control', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mitigation 8 Regular Backups', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Mitigation 3 Configure MS Office Macros', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Configure MS Office Macros' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'ML1' })).toBeVisible();

  await page.getByRole('tab', { name: 'ML2' }).click();
  await expect(page).toHaveURL(/\/control\/3\/ml2/);
  await expect(page.getByText('Allow only digitally signed macros')).toBeVisible();

  await page.getByRole('link', { name: /Microsoft 365 Additional Controls/ }).click();
  await page.getByLabel('Microsoft 365 E3').check();
  await expect(page.getByLabel(/E3 \+ P1/)).toBeVisible();
  await expect(page.getByLabel(/E3 \+ P2/)).toBeVisible();
  await page.getByLabel(/Microsoft 365 E5/).check();
  await page.goto('/control/7/ml3');
  await expect(page.getByRole('heading', { name: /Microsoft 365 E5/ })).toBeVisible();
  await expect(page.getByText(/E5 identity and cloud-app signal integration/)).toBeVisible();

  await page.getByRole('link', { name: /About & Privacy/ }).click();
  await expect(page.getByText(/does not collect, record, store, transmit, or share any user data/)).toBeVisible();
});

test('deep links, search, copy and dark mode work', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/control/3/ml2');
  await expect(page.getByRole('heading', { name: 'Configure MS Office Macros' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'ML2' })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('searchbox', { name: /Search controls/ }).fill('vbawarnings');
  await page.getByRole('button', { name: /Disable VBA macros without notification/ }).click();
  await expect(page).toHaveURL(/\/control\/3\/ml1#3-ml1-2/);

  const targetCode = page.locator('[id="3-ml1-2"] .code-block').first();
  const codeText = await targetCode.locator('code').innerText();
  await targetCode.getByRole('button', { name: /Copy technical detail/ }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(codeText);

  await page.getByRole('button', { name: 'Toggle dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('manual ticks update progress and persist across reloads', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await expect(page.getByText('0 / 10 steps')).toBeVisible();

  await page.getByLabel('Mark Enable the Application Identity service implemented').check();
  await expect(page.locator('.status-badge.self')).toBeVisible();
  await expect(page.getByText('1 / 10 steps')).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Mark Enable the Application Identity service implemented')).toBeChecked();
  await expect(page.getByText('1 / 10 steps')).toBeVisible();
});

test('home target maturity hide switch filters completed mitigations', async ({ page }) => {
  await page.goto('/control/1/ml1');
  for (const label of [
    'Mark Enable the Application Identity service implemented',
    'Mark Create AppLocker default rules implemented',
    'Mark Block execution from user-writable locations implemented',
    'Mark Log block events implemented'
  ]) {
    await page.getByLabel(label).check();
  }

  await page.goto('/');
  await page.getByLabel('Target maturity').selectOption('ml1');
  await page.getByLabel('Hide completed mitigations').check();
  // Scope to the card grid: the sidebar link for Mitigation 1 is always present;
  // a hidden mitigation means its card (not its sidebar entry) is gone.
  await expect(page.locator('.control-grid').getByRole('link', { name: /Mitigation 1 Application Control/ })).toHaveCount(0);
  await expect(page.locator('.control-grid').getByRole('link', { name: /Mitigation 2 Patch Applications/ })).toBeVisible();
});

test('CSV evidence upload marks mapped steps and clears on reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="file"]').setInputFiles(path.resolve('src/tests/fixtures/audit-sample.csv'));
  await expect(page.getByText('Matched 4 of 5 E8 checks across 2 mitigations. MDE and audit-policy rows ignored.')).toBeVisible();

  // Navigate within the SPA (client-side) so the in-memory evidence survives;
  // a full page load would correctly reset it.
  await page.getByRole('link', { name: 'Mitigation 5 Restrict Administrative Privileges', exact: true }).click();
  await page.getByRole('tab', { name: 'ML2' }).click();
  await expect(page).toHaveURL(/\/control\/5\/ml2/);
  await expect(page.locator('.status-badge.evidenced')).toBeVisible();
  await expect(page.locator('.status-badge.failed')).toBeVisible();

  await page.reload();
  await expect(page.locator('.status-badge.evidenced')).toHaveCount(0);
  await expect(page.locator('.status-badge.failed')).toHaveCount(0);
});

test('about page links to the audit tool repository', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('link', { name: 'E8 hardening audit & policy compliance checker (GitHub)' })).toHaveAttribute(
    'href',
    'https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker'
  );
});
