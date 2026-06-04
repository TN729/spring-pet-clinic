# PetClinic E2E Harness (Playwright)

Playwright harness for the [Spring PetClinic](https://github.com/spring-projects/spring-petclinic)
sample app, demonstrating the split between **UI flow tests** (one task each) and a
**user journey test** (an end-to-end goal composed of flows).

## Structure

```
petclinic-e2e/
├── helpers/
│   └── flows.ts                 # Reusable flow functions (addOwner, addPet, addVisit, ...)
├── tests/
│   ├── flows/                   # FLOW TESTS — one task each, incl. edge cases
│   │   ├── navigation.spec.ts
│   │   ├── add-owner.spec.ts
│   │   └── find-owner.spec.ts
│   └── journeys/                # JOURNEY TESTS — full goals, composed of flows
│       └── owner-lifecycle.spec.ts
├── playwright.config.ts
└── package.json
```

The flow helpers are written once in `helpers/flows.ts`. The flow tests call them
to verify single tasks; the journey test chains them into one real-world arc
(register → find → add pet → book visit).

## Prerequisites

1. **Start PetClinic locally** (it runs on `http://localhost:8080`):

   ```bash
   git clone https://github.com/spring-projects/spring-petclinic.git
   cd spring-petclinic
   ./mvnw spring-boot:run
   ```

   Leave it running. Confirm http://localhost:8080 loads in a browser.

2. **Install harness deps** (in this folder, a separate terminal):

   ```bash
   npm install
   npx playwright install
   ```

## Run

```bash
npm test                 # all tests, headless
npm run test:flows       # only the flow tests
npm run test:journeys    # only the journey test
npm run test:ui          # interactive UI mode — best while learning
npm run test:headed      # watch a real browser drive the app
npm run report           # open the HTML report from the last run
```

Point at a different URL (e.g. a deployed instance):

```bash
PETCLINIC_URL=http://my-host:9090 npm test
```

## The important idea

- **Flow test** = verifies one mechanism (e.g. "add owner rejects empty fields").
  Fast, precise, pinpoints exactly what broke.
- **Journey test** = verifies the whole path holds together end-to-end.
  Catches problems that only appear when flows connect.

Both use the *same* Playwright tools and the *same* flow helpers — the only
difference is scope.

## Adapting locators to your version

These tests target PetClinic's standard Thymeleaf templates (field ids
`firstName`, `lastName`, `address`, `city`, `telephone`; buttons "Add Owner",
"Find Owner", "Add New Pet", "Add Visit"). If you've forked/modified the UI and a
locator misses, generate correct ones against your running app:

```bash
npm run codegen          # opens localhost:8080 and records your clicks into test code
```

Paste the generated locators over the ones in `helpers/flows.ts`.

## Debugging failures

- `trace: 'on-first-retry'` in the config captures a full timeline on retry.
  Replay it: `npx playwright show-trace` (or open it from the HTML report).
- Set `trace: 'on'` in `playwright.config.ts` while learning to always capture.
- Screenshots of failures are saved automatically and linked in the report.
