import { test, expect } from '@playwright/test';
import { addOwner, findOwners, uniqueLastName, type OwnerInput } from '../../helpers/flows';

/**
 * FLOW TESTS — find owners.
 * The search box behaviour: exact-ish prefix match, empty returns all,
 * nonsense returns a "not found" state.
 */

test('find owner returns a matching owner', async ({ page }) => {
  // Arrange: create an owner we can reliably search for.
  const lastName = uniqueLastName('Searchable');
  const owner: OwnerInput = {
    firstName: 'Harold',
    lastName,
    address: '563 Friendly St.',
    city: 'Windsor',
    telephone: '6085553198',
  };
  await addOwner(page, owner);

  // Act: search by that last name.
  await findOwners(page, lastName);

  // Assert: the owner appears (single match redirects straight to detail page).
  await expect(page.getByText(`Harold ${lastName}`)).toBeVisible();
});

test('empty search returns the owners list', async ({ page }) => {
  await findOwners(page, '');
  // With an empty last name PetClinic lists owners in a table.
  await expect(page.getByRole('table')).toBeVisible();
});

test('search for nonexistent owner shows not found', async ({ page }) => {
  await findOwners(page, 'ZzzNoSuchOwner12345');
  // PetClinic re-renders the find form with a "has not been found" message.
  await expect(page.getByText(/has not been found/i)).toBeVisible();
});
