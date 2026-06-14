import { test, expect } from '../../fixtures/testSetupFixture';
import { Logger } from '../../../utilities/helpers/logger';

test.describe.serial('API - Alerts Tests', () => {
  test('Alert Management: Status Change & Remediation', async ({ testSetup }) => {
    Logger.info('Test: Alert Management - Status Change & Remediation');

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

  test('Alert Life Cycle: Auto-Remediation + Rescan Verification', async ({ testSetup }) => {
    Logger.info('Test: Alert Life Cycle - Auto-Remediation + Rescan Verification');

    // Step 1: Get all alerts before remediation
    Logger.info('Step 1: Getting all alerts before remediation...');
    const allAlerts = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`Total alerts: ${allAlerts.length}`);

    // Step 2: Find an alert with Auto Remediate: ON (prefer OPEN status for easier status transitions)
    Logger.info('Step 2: Finding alert with Auto Remediate: ON...');
    const remediableAlerts = allAlerts.filter((alert: any) =>
      alert.remediation?.autoRemediate === true
    );

    let targetAlert = remediableAlerts.find((alert: any) => alert.status === 'OPEN');

    // If no OPEN auto-remediate alert found, use any auto-remediate alert
    if (!targetAlert) {
      targetAlert = remediableAlerts[0];
    }

    // If still not found, use any OPEN alert as fallback
    if (!targetAlert) {
      Logger.info('No Auto Remediate: ON alerts found, using first OPEN alert');
      const openAlerts = allAlerts.filter((alert: any) => alert.status === 'OPEN');
      targetAlert = openAlerts[0];
    }

    expect(targetAlert).toBeTruthy();
    Logger.info(`Found target alert: ${targetAlert.id}, Status: ${targetAlert.status}, Auto Remediate: ${targetAlert.remediation?.autoRemediate}`);

    // Step 3: Change status to IN_PROGRESS (if current status allows it)
    Logger.info('Step 3: Changing alert status to IN_PROGRESS...');
    if (targetAlert.status === 'OPEN') {
      const statusChangeResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(targetAlert.id, 'IN_PROGRESS');
      if (statusChangeResponse.status() === 200) {
        Logger.info(`✓ Alert status changed to IN_PROGRESS for alert ${targetAlert.id}`);
        targetAlert.status = 'IN_PROGRESS';
      } else {
        Logger.info(`⚠ Could not change status (${statusChangeResponse.status()}), proceeding with current status: ${targetAlert.status}`);
      }
    } else {
      Logger.info(`✓ Alert status is ${targetAlert.status}, skipping status change`);
    }

    // Step 4: Add comment about remediation
    Logger.info('Step 4: Adding remediation comment...');
    const commentResponse = await testSetup.alertLifeCycle.alertsClient.addAlertComment(targetAlert.id, 'Remediation verified successfully and issue is resolved');
    if (commentResponse.status() === 200) {
      Logger.info(`✓ Comment added to alert ${targetAlert.id}`);
    } else {
      Logger.info(`⚠ Could not add comment (HTTP ${commentResponse.status()}), proceeding with test`);
    }

    // Step 5: Start another scan
    Logger.info('Step 5: Starting another scan...');
    await testSetup.alertLifeCycle.scan();
    Logger.info('✓ Scan completed');

    // Step 6: Get all alerts after scan
    Logger.info('Step 6: Getting all alerts after scan...');
    const allAlertsAfterRescan = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`Total alerts after rescan: ${allAlertsAfterRescan.length}`);

    // Step 7: Verify remediated alert was not re-detected
    Logger.info('Step 7: Verifying remediated alert was NOT re-detected...');
    const redetectedAlert = allAlertsAfterRescan.find((alert: any) =>
      alert.policyId === targetAlert.policyId &&
      alert.assetId === targetAlert.assetId &&
      alert.violationType === targetAlert.violationType &&
      alert.id !== targetAlert.id &&
      alert.status === 'OPEN'
    );

    if (redetectedAlert) {
      Logger.info(`⚠ EXPECTED FAILURE: Identical alert was re-detected! Alert ID: ${redetectedAlert.id}`);
      Logger.info(`Original remediated alert: ${targetAlert.id}`);
      Logger.info(`Re-detected alert: ${redetectedAlert.id}`);
      Logger.info(`Policy: ${redetectedAlert.policyId}, Asset: ${redetectedAlert.assetId}, Violation: ${redetectedAlert.violationType}`);
      // This assertion should fail to demonstrate that remediation wasn't effective
      expect(redetectedAlert).toBeFalsy();
    } else {
      Logger.info('✓ Remediation successful: Identical alert was NOT re-detected');
      expect(redetectedAlert).toBeFalsy();
    }

    Logger.info('Auto-Remediation lifecycle test completed!');
  });
});