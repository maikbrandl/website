/**
 * Hybridlog Plattform – gemeinsamer Navigations-Baum (Wissensräume/Fachgebiete/
 * Themen/Tools + die flache Wissensfragen-Kategorie). Genutzt von mental/thema.js
 * (Themenseite), mental/frage.js (Wissensfrage-Seite) UND der Wissensraum-
 * Startseite (index.html + js/start.js), damit die Baum-Logik nur an einer
 * Stelle gepflegt werden muss. `active` ist optional ({thema,gebiet} oder
 * {frageSlug}) und markiert nur den aktuellen Pfad; ohne active (z.B. auf der
 * Startseite) wird einfach kein Zweig hervorgehoben. `fragen` ist optional
 * (Array aus content/wissensfragen), ohne sie wird die Kategorie ausgeblendet.
 */
(function () {
    'use strict';

    const D = window.HLData;
    const base = window.PLATFORM_BASE || '../';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }

    const ICONS = {
        lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 2z"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
        flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6.3L4.2 18a2 2 0 0 0 1.8 3h12a2 2 0 0 0 1.8-3L15 8.3V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="8.5" y1="14" x2="15.5" y2="14"/></svg>',
        book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    };
    function icon(name) { return ICONS[name] || ''; }
    const ROOM_ICON = { mind: 'lightbulb', body: 'refresh', world: 'world' };

    function themaLi(t, active) {
        const isOn = active && active.thema && t.slug === active.thema.slug;
        return '<li><a href="' + href('mental/thema.html?slug=' + encodeURIComponent(t.slug)) + '"' + (isOn ? ' class="on"' : '') + '>' + esc(t.title) + '</a></li>';
    }

    function buildNav(gebiete, themen, active, fragen) {
        const rooms = D.WELTEN.map(function (w) {
            const gebieteInWelt = gebiete.filter(function (g) { return g.world === w.slug && g.visibility === 'public'; })
                .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
            const isOpenRoom = active && active.gebiet && active.gebiet.world === w.slug;

            const gebieteHtml = gebieteInWelt.length ? gebieteInWelt.map(function (g) {
                const themenInGebiet = themen.filter(function (t) { return t.gebiet === g.slug; });
                const isActiveGebiet = active && active.thema && active.thema.gebiet === g.slug;
                const flat = themenInGebiet.filter(function (t) { return !t.untergruppe; });
                const gruppen = [];
                themenInGebiet.forEach(function (t) {
                    if (!t.untergruppe) return;
                    let grp = gruppen.find(function (x) { return x.name === t.untergruppe; });
                    if (!grp) { grp = { name: t.untergruppe, themen: [] }; gruppen.push(grp); }
                    grp.themen.push(t);
                });

                const themenLis = flat.map(function (t) { return themaLi(t, active); }).join('') +
                    gruppen.map(function (grp) {
                        const trail = grp.themen.some(function (t) { return active && active.thema && t.slug === active.thema.slug; });
                        return '<li class="tn-gruppe' + (trail ? ' trail' : '') + '">' +
                            '<details' + (trail ? ' open' : '') + '><summary>' + esc(grp.name) + '</summary>' +
                            '<ul>' + grp.themen.map(function (t) { return themaLi(t, active); }).join('') + '</ul>' +
                            '</details></li>';
                    }).join('');

                const gebietTools = D.inhalteByGebiet(g.slug, 'tool');
                const toolsLis = gebietTools.length ? '<ul class="tn-tools">' + gebietTools.map(function (it) {
                    return '<li><a href="' + href(it.href) + '">' + icon('flask') + esc(it.title) + '</a></li>';
                }).join('') + '</ul>' : '';

                return '<details class="tn-gebiet' + (isActiveGebiet ? ' on' : '') + '"' + (isActiveGebiet ? ' open' : '') + '>' +
                    '<summary>' + esc(g.title) + '</summary>' +
                    (themenLis ? '<ul class="tn-themen">' + themenLis + '</ul>' : '<p class="muted" style="font-size:.78rem;padding:0 0 8px 20px">Noch keine Themen.</p>') +
                    toolsLis +
                    '</details>';
            }).join('') : '<p class="muted" style="font-size:.78rem;padding:8px 4px">Noch keine öffentlichen Fachgebiete.</p>';

            return '<details class="tn-room" data-w="' + w.slug + '"' + (isOpenRoom ? ' open' : '') + '>' +
                '<summary><span class="tn-ico">' + icon(ROOM_ICON[w.slug]) + '</span><b>' + esc(w.name) + '</b></summary>' +
                '<div class="tn-gebiete">' + gebieteHtml + '</div>' +
                '</details>';
        }).join('');

        // Wissensfragen: eigene, flache Kategorie unterhalb der Wissensräume,
        // bewusst ohne Gliederung/Details-Verschachtelung (siehe Themenbaum
        // oben) -- ein klares Problem von Anfang bis Ende, kein Fachgebiet-Baum.
        const fragenHtml = (fragen && fragen.length) ? (
            '<p class="eyebrow" style="margin-top:22px">Wissensfragen</p>' +
            '<ul class="tn-themen" style="border-left:0;padding-left:0">' + fragen.map(function (f) {
                const isOn = active && active.frageSlug === f.slug;
                return '<li><a href="' + href('mental/frage.html?slug=' + encodeURIComponent(f.slug)) + '"' + (isOn ? ' class="on"' : '') + '>' + esc(f.title) + '</a></li>';
            }).join('') + '</ul>'
        ) : '';

        return '<div class="thema-nav">' +
            '<p class="eyebrow">Wissensräume</p>' + rooms +
            fragenHtml +
            '<a class="tn-all" href="' + href('index.html') + '">Alle anzeigen →</a>' +
            '<div class="card tn-ways"><h4>Wissen auf deine Weise</h4>' +
            '<div class="tn-way">' + icon('book') + '<span><b>Lesen</b><span>Texte & Erklärungen</span></span></div>' +
            '<div class="tn-way">' + icon('eye') + '<span><b>Sehen</b><span>Grafiken & Landkarten</span></span></div>' +
            '<div class="tn-way">' + icon('flask') + '<span><b>Ausprobieren</b><span>Tools & Simulationen</span></span></div>' +
            '</div></div>';
    }

    window.HLNavTree = { build: buildNav };
})();
