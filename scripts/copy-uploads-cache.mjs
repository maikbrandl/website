// Kopiert public/images/uploads (von Decap befuellt) nach src/assets/uploads-cache,
// damit Astro die Bilder ueber astro:assets optimieren kann (nur ESM-Importe aus src/
// werden von <Image> optimiert, Dateien aus public/ nicht).
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const quelle = fileURLToPath(new URL('../public/images/uploads/', import.meta.url));
const ziel = fileURLToPath(new URL('../src/assets/uploads-cache/', import.meta.url));

if (!existsSync(quelle)) {
  process.exit(0);
}

mkdirSync(ziel, { recursive: true });

const bildEndungen = /\.(png|jpe?g|webp|avif)$/i;
let anzahl = 0;
for (const datei of readdirSync(quelle)) {
  if (!bildEndungen.test(datei)) continue;
  cpSync(join(quelle, datei), join(ziel, datei));
  anzahl += 1;
}

console.log(`uploads-cache: ${anzahl} Bild(er) nach src/assets/uploads-cache kopiert.`);
