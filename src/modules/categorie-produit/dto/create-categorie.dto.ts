// ✅ create-categorie.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategorieDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Boissons' })
  nom: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  isActive?: boolean;
}