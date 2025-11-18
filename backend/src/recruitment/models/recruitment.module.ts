import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';

// Import recruitment schemas
import { JobPostingSchema } from '../schemas/job-posting.schema';
import { CandidateApplicationSchema } from '../schemas/candidate-application.schema';
import { ReferralTagSchema } from '../schemas/referral-tag.schema';
import { OfferLetterSchema } from '../schemas/offer-letter.schema';
import { PreboardingTaskSchema } from '../schemas/preboarding-task.schema';
import { AssessmentTemplateSchema } from '../schemas/assessment-template.schema';
import { InterviewScheduleSchema } from '../schemas/interview-schedule.schema';
import { InterviewFeedbackSchema } from '../schemas/interview-feedback.schema';
import { CandidateProfileSchema } from '../schemas/candidate-profile.schema';
import { CandidateConsentSchema } from '../schemas/candidate-consent.schema';
import { RecruitmentAnalyticsSchema } from '../schemas/recruitment-analytics.schema';
import { CommunicationLogSchema } from '../schemas/communication-log.schema';
import { HiringWorkflowSchema } from '../schemas/hiring-workflow.schema';
import { JobTemplateSchema } from '../schemas/job-template.schema';

@Module({
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {
  // Schemas are available for use:
  // JobPostingSchema, CandidateApplicationSchema, ReferralTagSchema, OfferLetterSchema,
  // PreboardingTaskSchema, AssessmentTemplateSchema, InterviewScheduleSchema, InterviewFeedbackSchema,
  // CandidateProfileSchema, CandidateConsentSchema, RecruitmentAnalyticsSchema, CommunicationLogSchema,
  // HiringWorkflowSchema, JobTemplateSchema
}

