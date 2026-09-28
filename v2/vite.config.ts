import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solidStart(), tailwindcss()],
  // Dev-only: SolidStart's error viewer imports trace-mapping → resolve-uri (UMD).
  // Unbundled, the browser finds no default export and the viewer fails to load.
  optimizeDeps: {
    include: ["@solidjs/start > @jridgewell/trace-mapping"],
  },
  // Vite 8 defaults to 5173; 3000 is what SolidStart has always used and what
  // the project's docs reference.
  server: {
    port: 3000,
    // local.docker-compose.yaml puts Caddy in front of `vite dev`, which forwards
    // this Host header; Vite 403s any host it doesn't recognise. Dev-only — the
    // production build has no Vite server.
    allowedHosts: ["app.moss.local"],
  },
});
