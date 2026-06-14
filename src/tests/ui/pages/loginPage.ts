import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';
import { NavigatePage } from './navigatePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;


  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
  }

  async navigateToLogin(): Promise<void> {
    await this.navigateTo('/login');
  }

  async setUser(username: string): Promise<LoginPage> {
    await this.usernameInput.fill(username);
    return this;
  }

  async setPassword(password: string): Promise<LoginPage> {
    await this.passwordInput.fill(password);
    return this;
  }

  async login(): Promise<NavigatePage> {
    await this.loginButton.click();
    return await NavigatePage.create(this.page);
  }

  async errorLogin(): Promise<string> {
    await this.loginButton.click();
    await this.errorMessage.waitFor({ state: 'visible' });
    const error = await this.errorMessage.textContent();
    return error || '';
  }

}