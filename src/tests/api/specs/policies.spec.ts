import { test, expect } from '../../fixtures/testSetupFixture';
import { Logger } from '../../../utilities/helpers/logger';
import { autoRemediatePolicyPayload } from '../resources/autoRemediatePolicyPayload';

test.describe.serial('API - Auto Remediate Policy Tests', () => {
  test('should find alert with OPEN/REMEDIATION_IN_PROGRESS status and AutoRemediate ON', async ({ testSetup }) => {
    Logger.info('TEST: Find Alert with OPEN/REMEDIATION_IN_PROGRESS Status and AutoRemediate ON');

    Logger.info('Step 1: Creating policy with autoRemediate: true...');
    const createdPolicy = await testSetup.policyLifeCycle.createPolicy(autoRemediatePolicyPayload);
    Logger.info(`✓ Policy created with ID: ${createdPolicy.id}`);

    Logger.info('Step 2: Starting scan...');
    await testSetup.policyLifeCycle.scan();
    Logger.info('✓ Scan completed');

    Logger.info('Step 3: Retrieving alerts...');
    const alerts = await testSetup.policyLifeCycle.getAlerts();
    Logger.info(`Total alerts found: ${alerts.length}`);
    expect(alerts.length).toBeGreaterThan(0);

    Logger.info('Step 4: Finding alert with OPEN/REMEDIATION_IN_PROGRESS status and AutoRemediate ON...');
    const targetAlert = alerts.find((alert: any) =>
      (alert.status === 'OPEN' || alert.status === 'REMEDIATION_IN_PROGRESS') &&
      alert.policySnapshot?.autoRemediate === true
    );

    expect(targetAlert).toBeTruthy();
    Logger.info(`✓ Alert found with ID: ${targetAlert.id}, Status: ${targetAlert.status}, Policy: ${targetAlert.policyName}, AutoRemediate: ${targetAlert.policySnapshot?.autoRemediate}`);

    Logger.info('Test completed successfully!');
  });
});