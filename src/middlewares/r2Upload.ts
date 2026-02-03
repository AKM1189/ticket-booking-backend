import multer from "multer";
import multerS3 from "multer-s3";
import { r2 } from "../config/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export const r2Upload = multer({
  storage: multerS3({
    s3: r2,
    bucket: process.env.R2_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      const filename = `movies/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});

export const deleteFromR2 = async (key: string) => {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }),
  );
};
