/**
 * Hybridlog Plattform – Gebiets-Uebersicht (Prompt 3)
 * Route: mental/gebiet.html?g=<slug>
 * Rendert Kopf, Tools (Ordner-Karten) und Beitraege aus window.HLData.
 * Setzt Seiten-Kontext am <body>, bevor die Shell ihn liest.
 */
/**
 * Hybridlog Plattform – Fachgebietsseite (Design-System-Version)
 * Route: mental/gebiet.html?g=<slug>
 * Rendert Kopf, Tools und Beitraege aus window.HLData als .cluster/.node-card.
 * Setzt Seiten-Kontext am <body>, bevor die Shell ihn liest.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender;
    const params = new URLSearchParams(location.search);
    const slug = params.get('g') || 'philosophie';
    const gebiet = D.gebietBySlug(slug) || D.GEBIETE[0];
    const welt = D.weltBySlug(gebiet.welt);

    // Kontext + aktive Weltfarbe fuer die Shell setzen (vor shell.js)
    document.body.setAttribute('data-welt', gebiet.welt);
    document.body.setAttribute('data-world', gebiet.welt);
    document.body.setAttribute('data-gebiet', gebiet.slug);

    // Titel / Meta
    document.title = gebiet.name + ' · Hybridlog';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', gebiet.einleitung);

    const tools = D.inhalteByGebiet(gebiet.slug, 'tool');
    const arts = D.inhalteByGebiet(gebiet.slug, 'artikel');
    const active = gebiet.status === 'active';
    const isPublic = gebiet.visibility === 'public';

    const main = document.getElementById('main');
    main.innerHTML =
        '<div class="wrap">' +
        '<section class="page-head">' +
        '<p class="eyebrow">' + R.esc(welt ? welt.name : '') + '</p>' +
        '<div class="headrow"><h1>' + R.esc(gebiet.name) + '</h1><span class="typechip">Fachgebietsseite</span></div>' +
        '<p class="reading">' + R.esc(gebiet.einleitung) + '</p>' +
        '<div class="metaline-h">' +
        '<span>Welt <b>' + R.esc(welt ? welt.name : '') + '</b></span>' +
        '<span>Status <b>' + (active ? 'Aktiv' : 'In Planung') + '</b></span>' +
        '<span>Sichtbarkeit <b>' + (isPublic ? 'Öffentlich' : 'Intern') + '</b></span>' +
        '</div>' +
        '</section>' +

        '<section class="block" aria-labelledby="tools-title">' +
        '<p class="eyebrow">Ausprobieren</p>' +
        '<h2 id="tools-title">Tools in diesem Fachgebiet</h2>' +
        (tools.length
            ? '<div class="cluster" style="margin-top:18px">' + tools.map((it) => R.nodeCard(it, gebiet)).join('') + '</div>'
            : '<p class="disc" style="margin-top:14px">Für dieses Fachgebiet sind bald Tools verfügbar.</p>') +
        '</section>' +

        '<section class="block" aria-labelledby="beitraege-title">' +
        '<p class="eyebrow">Lesen</p>' +
        '<h2 id="beitraege-title">Beiträge zum Vertiefen</h2>' +
        (arts.length
            ? '<div class="cluster" style="margin-top:18px">' + arts.map((it) => R.nodeCard(it, gebiet)).join('') + '</div>'
            : '<p class="disc" style="margin-top:14px">Bald folgen hier vertiefende Beiträge.</p>') +
        '</section>' +
        '</div>';
})();
