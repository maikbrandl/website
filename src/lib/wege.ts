import type { CollectionEntry } from 'astro:content';

export interface WegBezug {
  weg: CollectionEntry<'wissensfragen'>;
  ebene?: number;
}

// Verknuepft Lexikoneintraege mit den Wegen, die sie nutzen: entweder explizit ueber
// das Feld `wege` auf dem Thema, oder automatisch ueber `darauf_aufbauend`-Links einer Ebene.
export function wegBezuegeProLexikonEintrag(
  themen: CollectionEntry<'themen'>[],
  wege: CollectionEntry<'wissensfragen'>[],
): Map<string, WegBezug[]> {
  const ergebnis = new Map<string, WegBezug[]>();
  const hinzufuegen = (themaId: string, bezug: WegBezug) => {
    const bisherige = ergebnis.get(themaId) ?? [];
    const vorhanden = bisherige.find((b) => b.weg.id === bezug.weg.id);
    if (!vorhanden) bisherige.push(bezug);
    else if (bezug.ebene && !vorhanden.ebene) vorhanden.ebene = bezug.ebene;
    ergebnis.set(themaId, bisherige);
  };

  for (const thema of themen) {
    for (const wegId of thema.data.wege ?? []) {
      const weg = wege.find((w) => w.id === wegId);
      if (weg) hinzufuegen(thema.id, { weg });
    }
  }

  for (const weg of wege) {
    const ebenen = (weg.data.bloecke ?? []).filter((b) => b.type === 'ebene');
    ebenen.forEach((block, i) => {
      const eintraege = (block.darauf_aufbauend as { href?: string }[] | undefined) ?? [];
      for (const eintrag of eintraege) {
        if (!eintrag?.href?.startsWith('/lexikon/')) continue;
        const themaId = eintrag.href.replace('/lexikon/', '').replace(/\/$/, '');
        hinzufuegen(themaId, { weg, ebene: i + 1 });
      }
    });
  }

  return ergebnis;
}
