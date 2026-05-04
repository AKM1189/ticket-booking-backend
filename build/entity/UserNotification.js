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
exports.UserNotification = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Notification_1 = require("./Notification");
let UserNotification = class UserNotification {
    id;
    user;
    notification;
    read;
    readAt;
};
exports.UserNotification = UserNotification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserNotification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.notifications),
    __metadata("design:type", User_1.User)
], UserNotification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Notification_1.Notification, (notification) => notification.users),
    __metadata("design:type", Notification_1.Notification)
], UserNotification.prototype, "notification", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], UserNotification.prototype, "read", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", String)
], UserNotification.prototype, "readAt", void 0);
exports.UserNotification = UserNotification = __decorate([
    (0, typeorm_1.Entity)()
], UserNotification);
//# sourceMappingURL=UserNotification.js.map