/**
 * HUMAN MAP – Results Page Controller
 * Reads saved results from localStorage and renders the full results page.
 */

const Results = (() => {

    const RESULTS_KEY = 'humanmap_results';

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        // Check both storages — sessionStorage is more reliable for file:// protocol
        const raw = localStorage.getItem(RESULTS_KEY) || sessionStorage.getItem(RESULTS_KEY);
        if (!raw) {
            showNoResults();
            return;
        }

        let results;
        try {
            results = JSON.parse(raw);
        } catch (e) {
            showNoResults();
            return;
        }

        // Validate minimally
        if (!results || !results.archetype || !results.archetype.primary) {
            showNoResults();
            return;
        }

        document.getElementById('hm-results-content').style.display = 'block';

        renderArchetype(results);
        renderRare(results);
        renderSynergies(results);
        renderSkillTree(results);
        renderCharts(results);
        renderDashboard(results);
        setupEmailForm(results);
        setupPanel();
        setupScrollReveal();
        setupDebugMode(results);
    }

    function showNoResults() {
        document.getElementById('hm-no-results').style.display = 'flex';
    }

    // ── Archetype reveal ──────────────────────────────────────────
    function renderArchetype(results) {
        const arch  = results.archetype.primary;
        const color = arch.color;

        // Set CSS custom properties for color
        document.documentElement.style.setProperty('--arch-color', color);
        document.documentElement.style.setProperty('--arch-glow',    hexToRgba(color, 0.08));
        document.documentElement.style.setProperty('--arch-bg',      hexToRgba(color, 0.10));
        document.documentElement.style.setProperty('--arch-border',  hexToRgba(color, 0.30));

        const section = document.getElementById('hm-archetype-section');
        if (section) section.style.setProperty('--arch-color', color);

        setText('hm-arch-emoji',       arch.emoji || '●');
        setText('hm-arch-badge-label', 'Dein Primärtyp');
        setText('hm-arch-name',        arch.name);
        setText('hm-arch-tagline',     arch.tagline);
        setText('hm-arch-desc',        arch.desc);

        // Style badge
        const badge = document.getElementById('hm-arch-badge');
        if (badge) {
            badge.style.borderColor = color;
            badge.style.background  = hexToRgba(color, 0.1);
        }
        const badgeLabel = document.getElementById('hm-arch-badge-label');
        if (badgeLabel) badgeLabel.style.color = color;

        // Strengths pills
        const pillsEl = document.getElementById('hm-arch-strengths');
        if (pillsEl && arch.strengths) {
            pillsEl.innerHTML = arch.strengths.map(s =>
                `<span class="hm-arch-pill" style="color:${color};border-color:${hexToRgba(color,0.3)};background:${hexToRgba(color,0.1)}">${s}</span>`
            ).join('');
        }

        // Blindspot
        const bsEl = document.getElementById('hm-arch-blindspot');
        if (bsEl && arch.blindspot) {
            bsEl.innerHTML = `<strong>Blinder Fleck:</strong> ${arch.blindspot}`;
        }

        // Trigger reveal
        setTimeout(() => {
            const revealEl = document.getElementById('hm-arch-reveal');
            if (revealEl) revealEl.classList.add('is-visible');
        }, 200);
    }

    // ── Rare archetype ────────────────────────────────────────────
    function renderRare(results) {
        if (!results.rare || results.rare.length === 0) return;
        const rareEntry = results.rare[0];
        const rareArch  = MODEL.ARCHETYPES.find(a => a.id === rareEntry.id);
        if (!rareArch) return;

        const section = document.getElementById('hm-rare-section');
        if (section) section.style.display = 'block';
        setText('hm-rare-name',    rareArch.name);
        setText('hm-rare-tagline', rareArch.tagline);
    }

    // ── Synergy banners ───────────────────────────────────────────
    function renderSynergies(results) {
        const container = document.getElementById('hm-synergy-banners');
        if (!container || !results.synergies || results.synergies.length === 0) return;

        const activeSyns = results.synergies
            .map(id => MODEL.SYNERGIES.find(s => s.id === id))
            .filter(Boolean);

        if (activeSyns.length === 0) return;

        container.innerHTML = activeSyns.map(syn => `
            <div class="hm-synergy-banner">
                <div class="hm-synergy-banner__icon">✦</div>
                <div>
                    <div class="hm-synergy-banner__name">${syn.name}</div>
                    <div class="hm-synergy-banner__desc">${syn.desc}</div>
                </div>
            </div>`).join('');
    }

    // ── Skill tree ────────────────────────────────────────────────
    function renderSkillTree(results) {
        const svgEl = document.getElementById('hm-skilltree-svg');
        if (!svgEl) return;

        SkillTree.buildTree(svgEl, results);
        renderSynergyCount(results);

        // Legend
        renderLegend(results);
    }

    function renderLegend(results) {
        const legendEl = document.getElementById('hm-legend');
        if (!legendEl) return;

        const levels = [
            { level: 5, label: 'Meister', color: '#c9a84c' },
            { level: 4, label: 'Stark',   color: '#88d878' },
            { level: 3, label: 'Aktiv',   color: '#60a0e8' },
            { level: 2, label: 'Entwicklung', color: '#777777' },
            { level: 1, label: 'Anfang',  color: '#444444' },
        ];

        legendEl.innerHTML = [
            ...levels.map(l =>
                `<div class="hm-legend-item">
                    <div class="hm-legend-dot" style="background:${l.color};border:1px solid ${l.color}"></div>
                    <span>Level ${l.level} · ${l.label}</span>
                </div>`
            ),
            (results.synergies && results.synergies.length > 0) ?
                `<div class="hm-legend-item">
                    <div class="hm-legend-dot" style="background:none;border:2px dashed #c9a84c"></div>
                    <span>Aktive Synergie</span>
                </div>` : '',
        ].join('');
    }

    // ── Detail dashboard ──────────────────────────────────────────
    function renderDashboard(results) {
        const tabsEl  = document.getElementById('hm-cluster-tabs');
        const cardsEl = document.getElementById('hm-dim-cards');
        if (!tabsEl || !cardsEl) return;

        const dimSummary = results.dimSummary || Scoring.buildDimSummary(results.scores, results.categorical);

        const clusters = ['kern', 'antrieb', 'muster', 'potenzial'];
        const clusterLabels = { kern: 'Kern', antrieb: 'Antrieb', muster: 'Muster', potenzial: 'Potenzial' };
        let activeCluster = 'all';

        // Tabs
        tabsEl.innerHTML = [
            `<button class="hm-cluster-tab is-active" data-cluster="all">Alle</button>`,
            ...clusters.map(c => `<button class="hm-cluster-tab" data-cluster="${c}">${clusterLabels[c]}</button>`),
        ].join('');

        tabsEl.querySelectorAll('.hm-cluster-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                tabsEl.querySelectorAll('.hm-cluster-tab').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                activeCluster = btn.dataset.cluster;
                renderCards(dimSummary, activeCluster, cardsEl);
            });
        });

        renderCards(dimSummary, 'all', cardsEl);
    }

    function renderCards(dimSummary, filterCluster, cardsEl) {
        const filtered = filterCluster === 'all'
            ? dimSummary
            : dimSummary.filter(d => d.cluster === filterCluster);

        cardsEl.innerHTML = filtered.map((d, i) => {
            const delay = i * 30;

            if (d.categorical) {
                return `
                    <div class="hm-dim-card" data-dim="${d.dim}" data-color="${d.color}" data-categorical="true" data-catval="${d.value || ''}" style="--dim-color:${d.color};--dim-glow:${hexToRgba(d.color,0.1)};animation-delay:${delay}ms">
                        <div class="hm-dim-card__top">
                            <span class="hm-dim-card__label">${d.label}</span>
                        </div>
                        <span class="hm-dim-card__value">${formatCatValue(d.value)}</span>
                    </div>`;
            }

            const pct = d.score || 0;
            return `
                <div class="hm-dim-card" data-dim="${d.dim}" data-score="${pct}" data-color="${d.color}" data-categorical="false" style="--dim-color:${d.color};--dim-glow:${hexToRgba(d.color,0.1)};animation-delay:${delay}ms">
                    <div class="hm-dim-card__top">
                        <span class="hm-dim-card__label">${d.label}</span>
                        <span class="hm-dim-card__level">Lv ${d.level} · ${d.levelLabel}</span>
                    </div>
                    <div class="hm-dim-card__bar-track">
                        <div class="hm-dim-card__bar-fill" style="width:${pct}%"></div>
                    </div>
                    <div class="hm-dim-card__score">${pct}/100</div>
                </div>`;
        }).join('');

        // Stagger bar fill animations
        setTimeout(() => {
            cardsEl.querySelectorAll('.hm-dim-card__bar-fill').forEach(bar => {
                const w = bar.style.width;
                bar.style.width = '0%';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => { bar.style.width = w; });
                });
            });
        }, 50);

        // Event delegation for card clicks (replace existing listener)
        if (cardsEl._cardClickHandler) {
            cardsEl.removeEventListener('click', cardsEl._cardClickHandler);
        }
        cardsEl._cardClickHandler = function(e) {
            var card = e.target.closest('.hm-dim-card');
            if (!card) return;
            var dim = card.dataset.dim;
            var score = card.dataset.score !== undefined && card.dataset.score !== '' ? parseInt(card.dataset.score, 10) : null;
            var color = card.dataset.color;
            var categorical = card.dataset.categorical === 'true';
            var catval = card.dataset.catval || null;
            var panelKey = dim;
            if (categorical && catval) {
                var formatted = formatCatValue(catval);
                var ckm = MODEL.CATEGORY_KEY_MAP;
                if (ckm && ckm[formatted]) panelKey = ckm[formatted];
            }
            openDimPanel(panelKey, score, categorical, catval, color, card.getBoundingClientRect().top);
        };
        cardsEl.addEventListener('click', cardsEl._cardClickHandler);
    }

    // ── Email form ────────────────────────────────────────────────
    function setupEmailForm(results) {
        const arch = results.archetype.primary;

        // Populate hidden fields
        setVal('hf-archetype-id',   arch.id);
        setVal('hf-archetype-name', arch.name);
        setVal('hf-synergies',      (results.synergies || []).join(','));
        setVal('hf-rare-archetype', results.rare && results.rare.length > 0 ? results.rare[0].id : '');

        const form = document.getElementById('hm-email-form');
        const successEl = document.getElementById('hm-email-success');
        const submitBtn = document.getElementById('hm-email-submit');

        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('hf-email').value.trim();
            if (!isValidEmail(email)) {
                const input = document.getElementById('hf-email');
                if (input) { input.style.borderColor = '#ef4444'; input.focus(); }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Wird gesendet…';
            }

            try {
                const data = new FormData(form);
                const resp = await fetch(form.action, {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' },
                });

                if (resp.ok) {
                    form.style.display = 'none';
                    if (successEl) successEl.style.display = 'block';
                } else {
                    throw new Error('Server error');
                }
            } catch {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Profil sichern & Tipps erhalten';
                }
            }
        });
    }

    // ── Scroll reveal ─────────────────────────────────────────────
    function setupScrollReveal() {
        const items = document.querySelectorAll('.hm-result-reveal');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        items.forEach(el => observer.observe(el));
    }

    // ── Helpers ───────────────────────────────────────────────────
    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }
    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function formatCatValue(val) {
        const map = {
            sicher: 'Sicher', aengstlich: 'Ängstlich', vermeidend: 'Vermeidend', desorganisiert: 'Desorganisiert',
            fight: 'Fight', flight: 'Flight', freeze: 'Freeze', fawn: 'Fawn',
            power: 'Macht & Einfluss', affiliation: 'Zugehörigkeit', achievement: 'Leistung',
            analytisch: 'Analytisch', sozial: 'Sozial', kreativ: 'Kreativ',
            selbstkenntnis: 'Selbsterkenntnis', fuehrung: 'Führung', aufbau: 'Aufbau & Systeme', verbindung: 'Verbindung',
        };
        return map[val] || val || '—';
    }

    // ── Synergy counter ───────────────────────────────────────────
    function renderSynergyCount(results) {
        var el = document.getElementById('hm-synergy-count');
        if (!el) return;
        var count = (results.synergies || []).length;
        var total = MODEL.SYNERGIES.length;
        el.innerHTML =
            '<span class="hm-synergy-count__num">' + count + '</span>' +
            ' von ' + total + ' Synergien aktiviert' +
            '<span class="hm-synergy-count__hint">Klicke auf goldene Knoten für Details</span>';
    }

    // ── Radar Charts (Chart.js) ───────────────────────────────────
    function renderCharts(results) {
        var scores = results.scores;
        var chartSection = document.getElementById('hm-charts-section');
        if (!chartSection) return;
        if (typeof Chart === 'undefined') {
            chartSection.style.display = 'none';
            return;
        }

        var textDim = 'rgba(180,170,155,0.85)';
        var gridColor = 'rgba(255,255,255,0.08)';

        var radarDefaults = {
            type: 'radar',
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { display: false, stepSize: 25 },
                        grid: { color: gridColor },
                        angleLines: { color: gridColor },
                        pointLabels: {
                            color: textDim,
                            font: { family: 'Inter, sans-serif', size: 11 },
                        },
                    },
                },
                plugins: { legend: { display: false } },
                animation: { duration: 800, easing: 'easeOutQuart' },
            },
        };

        // Chart 1: Big Five Personality
        var personalityDims = ['offenheit', 'gewissenhaftigkeit', 'extraversion', 'vertraeglichkeit', 'neurotizismus'];
        var personalityLabels = ['Offenheit', 'Gewissen\xadhaftig.', 'Extraversion', 'Vertr\xe4g\xadlich.', 'Neurotiz.'];
        var personalityColor = '#8b7cf8';

        // Map existing dims — fallback to related dims if missing
        var dimMapping = {
            offenheit:        ['offenheit'],
            gewissenhaftigkeit: ['struktur'],
            extraversion:     ['energie'],
            vertraeglichkeit: ['verbindung'],
            neurotizismus:    ['rumination'],
        };

        var p1Data = personalityDims.map(function(d) {
            var sources = dimMapping[d];
            var val = 0;
            sources.forEach(function(s) { if (scores[s] !== undefined) val = scores[s]; });
            return val;
        });

        var ctx1 = document.getElementById('hm-chart-personality');
        if (ctx1) {
            new Chart(ctx1, Object.assign({}, radarDefaults, {
                data: {
                    labels: personalityLabels,
                    datasets: [{
                        data: p1Data,
                        backgroundColor: personalityColor + '22',
                        borderColor: personalityColor,
                        borderWidth: 2,
                        pointBackgroundColor: personalityColor,
                        pointRadius: 3,
                    }],
                },
                options: Object.assign({}, radarDefaults.options),
            }));
        }

        // Chart 2: Growth / Potential Profile
        var potentialDims  = ['mindset_growth', 'grit_passion', 'grit_ausdauer', 'loc_internal', 'tiefe'];
        var potentialLabels = ['Wachstums\xadmindset', 'Leidenschaft', 'Ausdauer', 'Kontroll\xaderleben', 'Tiefe'];
        var potentialColor  = '#c9a84c';

        var p2Data = potentialDims.map(function(d) { return scores[d] !== undefined ? scores[d] : 50; });

        var ctx2 = document.getElementById('hm-chart-intel');
        if (ctx2) {
            new Chart(ctx2, Object.assign({}, radarDefaults, {
                data: {
                    labels: potentialLabels,
                    datasets: [{
                        data: p2Data,
                        backgroundColor: potentialColor + '22',
                        borderColor: potentialColor,
                        borderWidth: 2,
                        pointBackgroundColor: potentialColor,
                        pointRadius: 3,
                    }],
                },
                options: Object.assign({}, radarDefaults.options),
            }));
        }
    }

    // ── Info popup — fixed at top-right of current viewport ───────
    var _popup, _popupLastDimId, _popupJustOpened;

    function setupPanel() {
        _popup = document.getElementById('hm-popup');
        if (!_popup) return;

        // Close when clicking outside — but only if NOT the click that opened it
        document.addEventListener('click', function(e) {
            if (_popupJustOpened) { _popupJustOpened = false; return; }
            if (_popup.classList.contains('is-open') && !_popup.contains(e.target)) {
                closePopup();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closePopup();
        });

        document.addEventListener('hm:nodeclick', function(e) {
            var d = e.detail;
            var panelKey = d.dim;
            if (d.categorical && d.catValue) {
                var formatted = formatCatValue(d.catValue);
                var ckm = MODEL.CATEGORY_KEY_MAP;
                if (ckm && ckm[formatted]) panelKey = ckm[formatted];
            }
            openDimPanel(panelKey, d.score, d.categorical, d.catValue, d.color);
        });

        document.addEventListener('hm:synergyclick', function(e) {
            var d = e.detail, syn = d.syn, isActive = d.isActive;
            var accentColor = isActive ? '#c9a84c' : '#555';
            var html = '<button class="hm-popup__close" aria-label="Schlie\u00dfen" onclick="document.getElementById(\'hm-popup\').classList.remove(\'is-open\')">&times;</button>';
            html += '<div class="hm-bs-title" style="color:' + accentColor + '">' + (isActive ? '\u2746 ' : '\ud83d\udd12 ') + syn.name + '</div>';
            if (isActive) {
                html += '<div class="hm-bs-tagline" style="color:#c9a84c99">Synergie aktiviert</div>';
                if (syn.desc) html += '<div class="hm-bs-desc">' + syn.desc + '</div>';
                if (syn.connects && syn.connects.length) {
                    html += '<ul class="hm-bs-cond-list">';
                    syn.connects.forEach(function(dimId) {
                        var meta = MODEL.DIMS[dimId];
                        html += '<li class="met"><span class="hm-bs-check">\u2714\ufe0f</span>' + (meta ? meta.label : dimId) + '</li>';
                    });
                    html += '</ul>';
                }
            } else {
                html += '<div class="hm-bs-tagline" style="color:#55555599">Noch nicht freigeschaltet</div>';
                html += '<div class="hm-bs-desc">Diese Synergie wird aktiviert, wenn bestimmte Dimensionen ein bestimmtes Level erreichen.</div>';
            }
            _popupLastDimId = null;
            showPopup(html, d.clientY);
        });
    }

    function closePopup() {
        if (_popup) {
            _popup.classList.remove('is-open');
            _popupLastDimId = null;
        }
    }

    function showPopup(html, clientY) {
        if (!_popup) return;
        _popup.innerHTML = html;
        _popupJustOpened = true;  // suppress the outside-click listener this tick

        // Set top based on where user clicked, clamped so panel stays on screen
        var margin = 12;
        var topY = (clientY != null ? clientY : window.innerHeight / 2) - margin;
        // After render, clamp so it doesn't overflow the bottom
        _popup.style.top = Math.max(8, topY) + 'px';
        _popup.classList.add('is-open');
        requestAnimationFrame(function() {
            var ph = _popup.offsetHeight;
            var maxTop = window.innerHeight - ph - 8;
            if (topY > maxTop) _popup.style.top = Math.max(8, maxTop) + 'px';
        });
    }

    function openDimPanel(dimId, score, isCategorical, catValue, color, clientY) {
        if (!_popup) return;

        // Toggle: click same dim again → close
        if (_popupLastDimId === dimId && _popup.classList.contains('is-open')) {
            closePopup();
            return;
        }
        _popupLastDimId = dimId;

        var exp = MODEL.DIMENSION_EXPLANATIONS && MODEL.DIMENSION_EXPLANATIONS[dimId];
        var dimColor = color || (exp && exp.color) || '#c9a84c';

        var html = '<button class="hm-popup__close" aria-label="Schlie\u00dfen" onclick="document.getElementById(\'hm-popup\').classList.remove(\'is-open\')">&times;</button>';

        if (exp) {
            var levelBadgeHtml = '';
            if (!isCategorical && score !== null && score !== undefined) {
                var lvl = Scoring.scoreToLevel(score);
                var lvlLbl = Scoring.levelLabel ? Scoring.levelLabel(lvl) : MODEL.LEVEL_LABELS[lvl] || '';
                var levelLabel = 'Lv ' + lvl + ' \u00b7 ' + lvlLbl;
                levelBadgeHtml = '<span class="hm-panel-level-badge" style="color:' + dimColor + ';border-color:' + dimColor + '55;background:' + dimColor + '18">' + levelLabel + '</span>';
            } else if (isCategorical && catValue) {
                var fv = formatCatValue(catValue);
                levelBadgeHtml = '<span class="hm-panel-level-badge" style="color:' + dimColor + ';border-color:' + dimColor + '55;background:' + dimColor + '18">' + fv + '</span>';
            }

            html += '<div class="hm-panel-title-row">';
            html += '<span class="hm-panel-name" style="color:' + dimColor + '">' + exp.label + '</span>';
            html += levelBadgeHtml;
            html += '</div>';

            if (!isCategorical && score !== null && score !== undefined) {
                html += '<div class="hm-panel-score-row">';
                html += '<div class="hm-panel-score-num" style="color:' + dimColor + '">' + score + '<span> / 100</span></div>';
                html += '<div class="hm-panel-bar-track"><div class="hm-panel-bar-fill" style="width:' + score + '%;background:' + dimColor + '"></div></div>';
                html += '</div>';
            }

            if (exp.what) {
                html += '<div class="hm-panel-section"><strong>Was ist das?</strong><p>' + exp.what + '</p></div>';
            }

            var interpText = '';
            if (isCategorical) {
                interpText = exp.interpretation || '';
            } else if (score !== null && score !== undefined) {
                interpText = score < 35 ? (exp.low || '') : score < 65 ? (exp.mid || '') : (exp.high || '');
            }
            if (interpText) {
                html += '<div class="hm-panel-section"><strong>Was bedeutet dein Wert?</strong><p>' + interpText + '</p></div>';
            }

            if (exp.growth) {
                html += '<div class="hm-panel-growth"><span class="hm-panel-growth__label">Wachstumsimpuls</span><p>' + exp.growth + '</p></div>';
            }

            if (exp.related && exp.related.length) {
                var relatedHtml = exp.related.map(function(relId) {
                    var relMeta = MODEL.DIMS[relId];
                    var relLabel = relMeta ? relMeta.label : relId;
                    var relColor = relMeta ? relMeta.color : '#555';
                    return '<span class="hm-panel-related-tag" style="border-color:' + relColor + '44;color:' + relColor + '">' + relLabel + '</span>';
                }).join('');
                html += '<div class="hm-panel-section"><strong>Verbunden mit</strong><div class="hm-panel-related">' + relatedHtml + '</div></div>';
            }
        } else {
            var fallbackLabel = MODEL.DIMS[dimId] ? MODEL.DIMS[dimId].label : dimId;
            html += '<div class="hm-bs-title" style="color:' + dimColor + '">' + fallbackLabel + '</div>';
            if (!isCategorical && score !== null && score !== undefined) {
                html += '<div class="hm-bs-score" style="color:' + dimColor + '">' + score + '<span> / 100</span></div>';
            } else if (catValue) {
                html += '<div class="hm-bs-tagline" style="color:' + dimColor + '99">' + formatCatValue(catValue) + '</div>';
            }
        }

        showPopup(html, clientY);
    }

    // ── Debug mode (?debug=1) ─────────────────────────────────────
    function setupDebugMode(results) {
        if (!/[?&]debug=1/.test(window.location.search)) return;

        // Compute archetype match percentages for all archetypes
        const allScores = { ...results.scores, ...results.categorical };
        const ranked = MODEL.ARCHETYPES.map(arch => ({
            arch,
            score: Archetypes.scoreArchetype(arch, allScores),
        })).sort((a, b) => b.score - a.score);

        const panel = document.createElement('div');
        panel.id = 'hm-debug-panel';
        panel.style.cssText = `
            position:fixed;bottom:0;right:0;width:340px;max-height:70vh;overflow-y:auto;
            background:#0d0d0d;border:1px solid #c9a84c;border-radius:10px 0 0 0;
            padding:16px;z-index:9999;font-family:monospace;font-size:11px;color:#ccc;`;

        const scoresHtml = Object.entries(results.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #1a1a1a;padding:2px 0"><span>${k}</span><span style="color:${v>70?'#88d878':v>45?'#c9a84c':'#777'}">${typeof v === 'number' ? v : v}</span></div>`)
            .join('');

        const archetypesHtml = ranked.map((item, i) => {
            const isMain = i === 0;
            return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #1a1a1a;${isMain?'color:#c9a84c;font-weight:bold':''}">
                <span>${item.arch.emoji || '●'} ${item.arch.name}${item.arch.rare?' ✦':''}</span>
                <span>${item.score.toFixed(1)}%</span></div>`;
        }).join('');

        panel.innerHTML = `
            <div style="color:#c9a84c;font-weight:bold;margin-bottom:8px">🔍 Debug Mode</div>
            <div style="color:#888;margin-bottom:4px;font-size:10px">ARCHETYP MATCH</div>
            ${archetypesHtml}
            <div style="color:#888;margin:8px 0 4px;font-size:10px">DIMENSION SCORES</div>
            ${scoresHtml}
            <div style="color:#888;margin:8px 0 4px;font-size:10px">KATEGORISCH</div>
            ${Object.entries(results.categorical||{}).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:2px 0"><span>${k}</span><span style="color:#8b7cf8">${v}</span></div>`).join('')}
            <button onclick="this.parentElement.remove()" style="margin-top:10px;background:#c9a84c;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;color:#000;font-size:11px">Schließen</button>`;

        document.body.appendChild(panel);
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => Results.init());
