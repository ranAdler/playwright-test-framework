import { APIResponse, APIRequestContext } from '@playwright/test';
import { BaseClient } from './baseClient';
import config from '../../../utilities/config/env';

export class PoliciesClient extends BaseClient {
  constructor(request: APIRequestContext, baseURL: string = config.apiBaseURL) {
    super(request, baseURL);
  }

  async createPolicy(policyData: any): Promise<APIResponse> {
    return this.post('/policies', policyData);
  }

  async getPolicies(): Promise<APIResponse> {
    return this.get('/policies');
  }

  async getPoliciesCount(): Promise<number> {
    const response = await this.getPolicies();
    if (response.status() === 200) {
      const data = await response.json();
      return Array.isArray(data) ? data.length : data?.total || 0;
    }
    return 0;
  }

  async getPolicyById(policyId: string): Promise<APIResponse> {
    return this.get(`/policies/${policyId}`);
  }

  async updatePolicy(policyId: string, policyData: any): Promise<APIResponse> {
    return this.put(`/policies/${policyId}`, policyData);
  }

  async deletePolicy(policyId: string): Promise<APIResponse> {
    return this.delete(`/policies/${policyId}`);
  }
}