export interface MulterR2File extends Express.Multer.File {
  location: string;  // provided by multer-s3 / R2
  key: string;
}
