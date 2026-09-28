import { type Component, Show } from "solid-js";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faCloud } from "@fortawesome/free-solid-svg-icons/faCloud";
import { faDesktop } from "@fortawesome/free-solid-svg-icons/faDesktop";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons/faEnvelope";
import { faGlobe } from "@fortawesome/free-solid-svg-icons/faGlobe";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons/faLocationDot";
import { faMobileScreen } from "@fortawesome/free-solid-svg-icons/faMobileScreen";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons/faLinkedin";
import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
import type { FontAwesomeIconName } from "~/lib/icon-names";

/**
 * Icon names are keys in content JSON, so the two registries below define the
 * full vocabulary a content editor may reference. `scripts/validate-content.ts`
 * checks edits against exactly this set.
 */
const fontAwesomeIcons: Record<FontAwesomeIconName, IconDefinition> = {
  bars: faBars,
  xmark: faXmark,
  envelope: faEnvelope,
  "location-pin": faLocationDot,
  web: faGlobe,
  cloud: faCloud,
  desktop: faDesktop,
  mobile: faMobileScreen,
  github: faGithub,
  linkedin: faLinkedin,
};

interface ParsedSvg {
  viewBox: string;
  inner: string;
}

const VIEW_BOX_PATTERN = /viewBox="([^"]+)"/;

/**
 * Tech marks have no FontAwesome equivalent (or only a monochrome one that
 * would visibly change the Skills grid), so they stay as the project's own
 * SVGs — glob-imported at build time, which also removes ~34 image requests.
 */
const localIcons: Record<string, ParsedSvg> = Object.fromEntries(
  Object.entries(
    import.meta.glob("../../assets/icons/*.svg", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>,
  ).map(([path, markup]) => {
    const name = path.slice(path.lastIndexOf("/") + 1, -".svg".length);
    const inner = markup
      .replace(/^[\s\S]*?<svg[^>]*>/, "")
      .replace(/<\/svg>\s*$/, "")
      .replace(/<title>[\s\S]*?<\/title>/g, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim();

    return [name, { viewBox: markup.match(VIEW_BOX_PATTERN)?.[1] ?? "0 0 24 24", inner }];
  }),
);

export const iconNames: readonly string[] = [
  ...Object.keys(fontAwesomeIcons),
  ...Object.keys(localIcons),
];

interface IconProps {
  name: string;
  class?: string;
  /** Omit for decorative icons — the surrounding text or aria-label carries the meaning. */
  label?: string;
}

export const Icon: Component<IconProps> = (props) => {
  const registry: Record<string, IconDefinition | undefined> = fontAwesomeIcons;
  const fontAwesome = () => registry[props.name];
  const local = () => localIcons[props.name];

  const a11y = () =>
    props.label
      ? { role: "img" as const, "aria-label": props.label }
      : { "aria-hidden": "true" as const };

  return (
    <Show
      when={fontAwesome()}
      fallback={
        <Show when={local()}>
          {(svg) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={svg().viewBox}
              class={props.class}
              fill="currentColor"
              innerHTML={svg().inner}
              {...a11y()}
            />
          )}
        </Show>
      }
    >
      {(icon) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${icon().icon[0]} ${icon().icon[1]}`}
          class={props.class}
          fill="currentColor"
          {...a11y()}
        >
          <path d={icon().icon[4] as string} />
        </svg>
      )}
    </Show>
  );
};
