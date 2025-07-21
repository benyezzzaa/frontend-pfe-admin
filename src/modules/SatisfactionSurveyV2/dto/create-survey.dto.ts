import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;
} 