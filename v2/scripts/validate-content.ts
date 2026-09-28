/**
 * Zod-checks every file in content/ as a standalone Node script rather than at
 * module load, which keeps Zod out of the client bundle while still catching
 * the errors TypeScript cannot see: unknown icon names, image paths that do not
 * exist on disk, and empty strings in required fields.
 *
 * Wired into `prebuild`, so a malformed content edit fails the build loudly.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { FONT_AWESOME_ICON_NAMES } from "../src/lib/icon-names.ts";

const root = new URL("..", import.meta.url).pathname;
const contentDir = join(root, "content");
const publicDir = join(root, "public");
const localIconDir = join(root, "src/assets/icons");

const localIconNames = readdirSync(localIconDir)
  .filter((file) => file.endsWith(".svg"))
  .map((file) => file.slice(0, -".svg".length));

const iconNames = new Set<string>([...FONT_AWESOME_ICON_NAMES, ...localIconNames]);

const nonEmpty = z.string().trim().min(1, "must not be empty");

const iconName = nonEmpty.refine((value) => iconNames.has(value), {
  message: `unknown icon — expected one of: ${[...iconNames].sort().join(", ")}`,
});

/** Content references images by their public URL, which must resolve to a real file. */
const assetPath = nonEmpty
  .refine((value) => value.startsWith("/"), { message: "must be an absolute path" })
  .refine((value) => existsSync(join(publicDir, value)), {
    message: "file does not exist under public/",
  });

const link = z.object({ href: nonEmpty, label: nonEmpty });

const schemas = {
  "site.json": z.object({
    name: nonEmpty,
    role: nonEmpty,
    title: nonEmpty,
    description: nonEmpty,
    author: nonEmpty,
    canonical: z.string().url(),
    email: z.string().email(),
    locale: nonEmpty,
    footer: z.object({
      identity: nonEmpty,
      location: nonEmpty,
      copyrightFrom: nonEmpty,
      credits: nonEmpty,
      cookieSettings: nonEmpty,
    }),
    social: z
      .array(z.object({ icon: iconName, href: nonEmpty, label: nonEmpty, size: nonEmpty }))
      .min(1),
  }),

  "hero.json": z.object({
    image: assetPath,
    imageAlt: nonEmpty,
    name: nonEmpty,
    role: nonEmpty,
    tagline: nonEmpty,
    motto: nonEmpty,
    primaryAction: link,
    secondaryAction: link,
  }),

  "navigation.json": z.object({ links: z.array(link).min(1) }),

  "about.json": z.object({
    title: nonEmpty,
    paragraphs: z.array(nonEmpty).min(1),
    experienceTitle: nonEmpty,
    experience: z.array(nonEmpty).min(1),
    educationTitle: nonEmpty,
    education: z.array(nonEmpty).min(1),
  }),

  "services.json": z.object({
    title: nonEmpty,
    items: z.array(z.object({ icon: iconName, title: nonEmpty, paragraph: nonEmpty })).min(1),
    outro: nonEmpty,
    action: link,
  }),

  "skills.json": z.object({
    title: nonEmpty,
    groups: z
      .array(
        z.object({
          title: nonEmpty,
          skills: z.array(z.object({ icon: iconName, name: nonEmpty })).min(1),
        }),
      )
      .min(1),
  }),

  "projects.json": z.object({
    title: nonEmpty,
    items: z
      .array(
        z.object({
          name: nonEmpty,
          type: nonEmpty,
          description: nonEmpty,
          technologies: z.array(nonEmpty).min(1),
          role: z.array(nonEmpty).min(1),
          thumbnail: assetPath,
        }),
      )
      .min(1),
    action: link,
  }),

  "testimonials.json": z.object({
    groups: z
      .array(
        z.object({
          title: nonEmpty,
          entries: z
            .array(
              z.object({
                image: assetPath,
                name: nonEmpty,
                company: nonEmpty,
                message: nonEmpty,
              }),
            )
            .min(1),
        }),
      )
      .min(1),
  }),

  "contact.json": z.object({
    title: nonEmpty,
    intro: nonEmpty,
    fields: z.object({
      name: z.object({ label: nonEmpty, placeholder: nonEmpty }),
      email: z.object({ label: nonEmpty, placeholder: nonEmpty }),
      request: z.object({ label: nonEmpty, placeholder: nonEmpty }),
    }),
    submitLabel: nonEmpty,
    submittingLabel: nonEmpty,
    successMessage: nonEmpty,
    errorMessage: nonEmpty,
    recaptchaNotice: z.object({
      prefix: nonEmpty,
      privacyLabel: nonEmpty,
      privacyHref: z.string().url(),
      middle: nonEmpty,
      termsLabel: nonEmpty,
      termsHref: z.string().url(),
      suffix: nonEmpty,
    }),
  }),

  "consent.json": z.object({
    message: nonEmpty,
    acceptLabel: nonEmpty,
    rejectLabel: nonEmpty,
  }),
} as const;

let failures = 0;

for (const [file, schema] of Object.entries(schemas)) {
  const path = join(contentDir, file);

  if (!existsSync(path)) {
    console.error(`✗ ${file}: missing`);
    failures += 1;
    continue;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    console.error(`✗ ${file}: invalid JSON — ${(error as Error).message}`);
    failures += 1;
    continue;
  }

  const result = schema.safeParse(parsed);
  if (result.success) {
    console.log(`✓ ${file}`);
    continue;
  }

  failures += 1;
  for (const issue of result.error.issues) {
    console.error(`✗ ${file} at "${issue.path.join(".") || "(root)"}": ${issue.message}`);
  }
}

// Anything in content/ without a schema is almost certainly a typo in a filename.
for (const file of readdirSync(contentDir)) {
  if (file.endsWith(".json") && !(file in schemas)) {
    console.error(`✗ ${file}: no schema defined for this file`);
    failures += 1;
  }
}

if (failures > 0) {
  console.error(`\n${failures} content file(s) failed validation.`);
  process.exit(1);
}

console.log("\nAll content files are valid.");
