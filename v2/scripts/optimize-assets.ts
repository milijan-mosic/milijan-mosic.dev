/**
 * One-off asset pipeline: resizes the v1 images down to the sizes they are
 * actually displayed at and regenerates the full icon set from the logo
 * masters. Outputs are committed, so a deploy never runs sharp.
 *
 * Run with `npm run optimize:assets`.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = new URL("..", import.meta.url).pathname;
const repoRoot = join(root, "..");
const sourceImages = join(repoRoot, "src/static/images");
const outputImages = join(root, "public/static/images");
const outputPublic = join(root, "public");

const WEBP_QUALITY = 80;
const SOURCE_IMAGE = /\.(webp|jpe?g|png)$/i;

/** Displayed at 128px; 256 covers 2× retina. */
const PERSON_SIZE = 256;
/** Displayed at roughly 500px wide. */
const PROJECT_WIDTH = 1024;
/** Displayed at 290px, and the likely LCP element. */
const PORTRAIT_WIDTH = 580;
/** 1.91:1 is what LinkedIn, Facebook and X's large card all render. */
const SOCIAL_WIDTH = 1200;
const SOCIAL_HEIGHT = 630;
/** Matches --color-brand in app.css. */
const SOCIAL_BACKGROUND = "#192758";
/** Displayed at 64px in the navbar. */
const LOGO_WIDTH = 128;

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

async function report(label: string, path: string, bytes: number): Promise<void> {
  console.log(`  ${label.padEnd(46)} ${(bytes / 1024).toFixed(1).padStart(7)} KB  ${path}`);
}

async function writeOut(target: string, data: Buffer, label: string): Promise<number> {
  await ensureDir(dirname(target));
  await writeFile(target, data);
  await report(label, target.replace(root, ""), data.length);
  return data.length;
}

/**
 * sharp has no ICO encoder, but the format has allowed a raw PNG payload since
 * Vista: a 6-byte header, one 16-byte directory entry, then the PNG itself.
 */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette size
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

