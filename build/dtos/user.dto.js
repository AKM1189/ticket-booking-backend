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
exports.CreateAdminDto = exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUserDto {
    name;
    email;
    role;
    phoneNo;
    // @Matches(/(?=.*[A-Z])/, {
    //   message: "Password must contain at least one uppercase letter",
    // })
    password;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: "Phone No must be at least 5 digits long." }),
    (0, class_validator_1.MaxLength)(15, { message: "Phone No must not exceed 15 digits." }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: "Password must be at least 6 characters long" }),
    (0, class_validator_1.Matches)(/(?=.*[0-9])/, {
        message: "Password must contain at least one number",
    })
    // @Matches(/(?=.*[A-Z])/, {
    //   message: "Password must contain at least one uppercase letter",
    // })
    ,
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
class CreateAdminDto {
    name;
    email;
    role;
    phoneNo;
}
exports.CreateAdminDto = CreateAdminDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: "Phone No must be at least 5 digits long." }),
    (0, class_validator_1.MaxLength)(15, { message: "Phone No must not exceed 15 digits." }),
    __metadata("design:type", String)
], CreateAdminDto.prototype, "phoneNo", void 0);
//# sourceMappingURL=user.dto.js.map