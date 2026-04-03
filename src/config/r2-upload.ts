import multer from "multer";
import { r2Client } from "../config/r2";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export const upload = multer({
  storage: multer.memoryStorage(),
});

// {
//     s3: r2Client,
//     bucket: process.env.R2_BUCKET_NAME!,
//     acl: "public-read", // optional — remove if bucket is private
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (req, file, cb) => {
//       const filename = `movies/${Date.now()}-${file.originalname}`;
//       cb(null, filename);
//     },
//   }

export async function uploadToR2(
  file: Express.Multer.File,
  key: string
) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return key;
}
// export default upload;

export const deleteFromR2 = async (key: string) => {
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    );
  } catch (error) {
    console.error("Failed to delete image from R2:", error);
    throw error;
  }
};
