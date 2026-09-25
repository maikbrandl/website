import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

// Gemeinsame Hilfsfunktion fuer Markdown in Frontmatter Feldern (z. B. textabschnitt.text).
// Astro rendert Markdown in Frontmatter Feldern nicht selbst, siehe CLAUDE.md.
export function markdownZuHtml(text: string | undefined | null): string {
  if (!text) return '';
  return marked.parse(text, { async: false }) as string;
}
