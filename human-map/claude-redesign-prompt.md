# Prompt für Claude: Human Map – Redesign der Ergebnis-Seite

Kopiere alles unterhalb der Trennlinie in einen neuen Claude-Chat.

---

## Kontext

**Human Map** ist ein Persönlichkeits-Assessment-Tool auf einer statischen Website (Hybridlogs). Nutzer beantworten einen Fragebogen und bekommen eine Ergebnis-Seite mit Archetyp, Diagrammen und Detailwerten. Es ist eine reine Frontend-Anwendung (kein Backend, kein Build-Prozess): Vanilla HTML/CSS/ES6-JS (IIFE-Module), Daten liegen lokal im Browser (localStorage), Dark-Theme-Design mit CSS-Custom-Properties.

**Mein Problem / meine Anforderung:** Das Tool sammelt viele gute Rohdaten, aber der Nutzer bekommt am Ende keine klare, greifbare Erkenntnis über sich selbst. Ich will, dass jemand nach dem Test ein **klares Profil von sich selbst** bekommt: Stärken, Schwächen, Persönlichkeitseigenschaften, Intelligenzeigenschaften, was fällt ihm leicht, was fällt ihm schwer, und wie er sein Leben/Alltag/Denken/Verhalten anpassen oder besser hinterfragen kann. Das Ganze soll **schön visualisiert, übersichtlich, nicht zu viel aber auch nicht zu wenig** sein — eine **klare Linie**, kein Daten-Overkill.

Ich möchte mit dir das Konzept für ein Redesign der Ergebnis-Seite erarbeiten. Unten folgt eine vollständige Bestandsaufnahme des aktuellen Stands, danach meine konkrete Aufforderung.

---

## Bestandsaufnahme: Was aktuell existiert

### 1. Datenmodell (`js/model.js`)

**17 Dimensionen**, organisiert in 4 Cluster:

| Cluster | Dimension (intern) | Label | Typ |
|---|---|---|---|
| kern | offenheit | Offenheit | numerisch 0-100 |
| kern | struktur | Struktur | numerisch 0-100 |
| kern | energie | Soziale Energie | numerisch 0-100 |
| kern | verbindung | Verbindung | numerisch 0-100 |
| kern | tiefe | Verarbeitungstiefe | numerisch 0-100 |
| antrieb | werte_freiheit | Freiheitswert | numerisch 0-100 |
| antrieb | werte_leistung | Leistungswert | numerisch 0-100 |
| antrieb | werte_innovation | Innovationswert | numerisch 0-100 |
| antrieb | antrieb_type | Antriebstyp | kategorial |
| muster | bindungsstil | Bindungsstil | kategorial |
| muster | loc_internal | Selbstwirksamkeit | numerisch 0-100 |
| muster | stress_typ | Stressmuster | kategorial |
| muster | rumination | Grübeln | numerisch 0-100 |
| potenzial | mindset_growth | Growth Mindset | numerisch 0-100 |
| potenzial | grit_passion | Leidenschaft | numerisch 0-100 |
| potenzial | grit_ausdauer | Ausdauer | numerisch 0-100 |
| potenzial | intel_primary | Intelligenztyp | kategorial |
| potenzial | wachstumsfeld | Wachstumsfeld | kategorial |

**33 Fragen** über 4 Phasen (kern, antrieb, muster, potenzial), drei Fragetypen: `likert-7` (1-7 Skala mit Ankertexten), `scenario-binary` (2 Optionen mit Beschreibungstext), `scenario-4way`. Jede Frage speist mit Gewichten in eine oder mehrere Dimensionen ein.

