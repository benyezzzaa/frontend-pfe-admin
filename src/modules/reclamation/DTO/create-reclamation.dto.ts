import { IsString, IsInt } from 'class-validator';

export class CreateReclamationDto {
  @IsString()
  sujet: string;

  @IsString()
  description: string;

  @IsInt()
  clientId: number;
}
