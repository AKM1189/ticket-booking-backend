import { S3Client } from "@aws-sdk/client-s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";


export const r2Client = new S3Client({
  region: "auto", // required for Cloudflare R2
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
    // 🔥 REQUIRED for Cloudflare R2
  forcePathStyle: true,

  // 🔥 REQUIRED to avoid TLS corruption
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});


const command = new ListObjectsV2Command({
  Bucket: "image-bucket",
});

async function testfiles () {
  const response = await r2Client.send(command);
}

testfiles();


