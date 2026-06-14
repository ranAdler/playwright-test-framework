import { Page, Locator } from '@playwright/test';
import { AlertStatus } from '../../enums/alertStatus.enum';
import { AutoRemediateStatus } from '../../enums/autoRemediateStatus.enum';

export class SearchPage {
  private page: Page;
  private readonly statusFilterButton: Locator;
  private readonly autoRemediateFilterButton: Locator;
  private readonly statusListbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusFilterButton = page.locator('button[id="alert-status-filter"]');
    this.autoRemediateFilterButton = page.locator('button[id="alert-auto-remediate-filter"]');
    this.statusListbox = page.locator('div[role="listbox"]');
  }

  async clickStatusFilter(): Promise<void> {
    await this.statusFilterButton.click();
  }

  async selectStatus(status: AlertStatus): Promise<void> {
    await this.clickStatusFilter();
    await this.page.waitForTimeout(300);

    // Target the status option within the listbox
    const statusOption = this.page.locator('div[role="option"]').filter({ hasText: status }).first();
    await statusOption.click();
    await this.page.waitForTimeout(300);

    // Verify status was selected in dropdown
    const selectedStatus = await this.getSelectedStatus();
    if (selectedStatus !== status) {
      throw new Error(`Expected status ${status}, but got ${selectedStatus}`);
    }
  }

  async getSelectedStatus(): Promise<string> {
    const selectedText = await this.statusFilterButton.locator('span').first().textContent();
    return selectedText?.trim() || '';
  }

  async isStatusSelected(status: AlertStatus): Promise<boolean> {
    const selectedStatus = await this.getSelectedStatus();
    return selectedStatus === status;
  }

  async getFilterBadge(status: AlertStatus): Promise<Locator> {
    // Look for the badge container that has background color and contains the status text
    // The badge is a div with inline-flex styling containing the status text
    return this.page.locator('span').filter({ hasText: `Status: ${status}` }).first();
  }

  async isFilterBadgeVisible(status: AlertStatus): Promise<boolean> {
    try {
      const badge = await this.getFilterBadge(status);
      return await badge.isVisible();
    } catch {
      return false;
    }
  }

  async clickAutoRemediateFilter(): Promise<void> {
    await this.autoRemediateFilterButton.click();
  }

  async selectAutoRemediateStatus(status: AutoRemediateStatus): Promise<void> {
    await this.clickAutoRemediateFilter();
    await this.page.waitForTimeout(300);

    // Target the auto remediate option within the listbox
    const autoRemediateOption = this.page.locator('div[role="option"]').filter({ hasText: status }).first();
    await autoRemediateOption.click();
    await this.page.waitForTimeout(300);

    // Verify auto remediate status was selected
    const selectedStatus = await this.getSelectedAutoRemediateStatus();
    if (selectedStatus !== status) {
      throw new Error(`Expected auto remediate status ${status}, but got ${selectedStatus}`);
    }
  }

  async getSelectedAutoRemediateStatus(): Promise<string> {
    const selectedText = await this.autoRemediateFilterButton.locator('span').first().textContent();
    return selectedText?.trim() || '';
  }

  async isAutoRemediateStatusSelected(status: AutoRemediateStatus): Promise<boolean> {
    const selectedStatus = await this.getSelectedAutoRemediateStatus();
    return selectedStatus === status;
  }
}