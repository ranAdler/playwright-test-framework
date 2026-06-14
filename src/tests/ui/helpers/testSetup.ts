import { APIRequestContext, Page } from '@playwright/test';
import { AlertLifeCycle } from '../../api/helpers/alertLifeCycle';
import { LoginPage } from '../pages/loginPage';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';

export class TestSetup {
  public alertLifeCycle: AlertLifeCycle;
  private page: Page | null = null;
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.alertLifeCycle = new AlertLifeCycle(request);
  }

  /**
   * Setup: Initialize AlertLifeCycle with API login and scan
   * Call this in test.beforeEach
   */
  async setup(): Promise<void> {
    Logger.info('AlertTestSetup: Setting up - API calls only');

    // Setup: Login via API
    await this.alertLifeCycle.setup(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );
    Logger.info('AlertTestSetup: Login complete');

    // Create a scan via API
    await this.alertLifeCycle.scan();
    Logger.info('AlertTestSetup: Scan complete');

    // Verify alerts were created
    const alertsCount = await this.alertLifeCycle.getAlertsCount();
    Logger.info(`AlertTestSetup: Alerts created: ${alertsCount}`);
  }

  /**
   * Login via UI (required since app uses session-based auth)
   * This ensures the browser has a valid session
   */
  async loginViaUI(page: Page, username: string, password: string): Promise<void> {
    this.page = page;
    Logger.info('TestSetup: Logging in via UI');

    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.setUser(username);
    await loginPage.setPassword(password);
    const navigatePage = await loginPage.login();

    if (!navigatePage) {
      throw new Error('UI login failed - NavigatePage not created');
    }

    Logger.info('TestSetup: UI login successful');
  }

  /**
   * Cleanup: Reset all data via API and clear browser auth token
   * Call this in test.afterEach
   */
  async cleanup(): Promise<void> {
    Logger.info('AlertTestSetup: Running cleanup');

    // Clear auth token from browser (only if page is properly loaded)
    if (this.page) {
      try {
        await this.page.evaluate(() => {
          localStorage.removeItem('authToken');
        });
        Logger.info('AlertTestSetup: Auth token removed from localStorage');
      } catch (error) {
        Logger.info('AlertTestSetup: Could not access localStorage (page may not be loaded)');
      }
    }

    // Reset data via API
    await this.alertLifeCycle.cleanup();
    Logger.info('AlertTestSetup: Cleanup complete');
  }
}