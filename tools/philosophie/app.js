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

    /* ── Legende (Farb-Orientierung der Regionen) ── */
    function legendHTML() {
        var items = D.traditions.map(function (tr) {
            return '<span class="legend-item"><span class="legend-dot" style="background:' + tr.color + '"></span>' + tr.label + '</span>';
        }).join('');
        return '<div class="tradition-legend">' + items + '</div>';
    }

    /* ── Denker-Karte ── */
    function cardHTML(t) {
        var trad = traditionById[t.tradition];
        return '<button class="thinker-card" data-id="' + t.id + '" style="--tc:' + trad.color + '">' +
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
    function accordionHTML(id, title, sub, count, bodyInner) {
        var open = isOpen(id);
        return '<section class="accordion' + (open ? ' accordion--open' : '') + '" data-acc="' + id + '">' +
            '<button class="accordion__head" aria-expanded="' + open + '">' +
            '<span class="accordion__bar"></span>' +
            '<span class="accordion__headtext">' +
            '<span class="accordion__title">' + esc(title) + '</span>' +
            (sub ? '<span class="accordion__sub">' + esc(sub) + '</span>' : '') +
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
        var html = legendHTML();
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
            html += accordionHTML(id, ep.label, ep.short, inEp.length + (inEp.length === 1 ? ' Denker' : ' Denker'), body);
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
            html += accordionHTML(uid, 'Zeitübergreifend & mündlich überliefert', 'ohne feste Datierung', undated.length + ' Denker', ubody);
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
        var html = legendHTML();
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
            html += accordionHTML(id, d.label, null, inDis.length + ' Denker', body);
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
            html += accordionHTML(sid, 'Denkrichtungen & „-ismen"', 'die benannten Strömungen', strCount + ' Strömungen', body);
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
            '<span class="detail-panel__tradition"><span class="legend-dot" style="background:' + trad.color + '"></span>' + trad.label + '</span>' +
            '<h2 class="detail-panel__name">' + esc(t.name) + '</h2>' +
            '<p class="detail-panel__meta">' + esc(t.meta) + '</p>' +
            '</div><div class="detail-panel__body">';
        if (t.quote) html += '<blockquote class="detail-quote">„' + esc(t.quote.replace(/^„|"$/g, '')) + '"</blockquote>';
        html += '<p class="detail-text">' + esc(t.desc) + '</p>';
        if (epochChip) html += '<div class="detail-panel__section"><h4>Epoche</h4><div class="tag-row">' + epochChip + '</div></div>';
        if (strChips) html += '<div class="detail-panel__section"><h4>Denkrichtungen</h4><div class="tag-row">' + strChips + '</div></div>';
        if (disChips) html += '<div class="detail-panel__section"><h4>Themengebiete</h4><div class="tag-row">' + disChips + '</div></div>';
        html += '</div>';

        panelShell(html);

        panel.querySelectorAll('[data-str]').forEach(function (el) {
            el.addEventListener('click', function () { openStroemung(el.getAttribute('data-str')); });
        });
        panel.querySelectorAll('[data-dis]').forEach(function (el) {
            el.addEventListener('click', function () { jumpToSection('disziplin', 'acc-dis-' + el.getAttribute('data-dis')); });
        });
        panel.querySelectorAll('[data-epoch]').forEach(function (el) {
            el.addEventListener('click', function () { jumpToSection('epoche', 'acc-ep-' + el.getAttribute('data-epoch')); });
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
        panel.querySelectorAll('[data-id]').forEach(function (el) {
            el.addEventListener('click', function () { openDetail(el.getAttribute('data-id')); });
        });
    }

    function closeDetail() {
        panel.classList.remove('detail-panel--on');
        overlay.classList.remove('panel-overlay--on');
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
        $('searchInput').addEventListener('input', function (e) {
            clearTimeout(timer);
            var v = e.target.value.trim();
            timer = setTimeout(function () { state.search = v; renderCurrent(); }, 120);
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
        setMode('epoche');
    }

    init();
})();
