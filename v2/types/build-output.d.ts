/**
 * `vite build` emits dist/server/entry-server.js with no type declarations.
 * It default-exports an H3 app; the only member server.ts and the prerender
 * script touch is `fetch`, so that is all this declares.
 */
declare module "*/entry-server.js" {
  const app: {
    fetch: (request: Request) => Response | Promise<Response>;
  };
  export default app;
}
