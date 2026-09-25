import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Step One: Customer Information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // Step Two: Overview & Confirmation
  readonly finishButton: Locator;

  // Step Three: Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
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
