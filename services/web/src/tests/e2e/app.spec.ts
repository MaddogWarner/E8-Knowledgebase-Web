import { expect, test } from '@playwright/test';

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
