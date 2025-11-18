// Import schemas for future use or registration in modules
import { JobPostingSchema } from './recruitment/schemas/job-posting.schema';
import { CandidateApplicationSchema } from './recruitment/schemas/candidate-application.schema';
import { ReferralTagSchema } from './recruitment/schemas/referral-tag.schema';
import { OfferLetterSchema } from './recruitment/schemas/offer-letter.schema';
import { PreboardingTaskSchema } from './recruitment/schemas/preboarding-task.schema';
import { AssessmentTemplateSchema } from './recruitment/schemas/assessment-template.schema';
import { InterviewScheduleSchema } from './recruitment/schemas/interview-schedule.schema';
import { InterviewFeedbackSchema } from './recruitment/schemas/interview-feedback.schema';
import { CandidateProfileSchema } from './recruitment/schemas/candidate-profile.schema';
import { CandidateConsentSchema } from './recruitment/schemas/candidate-consent.schema';
import { RecruitmentAnalyticsSchema } from './recruitment/schemas/recruitment-analytics.schema';
import { CommunicationLogSchema } from './recruitment/schemas/communication-log.schema';
import { HiringWorkflowSchema } from './recruitment/schemas/hiring-workflow.schema';
import { JobTemplateSchema } from './recruitment/schemas/job-template.schema';

import { OnboardingChecklistSchema } from './onboarding/schemas/onboarding-checklist.schema';
import { OnboardingTrackerSchema } from './onboarding/schemas/onboarding-tracker.schema';
import { ContractSubmissionSchema } from './onboarding/schemas/contract-submission.schema';
import { SigningBonusSchema } from './onboarding/schemas/signing-bonus.schema';
import { PayrollInitiationSchema } from './onboarding/schemas/payroll-initiation.schema';
import { AssetReservationSchema } from './onboarding/schemas/asset-reservation.schema';
import { AccessProvisioningSchema } from './onboarding/schemas/access-provisioning.schema';

import { OffboardingChecklistSchema } from './offboarding/schemas/offboarding-checklist.schema';
import { OffboardingNotificationSchema } from './offboarding/schemas/offboarding-notification.schema';
import { ClearanceSignOffSchema } from './offboarding/schemas/clearance-signoff.schema';
import { AccessRevocationSchema } from './offboarding/schemas/access-revocation.schema';
import { ResignationRequestSchema } from './offboarding/schemas/resignation-request.schema';
import { TerminationReviewSchema } from './offboarding/schemas/termination-review.schema';

import { ReminderSchema } from './shared/reminder.schema';
import { DocumentUploadSchema } from './shared/document-upload.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecruitmentModule } from './recruitment/models/recruitment.module';
import { OnboardingModule } from './onboarding/models/onboarding.module';
import { OffboardingModule } from './offboarding/models/offboarding.module';

// Collect all schemas for easy MongooseModule registration when needed later, or export for foundation
export const schemas = [
  JobPostingSchema, CandidateApplicationSchema, ReferralTagSchema, OfferLetterSchema, PreboardingTaskSchema,
  AssessmentTemplateSchema, InterviewScheduleSchema, InterviewFeedbackSchema, CandidateProfileSchema, CandidateConsentSchema, RecruitmentAnalyticsSchema, CommunicationLogSchema, HiringWorkflowSchema, JobTemplateSchema,
  OnboardingChecklistSchema, OnboardingTrackerSchema, ContractSubmissionSchema, SigningBonusSchema, PayrollInitiationSchema, AssetReservationSchema, AccessProvisioningSchema,
  OffboardingChecklistSchema, OffboardingNotificationSchema, ClearanceSignOffSchema, AccessRevocationSchema, ResignationRequestSchema, TerminationReviewSchema,
  ReminderSchema, DocumentUploadSchema,
];

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/hr-system'),
    RecruitmentModule,
    OnboardingModule,
    OffboardingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
