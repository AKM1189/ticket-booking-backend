import {
  IsArray,
  IsString,
} from "class-validator";

// @ValidatorConstraint({ name: "isValidImageArray", async: false })
// class IsValidImageArray implements ValidatorConstraintInterface {
//   validate(files: MulterFile[], args: ValidationArguments): boolean {
//     if (!files || !Array.isArray(files) || files.length === 0) {
//       return false;
//     }

//     return files.every((file) => {
//       const isImage = file.mimetype.startsWith("image/");
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       return isImage && file.size <= maxSize;
//     });
//   }

//   defaultMessage(args: ValidationArguments): string {
//     return "Each file must be an image and not exceed 5MB.";
//   }
// }
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

  @IsString()
  releaseDate: string;

  @IsString()
  trailerId: string;

  @IsArray()
  @IsString({ each: true })
  experience: string[];

  @IsArray()
  @IsString({ each: true })
  genres: string[];
}
