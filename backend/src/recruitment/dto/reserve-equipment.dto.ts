import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ReserveEquipmentDto {
  @IsBoolean()
  @IsOptional()
  equipmentReserved?: boolean;

  @IsString()
  @IsOptional()
  deskNumber?: string;

  @IsString()
  @IsOptional()
  accessCardNumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentItems?: string[];
}

