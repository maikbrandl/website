/**
 * HUMAN MAP v2 – Layers
 * Assembles the final `profile` object from the raw score bundle:
 * derives active core beliefs, orders values, flags need frustration,
 * and sets a PROVISIONAL focus (the real leverage-based focus comes from InsightsV2 §7).
 */

const LayersV2 = (() => {

    const BELIEF_FLOOR   = 45;   // min activation for a belief to count as "active"
    const NEED_FRUST_HI  = 55;   // frustration at/above this is flagged
    const NEED_SAT_LO    = 40;   // satisfaction at/below this is flagged
    const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

    /**
     * Base schema activation, nudged by typical trait/need combinations (§5).
     * Returns the adjusted activation per domain (0-100).
     */
    function beliefActivations(raw) {
        const s = raw.schema;
        const t = raw.traits;
        const n = raw.needs;
        const boost = {
            abgetrenntheit:   0.5 * Math.max(0, n.verbundenheit.frustration - 50) + 0.3 * Math.max(0, 50 - t.stabilitaet),
            autonomie:        0.5 * Math.max(0, n.kompetenz.frustration - 50)     + 0.3 * Math.max(0, 50 - t.stabilitaet),
            grenzen:          0.4 * Math.max(0, 50 - t.gewissenhaftigkeit),
            fremdbezogenheit: 0.4 * Math.max(0, t.vertraeglichkeit - 50)          + 0.3 * Math.max(0, n.autonomie.frustration - 50),
            wachsamkeit:      0.4 * Math.max(0, t.gewissenhaftigkeit - 50)        + 0.3 * Math.max(0, 50 - t.stabilitaet),
        };
        const out = {};
        Object.keys(ModelV2.SCHEMA_DOMAINS).forEach(d => {
            out[d] = clamp(s[d] + (boost[d] || 0) * 0.4);
        });
        return out;
    }

    /** Active core beliefs, sorted by activation (desc), floored. */
    function deriveBeliefs(raw) {
        const acts = beliefActivations(raw);
        return Object.keys(acts)
            .map(domain => ({
                domain,
                activation: acts[domain],
                text: ContentV2.SCHEMA_BELIEFS[domain].text,
            }))
            .filter(b => b.activation >= BELIEF_FLOOR)
            .sort((a, b) => b.activation - a.activation);
    }

    /** Values sorted by priority (desc). */
    function orderValues(raw) {
        return Object.keys(raw.values)
            .map(key => ({ key, label: ModelV2.VALUES[key], score: raw.values[key] }))
            .sort((a, b) => b.score - a.score);
    }

    /** Needs with a frustration/deprivation flag. */
    function annotateNeeds(raw) {
        const out = {};
        Object.keys(ModelV2.NEEDS).forEach(key => {
            const nd = raw.needs[key];
            out[key] = {
                label: ModelV2.NEEDS[key],
                erfuellung: nd.erfuellung,
                frustration: nd.frustration,
                flag: nd.frustration >= NEED_FRUST_HI || nd.erfuellung <= NEED_SAT_LO,
            };
        });
        return out;
    }

    /**
     * Build the full profile object consumed by every view.
     * `history` is passed through untouched (managed by storage).
     */
    function buildProfile(raw, history = []) {
        const beliefs = deriveBeliefs(raw);
        const values  = orderValues(raw);
        const needs   = annotateNeeds(raw);

        // Provisional focus until the leverage engine (§7) runs:
        //   focusBelief = most active belief; focusValue = highest-priority value.
        const focusBelief = beliefs.length ? beliefs[0] : null;
        const focusValue  = values.length ? values[0] : null;

        return {
            traits: raw.traits,
            beliefs,
            values,
            needs,
            meaning: raw.meaning,
            focusValue,
            focusBelief,
            meta: raw.meta,
            history,
        };
    }

    return { buildProfile, deriveBeliefs, orderValues, annotateNeeds, beliefActivations };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { LayersV2 };
