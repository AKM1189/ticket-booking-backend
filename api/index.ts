// api/index.ts
import { createApp } from "../src/app";
import serverless from "serverless-http";

let cachedHandler: any;

export default async function handler(req: any, res: any) {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
}
