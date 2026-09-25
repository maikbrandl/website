/**
 * HUMAN MAP v2 — Kinematisches Sinnbild · Texte (§8)
 * Alle sichtbaren Texte der Szene an EINEM Ort: Kapitel-Captions (kurz, poetisch)
 * und die ausführlichen Analyse-Texte (der "AHA", in Du-Form), die per Klick öffnen.
 *
 * Personalisierte Fragmente werden von applyProfile.js eingesetzt (Platzhalter unten).
 * Reine Präsentationsschicht — kein State, keine Logik.
 */
const SceneContent = (() => {

    // ── Die sieben Kapitel der Reise (§4) ────────────────────────────
    const CHAPTERS = [
        {
            id: 'ankunft',
            eyebrow: 'Das Sinnbild',
            title: 'So bist du gebaut.',
            caption: 'Kein Typ, kein Etikett. Ein Mensch, aus Licht, Gewohnheit und Richtung.',
        },
        {
            id: 'persoenlichkeit',
            eyebrow: 'Terrain',
            title: 'Dein Grundgelände.',
            caption: 'Im Kopf pulsiert, wie du grundsätzlich tickst, stabil, über Jahre gewachsen.',
            block: 'terrain',
        },
        {
            id: 'glaubenssaetze',
            eyebrow: 'Prägung',
            title: 'Die Maske, die du trägst.',
            caption: 'In der gesenkten Hand ein alter Satz über dich. Dahinter schimmert dein echtes Gesicht.',
            block: 'praegung',
        },
        {
            id: 'werte',
            eyebrow: 'Antrieb',
            title: 'Deine Richtungen.',
            caption: 'Der Weg gabelt sich. Schilder zeigen, wohin es dich wirklich zieht.',
            block: 'werte',
        },
        {
            id: 'sinn',
            eyebrow: 'Sinn',
            title: 'Dein Kompass.',
            caption: 'Ein Strahl fällt auf genau einen Pfad, den, an dem sich Bewegung gerade am meisten lohnt.',
            block: 'sinn',
        },
        {
            id: 'beduerfnisse',
            eyebrow: 'Bedürfnisse',
            title: 'Was dir Kraft gibt.',
            caption: 'Entlang der Wege leuchten drei Lichter. Manche hell und ruhig, manche matt und flackernd.',
            block: 'beduerfnisse',
        },
        {
            id: 'veraenderung',
            eyebrow: 'Bewegung',
            title: 'Der Weg ist die Veränderung.',
            caption: 'Du stehst nicht still. Jeder Schritt verschiebt die Landschaft, messbar, mit der Zeit.',
            block: 'bewegung',
        },
    ];

    // ── Ausführliche Analysen je Baustein (Klick/Enter öffnet) ───────
    // {TOKENS} werden von applyProfile ersetzt.
    const ANALYSIS = {
        terrain: {
            label: 'Persönlichkeit · Big Five',
            title: 'Dein Terrain',
            body: 'Das leuchtende Gehirn steht für deine Persönlichkeit, die fünf großen Dimensionen, '
                + 'auf denen jeder Mensch irgendwo liegt. Sie sind über die Lebensspanne relativ stabil: '
                + 'nicht dein Schicksal, aber dein Ausgangsgelände. Alles andere, deine Werte, deine '
                + 'Bedürfnisse, dein Sinn, spielt sich auf diesem Grund ab.',
            readout: '{TRAITS}',
            note: 'Grundlage: Big-Five-Modell (Mini-IPIP). Ausprägungen auf einem Spektrum, keine Schubladen.',
        },
        praegung: {
            label: 'Glaubenssätze · Prägung',
            title: 'Die Maske',
            body: 'Die Maske trägt einen Satz, den du früh über dich gelernt hast, nicht als Wahrheit, '
                + 'sondern als Schutz. Je stärker er gerade aktiv ist, desto dichter liegt die Maske auf '
                + 'deinem Gesicht. Das Gute: Es ist eine Maske, kein Gesicht. Du kannst sie ablegen, '
                + 'dahinter bist immer du.',
            readout: '{BELIEF}',
            note: 'In Anlehnung an die Schematheorie (Young). Kein klinisches Urteil, sondern ein Muster, das mitläuft.',
        },
        werte: {
            label: 'Werte · Antrieb',
            title: 'Deine Richtungen',
            body: 'An der Weggabelung stehen Schilder, deine wichtigsten Werte, in ihrer Reihenfolge. '
                + 'Sie sind kein Soll, sondern ein Ist: das, wonach du dich tatsächlich ausrichtest. '
                + 'Wenn dein Alltag und deine obersten Schilder in verschiedene Richtungen zeigen, '
                + 'entsteht Reibung, genau dort lohnt sich das Hinschauen.',
            readout: '{VALUES}',
            note: 'Grundlage: Schwartz’ Theorie der Grundwerte.',
        },
        sinn: {
            label: 'Sinn · Kompass',
            title: 'Dein Kompass',
            body: 'Der Kompass steht für Sinn, aus drei Teilen: ob dein Leben sich stimmig anfühlt '
                + '(Kohärenz), ob du eine Richtung hast (Purpose) und ob dein Tun für andere zählt '
                + '(Bedeutsamkeit). Der Lichtstrahl fällt auf den einen Pfad, an dem eine kleine '
                + 'Veränderung gerade am meisten bewegt.',
            readout: '{MEANING}',
            note: 'Grundlage: Drei-Komponenten-Modell des Sinns (Martela & Steger).',
        },
        beduerfnisse: {
            label: 'Bedürfnisse · Selbstbestimmung',
            title: 'Was dir Kraft gibt',
            body: 'Drei Lichter säumen die Wege, deine psychologischen Grundbedürfnisse. Der Schlüssel '
                + 'steht für Autonomie (frei entscheiden), die Flamme für Kompetenz (etwas gut können), '
                + 'die Ringe für Verbundenheit (dazugehören). Leuchtet ein Licht hell und ruhig, ist das '
                + 'Bedürfnis genährt. Flackert es matt, fehlt dir dort gerade etwas.',
            readout: '{NEEDS}',
            note: 'Grundlage: Selbstbestimmungstheorie (Deci & Ryan).',
        },
        bewegung: {
            label: 'Veränderung · Bewegung',
            title: 'Der Weg ist die Veränderung',
            body: 'Die Figur geht. Veränderung ist kein Zustand, den man erreicht, sondern eine Bewegung, '
                + 'die man macht, ein konkreter, machbarer Schritt nach dem anderen. Die Fußspuren hinter '
                + 'dir zeigen, was du schon gegangen bist. Wenn du wiederkommst und neu misst, siehst du '
                + 'die Landschaft sich verschieben.',
            readout: '{HISTORY}',
            note: 'Grundlage: Zielverwirklichung nach WOOP (Oettingen), Wunsch, Ergebnis, Hindernis, Plan.',
        },
    };

    const UI = {
        scrollHint: 'Scrolle, um zu beginnen',
        openDetail: 'Mehr dazu',
        closeDetail: 'Schließen',
        soundOn: 'Ton an',
        soundOff: 'Ton aus',
        replay: 'Reise wiederholen',
        reducedNote: 'Bewegung ist reduziert, du siehst die vollständige, ruhige Komposition.',
        posterNote: 'Deine Grafikeinstellungen zeigen die Standbild-Version dieser Szene.',
        cta: 'Zu deinem vollständigen Profil',
    };

    return { CHAPTERS, ANALYSIS, UI };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = { SceneContent };
