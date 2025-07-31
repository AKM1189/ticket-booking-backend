// import { createApp } from "../src/app";
// import serverless from "serverless-http";

// const appPromise = createApp().catch((error) => {
//   console.error("Failed to initialize app:", error);
//   // Create a basic error-handling app if initialization fails
//   const errorApp = require("express")();
//   errorApp.use((req, res) => {
//     res.status(500).json({ error: "Server initialization failed" });
//   });
//   return errorApp;
// });

// export default async function handler(req, res) {
//   // res.status(200).json({ message: "Successfully deployed on Vercel" });//////
//   const app = await appPromise;
//   console.log("app", app);
//   const handler = serverless(app);
//   return handler(req, res);
// }

// api/index.js
const { createApp } = require("../src/app");
const serverless = require("serverless-http");
const express = require("express");

let cachedHandler;

module.exports = async (req, res) => {
  try {
    if (!cachedHandler) {
      console.log("Initializing app...");
      const app = await createApp(); // must return a real express() instance
      cachedHandler = serverless(app);
      console.log("App initialized.");
    }

    return cachedHandler(req, res);
  } catch (err) {
    console.error("App failed to initialize:", err);

    // Create fallback app for error response
    const fallbackApp = express();
    fallbackApp.use((req, res) => {
      res.status(500).json({ error: "App initialization failed." });
    });

    return serverless(fallbackApp)(req, res);
  }
};
