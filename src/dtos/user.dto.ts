import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsString()
  @MinLength(5, { message: "Phone No must be at least 5 digits long." })
  @MaxLength(15, { message: "Phone No must not exceed 15 digits." })
  phoneNo: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @Matches(/(?=.*[0-9])/, {
    message: "Password must contain at least one number",
  })
  // @Matches(/(?=.*[A-Z])/, {
  //   message: "Password must contain at least one uppercase letter",
  // })
  password: string;
}

export class CreateAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  @IsString()
  @MinLength(5, { message: "Phone No must be at least 5 digits long." })
  @MaxLength(15, { message: "Phone No must not exceed 15 digits." })
  phoneNo: string;
}
