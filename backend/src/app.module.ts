// Import schemas for future use or registration in modules
import { JobPostingSchema } from './schemas/recruitment/job-posting.schema';
import { CandidateApplicationSchema } from './schemas/recruitment/candidate-application.schema';
import { ReferralTagSchema } from './schemas/recruitment/referral-tag.schema';
import { OfferLetterSchema } from './schemas/recruitment/offer-letter.schema';
import { PreboardingTaskSchema } from './schemas/recruitment/preboarding-task.schema';
import { AssessmentTemplateSchema } from './schemas/recruitment/assessment-template.schema';
import { InterviewScheduleSchema } from './schemas/recruitment/interview-schedule.schema';
import { InterviewFeedbackSchema } from './schemas/recruitment/interview-feedback.schema';
import { CandidateProfileSchema } from './schemas/recruitment/candidate-profile.schema';
import { CandidateConsentSchema } from './schemas/recruitment/candidate-consent.schema';
import { RecruitmentAnalyticsSchema } from './schemas/recruitment/recruitment-analytics.schema';
import { CommunicationLogSchema } from './schemas/recruitment/communication-log.schema';
import { HiringWorkflowSchema } from './schemas/recruitment/hiring-workflow.schema';
import { JobTemplateSchema } from './schemas/recruitment/job-template.schema';

import { OnboardingChecklistSchema } from './schemas/onboarding/onboarding-checklist.schema';
import { OnboardingTrackerSchema } from './schemas/onboarding/onboarding-tracker.schema';
import { ContractSubmissionSchema } from './schemas/onboarding/contract-submission.schema';
import { SigningBonusSchema } from './schemas/onboarding/signing-bonus.schema';
import { PayrollInitiationSchema } from './schemas/onboarding/payroll-initiation.schema';
import { AssetReservationSchema } from './schemas/onboarding/asset-reservation.schema';
import { AccessProvisioningSchema } from './schemas/onboarding/access-provisioning.schema';

import { OffboardingChecklistSchema } from './schemas/offboarding/offboarding-checklist.schema';
import { OffboardingNotificationSchema } from './schemas/offboarding/offboarding-notification.schema';
import { ClearanceSignOffSchema } from './schemas/offboarding/clearance-signoff.schema';
import { AccessRevocationSchema } from './schemas/offboarding/access-revocation.schema';
import { ResignationRequestSchema } from './schemas/offboarding/resignation-request.schema';
import { TerminationReviewSchema } from './schemas/offboarding/termination-review.schema';

import { ReminderSchema } from './schemas/shared/reminder.schema';
import { DocumentUploadSchema } from './schemas/shared/document-upload.schema';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Collect all schemas for easy MongooseModule registration when needed later, or export for foundation
export const schemas = [
  JobPostingSchema, CandidateApplicationSchema, ReferralTagSchema, OfferLetterSchema, PreboardingTaskSchema,
  AssessmentTemplateSchema, InterviewScheduleSchema, InterviewFeedbackSchema, CandidateProfileSchema, CandidateConsentSchema, RecruitmentAnalyticsSchema, CommunicationLogSchema, HiringWorkflowSchema, JobTemplateSchema,
  OnboardingChecklistSchema, OnboardingTrackerSchema, ContractSubmissionSchema, SigningBonusSchema, PayrollInitiationSchema, AssetReservationSchema, AccessProvisioningSchema,
  OffboardingChecklistSchema, OffboardingNotificationSchema, ClearanceSignOffSchema, AccessRevocationSchema, ResignationRequestSchema, TerminationReviewSchema,
  ReminderSchema, DocumentUploadSchema,
];

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
