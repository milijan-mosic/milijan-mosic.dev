/**
 * SolidStart 2.x removed `server.prerender.routes` along with Nitro, and emits
 * zero HTML files. This is the SSG step the plan supplies in its place: render
 * each route through the built handler and write the markup into dist/client so
 * Caddy can serve it as a static file.
 *
 * The handler is invoked directly via `app.fetch(new Request(...))` — no socket
 * is opened. An earlier version booted a real server on a fixed port, which
 * broke the build with EADDRINUSE whenever that port was already taken.
 *
 * Runs as `postbuild`. If dist/client ends up without index.html, this step
 * failed and the deploy would serve nothing.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import app from "../dist/server/entry-server.js";

const ROUTES = ["/", "/404"] as const;
const OUTPUT_DIR = fileURLToPath(new URL("../dist/client/", import.meta.url));
/** Only used to build a valid Request; nothing ever binds to it. */
const ORIGIN = "http://localhost";
/** Below this, the handler returned a shell without any rendered content. */
const MIN_PLAUSIBLE_HTML_BYTES = 1000;

function outputPathFor(route: string): string {
  return join(OUTPUT_DIR, route === "/" ? "index.html" : `${route.slice(1)}.html`);
}

let failed = false;

for (const route of ROUTES) {
  const response = await app.fetch(new Request(`${ORIGIN}${route}`));
  const html = await response.text();

  // The 404 route legitimately answers 404; anything else must be a 200.
  const expected = route === "/404" ? 404 : 200;
  if (response.status !== expected) {
    console.error(`✗ ${route} returned ${response.status}, expected ${expected}`);
    failed = true;
    continue;
  }

  if (!html.includes("<html") || html.length < MIN_PLAUSIBLE_HTML_BYTES) {
    console.error(`✗ ${route} produced ${html.length} bytes — markup looks empty`);
    failed = true;
    continue;
  }

  const target = outputPathFor(route);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
  console.log(
    `✓ prerendered ${route} → ${target.replace(OUTPUT_DIR, "dist/client/")} (${html.length} bytes)`,
  );
}

if (failed) {
  process.exitCode = 1;
}
