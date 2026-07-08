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

  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();
  await expect(page.locator('.status-badge.implemented')).toBeVisible();
  await expect(page.getByText('1 / 10 steps · 10%')).toBeVisible();

  await page.reload();
  await expect(page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('1 / 10 steps · 10%')).toBeVisible();
});

test('N/A status with reason persists and is excluded from the denominator', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'N/A' }).click();
  await page.getByLabel('N/A reason').fill('Server-only control excluded');
  await page.getByLabel('N/A reason').press('Enter');

  await expect(page.locator('[id="1-ml1-1"] .status-badge.notApplicable')).toBeVisible();
  await expect(page.getByText('0 / 9 steps · 0%')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Server-only control excluded')).toBeVisible();
});

test('home target maturity hide switch filters completed mitigations', async ({ page }) => {
  await page.goto('/control/1/ml1');
  for (const stepId of ['1-ml1-1', '1-ml1-2', '1-ml1-3', '1-ml1-4']) {
    await page.locator(`[id="${stepId}"]`).getByRole('radio', { name: 'Implemented', exact: true }).click();
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
  await expect(page.locator('.evidence-summary').filter({ hasText: 'Audit-policy: 4 of 5 checks matched' })).toBeVisible();
  await page.getByText('2 checks have no matching KB step').click();
  await expect(page.getByText('Secure Boot')).toBeVisible();

  await page.locator('.evidence-summary').getByRole('link', { name: 'Windows Audit Policy' }).click();
  await expect(page).toHaveURL(/\/audit-policy/);
  await expect(page.getByText('Matched 4 of 5 audit-policy checks from the uploaded report.')).toBeVisible();
  await page.getByText('1 audit-policy checks have no entry on this page').click();
  await expect(page.getByText('Security Event Log Size')).toBeVisible();
  await expect(page.locator('[id="logon"] .audit-status-chip')).toHaveText('Compliant');
  await expect(page.locator('[id="process-creation"] .audit-status-chip')).toHaveText('Non-compliant');
  await expect(page.locator('[id="process-creation"]')).toContainText('Current: Process creation auditing disabled — Expected: Success');
  await expect(page.locator('[id="special-logon"] .audit-status-chip')).toHaveText('Review');

  // Navigate within the SPA (client-side) so the in-memory evidence survives;
  // a full page load would correctly reset it.
  await page.getByRole('link', { name: 'Mitigation 5 Restrict Administrative Privileges', exact: true }).click();
  await page.getByRole('tab', { name: 'ML2' }).click();
  await expect(page).toHaveURL(/\/control\/5\/ml2/);
  await expect(page.locator('.status-badge.evidenced')).toBeVisible();
  await expect(page.locator('.status-badge.failed')).toBeVisible();

  await page.getByRole('link', { name: 'Mitigation 4 User Application Hardening', exact: true }).click();
  await page.getByRole('tab', { name: 'ML2' }).click();
  await expect(page.locator('[id="4-ml2-2"] .status-badge.failed')).toHaveText('Audit: non-compliant');

  await page.reload();
  await expect(page.locator('.status-badge.evidenced')).toHaveCount(0);
  await expect(page.locator('.status-badge.failed')).toHaveCount(0);
});

test('Windows Audit Policy page and search work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Windows Audit Policy/ }).click();
  await expect(page.getByRole('heading', { name: 'Windows Audit Policy' })).toBeVisible();
  await expect(page.getByText('Audit Account Lockout')).toBeVisible();
  await expect(page.getByText(/audit-policy checks from the uploaded report/)).toHaveCount(0);
  await expect(page.locator('.audit-status-chip')).toHaveCount(0);

  await page.getByRole('searchbox', { name: /Search controls/ }).fill('Audit Account Lockout');
  await page.getByRole('button', { name: /Audit Account Lockout/ }).click();
  await expect(page).toHaveURL(/\/audit-policy#account-lockout/);
});

test('Audit Policy evidence clears from the page', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="file"]').setInputFiles(path.resolve('src/tests/fixtures/audit-sample.csv'));
  await page.locator('.evidence-summary').getByRole('link', { name: 'Windows Audit Policy' }).click();
  await expect(page.locator('.audit-status-chip')).toHaveCount(4);

  await page.getByRole('link', { name: 'Essential 8 Knowledge Base' }).click();
  await page.getByRole('button', { name: 'Clear' }).click();
  await page.getByRole('link', { name: 'Windows Audit Policy' }).click();
  await expect(page.getByText(/audit-policy checks from the uploaded report/)).toHaveCount(0);
  await expect(page.locator('.audit-status-chip')).toHaveCount(0);
});

