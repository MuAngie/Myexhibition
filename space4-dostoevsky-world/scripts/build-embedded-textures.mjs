import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(join(projectRoot, 'app.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(projectRoot, 'assets.js'), 'utf8'), sandbox);
const manifest = sandbox.window.PHOTO_MANIFEST;
const photos = new Map(manifest.map((photo) => [Number(photo.source.slice(4, 8)), photo]));
const textureUrls = new Set(manifest.filter((photo) => photo.selected).map((photo) => photo.asset));

for (const match of appSource.matchAll(/addTextPanel\((\d+)/g)) {
  const photo = photos.get(Number(match[1]));
  textureUrls.add(photo.asset || photo.photo);
}
for (const match of appSource.matchAll(/addOpticalPanel\((\d+)/g)) {
  textureUrls.add(photos.get(Number(match[1])).photo);
}

const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const textures = Object.fromEntries([...textureUrls].sort().map((url) => {
  const mimeType = mimeTypes[extname(url).toLowerCase()];
  if (!mimeType) throw new Error(`Unsupported texture type: ${url}`);
  const bytes = readFileSync(join(projectRoot, ...url.split('/')));
  return [url, `data:${mimeType};base64,${bytes.toString('base64')}`];
}));

writeFileSync(
  join(projectRoot, 'assets', 'embedded-textures.js'),
  `window.SPACE4_EMBEDDED_TEXTURES = Object.freeze(${JSON.stringify(textures)});\n`,
);
console.log(`Embedded ${textureUrls.size} WebGL textures.`);
