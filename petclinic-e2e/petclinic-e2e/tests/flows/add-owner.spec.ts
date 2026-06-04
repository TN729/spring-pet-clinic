import { test, expect } from '@playwright/test';
import { addOwner, uniqueLastName, type OwnerInput } from '../../helpers/flows';

/**
 * FLOW TESTS — add owner.
 * Covers the happy path AND a validation edge case. This is the value of
 * flow tests: precise coverage of one task's variations.
 */

test('add owner succeeds with valid data', async ({ page }) => {
  const owner: OwnerInput = {
    firstName: 'George',
    lastName: uniqueLastName('Franklin'),
    address: '110 W. Liberty St.',
    city: 'Madison',
    telephone: '6085551023',
  };

  await addOwner(page, owner);

  // addOwner already asserts the detail page; double-check a field rendered.
  await expect(page.getByText('110 W. Liberty St.')).toBeVisible();
  await expect(page.getByText('Madison')).toBeVisible();
});

test('add owner shows validation errors when fields are empty', async ({ page }) => {
  await page.goto('/owners/new');

  // Submit completely empty — PetClinic requires all fields.
  await page.getByRole('button', { name: 'Add Owner' }).click();

  // Should stay on the form (not redirect to a detail page)...
  await expect(page).toHaveURL(/\/owners\/new/);
  // ...and show field-level "must not be blank" errors.
  await expect(page.getByText('must not be blank').first()).toBeVisible();
});

test('add owner rejects non-numeric telephone', async ({ page }) => {
  await page.goto('/owners/new');

  await page.locator('#firstName').fill('Jean');
  await page.locator('#lastName').fill(uniqueLastName('Coleman'));
  await page.locator('#address').fill('105 N. Lake St.');
  await page.locator('#city').fill('Monona');
  await page.locator('#telephone').fill('not-a-number');

  await page.getByRole('button', { name: 'Add Owner' }).click();

  // Behavior that matters: bad input must NOT create an owner.
  await expect(page).toHaveURL(/\/owners\/new/);
  await expect(
    page.getByRole('heading', { name: 'Owner Information' })
  ).not.toBeVisible();
});
