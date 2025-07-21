import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateClientStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
