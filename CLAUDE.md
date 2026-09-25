# Hybridlog Website, Projektanweisung

Diese Datei ist der Dauerkontext für jeden Coding Assistenten in diesem Repo. Kopie für GitHub Copilot: `.github/copilot-instructions.md` mit identischem Inhalt.

## Was das ist
Hybridlog ist eine deutschsprachige Wissensplattform über den Menschen. Kern sind Wissenswege: echte Suchfragen, gründlich über mehrere Ebenen beantwortet. Dazu ein Lexikon (Kurz erklärt), Essays, interaktive Tools und leise im Hintergrund die eigenen Journale.

## Oberste Prioritäten, in dieser Reihenfolge
1. Jeder Inhalt steht als fertiges HTML in der Auslieferung. Nie Inhalte erst per JavaScript nachladen. KI Crawler (GPTBot, ClaudeBot, PerplexityBot) führen kein JavaScript aus.
2. SEO und GEO: genau eine H1, Title, Meta Description, canonical, Open Graph und JSON-LD im HTML jeder Seite. Sitemap mit lastmod inklusive Uhrzeit.
3. Ladezeit: so wenig JavaScript wie möglich. Interaktive Tools als isolierte Inseln.
4. Nichts kaputt machen: alte Adressen werden per 301 weitergeleitet, Inhalte in `content/` werden nie umbenannt oder verschoben.

## Stack
- Astro (aktuelle Version), statische Ausgabe nach `dist/`. In `astro.config.mjs`: `site: 'https://hybridlog.de'`, `trailingSlash: 'always'`, `build.format: 'directory'`.
- Node 22 (`.nvmrc`, `engines` in package.json, `NODE_VERSION` in Cloudflare).
- Reines CSS mit Tokens in `src/styles/logbuch.css`. Kein Tailwind.
- Inhalte bleiben Markdown in `content/` im Repo Root und werden über Astro Content Collections mit `glob()` Loader gelesen.
- Decap CMS unter `public/admin/`, schreibt weiter nach `content/`. Bilder nach `public/images/uploads/`.
- Decap Login läuft über einen separaten Cloudflare Worker, Quelltext in `workers/decap-oauth/index.js`. Er ist nicht Teil des Astro Builds.
- Suche mit Pagefind, Index beim Build, Skript nur auf `/suche/`.
- Hosting Cloudflare Pages. Weiterleitungen alter Adressen mit Query Parameter über `functions/_middleware.js`, begrenzt durch `public/_routes.json`.
- Bestehende Tools (`tools/`, `human-map/`) und `images/` liegen unverändert unter `public/`. Ausnahme: `/tools/` Übersicht und `/tools/denkschule/` sind Astro Seiten.
- `legacy/` enthält die alte Seite nur als Lesevorlage. Nichts daraus ausliefern oder importieren.

## Seitenstruktur und Adressen
- `/` Startseite mit Frage Einstieg
- `/wege/<slug>/` Wissenswege, `/bereiche/<bereich>/` Lebensbereiche
- `/lexikon/`, `/lexikon/<slug>/`, `/lexikon/fachgebiet/<slug>/`
- `/essays/`, `/essays/<url>/`
- `/tools/` mit den bestehenden Tools, `/tools/denkschule/`
- `/journale/`, `/journale/<produkt>/` (lernjournal, studienplaner, notizbuch, workoutlogbuch)
- `/suche/`, `/impressum/`, `/datenschutz/`, 404 Seite
- Slug Regeln: Lexikon Slug = Dateiname. Essay Slug = Frontmatter Feld `url`, niemals automatisch aus dem Titel.

## Zuordnung alter Adressen (301)
| Alt | Neu |
|---|---|
| `/plattform/mental/thema.html?slug=X` | `/lexikon/X/` |
| `/plattform/mental/gebiet.html?g=X` | `/lexikon/fachgebiet/X/` |
| `/plattform/mental/frage.html?slug=X` | `/wege/X/` |
| `/plattform/welt.html` mit oder ohne `?w=` | `/lexikon/` |
| `/plattform/mental/philosophie/denkschule.html` | `/tools/denkschule/` |
| `/plattform/suche.html` | `/suche/` |
| `/plattform/` und jede andere Adresse darunter | `/` |
| `/blog-artikel.html?slug=X` | `/essays/<url aus Frontmatter>/`, unbekannt: `/essays/` |
| `/blog.html` | `/essays/` |
| `/lernjournal.html`, `/studienplaner.html`, `/notizbuch.html`, `/workoutlogbuch.html` | `/journale/<name>/` |
| `/impressum.html`, `/datenschutz.html` | `/impressum/`, `/datenschutz/` |

Unbekanntes X leitet auf die Übersicht des Typs, nie 404. `utm_` Parameter bleiben erhalten.

