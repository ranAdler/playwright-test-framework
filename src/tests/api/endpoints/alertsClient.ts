import { APIResponse } from '@playwright/test';
import { BaseClient } from './baseClient';

export class AlertsClient extends BaseClient {
  async getAlerts(filters?: { status?: string; remediate?: boolean }): Promise<APIResponse> {
    return this.get('/alerts', filters);
  }

  async getAlertsCount(): Promise<number> {
    const response = await this.getAlerts();
    if (response.status() === 200) {
      const alerts = await response.json();
      return Array.isArray(alerts) ? alerts.length : 0;
    }
    return 0;
  }

  async getAlertsByStatus(status: string): Promise<APIResponse> {
    return this.getAlerts({ status });
  }

  async remediateAlert(alertId: string, note: string): Promise<APIResponse> {
    return this.post(`/alerts/${alertId}/remediate`, { note });
  }

  async changeAlertStatus(alertId: string, status: string): Promise<APIResponse> {
    return this.patch(`/alerts/${alertId}`, { status });
  }

  async addRemediationNote(alertId: string, note: string): Promise<APIResponse> {
    return this.post(`/alerts/${alertId}/remediate`, { note });
  }

  async getAlertsByAutoRemediate(autoRemediate: boolean): Promise<any[]> {
    const allAlerts = await this.getAlerts();
    if (allAlerts.status() === 200) {
      const alerts = await allAlerts.json();
      return alerts.filter((alert: any) => alert.remediation?.autoRemediate === autoRemediate);
    }
    return [];
  }
}