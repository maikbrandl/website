/**
 * HUMAN MAP v2 — Result renderer (§9)
 * Turns a computed profile into the result card DOM. Deterministic, no user
 * free-text is injected as HTML, but esc() guards anyway.
 *
 * Public API: ResultV2.render(container, profile)
 *   - profile must already have applyFocus() run on it.
 */
const ResultV2 = (() => {

    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const PANEL_COLOR = {
        terrain: 'var(--area-denken)',
        antrieb: 'var(--area-antrieb)',
        sinn:    'var(--area-wachstum)',
        praegung:'var(--area-beziehungen)',
    };

    function bar(score, color) {
        const w = Math.max(0, Math.min(100, Math.round(score)));
        return `<div class="rv-bar"><div class="rv-bar__fill" style="width:${w}%;background:${color}"></div></div>`;
    }

    function row(label, score, read, color) {
        return `<div class="rv-row">
            <div class="rv-row__label"><span>${esc(label)}</span><span class="rv-row__val">${Math.round(score)}</span></div>
            ${bar(score, color)}
            ${read ? `<div class="rv-row__read">${esc(read)}</div>` : ''}
        </div>`;
    }

    function panelShell(kind, title, inner) {
        const color = PANEL_COLOR[kind];
        return `<div class="rv-panel">
            <div class="rv-panel__head">
                <span class="rv-panel__dot" style="background:${color}"></span>
                <p class="rv-panel__title">${esc(title)}</p>
            </div>
            ${inner}
        </div>`;
    }

    // ── panels ──
    function terrainHtml(picture) {
        const color = PANEL_COLOR.terrain;
        const rows = picture.terrain.map(t => row(t.label, t.score, t.read, color)).join('');
        return panelShell('terrain', 'Terrain', rows);
    }

    function antriebHtml(picture) {
        const color = PANEL_COLOR.antrieb;
        const chips = picture.antrieb.topValues
            .map(v => `<span class="rv-chip">${esc(v.label)}</span>`).join('');
        const needs = picture.antrieb.needs.map(n => `
            <div class="rv-need${n.flag ? ' rv-need--flag' : ''}">
                <span class="rv-need__mark">${n.flag ? '!' : '✓'}</span>
                <span>${esc(n.line)}</span>
            </div>`).join('');
        return panelShell('antrieb', 'Antrieb', `<div class="rv-chips">${chips}</div>${needs}`);
    }

    function sinnHtml(picture) {
        const color = PANEL_COLOR.sinn;
        const rows = picture.sinn.map(s => row(s.label, s.score, s.read, color)).join('');
        return panelShell('sinn', 'Sinn', rows);
    }

    function praegungHtml(picture) {
        const items = picture.praegung.length
            ? picture.praegung.map(b => `<div class="rv-belief">${esc(b.text)}</div>`).join('')
            : `<div class="rv-belief" style="color:var(--hm-text-dim)">Keine der geprüften Prägungen ist bei dir stark aktiv — ein gutes Zeichen für inneren Spielraum.</div>`;
        return panelShell('praegung', 'Prägung', items);
    }

    // ── frictions ──
    function frictionHtml(f, isFocus) {
        const tag = f.type === 'schleife' ? 'Schleife' : 'Lücke';
        return `<div class="rv-friction">
            <span class="rv-friction__tag">${esc(tag)}</span>
            <div class="rv-friction__head">
                <span class="rv-friction__label">${esc(f.label)}</span>
                <span class="rv-friction__lever">
                    <span class="rv-friction__lever-num">${f.leverage}</span>
                    <span class="rv-friction__lever-cap">Hebel</span>
                </span>
            </div>
            <p class="rv-friction__origin">${esc(f.origin)}</p>
            <p class="rv-friction__cost">${esc(f.cost)}</p>
            <p class="rv-friction__break">${esc(f.break)}</p>
        </div>`;
    }

    // ── transformation ──
    function stepBody(step) {
        if (step.key === 'finden') {
            return `<blockquote class="rv-quote">„${esc(step.beliefText)}“</blockquote>
                <div class="rv-step__body">${esc(step.origin)}</div>
                <ul class="rv-qlist">${step.questions.map(q => `<li>${esc(q)}</li>`).join('')}</ul>`;
        }
        if (step.key === 'formulieren') {
            return `<blockquote class="rv-quote">„${esc(step.counter)}“</blockquote>
                <div class="rv-step__body">${esc(step.valueAnchor)}</div>`;
        }
        if (step.key === 'widerlegen') {
            const w = step.woop;
            return `<div class="rv-woop">
                <div class="rv-woop__row"><span class="rv-woop__key">Wish</span><span>${esc(w.wish)}</span></div>
                <div class="rv-woop__row"><span class="rv-woop__key">Outcome</span><span>${esc(w.outcome)}</span></div>
                <div class="rv-woop__row"><span class="rv-woop__key">Obstacle</span><span>${esc(w.obstacle)}</span></div>
                <div class="rv-woop__plan">${esc(w.plan)}</div>
            </div>`;
        }
        return `<div class="rv-step__body">${esc(step.prompt)}</div>`;
    }

    function transformHtml(transform) {
        const steps = transform.steps.map(s => `
            <div class="rv-step">
                <div class="rv-step__num">${s.n}</div>
                <div>
                    <h4 class="rv-step__title">${esc(s.title)}</h4>
                    <p class="rv-step__lead">${esc(s.lead)}</p>
                    ${stepBody(s)}
                </div>
            </div>`).join('');
        return `<div class="rv-steps">${steps}</div>`;
    }

    // ── movement over time (§11) ──
    const NEED_LABEL = { autonomie: 'Autonomie', kompetenz: 'Kompetenz', verbundenheit: 'Verbundenheit' };

    function deltaChip(delta, goodWhenNegative) {
        if (!delta) return `<span class="rv-move__chip rv-move__chip--flat">→ unverändert</span>`;
        const improved = goodWhenNegative ? delta < 0 : delta > 0;
        const sym = delta > 0 ? '↑' : '↓';
        const cls = improved ? 'good' : 'bad';
        return `<span class="rv-move__chip rv-move__chip--${cls}">${sym} ${delta > 0 ? '+' : ''}${delta}</span>`;
    }

    function movementHtml(pair) {
        const prev = pair.previous, cur = pair.current;
        const rows = [];

        // Sinn overall (average of three components; up is good).
        const avg = o => Math.round((o.kohaerenz + o.purpose + o.bedeutsamkeit) / 3);
        rows.push({ label: 'Sinn insgesamt', delta: avg(cur.meaning) - avg(prev.meaning), goodNeg: false });

        // Need frustration per need (down is good).
        Object.keys(NEED_LABEL).forEach(k => {
            if (prev.needs[k] && cur.needs[k]) {
                rows.push({ label: `${NEED_LABEL[k]} — Frustration`, delta: cur.needs[k].f - prev.needs[k].f, goodNeg: true });
            }
        });

        // Strongest belief activation (down is good).
        const topAct = snap => (snap.beliefs && snap.beliefs[0]) ? snap.beliefs[0].activation : 0;
        rows.push({ label: 'Stärkste Prägung', delta: topAct(cur) - topAct(prev), goodNeg: true });

        const rowsHtml = rows.map(r => `
            <div class="rv-move__row">
                <span class="rv-move__label">${esc(r.label)}</span>
                ${deltaChip(r.delta, r.goodNeg)}
            </div>`).join('');

        // Focus shift.
        let focusLine;
        const pf = prev.focus, cf = cur.focus;
        if (pf && cf && pf.id === cf.id) {
            focusLine = `Dein Hebel ist stabil geblieben: <strong>${esc(cf.label)}</strong>. Bleib dran — Wiederholung ist hier der Wirkstoff.`;
        } else if (pf && cf) {
            focusLine = `Dein Hebel hat sich verschoben — von <em>${esc(pf.label)}</em> zu <strong>${esc(cf.label)}</strong>.`;
        } else if (cf) {
            focusLine = `Dein aktueller Fokus: <strong>${esc(cf.label)}</strong>.`;
        } else {
            focusLine = `Gerade ist kein einzelner Reibungspunkt dominant — ein Zeichen von Spielraum.`;
        }

        const since = new Date(prev.at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

        return `<section class="rv-section">
            <h2 class="rv-section__title">Deine Bewegung</h2>
            <p class="rv-section__sub">Veränderung seit deiner Messung vom ${esc(since)}. Nur die veränderbaren Ebenen — dein Terrain bleibt dein Terrain.</p>
            <div class="rv-move">
                ${rowsHtml}
                <p class="rv-move__focus">${focusLine}</p>
            </div>
        </section>`;
    }

    // ── collapsed details (raw numbers) ──
    function detailsHtml(profile) {        const trait = Object.keys(profile.traits)
            .map(k => `<div>${esc(ModelV2.TRAITS[k].label)}: <b>${Math.round(profile.traits[k])}</b></div>`).join('');
        const val = profile.values
            .map(v => `<div>${esc(v.label)}: <b>${Math.round(v.score)}</b></div>`).join('');
        const need = Object.keys(profile.needs)
            .map(k => `<div>${esc(ContentV2.NEED_TEXT[k].label)}: Erfüllung <b>${Math.round(profile.needs[k].erfuellung)}</b> · Frustration <b>${Math.round(profile.needs[k].frustration)}</b></div>`).join('');
        const mean = Object.keys(profile.meaning)
            .map(k => `<div>${esc(ContentV2.MEANING_TEXT[k].label)}: <b>${Math.round(profile.meaning[k])}</b></div>`).join('');
        return `<details class="rv-details">
            <summary>Mehr Details — die Zahlen dahinter</summary>
            <div class="rv-details__body">
                <div class="rv-eyebrow rv__eyebrow">Terrain</div>${trait}
                <div class="rv__eyebrow" style="margin-top:1rem">Werte</div>${val}
                <div class="rv__eyebrow" style="margin-top:1rem">Bedürfnisse</div>${need}
                <div class="rv__eyebrow" style="margin-top:1rem">Sinn</div>${mean}
            </div>
        </details>`;
    }

    /** Render the full card into container from a focus-applied profile. */
    function render(container, profile) {
        const picture   = InsightsV2.wholePicture(profile);
        const transform = InsightsV2.buildTransformation(profile);
        const safety    = profile.safety;
        const focus     = profile.focus;

        const parts = [];

        // 0. Personalized scene (§10.2) — rendered above everything as a hero.
        if (typeof SceneV2 !== 'undefined') {
            parts.push(`<section class="rv-scene">${SceneV2.svg(profile)}</section>`);
        }

        // 1. Synthesis
        parts.push(`<section class="rv-synthesis">
            <div class="rv__eyebrow">Dein Gesamtbild</div>
            <p class="rv-synthesis__text">${esc(picture.synthesis)}</p>
        </section>`);

        // 2. Four panels
        parts.push(`<section class="rv-section">
            <h2 class="rv-section__title">So bist du</h2>
            <p class="rv-section__sub">Vier Ebenen, die zusammen dein Bild ergeben — vollständig im Verstehen.</p>
            <div class="rv-panels">
                ${terrainHtml(picture)}
                ${antriebHtml(picture)}
                ${sinnHtml(picture)}
                ${praegungHtml(picture)}
            </div>
        </section>`);

        // 3. Frictions
        if (profile.frictions && profile.frictions.length) {
            const list = profile.frictions.map(f => frictionHtml(f, focus && f.id === focus.id)).join('');
            parts.push(`<section class="rv-section">
                <h2 class="rv-section__title">Wo es reibt</h2>
                <p class="rv-section__sub">Die Stellen, an denen dein Wollen und dein Gewordensein aneinandergeraten — sortiert nach Hebelwirkung.</p>
                <div class="rv-frictions">${list}</div>
            </section>`);
        }

        // 4. Focus + transformation
        if (focus && transform) {
            parts.push(`<section class="rv-section">
                <div class="rv-focus">
                    <div class="rv__eyebrow">Dein Fokus — Fokus im Verändern</div>
                    <p class="rv-focus__label">${esc(focus.label)}</p>
                    ${transformHtml(transform)}
                </div>
            </section>`);
        } else if (focus) {
            parts.push(`<section class="rv-section">
                <div class="rv-focus">
                    <div class="rv__eyebrow">Dein Fokus</div>
                    <p class="rv-focus__label">${esc(focus.label)}</p>
                    <p class="rv-step__body">${esc(focus.break)}</p>
                </div>
            </section>`);
        } else {
            parts.push(`<section class="rv-section">
                <div class="rv-focus">
                    <div class="rv__eyebrow">Dein Fokus</div>
                    <p class="rv-focus__label">Gerade ist kein einzelner Reibungspunkt dominant.</p>
                    <p class="rv-step__body">Dein Profil wirkt im Moment ausgeglichen. Nutze diesen Spielraum, um eine Sache zu vertiefen, die dir wichtig ist.</p>
                </div>
            </section>`);
        }

        // safety note
        if (safety && safety.concern) {
            parts.push(`<div class="rv-safety">${esc(safety.message)}</div>`);
        }

        // Movement over time (§11) — only when a prior measurement exists.
        const pair = (typeof StoreV2 !== 'undefined') ? StoreV2.latestPair() : null;
        if (pair) parts.push(movementHtml(pair));

        // Re-measure CTA — offered once a baseline exists.
        const hasBaseline = (typeof StoreV2 !== 'undefined') && StoreV2.getHistory().length >= 1;
        if (hasBaseline) {
            parts.push(`<div class="rv-remeasure">
                <a href="assessment.html?mode=remeasure" class="rv-remeasure__btn">Veränderbare Ebenen neu messen</a>
                <p class="rv-remeasure__note">Dein Terrain (Persönlichkeit) bleibt erhalten — du beantwortest nur die Ebenen, die sich bewegen können.</p>
            </div>`);
        }

        // 5. Collapsed details
        parts.push(detailsHtml(profile));

        // 6. Learn link
        parts.push(`<div class="rv-learn">
            <a href="learn.html">Worauf jede Ebene wissenschaftlich beruht →</a>
        </div>`);

        container.innerHTML = `<div class="rv">${parts.join('')}</div>`;
    }

    return { render };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = ResultV2;
