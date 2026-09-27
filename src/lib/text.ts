// Textbezogene Hilfsfunktionen fuer Uebersichtsseiten (Lesezeit, Sortierung, Kuerzung).

// Lesezeit wie in legacy/js/blog.js: Woerter geteilt durch 200, aufgerundet, mindestens 1 Minute.
export function lesezeit(text: string | undefined | null): number {
  const woerter = String(text ?? '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(woerter / 200));
}

const ARTIKEL = /^(der|die|das)\s+/i;

// Fuer die alphabetische Sortierung: fuehrender Artikel faellt weg.
export function sortierTitel(titel: string | undefined | null): string {
  return String(titel ?? '').replace(ARTIKEL, '');
}

const UMLAUT_GRUNDBUCHSTABE: Record<string, string> = { Ä: 'A', Ö: 'O', Ü: 'U' };

// Gruppenbuchstabe fuer die A-bis-Z-Liste: Umlaute zaehlen zu ihrem Grundbuchstaben.
export function grundBuchstabe(titel: string | undefined | null): string {
  const erster = sortierTitel(titel).charAt(0).toUpperCase();
  return UMLAUT_GRUNDBUCHSTABE[erster] ?? erster;
}

// Kuerzt einen Text auf ganze Saetze bis zur Ziellaenge (fuer Kartenvorschauen und Meta Description).
export function kuerzeAufSatz(text: string | undefined | null, ziellaenge = 150): string {
  const klar = String(text ?? '').trim();
  if (klar.length <= ziellaenge) return klar;
  const saetze = klar.slice(0, ziellaenge + 40).match(/[^.!?]+[.!?]+/g) ?? [];
  let ergebnis = '';
  for (const satz of saetze) {
    if (ergebnis.length + satz.length > ziellaenge && ergebnis) break;
    ergebnis += satz;
    if (ergebnis.length >= ziellaenge) break;
  }
  return (ergebnis || klar.slice(0, ziellaenge)).trim();
}
