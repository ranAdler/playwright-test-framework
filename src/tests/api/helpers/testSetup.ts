import { APIRequestContext } from '@playwright/test';
import { AlertLifeCycle } from './alertLifeCycle';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';

export class TestSetup {
  public alertLifeCycle: AlertLifeCycle;

  constructor(request: APIRequestContext) {
    this.alertLifeCycle = new AlertLifeCycle(request);
  }

  /**
   * Setup: Initialize AlertLifeCycle with API login and scan
   * Call this in test.beforeEach
   */
  async setup(): Promise<void> {
    Logger.info('TestSetup: Setting up - API calls only');

    // Setup: Login via API
    await this.alertLifeCycle.setup(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );
    Logger.info('TestSetup: Login complete');

    // Create a scan via API
    await this.alertLifeCycle.scan();
    Logger.info('TestSetup: Scan complete');

    // Verify alerts were created
    const alertsCount = await this.alertLifeCycle.getAlertsCount();
    Logger.info(`TestSetup: Alerts created: ${alertsCount}`);
  }

  /**
   * Cleanup: Reset all data via API
   * Call this in test.afterEach
   */
  async cleanup(): Promise<void> {
    Logger.info('TestSetup: Running cleanup');

    // Reset data via API
    await this.alertLifeCycle.cleanup();
    Logger.info('TestSetup: Cleanup complete');
  }
}