async function optimizePeople(): Promise<number> {
  console.log("\nPeople photos → 256×256 WebP");
  const dir = join(sourceImages, "people");
  let total = 0;

  // Sources arrive as whatever the photo came as; the output is always WebP.
  for (const file of (await readdir(dir)).filter((name) => SOURCE_IMAGE.test(name))) {
    const output = file.replace(SOURCE_IMAGE, ".webp");
    const data = await sharp(join(dir, file))
      // Applies EXIF orientation, which phone JPEGs rely on and WebP drops.
      .rotate()
      .resize(PERSON_SIZE, PERSON_SIZE, { fit: "cover" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    total += await writeOut(join(outputImages, "people", output), data, output);
  }

  return total;
}

async function optimizeProjects(): Promise<number> {
  console.log("\nProject thumbnails → 1024px WebP");
  const dir = join(sourceImages, "projects");
  let total = 0;

  for (const file of (await readdir(dir)).filter((name) => name.endsWith(".webp"))) {
    const data = await sharp(join(dir, file))
      .resize(PROJECT_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    total += await writeOut(join(outputImages, "projects", file), data, file);
  }

  return total;
}

async function optimizePortrait(): Promise<number> {
  console.log("\nPortrait → 580px WebP");
  const data = await sharp(join(sourceImages, "me.webp"))
    .resize(PORTRAIT_WIDTH, PORTRAIT_WIDTH, { fit: "cover" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return writeOut(join(outputImages, "me.webp"), data, "me.webp");
}

/**
 * og:image / twitter:image. JPEG, not WebP: LinkedIn is the most likely to show
 * no preview for WebP. The square portrait sits full-height in the middle of a
 * brand-coloured 1200×630, so a 1.91:1 preview shows the whole face, and X's
 * square `summary` crop (taken from the centre) lands exactly on the photo.
 */
async function generateSocialImage(): Promise<number> {
  console.log("\nSocial preview → 1200×630 JPEG");
  const portrait = await sharp(join(sourceImages, "me.webp"))
    .resize(SOCIAL_HEIGHT, SOCIAL_HEIGHT, { fit: "cover" })
    .toBuffer();

  const data = await sharp({
    create: {
      width: SOCIAL_WIDTH,
      height: SOCIAL_HEIGHT,
      channels: 3,
      background: SOCIAL_BACKGROUND,
    },
  })
    .composite([{ input: portrait, gravity: "center" }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return writeOut(join(outputImages, "og.jpg"), data, "og.jpg");
}

async function optimizeLogo(plate: string): Promise<number> {
  console.log("\nNavbar logo → 128px WebP");
  // logo.png is 256×216 and, despite what PLAN.md says, fully opaque. Padding it
  // onto its own background colour gives the square tile the navbar's
  // `w-16 h-16 rounded-2xl` expects — the same shape the v1 logo had.
  const data = await sharp(join(repoRoot, "logo.png"))
    .resize(LOGO_WIDTH, LOGO_WIDTH, { fit: "contain", background: plate })
    .webp({ quality: 90 })
    .toBuffer();

  return writeOut(join(outputImages, "logo-128.webp"), data, "logo-128.webp");
}

/**
 * Square icons come from the 1031×1024 white-background master rather than the
 * small transparent crop: "purpose": "maskable" requires an opaque, fully-bled
 * square with a safe zone, and upscaling the 256px crop would be soft.
 *
 * The white background is trimmed rather than keyed out — the wave's crest
 * contains genuine white highlights that a luminance key would punch through.
 */
async function generateIcons(brand: string, background: string): Promise<number> {
  console.log("\nSquare icons ← tsunami_software.png");

  // Threshold 10 leaves most of the padding behind (813×1021 of 1031×1024);
  // 30 finds the actual artwork box, and matches logo.png's 256×216 aspect.
  const artwork = await sharp(join(repoRoot, "tsunami_software.png"))
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 30 })
    .toBuffer();

  const square = async (size: number, insetRatio = 0.08): Promise<Buffer> => {
    const inner = Math.round(size * (1 - insetRatio * 2));
    const inset = await sharp(artwork)
      .resize(inner, inner, { fit: "contain", background })
      .toBuffer();

    return (
      sharp({
        create: { width: size, height: size, channels: 4, background },
      })
        .composite([{ input: inset, gravity: "center" }])
        // Flat artwork with few distinct colours — a palette cuts the 512px icon
        // from ~267 KB to a fraction of that with no visible loss.
        .png({ compressionLevel: 9, palette: true, quality: 90 })
        .toBuffer()
    );
  };

  let total = 0;
  total += await writeOut(
    join(outputPublic, "apple-touch-icon.png"),
    await square(180),
    "apple-touch-icon.png",
  );
  total += await writeOut(
    join(outputPublic, "web-app-manifest-192x192.png"),
    await square(192),
    "web-app-manifest-192x192.png",
  );
  total += await writeOut(
    join(outputPublic, "web-app-manifest-512x512.png"),
    await square(512),
    "web-app-manifest-512x512.png",
  );
  total += await writeOut(
    join(outputPublic, "favicon-96x96.png"),
    await square(96, 0.05),
    "favicon-96x96.png",
  );

  const icoPng = await square(48, 0.04);
  total += await writeOut(join(outputPublic, "favicon.ico"), pngToIco(icoPng, 48), "favicon.ico");

  await writeManifest(brand);
  return total;
}

const toHex = (value: number) => Math.round(value).toString(16).padStart(2, "0");

/**
 * The brand colour is the wave's own blue, not the plate it sits on. Plain
 * `stats().dominant` returns the near-white background, so ignore transparent
 * pixels plus anything too pale, too dark or too grey to be the artwork, then
 * take the most populated colour bucket that remains.
 */
async function sampleBrandColor(source: string): Promise<string> {
  const { data, info } = await sharp(source)
    .resize(128, 128, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let index = 0; index < data.length; index += info.channels) {
    const r = data[index]!;
    const g = data[index + 1]!;
    const b = data[index + 2]!;
    if (data[index + 3]! < 200) continue;

    const max = Math.max(r, g, b);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const saturation = max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
    if (luminance > 0.88 || luminance < 0.1 || saturation < 0.18) continue;

    // Quantise to 4 bits per channel so near-identical shades group together.
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const best = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!best) return "#00a6f4";

  return `#${toHex(best.r / best.count)}${toHex(best.g / best.count)}${toHex(best.b / best.count)}`;
}

/** The off-white the artwork was drawn on, read straight from a corner pixel. */
async function samplePlateColor(source: string): Promise<string> {
  const { data } = await sharp(source)
    .extract({ left: 0, top: 0, width: 4, height: 4 })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return `#${toHex(data[0]!)}${toHex(data[1]!)}${toHex(data[2]!)}`;
}

async function writeManifest(themeColor: string): Promise<void> {
  const manifest = {
    name: "Milijan Mosić - Software Engineer",
    short_name: "Milijan Mosić",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    theme_color: themeColor,
    // The site renders on black; the v1 manifest claimed white on both counts.
    background_color: "#000000",
    display: "standalone",
    start_url: "/",
  };

  const target = join(outputPublic, "site.webmanifest");
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`  wrote site.webmanifest (theme_color ${themeColor})`);
}

const logoSource = join(repoRoot, "logo.png");
const masterSource = join(repoRoot, "tsunami_software.png");

const brandColor = await sampleBrandColor(logoSource);
// Each source sits on its own shade of near-white; matching them per source
// avoids a visible seam between the plate and the artwork's own background.
const logoPlate = await samplePlateColor(logoSource);
const masterPlate = await samplePlateColor(masterSource);
console.log(
  `Brand colour (wave): ${brandColor}   ·   logo plate: ${logoPlate}   ·   icon plate: ${masterPlate}`,
);

const total =
  (await optimizePeople()) +
  (await optimizeProjects()) +
  (await optimizePortrait()) +
  (await generateSocialImage()) +
  (await optimizeLogo(logoPlate)) +
  (await generateIcons(brandColor, masterPlate));

console.log(`\nTotal generated: ${(total / 1024).toFixed(1)} KB`);
