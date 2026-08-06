/**
 * HUMAN MAP v2 — Personalized scene (§10.2)
 * Renders a deterministic SVG "inner landscape" from the profile. No randomness
 * that isn't seeded by the profile, no user free-text. Colors from tokens only.
 *
 * Metaphor:
 *   sky + stars   → Sinn (coherence = stars, purpose = orb height, mattering = glow)
 *   orb / light   → Antrieb (top value tints the warmth)
 *   rolling hills  → Terrain (openness = varied peaks, conscientiousness = smoothness)
 *   fog band       → Prägung (a strong active belief lays fog over the front hill)
 *   winding path   → Bewegung (the focus: a lit path leading toward the light)
 *
 * Public API: SceneV2.svg(profile) → SVG string.
 */
const SceneV2 = (() => {

    const W = 800, H = 400, FLOOR = H;

    // Deterministic PRNG (mulberry32) seeded from the profile.
    function seedFrom(profile) {
        const t = profile.traits;
        const s = Math.round(
            t.offenheit * 7 + t.gewissenhaftigkeit * 13 + t.extraversion * 17 +
            t.vertraeglichkeit * 19 + t.stabilitaet * 23 +
            (profile.meaning.kohaerenz + profile.meaning.purpose + profile.meaning.bedeutsamkeit) * 3
        );
        return (s % 2147483647) || 1;
    }
    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let x = Math.imul(a ^ (a >>> 15), 1 | a);
            x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Schwartz value → existing area color token (warms the light).
    const VALUE_AREA = {
        selbstbestimmung: 'denken', stimulation: 'denken',
        leistung: 'antrieb', macht: 'antrieb',
        benevolenz: 'beziehungen', universalismus: 'beziehungen',
        sicherheit: 'balance', konformitaet: 'balance', tradition: 'balance',
        hedonismus: 'wachstum',
    };

    // Catmull-Rom → smooth line through points.
    function smoothLine(pts) {
        let d = `M ${pts[0].x},${pts[0].y.toFixed(1)}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
            const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
            const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x},${p2.y.toFixed(1)}`;
        }
        return d;
    }

    function hill(baseY, amp, rough, rng, n = 9) {
        const pts = [];
        const phase = rng() * Math.PI * 2;
        const freq = 0.6 + rng() * 0.5;
        for (let i = 0; i < n; i++) {
            const x = (i / (n - 1)) * W;
            const y = baseY - Math.sin(i * freq + phase) * amp - (rng() - 0.5) * 2 * rough;
            pts.push({ x, y });
        }
        const line = smoothLine(pts);
        return { path: `${line} L ${W},${FLOOR} L 0,${FLOOR} Z`, pts };
    }

    function svg(profile) {
        const rng = mulberry32(seedFrom(profile));
        const t = profile.traits;
        const m = profile.meaning;

        const topValue = profile.values[0];
        const area = (topValue && VALUE_AREA[topValue.key]) || 'wachstum';
        const warm = `var(--area-${area})`;

        // Orb: higher purpose → higher in the sky; mattering → glow strength.
        const orbX = 560;
        const orbY = 190 - (m.purpose / 100) * 70;      // 120..190
        const orbR = 40 + (m.bedeutsamkeit / 100) * 10;  // 40..50
        const glowOpacity = (0.18 + (m.bedeutsamkeit / 100) * 0.22).toFixed(2);

        // Stars: coherence = how many stars are visible in the sky.
        const starCount = Math.round((m.kohaerenz / 100) * 14);
        let stars = '';
        for (let i = 0; i < starCount; i++) {
            const x = 40 + rng() * 480;
            const y = 30 + rng() * 150;
            const r = (0.6 + rng() * 1.4).toFixed(1);
            const o = (0.3 + rng() * 0.5).toFixed(2);
            stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="var(--hm-white)" opacity="${o}"/>`;
        }

        // Hills — openness widens the peaks, conscientiousness smooths the roughness.
        const varied = t.offenheit / 100;
        const rough  = (100 - t.gewissenhaftigkeit) / 100;
        const back  = hill(255, 18 + varied * 34, 6  + rough * 10, rng);
        const mid   = hill(300, 16 + varied * 30, 10 + rough * 16, rng);
        const front = hill(345, 20 + varied * 26, 14 + rough * 22, rng);

        // Fog band from the strongest active belief (Prägung).
        const topBelief = profile.beliefs[0];
        let fog = '';
        if (topBelief && topBelief.activation >= 50) {
            const fo = (0.10 + (topBelief.activation - 50) / 100 * 0.22).toFixed(2);
            fog = `<rect x="0" y="300" width="${W}" height="70" fill="url(#hm-fog)" opacity="${fo}"/>`;
        }

        // Path of movement — the focus lights a way toward the orb.
        let path = '';
        if (profile.focus) {
            const startX = 220, startY = FLOOR - 8;
            const endX = orbX, endY = orbY + orbR + 6;
            const c1x = startX + 30, c1y = 330;
            const c2x = endX - 120, c2y = 250;
            path = `<path d="M ${startX},${startY} C ${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}"
                fill="none" stroke="var(--hm-gold)" stroke-width="2.5"
                stroke-linecap="round" stroke-dasharray="2 9" opacity="0.85"/>`;
        }

        return `<svg class="rv-scene__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"
            role="img" aria-label="Persönliches Sinnbild deiner inneren Landschaft" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="hm-sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#07070c"/>
                    <stop offset="0.55" stop-color="var(--hm-bg-elevated)"/>
                    <stop offset="1" stop-color="${warm}" stop-opacity="0.18"/>
                </linearGradient>
                <radialGradient id="hm-glow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stop-color="${warm}" stop-opacity="${glowOpacity}"/>
                    <stop offset="1" stop-color="${warm}" stop-opacity="0"/>
                </radialGradient>
                <radialGradient id="hm-orb" cx="0.4" cy="0.4" r="0.7">
                    <stop offset="0" stop-color="var(--hm-gold-lighter)"/>
                    <stop offset="0.6" stop-color="var(--hm-gold)"/>
                    <stop offset="1" stop-color="var(--hm-gold-dark)"/>
                </radialGradient>
                <linearGradient id="hm-fog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="var(--hm-text)" stop-opacity="0"/>
                    <stop offset="0.5" stop-color="var(--hm-text)"/>
                    <stop offset="1" stop-color="var(--hm-text)" stop-opacity="0"/>
                </linearGradient>
            </defs>

            <rect x="0" y="0" width="${W}" height="${H}" fill="url(#hm-sky)"/>
            ${stars}
            <circle cx="${orbX}" cy="${orbY}" r="${(orbR * 3.2).toFixed(0)}" fill="url(#hm-glow)"/>
            <circle cx="${orbX}" cy="${orbY}" r="${orbR.toFixed(0)}" fill="url(#hm-orb)"/>

            <path d="${back.path}"  fill="var(--area-denken)"    fill-opacity="0.16"/>
            <path d="${mid.path}"   fill="var(--area-balance)"   fill-opacity="0.22"/>
            ${fog}
            <path d="${front.path}" fill="var(--hm-bg)"          fill-opacity="0.96"/>
            ${path}
        </svg>`;
    }

    return { svg };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = SceneV2;
