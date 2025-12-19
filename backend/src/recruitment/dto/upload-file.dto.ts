import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UploadFileDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;
}

