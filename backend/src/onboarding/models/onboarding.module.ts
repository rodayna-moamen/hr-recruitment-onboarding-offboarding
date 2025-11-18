import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

// Import onboarding schemas
import { OnboardingChecklistSchema } from '../../schemas/onboarding/onboarding-checklist.schema';
import { OnboardingTrackerSchema } from '../../schemas/onboarding/onboarding-tracker.schema';
import { ContractSubmissionSchema } from '../../schemas/onboarding/contract-submission.schema';
import { SigningBonusSchema } from '../../schemas/onboarding/signing-bonus.schema';
import { PayrollInitiationSchema } from '../../schemas/onboarding/payroll-initiation.schema';
import { AssetReservationSchema } from '../../schemas/onboarding/asset-reservation.schema';
import { AccessProvisioningSchema } from '../../schemas/onboarding/access-provisioning.schema';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {
  // Schemas are available for use:
  // OnboardingChecklistSchema, OnboardingTrackerSchema, ContractSubmissionSchema,
  // SigningBonusSchema, PayrollInitiationSchema, AssetReservationSchema, AccessProvisioningSchema
}

