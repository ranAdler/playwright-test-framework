import { APIRequestContext } from '@playwright/test';
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

  protected async get(endpoint: string) {
    return this.request.get(`${this.baseURL}${endpoint}`, {
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

  protected async delete(endpoint: string) {
    return this.request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.headers,
    });
  }
}