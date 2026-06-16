import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public/images/hatrack_logo.png");
const outDir = path.join(root, "public/icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32.png", size: 32 },
];

await mkdir(outDir, { recursive: true });

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 9, g: 9, b: 11, alpha: 1 },
    })
    .png()
    .toFile(path.join(outDir, name));
  console.log(`Generated public/icons/${name}`);
}

await sharp(source)
  .resize(32, 32, {
    fit: "contain",
    background: { r: 9, g: 9, b: 11, alpha: 1 },
  })
  .toFile(path.join(root, "public/favicon.ico"));

console.log("Generated public/favicon.ico");
