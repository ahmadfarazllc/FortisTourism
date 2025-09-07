import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function setupVite(app, server) {
  const vite = await (await import("vite")).createServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: path.join(__dirname, "..", "client"),
  });

  app.use(vite.ssrFixStacktrace);
  app.use(vite.middlewares);
}

export function serveStatic(app) {
  const distPath = path.join(__dirname, "..", "dist");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      "Could not find the production build. Make sure to run \`npm run build\` first."
    );
  }

  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}