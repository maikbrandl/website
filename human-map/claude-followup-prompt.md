# Prompt für Claude: Human Map – nächste Runde nach dem Lebensbereiche-Redesign

Kopiere alles unterhalb der Trennlinie in einen neuen Claude-Chat. Das ist die Fortsetzung eines früheren Redesign-Prompts (siehe `claude-redesign-prompt.md` im selben Ordner) — die dort besprochenen Ideen sind inzwischen **implementiert und live**. Dieser Prompt beschreibt den aktuellen Stand und bittet um die nächste Iteration.

---

## Kontext

**Human Map** ist ein Persönlichkeits-Assessment auf einer statischen Website (Hybridlogs). Reine Frontend-Anwendung: Vanilla HTML/CSS/ES6-JS (IIFE-Module), kein Build-Prozess, kein Backend, Daten liegen im Browser (`localStorage`). Dark-Theme-Design mit CSS-Custom-Properties.

Im letzten Redesign-Zyklus wurde die Ergebnis-Seite (`results.html`) grundlegend umgebaut: von einem reinen "17-Dimensionen-Dashboard ohne Interpretation" zu einer Seite mit einer klaren Kernaussage, 5 aggregierten Lebensbereichen und individuellen, textbasierten Insights. Das ist jetzt live und funktioniert. Ich will mit dir die **nächste Iteration** planen: Content-Tiefe, Qualität der generierten Texte, und offene strukturelle Fragen.

---

## Bestandsaufnahme: Was aktuell existiert

### 1. Datenmodell (unverändert, `js/model.js` / `js/scoring.js` / `js/archetypes.js`)

17 Dimensionen in 4 Clustern (kern, antrieb, muster, potenzial), 33 Fragen, Scores 0-100 pro numerischer Dimension plus kategoriale Werte (Bindungsstil, Stressmuster, Antriebstyp, Intelligenztyp, Wachstumsfeld). 7 Kern-Archetypen + 6 seltene Synergie-Archetypen, jeweils mit `name`, `emoji`, `tagline`, `desc`, 3 `strengths`, 1 `blindspot`-Satz, Match per gewichteten Schwellen-Bedingungen. *(Details siehe `claude-redesign-prompt.md`, Abschnitt 1 — unverändert.)*

### 2. NEU: Lebensbereiche-Aggregation (`js/lifeareas.js`)

Die 17 Dimensionen werden zu **5 Lebensbereichen** aggregiert, jeweils mit fest zugewiesenen Gewichten:

| Bereich | Label | Gespeiste Dimensionen (Gewicht) |
|---|---|---|
| `denken` | Denken & Entscheiden | offenheit (0.40), tiefe (0.35), werte_innovation (0.25) |
| `antrieb` | Antrieb & Umsetzung | struktur (0.35), loc_internal (0.35), werte_leistung (0.30) |
| `beziehungen` | Beziehungen & Nähe | verbindung (0.55), energie (0.45) |
| `balance` | Innere Balance | rumination (0.55, invertiert), loc_internal (0.25), mindset_growth (0.20) |
| `wachstum` | Ausdauer & Wachstum | grit_ausdauer (0.40), grit_passion (0.30), mindset_growth (0.30) |

Jeder Bereich bekommt einen Score 0-100 (gewichteter Durchschnitt der Dimensionen, `rumination` wird für "Innere Balance" invertiert: 100 - Score). Wichtig: **Die Bänder sind relativ zum eigenen Durchschnitt der Person**, nicht absolut oder im Vergleich zu anderen: Der Mittelwert der 5 Bereichs-Scores wird berechnet, und jeder Bereich bekommt ein Delta dazu. Delta ≥ +10 → Band `traegt` ("trägt dich"), Delta ≤ -10 → Band `fordert` ("fordert dich"), dazwischen → `gleichgewicht`. Es gibt bewusst **kein "gut/schlecht"** — nur "das ist bei dir lauter" vs. "das ist bei dir leiser".

