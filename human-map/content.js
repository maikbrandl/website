/**
 * HUMAN MAP v2 – Content
 * All human-facing German copy, separated from logic so it can be edited freely.
 * Everything is deterministic lookup material — no randomness, no runtime AI.
 */

const ContentV2 = (() => {

    // ── Trait descriptors for the synthesis sentence & Terrain panel ──
    // Short clause fragments (lowercase, sentence-embeddable) for high / low poles,
    // plus a one-line plain-language reading for the panel.
    const TRAIT_TEXT = {
        offenheit: {
            high: 'neugierig und offen für Neues',
            low:  'bodenständig und auf Bewährtes bedacht',
            readHigh: 'Du suchst Ideen, Abwechslung und neue Perspektiven.',
            readLow:  'Du vertraust dem Konkreten und Erprobten mehr als dem Experiment.',
        },
        gewissenhaftigkeit: {
            high: 'strukturiert und verlässlich',
            low:  'spontan und flexibel',
            readHigh: 'Du planst, ordnest und ziehst Dinge zuverlässig durch.',
            readLow:  'Du hältst dich offen und entscheidest lieber im Moment.',
        },
        extraversion: {
            high: 'zugewandt und energiegeladen unter Menschen',
            low:  'ruhig und nach innen gerichtet',
            readHigh: 'Kontakt und Austausch geben dir Energie.',
            readLow:  'Du lädst dich eher in Ruhe und im Kleinen auf.',
        },
        vertraeglichkeit: {
            high: 'warmherzig und mitfühlend',
            low:  'direkt und sachlich',
            readHigh: 'Du spürst andere und suchst Harmonie.',
            readLow:  'Du sagst, was ist, auch wenn es aneckt.',
        },
        stabilitaet: {
            high: 'innerlich ruhig und belastbar',
            low:  'feinfühlig und leicht erregbar',
            readHigh: 'Du bleibst auch unter Druck relativ gelassen.',
            readLow:  'Du nimmst viel wahr und gerätst schneller in Aufruhr.',
        },
    };

    // ── Value plain-language lines (Antrieb panel) ────────────────────
    const VALUE_TEXT = {
        selbstbestimmung: 'frei und selbstbestimmt zu entscheiden',
        stimulation:      'Abwechslung und Aufregung zu erleben',
        hedonismus:       'das Leben zu genießen',
        leistung:         'etwas zu leisten und erfolgreich zu sein',
        macht:            'Einfluss zu haben und zu gestalten',
        sicherheit:       'Sicherheit und Stabilität zu haben',
        konformitaet:     'dich einzufügen und nicht anzuecken',
        tradition:        'Bewährtes zu bewahren',
        benevolenz:       'für nahe Menschen da zu sein',
        universalismus:   'dich für Gerechtigkeit einzusetzen',
    };

    // ── Need lines (Bedürfnisse panel) ───────────────────────────────
    const NEED_TEXT = {
        autonomie: {
            label: 'Autonomie',
            satHigh:  'Du entscheidest weitgehend selbst, wie du lebst.',
            satLow:   'Du fühlst dich oft fremdbestimmt.',
            frust:    'Etwas oder jemand drängt dich in eine Richtung, die nicht deine ist.',
        },
        kompetenz: {
            label: 'Kompetenz',
            satHigh:  'Du erlebst dich als fähig und wirksam.',
            satLow:   'Du zweifelst häufig an deinem Können.',
            frust:    'Du kämpfst mit dem Gefühl, nicht gut genug zu sein.',
        },
        verbundenheit: {
            label: 'Verbundenheit',
            satHigh:  'Du fühlst dich anderen nah und getragen.',
            satLow:   'Echte Nähe fehlt dir gerade.',
            frust:    'Trotz Menschen um dich herum bleibst du innerlich allein.',
        },
    };

    // ── Meaning component lines (Sinn panel) ─────────────────────────
    const MEANING_TEXT = {
        kohaerenz:     { label: 'Kohärenz',     read: 'Ob dein Leben für dich einen roten Faden ergibt.' },
        purpose:       { label: 'Purpose',      read: 'Ob du Ziele und eine Richtung spürst.' },
        bedeutsamkeit: { label: 'Bedeutsamkeit', read: 'Ob dein Tun für andere einen Unterschied macht.' },
    };

    // ── Schema domain -> core belief (Prägung panel & transformation) ─
    // `origin` = reconciling origin sentence; `cost` = what it costs today;
    // `break` = the single break-point / disconfirming lever (§7/§8).
    const SCHEMA_BELIEFS = {
        abgetrenntheit: {
            text:   'Wenn ich mich wirklich zeige, werde ich verlassen oder abgelehnt.',
            origin: 'Früh hast du gelernt, dass Nähe unsicher ist — also hältst du einen Teil von dir zurück.',
            cost:   'Genau der Schutz, der dich sicher hält, hält auch die Nähe draußen, die du dir wünschst.',
            break:  'Zeige einer vertrauten Person eine echte, kleine Verletzlichkeit und beobachte, was wirklich passiert.',
        },
        autonomie: {
            text:   'Allein schaffe ich es nicht — ich bin nicht genug.',
            origin: 'Irgendwann wurde dir vermittelt, dass du dich nicht auf dich selbst verlassen kannst.',
            cost:   'Du wartest auf Erlaubnis oder Rückversicherung und übersiehst, wie viel du längst allein trägst.',
            break:  'Triff diese Woche eine kleine Sache bewusst allein zu Ende, ohne dir Bestätigung zu holen.',
        },
        grenzen: {
            text:   'Regeln gelten für mich nicht ganz, und Unbequemes muss ich nicht aushalten.',
            origin: 'Dir wurde selten zugemutet, Frust zu ertragen — also weicht ein Teil von dir ihm bis heute aus.',
            cost:   'Das Vermeiden verschafft kurz Erleichterung und kostet dich langfristig Ziele, die dir wichtig sind.',
            break:  'Halte einmal bewusst eine unbequeme Aufgabe zu Ende aus, statt ihr auszuweichen.',
        },
        fremdbezogenheit: {
            text:   'Ich bin nur wertvoll, wenn ich gebe und niemanden enttäusche.',
            origin: 'Anerkennung gab es für dich vor allem fürs Funktionieren, selten fürs bloße Dasein.',
            cost:   'Du sorgst für alle und verlierst dabei die Verbindung zu dem, was du selbst brauchst.',
            break:  'Sage einmal freundlich Nein zu etwas, das du sonst aus Pflichtgefühl übernommen hättest.',
        },
        wachsamkeit: {
            text:   'Ich darf keine Schwäche zeigen und muss perfekt sein.',
            origin: 'Stärke und Leistung waren dein sicherer Boden — Schwäche fühlte sich riskant an.',
            cost:   'Die Rüstung schützt dich und lässt dich zugleich nie ganz ankommen oder ausruhen.',
            break:  'Lass einmal bewusst etwas „nur gut genug“ und spüre, dass nichts Schlimmes passiert.',
        },
    };

    // ── Transformation path per belief domain (§8) ──────────────────
    // Material for the 5-step change process. Counter-beliefs are deliberately
    // small & credible (grandiose affirmations can backfire — Wood et al. 2009).
    const TRANSFORM = {
        fremdbezogenheit: {
            find: [
                'Was befürchtest du, passiert, wenn du jemanden enttäuschst?',
                'Und was würde das über dich als Mensch bedeuten?',
            ],
            counter: 'Ich darf für mich sorgen und bleibe trotzdem wertvoll.',
            wish:    'Diese Woche einmal freundlich Nein sagen, wenn ich eigentlich Nein meine.',
            outcome: 'Ein Gefühl von Erleichterung und Selbstachtung statt stillem Groll.',
            obstacle:'Die Angst, jemanden zu enttäuschen und dann abgelehnt zu werden.',
            plan:    'Wenn mich jemand um einen Gefallen bittet, den ich eigentlich nicht will, dann atme ich einmal durch und sage freundlich Nein.',
        },
        abgetrenntheit: {
            find: [
                'Wovor schützt du dich, wenn du Abstand hältst?',
                'Was müsste wahr sein, damit Nähe sich sicher anfühlt?',
            ],
            counter: 'Ich darf mich zeigen, und die richtigen Menschen bleiben.',
            wish:    'Einer vertrauten Person diese Woche etwas Echtes von mir zeigen.',
            outcome: 'Ein Moment echter Nähe, der zeigt, dass Offenheit tragen kann.',
            obstacle:'Der alte Reflex, mich zurückzuziehen, sobald es eng wird.',
            plan:    'Wenn ich merke, dass ich dichtmache, dann teile ich stattdessen einen ehrlichen Satz über mein Befinden.',
        },
        autonomie: {
            find: [
                'Woran misst du, ob du „genügst“?',
                'Wessen Stimme spricht da eigentlich in dir?',
            ],
            counter: 'Ich kann mich auf mich verlassen, auch wenn nicht alles perfekt läuft.',
            wish:    'Eine kleine Sache diese Woche allein zu Ende bringen, ohne Rückversicherung.',
            outcome: 'Der Beweis, dass ich mehr trage, als ich mir zutraue.',
            obstacle:'Der Drang, mir Bestätigung zu holen, bevor ich mir selbst glaube.',
            plan:    'Wenn ich nach Bestätigung greifen will, dann entscheide ich erst selbst und hole sie mir bewusst nicht.',
        },
        grenzen: {
            find: [
                'Was fühlst du kurz bevor du einer Sache ausweichst?',
                'Was kostet dich das Ausweichen langfristig?',
            ],
            counter: 'Ich kann Unbequemes aushalten, und es bringt mich meinen Zielen näher.',
            wish:    'Diese Woche eine unbequeme Aufgabe bewusst zu Ende bringen.',
            outcome: 'Der Stolz, drangeblieben zu sein, statt wieder auszuweichen.',
            obstacle:'Der Sog, im unbequemen Moment etwas Angenehmeres zu tun.',
            plan:    'Wenn ich einer Aufgabe ausweichen will, dann bleibe ich noch fünf Minuten dran.',
        },
        wachsamkeit: {
            find: [
                'Was befürchtest du, passiert, wenn du Schwäche zeigst?',
                'Wer hat dir beigebracht, dass du stark und perfekt sein musst?',
            ],
            counter: 'Ich darf unperfekt und menschlich sein und bin trotzdem in Ordnung.',
            wish:    'Diese Woche eine Sache bewusst „nur gut genug“ lassen.',
            outcome: 'Die Erfahrung, dass nichts Schlimmes passiert, wenn ich loslasse.',
            obstacle:'Die innere Stimme, die jeden Makel sofort abstraft.',
            plan:    'Wenn ich etwas perfektionieren will, dann lasse ich es bewusst gut genug und höre auf.',
        },
    };

    return { TRAIT_TEXT, VALUE_TEXT, NEED_TEXT, MEANING_TEXT, SCHEMA_BELIEFS, TRANSFORM };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { ContentV2 };
