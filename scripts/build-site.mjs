// Assembles the public site deployment: the static website at the root and
// the interactive demo (client build made with VITE_BASE=/demo/) under /demo.
import { cpSync, rmSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.dirname(fileURLToPath(import.meta.url)) + '/..';
const dist = path.join(root, 'dist');

const skipReadmes = (src) => path.basename(src).toLowerCase() !== 'readme.md';

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(path.join(root, 'website'), dist, { recursive: true, filter: skipReadmes });
cpSync(path.join(root, 'client', 'dist'), path.join(dist, 'demo'), { recursive: true });
console.log('site assembled in dist/ (website at /, demo at /demo)');
