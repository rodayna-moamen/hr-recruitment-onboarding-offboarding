import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class UpdateOnboardingTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(OnboardingTaskStatus)
  @IsOptional()
  status?: OnboardingTaskStatus;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsString()
  @IsOptional()
  documentId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

