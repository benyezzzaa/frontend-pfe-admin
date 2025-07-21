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

 

   @ApiProperty({ example: '0612345678', description: 'Numéro français valide' })
  @IsOptional()
  @IsString()
  @Matches(/^(?:\+33|0)[1-9]\d{8}$/, {
    message: 'Le numéro de téléphone doit être un numéro français valide (ex: 0612345678 ou +33612345678).',
  })
  tel?: string;

  @ApiProperty({ enum: ['commercial', 'admin', 'bo'], required: false })
@IsEnum(['commercial', 'admin', 'bo'])
@IsOptional()
role?: string;
}
