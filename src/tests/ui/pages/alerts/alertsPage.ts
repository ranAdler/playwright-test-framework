import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';
import { SearchPage } from './searchPage';
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
}