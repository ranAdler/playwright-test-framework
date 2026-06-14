import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

export class ScanActivityPage extends BasePage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Scan Activity")');
  }

  static async create(page: Page): Promise<ScanActivityPage> {
    const scanActivityPage = new ScanActivityPage(page);
    await scanActivityPage.pageTitle.waitFor({ state: 'visible' });
    return scanActivityPage;
  }
}