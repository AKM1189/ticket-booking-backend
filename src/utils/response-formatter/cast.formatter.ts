import { Cast } from "../../entity/Cast";
import { getPublicUrl } from "../../middlewares/cloudinaryUpload";

export const formatCast = (cast: Cast) => {
  if (!cast) return cast;

  return {
    ...cast,

    image: cast.image
      ? {
          ...cast.image,
          url: getPublicUrl(cast.image.url, {
            quality: "auto",
            fetch_format: "auto",
          }),
        }
      : null,
  };
};

export const formatCasts = (casts: Cast[]) => {
  return casts.map(formatCast);
};
