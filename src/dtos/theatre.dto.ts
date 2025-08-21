import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTheatreDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsString()
  @MinLength(5, { message: "Phone No must be at least 5 digits long." })
  @MaxLength(15, { message: "Phone No must not exceed 15 digits." })
  phoneNo: string;
}
