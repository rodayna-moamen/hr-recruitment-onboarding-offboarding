import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateEquipmentReturnDto {
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @IsBoolean()
  @IsOptional()
  returned?: boolean;

  @IsString()
  @IsOptional()
  condition?: string; // e.g., 'good', 'damaged', 'missing'
}

