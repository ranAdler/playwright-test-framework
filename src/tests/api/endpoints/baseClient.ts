import { APIRequestContext, APIResponse } from '@playwright/test';
import config from '../../../utilities/config/env';

export class BaseClient {
  protected request: APIRequestContext;
  protected baseURL: string;
  protected headers: Record<string, string> = {};

  constructor(request: APIRequestContext, baseURL: string = config.apiBaseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  public setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  protected validateResponse(response: APIResponse, expectedStatus: number): void {
    const actualStatus = response.status();
    if (actualStatus !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${actualStatus}`);
    }
  }

  protected async get(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request.get(url.toString(), {
      headers: this.headers,
    });
  }

  protected async post(endpoint: string, data?: any) {
    return this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
    });
  }

  protected async put(endpoint: string, data?: any) {
    return this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
    });
  }

  protected async patch(endpoint: string, data?: any) {
    return this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      headers: this.headers,
    });
  }

  protected async delete(endpoint: string) {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
    });
  }
}