import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
const server = await registerRoutes(app);

// Setup Vite or serve static files
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  await setupVite(app, server);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Fortis Tourism server running on port ${PORT}`);
  console.log(`🌐 Access your app at: http://0.0.0.0:${PORT}`);
});