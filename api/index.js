// // api/index.js
// const { createApp } = require("../src/app");
// const serverless = require("serverless-http");
// const express = require("express");

// let cachedHandler;

// module.exports = async (req, res) => {
//   try {
//     if (!cachedHandler) {
//       console.log("Initializing app...");
//       const app = await createApp(); // must return a real express() instance
//       cachedHandler = serverless(app);
//       console.log("App initialized.");
//     }

//     return cachedHandler(req, res);
//   } catch (err) {
//     console.error("App failed to initialize:", err);

//     // Create fallback app for error response
//     const fallbackApp = express();
//     fallbackApp.use((req, res) => {
//       res.status(500).json({ error: "App initialization failed." });
//     });

//     return serverless(fallbackApp)(req, res);
//   }
// };
