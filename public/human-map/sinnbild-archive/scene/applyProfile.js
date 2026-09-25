/**
 * HUMAN MAP v2 — Kinematisches Sinnbild · Daten → Szene (§6, applyProfile.js)
 * Setzt Texte, Materialintensitäten, den beleuchteten Fokus-Pfad und die Nadelrichtung
 * aus dem echten `profile`-Objekt — über Attribute/CSS-Variablen, ohne Neuaufbau.
 *
 * Öffentliche API:
 *   SceneApply.apply(profile, svgRoot)      -> mutiert die SVG-Szene
 *   SceneApply.readouts(profile)            -> { terrain, praegung, werte, sinn, beduerfnisse, bewegung } (HTML)
 */
const SceneApply = (() => {

    const TRAIT_LABEL = {
        offenheit: 'Offenheit', gewissenhaftigkeit: 'Gewissenhaftigkeit',
        extraversion: 'Extraversion', vertraeglichkeit: 'Verträglichkeit',
        stabilitaet: 'Emot. Stabilität',
    };
    const NEED_LABEL = { autonomie: 'Autonomie', kompetenz: 'Kompetenz', verbundenheit: 'Verbundenheit' };
    // Sign plate anchor points (must match scene-svg signposts) for beam/needle aim.
    const SIGN_X = { 'sign-1': 965, 'sign-2': 1064, 'sign-3': 275, 'sign-4': 1165 };
    const SIGN_Y = { 'sign-1': 505, 'sign-2': 458, 'sign-3': 430, 'sign-4': 430 };

    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));

    function focusValueKey(profile) {
        if (profile.focus && profile.focus.valueKey) return profile.focus.valueKey;
        if (profile.focusValue && profile.focusValue.key) return profile.focusValue.key;
        return profile.values && profile.values[0] ? profile.values[0].key : null;
    }

    function apply(profile, root) {
        if (!root) return;
        const q = (s) => root.querySelector(s);
        const values = (profile.values || []).slice(0, 4);
        const signIds = ['sign-1', 'sign-2', 'sign-3', 'sign-4'];

        // ── Signposts ← top 4 values ─────────────────────────────────
        signIds.forEach((id, i) => {
            const g = q('#' + id);
            if (!g) return;
            const v = values[i];
            const num = g.querySelector('.sc-sign__num');
            const label = g.querySelector('.sc-sign__label');
            if (v) {
                if (num) num.textContent = (i + 1) + '';
                if (label) label.textContent = v.label;
                g.dataset.valueKey = v.key;
            } else {
                g.style.display = 'none';
            }
        });

        // ── Focus: beam + needle aim at the sign matching the focus value ──
        const fKey = focusValueKey(profile);
        let focusSignId = signIds.find(id => q('#' + id) && q('#' + id).dataset.valueKey === fKey) || 'sign-2';
        const compass = q('#fig-compass');
        const cx = 720, cy = 246;
        const tx = SIGN_X[focusSignId], ty = SIGN_Y[focusSignId];
        // needle angle (0 = up)
        const ang = Math.atan2(tx - cx, -(ty - cy)) * 180 / Math.PI;
        const needle = q('#fig-needle');
        if (needle) needle.dataset.angle = ang.toFixed(1);
        // beam polygon from compass to the focus sign, a little fan
        const beam = q('#fig-beam__ray');
        if (beam) {
            const spread = 26;
            const dx = tx - cx, dy = ty - cy, len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len * spread, ny = dx / len * spread;
            beam.setAttribute('d',
                `M${cx},${cy} L${(tx + nx).toFixed(0)},${(ty + ny).toFixed(0)} `
                + `L${(tx - nx).toFixed(0)},${(ty - ny).toFixed(0)} Z`);
        }
        // dim non-focus signs/forks
        signIds.forEach((id, i) => {
            const g = q('#' + id);
            if (g) g.dataset.focus = (id === focusSignId) ? '1' : '0';
            const fork = q('#fork-' + (i + 1));
            if (fork) fork.style.opacity = (id === focusSignId) ? '0.9' : '0.28';
        });

        // ── Mask + belief ← top belief activation ────────────────────
        const belief = (profile.beliefs && profile.beliefs[0]) || profile.focusBelief || null;
        const activation = belief ? clampPct(belief.activation) : 0;
        const mask = q('#fig-mask');
        const face = q('#fig-face');
        // high activation = mask denser & closer to face; low = lowered & face brighter
        const maskOpacity = (0.45 + activation / 100 * 0.5).toFixed(2);
        const faceOpacity = (0.15 + (100 - activation) / 100 * 0.5).toFixed(2);
        if (mask) mask.style.opacity = maskOpacity;
        if (face) face.dataset.target = faceOpacity;
        root.dataset.belief = belief ? belief.text : '';
        root.dataset.beliefActivation = activation;

        // ── Need lanterns ← satisfaction / frustration ───────────────
        const needMap = { autonomie: 'need-key', kompetenz: 'need-flame', verbundenheit: 'need-rings' };
        Object.keys(needMap).forEach(k => {
            const nd = profile.needs && profile.needs[k];
            const g = q('#' + needMap[k]);
            if (!g || !nd) return;
            const health = clampPct(nd.erfuellung - nd.frustration * 0.6 + 30); // 0..100 rough
            g.style.color = health >= 55 ? 'var(--sc-gold-light)'
                : health >= 35 ? 'var(--sc-gold)' : 'var(--sc-post)';
            g.style.setProperty('--sc-glow-op', (0.25 + health / 100 * 0.65).toFixed(2));
            g.dataset.flicker = nd.flag ? '1' : '0';
        });

        // ── Brain pulse ← traits (stability calms, low stability quickens) ──
        const t = profile.traits || {};
        const stab = clampPct(t.stabilitaet != null ? t.stabilitaet : 60);
        const brain = q('#fig-brain');
        if (brain) {
            const period = (2.2 + (stab / 100) * 2.4).toFixed(2);   // calmer when stable
            brain.style.setProperty('--sc-pulse', period + 's');
            const core = brain.querySelector('.sc-brain__core');
            if (core) core.style.setProperty('--sc-core-bright', (0.6 + (100 - stab) / 100 * 0.4).toFixed(2));
        }

        // ── Footprints ← history length ──────────────────────────────
        const steps = Math.max(0, Math.min(6, (profile.history ? profile.history.length : 0) + 1));
        root.querySelectorAll('.sc-foot').forEach(el => {
            const i = +el.dataset.step;
            el.dataset.reveal = i < steps ? '1' : '0';
        });
    }

    // ── Readout HTML for the detail panels ───────────────────────────
    function bar(label, val) {
        const p = clampPct(val);
        return `<div class="scd-row"><span>${esc(label)}</span>`
            + `<span class="scd-bar"><i style="width:${p}%"></i></span>`
            + `<b>${p}</b></div>`;
    }
    function readouts(profile) {
        const t = profile.traits || {};
        const terrain = Object.keys(TRAIT_LABEL).map(k => bar(TRAIT_LABEL[k], t[k])).join('');

        const belief = (profile.beliefs && profile.beliefs[0]) || profile.focusBelief;
        const praegung = belief
            ? `<p class="scd-quote">„${esc(belief.text)}"</p>`
              + bar('Aktivierung', belief.activation)
            : `<p class="scd-quote">Kein Glaubenssatz läuft gerade stark im Hintergrund, deine Maske liegt locker.</p>`;

        const werte = (profile.values || []).slice(0, 4)
            .map((v, i) => `<div class="scd-row"><span>${i + 1}. ${esc(v.label)}</span>`
                + `<span class="scd-bar"><i style="width:${clampPct(v.score)}%"></i></span></div>`).join('');

        const m = profile.meaning || {};
        const sinn = bar('Kohärenz', m.kohaerenz) + bar('Purpose', m.purpose) + bar('Bedeutsamkeit', m.bedeutsamkeit);

        const beduerfnisse = Object.keys(NEED_LABEL).map(k => {
            const nd = (profile.needs && profile.needs[k]) || {};
            const flag = nd.flag ? ' <em class="scd-flag">fordert dich</em>' : '';
            return bar(NEED_LABEL[k] + (flag ? '' : ''), nd.erfuellung) + (flag ? `<div class="scd-flagline">${NEED_LABEL[k]}: fordert dich gerade</div>` : '');
        }).join('');

        const runs = profile.history ? profile.history.length : 0;
        const bewegung = runs > 0
            ? `<p>Du hast dich schon <b>${runs}×</b> vermessen. Die Fußspuren zeigen deinen Weg, komm wieder und miss neu, um die Landschaft sich verschieben zu sehen.</p>`
            : `<p>Das ist deine erste Messung, der Anfang des Wegs. Wenn du später die veränderbaren Ebenen neu misst, erscheinen weitere Fußspuren.</p>`;

        return { terrain, praegung, werte, sinn, beduerfnisse, bewegung };
    }

    return { apply, readouts };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { SceneApply };
