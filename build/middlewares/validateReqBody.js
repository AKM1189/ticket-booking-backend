"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const formatErrors_1 = require("../utils/formatErrors");
function validateDto(dtoClass) {
    return async (req, res, next) => {
        try {
            const dtoInstance = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
            const errors = await (0, class_validator_1.validate)(dtoInstance);
            if (errors.length > 0) {
                const formattedErrors = (0, formatErrors_1.formatErrors)(errors);
                res.status(400).json({ error: formattedErrors });
                return;
            }
            next();
        }
        catch (err) {
            console.log("dto errorssss", err);
        }
    };
}
//# sourceMappingURL=validateReqBody.js.map