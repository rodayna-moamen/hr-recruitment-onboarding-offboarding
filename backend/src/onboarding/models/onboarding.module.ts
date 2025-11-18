import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

// Import onboarding schemas
import { OnboardingChecklistSchema } from '../schemas/onboarding-checklist.schema';
import { OnboardingTrackerSchema } from '../schemas/onboarding-tracker.schema';
import { ContractSubmissionSchema } from '../schemas/contract-submission.schema';
import { SigningBonusSchema } from '../schemas/signing-bonus.schema';
import { PayrollInitiationSchema } from '../schemas/payroll-initiation.schema';
import { AssetReservationSchema } from '../schemas/asset-reservation.schema';
import { AccessProvisioningSchema } from '../schemas/access-provisioning.schema';

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

