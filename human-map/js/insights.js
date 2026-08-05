/**
 * HUMAN MAP – Insight Engine
 * Deterministic, score-driven text: Kernspannung, Brief, Bereichs-Karten, Experiment.
 * Nothing here is randomized or server-generated — same scores always produce the same text.
 */

const Insights = (() => {

    // HIGH = Score >= 65, LOW = Score <= 40. strength = Summe der Schwellen-Überschreitung.
    const TENSION_RULES = [
        { id: 'freiheit_vs_struktur',
          when: s => s.werte_freiheit >= 65 && s.struktur >= 65,
          strength: s => (s.werte_freiheit - 65) + (s.struktur - 65),
          text: 'Du willst Freiheit — und baust dir gleichzeitig ständig Strukturen, die dich einengen. Dein Antrieb sucht Weite, dein Alltag klammert sich an Kontrolle.' },

        { id: 'antrieb_vs_gruebeln',
          when: s => (s.werte_leistung >= 65 || s.grit_passion >= 65) && s.rumination >= 65,
          strength: s => Math.max(s.werte_leistung, s.grit_passion) - 65 + (s.rumination - 65),
          text: 'Du gibst Vollgas und trittst gleichzeitig innerlich auf die Bremse. Deine Energie ist da — sie versickert im Grübeln, bevor sie ankommt.' },

        { id: 'denken_vs_naehe',
          when: s => s.tiefe >= 65 && s.verbindung <= 40,
          strength: s => (s.tiefe - 65) + (40 - s.verbindung),
          text: 'Du durchschaust Systeme in Sekunden — Menschen kosten dich mehr Kraft. Was dir im Kopf leichtfällt, wird im Herzen zur Arbeit.' },

        { id: 'leistung_vs_selbstwirksamkeit',
          when: s => s.werte_leistung >= 65 && s.loc_internal <= 40,
          strength: s => (s.werte_leistung - 65) + (40 - s.loc_internal),
          text: 'Du willst viel erreichen — glaubst aber insgeheim, dass der Erfolg nicht wirklich in deiner Hand liegt. Dein Anspruch ist größer als dein Zutrauen.' },

        { id: 'offenheit_vs_struktur',
          when: s => s.offenheit >= 65 && s.struktur >= 65,
          strength: s => (s.offenheit - 65) + (s.struktur - 65),
          text: 'Dein Kopf sucht ständig Neues, dein Alltag hält am Bewährten fest. Du bist Entdecker und Verwalter zugleich — und beide streiten in dir.' },

        { id: 'energie_vs_verbindung_hoch_niedrig',
          when: s => s.energie >= 65 && s.verbindung <= 40,
          strength: s => (s.energie - 65) + (40 - s.verbindung),
          text: 'Du bist gern unter Menschen — echte Nähe hältst du trotzdem auf Abstand. Viel Kontakt, wenig Tiefe: Das schützt dich und einsam macht es dich zugleich.' },

        { id: 'verbindung_vs_energie_hoch_niedrig',
          when: s => s.verbindung >= 65 && s.energie <= 40,
          strength: s => (s.verbindung - 65) + (40 - s.energie),
          text: 'Du brauchst wenige Menschen, aber die ganz. Oberflächlicher Kontakt zehrt an dir — Tiefe gibt dir zurück, was Trubel dir nimmt.' },

        { id: 'ausdauer_vs_leidenschaft',
          when: s => s.grit_ausdauer >= 65 && s.grit_passion <= 40,
          strength: s => (s.grit_ausdauer - 65) + (40 - s.grit_passion),
          text: 'Du hältst durch — auch bei Dingen, die dir längst egal sind. Disziplin hast du reichlich; was fehlt, ist die Richtung, die sich lohnt.' },

        { id: 'leidenschaft_vs_ausdauer',
          when: s => s.grit_passion >= 65 && s.grit_ausdauer <= 40,
          strength: s => (s.grit_passion - 65) + (40 - s.grit_ausdauer),
          text: 'Du entflammst schnell — und verlierst ebenso schnell die Geduld. Feuer hast du genug, es fehlt der lange Atem, es brennen zu lassen.' },

        { id: 'leistung_vs_mindset',
          when: s => s.werte_leistung >= 65 && s.mindset_growth <= 40,
          strength: s => (s.werte_leistung - 65) + (40 - s.mindset_growth),
          text: 'Du willst gewinnen, glaubst aber tief drin, dass Talent angeboren ist. Das macht jeden Rückschlag persönlich — statt zu einem Schritt nach vorn.' },

        { id: 'innovation_vs_struktur',
          when: s => s.werte_innovation >= 65 && s.struktur >= 65,
          strength: s => (s.werte_innovation - 65) + (s.struktur - 65),
          text: 'Du willst umkrempeln — und gleichzeitig alles unter Kontrolle behalten. Dein Ehrgeiz will Chaos, dein Bedürfnis will Ordnung.' },

        { id: 'tiefe_vs_gruebeln',
          when: s => s.tiefe >= 65 && s.rumination >= 65,
          strength: s => (s.tiefe - 65) + (s.rumination - 65),
          text: 'Deine Gründlichkeit ist ein Geschenk — bis sie ins Grübeln kippt und dich lähmt. Dieselbe Tiefe, die dich klug macht, hält dich manchmal fest.' },

        { id: 'freiheit_vs_verbindung',
          when: s => s.werte_freiheit >= 65 && s.verbindung >= 65,
          strength: s => (s.werte_freiheit - 65) + (s.verbindung - 65),
          text: 'Du sehnst dich nach Nähe und nach Unabhängigkeit — und beides zieht ständig in andere Richtungen. Bindung fühlt sich schnell wie ein Käfig, Freiheit wie Einsamkeit.' },

        { id: 'kontrolle_vs_gruebeln',
          when: s => s.loc_internal >= 65 && s.rumination >= 65,
          strength: s => (s.loc_internal - 65) + (s.rumination - 65),
          text: 'Du glaubst, alles im Griff haben zu müssen — und genau deshalb lässt dich kein Gedanke los. Verantwortung und Grübeln sind bei dir dieselbe Münze.' },

        { id: 'anspruch_vs_risiko',
          when: s => s.offenheit <= 40 && s.werte_innovation >= 65,
          strength: s => (40 - s.offenheit) + (s.werte_innovation - 65),
          text: 'Du willst Neues schaffen, bleibst aber lieber im Vertrauten. Dein Anspruch ist größer als deine Risikobereitschaft — da liegt dein größtes ungenutztes Feld.' },

        { id: 'aussen_vs_innen',
          when: s => s.energie >= 65 && s.rumination >= 65,
          strength: s => (s.energie - 65) + (s.rumination - 65),
          text: 'Nach außen offen und aktiv, nach innen ein Grübler — kaum jemand ahnt, wie viel in dir gleichzeitig arbeitet.' },
    ];

    /** Top-scoring tension rule that fires for these scores, or null. */
    function pickTension(scores) {
        let best = null;
        TENSION_RULES.forEach(rule => {
            if (!rule.when(scores)) return;
            const strength = rule.strength(scores);
            if (!best || strength > best.strength) best = { id: rule.id, text: rule.text, strength };
        });
        return best;
    }

    /** No rule fired (e.g. very balanced profile) — fall back to strongest/weakest life area. */
    function fallbackTension(areaScores) {
        const entries = Object.entries(areaScores);
        let strongest = entries[0], weakest = entries[0];
        entries.forEach(e => {
            if (e[1] > strongest[1]) strongest = e;
            if (e[1] < weakest[1]) weakest = e;
        });
        const sLabel = LifeAreas.LIFE_AREAS[strongest[0]].label;
        const wLabel = LifeAreas.LIFE_AREAS[weakest[0]].label;
        return {
            id: 'fallback',
            strength: 0,
            text: `Dein stärkster Bereich ist ${sLabel}, dein leisester ${wLabel}. Dazwischen — in einem ungewöhnlich ausgewogenen Profil — spielt sich dein Alltag ab.`,
        };
    }

    function leichtText(driver) {
        const t = Content.DIM_TEXT[driver.dim];
        if (!t) return '';
        return driver.inverted ? t.low : t.high;
    }

    function schwerText(driver) {
        const t = Content.DIM_TEXT[driver.dim];
        if (!t) return '';
        return driver.inverted ? t.high : t.low;
    }

    function flavorText(areaKey, categorical) {
        const area = LifeAreas.LIFE_AREAS[areaKey];
        if (!area.flavor) return '';
        for (let i = 0; i < area.flavor.length; i++) {
            const flavorDim = area.flavor[i];
            const val = categorical[flavorDim];
            if (val && Content.CAT_TEXT[flavorDim] && Content.CAT_TEXT[flavorDim][val]) {
                return Content.CAT_TEXT[flavorDim][val];
            }
        }
        return '';
    }

    /** One card per life area: score, relative band, leicht/schwer text, optional flavor. */
    function buildAreaCards(scores, categorical, bands) {
        return Object.keys(LifeAreas.LIFE_AREAS).map(key => {
            const area = LifeAreas.LIFE_AREAS[key];
            const band = bands[key];
            const drivers = LifeAreas.driverDims(key, scores);
            return {
                key,
                label: area.label,
                accent: area.accent,
                score: band.score,
                delta: band.delta,
                band: band.band,
                leichtText: leichtText(drivers.leicht),
                schwerText: schwerText(drivers.schwer),
                flavorText: flavorText(key, categorical || {}),
            };
        });
    }

    /** 4–6 Sätze Prosa-Synthese: stärkste Dimension → Kernspannung als Kosten → schwächstes Feld. */
    function buildBrief(scores, strongestKey, weakestKey, tension) {
        const drivers = LifeAreas.driverDims(strongestKey, scores);
        const strengthSentence = leichtText(drivers.leicht);
        const tensionSentence = tension ? tension.text : '';
        const weakLabel = LifeAreas.LIFE_AREAS[weakestKey].label;
        const closing = `Genau da, in ${weakLabel}, liegt dein größtes ungenutztes Feld.`;
        return [strengthSentence, tensionSentence, closing].filter(Boolean).join(' ');
    }

    function pickExperiment(weakestKey) {
        return Content.EXPERIMENTS[weakestKey] || '';
    }

    return { TENSION_RULES, pickTension, fallbackTension, buildAreaCards, buildBrief, pickExperiment };
})();
