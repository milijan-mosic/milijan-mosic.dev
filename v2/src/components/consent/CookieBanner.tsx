import { type Component, onMount, Show } from "solid-js";
import { consent as copy } from "~/content";
import { accept, initConsent, isBannerOpen, reject } from "~/lib/consent";

export const CookieBanner: Component = () => {
  onMount(initConsent);

  return (
    <Show when={isBannerOpen()}>
      {/* Fixed and overlaid, so appearing after hydration cannot shift the page. */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        class="glass-card animate fixed bottom-0 left-0 right-0 z-50 m-4 p-4 flex flex-col gap-4 items-center lg:flex-row lg:justify-between lg:mx-auto lg:max-w-4xl"
      >
        <p class="text-sm text-center lg:text-start">{copy.message}</p>
        <div class="flex flex-row gap-2 shrink-0">
          <button
            type="button"
            onClick={reject}
            class="flex justify-center items-center p-2 px-4 text-sm rounded-full border border-white/35 hover:text-black hover:bg-white animate hover:cursor-pointer"
          >
            {copy.rejectLabel}
          </button>
          <button
            type="button"
            onClick={accept}
            class="p-2 px-4 text-sm bg-brand rounded-full border-brand-mid animate border hover:border-white hover:bg-white hover:text-black hover:cursor-pointer"
          >
            {copy.acceptLabel}
          </button>
        </div>
      </div>
    </Show>
  );
};
