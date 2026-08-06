/**
 * HUMAN MAP v2 — Kinematisches Sinnbild · Choreografie (§4/§8 scene-timeline.js)
 * Lenis (Smooth-Scroll) + GSAP ScrollTrigger Master-Timeline, an den Scroll gekoppelt.
 * Steuert die sieben Kapitel: Materialisieren, Gehirn, Maske senken, Schilder, Kompass-
 * strahl, Bedürfnis-Lichter, Fußspuren. Ohne GSAP oder bei reduzierter Bewegung wird die
 * ruhige Endkomposition gezeigt (voll interaktiv).
 *
 * API: SceneTimeline.init({ stage, svgRoot, overlay, scroll, reduced })
 */
const SceneTimeline = (() => {

    const hasGsap = () => typeof window !== 'undefined' && window.gsap && window.ScrollTrigger;

    function q(root, s) { return root.querySelector(s); }
    function qa(root, s) { return Array.from(root.querySelectorAll(s)); }

    // Everything at its final, revealed state (used for fallback + as tween targets).
    function finalState(root) {
        const needle = q(root, '#fig-needle');
        const angle = needle ? parseFloat(needle.dataset.angle || '0') : 0;
        return { angle };
    }

    // ── Reduced / no-lib fallback: calm full composition ─────────────
    function revealAll(root, overlay) {
        const { angle } = finalState(root);
        setOpacity(root, '#fig-figure', 1);
        setOpacity(root, '#fig-brain', 1);
        qa(root, '.sc-sign').forEach(s => s.style.opacity = 1);
        setOpacity(root, '#fig-beam', 0.9);
        setOpacity(root, '#layer-lanterns', 1);
        const face = q(root, '#fig-face');
        if (face) face.style.opacity = face.dataset.target || 0.4;
        const needle = q(root, '#fig-needle');
        if (needle) needle.setAttribute('transform', `rotate(${angle})`);
        qa(root, '.sc-foot').forEach(f => { if (f.dataset.reveal === '1') f.style.opacity = 0.5; });
        if (overlay) { overlay.showCaption(0); overlay.setBeliefVisible(true); overlay.refresh(); }
    }

    function setOpacity(root, sel, v) { const el = q(root, sel); if (el) el.style.opacity = v; }

    // ── GSAP timeline ────────────────────────────────────────────────
    function buildGsap(ctx) {
        const { stage, svgRoot, overlay, scroll } = ctx;
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        // Lenis smooth scroll, synced to ScrollTrigger.
        let lenis = null;
        if (window.Lenis) {
            lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((t) => lenis.raf(t * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        const { angle } = finalState(svgRoot);
        const face = q(svgRoot, '#fig-face');
        const faceTarget = face ? parseFloat(face.dataset.target || '0.4') : 0.4;

        // Initial hidden states.
        gsap.set('#fig-figure', { opacity: 0, transformOrigin: '50% 70%', scale: 0.92, y: 24 });
        gsap.set('#fig-brain', { opacity: 0, transformOrigin: '50% 50%', scale: 0.6 });
        gsap.set('#fig-face', { opacity: 0 });
        gsap.set('.sc-sign', { opacity: 0, y: -10 });
        gsap.set('#fig-beam', { opacity: 0 });
        gsap.set('#fig-needle', { rotation: -40, transformOrigin: '0px 0px' });
        gsap.set('#layer-lanterns', { opacity: 0 });
        gsap.set('#fig-maskgroup', { y: 0 });
        gsap.set('.sc-foot', { opacity: 0 });

        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' },
            scrollTrigger: {
                trigger: scroll,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => updateChapter(self.progress),
            },
        });

        // 1 · Ankunft — figure materializes
        tl.to('#fig-figure', { opacity: 1, scale: 1, y: 0, duration: 1.2 }, 0.1)
          .to('#path-line', { opacity: 0.9, duration: 1 }, 0.2);
        // 2 · Persönlichkeit — brain
        tl.to('#fig-brain', { opacity: 1, scale: 1, duration: 1 }, 1.4);
        // 3 · Glaubenssätze — mask lowers, face shimmers
        tl.to('#fig-maskgroup', { y: 30, duration: 1 }, 2.6)
          .to('#fig-mask', { rotation: 8, transformOrigin: '50% -60%', duration: 1 }, 2.6)
          .to('#fig-face', { opacity: faceTarget, duration: 1 }, 2.8);
        // 4 · Werte — signposts stagger in
        tl.to('.sc-sign', { opacity: 1, y: 0, duration: 0.8, stagger: 0.25 }, 3.8);
        // 5 · Sinn — compass beam + needle turns
        tl.to('#fig-needle', { rotation: angle, duration: 1.2 }, 5.0)
          .to('#fig-beam', { opacity: 0.9, duration: 1 }, 5.4);
        // 6 · Bedürfnisse — lanterns glow up
        tl.to('#layer-lanterns', { opacity: 1, duration: 1 }, 6.2);
        // 7 · Veränderung — footprints + slight walk, scene breathes wider
        tl.to('.sc-foot', {
            opacity: (i, el) => (el.dataset.reveal === '1' ? 0.55 : 0), duration: 0.8, stagger: 0.12,
        }, 7.2)
          .to('#fig-figure', { x: 14, duration: 1.4, ease: 'sine.inOut' }, 7.2)
          .to('#scene-svg', { scale: 1.04, transformOrigin: '50% 60%', duration: 1.6 }, 7.2);

        const nChapters = (typeof SceneContent !== 'undefined' ? SceneContent.CHAPTERS.length : 7);
        let cur = -1;
        function updateChapter(p) {
            const idx = Math.max(0, Math.min(nChapters - 1, Math.floor(p * nChapters)));
            if (idx !== cur) {
                cur = idx;
                overlay.showCaption(idx);
                overlay.setBeliefVisible(idx >= 2);   // belief label from "Glaubenssätze" on
                overlay.refresh();
            }
        }
        updateChapter(0);

        // Keep hotspots aligned while the SVG scales in the last chapter.
        ScrollTrigger.addEventListener('refresh', overlay.refresh);
        gsap.ticker.add(() => { /* cheap: only refresh occasionally */ });

        return { tl, lenis };
    }

    function init(ctx) {
        const { svgRoot, overlay, reduced } = ctx;
        if (reduced || !hasGsap()) {
            revealAll(svgRoot, overlay);
            return { mode: reduced ? 'reduced' : 'static' };
        }
        const out = buildGsap(ctx);
        return { mode: 'gsap', ...out };
    }

    return { init, revealAll };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { SceneTimeline };
