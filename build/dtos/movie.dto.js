"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMovieDto = void 0;
const class_validator_1 = require("class-validator");
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
class CreateMovieDto {
    title;
    description;
    duration;
    language;
    subtitle;
    releaseDate;
    trailerId;
    experience;
    genres;
}
exports.CreateMovieDto = CreateMovieDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMovieDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMovieDto.prototype, "subtitle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "releaseDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMovieDto.prototype, "trailerId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMovieDto.prototype, "experience", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateMovieDto.prototype, "genres", void 0);
//# sourceMappingURL=movie.dto.js.map