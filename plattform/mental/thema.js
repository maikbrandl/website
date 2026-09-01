/**
 * Hybridlog Plattform – Themenseite (Wissensraum, vanilla)
 * Baut die 3-Spalten-Ansicht (Navigation / Block-Baukasten / Leiste) aus
 * content/fachgebiete + content/themen (Decap, per GitHub zur Laufzeit
 * geholt, siehe js/cms-fetch.js). Tools und Blogartikel bleiben unangetastet
 * die bisherigen Inhaltstypen, "Thema" ist ein dritter, neuer Typ.
 *
 * Struktur-/Orientierungsfarbe ist hier durchgehend --teal, --accent (Gold)
 * bleibt exklusiv fuer weiterfuehrende Links (siehe Design-Vorgabe 2026-09-01).
 */
(function () {
    'use strict';

    const D = window.HLData;
    const CMS = window.HLCms;
    const base = window.PLATFORM_BASE || '../';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function href(path) {
        if (/^(https?:|mailto:|#)/.test(path)) return path;
        return base + path;
    }
    function qs(name) {
        return new URLSearchParams(location.search).get(name) || '';
    }

    // Kleine Absatz-Konvertierung fuer Markdown-Textfelder, keine Bilder/Links
    // noetig hier, nur Absaetze und **fett**/*kursiv*.
    function mdParagraphs(text) {
        const normalized = String(text || '').replace(/\r\n?/g, '\n').trim();
        if (!normalized) return '';
        return normalized.split(/\n\s*\n/).map(function (para) {
            let html = esc(para.trim()).replace(/\n/g, '<br>');
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
            return '<p>' + html + '</p>';
        }).join('');
    }

    function estimateMinutes(bloecke) {
        const words = (bloecke || []).map(function (b) {
            return [b.text, b.lead].filter(Boolean).join(' ');
        }).join(' ').split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    }

    // ---------------------------------------------------------------------
    // Icons. Ein festes, kleines Set, passend zu den Decap-Select-Optionen
    // der Bloecke icon_fakten/prozess. 'book'/'eye'/'flask' zusaetzlich fuer
    // die feste "Wissen auf deine Weise" Box.
    // ---------------------------------------------------------------------
    const ICONS = {
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
        lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
        lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 2z"/></svg>',
        filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/></svg>',
        refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>',
        shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
        book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6.3L4.2 18a2 2 0 0 0 1.8 3h12a2 2 0 0 0 1.8-3L15 8.3V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="8.5" y1="14" x2="15.5" y2="14"/></svg>',
        bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
        network: '<svg viewBox="0 0 100 70" fill="none"><circle cx="50" cy="35" r="6" fill="currentColor"/><circle cx="20" cy="18" r="4" fill="currentColor" opacity=".6"/><circle cx="82" cy="14" r="4" fill="currentColor" opacity=".6"/><circle cx="14" cy="52" r="4" fill="currentColor" opacity=".6"/><circle cx="50" cy="60" r="4" fill="currentColor" opacity=".6"/><circle cx="86" cy="50" r="4" fill="currentColor" opacity=".6"/><g stroke="currentColor" stroke-width="1.2" opacity=".5"><line x1="50" y1="35" x2="20" y2="18"/><line x1="50" y1="35" x2="82" y2="14"/><line x1="50" y1="35" x2="14" y2="52"/><line x1="50" y1="35" x2="50" y2="60"/><line x1="50" y1="35" x2="86" y2="50"/></g></svg>',
        world: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>',
    };
    function icon(name) { return ICONS[name] || ICONS.check; }
    const ROOM_ICON = { mind: 'lightbulb', body: 'refresh', world: 'world' };

    const DEFAULT_TITLES = {
        kurz_erklaert: 'Kurz erklärt', icon_fakten: 'Auf einen Blick', prozess: 'So funktioniert das',
        textabschnitt: 'Textabschnitt', beispiel: 'Beispiel aus dem Alltag', liste: 'Wichtig zu wissen',
        evidenz: 'Grenzen & Evidenz', zitat: 'Zitat', faq: 'Häufig gefragt', tool_einbindung: 'Zum Ausprobieren',
    };
    function secTitle(b) {
        return (b.titel_override && String(b.titel_override).trim()) || DEFAULT_TITLES[b.type] || 'Abschnitt';
    }

    // ---------------------------------------------------------------------
    // BlockRenderer: ein Renderer je Typ, alle liefern nur den Karteninhalt,
    // Nummer + Titel kommen einheitlich aus wrapSection().
    // ---------------------------------------------------------------------
    function renderBlockBody(b, ctx) {
        switch (b.type) {
            case 'kurz_erklaert':
                return mdParagraphs(b.text);
            case 'icon_fakten':
                return '<div class="thema-icon-fakten">' + (b.fakten || []).map(function (f) {
                    return '<div class="thema-fakt">' + icon(f.icon) + '<span>' + esc(f.text) + '</span></div>';
                }).join('') + '</div>';
            case 'prozess':
                return '<div class="thema-prozess">' + (b.schritte || []).map(function (s, i, arr) {
                    return '<div class="thema-prozess-step">' +
                        '<div class="thema-prozess-icon">' + icon(s.icon) + '</div>' +
                        '<h5>' + esc(s.titel) + '</h5><p>' + esc(s.untertitel) + '</p></div>' +
                        (i < arr.length - 1 ? '<div class="thema-prozess-arrow">┄→</div>' : '');
                }).join('') + '</div>';
            case 'textabschnitt':
                return '<div class="thema-textabschnitt">' + mdParagraphs(b.text) + '</div>';
            case 'beispiel':
                return '<div class="thema-beispiel"><blockquote>' + esc(b.text) + '</blockquote>' +
                    (b.ergebnis ? '<p class="tb-ergebnis">Ergebnis: ' + esc(b.ergebnis) + '</p>' : '') + '</div>';
            case 'liste':
                return '<ul class="thema-liste">' + (b.punkte || []).map(function (p) {
                    return '<li>' + icon('check') + '<span>' + esc(p) + '</span></li>';
                }).join('') + '</ul>';
            case 'evidenz':
                return '<div class="thema-evidenz"><p>' + esc(b.text) + '</p>' +
                    (b.link_url ? '<a class="thema-link-gold" href="' + esc(b.link_url) + '">' + esc(b.link_label || 'Mehr erfahren') + ' →</a>' : '') + '</div>';
            case 'zitat':
                return '<blockquote class="thema-zitat">„' + esc(b.text) + '“' + (b.quelle ? '<cite>' + esc(b.quelle) + '</cite>' : '') + '</blockquote>';
            case 'faq':
                return '<div class="thema-faq">' + (b.eintraege || []).map(function (e) {
                    return '<details><summary>' + esc(e.frage) + '</summary><p>' + esc(e.antwort) + '</p></details>';
                }).join('') + '</div>';
            case 'tool_einbindung': {
                const tool = ctx.toolBySlug(b.tool);
                if (!tool) return '<p class="muted">Tool nicht gefunden.</p>';
                return '<a class="thema-tool-inline tap" href="' + href(tool.href) + '">' +
                    '<span class="tt-icon">' + icon('flask') + '</span>' +
                    '<span><h5>' + esc(tool.title) + '</h5><p>' + esc(tool.teaser) + '</p></span></a>';
            }
            default:
                return '';
        }
    }

    function wrapSection(b, num, id) {
        return '<section class="thema-sec" id="' + id + '">' +
            '<div class="thema-sec-head"><span class="thema-sec-num">' + num + '</span>' +
            '<span class="thema-sec-label">' + esc(secTitle(b)) + '</span></div>' +
            renderBlockBody(b, { toolBySlug: toolBySlug }) +
            '</section>';
    }

    // ---------------------------------------------------------------------
    // Bekannte Tools (bestehende, statische Inhalte, kein Decap dafuer noetig)
    // ---------------------------------------------------------------------
    function toolBySlug(slug) {
        return (D.INHALTE || []).find(function (i) { return i.type === 'tool' && i.slug === slug; }) || null;
    }

    // ---------------------------------------------------------------------
    // Linke Navigation
    // ---------------------------------------------------------------------
    function buildNav(gebiete, themen, active) {
        const rooms = D.WELTEN.map(function (w) {
            const gebieteInWelt = gebiete.filter(function (g) { return g.world === w.slug && g.visibility === 'public'; })
                .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
            const isOpenRoom = active && active.gebiet && active.gebiet.world === w.slug;

            const gebieteHtml = gebieteInWelt.length ? gebieteInWelt.map(function (g) {
                const themenInGebiet = themen.filter(function (t) { return t.gebiet === g.slug; });
                const isActiveGebiet = active && active.thema.gebiet === g.slug;
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
                        const trail = grp.themen.some(function (t) { return active && t.slug === active.thema.slug; });
                        return '<li class="tn-gruppe' + (trail ? ' trail' : '') + '">' +
                            '<details' + (trail ? ' open' : '') + '><summary>' + esc(grp.name) + '</summary>' +
                            '<ul>' + grp.themen.map(function (t) { return themaLi(t, active); }).join('') + '</ul>' +
                            '</details></li>';
                    }).join('');

                return '<details class="tn-gebiet' + (isActiveGebiet ? ' on' : '') + '"' + (isActiveGebiet ? ' open' : '') + '>' +
                    '<summary>' + esc(g.title) + '</summary>' +
                    (themenLis ? '<ul class="tn-themen">' + themenLis + '</ul>' : '<p class="muted" style="font-size:.78rem;padding:0 0 8px 20px">Noch keine Themen.</p>') +
                    '</details>';
            }).join('') : '<p class="muted" style="font-size:.78rem;padding:8px 4px">Noch keine öffentlichen Fachgebiete.</p>';

            return '<details class="tn-room" data-w="' + w.slug + '"' + (isOpenRoom ? ' open' : '') + '>' +
                '<summary><span class="tn-ico">' + icon(ROOM_ICON[w.slug]) + '</span><b>' + esc(w.name) + '</b></summary>' +
                '<div class="tn-gebiete">' + gebieteHtml + '</div>' +
                '</details>';
        }).join('');

        return '<div class="thema-nav">' +
            '<p class="eyebrow">Wissensräume</p>' + rooms +
            '<a class="tn-all" href="' + href('index.html') + '">Alle anzeigen →</a>' +
            '<div class="card tn-ways"><h4>Wissen auf deine Weise</h4>' +
            '<div class="tn-way">' + icon('book') + '<span><b>Lesen</b><span>Texte & Erklärungen</span></span></div>' +
            '<div class="tn-way">' + icon('eye') + '<span><b>Sehen</b><span>Grafiken & Landkarten</span></span></div>' +
            '<div class="tn-way">' + icon('flask') + '<span><b>Ausprobieren</b><span>Tools & Simulationen</span></span></div>' +
            '</div></div>';
    }
    function themaLi(t, active) {
        const isOn = active && t.slug === active.thema.slug;
        return '<li><a href="' + href('mental/thema.html?slug=' + encodeURIComponent(t.slug)) + '"' + (isOn ? ' class="on"' : '') + '>' + esc(t.title) + '</a></li>';
    }

    // ---------------------------------------------------------------------
    // Mittelteil
    // ---------------------------------------------------------------------
    function buildHead(thema, gebiet) {
        const lesezeit = thema.lesezeit || estimateMinutes(thema.bloecke);
        const vertiefzeit = thema.vertiefzeit || (lesezeit * 4);
        return '<div class="thema-head">' +
            '<p class="thema-art">' + esc(thema.art || '') + '</p>' +
            '<h1>' + esc(thema.title) + '</h1>' +
            '<p class="lead">' + esc(thema.lead || '') + '</p>' +
            '<div class="thema-metaline">' +
            '<span>' + icon('book') + esc('Kurz lesen: ' + lesezeit + ' Min.') + '</span>' +
            '<span>' + icon('flask') + esc('Vertiefen: ' + vertiefzeit + '+ Min.') + '</span>' +
            '<span>' + icon('link') + 'Wissensknoten</span>' +
            '</div></div>';
    }

    function buildBlocks(thema) {
        const toc = [];
        const html = (thema.bloecke || []).map(function (b, i) {
            const num = i + 1;
            const id = 'sec-' + num;
            toc.push({ id: id, title: secTitle(b) });
            return wrapSection(b, num, id);
        }).join('');
        return { html: '<div class="stack">' + html + '</div>', toc: toc };
    }

    // ---------------------------------------------------------------------
    // Rechte Leiste
    // ---------------------------------------------------------------------
    function buildRail(thema, themen, gebiete, toc) {
        const tocHtml = '<nav class="thema-toc" aria-label="Inhalt">' + toc.map(function (s) {
            return '<a href="#' + s.id + '" data-target="' + s.id + '">' + esc(s.title) + '</a>';
        }).join('') + '</nav>';

        const progressHtml = '<div class="card">' +
            '<p class="eyebrow">Auf dieser Seite</p>' +
            '<p class="muted" style="font-size:.86rem;margin-top:6px">In ' + toc.length + ' Abschnitten</p>' +
            '<div class="thema-progress-track"><div class="thema-progress-fill" data-progress></div></div>' +
            '<button class="thema-save" type="button" data-save>' + icon('bookmark') + '<span>Fortschritt speichern</span></button>' +
            '</div>';

        const toolBlock = (thema.bloecke || []).find(function (b) { return b.type === 'tool_einbindung'; });
        const toolSlug = (toolBlock && toolBlock.tool) || (thema.verwandte_tools || [])[0];
        const tool = toolSlug ? toolBySlug(toolSlug) : null;
        const toolHtml = tool ? '<div class="card thema-tool-card"><p class="eyebrow">Zum Ausprobieren</p>' +
            '<div class="tt-preview">' + icon('network') + '</div>' +
            '<h4>' + esc(tool.title) + '</h4><p>' + esc(tool.teaser) + '</p>' +
            '<a class="thema-link-gold" href="' + href(tool.href) + '">Tool öffnen →</a></div>' : '';

        const related = (thema.verwandte_themen || []).map(function (slug) {
            return themen.find(function (t) { return t.slug === slug; });
        }).filter(Boolean);
        const gebiet = gebiete.find(function (g) { return g.slug === thema.gebiet; });
        const relatedHtml = related.length ? '<div class="card"><p class="eyebrow">Ähnliche Themen</p>' +
            '<div class="thema-related" style="margin-top:12px">' + related.map(function (t) {
                const g = gebiete.find(function (x) { return x.slug === t.gebiet; });
                return '<a href="' + href('mental/thema.html?slug=' + encodeURIComponent(t.slug)) + '"><b>' + esc(t.title) + '</b><span>' + esc(t.art || (g ? g.title : '')) + '</span></a>';
            }).join('') + '</div>' +
            (gebiet ? '<a class="thema-link-gold" style="display:inline-block;margin-top:12px" href="' + href('mental/gebiet.html?g=' + gebiet.slug) + '">Alle anzeigen →</a>' : '') +
            '</div>' : '';

        return '<div class="thema-rail">' + tocHtml + progressHtml + toolHtml + relatedHtml + '</div>';
    }

    function wireRail() {
        const main = document.querySelector('.thema-main');
        const toc = document.querySelectorAll('.thema-toc a');
        const fill = document.querySelector('[data-progress]');
        const sections = Array.from(document.querySelectorAll('.thema-sec'));

        function onScroll() {
            if (!main || !fill) return;
            const rect = main.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            const passed = -rect.top;
            const pct = total > 0 ? Math.min(100, Math.max(0, (passed / total) * 100)) : 0;
            fill.style.width = pct + '%';
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        if ('IntersectionObserver' in window && sections.length) {
            const obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    const link = document.querySelector('.thema-toc a[data-target="' + entry.target.id + '"]');
                    if (!link) return;
                    if (entry.isIntersecting) {
                        toc.forEach(function (a) { a.classList.remove('on'); });
                        link.classList.add('on');
                    }
                });
            }, { rootMargin: '-16% 0px -74% 0px' });
            sections.forEach(function (s) { obs.observe(s); });
        }

        const saveBtn = document.querySelector('[data-save]');
        if (saveBtn) {
            const key = 'hl-thema-saved-' + qs('slug');
            function paint(on) {
                saveBtn.classList.toggle('on', on);
                saveBtn.querySelector('span').textContent = on ? 'Gespeichert' : 'Fortschritt speichern';
            }
            let saved = false;
            try { saved = localStorage.getItem(key) === '1'; } catch (e) { }
            paint(saved);
            saveBtn.addEventListener('click', function () {
                saved = !saved;
                try { localStorage.setItem(key, saved ? '1' : '0'); } catch (e) { }
                paint(saved);
            });
        }
    }

    // ---------------------------------------------------------------------
    // Brotkrumen (ueberschreibt den leeren Stand von shell.js, dessen
    // Body-Attribute erst nach dem asynchronen Laden bekannt sind).
    // ---------------------------------------------------------------------
    function buildCrumbs(thema, gebiet) {
        const host = document.querySelector('[data-hl-crumbs]');
        if (!host) return;
        const welt = D.weltBySlug(thema.wissensraum);
        const parts = ['<a href="' + href('index.html') + '">Start</a>'];
        if (welt) parts.push('<span class="sep">\u203a</span><a href="' + href('welt.html?w=' + welt.slug) + '">' + esc(welt.name) + '</a>');
        if (gebiet) parts.push('<span class="sep">\u203a</span><a href="' + href('mental/gebiet.html?g=' + gebiet.slug) + '">' + esc(gebiet.title) + '</a>');
        parts.push('<span class="sep">\u203a</span><span class="here">' + esc(thema.title) + '</span>');
        host.className = 'crumbs';
        host.innerHTML = '<div class="crumbs-inner">' + parts.join(' ') + '</div>';
    }

    // ---------------------------------------------------------------------
    // Start
    // ---------------------------------------------------------------------
    async function init() {
        const main = document.querySelector('#main');
        const slug = qs('slug');
        if (!main || !slug) { renderError(main, 'Kein Thema angegeben.'); return; }

        let gebiete, themen;
        try {
            [gebiete, themen] = await Promise.all([
                CMS.fetchCollection('content/fachgebiete'),
                CMS.fetchCollection('content/themen'),
            ]);
        } catch (e) {
            console.error(e);
            renderError(main, 'Die Inhalte konnten nicht geladen werden. Bitte später erneut versuchen.');
            return;
        }

        const thema = themen.find(function (t) { return t.slug === slug; });
        if (!thema) { renderError(main, 'Dieses Thema wurde nicht gefunden.'); return; }
        const gebiet = gebiete.find(function (g) { return g.slug === thema.gebiet; });

        document.title = thema.seo_title || (thema.title + ' · ' + (gebiet ? gebiet.title : 'Wissensraum') + ' · Hybridlog');
        const md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', thema.seo_description || thema.lead || '');

        const active = { thema: thema, gebiet: gebiet };
        const blocks = buildBlocks(thema);

        main.innerHTML = '<div class="thema-shell">' +
            buildNav(gebiete, themen, active) +
            '<div class="thema-main">' + buildHead(thema, gebiet) + blocks.html + '</div>' +
            buildRail(thema, themen, gebiete, blocks.toc) +
            '</div>';

        buildCrumbs(thema, gebiet);
        wireRail();
    }

    function renderError(main, message) {
        if (!main) return;
        main.innerHTML = '<div class="wrap" style="padding:60px 0"><p class="muted">' + esc(message) + '</p></div>';
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
