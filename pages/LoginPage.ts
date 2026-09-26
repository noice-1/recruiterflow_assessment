import { type Page, type Locator } from '@playwright/test';

/**
 * LoginPage - Page Object for https://www.saucedemo.com
 *
 * All locators use getByTestId() because SauceDemo exposes stable
 * data-test attributes on every interactive element. These are
 * the most resilient selectors - they won't break on style or label changes.
 *
 * data-test=username       - username text field
 * data-test=password       - password text field
 * data-test=login-button   - submit button
 * data-test=error          - error message container (role=alert)
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }
}
