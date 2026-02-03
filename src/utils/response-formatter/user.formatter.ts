import { User } from "../../entity/User";
import { getPublicUrl } from "../../middlewares/cloudinaryUpload";

export const formatUser = (user: User) => {
  if (!user) return user;

  return {
    ...user,

    image: user.image
      ? {
          ...user.image,
          url: getPublicUrl(user.image.url, {
            quality: "auto",
            fetch_format: "auto",
          }),
        }
      : null,
  };
};

export const formatUsers = (users: User[]) => {
  return users.map(formatUser);
};
