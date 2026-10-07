/**
 * HUMAN MAP v2 — Assessment controller
 * Renders the 57-screen bank (Terrain likert, eine Werte-Sortieraufgabe,
 * Bedürfnisse/Sinn/Prägung likert, drei Alltag-Szenarien), section
 * interstitials with a short observation sentence, saves progress, and on
 * finish stores the answers and redirects to result.html.
 * Answers are the single source of truth; result.html recomputes the pipeline.
 */
const AssessmentV2 = (() => {

    const SESSION_KEY = 'humanmap_v2_session';

    let currentIndex = 0;
    let answers = {};
    let isTransitioning = false;

    // Re-measure mode (?mode=remeasure) asks only the changeable layers and
    // reuses the cached stable terrain from the first full run.
    const params = new URLSearchParams(location.search);
    const remeasure = params.get('mode') === 'remeasure' && StoreV2.hasTerrain();
    const mode = remeasure ? 'remeasure' : 'full';

    const items = remeasure
        ? ModelV2.SCREEN_ITEMS.filter(it => it.section !== 'terrain')
        : ModelV2.SCREEN_ITEMS;
    const total = items.length;

    // Section id → interstitial accent (existing area tokens only).
    const SECTION_COLOR = {
        terrain:      'var(--area-denken)',
        werte:        'var(--area-antrieb)',
        beduerfnisse: 'var(--area-balance)',
        sinn:         'var(--area-wachstum)',
        praegung:     'var(--area-beziehungen)',
        alltag:       'var(--area-antrieb)',
    };
    const SECTION_ICON = {
        terrain: '◈', werte: '◉', beduerfnisse: '◇', sinn: '◆', praegung: '◎', alltag: '✦',
    };
    const sectionMeta = (id) => ModelV2.SECTIONS.find(s => s.id === id);

    let questionWrap, progressFill, progressLabel, progressPhase;
    let interstitial, intIcon, intTitle, intSub, intObs, intPhaseLbl, intFill, intNext;

    function init() {
        questionWrap  = document.getElementById('hm-question-wrap');
        progressFill  = document.getElementById('hm-progress-fill');
        progressLabel = document.getElementById('hm-progress-label');
        progressPhase = document.getElementById('hm-progress-phase');
        interstitial  = document.getElementById('hm-interstitial');
        intIcon       = document.getElementById('hm-int-icon');
        intTitle      = document.getElementById('hm-int-title');
        intSub        = document.getElementById('hm-int-sub');
        intObs        = document.getElementById('hm-int-obs');
        intPhaseLbl   = document.getElementById('hm-int-phase');
        intFill       = document.getElementById('hm-int-progress-fill');
        intNext       = document.getElementById('hm-int-next');

        const saved = loadSession();
        if (saved) {
            answers = saved.answers || {};
            currentIndex = Math.min(saved.currentIndex || 0, total - 1);
        }
        updateProgress();
        renderQuestion(currentIndex);
    }

    // ── persistence ──
    function saveSession() {
        try { localStorage.setItem(SESSION_KEY, JSON.stringify({ answers, currentIndex })); } catch (e) {}
    }
    function loadSession() {
        try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
    }
    function clearSession() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    }

    /** Whether a screen (any type) already has a recorded answer. */
    function isAnswered(q) {
        if (q.type === 'value-sort') return q.values.every(v => answers[v.id] != null);
        return answers[q.id] != null;
    }

    function updateProgress() {
        const answeredCount = items.filter(isAnswered).length;
        const pct = Math.round((answeredCount / total) * 100);
        if (progressFill)  progressFill.style.width = pct + '%';
        if (progressLabel) progressLabel.textContent = `${answeredCount}/${total}`;
        const it = items[currentIndex];
        if (progressPhase && it) {
            const meta = sectionMeta(it.section);
            progressPhase.textContent = meta ? meta.label : '';
        }
    }

    // ── question renderer ──
    function renderQuestion(index) {
        if (!questionWrap) return;
        const q = items[index];
        if (!q) return;

        const backBtn = index > 0
            ? `<button type="button" class="hm-question__back" aria-label="Vorherige Frage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>`
            : '';

        let body;
        if (q.type === 'value-sort')   body = renderValueSort();
        else if (q.type === 'choice')  body = renderChoice(q, answers[q.id]);
        else                           body = renderLikert(q, answers[q.id]);

        let html = `<div class="hm-question__card">
            <div class="hm-question__top">
                ${backBtn}
                <div class="hm-question__num">Schritt ${index + 1} von ${total}</div>
            </div>
            <div class="hm-question__text">${escHtml(q.text)}</div>
            ${body}
        </div>`;

        const div = document.createElement('div');
        div.className = 'hm-question';
        div.innerHTML = html;

        const existing = questionWrap.querySelector('.hm-question');
        if (existing) {
            existing.classList.add('is-leaving');
            setTimeout(() => {
                existing.remove();
                questionWrap.appendChild(div);
                attachEvents(div, q);
            }, 260);
        } else {
            questionWrap.appendChild(div);
            attachEvents(div, q);
        }
    }

    function renderLikert(q, existingAnswer) {
        let dots = '';
        for (let v = 1; v <= 7; v++) {
            const sel = existingAnswer == v ? ' is-selected' : '';
            dots += `<button class="hm-dot${sel}" data-val="${v}" aria-label="Wert ${v}">${v}</button>`;
        }
        const anchors = q.anchors || ['Trifft gar nicht zu', 'Trifft völlig zu'];
        return `
            <div class="hm-likert">
                <div class="hm-likert__anchors">
                    <span>${escHtml(anchors[0])}</span>
                    <span>${escHtml(anchors[1])}</span>
                </div>
                <div class="hm-likert__dots">${dots}</div>
            </div>`;
    }

    function renderChoice(q, existingAnswer) {
        const cards = q.choices.map(c => `<button type="button" class="hm-card-opt${existingAnswer === c.key ? ' is-selected' : ''}" data-choice="${c.key}">
            <span class="hm-card-opt__label">${escHtml(c.label)}</span>
        </button>`).join('');
        return `<div class="hm-cards--4">${cards}</div>`;
    }

    /** Werte-Sortieraufgabe: Schritt a (drei wichtigste), Schritt b (zwei unwichtigste). */
    function renderValueSort() {
        const cards = ModelV2.VALUE_ITEMS.map(v => `<li>
            <button type="button" class="hm-sort__card" data-key="${v.key}">
                <span class="hm-sort__badge" aria-hidden="true"></span>
                <span class="hm-sort__label">${escHtml(v.text)}</span>
            </button>
        </li>`).join('');
        return `
            <p class="hm-sort__instruction" data-sort-instruction>Wähle die drei, die dir am wichtigsten sind.</p>
            <ul class="hm-sort__list">${cards}</ul>
            <button type="button" class="hm-sort__next" data-sort-next hidden>Weiter</button>`;
    }

    function attachEvents(container, q) {
        if (q.type === 'value-sort') { attachValueSort(container, q); return; }
        if (q.type === 'choice')     { attachChoice(container, q); return; }
        attachLikert(container, q);
    }

    function attachLikert(container, q) {
        // Local lock (scoped to this render) blocks a double-click on the same
        // question from firing recordAnswer/advance twice, which previously
        // caused two questions to stack and one question to get skipped.
        let locked = false;
        container.querySelectorAll('.hm-dot').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTransitioning || locked) return;
                locked = true;
                recordAnswer(q.id, Number(btn.dataset.val));
                container.querySelectorAll('.hm-dot').forEach(d => d.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                setTimeout(() => advance(), 420);
            });
        });
        const backBtn = container.querySelector('.hm-question__back');
        if (backBtn) backBtn.addEventListener('click', () => { if (!isTransitioning) goBack(); });
    }

    function attachChoice(container, q) {
        let locked = false;
        container.querySelectorAll('.hm-card-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTransitioning || locked) return;
                locked = true;
                recordAnswer(q.id, btn.dataset.choice);
                container.querySelectorAll('.hm-card-opt').forEach(c => c.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                setTimeout(() => advance(), 420);
            });
        });
        const backBtn = container.querySelector('.hm-question__back');
        if (backBtn) backBtn.addEventListener('click', () => { if (!isTransitioning) goBack(); });
    }

    function attachValueSort(container, q) {
        const cards = Array.from(container.querySelectorAll('.hm-sort__card'));
        const instrEl = container.querySelector('[data-sort-instruction]');
        const nextBtn = container.querySelector('[data-sort-next]');

        // Reconstruct a previously completed sort (back navigation) from the
        // stored likert values: 7/6/5 = Top 1./2./3., 2/1 = unwichtigste 1./2.
        let top = [], bottom = [];
        if (q.values.every(v => answers[v.id] != null)) {
            const byVal = {};
            q.values.forEach(v => { byVal[answers[v.id]] = v.key; });
            top = [byVal[7], byVal[6], byVal[5]].filter(Boolean);
            bottom = [byVal[2], byVal[1]].filter(Boolean);
        }

        function paint() {
            cards.forEach(btn => {
                const key = btn.dataset.key;
                const ti = top.indexOf(key), bi = bottom.indexOf(key);
                const badge = btn.querySelector('.hm-sort__badge');
                btn.classList.remove('is-top', 'is-bottom');
                badge.textContent = '';
                if (ti > -1) { btn.classList.add('is-top'); badge.textContent = String(ti + 1); }
                else if (bi > -1) { btn.classList.add('is-bottom'); badge.textContent = String(bi + 1); }
            });
            if (top.length < 3) {
                instrEl.textContent = 'Wähle die drei, die dir am wichtigsten sind.';
            } else if (bottom.length < 2) {
                instrEl.textContent = 'Wähle jetzt die zwei, die dir am wenigsten wichtig sind.';
            } else {
                instrEl.textContent = 'Danke. Prüfe deine Auswahl und klicke auf Weiter.';
            }
            if (nextBtn) nextBtn.hidden = !(top.length === 3 && bottom.length === 2);
        }
        paint();

        cards.forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                const ti = top.indexOf(key), bi = bottom.indexOf(key);
                if (ti > -1) { top.splice(ti, 1); paint(); return; }   // Auswahl rückgängig machen
                if (bi > -1) { bottom.splice(bi, 1); paint(); return; }
                if (top.length < 3) { top.push(key); paint(); }
                else if (bottom.length < 2) { bottom.push(key); paint(); }
            });
        });

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (isTransitioning || top.length !== 3 || bottom.length !== 2) return;
                const likertFor = (key) => {
                    const ti = top.indexOf(key);
                    if (ti === 0) return 7;
                    if (ti === 1) return 6;
                    if (ti === 2) return 5;
                    const bi = bottom.indexOf(key);
                    if (bi === 0) return 2;
                    if (bi === 1) return 1;
                    return 4;
                };
                q.values.forEach(v => { answers[v.id] = likertFor(v.key); });
                updateProgress();
                saveSession();
                advance();
            });
        }

        const backBtn = container.querySelector('.hm-question__back');
        if (backBtn) backBtn.addEventListener('click', () => { if (!isTransitioning) goBack(); });
    }

    function goBack() {
        if (currentIndex <= 0) return;
        currentIndex -= 1;
        renderQuestion(currentIndex);
        updateProgress();
        saveSession();
    }

    function recordAnswer(qid, value) {
        answers[qid] = value;
        updateProgress();
        saveSession();
    }

    // ── navigation ──
    function advance() {
        if (isTransitioning) return;
        const nextIndex = currentIndex + 1;
        if (nextIndex >= total) { finish(); return; }

        const curSection = items[currentIndex].section;
        const nextSection = items[nextIndex].section;
        if (nextSection !== curSection) {
            showInterstitial(curSection, nextSection, () => {
                currentIndex = nextIndex;
                renderQuestion(currentIndex);
                updateProgress();
                saveSession();
            });
        } else {
            currentIndex = nextIndex;
            renderQuestion(currentIndex);
            saveSession();
        }
    }

    /** Ein Satz aus den gerade beantworteten Fragen des Abschnitts, der verlassen wird. */
    function observationSentence(sectionId) {
        let raw;
        try { raw = ScoringV2.computeRaw(answers); } catch (e) { return ''; }

        if (sectionId === 'terrain') {
            const entries = Object.keys(ModelV2.TRAITS).map(k => ({ k, score: raw.traits[k] }));
            const top = entries.reduce((a, b) => (Math.abs(b.score - 50) > Math.abs(a.score - 50) ? b : a));
            const t = ContentV2.TRAIT_TEXT[top.k];
            return top.score >= 50 ? t.readHigh : t.readLow;
        }
        if (sectionId === 'werte') {
            const entries = Object.keys(ModelV2.VALUES).map(k => ({ k, score: raw.values[k] }));
            const top = entries.reduce((a, b) => (b.score > a.score ? b : a));
            return `Am wichtigsten ist dir gerade, ${ContentV2.VALUE_TEXT[top.k]}.`;
        }
        if (sectionId === 'beduerfnisse') {
            const entries = Object.keys(ModelV2.NEEDS).map(k => ({ k, frust: raw.needs[k].frustration }));
            const top = entries.reduce((a, b) => (b.frust > a.frust ? b : a));
            const c = ContentV2.NEED_TEXT[top.k];
            return top.frust >= 55 ? c.frust : c.satHigh;
        }
        if (sectionId === 'sinn') {
            const entries = Object.keys(ModelV2.MEANING).map(k => ({ k, score: raw.meaning[k] }));
            const top = entries.reduce((a, b) => (Math.abs(b.score - 50) > Math.abs(a.score - 50) ? b : a));
            return ContentV2.MEANING_TEXT[top.k].read;
        }
        if (sectionId === 'praegung') {
            const entries = Object.keys(ModelV2.SCHEMA_DOMAINS).map(k => ({ k, score: raw.schema[k] }));
            const top = entries.reduce((a, b) => (b.score > a.score ? b : a));
            return top.score >= 50
                ? `Klingt bei dir an: „${ContentV2.SCHEMA_BELIEFS[top.k].text}“`
                : 'Keine deiner geprüften Prägungen ist gerade stark aktiv.';
        }
        return '';
    }

    function showInterstitial(curSection, nextSection, callback) {
        isTransitioning = true;
        const meta = sectionMeta(nextSection);
        const color = SECTION_COLOR[nextSection] || 'var(--hm-gold)';

        if (intIcon)     intIcon.textContent = SECTION_ICON[nextSection] || '●';
        if (intPhaseLbl) intPhaseLbl.textContent = 'Nächster Abschnitt';
        if (intTitle)    intTitle.textContent = meta ? meta.label : nextSection;
        if (intSub)      intSub.textContent = meta ? meta.sub : '';
        if (intObs)      intObs.textContent = observationSentence(curSection);
        if (intFill)     intFill.style.width = '0%';

        interstitial.style.setProperty('--int-color', color);
        if (intIcon)     intIcon.style.color = color;
        if (intPhaseLbl) intPhaseLbl.style.color = color;

        interstitial.classList.add('is-active');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (intFill) intFill.style.width = '100%';
        }));

        // Bleibt stehen, bis auf "Weiter" geklickt wird (kein Auto-Dismiss mehr).
        const onNext = () => {
            if (intNext) intNext.removeEventListener('click', onNext);
            interstitial.classList.remove('is-active');
            setTimeout(() => { isTransitioning = false; callback(); }, 300);
        };
        if (intNext) intNext.addEventListener('click', onNext);
    }

    // ── finish ──
    function finish() {
        isTransitioning = true;
        showFinishSpinner();
        try {
            // In re-measure mode, merge the cached stable terrain answers.
            const fullAnswers = remeasure
                ? Object.assign({}, StoreV2.getTerrainAnswers(), answers)
                : answers;
            const raw = ScoringV2.computeRaw(fullAnswers);
            const profile = LayersV2.buildProfile(raw, StoreV2.getHistory());
            InsightsV2.applyFocus(profile);
            StoreV2.commit(profile, fullAnswers, mode);
        } catch (e) {
            console.error('v2 pipeline error:', e);
            if (questionWrap) {
                questionWrap.innerHTML = `<div class="hm-finish"><div style="color:var(--area-beziehungen);font-size:1rem">Fehler beim Berechnen. Bitte neu starten.</div></div>`;
            }
            isTransitioning = false;
            return;
        }
        clearSession();
        setTimeout(() => { window.location.href = 'result.html'; }, 600);
    }

    function showFinishSpinner() {
        if (!questionWrap) return;
        questionWrap.innerHTML = `
            <div class="hm-finish">
                <div class="hm-finish__spin"></div>
                <div class="hm-heading" style="font-size:1.25rem">Dein Bild wird zusammengesetzt…</div>
            </div>`;
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => AssessmentV2.init());
