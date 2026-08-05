/* ============================================================
   Atlas der Philosophie – App-Logik (Einsteiger-Version)
   Zwei Ordnungen: „Nach Zeit" (Epochen) und „Nach Themengebiet"
   (Teildisziplinen). Aufklappbare Abschnitte, anklickbare Karten,
   Detail-Panel. Kein Canvas, kein Build-Step.
   ============================================================ */

(function () {
    'use strict';

    var D = window.PHILO;
    if (!D) return;

    /* ── Lookups ── */
    var thinkerById = {};
    D.thinkers.forEach(function (t) { thinkerById[t.id] = t; });
    var traditionById = {};
    D.traditions.forEach(function (t) { traditionById[t.id] = t; });
    var stroemungById = {};
    D.stroemungen.forEach(function (s) { stroemungById[s.id] = s; });
    var disziplinById = {};
    D.disziplinen.forEach(function (d) { disziplinById[d.id] = d; });
    var epochById = {};
    D.epochs.forEach(function (e) { epochById[e.id] = e; });

    /* ── Einsteiger-Einleitungen (einfache Alltagssprache) ── */
    var epochIntro = {
        antike: 'Am Anfang steht eine einfache Frage: Woraus besteht die Welt – und wie soll man leben? Fast gleichzeitig entstehen in Griechenland, Indien und China die ersten großen Denkgebäude.',
        mittelalter: 'Über tausend Jahre lang denkt die Philosophie vor allem im Rahmen der großen Religionen. Es geht um Gott, um die Vernunft und um die Frage, wie beides zusammenpasst.',
        renaissance: 'Der Mensch rückt in den Mittelpunkt. Alte Texte werden wiederentdeckt, das Denken wird weltlicher – der Übergang in die Moderne beginnt.',
        neuzeit: 'Woher kommt sicheres Wissen – aus dem reinen Denken oder aus der Erfahrung? Zwei Lager entstehen, und die Aufklärung stellt Vernunft und Freiheit über alles.',
        idealismus: 'Nach Kant folgen große Gedankengebäude und ebenso große Gegenbewegungen: Geschichte, Wille, Wirtschaft und der Zweifel am Fortschritt prägen das 19. Jahrhundert.',
        moderne: 'Die Philosophie teilt sich grob in zwei Richtungen: Die eine sucht Klarheit durch Sprache und Logik, die andere fragt nach Existenz, Sinn und Macht.'
    };
    var UNDATED_INTRO = 'Nicht jedes Denken lässt sich an einem Datum festmachen. Manche Traditionen wurden über Generationen mündlich weitergegeben.';

    var disziplinIntro = {
        metaphysik: 'Die großen Grundfragen: Was gibt es überhaupt? Was sind Zeit, Ursache, Seele oder Gott – und was heißt es eigentlich, dass etwas „wirklich" ist?',
        epistemologie: 'Was können wir wissen – und woher wissen wir, dass wir es wirklich wissen? Es geht um Wahrheit, Beweis und die Grenzen der Erkenntnis.',
        logik: 'Die Kunst des sauberen Schließens: Wann folgt ein Gedanke zwingend aus einem anderen? Logik prüft Argumente – unabhängig vom Thema.',
        ethik: 'Wie soll ich handeln, was ist gut? Von der Tugend über die Pflicht bis zum größten Nutzen – die Frage nach dem richtigen Leben.',
        politik: 'Wie wollen wir zusammenleben? Es geht um Gerechtigkeit, Freiheit, Macht und die Frage, was eine Herrschaft überhaupt legitim macht.',
        aesthetik: 'Was ist Kunst, was ist schön? Gibt es guten Geschmack – oder liegt Schönheit allein im Auge des Betrachters?',
        sprache: 'Wie hängen Wörter, Gedanken und Wirklichkeit zusammen? Und was bedeutet „Bedeutung" eigentlich?',
        wissenschaft: 'Was macht Wissenschaft zur Wissenschaft? Wie entstehen Theorien – und wann gilt etwas als widerlegt?',
        geist: 'Was ist Bewusstsein, und wie hängt es mit dem Gehirn zusammen? Könnte eine Maschine jemals wirklich denken?'
    };

    /* ── State ── */
    var state = {
        mode: 'epoche',   // 'epoche' | 'disziplin'
        search: '',
        tradition: ''
    };
    var openIds = {};                 // { sectionId: true }
    var currentSectionIds = [];       // section ids of the currently rendered view
    var pendingScrollId = null;

    /* ── DOM refs ── */
    var $ = function (id) { return document.getElementById(id); };
    var views = { epoche: $('view-epoche'), disziplin: $('view-disziplin') };
    var hosts = { epoche: $('epocheHost'), disziplin: $('disziplinHost') };
    var panel = $('detailPanel');
    var overlay = $('panelOverlay');

    /* ── Fortschritt (localStorage): gelesene Denker ── */
    var PROGRESS_KEY = 'philo-progress-v1';
    var progress = (function () {
        try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch (e) { return {}; }
    })();
    function isRead(id) { return !!progress[id]; }
    function saveProgress() {
        try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* z.B. Privatmodus ohne Storage */ }
    }
    function setRead(id, val) {
        if (val) progress[id] = true; else delete progress[id];
        saveProgress();
        updateProgressCounter();
        var card = document.querySelector('.thinker-card[data-id="' + id + '"]');
        if (card) card.classList.toggle('thinker-card--read', val);
    }
    function updateProgressCounter() {
        var el = $('progressCount');
        if (!el) return;
        var count = Object.keys(progress).length;
        el.textContent = count + ' von ' + D.thinkers.length + ' entdeckt';
    }

    /* ── Helpers ── */
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function excerpt(text, n) {
        if (text.length <= n) return text;
        return text.slice(0, n).replace(/\s+\S*$/, '') + '…';
    }

    function yearBadge(t) {
        if (t.year === null || t.year === undefined) return 'überliefert';
        if (t.year < 0) return 'um ' + Math.abs(t.year) + ' v. Chr.';
        return 'ab ' + t.year;
    }

    function matchesGlobal(t) {
        if (state.tradition && t.tradition !== state.tradition) return false;
        if (state.search) {
            var q = state.search.toLowerCase();
            var hay = (t.name + ' ' + t.meta + ' ' + t.desc + ' ' + (t.quote || '')).toLowerCase();
            (t.str || []).forEach(function (s) { if (stroemungById[s]) hay += ' ' + stroemungById[s].label.toLowerCase(); });
            (t.dis || []).forEach(function (d) { if (disziplinById[d]) hay += ' ' + disziplinById[d].label.toLowerCase(); });
            if (hay.indexOf(q) === -1) return false;
        }
        return true;
    }

    function matchesStroemung(s) {
        if (!state.search) return true;
        var q = state.search.toLowerCase();
        var hay = (s.label + ' ' + s.core).toLowerCase();
        (s.reps || []).forEach(function (rid) { if (thinkerById[rid]) hay += ' ' + thinkerById[rid].name.toLowerCase(); });
        return hay.indexOf(q) !== -1;
    }

    function isOpen(id) { return !!state.search || openIds[id] === true; }

    /* ── Denker-Karte ── */
    function cardHTML(t) {
        var trad = traditionById[t.tradition];
        return '<button class="thinker-card' + (isRead(t.id) ? ' thinker-card--read' : '') + '" data-id="' + t.id + '" style="--tc:' + trad.color + '">' +
            (t.entry ? '<span class="thinker-card__badge" title="Guter Einstieg für Einsteiger">★ Guter Einstieg</span>' : '') +
            '<span class="thinker-card__check" aria-hidden="true" title="Gelesen">✓</span>' +
            '<span class="thinker-card__top">' +
            '<span class="thinker-card__year">' + yearBadge(t) + '</span>' +
            '<span class="thinker-card__trad"><span class="legend-dot" style="background:' + trad.color + '"></span>' + trad.label + '</span>' +
            '</span>' +
            '<span class="thinker-card__name">' + esc(t.name) + '</span>' +
            '<span class="thinker-card__meta">' + esc(t.meta) + '</span>' +
            '<span class="thinker-card__excerpt">' + esc(excerpt(t.desc, 140)) + '</span>' +
            '</button>';
    }

    /* ── Ein Akkordeon-Abschnitt ── */
    function accordionHTML(id, title, sub, count, bodyInner, teaser) {
        var open = isOpen(id);
        return '<section class="accordion' + (open ? ' accordion--open' : '') + '" data-acc="' + id + '">' +
            '<button class="accordion__head" aria-expanded="' + open + '">' +
            '<span class="accordion__bar"></span>' +
            '<span class="accordion__headtext">' +
            '<span class="accordion__title">' + esc(title) + '</span>' +
            (sub ? '<span class="accordion__sub">' + esc(sub) + '</span>' : '') +
            (teaser ? '<span class="accordion__teaser">' + esc(teaser) + '</span>' : '') +
            '</span>' +
            '<span class="accordion__count">' + count + '</span>' +
            '<svg class="accordion__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<div class="accordion__body">' + bodyInner + '</div>' +
            '</section>';
    }

    /* ══════════════════════════════════════════════
       ANSICHT 1 · NACH ZEIT
    ══════════════════════════════════════════════ */
    function renderEpoche() {
        var host = hosts.epoche;
        var ids = [];
        var html = '';
        var anyResults = false;

        D.epochs.forEach(function (ep) {
            var inEp = D.thinkers.filter(function (t) { return t.epoch === ep.id && matchesGlobal(t); });
            if (!inEp.length) return;
            anyResults = true;
            inEp.sort(function (a, b) { return (a.year || 0) - (b.year || 0); });
            var id = 'acc-ep-' + ep.id;
            ids.push(id);
            var body = '<p class="accordion__intro">' + epochIntro[ep.id] + '</p>' +
                '<div class="card-grid">' + inEp.map(cardHTML).join('') + '</div>';
            html += accordionHTML(id, ep.label, ep.short, inEp.length + (inEp.length === 1 ? ' Denker' : ' Denker'), body, excerpt(epochIntro[ep.id], 90));
        });

        // Undatierte / mündlich überlieferte
        var undated = D.thinkers.filter(function (t) {
            return (t.epoch === null || t.epoch === undefined || !epochById[t.epoch]) && matchesGlobal(t);
        });
        if (undated.length) {
            anyResults = true;
            var uid = 'acc-ep-undatiert';
            ids.push(uid);
            var ubody = '<p class="accordion__intro">' + UNDATED_INTRO + '</p>' +
                '<div class="card-grid">' + undated.map(cardHTML).join('') + '</div>';
            html += accordionHTML(uid, 'Zeitübergreifend & mündlich überliefert', 'ohne feste Datierung', undated.length + ' Denker', ubody, excerpt(UNDATED_INTRO, 90));
        }

        if (!anyResults) html += emptyState();
        host.innerHTML = html;
        currentSectionIds = ids;
    }

    /* ══════════════════════════════════════════════
       ANSICHT 2 · NACH THEMENGEBIET
    ══════════════════════════════════════════════ */
    function renderDisziplin() {
        var host = hosts.disziplin;
        var ids = [];
        var html = '';
        var anyResults = false;

        D.disziplinen.forEach(function (d) {
            var inDis = D.thinkers.filter(function (t) { return (t.dis || []).indexOf(d.id) !== -1 && matchesGlobal(t); });
            if (!inDis.length) return;
            anyResults = true;
            inDis.sort(function (a, b) { return (a.year || 0) - (b.year || 0); });
            var id = 'acc-dis-' + d.id;
            ids.push(id);
            var body = '<p class="accordion__intro">' + disziplinIntro[d.id] + '</p>' +
                '<div class="card-grid">' + inDis.map(cardHTML).join('') + '</div>';
            html += accordionHTML(id, d.label, null, inDis.length + ' Denker', body, excerpt(disziplinIntro[d.id], 90));
        });

        // Denkrichtungen / „-ismen" (immer anklickbar)
        var strBody = '';
        var strCount = 0;
        D.stroemungGroups.forEach(function (grp) {
            var inGrp = D.stroemungen.filter(function (s) { return s.group === grp.id && matchesStroemung(s); });
            if (!inGrp.length) return;
            strBody += '<h4 class="stroemung-group__title">' + grp.label + '</h4>';
            strBody += '<div class="stroemung-grid">' + inGrp.map(stroemungCardHTML).join('') + '</div>';
            strCount += inGrp.length;
        });
        if (strCount) {
            anyResults = true;
            var sid = 'acc-denkrichtungen';
            ids.push(sid);
            var introTxt = 'Die großen „-ismen" der Philosophie: benannte Denkrichtungen, die viele einzelne Denker verbinden. Klicke eine an, um zu sehen, worum es geht und wer dazugehört.';
            var body = '<p class="accordion__intro">' + introTxt + '</p>' + strBody;
            html += accordionHTML(sid, 'Denkrichtungen & „-ismen"', 'die benannten Strömungen', strCount + ' Strömungen', body, excerpt(introTxt, 90));
        }

        if (!anyResults) html += emptyState();
        host.innerHTML = html;
        currentSectionIds = ids;
    }

    function stroemungCardHTML(s) {
        var reps = (s.reps || []).map(function (rid) {
            var rt = thinkerById[rid];
            return rt ? '<span class="rep-tag">' + esc(rt.name) + '</span>' : '';
        }).join('');
        return '<button class="stroemung-card" data-str="' + s.id + '">' +
            '<div class="stroemung-card__title">' + esc(s.label) + '</div>' +
            '<div class="stroemung-card__core">' + esc(s.core) + '</div>' +
            (reps ? '<div class="stroemung-card__reps-label">Hauptvertreter</div><div class="rep-tags">' + reps + '</div>' : '') +
            '</button>';
    }

    function emptyState() {
        return '<div class="empty-state">Nichts gefunden. Versuch einen anderen Suchbegriff oder klick auf „Zurücksetzen".</div>';
    }

    /* ── Event-Delegation je Host ── */
    function hostClick(e) {
        var head = e.target.closest('.accordion__head');
        if (head) {
            var acc = head.closest('.accordion');
            var id = acc.getAttribute('data-acc');
            var willOpen = !acc.classList.contains('accordion--open');
            acc.classList.toggle('accordion--open', willOpen);
            head.setAttribute('aria-expanded', willOpen);
            if (!state.search) openIds[id] = willOpen;
            updateExpandBtn();
            return;
        }
        var card = e.target.closest('.thinker-card');
        if (card) { openDetail(card.getAttribute('data-id')); return; }
        var str = e.target.closest('.stroemung-card');
        if (str) { openStroemung(str.getAttribute('data-str')); return; }
    }

    /* ══════════════════════════════════════════════
       DETAIL-PANEL
    ══════════════════════════════════════════════ */
    function panelShell(inner) {
        panel.innerHTML = inner;
        panel.classList.add('detail-panel--on');
        overlay.classList.add('panel-overlay--on');
        var close = $('panelClose');
        if (close) close.addEventListener('click', closeDetail);
    }

    function closeBtnHTML() {
        return '<button class="detail-panel__close" id="panelClose" aria-label="Schließen">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>';
    }

    /* Kompakter Amazon-Affiliate-Buchlink für die Aktionszeile, siehe data.js (Feld "book") für das Format */
    function bookActionHTML(book) {
        if (!book || !book.url) return '';
        return '<a class="book-action" href="' + esc(book.url) + '" target="_blank" rel="nofollow sponsored noopener">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' +
            '<span>Wichtigstes Buch ansehen</span>' +
        '</a>';
    }

    /* Optionaler Blogartikel-Link, siehe data.js (Feld "blogUrl") */
    function blogLinkHTML(url) {
        if (!url) return '';
        return '<div class="detail-panel__section blog-rec">' +
            '<h4>Mehr dazu im Blog</h4>' +
            '<a class="blog-rec__link" href="' + esc(url) + '">Zum Blogartikel <span aria-hidden="true">→</span></a>' +
        '</div>';
    }

    /* Escaped Text mit antippbaren Fachbegriffen: [[glossarKey:Anzeigetext]] -> Popover-Button, siehe data.js (Feld "glossar") */
    function withGlossary(str) {
        return esc(str).replace(/\[\[([\w-]+):([^\]]+)\]\]/g, function (m, key, label) {
            var explain = D.glossar && D.glossar[key];
            return '<span class="term-wrap"><button type="button" class="term" data-term="' + key + '" aria-expanded="false">' + label + '</button>' +
                (explain ? '<span class="term-pop" role="note" hidden>' + esc(explain) + '</span>' : '') +
                '</span>';
        });
    }

    /* Zitat-Block: neues Feld t.zitat={text,quelle} bevorzugt, sonst altes einfaches t.quote als Fallback */
    function quoteHTML(t) {
        if (t.zitat && t.zitat.text) {
            return '<blockquote class="detail-quote">„' + esc(t.zitat.text.replace(/^„|"$/g, '')) + '"' +
                (t.zitat.quelle ? '<footer class="detail-quote__source">' + esc(t.zitat.quelle) + '</footer>' : '') +
                '</blockquote>';
        }
        if (t.quote) return '<blockquote class="detail-quote">„' + esc(t.quote.replace(/^„|"$/g, '')) + '"</blockquote>';
        return '';
    }

    /* Kompakte Metadaten-Leiste (2-Spalten-Raster), ersetzt die frühere Reihe einzelner Blöcke */
    function metaGridHTML(epochChip, strChips, disChips, hauptvertreter) {
        var rows = '';
        if (epochChip) rows += '<div class="detail-meta-row"><span class="detail-meta-label">Epoche</span><span class="detail-meta-value tag-row">' + epochChip + '</span></div>';
        if (strChips) rows += '<div class="detail-meta-row"><span class="detail-meta-label">Denkrichtungen</span><span class="detail-meta-value tag-row">' + strChips + '</span></div>';
        if (disChips) rows += '<div class="detail-meta-row"><span class="detail-meta-label">Themengebiete</span><span class="detail-meta-value tag-row">' + disChips + '</span></div>';
        if (hauptvertreter) rows += '<div class="detail-meta-row"><span class="detail-meta-label">Hauptvertreter</span><span class="detail-meta-value">' + esc(hauptvertreter) + '</span></div>';
        return rows ? '<div class="detail-meta-grid">' + rows + '</div>' : '';
    }

    function openDetail(id) {
        var t = thinkerById[id];
        if (!t) return;
        var trad = traditionById[t.tradition];

        var epochChip = (t.epoch && epochById[t.epoch])
            ? '<button class="chip" data-epoch="' + t.epoch + '">' + epochById[t.epoch].label + '</button>' : '';
        var strChips = (t.str || []).map(function (s) {
            var st = stroemungById[s];
            return st ? '<button class="chip" data-str="' + s + '">' + esc(st.label) + '</button>' : '';
        }).join('');
        var disChips = (t.dis || []).map(function (d) {
            var dd = disziplinById[d];
            return dd ? '<button class="chip" data-dis="' + d + '">' + esc(dd.label) + '</button>' : '';
        }).join('');

        var html = '<div class="detail-panel__head">' + closeBtnHTML() +
            '<span class="detail-panel__tradition"><span class="legend-dot" style="background:' + trad.color + '"></span>' + trad.label +
            (t.entry ? '<span class="thinker-card__badge detail-panel__badge">★ Guter Einstieg</span>' : '') +
            '</span>' +
            '<h2 class="detail-panel__name">' + esc(t.name) + '</h2>' +
            '<p class="detail-panel__meta">' + esc(t.meta) + '</p>' +
            '</div><div class="detail-panel__body">';

        html += '<div class="detail-actions">';
        html += '<button class="read-toggle' + (isRead(id) ? ' read-toggle--on' : '') + '" id="readToggle" type="button" aria-pressed="' + isRead(id) + '">' +
            '<span class="read-toggle__icon" aria-hidden="true">✓</span>' +
            '<span class="read-toggle__label">' + (isRead(id) ? 'Gelesen' : 'Als gelesen markieren') + '</span>' +
            '</button>';
        if (t.book) html += bookActionHTML(t.book);
        html += '</div>';
        if (t.book) html += '<p class="detail-actions__disclosure">Affiliate-Link. Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.</p>';

        if (t.kernidee) {
            // Neue, strukturierte Denker-Karte (Ziel: Kernidee/Worum es geht/Warum wichtig/Kritik)
            html += '<div class="detail-panel__section"><h4>Kernidee</h4><p class="detail-text">' + withGlossary(t.kernidee) + '</p></div>';
            if (t.inhalt) html += '<div class="detail-panel__section"><h4>Worum es geht</h4><p class="detail-text">' + withGlossary(t.inhalt) + '</p></div>';
            if (t.wirkung) html += '<div class="detail-panel__section"><h4>Warum wichtig</h4><p class="detail-text">' + withGlossary(t.wirkung) + '</p></div>';
            if (t.kritik) html += '<div class="detail-panel__section"><h4>Kritik</h4><p class="detail-text">' + withGlossary(t.kritik) + '</p></div>';
        } else {
            // Ältere Einträge ohne Kernidee/Inhalt/Wirkung/Kritik: Fallback auf den bisherigen Fließtext
            html += '<div class="detail-panel__section"><h4>Kernidee</h4><p class="detail-text">' + esc(t.desc) + '</p></div>';
        }
        html += quoteHTML(t);
        html += metaGridHTML(epochChip, strChips, disChips, t.hauptvertreter);
        if (t.blogUrl) html += blogLinkHTML(t.blogUrl);
        html += '</div>';

        panelShell(html);
        setHash(id);

        var readBtn = $('readToggle');
        readBtn.addEventListener('click', function () {
            var on = !readBtn.classList.contains('read-toggle--on');
            readBtn.classList.toggle('read-toggle--on', on);
            readBtn.setAttribute('aria-pressed', on);
            readBtn.querySelector('.read-toggle__label').textContent = on ? 'Gelesen' : 'Als gelesen markieren';
            setRead(id, on);
        });

        panel.querySelectorAll('[data-str]').forEach(function (el) {
            el.addEventListener('click', function () { openStroemung(el.getAttribute('data-str')); });
        });
        panel.querySelectorAll('[data-dis]').forEach(function (el) {
            el.addEventListener('click', function () { jumpToSection('disziplin', 'acc-dis-' + el.getAttribute('data-dis')); });
        });
        panel.querySelectorAll('[data-epoch]').forEach(function (el) {
            el.addEventListener('click', function () { jumpToSection('epoche', 'acc-ep-' + el.getAttribute('data-epoch')); });
        });
        panel.querySelectorAll('.term').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var pop = btn.nextElementSibling;
                var willOpen = pop && pop.hasAttribute('hidden');
                panel.querySelectorAll('.term-pop').forEach(function (p) { p.setAttribute('hidden', ''); });
                panel.querySelectorAll('.term[aria-expanded="true"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
                if (pop && willOpen) { pop.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }
            });
        });
    }

    function openStroemung(id) {
        var s = stroemungById[id];
        if (!s) return;
        var grp = D.stroemungGroups.filter(function (g) { return g.id === s.group; })[0];

        var repChips = (s.reps || []).map(function (rid) {
            var rt = thinkerById[rid];
            return rt ? '<button class="chip" data-id="' + rid + '">' + esc(rt.name) + '</button>' : '';
        }).join('');

        var html = '<div class="detail-panel__head">' + closeBtnHTML() +
            '<span class="detail-panel__tradition"><span class="legend-dot" style="background:var(--gold)"></span>Denkrichtung' + (grp ? ' · ' + esc(grp.label) : '') + '</span>' +
            '<h2 class="detail-panel__name">' + esc(s.label) + '</h2>' +
            '</div><div class="detail-panel__body">' +
            '<p class="detail-text">' + esc(s.core) + '</p>';
        if (repChips) html += '<div class="detail-panel__section"><h4>Hauptvertreter</h4><div class="tag-row">' + repChips + '</div></div>';
        html += '</div>';

        panelShell(html);
        setHash(id);
        panel.querySelectorAll('[data-id]').forEach(function (el) {
            el.addEventListener('click', function () { openDetail(el.getAttribute('data-id')); });
        });
    }

    function closeDetail() {
        panel.classList.remove('detail-panel--on');
        overlay.classList.remove('panel-overlay--on');
        clearHash();
    }
    overlay.addEventListener('click', closeDetail);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDetail(); });

    /* ── Zu einem Abschnitt springen (aus dem Detail-Panel) ── */
    function jumpToSection(mode, sectionId) {
        closeDetail();
        openIds[sectionId] = true;
        pendingScrollId = sectionId;
        setMode(mode);
    }

    /* ── Direktlinks: #<denker-id> oder #<stroemung-id> (z.B. aus Blogartikeln) ──
       Setzt die URL per replaceState (kein hashchange-Loop), Klick auf X/Escape räumt sie wieder auf. */
    var hashLock = false;
    function setHash(id) {
        if (hashLock) return;
        history.replaceState(null, '', '#' + id);
    }
    function clearHash() {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    }
    function openFromHash() {
        var id = decodeURIComponent(location.hash.slice(1));
        if (!id) return false;
        hashLock = true;
        if (thinkerById[id]) {
            var t = thinkerById[id];
            var sectionId = (t.epoch && epochById[t.epoch]) ? 'acc-ep-' + t.epoch : 'acc-ep-undatiert';
            openIds[sectionId] = true;
            pendingScrollId = sectionId;
            setMode('epoche');
            openDetail(id);
        } else if (stroemungById[id]) {
            openIds['acc-denkrichtungen'] = true;
            pendingScrollId = 'acc-denkrichtungen';
            setMode('disziplin');
            openStroemung(id);
        } else {
            hashLock = false;
            return false;
        }
        hashLock = false;
        return true;
    }

    /* ══════════════════════════════════════════════
       MODUS / RENDER / STEUERUNG
    ══════════════════════════════════════════════ */
    function renderCurrent() {
        if (state.mode === 'epoche') renderEpoche(); else renderDisziplin();
        updateCount();
        updateExpandBtn();
        if (pendingScrollId) {
            var acc = document.querySelector('[data-acc="' + pendingScrollId + '"]');
            pendingScrollId = null;
            if (acc) { acc.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        }
    }

    function setMode(mode) {
        state.mode = mode;
        views.epoche.classList.toggle('view--active', mode === 'epoche');
        views.disziplin.classList.toggle('view--active', mode === 'disziplin');
        [$('modeEpoche'), $('modeDisziplin')].forEach(function (btn) {
            var on = btn.getAttribute('data-mode') === mode;
            btn.classList.toggle('mode-btn--active', on);
            btn.setAttribute('aria-selected', on);
        });
        renderCurrent();
    }

    function updateCount() {
        var total = D.thinkers.length;
        var matched = D.thinkers.filter(matchesGlobal).length;
        var el = $('resultCount');
        if (!el) return;
        if (state.search || state.tradition) {
            el.textContent = matched + ' von ' + total + ' Denkern' + (state.search ? ' passen zur Suche' : ' in dieser Region');
        } else {
            el.textContent = total + ' Denker · ' + D.epochs.length + ' Epochen · ' + D.disziplinen.length + ' Themengebiete · ' + D.stroemungen.length + ' Denkrichtungen';
        }
    }

    function allSectionsOpen() {
        if (!currentSectionIds.length) return false;
        return currentSectionIds.every(isOpen);
    }
    function updateExpandBtn() {
        var btn = $('btnExpand');
        btn.textContent = allSectionsOpen() ? 'Alle zuklappen' : 'Alle aufklappen';
    }

    /* ── Steuerung verdrahten ── */
    function populateSelects() {
        var sel = $('filterTradition');
        D.traditions.forEach(function (tr) {
            var o = document.createElement('option');
            o.value = tr.id; o.textContent = tr.label;
            sel.appendChild(o);
        });
    }

    function wireControls() {
        $('modeEpoche').addEventListener('click', function () { if (state.mode !== 'epoche') setMode('epoche'); });
        $('modeDisziplin').addEventListener('click', function () { if (state.mode !== 'disziplin') setMode('disziplin'); });

        var timer = null;
        var searchInput = $('searchInput');
        var searchClear = $('searchClear');
        searchInput.addEventListener('input', function (e) {
            clearTimeout(timer);
            var v = e.target.value.trim();
            searchClear.hidden = !v;
            timer = setTimeout(function () { state.search = v; renderCurrent(); }, 120);
        });
        searchClear.addEventListener('click', function () {
            searchInput.value = '';
            searchClear.hidden = true;
            state.search = '';
            searchInput.focus();
            renderCurrent();
        });

        $('filterTradition').addEventListener('change', function (e) {
            state.tradition = e.target.value;
            renderCurrent();
        });

        $('btnExpand').addEventListener('click', function () {
            if (state.search) return; // bei aktiver Suche sind ohnehin alle offen
            if (allSectionsOpen()) {
                currentSectionIds.forEach(function (id) { openIds[id] = false; });
            } else {
                currentSectionIds.forEach(function (id) { openIds[id] = true; });
            }
            renderCurrent();
        });

        $('btnReset').addEventListener('click', function () {
            state.search = ''; state.tradition = '';
            $('searchInput').value = ''; $('filterTradition').value = '';
            $('searchClear').hidden = true;
            openIds = {};
            setDefaultOpen();
            renderCurrent();
        });
    }

    function setDefaultOpen() {
        // erste Sektion jeder Ansicht standardmäßig offen
        openIds['acc-ep-' + D.epochs[0].id] = true;
        openIds['acc-dis-' + D.disziplinen[0].id] = true;
    }

    /* ── Init ── */
    function init() {
        populateSelects();
        wireControls();
        hosts.epoche.addEventListener('click', hostClick);
        hosts.disziplin.addEventListener('click', hostClick);
        setDefaultOpen();
        updateProgressCounter();
        if (!openFromHash()) setMode('epoche');
        window.addEventListener('hashchange', function () { openFromHash(); });
    }

    init();
})();
