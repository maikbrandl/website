/**
 * HUMAN MAP v2 — Kinematisches Sinnbild · SVG-Zwilling (§8 scene-svg.js)
 * Die vollständige Szene als Vektor: gestochen scharf, themebar, die Basis für Mobil
 * und den prefers-reduced-motion-Fallback. Baut EINEN großen SVG-Baum mit benannten
 * Knoten, die scene-timeline.js (Choreografie) und applyProfile.js (Daten) ansteuern.
 *
 * Öffentliche API:
 *   SceneSVG.build(hostEl) -> { svg, anchors }
 *   anchors: DOM-Positionsanker (viewBox-Koordinaten) für DOM-Hotspots/Overlay.
 *
 * Farbwelt aus den Website-Tokens (variables.css):
 *   gold #c9a84c · teal #58d4a0 · amber #f0a855 · coral #f07090 · sky #60a0e8 · violet #8b7cf8
 */
const SceneSVG = (() => {

    const VW = 1440, VH = 900;

    // Deterministic PRNG so the star/dust field is stable between renders.
    function mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let x = Math.imul(a ^ (a >>> 15), 1 | a);
            x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
    }

    const HZ = 470;   // horizon line

    // ── Distant light source (a low moon) ────────────────────────────
    function moon() {
        return `
        <g id="scene-moon">
            <circle cx="1086" cy="200" r="170" fill="url(#sc-moonglow)"/>
            <circle cx="1086" cy="200" r="48" fill="url(#sc-moon)"/>
            <circle cx="1072" cy="188" r="40" fill="#05060a" opacity="0.10"/>
        </g>`;
    }

    // ── Layered horizon ridges (depth) ───────────────────────────────
    function mountains() {
        return `
        <g id="scene-mountains">
            <path d="M0,${HZ} L0,432 C210,398 360,448 520,424 C700,398 858,452 1040,422 C1200,398 1330,440 1440,418 L1440,${HZ} Z"
                  fill="url(#sc-ridge-far)"/>
            <path d="M0,${HZ} L0,460 C250,434 430,478 630,450 C830,424 990,474 1190,450 C1310,436 1385,460 1440,450 L1440,${HZ} Z"
                  fill="url(#sc-ridge-near)"/>
        </g>`;
    }

    // ── Soft aurora band above the horizon ───────────────────────────
    function aurora() {
        return `
        <path id="scene-aurora"
              d="M-40,428 C300,388 520,452 760,412 C1000,372 1240,448 1480,406"
              fill="none" stroke="url(#sc-aurora)" stroke-width="130" stroke-linecap="round"
              opacity="0.14" filter="url(#sc-soft)"/>`;
    }

    // ── Star / dust field ────────────────────────────────────────────
    function starfield(rng) {
        let s = '';
        for (let i = 0; i < 140; i++) {
            const x = rng() * VW;
            const y = rng() * (HZ - 16);
            const r = (0.4 + rng() * 1.8).toFixed(1);
            const o = (0.12 + rng() * 0.62).toFixed(2);
            const d = (2 + rng() * 5).toFixed(1);
            s += `<circle class="scene-star" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" `
               + `fill="#fff" opacity="${o}" style="--tw:${d}s"/>`;
        }
        // slow floating light dust nearer the ground
        for (let i = 0; i < 40; i++) {
            const x = rng() * VW;
            const y = HZ + 24 + rng() * 380;
            const r = (1 + rng() * 2.6).toFixed(1);
            const o = (0.05 + rng() * 0.16).toFixed(2);
            s += `<circle class="scene-dust" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" `
               + `fill="var(--sc-gold)" opacity="${o}"/>`;
        }
        return s;
    }

    // ── A signpost at (x,y); scale gives depth (near = big, far = small) ──
    function signpost(id, x, y, dir, scale) {
        scale = scale || 1;
        const plateW = 178, plateH = 46, postH = 156;
        const left = dir === 'l';
        const plateX = left ? -plateW : 0;
        const arrow = left
            ? `0,${plateH / 2} -16,2 -16,${plateH - 2}`
            : `${plateW},${plateH / 2} ${plateW + 16},2 ${plateW + 16},${plateH - 2}`;
        const textX = left ? 30 : 34;
        const numX = left ? 14 : 16;
        const lampX = left ? plateW - 14 : 14;
        return `
        <g class="sc-sign__pos" transform="translate(${x},${y}) scale(${scale})">
          <g id="${id}" class="sc-sign" opacity="0">
            <ellipse class="sc-sign__shadow" cx="0" cy="6" rx="32" ry="8" fill="#000" opacity="0.4"/>
            <line x1="0" y1="2" x2="0" y2="${-postH}" stroke="url(#sc-postgrad)" stroke-width="9" stroke-linecap="round"/>
            <line x1="-2" y1="2" x2="-2" y2="${-postH}" stroke="#fff" stroke-width="1.4" opacity="0.18" stroke-linecap="round"/>
            <g transform="translate(${plateX}, ${-postH + 12})">
                <rect width="${plateW}" height="${plateH}" rx="10" fill="url(#sc-plategrad)"
                      stroke="var(--sc-gold)" stroke-width="1.6"/>
                <polygon points="${arrow}" fill="url(#sc-plategrad)" stroke="var(--sc-gold)" stroke-width="1.6"/>
                <circle class="sc-sign__lamp" cx="${lampX}" cy="${plateH / 2}" r="4.5" fill="var(--sc-gold-light)"/>
                <text class="sc-sign__num" x="${numX}" y="${plateH / 2 + 5}" fill="var(--sc-gold)"
                      font-family="var(--hm-font-sans, sans-serif)" font-size="16" font-weight="700">·</text>
                <text class="sc-sign__label" x="${textX}" y="${plateH / 2 + 5}" fill="#fff"
                      font-family="var(--hm-font-sans, sans-serif)" font-size="17" font-weight="600" letter-spacing="0.2">—</text>
            </g>
          </g>
        </g>`;
    }

    // ── Need lantern: kind = key | flame | rings ─────────────────────
    function lantern(id, x, y, kind, scale) {
        scale = scale || 1;
        let icon = '';
        if (kind === 'key') {
            icon = `<circle cx="0" cy="-7" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/>
                    <line x1="0" y1="-1" x2="0" y2="13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                    <line x1="0" y1="8" x2="6" y2="8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
                    <line x1="0" y1="13" x2="5" y2="13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
        } else if (kind === 'flame') {
            icon = `<path d="M0,-13 C6,-5 7,0 3.5,5 C9,3.5 7,-3.5 11,-1.5 C12,5 6.5,13 0,13 C-7,13 -11.5,6 -8,-1 C-5,2.5 -3.5,1.8 -2.6,-1.8 C-1.8,-6 -0.9,-9 0,-13 Z"
                    fill="currentColor" opacity="0.95"/>`;
        } else {
            icon = `<circle cx="-5.5" cy="0" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/>
                    <circle cx="5.5" cy="0" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/>`;
        }
        return `
        <g id="${id}" class="sc-lantern" transform="translate(${x},${y}) scale(${scale})">
            <ellipse cx="0" cy="46" rx="18" ry="6" fill="#000" opacity="0.3"/>
            <circle class="sc-lantern__glow" cx="0" cy="0" r="44" fill="url(#sc-lgrad)"/>
            <line x1="0" y1="44" x2="0" y2="18" stroke="url(#sc-postgrad)" stroke-width="4" stroke-linecap="round"/>
            <path class="sc-lantern__hook" d="M0,18 q10,-2 10,-14" fill="none" stroke="var(--sc-post)" stroke-width="2.4"/>
            <rect class="sc-lantern__housing" x="-14" y="-16" width="28" height="32" rx="6"
                  fill="url(#sc-plategrad)" stroke="var(--sc-gold)" stroke-width="1.3"/>
            <g class="sc-lantern__icon" transform="scale(0.85)">${icon}</g>
        </g>`;
    }

    // ── The luminous figure — a clear human silhouette, mid-stride ───
    function figure() {
        // Head (560,232) r36; feet ~656; right hand raised to compass (720,246),
        // left hand lowered to the mask (474,520). Faces slightly right.
        return `
        <g id="fig-figure" class="sc-figure">
            <!-- grounding contact shadow -->
            <ellipse cx="566" cy="660" rx="104" ry="17" fill="url(#sc-contact)"/>
            <!-- soft body aura -->
            <ellipse cx="560" cy="448" rx="140" ry="250" fill="url(#sc-figglow)" opacity="0.6"/>

            <!-- back leg (screen-left), planted -->
            <path class="sc-glass" d="M540,430 C531,502 527,566 531,636 C532,648 552,648 553,636
                C557,566 559,502 562,432 Z"/>
            <ellipse class="sc-glass" cx="540" cy="650" rx="22" ry="11"/>
            <!-- front leg (screen-right), stepping forward -->
            <path class="sc-glass" d="M566,430 C572,502 578,566 592,634 C595,647 615,644 613,632
                C603,566 596,502 592,432 Z"/>
            <ellipse class="sc-glass" cx="602" cy="648" rx="24" ry="11"/>

            <!-- torso: shoulders tapering to waist -->
            <path class="sc-glass sc-torso" d="M512,300
                C540,286 582,286 610,300
                C620,340 610,392 594,430
                L528,430
                C512,392 502,340 512,300 Z"/>

            <!-- inner core glow (the glass lets light through) -->
            <ellipse class="sc-core" cx="561" cy="372" rx="30" ry="96" fill="url(#sc-bodycore)"/>

            <!-- lowered arm (screen-left) carrying the mask -->
            <path class="sc-glass" d="M520,306 C500,362 486,436 480,506
                C479,516 495,518 500,508 C510,440 524,368 544,320 Z"/>
            <!-- raised arm (screen-right) lifting the compass -->
            <path class="sc-glass" d="M600,300 C642,286 684,268 710,250
                C717,245 724,255 718,261 C690,282 648,304 606,322 Z"/>

            <!-- neck + head -->
            <path class="sc-glass" d="M547,268 h26 l3,-8 h-32 Z"/>
            <circle class="sc-glass sc-head" cx="560" cy="232" r="37"/>
            <!-- rim light down the lit side -->
            <path class="sc-rim" d="M594,206 C612,224 612,252 596,270" fill="none"/>
            <circle class="sc-rim" cx="560" cy="232" r="37" fill="none"/>

            <!-- brain motif inside the head (pulses) -->
            <g id="fig-brain" transform="translate(560,232)">
                <circle class="sc-brain__core" r="27"/>
                <g class="sc-brain__gyri" fill="none" stroke="var(--sc-brain)" stroke-width="2.1" stroke-linecap="round">
                    <path d="M-20,-6 C-14,-15 -5,-15 -2,-6 C1,-15 11,-15 16,-6"/>
                    <path d="M-22,3 C-14,-4 -7,2 -2,-3 C3,2 11,-4 20,2"/>
                    <path d="M-16,11 C-9,5 -2,11 2,6 C7,11 12,7 16,11"/>
                    <path d="M0,-13 L0,13" opacity="0.45"/>
                </g>
            </g>
        </g>`;
    }

    // ── The mask in the lowered hand, with the true face behind ─────
    function maskAndFace() {
        return `
        <g id="fig-maskpos" transform="translate(474,520)">
          <g id="fig-maskgroup">
            <ellipse class="sc-mask__glow" cx="0" cy="0" rx="52" ry="62" fill="url(#sc-lgrad)" opacity="0.5"/>
            <!-- true face behind (shimmers up when the mask lowers) -->
            <g id="fig-face" opacity="0.0">
                <ellipse cx="0" cy="0" rx="30" ry="40" fill="url(#sc-facegrad)"/>
                <circle cx="-10" cy="-6" r="3" fill="#fff" opacity="0.85"/>
                <circle cx="10" cy="-6" r="3" fill="#fff" opacity="0.85"/>
                <path d="M-11,14 C-4,20 4,20 11,14" stroke="#fff" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>
            </g>
            <!-- theatrical mask (carries the belief text) -->
            <g id="fig-mask">
                <ellipse cx="0" cy="0" rx="33" ry="43" fill="url(#sc-maskgrad)"
                         stroke="var(--sc-gold)" stroke-width="1.6"/>
                <path d="M-14,-8 C-9,-13 -3,-13 0,-9 C3,-13 9,-13 14,-8" fill="none"
                      stroke="var(--sc-gold)" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
                <path d="M-12,12 C-5,7 5,7 12,12" fill="none"
                      stroke="var(--sc-gold)" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
                <line x1="0" y1="-20" x2="0" y2="22" stroke="var(--sc-gold)" stroke-width="0.8" opacity="0.3"/>
            </g>
          </g>
        </g>`;
    }

    // ── The compass in the raised hand, with a beam onto one path ────
    function compass() {
        return `
        <g id="fig-compass" transform="translate(720,246)">
            <circle class="sc-compass__glow" r="46" fill="url(#sc-lgrad)"/>
            <circle r="28" fill="url(#sc-plategrad)" stroke="var(--sc-gold)" stroke-width="2"/>
            <circle r="28" class="sc-rim" fill="none"/>
            <g stroke="var(--sc-gold)" stroke-width="1" opacity="0.35">
                <line x1="0" y1="-24" x2="0" y2="-20"/><line x1="0" y1="24" x2="0" y2="20"/>
                <line x1="-24" y1="0" x2="-20" y2="0"/><line x1="24" y1="0" x2="20" y2="0"/>
            </g>
            <g id="fig-needle">
                <polygon points="0,-21 5,0 0,6 -5,0" fill="var(--sc-gold-light)"/>
                <polygon points="0,21 5,0 0,-6 -5,0" fill="var(--sc-post)" opacity="0.85"/>
            </g>
            <circle r="3" fill="#fff"/>
        </g>`;
    }

    // ── Beam of light from the compass onto the focus path (own layer) ──
    function beam() {
        return `
        <g id="fig-beam" opacity="0">
            <path id="fig-beam__ray" d="M720,246 L700,556 L740,556 Z" fill="url(#sc-beamgrad)"/>
        </g>`;
    }

    // ── Winding luminous road with graceful branch forks ────────────
    function paths() {
        return `
        <g id="scene-paths">
            <!-- main road ribbon: foreground → vanishing point (~603,474) -->
            <path id="path-main" d="M340,900
                C398,772 532,600 596,474 L610,474
                C686,600 852,772 900,900 Z" fill="url(#sc-road)"/>
            <!-- glowing road edges -->
            <path class="sc-road__edge" d="M340,900 C398,772 532,600 596,474" fill="none"
                  stroke="var(--sc-gold)" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
            <path class="sc-road__edge" d="M900,900 C852,772 686,600 610,474" fill="none"
                  stroke="var(--sc-gold)" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

            <!-- branch forks (each leads to a signpost) -->
            <path class="sc-fork" id="fork-1" d="M690,596 C760,600 820,606 876,614 C822,620 762,616 698,610 Z"
                  fill="url(#sc-pathgrad)" opacity="0.5"/>
            <path class="sc-fork" id="fork-2" d="M672,542 C800,542 900,542 996,540 C902,550 802,550 678,552 Z"
                  fill="url(#sc-pathgrad)" opacity="0.44"/>
            <path class="sc-fork" id="fork-3" d="M636,506 C520,506 420,506 330,504 C422,514 522,514 640,514 Z"
                  fill="url(#sc-pathgrad)" opacity="0.4"/>
            <path class="sc-fork" id="fork-4" d="M648,490 C860,490 1000,490 1116,488 C1002,498 862,498 652,498 Z"
                  fill="url(#sc-pathgrad)" opacity="0.38"/>

            <!-- glowing centre dashes running up the road -->
            <path id="path-line" d="M603,880 C598,760 601,600 601,478" stroke="var(--sc-gold)"
                  stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="2 15" opacity="0.8"/>
        </g>`;
    }

    // ── Footprints receding up the road behind the figure ───────────
    function footprints() {
        let f = '';
        // [x, y, size] — smaller with distance
        const steps = [[560, 662, 1], [592, 630, 0.9], [568, 604, 0.8], [598, 578, 0.7], [578, 556, 0.62], [604, 536, 0.55]];
        steps.forEach((p, i) => {
            const rx = (10 * p[2]).toFixed(1), ry = (15 * p[2]).toFixed(1);
            f += `<ellipse class="sc-foot" data-step="${i}" cx="${p[0]}" cy="${p[1]}" rx="${rx}" ry="${ry}"
                   fill="var(--sc-gold)" opacity="0" transform="rotate(${i % 2 ? 10 : -10} ${p[0]} ${p[1]})"/>`;
        });
        return `<g id="footprints">${f}</g>`;
    }

    function defs() {
        return `
        <defs>
            <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#04050a"/>
                <stop offset="0.4" stop-color="#080a12"/>
                <stop offset="0.72" stop-color="#111524"/>
                <stop offset="1" stop-color="#1a2036"/>
            </linearGradient>
            <radialGradient id="sc-horizon" cx="0.5" cy="0.52" r="0.62">
                <stop offset="0" stop-color="var(--sc-teal)" stop-opacity="0.20"/>
                <stop offset="0.45" stop-color="var(--sc-gold)" stop-opacity="0.09"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="sc-ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#141a2a"/>
                <stop offset="0.5" stop-color="#0b0d16"/>
                <stop offset="1" stop-color="#070810"/>
            </linearGradient>
            <radialGradient id="sc-moon" cx="0.42" cy="0.4" r="0.62">
                <stop offset="0" stop-color="#fff8e8"/>
                <stop offset="0.7" stop-color="var(--sc-gold-light)"/>
                <stop offset="1" stop-color="var(--sc-gold)"/>
            </radialGradient>
            <radialGradient id="sc-moonglow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="var(--sc-gold-light)" stop-opacity="0.34"/>
                <stop offset="0.5" stop-color="var(--sc-gold)" stop-opacity="0.08"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="sc-ridge-far" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#26304a"/>
                <stop offset="1" stop-color="#141a2a"/>
            </linearGradient>
            <linearGradient id="sc-ridge-near" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#1a2136"/>
                <stop offset="1" stop-color="#0c101c"/>
            </linearGradient>
            <linearGradient id="sc-aurora" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="var(--sc-teal)" stop-opacity="0"/>
                <stop offset="0.4" stop-color="var(--sc-teal)"/>
                <stop offset="0.7" stop-color="var(--sc-gold)"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="sc-road" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stop-color="var(--sc-gold)" stop-opacity="0.30"/>
                <stop offset="0.55" stop-color="var(--sc-gold)" stop-opacity="0.14"/>
                <stop offset="1" stop-color="var(--sc-gold-light)" stop-opacity="0.05"/>
            </linearGradient>
            <linearGradient id="sc-pathgrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stop-color="var(--sc-gold)" stop-opacity="0.30"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0.03"/>
            </linearGradient>
            <radialGradient id="sc-figglow" cx="0.5" cy="0.38" r="0.6">
                <stop offset="0" stop-color="var(--sc-teal)" stop-opacity="0.42"/>
                <stop offset="1" stop-color="var(--sc-teal)" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="sc-glassgrad" x1="0.15" y1="0" x2="0.75" y2="1">
                <stop offset="0" stop-color="#eafcff" stop-opacity="0.30"/>
                <stop offset="0.5" stop-color="var(--sc-teal)" stop-opacity="0.18"/>
                <stop offset="1" stop-color="var(--sc-sky)" stop-opacity="0.24"/>
            </linearGradient>
            <radialGradient id="sc-bodycore" cx="0.5" cy="0.4" r="0.55">
                <stop offset="0" stop-color="#eafcff" stop-opacity="0.42"/>
                <stop offset="0.6" stop-color="var(--sc-teal)" stop-opacity="0.14"/>
                <stop offset="1" stop-color="var(--sc-teal)" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="sc-contact" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="#000" stop-opacity="0.55"/>
                <stop offset="1" stop-color="#000" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="sc-braingrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="var(--sc-brain-light)"/>
                <stop offset="0.6" stop-color="var(--sc-brain)"/>
                <stop offset="1" stop-color="var(--sc-brain)" stop-opacity="0.25"/>
            </radialGradient>
            <radialGradient id="sc-lgrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stop-color="var(--sc-gold-light)" stop-opacity="0.9"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="sc-plategrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#222634"/>
                <stop offset="1" stop-color="#10121a"/>
            </linearGradient>
            <linearGradient id="sc-postgrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#3a4152"/>
                <stop offset="0.5" stop-color="#5a6274"/>
                <stop offset="1" stop-color="#2a303e"/>
            </linearGradient>
            <linearGradient id="sc-maskgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#222634"/>
                <stop offset="1" stop-color="#12141b"/>
            </linearGradient>
            <radialGradient id="sc-facegrad" cx="0.5" cy="0.4" r="0.6">
                <stop offset="0" stop-color="var(--sc-gold-light)" stop-opacity="0.85"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0.1"/>
            </radialGradient>
            <linearGradient id="sc-beamgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="var(--sc-gold-light)" stop-opacity="0.5"/>
                <stop offset="1" stop-color="var(--sc-gold)" stop-opacity="0.02"/>
            </linearGradient>
            <filter id="sc-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6"/>
            </filter>
            <filter id="sc-bloom" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>`;
    }

    function build(host) {
        const rng = mulberry32(20260805);
        const svg = `
        <svg id="scene-svg" class="scene-svg" viewBox="0 0 ${VW} ${VH}"
             preserveAspectRatio="xMidYMid slice" role="img"
             aria-label="Sinnbild deiner inneren Landschaft" xmlns="http://www.w3.org/2000/svg">
            ${defs()}
            <g id="layer-bg">
                <rect x="0" y="0" width="${VW}" height="${VH}" fill="url(#sc-sky)"/>
                ${moon()}
                <g id="layer-stars">${starfield(rng)}</g>
                ${aurora()}
                ${mountains()}
                <rect x="0" y="${HZ}" width="${VW}" height="${VH - HZ}" fill="url(#sc-ground)"/>
                <rect x="0" y="0" width="${VW}" height="${VH}" fill="url(#sc-horizon)"/>
            </g>
            ${paths()}
            ${footprints()}
            <g id="layer-beam" filter="url(#sc-soft)">${beam()}</g>
            <g id="layer-lanterns" filter="url(#sc-bloom)">
                ${lantern('need-key', 410, 680, 'key', 1)}
                ${lantern('need-flame', 250, 586, 'flame', 0.72)}
                ${lantern('need-rings', 612, 556, 'rings', 0.64)}
            </g>
            <g id="layer-signs">
                ${signpost('sign-1', 880, 618, 'r', 0.95)}
                ${signpost('sign-2', 1000, 545, 'r', 0.72)}
                ${signpost('sign-3', 330, 505, 'l', 0.62)}
                ${signpost('sign-4', 1120, 490, 'r', 0.5)}
            </g>
            <g id="layer-figure" filter="url(#sc-bloom)">
                ${figure()}
                ${maskAndFace()}
                ${compass()}
            </g>
        </svg>`;
        host.innerHTML = svg;

        // Anchor points (viewBox coords) for DOM hotspots / captions.
        const anchors = {
            terrain:      { x: 560, y: 232 },   // head / brain
            praegung:     { x: 474, y: 520 },   // mask
            werte:        { x: 900, y: 560 },   // the nearest signpost
            sinn:         { x: 720, y: 246 },   // compass
            beduerfnisse: { x: 410, y: 680 },   // a lantern
            bewegung:     { x: 584, y: 600 },   // footprints on the road
        };
        return { svg: host.querySelector('#scene-svg'), anchors, VW, VH };
    }

    return { build, VW, VH };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { SceneSVG };
