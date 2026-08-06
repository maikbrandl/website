/**
 * HUMAN MAP v2 — Store (two-speed persistence + history, §11)
 * Terrain (Big Five) is stable: measured once, its answers are cached. The
 * changeable layers (values / needs / meaning / prägung) can be re-measured to
 * reveal movement over time. Each completed run appends a compact snapshot.
 *
 * localStorage keys:
 *   humanmap_v2_answers          latest full answer set (source of truth for result)
 *   humanmap_v2_terrain_answers  cached stable terrain answers (for re-measure)
 *   humanmap_v2_history          array of compact snapshots (max 24)
 */
const StoreV2 = (() => {

    const ANSWERS_KEY = 'humanmap_v2_answers';
    const TERRAIN_KEY = 'humanmap_v2_terrain_answers';
    const HISTORY_KEY = 'humanmap_v2_history';
    const MAX_HISTORY = 24;

    function readJSON(key) {
        for (const store of [localStorage, sessionStorage]) {
            try {
                const raw = store.getItem(key);
                if (raw) return JSON.parse(raw);
            } catch (e) {}
        }
        return null;
    }
    function writeJSON(key, val) {
        const s = JSON.stringify(val);
        try { localStorage.setItem(key, s); } catch (e) {}
        try { sessionStorage.setItem(key, s); } catch (e) {}
    }

    function getHistory() {
        const h = readJSON(HISTORY_KEY);
        return Array.isArray(h) ? h : [];
    }

    function getTerrainAnswers() {
        const t = readJSON(TERRAIN_KEY);
        return (t && typeof t === 'object') ? t : null;
    }

    function hasTerrain() {
        const t = getTerrainAnswers();
        return !!(t && Object.keys(t).length);
    }

    // Compact, comparable snapshot of the changeable layers + focus.
    function snapshot(profile, mode) {
        const needs = {};
        Object.keys(profile.needs).forEach(k => {
            needs[k] = { e: Math.round(profile.needs[k].erfuellung), f: Math.round(profile.needs[k].frustration) };
        });
        return {
            at: new Date().toISOString(),
            mode: mode || 'full',
            needs,
            meaning: {
                kohaerenz: Math.round(profile.meaning.kohaerenz),
                purpose: Math.round(profile.meaning.purpose),
                bedeutsamkeit: Math.round(profile.meaning.bedeutsamkeit),
            },
            beliefs: profile.beliefs.map(b => ({ domain: b.domain, activation: Math.round(b.activation) })),
            values: profile.values.slice(0, 5).map(v => ({ key: v.key, score: Math.round(v.score) })),
            focus: profile.focus ? { id: profile.focus.id, label: profile.focus.label, leverage: profile.focus.leverage } : null,
        };
    }

    /** Persist a completed run: cache terrain (full runs only) + append snapshot. */
    function commit(profile, fullAnswers, mode) {
        writeJSON(ANSWERS_KEY, { answers: fullAnswers, completedAt: new Date().toISOString() });

        if (mode !== 'remeasure') {
            const terrain = {};
            ModelV2.CORE_ITEMS.forEach(it => {
                if (it.section === 'terrain' && fullAnswers[it.id] != null) terrain[it.id] = fullAnswers[it.id];
            });
            writeJSON(TERRAIN_KEY, terrain);
        }

        const history = getHistory();
        history.push(snapshot(profile, mode));
        while (history.length > MAX_HISTORY) history.shift();
        writeJSON(HISTORY_KEY, history);
    }

    /** The two most recent snapshots for movement comparison, or null. */
    function latestPair() {
        const h = getHistory();
        if (h.length < 2) return null;
        return { previous: h[h.length - 2], current: h[h.length - 1] };
    }

    function reset() {
        [ANSWERS_KEY, TERRAIN_KEY, HISTORY_KEY].forEach(k => {
            try { localStorage.removeItem(k); } catch (e) {}
            try { sessionStorage.removeItem(k); } catch (e) {}
        });
    }

    return { getHistory, getTerrainAnswers, hasTerrain, commit, latestPair, reset,
             ANSWERS_KEY, TERRAIN_KEY, HISTORY_KEY };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = StoreV2;
