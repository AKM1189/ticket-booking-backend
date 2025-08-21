import { IsString } from "class-validator";

export class CreateCastDto {
  @IsString()
  name: string;

  @IsString()
  role: string;
}
