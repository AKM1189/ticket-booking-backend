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
exports.Cast = void 0;
const typeorm_1 = require("typeorm");
const Movie_1 = require("./Movie");
const Image_1 = require("./Image");
let Cast = class Cast {
    id;
    name;
    role;
    image;
    movies;
};
exports.Cast = Cast;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Cast.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cast.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Cast.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Image_1.Image),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Image_1.Image)
], Cast.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Movie_1.Movie, (movie) => movie.casts),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Cast.prototype, "movies", void 0);
exports.Cast = Cast = __decorate([
    (0, typeorm_1.Entity)()
], Cast);
//# sourceMappingURL=Cast.js.map