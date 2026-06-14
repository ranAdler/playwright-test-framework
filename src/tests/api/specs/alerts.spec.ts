import { test, expect } from '../../fixtures/testSetupFixture';
import { Logger } from '../../../utilities/helpers/logger';
import { AlertStatus } from '../enums/alertStatus.enum';

test.describe.serial('API - Alerts Tests', () => {
  // test('Alert Management: Status Change & Remediation', async ({ testSetup }) => {
  //   Logger.info('Test: Alert Management - Status Change & Remediation');
  //
  //   // Step 1: Get alerts count before test
  //   Logger.info('Step 1: Getting alerts count BEFORE test...');
  //   const allAlertsBefore = await testSetup.alertLifeCycle.getAlerts();
  //   const alertsCountBefore = allAlertsBefore.length;
  //   Logger.info(`Alerts count BEFORE: ${alertsCountBefore}`);
  //
  //   // Step 2: Filter alerts for status OPEN
  //   Logger.info('Step 2: Filtering alerts for status OPEN...');
  //   const targetStatuses = [AlertStatus.OPEN];
  //   const filteredAlerts = allAlertsBefore.filter((alert: any) =>
  //     targetStatuses.includes(alert.status)
  //   );
  //
  //   expect(filteredAlerts.length).toBeGreaterThan(0);
  //   const targetAlert = filteredAlerts[0];
  //   Logger.info(`Found alert with ID: ${targetAlert.id}, Status: ${targetAlert.status}`);
  //
  //   // Step 3: Validate the alert structure
  //   Logger.info('Step 3: Validating alert structure...');
  //   expect(targetAlert).toHaveProperty('id');
  //   expect(targetAlert).toHaveProperty('status');
  //   expect(targetStatuses).toContain(targetAlert.status);
  //   expect(targetAlert).toHaveProperty('remediation');
  //   expect(targetAlert.remediation).toHaveProperty('autoRemediate');
  //   Logger.info(`Alert structure validation passed. Auto Remediate: ${targetAlert.remediation.autoRemediate}`);
  //
  //   // Step 4: Validate remediation details
  //   Logger.info('Step 4: Validating remediation details...');
  //   expect(targetAlert.remediation).toHaveProperty('type');
  //   expect(targetAlert.remediation).toHaveProperty('priority');
  //   expect(targetAlert.remediation).toHaveProperty('dueDate');
  //   Logger.info(`Remediation Type: ${targetAlert.remediation.type}, Priority: ${targetAlert.remediation.priority}`);
  //
  //   // Step 5: Change alert status to IN_PROGRESS
  //   Logger.info('Step 5: Changing alert status to IN_PROGRESS...');
  //   const changeStatusResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(targetAlert.id, AlertStatus.IN_PROGRESS);
  //   expect(changeStatusResponse.status()).toBe(200);
  //   Logger.info(`✓ Alert status changed to IN_PROGRESS for alert ${targetAlert.id}`);
  //
  //   // Step 6: Verify alert status was changed
  //   Logger.info('Step 6: Verifying alert status was changed...');
  //   const allAlertsAfterStatusChange = await testSetup.alertLifeCycle.getAlerts();
  //   const updatedAlert = allAlertsAfterStatusChange.find((a: any) => a.id === targetAlert.id);
  //   expect(updatedAlert).toBeTruthy();
  //   expect(updatedAlert.status).toBe('IN_PROGRESS');
  //   Logger.info(`✓ Verified alert status is now IN_PROGRESS`);
  //
  //   // Step 7: Add remediation note
  //   Logger.info('Step 7: Adding remediation note...');
  //   const remediateResponse = await testSetup.alertLifeCycle.alertsClient.remediateAlert(targetAlert.id, 'Remediation verified successfully and issue is resolved');
  //   expect(remediateResponse.status()).toBe(200);
  //   Logger.info(`✓ Remediation note added for alert ${targetAlert.id}`);
  //
  //   // Step 8: Get alerts count after test
  //   Logger.info('Step 8: Getting alerts count AFTER test...');
  //   const allAlertsAfter = await testSetup.alertLifeCycle.getAlerts();
  //   const alertsCountAfter = allAlertsAfter.length;
  //   Logger.info(`Alerts count AFTER: ${alertsCountAfter}`);
  //
  //   // Step 9: Verify counts match (no alerts added or removed)
  //   Logger.info('Step 9: Verifying alert counts before and after...');
  //   expect(alertsCountAfter).toBe(alertsCountBefore);
  //   Logger.info(`✓ Alert counts match: Before=${alertsCountBefore}, After=${alertsCountAfter}`);
  //
  //   Logger.info('Alert test completed successfully!');
  // });

  test('Alert Life Cycle: Auto-Remediation + Rescan Verification', async ({ testSetup }) => {
    Logger.info('TEST: Alert Life Cycle - Auto-Remediation + Rescan Verification');
    Logger.info('NOTE: This test is EXPECTED TO FAIL due to known data issue - demonstrates remediation was not effective');

    const allAlerts = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`Total alerts in system: ${allAlerts.length}`);

    const remediableAlerts = allAlerts.filter((alert: any) =>
      alert.remediation?.autoRemediate === false && alert.status === 'OPEN'
    );
    expect(remediableAlerts.length).toBeGreaterThan(0);

    const targetAlert = remediableAlerts[0];
    Logger.info(`Target alert: ID=${targetAlert.id}, Status=${targetAlert.status}, AutoRemediate=${targetAlert.remediation.autoRemediate}`);

    // Save the original alert details before making any changes
    Logger.info('Saving original alert details before changes...');
    const originalAlertDetails = {
      id: targetAlert.id,
      policyId: targetAlert.policyId,
      assetId: targetAlert.assetId,
      violationType: targetAlert.violationType,
      status: targetAlert.status
    };
    Logger.info(`✓ Saved alert details: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);

    // Change status to IN_PROGRESS
    Logger.info('Changing alert status to IN_PROGRESS...');
    const statusResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(originalAlertDetails.id, AlertStatus.IN_PROGRESS);
    expect(statusResponse.status()).toBe(200);
    Logger.info(`✓ Status changed to IN_PROGRESS for alert ${originalAlertDetails.id}`);

    // Add remediation verification comment
    Logger.info('Adding remediation verification comment...');
    const commentResponse = await testSetup.alertLifeCycle.alertsClient.addRemediationNote(originalAlertDetails.id, 'Remediation verified successfully and issue is resolved');
    expect(commentResponse.status()).toBe(200);
    Logger.info(`✓ Note added: "Remediation verified successfully and issue is resolved"`);

    // Start scan to verify remediation
    Logger.info('Starting rescan to verify remediation...');
    await testSetup.alertLifeCycle.scan();
    Logger.info(`✓ Rescan completed`);

    // Get alerts after scan
    const alertsAfterRescan = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`Total alerts after rescan: ${alertsAfterRescan.length}`);

    // Verify the original alert is NOT re-detected
    Logger.info('Verifying the original alert is NOT re-detected...');
    const redetectedAlert = alertsAfterRescan.find((alert: any) =>
      alert.policyId === originalAlertDetails.policyId &&
      alert.assetId === originalAlertDetails.assetId &&
      alert.violationType === originalAlertDetails.violationType &&
      alert.id !== originalAlertDetails.id &&
      alert.status === 'OPEN'
    );

    Logger.info(`Original alert details: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);

    if (redetectedAlert) {
      Logger.error(`❌ EXPECTED FAILURE: Original alert was re-detected! ID=${redetectedAlert.id}`);
      Logger.info(`This means remediation did NOT work - the same issue was detected again by rescan`);
    } else {
      Logger.info(`✓ Original alert was NOT re-detected - remediation was effective`);
    }

    expect(redetectedAlert).toBeFalsy();
  });
});