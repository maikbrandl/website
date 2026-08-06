/**
 * HUMAN MAP – Archetype & Synergy Detection
 */

const Archetypes = (() => {

    /**
     * Evaluate a single condition against the merged scores+categorical object.
     * Returns a match score 0.0–1.0.
     */
    function evalCondition(cond, allScores) {
        const actual = allScores[cond.dim];
        if (actual === undefined || actual === null) return 0;

        if (cond.op === '>=') {
            const n = Number(actual);
            if (isNaN(n)) return 0;
            if (n >= cond.threshold) {
                const range = 100 - cond.threshold;
                const excess = range > 0 ? (n - cond.threshold) / range : 1;
                return 0.6 + 0.4 * Math.min(excess, 1);
            } else {
                const gap = cond.threshold > 0 ? (cond.threshold - n) / cond.threshold : 1;
                return Math.max(0, 0.6 - gap * 1.5);
            }

        } else if (cond.op === '=') {
            // Ceiling / "should be below threshold"
            const n = Number(actual);
            if (isNaN(n)) return 0;
            if (n < cond.threshold) {
                return 1.0;
            } else {
                const range = 100 - cond.threshold;
                const overage = range > 0 ? (n - cond.threshold) / range : 1;
                return Math.max(0, 1.0 - overage * 1.5);
            }

        } else if (cond.op === '===') {
            return actual === cond.value ? 1.0 : 0.0;
        }

        return 0;
    }

    /**
     * Score an archetype against the current results.
     * Returns 0-100 match percentage.
     */
    function scoreArchetype(archetype, allScores) {
        let totalWeight = 0;
        let weightedMatch = 0;

        archetype.conditions.forEach(cond => {
            const w = cond.weight !== undefined ? cond.weight : 1;
            const match = evalCondition(cond, allScores);
            weightedMatch += match * w;
            totalWeight   += w;
        });

        return totalWeight > 0 ? (weightedMatch / totalWeight) * 100 : 0;
    }

    /**
     * Detect primary and secondary archetypes.
     * Returns { primary, secondary, primaryScore, secondaryScore, all }
     */
    function detectArchetype(scores, categorical) {
        const allScores = { ...scores, ...categorical };

        const ranked = MODEL.ARCHETYPES
            .map(arch => ({ arch, score: scoreArchetype(arch, allScores) }))
            .sort((a, b) => b.score - a.score);

        return {
            primary:        ranked[0].arch,
            secondary:      ranked[1].arch,
            primaryScore:   ranked[0].score,
            secondaryScore: ranked[1].score,
            all:            ranked,
        };
    }

    /**
     * Detect active synergies (visual connections in skill tree).
     * Returns array of SYNERGIES entries where both conditions pass threshold 65.
     */
    function detectSynergies(scores, categorical) {
        const allScores = { ...scores, ...categorical };

        return MODEL.SYNERGIES.filter(syn => {
            return syn.conditions.every(cond => {
                const actual = allScores[cond.dim];
                if (actual === undefined) return false;
                const n = Number(actual);
                if (isNaN(n)) return false;
                return cond.op === '>=' ? n >= cond.threshold : n < cond.threshold;
            });
        });
    }

    /**
     * Check if any rare/synergy archetypes are activated (score > 72).
     */
    function detectRareArchetypes(scores, categorical) {
        const allScores = { ...scores, ...categorical };
        return MODEL.ARCHETYPES
            .filter(a => a.rare)
            .map(arch => ({ arch, score: scoreArchetype(arch, allScores) }))
            .filter(({ score }) => score > 72)
            .sort((a, b) => b.score - a.score);
    }

    return { detectArchetype, detectSynergies, detectRareArchetypes, scoreArchetype, calculateSimilarity };

    /**
     * Calculate how similar the user's scores are to a given archetype profile.
     * Uses ARCHETYPE_PROFILES from MODEL: { dimId: [min, max], ... }
     * Returns 0–100.
     */
    function calculateSimilarity(userScores, archetypeId) {
        const profile = MODEL.ARCHETYPE_PROFILES && MODEL.ARCHETYPE_PROFILES[archetypeId];
        if (!profile) return 0;
        let total = 0, count = 0;
        Object.entries(profile).forEach(([dim, [min, max]]) => {
            const val = userScores[dim];
            if (val === undefined || val === null) return;
            count++;
            const center    = (min + max) / 2;
            const tolerance = (max - min) / 2 + 8;   // ±8 grace zone outside range
            const dist      = Math.abs(Number(val) - center);
            total += Math.max(0, 1 - dist / tolerance);
        });
        return count > 0 ? Math.round((total / count) * 100) : 0;
    }
})();