**Archetyp-System:** 7 Kern-Archetypen (Pionier, Macher, Connector, Analyst, Bewahrer, Durchhalter, Freier Geist) + 6 seltene "Synergie"-Archetypen (z.B. Tiefenverbinder, Ausdauernder Visionär, Ruhiger Stratege, Empathischer Führer, Kreativer Übersetzer, Resilienter Vollender). Jeder Archetyp hat:
- `name`, `emoji`, `color`, `tagline` (1 Satz)
- `desc` (2-3 Sätze Beschreibung)
- `strengths`: Array von 3 Stichwörtern (z.B. `['Mut in Unsicherheit', 'Energie & Antrieb', 'Neue Wege erkennen']`)
- `blindspot`: 1 Satz (z.B. `'Ungeduld mit anderen; Schwierigkeit, abgeschlossene Systeme zu respektieren.'`)
- `conditions`: Array von Schwellenwert-Bedingungen pro Dimension mit Gewicht, daraus wird ein Match-Score 0-100 pro Archetyp berechnet (`js/archetypes.js`), der beste + zweitbeste Match werden als primärer/sekundärer Archetyp gezeigt.

**Wichtig:** Die Stärken/Blindspot-Texte sind **pro Archetyp fix**, nicht individuell aus den 17 tatsächlichen Scores der Person generiert. Zwei Personen mit demselben Archetyp aber unterschiedlichen Detailwerten bekommen denselben Text.

### 2. Scoring (`js/scoring.js`)

- Likert-Antworten (1-7) werden auf 0-100 normalisiert.
- Scenario-Antworten haben direkte 0-1-Werte pro Option, die zu 0-100 skaliert werden.
- Jede Dimension bekommt zusätzlich ein **Level 1-5** (Schwellen: 25/45/65/82) mit Textlabel: Anfang / Entwicklung / Aktiv / Stark / Meister.
- Kategoriale Dimensionen (Bindungsstil, Stressmuster, Antriebstyp, Intelligenztyp, Wachstumsfeld) haben einen String-Wert statt Score.

### 3. Ergebnis-Seite (`results.html`) — aktuelle Struktur, von oben nach unten

1. **Archetyp-Reveal**: Badge, Emoji, Name, Tagline, Beschreibung, 3 Stärken-Pills, 1 Blindspot-Satz.
2. **Rare-Archetyp-Unlock-Banner** (nur wenn seltene Kombi zutrifft).
3. **Synergie-Banner** (zeigt aktive Dimensions-Kombinationen an).
4. **Skill Tree + Galaxie-Ansicht**: Umschalter zwischen zwei Modi.
   - Skill Tree: SVG-Baum (Desktop) bzw. Cluster-Kacheln (Mobil), zeigt alle 17 Dimensionen gruppiert nach den 4 Clustern mit Level-Badges.
   - Galaxie: eigenes SVG, zeigt Ähnlichkeit zu allen Archetypen, Button öffnet Slide-over-Panel mit allen 13 Archetypen im Detail zum Vergleichen.
5. **Radar-Charts**: zwei Canvas-Diagramme nebeneinander — "Persönlichkeit" (Big-Five-artig) und "Intelligenzprofil".
6. **Detail-Dashboard**: Cluster-Filter-Tabs (Alle/Kern/Antrieb/Muster/Potenzial) + Grid mit einer Karte pro Dimension (Label + Score-Balken + Level-Badge "Lv 4 · Stark"). **Keine interpretierenden Texte auf den Karten** — nur Zahl/Label.
7. **Email-Capture**: Formspree-Formular (Endpoint aktuell nur Platzhalter, noch nicht live), sammelt Archetyp-Infos als Hidden Fields.
8. **CTA-Footer**: Links zu Produkten und "Assessment wiederholen".

### 4. Bereits erkannte Kernprobleme (gemeinsam mit meinem Assistenten erarbeitet)

- **Zu abstrakt, zu wenig lebensnah.** Eine Dashboard-Karte zeigt z.B. "Struktur: Lv 4 · Stark" — aber nirgends steht, was das für den Alltag bedeutet. Kein "das fällt dir leicht", kein "das fällt dir schwer", keine Handlungsableitung.
- **Blindspot-Text ist nicht individuell genug** — nur 1 Satz pro Archetyp (13 Archetypen total), nicht aus den tatsächlichen 17 Werten der Person abgeleitet.
- **Kein Lebensbereichs-Bezug.** Es gibt keine Zuordnung zu konkreten Lebensbereichen wie Beruf, Beziehungen, Gewohnheiten, Denken — nur abstrakte interne Cluster-Namen ("Kern", "Antrieb", "Muster", "Potenzial"), die für Laien wenig aussagekräftig sind.
- **Zu viele parallele Visualisierungen ohne klare Story.** Skill Tree + Galaxie + 2 Radar-Charts + 17-Karten-Dashboard zeigen im Grunde dieselben Daten vier Mal auf unterschiedliche Art — das wirkt eher überladen als klärend.
- **17 Dimensionen sind vermutlich zu viel als Hauptbotschaft.** Andere gute Tools (Big Five, StrengthsFinder Top 5, Enneagram) reduzieren die Kernaussage auf 3-5 Dinge. Idee: 17 Dimensionen bleiben als Rechengrundlage/Detailebene bestehen, werden aber zu wenigen (z.B. 5) übergeordneten Lebensbereichen aggregiert, die die Hauptbotschaft tragen.

