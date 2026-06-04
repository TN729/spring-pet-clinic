package org.springframework.samples.petclinic.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * INTEGRATION TESTS for the Owner-related endpoints.
 *
 * Unlike PetClinic's existing @WebMvcTest classes (which load ONLY the web layer and MOCK
 * the repository), these tests use @SpringBootTest to boot the ENTIRE application context
 * with the REAL service and REAL repository against the in-memory H2 database. A request
 * therefore flows through every layer for real: controller -> service -> repository ->
 * database -> back.
 *
 * That end-to-end-through-the-layers wiring is what makes these INTEGRATION tests rather
 * than unit tests. No browser is involved (that is what the Playwright E2E suite covers);
 * here we exercise the backend stack directly.
 *
 * @AutoConfigureMockMvc gives us a MockMvc to perform real HTTP-style requests against
 * the running application context without starting a network server.
 */
@SpringBootTest
@AutoConfigureMockMvc
class OwnerIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	/**
	 * The find page should load and render its form. Verifies the web layer is wired up
	 * and serving the owners/find view through the full context.
	 */
	@Test
	void findOwnersPageLoads() throws Exception {
		mockMvc.perform(get("/owners/find")).andExpect(status().isOk()).andExpect(view().name("owners/findOwners"));
	}

	/**
	 * Searching with no last name should list owners from the REAL database. PetClinic
	 * ships seed data, so the owners list view should render. This proves controller ->
	 * repository -> database read works end to end.
	 */
	@Test
	void searchWithoutLastNameReturnsOwnersList() throws Exception {
		mockMvc.perform(get("/owners?lastName=")).andExpect(status().isOk());
	}

	/**
	 * The seed data includes an owner named "Franklin". Searching that surname should
	 * find exactly one match and redirect to that owner's detail page. Exercises a real
	 * filtered query against the database.
	 */
	@Test
	void searchExistingSurnameFindsSeededOwner() throws Exception {
		mockMvc.perform(get("/owners?lastName=Franklin"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrlPattern("/owners/*"));
	}

	/**
	 * THE CORE INTEGRATION TEST: creating an owner must actually persist it. We POST a
	 * new owner (which writes to the database via the repository), expect the success
	 * redirect, then follow up by reading the new owner's detail page to confirm the data
	 * was truly saved and can be read back.
	 *
	 * This is the kind of bug only an integration test catches: if the controller, the
	 * service, the entity mapping, or the database wiring were broken, the
	 * write-then-read round trip would fail even though each piece might pass in
	 * isolation.
	 */
	@Test
	void createOwnerPersistsAndIsRetrievable() throws Exception {
		// POST a new owner -> should write to the DB and redirect to /owners/{id}
		mockMvc
			.perform(post("/owners/new").param("firstName", "Integration")
				.param("lastName", "Tester")
				.param("address", "1 Test Lane")
				.param("city", "Testville")
				.param("telephone", "1234567890"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrlPattern("/owners/*"));

		// Read it back via search -> confirms it was genuinely persisted
		mockMvc.perform(get("/owners?lastName=Tester"))
			.andExpect(status().is3xxRedirection())
			.andExpect(redirectedUrlPattern("/owners/*"));
	}

	/**
	 * Validation must also hold end to end: an owner with an empty last name and
	 * non-numeric telephone should NOT be saved; the form should redisplay with errors
	 * instead of redirecting. Confirms bean validation is active across the real stack.
	 */
	@Test
	void createOwnerWithInvalidDataIsRejected() throws Exception {
		mockMvc.perform(post("/owners/new").param("firstName", "Bad")
			.param("lastName", "") // required - must fail
			.param("address", "1 Test Lane")
			.param("city", "Testville")
			.param("telephone", "not-a-number"))
			.andExpect(status().isOk()) // stays on the form (no redirect)
			.andExpect(model().attributeHasErrors("owner"));
	}

	/**
	 * The veterinarians page reads vet data (and their specialties) from the database and
	 * renders the list. A second read-path integration check.
	 */
	@Test
	void vetsPageListsVeterinarians() throws Exception {
		mockMvc.perform(get("/vets.html"))
			.andExpect(status().isOk())
			.andExpect(view().name("vets/vetList"))
			.andExpect(model().attributeExists("listVets"));
	}

}
