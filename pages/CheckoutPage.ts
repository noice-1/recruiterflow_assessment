import { type Page, type Locator } from '@playwright/test';

/**
 * CheckoutPage - Page Object for the SauceDemo checkout flow
 *   Step One:     /checkout-step-one.html
 *   Step Two:     /checkout-step-two.html
 *   Complete:     /checkout-complete.html
 *
 * Locator strategy (mixed — prefer semantic, fall back to testId):
 *
 *   Form inputs (firstName, lastName, postalCode)
 *     → getByRole('textbox', { name })
 *     All three inputs carry aria-label attributes, making getByRole
 *     the right choice. This also validates that labels are properly
 *     wired up for accessibility.
 *
 *   continue / finish / backHome buttons
 *     → getByRole('button', { name })
 *     Standard buttons (or input[type="submit"]) with clear accessible
 *     names derived from their value / text content.
 *
 *   completeHeader
 *     → getByRole('heading', { name: /thank you for your order/i })
 *     The confirmation message is an <h2>. Asserting via role and text
 *     verifies both the content AND that it is marked up as a heading,
 *     which is more meaningful than a bare test ID check.
 */
export class CheckoutPage {
  readonly page: Page;

  // Step One: Customer Information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // Step Two: Order Overview
  readonly finishButton: Locator;

  // Step Three: Order Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // All three inputs have aria-label — use getByRole for semantics + a11y validation
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    // input[type="submit"] with value="Continue" — role: button
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    // Standard <button> with text "Finish"
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    // Confirmation is an <h2> — role: heading validates markup + content in one assertion
    this.completeHeader = page.getByRole('heading', { name: /thank you for your order/i });
    // Standard <button> with text "Back Home"
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async getConfirmationMessage(): Promise<string> {
    return (await this.completeHeader.textContent()) ?? '';
  }
}
