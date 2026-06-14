import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { PoliciesPage } from './policiesPage';
import { AlertsPage } from './alertsPage';
import { ScanActivityPage } from './scanActivityPage';

export class NavigatePage extends BasePage {
  readonly mainNavigation: Locator;

  constructor(page: Page) {
    super(page);
    this.mainNavigation = page.locator('nav[aria-label="Main navigation"]');
  }

  static async create(page: Page): Promise<NavigatePage> {
    const navigatePage = new NavigatePage(page);
    await navigatePage.mainNavigation.waitFor({ state: 'visible' });
    return navigatePage;
  }

  async goToPolicies(): Promise<PoliciesPage> {
    await this.mainNavigation.locator('a[href="/policies"]').click();
    return await PoliciesPage.create(this.page);
  }

  async goToAlerts(): Promise<AlertsPage> {
    await this.mainNavigation.locator('a[href="/alerts"]').click();
    return await AlertsPage.create(this.page);
  }

  async goToScanActivity(): Promise<ScanActivityPage> {
    await this.mainNavigation.locator('a[href="/scans"]').click();
    return await ScanActivityPage.create(this.page);
  }
}