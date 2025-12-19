import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApprovalStatus } from '../enums/approval-status.enum';

export class UpdateClearanceItemDto {
  @IsString()
  @IsNotEmpty()
  department: string;

  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status: ApprovalStatus;

  @IsString()
  @IsOptional()
  comments?: string;
}