### 5. Bereits diskutierte, aber noch nicht final entschiedene Ideen

- **Lebensbereiche-Idee**: 17 Dimensionen zu 5 Bereichen aggregieren, z.B. "Denken & Entscheiden", "Beziehungen & Nähe", "Innere Balance", "Antrieb & Umsetzung", "Ausdauer & Wachstum" — Gewichtung/Zuordnung noch nicht final.
- **Visualisierung dieser Lebensbereiche**: Eine Körper-Silhouette mit farbigen Zonen (Kopf/Herz/Bauch/Arme/Beine) wurde vorgeschlagen, **von mir aber abgelehnt** ("mag das nicht mit dem Körper"). Alternativen, die im Raum stehen: Wheel-of-Life-Radar-Chart (Coaching-Format, bekannt, seriös), horizontale Profil-Balken (minimalistisch, textnah), 2D-Kompass (zwei Achsen, ein Punkt "hier stehst du", eyecatcher aber wenig Informationsgehalt).
- Es ist noch offen, ob 17 Dimensionen als Detailtiefe überhaupt sinnvoll bleiben, oder ob das Konzept insgesamt neu gedacht werden sollte.

---

## Meine Aufforderung an dich (Claude)

Arbeite mit mir zusammen ein konkretes Redesign-Konzept für die Ergebnis-Seite aus. Ich möchte **nicht sofort Code**, sondern zunächst ein durchdachtes Konzept, das ich danach mit meinem Coding-Assistenten umsetzen lasse. Bitte:

1. **Hinterfrage kritisch**, ob die aktuelle Struktur (Archetyp → Skill Tree/Galaxie → Radar-Charts → 17er-Dashboard) die richtige Grundlage ist, oder ob Teile davon überflüssig/redundant sind und gestrichen/zusammengelegt werden sollten.
2. **Schlage ein konkretes Visualisierungskonzept** vor (oder mehrere Optionen mit Vor-/Nachteilen), das eine "klare Linie" erzeugt — ein zentrales Bild/Chart, das sofort zeigt "wo stehe ich", ergänzt um kurze, konkrete Texte statt weiterer Zahlenfriedhöfe. Kein Körper-Silhouette-Ansatz.
3. **Entwickle einen Vorschlag für die Aggregation** der 17 Dimensionen auf eine überschaubare Anzahl von Lebensbereichen (3-6), inklusive Namensvorschlägen, Zuordnung der Dimensionen und Gewichtung.
4. **Skizziere den Content-Ansatz**: Wie sollten die interpretierenden Texte aussehen (was fällt leicht / was fällt schwer / konkrete Handlungsempfehlung), damit sie individuell genug wirken und nicht wie generische Horoskop-Sätze?
5. **Schlage eine neue Seitenstruktur** vor (Reihenfolge der Sektionen), die die bestehenden Elemente (Skill Tree, Galaxie, Radar-Charts, 17er-Dashboard) sinnvoll einordnet — z.B. als "Mehr Details" unterhalb der neuen Kernaussage, statt sie zu ersetzen.
6. Bleib **technisch realistisch**: Es ist eine statische Vanilla-JS/HTML/CSS-Seite ohne Backend, muss mobil funktionieren, und soll sich optisch in ein bestehendes dunkles Design mit klaren Farbakzenten pro Dimension einfügen.

Gib mir am Ende eine klare, priorisierte Zusammenfassung: Was würdest du zuerst umsetzen, was ist optional/später?
