import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OffboardingService } from './offboarding.service';

/**
 * Scheduled tasks for performance warning notifications
 * - Runs weekly (Monday at 9 AM) to check for low performance appraisals
 * - Sends automatic notifications to HR managers when low performance is detected
 */
@Injectable()
export class PerformanceWarningSchedulerService {
  private readonly logger = new Logger(PerformanceWarningSchedulerService.name);

  constructor(private readonly offboardingService: OffboardingService) {}

  /**
   * Check for low performance and send warnings to HR managers
   * Runs weekly on Monday at 9 AM
   * Cron: 0 9 * * 1 = 0 minutes, 9 hours, any day of month, any month, Monday (day 1)
   */
  @Cron('0 9 * * 1')
  async checkLowPerformanceAndNotify() {
    this.logger.log('[Performance Warning] Running weekly low performance check...');
    try {
      const result = await this.offboardingService.checkAndNotifyLowPerformance();
      this.logger.log(`[Performance Warning] Check completed. Found ${result.employeesWithLowPerformance} employees with low performance. Sent ${result.notificationsSent} notifications to HR managers.`);
    } catch (error) {
      this.logger.error(`[Performance Warning] Error checking low performance: ${error.message}`, error.stack);
    }
  }

  /**
   * Manual trigger for testing (can be called via API endpoint if needed)
   */
  async triggerPerformanceCheck(): Promise<{ employeesWithLowPerformance: number; notificationsSent: number }> {
    this.logger.log('[Performance Warning] Manually triggering performance check...');
    return await this.offboardingService.checkAndNotifyLowPerformance();
  }
}

