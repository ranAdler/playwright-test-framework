import { APIRequestContext } from '@playwright/test';
import { AlertsClient } from '../endpoints/alertsClient';
import config from '../../../utilities/config/env';
import { BaseLifeCycle } from './baseLifeCycle';

export class AlertLifeCycle extends BaseLifeCycle {
  public alertsClient: AlertsClient;
  protected className = 'AlertLifeCycle';

  constructor(request: APIRequestContext) {
    super(request);
    this.alertsClient = new AlertsClient(request, config.apiBaseURL);
  }

  protected initializeClients(): void {
    this.alertsClient.setAuthToken(this.authToken);
  }

  /**
   * Get current alerts count
   */
  async getAlertsCount(): Promise<number> {
    return this.alertsClient.getAlertsCount();
  }

  /**
   * Get all alerts
   */
  async getAlerts() {
    const response = await this.alertsClient.getAlerts();
    if (response.status() === 200) {
      return await response.json();
    }
    throw new Error(`Failed to fetch alerts: HTTP ${response.status()}`);
  }
}