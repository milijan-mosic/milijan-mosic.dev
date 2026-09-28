import { type Component, For } from "solid-js";
import { navigation, site } from "~/content";
import { Icon } from "~/components/ui/Icon";
import { reopen } from "~/lib/consent";

const half = Math.ceil(navigation.links.length / 2);
const leftLinks = navigation.links.slice(0, half);
const rightLinks = navigation.links.slice(half);

export const Footer: Component = () => (
  <footer class="glass-card p-8 pb-4 md:pb-0 lg:pb-8 my-16 mx-8 flex flex-col lg:flex-row items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]">
    <div class="flex flex-col w-full">
      <div class="flex flex-col pb-4 items-center w-full text-sm lg:p-0 lg:items-start">
        <p>{site.footer.identity}</p>
        <p>{site.footer.location}</p>
        <p>
          {site.footer.copyrightFrom}. — {new Date().getFullYear()}.
        </p>
        <button
          type="button"
          onClick={reopen}
          class="mt-1 underline hover:cursor-pointer animate hover:text-white"
        >
          {site.footer.cookieSettings}
        </button>
      </div>
      <ul class="flex flex-row justify-center w-full lg:-ml-1 lg:justify-start lg:mt-4">
        <For each={site.social}>
          {(link) => (
            <li>
              <a
                href={link.href}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                class="footer-nav-link animate"
              >
                {/* `.footer-nav-link` applies an `invert` filter, so the mark is
                    painted black here in order to come out white — same trick the
                    v1 black SVG <img> relied on. */}
                <Icon name={link.icon} class={`${link.size} text-black`} />
              </a>
            </li>
          )}
        </For>
      </ul>
    </div>
    <div class="h-4">
      <p class="text-transparent md:hidden">{site.footer.credits}</p>
    </div>
    <nav
      aria-label="Footer"
      class="flex flex-row justify-between mt-12 mb-4 w-full text-sm lg:my-0 lg:w-1/3"
    >
      <ul class="flex flex-col gap-4 items-end pr-4 w-1/2 p-4 md:p-8 lg:p-0 lg:pr-4">
        <For each={leftLinks}>
          {(link) => (
            <li>
              <a href={link.href} class="underline">
                {link.label}
              </a>
            </li>
          )}
        </For>
      </ul>
      <ul class="flex flex-col gap-4 items-start pl-4 w-1/2 p-4 md:p-8 lg:p-0 lg:pl-4">
        <For each={rightLinks}>
          {(link) => (
            <li>
              <a href={link.href} class="underline">
                {link.label}
              </a>
            </li>
          )}
        </For>
      </ul>
    </nav>
  </footer>
);
