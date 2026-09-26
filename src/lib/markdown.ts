import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

// ==Text== wird zum gelben Marker, damit er in Decap ohne HTML gesetzt werden kann.
marked.use({
  extensions: [
    {
      name: 'marker',
      level: 'inline',
      start(src: string) {
        return src.indexOf('==');
      },
      tokenizer(src: string) {
        const treffer = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
        if (!treffer) return undefined;
        return { type: 'marker', raw: treffer[0], tokens: this.lexer.inlineTokens(treffer[1]) };
      },
      renderer(token) {
        return `<mark class="marker">${this.parser.parseInline(token.tokens ?? [])}</mark>`;
      },
    },
  ],
});

// Gemeinsame Hilfsfunktion fuer Markdown in Frontmatter Feldern (z. B. textabschnitt.text).
// Astro rendert Markdown in Frontmatter Feldern nicht selbst, siehe CLAUDE.md.
export function markdownZuHtml(text: string | undefined | null): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
}

// Fuer einzeilige Felder (Kurzantwort, Lead, Kernsatz): ohne umschliessendes <p>.
export function markdownInline(text: string | undefined | null): string {
  if (!text) return '';
  return marked.parseInline(text, { async: false }) as string;
}
