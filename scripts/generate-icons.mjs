// Generates PWA PNG icons + favicon + apple-touch-icon from public/logo.svg.
// `sharp` and `png-to-ico` are not regular dependencies (the generated icons are
// committed), so install them ad-hoc before running this rare maintenance script:
//   npm i -D sharp png-to-ico && node scripts/generate-icons.mjs
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const logoPath = `${root}public/logo.svg`;
const iconsDir = `${root}public/icons`;
const PURPLE = { r: 112, g: 32, b: 208, alpha: 1 };

const svg = await readFile(logoPath);
await mkdir(iconsDir, { recursive: true });

const renderFullBleed = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' }).png();

// Maskable: logo at ~78% on a solid purple background (safe zone for adaptive icons).
const renderMaskable = async (size) => {
  const inner = Math.round(size * 0.78);
  const logo = await sharp(svg, { density: 384 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: PURPLE },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png();
};

await renderFullBleed(192).toFile(`${iconsDir}/icon-192.png`);
await renderFullBleed(512).toFile(`${iconsDir}/icon-512.png`);
await (await renderMaskable(512)).toFile(`${iconsDir}/icon-maskable-512.png`);
await renderFullBleed(180).toFile(`${root}public/apple-touch-icon.png`);

const fav32 = await renderFullBleed(32).toBuffer();
const fav16 = await renderFullBleed(16).toBuffer();
await writeFile(`${root}public/favicon.ico`, await pngToIco([fav16, fav32]));

console.log('Icons generated in public/icons, plus apple-touch-icon.png and favicon.ico');
