# Hybridlogs – Premium Website

Premium Website für [Hybridlogs Journals](https://www.hybridlogjournals.de/) – hochwertige Journals für Schule, Studium und Weiterbildung.

## Architektur

```
├── index.html              Landingpage (Hero, Produkte, Features, Testimonials, Vergleich, Story)
├── studienplaner.html      Produktseite: Studienplaner (311 S., A5)
├── notizbuch.html          Produktseite: Schul-Notizbuch (125 S., A4, Cornell)
├── lernjournal.html        Produktseite: Lernjournal (190 S., A5)
├── blog.html               Blog-Übersicht
├── impressum.html          Impressum
├── datenschutz.html        Datenschutzerklärung
├── css/
│   └── styles.css          Design System (CSS Custom Properties, 22 Sections)
├── js/
│   ├── components.js       Component System (Header, Footer, Cookie Banner, Icons)
│   └── main.js             Interactions (Animations, Navigation, Gallery, Parallax)
├── images/                 Produktbilder (werden noch ergänzt)
├── sitemap.xml             XML-Sitemap
├── robots.txt              Crawler-Steuerung
└── README.md               Diese Datei
```

## Design System

- **Fonts**: Inter (UI) + Playfair Display (Headlines)
- **Theme**: Dark (#0a0a0a) mit Gold-Akzent (#c9a84c)
- **Spacing**: 8px Grid System
- **Animations**: IntersectionObserver mit `data-animate`, `data-stagger`, `data-count`, `data-parallax`

## Component System

Header, Footer und Cookie Banner werden einmalig in `components.js` definiert und per JS in jede Seite injiziert. Jede Seite enthält nur Slot-Elemente:

```html
<div id="header-slot"></div>
<!-- Seiteninhalt -->
<div id="footer-slot"></div>
<div id="cookie-slot"></div>
```

## Entwicklung

Kein Build-Step nötig – HTML-Dateien direkt im Browser öffnen.

## Erweiterung

- **Neue Seiten**: HTML mit Slots anlegen, `components.js` + `main.js` einbinden
- **Neue Produkte**: Produktseite erstellen + Navigation in `components.js` erweitern
- **Blog-Artikel**: Karte in `blog.html` ergänzen, ggf. Einzelseite anlegen
- **Styling**: CSS Custom Properties in `:root` anpassen
