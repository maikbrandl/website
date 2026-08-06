/**
 * HUMAN MAP v2 — Assessment controller
 * Renders the 58-item CORE bank (all likert-7), section interstitials, saves
 * progress, and on finish stores the answers and redirects to result.html.
 * Answers are the single source of truth; result.html recomputes the pipeline.
 */
const AssessmentV2 = (() => {

    const SESSION_KEY = 'humanmap_v2_session';
    const ANSWERS_KEY = 'humanmap_v2_answers';

    let currentIndex = 0;
    let answers = {};
    let isTransitioning = false;

    // Re-measure mode (?mode=remeasure) asks only the changeable layers and
    // reuses the cached stable terrain from the first full run.
    const params = new URLSearchParams(location.search);
    const remeasure = params.get('mode') === 'remeasure' && StoreV2.hasTerrain();
    const mode = remeasure ? 'remeasure' : 'full';

    const items = remeasure
        ? ModelV2.CORE_ITEMS.filter(it => it.section !== 'terrain')
        : ModelV2.CORE_ITEMS;
    const total = items.length;

    // Section id → interstitial accent (existing area tokens only).
    const SECTION_COLOR = {
        terrain:      'var(--area-denken)',
        werte:        'var(--area-antrieb)',
        beduerfnisse: 'var(--area-balance)',
        sinn:         'var(--area-wachstum)',
        praegung:     'var(--area-beziehungen)',
    };
    const SECTION_ICON = {
        terrain: '◈', werte: '◉', beduerfnisse: '◇', sinn: '◆', praegung: '◎',
    };
    const sectionMeta = (id) => ModelV2.SECTIONS.find(s => s.id === id);

    let questionWrap, progressFill, progressLabel, progressPhase;
    let interstitial, intIcon, intTitle, intSub, intPhaseLbl, intFill;

    function init() {
        questionWrap  = document.getElementById('hm-question-wrap');
        progressFill  = document.getElementById('hm-progress-fill');
        progressLabel = document.getElementById('hm-progress-label');
        progressPhase = document.getElementById('hm-progress-phase');
        interstitial  = document.getElementById('hm-interstitial');
        intIcon       = document.getElementById('hm-int-icon');
        intTitle      = document.getElementById('hm-int-title');
        intSub        = document.getElementById('hm-int-sub');
        intPhaseLbl   = document.getElementById('hm-int-phase');
        intFill       = document.getElementById('hm-int-progress-fill');

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

    function updateProgress() {
        const answered = Object.keys(answers).length;
        const pct = Math.round((answered / total) * 100);
        if (progressFill)  progressFill.style.width = pct + '%';
        if (progressLabel) progressLabel.textContent = `${answered}/${total}`;
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
        const existingAnswer = answers[q.id];

        let html = `<div class="hm-question__card">
            <div class="hm-question__num">Frage ${index + 1} von ${total}</div>
            <div class="hm-question__text">${escHtml(q.text)}</div>
            ${renderLikert(q, existingAnswer)}
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

    function attachEvents(container, q) {
        container.querySelectorAll('.hm-dot').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTransitioning) return;
                recordAnswer(q.id, Number(btn.dataset.val));
                container.querySelectorAll('.hm-dot').forEach(d => d.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                setTimeout(() => advance(), 420);
            });
        });
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
            showInterstitial(nextSection, () => {
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

    function showInterstitial(sectionId, callback) {
        isTransitioning = true;
        const meta = sectionMeta(sectionId);
        const color = SECTION_COLOR[sectionId] || 'var(--hm-gold)';

        if (intIcon)     intIcon.textContent = SECTION_ICON[sectionId] || '●';
        if (intPhaseLbl) intPhaseLbl.textContent = 'Nächster Abschnitt';
        if (intTitle)    intTitle.textContent = meta ? meta.label : sectionId;
        if (intSub)      intSub.textContent = meta ? meta.sub : '';
        if (intFill)     intFill.style.width = '0%';

        interstitial.style.setProperty('--int-color', color);
        if (intIcon)     intIcon.style.color = color;
        if (intPhaseLbl) intPhaseLbl.style.color = color;

        interstitial.classList.add('is-active');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (intFill) intFill.style.width = '100%';
        }));

        setTimeout(() => {
            interstitial.classList.remove('is-active');
            setTimeout(() => { isTransitioning = false; callback(); }, 400);
        }, 2200);
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
