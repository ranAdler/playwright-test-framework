import { Page, Locator } from '@playwright/test';
import { AlertStatus } from '../../enums/alertStatus.enum';
import { AlertAssignee } from '../../enums/alertAssignee.enum';

export class AlertItemPage {
  private page: Page;
  readonly drawer: Locator;
  readonly drawerHeader: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.drawer = page.locator('aside[data-testid="alert-details-drawer"]');
    this.drawerHeader = this.drawer.locator('h2');
    this.closeButton = this.drawer.locator('button[aria-label="Close"]');
  }

  static async create(page: Page, alertTitle: string): Promise<AlertItemPage> {
    const alertItemPage = new AlertItemPage(page);
    await alertItemPage.drawer.waitFor({ state: 'visible' });

    // Verify the correct alert is loaded
    const headerText = await alertItemPage.drawerHeader.textContent();
    if (!headerText?.includes(alertTitle)) {
      throw new Error(`Expected alert title to contain "${alertTitle}", but got "${headerText}"`);
    }

    return alertItemPage;
  }

  async getAlertTitle(): Promise<string> {
    return await this.drawerHeader.textContent() || '';
  }

  async closeDrawer(): Promise<void> {
    await this.closeButton.click();
    await this.drawer.waitFor({ state: 'hidden' });
  }

  async isDrawerVisible(): Promise<boolean> {
    return await this.drawer.isVisible();
  }

  async getStatus(): Promise<string> {
    const statusButton = this.drawer.locator('button[id="alert-status"]');
    const statusText = await statusButton.locator('span').first().textContent();
    return statusText?.trim() || '';
  }

  async getSeverity(): Promise<string> {
    const severityButton = this.drawer.locator('button[id="alert-severity"]');
    const severityText = await severityButton.locator('span').first().textContent();
    return severityText?.trim() || '';
  }

  async getAssignee(): Promise<string> {
    const assigneeButton = this.drawer.locator('button[id="alert-assignee"]');
    const assigneeText = await assigneeButton.locator('span').first().textContent();
    return assigneeText?.trim() || '';
  }

  async changeStatus(status: AlertStatus): Promise<void> {
    const statusButton = this.drawer.locator('button[id="alert-status"]');
    await statusButton.click();
    await this.page.locator(`[role="option"]:has-text("${status}")`).click();
  }

  async changeAssignee(assignee: AlertAssignee): Promise<void> {
    const assigneeButton = this.drawer.locator('button[id="alert-assignee"]');
    await assigneeButton.click();
    await this.page.locator(`[role="option"]:has-text("${assignee}")`).click();
  }

  async expandRemediationSection(): Promise<void> {
    const remediationButton = this.drawer.locator('button[aria-controls="section-remediation"]');
    await remediationButton.click();
  }

  async addRemediationComment(comment: string): Promise<void> {
    const commentTextarea = this.drawer.locator('textarea[placeholder="Add a comment..."]');
    await commentTextarea.fill(comment);
  }
}