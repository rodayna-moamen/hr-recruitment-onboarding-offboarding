import { Module } from '@nestjs/common';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';

// Import offboarding schemas
import { OffboardingChecklistSchema } from '../../schemas/offboarding/offboarding-checklist.schema';
import { OffboardingNotificationSchema } from '../../schemas/offboarding/offboarding-notification.schema';
import { ClearanceSignOffSchema } from '../../schemas/offboarding/clearance-signoff.schema';
import { AccessRevocationSchema } from '../../schemas/offboarding/access-revocation.schema';
import { ResignationRequestSchema } from '../../schemas/offboarding/resignation-request.schema';
import { TerminationReviewSchema } from '../../schemas/offboarding/termination-review.schema';

@Module({
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {
  // Schemas are available for use:
  // OffboardingChecklistSchema, OffboardingNotificationSchema, ClearanceSignOffSchema,
  // AccessRevocationSchema, ResignationRequestSchema, TerminationReviewSchema
}

