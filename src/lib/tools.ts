// Bekannte, bestehende Tools fuer den tool_einbindung Baustein. Statisch, kein CMS dafuer noetig.
export interface ToolEintrag {
  title: string;
  teaser: string;
  href: string;
}

export const TOOLS: Record<string, ToolEintrag> = {
  denkschule: {
    title: 'Denkschule Test',
    teaser: 'Finde heraus, welcher philosophischen Denkschule du am naechsten stehst.',
    href: '/tools/denkschule/',
  },
  philosophie: {
    title: 'Atlas der Philosophie',
    teaser: 'Alle Denkrichtungen im Ueberblick, von der Antike bis heute.',
    href: '/tools/philosophie/',
  },
  blockuniversum: {
    title: 'Blockuniversum',
    teaser: 'Zeit als Block erkunden, interaktiv und anschaulich.',
    href: '/tools/blockuniversum/',
  },
  'human-map': {
    title: 'Human Map',
    teaser: 'Dein Selbstbild in einer interaktiven Karte.',
    href: '/human-map/',
  },
};

export function toolBySlug(slug: string | undefined): ToolEintrag | undefined {
  if (!slug) return undefined;
  return TOOLS[slug];
}
