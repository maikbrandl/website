/**
 * Hybridlog Plattform – Mobiler Wissensraum-Browser (index.html, mobil only)
 * Ersetzt auf kleinen Bildschirmen Hero/Weltkarten/Tools/Neu durch eine
 * App-artige Navigation: Welt-Tabs (MIND/BODY/WORLD) -> Fachgebiet-Chips
 * (horizontal scrollbar) -> Themen (CMS) + Tools + Beiträge, alles ohne
 * Seitenwechsel per JS-Status. Desktop bleibt von diesem Skript unberührt
 * (der Container ist dort per CSS ausgeblendet).
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender, CMS = window.HLCms;
    if (!D || !R) return;

    const root = document.querySelector('[data-mobile-wissen]');
    if (!root) return;

    const tabsEl = root.querySelector('[data-mw-tabs]');
    const chipsEl = root.querySelector('[data-mw-chips]');
    const contentEl = root.querySelector('[data-mw-content]');
    if (!tabsEl || !chipsEl || !contentEl) return;

    const esc = R.esc;
    let themenCache = null; // CMS-Themen, einmalig geladen, dann wiederverwendet
    const state = { welt: 'mind', gebiet: null };

    function renderTabs() {
        tabsEl.innerHTML = D.WELTEN.map(function (w) {
            const isActive = w.slug === state.welt;
            const disabled = !w.aktiv;
            return '<button type="button" class="mw-tab' + (isActive ? ' active' : '') + (disabled ? ' disabled' : '') + '" data-mw-welt="' + w.slug + '"' + (disabled ? ' aria-disabled="true"' : '') + ' role="tab" aria-selected="' + isActive + '">' + esc(w.name) + '</button>';
        }).join('');
    }

    function section(eyebrow, title, html, emptyMsg) {
        return '<div class="mw-section"><p class="eyebrow">' + esc(eyebrow) + '</p><h3>' + esc(title) + '</h3>' +
            (html || '<p class="disc mw-empty">' + esc(emptyMsg) + '</p>') + '</div>';
    }

    function renderThemenSection(gebiet) {
        if (themenCache === null) {
            return section('Wissen', 'Themen', '', 'Themen werden geladen …');
        }
        const inGebiet = themenCache.filter(function (t) { return t.gebiet === gebiet.slug; });
        const html = inGebiet.length
            ? '<div class="cluster mw-cluster">' + inGebiet.map(function (t) {
                return R.nodeCard({ type: 'thema', slug: t.slug, href: 'mental/thema.html?slug=' + encodeURIComponent(t.slug), title: t.title, teaser: t.lead }, gebiet);
            }).join('') + '</div>'
            : '';
        return section('Wissen', 'Themen', html, 'Für dieses Fachgebiet sind bald Themen verfügbar.');
    }

    function renderContent() {
        const gebiet = D.gebietBySlug(state.gebiet);
        if (!gebiet) { contentEl.innerHTML = ''; return; }
        const tools = D.inhalteByGebiet(gebiet.slug, 'tool');
        const arts = D.inhalteByGebiet(gebiet.slug, 'artikel');

        contentEl.innerHTML =
            renderThemenSection(gebiet) +
            section('Ausprobieren', 'Tools zum Ausprobieren',
                tools.length ? '<div class="cluster mw-cluster">' + tools.map(function (it) { return R.nodeCard(it, gebiet); }).join('') + '</div>' : '',
                'Für dieses Fachgebiet sind bald Tools verfügbar.') +
            section('Lesen', 'Beiträge zum Vertiefen',
                arts.length ? '<div class="cluster mw-cluster">' + arts.map(function (it) { return R.nodeCard(it, gebiet); }).join('') + '</div>' : '',
                'Bald folgen hier vertiefende Beiträge.');
    }

    function renderChips() {
        const gebiete = D.gebieteByWelt(state.welt, { onlyPublic: true });
        if (!gebiete.length) {
            chipsEl.innerHTML = '';
            contentEl.innerHTML = '<p class="disc mw-empty">Für diese Welt sind bald Inhalte verfügbar.</p>';
            return;
        }
        if (!state.gebiet || !gebiete.some(function (g) { return g.slug === state.gebiet; })) {
            state.gebiet = gebiete[0].slug;
        }
        chipsEl.innerHTML = gebiete.map(function (g) {
            return '<button type="button" class="mw-chip' + (g.slug === state.gebiet ? ' active' : '') + '" data-mw-gebiet="' + g.slug + '" role="tab" aria-selected="' + (g.slug === state.gebiet) + '">' + esc(g.name) + '</button>';
        }).join('');
        renderContent();
    }

    tabsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-mw-welt]');
        if (!btn || btn.classList.contains('disabled')) return;
        if (btn.getAttribute('data-mw-welt') === state.welt) return;
        state.welt = btn.getAttribute('data-mw-welt');
        state.gebiet = null;
        renderTabs();
        renderChips();
    });

    chipsEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-mw-gebiet]');
        if (!btn) return;
        const slug = btn.getAttribute('data-mw-gebiet');
        if (slug === state.gebiet) return;
        state.gebiet = slug;
        chipsEl.querySelectorAll('.mw-chip').forEach(function (c) {
            const on = c === btn;
            c.classList.toggle('active', on);
            c.setAttribute('aria-selected', String(on));
        });
        renderContent();
    });

    renderTabs();
    renderChips();

    if (CMS) {
        CMS.fetchCollection('content/themen').then(function (themen) {
            themenCache = themen;
            renderContent();
        }).catch(function (e) {
            console.error('Themen konnten nicht geladen werden', e);
            themenCache = [];
            renderContent();
        });
    } else {
        themenCache = [];
    }
})();
