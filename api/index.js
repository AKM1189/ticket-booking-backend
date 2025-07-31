import { createApp } from "../src/app";
import serverless from "serverless-http";

const appPromise = createApp().catch((error) => {
  console.error("Failed to initialize app:", error);
  // Create a basic error-handling app if initialization fails
  const errorApp = require("express")();
  errorApp.use((req, res) => {
    res.status(500).json({ error: "Server initialization failed" });
  });
  return errorApp;
});

export default async function handler(req, res) {
  // res.status(200).json({ message: "Successfully deployed on Vercel" });
  const app = await appPromise;
  console.log("app", app);
  const handler = serverless(app);
  return handler(req, res);
}
