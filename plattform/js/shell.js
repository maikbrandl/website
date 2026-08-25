/**
 * Hybridlog Plattform – App-Shell (Prompt 2)
 * Baut Topbar, Desktop-Sidebar, Mobile-Schublade, Suche-Overlay,
 * Brotkrumen und "Auf dieser Seite" aus window.HLData.
 *
 * Seiten-Kontext wird ueber das <body> gesetzt:
 *   data-domaene="mental" data-gebiet="philosophie" data-inhalt="denkschule"
 *   data-title="..."  (fuer Brotkrumen, optional)
 * Basis-Pfad ueber window.PLATFORM_BASE ('./' Wurzel, '../' bzw. '../../' tiefer).
 *
 * Vollstaendig per Tastatur bedienbar, Schublade und Suche schliessen mit Escape.
 */
(function () {
    'use strict';

    const D = window.HLData;
    if (!D) return;

    const base = window.PLATFORM_BASE || './';
    const body = document.body;
    const ctx = {
        domaene: body.getAttribute('data-domaene') || 'mental',
        gebiet: body.getAttribute('data-gebiet') || '',
        inhalt: body.getAttribute('data-inhalt') || '',
        title: body.getAttribute('data-title') || '',
    };

    // ── Icons ──
    const SVG = {
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
        menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
        // Blitz = Tool, Dokument = Beitrag
        tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        artikel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
    };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }

    // Website-weite Links (zur Hauptseite, Produkten, Blog, Tools); 'Wissen' = diese Plattform.
    const SITE_LINKS = [
        { label: 'Start', path: '../index.html' },
        { label: 'Produkte', path: '../index.html#produkte' },
        { label: 'Blog', path: '../blog.html' },
        { label: 'Tools', path: '../tools/' },
        { label: 'Wissen', path: 'index.html', active: true },
    ];
    function siteNavMarkup(cls) {
        return '<nav class="' + cls + '" aria-label="Website">' +
            SITE_LINKS.map((l) =>
                '<a class="site-link' + (l.active ? ' site-link--active' : '') + '" href="' + href(l.path) + '"' +
                (l.active ? ' aria-current="page"' : '') + '>' + esc(l.label) + '</a>'
            ).join('') + '</nav>';
    }

    // ────────────────────────────── Topbar ──────────────────────────────
    function buildTopbar() {
        const el = document.createElement('header');
        el.className = 'topbar';
        el.innerHTML =
            '<a class="topbar__logo" href="' + href('../index.html') + '" aria-label="Hybridlogs Startseite">hybrid<span class="logo-word__accent">logs</span></a>' +
            siteNavMarkup('topbar__nav') +
            '<div class="topbar__search">' + searchInput('topbar-search') + '</div>' +
            '<div class="topbar__actions">' +
            '<button type="button" class="icon-btn topbar__mobile-only" data-open-search aria-label="Suche öffnen">' + SVG.search + '</button>' +
            (window.HLTheme ? window.HLTheme.markup() : '') +
            '<button type="button" class="icon-btn topbar__mobile-only" data-open-drawer aria-label="Menü öffnen" aria-expanded="false">' + SVG.menu + '</button>' +
            '</div>';
        body.insertBefore(el, body.firstChild);
        // Theme-Button idempotent verdrahten (attach schuetzt vor Doppelbindung).
        if (window.HLTheme) el.querySelectorAll('[data-theme-toggle]').forEach(window.HLTheme.attach);
    }

    function searchInput(id) {
        return '<div class="search">' +
            '<span class="search__icon">' + SVG.search + '</span>' +
            '<input class="search__input" id="' + id + '" type="search" autocomplete="off" placeholder="Themen und Tools suchen" aria-label="Suchen">' +
            '</div>';
    }

    // ────────────────────────────── Navigation ──────────────────────────────
    function navMarkup() {
        let html = scopeSwitch();
        D.gebieteByDomaene('mental').forEach((g) => {
            const open = g.slug === ctx.gebiet || !ctx.gebiet;
            const tools = D.inhalteByGebiet(g.slug, 'tool');
            const arts = D.inhalteByGebiet(g.slug, 'artikel');
            html += '<div class="nav-group" data-open="' + (open ? 'true' : 'false') + '" style="--area:var(' + g.farbeVar + ')">';
            html += '<button type="button" class="nav-group__head" data-nav-toggle aria-expanded="' + (open ? 'true' : 'false') + '">' +
                '<span class="nav-group__dot"></span>' +
                '<span>' + esc(g.name) + '</span>' +
                '<span class="nav-group__chev">' + SVG.chev + '</span>' +
                '</button>';
            html += '<div class="nav-group__list">';
            html += '<a class="nav-link" href="' + href('mental/gebiet.html?g=' + g.slug) + '"' +
                (ctx.gebiet === g.slug && !ctx.inhalt ? ' aria-current="page"' : '') + '>' +
                '<span class="nav-link__ico">' + SVG.artikel + '</span><span>Übersicht</span></a>';
            tools.concat(arts).forEach((it) => {
                html += '<a class="nav-link" href="' + href(it.href) + '"' +
                    (ctx.inhalt === it.slug ? ' aria-current="page"' : '') + '>' +
                    '<span class="nav-link__ico">' + (it.type === 'tool' ? SVG.tool : SVG.artikel) + '</span>' +
                    '<span>' + esc(shortTitle(it.title)) + '</span></a>';
            });
            html += '</div></div>';
        });
        return html;
    }

    function scopeSwitch() {
        return '<div class="nav-scope" role="group" aria-label="Bereich wählen">' +
            '<span class="nav-scope__btn" aria-current="true">Mental</span>' +
            '<button type="button" class="nav-scope__btn" disabled aria-disabled="true">Körperlich <span class="nav-scope__soon">bald</span></button>' +
            '</div>';
    }

    function shortTitle(t) {
        // Ersten Teilsatz vor Komma nehmen, damit die Nav kompakt bleibt
        const cut = t.split(',')[0];
        return cut.length > 42 ? cut.slice(0, 40).trim() + '…' : cut;
    }

    function fillSidebar() {
        const side = document.querySelector('[data-hl-sidebar]');
        if (side) side.innerHTML = navMarkup();
    }

    // ────────────────────────────── Mobile Schublade ──────────────────────────────
    function buildDrawer() {
        const el = document.createElement('div');
        el.className = 'drawer';
        el.setAttribute('data-open', 'false');
        el.innerHTML =
            '<div class="drawer__backdrop" data-close-drawer></div>' +
            '<div class="drawer__panel" role="dialog" aria-modal="true" aria-label="Navigation">' +
            '<div class="drawer__head">' +
            '<span class="topbar__logo">hybrid<span class="logo-word__accent">logs</span></span>' +
            '<button type="button" class="icon-btn" data-close-drawer aria-label="Menü schließen">' + SVG.close + '</button>' +
            '</div>' + siteNavMarkup('drawer__site') + navMarkup() +
            '</div>';
        body.appendChild(el);
        return el;
    }

    // ────────────────────────────── Suche-Overlay ──────────────────────────────
    function buildSearchOverlay() {
        const el = document.createElement('div');
        el.className = 'search-overlay';
        el.setAttribute('data-open', 'false');
        el.innerHTML =
            '<div class="search-overlay__head">' + searchInput('overlay-search') +
            '<button type="button" class="icon-btn" data-close-search aria-label="Suche schließen">' + SVG.close + '</button></div>' +
            '<div class="search-results" data-search-results></div>';
        body.appendChild(el);
        return el;
    }

    // ────────────────────────────── Suche-Logik ──────────────────────────────
    function runSearch(query, targetEl) {
        const q = query.trim().toLowerCase();
        if (!q) { targetEl.innerHTML = '<p class="search-empty">Gib einen Begriff ein, um Tools und Beiträge zu finden.</p>'; return; }
        const hits = D.INHALTE.filter((it) => {
            const g = D.gebietBySlug(it.gebiet);
            return (it.title + ' ' + it.teaser + ' ' + (g ? g.name : '')).toLowerCase().includes(q);
        }).slice(0, 8);
        if (!hits.length) { targetEl.innerHTML = '<p class="search-empty">Nichts gefunden. Versuche einen anderen Begriff.</p>'; return; }
        targetEl.innerHTML = hits.map((it) => {
            const g = D.gebietBySlug(it.gebiet);
            return '<a class="search-results__item" href="' + href(it.href) + '">' +
                '<span class="search-results__title">' + esc(it.title) + '</span>' +
                '<span class="search-results__meta">' + (it.type === 'tool' ? 'Tool' : 'Beitrag') + ' · ' + esc(g ? g.name : '') + '</span></a>';
        }).join('');
    }

    // ────────────────────────────── Brotkrumen ──────────────────────────────
    function fillCrumbs() {
        const host = document.querySelector('[data-hl-crumbs]');
        if (!host) return;
        const parts = [];
        parts.push('<a href="' + href('index.html') + '">Mental</a>');
        const g = ctx.gebiet ? D.gebietBySlug(ctx.gebiet) : null;
        if (g) {
            const last = !ctx.inhalt && !ctx.title;
            parts.push('<span class="crumbs__sep">›</span>' +
                (last ? '<span aria-current="page">' + esc(g.name) + '</span>'
                    : '<a href="' + href('mental/gebiet.html?g=' + g.slug) + '">' + esc(g.name) + '</a>'));
        }
        const title = ctx.title || (ctx.inhalt && D.inhaltBySlug(ctx.inhalt) ? D.inhaltBySlug(ctx.inhalt).title : '');
        if (title) parts.push('<span class="crumbs__sep">›</span><span aria-current="page">' + esc(title) + '</span>');
        host.className = 'crumbs';
        host.setAttribute('aria-label', 'Brotkrumen');
        host.innerHTML = parts.join(' ');
    }

    // ────────────────────────────── "Auf dieser Seite" ──────────────────────────────
    function buildToc() {
        const main = document.getElementById('main');
        const tocAside = document.querySelector('[data-hl-toc]');
        const tocInline = document.querySelector('[data-hl-toc-inline]');
        if (!main || (!tocAside && !tocInline)) return;
        // Bevorzugt die inhaltlichen Abschnitte (.prose), sonst alle H2 (z.B. Gebiets-Uebersicht).
        let heads = Array.from(main.querySelectorAll('.prose h2'));
        if (heads.length < 2) heads = Array.from(main.querySelectorAll('h2'));
        if (heads.length < 2) return;

        heads.forEach((h, i) => { if (!h.id) h.id = 'abschnitt-' + (i + 1); });
        const links = heads.map((h) => '<a class="toc__link" href="#' + h.id + '">' + esc(h.textContent) + '</a>').join('');
        const inner = '<p class="toc__title">Auf dieser Seite</p>' + links;

        if (tocAside) { tocAside.innerHTML = inner; document.querySelector('.app').classList.add('app--toc'); }
        if (tocInline) tocInline.innerHTML = '<summary>Inhalt dieser Seite</summary><div class="toc-inline__body">' + links + '</div>';

        // Aktiven Abschnitt hervorheben
        const allLinks = Array.from(document.querySelectorAll('.toc__link'));
        const byId = {};
        allLinks.forEach((a) => { const id = a.getAttribute('href').slice(1); (byId[id] = byId[id] || []).push(a); });
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (!en.isIntersecting) return;
                    allLinks.forEach((a) => a.removeAttribute('aria-current'));
                    (byId[en.target.id] || []).forEach((a) => a.setAttribute('aria-current', 'true'));
                });
            }, { rootMargin: '-10% 0px -75% 0px', threshold: 0 });
            heads.forEach((h) => io.observe(h));
        }
    }

    // ────────────────────────────── Interaktion ──────────────────────────────
    let lastFocused = null;

    function openDrawer(drawer, trigger) {
        lastFocused = trigger || document.activeElement;
        drawer.setAttribute('data-open', 'true');
        document.querySelectorAll('[data-open-drawer]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
        const first = drawer.querySelector('.drawer__panel [data-close-drawer]');
        if (first) first.focus();
        body.style.overflow = 'hidden';
    }
    function closeDrawer(drawer) {
        drawer.setAttribute('data-open', 'false');
        document.querySelectorAll('[data-open-drawer]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
        body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }
    function openSearch(overlay) {
        lastFocused = document.activeElement;
        overlay.setAttribute('data-open', 'true');
        const input = overlay.querySelector('.search__input');
        if (input) { input.value = ''; runSearch('', overlay.querySelector('[data-search-results]')); input.focus(); }
        body.style.overflow = 'hidden';
    }
    function closeSearch(overlay) {
        overlay.setAttribute('data-open', 'false');
        body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    function wire(drawer, overlay) {
        document.addEventListener('click', (e) => {
            const t = e.target.closest('[data-open-drawer],[data-close-drawer],[data-open-search],[data-close-search],[data-nav-toggle]');
            if (!t) return;
            if (t.hasAttribute('data-open-drawer')) openDrawer(drawer, t);
            else if (t.hasAttribute('data-close-drawer')) closeDrawer(drawer);
            else if (t.hasAttribute('data-open-search')) openSearch(overlay);
            else if (t.hasAttribute('data-close-search')) closeSearch(overlay);
            else if (t.hasAttribute('data-nav-toggle')) {
                const group = t.closest('.nav-group');
                const open = group.getAttribute('data-open') === 'true';
                group.setAttribute('data-open', open ? 'false' : 'true');
                t.setAttribute('aria-expanded', open ? 'false' : 'true');
            }
        });

        // Suche in Topbar und Overlay
        document.querySelectorAll('.search__input').forEach((input) => {
            const isOverlay = !!input.closest('.search-overlay');
            const results = isOverlay ? overlay.querySelector('[data-search-results]') : null;
            input.addEventListener('input', () => {
                if (isOverlay) { runSearch(input.value, results); return; }
                // Topbar-Suche: bei Eingabe Overlay oeffnen und spiegeln
                if (input.value.trim()) {
                    openSearch(overlay);
                    const ov = overlay.querySelector('.search__input');
                    ov.value = input.value;
                    runSearch(input.value, overlay.querySelector('[data-search-results]'));
                    input.value = '';
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (drawer.getAttribute('data-open') === 'true') closeDrawer(drawer);
            if (overlay.getAttribute('data-open') === 'true') closeSearch(overlay);
        });
    }

    // ────────────────────────────── Start ──────────────────────────────
    function init() {
        buildTopbar();
        fillSidebar();
        fillCrumbs();
        const drawer = buildDrawer();
        const overlay = buildSearchOverlay();
        wire(drawer, overlay);
        buildToc();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
