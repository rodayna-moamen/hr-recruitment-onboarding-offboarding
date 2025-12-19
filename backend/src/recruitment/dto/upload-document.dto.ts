import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsOptional()
  ownerId?: string;
}

