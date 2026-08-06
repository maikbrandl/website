/**
 * HUMAN MAP – Content Snippets
 * Editable copy for the life-area insights (Kernspannung, Brief, Bereichs-Karten,
 * Experiment). No logic here — selection happens in insights.js.
 */

const Content = (() => {

    // Du-Form, ein Satz pro Richtung, immer an einen Score gekoppelt.
    const DIM_TEXT = {
        offenheit:        { high: 'Du ziehst Neues magisch an. Ideen, Perspektiven und Wege reizen dich mehr als Sicherheit.',
                             low:  'Du vertraust auf Bewährtes; Veränderung muss sich erst beweisen, bevor du sie zulässt.' },
        struktur:         { high: 'Du bringst Ordnung ins Chaos. Pläne, Systeme und klare Abläufe geben dir Kraft.',
                             low:  'Struktur ist nicht dein Anker; du arbeitest lieber flexibel und entscheidest aus dem Moment.' },
        energie:          { high: 'Menschen laden dich auf. Du blühst im Austausch und in Gesellschaft.',
                             low:  'Du tankst allein auf; zu viel Kontakt zehrt an dir, auch wenn du ihn magst.' },
        verbindung:       { high: 'Du gehst in Beziehungen in die Tiefe. Echte Nähe ist dir wichtiger als viele Kontakte.',
                             low:  'Nähe kostet dich Kraft; du hältst emotionale Distanz, auch wo du sie gar nicht willst.' },
        tiefe:            { high: 'Du denkst gründlich zu Ende, wo andere an der Oberfläche bleiben. Komplexität schreckt dich nicht.',
                             low:  'Du entscheidest schnell und pragmatisch, statt lange in die Tiefe zu bohren.' },
        werte_freiheit:   { high: 'Autonomie ist dein höchstes Gut. Du willst selbst bestimmen, wohin es geht.',
                             low:  'Verbindlichkeit und Zugehörigkeit wiegen für dich schwerer als grenzenlose Freiheit.' },
        werte_leistung:   { high: 'Du willst etwas erreichen. Ziele, Fortschritt und Wirkung treiben dich an.',
                             low:  'Nicht Leistung definiert dich; Sinn und Wohlbefinden wiegen für dich schwerer als Erfolg.' },
        werte_innovation: { high: 'Du willst Dinge neu und besser machen, statt sie nur zu verwalten.',
                             low:  'Du schätzt Beständigkeit; du verbesserst lieber im Kleinen, als alles umzuwerfen.' },
        loc_internal:     { high: 'Du glaubst, dass du dein Leben in der Hand hast, und handelst danach.',
                             low:  'Du zweifelst manchmal, ob Ergebnisse wirklich an dir liegen. Das bremst deinen Mut.' },
        rumination:       { high: 'Du drehst Gedanken lange. Das macht dich gründlich, aber auch schnell erschöpft.',
                             low:  'Du lässt Gedanken ziehen, statt sie endlos zu wälzen. Das hält dich handlungsfähig.' },
        mindset_growth:   { high: 'Du siehst Fähigkeiten als formbar. Rückschläge sind für dich Daten, kein Urteil.',
                             low:  'Du neigst dazu, Können als angeboren zu sehen. Das macht Fehler schwerer erträglich.' },
        grit_passion:     { high: 'Du brennst für deine Ziele. Begeisterung trägt dich weit.',
                             low:  'Deine Interessen wechseln; dauerhaft an einer Sache zu bleiben fällt dir schwer.' },
        grit_ausdauer:    { high: 'Du bleibst dran, auch wenn es zäh wird. Aufgeben ist selten eine Option.',
                             low:  'Wenn die erste Begeisterung verfliegt, fällt dir das Durchhalten schwer.' },
    };

    // Ein konkreter, umsetzbarer Tipp pro Dimension – immer für die Richtung,
    // die in ihrem Lebensbereich als "Herausforderung" auftauchen kann
    // (bei allen Dims außer rumination ist das die niedrige Ausprägung, siehe lifeareas.js "invert").
    const DIM_TIPS = {
        offenheit:        'Probiere diese Woche bewusst eine ungewohnte Methode oder Meinung aus, bevor du sie bewertest, nicht um sie zu übernehmen, sondern um sie kennenzulernen.',
        struktur:         'Plane morgen genau einen festen Termin mit dir selbst ein und halt ihn ein, so als wäre es eine Verabredung mit jemand anderem.',
        verbindung:       'Teile diese Woche mit einer Person einen Gedanken oder ein Gefühl, das du normalerweise für dich behältst.',
        energie:          'Plane bewusst eine Erholungspause nach dem nächsten sozialen Termin ein, statt dich schlecht zu fühlen, dass du sie brauchst.',
        tiefe:            'Leg bei der nächsten wichtigen Entscheidung eine Nacht Pause ein, bevor du sie triffst, und frag einmal öfter "warum".',
        werte_leistung:   'Setz dir für diese Woche genau ein messbares Ziel mit Deadline und feiere es bewusst, wenn du es erreichst.',
        werte_innovation: 'Wähle einen eingefahrenen Ablauf und ändere bewusst einen einzigen Schritt daran, nur um zu sehen, was passiert.',
        loc_internal:     'Schreib nach jedem Ergebnis dieser Woche einen Satz auf, was du selbst konkret dazu beigetragen hast, unabhängig vom Ausgang.',
        rumination:       'Setz dir ein festes 10-Minuten-Fenster am Tag zum Grübeln. Taucht ein Gedanke außerhalb davon auf, schreib ihn nur auf für später.',
        mindset_growth:   'Erinnere dich beim nächsten Rückschlag bewusst an eine Fähigkeit, die du dir mühsam erarbeitet hast, statt sie als Talent zu sehen.',
        grit_passion:     'Frag dich diese Woche ehrlich, welches deiner aktuellen Projekte dich wirklich noch reizt, und leg eines bewusst ab statt es halbherzig weiterzuführen.',
        grit_ausdauer:    'Bevor du das nächste Mal aufgibst: verpflichte dich zu genau noch einem Versuch, nicht mehr.',
    };

    // Kurzer Halbsatz je kategorialem Wert (interne Keys, siehe model.js).
    const CAT_TEXT = {
        bindungsstil: {
            sicher:         'In Nähe fühlst du dich grundsätzlich sicher. Das ist ein seltenes Fundament.',
            aengstlich:     'In Nähe neigst du dazu, Bestätigung zu suchen und Distanz zu fürchten.',
            vermeidend:     'In Nähe hältst du früh Abstand, sobald es eng wird.',
            desorganisiert: 'Nähe zieht dich an und schreckt dich zugleich: ein ständiges Vor und Zurück.',
        },
        stress_typ: {
            fight:  'Unter Druck gehst du in Konfrontation statt in Deckung.',
            flight: 'Unter Druck weichst du aus, statt das Problem direkt anzugehen.',
            freeze: 'Unter Druck blockierst du erstmal, bevor du wieder handlungsfähig wirst.',
            fawn:   'Unter Druck stellst du andere zufrieden, um Konflikt zu vermeiden.',
        },
        antrieb_type: {
            achievement: 'Du konkurrierst vor allem gegen dich selbst. Bestleistung ist dein Antrieb.',
            affiliation: 'Zugehörigkeit und Harmonie treiben dich mehr an als Status oder Ergebnis.',
            power:       'Einfluss und Wirkung zu haben ist für dich wichtiger als Harmonie.',
        },
        intel_primary: {
            analytisch: 'Du löst Probleme durch systematisches, analytisches Denken.',
            sozial:     'Du verstehst Menschen intuitiv. Das ist deine stärkste Intelligenzform.',
            kreativ:    'Du denkst quer und verbindest Unerwartetes zu originellen Lösungen.',
        },
        wachstumsfeld: {
            selbstkenntnis: 'Dein nächster Entwicklungsschritt: dich selbst noch klarer verstehen.',
            fuehrung:       'Dein nächster Entwicklungsschritt: andere befähigen statt alles selbst zu tun.',
            aufbau:         'Dein nächster Entwicklungsschritt: etwas Bleibendes bauen statt nur mitzulaufen.',
            verbindung:     'Dein nächster Entwicklungsschritt: tiefere, ehrlichere Verbindungen zulassen.',
        },
    };

    // Genau ein 7-Tage-Mikro-Experiment pro Lebensbereich (nie fünf auf einmal).
    const EXPERIMENTS = {
        denken:      'Nimm dir diese Woche ein Thema, das dich überfordert, und geh eine Ebene tiefer als sonst: ein Artikel, ein Gespräch, eine Frage mehr.',
        antrieb:     'Wähle ein Ziel und zerlege es in den kleinstmöglichen ersten Schritt. Mach nur diesen, heute noch.',
        beziehungen: 'Sag diese Woche einer Person einen ehrlichen, persönlichen Satz mehr, als dir angenehm ist. Einmal reicht.',
        balance:     'Schreib deine drei häufigsten Grübel-Gedanken auf und gönn dir täglich ein 10-Minuten-Fenster zum Grübeln, den Rest des Tages nicht.',
        wachstum:    'Such dir eine Sache, die du zuletzt abgebrochen hast, und mach genau eine Einheit davon, ohne Anspruch, sie zu Ende zu bringen.',
    };

    return { DIM_TEXT, DIM_TIPS, CAT_TEXT, EXPERIMENTS };
})();
