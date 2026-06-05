/**
 * HUMAN MAP – Galaxy View + Archetype Detail Cards
 * Renders an 800x520 SVG showing all archetypes as stars,
 * the user positioned by similarity, and detail comparison cards.
 */

const Galaxy = (() => {

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const W = 800, H = 520;

    // Archetype display names (short)
    const ARCH_NAMES = {
        pioneer:   'Der Pionier',
        maker:     'Der Macher',
        connector: 'Der Connector',
        analyst:   'Der Analyst',
        guardian:  'Der Bewahrer',
        endurer:   'Der Durchhalter',
        free:      'Der Freie Geist',
    };

    // Archetype emojis from model
    function getEmoji(archId) {
        var a = MODEL.ARCHETYPES.find(function(a){ return a.id === archId; });
        return a ? (a.emoji || '') : '';
    }
    function getColor(archId) {
        var pos = MODEL.GALAXY_POSITIONS && MODEL.GALAXY_POSITIONS[archId];
        return pos ? pos.color : '#888';
    }

    // SVG element helper
    function el(tag, attrs) {
        var e = document.createElementNS(SVG_NS, tag);
        if (attrs) Object.keys(attrs).forEach(function(k){ e.setAttribute(k, String(attrs[k])); });
        return e;
    }

    // Seeded star background
    function seededRandom(seed) {
        var s = seed >>> 0;
        return function() {
            s = ((s * 1664525) + 1013904223) | 0;
            return (s >>> 0) / 0x100000000;
        };
    }

    // ── Similarity calculation ─────────────────────────────────────

    // Use scoreArchetype (same logic as detection) so the primary always shows
    // its real score, and rare archetypes (not in GALAXY_POSITIONS) score correctly.
    function calcAllSimilarities(userScores) {
        var result = {};
        var positions = MODEL.GALAXY_POSITIONS || {};
        Object.keys(positions).forEach(function(archId) {
            var arch = MODEL.ARCHETYPES.find(function(a){ return a.id === archId; });
            if (!arch) { result[archId] = 0; return; }
            result[archId] = Math.round(Archetypes.scoreArchetype(arch, userScores));
        });
        return result;
    }

    // Weighted position: centroid of top-3 archetypes weighted by similarity
    function calcUserPos(similarities) {
        var sorted = Object.entries(similarities).sort(function(a,b){ return b[1]-a[1]; });
        var top3   = sorted.slice(0, 3);
        var totalW = top3.reduce(function(s,e){ return s+e[1]; }, 0) || 1;
        var ux=0, uy=0;
        top3.forEach(function(entry) {
            var pos = MODEL.GALAXY_POSITIONS[entry[0]];
            if (!pos) return;
            ux += pos.x * (entry[1] / totalW);
            uy += pos.y * (entry[1] / totalW);
        });
        // Scale from 800x600 design space to our 800x520
        uy = uy * (520/600);
        // Clamp to visible area
        ux = Math.max(40, Math.min(W-40, ux));
        uy = Math.max(40, Math.min(H-40, uy));
        return { x: Math.round(ux), y: Math.round(uy) };
    }

    // ── Galaxy SVG renderer ────────────────────────────────────────

    function buildGalaxy(svgEl, results) {
        var allScores   = Object.assign({}, results.scores, results.categorical || {});
        var primary     = results.archetype.primary;
        var similarities = calcAllSimilarities(allScores);
        var userPos      = calcUserPos(similarities);

        // Sort by similarity for legend
        var sorted = Object.entries(similarities).sort(function(a,b){ return b[1]-a[1]; });

        while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

        // Defs
        var defs = el('defs');
        // User glow
        var ug = el('radialGradient', {id:'gxUserGlow', cx:'50%', cy:'50%', r:'50%'});
        ug.appendChild(el('stop', {offset:'0%', 'stop-color':'#f0c840', 'stop-opacity':'0.55'}));
        ug.appendChild(el('stop', {offset:'100%', 'stop-color':'#f0c840', 'stop-opacity':'0.00'}));
        defs.appendChild(ug);
        // Background gradient
        var bg = el('radialGradient', {id:'gxBg', cx:'50%', cy:'50%', r:'70%'});
        bg.appendChild(el('stop', {offset:'0%', 'stop-color':'#0e0e1a', 'stop-opacity':'1'}));
        bg.appendChild(el('stop', {offset:'100%', 'stop-color':'#080810', 'stop-opacity':'1'}));
        defs.appendChild(bg);
        // Twinkling animation
        var style = document.createElementNS(SVG_NS, 'style');
        style.textContent = '@media (prefers-reduced-motion:no-preference){' +
            '.gx-twinkle-a{animation:gxTwA 2.8s ease-in-out infinite;}' +
            '.gx-twinkle-b{animation:gxTwB 3.6s ease-in-out infinite;}' +
            '.gx-twinkle-c{animation:gxTwC 4.4s ease-in-out infinite;}' +
            '@keyframes gxTwA{0%,100%{opacity:0.06}50%{opacity:0.22}}' +
            '@keyframes gxTwB{0%,100%{opacity:0.10}50%{opacity:0.28}}' +
            '@keyframes gxTwC{0%,100%{opacity:0.04}55%{opacity:0.18}}' +
            '}';
        defs.appendChild(style);
        svgEl.appendChild(defs);

        // Background
        svgEl.appendChild(el('rect', {x:0, y:0, width:W, height:H, fill:'url(#gxBg)', rx:'12'}));

        // Twinkling starfield (3 animation classes, seeded positions)
        var rng = seededRandom(99887);
        var gStars = el('g');
        var twClasses = ['gx-twinkle-a','gx-twinkle-b','gx-twinkle-c'];
        for (var i=0; i<90; i++) {
            var sx=Math.round(rng()*W), sy=Math.round(rng()*H);
            var sr=rng()>0.85?0.9:rng()>0.6?0.55:0.35;
            var twClass=twClasses[i%3];
            // Stagger animation with a style offset
            var delay=(rng()*4).toFixed(1)+'s';
            var sEl=el('circle', {cx:sx, cy:sy, r:sr, fill:'#fff', class:twClass});
            sEl.style.animationDelay=delay;
            gStars.appendChild(sEl);
        }
        svgEl.appendChild(gStars);

        // Connection lines from user to top-2 similar (not primary)
        var nonPrimary = sorted.filter(function(e){ return e[0] !== primary.id; });
        var top2 = nonPrimary.slice(0, 2);
        top2.forEach(function(entry) {
            var pos = MODEL.GALAXY_POSITIONS[entry[0]];
            if (!pos) return;
            var py = pos.y * (520/600);
            svgEl.appendChild(el('line', {
                x1: userPos.x, y1: userPos.y, x2: pos.x, y2: py,
                stroke:'#f0c840', 'stroke-width':'0.8', 'stroke-opacity':'0.30',
                'stroke-dasharray':'3 5',
            }));
            // Similarity percentage midpoint label
            var mx=Math.round((userPos.x+pos.x)/2), my=Math.round((userPos.y+py)/2);
            var pctT = el('text', {x:mx, y:my-5, 'text-anchor':'middle',
                'font-size':'9', 'font-family':'Inter, sans-serif',
                fill:'#f0c840', opacity:'0.60'});
            pctT.textContent = entry[1] + '%';
            svgEl.appendChild(pctT);
        });

        // Archetype nodes
        // If user's primary is a rare archetype (not in GALAXY_POSITIONS), highlight
        // the highest-scoring galaxy archetype instead as the visual stand-in.
        var galaxyPrimaryId = MODEL.GALAXY_POSITIONS[primary.id]
            ? primary.id
            : (sorted[0] ? sorted[0][0] : null);
        Object.keys(MODEL.GALAXY_POSITIONS).forEach(function(archId) {
            var pos   = MODEL.GALAXY_POSITIONS[archId];
            var py    = pos.y * (520/600);
            var sim   = similarities[archId] || 0;
            var color = pos.color;
            var isPrimary = archId === galaxyPrimaryId;

            // Node radius correlates with similarity
            var r = isPrimary ? 26 : Math.round(12 + (sim/100)*10);

            var g = el('g', {style:'cursor:pointer', 'data-arch':archId});

            // Outer ring for primary
            if (isPrimary) {
                g.appendChild(el('circle', {cx:pos.x, cy:py, r:r+10,
                    fill:'none', stroke:color, 'stroke-width':'1.2', 'stroke-opacity':'0.25'}));
            }

            // Main circle
            g.appendChild(el('circle', {cx:pos.x, cy:py, r:r,
                fill:color, 'fill-opacity': isPrimary ? '0.22' : '0.12',
                stroke:color, 'stroke-width': isPrimary ? '2' : '1.2'}));

            // Emoji
            var et = el('text', {x:pos.x, y:py,
                'text-anchor':'middle', 'dominant-baseline':'middle',
                'font-size': isPrimary ? '16' : '12', 'pointer-events':'none'});
            et.textContent = getEmoji(archId);
            g.appendChild(et);

            // Similarity badge below node
            var bt = el('text', {x:pos.x, y:py+r+11,
                'text-anchor':'middle',
                'font-size':'9.5', 'font-family':'Inter, sans-serif', 'font-weight':'600',
                fill:color, opacity:'0.80', 'pointer-events':'none'});
            bt.textContent = sim + '%';
            g.appendChild(bt);

            // Name label
            var nl = el('text', {x:pos.x, y:py+r+22,
                'text-anchor':'middle',
                'font-size':'8.5', 'font-family':'Inter, sans-serif',
                fill:'#aaa', opacity:'0.75', 'pointer-events':'none'});
            nl.textContent = (ARCH_NAMES[archId] || archId).replace(/^(Der|Die|Das) /,'');
            g.appendChild(nl);

            // Click opens detail cards filtered to this archetype
            g.addEventListener('click', function() {
                openDetailPanel(allScores, results.archetype.primary, similarities, archId);
            });

            svgEl.appendChild(g);
        });

        // User node (gold, on top)
        var userG = el('g');
        // Glow circle
        userG.appendChild(el('circle', {cx:userPos.x, cy:userPos.y, r:28,
            fill:'url(#gxUserGlow)'}));
        // Main dot
        userG.appendChild(el('circle', {cx:userPos.x, cy:userPos.y, r:9,
            fill:'#f0c840', stroke:'#fff', 'stroke-width':'1.5', 'stroke-opacity':'0.60'}));
        // "Du" label
        var du = el('text', {x:userPos.x, y:userPos.y-16,
            'text-anchor':'middle',
            'font-size':'10', 'font-family':'Inter, sans-serif', 'font-weight':'700',
            fill:'#f0c840', opacity:'0.90'});
        du.textContent = 'Du';
        userG.appendChild(du);
        svgEl.appendChild(userG);

        return { sorted: sorted, top2: top2, userPos: userPos };
    }

    // ── Summary cards below galaxy ─────────────────────────────────

    function buildGalaxyCards(containerEl, results, sorted) {
        var primary    = results.archetype.primary;
        var allScores  = Object.assign({}, results.scores, results.categorical || {});
        // Real detection score for the primary (works for both normal and rare archetypes)
        var primaryScore = Math.round(Archetypes.scoreArchetype(primary, allScores));
        var top3       = [
            { id: primary.id, sim: primaryScore, label: 'Dein Archetyp' },
        ];
        // Add next 2 non-primary by similarity
        sorted.filter(function(e){ return e[0] !== primary.id; }).slice(0,2).forEach(function(e,i){
            top3.push({ id:e[0], sim:e[1], label: i===0?'Nächster Verwandter':'Zweiter Verwandter' });
        });

        containerEl.innerHTML = top3.map(function(item) {
            var arch  = MODEL.ARCHETYPES.find(function(a){ return a.id===item.id; });
            if (!arch) return '';
            var color = arch.color;
            return '<div class="hm-galaxy-card" data-arch="' + item.id + '" style="--gc-color:' + color + ';cursor:pointer">' +
                '<div class="hm-gc__label">' + item.label + '</div>' +
                '<div class="hm-gc__row">' +
                  '<span class="hm-gc__emoji">' + (arch.emoji||'') + '</span>' +
                  '<span class="hm-gc__name" style="color:' + color + '">' + arch.name + '</span>' +
                '</div>' +
                '<div class="hm-gc__sim" style="color:' + color + '">' + item.sim + '% <span>Übereinstimmung</span></div>' +
                '</div>';
        }).join('');

        // Card clicks open detail panel
        containerEl.querySelectorAll('.hm-galaxy-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var archId = card.getAttribute('data-arch');
                var sims = {};
                sorted.forEach(function(e){ sims[e[0]]=e[1]; });
                sims[primary.id] = primaryScore;
                openDetailPanel(allScores, primary, sims, archId);
            });
        });
    }

    // ── Detail panel (slide-over from right) ──────────────────────

    function openDetailPanel(userScores, primaryArch, similarities, focusArchId) {
        var panelEl   = document.getElementById('hm-archdetail-panel');
        var contentEl = document.getElementById('hm-archdetail-content');
        if (!panelEl || !contentEl) return;

        // Sort all archetypes by similarity descending
        var sorted = Object.keys(MODEL.GALAXY_POSITIONS || {})
            .map(function(id){ return { id:id, sim: id===primaryArch.id ? 100 : (similarities[id]||0) }; })
            .sort(function(a,b){ return b.sim - a.sim; });

        // Bring focused arch to top
        if (focusArchId) {
            sorted = sorted.filter(function(e){ return e.id !== focusArchId; });
            var foc = { id:focusArchId, sim: focusArchId===primaryArch.id ? 100 : (similarities[focusArchId]||0) };
            sorted.unshift(foc);
        }

        contentEl.innerHTML = sorted.map(function(item) {
            return buildDetailCard(item.id, item.sim, userScores, primaryArch, item.id===focusArchId);
        }).join('');

        // Wire expand toggles
        contentEl.querySelectorAll('.hm-adc__expand-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var card = btn.closest('.hm-arch-detail-card');
                card.classList.toggle('is-expanded');
                btn.textContent = card.classList.contains('is-expanded') ? 'Weniger ↑' : 'Mehr erfahren ↓';
            });
        });

        panelEl.classList.add('is-open');
        panelEl.setAttribute('aria-hidden','false');

        // Position the panel vertically centered on the galaxy SVG (if visible),
        // otherwise centered in the viewport. Always clamped fully on-screen.
        var vh = window.innerHeight;
        var galaxySvg = document.getElementById('hm-galaxy-svg');
        var centY = vh / 2; // fallback: viewport center
        if (galaxySvg) {
            var gRect = galaxySvg.getBoundingClientRect();
            if (gRect.height > 0 && gRect.bottom > 0 && gRect.top < vh) {
                centY = gRect.top + gRect.height / 2;
            }
        }
        // Clamp: panel half-height (max-height is 82vh) must stay inside the viewport.
        var halfPanel = Math.min(vh * 0.41, 380);
        centY = Math.max(halfPanel + 10, Math.min(vh - halfPanel - 10, centY));
        panelEl.style.top = Math.round(centY) + 'px';
        panelEl.style.transform = 'translateY(-50%)';
    }

    function closeDetailPanel() {
        var panelEl = document.getElementById('hm-archdetail-panel');
        if (!panelEl) return;
        panelEl.classList.remove('is-open');
        panelEl.setAttribute('aria-hidden','true');
    }

    function buildDetailCard(archId, sim, userScores, primaryArch, isFocused) {
        var arch  = MODEL.ARCHETYPES.find(function(a){ return a.id===archId; });
        if (!arch) return '';
        var color = arch.color;
        var isPrimary = archId === primaryArch.id;

        // Key dims for range bars — use ARCHETYPE_PROFILES if available
        var profile = (MODEL.ARCHETYPE_PROFILES && MODEL.ARCHETYPE_PROFILES[archId]) || {};
        var dimKeys = Object.keys(profile).slice(0, 5); // max 5 dims

        var barsHtml = dimKeys.map(function(dimId) {
            var range  = profile[dimId];
            var meta   = MODEL.DIMS[dimId];
            var label  = meta ? meta.label : dimId;
            var color2 = meta ? meta.color : color;
            var userVal = userScores[dimId];
            if (userVal === undefined || userVal === null) return '';
            var minPct = range[0], maxPct = range[1];
            var userPct = Number(userVal);
            var withinRange = userPct >= minPct && userPct <= maxPct;
            var dotPct = Math.max(0, Math.min(100, userPct));

            return '<div class="hm-adc__dim-row">' +
                '<span class="hm-adc__dim-label">' + label + '</span>' +
                '<div class="hm-adc__bar-wrap" style="color:' + color2 + '">' +
                  '<div class="hm-adc__bar-track">' +
                    '<div class="hm-adc__bar-range" style="left:' + minPct + '%;width:' + (maxPct-minPct) + '%"></div>' +
                    '<div class="hm-adc__bar-dot" style="left:' + dotPct + '%;opacity:' + (withinRange?'1':'0.4') + '"></div>' +
                  '</div>' +
                '</div>' +
                '<span class="hm-adc__dim-val">' + Math.round(userPct) + '</span>' +
                '</div>';
        }).join('');

        var strengthsHtml = (arch.strengths || []).map(function(s){
            return '<span class="hm-adc__tag" style="border-color:' + color + '44;color:' + color + '">' + s + '</span>';
        }).join('');

        return '<div class="hm-arch-detail-card' + (isPrimary?' is-primary':'') + (isFocused?' is-focused':'') + '" style="--adc-color:' + color + '">' +
            '<div class="hm-adc__top">' +
              '<div class="hm-adc__emoji-name">' +
                '<span class="hm-adc__emoji">' + (arch.emoji||'') + '</span>' +
                '<div>' +
                  '<div class="hm-adc__name" style="color:' + color + '">' + arch.name + '</div>' +
                  '<div class="hm-adc__tagline">' + arch.tagline + '</div>' +
                '</div>' +
              '</div>' +
              '<div class="hm-adc__sim-badge" style="color:' + color + ';border-color:' + color + '44;background:' + color + '14">' + sim + '%</div>' +
            '</div>' +
            (barsHtml ? '<div class="hm-adc__dims">' + barsHtml + '</div>' : '') +
            '<div class="hm-adc__extras">' +
              '<div class="hm-adc__strengths">' + strengthsHtml + '</div>' +
              '<div class="hm-adc__blindspot"><strong>Blinder Fleck:</strong> ' + (arch.blindspot||'') + '</div>' +
            '</div>' +
            '<button class="hm-adc__expand-btn">Mehr erfahren ↓</button>' +
            '</div>';
    }

    // ── Init ──────────────────────────────────────────────────────

    function init(results) {
        var svgEl      = document.getElementById('hm-galaxy-svg');
        var cardsEl    = document.getElementById('hm-galaxy-cards');
        var detailBtn  = document.getElementById('hm-galaxy-detail-btn');
        var backBtn    = document.getElementById('hm-archdetail-back');

        if (!svgEl) return;

        var built = buildGalaxy(svgEl, results);
        if (cardsEl) buildGalaxyCards(cardsEl, results, built.sorted);

        if (detailBtn) {
            detailBtn.addEventListener('click', function() {
                var allScores  = Object.assign({}, results.scores, results.categorical||{});
                var sims = {};
                built.sorted.forEach(function(e){ sims[e[0]]=e[1]; });
                openDetailPanel(allScores, results.archetype.primary, sims, results.archetype.primary.id);
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', closeDetailPanel);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeDetailPanel();
        });
    }

    return { init };

})();
