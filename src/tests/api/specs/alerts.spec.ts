import { test, expect } from '../../fixtures/testSetupFixture';
import { Logger } from '../../../utilities/helpers/logger';
import { AlertStatus } from '../enums/alertStatus.enum';
import { alertRemediationPolicyPayload } from '../resources/alertRemediationPolicyPayload';

test.describe.serial('API - Alerts Tests', () => {

  test('Alert Life Cycle: Auto-Remediation + Rescan Verification', async ({ testSetup }) => {
    Logger.info('TEST: Alert Life Cycle - Auto-Remediation + Rescan Verification');
    Logger.info('NOTE: This test is EXPECTED TO FAIL - demonstrates remediation was not effective');

    // Step 0: Create a policy with autoRemediate: false to get OPEN status alerts
    Logger.info('Step 0: Creating test policy with autoRemediate: false for testable alerts...');
    const createdPolicy = await testSetup.policyLifeCycle.createPolicy(alertRemediationPolicyPayload);
    Logger.info(`✓ Policy created with ID: ${createdPolicy.id}, autoRemediate: false`);

    // Step 0b: Run a scan to generate alerts
    Logger.info('Step 0b: Running scan to generate OPEN status alerts...');
    await testSetup.policyLifeCycle.scan();
    Logger.info(`✓ Scan completed`);

    // Step 1: Get all alerts
    Logger.info('Step 1: Retrieving all alerts from system...');
    const allAlerts = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`✓ Total alerts in system: ${allAlerts.length}`);
    expect(allAlerts.length).toBeGreaterThan(0);

    // Step 2: Find an alert with OPEN status
    Logger.info('Step 2: Finding alert with status "OPEN"...');
    const openAlerts = allAlerts.filter((alert: any) => alert.status === 'OPEN');
    Logger.info(`Found ${openAlerts.length} OPEN status alerts`);
    expect(openAlerts.length).toBeGreaterThan(0);

    const targetAlert = openAlerts[0];
    Logger.info(`✓ Found target alert: ID=${targetAlert.id}, Status=${targetAlert.status}, Policy=${targetAlert.policyName}`);

    // Save the original alert details for verification after rescan
    Logger.info('Step 3: Saving original alert details for post-rescan verification...');
    const originalAlertDetails = {
      id: targetAlert.id,
      policyId: targetAlert.policyId,
      policyName: targetAlert.policyName,
      assetId: targetAlert.assetId,
      violationType: targetAlert.violationType,
      status: targetAlert.status
    };
    Logger.info(`✓ Saved alert details: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);

    // Step 4: Change alert status to IN_PROGRESS (first step)
    Logger.info('Step 4: Changing alert status OPEN → IN_PROGRESS...');
    const toInProgressResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(
      originalAlertDetails.id,
      AlertStatus.IN_PROGRESS
    );
    expect(toInProgressResponse.status()).toBe(200);
    Logger.info(`✓ Status changed to IN_PROGRESS for alert ${originalAlertDetails.id}`);

    // Step 5: Add remediation verification comment (TODO: Handle comment logic separately)
    // NOTE: addRemediationNote() auto-triggers REMEDIATION_IN_PROGRESS status which blocks RESOLVED transition
    // This will be handled later with alternative comment endpoint
    Logger.info('Step 5: Comment "Remediation verified successfully and issue is resolved" - TODO: Handle separately');

    // Step 6: Change alert status to RESOLVED (final step)
    Logger.info('Step 6: Changing alert status IN_PROGRESS → RESOLVED...');
    const toResolvedResponse = await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(
      originalAlertDetails.id,
      AlertStatus.RESOLVED
    );
    expect(toResolvedResponse.status()).toBe(200);
    Logger.info(`✓ Status changed to RESOLVED for alert ${originalAlertDetails.id}`);

    // Step 7: Start another scan to check if identical alert is re-detected
    Logger.info('Step 7: Starting rescan to verify remediation effectiveness...');
    await testSetup.alertLifeCycle.scan();
    Logger.info(`✓ Rescan completed`);

    // Step 8: Get alerts after rescan
    Logger.info('Step 8: Retrieving alerts after rescan...');
    const alertsAfterRescan = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`✓ Total alerts after rescan: ${alertsAfterRescan.length}`);

    // Step 9: Verify that no identical alert to the remediated alert was created
    Logger.info('Step 9: Verifying identical alert was NOT re-detected by rescan...');
    const redetectedAlert = alertsAfterRescan.find((alert: any) =>
      alert.policyId === originalAlertDetails.policyId &&
      alert.assetId === originalAlertDetails.assetId &&
      alert.violationType === originalAlertDetails.violationType &&
      alert.id !== originalAlertDetails.id &&
      (alert.status === 'OPEN' || alert.status === 'REMEDIATION_IN_PROGRESS')
    );

    if (redetectedAlert) {
      Logger.error(`❌ Identical alert was re-detected! ID=${redetectedAlert.id}`);
      Logger.error(`Original: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);
    } else {
      Logger.info(`✓ Identical alert was NOT re-detected - remediation was effective`);
    }

    expect(redetectedAlert).toBeFalsy();
  });
});