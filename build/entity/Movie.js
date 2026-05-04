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
exports.Movie = void 0;
const typeorm_1 = require("typeorm");
const Genre_1 = require("./Genre");
const Review_1 = require("./Review");
const Cast_1 = require("./Cast");
const Image_1 = require("./Image");
const Schedule_1 = require("./Schedule");
let Movie = class Movie {
    id;
    title;
    description;
    duration;
    language;
    subtitle;
    releaseDate;
    status;
    trailerId;
    experience;
    rating;
    createdAt;
    updatedAt;
    genres;
    casts;
    reviews;
    poster;
    photos;
    schedules;
};
exports.Movie = Movie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Movie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Movie.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "longtext" }),
    __metadata("design:type", String)
], Movie.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Movie.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Movie.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Movie.prototype, "subtitle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Movie.prototype, "releaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Movie.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "trailerId", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    __metadata("design:type", Array)
], Movie.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2, default: 1.0 }),
    __metadata("design:type", Number)
], Movie.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Movie.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Movie.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Genre_1.Genre),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Movie.prototype, "genres", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Cast_1.Cast, (cast) => cast.movies, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Movie.prototype, "casts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Review_1.Review, (review) => review.movie),
    __metadata("design:type", Array)
], Movie.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Image_1.Image),
    __metadata("design:type", Image_1.Image)
], Movie.prototype, "poster", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Image_1.Image),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Movie.prototype, "photos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Schedule_1.Schedule, (schedule) => schedule.movie),
    __metadata("design:type", Array)
], Movie.prototype, "schedules", void 0);
exports.Movie = Movie = __decorate([
    (0, typeorm_1.Entity)()
], Movie);
//# sourceMappingURL=Movie.js.map