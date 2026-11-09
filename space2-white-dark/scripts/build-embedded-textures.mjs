import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const textureDir = join(projectRoot, 'assets', 'artworks');
const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const textureNames = readdirSync(textureDir).filter((name) => mimeTypes[extname(name).toLowerCase()]).sort();
const textures = Object.fromEntries(textureNames.map((name) => {
  const mimeType = mimeTypes[extname(name).toLowerCase()];
  const bytes = readFileSync(join(textureDir, name));
  return [name, `data:${mimeType};base64,${bytes.toString('base64')}`];
}));

writeFileSync(
  join(projectRoot, 'assets', 'embedded-textures.js'),
  `window.TESTMODEL2_EMBEDDED_TEXTURES = Object.freeze(${JSON.stringify(textures)});\n`,
);
console.log(`Embedded ${textureNames.length} WebGL textures.`);
