import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali' })
  @IsString()
  nom: string;
   @IsNotEmpty()
  @IsString()
  adresse: string;
  @ApiProperty({ example: 'Ben Salah' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'ali.bensalah@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123' })
  @IsString()
  @MinLength(6)
  password: string;

 

   @ApiProperty({ example: '06 12 34 56 78', description: 'Numéro français valide (avec ou sans espaces)' })
  @IsOptional()
  @IsString()
  @Matches(/^(?:\+33|0)[1-9][\d\s\-\.]{8,}$/, {
    message: 'Le numéro de téléphone doit être un numéro français valide (ex: 06 12 34 56 78 ou +33 6 12 34 56 78).',
  })
  tel?: string;

  @ApiProperty({ enum: ['commercial', 'admin', 'bo'], required: false })
@IsEnum(['commercial', 'admin', 'bo'])
@IsOptional()
role?: string;
}
