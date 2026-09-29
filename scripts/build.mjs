import { build } from 'esbuild-wasm';
import { androidAssets } from './android-assets.mjs';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, copyFile, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
await mkdir('vendor',{recursive:true});await mkdir('icons',{recursive:true});await mkdir('dist',{recursive:true});
await build({absWorkingDir:root,tsconfigRaw:{},entryPoints:[join(root,'src/firebase-entry.js')],bundle:true,minify:true,format:'esm',target:'es2022',outfile:join(root,'vendor/firebase.js'),legalComments:'eof'});
await build({absWorkingDir:root,tsconfigRaw:{},entryPoints:[join(root,'src/native-entry.js')],bundle:true,minify:true,format:'esm',target:'es2022',outfile:join(root,'vendor/native.js'),legalComments:'eof'});
// Simple typographic brand icon: keep the glyph inside the maskable safe area.
const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#191c1b"/><text x="146" y="348" fill="#e1e4df" font-family="Arial,sans-serif" font-weight="700" font-size="292">r</text><circle cx="354" cy="330" r="22" fill="#e38b72"/></svg>`);
for(const [name,size] of [['icon-192.png',192],['icon-512.png',512],['icon-maskable-512.png',512],['apple-touch-icon.png',180]])await sharp(svg).resize(size,size).png().toFile(`icons/${name}`);
await androidAssets(root);
const files=['index.html','editorial.css','dark.css','theme.js','app.js','motion.js','install.js','cloud.js','firebase-config.js','favicon.svg','manifest.webmanifest','vendor/gsap.min.js','vendor/firebase.js','vendor/native.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png'];
const hash=createHash('sha256');for(const file of files)hash.update(await readFile(file));
const version=hash.digest('hex').slice(0,14);
const template=await readFile('src/sw-template.js','utf8');
await writeFile('sw.js',template.replace('__VERSION__',version).replace('__FILES__',JSON.stringify(files)));
for(const file of [...files,'sw.js','.nojekyll']){await mkdir(dirname(join('dist',file)),{recursive:true});await copyFile(file,join('dist',file));}
console.log(`Ritmo 1.1: recursos locais, ícones e PWA preparados (${version}).`);
