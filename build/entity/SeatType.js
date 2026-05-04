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
exports.SeatType = void 0;
const typeorm_1 = require("typeorm");
const ScreenSeatType_1 = require("./ScreenSeatType");
const ScheduleSeatType_1 = require("./ScheduleSeatType");
let SeatType = class SeatType {
    id;
    name;
    price;
    screens;
    schedules;
};
exports.SeatType = SeatType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SeatType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SeatType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SeatType.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ScreenSeatType_1.ScreenSeatType, (screenSeatType) => screenSeatType.seatType),
    __metadata("design:type", Array)
], SeatType.prototype, "screens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ScheduleSeatType_1.ScheduleSeatType, (scheduleSeatType) => scheduleSeatType.seatType),
    __metadata("design:type", Array)
], SeatType.prototype, "schedules", void 0);
exports.SeatType = SeatType = __decorate([
    (0, typeorm_1.Entity)()
], SeatType);
//# sourceMappingURL=SeatType.js.map