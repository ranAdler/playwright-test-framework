import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';
import { SearchPage } from './searchPage';
import { AlertItemPage } from './alertItemPage';
import { AlertStatus } from '../../enums/alertStatus.enum';
import { AutoRemediateStatus } from '../../enums/autoRemediateStatus.enum';

export class AlertsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchPage: SearchPage;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("Security Alerts")');
    this.searchPage = new SearchPage(page);
  }

  static async create(page: Page): Promise<AlertsPage> {
    const alertsPage = new AlertsPage(page);
    await alertsPage.pageTitle.waitFor({ state: 'visible' });
    return alertsPage;
  }

  async selectStatus(status: AlertStatus): Promise<void> {
    await this.searchPage.selectStatus(status);
  }

  async getSelectedStatus(): Promise<string> {
    return this.searchPage.getSelectedStatus();
  }

  async isStatusSelected(status: AlertStatus): Promise<boolean> {
    return this.searchPage.isStatusSelected(status);
  }

  async isFilterBadgeVisible(status: AlertStatus): Promise<boolean> {
    return this.searchPage.isFilterBadgeVisible(status);
  }

  async selectAutoRemediateStatus(status: AutoRemediateStatus): Promise<void> {
    await this.searchPage.selectAutoRemediateStatus(status);
  }

  async getSelectedAutoRemediateStatus(): Promise<string> {
    return this.searchPage.getSelectedAutoRemediateStatus();
  }

  async isAutoRemediateStatusSelected(status: AutoRemediateStatus): Promise<boolean> {
    return this.searchPage.isAutoRemediateStatusSelected(status);
  }

  async getTotalAlertsCount(): Promise<number> {
    // Find the span that contains the number before "Total Alerts"
    // Look for a span with just digits
    const countSpan = this.page.locator('span').filter({ hasText: /^\d+$/ });
    // Get the first one that's near "Total Alerts"
    const countText = await countSpan.first().textContent();
    return parseInt(countText?.trim() || '0', 10);
  }

  async verifyTotalAlertsCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getTotalAlertsCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected total alerts count: ${expectedCount}, but got: ${actualCount}`);
    }
  }

  async getFirstAlertTitle(): Promise<string> {
    const firstAlertCell = this.page.locator('table[aria-label="Alerts list"] tbody tr').first().locator('td').first();
    const titleDiv = firstAlertCell.locator('div').first();
    const titleText = await titleDiv.textContent();
    return titleText?.trim() || '';
  }

  async clickFirstAlert(): Promise<AlertItemPage> {
    const firstAlertTitle = await this.getFirstAlertTitle();
    const firstAlertRow = this.page.locator('table[aria-label="Alerts list"] tbody tr').first();
    await firstAlertRow.click();

    // Create and return AlertItemPage after the drawer opens
    return AlertItemPage.create(this.page, firstAlertTitle);
  }

  async getAlertsTable(): Promise<Locator> {
    return this.page.locator('table[aria-label="Alerts list"]');
  }

  async getAlertRowCount(): Promise<number> {
    const rows = this.page.locator('table[aria-label="Alerts list"] tbody tr');
    return await rows.count();
  }
}