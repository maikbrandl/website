// Vier Tools mit kurzer Beschreibung und CSS/SVG Vorschau-Typ.
// Gemeinsam genutzt von /tools/ und der Startseite.
export interface ToolUebersichtEintrag {
  slug: string;
  titel: string;
  label: string;
  text: string;
  href: string;
  vorschau: 'philosophie' | 'blockuniversum' | 'humanmap' | 'denkschule';
}

export const TOOLS_UEBERSICHT: ToolUebersichtEintrag[] = [
  {
    slug: 'philosophie',
    titel: 'Atlas der Philosophie',
    label: 'Philosophie · Wissen',
    text: 'Ein übersichtlicher Wegweiser durch die Philosophie, geordnet nach Epochen und Themengebieten, zum Durchklicken.',
    href: '/tools/philosophie/',
    vorschau: 'philosophie',
  },
  {
    slug: 'blockuniversum',
    titel: 'Das Blockuniversum',
    label: 'Bewusstsein · Physik',
    text: 'Warum existiert deine Zukunft bereits? Eine interaktive Reise durch die Physik der Raumzeit.',
    href: '/tools/blockuniversum/',
    vorschau: 'blockuniversum',
  },
  {
    slug: 'human-map',
    titel: 'Human Map',
    label: 'Persönlichkeit · Selbsterkenntnis',
    text: 'Ein wissenschaftlich fundiertes Selbstbild in sechs Ebenen, und der eine Hebel, an dem Veränderung sich lohnt.',
    href: '/human-map/',
    vorschau: 'humanmap',
  },
  {
    slug: 'denkschule',
    titel: 'Welche Denkschule bist du?',
    label: 'Philosophie · Selbsttest',
    text: 'Sechs Fragen, am Ende deine philosophische Grundhaltung, von Stoizismus bis Existenzialismus.',
    href: '/tools/denkschule/',
    vorschau: 'denkschule',
  },
];
