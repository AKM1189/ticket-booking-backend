import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsNumber,
  IsString,
} from "class-validator";

export class CreateScreenDto {
  @IsString()
  name: string;

  @IsNumber()
  capacity: number;

  @IsNumber()
  rows: number;

  @IsNumber()
  cols: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  multiplier: number;

  @IsString()
  type: string;

  @IsBoolean()
  active: boolean;

  @IsArray()
  @IsString({ each: true })
  disabledSeats: string[];

  @IsArray()
  aisles: number[];
}
