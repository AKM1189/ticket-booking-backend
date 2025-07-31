import { IsNumber, IsString } from "class-validator";

export class CreateGenreDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  color: string;
}
