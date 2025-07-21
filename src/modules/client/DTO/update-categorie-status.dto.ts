import { IsBoolean } from 'class-validator';

export class UpdateCategorieStatusDto {
  @IsBoolean()
  isActive: boolean;
} 