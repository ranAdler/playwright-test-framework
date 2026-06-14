import * as dotenv from 'dotenv';
import * as path from 'path';

const environment = process.env.NODE_ENV || 'dev';

const envFilePath = path.resolve(
  __dirname,
  `../../.env.${environment}`
);

dotenv.config({ path: envFilePath });

interface Config {
  baseURL: string;
  apiBaseURL: string;
  testUsername: string;
  testPassword: string;
  browser: string;
  headless: boolean;
  debug: boolean;
  environment: string;
}

export const config: Config = {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  apiBaseURL: process.env.API_BASE_URL || 'http://localhost:8080/api',
  testUsername: process.env.TEST_USERNAME || 'admin',
  testPassword: process.env.TEST_PASSWORD || 'Aa123456',
  browser: process.env.BROWSER || 'chromium',
  headless: process.env.HEADLESS !== 'false',
  debug: process.env.DEBUG === 'true',
  environment,
};

export default config;