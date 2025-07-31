import { createApp } from "../src/app";
import serverless from "serverless-http";

let cachedHandler;

export default async function handler(req, res) {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  // res.status(200).json({ message: "Hello from Vercel!" });
  return cachedHandler(req, res);
}
