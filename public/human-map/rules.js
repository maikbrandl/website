/**
 * HUMAN MAP v2 – Rules
 * Second deterministic rule layer, built on top of the finished profile
 * (after InsightsV2.applyFocus). Produces four extra building blocks:
 * Paradox, Stärken, Konstellationen, Situationen.
 *
 * All human-facing text lives here as data. The renderer (result.js) only
 * assembles it. Every text is marked // ENTWURF (draft) for later review
 * (see Prompt 6 of the build plan): nothing here is final copy yet.
 *
 * No randomness, no runtime AI. Same module pattern as insights.js.
 */

const RulesV2 = (() => {

    // ── shared labels ──────────────────────────────────────────────
    const NEED_LABEL  = { autonomie: 'Autonomie', kompetenz: 'Kompetenz', verbundenheit: 'Verbundenheit' };
    const TRAIT_LABEL = {
        offenheit: 'Offenheit', gewissenhaftigkeit: 'Gewissenhaftigkeit', extraversion: 'Extraversion',
        vertraeglichkeit: 'Verträglichkeit', stabilitaet: 'Emotionale Stabilität',
    };

    // ── shared helpers (§ Prompt 2) ──────────────────────────────────
    /** Plain-language band for a 0-100 score. No raw numbers ever reach the user. */
    function band(v) {
        if (v < 30) return 'eher niedrig';
        if (v < 45) return 'mittel bis niedrig';
        if (v < 60) return 'mittel';
        if (v < 75) return 'eher hoch';
        return 'hoch';
    }

    /** Replace {placeholder} tokens. Only bands, value/need names and belief sentences may be filled in. */
    function fill(template, vars) {
        return template.replace(/\{(\w+)\}/g, (m, key) => (vars && key in vars) ? vars[key] : m);
    }

    // ── profile accessors (mirrors insights.js) ──────────────────────
    const valScore  = (p, key)    => { const v = p.values.find(x => x.key === key); return v ? v.score : 50; };
    const belAct    = (p, domain) => { const b = p.beliefs.find(x => x.domain === domain); return b ? b.activation : 0; };
    const needFrust = (p, key)    => p.needs[key].frustration;
    const needErf   = (p, key)    => p.needs[key].erfuellung;
    const trait     = (p, key)    => p.traits[key];

    // ── "why" clause builders: exactly the conditions, in plain language + band ──
    function clauseNeed(p, key, kind) {
        const v = kind === 'frust' ? needFrust(p, key) : needErf(p, key);
        return fill('{need}: {band}{suffix}', {
            need: NEED_LABEL[key], band: band(v), suffix: kind === 'frust' ? ' frustriert' : ' erfüllt',
        });
    }
    function clauseTrait(p, key) {
        return fill('{trait}: {band}', { trait: TRAIT_LABEL[key], band: band(trait(p, key)) });
    }
    function clauseValue(p, key) {
        return fill('{value}: {band}', { value: ModelV2.VALUES[key], band: band(valScore(p, key)) });
    }
    function clauseBelief(p, domain) {
        return fill('Klingt bei dir an: „{sentence}“', { sentence: ContentV2.SCHEMA_BELIEFS[domain].text });
    }

    /** Picks the n strongest active entries from a list, honouring `excludes`. */
    function pickTop(list, profile, n) {
        // A small per-extra-layer bonus so a richer (3-layer) constellation outranks
        // the two simpler 2-layer stories it subsumes, letting its `excludes` win.
        const active = list.filter(e => e.when(profile))
            .map(e => ({ e, s: e.strength(profile) + (e.layers && e.layers.length > 2 ? (e.layers.length - 2) * 8 : 0) }))
            .sort((a, b) => b.s - a.s);
        const chosen = [];
        const excluded = new Set();
        for (const { e } of active) {
            if (chosen.length >= n) break;
            if (excluded.has(e.id)) continue;
            chosen.push(e);
            (e.excludes || []).forEach(id => excluded.add(id));
        }
        return { chosen, activeCount: active.length };
    }

    // ═══════════════════════════════════════════════════════════════
    //  A) PARADOX — replaces the three-part synthesisSentence
    // ═══════════════════════════════════════════════════════════════
    const PARADOXES = [
        {
            id: 'px_macht_fremdbezogenheit',
            when: p => valScore(p, 'macht') >= 60 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (valScore(p, 'macht') + belAct(p, 'fremdbezogenheit')) / 2,
            text: 'Du willst gestalten und machst dich klein, damit niemand enttäuscht ist.', // ENTWURF
            explain: 'Beides ist in dir echt: der Wunsch, Dinge zu bewegen, und die Sorge, damit jemandem zu nahe zu treten. Keines der beiden muss verschwinden, damit das andere Platz hat.', // ENTWURF
            why: p => [clauseValue(p, 'macht'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'px_klartext_fremdbezogenheit',
            when: p => trait(p, 'vertraeglichkeit') <= 40 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => ((100 - trait(p, 'vertraeglichkeit')) + belAct(p, 'fremdbezogenheit')) / 2,
            text: 'Du sagst klar, was ist, und machst dich danach klein, damit niemand enttäuscht ist.', // ENTWURF
            explain: 'Die Klarheit kommt leicht, die Reue danach genauso. Beides gehört offenbar zu dir, auch wenn es sich widersprüchlich anfühlt.', // ENTWURF
            why: p => [clauseTrait(p, 'vertraeglichkeit'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'px_selbstbestimmung_konformitaet',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && valScore(p, 'konformitaet') >= 55,
            strength: p => (valScore(p, 'selbstbestimmung') + valScore(p, 'konformitaet')) / 2,
            text: 'Du willst deinen eigenen Weg gehen und gleichzeitig dazugehören, ohne anzuecken.', // ENTWURF
            explain: 'Freiheit und Zugehörigkeit ziehen bei dir in unterschiedliche Richtungen. Das macht Entscheidungen nicht einfacher, aber beide Seiten sind berechtigt.', // ENTWURF
            why: p => [clauseValue(p, 'selbstbestimmung'), clauseValue(p, 'konformitaet')],
        },
        {
            id: 'px_purpose_kohaerenz',
            when: p => p.meaning.purpose >= 65 && p.meaning.kohaerenz <= 40,
            strength: p => (p.meaning.purpose + (100 - p.meaning.kohaerenz)) / 2,
            text: 'Du hast eine Richtung vor Augen, und die einzelnen Teile deines Lebens ergeben für dich noch keinen roten Faden.', // ENTWURF
            explain: 'Ein Ziel zu spüren, ohne dass sich der Weg dorthin schon stimmig anfühlt, ist kein Widerspruch, der sich sofort auflösen muss. Oft klärt sich der Faden erst im Gehen.', // ENTWURF
            why: p => [fill('Purpose: {band}', { band: band(p.meaning.purpose) }), fill('Kohärenz: {band}', { band: band(p.meaning.kohaerenz) })],
        },
        {
            id: 'px_extraversion_verbundenheit',
            when: p => trait(p, 'extraversion') <= 40 && needFrust(p, 'verbundenheit') >= 55,
            strength: p => ((100 - trait(p, 'extraversion')) + needFrust(p, 'verbundenheit')) / 2,
            text: 'Du sehnst dich nach Nähe und lädst dich gleichzeitig am liebsten allein wieder auf.', // ENTWURF
            explain: 'Beides kann gleichzeitig stimmen: das Bedürfnis nach echter Verbindung und das Bedürfnis nach Ruhe und Rückzug. Die Kunst liegt eher im Dosieren als im Entweder-oder.', // ENTWURF
            why: p => [clauseTrait(p, 'extraversion'), clauseNeed(p, 'verbundenheit', 'frust')],
        },
        {
            id: 'px_leistung_wachsamkeit',
            when: p => valScore(p, 'leistung') >= 60 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => (valScore(p, 'leistung') + belAct(p, 'wachsamkeit')) / 2,
            text: 'Du willst etwas leisten, und ein strenger innerer Maßstab lässt kaum einen Erfolg wirklich zählen.', // ENTWURF
            explain: 'Der Antrieb zu leisten ist echt, genau wie der Maßstab, der nie ganz erreicht scheint. Das eine erklärt oft, warum sich das andere so hartnäckig hält.', // ENTWURF
            why: p => [clauseValue(p, 'leistung'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'px_stimulation_sicherheit',
            when: p => valScore(p, 'stimulation') >= 60 && valScore(p, 'sicherheit') >= 60,
            strength: p => (valScore(p, 'stimulation') + valScore(p, 'sicherheit')) / 2,
            text: 'Du suchst Abwechslung und hältst gleichzeitig an Sicherheit fest, zwei Dinge, die sich oft im Weg stehen.', // ENTWURF
            explain: 'Beides sind anerkannte Werte, die selten gleichzeitig maximal bedient werden können. Dass du zwischen ihnen pendelst, ist naheliegend und keine Unentschlossenheit.', // ENTWURF
            why: p => [clauseValue(p, 'stimulation'), clauseValue(p, 'sicherheit')],
        },
        {
            id: 'px_selbstbestimmung_autonomiebelief',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && belAct(p, 'autonomie') >= 50,
            strength: p => (valScore(p, 'selbstbestimmung') + belAct(p, 'autonomie')) / 2,
            text: 'Du willst frei entscheiden und traust dir insgeheim zu wenig zu, um es wirklich durchzuziehen.', // ENTWURF
            explain: 'Der Wunsch nach Freiheit ist groß, und ein alter Zweifel bremst ihn immer wieder aus. Beides zusammen zu sehen ist der erste Schritt, nicht das Problem.', // ENTWURF
            why: p => [clauseValue(p, 'selbstbestimmung'), clauseBelief(p, 'autonomie')],
        },
        {
            id: 'px_benevolenz_autonomiefrust',
            when: p => valScore(p, 'benevolenz') >= 60 && needFrust(p, 'autonomie') >= 55,
            strength: p => (valScore(p, 'benevolenz') + needFrust(p, 'autonomie')) / 2,
            text: 'Du bist gern für andere da und merkst dabei kaum noch, wofür du eigentlich selbst stehst.', // ENTWURF
            explain: 'Fürsorge für andere und ein eigener klarer Kurs schließen sich nicht aus, auch wenn es sich im Moment manchmal so anfühlt.', // ENTWURF
            why: p => [clauseValue(p, 'benevolenz'), clauseNeed(p, 'autonomie', 'frust')],
        },
        {
            id: 'px_leistung_kompetenzfrust',
            when: p => valScore(p, 'leistung') >= 60 && needFrust(p, 'kompetenz') >= 55,
            strength: p => (valScore(p, 'leistung') + needFrust(p, 'kompetenz')) / 2,
            text: 'Leistung ist dir wichtig, und zugleich zweifelst du oft, ob du wirklich genug kannst.', // ENTWURF
            explain: 'Anspruch und Selbstzweifel wachsen bei vielen Menschen gemeinsam, gerade weil beide am selben Thema hängen. Das eine erklärt das andere, statt es zu widerlegen.', // ENTWURF
            why: p => [clauseValue(p, 'leistung'), clauseNeed(p, 'kompetenz', 'frust')],
        },
        {
            id: 'px_universalismus_macht',
            when: p => valScore(p, 'universalismus') >= 55 && valScore(p, 'macht') >= 55,
            strength: p => (valScore(p, 'universalismus') + valScore(p, 'macht')) / 2,
            text: 'Dir ist Gerechtigkeit wichtig, und du willst gleichzeitig Einfluss und Gestaltung, zwei Ansprüche, die sich reiben können.', // ENTWURF
            explain: 'Wer gestalten will, braucht Einfluss, und wer gerecht sein will, hinterfragt genau diesen Einfluss immer wieder selbst. Diese Spannung ist eher ein Kompass als ein Fehler.', // ENTWURF
            why: p => [clauseValue(p, 'universalismus'), clauseValue(p, 'macht')],
        },
        {
            id: 'px_hedonismus_wachsamkeit',
            when: p => valScore(p, 'hedonismus') >= 55 && belAct(p, 'wachsamkeit') >= 55,
            strength: p => (valScore(p, 'hedonismus') + belAct(p, 'wachsamkeit')) / 2,
            text: 'Du möchtest das Leben genießen, und ein strenger innerer Maßstab lässt Leichtigkeit kaum zu.', // ENTWURF
            explain: 'Genuss und Leistungsanspruch wirken wie Gegensätze, sind aber oft zwei Seiten derselben Münze: beide wollen, dass sich dein Leben richtig anfühlt.', // ENTWURF
            why: p => [clauseValue(p, 'hedonismus'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'px_tradition_stimulation',
            when: p => valScore(p, 'tradition') >= 55 && valScore(p, 'stimulation') >= 55,
            strength: p => (valScore(p, 'tradition') + valScore(p, 'stimulation')) / 2,
            text: 'Ein Teil von dir hält an Bewährtem fest, ein anderer sucht ständig nach Neuem.', // ENTWURF
            explain: 'Beide Seiten haben ihren Wert: das Vertraute gibt Halt, das Neue bringt Bewegung. Du musst dich nicht endgültig für eine Seite entscheiden.', // ENTWURF
            why: p => [clauseValue(p, 'tradition'), clauseValue(p, 'stimulation')],
        },
        {
            id: 'px_gewissenhaftigkeit_stimulation',
            when: p => trait(p, 'gewissenhaftigkeit') >= 65 && valScore(p, 'stimulation') >= 60,
            strength: p => (trait(p, 'gewissenhaftigkeit') + valScore(p, 'stimulation')) / 2,
            text: 'Du planst und ordnest gern, und gleichzeitig zieht es dich zu Abwechslung, die sich nicht planen lässt.', // ENTWURF
            explain: 'Struktur und Spontaneität schließen sich nicht grundsätzlich aus, sie brauchen nur unterschiedliche Räume in deinem Alltag.', // ENTWURF
            why: p => [clauseTrait(p, 'gewissenhaftigkeit'), clauseValue(p, 'stimulation')],
        },
        {
            id: 'px_vertraeglichkeit_selbstbestimmung',
            when: p => trait(p, 'vertraeglichkeit') >= 65 && valScore(p, 'selbstbestimmung') >= 60,
            strength: p => (trait(p, 'vertraeglichkeit') + valScore(p, 'selbstbestimmung')) / 2,
            text: 'Du suchst Harmonie mit anderen und willst gleichzeitig konsequent deinen eigenen Weg gehen.', // ENTWURF
            explain: 'Rücksicht und ein eigener klarer Kurs stehen sich nur dann im Weg, wenn du glaubst, immer nur eines von beiden haben zu können.', // ENTWURF
            why: p => [clauseTrait(p, 'vertraeglichkeit'), clauseValue(p, 'selbstbestimmung')],
        },
        {
            id: 'px_stabilitaet_wachsamkeit',
            when: p => trait(p, 'stabilitaet') <= 40 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => ((100 - trait(p, 'stabilitaet')) + belAct(p, 'wachsamkeit')) / 2,
            text: 'Du hältst nach außen die Fassung, während es innerlich in Aufruhr ist.', // ENTWURF
            explain: 'Die Fassade zu halten kostet Kraft, gerade weil innerlich so viel los ist. Dass beides nebeneinander existiert, macht dich nicht widersprüchlich, sondern menschlich.', // ENTWURF
            why: p => [clauseTrait(p, 'stabilitaet'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'px_offenheit_sicherheit',
            when: p => trait(p, 'offenheit') >= 65 && valScore(p, 'sicherheit') >= 60,
            strength: p => (trait(p, 'offenheit') + valScore(p, 'sicherheit')) / 2,
            text: 'Du bist neugierig auf Neues und hältst gleichzeitig an Sicherheit fest, die das Neue oft ausbremst.', // ENTWURF
            explain: 'Neugier will erkunden, Sicherheit will bewahren. Beides in dir zu haben, bedeutet meist nur, dass du dir deine Schritte bewusster aussuchst als andere.', // ENTWURF
            why: p => [clauseTrait(p, 'offenheit'), clauseValue(p, 'sicherheit')],
        },
        {
            id: 'px_benevolenz_fremdbezogenheit',
            when: p => valScore(p, 'benevolenz') >= 60 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (valScore(p, 'benevolenz') + belAct(p, 'fremdbezogenheit')) / 2,
            text: 'Du sorgst gern für andere, und ein alter Satz sagt dir, du seist nur durch Geben wertvoll.', // ENTWURF
            explain: 'Fürsorge aus freien Stücken und Fürsorge aus Pflichtgefühl fühlen sich von außen ähnlich an und sind innerlich sehr verschieden. Beide Spuren liegen bei dir übereinander.', // ENTWURF
            why: p => [clauseValue(p, 'benevolenz'), clauseBelief(p, 'fremdbezogenheit')],
        },
    ];

    function fallbackParadoxText(profile) {
        const traits = (typeof InsightsV2 !== 'undefined') ? InsightsV2.definingTraits(profile.traits) : [];
        const d1 = traits[0];
        const traitClause = d1 ? (d1.score >= 50 ? ContentV2.TRAIT_TEXT[d1.key].high : ContentV2.TRAIT_TEXT[d1.key].low) : 'gerade in Bewegung'; // ENTWURF
        const belief = profile.focusBelief;
        const topValue = profile.values[0];
        const second = belief
            ? `, und bei dir klingt an: „${belief.text}“`
            : (topValue ? `, dir liegt vor allem daran, ${ContentV2.VALUE_TEXT[topValue.key]}` : ''); // ENTWURF
        return `Du bist ${traitClause}${second}.`; // ENTWURF
    }

    function buildParadox(profile) {
        const active = PARADOXES.filter(x => x.when(profile)).sort((a, b) => b.strength(profile) - a.strength(profile));
        if (active.length) {
            const top = active[0];
            return { id: top.id, text: top.text, explain: top.explain, why: top.why(profile), fallback: false };
        }
        return { id: 'px_fallback', text: fallbackParadoxText(profile), explain: '', why: [], fallback: true };
    }

    // ═══════════════════════════════════════════════════════════════
    //  B) STRENGTHS — always exactly three, strongest first
    // ═══════════════════════════════════════════════════════════════
    const STRENGTHS = [
        {
            id: 'st_purpose', when: p => p.meaning.purpose >= 60, strength: p => p.meaning.purpose,
            title: 'Klarer Kompass', // ENTWURF
            text: 'Du spürst eine Richtung, für die sich dein Einsatz lohnt.', // ENTWURF
            use: 'Genau das hilft dir, wenn Antrieb ohne Ziel droht: Du findest leichter zurück zu einem Kurs.', // ENTWURF
        },
        {
            id: 'st_kohaerenz', when: p => p.meaning.kohaerenz >= 60, strength: p => p.meaning.kohaerenz,
            title: 'Roter Faden', // ENTWURF
            text: 'Die einzelnen Teile deines Lebens fügen sich für dich zu einem stimmigen Ganzen.', // ENTWURF
            use: 'Das gibt dir Halt, wenn gerade an anderer Stelle etwas aus dem Gleichgewicht gerät.', // ENTWURF
        },
        {
            id: 'st_bedeutsamkeit', when: p => p.meaning.bedeutsamkeit >= 60, strength: p => p.meaning.bedeutsamkeit,
            title: 'Spürbare Wirkung', // ENTWURF
            text: 'Du erlebst, dass dein Tun für andere einen Unterschied macht.', // ENTWURF
            use: 'Das trägt dich besonders, wenn du dich an anderer Stelle schnell unwichtig fühlst.', // ENTWURF
        },
        {
            id: 'st_stabilitaet', when: p => trait(p, 'stabilitaet') >= 60, strength: p => trait(p, 'stabilitaet'),
            title: 'Innere Ruhe', // ENTWURF
            text: 'Du bleibst auch unter Druck überwiegend gelassen.', // ENTWURF
            use: 'Diese Ruhe hilft dir, in Reibungsmomenten nicht sofort in Hektik zu verfallen.', // ENTWURF
        },
        {
            id: 'st_autonomie_erf', when: p => needErf(p, 'autonomie') >= 60, strength: p => needErf(p, 'autonomie'),
            title: 'Eigener Kurs', // ENTWURF
            text: 'Du erlebst, dass du weitgehend selbst entscheidest, wie du lebst.', // ENTWURF
            use: 'Das ist ein Anker, wenn sich an anderer Stelle etwas fremdbestimmt anfühlt.', // ENTWURF
        },
        {
            id: 'st_kompetenz_erf', when: p => needErf(p, 'kompetenz') >= 60, strength: p => needErf(p, 'kompetenz'),
            title: 'Erprobte Fähigkeit', // ENTWURF
            text: 'Du erlebst dich häufig als fähig und wirksam.', // ENTWURF
            use: 'Darauf kannst du zurückgreifen, wenn Zweifel an anderer Stelle lauter werden als sonst.', // ENTWURF
        },
        {
            id: 'st_verbundenheit_erf', when: p => needErf(p, 'verbundenheit') >= 60, strength: p => needErf(p, 'verbundenheit'),
            title: 'Tragende Nähe', // ENTWURF
            text: 'Du fühlst dich Menschen in deinem Leben nah und von ihnen getragen.', // ENTWURF
            use: 'Diese Nähe ist eine Ressource, genau dann, wenn du dich an anderer Stelle zurückziehen willst.', // ENTWURF
        },
        {
            id: 'st_selbstbestimmung', when: p => valScore(p, 'selbstbestimmung') >= 65, strength: p => valScore(p, 'selbstbestimmung'),
            title: 'Klarer eigener Wille', // ENTWURF
            text: 'Du weißt vergleichsweise genau, was du willst und was nicht.', // ENTWURF
            use: 'Das hilft dir, eigene Entscheidungen zu treffen, statt dich nur anzupassen.', // ENTWURF
        },
        {
            id: 'st_benevolenz', when: p => valScore(p, 'benevolenz') >= 65, strength: p => valScore(p, 'benevolenz'),
            title: 'Verlässliche Fürsorge', // ENTWURF
            text: 'Du bist für Menschen, die dir wichtig sind, wirklich da.', // ENTWURF
            use: 'Diese Verlässlichkeit darfst du auch dir selbst einmal zeigen.', // ENTWURF
        },
        {
            id: 'st_universalismus', when: p => valScore(p, 'universalismus') >= 65, strength: p => valScore(p, 'universalismus'),
            title: 'Sinn für Fairness', // ENTWURF
            text: 'Du hast einen feinen Sinn dafür, was gerecht ist und was nicht.', // ENTWURF
            use: 'Das gibt dir einen klaren Maßstab, wenn dir eine Entscheidung schwerfällt.', // ENTWURF
        },
        {
            id: 'st_leistung', when: p => valScore(p, 'leistung') >= 65, strength: p => valScore(p, 'leistung'),
            title: 'Durchhaltevermögen', // ENTWURF
            text: 'Du bleibst dran, auch wenn eine Sache anstrengend wird.', // ENTWURF
            use: 'Dieses Durchhalten trägt dich auch durch ein unbequemes kleines Übungsexperiment.', // ENTWURF
        },
        {
            id: 'st_vertraeglichkeit_niedrig', when: p => trait(p, 'vertraeglichkeit') <= 35, strength: p => 100 - trait(p, 'vertraeglichkeit'),
            title: 'Klartext', // ENTWURF
            text: 'Du sagst eher, was ist, statt es zu beschönigen.', // ENTWURF
            use: 'Diese Klarheit kannst du auch dir selbst gegenüber einsetzen, etwa im nächsten kleinen Experiment.', // ENTWURF
        },
        {
            id: 'st_gewissenhaftigkeit_niedrig', when: p => trait(p, 'gewissenhaftigkeit') <= 35, strength: p => 100 - trait(p, 'gewissenhaftigkeit'),
            title: 'Beweglichkeit', // ENTWURF
            text: 'Du hältst dich nicht starr an Pläne und kannst dich schnell neu ausrichten.', // ENTWURF
            use: 'Diese Beweglichkeit hilft dir, ein kleines Experiment einfach auszuprobieren, statt es zu perfektionieren.', // ENTWURF
        },
        {
            id: 'st_extraversion_niedrig', when: p => trait(p, 'extraversion') <= 35, strength: p => 100 - trait(p, 'extraversion'),
            title: 'Tiefe im Kleinen', // ENTWURF
            text: 'Du lädst dich in Ruhe auf und gehst Dingen eher in die Tiefe statt in die Breite.', // ENTWURF
            use: 'Das ist ein guter Ort, um in Ruhe an einer Sache dranzubleiben, statt dich zu verzetteln.', // ENTWURF
        },
        {
            id: 'st_offenheit', when: p => trait(p, 'offenheit') >= 65, strength: p => trait(p, 'offenheit'),
            title: 'Weiter Blick', // ENTWURF
            text: 'Du bist offen für neue Ideen und Blickwinkel.', // ENTWURF
            use: 'Das hilft dir, einen alten Satz über dich auch mal testweise infrage zu stellen.', // ENTWURF
        },
        // Fallback entries, always available but low-ranked, so there are always three.
        {
            id: 'st_fallback_reflexion', when: () => true, strength: () => 3,
            title: 'Bereitschaft hinzusehen', // ENTWURF
            text: 'Du nimmst dir gerade die Zeit, genauer auf dich zu schauen.', // ENTWURF
            use: 'Genau diese Bereitschaft ist der erste Schritt zu jeder Veränderung.', // ENTWURF
        },
        {
            id: 'st_fallback_schritt', when: () => true, strength: () => 2,
            title: 'Schon unterwegs', // ENTWURF
            text: 'Du hast diesen Fragebogen bis hierhin ausgefüllt, das ist schon ein Schritt.', // ENTWURF
            use: 'Nutze diesen Schwung für das kleine Experiment, das als Nächstes kommt.', // ENTWURF
        },
        {
            id: 'st_fallback_vielfalt', when: () => true, strength: () => 1,
            title: 'Vielfalt in dir', // ENTWURF
            text: 'Du bist mehr als eine einzelne Eigenschaft oder ein einzelner Satz über dich.', // ENTWURF
            use: 'Das gibt dir mehr als einen Hebel, um etwas zu verändern.', // ENTWURF
        },
    ];

    function buildStrengths(profile) {
        const { chosen } = pickTop(STRENGTHS, profile, 3);
        return chosen.map(s => ({ id: s.id, title: s.title, text: s.text, use: s.use }));
    }

    // ═══════════════════════════════════════════════════════════════
    //  C) CONSTELLATIONS — patterns, not problems. Three strongest shown.
    // ═══════════════════════════════════════════════════════════════
    const CONSTELLATIONS = [
        // ── Bedürfnisse × Prägung (15) ──
        {
            id: 'ko_autonomie_abgetrenntheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => (needFrust(p, 'autonomie') + belAct(p, 'abgetrenntheit')) / 2,
            title: 'Freiheit, die niemand teilt', // ENTWURF
            text: 'Du willst selbst entscheiden, wie du lebst, und gleichzeitig hältst du dich innerlich eher zurück, aus Sorge, dich zu zeigen.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseBelief(p, 'abgetrenntheit')],
        },
        {
            id: 'ko_autonomie_autonomiebelief', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && belAct(p, 'autonomie') >= 50,
            strength: p => (needFrust(p, 'autonomie') + belAct(p, 'autonomie')) / 2,
            title: 'Selbstbestimmt sein wollen, sich nicht zutrauen', // ENTWURF
            text: 'Du willst dein Leben selbst in der Hand haben, und ein alter Satz sagt dir gleichzeitig, dass du allein nicht genügst.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseBelief(p, 'autonomie')],
        },
        {
            id: 'ko_autonomie_grenzen', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && belAct(p, 'grenzen') >= 50,
            strength: p => (needFrust(p, 'autonomie') + belAct(p, 'grenzen')) / 2,
            title: 'Freiheit wollen, Unbequemem ausweichen', // ENTWURF
            text: 'Du willst dein Leben selbst gestalten, und ein Reflex lässt dich gleichzeitig vor dem Unbequemen ausweichen, das dazugehört.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseBelief(p, 'grenzen')],
        },
        {
            id: 'ko_autonomie_fremdbezogenheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (needFrust(p, 'autonomie') + belAct(p, 'fremdbezogenheit')) / 2,
            title: 'Freiheit wollen, es allen recht machen', // ENTWURF
            text: 'Du willst frei entscheiden, und gleichzeitig hast du gelernt, dich nach den Erwartungen anderer zu richten.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseBelief(p, 'fremdbezogenheit')],
            excludes: ['ko_autonomie_gewissenhaftigkeit_fremdbezogenheit'],
        },
        {
            id: 'ko_autonomie_wachsamkeit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => (needFrust(p, 'autonomie') + belAct(p, 'wachsamkeit')) / 2,
            title: 'Freiheit wollen, sich keine Pause gönnen', // ENTWURF
            text: 'Du willst selbstbestimmt leben, und ein strenger innerer Maßstab lässt dir dabei kaum eine ruhige Minute.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'ko_kompetenz_abgetrenntheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + belAct(p, 'abgetrenntheit')) / 2,
            title: 'Fähig sein wollen, allein damit sein', // ENTWURF
            text: 'Du willst dich fähig und wirksam fühlen, und gleichzeitig trägst du Zweifel eher allein, statt sie zu teilen.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseBelief(p, 'abgetrenntheit')],
        },
        {
            id: 'ko_kompetenz_autonomiebelief', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'autonomie') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + belAct(p, 'autonomie')) / 2,
            title: 'Können wollen, sich aber nichts zutrauen', // ENTWURF
            text: 'Du willst etwas wirklich können, und ein alter Satz sagt dir, dass du allein nicht genügst, lange bevor du es überhaupt versucht hast.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseBelief(p, 'autonomie')],
            excludes: ['ko_kompetenz_stabilitaet_autonomiebelief'],
        },
        {
            id: 'ko_kompetenz_grenzen', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'grenzen') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + belAct(p, 'grenzen')) / 2,
            title: 'Können wollen, aber nicht drankleiben', // ENTWURF
            text: 'Du willst dich fähig fühlen, und ein Reflex lässt dich bei Frust eher aufhören, kurz bevor sich das Können zeigen würde.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseBelief(p, 'grenzen')],
        },
        {
            id: 'ko_kompetenz_fremdbezogenheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + belAct(p, 'fremdbezogenheit')) / 2,
            title: 'Können wollen, sich für andere zurückstellen', // ENTWURF
            text: 'Du willst dich wirksam fühlen, und gleichzeitig stellst du die eigene Sache oft hinter die Bedürfnisse anderer zurück.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'ko_kompetenz_wachsamkeit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + belAct(p, 'wachsamkeit')) / 2,
            title: 'Können wollen, nie genug sein dürfen', // ENTWURF
            text: 'Du willst dich als fähig erleben, und ein strenger Maßstab lässt kaum einen Erfolg wirklich zählen.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'ko_verbundenheit_abgetrenntheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + belAct(p, 'abgetrenntheit')) / 2,
            title: 'Nähe suchen, Distanz halten', // ENTWURF
            text: 'Du sehnst dich nach echter Nähe, und ein alter Satz warnt dich gleichzeitig davor, dich wirklich zu zeigen.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseBelief(p, 'abgetrenntheit')],
            excludes: ['ko_verbundenheit_extraversion_abgetrenntheit'],
        },
        {
            id: 'ko_verbundenheit_autonomiebelief', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'autonomie') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + belAct(p, 'autonomie')) / 2,
            title: 'Nähe suchen, sich zu wenig zutrauen', // ENTWURF
            text: 'Du sehnst dich nach Verbindung, und gleichzeitig zweifelst du, ob du genug zu bieten hast, um sie zu halten.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseBelief(p, 'autonomie')],
        },
        {
            id: 'ko_verbundenheit_grenzen', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'grenzen') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + belAct(p, 'grenzen')) / 2,
            title: 'Nähe suchen, Reibung meiden', // ENTWURF
            text: 'Du sehnst dich nach Nähe, und ein Reflex lässt dich unangenehme Gespräche eher meiden, die echte Nähe oft erst möglich machen.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseBelief(p, 'grenzen')],
        },
        {
            id: 'ko_verbundenheit_fremdbezogenheit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + belAct(p, 'fremdbezogenheit')) / 2,
            title: 'Nähe über Nützlichkeit suchen', // ENTWURF
            text: 'Du sehnst dich nach Nähe, und du hast gelernt, dir Zuwendung eher durch Geben und Funktionieren zu verdienen.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'ko_verbundenheit_wachsamkeit', layers: ['Bedürfnisse', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + belAct(p, 'wachsamkeit')) / 2,
            title: 'Nähe suchen, keine Schwäche zeigen', // ENTWURF
            text: 'Du sehnst dich nach echter Nähe, und ein strenger Maßstab lässt dich dabei kaum eine Schwäche zeigen, aus der Nähe oft erst entsteht.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseBelief(p, 'wachsamkeit')],
        },

        // ── Bedürfnisse × Terrain (10) ──
        {
            id: 'ko_autonomie_gewissenhaftigkeit', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'autonomie') >= 55 && trait(p, 'gewissenhaftigkeit') >= 65,
            strength: p => (needFrust(p, 'autonomie') + trait(p, 'gewissenhaftigkeit')) / 2,
            title: 'Fremdbestimmt, aber diszipliniert', // ENTWURF
            text: 'Du fühlst dich oft fremdbestimmt, und gleichzeitig hältst du Regeln und Pläne sehr zuverlässig ein, auch wenn sie nicht von dir stammen.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseTrait(p, 'gewissenhaftigkeit')],
        },
        {
            id: 'ko_autonomie_stabilitaet', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'autonomie') >= 55 && trait(p, 'stabilitaet') <= 40,
            strength: p => (needFrust(p, 'autonomie') + (100 - trait(p, 'stabilitaet'))) / 2,
            title: 'Fremdbestimmt und angespannt', // ENTWURF
            text: 'Du erlebst dich oft als fremdbestimmt, und das macht dich schneller gereizt oder unruhig, als es dir lieb ist.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseTrait(p, 'stabilitaet')],
        },
        {
            id: 'ko_autonomie_vertraeglichkeit', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'autonomie') >= 55 && trait(p, 'vertraeglichkeit') >= 65,
            strength: p => (needFrust(p, 'autonomie') + trait(p, 'vertraeglichkeit')) / 2,
            title: 'Fremdbestimmt durch Anpassung', // ENTWURF
            text: 'Du fügst dich leicht in das, was andere wollen, und genau das lässt dich immer wieder fremdbestimmt fühlen.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseTrait(p, 'vertraeglichkeit')],
        },
        {
            id: 'ko_kompetenz_offenheit', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'kompetenz') >= 55 && trait(p, 'offenheit') >= 65,
            strength: p => (needFrust(p, 'kompetenz') + trait(p, 'offenheit')) / 2,
            title: 'Zweifeln trotz Neugier', // ENTWURF
            text: 'Du probierst gern Neues aus, und trotzdem bleibt oft der Zweifel, ob du es wirklich gut genug kannst.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseTrait(p, 'offenheit')],
        },
        {
            id: 'ko_kompetenz_stabilitaet', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'kompetenz') >= 55 && trait(p, 'stabilitaet') <= 40,
            strength: p => (needFrust(p, 'kompetenz') + (100 - trait(p, 'stabilitaet'))) / 2,
            title: 'Zweifeln unter Anspannung', // ENTWURF
            text: 'Zweifel an deinem Können werden lauter, sobald du ohnehin schon angespannt bist.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseTrait(p, 'stabilitaet')],
            excludes: ['ko_kompetenz_stabilitaet_autonomiebelief'],
        },
        {
            id: 'ko_kompetenz_extraversion', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'kompetenz') >= 55 && trait(p, 'extraversion') <= 35,
            strength: p => (needFrust(p, 'kompetenz') + (100 - trait(p, 'extraversion'))) / 2,
            title: 'Zweifeln mit sich allein', // ENTWURF
            text: 'Zweifel an deinem Können trägst du eher mit dir allein aus, statt sie laut auszusprechen.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseTrait(p, 'extraversion')],
        },
        {
            id: 'ko_kompetenz_gewissenhaftigkeit', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'kompetenz') >= 55 && trait(p, 'gewissenhaftigkeit') >= 65,
            strength: p => (needFrust(p, 'kompetenz') + trait(p, 'gewissenhaftigkeit')) / 2,
            title: 'Viel leisten, trotzdem zweifeln', // ENTWURF
            text: 'Du arbeitest diszipliniert und gründlich, und trotzdem bleibt oft das Gefühl, es wäre noch nicht genug.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseTrait(p, 'gewissenhaftigkeit')],
        },
        {
            id: 'ko_verbundenheit_vertraeglichkeit_hoch', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && trait(p, 'vertraeglichkeit') >= 65,
            strength: p => (needFrust(p, 'verbundenheit') + trait(p, 'vertraeglichkeit')) / 2,
            title: 'Nähe suchen durch Anpassung', // ENTWURF
            text: 'Du sehnst dich nach echter Nähe, und du passt dich dafür oft so an, dass von dir selbst wenig sichtbar bleibt.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseTrait(p, 'vertraeglichkeit')],
        },
        {
            id: 'ko_verbundenheit_vertraeglichkeit_niedrig', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && trait(p, 'vertraeglichkeit') <= 35,
            strength: p => (needFrust(p, 'verbundenheit') + (100 - trait(p, 'vertraeglichkeit'))) / 2,
            title: 'Nähe suchen trotz Klartext', // ENTWURF
            text: 'Du sehnst dich nach Nähe, und deine direkte Art hält manche Menschen auf eine Distanz, die du eigentlich nicht willst.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseTrait(p, 'vertraeglichkeit')],
        },
        {
            id: 'ko_autonomie_extraversion', layers: ['Bedürfnisse', 'Terrain'],
            when: p => needFrust(p, 'autonomie') >= 55 && trait(p, 'extraversion') >= 65,
            strength: p => (needFrust(p, 'autonomie') + trait(p, 'extraversion')) / 2,
            title: 'Fremdbestimmt trotz Energie', // ENTWURF
            text: 'Du gehst energiegeladen auf andere zu, und trotzdem fühlst du dich in dem, was du tust, oft von außen gesteuert.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseTrait(p, 'extraversion')],
        },

        // ── Terrain × Prägung (8) ──
        {
            id: 'ko_stabilitaet_wachsamkeit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'stabilitaet') <= 40 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => ((100 - trait(p, 'stabilitaet')) + belAct(p, 'wachsamkeit')) / 2,
            title: 'Nach außen stark, innerlich Aufruhr', // ENTWURF
            text: 'Du hältst nach außen die Fassung, während es innerlich in Aufruhr ist, weil Schwäche sich nicht erlaubt anfühlt.', // ENTWURF
            why: p => [clauseTrait(p, 'stabilitaet'), clauseBelief(p, 'wachsamkeit')],
            excludes: ['ko_kompetenz_stabilitaet_autonomiebelief'],
        },
        {
            id: 'ko_gewissenhaftigkeit_wachsamkeit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'gewissenhaftigkeit') >= 65 && belAct(p, 'wachsamkeit') >= 50,
            strength: p => (trait(p, 'gewissenhaftigkeit') + belAct(p, 'wachsamkeit')) / 2,
            title: 'Diszipliniert und nie fertig', // ENTWURF
            text: 'Du arbeitest diszipliniert und gründlich, und ein strenger Maßstab lässt kaum einen Punkt wirklich als erledigt gelten.', // ENTWURF
            why: p => [clauseTrait(p, 'gewissenhaftigkeit'), clauseBelief(p, 'wachsamkeit')],
        },
        {
            id: 'ko_extraversion_abgetrenntheit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'extraversion') <= 40 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => ((100 - trait(p, 'extraversion')) + belAct(p, 'abgetrenntheit')) / 2,
            title: 'Ruhig nach außen, auf Abstand', // ENTWURF
            text: 'Du lädst dich am liebsten allein auf, und ein alter Satz verstärkt diesen Abstand zusätzlich, auch wenn Nähe angeboten wird.', // ENTWURF
            why: p => [clauseTrait(p, 'extraversion'), clauseBelief(p, 'abgetrenntheit')],
            excludes: ['ko_verbundenheit_extraversion_abgetrenntheit'],
        },
        {
            id: 'ko_offenheit_grenzen', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'offenheit') >= 65 && belAct(p, 'grenzen') >= 50,
            strength: p => (trait(p, 'offenheit') + belAct(p, 'grenzen')) / 2,
            title: 'Neugierig, aber ausweichend', // ENTWURF
            text: 'Du bist offen für neue Ideen, und ein Reflex lässt dich gleichzeitig vor dem Unbequemen ausweichen, das viele davon erst möglich macht.', // ENTWURF
            why: p => [clauseTrait(p, 'offenheit'), clauseBelief(p, 'grenzen')],
        },
        {
            id: 'ko_gewissenhaftigkeit_grenzen', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'gewissenhaftigkeit') <= 35 && belAct(p, 'grenzen') >= 50,
            strength: p => ((100 - trait(p, 'gewissenhaftigkeit')) + belAct(p, 'grenzen')) / 2,
            title: 'Spontan und ausweichend', // ENTWURF
            text: 'Du entscheidest gern spontan, und ein Reflex lässt dich zugleich das Unbequeme eher meiden, bevor es überhaupt zum Thema wird.', // ENTWURF
            why: p => [clauseTrait(p, 'gewissenhaftigkeit'), clauseBelief(p, 'grenzen')],
        },
        {
            id: 'ko_vertraeglichkeit_hoch_fremdbezogenheit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'vertraeglichkeit') >= 65 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (trait(p, 'vertraeglichkeit') + belAct(p, 'fremdbezogenheit')) / 2,
            title: 'Harmonie über alles', // ENTWURF
            text: 'Du suchst von Natur aus Harmonie, und ein alter Satz verstärkt das zusätzlich: Wert hast du vor allem, wenn du gibst.', // ENTWURF
            why: p => [clauseTrait(p, 'vertraeglichkeit'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'ko_vertraeglichkeit_niedrig_fremdbezogenheit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'vertraeglichkeit') <= 40 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => ((100 - trait(p, 'vertraeglichkeit')) + belAct(p, 'fremdbezogenheit')) / 2,
            title: 'Klar nach außen, klein danach', // ENTWURF
            text: 'Du sagst klar, was ist, und machst dich danach oft wieder klein, aus Sorge, jemanden enttäuscht zu haben.', // ENTWURF
            why: p => [clauseTrait(p, 'vertraeglichkeit'), clauseBelief(p, 'fremdbezogenheit')],
        },
        {
            id: 'ko_offenheit_abgetrenntheit', layers: ['Terrain', 'Prägung'],
            when: p => trait(p, 'offenheit') >= 65 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => (trait(p, 'offenheit') + belAct(p, 'abgetrenntheit')) / 2,
            title: 'Neugier nach außen, Distanz nach innen', // ENTWURF
            text: 'Du bist offen für neue Ideen und Perspektiven, und bei echter Nähe hältst du gleichzeitig lieber einen Schritt Abstand.', // ENTWURF
            why: p => [clauseTrait(p, 'offenheit'), clauseBelief(p, 'abgetrenntheit')],
        },

        // ── Dreifach: Bedürfnisse × Terrain × Prägung (3) ──
        {
            id: 'ko_verbundenheit_extraversion_abgetrenntheit', layers: ['Bedürfnisse', 'Terrain', 'Prägung'],
            when: p => needFrust(p, 'verbundenheit') >= 55 && trait(p, 'extraversion') <= 40 && belAct(p, 'abgetrenntheit') >= 50,
            strength: p => (needFrust(p, 'verbundenheit') + (100 - trait(p, 'extraversion')) + belAct(p, 'abgetrenntheit')) / 3,
            title: 'Sehnsucht auf Abstand gehalten', // ENTWURF
            text: 'Verbundenheit ist dein am stärksten frustriertes Bedürfnis. Gleichzeitig lädst du dich eher allein auf, und bei dir klingt der Satz an, dass Zeigen zu Ablehnung führt. Das Ergebnis ist eine Sehnsucht, die du selbst auf Abstand hältst.', // ENTWURF
            why: p => [clauseNeed(p, 'verbundenheit', 'frust'), clauseTrait(p, 'extraversion'), clauseBelief(p, 'abgetrenntheit')],
            excludes: ['ko_verbundenheit_abgetrenntheit', 'ko_extraversion_abgetrenntheit'],
        },
        {
            id: 'ko_kompetenz_stabilitaet_autonomiebelief', layers: ['Bedürfnisse', 'Terrain', 'Prägung'],
            when: p => needFrust(p, 'kompetenz') >= 55 && trait(p, 'stabilitaet') <= 40 && belAct(p, 'autonomie') >= 50,
            strength: p => (needFrust(p, 'kompetenz') + (100 - trait(p, 'stabilitaet')) + belAct(p, 'autonomie')) / 3,
            title: 'Zweifel, die unter Druck lauter werden', // ENTWURF
            text: 'Du zweifelst an deinem Können, wirst unter Anspannung schnell unruhig, und ein alter Satz sagt dir zusätzlich, dass du allein nicht genügst. Zusammen wird daraus schnell ein lauter innerer Kritiker.', // ENTWURF
            why: p => [clauseNeed(p, 'kompetenz', 'frust'), clauseTrait(p, 'stabilitaet'), clauseBelief(p, 'autonomie')],
            excludes: ['ko_kompetenz_autonomiebelief', 'ko_kompetenz_stabilitaet'],
        },
        {
            id: 'ko_autonomie_gewissenhaftigkeit_fremdbezogenheit', layers: ['Bedürfnisse', 'Terrain', 'Prägung'],
            when: p => needFrust(p, 'autonomie') >= 55 && trait(p, 'gewissenhaftigkeit') >= 65 && belAct(p, 'fremdbezogenheit') >= 50,
            strength: p => (needFrust(p, 'autonomie') + trait(p, 'gewissenhaftigkeit') + belAct(p, 'fremdbezogenheit')) / 3,
            title: 'Diszipliniert fremdbestimmt', // ENTWURF
            text: 'Du fühlst dich oft fremdbestimmt, hältst dich gleichzeitig sehr diszipliniert an das, was von dir erwartet wird, und ein alter Satz sagt dir, dass du nur durch Funktionieren wertvoll bist. Das hält das Fremdbestimmtsein zusätzlich fest.', // ENTWURF
            why: p => [clauseNeed(p, 'autonomie', 'frust'), clauseTrait(p, 'gewissenhaftigkeit'), clauseBelief(p, 'fremdbezogenheit')],
            excludes: ['ko_autonomie_gewissenhaftigkeit', 'ko_autonomie_fremdbezogenheit'],
        },
    ];

    function buildConstellations(profile) {
        const { chosen, activeCount } = pickTop(CONSTELLATIONS, profile, 3);
        if (activeCount < 2) {
            return {
                items: [],
                fallback: 'In deinem Profil gibt es gerade wenige starke Spannungen. Das ist Spielraum.', // ENTWURF
            };
        }
        return {
            items: chosen.map(c => ({ id: c.id, layers: c.layers, title: c.title, text: c.text, why: c.why(profile) })),
            fallback: null,
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  D) SITUATIONS — four fixed situations, first match wins
    // ═══════════════════════════════════════════════════════════════
    const SITUATIONS = {
        konflikt: {
            label: 'Im Konflikt', // ENTWURF
            variants: [
                { id: 'konflikt_fremdbezogenheit', when: p => belAct(p, 'fremdbezogenheit') >= 55,
                  text: 'Im Konflikt hältst du dich eher zurück und sagst erst später, was dich wirklich gestört hat.' }, // ENTWURF
                { id: 'konflikt_klartext', when: p => trait(p, 'vertraeglichkeit') <= 40,
                  text: 'Im Konflikt sprichst du schnell aus, was Sache ist, auch auf die Gefahr hin, anzuecken.' }, // ENTWURF
                { id: 'konflikt_abgetrenntheit', when: p => belAct(p, 'abgetrenntheit') >= 55,
                  text: 'Im Konflikt ziehst du dich eher innerlich zurück, statt die Auseinandersetzung offen zu suchen.' }, // ENTWURF
                { id: 'konflikt_nachgeben', when: p => needFrust(p, 'verbundenheit') >= 55 && trait(p, 'vertraeglichkeit') >= 55,
                  text: 'Im Konflikt gibst du schnell nach, aus Sorge, die Verbindung zu verlieren.' }, // ENTWURF
                { id: 'konflikt_anspannung', when: p => trait(p, 'stabilitaet') <= 40,
                  text: 'Im Konflikt steigt deine Anspannung schnell, auch wenn du nach außen ruhig wirken willst.' }, // ENTWURF
                { id: 'konflikt_fallback', when: () => true,
                  text: 'Im Konflikt reagierst du je nach Situation unterschiedlich, es gibt kein festes Muster, das bei dir besonders auffällt.' }, // ENTWURF
            ],
        },
        arbeit: {
            label: 'Bei der Arbeit', // ENTWURF
            variants: [
                { id: 'arbeit_wachsamkeit', when: p => belAct(p, 'wachsamkeit') >= 55,
                  text: 'Bei der Arbeit setzt du die Latte oft höher, als es die Aufgabe eigentlich verlangt.' }, // ENTWURF
                { id: 'arbeit_spontan', when: p => trait(p, 'gewissenhaftigkeit') <= 35,
                  text: 'Bei der Arbeit improvisierst du gern und hältst dich nicht lange mit starren Plänen auf.' }, // ENTWURF
                { id: 'arbeit_grenzen', when: p => belAct(p, 'grenzen') >= 55,
                  text: 'Bei der Arbeit schiebst du unangenehme Aufgaben eher vor dir her, solange es irgendwie geht.' }, // ENTWURF
                { id: 'arbeit_autonomie', when: p => needFrust(p, 'autonomie') >= 55,
                  text: 'Bei der Arbeit fühlst du dich oft in einen Rahmen gedrängt, den du dir nicht selbst ausgesucht hast.' }, // ENTWURF
                { id: 'arbeit_leistung_zweifel', when: p => valScore(p, 'leistung') >= 60 && needFrust(p, 'kompetenz') >= 55,
                  text: 'Bei der Arbeit leistest du viel und zweifelst trotzdem häufig, ob es wirklich genug war.' }, // ENTWURF
                { id: 'arbeit_fallback', when: () => true,
                  text: 'Bei der Arbeit zeigt sich kein auffälliges Muster, du passt dich eher an die jeweilige Aufgabe an.' }, // ENTWURF
            ],
        },
        gruppe: {
            label: 'In einer neuen Gruppe', // ENTWURF
            variants: [
                { id: 'gruppe_introvertiert', when: p => trait(p, 'extraversion') <= 35,
                  text: 'In einer neuen Gruppe beobachtest du erst eine Weile, bevor du selbst aktiv wirst.' }, // ENTWURF
                { id: 'gruppe_extravertiert', when: p => trait(p, 'extraversion') >= 65,
                  text: 'In einer neuen Gruppe gehst du schnell auf andere zu und suchst den Kontakt.' }, // ENTWURF
                { id: 'gruppe_abstand', when: p => belAct(p, 'abgetrenntheit') >= 55,
                  text: 'In einer neuen Gruppe hältst du zunächst bewusst etwas Abstand, bis du spürst, dass du sicher bist.' }, // ENTWURF
                { id: 'gruppe_nuetzlich', when: p => belAct(p, 'fremdbezogenheit') >= 55,
                  text: 'In einer neuen Gruppe machst du dich schnell nützlich, um dazuzugehören.' }, // ENTWURF
                { id: 'gruppe_abwarten', when: p => valScore(p, 'konformitaet') >= 60,
                  text: 'In einer neuen Gruppe schaust du erst, was die anderen tun, bevor du eine eigene Position zeigst.' }, // ENTWURF
                { id: 'gruppe_fallback', when: () => true,
                  text: 'In einer neuen Gruppe verhältst du dich situativ, ohne ein festes Muster.' }, // ENTWURF
            ],
        },
        druck: {
            label: 'Unter Druck', // ENTWURF
            variants: [
                { id: 'druck_instabil', when: p => trait(p, 'stabilitaet') <= 35,
                  text: 'Unter Druck gerätst du innerlich schnell in Aufruhr, auch wenn du das nach außen nicht zeigst.' }, // ENTWURF
                { id: 'druck_wachsamkeit', when: p => belAct(p, 'wachsamkeit') >= 55,
                  text: 'Unter Druck schaltest du eher noch einen Gang höher, statt langsamer zu machen.' }, // ENTWURF
                { id: 'druck_rueckzug', when: p => needFrust(p, 'verbundenheit') >= 55 && trait(p, 'extraversion') <= 40,
                  text: 'Unter Druck ziehst du dich eher zurück, statt dir Unterstützung zu holen.' }, // ENTWURF
                { id: 'druck_autonomiebelief', when: p => belAct(p, 'autonomie') >= 55,
                  text: 'Unter Druck zweifelst du schneller daran, ob du die Sache allein schaffst.' }, // ENTWURF
                { id: 'druck_stabil', when: p => trait(p, 'stabilitaet') >= 60,
                  text: 'Unter Druck bleibst du vergleichsweise ruhig und wirkst auf andere eher gelassen.' }, // ENTWURF
                { id: 'druck_fallback', when: () => true,
                  text: 'Unter Druck reagierst du unterschiedlich, je nachdem, worum es gerade geht.' }, // ENTWURF
            ],
        },
    };

    function pickSituation(group, profile) {
        const variant = group.variants.find(v => v.when(profile));
        return variant ? { id: variant.id, text: variant.text } : null;
    }

    function buildSituations(profile, alltagOverrides) {
        return Object.keys(SITUATIONS).map(key => {
            const group = SITUATIONS[key];
            const chosen = pickSituation(group, profile);
            const overrideText = alltagOverrides && alltagOverrides.situationText[key];
            return { key, label: group.label, text: overrideText || (chosen ? chosen.text : '') };
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  E) ALLTAG — Szenario-Antworten (Prompt 4 Punkt 4)
    // ═══════════════════════════════════════════════════════════════
    // Jede Antwort ist einer konkreten, eigenen Formulierung des Nutzers so nah
    // wie möglich. Sie ändert keinen Skalenwert, sondern liefert bei passenden
    // Reibungen eine persönlichere Auslöser/Verhalten-Kachel und kann bei
    // Situationen den generischen Text ersetzen. Fehlt eine Antwort oder passt
    // keine Reibung/Situation, bleibt der ursprüngliche Text unverändert.
    const ALLTAG_ANSWERS = {
        a_friend: {
            sorge_arbeit:   {},
            selbstzweifel:  { frictions: ['kompetenz_vs_selbstzweifel', 'einfluss_vs_selbstzweifel'] },
            aktiv:          {},
            abwarten:       { frictions: ['rueckzug_trotz_sehnsucht'], situations: ['druck'] },
        },
        a_meeting: {
            erleichtert:    {},
            zu_hart:        { frictions: ['klartext_vs_fremdbezogenheit'] },
            entschuldigen:  { frictions: ['klartext_vs_fremdbezogenheit'], situations: ['konflikt'] },
            normal:         {},
        },
        a_decision: {
            zuegig:         {},
            meinung_holen:  { frictions: ['einfluss_vs_selbstzweifel', 'kompetenz_vs_selbstzweifel'] },
            andere_wollen:  { frictions: ['einfluss_vs_fremdbezogenheit', 'selbstbestimmung_vs_fremdbezogenheit'] },
            aufschieben:    { frictions: ['freiheit_vs_sicherheit', 'ziel_vs_vermeidung'], situations: ['arbeit'] },
        },
    };

    /** Builds { frictionText: {id: {trigger,behavior}}, situationText: {key: text} } from profile.alltag. */
    function buildAlltagOverrides(profile) {
        const alltag = profile.alltag || {};
        const frictionText = {};
        const situationText = {};
        Object.keys(alltag).forEach(qid => {
            const q = ModelV2.ALLTAG_ITEMS.find(x => x.id === qid);
            if (!q) return;
            const choiceKey = alltag[qid];
            const choice = q.choices.find(c => c.key === choiceKey);
            const meta = ALLTAG_ANSWERS[qid] && ALLTAG_ANSWERS[qid][choiceKey];
            if (!choice || !meta) return;
            (meta.frictions || []).forEach(fid => { frictionText[fid] = { trigger: q.text, behavior: choice.label }; });
            (meta.situations || []).forEach(key => { situationText[key] = choice.label; });
        });
        return { frictionText, situationText };
    }

    // ═══════════════════════════════════════════════════════════════
    //  Public API
    // ═══════════════════════════════════════════════════════════════
    function build(profile) {
        const alltag = buildAlltagOverrides(profile);
        return {
            paradox:        buildParadox(profile),
            strengths:      buildStrengths(profile),
            constellations: buildConstellations(profile),
            situations:     buildSituations(profile, alltag),
            alltag,
        };
    }

    return {
        band, fill,
        PARADOXES, STRENGTHS, CONSTELLATIONS, SITUATIONS, ALLTAG_ANSWERS,
        buildParadox, buildStrengths, buildConstellations, buildSituations, buildAlltagOverrides,
        build,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { RulesV2 };
