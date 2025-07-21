import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'ali.bensalah@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MotDePasse123' })
  @IsString()
  password: string;
}
