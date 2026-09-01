/**
 * Hybridlog Plattform – Datengetriebene Inhaltsseite (Prompt 4)
 * Route: mental/seite.html?id=<slug>
 * Gemeinsames Grundgeruest fuer Beitraege und (noch nicht gebaute) Tools.
 */
/**
 * Hybridlog Plattform – Konzeptseite (Design-System-Version)
 * Route: mental/seite.html?id=<slug>
 * Generisches Grundgeruest fuer Beitraege und Tools ohne eigene Seite:
 * .concept-grid mit .short-answer + .cb Bloecken und .aside Sidebar.
 */
(function () {
    'use strict';

    const D = window.HLData, R = window.HLRender, base = window.PLATFORM_BASE;
    const id = new URLSearchParams(location.search).get('id') || '';
    const it = D.inhaltBySlug(id);

    const main = document.getElementById('main');
    if (!it) {
        document.title = 'Nicht gefunden · Hybridlog';
        main.innerHTML = '<div class="wrap"><section class="page-head"><h1>Inhalt nicht gefunden</h1>' +
            '<p class="reading">Diese Seite gibt es nicht. Geh zurück zur <a href="' + base + 'index.html">Startseite</a>.</p></section></div>';
        return;
    }

    const gebiet = D.gebietBySlug(it.gebiet);
    const welt = D.weltBySlug(gebiet.welt);
    // Kontext + aktive Weltfarbe fuer die Shell setzen (vor shell.js)
    document.body.setAttribute('data-welt', gebiet.welt);
    document.body.setAttribute('data-world', gebiet.welt);
    document.body.setAttribute('data-gebiet', it.gebiet);
    document.body.setAttribute('data-inhalt', it.slug);
    document.body.setAttribute('data-title', it.title);

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

    // ── Contentbloecke ──
    let cbs = '';
    if (content) {
        cbs = content.sections.map((s) => '<div class="cb"><h3>' + R.esc(s.h2) + '</h3>' + s.html + '</div>').join('');
    } else if (stub) {
        cbs = '<div class="cb"><h3>Worum es geht</h3>' + stub.html + '</div>' +
            '<div class="cb"><h3>Status</h3><p>' + R.esc(stub.note) + ' Melde dich zum Newsletter an, dann erfährst du, sobald es fertig ist.</p></div>';
    } else {
        cbs = '<div class="cb"><h3>Überblick</h3><p>' + R.esc(it.teaser) + '</p></div>';
    }

    const lead = (content && content.lead) || it.teaser;

    // ── Aside: Einordnung + Weiterdenken ──
    const related = D.inhalteByGebiet(it.gebiet).filter((x) => x.slug !== it.slug).slice(0, 5);
    const asideHtml =
        '<aside class="aside">' +
        '<div class="box">' +
        '<h4>Einordnung</h4>' +
        '<div class="meta-line"><span>Welt</span><b>' + R.esc(welt ? welt.name : '') + '</b></div>' +
        '<div class="meta-line"><span>Fachgebiet</span><b>' + R.esc(gebiet.name) + '</b></div>' +
        '<div class="meta-line"><span>Typ</span><b>' + (isTool ? 'Tool' : 'Beitrag') + '</b></div>' +
        '</div>' +
        (related.length
            ? '<div class="box"><h4>Weiterdenken</h4><div class="rel">' +
                related.map((x) => '<a href="' + R.href(x.href) + '"><span class="rt">' + (x.type === 'tool' ? 'Tool' : 'Beitrag') + '</span>' + R.esc(x.title) + '</a>').join('') +
                '</div></div>'
            : '') +
        '</aside>';

    // ── Zusammenbauen ──
    main.innerHTML =
        '<div class="wrap">' +
        '<div class="concept-grid">' +
        '<div class="concept-main">' +
        '<p class="kernfrage">' + R.esc(gebiet.name) + '</p>' +
        '<h1>' + R.esc(it.title) + '</h1>' +
        '<p><span class="nc-kind">' + R.kindLabel(it) + '</span></p>' +
        '<p class="short-answer">' + R.esc(lead) + '</p>' +
        cbs +
        '</div>' +
        asideHtml +
        '</div>' +

        '<section class="block tight" aria-labelledby="nl-title">' +
        '<p class="eyebrow">Newsletter</p>' +
        '<h2 id="nl-title">Ein Gedanke pro Woche</h2>' +
        '<p class="muted" style="margin-top:8px">Wenn dir das etwas gebracht hat, schicken wir dir einmal die Woche eine Idee zum Weiterdenken. Kein Spam, jederzeit abbestellbar.</p>' +
        '<form class="stack" style="max-width:420px;margin-top:14px" onsubmit="return false">' +
        '<input class="ui" type="email" required placeholder="deine@email.de" aria-label="E-Mail-Adresse" style="padding:11px 14px;border:1px solid var(--line-strong);border-radius:10px;background:var(--surface);color:var(--ink)">' +
        '<button class="btn" type="submit" style="justify-self:start">Anmelden</button>' +
        '</form>' +
        '</section>' +
        '</div>';
})();

