import { APIRequestContext, Page } from '@playwright/test';
import { AlertLifeCycle } from '../../api/helpers/alertLifeCycle';
import { PolicyLifeCycle } from '../../api/helpers/policyLifeCycle';
import { LoginPage } from '../pages/loginPage';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';
import config from '../../../utilities/config/env';

export class TestSetup {
  public alertLifeCycle: AlertLifeCycle;
  public policyLifeCycle: PolicyLifeCycle;
  private page: Page | null = null;
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.alertLifeCycle = new AlertLifeCycle(request);
    this.policyLifeCycle = new PolicyLifeCycle(request);
  }

  /**
   * Setup: Initialize AlertLifeCycle and PolicyLifeCycle with API login and scan
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

    // Setup PolicyLifeCycle with the same auth token
    await this.policyLifeCycle.setup(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );
    Logger.info('AlertTestSetup: PolicyLifeCycle setup complete');

    // Create a scan via API
    await this.alertLifeCycle.scan();
    Logger.info('AlertTestSetup: Scan complete');

    // Verify alerts were created
    const alertsCount = await this.alertLifeCycle.getAlertsCount();
    Logger.info(`AlertTestSetup: Alerts created: ${alertsCount}`);
  }

  /**
   * Login via API and set auth token in browser
   * Uses the existing token from alertLifeCycle to avoid duplicate API calls
   * This allows navigating to the page without UI login flow
   */
  async loginViaApi(page: Page): Promise<void> {
    this.page = page;
    Logger.info('TestSetup: Logging in via API');

    // Use existing token and user data from alertLifeCycle (already obtained in setup())
    const token = this.alertLifeCycle.authToken;
    const userData = this.alertLifeCycle.userData;

    if (!token) {
      throw new Error('API login failed - No auth token received');
    }

    Logger.info('TestSetup: Auth token and user data obtained from API');

    // Navigate to home page with the actual app URL
    await page.goto(config.baseURL);

    // Set token and user in localStorage and reload page
    await page.evaluate(({ authToken, user }) => {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
    }, { authToken: token, user: userData });

    Logger.info('TestSetup: Auth token and user data saved to browser localStorage');

    // Reload so app initializes with the token and user
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for main navigation to confirm app recognizes authentication
    try {
      await page.locator('nav[aria-label="Main navigation"]').waitFor({ state: 'visible', timeout: 5000 });
      Logger.info('TestSetup: Main navigation visible - app authenticated');
    } catch {
      Logger.info('TestSetup: Main navigation not visible, but proceeding');
    }
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

    // Clear auth token and user from browser (only if page is properly loaded)
    if (this.page) {
      try {
        await this.page.evaluate(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
        Logger.info('AlertTestSetup: Auth token and user data removed from localStorage');
      } catch (error) {
        Logger.info('AlertTestSetup: Could not access localStorage (page may not be loaded)');
      }
    }

    // Reset data via API
    await this.alertLifeCycle.cleanup();
    Logger.info('AlertTestSetup: Cleanup complete');
  }
}