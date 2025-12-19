import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnboardingService } from './onboarding.service';

/**
 * Scheduled tasks for onboarding reminders and automated provisioning
 * - Runs daily at 9 AM to send reminders for upcoming deadlines
 * - Runs daily at 8 AM to check for provisioning tasks due on start date (ONB-013)
 */
@Injectable()
export class OnboardingSchedulerService {
  private readonly logger = new Logger(OnboardingSchedulerService.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Send onboarding reminders daily at 9 AM
   * Checks for tasks with deadlines within 2 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    this.logger.log('Running daily onboarding reminders check...');
    try {
      await this.onboardingService.sendOnboardingReminders();
      this.logger.log('Daily onboarding reminders check completed');
    } catch (error) {
      this.logger.error(`Error sending onboarding reminders: ${error.message}`, error.stack);
    }
  }

  /**
   * Send urgent reminders for tasks due today
   * Runs every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours
  async sendUrgentReminders() {
    this.logger.log('Running urgent onboarding reminders check...');
    try {
      // This could be enhanced to check for tasks due today
      await this.onboardingService.sendOnboardingReminders();
      this.logger.log('Urgent onboarding reminders check completed');
    } catch (error) {
      this.logger.error(`Error sending urgent reminders: ${error.message}`, error.stack);
    }
  }

  /**
   * ONB-013: Automated account provisioning on start date
   * Runs daily at 8 AM to check for employees whose start date is today
   * Triggers provisioning for email, SSO, and system access
   */
  @Cron('0 8 * * *') // Daily at 8 AM
  async triggerProvisioningOnStartDate() {
    this.logger.log('[ONB-013] Running automated account provisioning check...');
    try {
      await this.onboardingService.triggerProvisioningForStartDate();
      this.logger.log('[ONB-013] Automated account provisioning check completed');
    } catch (error) {
      this.logger.error(`[ONB-013] Error triggering provisioning: ${error.message}`, error.stack);
    }
  }
}

