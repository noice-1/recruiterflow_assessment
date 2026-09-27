import { type Page, type Locator } from '@playwright/test';

/**
 * LoginPage - Page Object for https://www.saucedemo.com
 *
 * Locator strategy (mixed — prefer semantic, fall back to testId):
 *
 *   usernameInput / passwordInput → getByRole('textbox', { name })
 *     Both carry aria-label attributes. getByRole validates accessibility
 *     and is more resilient than a CSS class or placeholder.
 *
 *   loginButton → getByRole('button', { name: 'Login' })
 *     input[type="submit"] maps to role="button"; name comes from value.
 *
 *   errorMessage → getByRole('alert')
 *     The error <h3> lives inside a <div role="alert"> container.
 *     Playwright's a11y tree exposes the outer container as the alert,
 *     not the inner <h3>. Using getByRole('alert') is the correct and
 *     most meaningful choice — it asserts that the error is surfaced
 *     to assistive technologies as a live region.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Inputs carry aria-label — getByRole is the most semantic choice
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    // input[type="submit"] with value="Login" — role: button
    this.loginButton = page.getByRole('button', { name: 'Login' });
    // The error container is a div[role="alert"] wrapping the <h3> message.
    // Playwright resolves the alert role on the outer container, not the heading.
    this.errorMessage = page.getByRole('alert');
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
