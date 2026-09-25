import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod fuer Lexikon Seiten: nur geprueft_am aus dem Frontmatter, nie das
// Dateisystem Datum. Fehlt geprueft_am, bleibt die Seite ohne lastmod.
function lexikonLastmodMap() {
  const verzeichnis = new URL('./content/themen/', import.meta.url);
  const map = new Map();
  for (const datei of readdirSync(verzeichnis)) {
    if (!datei.endsWith('.md')) continue;
    const inhalt = readFileSync(new URL(datei, verzeichnis), 'utf8');
    const treffer = inhalt.match(/^geprueft_am:\s*"?(\d{4}-\d{2}-\d{2})"?/m);
    if (treffer) {
      map.set(datei.replace(/\.md$/, ''), treffer[1]);
    }
  }
  return map;
}

// lastmod fuer Essay Seiten, geschluesselt nach dem url Frontmatter Feld:
// geprueft_am, sonst das date Feld aus dem Frontmatter, nie das Dateisystem Datum.
function essaysLastmodMap() {
  const verzeichnis = new URL('./content/posts/', import.meta.url);
  const map = new Map();
  for (const datei of readdirSync(verzeichnis)) {
    if (!datei.endsWith('.md')) continue;
    const inhalt = readFileSync(new URL(datei, verzeichnis), 'utf8');
    const urlTreffer = inhalt.match(/^url:\s*"?([a-z0-9-]+)"?/m);
    if (!urlTreffer) continue;
    const geprueftTreffer = inhalt.match(/^geprueft_am:\s*"?(\d{4}-\d{2}-\d{2})"?/m);
    const datumTreffer = inhalt.match(/^date:\s*"?([^"\r\n]+?)"?\r?$/m);
    const lastmod = geprueftTreffer?.[1] ?? datumTreffer?.[1];
    if (lastmod) map.set(urlTreffer[1], lastmod);
  }
  return map;
}

const lexikonLastmod = lexikonLastmodMap();
const essaysLastmod = essaysLastmodMap();

export default defineConfig({
  site: 'https://hybridlog.de',
  trailingSlash: 'always',

  build: {
    format: 'directory'
  },

  integrations: [
    sitemap({
      filter: (seite) => !seite.includes('/muster/'),
      serialize(item) {
        const pfad = new URL(item.url).pathname;
        const lexikonTreffer = pfad.match(/^\/lexikon\/([^/]+)\/$/);
        if (lexikonTreffer) {
          const lastmod = lexikonLastmod.get(lexikonTreffer[1]);
          return lastmod ? { ...item, lastmod } : item;
        }
        const essayTreffer = pfad.match(/^\/essays\/([^/]+)\/$/);
        if (essayTreffer) {
          const lastmod = essaysLastmod.get(essayTreffer[1]);
          return lastmod ? { ...item, lastmod } : item;
        }
        return item;
      },
    }),
  ]
});