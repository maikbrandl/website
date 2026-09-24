/**
 * Hybridlog Plattform – Wissensraum-Startseite (index.html)
 * Ersetzt die frühere Marketing-Landingpage (Hero/Weltendiagramm/Tool-Karussell/
 * "Neu"-Liste + separater mobiler Tabs/Chips-Browser). Nutzt stattdessen exakt
 * denselben 3-Spalten-Rahmen wie eine echte Themenseite (thema.js): links der
 * Navigationsbaum (js/nav-tree.js), in der Mitte eine kurze, handgeschriebene
 * "Wissensbeitrag"-artige Kurzbeschreibung (gerendert über denselben Block-
 * Baukasten wie echte Themen, siehe js/content-blocks.js -> window.HLBlocks), rechts
 * die übliche Leiste (Inhalt/Fortschritt + Tools zum Ausprobieren).
 */
(function () {
    'use strict';

    const D = window.HLData;
    const CMS = window.HLCms;
    const NAV = window.HLNavTree;
    const BLOCKS = window.HLBlocks;
    const base = window.PLATFORM_BASE || './';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }

    // Kurzbeschreibung des Wissensraums als Pseudo-Thema, damit der bestehende
    // Block-Renderer (kurz_erklaert/icon_fakten/liste) 1:1 wiederverwendet wird.
    const OVERVIEW = {
        bloecke: [
            {
                type: 'kurz_erklaert',
                text: 'Der Wissensraum ist Hybridlogs Sammlung an Wissen über den Menschen: kurze, klar erklärte Themen zu Psychologie, Lernen, Philosophie und mehr, ergänzt durch interaktive Tools, die dir direktes Feedback zu dir selbst geben.',
            },
            {
                type: 'icon_fakten',
                titel_override: 'Auf einen Blick',
                fakten: [
                    { icon: 'book', text: 'Lesen: kompakte Themen mit Kernaussage, Beispielen und Quellen, in wenigen Minuten gelesen.' },
                    { icon: 'flask', text: 'Ausprobieren: interaktive Tools geben dir ein Ergebnis zu dir selbst statt nur Theorie.' },
                    { icon: 'eye', text: 'Einordnen: alles gehört zu einem von drei Wissensräumen, MIND, BODY oder WORLD.' },
                ],
            },
            {
                type: 'liste',
                titel_override: 'So findest du dich zurecht',
                punkte: [
                    'Wähle links einen der drei Wissensräume und klappe ihn auf, du siehst sofort seine Fachgebiete.',
                    'Jedes Fachgebiet zeigt seine Themen und darunter die passenden Tools zum Ausprobieren.',
                    'Klicke ein Thema direkt an, es öffnet sich als kurzer, in sich abgeschlossener Wissensbeitrag.',
                ],
            },
        ],
    };

    function headHtml() {
        return '<div class="thema-head">' +
            '<p class="thema-art">Überblick</p>' +
            '<h1>Der Wissensraum</h1>' +
            '<p class="lead">Wissen über den Menschen, zum Anfassen, in einer Minute erklärt.</p>' +
            '<div class="thema-metaline"><span>' + BLOCKS.icon('book') + 'Kurz lesen: 1 Min.</span></div>' +
            '</div>';
    }

    function railHtml(toc) {
        const tocHtml = '<nav class="thema-toc" aria-label="Inhalt">' + toc.map(function (s) {
            return '<a href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.title) + '</a>';
        }).join('') + '</nav>';
        const progressHtml = '<div class="card">' +
            '<p class="eyebrow">Auf dieser Seite</p>' +
            '<p class="muted" style="font-size:.86rem;margin-top:6px">In ' + toc.length + ' Abschnitten</p>' +
            '<div class="thema-progress-track"><div class="thema-progress-fill" data-progress></div></div>' +
            '</div>';

        const tools = D.INHALTE.filter(function (i) { return i.type === 'tool'; });
        const toolsHtml = tools.length ? '<div class="card"><p class="eyebrow">Zum Ausprobieren</p>' +
            '<div class="thema-related" style="margin-top:12px">' + tools.map(function (t) {
                return '<a href="' + href(t.href) + '" data-track="tool-start"><b>' + esc(t.title) + '</b><span>' + esc(t.teaser || '') + '</span></a>';
            }).join('') + '</div></div>' : '';

        return '<div class="thema-rail">' + tocHtml + progressHtml + toolsHtml + '</div>';
    }

    async function init() {
        const main = document.querySelector('#main');
        if (!main || !NAV || !BLOCKS) return;

        let gebiete = [], themen = [];
        try {
            [gebiete, themen] = await Promise.all([
                CMS.fetchCollection('content/fachgebiete'),
                CMS.fetchCollection('content/themen'),
            ]);
        } catch (e) {
            console.error('Fachgebiete/Themen konnten nicht geladen werden', e);
        }

        const blocks = BLOCKS.buildBlocks(OVERVIEW);

        main.innerHTML = '<div class="thema-shell">' +
            NAV.build(gebiete, themen, null) +
            '<div class="thema-main">' + headHtml() + blocks.html + '</div>' +
            railHtml(blocks.toc) +
            '</div>';

        BLOCKS.wireRail();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
