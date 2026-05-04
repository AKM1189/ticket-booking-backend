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
exports.Booking = void 0;
const typeorm_1 = require("typeorm");
const Schedule_1 = require("./Schedule");
const User_1 = require("./User");
const Ticket_1 = require("./Ticket");
let Booking = class Booking {
    id;
    bookingDate;
    seatList;
    totalAmount;
    status;
    customerName;
    customerEmail;
    customerPhone;
    cancelledReason;
    note;
    schedule;
    user;
    ticket;
};
exports.Booking = Booking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Booking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Booking.prototype, "bookingDate", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Booking.prototype, "seatList", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2, default: 1.0 }),
    __metadata("design:type", String)
], Booking.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Booking.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "customerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Booking.prototype, "customerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], Booking.prototype, "cancelledReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "longtext" }),
    __metadata("design:type", String)
], Booking.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Schedule_1.Schedule, (schedule) => schedule.bookings),
    __metadata("design:type", Schedule_1.Schedule)
], Booking.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.bookings),
    __metadata("design:type", User_1.User)
], Booking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Ticket_1.Ticket),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Ticket_1.Ticket)
], Booking.prototype, "ticket", void 0);
exports.Booking = Booking = __decorate([
    (0, typeorm_1.Entity)()
], Booking);
//# sourceMappingURL=Booking.js.map