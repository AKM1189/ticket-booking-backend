import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.FILEBASE_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET!,
  },
  endpoint: process.env.FILEBASE_ENDPOINT,
  forcePathStyle: true, // important for Filebase
});
