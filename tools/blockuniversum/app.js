'use strict';

// ─── 1. CONSTANTS & CONFIGURATION ────────────────────────────────────

var DPR = window.devicePixelRatio || 1;

var LEVELS = [
    { value: 20,  name: 'Scham',      color: '#E24B4A', lines: 1,  quote: 'Scham ist der dichteste Zustand. Das Nervensystem ist vollständig im Überlebensmodus — nahezu keine Bandbreite für neue Möglichkeiten.' },
    { value: 100, name: 'Angst',      color: '#D85A30', lines: 3,  quote: 'Angst erzeugt nachweislich chaotische neuronale Muster. Das Nervensystem im Stressmodus sieht buchstäblich weniger Möglichkeiten — nicht metaphorisch.' },
    { value: 175, name: 'Stolz',      color: '#BA7517', lines: 5,  quote: 'Stolz gibt Stabilität, begrenzt aber durch das Bedürfnis, im Recht zu bleiben. Der Korridor ist schmaler als er wirkt.' },
    { value: 200, name: 'Mut',        color: '#3B9B1A', lines: 9,  quote: 'Ab Ebene 200 wird das System expansiv. Neue Menschen, Chancen und Ideen tauchen im Radar auf — nicht weil sie neu entstanden sind, sondern weil das System sie jetzt sehen kann.' },
    { value: 350, name: 'Akzeptanz',  color: '#1A9E7E', lines: 15, quote: 'Akzeptanz öffnet den Korridor weit. Nicht Resignation — sondern die Fähigkeit, die Realität klar zu sehen und von dort aus zu handeln.' },
    { value: 500, name: 'Liebe',      color: '#3A8FD0', lines: 21, quote: 'Kohärente Herzratenvariabilität, synchronisierte Gamma-Wellen im EEG: Liebe und Dankbarkeit öffnen das System für weitaus mehr Weltlinien.' },
    { value: 540, name: 'Freude',     color: '#7A6FD8', lines: 27, quote: 'Freude als Grundzustand — nicht als Reaktion — entspricht einem Zustand maximaler neuronaler Synchronisation. Intuition wird verlässlich.' },
    { value: 600, name: 'Frieden',    color: '#5855B8', lines: 33, quote: 'Stille Gewissheit. Frieden ist kein Gefühlszustand, sondern ein Bewusstseinszustand. 33 Weltlinien — nahezu alle Möglichkeiten im Block sind erreichbar.' },
];

var STATE_QUOTES = {
    fear:    'Niedrige Frequenz = enger Korridor. Das Nervensystem im Überlebensmodus filtert aktiv Möglichkeiten heraus, die nicht zur aktuellen Bedrohungslage passen. Radikale Veränderung fühlt sich buchstäblich unmöglich an.',
    courage: 'Ab Ebene 200 (Mut) wird das System expansiv. Moderate Spurwechsel werden möglich. Neue Menschen, Chancen und Ideen tauchen im Radar auf — nicht weil sie neu entstanden sind, sondern weil das System sie jetzt sehen kann.',
    love:    'Maximale Kohärenz. Das, was andere als Glück, Zufall oder Synchronizität bezeichnen, ist aus dieser Perspektive etwas anderes: stochastische Resonanz mit einer weit entfernten Weltlinie.',
};

var TRACK_STATES = {
    fear:    { reach: 1, color: '#D85A30' },
    courage: { reach: 4, color: '#3B9B1A' },
    love:    { reach: 7, color: '#3A8FD0' },
};

// ─── 2. UTILITIES ──────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function setupCanvas(canvas) {
    var wrap = canvas.parentElement;
    var w = Math.max(wrap.offsetWidth || 400, 100);
    var h = parseInt(canvas.dataset.height || '400', 10);
    canvas.width  = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    return { ctx: ctx, w: w, h: h };
}

// ─── 3. CANVAS 1: BLOCK UNIVERSE ──────────────────────────────────────

