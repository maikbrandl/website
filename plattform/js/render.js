/**
 * Hybridlog Plattform – Render-Helfer (Design-System-Version)
 * Gemeinsame HTML-Bausteine aus dem Hybridlog Design System:
 * .node-card (Inhalte, Tools mit Grafik), .world-card (Welten), .list-row (Fachgebiete).
 * window.HLRender
 */
(function () {
    'use strict';

    const base = window.PLATFORM_BASE || './';
    function href(p) { return /^(https?:|mailto:|#)/.test(p) ? p : base + p; }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // Label je Inhaltstyp: Tools sind "Interaktives Tool", Beitraege "Blogbeitrag".
    function kindLabel(it) { return it.type === 'tool' ? 'Interaktives Tool' : 'Blogbeitrag'; }

    // Kleine abstrakte SVG-Icons je Tool, rein dekorativ. Fallback fuer neue
    // Tools ohne eigenes Icon.
    const TOOL_ICONS = {
        'denkschule': '<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="24" cy="32" r="14"></circle><circle cx="60" cy="32" r="14" fill="currentColor" stroke="none"></circle><circle cx="96" cy="32" r="14"></circle></svg>',
        'atlas-philosophie': '<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="8,48 34,20 60,38 86,14 112,26"></polyline><circle cx="34" cy="20" r="3.4" fill="currentColor" stroke="none"></circle><circle cx="86" cy="14" r="3.4" fill="currentColor" stroke="none"></circle></svg>',
        'human-map': '<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="42,10 74,10 92,32 74,54 42,54 24,32"></polygon><polygon points="54,20 82,24 78,48 50,46 40,32" opacity=".55"></polygon></svg>',
        'blockuniversum': '<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><polygon points="44,10 78,10 96,24 62,24"></polygon><polygon points="44,10 44,44 62,58 62,24"></polygon><polygon points="62,24 96,24 96,44 62,58"></polygon></svg>',
    };
    const FALLBACK_ICON = '<svg viewBox="0 0 120 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M64 8 L36 38 H58 L52 58 L86 26 H62 Z"></path></svg>';

    // Inhalts-Karte (Tool oder Beitrag). Tools zeigen zusaetzlich eine Grafik.
    function nodeCard(it, gebiet) {
        const isTool = it.type === 'tool';
        const welt = gebiet ? gebiet.welt : '';
        const graphic = isTool
            ? '<div class="nc-graphic" data-w="' + welt + '">' + (TOOL_ICONS[it.slug] || FALLBACK_ICON) + '</div>'
            : '';
        return '<a class="node-card tap" href="' + href(it.href) + '">' +
            graphic +
            '<div class="nc-top"><span class="nc-kind">' + kindLabel(it) + '</span></div>' +
            '<h4>' + esc(it.title) + '</h4>' +
            '<p>' + esc(it.teaser) + '</p>' +
            '</a>';
    }

    // Weltkarte fuer die Startseite. Inaktive Welten (BODY) werden als Kachel ohne Link angezeigt.
    function worldCard(welt, count) {
        const disabled = !welt.aktiv;
        const tag = disabled ? 'div' : 'a';
        const hrefAttr = disabled ? '' : ' href="' + href('welt.html?w=' + welt.slug) + '"';
        const status = disabled ? 'In Vorbereitung' : 'Verfügbar';
        return '<' + tag + ' class="world-card' + (disabled ? '' : ' tap') + '" data-w="' + welt.slug + '"' + hrefAttr + '>' +
            '<span class="wc-accent"></span>' +
            '<span class="wc-idx">Welt · ' + status + '</span>' +
            '<h3>' + esc(welt.name) + '</h3>' +
            '<p class="wc-lead">' + esc(welt.leitidee) + '</p>' +
            '<div class="wc-bottom">' +
            '<span class="wc-count">' + (disabled ? 'In Arbeit' : (count === 1 ? '1 Fachgebiet' : count + ' Fachgebiete')) + '</span>' +
            '<span class="wc-cta">' + (disabled ? 'Benachrichtigen' : 'Öffnen →') + '</span>' +
            '</div>' +
            '</' + tag + '>';
    }

    // Listenzeile fuer ein Fachgebiet auf der Weltseite.
    function gebietRow(g, index) {
        const n = window.HLData.inhalteByGebiet(g.slug).length;
        const active = g.status === 'active';
        const isPublic = g.visibility === 'public';
        const tag = isPublic ? 'a' : 'div';
        const hrefAttr = isPublic ? ' href="' + href('mental/gebiet.html?g=' + g.slug) + '"' : '';
        return '<' + tag + ' class="list-row' + (isPublic ? ' tap' : '') + '"' + hrefAttr + '>' +
            '<span class="num">' + String(index + 1).padStart(2, '0') + '</span>' +
            '<div><h4>' + esc(g.name) + '</h4><p class="rm">' + esc(g.einleitung) + '</p></div>' +
            '<div class="rside">' +
            '<span class="status ' + (active ? 'active' : 'draft') + '"><span class="sd"></span>' + (active ? 'Aktiv' : 'In Planung') + '</span>' +
            '<span class="vis">' + (isPublic ? (n === 1 ? '1 Inhalt' : n + ' Inhalte') : 'Intern') + '</span>' +
            '</div>' +
            '</' + tag + '>';
    }

    window.HLRender = { href, esc, kindLabel, nodeCard, worldCard, gebietRow };
})();
