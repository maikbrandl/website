/**
 * HUMAN MAP v2 – Insights (Synthesis engine, §6)
 * Deterministic. Produces the one-sentence synthesis and the four panels of the
 * "whole picture" (Terrain / Antrieb / Sinn / Prägung).
 *
 * NOTE: the friction map + leverage score (§7) and the transformation path (§8)
 * are the NEXT build stage. Focus here is provisional (see LayersV2.buildProfile).
 */

const InsightsV2 = (() => {

    // Short, embeddable "aber"-clause per belief domain (for the synthesis sentence).
    const BELIEF_CLAUSE = {
        abgetrenntheit:   'hältst dich aber zurück, um nicht verletzt zu werden',
        autonomie:        'traust dir aber insgeheim zu wenig zu',
        grenzen:          'weichst aber dem Unbequemen aus, das dich weiterbrächte',
        fremdbezogenheit: 'hältst dich aber klein, um niemanden zu enttäuschen',
        wachsamkeit:      'lässt dir aber keine Schwäche und keine Ruhe',
    };

    /** The two traits furthest from the neutral midpoint (most defining). */
    function definingTraits(traits) {
        return Object.keys(traits)
            .map(key => ({ key, score: traits[key], dist: Math.abs(traits[key] - 50) }))
            .sort((a, b) => b.dist - a.dist)
            .slice(0, 2);
    }

    function traitClause(key, score) {
        const t = ContentV2.TRAIT_TEXT[key];
        return score >= 50 ? t.high : t.low;
    }

    /**
     * One sentence that sums up the person — no type label (§6).
     * e.g. "Du bist neugierig und offen für Neues und warmherzig, dir liegt vor allem
     *       daran, frei zu entscheiden — hältst dich aber klein, um niemanden zu enttäuschen."
     */
    function synthesisSentence(profile) {
        const [d1, d2] = definingTraits(profile.traits);
        const traitPart = `${traitClause(d1.key, d1.score)} und ${traitClause(d2.key, d2.score)}`;

        const topValue = profile.values[0];
        const valuePart = topValue ? `, dir liegt vor allem daran, ${ContentV2.VALUE_TEXT[topValue.key]}` : '';

        const belief = profile.focusBelief;
        const beliefPart = belief && BELIEF_CLAUSE[belief.domain] ? `, ${BELIEF_CLAUSE[belief.domain]}` : '';

        return `Du bist ${traitPart}${valuePart}${beliefPart}.`;
    }

    // ── The four panels of the whole picture (§6) ────────────────────

    function terrainPanel(profile) {
        return Object.keys(ModelV2.TRAITS).map(key => {
            const score = profile.traits[key];
            const t = ContentV2.TRAIT_TEXT[key];
            return {
                key,
                label: ModelV2.TRAITS[key].label,
                score,
                read: score >= 50 ? t.readHigh : t.readLow,
            };
        });
    }

    function antriebPanel(profile, topN = 4) {
        const topValues = profile.values.slice(0, topN).map(v => ({
            key: v.key, label: v.label, score: v.score, text: ContentV2.VALUE_TEXT[v.key],
        }));
        const needs = Object.keys(ModelV2.NEEDS).map(key => {
            const nd = profile.needs[key];
            const c = ContentV2.NEED_TEXT[key];
            let line;
            if (nd.flag)                 line = c.frust;
            else if (nd.erfuellung >= 60) line = c.satHigh;
            else                          line = c.satLow;
            return { key, label: c.label, erfuellung: nd.erfuellung, frustration: nd.frustration, flag: nd.flag, line };
        });
        return { topValues, needs };
    }

    function sinnPanel(profile) {
        return Object.keys(ModelV2.MEANING).map(key => ({
            key,
            label: ContentV2.MEANING_TEXT[key].label,
            score: profile.meaning[key],
            read: ContentV2.MEANING_TEXT[key].read,
        }));
    }

    function praegungPanel(profile) {
        return profile.beliefs.map(b => ({
            domain: b.domain,
            label: ModelV2.SCHEMA_DOMAINS[b.domain],
            text: b.text,
            activation: b.activation,
        }));
    }

    /** Everything the result card needs for the "whole picture". */
    function wholePicture(profile) {
        return {
            synthesis: synthesisSentence(profile),
            terrain:   terrainPanel(profile),
            antrieb:   antriebPanel(profile),
            sinn:      sinnPanel(profile),
            praegung:  praegungPanel(profile),
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  §7  Friction map & leverage score (finds the biggest problem)
    // ═══════════════════════════════════════════════════════════════
    // Reibung = collision between Antrieb (will) and Terrain/Prägung (ist).
    // Each entry declares thresholds (when), the affected want, the underlying
    // belief lever, a changeability class, a blockade strength and three texts.

    const clamp01 = (n) => Math.max(0, Math.min(1, n));

    // ── profile accessors ──
    const valScore  = (p, key)    => { const v = p.values.find(x => x.key === key); return v ? v.score : 50; };
    const belAct    = (p, domain) => { const b = p.beliefs.find(x => x.domain === domain); return b ? b.activation : 0; };
    const needFrust = (p, key)    => p.needs[key].frustration;
    const needErf   = (p, key)    => p.needs[key].erfuellung;

    // Changeability weight V — beliefs/behaviour high, values medium, traits low (§7).
    const V_WEIGHT = { belief: 1.0, behavior: 0.9, value: 0.6, trait: 0.4 };

    const FRICTIONS = [
        {
            id: 'selbstbestimmung_vs_fremdbezogenheit', type: 'luecke',
            label: 'Frei sein wollen, aber es allen recht machen',
            value: 'selbstbestimmung', belief: 'fremdbezogenheit', changeable: 'belief',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && belAct(p, 'fremdbezogenheit') >= 50,
            blockade: p => (belAct(p, 'fremdbezogenheit') + needFrust(p, 'autonomie')) / 2,
            origin: 'Du willst frei entscheiden, hast aber früh gelernt, dass du dir Wert durch Geben und Gefallen verdienst.',
            cost:   'So richtest du dich still nach den Erwartungen anderer und verlierst genau die Selbstbestimmung, die dir am wichtigsten ist.',
            break:  'Sage diese Woche einmal freundlich Nein zu etwas, das du sonst aus Pflichtgefühl übernommen hättest.',
        },
        {
            id: 'verbundenheit_vs_abgetrenntheit', type: 'schleife',
            label: 'Nähe suchen, aber den Schutz nicht loslassen',
            need: 'verbundenheit', belief: 'abgetrenntheit', changeable: 'belief',
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'abgetrenntheit') >= 50,
            blockade: p => (needFrust(p, 'verbundenheit') + belAct(p, 'abgetrenntheit')) / 2,
            origin: 'Du sehnst dich nach echter Nähe und hast zugleich gelernt, dass Sichzeigen unsicher ist.',
            cost:   'Der Schutz, der dich vor Verletzung bewahren soll, hält auch die Nähe draußen, nach der du dich sehnst.',
            break:  'Zeige einer vertrauten Person eine kleine, echte Verletzlichkeit und beobachte, was wirklich passiert.',
        },
        {
            id: 'kompetenz_vs_selbstzweifel', type: 'schleife',
            label: 'Etwas können wollen, sich aber nichts zutrauen',
            need: 'kompetenz', belief: 'autonomie', changeable: 'belief',
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'autonomie') >= 50,
            blockade: p => (needFrust(p, 'kompetenz') + belAct(p, 'autonomie')) / 2,
            origin: 'Du willst dich wirksam und fähig fühlen, trägst aber die alte Überzeugung, allein nicht zu genügen.',
            cost:   'Du wartest auf Rückversicherung und übersiehst, wie viel du längst allein trägst. Der Zweifel bestätigt sich selbst.',
            break:  'Bring diese Woche eine kleine Sache bewusst allein zu Ende, ohne dir Bestätigung zu holen.',
        },
        {
            id: 'leistung_vs_perfektionismus', type: 'schleife',
            label: 'Leisten wollen, aber nie genug sein dürfen',
            value: 'leistung', belief: 'wachsamkeit', changeable: 'belief',
            when: p => valScore(p, 'leistung') >= 60 && belAct(p, 'wachsamkeit') >= 50,
            blockade: p => (belAct(p, 'wachsamkeit') + needFrust(p, 'kompetenz')) / 2,
            origin: 'Leistung ist dir wichtig, und du hast gelernt, dass nur Perfektion und Stärke zählen.',
            cost:   'Der Maßstab wird nie erreicht: Jeder Erfolg fühlt sich zu klein an, jede Pause wie ein Versäumnis.',
            break:  'Lass bewusst eine Sache „nur gut genug“ und spüre, dass nichts Schlimmes passiert.',
        },
        {
            id: 'ueberforderung_durch_geben', type: 'schleife',
            label: 'Für alle sorgen, bis nichts mehr übrig ist',
            need: 'autonomie', belief: 'fremdbezogenheit', changeable: 'behavior',
            when: p => belAct(p, 'fremdbezogenheit') >= 55 && needFrust(p, 'autonomie') >= 55,
            blockade: p => (belAct(p, 'fremdbezogenheit') + needFrust(p, 'autonomie')) / 2,
            origin: 'Du gibst viel und gern, weil dein Wert sich lange daran bemessen hat, gebraucht zu werden.',
            cost:   'Du sorgst für alle und verlierst die Verbindung zu dem, was du selbst brauchst, bis du leerläufst.',
            break:  'Plane diese Woche eine kleine Sache fest ein, die nur dir gilt, und halte sie ein.',
        },
        {
            id: 'antrieb_ohne_richtung', type: 'luecke',
            label: 'Viel wollen, aber keine klare Richtung spüren',
            value: 'leistung', belief: null, changeable: 'behavior',
            when: p => (valScore(p, 'leistung') >= 60 || valScore(p, 'selbstbestimmung') >= 60) && p.meaning.purpose <= 45,
            blockade: p => (100 - p.meaning.purpose),
            origin: 'Du hast Energie und Anspruch, aber gerade keine Richtung, die sich wirklich lohnt.',
            cost:   'Ohne ein klares Wozu verpufft dein Antrieb in Betriebsamkeit, statt dich irgendwohin zu tragen.',
            break:  'Schreib einen Satz auf, wofür sich dein Einsatz gerade lohnen soll, und richte eine Handlung daran aus.',
        },
        {
            id: 'nicht_bedeutsam', type: 'luecke',
            label: 'Dazugehören wollen, sich aber unwichtig fühlen',
            need: 'verbundenheit', belief: 'abgetrenntheit', changeable: 'belief',
            when: p => p.meaning.bedeutsamkeit <= 45 && belAct(p, 'abgetrenntheit') >= 50,
            blockade: p => (100 - p.meaning.bedeutsamkeit + belAct(p, 'abgetrenntheit')) / 2,
            origin: 'Du willst spüren, dass dein Dasein zählt, hältst aber innerlich Abstand, um nicht enttäuscht zu werden.',
            cost:   'Weil du dich zurücknimmst, bekommst du selten zurückgespiegelt, dass du wirklich einen Unterschied machst.',
            break:  'Teile einer Person mit, was sie dir bedeutet, und bleib da, um ihre Reaktion aufzunehmen.',
        },
        {
            id: 'genuss_vs_haerte', type: 'luecke',
            label: 'Genießen wollen, sich aber keine Leichtigkeit erlauben',
            value: 'hedonismus', belief: 'wachsamkeit', changeable: 'belief',
            when: p => valScore(p, 'hedonismus') >= 55 && belAct(p, 'wachsamkeit') >= 55,
            blockade: p => belAct(p, 'wachsamkeit'),
            origin: 'Du möchtest das Leben genießen, hast aber gelernt, dass Leichtigkeit sich wie Nachlässigkeit anfühlt.',
            cost:   'So verschiebst du das Genießen auf „wenn alles erledigt ist“, und dieser Moment kommt nie.',
            break:  'Gönn dir diese Woche bewusst eine kleine Freude, ohne sie dir vorher verdient haben zu müssen.',
        },
        {
            id: 'freiheit_vs_sicherheit', type: 'luecke',
            label: 'Freiheit und Sicherheit ziehen dich auseinander',
            value: 'selbstbestimmung', belief: null, changeable: 'value',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && valScore(p, 'sicherheit') >= 60,
            blockade: p => Math.min(valScore(p, 'selbstbestimmung'), valScore(p, 'sicherheit')),
            origin: 'Zwei starke Werte in dir wollen Gegensätzliches: Weite und Halt zugleich.',
            cost:   'Jede Entscheidung fühlt sich nach Verrat am anderen Teil an, also bleibst du oft in der Schwebe.',
            break:  'Triff eine anstehende Entscheidung bewusst zugunsten eines der beiden Werte, und benenne, was du bewusst loslässt.',
        },
        {
            id: 'neugier_vs_kontrolle', type: 'luecke',
            label: 'Neues wollen, aber die Kontrolle nicht loslassen',
            value: 'stimulation', belief: null, changeable: 'trait',
            when: p => valScore(p, 'stimulation') >= 60 && p.traits.gewissenhaftigkeit >= 65,
            blockade: p => Math.min(valScore(p, 'stimulation'), p.traits.gewissenhaftigkeit),
            origin: 'Ein Teil von dir sucht Abwechslung, ein anderer hält fest an Plan und Ordnung.',
            cost:   'Das Bedürfnis nach Kontrolle erstickt oft die Spontaneität, bevor sie überhaupt entstehen kann.',
            break:  'Lass diese Woche eine kleine Sache bewusst ungeplant und schau, was passiert.',
        },
        {
            id: 'rueckzug_trotz_sehnsucht', type: 'schleife',
            label: 'Nähe wollen, sich aber zurückziehen',
            need: 'verbundenheit', belief: null, changeable: 'behavior',
            when: p => needFrust(p, 'verbundenheit') >= 55 && p.traits.extraversion <= 40,
            blockade: p => (needFrust(p, 'verbundenheit') + (100 - p.traits.extraversion)) / 2,
            origin: 'Du sehnst dich nach Verbindung, ziehst dich aber zurück, wenn Kontakt anstrengend wird.',
            cost:   'Der Rückzug schützt kurz und verstärkt langfristig genau die Einsamkeit, die du loswerden willst.',
            break:  'Mach den ersten kleinen Schritt: Melde dich aktiv bei einer Person, statt zu warten.',
        },
        {
            id: 'ziel_vs_vermeidung', type: 'schleife',
            label: 'Ziele haben, aber dem Unbequemen ausweichen',
            value: 'leistung', belief: 'grenzen', changeable: 'behavior',
            when: p => valScore(p, 'leistung') >= 55 && belAct(p, 'grenzen') >= 50,
            blockade: p => belAct(p, 'grenzen'),
            origin: 'Du hast Ziele, aber einen tiefen Reflex, Unbequemes und Frust zu umgehen.',
            cost:   'Jedes Ausweichen verschafft kurz Erleichterung und schiebt genau die Dinge weg, die dich weiterbrächten.',
            break:  'Halte einmal bewusst eine unbequeme Aufgabe bis zum Ende aus, statt ihr auszuweichen.',
        },
        {
            id: 'anpassung_vs_freiheit', type: 'luecke',
            label: 'Dazugehören und frei sein zugleich wollen',
            value: 'selbstbestimmung', belief: null, changeable: 'value',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && valScore(p, 'konformitaet') >= 55,
            blockade: p => Math.min(valScore(p, 'selbstbestimmung'), valScore(p, 'konformitaet')),
            origin: 'Du willst deinen eigenen Weg gehen und gleichzeitig dazugehören und nicht anecken.',
            cost:   'Aus Angst anzuecken passt du dich an, und fühlst dich dann fremdbestimmt in deinem eigenen Leben.',
            break:  'Vertritt in einer kleinen Sache offen deine eigene Meinung, auch wenn sie abweicht.',
        },
        {
            id: 'unruhe_schleife', type: 'schleife',
            label: 'Nach außen stark, nach innen in Aufruhr',
            need: 'kompetenz', belief: 'wachsamkeit', changeable: 'belief',
            when: p => p.traits.stabilitaet <= 40 && belAct(p, 'wachsamkeit') >= 50,
            blockade: p => ((100 - p.traits.stabilitaet) + belAct(p, 'wachsamkeit')) / 2,
            origin: 'Du hältst nach außen die Fassung und darfst dir innerlich keine Schwäche erlauben.',
            cost:   'Weil du nie abschalten darfst, staut sich die Anspannung, die du eigentlich loswerden willst.',
            break:  'Erlaube dir bewusst einen unperfekten, ruhigen Moment und teile ihn niemandem als Leistung mit.',
        },
    ];

    /** Overall distress severity 0-1 for the Vorsicht damping and safety note (§12). */
    function distressSeverity(profile) {
        const maxNeedFrust = Math.max(
            profile.needs.autonomie.frustration,
            profile.needs.kompetenz.frustration,
            profile.needs.verbundenheit.frustration,
        );
        const heavySchema = Math.max(belAct(profile, 'abgetrenntheit'), belAct(profile, 'autonomie'));
        return clamp01(
            (Math.max(0, 40 - profile.traits.stabilitaet) / 40) * 0.5 +
            (maxNeedFrust > 65 ? 0.3 : 0) +
            (heavySchema > 65 ? 0.2 : 0)
        );
    }

    /** Warm support note when several distress signals stack (§12). Never alarmist. */
    function safetyCheck(profile) {
        const severity = distressSeverity(profile);
        if (severity < 0.6) return { concern: false, severity };
        return {
            concern: true,
            severity,
            message: 'Einige deiner Antworten deuten auf eine gerade hohe innere Belastung hin. ' +
                'Dieses Tool ersetzt keine Therapie. Wenn dich das länger begleitet, ist es ein Zeichen von Stärke, ' +
                'dir Unterstützung zu holen, etwa bei einer Beratungsstelle oder einer Fachperson.',
        };
    }

    /**
     * Full friction map with transparent leverage scores (§7).
     * Hebel = Wichtigkeit × Blockade × Zentralität × Veränderbarkeit − Vorsicht.
     */
    function frictionMap(profile) {
        const active = FRICTIONS.filter(f => f.when(profile));

        // Zentralität: how many active frictions share the same underlying belief (keystone).
        const domainCounts = {};
        active.forEach(f => { if (f.belief) domainCounts[f.belief] = (domainCounts[f.belief] || 0) + 1; });
        const maxShare = Math.max(1, ...Object.values(domainCounts));

        const severity = distressSeverity(profile);

        const scored = active.map(f => {
            const W = f.value ? clamp01(valScore(profile, f.value) / 100) : 0.8; // needs are universal
            const B = clamp01(f.blockade(profile) / 100);
            const Z = f.belief ? domainCounts[f.belief] / maxShare : 0.5;
            const Vv = V_WEIGHT[f.changeable] || 0.5;
            // Vorsicht: dampen belief-heavy, clinically sensitive frictions when distress stacks.
            const heavy = f.belief === 'abgetrenntheit' || f.belief === 'autonomie';
            const vorsicht = severity * (heavy ? 0.2 : 0.08);
            const leverage = Math.max(0, Math.round((W * B * Z * Vv - vorsicht) * 100));
            return {
                id: f.id, type: f.type, label: f.label,
                value: f.value || null, need: f.need || null, belief: f.belief || null,
                changeable: f.changeable,
                origin: f.origin, cost: f.cost, break: f.break,
                leverage,
                components: { W: +W.toFixed(2), B: +B.toFixed(2), Z: +Z.toFixed(2), V: Vv, vorsicht: +vorsicht.toFixed(2) },
            };
        }).sort((a, b) => b.leverage - a.leverage);

        return { active: scored, focus: scored[0] || null, safety: safetyCheck(profile) };
    }

    /**
     * Resolve the REAL focus (replaces the provisional one from LayersV2) and
     * attach the friction map to the profile. Mutates + returns the profile.
     */
    function applyFocus(profile) {
        const map = frictionMap(profile);
        profile.frictions = map.active;
        profile.safety = map.safety;
        if (map.focus) {
            profile.focus = map.focus;
            if (map.focus.belief) {
                const b = profile.beliefs.find(x => x.domain === map.focus.belief);
                if (b) profile.focusBelief = b;
            }
            if (map.focus.value) {
                const v = profile.values.find(x => x.key === map.focus.value);
                if (v) profile.focusValue = v;
            }
        } else {
            // No active friction — keep provisional focus, mark as balanced.
            profile.focus = null;
        }
        return profile;
    }

    // ═══════════════════════════════════════════════════════════════
    //  §8  Transformation engine — the guided change path
    // ═══════════════════════════════════════════════════════════════
    /**
     * Build the 5-step transformation path for the profile's focus belief:
     * finden → formulieren → widerlegen (WOOP) → verankern → wiederholen.
     * Returns null for a balanced profile (no active belief-based focus).
     */
    function buildTransformation(profile) {
        const focus = profile.focus;
        const domain = focus && focus.belief;
        const t = domain && ContentV2.TRANSFORM[domain];
        if (!t) return null;

        const belief = ContentV2.SCHEMA_BELIEFS[domain];
        const topValue = profile.values[0];

        return {
            belief:    belief.text,
            domain,
            steps: [
                {
                    key: 'finden', n: 1, title: 'Finden',
                    lead: 'Der Glaubenssatz hinter deinem Fokus:',
                    beliefText: belief.text,
                    origin: belief.origin,
                    questions: t.find,
                },
                {
                    key: 'formulieren', n: 2, title: 'Formulieren',
                    lead: 'Ein glaubwürdiger, werte-basierter Gegensatz, klein und erreichbar, nicht grandios:',
                    counter: t.counter,
                    valueAnchor: topValue ? `Er knüpft an das an, was dir wichtig ist: ${ContentV2.VALUE_TEXT[topValue.key]}.` : '',
                },
                {
                    key: 'widerlegen', n: 3, title: 'Widerlegen',
                    lead: 'Ein kleines Verhaltensexperiment als WOOP. Eine widersprechende Erfahrung ist der wirksamste Hebel:',
                    woop: { wish: t.wish, outcome: t.outcome, obstacle: t.obstacle, plan: t.plan },
                },
                {
                    key: 'verankern', n: 4, title: 'Verankern',
                    lead: 'Spüre die neue Erfahrung emotional nach, am besten abends, denn Schlaf festigt sie:',
                    prompt: 'Wie hat sich der Moment angefühlt, in dem der alte Satz nicht gestimmt hat? Bleib kurz bei diesem Gefühl.',
                },
                {
                    key: 'wiederholen', n: 5, title: 'Wiederholen & Wiedermessen',
                    lead: 'Neue Muster brauchen Wochen, nicht Tage (im Schnitt rund zwei Monate):',
                    prompt: 'Wiederhole das Experiment über mehrere Wochen. Danach misst du Prägung, Bedürfnisse und Sinn erneut, und siehst deine Bewegung.',
                },
            ],
        };
    }

    return {
        synthesisSentence, wholePicture,
        terrainPanel, antriebPanel, sinnPanel, praegungPanel, definingTraits,
        frictionMap, applyFocus, safetyCheck, distressSeverity, FRICTIONS,
        buildTransformation,
    };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { InsightsV2 };
