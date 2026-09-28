/**
 * SolidStart 2.x emits an H3 app, not a listening server — `node
 * dist/server/entry-server.js` does nothing on its own. This is the handful of
 * lines that give it a port, replacing the `node-server` preset 1.x had built in.
 *
 * In production Caddy serves the prerendered HTML and assets directly; this
 * process exists so /api/contact has somewhere to run.
 *
 * Runs under Node's native type stripping, so there is no build step for it.
 */
import { serve } from "srvx";
import app from "./dist/server/entry-server.js";

const port = Number(process.env.PORT ?? 40000);

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });

console.log(`Listening on port: ${port}`);
