import { test, expect } from '../../fixtures/testSetupFixture';
import { AlertsPage } from '../pages/alerts/alertsPage';
import { UIPages } from '../enums/pages.enum';
import { AlertStatus } from '../enums/alertStatus.enum';
import { AlertAssignee } from '../enums/alertAssignee.enum';
import { AutoRemediateStatus } from '../enums/autoRemediateStatus.enum';
import { Logger } from '../../../utilities/helpers/logger';

test.describe('UI - Alerts Tests with Alert Life Cycle', () => {
  

  test('Alert Life Cycle', async ({ testSetup, page }) => {
    Logger.info('Test: Alert Life Cycle');

    // Login via API using fixture setup
    await testSetup.loginViaApi(page);

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

    // Verify total alerts count from UI
    const totalAlertsCount = await alertsPage.getTotalAlertsCount();
    Logger.info(`Total alerts from UI: ${totalAlertsCount}`);
    expect(totalAlertsCount).toBe(6);
    //TODO do we want to verify in Other places as well ? do we have other test that doing it ?

    const firstAlertTitle = await alertsPage.getFirstAlertTitle();
    Logger.info(`First alert title: ${firstAlertTitle}`);
    expect(firstAlertTitle).toContain('Detected');

    // Click the first alert to open the details drawer
    const alertItemPage = await alertsPage.clickFirstAlert();
    Logger.info('Alert details drawer opened');

    // Change alert status to In Progress
    await alertItemPage.changeStatus(AlertStatus.IN_PROGRESS);
    Logger.info(`Changed alert status to ${AlertStatus.IN_PROGRESS}`);

    // Change assignee to Security Analyst
    await alertItemPage.changeAssignee(AlertAssignee.SECURITY_ANALYST);
    Logger.info(`Changed assignee to ${AlertAssignee.SECURITY_ANALYST}`);

    // Expand remediation section
    await alertItemPage.expandRemediationSection();
    Logger.info('Expanded remediation section');

    // Add remediation comment
    await alertItemPage.addRemediationComment('Remediation verified successfully and issue is resolved');
    Logger.info('Added remediation comment');

    const totalAlertsCountAfterFilter = await alertsPage.getTotalAlertsCount();
    Logger.info(`Total alerts from UI after filter: ${totalAlertsCountAfterFilter}`);
    expect(totalAlertsCountAfterFilter).toBe(5);

    Logger.info('Test passed: Alerts filtered by status successfully');
  });



});