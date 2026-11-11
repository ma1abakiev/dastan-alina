// Converts the raw photos from ./photos-raw into web-friendly WebP (full + thumbnail).
// iPhone HEIC files are decoded with heic-convert (sharp's prebuilt libvips can't read HEVC).
// Usage: npm run photos
import sharp from "sharp";
import convert from "heic-convert";
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "photos-raw");
const OUT = join(process.cwd(), "public", "photos");
// Extra rotation (degrees clockwise) for files saved sideways without EXIF orientation.
const MANUAL_ROTATE = {};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp|heic|heif)$/i.test(f)).sort();
const manifest = [];

for (const [i, file] of files.entries()) {
  const name = String(i + 1).padStart(2, "0");
  let input = readFileSync(join(SRC, file));
  if (/\.hei[cf]$/i.test(file)) {
    // heic-convert already applies the HEIF rotation, so the result needs no EXIF rotate.
    input = Buffer.from(await convert({ buffer: input, format: "JPEG", quality: 0.95 }));
  }
  let img = sharp(input).rotate();
  if (MANUAL_ROTATE[file]) img = sharp(await img.toBuffer()).rotate(MANUAL_ROTATE[file]);
  const buf = await img.toBuffer();

  const full = await sharp(buf).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(join(OUT, `${name}.webp`));
  await sharp(buf).resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 74 }).toFile(join(OUT, `${name}-thumb.webp`));

  manifest.push({ src: `/photos/${name}.webp`, thumb: `/photos/${name}-thumb.webp`, w: full.width, h: full.height });
  console.log(`${file} -> ${name}.webp ${full.width}x${full.height}`);
}

writeFileSync(join(process.cwd(), "src", "photos.json"), JSON.stringify(manifest, null, 2) + "\n");
