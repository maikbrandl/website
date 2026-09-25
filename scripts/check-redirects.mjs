// Prueft alle alten Adressen aus legacy-urls.txt gegen eine Basisadresse:
// erste Antwort 301 oder 308 (ausser bei Adressen, die unveraendert bleiben
// und direkt 200 liefern duerfen), folgt der Kette einzeln (max. zwei
// Sprruenge), Endziel muss 200 sein. Aufruf: npm run check:redirects -- <basis>
import { readFileSync } from 'node:fs';

const basis = process.argv[2];
if (!basis) {
  console.error('Bitte Basisadresse angeben: npm run check:redirects -- http://localhost:8788');
  process.exit(1);
}

const zeilen = readFileSync(new URL('../legacy-urls.txt', import.meta.url), 'utf8')
  .split(/\r?\n/)
  .map((z) => z.trim())
  .filter(Boolean);

const MAX_SPRUENGE = 2;

async function pruefeAdresse(pfad) {
  let aktuelleUrl = new URL(pfad, basis).toString();
  let sprung = 0;
  let ersterStatus = null;
  let letzteAntwort;

  while (true) {
    letzteAntwort = await fetch(aktuelleUrl, { redirect: 'manual' });
    if (ersterStatus === null) ersterStatus = letzteAntwort.status;

    if (letzteAntwort.status === 200) {
      if (sprung === 0) return { status: ersterStatus, ziel: aktuelleUrl, fehler: null };
      return { status: ersterStatus, ziel: aktuelleUrl, fehler: null };
    }

    if (letzteAntwort.status === 301 || letzteAntwort.status === 308) {
      sprung += 1;
      if (sprung > MAX_SPRUENGE) {
        return { status: ersterStatus, ziel: aktuelleUrl, fehler: `mehr als ${MAX_SPRUENGE} Spruenge` };
      }
      const ort = letzteAntwort.headers.get('location');
      if (!ort) {
        return { status: ersterStatus, ziel: aktuelleUrl, fehler: 'Redirect ohne Location Header' };
      }
      aktuelleUrl = new URL(ort, aktuelleUrl).toString();
      continue;
    }

    return { status: ersterStatus, ziel: aktuelleUrl, fehler: `unerwarteter Status ${letzteAntwort.status}` };
  }
}

const ergebnisse = [];
for (const pfad of zeilen) {
  try {
    const { status, ziel, fehler } = await pruefeAdresse(pfad);
    ergebnisse.push({ alt: pfad, status, ziel, fehler });
  } catch (e) {
    ergebnisse.push({ alt: pfad, status: '-', ziel: '-', fehler: e.message });
  }
}

ergebnisse.sort((a, b) => {
  if (!!a.fehler === !!b.fehler) return 0;
  return a.fehler ? -1 : 1;
});

const spaltenbreite = (schluessel, ueberschrift) =>
  Math.max(ueberschrift.length, ...ergebnisse.map((e) => String(e[schluessel] ?? '').length));

const breiten = {
  alt: spaltenbreite('alt', 'Alt'),
  status: spaltenbreite('status', 'Status'),
  ziel: spaltenbreite('ziel', 'Ziel'),
  fehler: spaltenbreite('fehler', 'Fehler'),
};

function zeile(alt, status, ziel, fehler) {
  return [
    alt.padEnd(breiten.alt),
    String(status).padEnd(breiten.status),
    ziel.padEnd(breiten.ziel),
    fehler.padEnd(breiten.fehler),
  ].join('  ');
}

console.log(zeile('Alt', 'Status', 'Ziel', 'Fehler'));
console.log('-'.repeat(breiten.alt + breiten.status + breiten.ziel + breiten.fehler + 6));
for (const e of ergebnisse) {
  console.log(zeile(e.alt, e.status, e.ziel ?? '-', e.fehler ?? ''));
}

const anzahlFehler = ergebnisse.filter((e) => e.fehler).length;
console.log(`\n${ergebnisse.length} Adressen geprueft, ${anzahlFehler} Fehler.`);
if (anzahlFehler > 0) process.exit(1);
