import { test, expect } from '@playwright/test';
import { AlertsPage } from '../pages/alerts/alertsPage';
import { TestSetup } from '../helpers/testSetup';
import { UIPages } from '../enums/pages.enum';
import { AlertStatus } from '../enums/alertStatus.enum';
import { AutoRemediateStatus } from '../enums/autoRemediateStatus.enum';
import { Logger } from '../../../utilities/helpers/logger';

test.describe('UI - Alerts Tests with Alert Life Cycle', () => {
  let testSetup: TestSetup;

  test.beforeEach(async ({ request, page }) => {
    testSetup = new TestSetup(request);
    await testSetup.setup();
    await testSetup.loginViaApi(page);
  });


  test.afterEach(async () => {
    await testSetup.cleanup();
  });
  

  test('Alert Life Cycle', async ({ page }) => {
    Logger.info('Test: Alert Life Cycle');

    // Navigate to alerts page
    await page.goto(UIPages.ALERTS);

    // Create alerts page instance
    const alertsPage = await AlertsPage.create(page);

    // Select status filter (verification happens inside selectStatus method)
    await alertsPage.selectStatus(AlertStatus.OPEN);
    Logger.info(`Selected status: ${AlertStatus.OPEN}`);

    // Verify filter badge is visible
    const isBadgeVisible = await alertsPage.isFilterBadgeVisible(AlertStatus.OPEN);
    expect(isBadgeVisible).toBe(true);
    Logger.info(`Filter badge is visible: Status: ${AlertStatus.OPEN}`);

    // Select auto remediate status (verification happens inside selectAutoRemediateStatus method)
    await alertsPage.selectAutoRemediateStatus(AutoRemediateStatus.OFF);
    Logger.info(`Selected auto remediate status: ${AutoRemediateStatus.OFF}`);

    // Verify the auto remediate status was selected
    const selectedStatus = await alertsPage.getSelectedAutoRemediateStatus();
    expect(selectedStatus).toBe(AutoRemediateStatus.OFF);

    

    Logger.info('Test passed: Alerts filtered by status successfully');
  });



});