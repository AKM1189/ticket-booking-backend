"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = generatePassword;
const crypto_1 = __importDefault(require("crypto"));
function generatePassword(length = 12) {
    return crypto_1.default
        .randomBytes(length)
        .toString("base64") // convert to readable chars
        .slice(0, length) // trim to desired length
        .replace(/\+/g, "A") // avoid special chars that can cause issues
        .replace(/\//g, "B");
}
//# sourceMappingURL=generatePassword.js.map