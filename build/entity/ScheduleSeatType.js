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
exports.ScheduleSeatType = void 0;
const typeorm_1 = require("typeorm");
const Schedule_1 = require("./Schedule");
const SeatType_1 = require("./SeatType");
let ScheduleSeatType = class ScheduleSeatType {
    id;
    schedule;
    seatType;
    price;
};
exports.ScheduleSeatType = ScheduleSeatType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ScheduleSeatType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Schedule_1.Schedule, (schedule) => schedule.seatTypes),
    __metadata("design:type", Schedule_1.Schedule)
], ScheduleSeatType.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SeatType_1.SeatType, (seatType) => seatType.screens),
    __metadata("design:type", SeatType_1.SeatType)
], ScheduleSeatType.prototype, "seatType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ScheduleSeatType.prototype, "price", void 0);
exports.ScheduleSeatType = ScheduleSeatType = __decorate([
    (0, typeorm_1.Entity)("schedule_seat_types")
], ScheduleSeatType);
//# sourceMappingURL=ScheduleSeatType.js.map