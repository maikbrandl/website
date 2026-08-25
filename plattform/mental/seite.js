/**
 * Hybridlog Plattform – Datengetriebene Inhaltsseite (Prompt 4)
 * Route: mental/seite.html?id=<slug>
 * Gemeinsames Grundgeruest fuer Beitraege und (noch nicht gebaute) Tools.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender, base = window.PLATFORM_BASE;
    const id = new URLSearchParams(location.search).get('id') || '';
    const it = D.inhaltBySlug(id);

    const main = document.getElementById('main');
    if (!it) {
        document.title = 'Nicht gefunden · Hybridlog';
        main.innerHTML = '<nav data-hl-crumbs></nav><h1>Inhalt nicht gefunden</h1>' +
            '<p class="lead">Diese Seite gibt es nicht. Geh zurück zur <a href="' + base + 'index.html">Startseite</a>.</p>';
        return;
    }

    const gebiet = D.gebietBySlug(it.gebiet);
    // Kontext + Farbe fuer die Shell setzen (vor shell.js)
    document.body.setAttribute('data-domaene', 'mental');
    document.body.setAttribute('data-gebiet', it.gebiet);
    document.body.setAttribute('data-inhalt', it.slug);
    document.documentElement.style.setProperty('--area', 'var(' + gebiet.farbeVar + ')');

    document.title = it.title + ' · ' + gebiet.name + ' · Hybridlog';
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', it.teaser);

    const isTool = it.type === 'tool';
    const content = window.HLContent[it.slug];
    const stub = window.HLToolStub[it.slug];

    // JSON-LD (Article fuer Beitrag, SoftwareApplication fuer Tool)
    const ld = isTool
        ? { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: it.title, applicationCategory: 'EducationalApplication', operatingSystem: 'Web', inLanguage: 'de', description: it.teaser }
        : { '@context': 'https://schema.org', '@type': 'Article', headline: it.title, inLanguage: 'de', description: it.teaser, articleSection: gebiet.name };
    const ldScript = document.createElement('script');
    ldScript.type = 'application/ld+json';
    ldScript.textContent = JSON.stringify(ld);
    document.head.appendChild(ldScript);

    // ── Kopf ──
    let html =
        '<nav data-hl-crumbs></nav>' +
        '<div class="title-row"><h1>' + R.esc(it.title) + '</h1>' +
        '<span class="badge ' + (isTool ? 'badge--tool">Tool interaktiv' : 'badge--artikel">Beitrag') + '</span></div>';

    // ── Tool-Header oben (falls Tool) ──
    if (isTool) {
        html += '<section class="tool-header" aria-label="Tool">' +
            '<div class="tool-header__bar"><span class="tool-header__dot"></span> ' + (stub ? stub.note : 'Interaktives Tool') + '</div>' +
            '<div class="tool-header__mount"><p class="lead" style="margin:0">' + R.esc(it.sneak) + '</p></div>' +
            '</section>';
    }

    html += '<details class="toc-inline" data-hl-toc-inline></details>';

    // ── Lead + Abschnitte ──
    const lead = (content && content.lead) || it.teaser;
    html += '<p class="lead">' + R.esc(lead) + '</p><div class="prose">';
    if (content) {
        content.sections.forEach((s) => { html += '<h2>' + R.esc(s.h2) + '</h2>' + s.html; });
    } else if (stub) {
        html += '<h2>Worum es geht</h2>' + stub.html +
            '<h2>Status</h2><p>' + R.esc(stub.note) + ' Melde dich zum Newsletter an, dann erfährst du, sobald es fertig ist.</p>';
    } else {
        html += '<h2>Überblick</h2><p>' + R.esc(it.teaser) + '</p>';
    }
    html += '</div>';

    // ── Vertiefen ──
    const related = D.inhalteByGebiet(it.gebiet).filter((x) => x.slug !== it.slug);
    if (related.length) {
        html += '<section class="section"><div class="section__head"><h2>Vertiefen</h2></div>' +
            '<div class="related-grid">' + related.map((x) => R.related(x, gebiet)).join('') + '</div></section>';
    }

    // ── Newsletter ──
    html +=
        '<section class="newsletter" aria-labelledby="nl-title">' +
        '<h2 id="nl-title">Ein Gedanke pro Woche</h2>' +
        '<p>Wenn dir das etwas gebracht hat, schicken wir dir einmal die Woche eine Idee zum Weiterdenken. Kein Spam, jederzeit abbestellbar.</p>' +
        '<form class="newsletter__form" onsubmit="return false">' +
        '<input class="newsletter__input" type="email" required placeholder="deine@email.de" aria-label="E-Mail-Adresse">' +
        '<button class="btn btn--primary" type="submit">Anmelden</button></form>' +
        '<p class="newsletter__note">Mit der Anmeldung stimmst du dem Erhalt des Newsletters zu.</p>' +
        '</section>';

    // ── Pager ──
    const all = D.inhalteByGebiet(it.gebiet);
    const pos = all.findIndex((x) => x.slug === it.slug);
    const prev = all[pos - 1], next = all[pos + 1];
    html += '<nav class="pager" aria-label="Weiter im Gebiet">' +
        (prev ? '<a class="pager__link" href="' + R.href(prev.href) + '"><span class="pager__dir">Vorher</span><span class="pager__title">' + R.esc(prev.title) + '</span></a>' : '<span class="pager__link pager__empty"></span>') +
        (next ? '<a class="pager__link pager__link--next" href="' + R.href(next.href) + '"><span class="pager__dir">Nächster</span><span class="pager__title">' + R.esc(next.title) + '</span></a>' : '<span class="pager__link pager__empty"></span>') +
        '</nav>';

    main.innerHTML = html;

    // Mobile Sticky-Leiste
    const step = next || related[0];
    if (step) {
        const bar = document.querySelector('[data-hl-nextbar]');
        if (bar) bar.innerHTML =
            '<div><div class="next-bar__label">Nächster Schritt</div><div class="next-bar__title">' + R.esc(step.title) + '</div></div>' +
            '<a class="btn btn--area btn--sm" href="' + R.href(step.href) + '">Weiter</a>';
    }
})();
