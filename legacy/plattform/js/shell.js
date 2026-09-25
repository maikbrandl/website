/**
 * Hybridlog Plattform – App-Shell (Design-System-Version)
 * Baut Topbar (Marke, Haupt-Navigation, Theme-Button) und Brotkrumen.
 * Kein Sidebar/Drawer/Such-Overlay/Achsen-Linse mehr, das neue Design kennt
 * nur diese Chrome-Elemente (siehe Design-Prompt "Verbindliche Bausteine").
 *
 * Seiten-Kontext wird ueber das <body> gesetzt:
 *   data-welt="world" data-gebiet="philosophie" data-inhalt="denkschule"
 *   data-title="..."  (fuer Brotkrumen, optional)
 * Basis-Pfad ueber window.PLATFORM_BASE ('./' Wurzel, '../' bzw. '../../' tiefer).
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
            '<button type="button" class="back-btn" data-back aria-label="Zurück" hidden>' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
            '</button>' +
            '<a class="brand" href="' + href('../index.html') + '"><span class="mark">hybrid<b>logs</b></span></a>' +
            '<div class="spacer"></div>' +
            siteNavMarkup() +
            (window.HLTheme ? window.HLTheme.markup() : '') +
            '</div>';
        body.insertBefore(el, body.firstChild);
        // Theme-Button idempotent verdrahten (attach schuetzt vor Doppelbindung).
        if (window.HLTheme) el.querySelectorAll('[data-theme-toggle]').forEach(window.HLTheme.attach);

        // Zurueck-Pfeil: nur mobil sichtbar (CSS), navigiert per Browser-Historie.
        // Auf der Wissensraum-Startseite gibt es keine sinnvolle "Zurueck"-Ebene
        // innerhalb der Plattform, daher dort ausgeblendet.
        const backBtn = el.querySelector('[data-back]');
        const isRoot = /(^|\/)plattform\/index\.html$/.test(location.pathname) || /\/plattform\/?$/.test(location.pathname);
        if (backBtn && !isRoot) {
            backBtn.hidden = false;
            backBtn.addEventListener('click', function () { history.back(); });
        }
    }

    // ────────────────────────────── Bottom Tab Bar (mobil) ──────────────────────────────
    function isSearchPage() {
        return /suche\.html$/.test(location.pathname);
    }

    function bottomNavMarkup() {
        const items = [
            {
                label: 'Wissen', href: href('index.html'), active: !isSearchPage(),
                icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 2z"/></svg>',
            },
            {
                label: 'Suche', href: href('suche.html'), active: isSearchPage(),
                icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
            },
            {
                label: 'Tools', href: href('../tools/'), active: false,
                icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"/></svg>',
            },
        ];
        const linksHTML = items.map(function (it) {
            return '<a href="' + it.href + '" class="bottom-nav-item' + (it.active ? ' active' : '') + '">' + it.icon + '<span>' + it.label + '</span></a>';
        }).join('');
        const mehrHTML = '<button type="button" class="bottom-nav-item" data-mehr-toggle aria-haspopup="true" aria-expanded="false">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>' +
            '<span>Mehr</span></button>';
        return '<nav class="bottom-nav" aria-label="Mobile Wissensraum-Navigation">' + linksHTML + mehrHTML + '</nav>';
    }

    function mehrOverlayMarkup() {
        return '<div class="mehr-overlay" data-mehr-overlay hidden>' +
            '<div class="mehr-backdrop" data-mehr-close></div>' +
            '<div class="mehr-panel">' +
            '<p class="eyebrow">Mehr</p>' +
            '<a href="' + href('../index.html') + '">' + 'Home' + '</a>' +
            '<a href="' + href('../index.html#produkte') + '">' + 'Produkte' + '</a>' +
            '<a href="' + href('../index.html#story') + '">' + 'Über uns' + '</a>' +
            '<button type="button" class="mehr-close" data-mehr-close>Schließen</button>' +
            '</div>' +
            '</div>';
    }

    function buildBottomNav() {
        body.insertAdjacentHTML('beforeend', bottomNavMarkup() + mehrOverlayMarkup());
        const overlay = document.querySelector('[data-mehr-overlay]');
        const toggle = document.querySelector('[data-mehr-toggle]');
        if (!overlay || !toggle) return;

        function open() {
            overlay.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('active');
        }
        function close() {
            overlay.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('active');
        }
        toggle.addEventListener('click', function () {
            if (overlay.hidden) open(); else close();
        });
        overlay.querySelectorAll('[data-mehr-close]').forEach(function (el) {
            el.addEventListener('click', close);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) close();
        });
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
        fillCrumbs();
        buildBottomNav();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
