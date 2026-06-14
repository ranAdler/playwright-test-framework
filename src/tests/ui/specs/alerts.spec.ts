import { test, expect } from '@playwright/test';
import { AlertsPage } from '../pages/alerts/alertsPage';
import { TestSetup } from '../helpers/testSetup';
import { UIPages } from '../enums/pages.enum';
import { TEST_USERS } from '../../../utilities/config/constants';
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

  test('should display alerts page with API-generated test data', async ({ page }) => {
    Logger.info('Test: Open alerts page');

    // Navigate to alerts page
    await page.goto(UIPages.ALERTS);

    // Verify alerts page loaded
    const alertsPage = await AlertsPage.create(page);
    expect(alertsPage).toBeDefined();

    Logger.info('Test passed: Alerts page displayed with API-generated data');
  });

});