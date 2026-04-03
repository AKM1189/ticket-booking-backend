import { Router } from "express";

const router = Router();

router.post("/upload-image", (req, res): void => {
  if (!req.file) {
     res.status(400).json({ error: "No file uploaded" });
     return;
  }

  const imageUrl = (req.file as any).location; // provided by multer-s3

  res.json({
    message: "Upload successful",
    imageUrl,
  });
});

export default router;
