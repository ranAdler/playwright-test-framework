import { APIRequestContext } from '@playwright/test';
import { PoliciesClient } from '../endpoints/policiesClient';
import { AlertsClient } from '../endpoints/alertsClient';
import { Logger } from '../../../utilities/helpers/logger';
import config from '../../../utilities/config/env';
import { BaseLifeCycle } from './baseLifeCycle';

export class PolicyLifeCycle extends BaseLifeCycle {
  public policiesClient: PoliciesClient;
  public alertsClient: AlertsClient;
  protected className = 'PolicyLifeCycle';

  constructor(request: APIRequestContext) {
    super(request);
    this.policiesClient = new PoliciesClient(request, config.apiBaseURL);
    this.alertsClient = new AlertsClient(request, config.apiBaseURL);
  }

  protected initializeClients(): void {
    this.policiesClient.setAuthToken(this.authToken);
    this.alertsClient.setAuthToken(this.authToken);
  }

  async createPolicy(policyData: any): Promise<any> {
    Logger.info('PolicyLifeCycle: Creating a new policy...');

    const createResponse = await this.policiesClient.createPolicy(policyData);
    const status = createResponse.status();
    if (status > 201) {
      throw new Error(`Failed to create policy: HTTP ${status}`);
    }

    const createdPolicy = await createResponse.json();
    Logger.info(`PolicyLifeCycle: Policy created with ID: ${createdPolicy.id}`);

    return createdPolicy;
  }

  async getPoliciesCount(): Promise<number> {
    return this.policiesClient.getPoliciesCount();
  }

  async getPolicies() {
    const response = await this.policiesClient.getPolicies();
    if (response.status() === 200) {
      return await response.json();
    }
    throw new Error(`Failed to fetch policies: HTTP ${response.status()}`);
  }

  async getAlerts() {
    const response = await this.alertsClient.getAlerts();
    if (response.status() === 200) {
      return await response.json();
    }
    throw new Error(`Failed to fetch alerts: HTTP ${response.status()}`);
  }

  async getAlertsCount(): Promise<number> {
    return this.alertsClient.getAlertsCount();
  }
}