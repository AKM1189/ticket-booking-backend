const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

console.log("ENV CHECK:", {
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY,
  R2_SECRET_KEY: process.env.R2_SECRET_KEY,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
});

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

(async () => {
  try {
    const res = await r2.send(new ListBucketsCommand({}));
    console.log("✅ R2 connected:", res);
  } catch (err) {
    console.error("❌ R2 error:", err);
  }
})();
