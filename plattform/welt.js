/**
 * Hybridlog Plattform – Weltseite (Design-System-Version)
 * Route: welt.html?w=<mind|body|world>
 * Zeigt alle Fachgebiete einer Wissenswelt als Listenzeilen, auch geplante
 * (Status/Sichtbarkeit als Badge), damit die volle Taxonomie sichtbar bleibt.
 * Setzt Seiten-Kontext am <body>, bevor die Shell ihn liest.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender;
    const params = new URLSearchParams(location.search);
    const slug = params.get('w') || 'mind';
    const welt = D.weltBySlug(slug) || D.WELTEN[0];

    // Kontext + aktive Weltfarbe fuer die Shell setzen (vor shell.js)
    document.body.setAttribute('data-welt', welt.slug);
    document.body.setAttribute('data-world', welt.slug);

    // Titel / Meta
    document.title = welt.name + ' · Hybridlog';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', welt.leitidee);

    const gebiete = D.gebieteByWelt(welt.slug);

    const main = document.getElementById('main');
    main.innerHTML =
        '<div class="wrap">' +
        '<section class="page-head">' +
        '<p class="eyebrow">Welt</p>' +
        '<div class="headrow"><h1>' + R.esc(welt.name) + '</h1><span class="typechip">Weltseite</span></div>' +
        '<p class="reading" style="font-style:italic">' + R.esc(welt.leitidee) + '</p>' +
        (!welt.aktiv ? '<p class="disc" style="margin-top:14px;display:inline-block">Diese Welt ist noch in Vorbereitung. Die folgenden Fachgebiete entstehen nach und nach.</p>' : '') +
        '</section>' +

        '<section class="block" aria-labelledby="gebiete-title">' +
        '<p class="eyebrow">Fachgebiete</p>' +
        '<h2 id="gebiete-title">Wähle ein Fachgebiet</h2>' +
        (gebiete.length
            ? '<div class="stack" style="margin-top:18px">' + gebiete.map((g, i) => R.gebietRow(g, i)).join('') + '</div>'
            : '<p class="disc" style="margin-top:14px">Für diese Welt sind noch keine Fachgebiete geplant.</p>') +
        '</section>' +
        '</div>';
})();
