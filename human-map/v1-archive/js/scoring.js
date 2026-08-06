/**
 * HUMAN MAP – Scoring Engine
 * Converts raw answers into normalized dimension scores (0-100).
 */

const Scoring = (() => {

    /**
     * Normalize a likert-7 response (1-7) to 0-100.
     * Optionally invert for reverse-scored items.
     */
    function normalizeLikert(val, invert = false) {
        const n = (val - 1) / 6 * 100;
        return invert ? 100 - n : n;
    }

    /**
     * Convert a scenario value-map entry (0-1 float) to a 0-100 score.
     */
    function normalizeScenario(val) {
        return val * 100;
    }

    /**
     * Map a numeric score (0-100) to skill tree level 1-5.
     */
    function scoreToLevel(score) {
        if (score >= 82) return 5;
        if (score >= 65) return 4;
        if (score >= 45) return 3;
        if (score >= 25) return 2;
        return 1;
    }

    /**
     * Return a text badge label for a given level.
     */
    function levelLabel(level) {
        const labels = { 1: 'Anfang', 2: 'Entwicklung', 3: 'Aktiv', 4: 'Stark', 5: 'Meister' };
        return labels[level] || '—';
    }

    /**
     * Compute all dimension scores from the answers object.
     * Returns { scores: { dim: 0-100 }, categorical: { dim: string } }
     */
    function computeScores(answers) {
        // Accumulators: { dim: { total: number, weight: number } }
        const acc = {};
        const categorical = {};

        // Helper: add a weighted value to accumulator
        function addToAcc(dim, value, weight) {
            if (value === undefined || value === null) return;
            if (!acc[dim]) acc[dim] = { total: 0, weight: 0 };
            acc[dim].total  += value * weight;
            acc[dim].weight += weight;
        }

        MODEL.QUESTIONS.forEach(q => {
            const answer = answers[q.id];
            if (answer === undefined || answer === null) return;

            if (q.type === 'likert-7') {
                const val = Number(answer);
                if (isNaN(val)) return;
                q.dims.forEach(dimSpec => {
                    const normalized = normalizeLikert(val, !!dimSpec.invert);
                    const w = dimSpec.weight !== undefined ? Math.abs(dimSpec.weight) : 1;
                    // Negative weight means the relationship is inverted already handled by invert flag
                    addToAcc(dimSpec.dim, normalized, w);
                });
            } else {
                // scenario-binary, scenario-4way, forced-3way
                q.dims.forEach(dimSpec => {
                    if (dimSpec.dim.startsWith('_')) {
                        // Categorical capture
                        const catKey = dimSpec.dim.slice(1); // remove leading _
                        if (dimSpec.valueMap && dimSpec.valueMap[answer] !== undefined) {
                            categorical[catKey] = dimSpec.valueMap[answer];
                        }
                        return;
                    }
                    if (!dimSpec.valueMap || dimSpec.valueMap[answer] === undefined) return;
                    const mapped = dimSpec.valueMap[answer];
                    const w = dimSpec.weight !== undefined ? dimSpec.weight : 1;
                    addToAcc(dimSpec.dim, normalizeScenario(mapped), w);
                });
            }
        });

        // Finalize weighted averages
        const scores = {};
        Object.entries(acc).forEach(([dim, { total, weight }]) => {
            scores[dim] = weight > 0 ? Math.round(total / weight) : 50;
        });

        // Fill in missing numeric dims with neutral 50
        Object.keys(MODEL.DIMS).forEach(dim => {
            if (!MODEL.DIMS[dim].categorical && scores[dim] === undefined) {
                scores[dim] = 50;
            }
        });

        // Derive intelligence flags (for archetype conditions)
        scores.analytisch_intel = categorical.intel_primary === 'analytisch' ? 1 : 0;
        scores.sozial_intel      = categorical.intel_primary === 'sozial'    ? 1 : 0;
        scores.kreativ_intel     = categorical.intel_primary === 'kreativ'   ? 1 : 0;

        return { scores, categorical };
    }

    /**
     * Build a summary array for UI display.
     * Returns array of { dim, label, score, level, levelLabel, color, cluster, categorical }
     */
    function buildDimSummary(scores, categorical) {
        return Object.entries(MODEL.DIMS).map(([dim, meta]) => {
            if (meta.categorical) {
                const val = categorical[dim] || '—';
                return { dim, label: meta.label, score: null, level: null, levelLabel: null, color: meta.color, cluster: meta.cluster, categorical: true, value: val };
            }
            const score = scores[dim] !== undefined ? scores[dim] : 50;
            const level = scoreToLevel(score);
            return { dim, label: meta.label, score, level, levelLabel: levelLabel(level), color: meta.color, cluster: meta.cluster, categorical: false };
        });
    }

    return { computeScores, scoreToLevel, levelLabel, buildDimSummary };
})();
