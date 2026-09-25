// Prueft Pflichtfelder nach dem Laden einer Collection. Ein kaputter Eintrag stoppt den
// Build nie (Schemas sind tolerant), er wird nur mit Datei und Feld gemeldet.
interface PruefbarerEintrag {
  id: string;
  data: Record<string, unknown>;
}

export function pruefeEintraege(
  sammlung: string,
  eintraege: PruefbarerEintrag[],
  pflichtfelder: string[],
): number {
  let warnungen = 0;
  for (const eintrag of eintraege) {
    for (const feld of pflichtfelder) {
      const wert = eintrag.data[feld];
      const fehlt = wert === undefined || wert === null || wert === '';
      if (fehlt) {
        console.warn(`[Inhalt] ${sammlung}/${eintrag.id}: Pflichtfeld "${feld}" fehlt oder ist ungueltig.`);
        warnungen += 1;
      }
    }
  }
  return warnungen;
}
