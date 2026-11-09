import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(join(projectRoot, 'app.js'), 'utf8');
const textureNames = [
  ...appSource.matchAll(/(?:addArtwork|addWallSurface)\(root,\s*\{\s*file:\s*'([^']+)'/g),
].map((match) => match[1]);
const uniqueTextureNames = [...new Set(textureNames)].sort();
const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const textures = Object.fromEntries(uniqueTextureNames.map((name) => {
  const mimeType = mimeTypes[extname(name).toLowerCase()];
  if (!mimeType) throw new Error(`Unsupported texture type: ${name}`);
  const bytes = readFileSync(join(projectRoot, 'assets', 'textures', name));
  return [name, `data:${mimeType};base64,${bytes.toString('base64')}`];
}));

const output = `window.SPACE3_EMBEDDED_TEXTURES = Object.freeze(${JSON.stringify(textures)});\n`;
writeFileSync(join(projectRoot, 'assets', 'embedded-textures.js'), output);
console.log(`Embedded ${uniqueTextureNames.length} WebGL textures.`);