## Technische Vorgaben
- **Tolerante Schemas:** Zod stoppt sonst den Build. Jedes Objekt `.passthrough()`, jedes Feld `.optional().catch(undefined)`, Listen `.catch([])`. Probleme per `console.warn` mit Dateiname melden. Unbekannte Blocktypen überspringen und warnen.
- **Markdown in Frontmatter Feldern** (zum Beispiel `textabschnitt.text`) rendert Astro nicht selbst. Immer über `src/lib/markdown.ts` mit `marked`.
- **lastmod:** `geprueft_am`, sonst `date` aus dem Frontmatter, sonst Datum aus dem Dateinamen (Essays), sonst kein lastmod. Nie das Dateisystem Datum, das ist beim Cloudflare Build für alle Dateien gleich.
- **Cloudflare saubere Adressen:** Pages leitet `/x.html` selbst mit 308 auf `/x` um. Prüfskripte akzeptieren 301 und 308 und folgen der Kette.
- **Middleware:** Functions können keine Dateien lesen. Die Tabelle kommt per `env.ASSETS.fetch(new URL('/redirects.json', request.url))` und wird im Modulspeicher gehalten. Alles, was nicht passt, geht per `next()` durch.
- **Decap Branch:** Auf `relaunch` steht `backend.branch: relaunch`. Beim Livegang zurück auf `master`. Nie auf `master` umstellen, solange der Relaunch nicht live ist.
- **Formulare ohne JavaScript:** Das Suchfeld ist ein GET Formular auf `/suche/?q=`.
- **Bekannte Lücke:** Tools und Human Map behalten vorerst ihr altes Aussehen, nur ihre Header Links zeigen auf die neue Seite.

## Design: Logbuch
Farben nur über Tokens, hell und dunkel. Dunkel gilt bei `prefers-color-scheme: dark` unter `:root:not([data-theme="light"])` und bei `:root[data-theme="dark"]`.

| Token | Hell | Dunkel |
|---|---|---|
| --papier (Seitengrund) | #ECEBE3 | #14130F |
| --blatt (Karten) | #F6F5EF | #1D1C17 |
| --tinte (Text) | #16150F | #ECEAE2 |
| --bleistift (Nebentext) | #5F5B50 | #A29E8F |
| --linie | #D3D0C3 | #302E27 |
| --marker (Gelb) | #F5D813 | #EBCB2A, als Fläche 30 % Deckkraft |
| --petrol (Links, Struktur) | #2F6B5E | #74B8A8 |
| --rot (nur Warnungen) | #B23A2E | #E07A62 |

Regeln:
- Zwei Schriften: Fraunces nur für Überschriften und Zahlen in Karten, Source Sans 3 für alles andere. `font-display: swap`, echter Fallback.
- Gelb heißt „wichtig“. Höchstens ein Marker pro Absatz. Gelb als Fläche nur für die eine Hauptaktion einer Seite.
- Petrol heißt „hier geht es weiter“: Links, Fortschritt, Labels. Keine dritte Akzentfarbe.
- Papierecke nur an der Kurzantwort eines Wegs.
- Radius 6px, kaum Schatten, feine Linien.
- Fließtext 17 bis 18px, Zeilenhöhe 1.6, Lesebreite höchstens 66 Zeichen.
- Vier Formatzeichen überall gleich: Punkt Lexikon, Weglinie Wege, Zeilen Essays, Regler Tools.
- `prefers-reduced-motion` schaltet alle Animationen ab.

## Aufbau eines Wissenswegs
Kurzantwort 40 bis 60 Wörter direkt unter der H1, Autor und „geprüft am“, Auf einen Blick, Warum es schwer ist, Ebenen (je: Was passiert, Woran du es merkst, Was konkret hilft, Beleg, Fazit, Darauf aufbauend), Selbsttest, Plan, Häufig gefragt, Hilfe und Werkzeuge, Grenzen und Quellen, Weitergehen.
Verkauf höchstens 10 Prozent des Inhalts, erst nach etwa 70 Prozent der Seite, höchstens zwei Angebote plus eine Mail Abfrage, keine Popups. Affiliate Links immer mit „Anzeige“ direkt daneben. Keine Links zu Arzneimitteln.

## Sprache in allen sichtbaren Texten
- Deutsch, direkt, freundlich.
- Echte Umlaute ä ö ü ß in sichtbarem Text. ae oe ue ss nur in Slugs, Dateinamen und Schlüsseln.
- Keine Gedankenstriche und keine Bindestriche als Satzzeichen, nur Komma und Punkt.
- Überschriften in der Sprache der Leser.

## Arbeitsweise
- Immer auf dem Branch `relaunch` arbeiten, nie direkt auf `master`.
- Vor jedem Schritt einen kurzen Plan zeigen und auf Freigabe warten.
- Kleine Schritte, nach jedem Schritt `npm run build` ohne Fehler, dann Commit.
- Nichts in `content/` umbenennen, verschieben oder löschen.
- Neue Frontmatter Felder immer optional, damit alte Einträge gültig bleiben.
- Vor dem Entfernen eines Blocktyps oder Felds per grep prüfen, ob `content/` ihn benutzt.

## Stolperfallen in diesem Repo
- Dateien sind UTF-8 ohne BOM. In PowerShell nie `Set-Content -Encoding UTF8` (schreibt ein BOM), sondern `[System.IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($false)))`.
- YAML im Frontmatter: jeden Textwert in doppelte Anführungszeichen setzen. Ein `: ` im Text bricht sonst das Parsen.
- Neue Dateien unter `content/` vor dem Commit mit einem kurzen Python Skript und PyYAML prüfen. Das Skript als temporäre `.py` Datei anlegen, nicht per `python -c`.
- Das Terminal ist Windows PowerShell 5.1: Befehle mit `;` verketten, nicht mit `&&`.

## Befehle
- `npm run dev` lokale Vorschau
- `npm run build` statischer Build nach `dist/` plus Pagefind Index
- `npx wrangler pages dev dist` lokale Vorschau inklusive Functions und Weiterleitungen
- `npm run check:redirects -- <basisadresse>` prüft alle alten Adressen aus `legacy-urls.txt` auf 301 oder 308 und Ziel 200
