// Datumsformatierung fuer sichtbare Texte, z.B. "geprueft am".
const formatierer = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatiereDatum(iso: string | undefined | null): string | undefined {
  if (!iso) return undefined;
  const datum = new Date(iso);
  if (Number.isNaN(datum.getTime())) return undefined;
  return formatierer.format(datum);
}
