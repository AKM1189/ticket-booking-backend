import { IsNumber, IsString } from "class-validator";

export class CreateGenreDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  movieCount: number;

  @IsString()
  color: string;
}
