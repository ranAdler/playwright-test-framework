import { Logger } from '../../../utilities/helpers/logger';
import { expect } from '@playwright/test';

export interface StatusWaitResult {
  statusFound: boolean;
  elapsedTimeMs: number;
  targetStatus: string;
}

export interface StatusChangeVerificationResult {
  statusChanged: boolean;
  initialStatus: string;
  finalStatus: string;
  elapsedTimeMs: number;
}

export class AlertStatusWaiter {
  private maxWaitTimeMs: number;
  private checkIntervalMs: number;
  private initialWaitTimeMs: number;

  constructor(maxWaitTimeMs: number = 130000, checkIntervalMs: number = 100, initialWaitTimeMs: number = 130000) {
    this.maxWaitTimeMs = maxWaitTimeMs;
    this.checkIntervalMs = checkIntervalMs;
    this.initialWaitTimeMs = initialWaitTimeMs;
  }

  /**
   * Get current status, sleep for initialWait, then check with intervals for status change
   * Flow: Get status → Sleep 130s → Check every 500ms for 30s → If changed: success → If not: fail test
   * @param alertId - The alert ID to monitor
   * @param getAlertsFunction - Function to call to fetch current alerts
   * @param initialSleepMs - Initial sleep time before checking (default: 130000ms)
   * @param intervalMs - Interval to check after sleep (default: 500ms)
   * @param intervalWaitMs - How long to check with intervals (default: 30000ms)
   * @returns StatusWaitResult with statusFound, elapsedTime, and initial status
   */
  async waitForAlertStatus(
    alertId: string,
    getAlertsFunction: () => Promise<any[]>,
    initialSleepMs: number = 130000,
    intervalMs: number = 500,
    intervalWaitMs: number = 30000
  ): Promise<StatusWaitResult> {
    const initialSleepSec = initialSleepMs / 1000;
    const intervalWaitSec = intervalWaitMs / 1000;

    Logger.info(`waitForAlertStatus Step 1: Getting current alert status...`);
    let allAlerts = await getAlertsFunction();
    let currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

    if (!currentAlert) {
      Logger.error(`❌ Alert not found`);
      expect(currentAlert).toBeTruthy();
      return {
        statusFound: false,
        elapsedTimeMs: 0,
        targetStatus: 'NOT_FOUND'
      };
    }

    const initialStatus = currentAlert.status;
    Logger.info(`Initial alert status: "${initialStatus}"`);

    // Step 2: Sleep for initial time
    Logger.info(`waitForAlertStatus Step 2: Sleeping for ${initialSleepSec} seconds...`);
    await new Promise(resolve => setTimeout(resolve, initialSleepMs));

    // Step 3: Check with intervals for status change
    Logger.info(`waitForAlertStatus Step 3: Checking every ${intervalMs}ms for up to ${intervalWaitSec} seconds for status change...`);
    const checkStartTime = Date.now();
    let elapsedCheckTime = 0;

    while (elapsedCheckTime < intervalWaitMs) {
      allAlerts = await getAlertsFunction();
      currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

      if (currentAlert) {
        const currentStatus = currentAlert.status;
        Logger.info(`[${elapsedCheckTime}ms] Current alert status = "${currentStatus}"`);

        if (currentStatus !== initialStatus) {
          Logger.info(`✓ Status changed from "${initialStatus}" to "${currentStatus}" at ${initialSleepMs + elapsedCheckTime}ms total`);
          return {
            statusFound: true,
            elapsedTimeMs: initialSleepMs + elapsedCheckTime,
            targetStatus: currentStatus
          };
        }
      } else {
        Logger.warn(`[${elapsedCheckTime}ms] Alert not found`);
      }

      // Wait before next interval check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      elapsedCheckTime = Date.now() - checkStartTime;
    }

    // Step 4: Fail test if status didn't change
    Logger.error(`❌ Status did NOT change from "${initialStatus}" within ${initialSleepSec}s sleep + ${intervalWaitSec}s interval checks`);
    Logger.error(`Initial status: "${initialStatus}"`);
    Logger.error(`Current status: "${currentAlert?.status}" (no change detected)`);

    // Fail the test
    expect(false).toBe(true);

    return {
      statusFound: false,
      elapsedTimeMs: initialSleepMs + elapsedCheckTime,
      targetStatus: initialStatus
    };
  }

