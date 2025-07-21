// 📁 src/circuit/dto/create-circuit.dto.ts
import { IsDateString, IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCircuitDto {

   @ApiProperty({ example: '2025-05-22' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  clientIds: number[];
}
