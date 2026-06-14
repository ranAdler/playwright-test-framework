import { APIResponse } from '@playwright/test';
import { BaseClient } from './baseClient';

export class LoginClient extends BaseClient {
  async login(username: string, password: string): Promise<APIResponse> {
    return this.post('/login', {
      username,
      password,
    });
  }

  async getLoginStatus(): Promise<APIResponse> {
    return this.get('/auth/status');
  }

  async logout(): Promise<APIResponse> {
    return this.post('/auth/logout', {});
  }
}