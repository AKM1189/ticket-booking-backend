export type LoginType = {
  email: string;
  password: string;
  role: string;
};

export enum Role {
  admin = "admin",
  user = "user",
  guest = "guest",
}
