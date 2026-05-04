"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatErrors = void 0;
const formatErrors = (errors) => {
    return errors.map((error) => {
        const messages = error.constraints
            ? Object.values(error.constraints)
            : [];
        return {
            property: error.property,
            message: messages.join(", "),
        };
    });
};
exports.formatErrors = formatErrors;
//# sourceMappingURL=formatErrors.js.map