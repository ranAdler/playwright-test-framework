import { test, expect } from '@playwright/test';
import { LoginClient } from '../endpoints/loginClient';
import { ScanClient } from '../endpoints/scanClient';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';
import config from '../../../utilities/config/env';

// Run sequentially with reset tests to avoid login rate limiting
test.describe.serial('API - Scan Tests', () => {
  let scanClient: ScanClient;
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    Logger.info('Logging in to get authentication token');
    const loginClient = new LoginClient(request, config.apiBaseURL);
    const loginResponse = await loginClient.login(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );

    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    authToken = loginBody.token;
    Logger.info('Authentication successful');

    scanClient = new ScanClient(request, config.apiBaseURL);
    scanClient.setAuthToken(authToken);
  });

  test('should create a scan, wait for completion, and verify status', async () => {
    Logger.info('Creating a new scan');
    const scanData = {
      name: 'Test Scan',
      description: 'A test scan for verification',
    };

    const createResponse = await scanClient.createScan(scanData);
    expect(createResponse.status()).toBeLessThanOrEqual(201);
    const createdScan = await createResponse.json();
    Logger.info(`Scan created with ID: ${createdScan.id}`);

    Logger.info('Waiting for scan to complete');
    const completedScan = await scanClient.waitForScanCompletion();
    expect(completedScan).toBeTruthy();
    expect(completedScan.status?.toUpperCase()).toMatch(/COMPLETED|SUCCESS/);
    Logger.info(`Scan completed with status: ${completedScan.status}`);

    Logger.info('Verifying scan status');
    const getResponse = await scanClient.getScans();
    expect(getResponse.status()).toBe(200);
    const scans = await getResponse.json();
    expect(Array.isArray(scans)).toBeTruthy();
    expect(scans.length).toBeGreaterThan(0);
    Logger.info('Scan verification complete');
  });
});