function initBlockUniverse() {
    var canvas = document.getElementById('canvas-block');
    if (!canvas) return;

    var s = setupCanvas(canvas);
    var ctx = s.ctx, W = s.w, H = s.h;

    var nowProgress = 0;
    var hoveredLine  = -1;
    var animId = null;
    var isVisible = false;
    var lastTs = null;
    var N_LINES = 7;

    function geometry(w, h) {
        var bw = w * 0.66;
        var bh = h * 0.50;
        var ox = bw * 0.20;
        var oy = bh * 0.32;
        var cx = w * 0.44;
        var cy = h * 0.52;
        var A = [cx - bw / 2, cy - bh / 2];
        var B = [cx + bw / 2, cy - bh / 2];
        var C = [cx + bw / 2, cy + bh / 2];
        var D = [cx - bw / 2, cy + bh / 2];
        var E = [A[0] + ox, A[1] - oy];
        var F = [B[0] + ox, B[1] - oy];
        var G = [C[0] + ox, C[1] - oy];
        return { A:A, B:B, C:C, D:D, E:E, F:F, G:G, bw:bw, bh:bh };
    }

    function face(ctx, pts, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        if (fill)   { ctx.fillStyle = fill;     ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.75; ctx.stroke(); }
    }

    function lineY(i, A, bh) {
        var pad = 18;
        return A[1] + pad + (i / (N_LINES - 1)) * (bh - pad * 2);
    }

    function draw(ts) {
        if (!isVisible) { animId = null; return; }
        if (lastTs !== null) {
            var dt = (ts - lastTs) / 1000;
            nowProgress += dt * 0.035;
            if (nowProgress > 1) nowProgress = 0;
        }
        lastTs = ts;

        ctx.clearRect(0, 0, W, H);
        var g = geometry(W, H);
        var A = g.A, B = g.B, C = g.C, D = g.D, E = g.E, F = g.F, Gv = g.G;

        // Faces
        face(ctx, [B, F, Gv, C], 'rgba(255,255,255,0.02)',  'rgba(255,255,255,0.07)');
        face(ctx, [A, E, F,  B], 'rgba(255,255,255,0.035)', 'rgba(255,255,255,0.07)');
        face(ctx, [A, B, C,  D], 'rgba(255,255,255,0.012)', 'rgba(255,255,255,0.07)');

        // World lines on front face
        var mid = Math.floor(N_LINES / 2);
        for (var i = 0; i < N_LINES; i++) {
            var y = lineY(i, A, g.bh);
            if (i === mid) {
                // Animated sine wave — gold
                var amp = 3;
                ctx.beginPath();
                for (var px = 0; px <= g.bw; px += 2) {
                    var phase = (px / g.bw) * Math.PI * 4;
                    var wy = y + Math.sin(phase + nowProgress * Math.PI * 2) * amp;
                    if (px === 0) ctx.moveTo(A[0] + px, wy);
                    else          ctx.lineTo(A[0] + px, wy);
                }
                ctx.strokeStyle = '#c9a84c';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                var hovered = (i === hoveredLine);
                ctx.beginPath();
                ctx.moveTo(A[0], y);
                ctx.lineTo(B[0], y);
                ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.10)';
                ctx.lineWidth   = hovered ? 1.25 : 0.75;
                ctx.stroke();
                if (hovered) {
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.font = '11px Inter, sans-serif';
                    ctx.textAlign = 'right';
                    ctx.fillText('Weltlinie ' + (i + 1), B[0] - 6, y - 4);
                    ctx.textAlign = 'left';
                }
            }
        }

        // "Now" cursor — vertical dashed line
        var nowX = A[0] + nowProgress * g.bw;
        ctx.beginPath();
        ctx.moveTo(nowX, A[1] + 6);
        ctx.lineTo(nowX, C[1] - 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot on middle line
        var midY = lineY(mid, A, g.bh);
        var sineY = midY + Math.sin(nowProgress * Math.PI * 2) * 3;

        var grd = ctx.createRadialGradient(nowX, sineY, 0, nowX, sineY, 16);
        grd.addColorStop(0, 'rgba(201,168,76,0.3)');
        grd.addColorStop(1, 'rgba(201,168,76,0)');
        ctx.beginPath();
        ctx.arc(nowX, sineY, 16, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nowX, sineY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c9a84c';
        ctx.fill();

        // "Jetzt" label
        ctx.fillStyle = 'rgba(201,168,76,0.65)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Jetzt', nowX, A[1] - 6);

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.20)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Vergangenheit', A[0] + 42, D[1] + 16);
        ctx.fillText('Zukunft',       B[0] - 38, C[1] + 16);
        ctx.textAlign = 'left';

        animId = requestAnimationFrame(draw);
    }

    // Mouse hover
    canvas.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var g = geometry(W, H);
        if (mx < g.A[0] || mx > g.B[0]) { hoveredLine = -1; return; }
        var closest = -1, minDist = 18;
        for (var i = 0; i < N_LINES; i++) {
            var d = Math.abs(my - lineY(i, g.A, g.bh));
            if (d < minDist) { minDist = d; closest = i; }
        }
        hoveredLine = closest;
    });
    canvas.addEventListener('mouseleave', function () { hoveredLine = -1; });

    // Visibility
    var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animId) { lastTs = null; animId = requestAnimationFrame(draw); }
        else if (!isVisible && animId) { cancelAnimationFrame(animId); animId = null; }
    }, { threshold: 0.1 });
    obs.observe(canvas);

    // Resize
    window.addEventListener('resize', function () {
        var ns = setupCanvas(canvas); ctx = ns.ctx; W = ns.w; H = ns.h;
    });
}

