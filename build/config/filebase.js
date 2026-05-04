"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3 = new client_s3_1.S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.FILEBASE_KEY,
        secretAccessKey: process.env.FILEBASE_SECRET,
    },
    endpoint: process.env.FILEBASE_ENDPOINT,
    forcePathStyle: true, // important for Filebase
});
//# sourceMappingURL=filebase.js.map