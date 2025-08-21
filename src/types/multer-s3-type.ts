export interface MulterFileWithLocation extends Express.Multer.File {
  location: string;
}
