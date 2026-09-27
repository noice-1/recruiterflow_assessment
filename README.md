# SauceDemo & ReqRes QA Automation Suite

A robust, maintainable, and modern end-to-end automation test suite built with **Playwright** and **TypeScript**, covering both **UI Automation** ([SauceDemo](https://www.saucedemo.com/)) and **API Automation** ([ReqRes](https://reqres.in/)).

---

## 📋 Table of Contents
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Folder Structure](#folder-structure)
- [Prerequisites & Installation](#prerequisites--installation)
- [Running Tests](#running-tests)
- [Test Scenarios Covered](#test-scenarios-covered)
- [Design Decisions & Best Practices](#design-decisions--best-practices)
- [Trade-offs & Future Extensions](#trade-offs--future-extensions)

---

## 🛠 Tech Stack & Architecture

- **Core Framework**: [Playwright](https://playwright.dev/) v1.62+
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Design Pattern**: Page Object Model (POM) for UI testing
- **API Client**: Playwright's native `request` fixture (lightweight, fast, no browser overhead)
- **Locator Strategy**: Playwright semantic locators (`getByRole`, `getByText`) paired with custom test ID configuration (`testIdAttribute: 'data-test'`) to leverage SauceDemo's native `data-test` attributes safely.

---

## 📂 Folder Structure

```text
├── pages/
│   ├── LoginPage.ts            # Page object for SauceDemo login page
│   ├── ProductsPage.ts         # Page object for inventory/products catalog and sort
│   ├── CartPage.ts             # Page object for cart view and checkout entry
│   └── CheckoutPage.ts         # Page object for multi-step checkout and confirmation
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts       # Scenarios 1 & 2: Successful auth and locked-out user
│   │   ├── cart.spec.ts        # Scenarios 3 & 5: Cart badge count and low-to-high price sorting
│   │   └── checkout.spec.ts    # Scenario 4: End-to-end checkout order completion
│   └── api/
│       └── users.spec.ts       # Scenarios 6, 7 & 8: ReqRes GET, POST, and chained flow
├── playwright.config.ts        # Playwright runner configuration (baseURL, data-test ID, workers, reporters)
├── package.json                # Dependencies and npm test scripts
├── tsconfig.json               # TypeScript compiler configuration
└── README.md                   # Documentation and execution guide
```

---

## 🚀 Prerequisites & Installation

1. **Node.js**: Ensure Node.js (v18 or higher recommended) is installed.
2. **Clone & Install Dependencies**:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```
3. **Install Playwright Browsers** (Chromium):
   ```bash
   npx playwright install chromium
   ```

---

## 🧪 Running Tests

The test suite includes dedicated npm scripts for flexibility:

| Command | Description |
| :--- | :--- |
| `npm test` or `npx playwright test` | Run the complete test suite (both UI & API) in headless mode |
| `npm run test:ui` | Run only the UI test suite (`tests/ui`) |
| `npm run test:api` | Run only the API test suite (`tests/api`) |
| `npm run test:headed` | Run tests with browser UI visible |
| `npm run test:ui-mode` | Open Playwright's interactive visual UI Mode |
| `npm run test:report` | Open the HTML test execution report |

---

## 🎯 Test Scenarios Covered

### Part 1 — UI Automation ([SauceDemo](https://www.saucedemo.com/))

| Spec File | Scenario | Verification Details |
| :--- | :--- | :--- |
| `tests/ui/login.spec.ts` | **Scenario 1**: Standard user login | Authenticates with `standard_user` / `secret_sauce`, verifies URL reaches `/inventory.html`, and verifies "Products" page header is visible. |
| `tests/ui/login.spec.ts` | **Scenario 2**: Locked-out user validation | Attempts login with `locked_out_user` / `secret_sauce`, asserts error message `"Epic sadface: Sorry, this user has been locked out."`, and verifies the user is NOT redirected. |
| `tests/ui/cart.spec.ts` | **Scenario 3**: Add products to cart | Adds two items from inventory and asserts that the cart badge updates to display `'2'`. |
| `tests/ui/cart.spec.ts` | **Scenario 5**: Product sorting by Price (low to high) | Selects the `'Price (low to high)'` dropdown option (`lohi`), extracts all prices, verifies the first item has the lowest price, and verifies the entire list is in non-decreasing order. |
| `tests/ui/checkout.spec.ts` | **Scenario 4**: Full checkout workflow | Adds items to cart, navigates through Cart -> Checkout Step 1 (shipping information) -> Checkout Step 2 (order overview) -> Finishes order -> Verifies `"Thank you for your order!"` confirmation message. |

### Part 2 — API Automation ([ReqRes](https://reqres.in/))

| Spec File | Scenario | Verification Details |
| :--- | :--- | :--- |
| `tests/api/users.spec.ts` | **Scenario 6**: `GET /api/users?page=2` | Validates HTTP 200, checks that `data` is an array with items, and asserts each user object contains valid `id`, `email`, `first_name`, and `last_name`. |
| `tests/api/users.spec.ts` | **Scenario 7**: `POST /api/users` | Posts `{ name: "morpheus", job: "leader" }`, verifies HTTP 201 status code, checks echoed `name` and `job`, and validates generated `id` and valid `createdAt` ISO timestamp. |
| `tests/api/users.spec.ts` | **Scenario 8**: Bonus Chained Flow | Demonstrates create-then-verify pattern: creates a user, extracts the dynamic ID, chains a follow-up request to verify stateless mock API lifecycle behavior (HTTP 404 for non-persisted resource), and validates contract integrity against standard user entities. |

---

## 💡 Design Decisions & Best Practices

1. **Page Object Model (POM)**:
   - UI tests interact solely through strongly typed Page Objects (`LoginPage`, `ProductsPage`, `CartPage`, `CheckoutPage`).
   - Clean encapsulation: Locators and high-level user actions live in page classes; tests focus entirely on business flows and assertions.

2. **Semantic & Resilient Locators**:
   - Configured `testIdAttribute: 'data-test'` in `playwright.config.ts`, unlocking Playwright's native `getByTestId(...)` helper while keeping selectors resilient against CSS refactoring.
   - Used semantic `getByRole('button', { name: ... })` for natural user interaction modeling.

3. **No Flakiness & Test Isolation**:
   - Zero hardcoded delays (`sleep` or `waitForTimeout`). Every assertion uses Playwright's auto-retrying web assertions (e.g. `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`).
   - Each test is independent and sets up its own state; tests can run in any order and concurrently in parallel workers.

4. **Pure API Testing via `request` Fixture**:
   - API tests use Playwright's lightweight `request` context without spinning up a browser process, keeping API runs under 3 seconds.

---

## ⚖️ Trade-offs & Future Extensions

If extending this suite for production enterprise testing, the following enhancements would be added:

1. **Authentication Storage State (Session Reuse)**:
   - For UI suites with dozens of tests, logging in through the UI before every single test adds overhead. Using Playwright's `storageState` (`global-setup.ts`) would allow caching authenticated cookies/session storage once and injecting it into tests that start directly on `/inventory.html`.
2. **Cross-Browser & Mobile Matrix**:
   - Enable additional Playwright projects (Firefox, WebKit, Mobile Chrome, Mobile Safari) to verify responsive layouts and cross-browser consistency.
3. **CI/CD Integration**:
   - Add a GitHub Actions workflow (`.github/workflows/playwright.yml`) running tests on pull requests with artifact upload for HTML test reports and traces on failure.
