/**
 * HUMAN MAP v2 – Scoring
 * Turns raw Likert answers into normalized per-scale scores (0-100).
 * Produces the RAW score bundle; LayersV2 assembles the final `profile` object.
 *
 * Two speeds (§5): terrain (A) is meant to be measured once; werte/beduerfnisse/sinn/praegung
 * are re-measurable over time. History handling lives in LayersV2/storage, not here.
 */

const ScoringV2 = (() => {

    /** Likert-7 (1..7) -> 0..100, optionally reverse-scored. */
    function normalizeLikert(val, reverse = false) {
        const n = (Number(val) - 1) / 6 * 100;
        return reverse ? 100 - n : n;
    }

    /** Mean of an array, or a neutral fallback when empty. */
    function mean(arr, fallback = 50) {
        if (!arr.length) return fallback;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    /**
     * Collect normalized values grouped by (scale, groupKey).
     * Returns a nested map: bucket[scale][group] = [values...]
     */
    function bucketize(answers) {
        const bucket = {};
        let answered = 0;
        ModelV2.CORE_ITEMS.forEach(item => {
            const raw = answers[item.id];
            if (raw === undefined || raw === null || raw === '') return;
            answered++;
            const val = normalizeLikert(raw, item.reverse);
            const group = item.kind ? `${item.key}:${item.kind}` : item.key;
            if (!bucket[item.scale]) bucket[item.scale] = {};
            if (!bucket[item.scale][group]) bucket[item.scale][group] = [];
            bucket[item.scale][group].push(val);
        });
        return { bucket, answered };
    }

    /**
     * Compute the raw score bundle from an answers object.
     * @returns {{
     *   traits: Object, values: Object, needs: Object,
     *   meaning: Object, schema: Object, meta: Object
     * }}
     */
    function computeRaw(answers) {
        const { bucket, answered } = bucketize(answers);
        const b = (scale) => bucket[scale] || {};

        // ── Traits: average each Big-Five facet, invert N -> Stabilität ──
        const facet = b('bigfive');
        const traits = {};
        Object.entries(ModelV2.TRAITS).forEach(([key, meta]) => {
            let score = Math.round(mean(facet[meta.facet] || []));
            if (meta.invertFacet) score = 100 - score;
            traits[key] = score;
        });

        // ── Values: single-item priority score per value ──
        const valScale = b('values');
        const values = {};
        Object.keys(ModelV2.VALUES).forEach(key => {
            values[key] = Math.round(mean(valScale[key] || []));
        });

        // ── Needs: satisfaction + frustration per need ──
        const needScale = b('needs');
        const needs = {};
        Object.keys(ModelV2.NEEDS).forEach(key => {
            needs[key] = {
                erfuellung:  Math.round(mean(needScale[`${key}:sat`]   || [])),
                frustration: Math.round(mean(needScale[`${key}:frust`] || [])),
            };
        });

        // ── Meaning: three components ──
        const meanScale = b('meaning');
        const meaning = {};
        Object.keys(ModelV2.MEANING).forEach(key => {
            meaning[key] = Math.round(mean(meanScale[key] || []));
        });

        // ── Schema: activation per domain ──
        const schemaScale = b('schema');
        const schema = {};
        Object.keys(ModelV2.SCHEMA_DOMAINS).forEach(key => {
            schema[key] = Math.round(mean(schemaScale[key] || []));
        });

        const total = ModelV2.CORE_ITEMS.length;
        return {
            traits, values, needs, meaning, schema,
            meta: {
                answered,
                total,
                complete: answered >= total,
                completeness: total ? Math.round((answered / total) * 100) : 0,
            },
        };
    }

    return { normalizeLikert, computeRaw };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { ScoringV2 };
