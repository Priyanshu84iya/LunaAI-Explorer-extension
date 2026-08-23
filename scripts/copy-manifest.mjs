import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });
copyFileSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
console.log('Copied manifest.json -> dist/manifest.json');
