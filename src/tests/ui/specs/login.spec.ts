import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { TEST_USERS, MESSAGES } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';

test.describe('UI - Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });




  test('should login successfully with valid credentials', async ({ page }) => {
    Logger.info('Testing successful login with valid credentials');
    await loginPage.setUser(TEST_USERS.VALID_USER.username);
    await loginPage.setPassword(TEST_USERS.VALID_USER.password);
    const navigatePage = await loginPage.login();
    expect(navigatePage).toBeDefined();
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    Logger.info('Testing login with invalid credentials');
    await loginPage.setUser(TEST_USERS.INVALID_USER.username);
    await loginPage.setPassword(TEST_USERS.INVALID_USER.password);
    const errorMessage = await loginPage.errorLogin();

    expect(errorMessage).toContain('Invalid username or password');
    expect(page.url()).toContain('/login');
  });

});