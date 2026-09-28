import { type Component, onCleanup, onMount } from "solid-js";
import type { ShaderHandle } from "./webgl";

/**
 * Rendered via clientOnly() by the caller, so nothing WebGL-related runs during
 * the prerender pass. The module itself is imported lazily and the loop only
 * starts once the browser is idle, keeping it off the critical path while LCP
 * is being measured.
 */
export const ShaderBackground: Component = () => {
  let container: HTMLDivElement | undefined;
  let handle: ShaderHandle | undefined;
  let disposed = false;

  onMount(() => {
    const startWhenIdle = () => {
      void import("./webgl").then(({ initShader }) => {
        if (disposed || !container) return;
        handle = initShader(container);
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(startWhenIdle, { timeout: 2000 });
      onCleanup(() => window.cancelIdleCallback(id));
    } else {
      const id = window.setTimeout(startWhenIdle, 200);
      onCleanup(() => window.clearTimeout(id));
    }
  });

  onCleanup(() => {
    disposed = true;
    handle?.dispose();
  });

  return <div ref={container} id="background" class="fixed top-0 w-screen h-screen" />;
};

export default ShaderBackground;
