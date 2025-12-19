import { IsMongoId, IsEnum, IsDateString, IsArray, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';

export class ScheduleInterviewDto {
  @IsMongoId()
  @IsNotEmpty()
  applicationId: string;

  @IsEnum(ApplicationStage)
  @IsNotEmpty()
  stage: ApplicationStage;

  @IsNotEmpty({ message: 'scheduledDate is required' })
  @IsString({ message: 'scheduledDate must be a string' })
  scheduledDate: string; // Accept ISO 8601 string format - validation happens in service

  @IsEnum(InterviewMethod)
  method: InterviewMethod;

  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  panel: string[]; // Panel member IDs

  @IsString()
  @IsOptional()
  videoLink?: string;

  @IsString()
  @IsOptional()
  calendarEventId?: string;
}