Pro Bereich wird zusätzlich die **treibende Dimension** ermittelt: `driverDims()` liefert die Dimension mit dem höchsten effektiven Wert (`leicht`, speist den "Stärke"-Text) und die mit dem niedrigsten (`schwer`, speist den "Herausforderung"-Text und den Tipp) innerhalb der Gewichte dieses Bereichs.

### 3. NEU: Content-Architektur (`js/content.js`)

- `DIM_TEXT`: 13 Dimensionen (alle die als Bereichs-Gewicht vorkommen), je ein `{ high, low }`-Paar mit 1 Satz Alltagssprache (z.B. was es heißt, hohe/niedrige Offenheit zu haben). Speist Stärke- und Herausforderungs-Sätze.
- `DIM_TIPS`: **NEU seit letzter Runde.** 12 konkrete, umsetzbare Tipp-Sätze (1 pro Dimension, ausschließlich für die "schwache" Richtung — nur `rumination` ist invertiert, sonst ist die "schwer"-Seite bei allen Dimensionen immer `.low`). Beispiel: `offenheit: 'Probiere diese Woche bewusst eine ungewohnte Methode oder Meinung aus, bevor du sie bewertest...'`
- `CAT_TEXT`: Texte für kategoriale Werte (Bindungsstil, Stressmuster, Antriebstyp, Intelligenztyp, Wachstumsfeld) — liefert den "Flavor"-Satz pro Bereichs-Karte.
- `EXPERIMENTS`: 1 konkretes Mini-Experiment pro Lebensbereich, wird für den schwächsten Bereich der Person als "Dein nächster Schritt" gezeigt.

Alles ist **statisches, deterministisches Copy** — kein KI-Call, kein Server, keine Zufälligkeit. Gleiche Scores → immer derselbe Text.

### 4. NEU: Insight-Engine (`js/insights.js`)

- `TENSION_RULES`: **16 fest verdrahtete Spannungs-Regeln.** Jede Regel hat eine `when(scores)`-Bedingung (z.B. `werte_freiheit >= 65 && struktur >= 65`), eine `strength(scores)`-Funktion (wie stark die Bedingung überschritten ist, für Priorisierung bei mehreren zutreffenden Regeln) und einen fertigen 2-3-Satz-Text, der die Spannung zwischen zwei gegensätzlichen Dimensionen benennt (z.B. "Du willst Freiheit und baust dir gleichzeitig ständig Strukturen, die dich einengen."). Die am stärksten zutreffende Regel gewinnt (`pickTension`).
- `fallbackTension`: Falls keine der 16 Regeln zutrifft (z.B. bei einem sehr ausgeglichenen Profil ohne Extremwerte), wird stattdessen der stärkste vs. schwächste Lebensbereich der Person als generischer Fallback-Satz verwendet.
- `buildBrief`: Baut den "Brief an dich"-Fließtext aus 3 Teilen: 1) stärkster Treiber-Satz des stärksten Lebensbereichs, 2) die gewählte Kernspannung, 3) ein Schluss-Satz, der auf den schwächsten Bereich verweist.
- `buildAreaCards`: Baut die 5 Bereichs-Karten-Objekte (Label, Score, Band, Stärke-Text, Herausforderungs-Text, Tipp-Text, Flavor-Text).
- `pickExperiment`: Wählt das Experiment für den schwächsten Bereich.

### 5. NEU: Seitenstruktur (`results.html`), von oben nach unten

