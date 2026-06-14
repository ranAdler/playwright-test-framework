import { APIResponse } from '@playwright/test';
import { BaseClient } from './baseClient';

export class ResetClient extends BaseClient {
  async reset(): Promise<APIResponse> {
    return this.post('/admin/reset');
  }
}