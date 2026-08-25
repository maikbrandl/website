/**
 * Hybridlog Plattform – Render-Helfer
 * Gemeinsame HTML-Bausteine fuer Gebiets-, Inhalts- und Startseite.
 * window.HLRender
 */
(function () {
    'use strict';

    const base = window.PLATFORM_BASE || './';
    function href(p) { return /^(https?:|mailto:|#)/.test(p) ? p : base + p; }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

    function areaStyle(gebiet) {
        return gebiet ? ' style="--area:var(' + gebiet.farbeVar + ')"' : '';
    }

    // Kleine Tool-Vorschau (echter Sneak Peek des ersten Zustands)
    function peekTool(it) {
        return '<div class="peek-tool">' +
            '<span class="peek-tool__q">' + esc(it.sneak) + '</span>' +
            '<div class="peek-tool__opts">' +
            '<span class="peek-pill peek-pill--on">Los geht\u2019s</span>' +
            '<span class="peek-pill">A</span><span class="peek-pill">B</span><span class="peek-pill">C</span>' +
            '</div>' +
            '<div class="peek-tool__bar"><span></span></div>' +
            '</div>';
    }

    function peekRead(it) {
        return '<p class="peek-read">\u201E' + esc(it.sneak) + '\u201C</p>';
    }

    // Ordner-Karte (fuer Tools, mit Sneak Peek)
    function folder(it, gebiet) {
        return '<article class="folder"' + areaStyle(gebiet) + '>' +
            '<div class="folder__peek">' +
            '<span class="folder__peek-label">' + (it.type === 'tool' ? 'Vorschau' : 'Auszug') + '</span>' +
            (it.type === 'tool' ? peekTool(it) : peekRead(it)) +
            '</div>' +
            '<div class="folder__body">' +
            '<h3 class="folder__title">' + esc(it.title) + '</h3>' +
            '<p class="folder__teaser">' + esc(it.teaser) + '</p>' +
            '<div class="folder__foot">' +
            '<span class="folder__cta">' + (it.type === 'tool' ? 'Tool öffnen' : 'Beitrag lesen') + ' ' + ARROW + '</span>' +
            '<span class="folder__min">' + it.minutes + ' Min</span>' +
            '</div>' +
            '</div>' +
            '<a class="folder__link" href="' + href(it.href) + '" aria-label="' + esc(it.title) + '"></a>' +
            '</article>';
    }

    // Beitrags-Listeneintrag mit Sneak Peek + Lesezeit
    function post(it, gebiet) {
        return '<a class="post-item" href="' + href(it.href) + '"' + areaStyle(gebiet) + '>' +
            '<h3 class="post-item__title">' + esc(it.title) + '</h3>' +
            '<p class="post-item__sneak">' + esc(it.sneak) + '</p>' +
            '<p class="post-item__meta">' + it.minutes + ' Min Lesezeit</p>' +
            '</a>';
    }

    // Kompakte verwandte Karte (Vertiefen)
    function related(it, gebiet) {
        const label = it.type === 'tool' ? 'Tool' : 'Beitrag';
        return '<a class="card card--link" href="' + href(it.href) + '"' + areaStyle(gebiet) + '>' +
            '<span class="tag">' + label + '</span>' +
            '<h3 class="card__title" style="margin-top:8px">' + esc(it.title) + '</h3>' +
            '<p class="card__teaser">' + esc(it.teaser) + '</p>' +
            '</a>';
    }

    window.HLRender = { href, esc, folder, post, related, peekTool, peekRead, ARROW };
})();
