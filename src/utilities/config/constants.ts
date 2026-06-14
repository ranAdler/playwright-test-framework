import config from './env';

export const TEST_USERS = {
  VALID_USER: {
    username: config.testUsername,
    password: config.testPassword,
  },
  INVALID_USER: {
    username: 'invalid@example.com',
    password: 'WrongPassword',
  },
};

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Invalid credentials',
  REQUIRED_FIELD: 'This field is required',
};

export const APP_CONFIG = {
  baseURL: config.baseURL,
  apiBaseURL: config.apiBaseURL,
  environment: config.environment,
};

export const API_ENDPOINTS = {
  SCAN: '/scans',
  SCAN_DETAILS: (id: string) => `/scans/${id}`,
};