// ─── 4. CANVAS 2: FREQUENCY ACCESS ───────────────────────────────────

function initFrequencyAccess() {
    var canvas    = document.getElementById('canvas-access');
    var slider    = document.getElementById('freq-slider');
    var nameEl    = document.getElementById('levelName');
    var valueEl   = document.getElementById('levelValue');
    var linesEl   = document.getElementById('levelLines');
    var quoteEl   = document.getElementById('level-quote');
    if (!canvas || !slider) return;

    var s = setupCanvas(canvas);
    var ctx = s.ctx, W = s.w, H = s.h;

    var N = 33;
    var currentIdx = parseInt(slider.value, 10);
    var targetIdx  = currentIdx;
    var animProg   = 1;
    var prevLines  = LEVELS[currentIdx].lines;
    var animId     = null;
    var isVisible  = false;
    var lastTs     = null;

    function lineX(i, w) {
        var pad = 14;
        return pad + (i / (N - 1)) * (w - pad * 2);
    }

    function render(prog) {
        ctx.clearRect(0, 0, W, H);
        var level = LEVELS[targetIdx];
        var blended = Math.round(lerp(prevLines, level.lines, prog));
        var mid = Math.floor(N / 2);

        for (var i = 0; i < N; i++) {
            var x = lineX(i, W);
            var dist = Math.abs(i - mid);
            var accessible = dist <= Math.floor(blended / 2);
            ctx.beginPath();
            ctx.moveTo(x, 14);
            ctx.lineTo(x, H - 14);
            if (accessible) {
                var fade = 0.25 + 0.45 * prog;
                var width = Math.max(0.5, 1.5 - (dist / (N / 2)) * 0.8);
                ctx.globalAlpha = fade;
                ctx.strokeStyle = level.color;
                ctx.lineWidth   = width;
            } else {
                ctx.globalAlpha = Math.max(0.035, 0.15 * (1 - prog));
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth   = 0.5;
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Center dot
        var cx = lineX(mid, W);
        var cy = H / 2;
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
        grd.addColorStop(0, level.color + '55');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = level.color; ctx.globalAlpha = 0.5 + 0.5 * prog;
        ctx.fill(); ctx.globalAlpha = 1;
    }

    function tick(ts) {
        if (!isVisible) { animId = null; return; }
        if (lastTs !== null && animProg < 1) {
            animProg = Math.min(1, animProg + (ts - lastTs) / 400);
        }
        lastTs = ts;
        render(animProg);
        if (animProg < 1) {
            animId = requestAnimationFrame(tick);
        } else {
            prevLines  = LEVELS[targetIdx].lines;
            currentIdx = targetIdx;
            animId = null;
        }
    }

    function updateLevel(idx) {
        prevLines  = LEVELS[currentIdx].lines;
        targetIdx  = idx;
        animProg   = 0;
        lastTs     = null;
        var lv = LEVELS[idx];
        nameEl.textContent  = lv.name;
        valueEl.textContent = 'Hawkins-Ebene: ' + lv.value;
        linesEl.textContent = lv.lines + ' Weltlinie' + (lv.lines !== 1 ? 'n' : '') + ' erreichbar';
        if (quoteEl) quoteEl.textContent = lv.quote;
        nameEl.style.color = lv.color;
        if (!animId) { lastTs = null; animId = requestAnimationFrame(tick); }
    }

    slider.addEventListener('input', function () { updateLevel(parseInt(this.value, 10)); });

    var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible) render(animProg);
    }, { threshold: 0.1 });
    obs.observe(canvas);

    window.addEventListener('resize', function () {
        var ns = setupCanvas(canvas); ctx = ns.ctx; W = ns.w; H = ns.h;
        render(animProg);
    });

    updateLevel(currentIdx);
}

