/**
 * HUMAN MAP, Data Model
 * Single source of truth for questions, archetypes, synergies, and dimension meta.
 * All UI text is in German. All code/comments in English.
 */

const MODEL = (() => {

    // ── Dimension metadata ──────────────────────────────────────────
    const DIMS = {
        offenheit:           { label: 'Offenheit',            cluster: 'kern',     color: '#8b7cf8' },
        struktur:            { label: 'Struktur',             cluster: 'kern',     color: '#58d4a0' },
        energie:             { label: 'Soziale Energie',      cluster: 'kern',     color: '#f0a855' },
        verbindung:          { label: 'Verbindung',           cluster: 'kern',     color: '#f07090' },
        tiefe:               { label: 'Verarbeitungstiefe',   cluster: 'kern',     color: '#60a0e8' },

        werte_freiheit:      { label: 'Freiheitswert',        cluster: 'antrieb',  color: '#e8c860' },
        werte_leistung:      { label: 'Leistungswert',        cluster: 'antrieb',  color: '#e8b050' },
        werte_innovation:    { label: 'Innovationswert',      cluster: 'antrieb',  color: '#d878c8' },
        antrieb_type:        { label: 'Antriebstyp',          cluster: 'antrieb',  color: '#c89050', categorical: true },

        bindungsstil:        { label: 'Bindungsstil',         cluster: 'muster',   color: '#78b8e8', categorical: true },
        loc_internal:        { label: 'Selbstwirksamkeit',    cluster: 'muster',   color: '#88d878' },
        stress_typ:          { label: 'Stressmuster',         cluster: 'muster',   color: '#e87878', categorical: true },
        rumination:          { label: 'Grübeln',              cluster: 'muster',   color: '#a08888' },

        mindset_growth:      { label: 'Growth Mindset',       cluster: 'potenzial',color: '#a078f0' },
        grit_passion:        { label: 'Leidenschaft',         cluster: 'potenzial',color: '#60d8b8' },
        grit_ausdauer:       { label: 'Ausdauer',             cluster: 'potenzial',color: '#78c0f0' },
        intel_primary:       { label: 'Intelligenztyp',       cluster: 'potenzial',color: '#d0a8f0', categorical: true },
        wachstumsfeld:       { label: 'Wachstumsfeld',        cluster: 'potenzial',color: '#f0d878', categorical: true },
    };

    // ── Score-to-level helper ──────────────────────────────────────
    const LEVEL_LABELS = ['—', 'Anfang', 'Entwicklung', 'Aktiv', 'Stark', 'Meister'];

    // ── Questions ──────────────────────────────────────────────────
    const QUESTIONS = [
        // ─── PHASE 1: KERN ────────────────────────────────────────
        {
            id: 'q01', phase: 'kern', type: 'likert-7',
            text: 'Wenn du eine neue Idee hörst, wie neugierig wirst du automatisch?',
            anchors: ['Gar nicht interessiert', 'Extrem neugierig'],
            hint: 'Dein erster innerer Impuls zählt.',
            dims: [{ dim: 'offenheit', weight: 1 }],
        },
        {
            id: 'q02', phase: 'kern', type: 'likert-7',
            text: 'Wie leicht kannst du in unbekannten Situationen flexibel reagieren?',
            anchors: ['Sehr schwer', 'Völlig mühelos'],
            hint: 'Denke an reale Situationen aus den letzten Monaten.',
            dims: [{ dim: 'offenheit', weight: 0.8 }, { dim: 'struktur', weight: -0.3 }],
        },
        {
            id: 'q03', phase: 'kern', type: 'scenario-binary',
            text: 'Du hast 3 freie Stunden. Was zieht dich mehr an?',
            options: [
                { label: 'Frei erkunden', desc: 'Ohne Plan schauen was passiert, vielleicht ein neues Café, ein Random-Buch, eine spontane Idee.', value: 'A' },
                { label: 'Gezielt nutzen', desc: 'Eine konkrete Aufgabe abarbeiten oder ein klares Projekt voranbringen.', value: 'B' },
            ],
            dims: [
                { dim: 'offenheit',  valueMap: { A: 1, B: 0 }, weight: 0.7 },
                { dim: 'struktur',   valueMap: { A: 0, B: 1 }, weight: 0.7 },
            ],
        },
        {
            id: 'q04', phase: 'kern', type: 'likert-7',
            text: 'Wie sehr tendierst du dazu, Dinge zu planen, bevor du anfängst?',
            anchors: ['Nie, ich starte direkt', 'Immer, erst der Plan'],
            hint: 'Nicht wie du denkst, dass du sein solltest.',
            dims: [{ dim: 'struktur', weight: 1 }],
        },
        {
            id: 'q05', phase: 'kern', type: 'likert-7',
            text: 'Wie konsequent hältst du deine eigenen Systeme und Routinen ein?',
            anchors: ['Kaum', 'Fast immer'],
            hint: 'Routinen, die du dir selbst gesetzt hast.',
            dims: [{ dim: 'struktur', weight: 0.9 }],
        },
        {
            id: 'q06', phase: 'kern', type: 'likert-7',
            text: 'Nach einer langen Party oder einem intensiven Abend mit vielen Menschen, wie fühlst du dich?',
            anchors: ['Erschöpft, brauche Solo-Zeit', 'Aufgeladen, will mehr davon'],
            hint: 'Sei ehrlich mit deiner natürlichen Reaktion.',
            dims: [{ dim: 'energie', weight: 1 }],
        },
        {
            id: 'q07', phase: 'kern', type: 'scenario-binary',
            text: 'In einer Gruppe: Welche Rolle nimmst du spontan ein?',
            options: [
                { label: 'Antreiben', desc: 'Du bemerkst, dass die Gruppe Schwung braucht, du gibst Gas, schlägst vor, motivierst.', value: 'A' },
                { label: 'Vertiefen', desc: 'Du hörst erst zu, beobachtest und bringst dann eine tiefe, durchdachte Perspektive ein.', value: 'B' },
            ],
            dims: [
                { dim: 'energie', valueMap: { A: 1, B: 0 }, weight: 0.8 },
                { dim: 'tiefe',   valueMap: { A: 0, B: 1 }, weight: 0.8 },
            ],
        },
        {
            id: 'q08', phase: 'kern', type: 'likert-7',
            text: 'Wie wichtig ist dir eine tiefe Verbindung zu den Menschen um dich herum?',
            anchors: ['Nicht so wichtig', 'Extrem wichtig'],
            hint: 'Nicht Quantität, echte Tiefe.',
            dims: [{ dim: 'verbindung', weight: 1 }, { dim: 'tiefe', weight: 0.4 }],
        },
        {
            id: 'q09', phase: 'kern', type: 'likert-7',
            text: 'Wie oft nimmst du dir Zeit, Dinge wirklich tief zu durchdenken, nicht nur oberfächlich?',
            anchors: ['Selten', 'Fast täglich'],
            hint: 'Nicht weil du musst, weil du willst.',
            dims: [{ dim: 'tiefe', weight: 1 }],
        },
        {
            id: 'q10', phase: 'kern', type: 'scenario-4way',
            text: 'Welche Art zu lernen liegt dir am meisten?',
            options: [
                { label: 'Ausprobieren', desc: 'Einfach anfangen und durch Fehler lernen.', value: 'A' },
                { label: 'Konzepte verstehen', desc: 'Erst das "Warum" und den Zusammenhang begreifen.', value: 'B' },
                { label: 'Mit anderen', desc: 'Im Dialog, in der Gruppe, durch Austausch.', value: 'C' },
                { label: 'Strukturiert', desc: 'Schritt für Schritt, mit einem klaren System.', value: 'D' },
            ],
            dims: [
                { dim: 'offenheit',  valueMap: { A: 1, B: 0.6, C: 0.5, D: 0.2 }, weight: 0.6 },
                { dim: 'tiefe',      valueMap: { A: 0.3, B: 1, C: 0.5, D: 0.6 }, weight: 0.6 },
                { dim: 'verbindung', valueMap: { A: 0.3, B: 0.3, C: 1, D: 0.3 }, weight: 0.6 },
                { dim: 'struktur',   valueMap: { A: 0.2, B: 0.5, C: 0.3, D: 1  }, weight: 0.6 },
            ],
        },

        // ─── PHASE 2: ANTRIEB ────────────────────────────────────
        {
            id: 'q11', phase: 'antrieb', type: 'likert-7',
            text: 'Wie stark ist dein Bedürfnis, dein eigenes Ding zu machen, ohne feste Regeln oder Chefs?',
            anchors: ['Kaum spürbar', 'Extrem stark'],
            hint: 'Das innere Ziehen nach Autonomie und Unabhängigkeit.',
            dims: [{ dim: 'werte_freiheit', weight: 1 }],
        },
        {
            id: 'q12', phase: 'antrieb', type: 'likert-7',
            text: 'Wie wichtig ist es dir, messbare Ergebnisse zu erreichen und erfolgreich zu sein?',
            anchors: ['Gar nicht priorität', 'Absolut zentral'],
            hint: 'Leistung als Treiber, nicht als Pflicht.',
            dims: [{ dim: 'werte_leistung', weight: 1 }],
        },
        {
            id: 'q13', phase: 'antrieb', type: 'likert-7',
            text: 'Wie sehr treibt dich der Wunsch an, etwas Neues zu erschaffen oder bestehende Wege zu verändern?',
            anchors: ['Kaum', 'Ist mein Hauptantrieb'],
            hint: 'Innovation, Kreativität, Disruption.',
            dims: [{ dim: 'werte_innovation', weight: 1 }, { dim: 'offenheit', weight: 0.4 }],
        },
        {
            id: 'q14', phase: 'antrieb', type: 'forced-3way',
            text: 'Wenn du dir aussuchen könntest: Was treibt dich am tiefsten an?',
            options: [
                { label: 'Einfluss & Wirkung', desc: 'Du willst etwas bewegen, Entscheidungen treffen, Richtung vorgeben.', value: 'power' },
                { label: 'Zugehörigkeit & Harmonie', desc: 'Menschen zusammenbringen, Vertrauen aufbauen, Teil von etwas Echtem sein.', value: 'affiliation' },
                { label: 'Meisterschaft & Exzellenz', desc: 'Das Beste in einem Bereich werden, tiefes Können entwickeln, Perfektion anstreben.', value: 'achievement' },
            ],
            dims: [
                { dim: '_antrieb_type', valueMap: { power: 'power', affiliation: 'affiliation', achievement: 'achievement' } },
                { dim: 'werte_leistung', valueMap: { power: 0.6, affiliation: 0.3, achievement: 1 }, weight: 0.5 },
                { dim: 'verbindung',     valueMap: { power: 0.4, affiliation: 1,   achievement: 0.3 }, weight: 0.5 },
                { dim: 'energie',        valueMap: { power: 1,   affiliation: 0.5, achievement: 0.6 }, weight: 0.3 },
            ],
        },
        {
            id: 'q15', phase: 'antrieb', type: 'likert-7',
            text: 'Wie stark brauchst du das Gefühl, frei entscheiden zu können, über deine Zeit, deinen Weg, dein Leben?',
            anchors: ['Nicht so wichtig', 'Ohne das kann ich nicht gut funktionieren'],
            hint: 'Autonomie als tiefes Bedürfnis.',
            dims: [{ dim: 'werte_freiheit', weight: 0.8 }],
        },
        {
            id: 'q16', phase: 'antrieb', type: 'scenario-4way',
            text: 'Welches Szenario klingt für dich am erfüllendsten?',
            options: [
                { label: 'Etwas Eigenes aufbauen', desc: 'Ein Projekt, ein Unternehmen, ein Werk, ganz nach deinen Regeln.', value: 'A' },
                { label: 'Etwas Meisterhaftes vollenden', desc: 'Ein Buch schreiben, eine Fähigkeit auf Weltklasseniveau bringen.', value: 'B' },
                { label: 'Menschen echt verändern', desc: 'Als Mentor, Therapeut, Coach, nachhaltige Spuren im Leben anderer hinterlassen.', value: 'C' },
                { label: 'Ein System verbessern', desc: 'Ineffizienzen finden und strukturell lösen, im Großen oder im Kleinen.', value: 'D' },
            ],
            dims: [
                { dim: 'werte_freiheit',   valueMap: { A: 1, B: 0.4, C: 0.4, D: 0.3 }, weight: 0.7 },
                { dim: 'werte_leistung',   valueMap: { A: 0.7, B: 1, C: 0.4, D: 0.7 }, weight: 0.7 },
                { dim: 'verbindung',       valueMap: { A: 0.3, B: 0.4, C: 1, D: 0.4 }, weight: 0.7 },
                { dim: 'werte_innovation', valueMap: { A: 0.8, B: 0.6, C: 0.5, D: 1  }, weight: 0.5 },
            ],
        },
        {
            id: 'q17', phase: 'antrieb', type: 'likert-7',
            text: 'Wie häufig handelst du aus einem inneren Feuer heraus, nicht weil jemand dich schiebt?',
            anchors: ['Selten, ich brauche äußeren Anreiz', 'Fast immer, ich brenne von innen'],
            hint: 'Intrinsische vs. extrinsische Motivation.',
            dims: [{ dim: 'werte_leistung', weight: 0.6 }, { dim: 'werte_freiheit', weight: 0.4 }, { dim: 'loc_internal', weight: 0.5 }],
        },

        // ─── PHASE 3: MUSTER ────────────────────────────────────
        {
            id: 'q18', phase: 'muster', type: 'scenario-4way',
            text: 'Wenn du in einer engen Beziehung (Freundschaft oder Partnerschaft) Nähe spürst, wie reagierst du innerlich?',
            options: [
                { label: 'Geborgen und sicher', desc: 'Du kannst dich öffnen, bist präsent, genießt die Verbindung.', value: 'sicher' },
                { label: 'Aufgeregt aber nervös', desc: 'Du willst nah sein, machst dir aber Sorgen um Ablehnung.', value: 'aengstlich' },
                { label: 'Ein bisschen unwohl', desc: 'Zu viel Nähe fühlt sich einengend an, du ziehst dich lieber etwas zurück.', value: 'vermeidend' },
                { label: 'Verwirrend & widersprüchlich', desc: 'Du willst Nähe, hast aber gleichzeitig Angst davor, es ist unberechenbar.', value: 'desorganisiert' },
            ],
            dims: [
                { dim: '_bindungsstil', valueMap: { sicher: 'sicher', aengstlich: 'aengstlich', vermeidend: 'vermeidend', desorganisiert: 'desorganisiert' } },
                { dim: 'verbindung', valueMap: { sicher: 1, aengstlich: 0.6, vermeidend: 0.2, desorganisiert: 0.4 }, weight: 0.8 },
                { dim: 'tiefe',      valueMap: { sicher: 0.8, aengstlich: 0.7, vermeidend: 0.5, desorganisiert: 0.6 }, weight: 0.4 },
            ],
        },
        {
            id: 'q19', phase: 'muster', type: 'likert-7',
            text: 'Wenn etwas schiefgeht, wie sehr neigst du dazu, die Ursache bei dir zu sehen (statt bei Umständen oder anderen)?',
            anchors: ['Gar nicht, liegt meist außen', 'Immer, ich habe es in der Hand'],
            hint: 'Nicht Schuld, sondern wo du Kontrolle siehst.',
            dims: [{ dim: 'loc_internal', weight: 1 }],
        },
        {
            id: 'q20', phase: 'muster', type: 'likert-7',
            text: 'Wie sehr glaubst du, dass dein Handeln tatsächlich Einfluss auf deine Zukunft hat?',
            anchors: ['Kaum, das Schicksal bestimmt', 'Vollständig, ich forme mein Leben'],
            hint: 'Deine echte Überzeugung, nicht die gewünschte.',
            dims: [{ dim: 'loc_internal', weight: 0.9 }],
        },
        {
            id: 'q21', phase: 'muster', type: 'scenario-4way',
            text: 'Du bekommst mitten im Urlaub eine schlechte Nachricht (Absage, Konflikt, Verlust). Wie reagierst du als Erstes?',
            options: [
                { label: 'Ich handle sofort', desc: 'Problem lösen, Situation kontrollieren, nicht warten.', value: 'fight' },
                { label: 'Ich brauche Abstand', desc: 'Erstmal weg, Situation sacken lassen, Kopf frei kriegen.', value: 'flight' },
                { label: 'Ich bin erstmal gelähmt', desc: 'Ich kann nicht klar denken, erstarrt, überwältigt, will nichts tun.', value: 'freeze' },
                { label: 'Ich kümmere mich um andere', desc: 'Ich sorge dafür, dass alle ok sind, meine eigenen Gefühle kommen später.', value: 'fawn' },
            ],
            dims: [
                { dim: '_stress_typ', valueMap: { fight: 'fight', flight: 'flight', freeze: 'freeze', fawn: 'fawn' } },
                { dim: 'loc_internal', valueMap: { fight: 1, flight: 0.5, freeze: 0.2, fawn: 0.4 }, weight: 0.5 },
                { dim: 'energie',      valueMap: { fight: 1, flight: 0.6, freeze: 0.3, fawn: 0.5 }, weight: 0.3 },
            ],
        },
        {
            id: 'q22', phase: 'muster', type: 'likert-7',
            text: 'Wie oft grübelst du über vergangene Fehler oder künftige Probleme, auch wenn du es nicht willst?',
            anchors: ['Kaum', 'Sehr häufig, fast unkontrollierbar'],
            hint: 'Rumination: ungewolltes Kreisen der Gedanken.',
            dims: [{ dim: 'rumination', weight: 1 }],
        },
        {
            id: 'q23', phase: 'muster', type: 'likert-7',
            text: 'Wenn du Fehler machst, wie lange beschäftigt dich das danach?',
            anchors: ['Kaum, ich lasse schnell los', 'Sehr lang, ich kann nicht aufhören darüber nachzudenken'],
            hint: 'Kein Urteil, einfach ehrlich.',
            dims: [{ dim: 'rumination', weight: 0.8 }],
        },
        {
            id: 'q24', phase: 'muster', type: 'scenario-binary',
            text: 'Wenn du stark unter Druck bist, was hilft dir am ehesten?',
            options: [
                { label: 'Klarheit schaffen', desc: 'Situation analysieren, Prioritäten setzen, strukturiert vorgehen, Kontrolle zurückgewinnen.', value: 'A' },
                { label: 'Rückhalt suchen', desc: 'Mit jemandem reden, Unterstützung holen, nicht alleine damit sein.', value: 'B' },
            ],
            dims: [
                { dim: 'loc_internal', valueMap: { A: 1, B: 0.4 }, weight: 0.6 },
                { dim: 'verbindung',   valueMap: { A: 0.3, B: 1 }, weight: 0.6 },
                { dim: 'struktur',     valueMap: { A: 0.9, B: 0.3 }, weight: 0.4 },
            ],
        },

        // ─── PHASE 4: POTENZIAL ──────────────────────────────────
        {
            id: 'q25', phase: 'potenzial', type: 'likert-7',
            text: 'Wie sehr glaubst du, dass deine Fähigkeiten durch Übung und Einsatz wachsen können?',
            anchors: ['Kaum, man hat was oder hat es nicht', 'Komplett, Potenzial ist unbegrenzt'],
            hint: 'Growth Mindset nach Carol Dweck.',
            dims: [{ dim: 'mindset_growth', weight: 1 }],
        },
        {
            id: 'q26', phase: 'potenzial', type: 'likert-7',
            text: 'Wie sehr macht dir Scheitern Angst, wenn du Neues versuchst?',
            anchors: ['Gar nicht, Fehler sind Lernchancen', 'Sehr stark, ich vermeide lieber sicheres Terrain'],
            hint: 'Invertiert: hoher Wert = mutig.',
            dims: [{ dim: 'mindset_growth', weight: 0.8, invert: true }],
        },
        {
            id: 'q27', phase: 'potenzial', type: 'likert-7',
            text: 'Gibt es ein Thema oder eine Tätigkeit, die dich so fesselt, dass du stundenlang daran arbeiten kannst, auch ohne Belohnung?',
            anchors: ['Nein, kenne das kaum', 'Ja, absolut und klar definiert'],
            hint: 'Das ist Grit-Passion: brennende Leidenschaft.',
            dims: [{ dim: 'grit_passion', weight: 1 }],
        },
        {
            id: 'q28', phase: 'potenzial', type: 'likert-7',
            text: 'Wenn es schwierig wird, wie lange bleibst du an einer Sache dran, auch wenn andere aufgeben würden?',
            anchors: ['Ich gebe früh auf', 'Ich bleibe durch, immer'],
            hint: 'Ausdauer über Zeit, nicht Sturheit.',
            dims: [{ dim: 'grit_ausdauer', weight: 1 }],
        },
        {
            id: 'q29', phase: 'potenzial', type: 'likert-7',
            text: 'Wie konsequent verfolgst du langfristige Ziele über Monate hinweg?',
            anchors: ['Kaum', 'Sehr konsequent'],
            hint: 'Nicht Kurzzeit-Sprints, echte Konstanz.',
            dims: [{ dim: 'grit_ausdauer', weight: 0.8 }, { dim: 'struktur', weight: 0.3 }],
        },
        {
            id: 'q30', phase: 'potenzial', type: 'forced-3way',
            text: 'Wo liegt deine stärkste natürliche Intelligenz?',
            options: [
                { label: 'Analytisch-logisch', desc: 'Strukturen erkennen, Systeme verstehen, abstraktes Denken.', value: 'analytisch' },
                { label: 'Sozial-emotional', desc: 'Menschen lesen, Empathie, Beziehungen gestalten.', value: 'sozial' },
                { label: 'Kreativ-visuell', desc: 'Ideen verbinden, visualisieren, aus dem Nichts erschaffen.', value: 'kreativ' },
            ],
            dims: [
                { dim: '_intel_primary', valueMap: { analytisch: 'analytisch', sozial: 'sozial', kreativ: 'kreativ' } },
                { dim: 'offenheit',   valueMap: { analytisch: 0.6, sozial: 0.5, kreativ: 1 }, weight: 0.4 },
                { dim: 'tiefe',       valueMap: { analytisch: 1, sozial: 0.6, kreativ: 0.7 }, weight: 0.4 },
                { dim: 'verbindung',  valueMap: { analytisch: 0.3, sozial: 1, kreativ: 0.5 }, weight: 0.4 },
            ],
        },
        {
            id: 'q31', phase: 'potenzial', type: 'scenario-4way',
            text: 'In welchem Bereich siehst du dein größtes Wachstumspotenzial?',
            options: [
                { label: 'Innere Klarheit', desc: 'Selbsterkenntnis, Identität, emotionale Reife, wissen wer du wirklich bist.', value: 'selbstkenntnis' },
                { label: 'Wirksamkeit & Führung', desc: 'Andere beeinflussen, Dinge bewegen, verantwortlich führen.', value: 'fuehrung' },
                { label: 'Aufbau & Systeme', desc: 'Dinge erschaffen, strukturieren, ein Werk oder Business aufbauen.', value: 'aufbau' },
                { label: 'Verbindung & Präsenz', desc: 'Echte Beziehungen aufbauen, tiefer zuhören, präsenter sein.', value: 'verbindung' },
            ],
            dims: [
                { dim: '_wachstumsfeld', valueMap: { selbstkenntnis: 'selbstkenntnis', fuehrung: 'fuehrung', aufbau: 'aufbau', verbindung: 'verbindung' } },
                { dim: 'tiefe',          valueMap: { selbstkenntnis: 1, fuehrung: 0.5, aufbau: 0.5, verbindung: 0.7 }, weight: 0.4 },
                { dim: 'energie',        valueMap: { selbstkenntnis: 0.3, fuehrung: 1, aufbau: 0.6, verbindung: 0.7 }, weight: 0.4 },
                { dim: 'struktur',       valueMap: { selbstkenntnis: 0.4, fuehrung: 0.6, aufbau: 1, verbindung: 0.3 }, weight: 0.4 },
            ],
        },
        {
            id: 'q32', phase: 'potenzial', type: 'likert-7',
            text: 'Wie bewusst erkennst du deine eigenen Muster, Stärken und blinden Flecken?',
            anchors: ['Kaum, ich bin mir selbst unklar', 'Sehr bewusst, ich kenne mich gut'],
            hint: 'Selbstreflexionsfähigkeit.',
            dims: [{ dim: 'tiefe', weight: 0.6 }, { dim: 'mindset_growth', weight: 0.4 }],
        },
        {
            id: 'q33', phase: 'potenzial', type: 'scenario-binary',
            text: 'Was beschreibt dich besser in schwierigen Phasen?',
            options: [
                { label: 'Ich beuge mich aber breche nicht', desc: 'Ich halte durch, auch wenn es wehtut, Resilienz als Kern.', value: 'A' },
                { label: 'Ich transformiere', desc: 'Krisen verwandle ich in Wachstum, danach bin ich immer stärker.', value: 'B' },
            ],
            dims: [
                { dim: 'grit_ausdauer',  valueMap: { A: 1, B: 0.7 }, weight: 0.7 },
                { dim: 'mindset_growth', valueMap: { A: 0.6, B: 1 }, weight: 0.7 },
                { dim: 'loc_internal',   valueMap: { A: 0.7, B: 1 }, weight: 0.4 },
            ],
        },
    ];

    // ── Archetypes ─────────────────────────────────────────────────
    const ARCHETYPES = [
        {
            id: 'pioneer', name: 'Der Pionier', emoji: '🔥',
            color: '#f0a855',
            tagline: 'Du machst den Weg, andere folgen.',
            desc: 'Du hast eine natürliche Fähigkeit, in unbekanntem Terrain voranzugehen. Dein Mut, deine Energie und deine Offenheit für Neues machen dich zu jemandem, der Dinge in Bewegung bringt.',
            strengths: ['Mut in Unsicherheit', 'Energie & Antrieb', 'Neue Wege erkennen'],
            blindspot: 'Ungeduld mit anderen; Schwierigkeit, abgeschlossene Systeme zu respektieren.',
            conditions: [
                { dim: 'offenheit',      op: '>=', threshold: 65, weight: 3 },
                { dim: 'energie',        op: '>=', threshold: 65, weight: 3 },
                { dim: 'werte_freiheit', op: '>=', threshold: 60, weight: 2 },
                { dim: 'struktur',       op: '=',  threshold: 75, weight: 1 },
            ],
        },
        {
            id: 'maker', name: 'Der Macher', emoji: '⚙️',
            color: '#58d4a0',
            tagline: 'Du baust, was andere nur denken.',
            desc: 'Du bist der Mensch, der Ideen in Realität verwandelt. Deine Stärke liegt im konkreten Tun, im Aufbau und in der Fähigkeit, komplexe Vorhaben durchzuziehen.',
            strengths: ['Umsetzungsstärke', 'Ausdauer', 'Praktische Kompetenz'],
            blindspot: 'Kann anderen zu ungeduldig erscheinen; verliert manchmal das große Bild.',
            conditions: [
                { dim: 'struktur',    op: '>=', threshold: 65, weight: 3 },
                { dim: 'grit_ausdauer', op: '>=', threshold: 65, weight: 3 },
                { dim: 'werte_leistung', op: '>=', threshold: 60, weight: 2 },
                { dim: 'energie',     op: '>=', threshold: 55, weight: 1 },
            ],
        },
        {
            id: 'connector', name: 'Der Connector', emoji: '🤝',
            color: '#f07090',
            tagline: 'Du verbindest, was getrennt ist.',
            desc: 'Deine Superkraft liegt in Menschen. Du erkennst intuitiv, wer zu wem passt, baust Brücken zwischen Welten und schaffst Räume, in denen sich andere sicher fühlen.',
            strengths: ['Empathie', 'Beziehungsaufbau', 'Soziale Intelligenz'],
            blindspot: 'Eigene Grenzen setzen; Nein sagen; eigene Bedürfnisse priorisieren.',
            conditions: [
                { dim: 'verbindung',  op: '>=', threshold: 68, weight: 3 },
                { dim: 'energie',     op: '>=', threshold: 62, weight: 2 },
                { dim: 'tiefe',       op: '>=', threshold: 55, weight: 2 },
                { dim: 'loc_internal', op: '>=', threshold: 55, weight: 1 },
            ],
        },
        {
            id: 'analyst', name: 'Der Analyst', emoji: '🔭',
            color: '#60a0e8',
            tagline: 'Du siehst, was andere übersehen.',
            desc: 'Dein Geist durchdringt Systeme und Zusammenhänge mit einer Tiefe, die die meisten nicht erreichen. Du bringst Klarheit in komplexe Situationen.',
            strengths: ['Systemdenken', 'Tiefe Analyse', 'Mustererkennung'],
            blindspot: 'Überdenken; Schwierigkeit im schnellen Handeln; kann sich isolieren.',
            conditions: [
                { dim: 'offenheit',  op: '>=', threshold: 65, weight: 2 },
                { dim: 'tiefe',      op: '>=', threshold: 60, weight: 3 },
                { dim: 'energie',    op: '=',  threshold: 60, weight: 2 },
                { dim: 'struktur',   op: '>=', threshold: 55, weight: 2 },
            ],
        },
        {
            id: 'guardian', name: 'Der Bewahrer', emoji: '🛡️',
            color: '#88d878',
            tagline: 'Du hältst zusammen, was auseinanderfallen würde.',
            desc: 'Du bist das Rückgrat. Verlässlich, treu, konsequent, du schaffst Stabilität in einer chaotischen Welt und gibst anderen Sicherheit.',
            strengths: ['Verlässlichkeit', 'Loyalität', 'Konsequenz'],
            blindspot: 'Widerstand gegen Veränderung; kann starr wirken; überinvestiert in Sicherheit.',
            conditions: [
                { dim: 'struktur',       op: '>=', threshold: 68, weight: 3 },
                { dim: 'verbindung',     op: '>=', threshold: 62, weight: 2 },
                { dim: 'werte_freiheit', op: '=',  threshold: 58, weight: 2 },
                { dim: 'grit_passion',   op: '=',  threshold: 60, weight: 1 },
            ],
        },
        {
            id: 'endurer', name: 'Der Durchhalter', emoji: '🏔️',
            color: '#d878c8',
            tagline: 'Du gehst weiter, wenn alle anderen stoppen.',
            desc: 'Deine Ausdauer ist legendär. Andere geben auf, du machst weiter. Du weißt, dass Großes Zeit braucht, und du bist bereit, die Arbeit zu investieren.',
            strengths: ['Ausdauer', 'Belastbarkeit', 'Langzeitdenken'],
            blindspot: 'Kann Kontrolle über "genug" verlieren; Schwierigkeit loszulassen.',
            conditions: [
                { dim: 'grit_ausdauer',  op: '>=', threshold: 72, weight: 4 },
                { dim: 'grit_passion',   op: '>=', threshold: 62, weight: 2 },
                { dim: 'loc_internal',   op: '>=', threshold: 60, weight: 2 },
                { dim: 'mindset_growth', op: '>=', threshold: 55, weight: 1 },
            ],
        },
        {
            id: 'free', name: 'Der Freie Geist', emoji: '🌊',
            color: '#8b7cf8',
            tagline: 'Du lebst dort, wo andere erst anklopfen.',
            desc: 'Du bist kreativ, neugierig und leicht unterwegs. Konventionen sind für dich Anregungen, keine Regeln. Du denkst quer, verbindest Unerwartetes und inspirierst andere.',
            strengths: ['Kreativität', 'Unkonventionelles Denken', 'Inspirationskraft'],
            blindspot: 'Konsequenz und Follow-through; Strukturen als Hilfe nutzen.',
            conditions: [
                { dim: 'offenheit',      op: '>=', threshold: 70, weight: 3 },
                { dim: 'energie',        op: '>=', threshold: 60, weight: 2 },
                { dim: 'werte_freiheit', op: '>=', threshold: 70, weight: 3 },
                { dim: 'struktur',       op: '=',  threshold: 75 },
                { dim: 'mindset_growth', op: '>=', threshold: 62 },
            ],
        },
        // ── Synergy / Rare Archetypes ──────────────────────────
        {
            id: 'tiefenverbinder', name: 'Der Tiefenverbinder', emoji: '💎', rare: true,
            color: '#c9a84c',
            tagline: 'Du berührst Menschen dort, wo es zählt.',
            desc: 'Eine seltene Kombination: Du verbindest emotionale Tiefe mit echter sozialer Präsenz. Menschen öffnen sich dir auf eine Art, die anderen nicht gelingt.',
            strengths: ['Tiefe Empathie', 'Vertrauensaufbau', 'Echte Präsenz'],
            blindspot: 'Emotionale Überladung; kann sich zu sehr in andere hineinversetzen.',
            conditions: [
                { dim: 'verbindung',  op: '>=', threshold: 68, weight: 3 },
                { dim: 'tiefe',       op: '>=', threshold: 65, weight: 3 },
                { dim: 'bindungsstil', op: '===', value: 'sicher', weight: 3 },
                { dim: 'rumination',  op: '=',  threshold: 65, weight: 1 },
            ],
        },
        {
            id: 'ausdauernder_visionaer', name: 'Der Ausdauernde Visionär', emoji: '🔱', rare: true,
            color: '#c9a84c',
            tagline: 'Du träumst groß, und machst es wahr.',
            desc: 'Visionen ohne Ausdauer bleiben Träume. Ausdauer ohne Vision bleibt Schinderei. Du hast beides, und das macht dich außergewöhnlich.',
            strengths: ['Langfristige Vision', 'Durchhaltevermögen', 'Inspirierende Umsetzung'],
            blindspot: 'Kann andere überfordern; Perfektionismus als Blocker.',
            conditions: [
                { dim: 'grit_ausdauer',  op: '>=', threshold: 68, weight: 3 },
                { dim: 'offenheit',      op: '>=', threshold: 65, weight: 2 },
                { dim: 'werte_innovation', op: '>=', threshold: 60, weight: 2 },
                { dim: 'mindset_growth', op: '>=', threshold: 65, weight: 2 },
            ],
        },
        {
            id: 'ruhiger_stratege', name: 'Der Ruhige Stratege', emoji: '♟️', rare: true,
            color: '#c9a84c',
            tagline: 'Du denkst drei Züge voraus, leise.',
            desc: 'Während andere laut reden, denkst du. Deine Stärke liegt in der stillen strategischen Überlegenheit, du erkennst Muster, die andere nicht mal ahnen.',
            strengths: ['Strategisches Denken', 'Geduld', 'Systemische Analyse'],
            blindspot: 'Kann zu passiv wirken; Entscheidungen zu lange hinauszögern.',
            conditions: [
                { dim: 'tiefe',       op: '>=', threshold: 68, weight: 3 },
                { dim: 'struktur',    op: '>=', threshold: 65, weight: 2 },
                { dim: 'energie',     op: '=',  threshold: 62, weight: 2 },
                { dim: 'loc_internal', op: '>=', threshold: 65, weight: 2 },
            ],
        },
        {
            id: 'empathischer_fuehrer', name: 'Der Empathische Führer', emoji: '🌟', rare: true,
            color: '#c9a84c',
            tagline: 'Deine Stärke ist, dass du weißt, wie Menschen ticken.',
            desc: 'Führung durch Verstehen statt durch Befehl. Du bewegst Menschen, weil du sie wirklich siehst, und das ist die nachhaltigste Form von Führung.',
            strengths: ['Menschenkenntnis', 'Inspirierendes Führen', 'Echte Verbindung in Hierarchien'],
            blindspot: 'Kann eigene Grenzen zu sehr an anderen ausrichten.',
            conditions: [
                { dim: 'verbindung',  op: '>=', threshold: 68, weight: 3 },
                { dim: 'energie',     op: '>=', threshold: 65, weight: 2 },
                { dim: 'loc_internal', op: '>=', threshold: 68, weight: 2 },
                { dim: 'antrieb_type', op: '===', value: 'power', weight: 2 },
            ],
        },
        {
            id: 'kreativer_uebersetzer', name: 'Der Kreative Übersetzer', emoji: '🎨', rare: true,
            color: '#c9a84c',
            tagline: 'Du machst Komplexes greifbar, und Einfaches tief.',
            desc: 'Du hast die seltene Gabe, zwischen Welten zu übersetzen, zwischen Ideen und Umsetzung, zwischen Experten und Laien, zwischen Gefühl und Logik.',
            strengths: ['Kreative Kommunikation', 'Brücken bauen', 'Komplexitätsreduktion'],
            blindspot: 'Eigene Tiefe kann oberflächlich wirken, wenn nicht ganz erklärt.',
            conditions: [
                { dim: 'offenheit',       op: '>=', threshold: 68, weight: 3 },
                { dim: 'verbindung',      op: '>=', threshold: 62, weight: 2 },
                { dim: 'werte_innovation', op: '>=', threshold: 65, weight: 2 },
                { dim: 'tiefe',           op: '>=', threshold: 60, weight: 1 },
            ],
        },
        {
            id: 'resilienter_vollender', name: 'Der Resiliente Vollender', emoji: '⚡', rare: true,
            color: '#c9a84c',
            tagline: 'Du stehst auf. Immer wieder. Bis es fertig ist.',
            desc: 'Krisen brechen dich nicht, sie formen dich. Du kombinierst psychische Robustheit mit echter Umsetzungsstärke. Das macht dich zu jemandem, der fertigstellt, was andere aufgegeben haben.',
            strengths: ['Krisenresilienz', 'Umsetzungskonstanz', 'Post-traumatisches Wachstum'],
            blindspot: 'Kann Hilfe als Schwäche sehen; überarbeitet sich.',
            conditions: [
                { dim: 'grit_ausdauer',  op: '>=', threshold: 70, weight: 3 },
                { dim: 'loc_internal',   op: '>=', threshold: 68, weight: 3 },
                { dim: 'mindset_growth', op: '>=', threshold: 65, weight: 2 },
                { dim: 'rumination',     op: '=',  threshold: 65, weight: 1 },
            ],
        },
    ];

    // ── Synergies (visual connections in skill tree) ───────────────
    const SYNERGIES = [
        {
            id: 'sy_vision_action',
            name: 'Vision & Umsetzung',
            desc: 'Kreativität gepaart mit Disziplin, die mächtigste Kombination.',
            conditions: [
                { dim: 'offenheit', op: '>=', threshold: 65 },
                { dim: 'struktur',  op: '>=', threshold: 65 },
            ],
            connects: ['offenheit', 'grit_ausdauer'],
        },
        {
            id: 'sy_grit_growth',
            name: 'Unaufhaltsames Wachstum',
            desc: 'Growth Mindset + Ausdauer = exponentieller Fortschritt.',
            conditions: [
                { dim: 'mindset_growth', op: '>=', threshold: 68 },
                { dim: 'grit_ausdauer',  op: '>=', threshold: 68 },
            ],
            connects: ['mindset_growth', 'struktur'],
        },
        {
            id: 'sy_social_energy',
            name: 'Magnetisches Auftreten',
            desc: 'Energie + Verbindungsfähigkeit = natürliche Führungspräsenz.',
            conditions: [
                { dim: 'energie',    op: '>=', threshold: 68 },
                { dim: 'verbindung', op: '>=', threshold: 65 },
            ],
            connects: ['energie', 'werte_leistung'],
        },
        {
            id: 'sy_deep_self',
            name: 'Innere Stärke',
            desc: 'Verarbeitungstiefe + Selbstwirksamkeit = überragende Entscheidungsqualität.',
            conditions: [
                { dim: 'tiefe',       op: '>=', threshold: 65 },
                { dim: 'loc_internal', op: '>=', threshold: 68 },
            ],
            connects: ['tiefe', 'loc_internal'],
        },
        {
            id: 'sy_freedom_passion',
            name: 'Freier Geist mit Kern',
            desc: 'Freiheitsdrang + Leidenschaft = fokussierte kreative Energie.',
            conditions: [
                { dim: 'offenheit',   op: '>=', threshold: 70 },
                { dim: 'grit_passion', op: '>=', threshold: 70 },
            ],
            connects: ['offenheit', 'grit_passion'],
        },
    ];

    // ── Phase metadata ─────────────────────────────────────────────
    const PHASES = {
        kern:      { label: 'Deine Grundstruktur', icon: '◈', color: '#8b7cf8', questionRange: [1, 10] },
        antrieb:   { label: 'Was dich antreibt',   icon: '◉', color: '#f0a855', questionRange: [11, 17] },
        muster:    { label: 'Deine Muster',         icon: '◎', color: '#f07090', questionRange: [18, 24] },
        potenzial: { label: 'Dein Potenzial',       icon: '◆', color: '#60a0e8', questionRange: [25, 33] },
    };

    // ── Dimension explanations (used by interactive detail panel) ──────────────
    const DIMENSION_EXPLANATIONS = {
        offenheit: {
            label: 'Offenheit', color: '#8b7cf8', layer: 'Kern',
            what: 'Misst intellektuelle Neugier, Fantasie, ästhetische Sensibilität und den Reizhunger nach neuen Ideen und Erfahrungen.',
            low:  'Du bevorzugst Vertrautes und Bewährtes. Neue, abstrakte Ideen interessieren dich weniger als praktische, konkrete Dinge.',
            mid:  'Du bist selektiv neugierig, offen für Neues in bestimmten Bereichen, in anderen eher konservativ.',
            high: 'Deine intellektuelle Neugier ist eine echte Stärke. Du denkst gerne quer, liebst Ideen und kannst gut mit Komplexität umgehen.',
            growth: 'Nutze deine analytische Seite als Brücke in neue Gebiete. Wähle jeden Monat ein Thema außerhalb deiner Komfortzone.',
            related: ['struktur', 'mindset_growth', 'werte_innovation'],
        },
        struktur: {
            label: 'Struktur', color: '#58d4a0', layer: 'Kern',
            what: 'Misst Selbstregulation, Planungsorientierung, Zielstrebigkeit und die Fähigkeit, Aufgaben konsequent zu Ende zu führen.',
            low:  'Du arbeitest eher spontan und impulsgesteuert. Langfristige Pläne brechen schnell zusammen.',
            mid:  'Du kannst strukturiert arbeiten, brauchst aber externe Trigger oder Deadlines als Anker.',
            high: 'Deine Selbstdisziplin ist außergewöhnlich. Du wirst fertig, was du anfängst, auch wenn es schwer wird.',
            growth: 'Achte darauf, Struktur nicht zur Kontrolle werden zu lassen. Baue bewusst Freiräume für Spontaneität ein.',
            related: ['grit_ausdauer', 'loc_internal', 'werte_leistung'],
        },
        energie: {
            label: 'Soziale Energie', color: '#f0a855', layer: 'Kern',
            what: 'Misst nicht ob jemand sozial ist, sondern woher er Energie bezieht. Hohe Werte: Menschen aufladen, nicht entleeren.',
            low:  'Du bist ein Introvert. Große Gruppen kosten dich Energie. Tiefe Einzelgespräche füllen dich mehr als Partys.',
            mid:  'Du bist ambivert, flexibel zwischen sozialen und ruhigen Phasen. Dein Bedarf wechselt je nach Kontext.',
            high: 'Menschen geben dir Energie. Du blühst in sozialen Umgebungen auf und wirst durch Interaktion motivierter.',
            growth: 'Als High-Energie-Typ: plane bewusst Rückzugszeiten. Als Low-Energie-Typ: übe kleine soziale Expositions-Dosen.',
            related: ['verbindung', 'antrieb_type', 'bindungsstil'],
        },
        verbindung: {
            label: 'Verbindung', color: '#f07090', layer: 'Kern',
            what: 'Misst prosoziale Orientierung: Empathiefähigkeit, Kooperationsbereitschaft und wie wichtig dir das Wohlbefinden anderer ist.',
            low:  'Du bist direkt, aufgabenorientiert und wenig abhängig von sozialer Bestätigung. Grenzen setzen fällt dir leicht.',
            mid:  'Du bist selektiv empathisch, sehr fürsorglich gegenüber Menschen die dir nah sind, sachlich gegenüber anderen.',
            high: 'Deine Empathiefähigkeit ist eine echte Stärke. Menschen fühlen sich bei dir gesehen. Achte auf eigene Grenzen.',
            growth: 'Hohe Verbindung kann zu Selbstaufopferung führen. Übe "Nein sagen" als Fürsorge für dich selbst.',
            related: ['energie', 'bindungsstil', 'antrieb_type'],
        },
        tiefe: {
            label: 'Verarbeitungstiefe', color: '#60a0e8', layer: 'Kern',
            what: 'Misst emotionale Sensitivität und Erlebnistiefe. Hohe Werte: du fühlst intensiver, verarbeitest tiefer.',
            low:  'Du bist emotional stabil und wenig reizempfindlich. Stresssituationen bringen dich selten aus der Ruhe.',
            mid:  'Du erlebst Emotionen spürbar, findest aber in der Regel relativ schnell wieder ins Gleichgewicht.',
            high: 'Du erlebst alles intensiver als die meisten. Das ist eine Stärke für Empathie und Kreativität, und kostet Energie.',
            growth: 'Investiere in Emotionsregulations-Techniken. Journaling und Reframing helfen dir, Tiefe zu nutzen ohne überwältigt zu werden.',
            related: ['rumination', 'bindungsstil', 'loc_internal'],
        },
        rumination: {
            label: 'Grübeln', color: '#a08888', layer: 'Muster',
            what: 'Misst die Neigung, über negative Ereignisse und Fehler länger nachzudenken als nötig.',
            low:  'Du verarbeitest Probleme schnell und kannst gut loslassen. Negative Erlebnisse bleiben nicht lange.',
            mid:  'Du grübelst situationsabhängig, bei wichtigen Themen intensiver, bei kleinen Dingen weniger.',
            high: 'Deine Ruminationsneigung ist hoch. Das bedeutet tiefes Verarbeiten, aber auch viel Energie die im Kreis läuft.',
            growth: 'Setze dir einen "Grübel-Timer" von 10 Minuten pro Thema. Danach aktiv ablenken oder handeln.',
            related: ['tiefe', 'loc_internal', 'mindset_growth'],
        },
        loc_internal: {
            label: 'Selbstwirksamkeit', color: '#88d878', layer: 'Muster',
            what: 'Misst die Überzeugung, ob das eigene Leben durch eigene Entscheidungen steuerbar ist, oder durch äußere Kräfte.',
            low:  'Du neigst dazu, Ursachen für Ereignisse außerhalb von dir zu sehen. Das nimmt Druck, reduziert aber auch Handlungsimpulse.',
            mid:  'Du hast ein realistisches Bild: manchmal bist du verantwortlich, manchmal bestimmen Umstände.',
            high: 'Du glaubst fest, dass deine Handlungen zählen. Das ist der stärkste Prädiktor für Eigeninitiative und Veränderung.',
            growth: 'Interner LoC ist trainierbar. Dokumentiere täglich eine Entscheidung die du bewusst getroffen hast.',
            related: ['mindset_growth', 'grit_ausdauer', 'stress_typ'],
        },
        mindset_growth: {
            label: 'Growth Mindset', color: '#a078f0', layer: 'Potenzial',
            what: 'Misst die Überzeugung, dass Fähigkeiten durch Einsatz entwickelbar sind, oder fest und unveränderlich.',
            low:  'Du tendierst zum Fixed Mindset: Scheitern fühlt sich definierend an, Herausforderungen eher als Bedrohung.',
            mid:  'Du schwankst: bei Dingen die dir wichtig sind, bist du offen für Wachstum. In anderen Bereichen nicht.',
            high: 'Du glaubst an Entwicklung. Rückschläge sind für dich Lernmaterial, keine Urteile über deinen Wert.',
            growth: 'Notiere nach jedem Fehler eine Sache die du gelernt hast. Das trainiert den Growth-Reflex.',
            related: ['loc_internal', 'grit_ausdauer', 'offenheit'],
        },
        grit_passion: {
            label: 'Leidenschaft', color: '#60d8b8', layer: 'Potenzial',
            what: 'Misst Konsistenz der Interessen über Zeit, ob du bei einem Thema oder Projekt bleibst oder immer wieder wechselst.',
            low:  'Du wechselst häufig zwischen Interessen und Projekten. Du bist in der Explorations-Phase, noch ohne klaren Anker.',
            mid:  'Du hast Interessen, aber die Konsistenz schwankt je nach Lebensphase oder externen Umständen.',
            high: 'Du bist einem oder wenigen Themen langfristig treu. Tiefe statt Breite ist deine natürliche Orientierung.',
            growth: 'Niedrige Leidenschafts-Konsistenz? Finde einen "Northstar", ein Thema das mehrere deiner Stärken vereint.',
            related: ['grit_ausdauer', 'offenheit', 'wachstumsfeld'],
        },
        grit_ausdauer: {
            label: 'Ausdauer', color: '#78c0f0', layer: 'Potenzial',
            what: 'Misst Persistenz, die Fähigkeit, trotz Rückschlägen und Hindernissen weiterzumachen.',
            low:  'Rückschläge bremsen dich stark. Der Impuls aufzugeben kommt früh, das ist oft ein Selbstschutz-Mechanismus.',
            mid:  'Du gibst bei kleinen Hindernissen nicht auf, aber bei großen Rückschlägen lässt die Motivation stark nach.',
            high: 'Deine Persistenz ist außergewöhnlich. Du machst weiter, wenn andere längst aufgehört haben.',
            growth: 'Hohe Ausdauer ohne klares Ziel kann in Sturheit enden. Frage dich regelmäßig: "Sollte ich hier wirklich weitermachen?"',
            related: ['grit_passion', 'struktur', 'loc_internal'],
        },
        werte_freiheit: {
            label: 'Freiheitswert', color: '#e8c860', layer: 'Antrieb',
            what: 'Misst wie stark Autonomie und Selbstbestimmung als Kernwert erlebt werden.',
            low:  'Struktur und klare Rahmenbedingungen geben dir Sicherheit. Zu viel Freiheit kann sich lähmend anfühlen.',
            mid:  'Du schätzt Freiheit, kannst aber auch in klar definierten Strukturen gut funktionieren.',
            high: 'Autonomie ist für dich existenziell. Enge Regeln und Fremdbestimmung kosten dich überproportional viel Energie.',
            growth: 'Kläre für jede Verpflichtung: "Gewähre ich mir damit Freiheit oder nehme ich sie mir?"',
            related: ['werte_innovation', 'antrieb_type', 'loc_internal'],
        },
        werte_leistung: {
            label: 'Leistungswert', color: '#e8b050', layer: 'Antrieb',
            what: 'Misst den intrinsischen Antrieb durch Exzellenz, persönliche Bestleistung und Wachstum.',
            low:  'Leistung ist für dich kein primärer Wert. Harmonie, Bedeutung oder Freiheit sind dir wichtiger.',
            mid:  'Du schätzt gute Arbeit, brennst aber nicht für Exzellenz um ihrer selbst willen.',
            high: 'Du konkurrierst gegen dich selbst. Besser werden ist dein natürlicher Ruhezustand.',
            growth: 'Achte darauf, dass Leistungsorientierung nicht in Perfektionismus kippt. Celebrate "gut genug".',
            related: ['struktur', 'grit_ausdauer', 'mindset_growth'],
        },
        werte_innovation: {
            label: 'Innovationswert', color: '#d878c8', layer: 'Antrieb',
            what: 'Misst das Bedürfnis nach Neuem, Kreativem und dem Unbekannten als treibenden Wert.',
            low:  'Bewährtes und Verlässliches ist dir lieber als ständige Veränderung.',
            mid:  'Du begrüßt Innovation in Maßen, wenn sie sich sinnvoll anfühlt.',
            high: 'Der Status quo langweilt dich. Du brauchst neue Ideen, Experimente und kreative Herausforderungen.',
            growth: 'Kanalisiere deinen Innovationsdrang: wähle ein Feld, in dem du wirklich tief innovieren willst.',
            related: ['offenheit', 'werte_freiheit', 'grit_passion'],
        },
        // ── Categorical entries ────────────────────────────────────────────────
        bindungsstil_sicher: {
            label: 'Sicherer Bindungsstil', color: '#58d4a0', layer: 'Muster',
            what: 'Menschen mit sicherem Bindungsstil sind comfortable mit Nähe und Autonomie gleichzeitig. Sie vertrauen anderen grundsätzlich.',
            interpretation: 'Deine Beziehungen haben ein stabiles Fundament. Du kannst Nähe zulassen, ohne dabei dich selbst zu verlieren.',
            growth: 'Nutze deinen sicheren Stil aktiv, um anderen als Anker zu dienen.',
            related: ['verbindung', 'energie', 'stress_typ'],
        },
        bindungsstil_aengstlich: {
            label: 'Ängstlich-Ambivalenter Bindungsstil', color: '#f0a855', layer: 'Muster',
            what: 'Starkes Bedürfnis nach Nähe bei gleichzeitiger Angst vor Ablehnung. Hypervigilanz gegenüber Beziehungssignalen.',
            interpretation: 'Du liebst tief und fürchtest den Verlust gleichzeitig. Das erzeugt Intensität in Beziehungen, aber auch Erschöpfung.',
            growth: 'Arbeite an Selbstberuhigungs-Strategien. Der Körper braucht lernen, dass Nähe sicher ist.',
            related: ['tiefe', 'rumination', 'stress_typ'],
        },
        bindungsstil_vermeidend: {
            label: 'Vermeidender Bindungsstil', color: '#60a0e8', layer: 'Muster',
            what: 'Unbehagen bei emotionaler Abhängigkeit. Unabhängigkeit wird stark valorisiert, Nähe innerlich als Risiko erlebt.',
            interpretation: 'Du brauchst viel Raum und hast gelernt, auf dich selbst zu zählen. Das ist Stärke, und gleichzeitig eine Mauer.',
            growth: 'Übe kleine Verletzlichkeiten. Erzähle jemandem etwas über dich das du sonst nicht teilst.',
            related: ['energie', 'verbindung', 'stress_typ'],
        },
        bindungsstil_desorganisiert: {
            label: 'Desorganisierter Bindungsstil', color: '#f07090', layer: 'Muster',
            what: 'Inkonsistente Strategien in Bindungssituationen. Mix aus Sehnsucht und Angst, oft mit frühen komplexen Erfahrungen verbunden.',
            interpretation: 'Deine Reaktionen in engen Beziehungen sind schwer vorhersehbar, auch für dich selbst. Das ist kein Fehler, sondern ein Muster das sich verändern lässt.',
            growth: 'Trauma-informierte Unterstützung (Therapie, Bodywork) kann hier echte Veränderung bringen.',
            related: ['tiefe', 'stress_typ', 'rumination'],
        },
        stress_fight: {
            label: 'Stressmuster: Kämpfer', color: '#e06060', layer: 'Muster',
            what: 'Unter Druck reagierst du mit Konfrontation, Intensität und Handlungsimpulsen.',
            interpretation: 'Du wirst unter Stress aktiviert statt gelähmt. Das ist Handlungsstärke, kann aber zu Überreaktionen führen.',
            growth: 'Baue ein "Pause-Protokoll" ein, bevor du unter Stress handelst. 3 tiefe Atemzüge als Trigger.',
            related: ['energie', 'loc_internal', 'struktur'],
        },
        stress_flight: {
            label: 'Stressmuster: Flüchter', color: '#e0a040', layer: 'Muster',
            what: 'Unter Druck weichst du aus, lenkst dich ab oder suchst Alternativen anstatt das Problem direkt zu konfrontieren.',
            interpretation: 'Ausweichen schützt kurzfristig, löst aber nichts. Die Probleme warten auf dich.',
            growth: 'Definiere für jeden Stressor eine minimale Konfrontations-Handlung. Klein, aber direkt.',
            related: ['struktur', 'loc_internal', 'mindset_growth'],
        },
        stress_freeze: {
            label: 'Stressmuster: Starre', color: '#8080c0', layer: 'Muster',
            what: 'Unter extremem Druck blockierst du, weißt nicht weiter oder tust erstmal nichts.',
            interpretation: 'Das Nervensystem fährt herunter als Schutz. Das ist biologisch verständlich und trainierbar.',
            growth: 'Mikroaktionen brechen den Freeze: "Ich mache jetzt nur EINE Sache." Körperbewegung hilft (kurz laufen, schütteln).',
            related: ['tiefe', 'loc_internal', 'rumination'],
        },
        stress_fawn: {
            label: 'Stressmuster: Beschwichtiger', color: '#c080a0', layer: 'Muster',
            what: 'Unter Druck versuchst du andere zufriedenzustellen um Konflikt zu vermeiden.',
            interpretation: 'Du hast gelernt, dass Harmonie sicherer ist als Authentizität. Das kostet langfristig viel Energie.',
            growth: 'Übe, eine kleine Meinung zu äußern, auch wenn du Widerspruch befürchtest. Beginne bei sicheren Menschen.',
            related: ['verbindung', 'bindungsstil', 'loc_internal'],
        },
        antrieb_achievement: {
            label: 'Antriebstyp: Leistung', color: '#58d4a0', layer: 'Antrieb',
            what: 'Du wirst durch Exzellenz, Verbesserung und das Übertreffen eigener Maßstäbe angetrieben.',
            interpretation: 'Du konkurrierst hauptsächlich gegen dich selbst. Wachstum und Meisterschaft sind dein natürlicher Treibstoff.',
            growth: 'Achte darauf, dass Leistungsorientierung nicht in Perfektionismus kippt. Celebrate "gut genug".',
            related: ['struktur', 'grit_ausdauer', 'mindset_growth'],
        },
        antrieb_affiliation: {
            label: 'Antriebstyp: Zugehörigkeit', color: '#f07090', layer: 'Antrieb',
            what: 'Beziehungen, Zugehörigkeit und Harmonie sind dein primärer Antrieb.',
            interpretation: 'Du arbeitest am besten wenn du dich als Teil von etwas fühlst. Isolation demotiviert dich schnell.',
            growth: 'Investiere bewusst in dein Umfeld. Die Qualität deiner Beziehungen ist direkt mit deiner Energie verbunden.',
            related: ['verbindung', 'energie', 'bindungsstil'],
        },
        antrieb_power: {
            label: 'Antriebstyp: Einfluss', color: '#a070e0', layer: 'Antrieb',
            what: 'Einfluss haben, Führung übernehmen und Wirkung erzeugen ist dein primärer Antrieb.',
            interpretation: 'Du brauchst ein Spielfeld auf dem deine Entscheidungen zählen. Ohnmacht ist für dich toxisch.',
            growth: 'Nutze deinen Power-Antrieb für echten Impact, nicht nur für Status. Die Frage: „Wofür setze ich meinen Einfluss ein?“',
            related: ['energie', 'struktur', 'loc_internal'],
        },
        // ── Intelligenztyp (kategorisch) ─────────────────────────────────────────
        intel_analytisch: {
            label: 'Intelligenztyp: Analytisch', color: '#d0a8f0', layer: 'Potenzial',
            what: 'Dein primärer Intelligenzmodus ist logisch-analytisch. Du löst Probleme durch systematisches Denken, Mustererkennung und Präzision.',
            interpretation: 'Du denkst in Systemen und Strukturen. Komplexe Probleme zerlegst du intuitiv in Teilprobleme — das macht dich zu einem wertvollen Problemlöser in anspruchsvollen Situationen.',
            growth: 'Deine analytische Stärke wird noch wertvoller in Kombination mit kreativem oder sozialem Denken. Suche Kollaboration mit anderen Intelligenztypen und übe, Ergebnisse einfach und bildlich zu kommunizieren.',
            related: ['mindset_growth', 'tiefe', 'offenheit'],
        },
        intel_sozial: {
            label: 'Intelligenztyp: Sozial', color: '#d0a8f0', layer: 'Potenzial',
            what: 'Dein primärer Intelligenzmodus ist sozial. Du verstehst Menschen intuitiv — ihre Motive, Emotionen und Dynamiken.',
            interpretation: 'Du navigierst soziale Systeme mit natürlicher Leichtigkeit. Andere Menschen sind dein primärer Denk- und Lernraum. Du liest Situationen über zwischenmenschliche Signale, nicht über Daten.',
            growth: 'Kombiniere deine soziale Intelligenz mit analytischer Tiefe. Versuche die „Warum“-Fragen hinter menschlichem Verhalten noch tiefer zu verstehen, z. B. durch Psychologie oder systemisches Denken.',
            related: ['verbindung', 'energie', 'tiefe'],
        },
        intel_kreativ: {
            label: 'Intelligenztyp: Kreativ', color: '#d0a8f0', layer: 'Potenzial',
            what: 'Dein primärer Intelligenzmodus ist kreativ. Du verbindest Unerwartetes, denkst quer und erzeugst originelle Lösungen.',
            interpretation: 'Dein Gehirn sucht aktiv nach ungewöhnlichen Verbindungen. Langeweile und Routine sind deine größten Feinde. Du siehst Möglichkeiten, die andere übersehen.',
            growth: 'Kreative Intelligenz entfaltet sich am stärksten mit Struktur als Rahmen. Setze dir absichtlich Constraints, um tiefer zu gehen statt breiter zu springen.',
            related: ['offenheit', 'werte_innovation', 'grit_passion'],
        },
        // ── Wachstumsfeld (kategorisch) ───────────────────────────────────────────
        wachstum_selbstkenntnis: {
            label: 'Wachstumsfeld: Selbsterkenntnis', color: '#f0d878', layer: 'Potenzial',
            what: 'Dein wichtigstes Wachstumsfeld ist das Innere: besser verstehen, wer du bist, was dich antreibt und was dich blockiert.',
            interpretation: 'Du erkennst, dass nachhaltiges Wachstum von innen kommt. Selbsterkenntnis ist die Grundlage aller anderen Entwicklung — und dein Kompass in einem Meer von Möglichkeiten.',
            growth: 'Journaling, Therapie, Meditation oder tiefe Einzelgespräche mit vertrauenswürdigen Menschen sind deine Wachstumsbeschleuniger. Plane mindestens 15 Minuten Reflexion pro Tag ein.',
            related: ['mindset_growth', 'tiefe', 'loc_internal'],
        },
        wachstum_fuehrung: {
            label: 'Wachstumsfeld: Führung', color: '#f0d878', layer: 'Potenzial',
            what: 'Dein Wachstumsfeld ist Führung: andere befähigen, Verantwortung übernehmen und Richtung geben.',
            interpretation: 'Du erkennst, dass dein Impact vervielfacht wird, wenn du andere entwickelst statt alles selbst zu tun. Führung ist dein nächster Entwicklungsschritt.',
            growth: 'Führung ist eine Praxis, keine Eigenschaft. Suche gezielt Situationen, in denen du Verantwortung für andere übernehmen kannst — auch im Kleinen. Mentoring, Projektleitung oder Community-Aufbau.',
            related: ['energie', 'verbindung', 'loc_internal'],
        },
        wachstum_aufbau: {
            label: 'Wachstumsfeld: Aufbau & Systeme', color: '#f0d878', layer: 'Potenzial',
            what: 'Dein Wachstumsfeld ist der Aufbau: Strukturen, Systeme und etwas Bleibendes schaffen.',
            interpretation: 'Du möchtest nicht nur im System arbeiten, sondern Systeme erschaffen. Das setzt Klarheit über Ziele und Geduld für den langen Aufbau voraus.',
            growth: 'Beginne mit einem kleinen, konkreten System, das du komplett baust und iterierst. Lerne aus dem Prozess, nicht nur aus dem Ergebnis. Wachstum durch Bauen.',
            related: ['struktur', 'grit_ausdauer', 'werte_leistung'],
        },
        wachstum_verbindung: {
            label: 'Wachstumsfeld: Verbindung', color: '#f0d878', layer: 'Potenzial',
            what: 'Dein Wachstumsfeld ist tiefere, bedeutungsvollere Verbindung: zu dir selbst, zu anderen und zu etwas Größerem.',
            interpretation: 'Du erkennst, dass Erfolg ohne echte Verbindung hohl bleibt. Beziehungsqualität ist für dich ein Kernthema — und ein Bereich, in dem noch viel Wachstumspotenzial liegt.',
            growth: 'Investiere gezielt in 3–5 wirklich wichtige Beziehungen. Tiefe vor Breite. Übe Verletzlichkeit als Verbindungsstrategie.',
            related: ['verbindung', 'bindungsstil', 'energie'],
        },
    };

    // Map displayed categorical labels → DIMENSION_EXPLANATIONS key
    const CATEGORY_KEY_MAP = {
        'Desorganisiert':   'bindungsstil_desorganisiert',
        'Sicher':           'bindungsstil_sicher',
        'Ängstlich':        'bindungsstil_aengstlich',
        'Vermeidend':       'bindungsstil_vermeidend',
        'Fight':            'stress_fight',
        'Flight':           'stress_flight',
        'Freeze':           'stress_freeze',
        'Fawn':             'stress_fawn',
        'Leistung':         'antrieb_achievement',
        'Zugehörigkeit':    'antrieb_affiliation',
        'Macht & Einfluss': 'antrieb_power',
        // Intelligenztyp
        'Analytisch':       'intel_analytisch',
        'Sozial':           'intel_sozial',
        'Kreativ':          'intel_kreativ',
        // Wachstumsfeld
        'Selbsterkenntnis': 'wachstum_selbstkenntnis',
        'Führung':          'wachstum_fuehrung',
        'Aufbau & Systeme': 'wachstum_aufbau',
        'Verbindung':       'wachstum_verbindung',
    };

    // ── Archetype similarity profiles (galaxy view) ─────────────────
    // Each entry: { dimId: [min, max], ... } — Nutzer-Score innerhalb [min,max] = gute Passung
    const ARCHETYPE_PROFILES = {
        pioneer:   { offenheit:[70,95], struktur:[30,62], energie:[48,78], werte_innovation:[65,95], loc_internal:[60,88], mindset_growth:[65,95], grit_passion:[55,85], grit_ausdauer:[42,72] },
        maker:     { offenheit:[30,62], struktur:[72,96], energie:[42,74], werte_leistung:[65,92],   loc_internal:[65,92], grit_ausdauer:[72,96], grit_passion:[58,84] },
        connector: { verbindung:[68,95], energie:[58,85], grit_passion:[48,78], werte_leistung:[20,52] },
        analyst:   { offenheit:[65,92], tiefe:[58,88], energie:[12,46], loc_internal:[48,78], mindset_growth:[52,82] },
        guardian:  { struktur:[65,90], verbindung:[58,84], werte_freiheit:[10,42], werte_innovation:[10,44], grit_ausdauer:[55,80] },
        endurer:   { grit_ausdauer:[72,96], grit_passion:[58,84], loc_internal:[60,88], mindset_growth:[50,78], struktur:[55,82] },
        free:      { offenheit:[70,95], energie:[58,85], werte_freiheit:[70,96], struktur:[10,48], grit_ausdauer:[28,62] },
    };

    // ── Galaxy view: positions for 800×600 canvas (center 400,300) ──
    const GALAXY_POSITIONS = {
        pioneer:   { x: 520, y: 120, color: '#f0a855' },
        maker:     { x: 620, y: 300, color: '#58d4a0' },
        connector: { x: 480, y: 460, color: '#f07090' },
        analyst:   { x: 260, y: 460, color: '#60a0e8' },
        guardian:  { x: 180, y: 300, color: '#88d878' },
        endurer:   { x: 580, y: 420, color: '#d878c8' },
        free:      { x: 400, y:  80, color: '#8b7cf8' },
    };

    // ── Cross-cluster resonance lines (shown when a dim node is clicked) ─
    const RESONANCE_MAP = {
        offenheit:        ['mindset_growth', 'grit_passion', 'werte_innovation'],
        struktur:         ['grit_ausdauer',  'loc_internal', 'werte_leistung'],
        energie:          ['antrieb_type',   'verbindung',   'bindungsstil'],
        verbindung:       ['bindungsstil',   'energie',      'tiefe'],
        tiefe:            ['rumination',     'bindungsstil', 'loc_internal'],
        grit_ausdauer:    ['struktur',       'loc_internal', 'mindset_growth'],
        grit_passion:     ['offenheit',      'werte_innovation', 'antrieb_type'],
        mindset_growth:   ['loc_internal',   'grit_ausdauer','offenheit'],
        loc_internal:     ['struktur',       'mindset_growth','stress_typ'],
        bindungsstil:     ['verbindung',     'energie',      'tiefe'],
        rumination:       ['tiefe',          'stress_typ',   'mindset_growth'],
        stress_typ:       ['loc_internal',   'tiefe',        'rumination'],
        antrieb_type:     ['energie',        'grit_passion', 'werte_leistung'],
        werte_innovation: ['offenheit',      'grit_passion', 'loc_internal'],
        werte_leistung:   ['struktur',       'grit_ausdauer','antrieb_type'],
        werte_freiheit:   ['offenheit',      'energie',      'loc_internal'],
        intel_primary:    ['mindset_growth', 'tiefe',        'offenheit'],
        wachstumsfeld:    ['mindset_growth', 'grit_passion', 'loc_internal'],
    };

    return { QUESTIONS, ARCHETYPES, SYNERGIES, DIMS, PHASES, LEVEL_LABELS, DIMENSION_EXPLANATIONS, CATEGORY_KEY_MAP, ARCHETYPE_PROFILES, GALAXY_POSITIONS, RESONANCE_MAP };
})();
