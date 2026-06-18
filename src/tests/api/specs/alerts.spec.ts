import { test, expect } from '../../fixtures/testSetupFixture';
import { Logger } from '../../../utilities/helpers/logger';
import { AlertStatus } from '../enums/alertStatus.enum';
import { alertRemediationPolicyPayload } from '../resources/alertRemediationPolicyPayload';
import { AlertStatusWaiter } from '../helpers/alertStatusWaiter';
import { extractAlertDetails, findRedetectedAlert } from '../helpers/alertHelper';
import { TIMEOUTS, TEST_DATA } from '../../../utilities/config/constants';

test.describe.serial('API - Alerts Tests', () => {

  test('Alert Life Cycle: Auto-Remediation + Rescan Verification', async ({ testSetup }) => {
    Logger.info('TEST: Alert Life Cycle - Auto-Remediation + Rescan Verification');
    Logger.info('NOTE: Verifies that remediated alerts are not re-detected after rescan');

    // Step 0: Create a policy with autoRemediate: false to get OPEN status alerts
    Logger.info('Step 0: Creating test policy with autoRemediate: true for testable alerts...');
    const createdPolicy = await testSetup.policyLifeCycle.createPolicy(alertRemediationPolicyPayload);
    Logger.info(`✓ Policy created with ID: ${createdPolicy.id}, autoRemediate: true`);

    // Step 0b: Run a scan to generate alerts
    Logger.info('Step 0b: Running scan to generate OPEN status alerts...');
    await testSetup.policyLifeCycle.scan();
    Logger.info(`✓ Scan completed`);

    // Step 1: Get all alerts
    Logger.info('Step 1: Retrieving all alerts from system...');
    const allAlerts = await testSetup.alertLifeCycle.getAlerts();
    Logger.info(`✓ Total alerts in system: ${allAlerts.length}`);
    expect(allAlerts.length).toBeGreaterThan(0);

    // Step 2: Find an alert with OPEN or REMEDIATION_IN_PROGRESS status
    Logger.info('Step 2: Finding alert with status "OPEN" or "REMEDIATION_IN_PROGRESS"...');
    const remediableAlerts = allAlerts.filter((alert: any) =>
      alert.status === 'OPEN' || alert.status === 'REMEDIATION_IN_PROGRESS'
    );
    Logger.info(`Found ${remediableAlerts.length} remediable status alerts`);
    expect(remediableAlerts.length).toBeGreaterThan(0);

    const targetAlert = remediableAlerts[0];
    Logger.info(`✓ Found target alert: ID=${targetAlert.id}, Status=${targetAlert.status}, Policy=${targetAlert.policyName}`);


    // Save the original alert details for verification after rescan
    Logger.info('Step 3: Saving original alert details for post-rescan verification...');
    const originalAlertDetails = extractAlertDetails(targetAlert);
    Logger.info(`✓ Saved alert details: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);

    // Step 4: Change alert status to IN_PROGRESS (first step)
    Logger.info('Step 4: Changing alert status OPEN → IN_PROGRESS...');
    await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(originalAlertDetails.id, AlertStatus.IN_PROGRESS);
    Logger.info(`✓ Status changed to IN_PROGRESS for alert ${originalAlertDetails.id}`);

    Logger.info('Step 4b: Assigning alert to remediation owner...');
    await testSetup.alertLifeCycle.alertsClient.assignAlert(originalAlertDetails.id, TEST_DATA.ANALYSTS.REMEDIATION_OWNER);
    Logger.info(`✓ Alert assigned to ${TEST_DATA.ANALYSTS.REMEDIATION_OWNER}`);

    Logger.info('Step 5: Adding remediation verification comment...');
    await testSetup.alertLifeCycle.alertsClient.addRemediationNote(originalAlertDetails.id, 'Remediation verified successfully and issue is resolved');
    Logger.info(`✓ Note added: "Remediation verified successfully and issue is resolved"`);


    // Wait for remediation to complete before checking status change
    const statusWaiter = new AlertStatusWaiter();
    const waitResult = await statusWaiter.waitForAlertStatus(
      originalAlertDetails.id,
      () => testSetup.alertLifeCycle.getAlerts(),
      TIMEOUTS.SCAN_WAIT,  // Initial wait for remediation (130 seconds)
      500,                 // Check every 500ms
      TIMEOUTS.LONG        // Polling timeout (30 seconds)
    );

    // Step 6: Change alert status to RESOLVED (final step)
    Logger.info('Step 6: Changing alert status IN_PROGRESS → RESOLVED...');
    await testSetup.alertLifeCycle.alertsClient.changeAlertStatus(
        originalAlertDetails.id,
        AlertStatus.RESOLVED
    );
    Logger.info(`✓ Status changed to RESOLVED for alert ${originalAlertDetails.id}`);

    Logger.info(`✓ Status change detected. New status: "${waitResult.targetStatus}".`);


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
    const redetectedAlert = findRedetectedAlert(alertsAfterRescan, originalAlertDetails);

    if (redetectedAlert) {
      Logger.error(`❌ Identical alert was re-detected! ID=${redetectedAlert.id}`);
      Logger.error(`Original: ID=${originalAlertDetails.id}, Policy=${originalAlertDetails.policyId}, Asset=${originalAlertDetails.assetId}, ViolationType=${originalAlertDetails.violationType}`);
    } else {
      Logger.info(`✓ Identical alert was NOT re-detected - remediation was effective`);
    }

    expect(redetectedAlert).toBeFalsy();
  });
});