1. **Kernspannung** (`#hm-tension-section`) — 1 prägnanter Satz/Absatz, aus `pickTension`/`fallbackTension`.
2. **Brief an dich** (`#hm-brief-section`) — 4-6-Satz-Fließtext aus `buildBrief`.
3. **Archetyp-Reveal** — wie vorher (Badge, Name, Tagline, Beschreibung, 3 Stärken-Pills, Blindspot), plus **neu**: ein Ähnlichkeits-Satz ("Du ähnelst am ehesten X") via `hm-arch-similar`, und ein optionaler Rare-Archetyp-Badge darunter.
4. **Wo du stehst: Deine 5 Lebensbereiche** (`#hm-verort-section`) — vergrößertes Radar-Chart (620px, zentriert) über den 5 Bereichen, darunter 5 Karten in sauberem 3+2-Flex-Layout. Jede Karte zeigt: Label, Band-Badge, **Stärke** (grün hervorgehoben), **Herausforderung** (amber hervorgehoben), optional **Tipp** (goldene Box) und optional Flavor-Satz.
5. **Dein nächster Schritt** (`#hm-experiment-section`) — 1 Experiment für den schwächsten Bereich.
6. **Email-Capture** — **aktuell temporär deaktiviert** (in `results.html` per HTML-Kommentar auskommentiert, Formspree-Endpoint war ohnehin nur Platzhalter, noch nie live geschaltet). Code ist vollständig erhalten, kann jederzeit reaktiviert werden.
7. **"Mehr Details ansehen"** (`<details>`-Collapsible, standardmäßig zugeklappt) — enthält die drei "alten" Visualisierungen unverändert: Skill Tree (SVG-Baum/Cluster-Kacheln + Galaxie-Vergleichsansicht), die zwei ursprünglichen Radar-Charts (Persönlichkeit, Intelligenzprofil), und das 17-Karten-Dimensions-Dashboard mit Cluster-Filter-Tabs. Diese wurden bewusst **nicht gelöscht**, sondern hinter einem Klick versteckt, um Nutzern mit Interesse an Rohdaten trotzdem Zugang zu geben.
8. **CTA-Footer** — Produkte-Link, "Assessment wiederholen".

### 6. Styling-Details, die relevant sein könnten
- 5 Bereichs-Akzentfarben: `--area-denken`, `--area-antrieb`, `--area-beziehungen`, `--area-balance`, `--area-wachstum` (in `variables.css`).
- Bereichs-Karten: `flex: 1 1 300px; max-width: 340px;` → erzwingt 3+2-Reihen auf Desktop, 1-spaltig auf Mobil.
- Bekannter, jetzt behobener CSS-Fallstrick: `variables.css` definiert nur `--hm-space-1/2/3/4/6/8/12/16/24` (keine 5, 7, 9, 10, 11 usw.) — ein ungültiger Spacing-Token in einer Shorthand-Property (z.B. `margin`, `gap`, `padding`) macht die **gesamte** Deklaration ungültig, nicht nur den einen Wert. Ist mehrfach passiert (Karten-Gap, Karten-Padding, Dashboard-Gap, Chart-Zentrierung) und jetzt überall gefixt.

### 7. Was bewusst NICHT (mehr) existiert bzw. offen ist
- Kein Backend, kein KI-generierter Text zur Laufzeit — alles ist vordefiniertes Copy plus Regel-Auswahl.
- Email-Capture ist funktionsfähig im Code, aber aktuell ausgeblendet und der Formspree-Endpoint war nie ein echter (Platzhalter-URL).
- Kein Teilen/Export-Feature (z.B. "Profil als Bild speichern/teilen") — bisher nicht angegangen.
- Skill Tree, Galaxie-Vergleich und 17er-Dashboard existieren weiterhin parallel (nur versteckt hinter "Mehr Details") — die ursprüngliche Kritik "vier Visualisierungen zeigen dieselben Daten" ist dadurch entschärft, aber nicht strukturell aufgelöst.

---

## Bekannte Schwachstellen dieser Iteration (meine eigene kritische Einschätzung)

