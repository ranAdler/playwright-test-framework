import { test as base, Page } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { TestSetup } from '../ui/helpers/testSetup';
import { Logger } from '../../utilities/helpers/logger';

type TestFixtures = {
  testSetup: TestSetup;
};

export const test = base.extend<TestFixtures>({
  testSetup: async ({ request }, use) => {
    Logger.info('Fixture: Initializing testSetup');
    const testSetup = new TestSetup(request);

    // Run setup before test
    await testSetup.setup();
    Logger.info('Fixture: Setup complete');

    // Run the test
    await use(testSetup);

    // Run cleanup after test
    Logger.info('Fixture: Running cleanup');
    await testSetup.cleanup();
    Logger.info('Fixture: Cleanup complete');
  },
});

export { expect } from '@playwright/test';