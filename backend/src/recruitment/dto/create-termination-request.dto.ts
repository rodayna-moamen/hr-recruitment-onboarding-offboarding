import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { TerminationInitiation } from '../enums/termination-initiation.enum';

export class CreateTerminationRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsEnum(TerminationInitiation)
  @IsNotEmpty()
  initiator: TerminationInitiation;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  employeeComments?: string;

  @IsString()
  @IsOptional()
  hrComments?: string;

  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @IsString()
  @IsNotEmpty()
  contractId: string;
}

