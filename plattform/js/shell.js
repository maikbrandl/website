/**
 * Hybridlog Plattform – App-Shell (Design-System-Version)
 * Baut Topbar (Marke, Achsen-Linse, Theme-Button) und Brotkrumen.
 * Kein Sidebar/Drawer/Such-Overlay mehr, das neue Design kennt nur diese
 * beiden Chrome-Elemente (siehe Design-Prompt "Verbindliche Bausteine").
 *
 * Seiten-Kontext wird ueber das <body> gesetzt:
 *   data-welt="world" data-gebiet="philosophie" data-inhalt="denkschule"
 *   data-title="..."  (fuer Brotkrumen, optional)
 * Basis-Pfad ueber window.PLATFORM_BASE ('./' Wurzel, '../' bzw. '../../' tiefer).
 *
 * Achsen-Linse: Klick auf einen Lens-Button dimmt alle [data-axis]-Karten,
 * deren Achse nicht passt (Klasse .dimmed).
 */
(function () {
    'use strict';

    const D = window.HLData;
    if (!D) return;

    const base = window.PLATFORM_BASE || './';
    const body = document.body;
    const ctx = {
        welt: body.getAttribute('data-welt') || '',
        gebiet: body.getAttribute('data-gebiet') || '',
        inhalt: body.getAttribute('data-inhalt') || '',
        title: body.getAttribute('data-title') || '',
    };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }

    // ────────────────────────────── Topbar ──────────────────────────────
    function lensMarkup() {
        return '<div class="lens" role="group" aria-label="Erlebnisachse">' +
            '<span class="lens-label">Achse</span>' +
            '<button type="button" data-lens="all" aria-pressed="true">Alle</button>' +
            '<button type="button" data-lens="lesen" aria-pressed="false">Lesen</button>' +
            '<button type="button" data-lens="sehen" aria-pressed="false">Sehen</button>' +
            '<button type="button" data-lens="ausprobieren" aria-pressed="false">Ausprobieren</button>' +
            '</div>';
    }

    // Hauptseiten-Navigation (Home/Produkte/Wissensraum/Ueber uns), gleiche
    // Struktur wie js/components.js auf der Hauptseite. '../' vor dem Ziel
    // steht relativ zur PLATFORM_BASE, also immer eine Ebene ueber der
    // Wissensraum-Wurzel = Website-Wurzel, egal wie tief die Seite liegt.
    function siteNavMarkup() {
        return '<nav class="site-nav" aria-label="Hauptnavigation">' +
            '<a href="' + href('../index.html') + '">Home</a>' +
            '<a href="' + href('../index.html#produkte') + '">Produkte</a>' +
            '<a href="' + href('index.html') + '" class="active">Wissensraum</a>' +
            '<a href="' + href('../index.html#story') + '">Über uns</a>' +
            '</nav>';
    }

    function buildTopbar() {
        const el = document.createElement('header');
        el.className = 'top';
        el.innerHTML =
            '<div class="top-inner">' +
            '<a class="brand" href="' + href('../index.html') + '"><span class="mark">Hybrid<b>log</b>s</span></a>' +
            siteNavMarkup() +
            '<div class="spacer"></div>' +
            lensMarkup() +
            (window.HLTheme ? window.HLTheme.markup() : '') +
            '</div>';
        body.insertBefore(el, body.firstChild);
        // Theme-Button idempotent verdrahten (attach schuetzt vor Doppelbindung).
        if (window.HLTheme) el.querySelectorAll('[data-theme-toggle]').forEach(window.HLTheme.attach);
    }

    function wireLens() {
        const btns = Array.prototype.slice.call(document.querySelectorAll('.lens button'));
        if (!btns.length) return;
        btns.forEach((b) => b.addEventListener('click', () => {
            const axis = b.getAttribute('data-lens');
            btns.forEach((x) => x.setAttribute('aria-pressed', x.getAttribute('data-lens') === axis ? 'true' : 'false'));
            document.querySelectorAll('[data-axis]').forEach((card) => {
                const match = axis === 'all' || card.getAttribute('data-axis') === axis;
                card.classList.toggle('dimmed', !match);
            });
        }));
    }

    // ────────────────────────────── Brotkrumen ──────────────────────────────
    function fillCrumbs() {
        const host = document.querySelector('[data-hl-crumbs]');
        if (!host) return;
        const parts = ['<a href="' + href('index.html') + '">Start</a>'];
        const welt = ctx.welt ? D.weltBySlug(ctx.welt) : null;
        const g = ctx.gebiet ? D.gebietBySlug(ctx.gebiet) : null;
        const title = ctx.title || (ctx.inhalt && D.inhaltBySlug(ctx.inhalt) ? D.inhaltBySlug(ctx.inhalt).title : '');

        if (welt) {
            const isLast = !g && !title;
            parts.push('<span class="sep">\u203a</span>' +
                (isLast ? '<span class="here">' + esc(welt.name) + '</span>'
                    : '<a href="' + href('welt.html?w=' + welt.slug) + '">' + esc(welt.name) + '</a>'));
        }
        if (g) {
            const isLast = !title;
            parts.push('<span class="sep">\u203a</span>' +
                (isLast ? '<span class="here">' + esc(g.name) + '</span>'
                    : '<a href="' + href('mental/gebiet.html?g=' + g.slug) + '">' + esc(g.name) + '</a>'));
        }
        if (title) parts.push('<span class="sep">\u203a</span><span class="here">' + esc(title) + '</span>');

        host.className = 'crumbs';
        host.innerHTML = '<div class="crumbs-inner">' + parts.join(' ') + '</div>';
    }

    // ────────────────────────────── Start ──────────────────────────────
    function init() {
        buildTopbar();
        wireLens();
        fillCrumbs();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
