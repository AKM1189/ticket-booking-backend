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
exports.Theatre = void 0;
const typeorm_1 = require("typeorm");
const Screen_1 = require("./Screen");
const Schedule_1 = require("./Schedule");
const User_1 = require("./User");
let Theatre = class Theatre {
    id;
    name;
    location;
    region;
    city;
    phoneNo;
    totalScreens;
    active;
    screens;
    schedules;
    staffs;
};
exports.Theatre = Theatre;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Theatre.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Theatre.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "longtext" }),
    __metadata("design:type", String)
], Theatre.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Theatre.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Theatre.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Theatre.prototype, "phoneNo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Theatre.prototype, "totalScreens", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Theatre.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Screen_1.Screen, (screen) => screen.theatre),
    __metadata("design:type", Array)
], Theatre.prototype, "screens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Schedule_1.Schedule, (schedule) => schedule.theatre),
    __metadata("design:type", Array)
], Theatre.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1.User, (user) => user.theatre),
    __metadata("design:type", Array)
], Theatre.prototype, "staffs", void 0);
exports.Theatre = Theatre = __decorate([
    (0, typeorm_1.Entity)()
], Theatre);
//# sourceMappingURL=Theatre.js.map