import { test, expect } from '@playwright/test';

/**
 * FLOW TESTS — navigation.
 * Smallest possible flows: can the user reach each main page?
 * These act as smoke tests — if these fail, the app likely isn't running.
 */

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PetClinic/i);
  // The welcome page shows a "Welcome" heading/text.
  await expect(page.getByText('Welcome')).toBeVisible();
});

test('can navigate to Find Owners', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Find owners' }).click();
  await expect(page).toHaveURL(/\/owners\/find/);
  await expect(page.getByRole('button', { name: 'Find Owner' })).toBeVisible();
});

test('can navigate to Veterinarians', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Veterinarians' }).click();
  await expect(page).toHaveURL(/\/vets/);
  // The vets list renders a table of veterinarians.
  await expect(page.getByRole('heading', { name: 'Veterinarians' })).toBeVisible();
});