test('CSV export downloads a compliance report', async ({ page }) => {
  await page.goto('/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^e8kb-compliance-report-default-\d{4}-\d{2}-\d{2}\.csv$/);
});

test('profiles isolate progress', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();

  await page.getByRole('button', { name: /Profile Default/ }).click();
  await page.getByLabel('New profile name').fill('Ward servers');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.goto('/control/1/ml1');
  await expect(page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Not implemented' })).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: /Profile Ward servers/ }).click();
  await page.getByRole('button', { name: 'Default', exact: true }).click();
  await page.goto('/control/1/ml1');
  await expect(page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true })).toHaveAttribute('aria-checked', 'true');
});

test('about reset flow clears active profile tracking', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();
  await page.getByRole('link', { name: /About & Privacy/ }).click();
  await page.getByRole('button', { name: 'Reset this profile' }).click();
  await page.getByRole('button', { name: 'Confirm reset' }).click();
  await page.goto('/control/1/ml1');
  await expect(page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Not implemented' })).toHaveAttribute('aria-checked', 'true');
});

test('about page links to the audit tool repository', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('link', { name: 'E8 hardening audit & policy compliance checker (GitHub)' })).toHaveAttribute(
    'href',
    'https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker'
  );
});

test('status filter chips support multi-select, empty state, tab persistence and navigation reset', async ({ page }) => {
  await page.goto('/control/1/ml1');
  await page.locator('[id="1-ml1-1"]').getByRole('radio', { name: 'Implemented', exact: true }).click();

  await page.getByRole('button', { name: 'Marked implemented · 1' }).click();
  await expect(page.getByText('Showing 1 of 4 steps')).toBeVisible();
  await expect(page.locator('.steps-list .step-card')).toHaveCount(1);
  await expect(page.locator('[id="1-ml1-1"]')).toBeVisible();

  await page.getByRole('button', { name: 'Remaining · 9' }).click();
  await expect(page.locator('.steps-list .step-card')).toHaveCount(4);
  await expect(page.getByText('Showing 4 of 4 steps')).toBeVisible();

  await page.getByRole('button', { name: 'Marked implemented · 1' }).click();
  await expect(page.locator('.steps-list .step-card')).toHaveCount(3);
  await expect(page.locator('[id="1-ml1-1"]')).toHaveCount(0);
  await expect(page.getByText('Showing 3 of 4 steps')).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.steps-list .step-card')).toHaveCount(4);
  await expect(page.getByText(/Showing \d+ of \d+ steps/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Marked implemented · 1' }).click();
  await page.getByRole('tab', { name: 'ML2' }).click();
  await expect(page.getByRole('button', { name: 'Marked implemented · 1' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('No steps in this maturity level match the selected filters.')).toBeVisible();

  await page.getByRole('link', { name: 'Mitigation 2 Patch Applications', exact: true }).click();
  await expect(page).toHaveURL(/\/control\/2\/ml1/);
  await expect(page.getByRole('button', { name: /Marked implemented/ })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByText(/Showing \d+ of \d+ steps/)).toHaveCount(0);
});

test('home compliance chart rows link to control ML1 pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /3\. Configure MS Office Macros/ }).click();
  await expect(page).toHaveURL(/\/control\/3\/ml1/);
  await expect(page.getByRole('heading', { name: 'Configure MS Office Macros' })).toBeVisible();
});
