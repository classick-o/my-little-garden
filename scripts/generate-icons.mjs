/**
 * Genereaza iconitele PWA din marca desenata mai jos.
 *
 *   npm run icons
 *
 * Se ruleaza manual, doar cand se schimba marca. Rezultatele sunt comise in repo.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "icons");

const LEAF = "#4a6b52";
const LEAF_DEEP = "#3a5641";
const CREAM = "#faf7f2";

/**
 * Mugurele: doua frunze simetrice si o tulpina.
 * `scale` micsoreaza desenul fata de centru, pentru iconitele maskable
 * care au nevoie de spatiu de siguranta.
 */
function sprout(scale = 1) {
  const t = `translate(256 256) scale(${scale}) translate(-256 -256)`;
  return `
    <g transform="${t}">
      <path d="M256 300 C270 212 322 158 398 158 C398 240 342 296 256 300 Z" fill="${CREAM}"/>
      <path d="M256 300 C242 212 190 158 114 158 C114 240 170 296 256 300 Z" fill="${CREAM}" opacity="0.82"/>
      <path d="M256 296 L256 402" stroke="${CREAM}" stroke-width="26" stroke-linecap="round"/>
    </g>`;
}

function markup({ scale = 1, radius = 0 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${LEAF}"/>
        <stop offset="1" stop-color="${LEAF_DEEP}"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="${radius}" fill="url(#bg)"/>
    ${sprout(scale)}
  </svg>`;
}

const targets = [
  // Iconite standard de manifest. Colturi drepte: sistemul le decupeaza singur.
  { name: "icon-192.png", size: 192, svg: markup() },
  { name: "icon-512.png", size: 512, svg: markup() },

  // Maskable: desenul sta in zona centrala de siguranta (80%).
  { name: "icon-maskable-192.png", size: 192, svg: markup({ scale: 0.68 }) },
  { name: "icon-maskable-512.png", size: 512, svg: markup({ scale: 0.68 }) },

  // iOS: fundal opac obligatoriu, colturile le rotunjeste iOS.
  { name: "apple-touch-icon.png", size: 180, svg: markup() },

  // Favicon pentru tab-ul de browser.
  { name: "favicon-32.png", size: 32, svg: markup({ radius: 96 }) },
];

await mkdir(OUT, { recursive: true });

for (const { name, size, svg } of targets) {
  const png = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(OUT, name), png);
  console.log(`  ${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}

// SVG-ul sursa, pastrat ca referinta si folosit ca favicon vectorial.
await writeFile(path.join(OUT, "icon.svg"), markup({ radius: 96 }));
console.log("  icon.svg");
