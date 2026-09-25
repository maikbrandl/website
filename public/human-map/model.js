/**
 * HUMAN MAP v2 – Model
 * The six scientific layers, scale definitions and the CORE item bank.
 *
 * Layers (§3 of the spec):
 *   A · terrain      – Big Five personality + cognitive thinking style  (stable, measured once)
 *   C · werte        – Schwartz value priorities                        (changeable)
 *   C · beduerfnisse – SDT basic need satisfaction + frustration        (changeable)
 *   D · sinn         – Meaning: coherence / purpose / mattering         (changeable)
 *   B · praegung     – Early maladaptive schema screen (Young domains)  (changeable)
 *   D · bewegung     – Change process — NOT measured, it is the transformation engine
 *
 * Rule: numeric scales drive visuals & maths; categorical values only colour texts.
 *
 * SCALE PROVENANCE  (design decision: deliberately short, adapted, NON-diagnostic self-reflection
 * items grounded in established models — NOT the licensed clinical instruments. This is stated
 * openly to the user on learn.html and in every disclaimer. Full psychometric validation would
 * require the licensed scales; that trade-off is accepted for a self-development web tool.)
 *   - Big Five  : Mini-IPIP (Donnellan et al. 2006), IPIP is Public Domain. The 20 German items
 *                 below are faithful translations of the exact Mini-IPIP marker items (verified
 *                 against ipip.ori.org). This layer is the most rigorously grounded of the six.
 *   - Needs     : SDT basic-need satisfaction + frustration in the tradition of the BPNSFS
 *                 (Chen et al. 2015); 2 items per subscale (sat + frust). Adapted German wording.
 *   - Values    : all 10 Schwartz basic values, one importance-rated item each (SVS-style rating,
 *                 not PVQ portraits). Adapted German wording; covers the full value circle.
 *   - Meaning   : Martela & Steger (2016) three-component model (coherence / purpose / mattering),
 *                 2 items each. Adapted German wording.
 *   - Schema    : short NON-clinical screen of Young's 5 schema domains. Explicitly NOT the YSQ and
 *                 never presented as a diagnosis (see "keine klinische Diagnose" note on learn.html).
 */

