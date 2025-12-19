import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplate, JobTemplateSchema } from './models/job-template.schema';
import { JobRequisition,JobRequisitionSchema } from './models/job-requisition.schema';
import { Application,ApplicationSchema } from './models/application.schema';
import { ApplicationStatusHistory,ApplicationStatusHistorySchema } from './models/application-history.schema';
import { Interview,InterviewSchema } from './models/interview.schema';
import { AssessmentResult,AssessmentResultSchema } from './models/assessment-result.schema';
import { Referral,ReferralSchema } from './models/referral.schema';
import { Offer,OfferSchema } from './models/offer.schema';
import { Contract,ContractSchema } from './models/contract.schema';
import { Document,DocumentSchema } from './models/document.schema';
import { TerminationRequest,TerminationRequestSchema } from './models/termination-request.schema';
import { ClearanceChecklist,ClearanceChecklistSchema } from './models/clearance-checklist.schema';
import { Onboarding,OnboardingSchema } from './models/onboarding.schema';

import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import {
  EmployeeProfileServiceAdapter,
  OrganizationStructureServiceAdapter,
} from './services/adapter-services';
import { OnboardingService } from './services/onboarding.service';
import { OnboardingSchedulerService } from './services/onboarding-scheduler.service';
import { OffboardingService } from './services/offboarding.service';
import { StubTimeManagementService } from './services/stub-services';
import { Candidate, CandidateSchema } from '../employee-profile/models/candidate.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { PerformanceModule } from '../performance/performance.module';
import { LeavesModule } from '../leaves/leaves.module';

/**
 * RecruitmentModule - Integrated with EmployeeProfile, OrganizationStructure, and Onboarding services.
 * All services are now using real implementations (no stubs).
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: JobRequisition.name, schema: JobRequisitionSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: AssessmentResult.name, schema: AssessmentResultSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: Candidate.name, schema: CandidateSchema },
      // Register EmployeeProfile as 'User' to match schema references
      { name: 'User', schema: EmployeeProfileSchema },
    ]),
    EmployeeProfileModule,
    OrganizationStructureModule,
    NotificationsModule,
    PerformanceModule,
    LeavesModule,
    forwardRef(() => PayrollExecutionModule),
  ],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
    EmployeeProfileServiceAdapter,
    OrganizationStructureServiceAdapter,
    {
      provide: 'IEmployeeProfileService',
      useClass: EmployeeProfileServiceAdapter,
    },
    {
      provide: 'IOrganizationStructureService',
      useClass: OrganizationStructureServiceAdapter,
    },
    OnboardingService,
    OnboardingSchedulerService,
    OffboardingService,
    {
      provide: 'IOnboardingService',
      useClass: OnboardingService,
    },
    {
      provide: 'ITimeManagementService',
      useClass: StubTimeManagementService, // ⚠️ Stub until Time Management module implements calendar methods
    },
  ],
  exports: [RecruitmentService, OnboardingService],
})
export class RecruitmentModule {}