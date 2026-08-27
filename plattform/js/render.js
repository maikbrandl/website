/**
 * Hybridlog Plattform – Render-Helfer (Design-System-Version)
 * Gemeinsame HTML-Bausteine aus dem Hybridlog Design System:
 * .node-card/.chip (Inhalte), .world-card (Welten), .list-row (Fachgebiete).
 * window.HLRender
 */
(function () {
    'use strict';

    const base = window.PLATFORM_BASE || './';
    function href(p) { return /^(https?:|mailto:|#)/.test(p) ? p : base + p; }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    // Erlebnisachse eines Inhalts: Tools sind zum Ausprobieren, Beitraege zum Lesen.
    function axisFor(it) { return it.type === 'tool' ? 'ausprobieren' : 'lesen'; }
    const AXIS_LABEL = { lesen: 'Lesen', sehen: 'Sehen', ausprobieren: 'Ausprobieren' };

    // Inhalts-Karte (Tool oder Beitrag), traegt die Achse fuer den Lens-Filter.
    function nodeCard(it, gebiet) {
        const axis = axisFor(it);
        return '<a class="node-card tap" href="' + href(it.href) + '" data-axis="' + axis + '">' +
            '<div class="nc-top">' +
            '<span class="chip axis-' + axis + '"><span class="dot"></span>' + AXIS_LABEL[axis] + '</span>' +
            (gebiet ? '<span class="chip">' + esc(gebiet.name) + '</span>' : '') +
            '</div>' +
            '<h4>' + esc(it.title) + '</h4>' +
            '<p>' + esc(it.teaser) + '</p>' +
            '</a>';
    }

    // Weltkarte fuer die Startseite. Inaktive Welten (BODY) werden als Kachel ohne Link angezeigt.
    function worldCard(welt, count) {
        const disabled = !welt.aktiv;
        const tag = disabled ? 'div' : 'a';
        const hrefAttr = disabled ? '' : ' href="' + href('welt.html?w=' + welt.slug) + '"';
        return '<' + tag + ' class="world-card' + (disabled ? '' : ' tap') + '" data-w="' + welt.slug + '"' + hrefAttr + '>' +
            '<span class="wc-accent"></span>' +
            '<span class="wc-idx">' + (disabled ? 'Bald' : 'Welt') + '</span>' +
            '<h3>' + esc(welt.name) + '</h3>' +
            '<p class="wc-lead">' + esc(welt.leitidee) + '</p>' +
            '<span class="wc-count">' + (disabled ? 'In Vorbereitung' : (count === 1 ? '1 Fachgebiet' : count + ' Fachgebiete')) + '</span>' +
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

    window.HLRender = { href, esc, axisFor, AXIS_LABEL, nodeCard, worldCard, gebietRow };
})();
