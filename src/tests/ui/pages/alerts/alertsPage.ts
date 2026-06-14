import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';

export class AlertsPage extends BasePage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Security Alerts")');
  }

  static async create(page: Page): Promise<AlertsPage> {
    const alertsPage = new AlertsPage(page);
    await alertsPage.pageTitle.waitFor({ state: 'visible' });
    return alertsPage;
  }
}