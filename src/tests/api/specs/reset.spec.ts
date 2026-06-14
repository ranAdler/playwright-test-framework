import { test, expect } from '@playwright/test';
import { LoginClient } from '../endpoints/loginClient';
import { ResetClient } from '../endpoints/resetClient';
import { AlertsClient } from '../endpoints/alertsClient';
import { ScanClient } from '../endpoints/scanClient';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';

// Note: API has rate limiting of 10 requests per 900 seconds for login endpoint
// If you see 429 errors, wait ~3-4 minutes before running tests again

test.describe.serial('API - Reset Data Tests', () => {
  test('should reset data and validate alerts count before and after scan', async ({
    request,
  }) => {
    Logger.info('Starting reset data test with alerts validation');

    const loginClient = new LoginClient(request);
    const resetClient = new ResetClient(request);
    const alertsClient = new AlertsClient(request);
    const scanClient = new ScanClient(request);

    // Step 1: Login to get token
    Logger.info('Step 1: Logging in...');
    const loginResponse = await loginClient.login(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(loginBody).toHaveProperty('token');

    const token = loginBody.token;
    Logger.info(`Successfully obtained token: ${token.substring(0, 20)}...`);

    // Set token for all clients
    resetClient.setAuthToken(token);
    alertsClient.setAuthToken(token);
    scanClient.setAuthToken(token);

    // Step 2: Reset data
    Logger.info('Step 2: Resetting data...');
    const resetResponse = await resetClient.reset();
    expect(resetResponse.status()).toBe(200);
    Logger.info('Data reset successfully');

    // Step 3: Validate alerts count after reset is 0
    Logger.info('Step 3: Validating alerts after reset...');
    const alertsCountAfterReset = await alertsClient.getAlertsCount();
    Logger.info(`Alerts count after reset: ${alertsCountAfterReset}`);
    expect(alertsCountAfterReset).toBe(0);

    // Step 4: Create a new scan
    Logger.info('Step 4: Creating a new scan...');
    const scanResponse = await scanClient.createScan({});
    expect(scanResponse.status()).toBe(201);
    const scanBody = await scanResponse.json();
    Logger.info(`Scan created with ID: ${scanBody.id || 'unknown'}`);

    // Step 5: Wait for scan to complete
    Logger.info('Step 5: Waiting for scan to complete...');
    const completedScan = await scanClient.waitForScanCompletion();
    Logger.info(`Scan completed with status: ${completedScan.status}`);

    // Step 6: Validate alerts count after scan is 8
    Logger.info('Step 6: Validating alerts after scan...');
    const alertsCountAfterScan = await alertsClient.getAlertsCount();
    Logger.info(`Alerts count after scan: ${alertsCountAfterScan}`);
    expect(alertsCountAfterScan).toBe(8);

    Logger.info('All validations passed!');
  });

});