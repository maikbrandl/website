/**
 * Hybridlog Plattform – Gebiets-Uebersicht (Prompt 3)
 * Route: mental/gebiet.html?g=<slug>
 * Rendert Kopf, Tools (Ordner-Karten) und Beitraege aus window.HLData.
 * Setzt Seiten-Kontext am <body>, bevor die Shell ihn liest.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender;
    const params = new URLSearchParams(location.search);
    const slug = params.get('g') || 'philosophie';
    const gebiet = D.gebietBySlug(slug) || D.GEBIETE[0];

    // Kontext + aktive Gebietsfarbe fuer die Shell setzen (vor shell.js)
    document.body.setAttribute('data-domaene', 'mental');
    document.body.setAttribute('data-gebiet', gebiet.slug);
    document.documentElement.style.setProperty('--area', 'var(' + gebiet.farbeVar + ')');

    // Titel / Meta
    document.title = gebiet.name + ' · Hybridlog';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', gebiet.einleitung);

    const tools = D.inhalteByGebiet(gebiet.slug, 'tool');
    const arts = D.inhalteByGebiet(gebiet.slug, 'artikel');

    const main = document.getElementById('main');
    main.innerHTML =
        '<nav data-hl-crumbs></nav>' +
        '<header>' +
        '<p class="eyebrow">Mental</p>' +
        '<h1>' + R.esc(gebiet.name) + '</h1>' +
        '<p class="lead">' + R.esc(gebiet.einleitung) + '</p>' +
        '</header>' +

        '<section class="section" style="--area:var(' + gebiet.farbeVar + ')">' +
        '<div class="section__head"><h2 id="tools">Tools</h2></div>' +
        (tools.length
            ? '<div class="folder-grid">' + tools.map((it) => R.folder(it, gebiet)).join('') + '</div>'
            : '<p class="post-item__sneak">Für dieses Gebiet sind bald Tools verfügbar.</p>') +
        '</section>' +

        '<section class="section" style="--area:var(' + gebiet.farbeVar + ')">' +
        '<div class="section__head"><h2 id="beitraege">Beiträge zum Vertiefen</h2></div>' +
        (arts.length
            ? '<div class="post-list">' + arts.map((it) => R.post(it, gebiet)).join('') + '</div>'
            : '<p class="post-item__sneak">Bald folgen hier vertiefende Beiträge.</p>') +
        '</section>';
})();
