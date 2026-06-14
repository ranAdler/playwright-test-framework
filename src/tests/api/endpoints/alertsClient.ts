import { APIResponse } from '@playwright/test';
import { BaseClient } from './baseClient';

export class AlertsClient extends BaseClient {
  async getAlerts(): Promise<APIResponse> {
    return this.get('/alerts');
  }

  async getAlertsCount(): Promise<number> {
    const response = await this.getAlerts();
    if (response.status() === 200) {
      const alerts = await response.json();
      return Array.isArray(alerts) ? alerts.length : 0;
    }
    return 0;
  }
}