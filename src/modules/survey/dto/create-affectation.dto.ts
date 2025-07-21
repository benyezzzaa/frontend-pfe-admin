import { IsNumber, IsArray, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

export class CreateAffectationDto {
  @IsNumber()
  @IsNotEmpty()
  commercialId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  clientIds: number[];
} 