// Black Friday Deal Finder entry (Node 22, standard library only). The site is
// this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step), its deals held in its own
// files. Nothing it runs, styles or shows loads over the network; each deal
// links out to its store. This program hands the site in: it copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json,
// the summary the judge reads (screenshots, first-load files and bytes, and
// source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own
// copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const MAX_SHOTS = 4;
const MAX_SHOT_BYTES = 262144;

// Pre-flight: refuse to hand in a site whose screenshots are missing or over
// the scorer's caps, so a broken entry fails here — loudly — instead of at
// intake. The caps mirror reference/gate.json.
const shotsDir = join(here, 'screenshots');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (shots.length === 0) throw new Error('screenshots/ holds no screenshot');
if (shots.length > MAX_SHOTS) throw new Error(`too many screenshots: ${shots.length} (max ${MAX_SHOTS})`);
for (const shot of shots) {
  const size = statSync(join(shotsDir, shot)).size;
  if (size > MAX_SHOT_BYTES) throw new Error(`screenshot ${shot} is ${size} bytes (max ${MAX_SHOT_BYTES})`);
}
if (!existsSync(join(here, 'app', 'index.html'))) throw new Error('app/index.html is missing');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: MAX_SHOTS, max_bytes: MAX_SHOT_BYTES }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// Read the dossier back: a truncated or unparseable write must fail here,
// not silently ship an entry the scorer cannot read.
const dossierPath = join(out, 'dossier.json');
const dossier = JSON.parse(readFileSync(dossierPath, 'utf8'));
const dossierBytes = statSync(dossierPath).size;
console.log(`handed in ${shots.length} screenshot(s): ${shots.join(', ')} -> ${out}`);
console.log(`dossier.json: ${dossierBytes} bytes, ${Array.isArray(dossier.images) ? dossier.images.length : 0} image(s), cover #${dossier.cover ?? 0}, ${dossier.text?.length ?? 0} chars of source text`);