  /**
   * Verify that alert status has changed from the starting status
   * @param alertId - The alert ID to monitor
   * @param startStatus - The initial status to verify it changed FROM
   * @param waitTimeMs - How long to wait for status change
   * @param intervalMs - How often to check the status
   * @param getAlertsFunction - Function to call to fetch current alerts
   * @returns StatusChangeVerificationResult with statusChanged flag and detailed info
   */
  async verifyStatusChanged(
    alertId: string,
    startStatus: string,
    waitTimeMs: number,
    intervalMs: number,
    getAlertsFunction: () => Promise<any[]>
  ): Promise<StatusChangeVerificationResult> {
    const waitSeconds = waitTimeMs / 1000;
    Logger.info(`Verifying alert status change from "${startStatus}" (wait: ${waitSeconds}s, interval: ${intervalMs}ms)...`);

    const startTime = Date.now();
    let elapsedTime = 0;
    let finalStatus = startStatus;

    while (elapsedTime < waitTimeMs) {
      // Get current alert
      const allAlerts = await getAlertsFunction();
      const currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

      if (currentAlert) {
        finalStatus = currentAlert.status;
        Logger.info(`[${elapsedTime}ms] Current alert status = ${finalStatus}`);

        if (finalStatus !== startStatus) {
          Logger.info(`✓ Status changed from "${startStatus}" to "${finalStatus}" at ${elapsedTime}ms`);
          return {
            statusChanged: true,
            initialStatus: startStatus,
            finalStatus,
            elapsedTimeMs: elapsedTime
          };
        }
      } else {
        Logger.warn(`[${elapsedTime}ms] Alert not found`);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      elapsedTime = Date.now() - startTime;
    }

    Logger.error(`❌ Status did NOT change from "${startStatus}" within ${waitSeconds} seconds`);
    Logger.error(`Initial status: "${startStatus}"`);
    Logger.error(`Final status: "${finalStatus}" (no change detected)`);

    return {
      statusChanged: false,
      initialStatus: startStatus,
      finalStatus,
      elapsedTimeMs: elapsedTime
    };
  }

  /**
   * Wait initial time, then verify status has changed, then check with intervals
   * Flow: Wait 130s → Check status → If changed: success → If not: check with intervals
   * @param alertId - The alert ID to monitor
   * @param initialWaitMs - Initial wait time before checking (e.g., 130 seconds)
   * @param intervalCheckMs - Interval to check after initial wait
   * @param getAlertsFunction - Function to call to fetch current alerts
   * @returns StatusChangeVerificationResult with statusChanged flag
   */
  async waitThenVerifyStatusChanged(
    alertId: string,
    initialWaitMs: number,
    intervalCheckMs: number,
    getAlertsFunction: () => Promise<any[]>
  ): Promise<StatusChangeVerificationResult> {
    const initialWaitSeconds = initialWaitMs / 1000;
    Logger.info(`Step 1: Waiting ${initialWaitSeconds} seconds before checking status...`);

    // Step 1: Get initial status
    let allAlerts = await getAlertsFunction();
    let currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

    if (!currentAlert) {
      Logger.error(`❌ Alert not found at initial check`);
      return {
        statusChanged: false,
        initialStatus: 'UNKNOWN',
        finalStatus: 'NOT_FOUND',
        elapsedTimeMs: 0
      };
    }

    const initialStatus = currentAlert.status;
    Logger.info(`Initial alert status: "${initialStatus}"`);

    // Step 2: Wait for initial wait time
    Logger.info(`Waiting for ${initialWaitSeconds}s...`);
    await new Promise(resolve => setTimeout(resolve, initialWaitMs));

    // Step 3: Check status after initial wait
    Logger.info(`Step 2: Checking status after ${initialWaitSeconds}s wait...`);
    allAlerts = await getAlertsFunction();
    currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

    if (!currentAlert) {
      Logger.error(`❌ Alert not found after initial wait`);
      return {
        statusChanged: false,
        initialStatus,
        finalStatus: 'NOT_FOUND',
        elapsedTimeMs: initialWaitMs
      };
    }

    let currentStatus = currentAlert.status;
    Logger.info(`Status after ${initialWaitSeconds}s: "${currentStatus}"`);

    // If status already changed after initial wait
    if (currentStatus !== initialStatus) {
      Logger.info(`✓ Status changed from "${initialStatus}" to "${currentStatus}" after ${initialWaitSeconds}s`);
      return {
        statusChanged: true,
        initialStatus,
        finalStatus: currentStatus,
        elapsedTimeMs: initialWaitMs
      };
    }

    // Step 4: If status hasn't changed, check with intervals
    Logger.info(`Step 3: Status hasn't changed yet. Checking with ${intervalCheckMs}ms intervals...`);
    const checkStartTime = Date.now();
    let elapsedCheckTime = 0;
    const maxCheckTimeMs = this.maxWaitTimeMs; // Use default maxWaitTimeMs for post-initial checks

    while (elapsedCheckTime < maxCheckTimeMs) {
      await new Promise(resolve => setTimeout(resolve, intervalCheckMs));

      allAlerts = await getAlertsFunction();
      currentAlert = allAlerts.find((alert: any) => alert.id === alertId);

      if (currentAlert) {
        currentStatus = currentAlert.status;
        Logger.info(`[${elapsedCheckTime}ms after initial wait] Current status = "${currentStatus}"`);

        if (currentStatus !== initialStatus) {
          Logger.info(`✓ Status changed from "${initialStatus}" to "${currentStatus}" at ${initialWaitMs + elapsedCheckTime}ms total`);
          return {
            statusChanged: true,
            initialStatus,
            finalStatus: currentStatus,
            elapsedTimeMs: initialWaitMs + elapsedCheckTime
          };
        }
      } else {
        Logger.warn(`[${elapsedCheckTime}ms after initial wait] Alert not found`);
      }

      elapsedCheckTime = Date.now() - checkStartTime;
    }

    Logger.error(`❌ Status did NOT change from "${initialStatus}" within ${initialWaitSeconds}s initial wait + interval checks`);
    Logger.error(`Initial status: "${initialStatus}"`);
    Logger.error(`Final status: "${currentStatus}" (no change detected)`);

    const result = {
      statusChanged: false,
      initialStatus,
      finalStatus: currentStatus,
      elapsedTimeMs: initialWaitMs + elapsedCheckTime
    };

    // Fail test if status did not change
    expect(result.statusChanged).toBe(true);

    return result;
  }
}