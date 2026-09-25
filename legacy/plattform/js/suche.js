/**
 * Hybridlog Plattform – Suche (suche.html)
 * Echte clientseitige Suche ueber Themen (CMS), Tools und Beitraege
 * (window.HLData.INHALTE). Kein Server, keine Reload, Filter-Chips fuer
 * Alle/Themen/Tools/Beitraege kombinierbar mit Freitext.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender, CMS = window.HLCms;
    if (!D || !R) return;

    const input = document.querySelector('[data-search-input]');
    const filtersEl = document.querySelector('[data-search-filters]');
    const resultsEl = document.querySelector('[data-search-results]');
    const emptyEl = document.querySelector('[data-search-empty]');
    if (!input || !filtersEl || !resultsEl) return;

    let themen = [];
    let filter = 'alle';

    function norm(s) { return String(s == null ? '' : s).toLowerCase(); }

    function buildIndex() {
        const themaItems = themen.map(function (t) {
            return { kind: 'thema', slug: t.slug, title: t.title, teaser: t.lead || '', href: 'mental/thema.html?slug=' + encodeURIComponent(t.slug), gebiet: D.gebietBySlug(t.gebiet) };
        });
        const toolItems = D.INHALTE.filter(function (i) { return i.type === 'tool'; }).map(function (i) {
            return { kind: 'tool', slug: i.slug, title: i.title, teaser: i.teaser, href: i.href, gebiet: D.gebietBySlug(i.gebiet) };
        });
        const artItems = D.INHALTE.filter(function (i) { return i.type === 'artikel'; }).map(function (i) {
            return { kind: 'artikel', slug: i.slug, title: i.title, teaser: i.teaser, href: i.href, gebiet: D.gebietBySlug(i.gebiet) };
        });
        return themaItems.concat(toolItems, artItems);
    }

    function matches(item, q) {
        if (filter !== 'alle' && item.kind !== filter) return false;
        if (!q) return true;
        const hay = norm(item.title) + ' ' + norm(item.teaser);
        return hay.indexOf(q) !== -1;
    }

    function render() {
        const index = buildIndex();
        const q = norm(input.value.trim());
        const list = index.filter(function (it) { return matches(it, q); });
        list.sort(function (a, b) {
            const aStarts = norm(a.title).indexOf(q) === 0 ? 0 : 1;
            const bStarts = norm(b.title).indexOf(q) === 0 ? 0 : 1;
            return aStarts - bStarts;
        });

        if (!q && filter === 'alle') {
            emptyEl.hidden = false;
            resultsEl.innerHTML = '';
            return;
        }
        emptyEl.hidden = true;

        if (!list.length) {
            resultsEl.innerHTML = '<p class="disc" style="margin-top:16px">Keine Treffer. Versuch einen anderen Begriff.</p>';
            return;
        }
        resultsEl.innerHTML = '<div class="cluster" style="margin-top:18px">' + list.map(function (it) {
            return R.nodeCard({ type: it.kind, slug: it.slug, href: it.href, title: it.title, teaser: it.teaser }, it.gebiet);
        }).join('') + '</div>';
    }

    input.addEventListener('input', render);

    filtersEl.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        filter = btn.getAttribute('data-filter');
        filtersEl.querySelectorAll('.search-filter').forEach(function (c) { c.classList.toggle('active', c === btn); });
        render();
    });

    render();

    if (CMS) {
        CMS.fetchCollection('content/themen').then(function (data) {
            themen = data;
            render();
        }).catch(function (e) { console.error('Themen konnten nicht geladen werden', e); });
    }
})();
