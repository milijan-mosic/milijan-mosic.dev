import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { Toaster } from "solid-toast";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Suspense>{props.children}</Suspense>
          <Toaster
            position="bottom-center"
            toastOptions={{
              // Translucent navy under the glass keeps white text legible over
              // the light end of the shader.
              className: "glass-card bg-brand/50",
              // solid-toast inlines `background: white`, a 4px radius and its own
              // shadow, and inline styles beat classes — unset them so the
              // glass-card look applies.
              style: {
                background: undefined,
                "border-radius": undefined,
                "box-shadow": undefined,
                color: "whitesmoke",
                "font-size": "1rem",
                padding: "12px 16px",
              },
            }}
          />
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
