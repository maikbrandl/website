/**
 * Hybridlog Plattform – Themenseite (Wissensraum, vanilla)
 * Baut die 3-Spalten-Ansicht (Navigation / Block-Baukasten / Leiste) aus
 * content/fachgebiete + content/themen (Decap, per GitHub zur Laufzeit
 * geholt, siehe js/cms-fetch.js). Tools und Blogartikel bleiben unangetastet
 * die bisherigen Inhaltstypen, "Thema" ist ein dritter, neuer Typ.
 *
 * Struktur-/Orientierungsfarbe ist hier durchgehend --teal, --accent (Gold)
 * bleibt exklusiv fuer weiterfuehrende Links (siehe Design-Vorgabe 2026-09-01).
 */
(function () {
    'use strict';

    const D = window.HLData;
    const CMS = window.HLCms;
    const base = window.PLATFORM_BASE || '../';

    // Fachgebiet/Untergruppe -> passendes Journal ("Anwenden"-Modul, 5.8 Masterplan).
    // Untergruppe hat Vorrang vor Fachgebiet. Philosophie bewusst ohne Eintrag:
    // dort passt eher eine Buchempfehlung (empfehlung-Block) als ein Journal.
    const JOURNAL_BY_UNTERGRUPPE = {
        'Lernmethoden': [
            { href: '../lernjournal.html', title: 'Lernjournal', fuer: 'Dein Werkzeug für nachhaltiges Wissenstracking.' },
            { href: '../notizbuch.html', title: 'Schul-Notizbuch', fuer: 'Strukturierte Cornell-Methode für maximale Klarheit.' },
        ],
        'Antrieb und Motivation': [
            { href: '../workoutlogbuch.html', title: 'Workout Logbuch', fuer: 'Dein Trainingsbegleiter für messbaren Fortschritt.' },
        ],
    };
    const JOURNAL_BY_GEBIET = {
        'lernen-verhalten': [{ href: '../lernjournal.html', title: 'Lernjournal', fuer: 'Dein Werkzeug für nachhaltiges Wissenstracking.' }],
        'kognition-wahrnehmung': [{ href: '../lernjournal.html', title: 'Lernjournal', fuer: 'Dein Werkzeug für nachhaltiges Wissenstracking.' }],
        'emotion-motivation': [{ href: '../lernjournal.html', title: 'Lernjournal', fuer: 'Dein Werkzeug für nachhaltiges Wissenstracking.' }],
        'persoenlichkeit-identitaet': [{ href: '../lernjournal.html', title: 'Lernjournal', fuer: 'Dein Werkzeug für nachhaltiges Wissenstracking.' }],
    };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }
    function qs(name) {
        return new URLSearchParams(location.search).get(name) || '';
    }

    function estimateMinutes(bloecke) {
        const words = (bloecke || []).map(function (b) {
            return [b.text, b.lead].filter(Boolean).join(' ');
        }).join(' ').split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    }

    // Icons und der Block-Baukasten (kurz_erklaert/icon_fakten/liste/... ->
    // gerenderte Karten, inkl. buildBlocks/toolBySlug) leben in
    // js/content-blocks.js, gemeinsam mit der Wissensraum-Startseite genutzt.
    const icon = window.HLBlocks.icon;
    const toolBySlug = window.HLBlocks.toolBySlug;

    // ---------------------------------------------------------------------
    // Mittelteil
    // ---------------------------------------------------------------------
    function buildHead(thema, gebiet) {
        const lesezeit = thema.lesezeit || estimateMinutes(thema.bloecke);
        const vertiefzeit = thema.vertiefzeit || (lesezeit * 4);
        return '<div class="thema-head">' +
            '<p class="thema-art">' + esc(thema.art || '') + '</p>' +
            '<h1>' + esc(thema.title) + '</h1>' +
            '<p class="lead">' + esc(thema.lead || '') + '</p>' +
            '<div class="thema-metaline">' +
            '<span>' + icon('book') + esc('Kurz lesen: ' + lesezeit + ' Min.') + '</span>' +
            '<span>' + icon('flask') + esc('Vertiefen: ' + vertiefzeit + '+ Min.') + '</span>' +
            '<span>' + icon('link') + 'Wissensknoten</span>' +
            '</div></div>';
    }

    // ---------------------------------------------------------------------
    // Rechte Leiste
    // ---------------------------------------------------------------------
    function buildRail(thema, themen, gebiete, toc) {
        const tocHtml = '<nav class="thema-toc" aria-label="Inhalt">' + toc.map(function (s) {
            return '<a href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.title) + '</a>';
        }).join('') + '</nav>';

        const progressHtml = '<div class="card">' +
            '<p class="eyebrow">Auf dieser Seite</p>' +
            '<p class="muted" style="font-size:.86rem;margin-top:6px">In ' + toc.length + ' Abschnitten</p>' +
            '<div class="thema-progress-track"><div class="thema-progress-fill" data-progress></div></div>' +
            '<button class="thema-save" type="button" data-save>' + icon('bookmark') + '<span>Fortschritt speichern</span></button>' +
            '</div>';

        const toolBlock = (thema.bloecke || []).find(function (b) { return b.type === 'tool_einbindung'; });
        const toolSlug = (toolBlock && toolBlock.tool) || (thema.verwandte_tools || [])[0];
        const tool = toolSlug ? toolBySlug(toolSlug) : null;
        const toolHtml = tool ? '<div class="card thema-tool-card"><p class="eyebrow">Zum Ausprobieren</p>' +
            '<div class="tt-preview">' + icon('network') + '</div>' +
            '<h4>' + esc(tool.title) + '</h4><p>' + esc(tool.teaser) + '</p>' +
            '<a class="thema-link-gold" href="' + href(tool.href) + '" data-track="tool-start">Tool öffnen →</a></div>' : '';

        const related = (thema.verwandte_themen || []).map(function (slug) {
            return themen.find(function (t) { return t.slug === slug; });
        }).filter(Boolean);
        // Kein manuell gepflegtes verwandte_themen vorhanden (bei allen 76 Themen
        // aktuell leer) -> automatisch aus gleichem Fachgebiet ableiten, gleiche
        // Untergruppe zuerst, sich selbst ausschliessen.
        const autoRelated = related.length ? related : themen
            .filter(function (t) { return t.slug !== thema.slug && t.gebiet === thema.gebiet; })
            .sort(function (a, b) {
                const aMatch = a.untergruppe === thema.untergruppe ? 0 : 1;
                const bMatch = b.untergruppe === thema.untergruppe ? 0 : 1;
                return aMatch - bMatch;
            })
            .slice(0, 4);
        const gebiet = gebiete.find(function (g) { return g.slug === thema.gebiet; });
        const relatedHtml = autoRelated.length ? '<div class="card"><p class="eyebrow">Weiter im Thema</p>' +
            '<div class="thema-related" style="margin-top:12px">' + autoRelated.map(function (t) {
                const g = gebiete.find(function (x) { return x.slug === t.gebiet; });
                return '<a href="' + href('mental/thema.html?slug=' + encodeURIComponent(t.slug)) + '" data-track="verwandtes-thema"><b>' + esc(t.title) + '</b><span>' + esc(t.art || (g ? g.title : '')) + '</span></a>';
            }).join('') + '</div>' +
            (gebiet ? '<a class="thema-link-gold" style="display:inline-block;margin-top:12px" href="' + href('mental/gebiet.html?g=' + gebiet.slug) + '">Alle anzeigen →</a>' : '') +
            '</div>' : '';

        // "Anwenden"-Modul: greift nur, wenn der Wissensbeitrag keinen eigenen
        // empfehlung-Block hat (CMS-kuratiert schlaegt Auto-Vorschlag, hoechstens
        // ein Modul pro Seite, siehe Masterplan 5.8/5.9).
        const hasEmpfehlungBlock = (thema.bloecke || []).some(function (b) { return b.type === 'empfehlung'; });
        const journals = hasEmpfehlungBlock ? [] : (JOURNAL_BY_UNTERGRUPPE[thema.untergruppe] || JOURNAL_BY_GEBIET[thema.gebiet] || []);
        const anwendenHtml = journals.length ? '<div class="card"><p class="eyebrow">Anwenden</p>' +
            '<div class="thema-related" style="margin-top:12px">' + journals.map(function (j) {
                return '<a href="' + href(j.href) + '" data-track="journal-klick"><b>' + esc(j.title) + '</b><span>' + esc(j.fuer) + '</span></a>';
            }).join('') + '</div></div>' : '';

        // verwandte_artikel wird ebenfalls nicht manuell gepflegt -> Blogartikel
        // desselben Fachgebiets aus der statischen INHALTE-Tabelle ableiten.
        const relatedArtikel = (D.inhalteByGebiet(thema.gebiet, 'artikel') || []).slice(0, 3);
        const artikelHtml = relatedArtikel.length ? '<div class="card"><p class="eyebrow">Vertiefen</p>' +
            '<div class="thema-related" style="margin-top:12px">' + relatedArtikel.map(function (a) {
                return '<a href="' + href(a.href) + '"><b>' + esc(a.title) + '</b><span>Essay</span></a>';
            }).join('') + '</div></div>' : '';

        const quellen = Array.isArray(thema.quellen) ? thema.quellen.filter(function (q) { return q && q.titel; }) : [];
        const quellenHtml = quellen.length ? '<div class="card"><p class="eyebrow">Quellen</p>' +
            '<ul class="sources" style="margin-top:12px">' + quellen.map(function (q) {
                const label = esc(q.titel);
                return '<li>' + (q.url ? '<a href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>' : label) + '</li>';
            }).join('') + '</ul></div>' : '';

        return '<div class="thema-rail">' + tocHtml + progressHtml + relatedHtml + toolHtml + anwendenHtml + quellenHtml + artikelHtml + '</div>';
    }

    // ---------------------------------------------------------------------
    // Brotkrumen (ueberschreibt den leeren Stand von shell.js, dessen
    // Body-Attribute erst nach dem asynchronen Laden bekannt sind).
    // ---------------------------------------------------------------------
    function buildCrumbs(thema, gebiet) {
        const host = document.querySelector('[data-hl-crumbs]');
        if (!host) return;
        const welt = D.weltBySlug(thema.wissensraum);
        const parts = ['<a href="' + href('index.html') + '">Start</a>'];
        if (welt) parts.push('<span class="sep">\u203a</span><a href="' + href('welt.html?w=' + welt.slug) + '">' + esc(welt.name) + '</a>');
        if (gebiet) parts.push('<span class="sep">\u203a</span><a href="' + href('mental/gebiet.html?g=' + gebiet.slug) + '">' + esc(gebiet.title) + '</a>');
        parts.push('<span class="sep">\u203a</span><span class="here">' + esc(thema.title) + '</span>');
        host.className = 'crumbs';
        host.innerHTML = '<div class="crumbs-inner">' + parts.join(' ') + '</div>';
    }

    // ---------------------------------------------------------------------
    // Start
    // ---------------------------------------------------------------------
    async function init() {
        const main = document.querySelector('#main');
        const slug = qs('slug');
        if (!main || !slug) { renderError(main, 'Kein Thema angegeben.'); return; }

        let gebiete, themen, fragen;
        try {
            [gebiete, themen, fragen] = await Promise.all([
                CMS.fetchCollection('content/fachgebiete'),
                CMS.fetchCollection('content/themen'),
                CMS.fetchCollection('content/wissensfragen'),
            ]);
        } catch (e) {
            console.error(e);
            renderError(main, 'Die Inhalte konnten nicht geladen werden. Bitte später erneut versuchen.');
            return;
        }

        const thema = themen.find(function (t) { return t.slug === slug; });
        if (!thema) { renderError(main, 'Dieses Thema wurde nicht gefunden.'); return; }
        const gebiet = gebiete.find(function (g) { return g.slug === thema.gebiet; });

        document.title = thema.seo_title || (thema.title + ' · ' + (gebiet ? gebiet.title : 'Wissensraum') + ' · Hybridlog');
        const md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', thema.seo_description || thema.lead || '');

        const active = { thema: thema, gebiet: gebiet };
        const blocks = window.HLBlocks.buildBlocks(thema);

        main.innerHTML = '<div class="thema-shell">' +
            window.HLNavTree.build(gebiete, themen, active, fragen) +
            '<div class="thema-main">' + buildHead(thema, gebiet) + blocks.html + '</div>' +
            buildRail(thema, themen, gebiete, blocks.toc) +
            '</div>';

        buildCrumbs(thema, gebiet);
        window.HLBlocks.wireRail();
    }

    function renderError(main, message) {
        if (!main) return;
        main.innerHTML = '<div class="wrap" style="padding:60px 0"><p class="muted">' + esc(message) + '</p></div>';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
