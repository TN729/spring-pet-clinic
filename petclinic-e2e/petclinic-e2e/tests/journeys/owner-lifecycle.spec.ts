import { test, expect } from '@playwright/test';
import {
  addOwner,
  findOwners,
  openOwnerByName,
  addPet,
  addVisit,
  uniqueLastName,
  type OwnerInput,
} from '../../helpers/flows';

/**
 * USER JOURNEY — "A new client registers, adds a pet, and books a visit."
 *
 * This is the end-to-end goal a real clinic user has. It composes the SAME
 * flow helpers used by the focused flow tests, chaining them into one arc:
 *
 *   register owner -> find that owner -> add a pet -> book a visit
 *
 * If any link in the chain breaks (e.g. a session/redirect issue between
 * steps), this catches it — something no single flow test would see.
 */
test('new client registers, adds a pet, and books a visit', async ({ page }) => {
  const lastName = uniqueLastName('Journey');
  const owner: OwnerInput = {
    firstName: 'Betty',
    lastName,
    address: '638 Cardinal Ave.',
    city: 'Sun Prairie',
    telephone: '6085551749',
  };

  // 1. Registration flow
  await addOwner(page, owner);

  // 2. Find-owner flow — prove the new record is searchable and reopen it.
  await findOwners(page, lastName);
  // A unique last name yields a single match → PetClinic goes straight to detail.
  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();

  // 3. Add-pet flow
  await addPet(page, {
    name: 'Leo',
    birthDate: '2020-09-07',
    type: 'cat',
  });

  // 4. Add-visit flow
  await addVisit(page, 'Leo', {
    date: '2024-01-15',
    description: 'Annual checkup and vaccinations',
  });

  // Goal reached: the owner page now shows the owner, their pet, and the visit.
  await expect(page.getByText(`Betty ${lastName}`)).toBeVisible();
  await expect(page.getByText('Leo')).toBeVisible();
  await expect(page.getByText('Annual checkup and vaccinations')).toBeVisible();
});
