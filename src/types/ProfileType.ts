import { Role } from "./AuthType";

export type PasswordInputType = {
  currentPassword: string;
  newPassword: string;
};

export type ProfileInputType = {
  name: string;
  email: string;
  phoneNo: string;
};
