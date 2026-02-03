import { MulterR2File } from "../types/multer-s3-file";

export function extractFileKeys<
  T extends Record<string, MulterR2File[] | undefined>
>(
  files: T,
  options: {
    single?: keyof T;
    multiple?: keyof T;
  }
) {
  const singleUrl =
    options.single && files[options.single]?.[0]?.key
      ? files[options.single]![0].key
      : null;

  const multipleUrls =
    options.multiple && files[options.multiple]
      ? files[options.multiple]!.map((f) => f.key!)
      : [];

  return {
    singleUrl,
    multipleUrls,
  };
}
