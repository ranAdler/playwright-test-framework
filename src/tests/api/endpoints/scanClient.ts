import { APIResponse } from '@playwright/test';
import { BaseClient } from './baseClient';
import { API_ENDPOINTS } from '../../../utilities/config/constants';

export class ScanClient extends BaseClient {
  async getScans(): Promise<APIResponse> {
    return this.get(API_ENDPOINTS.SCAN);
  }

  async createScan(data: any): Promise<APIResponse> {
    return this.post(API_ENDPOINTS.SCAN, data);
  }

  async waitForScanCompletion(
    maxWaitTime: number = 60000,
    pollInterval: number = 5000
  ): Promise<any> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.getScans();

      if (response.status() === 200) {
        const scans = await response.json();

        if (Array.isArray(scans) && scans.length > 0) {
          const latestScan = scans[0];

          if (
            latestScan.status?.toUpperCase() === 'COMPLETED' ||
            latestScan.status?.toUpperCase() === 'SUCCESS'
          ) {
            return latestScan;
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Scan did not complete within ${maxWaitTime}ms`);
  }
}