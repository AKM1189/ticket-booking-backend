import { IsDecimal, IsString } from "class-validator";

export class CreateSeatTypeDto {
  @IsString()
  name: string;

  @IsDecimal()
  price: number;
}
