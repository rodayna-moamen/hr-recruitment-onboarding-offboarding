import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';

// Import recruitment schemas
import { JobPostingSchema } from '../../schemas/recruitment/job-posting.schema';
import { CandidateApplicationSchema } from '../../schemas/recruitment/candidate-application.schema';
import { ReferralTagSchema } from '../../schemas/recruitment/referral-tag.schema';
import { OfferLetterSchema } from '../../schemas/recruitment/offer-letter.schema';
import { PreboardingTaskSchema } from '../../schemas/recruitment/preboarding-task.schema';
import { AssessmentTemplateSchema } from '../../schemas/recruitment/assessment-template.schema';
import { InterviewScheduleSchema } from '../../schemas/recruitment/interview-schedule.schema';
import { InterviewFeedbackSchema } from '../../schemas/recruitment/interview-feedback.schema';
import { CandidateProfileSchema } from '../../schemas/recruitment/candidate-profile.schema';
import { CandidateConsentSchema } from '../../schemas/recruitment/candidate-consent.schema';
import { RecruitmentAnalyticsSchema } from '../../schemas/recruitment/recruitment-analytics.schema';
import { CommunicationLogSchema } from '../../schemas/recruitment/communication-log.schema';
import { HiringWorkflowSchema } from '../../schemas/recruitment/hiring-workflow.schema';
import { JobTemplateSchema } from '../../schemas/recruitment/job-template.schema';

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

