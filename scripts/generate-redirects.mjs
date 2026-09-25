// Erzeugt dist/redirects.json aus den Content Collections, fuer die
// Weiterleitungs-Logik in functions/_middleware.js (Prompt 8).
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const wurzel = new URL('../', import.meta.url);

function slugsAusOrdner(pfad, filter) {
  const verzeichnis = new URL(pfad, wurzel);
  const ergebnis = [];
  for (const datei of readdirSync(verzeichnis)) {
    if (!datei.endsWith('.md')) continue;
    if (filter) {
      const inhalt = readFileSync(new URL(datei, verzeichnis), 'utf8');
      if (!filter(inhalt)) continue;
    }
    ergebnis.push(datei.replace(/\.md$/, ''));
  }
  return ergebnis;
}

const themen = slugsAusOrdner('content/themen/');
const fachgebiete = slugsAusOrdner(
  'content/fachgebiete/',
  (inhalt) => /^status:\s*"?active"?/m.test(inhalt) && /^visibility:\s*"?public"?/m.test(inhalt),
);
const wege = slugsAusOrdner('content/wissensfragen/');

const essaysByAltSlug = {};
const postsVerzeichnis = new URL('content/posts/', wurzel);
for (const datei of readdirSync(postsVerzeichnis)) {
  if (!datei.endsWith('.md')) continue;
  const inhalt = readFileSync(new URL(datei, postsVerzeichnis), 'utf8');
  const urlTreffer = inhalt.match(/^url:\s*"?([a-z0-9-]+)"?/m);
  if (!urlTreffer) continue;
  essaysByAltSlug[datei.replace(/\.md$/, '')] = urlTreffer[1];
}

const tabelle = { themen, fachgebiete, wege, essaysByAltSlug };

mkdirSync(new URL('dist/', wurzel), { recursive: true });
writeFileSync(new URL('dist/redirects.json', wurzel), JSON.stringify(tabelle), 'utf8');

console.log(
  `redirects.json: ${themen.length} Themen, ${fachgebiete.length} Fachgebiete, ${wege.length} Wege, ${Object.keys(essaysByAltSlug).length} Essays.`,
);
