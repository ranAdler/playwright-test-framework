import { APIRequestContext, expect } from '@playwright/test';
import { LoginClient } from '../endpoints/loginClient';
import { ScanClient } from '../endpoints/scanClient';
import { ResetClient } from '../endpoints/resetClient';
import { Logger } from '../../../utilities/helpers/logger';
import config from '../../../utilities/config/env';

export abstract class BaseLifeCycle {
  protected request: APIRequestContext;
  protected loginClient: LoginClient;
  public scanClient: ScanClient;
  protected resetClient: ResetClient;
  public authToken: string = '';
  public userData: any = null;

  protected abstract className: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.loginClient = new LoginClient(request, config.apiBaseURL);
    this.scanClient = new ScanClient(request, config.apiBaseURL);
    this.resetClient = new ResetClient(request, config.apiBaseURL);
  }

  protected abstract initializeClients(): void;

  async setup(username: string, password: string): Promise<void> {
    Logger.info(`${this.className}: Setting up - Logging in...`);

    const loginResponse = await this.loginClient.login(username, password);
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    this.authToken = loginBody.token;
    this.userData = loginBody.user;

    Logger.info(`${this.className}: Authentication successful, token obtained`);

    this.scanClient.setAuthToken(this.authToken);
    this.resetClient.setAuthToken(this.authToken);
    this.initializeClients();
  }

  async scan(scanData: any = { name: 'Test Scan', description: 'A test scan' }): Promise<void> {
    Logger.info(`${this.className}: Creating a new scan...`);

    const createResponse = await this.scanClient.createScan(scanData);
    expect(createResponse.status()).toBeLessThanOrEqual(201);

    const createdScan = await createResponse.json();
    Logger.info(`${this.className}: Scan created with ID: ${createdScan.id}`);

    Logger.info(`${this.className}: Waiting for scan to complete...`);
    const completedScan = await this.scanClient.waitForScanCompletion();
    expect(completedScan).toBeTruthy();
    expect(completedScan.status?.toUpperCase()).toMatch(/COMPLETED|SUCCESS/);

    Logger.info(`${this.className}: Scan completed with status: ${completedScan.status}`);
  }

  async cleanup(): Promise<void> {
    Logger.info(`${this.className}: Cleaning up - Resetting data...`);

    const resetResponse = await this.resetClient.reset();
    expect(resetResponse.status()).toBe(200);

    Logger.info(`${this.className}: Data reset successfully`);
  }
}