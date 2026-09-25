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

const lexikonLastmod = lexikonLastmodMap();

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
        const treffer = pfad.match(/^\/lexikon\/([^/]+)\/$/);
        const lastmod = treffer ? lexikonLastmod.get(treffer[1]) : undefined;
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ]
});