1. **Die 16 `TENSION_RULES` sind eine Positivliste, kein vollständiges Modell.** Bei 13 relevanten Dimensionen mit Schwellen 65/40 gibt es weit mehr mögliche Spannungs-Kombinationen als 16 abgedeckte. Nutzer mit unüblichen Score-Kombinationen (z.B. keine der 16 Bedingungen trifft zu, aber das Profil ist trotzdem nicht "ausgeglichen") landen im generischen Fallback-Satz ("Dein stärkster Bereich ist X, dein leisester Y..."), der austauschbarer wirkt als die Regel-Texte.
2. **`DIM_TIPS` deckt nur die "schwache" Richtung ab** (12 Tipps, je 1 pro Dimension). Es gibt keinen Tipp dafür, wie man eine vorhandene Stärke gezielt weiter nutzt/einsetzt — nur "was tun bei Schwäche".
3. **Nur 7 Kern-Archetypen haben einen Ähnlichkeits-Vergleich** (`Archetypes.calculateSimilarity` deckt nur `MODEL.ARCHETYPE_PROFILES`, nicht die 6 seltenen Synergie-Archetypen ab) — der "Du ähnelst am ehesten X"-Satz kann bei seltenen Typen inkonsistent wirken.
4. **`buildBrief` ist eine feste 3-Satz-Formel** (Stärke-Satz + Spannungs-Satz + Schwäche-Verweis) — bei manchen Score-Kombinationen können sich Stärke-Satz und Kernspannungs-Satz inhaltlich überschneiden/wiederholen, da beide potenziell dieselbe Dimension referenzieren.
5. **Email-Capture-Frage ungeklärt**: Soll das Formular reaktiviert werden (mit echtem Formspree-Endpoint), ersetzt werden (z.B. durch ein PDF-Download-Angebot), oder dauerhaft entfernt werden?
6. **Kein Teilen-Feature**: Andere ähnliche Tools (16Personalities, StrengthsFinder) leben stark von Social Sharing der Ergebnisse — aktuell nicht vorhanden.

---

## Meine Aufforderung an dich (Claude)

Ich möchte **kein sofortiges Code**, sondern zunächst deine Einschätzung und konkrete Vorschläge, die ich danach mit meinem Coding-Assistenten umsetzen lasse. Bitte:

1. **Bewerte die Content-Tiefe kritisch**: Reichen 16 Spannungs-Regeln + 1 Fallback für ein Tool, das sich "augenöffnend" anfühlen soll, oder braucht es mehr Abdeckung? Wenn ja: wie viele zusätzliche Regeln wären sinnvoll, und nach welchem Muster sollten sie ausgewählt werden (rein kombinatorisch alle Dimensionspaare, oder gezielt die psychologisch interessantesten Spannungen)?
2. **Schlage vor, ob/wie `DIM_TIPS` um eine "Stärke nutzen"-Richtung erweitert werden sollte** — z.B. ein zweiter Tipp-Typ pro Dimension für den `leicht`-Treiber jeder Karte, nicht nur für `schwer`.
3. **Nimm Stellung zum Email-Capture**: reaktivieren mit echtem Formspree-Setup, durch ein anderes Format ersetzen (z.B. PDF-Export des Profils), oder ganz weglassen? Was wäre am wertvollsten für Nutzer, ohne die Seite aufzublähen?
4. **Bewerte, ob ein Teilen/Export-Feature** (z.B. eine kompakte "Share Card" mit Archetyp + 5 Lebensbereichen als Bild) sich lohnt, und falls ja, wie man das technisch ohne Backend umsetzen könnte (z.B. Canvas-basiertes Bild-Rendering im Browser).
5. **Prüfe die Redundanz der "Mehr Details"-Sektion**: Sollten Skill Tree, Galaxie-Vergleich und 17er-Dashboard weiter bestehen bleiben (aktuell hinter einem Klick versteckt), oder eher weiter reduziert/zusammengelegt werden?
6. Bleib **technisch realistisch**: Vanilla JS/HTML/CSS, kein Backend, kein Build-Schritt, muss mobil funktionieren, muss sich in das bestehende dunkle Design mit Bereichs-Akzentfarben einfügen.

Gib mir am Ende eine klare, priorisierte Liste: Was würdest du als Nächstes umsetzen, was ist optional/später?
