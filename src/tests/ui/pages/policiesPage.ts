import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class PoliciesPage extends BasePage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Security Policies")');
  }

  static async create(page: Page): Promise<PoliciesPage> {
    const policiesPage = new PoliciesPage(page);
    await policiesPage.pageTitle.waitFor({ state: 'visible' });
    return policiesPage;
  }
}