import { type Component, createSignal, For, onCleanup, onMount } from "solid-js";
import { navigation } from "~/content";
import { Icon } from "~/components/ui/Icon";

/** Matches the v1 threshold in static/js/index.js — the bar appears past the hero. */
const REVEAL_AFTER_SCROLL_Y = 900;
const OPEN_MAX_HEIGHT = "500px";
const CLOSED_MAX_HEIGHT = "0px";

export const Navbar: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [isOpen, setIsOpen] = createSignal(false);

  onMount(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const visible = window.scrollY > REVEAL_AFTER_SCROLL_Y;
      setIsVisible(visible);
      // Scrolling back up past the threshold hides the bar, so an open menu
      // must not linger behind it.
      if (!visible) setIsOpen(false);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", onScroll));
  });

  return (
    <nav
      id="navbar"
      aria-label="Main"
      classList={{
        "fixed z-50 w-full rounded-t-none rounded-b-3xl glass-card lg:hidden animate": true,
        "opacity-0": !isVisible(),
        "opacity-100": isVisible(),
      }}
      // The bar is only faded out, so without this its links stay tabbable
      // while invisible. `inert` also hides it from the accessibility tree —
      // `aria-hidden` alone would be an axe violation with focusable children.
      inert={!isVisible() || undefined}
    >
      <div class="flex justify-between items-center p-2 mx-auto max-w-6xl">
        <img
          src="/static/images/logo-128.webp"
          alt="Logo of the website"
          class="w-16 h-16 rounded-2xl"
          width="128"
          height="128"
        />
        <button
          id="menuToggle"
          type="button"
          class="p-1 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen()}
          aria-controls="mobileMenu"
          onClick={() => setIsOpen(!isOpen())}
        >
          <Icon name={isOpen() ? "xmark" : "bars"} class="w-8 h-8 text-2xl" />
        </button>
      </div>
      <div
        id="mobileMenu"
        class="overflow-hidden max-h-0 lg:hidden animate"
        style={{ "max-height": isOpen() ? OPEN_MAX_HEIGHT : CLOSED_MAX_HEIGHT }}
      >
        <ul class="flex flex-col items-center">
          <For each={navigation.links}>
            {(link) => (
              // `flex` here keeps the <a> a flex child, so `.mobile-nav-link`'s
              // w-full and block padding still apply — an inline <a> would
              // silently ignore both.
              <li class="w-full flex">
                <a
                  class="mobile-nav-link animate"
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
    </nav>
  );
};