// ─── 5. CANVAS 3: TRACK SWITCHER ──────────────────────────────────────

function initTrackSwitcher() {
    var canvas      = document.getElementById('canvas-track');
    var stateButtons = document.querySelectorAll('.state-btn');
    var quoteEl     = document.getElementById('state-quote');
    if (!canvas) return;

    var s = setupCanvas(canvas);
    var ctx = s.ctx, W = s.w, H = s.h;

    var N_TRACKS   = 15;
    var MID        = 7;   // 0-indexed center
    var curState   = 'fear';
    var objTrack   = MID;
    var targetTrack = MID;
    var fromTrack   = MID;
    var switchProg  = 1;
    var objX        = 40;
    var animId      = null;
    var isVisible   = false;
    var lastTs      = null;
    var particles   = [];
    var trail       = [];

    function trackY(t) {
        var pad = 18;
        return pad + (t / (N_TRACKS - 1)) * (H - pad * 2);
    }

    function objY() {
        if (switchProg >= 1) return trackY(objTrack);
        return lerp(trackY(fromTrack), trackY(targetTrack), easeInOut(switchProg));
    }

    function spawnParticles(x, y) {
        for (var i = 0; i < 8; i++) {
            var angle = (i / 8) * Math.PI * 2;
            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * (2.5 + Math.random() * 2),
                vy: Math.sin(angle) * (2.5 + Math.random() * 2),
                alpha: 0.9
            });
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);
        var sd = TRACK_STATES[curState];
        var reach = sd.reach;

        // Tracks
        for (var i = 0; i < N_TRACKS; i++) {
            var y = trackY(i);
            var dist = Math.abs(i - objTrack);
            var reachable = dist <= reach;
            ctx.beginPath();
            ctx.moveTo(20, y);
            ctx.lineTo(W - 20, y);

            if (curState === 'love' && reachable) {
                var t = i / (N_TRACKS - 1);
                var r = Math.round(lerp(0x18, 0xc9, t));
                var g = Math.round(lerp(0x5f, 0xa8, t));
                var b = Math.round(lerp(0xa5, 0x4c, t));
                ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.55)';
                ctx.lineWidth = 1.25;
            } else if (i === objTrack) {
                ctx.strokeStyle = sd.color;
                ctx.lineWidth = 1.5;
            } else if (reachable) {
                ctx.strokeStyle = sd.color + '55';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.04)';
                ctx.lineWidth = 0.5;
            }
            ctx.stroke();
        }

        // Reach boundary rect
        if (curState !== 'love' && reach > 0) {
            var top = Math.max(0, objTrack - reach);
            var bot = Math.min(N_TRACKS - 1, objTrack + reach);
            ctx.beginPath();
            ctx.rect(18, trackY(top) - 10, W - 36, trackY(bot) - trackY(top) + 20);
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = sd.color + '44';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Trail (love only)
        if (curState === 'love') {
            for (var ti = 0; ti < trail.length; ti++) {
                var pt = trail[ti];
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = sd.color;
                ctx.globalAlpha = Math.max(0, 1 - pt.age / 500) * 0.4;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // Particles
        for (var pi = 0; pi < particles.length; pi++) {
            var p = particles[pi];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = sd.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Object
        var ox = objX, oy = objY();
        var grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 20);
        grd.addColorStop(0, sd.color + '55');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(ox, oy, 20, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI * 2);
        ctx.fillStyle = sd.color; ctx.fill();
        ctx.beginPath(); ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill();
    }

    function tick(ts) {
        if (!isVisible) { animId = null; return; }
        if (lastTs !== null) {
            var dt = Math.min(0.05, (ts - lastTs) / 1000);

            // Move object rightward, wrap
            objX += 20 * dt;
            if (objX > W - 20) objX = 22;

            // Switch progress
            if (switchProg < 1) {
                switchProg = Math.min(1, switchProg + dt / 0.6);
                if (switchProg >= 1) {
                    objTrack = targetTrack;
                    spawnParticles(objX, trackY(objTrack));
                }
            }

            // Particles
            for (var i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].vx;
                particles[i].y += particles[i].vy;
                particles[i].alpha -= 0.045;
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }

            // Trail
            if (curState === 'love') {
                trail.push({ x: objX, y: objY(), age: 0 });
                for (var j = trail.length - 1; j >= 0; j--) {
                    trail[j].age += dt * 1000;
                    if (trail[j].age > 500) trail.splice(j, 1);
                }
            } else {
                trail = [];
            }
        }
        lastTs = ts;
        drawFrame();
        animId = requestAnimationFrame(tick);
    }

    // Click to switch tracks
    canvas.addEventListener('click', function (e) {
        var rect = canvas.getBoundingClientRect();
        var my = e.clientY - rect.top;
        var clicked = -1, minD = 18;
        for (var i = 0; i < N_TRACKS; i++) {
            var d = Math.abs(my - trackY(i));
            if (d < minD) { minD = d; clicked = i; }
        }
        if (clicked < 0 || clicked === objTrack) return;
        var reach = TRACK_STATES[curState].reach;
        if (Math.abs(clicked - objTrack) <= reach) {
            fromTrack   = objTrack;
            targetTrack = clicked;
            switchProg  = 0;
        } else {
            // Visual feedback: brief border flash
            canvas.style.outline = '1px solid rgba(239,68,68,0.5)';
            setTimeout(function () { canvas.style.outline = ''; }, 280);
        }
    });

    // State buttons
    stateButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            stateButtons.forEach(function (b) { b.classList.remove('state-btn--active'); });
            btn.classList.add('state-btn--active');
            curState = btn.dataset.state;
            trail = [];
            if (quoteEl) quoteEl.textContent = STATE_QUOTES[curState];
        });
    });

    var obs = new IntersectionObserver(function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animId) { lastTs = null; animId = requestAnimationFrame(tick); }
        else if (!isVisible && animId) { cancelAnimationFrame(animId); animId = null; }
    }, { threshold: 0.1 });
    obs.observe(canvas);

    window.addEventListener('resize', function () {
        var ns = setupCanvas(canvas); ctx = ns.ctx; W = ns.w; H = ns.h;
    });
}

