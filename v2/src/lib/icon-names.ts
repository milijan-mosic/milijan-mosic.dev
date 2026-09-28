/**
 * The FontAwesome half of the icon vocabulary. Kept in a plain module with no
 * Vite-only syntax so `scripts/validate-content.ts` can import it under bare
 * Node; `Icon.tsx` types its registry against it, so adding a name here without
 * wiring up the icon is a compile error rather than a silently missing glyph.
 */
export const FONT_AWESOME_ICON_NAMES = [
  "bars",
  "xmark",
  "envelope",
  "location-pin",
  "web",
  "cloud",
  "desktop",
  "mobile",
  "github",
  "linkedin",
] as const;

export type FontAwesomeIconName = (typeof FONT_AWESOME_ICON_NAMES)[number];
