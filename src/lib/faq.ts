// Erkennt einen FAQ-Abschnitt am Ende eines Essay-Markdowntexts und liest die
// Frage/Antwort-Paare fuer FAQPage JSON-LD aus. Erwartetes Muster:
// "## FAQ" oder "## Haeufige Fragen ..." gefolgt von Abschnitten der Form
// "**Frage?**" auf einer Zeile, danach die Antwort.
export interface FaqEintrag {
  frage: string;
  antwort: string;
}

const FAQ_ABSCHNITT = /^##\s+(?:FAQ\b|Häufige Fragen)[^\n]*\n+([\s\S]*?)(?=\n##\s|$)/im;

export function faqAusMarkdown(body: string | undefined | null): FaqEintrag[] {
  const abschnitt = String(body ?? '').match(FAQ_ABSCHNITT)?.[1];
  if (!abschnitt) return [];

  const eintraege: FaqEintrag[] = [];
  const re = /\*\*(.+?)\*\*\s*\n+([\s\S]*?)(?=\n{2,}\*\*|\n{2,}$|$)/g;
  let treffer: RegExpExecArray | null;
  while ((treffer = re.exec(abschnitt))) {
    const frage = treffer[1].trim();
    const antwort = treffer[2].trim().replace(/\s+/g, ' ');
    if (frage && antwort) eintraege.push({ frage, antwort });
  }
  return eintraege;
}
