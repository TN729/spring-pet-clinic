import { expect, type Page } from '@playwright/test';

/**
 * Reusable UI FLOWS for Spring PetClinic.
 *
 * Each function is one self-contained flow (one task). Flow tests call these
 * directly to verify a single task; journey tests compose several in sequence
 * to verify an end-to-end goal. Write the logic once, reuse everywhere.
 *
 * Locators are based on PetClinic's actual Thymeleaf templates:
 *   - Owner form input ids/names: firstName, lastName, address, city, telephone
 *   - Buttons: "Add Owner", "Update Owner", "Find Owner", "Add New Pet", "Add Visit"
 *   - Top nav links: "Find owners", "Veterinarians", "Home"
 *   - Pet form: "name" (text), "birthDate" (date), "type" (select)
 *   - Visit form: "date" (date), "description" (text)
 */

export type OwnerInput = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  telephone: string; // digits only, up to 10 — PetClinic validates this
};

export type PetInput = {
  name: string;
  birthDate: string; // YYYY-MM-DD (HTML date input format)
  type: 'cat' | 'dog' | 'lizard' | 'snake' | 'bird' | 'hamster';
};

export type VisitInput = {
  date: string; // YYYY-MM-DD
  description: string;
};

/**
 * FLOW: Add a new owner.
 * Navigates to the new-owner form, fills it, submits, and confirms we land
 * on the owner's detail page (PetClinic redirects to /owners/{id} on success).
 */
export async function addOwner(page: Page, owner: OwnerInput): Promise<void> {
  await page.goto('/owners/new');

  await page.locator('#firstName').fill(owner.firstName);
  await page.locator('#lastName').fill(owner.lastName);
  await page.locator('#address').fill(owner.address);
  await page.locator('#city').fill(owner.city);
  await page.locator('#telephone').fill(owner.telephone);

  await page.getByRole('button', { name: 'Add Owner' }).click();

  // On success PetClinic shows the Owner Information detail page.
  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
  await expect(page.getByText(`${owner.firstName} ${owner.lastName}`)).toBeVisible();
}

/**
 * FLOW: Find owners by last name.
 * Uses the "Find owners" page search box. Leaving lastName empty returns all.
 */
export async function findOwners(page: Page, lastName: string): Promise<void> {
  await page.goto('/owners/find');
  await page.locator('#lastName').fill(lastName);
  await page.getByRole('button', { name: 'Find Owner' }).click();
}

/**
 * FLOW: Open a specific owner's detail page from the owners results list.
 * Assumes you are on a list/results page that links owners by name.
 */
export async function openOwnerByName(page: Page, fullName: string): Promise<void> {
  await page.getByRole('link', { name: fullName }).click();
  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
}

/**
 * FLOW: Add a new pet to the currently-open owner.
 * Must be called while on an owner's detail page.
 */
export async function addPet(page: Page, pet: PetInput): Promise<void> {
  await page.getByRole('link', { name: 'Add New Pet' }).click();

  await page.locator('#name').fill(pet.name);
  await page.locator('#birthDate').fill(pet.birthDate);
  await page.locator('#type').selectOption(pet.type);

  await page.getByRole('button', { name: 'Add Pet' }).click();

  // Returns to the owner detail page, which now lists the pet.
  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
  await expect(page.getByText(pet.name)).toBeVisible();
}

/**
 * FLOW: Add a visit for a given pet of the currently-open owner.
 * `petName` is used to locate the correct "Add Visit" link when an owner
 * has multiple pets. Must be called while on an owner's detail page.
 */
export async function addVisit(page: Page, petName: string, visit: VisitInput): Promise<void> {
  // Each pet row has its own "Add Visit" link; scope to the row containing the pet.
  const petRow = page.locator('tr', { hasText: petName });
  await petRow.getByRole('link', { name: 'Add Visit' }).click();

  await page.locator('#date').fill(visit.date);
  await page.locator('#description').fill(visit.description);

  await page.getByRole('button', { name: 'Add Visit' }).click();

  // Back on the owner page; the visit description should now be visible.
  await expect(page.getByRole('heading', { name: 'Owner Information' })).toBeVisible();
  await expect(page.getByText(visit.description)).toBeVisible();
}

/**
 * Small utility: generate a unique last name so repeated test runs don't
 * collide or accumulate ambiguous duplicates in the H2 database.
 */
export function uniqueLastName(prefix = 'Tester'): string {
  return `${prefix}${Date.now()}`;
}
