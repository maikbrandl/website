/**
 * HUMAN MAP v2 — Result renderer (§9, neu geordnet nach Prompt 3)
 * Turns a computed profile (+ RulesV2 output) into the result card DOM.
 * Deterministic, no user free-text is injected as HTML, esc() guards anyway.
 *
 * Reihenfolge: Landschaft+Legende → Paradox → Stärken → Muster → Bedürfnisse →
 * Reibungen (Reiter) → Dein Weg → Situationen → Bewegung → Weiterlesen →
 * Die Zahlen (eingeklappt) → Sicherheitshinweis.
 *
 * Public API: ResultV2.render(container, profile)
 *   - profile must already have applyFocus() run on it.
 */
const ResultV2 = (() => {

    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const FEEDBACK_KEY = 'humanmap_v2_feedback';
    const WEG_KEY = 'humanmap_v2_weg';

    function readLS(key) {
        try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
    }
    function writeLS(key, obj) {
        try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
    }

    const PANEL_COLOR = {
        terrain: 'var(--area-denken)',
        antrieb: 'var(--area-antrieb)',
        sinn:    'var(--area-wachstum)',
        praegung:'var(--area-beziehungen)',
    };

    // ── layer popup: general explanation + a few personalized sentences ──
    // Migrated from the old four-panel view: now opened from small info buttons
    // at the relevant new section headings instead of their own panels.
    const LAYER_EXPLAINER = {
        terrain:  'Deine Persönlichkeit nach den Big Five: fünf stabile Grundzüge, die beschreiben, wie du grundsätzlich tickst. Kein Typ, sondern eine Ausprägung auf einem Spektrum.',
        antrieb:  'Deine wichtigsten Werte und deine drei psychologischen Grundbedürfnisse, Autonomie, Kompetenz und Verbundenheit. Sie zeigen, was dich antreibt und woran es dir gerade genug oder zu wenig gibt.',
        sinn:     'Ob dein Leben sich stimmig, gerichtet und bedeutsam anfühlt, gemessen in drei Teilen: Kohärenz, Purpose und Bedeutsamkeit.',
        praegung: 'Alte Grundüberzeugungen aus früher Prägung, die oft unbewusst im Hintergrund mitlaufen und dort bremsen, wo du eigentlich hin willst.',
    };

    function layerAnalysis(kind, picture) {
        if (kind === 'terrain') {
            const sorted = picture.terrain.slice().sort((a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50));
            return sorted.slice(0, 2).map(t => t.read).join(' ');
        }
        if (kind === 'antrieb') {
            const topValue = picture.antrieb.topValues[0];
            const valueLine = topValue ? `Am wichtigsten ist dir gerade, ${topValue.text}.` : '';
            const flagged = picture.antrieb.needs.find(n => n.flag);
            const needLine = (flagged || picture.antrieb.needs[0]).line;
            return [valueLine, needLine].filter(Boolean).join(' ');
        }
        if (kind === 'sinn') {
            return picture.sinn.map(s => s.read).join(' ');
        }
        if (kind === 'praegung') {
            return picture.praegung.length
                ? picture.praegung.map(b => b.text).join(' ')
                : 'Keine der geprüften Prägungen ist bei dir stark aktiv, ein gutes Zeichen für inneren Spielraum.';
        }
        return '';
    }

    let modalEl = null;
    function ensureModal() {
        if (modalEl) return modalEl;
        modalEl = document.createElement('div');
        modalEl.className = 'rv-modal';
        modalEl.innerHTML = `<div class="rv-modal__backdrop"></div>
            <div class="rv-modal__card" role="dialog" aria-modal="true">
                <button type="button" class="rv-modal__close" aria-label="Schließen">&times;</button>
                <div class="rv-modal__head">
                    <span class="rv-modal__dot"></span>
                    <h3 class="rv-modal__title"></h3>
                </div>
                <p class="rv-modal__explainer"></p>
                <p class="rv-modal__analysis"></p>
            </div>`;
        document.body.appendChild(modalEl);
        const close = () => modalEl.classList.remove('is-open');
        modalEl.querySelector('.rv-modal__backdrop').addEventListener('click', close);
        modalEl.querySelector('.rv-modal__close').addEventListener('click', close);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
        return modalEl;
    }

    function openLayerModal(kind, title, picture) {
        const modal = ensureModal();
        modal.querySelector('.rv-modal__dot').style.background = PANEL_COLOR[kind] || 'var(--hm-gold)';
        modal.querySelector('.rv-modal__title').textContent = title;
        modal.querySelector('.rv-modal__explainer').textContent = LAYER_EXPLAINER[kind] || '';
        modal.querySelector('.rv-modal__analysis').textContent = layerAnalysis(kind, picture);
        modal.classList.add('is-open');
    }

    /** Small (i) info button at a section heading, opens the layer modal. */
    function infoBtn(kind, title) {
        return `<button type="button" class="rv-info-btn" data-layer-open="${esc(kind)}" data-layer-title="${esc(title)}"
            aria-haspopup="dialog" aria-label="Mehr erfahren über ${esc(title)}">i</button>`;
    }

    function bar(score, color) {
        const w = Math.max(0, Math.min(100, Math.round(score)));
        return `<div class="rv-bar"><div class="rv-bar__fill" style="width:${w}%;background:${color}"></div></div>`;
    }

    /** Label + band word (never a raw number) + bar, optionally a plain-language read. */
    function row(label, score, read, color) {
        return `<div class="rv-row">
            <div class="rv-row__label"><span>${esc(label)}</span><span class="rv-row__val">${esc(RulesV2.band(score))}</span></div>
            ${bar(score, color)}
            ${read ? `<div class="rv-row__read">${esc(read)}</div>` : ''}
        </div>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  0. Landschaft + Legende + Sprungmarken
    // ═══════════════════════════════════════════════════════════════
    function sceneSectionHtml(profile, hasLinks) {
        const svg = (typeof SceneV2 !== 'undefined') ? SceneV2.svg(profile) : '';
        const legend = ContentV2.SCENE_LEGEND.map(l =>
            `<span class="rv-legend__item"><strong>${esc(l.mark)}</strong> = ${esc(l.text)}</span>`).join('');
        const jumpTargets = [
            ['paradox', 'Paradox'], ['staerken', 'Stärken'], ['muster', 'Muster'], ['beduerfnisse', 'Bedürfnisse'],
            ['reibungen', 'Reibungen'], ['weg', 'Weg'], ['situationen', 'Situationen'],
        ];
        if (hasLinks) jumpTargets.push(['weiterlesen', 'Weiterlesen']);
        const jump = jumpTargets.map(([id, label]) => `<a href="#${id}" class="rv-jump__link">${esc(label)}</a>`).join('');
        return `<section class="rv-scene">${svg}</section>
            <div class="rv-legend">
                <p class="rv-legend__title">So liest du deine Karte</p>
                <div class="rv-legend__items">${legend}</div>
            </div>
            <nav class="rv-jump" aria-label="Sprung zu Abschnitten">${jump}</nav>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. Dein Paradox
    // ═══════════════════════════════════════════════════════════════
    function paradoxHtml(paradox) {
        return `<section class="rv-section" id="paradox">
            <h2 class="rv-section__title">Dein Paradox ${infoBtn('sinn', 'Sinn')}</h2>
            <p class="rv-paradox__text">${esc(paradox.text)}</p>
            ${paradox.explain ? `<p class="rv-paradox__explain">${esc(paradox.explain)}</p>` : ''}
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. Was dich trägt
    // ═══════════════════════════════════════════════════════════════
    function strengthsHtml(strengths) {
        const cards = strengths.map(s => `<div class="rv-strength">
            <h3 class="rv-strength__title">${esc(s.title)}</h3>
            <p class="rv-strength__text">${esc(s.text)}</p>
            <p class="rv-strength__use">${esc(s.use)}</p>
        </div>`).join('');
        return `<section class="rv-section" id="staerken">
            <h2 class="rv-section__title">Was dich trägt</h2>
            <div class="rv-strengths">${cards}</div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. Deine Muster (Konstellationen)
    // ═══════════════════════════════════════════════════════════════
    function constellationCardHtml(c, idx) {
        const chips = c.layers.map(l => `<span class="rv-chip-sm">${esc(l)}</span>`).join('');
        const whyId = `rv-why-${idx}`;
        const whyList = c.why.map(w => `<li>${esc(w)}</li>`).join('');
        return `<div class="rv-pattern" data-pattern-id="${esc(c.id)}">
            <div class="rv-pattern__layers">${chips}</div>
            <h3 class="rv-pattern__title">${esc(c.title)}</h3>
            <p class="rv-pattern__text">${esc(c.text)}</p>
            <button type="button" class="rv-pattern__why-btn" aria-expanded="false" aria-controls="${whyId}">Warum sagen wir das?</button>
            <ul id="${whyId}" class="rv-pattern__why" hidden>${whyList}</ul>
            <div class="rv-pattern__feedback" role="group" aria-label="Trifft das auf dich zu: ${esc(c.title)}?">
                <button type="button" class="rv-fb-btn" data-fb="trifft_zu">Trifft zu</button>
                <button type="button" class="rv-fb-btn" data-fb="teils">Teils</button>
                <button type="button" class="rv-fb-btn" data-fb="gar_nicht">Gar nicht</button>
            </div>
        </div>`;
    }

    function musterHtml(constellations) {
        const headingIcons = infoBtn('terrain', 'Terrain') + infoBtn('praegung', 'Prägung');
        if (!constellations.items.length) {
            return `<section class="rv-section" id="muster">
                <h2 class="rv-section__title">Deine Muster ${headingIcons}</h2>
                <p class="rv-section__sub">${esc(constellations.fallback)}</p>
            </section>`;
        }
        const cards = constellations.items.map((c, i) => constellationCardHtml(c, i)).join('');
        return `<section class="rv-section" id="muster">
            <h2 class="rv-section__title">Deine Muster ${headingIcons}</h2>
            <div class="rv-patterns">${cards}</div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. Deine Bedürfnisse
    // ═══════════════════════════════════════════════════════════════
    function needsHtml(profile) {
        const entries = Object.keys(profile.needs).map(key => ({ key, ...profile.needs[key] }));
        const maxEntry = entries.reduce((a, b) => (b.frustration > a.frustration ? b : a), entries[0]);
        const strongest = maxEntry && maxEntry.frustration >= 65 ? maxEntry.key : null;

        return entries.map(n => {
            const c = ContentV2.NEED_TEXT[n.key];
            const line = n.flag ? c.frust : (n.erfuellung >= 60 ? c.satHigh : c.satLow);
            return `<div class="rv-needcard">
                <div class="rv-needcard__head">
                    <span class="rv-needcard__label">${esc(c.label)}</span>
                    ${n.key === strongest ? '<span class="rv-needcard__flag">Stärkstes Signal</span>' : ''}
                </div>
                ${row('Erfüllt', n.erfuellung, null, 'var(--area-balance)')}
                ${row('Frustriert', n.frustration, null, 'var(--area-beziehungen)')}
                <p class="rv-needcard__line">${esc(line)}</p>
            </div>`;
        }).join('');
    }

    function beduerfnisseHtml(profile) {
        return `<section class="rv-section" id="beduerfnisse">
            <h2 class="rv-section__title">Deine Bedürfnisse ${infoBtn('antrieb', 'Bedürfnisse')}</h2>
            <div class="rv-needs">${needsHtml(profile)}</div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. Wo es reibt (Reiter + Fünf-Kachel-Kreislauf)
    // ═══════════════════════════════════════════════════════════════
    function componentBar(key, value) {
        const label = ContentV2.LEVERAGE_COMPONENT_LABELS[key];
        const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
        return `<div class="rv-lever-bar">
            <span class="rv-lever-bar__label">${esc(label)}</span>
            <span class="rv-lever-bar__track"><span class="rv-lever-bar__fill" style="width:${pct}%"></span></span>
        </div>`;
    }

    function frictionPanelHtml(f, i, focus, transform, alltagOverride) {
        const bandLabel = ContentV2.LEVERAGE_BAND[f.leverageBand] || ContentV2.LEVERAGE_BAND.mittel;
        const bars = ['W', 'B', 'V'].map(k => componentBar(k, f.components[k])).join('');
        const ov = alltagOverride || {};
        const tiles = [
            { k: 'Auslöser', v: ov.trigger || f.trigger },
            { k: 'Gedanke', v: f.thought },
            { k: 'Verhalten', v: ov.behavior || f.behavior },
            { k: 'Kurz gewonnen', v: f.gain },
            { k: 'Lang bezahlt', v: f.cost },
        ].map(t => `<div class="rv-tile"><span class="rv-tile__key">${esc(t.k)}</span><p class="rv-tile__val">${esc(t.v)}</p></div>`).join('');

        // Keine Doppelung: break nicht zeigen, wenn derselbe Satz schon im Weg (WOOP) steht.
        const dupWithWeg = focus && f.id === focus.id && transform && transform.steps.some(s =>
            s.woop && (s.woop.plan === f.break || s.woop.wish === f.break));
        const breakHtml = dupWithWeg ? '' : `<p class="rv-friction__break">${esc(f.break)}</p>`;

        return `<div class="rv-tabpanel${i === 0 ? ' is-active' : ''}" id="rv-fr-${i}" role="tabpanel">
            <div class="rv-friction">
                <div class="rv-friction__head">
                    <span class="rv-friction__tag">${esc(f.type === 'schleife' ? 'Schleife' : 'Lücke')}</span>
                    <span class="rv-friction__lever rv-friction__lever--${esc(f.leverageBand)}">${esc(bandLabel)}</span>
                </div>
                <div class="rv-cycle">${tiles}</div>
                ${breakHtml}
                <div class="rv-lever-bars">${bars}</div>
            </div>
        </div>`;
    }

    function reibungenHtml(profile, transform, alltag) {
        if (!profile.frictions || !profile.frictions.length) return '';
        const top = profile.frictions.slice(0, 3);
        const focus = profile.focus;
        const frictionText = (alltag && alltag.frictionText) || {};
        const tabs = top.map((f, i) => `<button type="button" class="rv-tab${i === 0 ? ' is-active' : ''}"
            data-tab-target="rv-fr-${i}" role="tab" aria-selected="${i === 0}">${esc(f.label)}</button>`).join('');
        const panels = top.map((f, i) => frictionPanelHtml(f, i, focus, transform, frictionText[f.id])).join('');
        return `<section class="rv-section" id="reibungen">
            <h2 class="rv-section__title">Wo es reibt</h2>
            <p class="rv-section__sub">Die Stellen, an denen dein Wollen und dein Gewordensein aneinandergeraten.</p>
            <div class="rv-tabs" role="tablist">${tabs}</div>
            <div class="rv-tabpanels">${panels}</div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  6. Dein Weg (Transformationsweg, abhakbar)
    // ═══════════════════════════════════════════════════════════════
    function stepBody(step) {
        if (step.key === 'finden') {
            const quote = step.beliefText ? `<blockquote class="rv-quote">„${esc(step.beliefText)}“</blockquote>` : '';
            return `${quote}
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

    function wegStepsHtml(transform, focus) {
        const state = readLS(WEG_KEY);
        const steps = transform.steps.map(s => {
            const key = `${focus.id}:${s.key}`;
            const checked = !!state[key];
            return `<div class="rv-step${checked ? ' is-done' : ''}" data-weg-key="${esc(key)}">
                <label class="rv-step__check" aria-label="Schritt ${s.n}, ${esc(s.title)}, als erledigt markieren">
                    <input type="checkbox" ${checked ? 'checked' : ''}>
                    <span class="rv-step__num">${s.n}</span>
                </label>
                <div>
                    <h4 class="rv-step__title">${esc(s.title)}</h4>
                    <p class="rv-step__lead">${esc(s.lead)}</p>
                    ${stepBody(s)}
                </div>
            </div>`;
        }).join('');
        return `<div class="rv-steps">${steps}</div>`;
    }

    function wegHtml(transform, focus) {
        if (!focus) {
            return `<section class="rv-section" id="weg">
                <h2 class="rv-section__title">Dein Weg</h2>
                <p class="rv-section__sub">Gerade ist kein einzelner Reibungspunkt dominant. Dein Profil wirkt im Moment ausgeglichen. Nutze diesen Spielraum, um eine Sache zu vertiefen, die dir wichtig ist.</p>
            </section>`;
        }
        if (!transform) {
            return `<section class="rv-section" id="weg">
                <h2 class="rv-section__title">Dein Weg</h2>
                <p class="rv-focus__label">${esc(focus.label)}</p>
                <p class="rv-step__body">${esc(focus.break)}</p>
            </section>`;
        }
        return `<section class="rv-section" id="weg">
            <h2 class="rv-section__title">Dein Weg</h2>
            <div class="rv-focus">
                <p class="rv-focus__label">${esc(focus.label)}</p>
                ${wegStepsHtml(transform, focus)}
                <button type="button" class="rv-cta" id="rv-cta-experiment">Experiment für diese Woche starten</button>
            </div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  7. So zeigst du dich (Situationen)
    // ═══════════════════════════════════════════════════════════════
    function situationenHtml(situations) {
        const cards = situations.map(s => `<div class="rv-sit">
            <h3 class="rv-sit__title">${esc(s.label)}</h3>
            <p class="rv-sit__text">${esc(s.text)}</p>
        </div>`).join('');
        return `<section class="rv-section" id="situationen">
            <h2 class="rv-section__title">So zeigst du dich</h2>
            <div class="rv-situations">${cards}</div>
        </section>`;
    }

    // ── movement over time (§11) — unverändert ──
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

        const avg = o => Math.round((o.kohaerenz + o.purpose + o.bedeutsamkeit) / 3);
        rows.push({ label: 'Sinn insgesamt', delta: avg(cur.meaning) - avg(prev.meaning), goodNeg: false });

        Object.keys(NEED_LABEL).forEach(k => {
            if (prev.needs[k] && cur.needs[k]) {
                rows.push({ label: `${NEED_LABEL[k]}, Frustration`, delta: cur.needs[k].f - prev.needs[k].f, goodNeg: true });
            }
        });

        const topAct = snap => (snap.beliefs && snap.beliefs[0]) ? snap.beliefs[0].activation : 0;
        rows.push({ label: 'Stärkste Prägung', delta: topAct(cur) - topAct(prev), goodNeg: true });

        const rowsHtml = rows.map(r => `
            <div class="rv-move__row">
                <span class="rv-move__label">${esc(r.label)}</span>
                ${deltaChip(r.delta, r.goodNeg)}
            </div>`).join('');

        let focusLine;
        const pf = prev.focus, cf = cur.focus;
        if (pf && cf && pf.id === cf.id) {
            focusLine = `Dein Hebel ist stabil geblieben: <strong>${esc(cf.label)}</strong>. Bleib dran. Wiederholung ist hier der Wirkstoff.`;
        } else if (pf && cf) {
            focusLine = `Dein Hebel hat sich verschoben, von <em>${esc(pf.label)}</em> zu <strong>${esc(cf.label)}</strong>.`;
        } else if (cf) {
            focusLine = `Dein aktueller Fokus: <strong>${esc(cf.label)}</strong>.`;
        } else {
            focusLine = `Gerade ist kein einzelner Reibungspunkt dominant. Ein Zeichen von Spielraum.`;
        }

        const since = new Date(prev.at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

        return `<section class="rv-section" id="bewegung">
            <h2 class="rv-section__title">Deine Bewegung</h2>
            <p class="rv-section__sub">Veränderung seit deiner Messung vom ${esc(since)}. Nur die veränderbaren Ebenen, dein Terrain bleibt dein Terrain.</p>
            <div class="rv-move">
                ${rowsHtml}
                <p class="rv-move__focus">${focusLine}</p>
            </div>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  9. Weiterlesen
    // ═══════════════════════════════════════════════════════════════
    function weiterlesenLinks(focus) {
        if (!focus) return null;
        return ContentV2.LINKS[focus.id] || ContentV2.LINKS[focus.belief] || null;
    }

    function weiterlesenHtml(focus) {
        const links = weiterlesenLinks(focus);
        if (!links || !links.length) return '';
        const items = links.map(l => `<li class="rv-link">
            <span class="rv-link__art">${esc(l.art)}</span>
            <a href="${esc(l.url)}">${esc(l.titel)}</a>
        </li>`).join('');
        return `<section class="rv-section" id="weiterlesen">
            <h2 class="rv-section__title">Weiterlesen</h2>
            <ul class="rv-links">${items}</ul>
        </section>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  10. Die Zahlen — eingeklappt, Bänder mit Spanne statt Einzelzahl
    // ═══════════════════════════════════════════════════════════════
    function spanRow(label, value, spread) {
        const lo = Math.max(0, Math.round(value - spread));
        const hi = Math.min(100, Math.round(value + spread));
        return `<div class="rv-zrow">
            <span class="rv-zrow__label">${esc(label)}</span>
            <span class="rv-zrow__band">${esc(RulesV2.band(value))}</span>
            <span class="rv-zrow__span">${lo}–${hi}</span>
        </div>`;
    }

    function zahlenHtml(profile) {
        const traitRows = Object.keys(profile.traits)
            .map(k => spanRow(ModelV2.TRAITS[k].label, profile.traits[k], 12)).join('');
        const valueRows = profile.values.map(v => spanRow(v.label, v.score, 18)).join('');
        const needRows = Object.keys(profile.needs).map(k => {
            const n = profile.needs[k];
            const label = ContentV2.NEED_TEXT[k].label;
            return spanRow(`${label}, Erfüllung`, n.erfuellung, 15) + spanRow(`${label}, Frustration`, n.frustration, 15);
        }).join('');
        const meaningRows = Object.keys(profile.meaning)
            .map(k => spanRow(ContentV2.MEANING_TEXT[k].label, profile.meaning[k], 15)).join('');
        const beliefRows = Object.keys(ModelV2.SCHEMA_DOMAINS).map(k => {
            const b = profile.beliefs.find(x => x.domain === k);
            return spanRow(ModelV2.SCHEMA_DOMAINS[k], b ? b.activation : 0, 15);
        }).join('');

        return `<details class="rv-details" id="zahlen">
            <summary>Die Zahlen, eingeklappt</summary>
            <div class="rv-details__body">
                <div class="rv__eyebrow">Terrain</div>${traitRows}
                <div class="rv__eyebrow" style="margin-top:1rem">Werte</div>${valueRows}
                <div class="rv__eyebrow" style="margin-top:1rem">Bedürfnisse</div>${needRows}
                <div class="rv__eyebrow" style="margin-top:1rem">Sinn</div>${meaningRows}
                <div class="rv__eyebrow" style="margin-top:1rem">Prägung</div>${beliefRows}
                <p class="rv-zahlen__note">Wenige Fragen ergeben eine Spanne, keinen exakten Punkt.</p>
            </div>
        </details>`;
    }

    // ═══════════════════════════════════════════════════════════════
    //  11. Sicherheitshinweis
    // ═══════════════════════════════════════════════════════════════
    function safetyHtml(safety) {
        const concern = (safety && safety.concern) ? `<p>${esc(safety.message)}</p>` : '';
        return `<div class="rv-safety" id="sicherheit">
            ${concern}
            <p class="rv-safety__hotline">${esc(ContentV2.SAFETY_HOTLINE)}</p>
        </div>`;
    }

    /** Render the full card into container from a focus-applied profile. */
    function render(container, profile) {
        const rules     = RulesV2.build(profile);
        const picture   = InsightsV2.wholePicture(profile); // feeds the (i) info modals
        const transform = InsightsV2.buildTransformation(profile);
        const focus     = profile.focus;
        const links     = weiterlesenLinks(focus);

        const parts = [];

        if (typeof SceneV2 !== 'undefined') {
            parts.push(sceneSectionHtml(profile, !!(links && links.length)));
        }

        parts.push(paradoxHtml(rules.paradox));
        parts.push(strengthsHtml(rules.strengths));
        parts.push(musterHtml(rules.constellations));
        parts.push(beduerfnisseHtml(profile));
        parts.push(reibungenHtml(profile, transform, rules.alltag));
        parts.push(wegHtml(transform, focus));
        parts.push(situationenHtml(rules.situations));

        const pair = (typeof StoreV2 !== 'undefined') ? StoreV2.latestPair() : null;
        if (pair) parts.push(movementHtml(pair));

        const hasBaseline = (typeof StoreV2 !== 'undefined') && StoreV2.getHistory().length >= 1;
        if (hasBaseline) {
            parts.push(`<div class="rv-remeasure">
                <a href="assessment.html?mode=remeasure" class="rv-remeasure__btn">Veränderbare Ebenen neu messen</a>
                <p class="rv-remeasure__note">Dein Terrain (Persönlichkeit) bleibt erhalten, du beantwortest nur die Ebenen, die sich bewegen können.</p>
            </div>`);
        }

        parts.push(weiterlesenHtml(focus));
        parts.push(zahlenHtml(profile));
        parts.push(safetyHtml(profile.safety));

        parts.push(`<div class="rv-learn">
            <a href="learn.html">Worauf jede Ebene wissenschaftlich beruht →</a>
        </div>`);

        container.innerHTML = `<div class="rv">${parts.join('')}</div>`;

        // ── wiring: layer info modals ──
        container.querySelectorAll('[data-layer-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                openLayerModal(btn.dataset.layerOpen, btn.dataset.layerTitle, picture);
            });
        });

        // ── wiring: Muster "Warum sagen wir das?" + Feedback ──
        container.querySelectorAll('.rv-pattern').forEach(card => {
            const id = card.dataset.patternId;
            const whyBtn = card.querySelector('.rv-pattern__why-btn');
            const whyList = card.querySelector('.rv-pattern__why');
            whyBtn.addEventListener('click', () => {
                const open = whyBtn.getAttribute('aria-expanded') === 'true';
                whyBtn.setAttribute('aria-expanded', String(!open));
                whyList.hidden = open;
            });
            const fbBtns = card.querySelectorAll('.rv-fb-btn');
            const paint = () => {
                const stored = readLS(FEEDBACK_KEY);
                fbBtns.forEach(b => b.classList.toggle('is-active', b.dataset.fb === stored[id]));
            };
            paint();
            fbBtns.forEach(b => b.addEventListener('click', () => {
                const stored = readLS(FEEDBACK_KEY);
                stored[id] = b.dataset.fb;
                writeLS(FEEDBACK_KEY, stored);
                paint();
                window.HLTrack && HLTrack('human-map-feedback', { id, wert: b.dataset.fb });
            }));
        });

        // ── wiring: Reibungs-Reiter ──
        container.querySelectorAll('.rv-tabs').forEach(tabbar => {
            const tabs = tabbar.querySelectorAll('.rv-tab');
            const panels = tabbar.nextElementSibling ? tabbar.nextElementSibling.querySelectorAll('.rv-tabpanel') : [];
            tabs.forEach(tab => tab.addEventListener('click', () => {
                tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');
                panels.forEach(p => p.classList.toggle('is-active', p.id === tab.dataset.tabTarget));
            }));
        });

        // ── wiring: Weg abhaken ──
        container.querySelectorAll('[data-weg-key]').forEach(el => {
            const input = el.querySelector('input[type="checkbox"]');
            input.addEventListener('change', () => {
                const state = readLS(WEG_KEY);
                state[el.dataset.wegKey] = input.checked;
                writeLS(WEG_KEY, state);
                el.classList.toggle('is-done', input.checked);
            });
        });

        // ── wiring: die eine Hauptaktion ──
        const cta = container.querySelector('#rv-cta-experiment');
        if (cta) {
            cta.addEventListener('click', () => {
                const target = container.querySelector('[data-weg-key$=":widerlegen"]') || container.querySelector('#weg');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('rv-step--pulse');
                    setTimeout(() => target.classList.remove('rv-step--pulse'), 1600);
                }
                window.HLTrack && HLTrack('human-map-experiment-start', { focus: focus ? focus.id : null });
            });
        }

        if (!window.__hmGezaehlt) {
            window.__hmGezaehlt = true;
            window.HLTrack && HLTrack('human-map-fertig', { wiederholung: hasBaseline });
        }
    }

    return { render };
})();