const ModelV2 = (() => {

    // ── Big Five trait keys (German-facing) ──────────────────────────
    // facet letters map Mini-IPIP items -> our five traits.
    //   O = Offenheit, C = Gewissenhaftigkeit, E = Extraversion,
    //   A = Verträglichkeit, N = Neurotizismus (Stabilität = 100 - N)
    const TRAITS = {
        offenheit:         { label: 'Offenheit',          facet: 'O' },
        gewissenhaftigkeit:{ label: 'Gewissenhaftigkeit', facet: 'C' },
        extraversion:      { label: 'Extraversion',       facet: 'E' },
        vertraeglichkeit:  { label: 'Verträglichkeit',    facet: 'A' },
        stabilitaet:       { label: 'Emotionale Stabilität', facet: 'N', invertFacet: true },
    };

    // ── Schwartz basic values (numeric priority) ─────────────────────
    const VALUES = {
        selbstbestimmung: 'Selbstbestimmung',
        stimulation:      'Stimulation',
        hedonismus:       'Genuss',
        leistung:         'Leistung',
        macht:            'Einfluss',
        sicherheit:       'Sicherheit',
        konformitaet:     'Anpassung',
        tradition:        'Tradition',
        benevolenz:       'Fürsorge',
        universalismus:   'Gerechtigkeit',
    };

    // ── SDT basic needs ──────────────────────────────────────────────
    const NEEDS = {
        autonomie:     'Autonomie',
        kompetenz:     'Kompetenz',
        verbundenheit: 'Verbundenheit',
    };

    // ── Meaning components (Martela & Steger 2016) ───────────────────
    const MEANING = {
        kohaerenz:     'Kohärenz',
        purpose:       'Purpose',
        bedeutsamkeit: 'Bedeutsamkeit',
    };

    // ── Young schema domains ─────────────────────────────────────────
    const SCHEMA_DOMAINS = {
        abgetrenntheit:   'Abgetrenntheit & Ablehnung',
        autonomie:        'Beeinträchtigte Autonomie',
        grenzen:          'Beeinträchtigte Grenzen',
        fremdbezogenheit: 'Fremdbezogenheit',
        wachsamkeit:      'Übermäßige Wachsamkeit',
    };

    // ── Sections of the CORE questionnaire (for the assessment UI) ───
    const SECTIONS = [
        { id: 'terrain',      layer: 'A', label: 'Dein Terrain',      sub: 'Wie du grundsätzlich tickst, deine Persönlichkeit.' },
        { id: 'werte',        layer: 'C', label: 'Dein Antrieb',      sub: 'Was dir wirklich wichtig ist, deine Werte.' },
        { id: 'beduerfnisse', layer: 'C', label: 'Deine Bedürfnisse', sub: 'Woran es dir gerade genug gibt, und woran nicht.' },
        { id: 'sinn',         layer: 'D', label: 'Dein Sinn',         sub: 'Ob dein Leben sich stimmig und bedeutsam anfühlt.' },
        { id: 'praegung',     layer: 'B', label: 'Deine Prägung',     sub: 'Alte Grundüberzeugungen, die im Hintergrund mitlaufen.' },
    ];

    const LIKERT_AGREE   = ['Trifft gar nicht zu', 'Trifft völlig zu'];
    const LIKERT_IMPORT  = ['Gar nicht wichtig', 'Extrem wichtig'];

    // Helper to keep item authoring compact.
    const A = (id, scale, key, text, opts = {}) => ({
        id, section: opts.section, layer: opts.layer, type: 'likert-7',
        scale, key, text,
        anchors: opts.anchors || LIKERT_AGREE,
        reverse: !!opts.reverse,
        kind: opts.kind,          // needs: 'sat' | 'frust'
    });

    // ═══════════════════════════════════════════════════════════════
    //  CORE ITEM BANK
    // ═══════════════════════════════════════════════════════════════

    // ── A · Terrain — Big Five (Mini-IPIP, 20 items) ─────────────────
    const TERRAIN_ITEMS = [
        // Openness / Intellect-Imagination
        A('t_o1', 'bigfive', 'O', 'Ich habe eine lebhafte Vorstellungskraft.',              { section: 'terrain', layer: 'A' }),
        A('t_o2', 'bigfive', 'O', 'Mit abstrakten Ideen kann ich wenig anfangen.',          { section: 'terrain', layer: 'A', reverse: true }),
        A('t_o3', 'bigfive', 'O', 'Abstrakte Ideen zu verstehen fällt mir schwer.',         { section: 'terrain', layer: 'A', reverse: true }),
        A('t_o4', 'bigfive', 'O', 'Eine gute Vorstellungskraft habe ich eigentlich nicht.', { section: 'terrain', layer: 'A', reverse: true }),
        // Conscientiousness
        A('t_c1', 'bigfive', 'C', 'Aufgaben erledige ich am liebsten sofort.',              { section: 'terrain', layer: 'A' }),
        A('t_c2', 'bigfive', 'C', 'Ich vergesse oft, Dinge an ihren Platz zurückzulegen.',  { section: 'terrain', layer: 'A', reverse: true }),
        A('t_c3', 'bigfive', 'C', 'Ich mag Ordnung.',                                       { section: 'terrain', layer: 'A' }),
        A('t_c4', 'bigfive', 'C', 'Ich bringe Dinge leicht durcheinander.',                 { section: 'terrain', layer: 'A', reverse: true }),
        // Extraversion
        A('t_e1', 'bigfive', 'E', 'Auf Feiern bin ich mittendrin statt nur dabei.',         { section: 'terrain', layer: 'A' }),
        A('t_e2', 'bigfive', 'E', 'Ich rede nicht viel.',                                    { section: 'terrain', layer: 'A', reverse: true }),
        A('t_e3', 'bigfive', 'E', 'Ich spreche gern mit vielen verschiedenen Menschen.',    { section: 'terrain', layer: 'A' }),
        A('t_e4', 'bigfive', 'E', 'Ich halte mich lieber im Hintergrund.',                  { section: 'terrain', layer: 'A', reverse: true }),
        // Agreeableness
        A('t_a1', 'bigfive', 'A', 'Ich fühle mit anderen mit.',                             { section: 'terrain', layer: 'A' }),
        A('t_a2', 'bigfive', 'A', 'Die Probleme anderer interessieren mich wenig.',         { section: 'terrain', layer: 'A', reverse: true }),
        A('t_a3', 'bigfive', 'A', 'Ich spüre die Gefühle anderer Menschen.',                { section: 'terrain', layer: 'A' }),
        A('t_a4', 'bigfive', 'A', 'An anderen bin ich eigentlich wenig interessiert.',      { section: 'terrain', layer: 'A', reverse: true }),
        // Neuroticism (Stability = 100 - N)
        A('t_n1', 'bigfive', 'N', 'Meine Stimmung schwankt häufig.',                        { section: 'terrain', layer: 'A' }),
        A('t_n2', 'bigfive', 'N', 'Die meiste Zeit bin ich entspannt.',                     { section: 'terrain', layer: 'A', reverse: true }),
        A('t_n3', 'bigfive', 'N', 'Ich bin schnell aus der Fassung zu bringen.',            { section: 'terrain', layer: 'A' }),
        A('t_n4', 'bigfive', 'N', 'Ich fühle mich selten niedergeschlagen.',               { section: 'terrain', layer: 'A', reverse: true }),
    ];

    // ── C · Werte — Schwartz basic values (10 items) ─────────────────
    const VALUE_ITEMS = Object.keys(VALUES).map((key, i) => {
        const prompts = {
            selbstbestimmung: 'eigene Entscheidungen frei zu treffen und unabhängig zu sein',
            stimulation:      'Abwechslung, Aufregung und neue Erfahrungen zu erleben',
            hedonismus:       'das Leben zu genießen und mir Gutes zu gönnen',
            leistung:         'erfolgreich zu sein und etwas zu leisten',
            macht:            'Einfluss zu haben und Dinge mitzubestimmen',
            sicherheit:       'Sicherheit, Stabilität und Ordnung zu haben',
            konformitaet:     'mich einzufügen und nicht anzuecken',
            tradition:        'Bewährtes und Traditionen zu bewahren',
            benevolenz:       'für die Menschen da zu sein, die mir nahe sind',
            universalismus:   'mich für Gerechtigkeit und das Wohl aller einzusetzen',
        };
        return A(`v_${key}`, 'values', key, `Wie wichtig ist es dir, ${prompts[key]}?`,
            { section: 'werte', layer: 'C', anchors: LIKERT_IMPORT });
    });

    // ── C · Bedürfnisse — BPNSFS short (12 items) ────────────────────
    const NEED_ITEMS = [
        A('n_a_s1', 'needs', 'autonomie', 'Meine Entscheidungen fühlen sich wirklich wie meine eigenen an.', { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_a_s2', 'needs', 'autonomie', 'Ich fühle mich frei, Dinge auf meine Art zu tun.',               { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_a_f1', 'needs', 'autonomie', 'Ich fühle mich zu Dingen gedrängt, die ich nicht tun will.',      { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),
        A('n_a_f2', 'needs', 'autonomie', 'Vieles tue ich, weil ich muss, nicht weil ich will.',            { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),

        A('n_k_s1', 'needs', 'kompetenz', 'In dem, was ich tue, fühle ich mich fähig.',                     { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_k_s2', 'needs', 'kompetenz', 'Auch schwierige Aufgaben bekomme ich gut hin.',                  { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_k_f1', 'needs', 'kompetenz', 'Ich zweifle daran, ob ich Dinge gut genug hinbekomme.',          { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),
        A('n_k_f2', 'needs', 'kompetenz', 'Oft fühle ich mich, als würde ich versagen.',                    { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),

        A('n_v_s1', 'needs', 'verbundenheit', 'Mit den Menschen, die mir wichtig sind, fühle ich mich verbunden.', { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_v_s2', 'needs', 'verbundenheit', 'In meinen Beziehungen erlebe ich Wärme und Nähe.',           { section: 'beduerfnisse', layer: 'C', kind: 'sat' }),
        A('n_v_f1', 'needs', 'verbundenheit', 'Ich fühle mich einsam, auch wenn Menschen um mich sind.',    { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),
        A('n_v_f2', 'needs', 'verbundenheit', 'Die Menschen, die mir wichtig sind, wirken oft distanziert.', { section: 'beduerfnisse', layer: 'C', kind: 'frust' }),
    ];

    // ── D · Sinn — Meaning three components (6 items) ────────────────
    const MEANING_ITEMS = [
        A('s_koh1', 'meaning', 'kohaerenz',     'Mein Leben ergibt für mich einen roten Faden.',                 { section: 'sinn', layer: 'D' }),
        A('s_koh2', 'meaning', 'kohaerenz',     'Ich verstehe, warum die Dinge in meinem Leben so laufen.',      { section: 'sinn', layer: 'D' }),
        A('s_pur1', 'meaning', 'purpose',       'Ich habe Ziele und eine Richtung, die mich antreiben.',         { section: 'sinn', layer: 'D' }),
        A('s_pur2', 'meaning', 'purpose',       'Ich weiß, wofür ich morgens aufstehe.',                         { section: 'sinn', layer: 'D' }),
        A('s_bed1', 'meaning', 'bedeutsamkeit', 'Was ich tue, macht für andere oder die Welt einen Unterschied.',{ section: 'sinn', layer: 'D' }),
        A('s_bed2', 'meaning', 'bedeutsamkeit', 'Mein Dasein ist von Bedeutung.',                                { section: 'sinn', layer: 'D' }),
    ];

    // ── B · Prägung — Schema domain screen (10 items) ────────────────
    const SCHEMA_ITEMS = [
        A('p_ab1', 'schema', 'abgetrenntheit',   'Im Grunde rechne ich damit, verlassen oder enttäuscht zu werden.', { section: 'praegung', layer: 'B' }),
        A('p_ab2', 'schema', 'abgetrenntheit',   'So, wie ich wirklich bin, bin ich nicht liebenswert.',            { section: 'praegung', layer: 'B' }),
        A('p_au1', 'schema', 'autonomie',        'Ich traue mir nicht zu, allein gut zurechtzukommen.',             { section: 'praegung', layer: 'B' }),
        A('p_au2', 'schema', 'autonomie',        'Oft habe ich das Gefühl, zu versagen oder nicht zu genügen.',     { section: 'praegung', layer: 'B' }),
        A('p_gr1', 'schema', 'grenzen',          'Regeln, die für andere gelten, sollten für mich nicht so streng sein.', { section: 'praegung', layer: 'B' }),
        A('p_gr2', 'schema', 'grenzen',          'Mich zu disziplinieren oder Frust auszuhalten fällt mir schwer.', { section: 'praegung', layer: 'B' }),
        A('p_fr1', 'schema', 'fremdbezogenheit', 'Die Bedürfnisse anderer stelle ich fast immer über meine eigenen.',{ section: 'praegung', layer: 'B' }),
        A('p_fr2', 'schema', 'fremdbezogenheit', 'Ich tue viel, um Anerkennung zu bekommen und niemanden zu enttäuschen.', { section: 'praegung', layer: 'B' }),
        A('p_wa1', 'schema', 'wachsamkeit',      'Ich muss stark sein und darf keine Schwäche zeigen.',             { section: 'praegung', layer: 'B' }),
        A('p_wa2', 'schema', 'wachsamkeit',      'Ich erwarte von mir Perfektion und bin selten zufrieden.',       { section: 'praegung', layer: 'B' }),
    ];

    const CORE_ITEMS = [
        ...TERRAIN_ITEMS,
        ...VALUE_ITEMS,
        ...NEED_ITEMS,
        ...MEANING_ITEMS,
        ...SCHEMA_ITEMS,
    ];

    return {
        TRAITS, VALUES, NEEDS, MEANING, SCHEMA_DOMAINS,
        SECTIONS,
        TERRAIN_ITEMS, VALUE_ITEMS, NEED_ITEMS, MEANING_ITEMS, SCHEMA_ITEMS,
        CORE_ITEMS,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { ModelV2 };
