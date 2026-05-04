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
exports.ScreenSeatType = void 0;
const typeorm_1 = require("typeorm");
const Screen_1 = require("./Screen");
const SeatType_1 = require("./SeatType");
let ScreenSeatType = class ScreenSeatType {
    id;
    screen;
    seatType;
    // 👉 Add new column here
    seatList;
};
exports.ScreenSeatType = ScreenSeatType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ScreenSeatType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Screen_1.Screen, (screen) => screen.seatTypes, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Screen_1.Screen)
], ScreenSeatType.prototype, "screen", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SeatType_1.SeatType, (seatType) => seatType.screens, {
        onDelete: "CASCADE",
    }),
    __metadata("design:type", SeatType_1.SeatType)
], ScreenSeatType.prototype, "seatType", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], ScreenSeatType.prototype, "seatList", void 0);
exports.ScreenSeatType = ScreenSeatType = __decorate([
    (0, typeorm_1.Entity)("screen_seat_types")
], ScreenSeatType);
//# sourceMappingURL=ScreenSeatType.js.map