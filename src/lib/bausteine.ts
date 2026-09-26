// Gemeinsame Logik fuer den Block-Baukasten, genutzt von BlockRenderer.astro
// und von Seiten, die zusaetzlich ein Verzeichnis der Abschnitte (TOC) brauchen.

export interface Baustein extends Record<string, unknown> {
  type?: string;
}

export const STANDARD_TITEL: Record<string, string> = {
  kurz_erklaert: 'Kurz erklärt',
  icon_fakten: 'Auf einen Blick',
  prozess: 'So funktioniert das',
  textabschnitt: 'Richtext',
  beispiel: 'Beispiel aus dem Alltag',
  liste: 'Wichtig zu wissen',
  evidenz: 'Grenzen und Evidenz',
  zitat: 'Zitat',
  bild: 'Bild',
  faq: 'Häufig gefragt',
  tool_einbindung: 'Zum Ausprobieren',
  empfehlung: 'Empfehlung',
  verknuepfungen: 'Womit sich dieser Weg verknüpft',
  selbsttest: 'Selbsttest',
  plan: 'Dein Plan',
  hilfe: 'Hilfe und Werkzeuge',
  angebot: 'Angebot',
};

export const BEKANNTE_TYPEN = new Set([
  'kurz_erklaert',
  'icon_fakten',
  'prozess',
  'textabschnitt',
  'bild',
  'beispiel',
  'liste',
  'evidenz',
  'zitat',
  'faq',
  'tool_einbindung',
  'perspektive',
  'verknuepfungen',
  'empfehlung',
  'ebene',
  'selbsttest',
  'plan',
  'hilfe',
  'angebot',
]);

export function abschnittTitel(b: Baustein, nummer: number): string {
  if (b.type === 'perspektive') {
    const n = String(nummer).padStart(2, '0');
    const kategorie = typeof b.kategorie === 'string' ? b.kategorie : '';
    return `Perspektive ${n}${kategorie ? ' · ' + kategorie : ''}`;
  }
  if (b.type === 'ebene') {
    const titel = typeof b.titel === 'string' ? b.titel : '';
    return titel || `Ebene ${nummer}`;
  }
  const override = typeof b.titel_override === 'string' ? b.titel_override : '';
  return override || (b.type ? STANDARD_TITEL[b.type] : undefined) || 'Abschnitt';
}

export function abschnittId(nummer: number): string {
  return `abschnitt-${nummer}`;
}

// Anker fuer Untergruppen auf der Fachgebietsseite, z. B. "Kognitive Verzerrungen" -> "kognitive-verzerrungen".
export function gruppenAnker(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface Abschnitt {
  block: Baustein;
  titel: string;
  id: string;
}

// Filtert unbekannte Blocktypen heraus (mit Warnung) und liefert Titel und
// Anker-Id fuer jeden verbleibenden Block, in Anzeigereihenfolge.
export function berechneAbschnitte(bloecke: Baustein[] = []): Abschnitt[] {
  const gefiltert = bloecke.filter((b) => {
    if (b.type && BEKANNTE_TYPEN.has(b.type)) return true;
    console.warn(`[Bausteine] Unbekannter Blocktyp "${b.type}" wird uebersprungen.`);
    return false;
  });
  return gefiltert.map((block, i) => ({
    block,
    titel: abschnittTitel(block, i + 1),
    id: abschnittId(i + 1),
  }));
}
