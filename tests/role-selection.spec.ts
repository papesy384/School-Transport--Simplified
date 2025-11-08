import { test, expect } from '@playwright/test';

test.describe('Role-gated navigation', () => {
  test('prompts for role selection and navigates to admin workspace', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /admin/i }).click();

    const overlay = page.locator('#role-selection-overlay');
    await expect(overlay).toBeVisible();

    await page.locator('[data-role-card][data-role="admin"]').click();

    await expect(overlay).toBeHidden();
    await expect(page).toHaveURL(/#guest\/admin$/);

    const adminView = page.locator('#view-guest-admin');
    await expect(adminView).toBeVisible();
  });

  test('blocks direct hash navigation without selecting a role', async ({ page }) => {
    await page.goto('/#guest/driver');

    const overlay = page.locator('#role-selection-overlay');
    await expect(overlay).toBeVisible();

    const alert = page.locator('#role-overlay-alert');
    await expect(alert).toBeVisible();

    const driverView = page.locator('#view-guest-driver');
    await expect(driverView).toBeHidden();

    await page.locator('[data-role-card][data-role="driver"]').click();
    await expect(overlay).toBeHidden();
    await expect(page).toHaveURL(/#guest\/driver$/);
    await expect(driverView).toBeVisible();
  });
});

