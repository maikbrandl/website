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
            value: 'selbstbestimmung', belief: 'fremdbezogenheit', changeable: 'belief', transform: 'fremdbezogenheit',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && belAct(p, 'fremdbezogenheit') >= 50,
            blockade: p => (belAct(p, 'fremdbezogenheit') + needFrust(p, 'autonomie')) / 2,
            origin: 'Du willst frei entscheiden, hast aber früh gelernt, dass du dir Wert durch Geben und Gefallen verdienst.',
            cost:   'So richtest du dich still nach den Erwartungen anderer und verlierst genau die Selbstbestimmung, die dir am wichtigsten ist.',
            break:  'Sage diese Woche einmal freundlich Nein zu etwas, das du sonst aus Pflichtgefühl übernommen hättest.',
            trigger: 'Jemand bittet dich um einen Gefallen oder eine Entscheidung.', // ENTWURF
            behavior: 'Du sagst Ja, bevor du wirklich geprüft hast, ob du es willst.', // ENTWURF
            gain: 'Kurzfristig bleibt die Beziehung glatt, und du erntest Anerkennung.', // ENTWURF
        },
        {
            id: 'verbundenheit_vs_abgetrenntheit', type: 'schleife',
            label: 'Nähe suchen, aber den Schutz nicht loslassen',
            need: 'verbundenheit', belief: 'abgetrenntheit', changeable: 'belief', transform: 'abgetrenntheit',
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'abgetrenntheit') >= 50,
            blockade: p => (needFrust(p, 'verbundenheit') + belAct(p, 'abgetrenntheit')) / 2,
            origin: 'Du sehnst dich nach echter Nähe und hast zugleich gelernt, dass Sichzeigen unsicher ist.',
            cost:   'Der Schutz, der dich vor Verletzung bewahren soll, hält auch die Nähe draußen, nach der du dich sehnst.',
            break:  'Zeige einer vertrauten Person eine kleine, echte Verletzlichkeit und beobachte, was wirklich passiert.',
            trigger: 'Eine Situation wird emotional eng oder verletzlich.', // ENTWURF
            behavior: 'Du hältst einen Teil von dir zurück oder ziehst dich leicht zurück.', // ENTWURF
            gain: 'Der Abstand gibt dir kurzfristig ein Gefühl von Sicherheit.', // ENTWURF
        },
        {
            id: 'kompetenz_vs_selbstzweifel', type: 'schleife',
            label: 'Etwas können wollen, sich aber nichts zutrauen',
            need: 'kompetenz', belief: 'autonomie', changeable: 'belief', transform: 'autonomie',
            when: p => needFrust(p, 'kompetenz') >= 55 && belAct(p, 'autonomie') >= 50,
            blockade: p => (needFrust(p, 'kompetenz') + belAct(p, 'autonomie')) / 2,
            origin: 'Du willst dich wirksam und fähig fühlen, trägst aber die alte Überzeugung, allein nicht zu genügen.',
            cost:   'Du wartest auf Rückversicherung und übersiehst, wie viel du längst allein trägst. Der Zweifel bestätigt sich selbst.',
            break:  'Bring diese Woche eine kleine Sache bewusst allein zu Ende, ohne dir Bestätigung zu holen.',
            trigger: 'Eine Aufgabe verlangt, dass du allein eine Entscheidung triffst.', // ENTWURF
            behavior: 'Du holst dir Rückversicherung, bevor du weitermachst.', // ENTWURF
            gain: 'Der Zweifel wird kurz leiser, du fühlst dich abgesichert.', // ENTWURF
        },
        {
            id: 'leistung_vs_perfektionismus', type: 'schleife',
            label: 'Leisten wollen, aber nie genug sein dürfen',
            value: 'leistung', belief: 'wachsamkeit', changeable: 'belief', transform: 'wachsamkeit',
            when: p => valScore(p, 'leistung') >= 60 && belAct(p, 'wachsamkeit') >= 50,
            blockade: p => (belAct(p, 'wachsamkeit') + needFrust(p, 'kompetenz')) / 2,
            origin: 'Leistung ist dir wichtig, und du hast gelernt, dass nur Perfektion und Stärke zählen.',
            cost:   'Der Maßstab wird nie erreicht: Jeder Erfolg fühlt sich zu klein an, jede Pause wie ein Versäumnis.',
            break:  'Lass bewusst eine Sache „nur gut genug“ und spüre, dass nichts Schlimmes passiert.',
            trigger: 'Eine Aufgabe ist fertig, aber noch nicht perfekt.', // ENTWURF
            behavior: 'Du überarbeitest sie weiter oder schiebst die Abgabe hinaus.', // ENTWURF
            gain: 'Du vermeidest kurzfristig das Risiko, kritisiert zu werden.', // ENTWURF
        },
        {
            id: 'ueberforderung_durch_geben', type: 'schleife',
            label: 'Für alle sorgen, bis nichts mehr übrig ist',
            need: 'autonomie', belief: 'fremdbezogenheit', changeable: 'behavior', transform: 'fremdbezogenheit',
            when: p => belAct(p, 'fremdbezogenheit') >= 55 && needFrust(p, 'autonomie') >= 55,
            blockade: p => (belAct(p, 'fremdbezogenheit') + needFrust(p, 'autonomie')) / 2,
            origin: 'Du gibst viel und gern, weil dein Wert sich lange daran bemessen hat, gebraucht zu werden.',
            cost:   'Du sorgst für alle und verlierst die Verbindung zu dem, was du selbst brauchst, bis du leerläufst.',
            break:  'Plane diese Woche eine kleine Sache fest ein, die nur dir gilt, und halte sie ein.',
            trigger: 'Jemand in deinem Umfeld braucht Unterstützung.', // ENTWURF
            behavior: 'Du übernimmst es, auch wenn deine eigenen Kapazitäten knapp sind.', // ENTWURF
            gain: 'Du fühlst dich kurz gebraucht und wertvoll.', // ENTWURF
        },
        {
            id: 'antrieb_ohne_richtung', type: 'luecke',
            label: 'Viel wollen, aber keine klare Richtung spüren',
            value: 'leistung', belief: null, changeable: 'behavior', transform: 'antrieb_ohne_richtung',
            when: p => (valScore(p, 'leistung') >= 60 || valScore(p, 'selbstbestimmung') >= 60) && p.meaning.purpose <= 45,
            blockade: p => (100 - p.meaning.purpose),
            origin: 'Du hast Energie und Anspruch, aber gerade keine Richtung, die sich wirklich lohnt.',
            cost:   'Ohne ein klares Wozu verpufft dein Antrieb in Betriebsamkeit, statt dich irgendwohin zu tragen.',
            break:  'Schreib einen Satz auf, wofür sich dein Einsatz gerade lohnen soll, und richte eine Handlung daran aus.',
            trigger: 'Du hast freie Zeit oder eine offene Entscheidung vor dir.', // ENTWURF
            thought: 'Ich sollte etwas tun, Hauptsache vorwärts.', // ENTWURF
            behavior: 'Du stürzt dich in die nächste Aufgabe, ohne zu prüfen, ob sie zu deiner Richtung passt.', // ENTWURF
            gain: 'Die Unruhe, nichts zu tun, verschwindet kurzfristig.', // ENTWURF
        },
        {
            id: 'nicht_bedeutsam', type: 'luecke',
            label: 'Dazugehören wollen, sich aber unwichtig fühlen',
            need: 'verbundenheit', belief: 'abgetrenntheit', changeable: 'belief', transform: 'abgetrenntheit',
            when: p => p.meaning.bedeutsamkeit <= 45 && belAct(p, 'abgetrenntheit') >= 50,
            blockade: p => (100 - p.meaning.bedeutsamkeit + belAct(p, 'abgetrenntheit')) / 2,
            origin: 'Du willst spüren, dass dein Dasein zählt, hältst aber innerlich Abstand, um nicht enttäuscht zu werden.',
            cost:   'Weil du dich zurücknimmst, bekommst du selten zurückgespiegelt, dass du wirklich einen Unterschied machst.',
            break:  'Teile einer Person mit, was sie dir bedeutet, und bleib da, um ihre Reaktion aufzunehmen.',
            trigger: 'Du leistest etwas, ohne dass jemand es bemerkt oder zurückspiegelt.', // ENTWURF
            behavior: 'Du ziehst dich innerlich etwas zurück, statt es anzusprechen.', // ENTWURF
            gain: 'Du vermeidest kurzfristig die Verletzlichkeit, danach zu fragen.', // ENTWURF
        },
        {
            id: 'genuss_vs_haerte', type: 'luecke',
            label: 'Genießen wollen, sich aber keine Leichtigkeit erlauben',
            value: 'hedonismus', belief: 'wachsamkeit', changeable: 'belief', transform: 'wachsamkeit',
            when: p => valScore(p, 'hedonismus') >= 55 && belAct(p, 'wachsamkeit') >= 55,
            blockade: p => belAct(p, 'wachsamkeit'),
            origin: 'Du möchtest das Leben genießen, hast aber gelernt, dass Leichtigkeit sich wie Nachlässigkeit anfühlt.',
            cost:   'So verschiebst du das Genießen auf „wenn alles erledigt ist“, und dieser Moment kommt nie.',
            break:  'Gönn dir diese Woche bewusst eine kleine Freude, ohne sie dir vorher verdient haben zu müssen.',
            trigger: 'Eine Gelegenheit zur Freude oder Pause taucht auf.', // ENTWURF
            behavior: 'Du schiebst sie auf, bis „alles erledigt ist“.', // ENTWURF
            gain: 'Das Aufschieben fühlt sich kurzfristig produktiv und pflichtbewusst an.', // ENTWURF
        },
        {
            id: 'freiheit_vs_sicherheit', type: 'luecke',
            label: 'Freiheit und Sicherheit ziehen dich auseinander',
            value: 'selbstbestimmung', belief: null, changeable: 'value', transform: 'freiheit_vs_sicherheit',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && valScore(p, 'sicherheit') >= 60,
            blockade: p => Math.min(valScore(p, 'selbstbestimmung'), valScore(p, 'sicherheit')),
            origin: 'Zwei starke Werte in dir wollen Gegensätzliches: Weite und Halt zugleich.',
            cost:   'Jede Entscheidung fühlt sich nach Verrat am anderen Teil an, also bleibst du oft in der Schwebe.',
            break:  'Triff eine anstehende Entscheidung bewusst zugunsten eines der beiden Werte, und benenne, was du bewusst loslässt.',
            trigger: 'Eine Entscheidung verlangt, dich zwischen Freiheit und Absicherung festzulegen.', // ENTWURF
            thought: 'Wenn ich mich festlege, verliere ich die andere Option für immer.', // ENTWURF
            behavior: 'Du schiebst die Entscheidung auf oder hältst dir beide Optionen offen.', // ENTWURF
            gain: 'Du vermeidest kurzfristig das Gefühl, etwas Falsches zu wählen.', // ENTWURF
        },
        {
            id: 'neugier_vs_kontrolle', type: 'luecke',
            label: 'Neues wollen, aber die Kontrolle nicht loslassen',
            value: 'stimulation', belief: null, changeable: 'trait', transform: 'neugier_vs_kontrolle',
            when: p => valScore(p, 'stimulation') >= 60 && p.traits.gewissenhaftigkeit >= 65,
            blockade: p => Math.min(valScore(p, 'stimulation'), p.traits.gewissenhaftigkeit),
            origin: 'Ein Teil von dir sucht Abwechslung, ein anderer hält fest an Plan und Ordnung.',
            cost:   'Das Bedürfnis nach Kontrolle erstickt oft die Spontaneität, bevor sie überhaupt entstehen kann.',
            break:  'Lass diese Woche eine kleine Sache bewusst ungeplant und schau, was passiert.',
            trigger: 'Etwas Ungeplantes oder Spontanes bietet sich an.', // ENTWURF
            thought: 'Das lässt sich nicht kontrollieren, also ist es riskant.', // ENTWURF
            behavior: 'Du legst doch wieder einen Plan oder eine Struktur darüber.', // ENTWURF
            gain: 'Die Kontrolle gibt dir kurzfristig ein sicheres Gefühl.', // ENTWURF
        },
        {
            id: 'rueckzug_trotz_sehnsucht', type: 'schleife',
            label: 'Nähe wollen, sich aber zurückziehen',
            need: 'verbundenheit', belief: null, changeable: 'behavior', transform: 'rueckzug_trotz_sehnsucht',
            when: p => needFrust(p, 'verbundenheit') >= 55 && p.traits.extraversion <= 40,
            blockade: p => (needFrust(p, 'verbundenheit') + (100 - p.traits.extraversion)) / 2,
            origin: 'Du sehnst dich nach Verbindung, ziehst dich aber zurück, wenn Kontakt anstrengend wird.',
            cost:   'Der Rückzug schützt kurz und verstärkt langfristig genau die Einsamkeit, die du loswerden willst.',
            break:  'Mach den ersten kleinen Schritt: Melde dich aktiv bei einer Person, statt zu warten.',
            trigger: 'Kontakt zu einer Person würde Energie oder Verletzlichkeit kosten.', // ENTWURF
            thought: 'Gerade ist es zu anstrengend, ich melde mich später.', // ENTWURF
            behavior: 'Du ziehst dich zurück und wartest, statt den ersten Schritt zu machen.', // ENTWURF
            gain: 'Du sparst dir kurzfristig den Aufwand und das Risiko der Kontaktaufnahme.', // ENTWURF
        },
        {
            id: 'ziel_vs_vermeidung', type: 'schleife',
            label: 'Ziele haben, aber dem Unbequemen ausweichen',
            value: 'leistung', belief: 'grenzen', changeable: 'behavior', transform: 'grenzen',
            when: p => valScore(p, 'leistung') >= 55 && belAct(p, 'grenzen') >= 50,
            blockade: p => belAct(p, 'grenzen'),
            origin: 'Du hast Ziele, aber einen tiefen Reflex, Unbequemes und Frust zu umgehen.',
            cost:   'Jedes Ausweichen verschafft kurz Erleichterung und schiebt genau die Dinge weg, die dich weiterbrächten.',
            break:  'Halte einmal bewusst eine unbequeme Aufgabe bis zum Ende aus, statt ihr auszuweichen.',
            trigger: 'Eine Aufgabe auf dem Weg zum Ziel wird unangenehm oder mühsam.', // ENTWURF
            behavior: 'Du wendest dich einer angenehmeren Ablenkung zu.', // ENTWURF
            gain: 'Der Frust verschwindet kurzfristig, du fühlst dich erleichtert.', // ENTWURF
        },
        {
            id: 'anpassung_vs_freiheit', type: 'luecke',
            label: 'Dazugehören und frei sein zugleich wollen',
            value: 'selbstbestimmung', belief: null, changeable: 'value', transform: 'anpassung_vs_freiheit',
            when: p => valScore(p, 'selbstbestimmung') >= 60 && valScore(p, 'konformitaet') >= 55,
            blockade: p => Math.min(valScore(p, 'selbstbestimmung'), valScore(p, 'konformitaet')),
            origin: 'Du willst deinen eigenen Weg gehen und gleichzeitig dazugehören und nicht anecken.',
            cost:   'Aus Angst anzuecken passt du dich an, und fühlst dich dann fremdbestimmt in deinem eigenen Leben.',
            break:  'Vertritt in einer kleinen Sache offen deine eigene Meinung, auch wenn sie abweicht.',
            trigger: 'Deine Meinung weicht von der der Gruppe ab.', // ENTWURF
            thought: 'Wenn ich abweiche, falle ich unangenehm auf.', // ENTWURF
            behavior: 'Du schließt dich der Mehrheitsmeinung an, statt deine eigene zu äußern.', // ENTWURF
            gain: 'Die Zustimmung fühlt sich kurzfristig zugehörig und sicher an.', // ENTWURF
        },
        {
            id: 'unruhe_schleife', type: 'schleife',
            label: 'Nach außen stark, nach innen in Aufruhr',
            need: 'kompetenz', belief: 'wachsamkeit', changeable: 'belief', transform: 'wachsamkeit',
            when: p => p.traits.stabilitaet <= 40 && belAct(p, 'wachsamkeit') >= 50,
            blockade: p => ((100 - p.traits.stabilitaet) + belAct(p, 'wachsamkeit')) / 2,
            origin: 'Du hältst nach außen die Fassung und darfst dir innerlich keine Schwäche erlauben.',
            cost:   'Weil du nie abschalten darfst, staut sich die Anspannung, die du eigentlich loswerden willst.',
            break:  'Erlaube dir bewusst einen unperfekten, ruhigen Moment und teile ihn niemandem als Leistung mit.',
            trigger: 'Du spürst innere Anspannung oder Erschöpfung.', // ENTWURF
            behavior: 'Du hältst nach außen die Fassade aufrecht und machst weiter wie immer.', // ENTWURF
            gain: 'Niemand bemerkt, dass es dir gerade schwerfällt.', // ENTWURF
        },
        {
            id: 'einfluss_vs_fremdbezogenheit', type: 'luecke',
            label: 'Gestalten wollen, aber niemanden enttäuschen dürfen',
            value: 'macht', belief: 'fremdbezogenheit', changeable: 'belief', transform: 'fremdbezogenheit',
            when: p => valScore(p, 'macht') >= 60 && belAct(p, 'fremdbezogenheit') >= 50,
            blockade: p => (belAct(p, 'fremdbezogenheit') + needFrust(p, 'autonomie')) / 2,
            origin: 'Du willst gestalten und Einfluss nehmen, hast aber gelernt, dass du dir Wert nur durch Gefallen verdienst.',
            cost:   'Aus Sorge, jemanden zu enttäuschen, hältst du dich zurück und überlässt anderen das Feld, das eigentlich deines wäre.',
            break:  'Sprich diese Woche einmal offen aus, was du gestalten willst, bevor du dich zurücknimmst.',
            trigger: 'Eine Entscheidung liegt bei dir, die andere betrifft.', // ENTWURF
            behavior: 'Du hältst deinen Vorschlag zurück oder fragst vorher alle um Erlaubnis.', // ENTWURF
            gain: 'Du vermeidest kurzfristig, jemanden vor den Kopf zu stoßen.', // ENTWURF
        },
        {
            id: 'klartext_vs_fremdbezogenheit', type: 'schleife',
            label: 'Klartext reden, danach kleiner werden',
            belief: 'fremdbezogenheit', changeable: 'behavior', transform: 'fremdbezogenheit',
            when: p => p.traits.vertraeglichkeit <= 40 && belAct(p, 'fremdbezogenheit') >= 50,
            blockade: p => belAct(p, 'fremdbezogenheit'),
            origin: 'Du sagst klar, was ist, und machst dich danach klein, damit niemand enttäuscht ist.',
            cost:   'Der klare Satz ist kaum draußen, da nimmst du ihn innerlich schon wieder zurück und entschuldigst dich dafür.',
            break:  'Lass deinen nächsten klaren Satz diese Woche einmal unentschuldigt stehen.',
            trigger: 'Du hast gerade deutlich gesagt, was du denkst.', // ENTWURF
            behavior: 'Du relativierst deine Aussage sofort wieder oder entschuldigst dich dafür.', // ENTWURF
            gain: 'Die Spannung danach fühlt sich kurz kleiner an.', // ENTWURF
        },
        {
            id: 'einfluss_vs_selbstzweifel', type: 'schleife',
            label: 'Einfluss wollen, aber auf Erlaubnis warten',
            value: 'macht', belief: 'autonomie', changeable: 'belief', transform: 'autonomie',
            when: p => valScore(p, 'macht') >= 60 && belAct(p, 'autonomie') >= 50,
            blockade: p => belAct(p, 'autonomie'),
            origin: 'Du willst Einfluss und Gestaltung, trägst aber die alte Überzeugung, dass du allein nicht genügst.',
            cost:   'Du wartest auf eine Erlaubnis, die nie laut genug kommt, und lässt Gelegenheiten für Einfluss ungenutzt.',
            break:  'Triff diese Woche eine gestaltende Entscheidung, ohne dir vorher Rückversicherung zu holen.',
            trigger: 'Eine Gelegenheit zu gestalten oder zu entscheiden taucht auf.', // ENTWURF
            behavior: 'Du wartest auf ein Signal oder eine Erlaubnis, bevor du handelst.', // ENTWURF
            gain: 'Du vermeidest kurzfristig das Risiko, falsch zu liegen.', // ENTWURF
        },
        {
            id: 'naehe_vs_staerke', type: 'schleife',
            label: 'Nähe wollen, aber keine Schwäche zeigen dürfen',
            need: 'verbundenheit', belief: 'wachsamkeit', changeable: 'belief', transform: 'wachsamkeit',
            when: p => needFrust(p, 'verbundenheit') >= 55 && belAct(p, 'wachsamkeit') >= 50,
            blockade: p => (needFrust(p, 'verbundenheit') + belAct(p, 'wachsamkeit')) / 2,
            origin: 'Du sehnst dich nach Nähe, hast aber gelernt, dass du dafür stark und ohne Makel sein musst.',
            cost:   'Weil du keine Schwäche zeigen darfst, bleibt die Nähe oberflächlich, genau da, wo echte Verbindung entstehen könnte.',
            break:  'Zeige einer vertrauten Person diese Woche einmal, womit du gerade wirklich kämpfst.',
            trigger: 'Ein Gespräch könnte zeigen, dass dich etwas belastet.', // ENTWURF
            behavior: 'Du lenkst ab oder zeigst dich stärker, als dir gerade zumute ist.', // ENTWURF
            gain: 'Du bleibst kurzfristig unangreifbar und kontrolliert.', // ENTWURF
        },
        {
            // Abdeckungs-Check (Prompt 5) zeigte: grenzen war bei ueber 50% der Profile
            // die staerkste Praegung, erzeugte aber keine Reibung, weil ziel_vs_vermeidung
            // zusaetzlich leistung >= 55 verlangt. Diese Reibung greift schon bei der
            // Praegung allein, analog zu den Nachbesserungen aus Prompt 1.
            id: 'komfort_vs_grenzen', type: 'schleife',
            label: 'Vorankommen wollen, aber dem Unbequemen ausweichen',
            belief: 'grenzen', changeable: 'behavior', transform: 'grenzen',
            when: p => belAct(p, 'grenzen') >= 50,
            blockade: p => belAct(p, 'grenzen'),
            origin: 'Du willst eigentlich vorankommen, und ein Reflex lässt dich vor Unbequemem und Frust lieber ausweichen.', // ENTWURF
            cost:   'Das Ausweichen verschafft kurz Erleichterung und hält dich langfristig von dem ab, was dir eigentlich wichtig wäre.', // ENTWURF
            break:  'Halte heute einmal bewusst eine unbequeme Sache zu Ende aus, statt ihr auszuweichen.', // ENTWURF
            trigger: 'Eine Aufgabe wird anstrengend oder unbequem.', // ENTWURF
            behavior: 'Du wendest dich ab oder schiebst sie auf, sobald es unangenehm wird.', // ENTWURF
            gain: 'Die Anstrengung verschwindet kurzfristig, und du fühlst dich erleichtert.', // ENTWURF
        },
        {
            // Gleiche Luecke bei autonomie: kompetenz_vs_selbstzweifel und
            // einfluss_vs_selbstzweifel verlangen zusaetzlich hohe Kompetenz-Frustration
            // oder hohen Einfluss-Wert. Diese Reibung greift schon beim Glaubenssatz allein.
            id: 'rueckhalt_vs_autonomiebelief', type: 'schleife',
            label: 'Weitermachen wollen, aber sich allein nicht genug zutrauen',
            belief: 'autonomie', changeable: 'belief', transform: 'autonomie',
            when: p => belAct(p, 'autonomie') >= 50,
            blockade: p => belAct(p, 'autonomie'),
            origin: 'Weitermachen willst du eigentlich einfach, und ein alter Satz sagt dir dabei immer wieder, dass du allein nicht genügst.', // ENTWURF
            cost:   'Der Zweifel bremst dich genau in den Momenten, in denen du dir eigentlich vertrauen könntest.', // ENTWURF
            break:  'Bring heute eine kleine Sache bewusst allein zu Ende, ohne dir vorher Rückversicherung zu holen.', // ENTWURF
            trigger: 'Eine Aufgabe liegt allein bei dir.', // ENTWURF
            behavior: 'Du zögerst oder holst dir Rückversicherung, bevor du weitermachst.', // ENTWURF
            gain: 'Der Zweifel wird kurz leiser, du fühlst dich abgesichert.', // ENTWURF
        },
        {
            // Abdeckungs-Check zeigte dieselbe Luecke bei abgetrenntheit:
            // verbundenheit_vs_abgetrenntheit und nicht_bedeutsam verlangen zusaetzlich
            // hohe Verbundenheit-Frustration oder niedrige Bedeutsamkeit.
            id: 'zeigen_vs_abgetrenntheit', type: 'schleife',
            label: 'Sich zeigen wollen, aber lieber auf Abstand bleiben',
            belief: 'abgetrenntheit', changeable: 'belief', transform: 'abgetrenntheit',
            when: p => belAct(p, 'abgetrenntheit') >= 50,
            blockade: p => belAct(p, 'abgetrenntheit'),
            origin: 'Du würdest dich gern zeigen, und ein alter Satz warnt dich davor, dass genau das dich verletzlich macht.', // ENTWURF
            cost:   'Der Schutzabstand hält dich sicher und gleichzeitig auf Distanz zu dem, was du dir insgeheim wünschst.', // ENTWURF
            break:  'Zeige einer vertrauten Person heute eine kleine, echte Verletzlichkeit.', // ENTWURF
            trigger: 'Eine Situation lädt dazu ein, dich wirklich zu zeigen.', // ENTWURF
            behavior: 'Du hältst einen Teil von dir zurück oder machst eine Bemerkung, die Nähe abwehrt.', // ENTWURF
            gain: 'Der Rückzug lässt dich kurzfristig sicherer und unverletzlich fühlen.', // ENTWURF
        },
        {
            // Abdeckungs-Check zeigte die Luecke auch bei fremdbezogenheit: alle fuenf
            // bestehenden Reibungen verlangen zusaetzlich einen hohen Wert, ein
            // frustriertes Beduerfnis oder einen Terrain-Ausschlag.
            id: 'anerkennung_vs_fremdbezogenheit', type: 'schleife',
            label: 'Eigene Wünsche äußern wollen, aber sich zurücknehmen',
            belief: 'fremdbezogenheit', changeable: 'belief', transform: 'fremdbezogenheit',
            when: p => belAct(p, 'fremdbezogenheit') >= 50,
            blockade: p => belAct(p, 'fremdbezogenheit'),
            origin: 'Eigene Wünsche hast du natürlich auch, und ein alter Satz sagt dir, dass du dir Wert erst durch Geben verdienst.', // ENTWURF
            cost:   'Du stellst die eigenen Wünsche so oft zurück, dass du selbst irgendwann nicht mehr genau weißt, was du eigentlich willst.', // ENTWURF
            break:  'Sprich heute einen eigenen Wunsch laut aus, bevor du fragst, was die anderen brauchen.', // ENTWURF
            trigger: 'Du merkst einen eigenen Wunsch, während jemand anderes etwas von dir braucht.', // ENTWURF
            behavior: 'Du schiebst den eigenen Wunsch beiseite und kümmerst dich zuerst um den anderen.', // ENTWURF
            gain: 'Das Kümmern fühlt sich kurzfristig gebraucht und richtig an.', // ENTWURF
        },
        {
            // Gleiche Luecke bei wachsamkeit: alle bestehenden Reibungen verlangen
            // zusaetzlich einen hohen Wert, ein frustriertes Beduerfnis oder einen
            // Terrain-Ausschlag.
            id: 'ruhe_vs_wachsamkeit', type: 'schleife',
            label: 'Zur Ruhe kommen wollen, aber wachsam bleiben müssen',
            belief: 'wachsamkeit', changeable: 'belief', transform: 'wachsamkeit',
            when: p => belAct(p, 'wachsamkeit') >= 50,
            blockade: p => belAct(p, 'wachsamkeit'),
            origin: 'Am liebsten würdest du einfach abschalten, und ein strenger innerer Maßstab lässt kaum eine ruhige Minute zu.', // ENTWURF
            cost:   'Die ständige Wachsamkeit kostet Kraft, die dir an anderer Stelle fehlt, auch wenn gerade nichts Konkretes ansteht.', // ENTWURF
            break:  'Leg dir heute bewusst zehn Minuten ohne Aufgabe ein und bleib dabei, auch wenn es sich falsch anfühlt.', // ENTWURF
            trigger: 'Ein Moment ohne Aufgabe oder Ablenkung entsteht.', // ENTWURF
            behavior: 'Du suchst dir sofort etwas zu tun oder zu optimieren, statt die Ruhe auszuhalten.', // ENTWURF
            gain: 'Die Unruhe, nichts zu leisten, verschwindet kurzfristig.', // ENTWURF
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
            // Reibungen ohne Prägung teilen ihre Ursache mit niemandem, daher Z mindestens 0.6
            // statt pauschal 0.5, sonst landen sie systematisch unten im Hebel.
            const Z = f.belief ? domainCounts[f.belief] / maxShare : Math.max(0.6, 1 / maxShare);
            const Vv = V_WEIGHT[f.changeable] || 0.5;
            // Vorsicht: dampen belief-heavy, clinically sensitive frictions when distress stacks.
            const heavy = f.belief === 'abgetrenntheit' || f.belief === 'autonomie';
            const vorsicht = severity * (heavy ? 0.2 : 0.08);
            const leverage = Math.max(0, Math.round((W * B * Z * Vv - vorsicht) * 100));
            // thought: for belief-based frictions it's the belief sentence itself (§7/§8);
            // frictions without a belief carry their own authored thought.
            const thought = f.thought || (f.belief ? ContentV2.SCHEMA_BELIEFS[f.belief].text : '');
            return {
                id: f.id, type: f.type, label: f.label,
                value: f.value || null, need: f.need || null, belief: f.belief || null,
                transform: f.transform || f.belief || null,
                changeable: f.changeable,
                origin: f.origin, cost: f.cost, break: f.break,
                trigger: f.trigger, thought, behavior: f.behavior, gain: f.gain,
                leverage,
                components: { W: +W.toFixed(2), B: +B.toFixed(2), Z: +Z.toFixed(2), V: Vv, vorsicht: +vorsicht.toFixed(2) },
            };
        }).sort((a, b) => b.leverage - a.leverage);

        // Hebel als Band statt roher Zahl: oberstes Drittel nach Rang oder leverage >= 35 -> hoch,
        // unterstes Drittel -> niedrig, Rest -> mittel.
        const total = scored.length;
        const thirds = Math.max(1, Math.ceil(total / 3));
        scored.forEach((f, rank) => {
            if (rank < thirds || f.leverage >= 35) f.leverageBand = 'hoch';
            else if (rank >= total - thirds) f.leverageBand = 'niedrig';
            else f.leverageBand = 'mittel';
        });

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
     * Build the 5-step transformation path for the profile's focus (belief-based or not):
     * finden → formulieren → widerlegen (WOOP) → verankern → wiederholen.
     * Returns null when there is no active focus at all (balanced profile).
     */
    function buildTransformation(profile) {
        const focus = profile.focus;
        const key = focus && focus.transform;
        const t = key && ContentV2.TRANSFORM[key];
        if (!t) return null;

        const domain = focus.belief;
        const belief = domain ? ContentV2.SCHEMA_BELIEFS[domain] : null;
        const topValue = profile.values[0];

        return {
            belief:    belief ? belief.text : null,
            domain,
            steps: [
                {
                    key: 'finden', n: 1, title: 'Finden',
                    lead: belief ? 'Der Glaubenssatz hinter deinem Fokus:' : 'Was hinter deinem Fokus steckt:',
                    beliefText: belief ? belief.text : null,
                    origin: belief ? belief.origin : focus.origin,
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
