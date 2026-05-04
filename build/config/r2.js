"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
exports.r2Client = new client_s3_1.S3Client({
    region: "auto", // required for Cloudflare R2
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    // 🔥 REQUIRED for Cloudflare R2
    forcePathStyle: true,
    // 🔥 REQUIRED to avoid TLS corruption
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});
const command = new client_s3_2.ListObjectsV2Command({
    Bucket: "image-bucket",
});
async function testfiles() {
    const response = await exports.r2Client.send(command);
}
testfiles();
//# sourceMappingURL=r2.js.map