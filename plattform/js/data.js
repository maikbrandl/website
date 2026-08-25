/**
 * Hybridlog Plattform – Inhalte (Content Collections, vanilla)
 * Ersetzt Astro Content Collections durch eine statische Datenquelle.
 * window.HLData = { domaenen, gebiete, inhalte, helpers }
 *
 * gebiet:  { slug, name, farbeVar, domaene: 'mental'|'koerperlich', einleitung, reihenfolge }
 * inhalt:  { slug, type: 'tool'|'artikel', gebiet, title, teaser, sneak, minutes, href }
 *   href = tatsaechliches Ziel (statische Seite, Blogbeitrag oder externes Tool)
 *   Blogbeitraege verlinken auf ../blog-artikel.html?slug=<dateiname-ohne-md>
 */
(function () {
    'use strict';

    const DOMAENEN = [
        { slug: 'mental', name: 'Mental', aktiv: true },
        { slug: 'koerperlich', name: 'Körperlich', aktiv: false },
    ];

    const GEBIETE = [
        {
            slug: 'philosophie', name: 'Philosophie', farbeVar: '--area-philosophie', domaene: 'mental',
            einleitung: 'Große Fragen nach Wahrheit, Sinn und dem guten Leben, verständlich gemacht.',
            reihenfolge: 1,
        },
        {
            slug: 'psychologie', name: 'Psychologie', farbeVar: '--area-psychologie', domaene: 'mental',
            einleitung: 'Wie wir fühlen, entscheiden und uns verhalten, und was dahintersteckt.',
            reihenfolge: 2,
        },
        {
            slug: 'lernen', name: 'Lernen und Lernmethoden', farbeVar: '--area-lernen', domaene: 'mental',
            einleitung: 'Methoden, die wirklich wirken, statt Tricks, die nur beschäftigt halten.',
            reihenfolge: 3,
        },
        {
            slug: 'persoenliche-entwicklung', name: 'Persönliche Entwicklung', farbeVar: '--area-entwicklung', domaene: 'mental',
            einleitung: 'Gewohnheiten, Disziplin und Reflexion als System, nicht als Zufall.',
            reihenfolge: 4,
        },
        {
            slug: 'kognition', name: 'Kognition und Gehirn', farbeVar: '--area-kognition', domaene: 'mental',
            einleitung: 'Wie Aufmerksamkeit, Gedächtnis und Denkfehler unser Erleben formen.',
            reihenfolge: 5,
        },
        {
            slug: 'zukunft-ki', name: 'Zukunft und KI', farbeVar: '--area-zukunft', domaene: 'mental',
            einleitung: 'Was künstliche Intelligenz für Denken, Lernen und Alltag bedeutet.',
            reihenfolge: 6,
        },
    ];

    const INHALTE = [
        // ── Philosophie ──
        {
            slug: 'denkschule', type: 'tool', gebiet: 'philosophie',
            title: 'Welche Denkschule bist du?',
            teaser: 'Ein kurzer Fragebogen ordnet dich einer philosophischen Grundhaltung zu.',
            sneak: 'Sechs Fragen zu Wahrheit, Sinn und Handeln, am Ende deine Denkschule.',
            minutes: 3,
            href: 'mental/philosophie/denkschule.html',
        },
        {
            slug: 'atlas-philosophie', type: 'tool', gebiet: 'philosophie',
            title: 'Atlas der Philosophie',
            teaser: 'Ein interaktiver Überblick über Epochen, Themengebiete und Denker.',
            sneak: 'Stöbere nach Zeit oder nach Themengebiet durch 70 Denker.',
            minutes: 5,
            href: '../tools/philosophie/',
        },
        {
            slug: 'illusion-der-zeit', type: 'artikel', gebiet: 'philosophie', date: '2026-06-10',
            title: 'Die Illusion der Zeit, warum du sie nie wirklich erlebt hast',
            teaser: 'Warum wir die Gegenwart nie direkt erleben und was das für unser Zeitgefühl bedeutet.',
            sneak: 'Was wir Gegenwart nennen, ist immer schon einen Moment vergangen.',
            minutes: 6,
            href: '../blog-artikel.html?slug=2026-06-10-die-illusion-der-zeit-warum-du-sie-nie-wirklich-erlebt-hast',
        },
        {
            slug: 'manifestation', type: 'artikel', gebiet: 'philosophie', date: '2026-06-12',
            title: 'Manifestation verständlich erklärt',
            teaser: 'Was an der Idee dran ist, dass alles, was du dir wünschst, bereits existiert.',
            sneak: 'Manifestation nüchtern betrachtet, jenseits von Esoterik.',
            minutes: 7,
            href: '../blog-artikel.html?slug=2026-06-12-manifestation-verständlich-erklärt-was-wenn-alles-was-du-dir-wünschst-bereits-existiert',
        },

        // ── Psychologie ──
        {
            slug: 'human-map', type: 'tool', gebiet: 'psychologie',
            title: 'Human Map',
            teaser: 'Ein wissenschaftlich gestütztes Selbstbild aus sechs Ebenen.',
            sneak: 'Ein Fragebogen zeichnet deine innere Landkarte, datenbasiert.',
            minutes: 12,
            href: '../human-map/',
        },
        {
            slug: 'metakognition', type: 'artikel', gebiet: 'psychologie', date: '2026-03-01',
            title: 'Metakognition, Gedanken beobachten statt kontrolliert werden',
            teaser: 'Wie du lernst, deine Gedanken zu bemerken, statt dich von ihnen treiben zu lassen.',
            sneak: 'Wer seine Gedanken bemerkt, ist ihnen weniger ausgeliefert.',
            minutes: 6,
            href: '../blog-artikel.html?slug=2026-03-01-willkommen-im-hybridlogs-blog',
        },
        {
            slug: 'mehr-optionen', type: 'artikel', gebiet: 'psychologie', date: '2026-06-14',
            title: 'Warum mehr Optionen dich nicht weiterbringen',
            teaser: 'Warum mehr Auswahl oft lähmt statt befreit, und was wirklich hilft.',
            sneak: 'Zu viele Optionen führen zu Zögern statt zu besseren Entscheidungen.',
            minutes: 5,
            href: '../blog-artikel.html?slug=2026-06-14-warum-mehr-optionen-dich-nicht-weiterbringen',
        },
        {
            slug: 'denkfehler-18', type: 'artikel', gebiet: 'psychologie', date: '2026-07-30',
            title: '18 Denkfehler, die deine Entscheidungen heimlich sabotieren',
            teaser: 'Achtzehn kognitive Verzerrungen, die deine Entscheidungen unbemerkt lenken.',
            sneak: 'Kleine Denkfehler mit großer Wirkung auf dein Urteil.',
            minutes: 9,
            href: '../blog-artikel.html?slug=2026-07-30-18-denkfehler-die-deine-entscheidungen-heimlich-sabotieren',
        },
        {
            slug: 'carl-jung', type: 'artikel', gebiet: 'psychologie', date: '2026-07-30',
            title: 'Carl Jung einfach erklärt, der Schatten als Lehrer',
            teaser: 'Warum der verdrängte Teil von dir dein größter Lehrer sein kann.',
            sneak: 'Was wir an uns verstecken, wirkt weiter, bis wir hinsehen.',
            minutes: 8,
            href: '../blog-artikel.html?slug=2026-07-30-carl-jung-einfach-erklärt-warum-der-teil-von-dir-den-du-versteckst-dein-größter-lehrer-ist',
        },
        {
            slug: 'mbti-16', type: 'artikel', gebiet: 'psychologie', date: '2026-07-30',
            title: 'Die 16 MBTI-Persönlichkeitstypen, welcher bist du wirklich?',
            teaser: 'Die 16 Typen im Überblick und wie viel sie wirklich über dich aussagen.',
            sneak: 'Vier Gegensatzpaare ergeben die bekannten sechzehn Typen.',
            minutes: 8,
            href: '../blog-artikel.html?slug=2026-07-30-die-16-mbti-persönlichkeitstypen-welcher-bist-du-wirklich-1',
        },
        {
            slug: 'psychologie-experimente', type: 'artikel', gebiet: 'psychologie', date: '2026-08-03',
            title: 'Die berühmtesten Psychologie-Experimente',
            teaser: 'Die bekanntesten Experimente der Psychologie und was sie über uns verraten.',
            sneak: 'Studien, die unser Bild vom Menschen für immer verändert haben.',
            minutes: 8,
            href: '../blog-artikel.html?slug=2026-08-03-die-berühmtesten-psychologie-experimente-die-dein-bild-vom-menschen-für-immer-verändern',
        },
        {
            slug: 'grosse-psychologen', type: 'artikel', gebiet: 'psychologie', date: '2026-08-03',
            title: 'Die großen Psychologen und ihre Theorien',
            teaser: 'Zwölf große Ideen der Psychologie, die erklären, warum du tickst, wie du tickst.',
            sneak: 'Von Freud bis heute, die Theorien hinter deinem Verhalten.',
            minutes: 9,
            href: '../blog-artikel.html?slug=2026-08-03-die-großen-psychologen-und-ihre-theorien-12-ideen-die-erklären-warum-du-tickst-wie-du-tickst',
        },

        // ── Lernen ──
        {
            slug: 'active-recall', type: 'artikel', gebiet: 'lernen', date: '2026-06-02',
            title: 'Active Recall, die effektivste Lernmethode erklärt',
            teaser: 'Warum aktives Abrufen dem Wiederlesen klar überlegen ist, mit Belegen aus der Forschung.',
            sneak: 'Sich selbst abfragen schlägt das erneute Durchlesen deutlich.',
            minutes: 7,
            href: '../blog-artikel.html?slug=2026-06-02-active-recall-die-effektivste-lernmethode-erklärt-1',
        },
        {
            slug: 'hochleistungslerner', type: 'artikel', gebiet: 'lernen', date: '2026-06-08',
            title: 'Was Hochleistungslerner anders machen, 5 Gewohnheiten',
            teaser: 'Fünf Gewohnheiten, die gute Lerner von bloß fleißigen unterscheiden.',
            sneak: 'Nicht mehr Stunden, sondern bessere Methoden machen den Unterschied.',
            minutes: 8,
            href: '../blog-artikel.html?slug=2026-06-08-was-hochleistungslerner-anders-machen-5-gewohnheiten-die-niemand-dir-beibringt-7',
        },

        // ── Persönliche Entwicklung ──
        {
            slug: 'disziplin-system', type: 'artikel', gebiet: 'persoenliche-entwicklung', date: '2026-06-23',
            title: 'Disziplin ist kein Charakterzug, sondern ein System',
            teaser: 'Warum Disziplin kein Charakterzug ist, sondern ein System, das man baut.',
            sneak: 'Nicht Willenskraft entscheidet, sondern die Umgebung und die Routine.',
            minutes: 7,
            href: '../blog-artikel.html?slug=2026-06-23-disziplin-ist-kein-charakterzug-warum-sie-ein-system-ist-und-wie-du-es-aufbaust',
        },
        {
            slug: 'entspannen-zwang', type: 'artikel', gebiet: 'persoenliche-entwicklung', date: '2026-06-23',
            title: 'Warum du nur entspannen kannst, wenn du dazu gezwungen wirst',
            teaser: 'Warum echte Erholung so schwerfällt und erst der Zwang uns zur Ruhe bringt.',
            sneak: 'Wer nie abschaltet, entspannt meist erst, wenn er muss.',
            minutes: 6,
            href: '../blog-artikel.html?slug=2026-06-23-warum-du-nur-entspannen-kannst-wenn-du-dazu-gezwungen-wirst',
        },
        {
            slug: '21-tage-mythos', type: 'artikel', gebiet: 'persoenliche-entwicklung', date: '2026-07-13',
            title: 'Der 21-Tage-Mythos, warum Gewohnheiten länger brauchen',
            teaser: 'Warum neue Gewohnheiten viel länger brauchen als die berühmten 21 Tage.',
            sneak: 'Die 21-Tage-Regel ist ein Missverständnis, die Wahrheit ist geduldiger.',
            minutes: 6,
            href: '../blog-artikel.html?slug=2026-07-13-der-21-tage-mythos-warum-neue-gewohnheiten-so-viel-länger-brauchen-als-du-denkst',
        },
        {
            slug: 'potenzial-flow-ikigai', type: 'artikel', gebiet: 'persoenliche-entwicklung', date: '2026-08-03',
            title: 'Dein volles Potenzial entfalten, Flow, Ikigai und Selbstwert',
            teaser: 'Wie Flow, Ikigai und echtes Selbstwertgefühl zusammen dein Potenzial entfalten.',
            sneak: 'Drei Ideen, wie sinnvolles Arbeiten und Wohlbefinden entstehen.',
            minutes: 8,
            href: '../blog-artikel.html?slug=2026-08-03-mbti-big-five-oder-enneagramm-welcher-persönlichkeitstest-taugt-wirklich-was',
        },

        // ── Kognition und Gehirn ──
        {
            slug: 'blockuniversum', type: 'tool', gebiet: 'kognition',
            title: 'Das Blockuniversum',
            teaser: 'Warum deine Zukunft in gewissem Sinn schon existiert, eine Reise durch die Raumzeit.',
            sneak: 'Von der Relativitätstheorie bis zu Manifestation und Veränderung.',
            minutes: 8,
            href: '../tools/blockuniversum/',
        },
        {
            slug: 'deep-work', type: 'artikel', gebiet: 'kognition', date: '2026-06-09',
            title: 'Deep Work, was hinter dem Flow-Zustand steckt',
            teaser: 'Was hinter dem Flow-Zustand steckt und wie du ihn gezielt auslöst.',
            sneak: 'Flow braucht klare Ziele, sofortiges Feedback und die richtige Schwierigkeit.',
            minutes: 7,
            href: '../blog-artikel.html?slug=2026-06-09-deep-work-was-hat-es-denn-mit-dem-flow-zustand-auf-sich-und-wie-aktiviert-man-ihn',
        },
        {
            slug: 'gehirn-erinnerungen', type: 'artikel', gebiet: 'kognition', date: '2026-07-13',
            title: 'Dein Gehirn zählt keine Tage, sondern Erinnerungen',
            teaser: 'Warum die Zeit im Alltag rast und wie neue Erinnerungen sie wieder dehnen.',
            sneak: 'Dein Gehirn misst Zeit in Erinnerungen, nicht in Tagen.',
            minutes: 5,
            href: '../blog-artikel.html?slug=2026-07-13-dein-gehirn-zählt-keine-tage-sondern-erinnerungen-deshalb-rast-die-zeit',
        },

        // ── Zukunft und KI ──
        {
            slug: 'emergenz-effekt', type: 'artikel', gebiet: 'zukunft-ki', date: '2026-07-30',
            title: 'Emergenz-Effekt, warum sich Bewusstsein kaum nachbauen lässt',
            teaser: 'Warum dein Gehirn keine Festplatte ist und Bewusstsein sich vielleicht nie nachbauen lässt.',
            sneak: 'Aus dem Zusammenspiel vieler Teile entsteht etwas, das keiner allein erklärt.',
            minutes: 9,
            href: '../blog-artikel.html?slug=2026-07-30-emergenz-effekt-warum-dein-gehirn-keine-festplatte-ist-und-bewusstsein-sich-vielleicht-nie-nachbauen-lässt',
        },
    ];

    // ── Helpers ──
    function gebietBySlug(slug) {
        return GEBIETE.find((g) => g.slug === slug) || null;
    }
    function inhaltBySlug(slug) {
        return INHALTE.find((i) => i.slug === slug) || null;
    }
    function inhalteByGebiet(slug, type) {
        return INHALTE
            .filter((i) => i.gebiet === slug && (!type || i.type === type));
    }
    function gebieteByDomaene(domaene) {
        return GEBIETE
            .filter((g) => g.domaene === domaene)
            .sort((a, b) => a.reihenfolge - b.reihenfolge);
    }
    function neueste(n) {
        // Neueste zuerst nach Datum, Eintraege ohne Datum (Tools) ans Ende.
        return INHALTE.slice()
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
            .slice(0, n || 4);
    }

    window.HLData = {
        DOMAENEN, GEBIETE, INHALTE,
        gebietBySlug, inhaltBySlug, inhalteByGebiet, gebieteByDomaene, neueste,
    };
})();
