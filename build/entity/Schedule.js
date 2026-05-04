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
exports.Schedule = void 0;
const typeorm_1 = require("typeorm");
const Movie_1 = require("./Movie");
const Theatre_1 = require("./Theatre");
const Screen_1 = require("./Screen");
const ScheduleSeatType_1 = require("./ScheduleSeatType");
const Booking_1 = require("./Booking");
let Schedule = class Schedule {
    id;
    showDate;
    showTime;
    multiplier;
    availableSeats;
    bookedSeats;
    status;
    language;
    subtitle;
    movie;
    theatre;
    screen;
    seatTypes;
    bookings;
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Schedule.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", String)
], Schedule.prototype, "showDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], Schedule.prototype, "showTime", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2, default: 1.0 }),
    __metadata("design:type", Number)
], Schedule.prototype, "multiplier", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Schedule.prototype, "availableSeats", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { nullable: true }),
    __metadata("design:type", Array)
], Schedule.prototype, "bookedSeats", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "subtitle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Movie_1.Movie),
    __metadata("design:type", Movie_1.Movie)
], Schedule.prototype, "movie", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Theatre_1.Theatre),
    __metadata("design:type", Theatre_1.Theatre)
], Schedule.prototype, "theatre", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Screen_1.Screen),
    __metadata("design:type", Screen_1.Screen)
], Schedule.prototype, "screen", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ScheduleSeatType_1.ScheduleSeatType, (scheduleSeatType) => scheduleSeatType.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "seatTypes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Booking_1.Booking, (booking) => booking.schedule),
    __metadata("design:type", Array)
], Schedule.prototype, "bookings", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)()
], Schedule);
//# sourceMappingURL=Schedule.js.map