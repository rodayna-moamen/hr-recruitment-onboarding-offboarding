import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class InitiateTerminationReviewDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  hrComments?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  warningIds?: string[]; // Performance warning IDs

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appraisalIds?: string[]; // Low performance appraisal IDs

  @IsString()
  @IsOptional()
  managerRequestId?: string; // Manager request ID if initiated by manager
}

