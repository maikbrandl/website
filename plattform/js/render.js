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

    // Symbol/Grafik oben auf der Karte (statt Textvorschau)
    const ART_ICONS = {
        denkschule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M6 21V9l6-4 6 4v12"/><path d="M9 21v-6h6v6"/><path d="M12 5V3"/></svg>',
        'atlas-philosophie': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>',
        'human-map': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
        blockuniversum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 21 7v10l-9 5-9-5V7Z"/><path d="M12 12 21 7"/><path d="M12 12v10"/><path d="M12 12 3 7"/></svg>',
    };
    const ICON_TOOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    const ICON_ARTIKEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>';
    function artFor(it) {
        return ART_ICONS[it.slug] || (it.type === 'tool' ? ICON_TOOL : ICON_ARTIKEL);
    }

    // Ordner-Karte: Symbol oben, Text unten
    function folder(it, gebiet) {
        return '<article class="folder"' + areaStyle(gebiet) + '>' +
            '<div class="folder__art" aria-hidden="true">' + artFor(it) + '</div>' +
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

    window.HLRender = { href, esc, folder, post, related, ARROW };
})();
