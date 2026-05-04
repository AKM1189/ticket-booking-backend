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
exports.Screen = void 0;
const typeorm_1 = require("typeorm");
const Theatre_1 = require("./Theatre");
const ScreenSeatType_1 = require("./ScreenSeatType");
const Schedule_1 = require("./Schedule");
let Screen = class Screen {
    id;
    name;
    capacity;
    rows;
    cols;
    type;
    active;
    multiplier;
    disabledSeats;
    aisles;
    createdAt;
    updatedAt;
    theatre;
    seatTypes;
    schedules;
};
exports.Screen = Screen;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Screen.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Screen.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Screen.prototype, "capacity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Screen.prototype, "rows", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Screen.prototype, "cols", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Screen.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Screen.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2, default: 1.0 }),
    __metadata("design:type", Number)
], Screen.prototype, "multiplier", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Screen.prototype, "disabledSeats", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Screen.prototype, "aisles", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Screen.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Screen.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Theatre_1.Theatre),
    __metadata("design:type", Theatre_1.Theatre)
], Screen.prototype, "theatre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ScreenSeatType_1.ScreenSeatType, (screenSeatType) => screenSeatType.screen),
    __metadata("design:type", Array)
], Screen.prototype, "seatTypes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Schedule_1.Schedule, (schedule) => schedule.screen),
    __metadata("design:type", Array)
], Screen.prototype, "schedules", void 0);
exports.Screen = Screen = __decorate([
    (0, typeorm_1.Entity)()
], Screen);
//# sourceMappingURL=Screen.js.map