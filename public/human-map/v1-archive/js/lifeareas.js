/**
 * HUMAN MAP – Life Areas
 * Aggregates the 17 dimensions into 5 life areas and computes
 * intra-personal relative scores ("trägt" / "gleichgewicht" / "fordert").
 */

const LifeAreas = (() => {

    const LIFE_AREAS = {
        denken: {
            label: 'Denken & Entscheiden',
            accent: 'var(--area-denken)',
            weights: { offenheit: 0.40, tiefe: 0.35, werte_innovation: 0.25 },
            flavor: ['intel_primary'],
        },
        antrieb: {
            label: 'Antrieb & Umsetzung',
            accent: 'var(--area-antrieb)',
            weights: { struktur: 0.35, loc_internal: 0.35, werte_leistung: 0.30 },
            flavor: ['antrieb_type'],
        },
        beziehungen: {
            label: 'Beziehungen & Nähe',
            accent: 'var(--area-beziehungen)',
            weights: { verbindung: 0.55, energie: 0.45 },
            flavor: ['bindungsstil'],
        },
        balance: {
            label: 'Innere Balance',
            accent: 'var(--area-balance)',
            weights: { rumination: 0.55, loc_internal: 0.25, mindset_growth: 0.20 },
            invert: ['rumination'],
            flavor: ['stress_typ'],
        },
        wachstum: {
            label: 'Ausdauer & Wachstum',
            accent: 'var(--area-wachstum)',
            weights: { grit_ausdauer: 0.40, grit_passion: 0.30, mindset_growth: 0.30 },
            flavor: ['wachstumsfeld'],
        },
    };

    // Raw dimension score, inverted for this area if configured (e.g. rumination in "balance").
    function effectiveValue(area, dim, scores) {
        const raw = scores[dim] !== undefined ? scores[dim] : 50;
        return (area.invert || []).includes(dim) ? 100 - raw : raw;
    }

    /** { denken: 0-100, antrieb: 0-100, ... } */
    function computeAreaScores(scores) {
        const areaScores = {};
        Object.entries(LIFE_AREAS).forEach(([key, area]) => {
            let sum = 0;
            Object.entries(area.weights).forEach(([dim, weight]) => {
                sum += effectiveValue(area, dim, scores) * weight;
            });
            areaScores[key] = Math.round(sum);
        });
        return areaScores;
    }

    /** Bands relative to the person's own average — never "good/bad", only "laut/leise". */
    function relativeBands(areaScores) {
        const keys = Object.keys(areaScores);
        const mean = keys.reduce((sum, k) => sum + areaScores[k], 0) / keys.length;
        const bands = {};
        keys.forEach(k => {
            const delta = Math.round(areaScores[k] - mean);
            const band = delta >= 10 ? 'traegt' : delta <= -10 ? 'fordert' : 'gleichgewicht';
            bands[k] = { score: areaScores[k], delta, band };
        });
        return bands;
    }

    /**
     * The dimension within an area that drives the "leicht" (highest effective value)
     * and "schwer" (lowest effective value) text. Returns { dim, inverted } for each.
     */
    function driverDims(areaKey, scores) {
        const area = LIFE_AREAS[areaKey];
        let leicht = null, schwer = null;
        Object.keys(area.weights).forEach(dim => {
            const eff = effectiveValue(area, dim, scores);
            const inverted = (area.invert || []).includes(dim);
            if (!leicht || eff > leicht.eff) leicht = { dim, eff, inverted };
            if (!schwer || eff < schwer.eff) schwer = { dim, eff, inverted };
        });
        return { leicht, schwer };
    }

    function strongestWeakest(bands) {
        const entries = Object.entries(bands);
        let strongest = entries[0], weakest = entries[0];
        entries.forEach(e => {
            if (e[1].delta > strongest[1].delta) strongest = e;
            if (e[1].delta < weakest[1].delta) weakest = e;
        });
        return { strongestKey: strongest[0], weakestKey: weakest[0] };
    }

    return { LIFE_AREAS, computeAreaScores, relativeBands, driverDims, strongestWeakest };
})();
