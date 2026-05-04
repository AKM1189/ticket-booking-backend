"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFileKeys = extractFileKeys;
function extractFileKeys(files, options) {
    const singleUrl = options.single && files[options.single]?.[0]?.key
        ? files[options.single][0].key
        : null;
    const multipleUrls = options.multiple && files[options.multiple]
        ? files[options.multiple].map((f) => f.key)
        : [];
    return {
        singleUrl,
        multipleUrls,
    };
}
//# sourceMappingURL=extractImage.js.map