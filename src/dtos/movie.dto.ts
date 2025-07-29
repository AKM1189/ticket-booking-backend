import { IsArray, IsDate, IsString } from "class-validator";

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  duration: string;

  @IsArray()
  @IsString({ each: true })
  language: string[];

  @IsArray()
  @IsString({ each: true })
  subtitle: string[];

  @IsDate()
  releaseDate: Date;

  @IsString()
  status: string;

  @IsString()
  posterUrl: string;

  @IsString()
  trailerId: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsArray()
  @IsString({ each: true })
  experience: string[];

  @IsArray()
  @IsString({ each: true })
  genres: string[];
}
