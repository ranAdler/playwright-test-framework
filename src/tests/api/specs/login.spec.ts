import { test, expect } from '@playwright/test';
import { LoginClient } from '../endpoints/loginClient';
import { TEST_USERS } from '../../../utilities/config/constants';
import { Logger } from '../../../utilities/helpers/logger';

test.describe('API - Login Tests', () => {
  let loginClient: LoginClient;

  test.beforeEach(async ({ request }) => {
    loginClient = new LoginClient(request);
  });

  test('should successfully login with valid credentials', async () => {
    Logger.info('Testing API login with valid credentials');
    const response = await loginClient.login(
      TEST_USERS.VALID_USER.username,
      TEST_USERS.VALID_USER.password
    );
    console.log('-----Response:' , response);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('user');
  });


});