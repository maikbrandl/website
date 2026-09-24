/**
 * Hybridlog Plattform – gemeinsamer Block-Baukasten für "Wissensbeitrag"-artige
 * Inhalte (kurz_erklaert/icon_fakten/prozess/liste/faq/... -> gerenderte Karten
 * + TOC/Scroll-Fortschritt). Ausgelagert aus mental/thema.js, damit sowohl
 * echte Themen (thema.html?slug=...) als auch die Wissensraum-Startseite
 * (index.html + js/start.js) denselben Renderer nutzen, statt ihn zu duplizieren.
 */
(function () {
    'use strict';

    const D = window.HLData;
    const base = window.PLATFORM_BASE || '../';

    // Amazon-Partner-Tag an EINER Stelle, fuer den empfehlung-Block (5.9 Masterplan).
    const AFFILIATE_TAG = 'hybridlog-21';
    function amazonLink(asin) {
        return 'https://www.amazon.de/dp/' + encodeURIComponent(asin) + '?tag=' + AFFILIATE_TAG;
    }

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

    // ---------------------------------------------------------------------
    // Icons. Ein festes, kleines Set, passend zu den Decap-Select-Optionen
    // der Bloecke icon_fakten/prozess.
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

    const DEFAULT_TITLES = {
        kurz_erklaert: 'Kurz erklärt', icon_fakten: 'Auf einen Blick', prozess: 'So funktioniert das',
        textabschnitt: 'Richtext', beispiel: 'Beispiel aus dem Alltag', liste: 'Wichtig zu wissen',
        evidenz: 'Grenzen & Evidenz', zitat: 'Zitat', bild: 'Bild', faq: 'Häufig gefragt',
        tool_einbindung: 'Zum Ausprobieren', empfehlung: 'Empfehlung',
    };
    function secTitle(b) {
        return (b.titel_override && String(b.titel_override).trim()) || DEFAULT_TITLES[b.type] || 'Abschnitt';
    }

    // ---------------------------------------------------------------------
    // Bekannte Tools (bestehende, statische Inhalte, kein Decap dafuer noetig)
    // ---------------------------------------------------------------------
    function toolBySlug(slug) {
        return (D.INHALTE || []).find(function (i) { return i.type === 'tool' && i.slug === slug; }) || null;
    }

    // ---------------------------------------------------------------------
    // BlockRenderer: ein Renderer je Typ, alle liefern nur den Karteninhalt,
    // Titel kommt einheitlich aus wrapSection().
    // ---------------------------------------------------------------------
    function renderBlockBody(b, ctx) {
        switch (b.type) {
            case 'kurz_erklaert':
                return '<div class="thema-copy">' + mdParagraphs(b.text) + '</div>';
            case 'icon_fakten':
                return '<div class="thema-icon-fakten">' + (b.fakten || []).map(function (f) {
                    return '<div class="thema-fakt">' + icon(f.icon) + '<span>' + esc(f.text) + '</span></div>';
                }).join('') + '</div>';
            case 'prozess':
                return '<div class="thema-prozess">' + (b.schritte || []).map(function (s) {
                    return '<div class="thema-prozess-step">' +
                        '<div class="thema-prozess-text"><h5>' + esc(s.titel) + '</h5><p>' + esc(s.untertitel) + '</p></div></div>';
                }).join('') + '</div>';
            case 'textabschnitt':
                return '<div class="thema-copy">' + mdParagraphs(b.text) + '</div>';
            case 'beispiel':
                return '<div class="thema-beispiel"><blockquote>' + esc(b.text) + '</blockquote>' +
                    (b.ergebnis ? '<p class="tb-ergebnis">Ergebnis: ' + esc(b.ergebnis) + '</p>' : '') + '</div>';
            case 'liste':
                return '<ul class="thema-liste">' + (b.punkte || []).map(function (p) {
                    return '<li><span class="thema-dot" aria-hidden="true"></span><span>' + esc(p) + '</span></li>';
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
                return '<div class="thema-tool-inline">' +
                    '<h5>' + esc(tool.title) + '</h5><p>' + esc(tool.teaser) + '</p>' +
                    '<a class="thema-link-gold" href="' + href(tool.href) + '">Tool öffnen →</a></div>';
            }
            case 'bild':
                return '<figure class="thema-bild"><img src="' + esc(b.bild) + '" alt="' + esc(b.alt || '') + '" loading="lazy">' +
                    (b.bildunterschrift ? '<figcaption>' + esc(b.bildunterschrift) + '</figcaption>' : '') + '</figure>';
            case 'empfehlung': {
                const isBuch = b.typ === 'Buch';
                const link = b.asin ? amazonLink(b.asin) : '';
                return '<div class="thema-empfehlung">' +
                    (isBuch ? '<span class="ad-badge">Anzeige</span>' : '') +
                    '<h5>' + esc(b.titel) + '</h5>' +
                    (b.autor ? '<p class="muted" style="font-size:.82rem">' + esc(b.autor) + '</p>' : '') +
                    (b.warum ? '<p>' + esc(b.warum) + '</p>' : '') +
                    (link ? '<a class="thema-link-gold" href="' + esc(link) + '" target="_blank" rel="sponsored noopener" data-track="affiliate-klick">Ansehen →</a>' : '') +
                    (isBuch && link ? '<p class="muted" style="font-size:.72rem;margin-top:6px">*Werbelink. Als Amazon-Partner verdienen wir an qualifizierten Käufen.</p>' : '') +
                    '</div>';
            }
            default:
                return '';
        }
    }

    function wrapSection(b, num, id) {
        return '<section class="thema-sec" id="' + id + '">' +
            '<p class="thema-sec-label">' + esc(secTitle(b)) + '</p>' +
            renderBlockBody(b, { toolBySlug: toolBySlug }) +
            '</section>';
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
    // TOC-Scrollspy + Scroll-Fortschritt + optionaler "Fortschritt speichern"
    // Button, generisch: liest nur DOM-Klassen/Attribute, kein Thema-Wissen noetig.
    // ---------------------------------------------------------------------
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

    window.HLBlocks = { buildBlocks: buildBlocks, wireRail: wireRail, icon: icon, esc: esc, href: href, toolBySlug: toolBySlug };
})();
