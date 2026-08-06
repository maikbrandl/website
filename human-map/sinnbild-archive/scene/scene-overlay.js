/**
 * HUMAN MAP v2 — Kinematisches Sinnbild · DOM/SVG-Overlay (§8 scene-overlay.js)
 * Die scharfen, personalisierten Informationen ÜBER der Bühne: Kapitel-Captions,
 * interaktive Hotspots (Hover/Klick/Tastatur), Glaubenssatz-Label und das Detail-Panel.
 * Positionen werden aus viewBox-Ankern via getScreenCTM auf den Screen abgebildet —
 * robust gegen "slice"-Skalierung und Resize.
 *
 * API: SceneOverlay.init({ stage, svgRoot, anchors, readouts })
 *      -> { showCaption, refresh, openDetail, closeDetail, el }
 */
const SceneOverlay = (() => {

    function mapPoint(svgRoot, stage, x, y) {
        const pt = svgRoot.createSVGPoint();
        pt.x = x; pt.y = y;
        const scr = pt.matrixTransform(svgRoot.getScreenCTM());
        const r = stage.getBoundingClientRect();
        return { left: scr.x - r.left, top: scr.y - r.top };
    }

    // ── icon set: one per model layer (left legend) + one per need (right legend) ──
    const LAYER_ICON = {
        terrain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-2.8 0-5 2-5 4.6 0 1-.4 1.6-1.1 2.2C5 10.6 4.5 11.6 4.5 13c0 2.4 1.8 4.3 4 4.3.2 1 .7 1.8 1.5 2.3.8.5 1.8.5 2.6 0 .8-.5 1.3-1.3 1.5-2.3 2.2 0 4-1.9 4-4.3 0-1.4-.5-2.4-1.4-3.2-.7-.6-1.1-1.2-1.1-2.2C17 5 14.8 3 12 3z"/><path d="M12 3v14.6"/><path d="M9 8c1 .8 2 .8 3 0M9 12c1 .8 2 .8 3 0M15 8c-1 .8-2 .8-3 0M15 12c-1 .8-2 .8-3 0"/></svg>',
        praegung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="7" ry="9"/><path d="M8.5 9.5c1 1 1 2 0 3M15.5 9.5c-1 1-1 2 0 3M8.5 15.5c1.4 1 2.6 1 4 0"/></svg>',
        werte: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V5"/><path d="M6 6h9l3 3-3 3H6"/></svg>',
        sinn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M15 9l-2.4 5.4L9 17l2.4-5.4L15 9z"/></svg>',
        beduerfnisse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3S3.5 15.4 3.5 9.6C3.5 6.5 5.9 4 8.9 4c1.6 0 3 .8 3.1 1.9C12.1 4.8 13.5 4 15.1 4c3 0 5.4 2.5 5.4 5.6 0 5.8-8.5 10.7-8.5 10.7z"/></svg>',
        bewegung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="8" rx="2.4" ry="3.2"/><ellipse cx="15" cy="15" rx="2.4" ry="3.2"/><circle cx="6.2" cy="13.6" r="1"/><circle cx="17.8" cy="9.4" r="1"/></svg>',
    };
    const NEED_ICON = {
        autonomie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="4.2"/><path d="M12.2 12.2L20 20M15.5 15.5l3 3M18.8 12.2l1.7 1.7"/></svg>',
        kompetenz: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c2.6 3.2 3.4 5.4 1.9 8 2.6-.6 2-3 3.5-2 .6 3-2.5 6.5-2.5 6.5C16 16 14 20 12 20s-4-4-2.9-5.5c0 0-3.1-3.5-2.5-6.5 1.5-1 .9 1.4 3.5 2C8.6 7.4 9.4 5.2 12 2z"/></svg>',
        verbundenheit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8.4" cy="12" r="4.4"/><circle cx="15.6" cy="12" r="4.4"/></svg>',
    };
    const NEED_LABEL = { autonomie: 'Autonomie', kompetenz: 'Kompetenz', verbundenheit: 'Verbundenheit' };
    const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));

    // ── detail panel (shared by the full scene and the poster-only page) ──
    function buildDetailPanel(C, readouts) {
        const detail = document.createElement('div');
        detail.className = 'sc-detail';
        detail.setAttribute('role', 'dialog');
        detail.setAttribute('aria-modal', 'true');
        detail.innerHTML = `<div class="sc-detail__card">
            <button class="sc-detail__close" aria-label="${C.UI.closeDetail || 'Schließen'}">×</button>
            <div class="sc-detail__label"></div>
            <h3 class="sc-detail__title"></h3>
            <div class="sc-detail__body"></div>
            <div class="sc-detail__read"></div>
            <div class="sc-detail__note"></div>
        </div>`;
        document.body.appendChild(detail);
        let lastFocus = null;
        detail.querySelector('.sc-detail__close').addEventListener('click', closeDetail);
        detail.addEventListener('click', (e) => { if (e.target === detail) closeDetail(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && detail.dataset.open != null) closeDetail(); });

        function openDetail(block) {
            const a = C.ANALYSIS[block];
            if (!a) return;
            lastFocus = document.activeElement;
            detail.querySelector('.sc-detail__label').textContent = a.label || '';
            detail.querySelector('.sc-detail__title').textContent = a.title || '';
            detail.querySelector('.sc-detail__body').innerHTML = `<p>${a.body || ''}</p>`;
            detail.querySelector('.sc-detail__read').innerHTML = (readouts && readouts[block]) || '';
            detail.querySelector('.sc-detail__note').textContent = a.note || '';
            detail.dataset.open = '1';
            detail.querySelector('.sc-detail__close').focus();
        }
        function closeDetail() {
            delete detail.dataset.open;
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        return { detail, openDetail, closeDetail };
    }

    // ── lean API for pages that only show the static poster (no SVG scene) ──
    function initDetail(ctx) {
        const { readouts } = ctx || {};
        const C = (typeof SceneContent !== 'undefined') ? SceneContent : { CHAPTERS: [], ANALYSIS: {}, UI: {} };
        const { openDetail, closeDetail } = buildDetailPanel(C, readouts);
        return { openDetail, closeDetail };
    }

    function init(ctx) {
        const { stage, svgRoot, anchors, readouts, profile } = ctx;
        const C = (typeof SceneContent !== 'undefined') ? SceneContent : { CHAPTERS: [], ANALYSIS: {}, UI: {} };

        const overlay = document.createElement('div');
        overlay.id = 'scene-overlay';
        overlay.className = 'scene-stage__layer';
        stage.appendChild(overlay);

        // ── captions ─────────────────────────────────────────────────
        const caps = document.createElement('div');
        caps.className = 'sc-caps';
        overlay.appendChild(caps);
        const capEls = C.CHAPTERS.map((ch) => {
            const d = document.createElement('div');
            d.className = 'sc-cap';
            d.dataset.chapter = ch.id;
            d.innerHTML = `<div class="sc-cap__eyebrow">${ch.eyebrow || ''}</div>`
                + `<div class="sc-cap__title">${ch.title || ''}</div>`
                + `<div class="sc-cap__text">${ch.caption || ''}</div>`;
            caps.appendChild(d);
            return d;
        });

        // ── belief label near the mask ───────────────────────────────
        const belief = document.createElement('div');
        belief.className = 'sc-belieflabel';
        overlay.appendChild(belief);

        // ── hotspots ─────────────────────────────────────────────────
        const hotspots = [];
        C.CHAPTERS.filter(ch => ch.block && anchors[ch.block]).forEach((ch) => {
            const btn = document.createElement('button');
            btn.className = 'sc-hotspot';
            btn.type = 'button';
            btn.dataset.block = ch.block;
            btn.setAttribute('aria-label', (C.ANALYSIS[ch.block] && C.ANALYSIS[ch.block].title) || ch.title);
            btn.innerHTML = `<span class="sc-hotspot__dot"></span>`
                + `<span class="sc-hotspot__tip">${(C.ANALYSIS[ch.block] && C.ANALYSIS[ch.block].label) || ch.eyebrow}</span>`;
            btn.addEventListener('click', () => openDetail(ch.block));
            btn.addEventListener('mouseenter', () => { overlay.dataset.active = ch.block; btn.dataset.active = '1'; });
            btn.addEventListener('mouseleave', () => { delete overlay.dataset.active; delete btn.dataset.active; });
            btn.addEventListener('focus', () => { overlay.dataset.active = ch.block; btn.dataset.active = '1'; });
            btn.addEventListener('blur', () => { delete overlay.dataset.active; delete btn.dataset.active; });
            overlay.appendChild(btn);
            hotspots.push({ btn, block: ch.block });
        });

        // ── legend: persistent "wie im Bild" reading of the whole model ──
        // Left column = the six layers (always visible, hover highlights the
        // matching hotspot in the scene, click opens the same detail panel).
        // Right column = the real needs (Autonomie/Kompetenz/Verbundenheit).
        const legendLeft = document.createElement('div');
        legendLeft.className = 'sc-legend sc-legend--left';
        legendLeft.innerHTML = '<div class="sc-legend__brand">Human Map</div>';
        C.CHAPTERS.filter(ch => ch.block).forEach((ch) => {
            const a = C.ANALYSIS[ch.block] || {};
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'sc-legend__item';
            item.dataset.block = ch.block;
            item.innerHTML = `<span class="sc-legend__icon">${LAYER_ICON[ch.block] || ''}</span>`
                + `<span class="sc-legend__text"><strong>${a.label ? a.label.split(' · ')[0] : ch.eyebrow}</strong>`
                + `<em>${ch.caption || ''}</em></span>`;
            item.addEventListener('click', () => openDetail(ch.block));
            item.addEventListener('mouseenter', () => { overlay.dataset.active = ch.block; item.dataset.active = '1'; });
            item.addEventListener('mouseleave', () => { delete overlay.dataset.active; delete item.dataset.active; });
            item.addEventListener('focus', () => { overlay.dataset.active = ch.block; item.dataset.active = '1'; });
            item.addEventListener('blur', () => { delete overlay.dataset.active; delete item.dataset.active; });
            legendLeft.appendChild(item);
        });
        overlay.appendChild(legendLeft);

        const legendRight = document.createElement('div');
        legendRight.className = 'sc-legend sc-legend--right';
        legendRight.innerHTML = '<div class="sc-legend__heading">Bedürfnisse</div>';
        Object.keys(NEED_LABEL).forEach((k) => {
            const nd = (profile && profile.needs && profile.needs[k]) || {};
            const health = clampPct((nd.erfuellung || 50) - (nd.frustration || 0) * 0.6 + 30);
            const tone = health >= 55 ? 'bright' : health >= 35 ? 'mid' : 'low';
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'sc-legend__need';
            item.dataset.tone = tone;
            item.innerHTML = `<span class="sc-legend__need-dot">${NEED_ICON[k] || ''}</span>`
                + `<span>${NEED_LABEL[k]}</span>`;
            item.addEventListener('click', () => openDetail('beduerfnisse'));
            item.addEventListener('mouseenter', () => { overlay.dataset.active = 'beduerfnisse'; item.dataset.active = '1'; });
            item.addEventListener('mouseleave', () => { delete overlay.dataset.active; delete item.dataset.active; });
            item.addEventListener('focus', () => { overlay.dataset.active = 'beduerfnisse'; item.dataset.active = '1'; });
            item.addEventListener('blur', () => { delete overlay.dataset.active; delete item.dataset.active; });
            legendRight.appendChild(item);
        });
        overlay.appendChild(legendRight);

        // ── detail panel (built once, portalled to body) ─────────────
        const { openDetail, closeDetail } = buildDetailPanel(C, readouts);

        // ── positioning ──────────────────────────────────────────────
        function refresh() {
            hotspots.forEach(h => {
                const a = anchors[h.block];
                if (!a) return;
                const p = mapPoint(svgRoot, stage, a.x, a.y);
                h.btn.style.left = p.left + 'px';
                h.btn.style.top = p.top + 'px';
            });
            const ba = anchors.praegung;
            if (ba) {
                const p = mapPoint(svgRoot, stage, ba.x, ba.y - 70);
                belief.style.left = p.left + 'px';
                belief.style.top = p.top + 'px';
            }
            belief.textContent = svgRoot.dataset.belief || '';
        }

        function showCaption(idx) {
            capEls.forEach((el, i) => {
                const on = i === idx;
                el.style.opacity = on ? '1' : '0';
                el.style.transform = `translateX(-50%) translateY(${on ? 0 : 20}px)`;
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
        }

        function setBeliefVisible(on) {
            belief.style.opacity = on && belief.textContent ? '1' : '0';
        }

        window.addEventListener('resize', refresh);
        // reflect ongoing GSAP transforms on the SVG CTM
        refresh();

        return { el: overlay, capEls, hotspots, showCaption, refresh, openDetail, closeDetail, setBeliefVisible, belief };
    }

    return { init, initDetail, ICONS: { LAYER_ICON, NEED_ICON, NEED_LABEL } };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { SceneOverlay };
