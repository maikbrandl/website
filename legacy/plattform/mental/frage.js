/**
 * Hybridlog Plattform – Wissensfrage-Seite (vanilla)
 * Baut dieselbe 3-Spalten-Ansicht wie thema.js (Navigation/Block-Baukasten/
 * Leiste), aus content/wissensfragen (Decap). Wissensfragen sind flacher als
 * Themen: kein Fachgebiet, dafuer optional mehrere Wissensraeume (welten) und
 * ein klares Problem von der Fragestellung bis zur Loesung (siehe admin/config.yml).
 */
(function () {
    'use strict';

    const D = window.HLData;
    const CMS = window.HLCms;
    const base = window.PLATFORM_BASE || '../';

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

    const icon = window.HLBlocks.icon;

    // ---------------------------------------------------------------------
    // Mittelteil
    // ---------------------------------------------------------------------
    function buildHead(frage) {
        const lesezeit = frage.kurzlesezeit || estimateMinutes(frage.bloecke);
        const vertiefzeit = frage.vertiefzeit || (lesezeit * 4);
        const welten = (frage.welten || []).map(function (w) { return D.weltBySlug(w); }).filter(Boolean);
        const eyebrow = ['Wissensweg'].concat(welten.map(function (w) { return w.name; })).join(' · ');
        return '<div class="thema-head">' +
            '<p class="thema-art">' + esc(eyebrow) + '</p>' +
            '<h1>' + esc(frage.title) + '</h1>' +
            '<p class="lead">' + esc(frage.lead || '') + '</p>' +
            '<div class="thema-metaline">' +
            '<span>' + icon('book') + esc('Kurz lesen: ' + lesezeit + ' Min.') + '</span>' +
            '<span>' + icon('flask') + esc('Vertiefen: ' + vertiefzeit + '+ Min.') + '</span>' +
            '</div></div>';
    }

    // ---------------------------------------------------------------------
    // Rechte Leiste (bewusst schlank: kein Fachgebiet, kein Journal-Modul)
    // ---------------------------------------------------------------------
    function buildRail(frage, toc) {
        const tocHtml = '<nav class="thema-toc" aria-label="Inhalt">' + toc.map(function (s) {
            return '<a href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.title) + '</a>';
        }).join('') + '</nav>';

        const progressHtml = '<div class="card">' +
            '<p class="eyebrow">Auf dieser Seite</p>' +
            '<p class="muted" style="font-size:.86rem;margin-top:6px">In ' + toc.length + ' Abschnitten</p>' +
            '<div class="thema-progress-track"><div class="thema-progress-fill" data-progress></div></div>' +
            '</div>';

        const quellen = Array.isArray(frage.quellen) ? frage.quellen.filter(function (q) { return q && q.titel; }) : [];
        const quellenHtml = quellen.length ? '<div class="card"><p class="eyebrow">Quellen</p>' +
            '<ul class="sources" style="margin-top:12px">' + quellen.map(function (q) {
                const label = esc(q.titel);
                return '<li>' + (q.url ? '<a href="' + esc(q.url) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>' : label) + '</li>';
            }).join('') + '</ul></div>' : '';

        return '<div class="thema-rail">' + tocHtml + progressHtml + quellenHtml + '</div>';
    }

    // ---------------------------------------------------------------------
    // Brotkrumen
    // ---------------------------------------------------------------------
    function buildCrumbs(frage) {
        const host = document.querySelector('[data-hl-crumbs]');
        if (!host) return;
        host.className = 'crumbs';
        host.innerHTML = '<div class="crumbs-inner"><a href="' + href('index.html') + '">Start</a>' +
            '<span class="sep">\u203a</span><span class="here">' + esc(frage.title) + '</span></div>';
    }

    // ---------------------------------------------------------------------
    // Start
    // ---------------------------------------------------------------------
    async function init() {
        const main = document.querySelector('#main');
        const slug = qs('slug');
        if (!main || !slug) { renderError(main, 'Keine Wissensfrage angegeben.'); return; }

        let gebiete, themen, fragen, posts;
        try {
            [gebiete, themen, fragen, posts] = await Promise.all([
                CMS.fetchCollection('content/fachgebiete'),
                CMS.fetchCollection('content/themen'),
                CMS.fetchCollection('content/wissensfragen'),
                CMS.fetchCollection('content/posts'),
            ]);
        } catch (e) {
            console.error(e);
            renderError(main, 'Die Inhalte konnten nicht geladen werden. Bitte später erneut versuchen.');
            return;
        }

        const frage = fragen.find(function (f) { return f.slug === slug; });
        if (!frage) { renderError(main, 'Diese Wissensfrage wurde nicht gefunden.'); return; }

        document.title = frage.seo_title || (frage.title + ' · Wissensfragen · Hybridlog');
        const md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', frage.seo_description || frage.lead || '');

        const active = { frageSlug: frage.slug };
        const blocks = window.HLBlocks.buildBlocks(frage);

        main.innerHTML = '<div class="thema-shell">' +
            window.HLNavTree.build(gebiete, themen, active, fragen, posts) +
            '<div class="thema-main">' + buildHead(frage) + blocks.html + '</div>' +
            buildRail(frage, blocks.toc) +
            '</div>';

        buildCrumbs(frage);
        window.HLBlocks.wireRail();
    }

    function renderError(main, message) {
        if (!main) return;
        main.innerHTML = '<div class="wrap" style="padding:60px 0"><p class="muted">' + esc(message) + '</p></div>';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
