// src/modules/user/dto/update-user.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDefined } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  
 /*  @ApiProperty({ example: true })
  @IsDefined({ message: 'Le champ isActive est requis' })
  @IsBoolean({ message: 'Le champ isActive doit être un booléen' })
  isActive!: boolean; */

}
