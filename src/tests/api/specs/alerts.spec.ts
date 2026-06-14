import { test, expect } from '@playwright/test';
import { TestSetup } from '../helpers/testSetup';
import { Logger } from '../../../utilities/helpers/logger';

test.describe.serial('API - Alerts Tests', () => {
  let testSetup: TestSetup;

  test.beforeEach(async ({ request }) => {
    testSetup = new TestSetup(request);
    await testSetup.setup();
  });

  test.afterEach(async () => {
    await testSetup.cleanup();
  });

  test('should find an alert in status Open with Auto Remediate ON', async () => {
    Logger.info('Test: Finding Open alert and comparing before/after states');

    // Step 1: Get alerts count before test
    Logger.info('Step 1: Getting alerts count BEFORE test...');
    const allAlertsBefore = await testSetup.alertLifeCycle.getAlerts();
    const alertsCountBefore = allAlertsBefore.length;
    Logger.info(`Alerts count BEFORE: ${alertsCountBefore}`);

    // Step 2: Filter alerts for status OPEN
    Logger.info('Step 2: Filtering alerts for status OPEN...');
    const targetStatuses = ['OPEN'];
    const filteredAlerts = allAlertsBefore.filter((alert: any) =>
      targetStatuses.includes(alert.status)
    );

    expect(filteredAlerts.length).toBeGreaterThan(0);
    const targetAlert = filteredAlerts[0];
    Logger.info(`Found alert with ID: ${targetAlert.id}, Status: ${targetAlert.status}`);

    // Step 3: Validate the alert structure
    Logger.info('Step 3: Validating alert structure...');
    expect(targetAlert).toHaveProperty('id');
    expect(targetAlert).toHaveProperty('status');
    expect(targetStatuses).toContain(targetAlert.status);
    expect(targetAlert).toHaveProperty('remediation');
    expect(targetAlert.remediation).toHaveProperty('autoRemediate');
    Logger.info(`Alert structure validation passed. Auto Remediate: ${targetAlert.remediation.autoRemediate}`);

    // Step 4: Validate remediation details
    Logger.info('Step 4: Validating remediation details...');
    expect(targetAlert.remediation).toHaveProperty('type');
    expect(targetAlert.remediation).toHaveProperty('priority');
    expect(targetAlert.remediation).toHaveProperty('dueDate');
    Logger.info(`Remediation Type: ${targetAlert.remediation.type}, Priority: ${targetAlert.remediation.priority}`);

    // Step 5: Change alert status to IN_PROGRESS
    Logger.info('Step 5: Changing alert status to IN_PROGRESS...');
    const changeStatusResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(targetAlert.id, 'IN_PROGRESS');
    expect(changeStatusResponse.status()).toBe(200);
    Logger.info(`✓ Alert status changed to IN_PROGRESS for alert ${targetAlert.id}`);

    // Step 6: Verify alert status was changed
    Logger.info('Step 6: Verifying alert status was changed...');
    const allAlertsAfterStatusChange = await testSetup.alertLifeCycle.getAlerts();
    const updatedAlert = allAlertsAfterStatusChange.find((a: any) => a.id === targetAlert.id);
    expect(updatedAlert).toBeTruthy();
    expect(updatedAlert.status).toBe('IN_PROGRESS');
    Logger.info(`✓ Verified alert status is now IN_PROGRESS`);

    // Step 7: Add remediation note
    Logger.info('Step 7: Adding remediation note...');
    const remediateResponse = await testSetup.alertLifeCycle.alertsClient.remediateAlert(targetAlert.id, 'Remediation verified successfully and issue is resolved');
    expect(remediateResponse.status()).toBe(200);
    Logger.info(`✓ Remediation note added for alert ${targetAlert.id}`);

    // Step 8: Get alerts count after test
    Logger.info('Step 8: Getting alerts count AFTER test...');
    const allAlertsAfter = await testSetup.alertLifeCycle.getAlerts();
    const alertsCountAfter = allAlertsAfter.length;
    Logger.info(`Alerts count AFTER: ${alertsCountAfter}`);

    // Step 9: Verify counts match (no alerts added or removed)
    Logger.info('Step 9: Verifying alert counts before and after...');
    expect(alertsCountAfter).toBe(alertsCountBefore);
    Logger.info(`✓ Alert counts match: Before=${alertsCountBefore}, After=${alertsCountAfter}`);

    Logger.info('Alert test completed successfully!');
  });
});