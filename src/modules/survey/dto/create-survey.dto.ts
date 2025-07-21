import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  dateDebut: string;

  @IsString()
  @IsNotEmpty()
  dateFin: string;
} 