// ─── 6. PROTOCOL STEPPER ──────────────────────────────────────────────

function initProtocol() {
    var steps      = Array.from(document.querySelectorAll('.protocol-step'));
    var prevBtn    = document.getElementById('protocolPrev');
    var nextBtn    = document.getElementById('protocolNext');
    var counter    = document.getElementById('protocolCounter');
    var conclusion = document.getElementById('protocolConclusion');
    if (!steps.length) return;

    var active = 0;

    function goTo(idx) {
        steps[active].classList.remove('protocol-step--active');
        active = Math.max(0, Math.min(steps.length - 1, idx));
        steps[active].classList.add('protocol-step--active');
        steps[active].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        prevBtn.disabled   = (active === 0);
        nextBtn.textContent = (active === steps.length - 1) ? 'Abgeschlossen ✓' : 'Weiter ►';
        counter.textContent = (active + 1) + ' / ' + steps.length;
        if (conclusion && active === steps.length - 1) {
            conclusion.hidden = false;
            conclusion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    prevBtn.addEventListener('click', function () { goTo(active - 1); });
    nextBtn.addEventListener('click', function () { if (active < steps.length - 1) goTo(active + 1); });
    goTo(0);
}

// ─── 7. BREATH TIMER ──────────────────────────────────────────────────

function initBreathTimer() {
    var btn       = document.getElementById('breathBtn');
    var labelEl   = document.getElementById('breathLabel');
    var roundsEl  = document.getElementById('breathRounds');
    var ringFill  = document.getElementById('breathRingFill');
    if (!btn) return;

    var CIRC = 2 * Math.PI * 50; // r=50 → ≈314
    var PHASES = [
        { name: 'Einatmen', dur: 4 },
        { name: 'Halten',   dur: 7 },
        { name: 'Ausatmen', dur: 8 },
    ];
    var ROUNDS = 3;

    var running  = false;
    var round    = 0;
    var phase    = 0;
    var elapsed  = 0;
    var lastTs   = null;
    var animId   = null;

    function setRing(prog) {
        ringFill.style.strokeDashoffset = CIRC * (1 - Math.max(0, Math.min(1, prog)));
    }

    function reset() {
        running = false; round = 0; phase = 0; elapsed = 0; lastTs = null;
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        setRing(0);
        labelEl.textContent  = '4–7–8';
        roundsEl.textContent = '3 Runden';
        btn.textContent      = 'Timer starten';
    }

    function tick(ts) {
        if (!running) return;
        if (lastTs !== null) {
            var dt = (ts - lastTs) / 1000;
            elapsed += dt;
            var p = PHASES[phase];
            setRing(elapsed / p.dur);
            if (elapsed >= p.dur) {
                elapsed = 0;
                phase++;
                if (phase >= PHASES.length) {
                    phase = 0;
                    round++;
                    if (round >= ROUNDS) {
                        running = false;
                        setRing(1);
                        labelEl.textContent  = 'Fertig ✓';
                        roundsEl.textContent = 'Abgeschlossen';
                        btn.textContent      = 'Nochmal';
                        return;
                    }
                    roundsEl.textContent = 'Runde ' + (round + 1) + ' von ' + ROUNDS;
                }
                labelEl.textContent = PHASES[phase].name + ' (' + PHASES[phase].dur + 's)';
            }
        }
        lastTs = ts;
        animId = requestAnimationFrame(tick);
    }

    btn.addEventListener('click', function () {
        if (btn.textContent === 'Nochmal' || !running) {
            reset();
            running = true;
            lastTs  = null;
            labelEl.textContent  = PHASES[0].name + ' (' + PHASES[0].dur + 's)';
            roundsEl.textContent = 'Runde 1 von ' + ROUNDS;
            btn.textContent      = 'Abbrechen';
            animId = requestAnimationFrame(tick);
        } else {
            reset();
        }
    });
}

// ─── 8. SCROLL OBSERVER (header dots) ─────────────────────────────────

function initScrollObserver() {
    var dots = document.querySelectorAll('.dot[data-section]');
    if (!dots.length) return;

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var el = document.getElementById(dot.dataset.section);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var id = entry.target.id;
                dots.forEach(function (d) {
                    d.classList.toggle('dot--active', d.dataset.section === id);
                });
            }
        });
    }, { threshold: 0.35, rootMargin: '-56px 0px 0px 0px' });

    ['section-1', 'section-2', 'section-3', 'section-4'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) obs.observe(el);
    });
}

// ─── 9. INIT ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    initBlockUniverse();
    initFrequencyAccess();
    initTrackSwitcher();
    initProtocol();
    initBreathTimer();
    initScrollObserver();
});
