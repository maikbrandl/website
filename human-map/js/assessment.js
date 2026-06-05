/**
 * HUMAN MAP – Assessment Controller
 * Handles question rendering, navigation, phase interstitials, and result saving.
 */

const Assessment = (() => {

    // ── State ─────────────────────────────────────────────────────
    const STATE_KEY    = 'humanmap_session';
    const RESULTS_KEY  = 'humanmap_results';
    let   currentIndex = 0;
    let   answers      = {};
    let   isTransitioning = false;

    const questions = MODEL.QUESTIONS;
    const total     = questions.length;

    // ── DOM refs (populated on init) ─────────────────────────────
    let questionWrap, progressFill, progressLabel, progressPhase;
    let interstitial, interstitialIcon, interstitialTitle, interstitialSub, interstitialPhaseLbl, interstitialProgressFill;

    // ── Phase sequence for interstitials ─────────────────────────
    const phaseOrder = ['kern', 'antrieb', 'muster', 'potenzial'];
    const phaseIcons = { kern: '◈', antrieb: '◉', muster: '◎', potenzial: '◆' };
    const phaseSubs  = {
        kern:      'Wir erkunden deine Grundstruktur – Offenheit, Energie, Verbindung.',
        antrieb:   'Was bewegt dich wirklich? Werte, Triebkräfte, innerer Kompass.',
        muster:    'Deine Denk- und Verhaltensmuster – das innere Betriebssystem.',
        potenzial: 'Dein Wachstumspotenzial – Mindset, Grit, Intelligenz.',
    };

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        questionWrap         = document.getElementById('hm-question-wrap');
        progressFill         = document.getElementById('hm-progress-fill');
        progressLabel        = document.getElementById('hm-progress-label');
        progressPhase        = document.getElementById('hm-progress-phase');
        interstitial         = document.getElementById('hm-interstitial');
        interstitialIcon     = document.getElementById('hm-int-icon');
        interstitialTitle    = document.getElementById('hm-int-title');
        interstitialSub      = document.getElementById('hm-int-sub');
        interstitialPhaseLbl = document.getElementById('hm-int-phase');
        interstitialProgressFill = document.getElementById('hm-int-progress-fill');

        // Restore session if available
        const saved = loadSession();
        if (saved) {
            answers      = saved.answers || {};
            currentIndex = saved.currentIndex || 0;
            // Clamp in case questions changed
            currentIndex = Math.min(currentIndex, total - 1);
        }

        updateProgress();
        renderQuestion(currentIndex);
    }

    // ── Session persistence ───────────────────────────────────────
    function saveSession() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify({ answers, currentIndex }));
        } catch (e) { /* storage full */ }
    }

    function loadSession() {
        try {
            const raw = localStorage.getItem(STATE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function clearSession() {
        localStorage.removeItem(STATE_KEY);
    }

    // ── Progress ──────────────────────────────────────────────────
    function updateProgress() {
        const answered = Object.keys(answers).length;
        const pct      = Math.round((answered / total) * 100);
        if (progressFill)  progressFill.style.width  = pct + '%';
        if (progressLabel) progressLabel.textContent  = `${answered}/${total}`;
        const q = questions[currentIndex];
        if (progressPhase && q) {
            const phase = MODEL.PHASES[q.phase];
            progressPhase.textContent = phase ? phase.label : '';
        }
    }

    // ── Question renderer ─────────────────────────────────────────
    function renderQuestion(index) {
        if (!questionWrap) return;
        const q = questions[index];
        if (!q) return;

        const existingAnswer = answers[q.id];
        let html = '';

        // Question header
        html += `<div class="hm-question__card">
            <div class="hm-question__num">Frage ${index + 1} von ${total}</div>
            <div class="hm-question__text">${escHtml(q.text)}</div>
            ${q.hint ? `<div class="hm-question__hint">${escHtml(q.hint)}</div>` : ''}
        `;

        if (q.type === 'likert-7') {
            html += renderLikert(q, existingAnswer);
        } else if (q.type === 'scenario-binary') {
            html += renderCards(q, existingAnswer, 2);
        } else if (q.type === 'scenario-4way') {
            html += renderCards(q, existingAnswer, 4);
        } else if (q.type === 'forced-3way') {
            html += renderCards(q, existingAnswer, 3);
        }

        html += `</div>`; // .hm-question__card

        const div = document.createElement('div');
        div.className = 'hm-question';
        div.innerHTML = html;

        // Attach events
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
        return `
            <div class="hm-likert">
                <div class="hm-likert__anchors">
                    <span>${escHtml(q.anchors[0])}</span>
                    <span>${escHtml(q.anchors[1])}</span>
                </div>
                <div class="hm-likert__dots">${dots}</div>
            </div>`;
    }

    function renderCards(q, existingAnswer, count) {
        const gridClass = count === 2 ? 'hm-cards--2' : count === 4 ? 'hm-cards--4' : 'hm-cards--3';
        let cards = '';
        q.options.forEach(opt => {
            const sel = existingAnswer === opt.value ? ' is-selected' : '';
            cards += `
                <button class="hm-card-opt${sel}" data-val="${escAttr(opt.value)}">
                    <div class="hm-card-opt__label">${escHtml(opt.label)}</div>
                    <div class="hm-card-opt__desc">${escHtml(opt.desc)}</div>
                </button>`;
        });
        return `<div class="${gridClass}">${cards}</div>`;
    }

    function attachEvents(container, q) {
        container.querySelectorAll('.hm-dot').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTransitioning) return;
                recordAnswer(q.id, Number(btn.dataset.val));
                // Visual feedback
                container.querySelectorAll('.hm-dot').forEach(d => d.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                // Auto-advance after brief pause
                setTimeout(() => advance(), 420);
            });
        });

        container.querySelectorAll('.hm-card-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTransitioning) return;
                recordAnswer(q.id, btn.dataset.val);
                container.querySelectorAll('.hm-card-opt').forEach(c => c.classList.remove('is-selected'));
                btn.classList.add('is-selected');
                setTimeout(() => advance(), 360);
            });
        });
    }

    function recordAnswer(qid, value) {
        answers[qid] = value;
        updateProgress();
        saveSession();
    }

    // ── Advance / phase transitions ───────────────────────────────
    function advance() {
        if (isTransitioning) return;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= total) {
            // All done → compute & save → redirect
            finishAssessment();
            return;
        }

        const currentPhase = questions[currentIndex].phase;
        const nextPhase    = questions[nextIndex].phase;

        if (nextPhase !== currentPhase) {
            // Show phase interstitial
            showInterstitial(nextPhase, () => {
                currentIndex = nextIndex;
                renderQuestion(currentIndex);
                saveSession();
            });
        } else {
            currentIndex = nextIndex;
            renderQuestion(currentIndex);
            saveSession();
        }
    }

    function showInterstitial(phase, callback) {
        isTransitioning = true;
        const meta = MODEL.PHASES[phase];

        if (interstitialIcon)     interstitialIcon.textContent     = phaseIcons[phase] || '●';
        if (interstitialPhaseLbl) interstitialPhaseLbl.textContent = 'Nächstes Kapitel';
        if (interstitialTitle)    interstitialTitle.textContent    = meta ? meta.label : phase;
        if (interstitialSub)      interstitialSub.textContent      = phaseSubs[phase] || '';

        if (interstitialProgressFill) {
            interstitialProgressFill.style.width = '0%';
        }

        interstitial.classList.add('is-active');

        // Animate progress bar
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (interstitialProgressFill) {
                    interstitialProgressFill.style.width = '100%';
                }
            });
        });

        // Apply phase color accent
        if (meta) {
            interstitial.style.setProperty('--int-color', meta.color);
            if (interstitialIcon) interstitialIcon.style.color = meta.color;
            if (interstitialPhaseLbl) interstitialPhaseLbl.style.color = meta.color;
        }

        setTimeout(() => {
            interstitial.classList.remove('is-active');
            setTimeout(() => {
                isTransitioning = false;
                callback();
            }, 400);
        }, 2200);
    }

    // ── Finish ────────────────────────────────────────────────────
    function finishAssessment() {
        isTransitioning = true;
        showFinishSpinner();

        let results;
        try {
            // Compute all scores and archetype data
            const { scores, categorical } = Scoring.computeScores(answers);
            const archetypeResult = Archetypes.detectArchetype(scores, categorical);
            const activeSynergies = Archetypes.detectSynergies(scores, categorical);
            const rareArchetypes  = Archetypes.detectRareArchetypes(scores, categorical);
            const dimSummary      = Scoring.buildDimSummary(scores, categorical);

            results = {
                answers,
                scores,
                categorical,
                archetype:   archetypeResult,
                synergies:   activeSynergies.map(s => s.id),
                rare:        rareArchetypes.map(r => ({ id: r.arch.id, score: r.score })),
                dimSummary,
                completedAt: new Date().toISOString(),
            };
        } catch (e) {
            console.error('Error computing results:', e);
            // Show error and restart
            if (questionWrap) {
                questionWrap.innerHTML = `<div class="hm-finish"><div style="color:#f07090;font-size:1rem">Fehler beim Berechnen. Bitte neu starten.</div></div>`;
            }
            isTransitioning = false;
            return;
        }

        // Save to both storages for maximum compatibility (especially file:// protocol)
        const json = JSON.stringify(results);
        try { localStorage.setItem(RESULTS_KEY, json); }  catch (e) { console.warn('localStorage unavailable:', e); }
        try { sessionStorage.setItem(RESULTS_KEY, json); } catch (e) { console.warn('sessionStorage unavailable:', e); }

        clearSession();

        // Redirect to results
        setTimeout(() => {
            window.location.href = 'results.html';
        }, 600);
    }

    function showFinishSpinner() {
        if (!questionWrap) return;
        questionWrap.innerHTML = `
            <div class="hm-finish">
                <div class="hm-finish__spin"></div>
                <div class="hm-heading" style="font-size:1.25rem">Dein Profil wird berechnet…</div>
            </div>`;
    }

    // ── HTML helpers ──────────────────────────────────────────────
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    function escAttr(str) { return escHtml(str); }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Assessment.init());
