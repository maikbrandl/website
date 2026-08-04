/* ============================================================
   Atlas der Philosophie – Datenbasis
   Quelle: "Die Philosophie der Welt – Ein umfassender Überblick"
   (hybridlog · Recherche, Stand Juli 2026)
   Auf Grundlage von SEP · IEP · Britannica · Routledge
   ============================================================ */

window.PHILO = (function () {
    'use strict';

    /* ── Traditionen / Bereiche (Farben je Region) ── */
    var traditions = [
        { id: 'west',    label: 'Westliche Philosophie',        color: '#c9a84c' },
        { id: 'indisch', label: 'Indische Philosophie',         color: '#e0894b' },
        { id: 'china',   label: 'Chinesische Philosophie',      color: '#d85c5c' },
        { id: 'islam',   label: 'Islamische Philosophie',       color: '#4fae86' },
        { id: 'juedisch',label: 'Jüdische Philosophie',         color: '#6a8fd8' },
        { id: 'afrika',  label: 'Afrikanische Philosophie',     color: '#b06fd0' },
        { id: 'latam',   label: 'Lateinamerikanische Phil.',    color: '#d86ba0' }
    ];

    /* ── Epochen (für die westliche Chronologie / Zeitstrahl-Bänder) ── */
    var epochs = [
        { id: 'antike',      label: 'Antike',              from: -600, to: 500,  short: 'ca. 600 v. Chr. – 500 n. Chr.' },
        { id: 'mittelalter', label: 'Mittelalter',         from: 500,  to: 1400, short: 'ca. 500 – 1500' },
        { id: 'renaissance', label: 'Renaissance',         from: 1400, to: 1600, short: 'ca. 1400 – 1600' },
        { id: 'neuzeit',     label: 'Neuzeit & Aufklärung', from: 1600, to: 1780, short: '17.–18. Jh.' },
        { id: 'idealismus',  label: '19. Jahrhundert',     from: 1780, to: 1900, short: 'Idealismus & Gegenbewegungen' },
        { id: 'moderne',     label: '20./21. Jh.',         from: 1900, to: 2030, short: 'Analytisch & kontinental' }
    ];

    /* ── Teildisziplinen (Teil 5) ── */
    var disziplinen = [
        { id: 'metaphysik',   label: 'Metaphysik & Ontologie',        desc: 'Die grundlegendste Disziplin fragt nach dem, was überhaupt existiert und wie es beschaffen ist: Sein und Werden, Substanz und Eigenschaft, Ursache und Wirkung, Raum und Zeit, Gott, Geist und Materie, Notwendigkeit und Möglichkeit, persönliche Identität und Willensfreiheit.' },
        { id: 'epistemologie',label: 'Erkenntnistheorie',             desc: 'Sie untersucht Wesen, Quellen, Umfang und Grenzen des Wissens: Was heißt es, etwas zu „wissen"? Welche Rolle spielen Wahrnehmung, Vernunft, Gedächtnis, Zeugnis? Was unterscheidet begründete Überzeugung von bloßer Meinung? Zentrale Themen sind Wahrheit, Rechtfertigung, Gewissheit und der Umgang mit dem Skeptizismus.' },
        { id: 'logik',        label: 'Logik',                         desc: 'Die Lehre vom gültigen Schließen. Sie klärt, wann ein Argument korrekt ist, unabhängig von seinem Inhalt – von der aristotelischen Syllogistik über die moderne Prädikatenlogik (Frege) bis zu Modal- und mehrwertigen Logiken.' },
        { id: 'ethik',        label: 'Ethik (Moralphilosophie)',      desc: 'Sie fragt nach dem guten und richtigen Handeln. Die Metaethik untersucht die Natur moralischer Aussagen, die normative Ethik begründet Handlungsprinzipien (Tugend-, Pflicht-, Nutzenethik), die angewandte Ethik behandelt konkrete Felder wie Medizin, Umwelt, Wirtschaft, Technik und künstliche Intelligenz.' },
        { id: 'politik',      label: 'Politische & Sozialphilosophie',desc: 'Sie fragt nach der gerechten Ordnung des Zusammenlebens: Legitimität von Herrschaft, Gerechtigkeit, Freiheit und Gleichheit, Recht und Staat, Demokratie, Menschenrechte und Macht.' },
        { id: 'aesthetik',    label: 'Ästhetik',                      desc: 'Die Philosophie der Kunst und des Schönen: Was ist ein Kunstwerk? Gibt es objektive Kriterien des Geschmacks? Wie verhalten sich Schönheit, Erhabenheit und Wahrheit zueinander?' },
        { id: 'sprache',      label: 'Sprachphilosophie',             desc: 'Sie untersucht Bedeutung, Referenz, Wahrheit und das Verhältnis von Sprache, Denken und Wirklichkeit – ein Schwerpunkt der analytischen Tradition (Frege, Wittgenstein).' },
        { id: 'wissenschaft', label: 'Wissenschaftsphilosophie',      desc: 'Sie reflektiert Methode, Struktur, Fortschritt und Grenzen der Wissenschaften: Was unterscheidet Wissenschaft von Nicht-Wissenschaft (Popper: Falsifizierbarkeit)? Wie entstehen Theorien und Paradigmenwechsel (Kuhn)?' },
        { id: 'geist',        label: 'Philosophie des Geistes',       desc: 'Sie behandelt Bewusstsein, mentale Zustände und das Leib-Seele-Problem: Wie verhalten sich Gehirn und Geist? Was ist Bewusstsein? Kann es künstliches Bewusstsein geben? Ein besonders aktives Gebiet der Gegenwartsphilosophie.' }
    ];

    /* ── Strömungen / Denkrichtungen (Teil 4), gruppiert ── */
    var stroemungGroups = [
        { id: 'g-erkenntnis', label: 'Erkenntnistheorie & Metaphysik' },
        { id: 'g-existenz',   label: 'Existenz, Bewusstsein, Sprache' },
        { id: 'g-ethik',      label: 'Ethik & politische Philosophie' }
    ];

    var stroemungen = [
        // Erkenntnistheorie & Metaphysik
        { id: 'rationalismus', group: 'g-erkenntnis', label: 'Rationalismus', core: 'Vernunft ist die primäre Quelle sicheren Wissens; angeborene Ideen.', reps: ['descartes', 'spinoza', 'leibniz'] },
        { id: 'empirismus',    group: 'g-erkenntnis', label: 'Empirismus',    core: 'Alles Wissen stammt aus der Sinneserfahrung.', reps: ['locke', 'berkeley', 'hume'] },
        { id: 'idealismus',    group: 'g-erkenntnis', label: 'Idealismus',    core: 'Die Wirklichkeit ist wesentlich geistig / durch den Geist bestimmt.', reps: ['platon', 'berkeley', 'kant', 'hegel'] },
        { id: 'materialismus', group: 'g-erkenntnis', label: 'Materialismus', core: 'Nur Materie ist wirklich; Geist ist ein Naturphänomen.', reps: ['demokrit', 'marx'] },
        { id: 'skeptizismus',  group: 'g-erkenntnis', label: 'Skeptizismus',  core: 'Sicheres Wissen ist unmöglich oder fraglich; Urteilszurückhaltung.', reps: ['pyrrhon', 'hume'] },
        { id: 'positivismus',  group: 'g-erkenntnis', label: 'Positivismus',  core: 'Nur empirisch-wissenschaftlich Prüfbares ist gültiges Wissen.', reps: ['popper'] },
        { id: 'nominalismus',  group: 'g-erkenntnis', label: 'Realismus / Nominalismus', core: 'Streit, ob Allgemeinbegriffe real existieren oder bloße Namen sind.', reps: ['thomas', 'ockham'] },
        // Existenz, Bewusstsein, Sprache
        { id: 'existenzialismus', group: 'g-existenz', label: 'Existenzialismus', core: 'Existenz vor Essenz; Freiheit, Wahl und Verantwortung des Einzelnen.', reps: ['kierkegaard', 'dostojewski', 'sartre'] },
        { id: 'phaenomenologie',  group: 'g-existenz', label: 'Phänomenologie', core: 'Beschreibung der Strukturen des bewussten Erlebens.', reps: ['husserl', 'heidegger', 'merleau'] },
        { id: 'analytische',      group: 'g-existenz', label: 'Analytische Philosophie', core: 'Klarheit durch Logik und Sprachanalyse.', reps: ['frege', 'russell', 'wittgenstein'] },
        { id: 'pragmatismus',     group: 'g-existenz', label: 'Pragmatismus', core: 'Bedeutung und Wahrheit bemessen sich an praktischen Folgen.', reps: ['peirce'] },
        { id: 'strukturalismus',  group: 'g-existenz', label: 'Strukturalismus / Poststrukturalismus', core: 'Bedeutung entsteht aus Strukturen; Kritik fixer Bedeutungen.', reps: ['foucault'] },
        { id: 'hermeneutik',      group: 'g-existenz', label: 'Hermeneutik', core: 'Theorie und Kunst des Verstehens und Auslegens.', reps: ['merleau'] },
        // Ethik & politische Philosophie
        { id: 'tugendethik',    group: 'g-ethik', label: 'Tugendethik', core: 'Gut ist, wer einen guten Charakter (Tugenden) ausbildet.', reps: ['aristoteles', 'konfuzius'] },
        { id: 'deontologie',    group: 'g-ethik', label: 'Deontologie', core: 'Moral folgt aus Pflichten und Prinzipien, nicht aus Folgen.', reps: ['kant'] },
        { id: 'utilitarismus',  group: 'g-ethik', label: 'Utilitarismus / Konsequentialismus', core: 'Richtig ist, was den größten Gesamtnutzen bewirkt.', reps: ['mill'] },
        { id: 'kontraktualismus',group: 'g-ethik', label: 'Kontraktualismus', core: 'Gerechtigkeit als Ergebnis eines (fiktiven) Vertrags.', reps: ['locke', 'rousseau', 'rawls'] },
        { id: 'liberalismus',   group: 'g-ethik', label: 'Liberalismus', core: 'Vorrang individueller Freiheit und Rechte.', reps: ['locke', 'mill', 'rawls'] },
        { id: 'marxismus',      group: 'g-ethik', label: 'Marxismus / Kritische Theorie', core: 'Analyse und Kritik von Klasse, Herrschaft, Ideologie.', reps: ['marx', 'frankfurt'] },
        { id: 'feminismus',     group: 'g-ethik', label: 'Feministische Philosophie', core: 'Analyse von Geschlecht, Gleichheit und Macht.', reps: ['sartre'] }
    ];

    /* ── Denker & Schulen ──
       year = numerischer Sortier-/Positionswert (Geburt/Blüte, negativ = v. Chr.)
       str  = Strömungen · dis = Teildisziplinen

       book (optional) = Amazon-Affiliate-Buchempfehlung im Detail-Panel:
         book: { title: 'Der Staat', author: 'Platon', url: 'https://www.amazon.de/dp/XXXXXXX?tag=DEIN-TAG-21' }
       Einfach bei einem Denker ergänzen, sobald ein passender Affiliate-Link vorliegt –
       ohne "book"-Feld erscheint im Panel keine Buchempfehlung.                */
    var thinkers = [
        /* ─── ANTIKE ─── */
        { id: 'thales', name: 'Thales von Milet', meta: 'ca. 624–546 v. Chr. · Milesische Schule', year: -624, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['metaphysik'],
          desc: 'Gilt traditionell als erster Philosoph des Abendlandes. Er erklärte das Wasser zum Urstoff aller Dinge und versuchte, Naturphänomene ohne Rückgriff auf die Götter zu deuten. Ihm werden auch geometrische und astronomische Leistungen zugeschrieben.',
          kernidee: 'Die Welt lässt sich aus einem einzigen natürlichen Grundstoff erklären, ohne auf Götter oder Mythen zurückzugreifen.',
          inhalt: 'Thales von Milet gilt als erster Philosoph des Abendlandes, weil er als Erster nach einer natürlichen Ursache aller Dinge suchte statt nach mythischen Erklärungen. Er bestimmte das Wasser als [[arche:Urstoff]] (archḗ), aus dem alles entsteht und in das alles vergeht. Zugleich beobachtete er den Himmel systematisch und soll eine Sonnenfinsternis vorhergesagt haben. Auch geometrische Lehrsätze werden ihm zugeschrieben.',
          wirkung: 'Mit dieser Suche nach einem natürlichen Urgrund begründete Thales die abendländische Naturphilosophie und damit den Beginn dessen, was wir heute Wissenschaft nennen. Spätere Denker der Milesischen Schule übernahmen seine Fragestellung, auch wenn sie andere Antworten gaben.',
          kritik: 'Wie Thales genau zu seiner Wasser-These kam, ist unklar, da keine eigenen Schriften erhalten sind; wir kennen ihn nur aus späteren Berichten, vor allem von Aristoteles. Ob er die vielen ihm zugeschriebenen astronomischen und mathematischen Leistungen tatsächlich vollbracht hat, lässt sich historisch nicht sicher belegen.',
          quellen: [
            'Internet Encyclopedia of Philosophy (IEP): „Thales of Miletus" – https://iep.utm.edu/thales/',
            'Stanford Encyclopedia of Philosophy (SEP): „Presocratic Philosophy" – https://plato.stanford.edu/entries/presocratics/'
          ] },
        { id: 'anaximander', name: 'Anaximander & Anaximenes', meta: '6. Jh. v. Chr. · Milesische Schule', year: -580, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['metaphysik'],
          hauptvertreter: 'Anaximander, Anaximenes',
          desc: 'Anaximander setzte das unbegrenzte Apeiron als Urprinzip an; Anaximenes die Luft. Gemeinsam begründeten die Milesier die Idee einer aus einem Prinzip erklärbaren, gesetzmäßigen Natur.',
          kernidee: 'Der Ursprung aller Dinge kann nicht selbst eines der bekannten Elemente sein, sondern muss unbestimmt und unbegrenzt sein.',
          inhalt: 'Anaximander, ebenfalls aus Milet, setzte als Urprinzip das [[apeiron:Apeiron]] an – das Unbegrenzte, Unbestimmte, aus dem Gegensätze wie Warm und Kalt hervorgehen. Er dachte sich die Erde erstmals als frei im Raum schwebenden Körper, ohne Stütze von unten, und zeichnete die älteste bekannte Weltkarte. Sein Schüler Anaximenes ersetzte das Apeiron durch die Luft, die sich durch Verdichtung und Verdünnung in Feuer, Wind, Wolken, Wasser und Erde verwandelt.',
          wirkung: 'Anaximanders Idee einer freischwebenden Erde und eines abstrakten, nicht-stofflichen Urprinzips war ein gewaltiger gedanklicher Sprung und beeinflusste die gesamte spätere Kosmologie. Anaximenes zeigte, wie sich Vielfalt durch einen einzigen Mechanismus (Verdichtung/Verdünnung) erklären lässt.',
          kritik: 'Da nur ein einziger, umstrittener Satz Anaximanders im Original erhalten ist, bleibt die genaue Bedeutung des Apeiron bis heute in der Forschung umstritten. Anaximenes\' Rückkehr zu einem konkreten Element (Luft) wurde später als Rückschritt hinter Anaximanders abstrakteren Ansatz gelesen.',
          quellen: [
            'Internet Encyclopedia of Philosophy (IEP): „Anaximander" – https://iep.utm.edu/anaximander/',
            'Stanford Encyclopedia of Philosophy (SEP): „Presocratic Philosophy" – https://plato.stanford.edu/entries/presocratics/'
          ] },
        { id: 'pythagoras', name: 'Pythagoras', meta: 'ca. 570–495 v. Chr. · Pythagoreer', year: -570, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          desc: 'Sah in Zahlen und mathematischen Verhältnissen das Wesen der Wirklichkeit. Seine Schule verband Mathematik, Musiktheorie und die Lehre von der Seelenwanderung und prägte die abendländische Idee einer mathematisch geordneten Welt.',
          kernidee: 'Zahlen und mathematische Verhältnisse sind nicht nur ein Hilfsmittel, sondern das eigentliche Wesen der Wirklichkeit.',
          inhalt: 'Pythagoras gründete in Kroton eine religiös-philosophische Gemeinschaft, die Wissenschaft und Lebensweise verband, mit Regeln zu Ernährung, Ritualen und einer Lehre von der Seelenwanderung (Reinkarnation). Er selbst hinterließ keine Schriften; spätere Pythagoreer wie Philolaos entwickelten die Idee, dass die Welt durch Zahlenverhältnisse und Harmonie geordnet sei – etwa in der Musik, wo einfache Zahlenverhältnisse wohlklingende Intervalle erzeugen.',
          wirkung: 'Die pythagoreische Verbindung von Mathematik und Weltordnung beeinflusste Platon stark und prägt bis heute die Idee einer mathematisch beschreibbaren Natur. Der nach ihm benannte Lehrsatz der Geometrie zählt zu den bekanntesten Ergebnissen der Mathematikgeschichte.',
          kritik: 'Wie viel von der späteren pythagoreischen Zahlenlehre tatsächlich auf Pythagoras selbst zurückgeht, ist historisch kaum zu klären, da schon in der Antike zwischen ihm und seinen Nachfolgern nicht sauber unterschieden wurde. Zeitgenossen wie Heraklit warfen ihm vor, große Gelehrsamkeit ohne wirkliches Verständnis angehäuft zu haben.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Pythagoras" – https://plato.stanford.edu/entries/pythagoras/',
            'Stanford Encyclopedia of Philosophy (SEP): „Presocratic Philosophy" – https://plato.stanford.edu/entries/presocratics/'
          ] },
        { id: 'heraklit', name: 'Heraklit', meta: 'ca. 540–480 v. Chr. · Ephesos', year: -540, tradition: 'west', epoch: 'antike', str: [], dis: ['metaphysik'],
          desc: '„Alles fließt" (panta rhei): Heraklit betonte den beständigen Wandel und den Gegensatz als treibende Kraft. Das ordnende Weltgesetz nannte er Logos.',
          kernidee: 'Die Wirklichkeit ist kein fester Bestand, sondern ein beständiger Wandel, der von einer verborgenen, vernünftigen Ordnung zusammengehalten wird.',
          inhalt: 'Heraklit von Ephesos lehrte, dass alles im Fluss ist (panta rhei) und dass Gegensätze wie Tag und Nacht oder Krieg und Frieden in Wahrheit zusammengehören und sich gegenseitig hervorbringen. Diese verborgene Ordnung, die den ständigen Wandel lenkt, nannte er [[logos:Logos]]. Er schrieb in bewusst rätselhaften, kurzen Sprüchen und hielt die meisten Menschen für unfähig, den Logos zu erkennen, obwohl er allem gemeinsam ist.',
          wirkung: 'Heraklits Bild einer Welt im ständigen Werden wurde zum Gegenpol der Lehre des Parmenides vom unveränderlichen Sein und prägt bis heute Debatten über Identität, Wandel und Zeit. Der Begriff Logos wurde später von der Stoa aufgegriffen.',
          kritik: 'Schon in der Antike galt Heraklit als „der Dunkle" wegen seines rätselhaften Stils; Platon warf ihm eine widersprüchliche Position vor, Aristoteles eine Verletzung des Satzes vom Widerspruch. Wie wörtlich seine Fluss-Aussagen gemeint waren, ist in der Forschung bis heute umstritten.',
          zitat: { text: 'Man kann nicht zweimal in denselben Fluss steigen.', quelle: 'Sinngemäße Zusammenfassung der Fluss-Fragmente DK22B12/B49a/B91; vgl. SEP: „Heraclitus"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Heraclitus" – https://plato.stanford.edu/entries/heraclitus/',
            'Stanford Encyclopedia of Philosophy (SEP): „Presocratic Philosophy" – https://plato.stanford.edu/entries/presocratics/'
          ] },
        { id: 'parmenides', name: 'Parmenides & die Eleaten', meta: 'ca. 515–450 v. Chr. · Elea', year: -515, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik', 'logik'],
          hauptvertreter: 'Parmenides, Zenon von Elea',
          desc: 'Parmenides stellte dem Werden das unveränderliche, einheitliche Sein gegenüber: Was ist, ist; Werden und Vergehen seien bloßer Schein. Sein Schüler Zenon verteidigte diese Lehre mit den berühmten Paradoxien (Achilles und die Schildkröte).',
          kernidee: 'Was wirklich ist, kann nicht entstehen oder vergehen, sich verändern oder aus dem Nichts kommen – Werden und Vielfalt sind nur täuschender Schein.',
          inhalt: 'Parmenides von Elea argumentierte in einem Lehrgedicht, dass nur das strenge Denken, nicht die Sinneswahrnehmung, zur Wahrheit führt: Was ist, muss vollständig, unveränderlich und eines sein, denn aus dem Nichts kann nichts werden. Sein Schüler Zenon verteidigte diese Lehre mit berühmten Paradoxien wie dem Wettlauf von Achilles und der Schildkröte, die zeigen sollen, dass Bewegung und Vielheit logisch widersprüchlich sind.',
          wirkung: 'Mit der scharfen Trennung von Sein (Wahrheit) und Schein (Sinneswelt) stellte Parmenides Maßstäbe für rationales Argumentieren auf, an denen sich Platon, Aristoteles und die spätere Metaphysik abarbeiten mussten. Zenons Paradoxien beschäftigen bis heute Mathematik und Physik von Raum, Zeit und Unendlichkeit.',
          kritik: 'Parmenides\' Position scheint der alltäglichen Erfahrung von Wandel und Bewegung fundamental zu widersprechen, weshalb spätere Denker wie die Pluralisten und Atomisten nach Auswegen suchten, die seine Argumente anerkennen, aber Veränderung dennoch erklären. Aristoteles hielt Zenons Paradoxien für auflösbar, sobald man Raum und Zeit als unendlich teilbar, aber dennoch durchquerbar versteht.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Parmenides" – https://plato.stanford.edu/entries/parmenides/',
            'Stanford Encyclopedia of Philosophy (SEP): „Presocratic Philosophy" – https://plato.stanford.edu/entries/presocratics/'
          ] },
        { id: 'demokrit', name: 'Demokrit', meta: 'ca. 460–370 v. Chr. · Atomismus', year: -460, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['metaphysik'],
          desc: 'Entwarf mit Leukipp die Lehre, alles bestehe aus unteilbaren Atomen und leerem Raum. Der antike Atomismus ist ein früher Vorläufer materialistischer und naturwissenschaftlicher Weltbilder.',
          kernidee: 'Alles in der Welt besteht letztlich nur aus unteilbaren Teilchen (Atomen) und leerem Raum – alles andere ist bloße Konvention der Wahrnehmung.',
          inhalt: 'Demokrit entwickelte zusammen mit seinem Lehrer Leukipp die Lehre, dass unzählige, unteilbare, ewige Atome sich im leeren Raum bewegen und durch ihre Form, Anordnung und Lage alle Eigenschaften der Dinge erzeugen. Farbe, Geschmack oder Wärme existieren seiner Lehre nach nur „der Konvention nach", in Wirklichkeit gibt es nur Atome und Leere. Für das gute Leben empfahl er innere Heiterkeit (Euthymie) durch Mäßigung.',
          wirkung: 'Der antike Atomismus ist ein früher Vorläufer naturwissenschaftlicher, materialistischer Weltbilder und nahm zentrale Ideen der modernen Physik über kleinste Teilchen vorweg. Seine Ethik der Gelassenheit beeinflusste später Epikur.',
          kritik: 'Da Demokrits Werke nur in Fragmenten und über spätere Berichterstatter wie Aristoteles überliefert sind, bleibt unklar, wie genau er Wahrnehmung und Wissen zueinander ins Verhältnis setzte. Aristoteles kritisierte, dass der Atomismus keine Zwecke oder Ziele (Teleologie) in der Natur zulasse und Bewegung nicht hinreichend erkläre.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Democritus" – https://plato.stanford.edu/entries/democritus/',
            'Stanford Encyclopedia of Philosophy (SEP): „Atomism: Ancient" – https://plato.stanford.edu/entries/atomism-ancient/'
          ] },
        { id: 'sophisten', name: 'Die Sophisten', meta: '5. Jh. v. Chr. · Protagoras, Gorgias', year: -450, tradition: 'west', epoch: 'antike', str: ['skeptizismus'], dis: ['epistemologie', 'sprache'],
          hauptvertreter: 'Protagoras, Gorgias',
          desc: 'Im 5. Jahrhundert verlagerte sich das Interesse von der Natur auf den Menschen, auf Sprache, Recht und Moral. Die Sophisten (u. a. Protagoras – „Der Mensch ist das Maß aller Dinge" – und Gorgias) waren Wanderlehrer der Rhetorik und vertraten einen frühen Relativismus.',
          kernidee: 'Nicht die Natur, sondern der Mensch steht im Mittelpunkt: Wissen, Wahrheit und Moral hängen vom Betrachter und von der Gesellschaft ab.',
          inhalt: 'Die Sophisten waren wandernde Lehrer, die im 5. Jahrhundert v. Chr. gegen Bezahlung Rhetorik und praktisches Wissen für gesellschaftlichen Erfolg vermittelten. Protagoras prägte den [[relativismus:relativistischen]] Satz „Der Mensch ist das Maß aller Dinge“: Wie etwas erscheint, so ist es für den, dem es erscheint. Andere Sophisten stritten darüber, ob Gesetze und Sitten ([[nomos:Nomos]]) der Natur ([[physis:Physis]]) entsprechen oder ihr widersprechen.',
          wirkung: 'Damit rückten die Sophisten Sprache, Erziehung und Gesellschaft ins Zentrum der Philosophie und lösten die reine Naturbetrachtung der frühen Denker ab. Ihre Streitkultur und Rhetorik prägen bis heute die Grundlagen von Argumentation und politischer Rede.',
          kritik: 'Platon und Aristoteles kritisierten die Sophisten scharf als bezahlte Wortakrobaten, denen es mehr um den Sieg im Streit als um Wahrheit gehe – daher stammt die bis heute abwertende Bedeutung des Wortes „Sophisterei“. Weil sie moralische Maßstäbe für gesellschaftlich relativ erklärten, warf man ihnen vor, jede Position beliebig verteidigen zu können.',
          zitat: { text: 'Der Mensch ist das Maß aller Dinge: der seienden, dass sie sind, der nicht seienden, dass sie nicht sind.', quelle: 'Protagoras, überliefert bei Platon, „Theaitetos“ 151e (DK 80B1); vgl. SEP: „The Sophists", Abschnitt 1' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „The Sophists" – https://plato.stanford.edu/entries/sophists/',
            'Internet Encyclopedia of Philosophy (IEP): „The Sophists (Ancient Greek)" – https://iep.utm.edu/sophists/'
          ] },
        { id: 'sokrates', name: 'Sokrates', meta: '469–399 v. Chr. · Athen · Begründer der Ethik', year: -469, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['ethik', 'epistemologie'], entry: true,
          desc: 'Sokrates schrieb selbst nichts; wir kennen ihn vor allem durch seinen Schüler Platon. Mit seiner Methode des prüfenden Gesprächs (Elenchos, „sokratische Ironie" und „Hebammenkunst") deckte er Scheinwissen auf und machte die Frage nach dem richtigen Leben zum Zentrum der Philosophie. 399 v. Chr. wurde er wegen „Gottlosigkeit" und „Verführung der Jugend" zum Tod durch den Schierlingsbecher verurteilt – ein Gründungsmythos der intellektuellen Redlichkeit.',
          kernidee: 'Der Anfang aller Erkenntnis ist das Eingeständnis der eigenen Unwissenheit – erst wer das zugibt, kann wirklich nach der Wahrheit suchen.',
          inhalt: 'Sokrates schrieb nichts; wir kennen ihn vor allem durch seinen Schüler Platon. Statt Naturphänomene zu erklären, befragte er Athener auf der Straße nach Tugend, Gerechtigkeit und dem guten Leben. Mit seiner Methode, dem [[elenchos:Elenchos]], deckte er auf, dass viele vermeintlich weise Bürger ihre eigenen Begriffe nicht klar erklären konnten. Er nannte sich selbst eine „Hebamme des Denkens“, die fremden Gedanken zur Klarheit verhilft.',
          wirkung: 'Diese Methode des kritischen Nachfragens prägt die Philosophie bis heute. Über Platon wurde Sokrates zur Gründerfigur der abendländischen Philosophie, und sein Satz, ein ungeprüftes Leben sei nicht lebenswert, gilt bis heute als Aufforderung zur Selbstreflexion.',
          kritik: 'Der Komödiendichter Aristophanes verspottete Sokrates in den „Wolken“ (423 v. Chr.) als Sophisten, der Naturphänomene erklärt und die schwächere Argumentation zur stärkeren macht. 399 v. Chr. verurteilte ihn ein athenisches Gericht wegen Gottlosigkeit und angeblicher Verführung der Jugend zum Tod.',
          zitat: { text: 'Ich weiß, dass ich nichts weiß.', quelle: 'Traditionelle sinngemäße Zusammenfassung von Platons „Apologie" 21a–23b (Orakelspruch von Delphi, sokratische Unwissenheit); vgl. IEP: „Socrates", Abschnitt „Socratic Ignorance"' },
          quellen: [
            'Internet Encyclopedia of Philosophy (IEP): „Socrates" – https://iep.utm.edu/socrates/',
            'Stanford Encyclopedia of Philosophy (SEP): „Socrates" – https://plato.stanford.edu/entries/socrates/'
          ] },
        { id: 'platon', name: 'Platon', meta: '428/427–348/347 v. Chr. · Gründer der Akademie', year: -427, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik', 'epistemologie', 'politik'],
          desc: 'Einer der einflussreichsten Denker überhaupt. In kunstvollen Dialogen entwickelte er die Ideenlehre: Hinter der wandelbaren Sinnenwelt liegt eine Welt unveränderlicher, vollkommener Ideen (Formen), an denen die Dinge nur „teilhaben". Das Höhlengleichnis veranschaulicht den Aufstieg der Erkenntnis vom Schein zur Wahrheit. In der Politeia entwarf er den idealen, von „Philosophenkönigen" geleiteten Staat. Sein Werk begründete Metaphysik, Erkenntnistheorie und politische Philosophie zugleich.',
          kernidee: 'Hinter der veränderlichen Welt der Sinne liegt eine Welt vollkommener, unveränderlicher Ideen, an der alles Sichtbare nur Anteil hat.',
          inhalt: 'In kunstvollen Dialogen entwickelte Platon die Ideenlehre: Einzeldinge sind nur unvollkommene Abbilder ewiger Ideen (Formen) wie der Gerechtigkeit oder der Schönheit. Das Höhlengleichnis veranschaulicht den mühsamen Aufstieg der Seele vom Schein zur Erkenntnis der Wahrheit. In der „Politeia" entwarf er einen idealen Staat, der von philosophisch gebildeten „Philosophenkönigen" geleitet wird.',
          wirkung: 'Platons Werk begründete zugleich Metaphysik, Erkenntnistheorie und politische Philosophie und gilt als derart grundlegend, dass Alfred North Whitehead die spätere abendländische Philosophie als „eine Reihe von Fußnoten zu Platon" bezeichnete. Seine Akademie in Athen bestand fast 900 Jahre.',
          kritik: 'Sein eigener Schüler Aristoteles kritisierte die Ideenlehre scharf: Wie können abstrakte Ideen unabhängig von den Dingen existieren, an denen sie angeblich teilhaben? Der Versuch, seine politische Utopie im sizilianischen Syrakus in die Praxis umzusetzen, scheiterte für Platon persönlich gefährlich und ergebnislos.',
          zitat: { text: 'Der Anfang ist der wichtigste Teil der Arbeit.', quelle: 'Platon, „Politeia" 377b; vgl. SEP: „Plato"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Plato" – https://plato.stanford.edu/entries/plato/',
            'Internet Encyclopedia of Philosophy (IEP): „Plato" – https://iep.utm.edu/plato/'
          ],
          book: { title: 'Der Staat', author: 'Platon', url: 'https://link.amazon/B0gpLNCNC' } },
        { id: 'aristoteles', name: 'Aristoteles', meta: '384–322 v. Chr. · Gründer des Lyzeums', year: -384, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['logik', 'metaphysik', 'ethik', 'politik'],
          desc: 'Platons bedeutendster Schüler und der wohl universalste Gelehrte der Antike. Er begründete die formale Logik (Syllogistik), systematisierte Biologie, Physik, Ethik, Politik, Rhetorik und Poetik. Gegen Platon verlegte er das Wesen (die „Form") in die Einzeldinge selbst. Seine Nikomachische Ethik begründet die Tugendethik: Das Gute liegt in der rechten Mitte (Mesotes), Ziel ist die Eudaimonia (gelingendes Leben). Über die arabische Welt prägte Aristoteles das gesamte europäische Mittelalter.',
          kernidee: 'Das Wesen der Dinge steckt nicht in einer separaten Ideenwelt, sondern in den Einzeldingen selbst – und das gute Leben besteht im vernünftigen Handeln nach der rechten Mitte.',
          inhalt: 'Gegen seinen Lehrer Platon vertrat Aristoteles, dass Form und Materie untrennbar in den Einzeldingen selbst existieren. Er begründete die formale Logik (Syllogistik) und systematisierte nahezu jedes Wissensgebiet seiner Zeit: Biologie, Physik, Ethik, Politik, Rhetorik und Poetik. In der „Nikomachischen Ethik" verortet er das gute Handeln in der Mitte (Mesotes) zwischen zwei Extremen und definiert das Ziel des Lebens als Eudaimonia, das gelingende, tugendhafte Leben.',
          wirkung: 'Über die arabische Welt (u. a. Avicenna, Averroes) gelangte Aristoteles\' Werk zurück nach Europa und prägte dort fast das gesamte mittelalterliche Denken, allen voran Thomas von Aquin. Seine Logik und Tugendethik werden bis heute in Philosophie und Wissenschaft verwendet.',
          kritik: 'Aristoteles\' Physik und Kosmologie mit der Erde im Zentrum des Universums erwiesen sich in der wissenschaftlichen Revolution als grundlegend falsch und mussten von Kopernikus, Galilei und Newton überwunden werden. Seine Rechtfertigung der Sklaverei als „von Natur aus" gilt heute als eine der problematischsten Stellen seines Werks.',
          zitat: { text: 'Der Mensch ist von Natur aus ein staatenbildendes Lebewesen (zoon politikon).', quelle: 'Aristoteles, „Politik" 1253a; vgl. SEP: „Aristotle\'s Political Theory"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Aristotle" – https://plato.stanford.edu/entries/aristotle/',
            'Internet Encyclopedia of Philosophy (IEP): „Aristotle" – https://iep.utm.edu/aristotl/'
          ],
          book: { title: 'Nikomachische Ethik', author: 'Aristoteles', url: 'https://link.amazon/B04Ie1PfP' } },
        { id: 'epikur', name: 'Epikur', meta: '341–270 v. Chr. · Epikureismus', year: -341, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['ethik'],
          desc: 'Lehrte, das höchste Gut sei die Lust, richtig verstanden als dauerhafte Schmerz- und Angstfreiheit (Ataraxie). Er verband dies mit dem Atomismus und einer Ethik des maßvollen, freundschaftlichen Lebens im „Garten".',
          kernidee: 'Das höchste Gut ist die Lust – aber richtig verstanden als dauerhafte Freiheit von Schmerz und Angst, nicht als hemmungsloser Genuss.',
          inhalt: 'Epikur lehrte in seinem „Garten" bei Athen eine Ethik der Ataraxie (Seelenruhe) und Aponie (Schmerzfreiheit), die durch einfache Bedürfnisse, Freundschaft und die Überwindung von Ängsten erreicht wird – vor allem der Angst vor Göttern und vor dem Tod. Er übernahm den Atomismus Demokrits, um zu zeigen, dass die Seele mit dem Körper vergeht und der Tod uns daher nichts angeht, solange wir leben.',
          wirkung: 'Epikurs Verbindung von Naturphilosophie und praktischer Lebenskunst machte den Epikureismus zu einer der einflussreichsten Schulen der Antike, deren Ideen über Lukrez\' Lehrgedicht „De rerum natura" bis in die Neuzeit wirkten. Der oft missverstandene Begriff „epikureisch" für zügellosen Genuss verkehrt seine tatsächlich asketische Lehre ins Gegenteil.',
          kritik: 'Kritiker warfen Epikur vor, mit der Lust als höchstem Gut die Tür zu Hedonismus und Verantwortungslosigkeit zu öffnen, obwohl er selbst ein zurückgezogenes, bescheidenes Leben lehrte. Seine Vorstellung, dass Atome gelegentlich zufällig von ihrer Bahn abweichen (Klinamen), um Willensfreiheit zu ermöglichen, blieb naturphilosophisch unbegründet.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Epicurus" – https://plato.stanford.edu/entries/epicurus/',
            'Internet Encyclopedia of Philosophy (IEP): „Epicurus" – https://iep.utm.edu/epicur/'
          ] },
        { id: 'stoa', name: 'Zenon von Kition & die Stoa', meta: '334–262 v. Chr. · Stoizismus', year: -334, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['ethik'],
          hauptvertreter: 'Zenon von Kition, Seneca, Epiktet, Mark Aurel',
          desc: 'Begründer der Stoa. Ideal ist das Leben „gemäß der Natur" und der Vernunft (Logos): Tugend allein macht glücklich, äußere Güter sind gleichgültig. Spätere Stoiker – Seneca, Epiktet und Kaiser Marc Aurel – prägten eine bis heute wirksame Ethik der Gelassenheit und Selbstbeherrschung.',
          kernidee: 'Glück entsteht allein aus der Tugend und dem Leben im Einklang mit der Vernunft der Natur – äußere Dinge sind letztlich gleichgültig.',
          inhalt: 'Zenon von Kition gründete um 300 v. Chr. in Athen die Stoa, benannt nach der bemalten Säulenhalle, in der er lehrte. Zentral ist die Unterscheidung zwischen dem, was in unserer Macht steht (unsere Urteile, Werte, Handlungen), und dem, was es nicht tut (Besitz, Ruf, Gesundheit): Nur die Tugend zählt wirklich, alles andere ist „gleichgültig" (adiaphora). Spätere Stoiker wie Seneca, Epiktet und Kaiser Mark Aurel übertrugen diese Lehre in eine praktische Kunst der Gelassenheit und Selbstbeherrschung.',
          wirkung: 'Die stoische Ethik der Gelassenheit gegenüber nicht beeinflussbaren Dingen prägt bis heute Ratgeberliteratur und die kognitive Verhaltenstherapie, die sich ausdrücklich auf Epiktet beruft. Der Begriff [[logos:Logos]] als Weltvernunft verband stoische Physik eng mit ihrer Ethik.',
          kritik: 'Kritiker wandten ein, dass die stoische Gleichgültigkeit gegenüber Schmerz, Krankheit oder Verlust in der Praxis unmenschlich oder unerreichbar sei. Dass ausgerechnet Seneca als Berater des tyrannischen Kaisers Nero immens reich wurde, während er Genügsamkeit predigte, wurde ihm schon in der Antike als Widerspruch vorgeworfen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Stoicism" – https://plato.stanford.edu/entries/stoicism/',
            'Internet Encyclopedia of Philosophy (IEP): „Stoicism" – https://iep.utm.edu/stoicism/'
          ],
          book: { title: 'Selbstbetrachtungen', author: 'Mark Aurel', url: 'https://link.amazon/B0e8ntgvB' } },
        { id: 'pyrrhon', name: 'Pyrrhon & die Skeptiker', meta: 'ca. 360–270 v. Chr. · Skeptizismus', year: -360, tradition: 'west', epoch: 'antike', str: ['skeptizismus'], dis: ['epistemologie'],
          hauptvertreter: 'Pyrrhon von Elis, Sextus Empiricus',
          desc: 'Der antike Skeptizismus empfahl die Urteilsenthaltung (Epoché) gegenüber allen dogmatischen Behauptungen, um zur Seelenruhe zu gelangen. Sextus Empiricus systematisierte diese Position.',
          kernidee: 'Da für jede Behauptung ebenso gute Gegengründe existieren, sollte man das Urteil aufschieben – nur so findet die Seele Ruhe.',
          inhalt: 'Pyrrhon von Elis begründete eine radikale Skepsis: Weil sich für jede Aussage über die wahre Beschaffenheit der Dinge ein gleich starkes Gegenargument finden lässt (Isosthenie), sei Urteilsenthaltung (Epoché) die einzig vernünftige Haltung. Jahrhunderte später systematisierte Sextus Empiricus diese Position in seinen „Grundrissen der pyrrhonischen Skepsis" und sammelte klassische Argumentmuster gegen sicheres Wissen.',
          wirkung: 'Der pyrrhonische Skeptizismus wurde in der Renaissance (Montaigne) wiederentdeckt und beeinflusste über Descartes\' methodischen Zweifel die gesamte neuzeitliche Erkenntnistheorie. Die Idee, dass Urteilsenthaltung zu Gelassenheit führt, findet sich in ähnlicher Form auch im Buddhismus.',
          kritik: 'Kritiker wandten schon in der Antike ein, dass durchgehende Urteilsenthaltung praktisch unmöglich sei, da schon das Überqueren einer Straße Urteile über Gefahr voraussetzt. Zudem ist unklar, ob die Skeptiker nicht selbst die Behauptung „nichts ist sicher wissbar" als gesichertes Wissen behaupten und sich damit selbst widersprechen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Ancient Skepticism" – https://plato.stanford.edu/entries/skepticism-ancient/',
            'Internet Encyclopedia of Philosophy (IEP): „Pyrrho" – https://iep.utm.edu/pyrrho/'
          ] },
        { id: 'plotin', name: 'Plotin', meta: 'ca. 205–270 n. Chr. · Neuplatonismus', year: 205, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          desc: 'Hauptvertreter des Neuplatonismus. Aus dem überseienden, unaussprechlichen „Einen" gehen stufenweise Geist, Seele und Sinnenwelt hervor (Emanation). Seine Mystik der Rückkehr zum Einen beeinflusste christliche, islamische und jüdische Denker tief und bildet die Brücke zum Mittelalter.',
          kernidee: 'Alle Wirklichkeit strömt stufenweise aus einem einzigen, über allem Sein stehenden Ursprung hervor, dem Einen.',
          inhalt: 'Plotin lehrte, dass aus dem unaussprechlichen, überseienden „Einen" durch einen Ausstrahlungsprozess ([[emanation:Emanation]]) zunächst der Geist (Nous), dann die Weltseele und schließlich die materielle Sinnenwelt hervorgehen – jede Stufe eine schwächere Widerspiegelung der vorigen. Ziel des philosophischen Lebens ist die mystische Rückkehr der Seele zum Einen durch Reinigung und Kontemplation.',
          wirkung: 'Plotins Neuplatonismus verband platonisches Denken mit religiöser Mystik und beeinflusste christliche (Augustinus), islamische und jüdische Philosophen tief; er bildet die zentrale Brücke zwischen antiker Philosophie und mittelalterlicher Theologie.',
          kritik: 'Weil das Eine jenseits von Sein und Sprache stehen soll, wirft seine Philosophie das Problem auf, wie man überhaupt sinnvoll darüber reden kann, ohne sich zu widersprechen. Kritiker sehen im Emanationsmodell zudem eine unbewiesene metaphysische Konstruktion ohne empirische Grundlage.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Plotinus" – https://plato.stanford.edu/entries/plotinus/',
            'Internet Encyclopedia of Philosophy (IEP): „Plotinus" – https://iep.utm.edu/plotinus/'
          ] },

        /* ─── MITTELALTER ─── */
        { id: 'augustinus', name: 'Augustinus von Hippo', meta: '354–430 · Patristik', year: 354, tradition: 'west', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik', 'ethik'],
          desc: 'Der einflussreichste Kirchenvater des Westens. In den Bekenntnissen (erste große Autobiographie der Weltliteratur) und Vom Gottesstaat verband er platonisches Denken mit christlicher Theologie. Themen wie Zeit, Erinnerung, Wille, Gnade und Sünde prägten das abendländische Selbstverständnis über ein Jahrtausend.',
          kernidee: 'Das menschliche Herz bleibt ruhelos, bis es in Gott seine wahre Erfüllung findet – Erkenntnis ist untrennbar mit Glaube und innerer Erfahrung verbunden.',
          inhalt: 'In seinen „Bekenntnissen", der ersten großen Autobiographie der Weltliteratur, schildert Augustinus seinen Weg vom unsteten jungen Mann zum christlichen Bischof und Denker. Er verband platonisches Gedankengut mit christlicher Theologie und untersuchte Zeit, Erinnerung, Willensfreiheit und das Rätsel des Bösen. In „Vom Gottesstaat" deutete er die Geschichte als Ringen zwischen irdischer und himmlischer Stadt.',
          wirkung: 'Augustinus wurde zum einflussreichsten Kirchenvater des Westens; seine Gedanken zu Zeit, Innerlichkeit und Gnade prägten die abendländische Theologie und Philosophie über mehr als ein Jahrtausend, von der Scholastik bis zu Descartes.',
          kritik: 'Seine strenge Erbsünden- und Gnadenlehre, wonach der Mensch aus eigener Kraft nichts zu seinem Heil beitragen kann, wurde schon von Zeitgenossen wie Pelagius als zu pessimistisch gegenüber der menschlichen Freiheit kritisiert. Spätere Kritiker sehen in seiner Verbindung von Kirche und Staatsmacht einen Wegbereiter kirchlicher Zwangsmittel.',
          zitat: { text: 'Unruhig ist unser Herz, bis es Ruhe findet in Dir.', quelle: 'Augustinus, „Confessiones" I,1; vgl. SEP: „Saint Augustine"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Saint Augustine" – https://plato.stanford.edu/entries/augustine/',
            'Internet Encyclopedia of Philosophy (IEP): „Augustine: Philosophy of Mind" – https://iep.utm.edu/aug-mind/'
          ] },
        { id: 'boethius', name: 'Boethius', meta: 'ca. 477–524 · Brücke Antike–Mittelalter', year: 477, tradition: 'west', epoch: 'mittelalter', str: [], dis: ['logik', 'metaphysik'],
          desc: 'Übersetzte und kommentierte aristotelische Logik und bewahrte so antikes Wissen. Sein im Kerker verfasster Trost der Philosophie war eines der meistgelesenen Bücher des Mittelalters.',
          kernidee: 'Wahres Glück lässt sich nicht von äußerem Schicksal abhängig machen, sondern nur durch die Einsicht der Vernunft in das eigentlich Gute erreichen.',
          inhalt: 'Boethius übersetzte und kommentierte die Logik des Aristoteles und rettete damit einen Großteil des antiken Wissens für das lateinische Mittelalter. In seinem im Kerker verfassten Hauptwerk „Der Trost der Philosophie" lässt er die personifizierte Philosophie ihn über Glücksrad, Schicksal und das wahre Gut belehren, während er selbst auf seine Hinrichtung wartet.',
          wirkung: 'Der „Trost der Philosophie" war eines der meistgelesenen und -übersetzten Bücher des Mittelalters und der frühen Neuzeit und vermittelte stoisch-platonisches Denken an christliche Leser. Boethius\' Logik-Übersetzungen bildeten bis ins 12. Jahrhundert die Grundlage des europäischen Logikunterrichts.',
          kritik: 'Bemerkenswert und für manche Leser irritierend ist, dass Boethius in seinem letzten Werk fast ausschließlich mit philosophischen, nicht mit spezifisch christlichen Argumenten Trost sucht, obwohl er als Christ galt. Wie viel eigenständige Leistung in seinen Übersetzungen steckt, wurde in der Forschung unterschiedlich beurteilt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Boethius" – https://plato.stanford.edu/entries/boethius/',
            'Internet Encyclopedia of Philosophy (IEP): „Boethius" – https://iep.utm.edu/boethius/'
          ] },
        { id: 'anselm', name: 'Anselm von Canterbury', meta: '1033–1109 · Frühscholastik', year: 1033, tradition: 'west', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik'],
          desc: '„Vater der Scholastik". Berühmt für den ontologischen Gottesbeweis: Gott als das, „über das hinaus nichts Größeres gedacht werden kann", müsse notwendig existieren. Sein Programm: fides quaerens intellectum – der Glaube, der Einsicht sucht.',
          kernidee: 'Gott lässt sich allein durch reines Denken beweisen: als dasjenige, über das hinaus nichts Größeres gedacht werden kann.',
          inhalt: 'Anselm von Canterbury entwickelte im „Proslogion" den berühmten ontologischen Gottesbeweis: Gott wird definiert als das, „über das hinaus nichts Größeres gedacht werden kann"; da Existenz in der Wirklichkeit „größer" sei als bloße Existenz im Verstand, müsse ein solches Wesen notwendig auch wirklich existieren. Sein Programm lautete fides quaerens intellectum – der Glaube, der nach Einsicht sucht, nicht gegen die Vernunft, sondern durch sie.',
          wirkung: 'Der ontologische Gottesbeweis gilt als eines der einflussreichsten und meistdiskutierten Argumente der Philosophiegeschichte und wurde später von Descartes und Leibniz in eigenen Varianten aufgegriffen sowie von Kant grundsätzlich kritisiert.',
          kritik: 'Schon sein Zeitgenosse, der Mönch Gaunilo, wandte ein, dass sich mit derselben Logik die Existenz einer „vollkommensten Insel" beweisen ließe, was absurd sei. Kant argumentierte später grundsätzlicher, dass Existenz kein reales Prädikat sei, das den Begriff einer Sache inhaltlich vergrößern könne.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Saint Anselm" – https://plato.stanford.edu/entries/anselm/',
            'Internet Encyclopedia of Philosophy (IEP): „Anselm: Ontological Argument for God\'s Existence" – https://iep.utm.edu/ont-arg/'
          ] },
        { id: 'thomas', name: 'Thomas von Aquin', meta: '1225–1274 · Hochscholastik · Thomismus', year: 1225, tradition: 'west', epoch: 'mittelalter', str: ['nominalismus'], dis: ['metaphysik', 'ethik'],
          desc: 'Die zentrale Gestalt der mittelalterlichen Philosophie. In der Summa theologiae vereinte er die neu zugängliche aristotelische Philosophie mit der christlichen Lehre. Seine „fünf Wege" sind klassische Gottesbeweise; er lehrte, Glaube und Vernunft könnten sich nicht widersprechen. Der Thomismus ist bis heute prägend für die katholische Philosophie.',
          kernidee: 'Glaube und Vernunft können sich nicht widersprechen, da beide letztlich aus derselben göttlichen Wahrheit stammen.',
          inhalt: 'Thomas von Aquin verband in seiner „Summa Theologiae" die neu über arabische Übersetzer zugängliche Philosophie des Aristoteles systematisch mit der christlichen Lehre. Seine „fünf Wege" leiten aus Beobachtungen der Welt – Bewegung, Ursache, Notwendigkeit, Vollkommenheitsgrade, Zweckmäßigkeit – auf die Existenz Gottes. In der Ethik übernahm er Aristoteles\' Tugendlehre und ergänzte sie um die christlichen Tugenden Glaube, Hoffnung und Liebe.',
          wirkung: 'Der Thomismus wurde zur einflussreichsten Philosophie der katholischen Kirche und prägt bis heute Theologie, Naturrecht und Ethik; Thomas gilt als die zentrale Gestalt der mittelalterlichen Philosophie überhaupt.',
          kritik: 'Kritiker der Neuzeit warfen seinem System vor, Aristoteles\' Naturphilosophie unkritisch mit einem inzwischen naturwissenschaftlich überholten Weltbild zu verbinden. Seine „fünf Wege" gelten in der heutigen Philosophie als anfechtbar, etwa weil sie stillschweigend voraussetzen, dass Kausalketten nicht unendlich rückwärts verlaufen können.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Aquinas" – https://plato.stanford.edu/entries/aquinas/',
            'Internet Encyclopedia of Philosophy (IEP): „Thomas Aquinas" – https://iep.utm.edu/aquinas/'
          ] },
        { id: 'ockham', name: 'Duns Scotus & Wilhelm von Ockham', meta: '13./14. Jh. · Spätscholastik', year: 1300, tradition: 'west', epoch: 'mittelalter', str: ['nominalismus'], dis: ['metaphysik', 'logik'],
          hauptvertreter: 'Duns Scotus, Wilhelm von Ockham',
          desc: 'Duns Scotus („doctor subtilis") betonte den Willen und die Einzelheit des Seienden. Ockham gilt als Begründer des Nominalismus (Allgemeinbegriffe sind bloße Namen) und formulierte das Sparsamkeitsprinzip „Ockhams Rasiermesser": Man solle die Zahl der Annahmen nicht unnötig vermehren.',
          kernidee: 'Allgemeinbegriffe sind keine eigenständigen Wesenheiten, sondern nur Namen für Ähnlichkeiten zwischen Einzeldingen – und man sollte nie mehr Ursachen annehmen als nötig.',
          inhalt: 'Duns Scotus, der „doctor subtilis", betonte gegen Thomas von Aquin die Bedeutung des individuellen Soseins der Dinge (Haecceitas) und den Vorrang des freien Willens vor dem Verstand. Sein jüngerer Zeitgenosse Wilhelm von Ockham radikalisierte diese Linie zum Nominalismus: Allgemeinbegriffe wie „Mensch" oder „Baum" existieren nicht real, sondern sind nur sprachliche Namen für ähnliche Einzeldinge. Berühmt wurde sein Sparsamkeitsprinzip, bekannt als „Ockhams Rasiermesser": Erklärungen sollen nicht mehr Annahmen enthalten als nötig.',
          wirkung: 'Ockhams Nominalismus und sein Sparsamkeitsprinzip wurden zu Grundprinzipien wissenschaftlichen Denkens und wirken bis heute in Wissenschaftstheorie und Logik nach. Die Betonung des Einzelnen und des Willens bei Duns Scotus beeinflusste spätere Debatten über Freiheit und Individualität.',
          kritik: 'Der Nominalismus wurde von scholastischen Gegnern als Gefährdung der Realität allgemeiner Wahrheiten (etwa moralischer Prinzipien) kritisiert, wenn Begriffe nur noch als bloße Namen gelten. Ockhams kirchenkritische politische Schriften brachten ihm zudem den Vorwurf der Häresie und die Exkommunikation ein.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „William of Ockham" – https://plato.stanford.edu/entries/ockham/',
            'Stanford Encyclopedia of Philosophy (SEP): „Duns Scotus" – https://plato.stanford.edu/entries/duns-scotus/'
          ] },

        /* ─── RENAISSANCE ─── */
        { id: 'machiavelli', name: 'Niccolò Machiavelli', meta: '1469–1527 · Politische Philosophie', year: 1469, tradition: 'west', epoch: 'renaissance', str: [], dis: ['politik'],
          desc: 'Sein Der Fürst analysiert Macht nüchtern und losgelöst von Moral und Religion – der Beginn der modernen, „realistischen" politischen Theorie.',
          kernidee: 'Erfolgreiche Politik folgt eigenen Gesetzen der Macht, die von privater Moral und religiösen Idealen unabhängig sind.',
          inhalt: 'In „Der Fürst" analysierte Machiavelli nüchtern, mit welchen Mitteln ein Herrscher Macht gewinnt und behält, unabhängig davon, ob diese Mittel als moralisch gelten. Statt idealer Fürstenspiegel früherer Zeiten beschrieb er, wie Politik in der Realität tatsächlich funktioniert – geprägt von Fortuna (Glück, Schicksal) und der virtù, sich den Umständen anzupassen.',
          wirkung: 'Machiavelli gilt als Begründer der modernen, „realistischen" politischen Theorie, die Politik als eigenständigen Bereich jenseits von Moral und Theologie beschreibt, und beeinflusste politisches Denken von Hobbes bis zur modernen Politikwissenschaft.',
          kritik: 'Der Begriff „machiavellistisch" wurde schon bald zum Schimpfwort für skrupellose, zynische Machtpolitik, da viele Leser seine nüchterne Beschreibung als Empfehlung missverstanden. Manche Interpreten lesen „Der Fürst" dagegen als versteckte Kritik an Tyrannei, was in der Forschung bis heute umstritten ist.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Niccolò Machiavelli" – https://plato.stanford.edu/entries/machiavelli/',
            'Internet Encyclopedia of Philosophy (IEP): „Niccolò Machiavelli" – https://iep.utm.edu/machiave/'
          ] },
        { id: 'montaigne', name: 'Erasmus von Rotterdam & Michel de Montaigne', meta: '15./16. Jh. · Humanismus', year: 1500, tradition: 'west', epoch: 'renaissance', str: ['skeptizismus'], dis: ['ethik'],
          hauptvertreter: 'Erasmus von Rotterdam, Michel de Montaigne',
          desc: 'Erasmus verkörperte den gelehrten, kritischen Humanismus. Montaigne begründete mit seinen Essais eine skeptische, selbstprüfende Denkform: „Was weiß ich?"',
          kernidee: 'Da menschliches Wissen und Urteil unsicher und wandelbar sind, ist die prüfende Selbstbeobachtung der ehrlichste Weg zur Weisheit.',
          inhalt: 'Erasmus von Rotterdam verkörperte den gelehrten, kritischen Humanismus der Renaissance und plädierte in Werken wie „Lob der Torheit" für Vernunft, Bildung und eine undogmatische, tolerante Frömmigkeit. Michel de Montaigne begründete mit seinen locker geschriebenen „Essais" eine neue literarische Form der skeptischen Selbstprüfung: Unter der Devise „Was weiß ich?" (Que sais-je?) hinterfragte er ständig eigene Urteile, Gewohnheiten und fremde Kulturen.',
          wirkung: 'Montaignes essayistische, skeptisch-tolerante Denkweise beeinflusste Descartes und Pascal sowie die gesamte spätere Tradition des freien, persönlichen Philosophierens; die literarische Form des Essays geht direkt auf ihn zurück.',
          kritik: 'Kritiker warfen Montaigne vor, mit seiner durchgehenden Skepsis letztlich in Beliebigkeit zu münden, ohne verbindliche Maßstäbe zu bieten. Erasmus geriet zwischen die Fronten der Reformation, weil er Luthers Kirchenkritik teilte, dessen Bruch mit Rom aber ablehnte, und wurde dafür von beiden Seiten angegriffen.',
          zitat: { text: 'Was weiß ich?', quelle: 'Michel de Montaigne, „Essais" II,12 (Que sais-je?); vgl. SEP: „Michel de Montaigne"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Michel de Montaigne" – https://plato.stanford.edu/entries/montaigne/',
            'Internet Encyclopedia of Philosophy (IEP): „Michel de Montaigne" – https://iep.utm.edu/montaign/'
          ] },
        { id: 'bacon', name: 'Francis Bacon', meta: '1561–1626 · Wegbereiter des Empirismus', year: 1561, tradition: 'west', epoch: 'renaissance', str: ['empirismus'], dis: ['wissenschaft', 'epistemologie'],
          desc: 'Forderte eine auf Beobachtung und Induktion gegründete Wissenschaft und formulierte früh das Programm einer methodischen Naturbeherrschung: „Wissen ist Macht."',
          kernidee: 'Wahres Wissen über die Natur entsteht nicht durch reines Nachdenken, sondern durch systematische Beobachtung, Experiment und Induktion.',
          inhalt: 'Francis Bacon forderte einen radikalen Neuanfang der Wissenschaft: Statt sich auf autoritäre Texte und spekulative Vernunftschlüsse zu verlassen, solle man durch methodisches Sammeln von Beobachtungen und Experimenten schrittweise zu allgemeinen Naturgesetzen gelangen (Induktion). In seinem „Novum Organum" katalogisierte er typische Denkfehler, die er „Idole" nannte und die die Erkenntnis verzerren.',
          wirkung: 'Bacon gilt als früher Wegbereiter des Empirismus und der modernen experimentellen Wissenschaftsmethode; sein Programm „Wissen ist Macht" verband Erkenntnis erstmals systematisch mit praktischer Naturbeherrschung und beeinflusste die Gründung der Royal Society.',
          kritik: 'Bacons eigene induktive Methode blieb in der Praxis unvollständig und wurde nie in der von ihm vorgeschlagenen systematischen Form angewendet; spätere Wissenschaftstheoretiker wie Popper hielten reine Induktion zudem für logisch nicht zu rechtfertigen. Seine Vorstellung einer vollständigen „Beherrschung" der Natur wird heute auch ökologisch kritisch gesehen.',
          zitat: { text: 'Wissen ist Macht.', quelle: 'Francis Bacon, sinngemäß aus „Meditationes Sacrae" (1597), „scientia potestas est"; vgl. SEP: „Francis Bacon"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Francis Bacon" – https://plato.stanford.edu/entries/francis-bacon/',
            'Internet Encyclopedia of Philosophy (IEP): „Francis Bacon" – https://iep.utm.edu/bacon/'
          ] },

        /* ─── NEUZEIT: RATIONALISMUS ─── */
        { id: 'descartes', name: 'René Descartes', meta: '1596–1650 · „Vater der neuzeitlichen Philosophie"', year: 1596, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['epistemologie', 'metaphysik', 'geist'],
          desc: 'Suchte mit dem methodischen Zweifel einen unerschütterlichen Ausgangspunkt und fand ihn im denkenden Ich: „Cogito, ergo sum" – ich denke, also bin ich. Sein Dualismus von res cogitans (Geist) und res extensa (Materie) prägte die Philosophie des Geistes bis heute. Zugleich war er ein bedeutender Mathematiker (analytische Geometrie).',
          kernidee: 'Um zu einem absolut sicheren Ausgangspunkt der Erkenntnis zu gelangen, muss man radikal an allem zweifeln, was sich auch nur im Geringsten anzweifeln lässt.',
          inhalt: 'Descartes zweifelte methodisch an allem, was täuschen könnte – Sinne, Körper, sogar Mathematik –, bis er einen unbezweifelbaren Punkt fand: Dass er zweifelt, also denkt, beweist, dass er, der Zweifelnde, existiert („Cogito, ergo sum"). Von diesem sicheren Fundament aus leitete er die Existenz Gottes und der Außenwelt ab. Sein Dualismus trennt scharf die denkende, unausgedehnte Seele (res cogitans) von der ausgedehnten, mechanisch funktionierenden Materie (res extensa), einschließlich des eigenen Körpers.',
          wirkung: 'Descartes gilt als „Vater der neuzeitlichen Philosophie", weil er das erkennende Subjekt statt kirchlicher Autorität zum Ausgangspunkt der Philosophie machte. Sein Leib-Seele-Dualismus prägt bis heute die Philosophie des Geistes, auch in Abgrenzung von ihm.',
          kritik: 'Das „Leib-Seele-Problem" – wie zwei völlig verschiedene Substanzen wie Geist und Körper kausal aufeinander einwirken sollen – blieb ungelöst und wurde schon von seiner Zeitgenossin Elisabeth von der Pfalz kritisch hinterfragt. Spätere Philosophen wie Spinoza und Gilbert Ryle lehnten den Dualismus als unhaltbar ab.',
          zitat: { text: 'Cogito, ergo sum.', quelle: 'René Descartes, „Discours de la méthode" IV (1637) / „Meditationes" II; vgl. SEP: „Descartes"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „René Descartes" – https://plato.stanford.edu/entries/descartes/',
            'Internet Encyclopedia of Philosophy (IEP): „René Descartes" – https://iep.utm.edu/descarte/'
          ],
          book: { title: 'Meditationen über die Erste Philosophie', author: 'René Descartes', url: 'https://link.amazon/B06Hs7H1M' } },
        { id: 'spinoza', name: 'Baruch de Spinoza', meta: '1632–1677 · Rationalismus / Pantheismus', year: 1632, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['metaphysik', 'ethik'],
          desc: 'Entwarf in seiner Ethik „nach geometrischer Methode" ein monistisches System: Es gibt nur eine Substanz – „Gott bzw. die Natur" (Deus sive Natura). Freiheit besteht in der Einsicht in die Notwendigkeit. Wegen seiner radikalen Ansichten wurde er aus der jüdischen Gemeinde ausgeschlossen; heute gilt er als früher Denker der Aufklärung und Religionskritik.',
          kernidee: 'Es gibt nur eine einzige unendliche Substanz – Gott bzw. die Natur –, und alles Existierende ist nur eine ihrer notwendigen Ausdrucksformen.',
          inhalt: 'Spinoza entwarf in seiner „Ethik nach geometrischer Methode" ein streng deduktives System: Es existiert nur eine Substanz, „Gott bzw. die Natur" (Deus sive Natura), von der Denken und Ausdehnung nur zwei von unendlich vielen Attributen sind. Alles geschieht mit strenger Notwendigkeit, freier Zufall existiert nicht. Wahre Freiheit besteht für Spinoza nicht im Fehlen von Ursachen, sondern in der Einsicht der Vernunft in diese Notwendigkeit.',
          wirkung: 'Wegen seines Pantheismus und seiner Bibelkritik wurde Spinoza aus der jüdischen Gemeinde Amsterdams ausgeschlossen und lange als „Gotteslästerer" gemieden; heute gilt er als einer der bedeutendsten Denker der Aufklärung, der Religionskritik und einer rationalen Ethik der Gelassenheit.',
          kritik: 'Kritiker wie Leibniz warfen Spinoza vor, mit seinem strengen Determinismus jeden sinnvollen Begriff von Willensfreiheit und moralischer Verantwortung aufzugeben. Sein Pantheismus – die Gleichsetzung von Gott und Natur – wurde von traditionellen Theologen als verkappter Atheismus verurteilt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Baruch Spinoza" – https://plato.stanford.edu/entries/spinoza/',
            'Internet Encyclopedia of Philosophy (IEP): „Baruch Spinoza" – https://iep.utm.edu/spinoza/'
          ] },
        { id: 'leibniz', name: 'Gottfried Wilhelm Leibniz', meta: '1646–1716 · Rationalismus / Universalgelehrter', year: 1646, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['metaphysik', 'logik'],
          desc: 'Entwarf die Monadenlehre: Die Welt besteht aus unteilbaren, seelenartigen Kraftzentren (Monaden) in „prästabilierter Harmonie". Berühmt ist seine These, die wirkliche Welt sei „die beste aller möglichen Welten". Unabhängig von Newton entwickelte er die Infinitesimalrechnung und gilt als Pionier der Logik und Informatik (binäres System).',
          kernidee: 'Die Welt besteht aus unzähligen einfachen, seelenartigen Substanzen, die zwar nicht direkt interagieren, aber durch eine von Gott vorherbestimmte Harmonie perfekt aufeinander abgestimmt sind.',
          inhalt: 'Leibniz entwarf die Monadenlehre: Die letzten Bausteine der Wirklichkeit sind unteilbare, „fensterlose" Monaden, die jede für sich das ganze Universum aus ihrer eigenen Perspektive spiegeln. Da Gott bei der Schöpfung unter allen denkbaren Welten die beste ausgewählt habe, sei die wirkliche Welt „die beste aller möglichen Welten" – eine Position, die das Problem des Übels und Leids lösen sollte (Theodizee). Unabhängig von Newton entwickelte er zudem die Infinitesimalrechnung.',
          wirkung: 'Leibniz gilt neben seiner Metaphysik als Pionier der modernen Logik und der Informatik, da er das binäre Zahlensystem entwickelte, das heute jedem Computer zugrunde liegt. Seine Theodizee prägte über ein Jahrhundert die Debatte um Gott und das Leid in der Welt.',
          kritik: 'Voltaire verspottete Leibniz\' These von der „besten aller möglichen Welten" in seinem Roman „Candide" angesichts von Kriegen, Erdbeben und Elend als weltfremden Optimismus. Die Monadenlehre wirft zudem die Frage auf, wie fensterlose, nicht interagierende Substanzen überhaupt eine gemeinsame, konsistente Welt bilden können.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Gottfried Wilhelm Leibniz" – https://plato.stanford.edu/entries/leibniz/',
            'Internet Encyclopedia of Philosophy (IEP): „Gottfried Leibniz" – https://iep.utm.edu/leibniz/'
          ] },

        /* ─── NEUZEIT: EMPIRISMUS ─── */
        { id: 'locke', name: 'John Locke', meta: '1632–1704 · Empirismus / Liberalismus', year: 1632, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'liberalismus', 'kontraktualismus'], dis: ['epistemologie', 'politik'],
          desc: 'Der Geist ist bei Geburt ein „unbeschriebenes Blatt" (tabula rasa); alles Wissen stammt aus Erfahrung. In der politischen Philosophie begründete Locke den Liberalismus: natürliche Rechte auf Leben, Freiheit und Eigentum, Gewaltenteilung und Regierung mit Zustimmung der Regierten. Er beeinflusste die amerikanische Unabhängigkeitserklärung maßgeblich.',
          kernidee: 'Der menschliche Geist ist bei der Geburt ein unbeschriebenes Blatt; alles Wissen und aller rechtmäßige Besitz entstehen erst durch Erfahrung und eigene Arbeit.',
          inhalt: 'Locke bestritt angeborene Ideen: Der Geist gleicht bei der Geburt einem unbeschriebenen Blatt (tabula rasa), auf dem erst Sinneserfahrung und Reflexion Wissen entstehen lassen. In der politischen Philosophie leitete er aus einem vorstaatlichen Naturzustand natürliche Rechte auf Leben, Freiheit und Eigentum ab; Eigentum entstehe durch die Vermischung eigener Arbeit mit der Natur. Regierungen seien nur durch die Zustimmung der Regierten legitim und an die Gewaltenteilung gebunden.',
          wirkung: 'Locke gilt als Begründer des politischen Liberalismus; seine Ideen von Naturrechten, Gewaltenteilung und Widerstandsrecht beeinflussten die amerikanische Unabhängigkeitserklärung und moderne Verfassungsstaaten maßgeblich.',
          kritik: 'Kritiker weisen darauf hin, dass Locke persönlich an Kolonialunternehmen und dem Sklavenhandel beteiligt war, was in scharfem Widerspruch zu seiner Theorie universeller Naturrechte steht. Seine Eigentumstheorie wurde zudem kritisiert, weil sie koloniale Landnahme rechtfertigen konnte, wenn indigene Bevölkerungen das Land nicht im europäischen Sinn „bearbeiteten".',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „John Locke" – https://plato.stanford.edu/entries/locke/',
            'Internet Encyclopedia of Philosophy (IEP): „John Locke" – https://iep.utm.edu/locke/'
          ] },
        { id: 'berkeley', name: 'George Berkeley', meta: '1685–1753 · Immaterialismus', year: 1685, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'idealismus'], dis: ['metaphysik', 'epistemologie'],
          desc: 'Radikalisierte den Empirismus zum Idealismus: „esse est percipi" – zu sein heißt, wahrgenommen zu werden. Es gebe keine vom Geist unabhängige Materie.',
          kernidee: 'Es gibt keine vom Geist unabhängige Materie – Dinge existieren nur, insofern sie wahrgenommen werden oder selbst wahrnehmen.',
          inhalt: 'Berkeley radikalisierte den Empirismus zum Immaterialismus: Da wir immer nur unsere eigenen Wahrnehmungen kennen, nie eine „Materie" dahinter, existieren Dinge nur, insofern sie wahrgenommen werden – „esse est percipi", sein heißt wahrgenommen werden. Damit Dinge auch dann existieren, wenn kein endlicher Geist sie gerade wahrnimmt, nahm er einen ewig wahrnehmenden Gott als Garanten der Kontinuität der Welt an.',
          wirkung: 'Berkeleys Immaterialismus zwang nachfolgende Philosophen wie Hume und Kant, das Verhältnis von Wahrnehmung, Geist und Wirklichkeit neu zu durchdenken, und wirkt bis heute in Debatten über Realismus und Idealismus fort.',
          kritik: 'Samuel Johnsons berühmte Reaktion – er trat gegen einen Stein und rief „So widerlege ich ihn!" – bringt den verbreiteten Einwand auf den Punkt, dass Berkeleys Theorie der alltäglichen Erfahrung robuster Realität eklatant widerspricht. Kritiker fragten zudem, warum ausgerechnet Gott als Wahrnehmender postuliert werden müsse, statt einfach eine geistunabhängige Materie anzunehmen.',
          zitat: { text: 'Esse est percipi.', quelle: 'George Berkeley, „A Treatise Concerning the Principles of Human Knowledge" §3 (1710); vgl. SEP: „Berkeley"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „George Berkeley" – https://plato.stanford.edu/entries/berkeley/',
            'Internet Encyclopedia of Philosophy (IEP): „George Berkeley" – https://iep.utm.edu/berkeley/'
          ] },
        { id: 'hume', name: 'David Hume', meta: '1711–1776 · Empirismus / Skeptizismus', year: 1711, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'skeptizismus'], dis: ['epistemologie', 'ethik'],
          desc: 'Der konsequenteste Empirist. Er zeigte, dass wir Kausalität nicht beobachten, sondern nur gewohnheitsmäßig erwarten, und dass sich aus einem Sein kein Sollen logisch ableiten lässt (Humes Gesetz). Seine Kritik an Induktion, Substanz und Ich weckte – nach eigenen Worten Kants – diesen „aus dem dogmatischen Schlummer".',
          kernidee: 'Wir beobachten niemals eine notwendige Verbindung zwischen Ursache und Wirkung, sondern gewöhnen uns nur an regelmäßig aufeinanderfolgende Ereignisse.',
          inhalt: 'Hume zeigte, dass Kausalität – der Glaube, ein Ereignis „verursache" notwendig ein anderes – nicht aus der Erfahrung ableitbar ist: Wir sehen nur ständige Abfolgen, nie eine notwendige Verknüpfung, und schließen aus Gewohnheit auf Zukünftiges (Induktionsproblem). Ähnlich radikal zeigte er, dass sich aus reinen Tatsachenbeschreibungen („Sein") niemals logisch eine moralische Forderung („Sollen") ableiten lässt (Humes Gesetz). Auch das beständige „Ich" löste er auf in ein Bündel wechselnder Wahrnehmungen.',
          wirkung: 'Hume gilt als der konsequenteste Empirist und gründlichste Skeptiker der Neuzeit; nach Kants eigenen Worten weckte seine Kritik ihn „aus dem dogmatischen Schlummer" und stieß die kritische Philosophie an. Das Induktionsproblem und Humes Gesetz sind bis heute zentrale Themen der Wissenschafts- und Moralphilosophie.',
          kritik: 'Wenn Kausalität nur Gewohnheit ist, bleibt unklar, wie Wissenschaft überhaupt verlässliche Naturgesetze aufstellen kann – ein Problem, das Hume selbst offen ließ und das spätere Philosophen wie Popper anders zu lösen versuchten. Manche werfen Hume vor, mit seiner radikalen Skepsis die eigene Möglichkeit rationalen Argumentierens zu untergraben.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „David Hume" – https://plato.stanford.edu/entries/hume/',
            'Internet Encyclopedia of Philosophy (IEP): „David Hume" – https://iep.utm.edu/hume/'
          ] },

        /* ─── AUFKLÄRUNG ─── */
        { id: 'rousseau', name: 'Voltaire, Montesquieu & Rousseau', meta: '18. Jh. · Französische Aufklärung', year: 1712, tradition: 'west', epoch: 'neuzeit', str: ['kontraktualismus'], dis: ['politik'],
          hauptvertreter: 'Voltaire, Montesquieu, Jean-Jacques Rousseau',
          desc: 'Voltaire kämpfte für Meinungs- und Glaubensfreiheit gegen Fanatismus. Montesquieu begründete mit Vom Geist der Gesetze die Lehre der Gewaltenteilung. Jean-Jacques Rousseau prägte mit dem Gesellschaftsvertrag („Volkssouveränität", „Gemeinwille") und mit seiner Erziehungslehre (Émile) Demokratietheorie, Pädagogik und die Romantik.',
          kernidee: 'Der Mensch ist von Natur aus frei; erst die Gesellschaft und ihre Institutionen unterdrücken ihn – eine legitime politische Ordnung muss daher auf dem freien Willen aller beruhen.',
          inhalt: 'Voltaire kämpfte publizistisch für Meinungs- und Glaubensfreiheit gegen kirchlichen und staatlichen Fanatismus. Montesquieu begründete mit „Vom Geist der Gesetze" die bis heute grundlegende Lehre der Gewaltenteilung in Legislative, Exekutive und Judikative. Jean-Jacques Rousseau entwarf im „Gesellschaftsvertrag" die Idee, dass legitime politische Herrschaft allein auf dem „Gemeinwillen" freier Bürger beruhen kann, und prägte mit seinem Erziehungsroman „Émile" die moderne Pädagogik.',
          wirkung: 'Die drei Aufklärer legten zusammen die ideengeschichtlichen Grundlagen moderner Verfassungsstaaten, Menschenrechte und Demokratietheorie; Rousseaus Ideen wirkten direkt in die Französische Revolution hinein.',
          kritik: 'Rousseaus Vorstellung eines ursprünglich guten „Naturzustands" des Menschen gilt heute als problematische Idealisierung, und sein Begriff des „Gemeinwillens" wurde von Kritikern als mögliches Einfallstor für Zwang gegen Andersdenkende gelesen. Rousseaus eigenes Leben – er gab seine fünf Kinder ins Findelhaus – stand in scharfem Widerspruch zu seiner gefeierten Erziehungslehre.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Jean-Jacques Rousseau" – https://plato.stanford.edu/entries/rousseau/',
            'Stanford Encyclopedia of Philosophy (SEP): „Montesquieu" – https://plato.stanford.edu/entries/montesquieu/'
          ] },
        { id: 'kant', name: 'Immanuel Kant', meta: '1724–1804 · Zentralgestalt der Neuzeit', year: 1724, tradition: 'west', epoch: 'neuzeit', str: ['idealismus', 'deontologie'], dis: ['epistemologie', 'metaphysik', 'ethik'], entry: true,
          desc: 'Kant vollzog die „kopernikanische Wende" der Erkenntnistheorie: Nicht der Verstand richtet sich nach den Gegenständen, sondern die Gegenstände nach den Anschauungsformen und Kategorien des Verstandes. In der Kritik der reinen Vernunft zeigt er Möglichkeit und Grenzen der Erkenntnis; wir erkennen die Dinge nur als Erscheinung, nie das „Ding an sich". In der Ethik formuliert er den kategorischen Imperativ: „Handle nur nach derjenigen Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde." Kant ist der Angelpunkt, an dem sich fast alle spätere Philosophie abarbeitet.',
          kernidee: 'Nicht der Verstand richtet sich nach den Dingen, sondern die Dinge, wie sie uns erscheinen, richten sich nach den Bedingungen unseres Erkennens.',
          inhalt: 'Kant vollzog die „kopernikanische Wende" der Erkenntnistheorie: Raum, Zeit und die Kategorien des Verstandes sind nicht Eigenschaften der Dinge an sich, sondern die Bedingungen, unter denen wir überhaupt etwas als Gegenstand erfahren können. In der „Kritik der reinen Vernunft" zeigt er so zugleich Möglichkeit und Grenzen der Erkenntnis: Wir erkennen nur Erscheinungen, nie das „Ding an sich". In der Ethik formuliert er den kategorischen Imperativ: „Handle nur nach derjenigen Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde."',
          wirkung: 'Kant gilt als Angelpunkt der gesamten neuzeitlichen Philosophie, an dem sich praktisch jede spätere Richtung – vom Deutschen Idealismus bis zur analytischen Philosophie – abarbeitet. Seine Ethik der Pflicht und Würde prägt bis heute Menschenrechtsdenken und Moralphilosophie.',
          kritik: 'Kritiker wie Hegel warfen Kant vor, mit dem unerkennbaren „Ding an sich" einen unauflösbaren Rest in seinem System zu hinterlassen. Sein kategorischer Imperativ wird bis heute für seine Strenge kritisiert, etwa weil Kant selbst sogar die Lüge gegenüber einem Mörder zur Rettung eines Lebens für unzulässig hielt.',
          zitat: { text: 'Zwei Dinge erfüllen das Gemüt … der bestirnte Himmel über mir und das moralische Gesetz in mir.', quelle: 'Immanuel Kant, „Kritik der praktischen Vernunft", Beschluss (1788); vgl. SEP: „Kant"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Immanuel Kant" – https://plato.stanford.edu/entries/kant/',
            'Stanford Encyclopedia of Philosophy (SEP): „Kant\'s Moral Philosophy" – https://plato.stanford.edu/entries/kant-moral/'
          ],
          book: { title: 'Kritik der reinen Vernunft', author: 'Immanuel Kant', url: 'https://link.amazon/B024U5n6l' } },

        /* ─── 19. JAHRHUNDERT ─── */
        { id: 'hegel', name: 'Fichte, Schelling, Hegel', meta: '1762–1831 · Deutscher Idealismus', year: 1770, tradition: 'west', epoch: 'idealismus', str: ['idealismus'], dis: ['metaphysik', 'politik'],
          hauptvertreter: 'Johann Gottlieb Fichte, Friedrich Wilhelm Joseph Schelling, Georg Wilhelm Friedrich Hegel',
          desc: 'Fichte stellte das tätige „Ich" ins Zentrum, Schelling die Natur als sichtbaren Geist. Georg Wilhelm Friedrich Hegel entwarf das großartigste System: Die Wirklichkeit ist Entfaltung des „Weltgeistes" in einem dialektischen Prozess (These – Antithese – Synthese) hin zur Freiheit. Seine Geschichts- und Staatsphilosophie wirkt bis heute – auch über seine Gegner (Marx, Kierkegaard).',
          kernidee: 'Die gesamte Wirklichkeit ist die fortschreitende Selbstentfaltung einer vernünftigen Weltvernunft, die sich durch Widerspruch und dessen Überwindung ihrer selbst bewusst wird.',
          inhalt: 'Fichte stellte das tätige, sich selbst setzende „Ich" ins Zentrum der Philosophie; Schelling verstand die Natur selbst als sichtbar gewordenen Geist. Hegel entwarf das umfassendste System: Wirklichkeit ist die Selbstentfaltung des „Weltgeistes" in einem dialektischen Prozess, in dem jede Position (These) ihren Gegensatz (Antithese) hervorbringt, bis beide auf höherer Stufe versöhnt werden (Synthese). Geschichte ist für Hegel der Fortschritt im Bewusstsein der Freiheit.',
          wirkung: 'Hegels Dialektik und Geschichtsphilosophie beeinflussten nahezu die gesamte spätere Philosophie – direkt bei Marx, kritisch bei Kierkegaard und Nietzsche – und prägen bis heute Debatten über Geschichte, Staat und Anerkennung.',
          kritik: 'Kierkegaard und spätere Existenzialisten warfen Hegel vor, das konkrete, leidende Einzelindividuum in einem abstrakten Gesamtsystem zu verschlingen. Hegels Geschichtsphilosophie, die im preußischen Staat fast einen Endpunkt der Vernunft sah, wurde später als problematische Rechtfertigung bestehender Machtverhältnisse kritisiert.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Georg Wilhelm Friedrich Hegel" – https://plato.stanford.edu/entries/hegel/',
            'Internet Encyclopedia of Philosophy (IEP): „Georg Wilhelm Friedrich Hegel" – https://iep.utm.edu/hegel/'
          ],
          book: { title: 'Phänomenologie des Geistes', author: 'Georg Wilhelm Friedrich Hegel', url: 'https://link.amazon/B0e4KFvBY' } },
        { id: 'schopenhauer', name: 'Arthur Schopenhauer', meta: '1788–1860 · Willensmetaphysik / Pessimismus', year: 1788, tradition: 'west', epoch: 'idealismus', str: ['idealismus'], dis: ['metaphysik', 'aesthetik'],
          desc: 'Gegen Hegel: Die Welt sei nicht Vernunft, sondern blinder Wille (Die Welt als Wille und Vorstellung). Erlösung vom Leiden gebe es nur durch Kunst, Mitleid und Verneinung des Willens – Gedanken, die er auch aus indischer Philosophie schöpfte.',
          kernidee: 'Hinter der Welt der Erscheinungen steht kein vernünftiger Geist, sondern ein blinder, zielloser Wille, der sich in jedem Streben und Leiden ausdrückt.',
          inhalt: 'Gegen Hegels Vernunftoptimismus setzte Schopenhauer den Willen als das eigentliche Wesen der Wirklichkeit: ein blindes, rastloses, nie befriedigtes Streben, das sich in der gesamten Natur, im menschlichen Begehren und im Leiden zeigt. Da jede Erfüllung eines Wunsches sofort neues Verlangen erzeugt, ist Leiden für Schopenhauer der Grundzustand des Lebens. Erlösung sah er vorübergehend in der ästhetischen Kontemplation der Kunst, dauerhafter im Mitleid und in der asketischen Verneinung des eigenen Willens – Gedanken, die er ausdrücklich mit Motiven aus der indischen Philosophie (Buddhismus, Vedanta) verband.',
          wirkung: 'Schopenhauer war der erste bedeutende westliche Philosoph, der ernsthaft an östliches Denken anknüpfte, und beeinflusste Nietzsche, Wagner und Freud tief; sein Pessimismus wurde zu einer eigenständigen philosophischen Strömung.',
          kritik: 'Kritiker wenden ein, dass Schopenhauers universaler Pessimismus die reale Vielfalt menschlichen Glücks und Sinns unterschlägt und empirisch kaum zu belegen ist. Sein persönliches Leben – unter anderem sein oft grober Umgang mit Zeitgenossinnen und Bediensteten – steht in auffälligem Kontrast zu seiner gepredigten Ethik des Mitleids.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Arthur Schopenhauer" – https://plato.stanford.edu/entries/schopenhauer/',
            'Internet Encyclopedia of Philosophy (IEP): „Arthur Schopenhauer" – https://iep.utm.edu/schopenh/'
          ],
          book: { title: 'Die Welt als Wille und Vorstellung', author: 'Arthur Schopenhauer', url: 'https://link.amazon/B0hESNJah' } },
        { id: 'kierkegaard', name: 'Søren Kierkegaard', meta: '1813–1855 · Vater des Existenzialismus', year: 1813, tradition: 'west', epoch: 'idealismus', str: ['existenzialismus'], dis: ['ethik', 'metaphysik'],
          desc: 'Stellte gegen Hegels System das konkrete, einzelne Individuum, seine Angst, Verzweiflung und Entscheidung. Der Glaube sei ein „Sprung", nicht Ergebnis von Beweisen. Er gilt als wichtigster Vorläufer des Existenzialismus.',
          kernidee: 'Wahrheit ist nicht ein objektiv feststellbarer Lehrsatz, sondern etwas, das der Einzelne nur in leidenschaftlicher, riskanter Entscheidung für sich selbst ergreifen kann.',
          inhalt: 'Kierkegaard stellte gegen Hegels abstraktes System das konkrete, einzelne Individuum mit seiner Angst, Verzweiflung und existenziellen Entscheidungsnot. Er unterschied drei Lebensstadien – das ästhetische (Genuss), das ethische (Pflicht) und das religiöse (Glaube) –, zwischen denen man nicht denkend, sondern nur springend wechseln kann. Der Glaube selbst sei ein „Sprung", der sich nicht durch Beweise rechtfertigen lässt, wie er am Beispiel Abrahams zeigte, der bereit war, seinen Sohn zu opfern.',
          wirkung: 'Kierkegaard gilt als wichtigster Vorläufer des Existenzialismus und beeinflusste Heidegger, Sartre und die dialektische Theologie tief; sein Fokus auf Angst und Entscheidung prägt bis heute Existenzphilosophie und Psychologie.',
          kritik: 'Kritiker bemängeln, dass Kierkegaards Idee des Glaubens als irrationaler „Sprung" letztlich jede rationale Rechtfertigung religiöser Überzeugungen aufgibt und damit dem Fanatismus Tür und Tor öffnen könnte. Sein oft polemischer, gegen die etablierte Kirche gerichteter Stil wurde auch als persönlich verbittert gelesen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Søren Kierkegaard" – https://plato.stanford.edu/entries/kierkegaard/',
            'Internet Encyclopedia of Philosophy (IEP): „Søren Kierkegaard" – https://iep.utm.edu/kierkega/'
          ],
          book: { title: 'Entweder – Oder', author: 'Søren Kierkegaard', url: 'https://link.amazon/B0a9ZKIba' } },
        { id: 'mill', name: 'John Stuart Mill', meta: '1806–1873 · Utilitarismus / Liberalismus', year: 1806, tradition: 'west', epoch: 'idealismus', str: ['utilitarismus', 'liberalismus'], dis: ['ethik', 'politik'],
          desc: 'Verfeinerte den von Jeremy Bentham begründeten Utilitarismus (richtig ist, was das größte Glück der größten Zahl fördert) und verteidigte in Über die Freiheit individuelle Freiheit, Meinungsfreiheit und – früh – die Gleichberechtigung der Frau.',
          kernidee: 'Richtig ist diejenige Handlung, die das größte Glück der größten Zahl fördert – doch manche Freuden sind qualitativ höherwertig als andere.',
          inhalt: 'Mill verfeinerte den von Jeremy Bentham begründeten Utilitarismus, indem er zwischen höheren (geistigen) und niederen (körperlichen) Freuden unterschied – „besser ein unzufriedener Sokrates als ein zufriedenes Schwein". In „Über die Freiheit" verteidigte er das Schadensprinzip: Der Staat darf individuelle Freiheit nur einschränken, um Schaden an anderen zu verhindern, nicht um Menschen vor sich selbst zu schützen. Früh setzte er sich zudem für die Gleichberechtigung der Frau ein.',
          wirkung: 'Mills Utilitarismus und seine liberale Freiheitstheorie prägen bis heute Ethik, Rechtsphilosophie und politische Theorie und gelten als Grundpfeiler des modernen Liberalismus.',
          kritik: 'Kritiker wandten ein, dass die Unterscheidung zwischen „höheren" und „niederen" Freuden letztlich elitäre, nicht rein utilitaristisch begründbare Werturteile einführt. Der klassische Utilitarismus insgesamt steht in der Kritik, weil er im Prinzip auch die Aufopferung Einzelner zugunsten der Mehrheit rechtfertigen könnte.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „John Stuart Mill" – https://plato.stanford.edu/entries/mill/',
            'Internet Encyclopedia of Philosophy (IEP): „John Stuart Mill" – https://iep.utm.edu/milljs/'
          ],
          book: { title: 'Der Utilitarismus', author: 'John Stuart Mill', url: 'https://link.amazon/B03aSTtvh' } },
        { id: 'marx', name: 'Karl Marx', meta: '1818–1883 · Historischer Materialismus', year: 1818, tradition: 'west', epoch: 'idealismus', str: ['materialismus', 'marxismus'], dis: ['politik', 'metaphysik'],
          desc: 'Stellte Hegels Dialektik „vom Kopf auf die Füße": Nicht Ideen, sondern die materiellen Produktionsverhältnisse treiben die Geschichte (historischer Materialismus). Seine Analyse von Kapital, Klasse und Entfremdung wurde zur Grundlage des Marxismus und einer der folgenreichsten politischen Theorien der Weltgeschichte.',
          kernidee: 'Nicht Ideen und Bewusstsein treiben die Geschichte an, sondern die materiellen Produktionsverhältnisse und die daraus entstehenden Klassenkämpfe.',
          inhalt: 'Marx stellte Hegels Dialektik, wie er sagte, „vom Kopf auf die Füße": Nicht der Weltgeist, sondern die materiellen Produktionsverhältnisse – wer über Produktionsmittel verfügt und wer seine Arbeitskraft verkaufen muss – bestimmen Gesellschaft, Recht und Bewusstsein (historischer Materialismus). Im Kapitalismus werde die Arbeiterklasse durch die Aneignung des von ihr geschaffenen Mehrwerts ausgebeutet und dem eigenen Tun entfremdet. Geschichte sei die Geschichte von Klassenkämpfen, die auf eine klassenlose, kommunistische Gesellschaft zulaufe.',
          wirkung: 'Marx\' Analyse von Kapital, Klasse und Entfremdung wurde zur Grundlage des Marxismus und einer der folgenreichsten und einflussreichsten politischen Theorien der Weltgeschichte, die im 20. Jahrhundert zahlreiche Staaten und Revolutionen prägte.',
          kritik: 'Marx\' Prognose einer notwendigen kommunistischen Revolution in den am weitesten entwickelten kapitalistischen Ländern hat sich historisch so nicht erfüllt; die im 20. Jahrhundert in seinem Namen errichteten Staaten führten oft zu autoritärer Diktatur statt zur versprochenen Freiheit. Ökonomen kritisieren zudem seine Arbeitswerttheorie als unzureichend zur Erklärung von Preisen und Wert.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Karl Marx" – https://plato.stanford.edu/entries/marx/',
            'Internet Encyclopedia of Philosophy (IEP): „Karl Marx" – https://iep.utm.edu/marx/'
          ],
          book: { title: 'Das Kommunistische Manifest', author: 'Karl Marx', url: 'https://link.amazon/B0iflkCe1' } },
        { id: 'dostojewski', name: 'Fjodor Dostojewski', meta: '1821–1881 · Literarischer Wegbereiter des Existenzialismus', year: 1821, tradition: 'west', epoch: 'idealismus', str: ['existenzialismus'], dis: ['ethik', 'metaphysik', 'geist'],
          desc: 'Der russische Romancier war kein Systemphilosoph, doch seine Werke – Schuld und Sühne, Die Brüder Karamasow, Aufzeichnungen aus dem Kellerloch – gehören zu den tiefsten philosophischen Auseinandersetzungen mit Freiheit, Schuld, Leid und Glaube. In der „Großinquisitor"-Parabel und der Frage, ob „ohne Gott alles erlaubt" sei, nahm er zentrale Motive des Existenzialismus und Nihilismus vorweg. Er beeinflusste Nietzsche, Kierkegaard-nahe Denker sowie Sartre, Camus und Heidegger tief.',
          kernidee: 'Ohne einen letzten moralischen Halt – sei es Gott oder eine verbindliche Wahrheit – droht dem Menschen der Absturz in Beliebigkeit, Verzweiflung oder Gewalt.',
          inhalt: 'Dostojewski war kein Systemphilosoph, doch seine Romane – „Schuld und Sühne", „Die Brüder Karamasow", „Aufzeichnungen aus dem Kellerloch" – gehören zu den tiefsten literarischen Auseinandersetzungen mit Freiheit, Schuld, Leid und Glaube. In der „Großinquisitor"-Parabel lässt er einen Kirchenmann argumentieren, dass die Menschen lieber Brot und Sicherheit als die schwere Last der Freiheit wollen. Seine Figuren ringen exemplarisch mit der Frage, ob ohne Gott „alles erlaubt" sei.',
          wirkung: 'Dostojewski nahm zentrale Motive des Existenzialismus und Nihilismus vorweg und beeinflusste Nietzsche, Sartre, Camus und Heidegger tief; seine psychologisch tiefen Figuren gelten bis heute als philosophisch ergiebig.',
          kritik: 'Der berühmte Satz „wenn es Gott nicht gibt, ist alles erlaubt" steht in dieser knappen Form so nicht wörtlich bei Dostojewski, sondern ist eine spätere Zuspitzung seiner Themen, vor allem durch Sartre popularisiert. Zudem wird seine eigene, oft reaktionäre politische Weltanschauung kritisch von seinem literarischen Werk unterschieden.',
          zitat: { text: 'Wenn es Gott nicht gibt, ist alles erlaubt.', quelle: 'Sinngemäße Zuspitzung von Motiven aus „Die Brüder Karamasow"; vgl. IEP: „Fyodor Dostoevsky"' },
          quellen: [
            'Internet Encyclopedia of Philosophy (IEP): „Fyodor Dostoevsky" – https://iep.utm.edu/dostoevsky/',
            'Encyclopaedia Britannica: „Fyodor Dostoevsky" – https://www.britannica.com/biography/Fyodor-Dostoevsky'
          ],
          book: { title: 'Die Brüder Karamasow', author: 'Fjodor Dostojewski', url: 'https://link.amazon/B0cM1IFoB' } },
        { id: 'nietzsche', name: 'Friedrich Nietzsche', meta: '1844–1900 · Lebensphilosophie / Kulturkritik', year: 1844, tradition: 'west', epoch: 'idealismus', str: [], dis: ['ethik', 'metaphysik'], entry: true,
          desc: 'Radikaler Kritiker von Moral, Religion und Metaphysik. Mit der Diagnose „Gott ist tot" benannte er den Verlust verbindlicher Werte (Nihilismus) und forderte eine „Umwertung aller Werte". Zentrale Motive: Wille zur Macht, Übermensch, ewige Wiederkehr. Sein Stil und seine Verdachtshermeneutik prägten die gesamte Moderne.',
          kernidee: 'Mit dem Tod der christlichen Gott-Idee sind auch die von ihr abhängigen absoluten Werte hinfällig geworden – der Mensch muss nun eigene, lebensbejahende Werte neu schaffen.',
          inhalt: 'Nietzsche diagnostizierte mit „Gott ist tot" den Verlust verbindlicher, transzendent begründeter Werte in der Moderne (Nihilismus) und forderte eine „Umwertung aller Werte", die das Leben bejaht statt es zu verneinen. Zentrale Motive sind der „Wille zur Macht" als treibende Kraft alles Lebendigen, der „Übermensch" als Bild eines Menschen, der eigene Werte schafft, und die „ewige Wiederkehr" als Testfrage: Könntest du wollen, dass sich dein Leben unendlich oft genau gleich wiederholt?',
          wirkung: 'Nietzsches Kritik an Moral, Religion und Metaphysik sowie seine Methode des Misstrauens gegenüber vorgeblich objektiven Wahrheiten prägten die gesamte Moderne, von Existenzialismus über Psychoanalyse bis zur Postmoderne.',
          kritik: 'Seine Schriften wurden von seiner Schwester nach seinem Tod editorisch verfälscht und für nationalsozialistische Propaganda missbraucht, obwohl Nietzsche selbst Nationalismus und Antisemitismus scharf ablehnte – eine bis heute nachwirkende Fehldeutung. Seine Begriffe wie „Wille zur Macht" oder „Übermensch" bleiben zudem in der Forschung stark umstritten und uneindeutig interpretierbar.',
          zitat: { text: 'Was mich nicht umbringt, macht mich stärker.', quelle: 'Friedrich Nietzsche, „Götzen-Dämmerung", Sprüche und Pfeile 8 (1889); vgl. SEP: „Nietzsche"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Friedrich Nietzsche" – https://plato.stanford.edu/entries/nietzsche/',
            'Internet Encyclopedia of Philosophy (IEP): „Friedrich Nietzsche" – https://iep.utm.edu/nietzsch/'
          ],
          book: { title: 'Also sprach Zarathustra', author: 'Friedrich Nietzsche', url: 'https://link.amazon/B0eWsTbJB' } },
        { id: 'peirce', name: 'Charles S. Peirce & William James', meta: '19. Jh. · Amerikanischer Pragmatismus', year: 1842, tradition: 'west', epoch: 'idealismus', str: ['pragmatismus'], dis: ['epistemologie', 'logik'],
          hauptvertreter: 'Charles S. Peirce, William James, John Dewey',
          desc: 'Der Pragmatismus misst die Bedeutung und Wahrheit einer Idee an ihren praktischen Folgen. Peirce begründete ihn als Logiker, James popularisierte ihn; später führte John Dewey ihn in Pädagogik und Demokratietheorie weiter.',
          kernidee: 'Die Bedeutung und Wahrheit einer Idee bemisst sich nicht an abstrakter Übereinstimmung mit der Wirklichkeit, sondern an ihren konkreten praktischen Konsequenzen.',
          inhalt: 'Charles S. Peirce begründete den Pragmatismus als logische Maxime: Um den Sinn eines Begriffs zu klären, muss man fragen, welche praktischen Wirkungen sein Gegenstand hätte. William James popularisierte diese Idee und wandte sie auch auf Wahrheit und Religion an: Wahr ist, was sich im Leben „bewährt". John Dewey führte den Pragmatismus in Pädagogik, Demokratietheorie und „Instrumentalismus" weiter, wonach Ideen Werkzeuge zur Lösung konkreter Probleme sind.',
          wirkung: 'Der Pragmatismus gilt als die eigenständigste genuin amerikanische philosophische Tradition und beeinflusst bis heute Wissenschaftstheorie, Erziehungswissenschaft und die neopragmatistische Philosophie.',
          kritik: 'Kritiker warfen dem Pragmatismus vor, mit dem Kriterium der „praktischen Bewährung" die Wahrheit zu relativieren und beliebig nützliche Überzeugungen für wahr erklären zu können, selbst wenn sie es objektiv nicht sind. Peirce selbst distanzierte sich später von James\' populärerer, freizügigerer Version und nannte seine eigene strengere Lehre „Pragmatizismus".',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Charles Sanders Peirce" – https://plato.stanford.edu/entries/peirce/',
            'Stanford Encyclopedia of Philosophy (SEP): „Pragmatism" – https://plato.stanford.edu/entries/pragmatism/'
          ],
          book: { title: 'Pragmatismus und Pragmatizismus', author: 'William James', url: 'https://link.amazon/B0aWblFlM' } },

        /* ─── 20./21. JH: ANALYTISCH ─── */
        { id: 'frege', name: 'Gottlob Frege', meta: '1848–1925 · Begründer der modernen Logik', year: 1848, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['logik', 'sprache'],
          desc: 'Revolutionierte die Logik (Begriffsschrift) und die Sprachphilosophie (Unterscheidung von „Sinn" und „Bedeutung"). Er ist der gemeinsame Ausgangspunkt der analytischen Philosophie.',
          kernidee: 'Mathematik und Logik lassen sich auf ein streng formales, von Sprache und Psychologie unabhängiges Fundament zurückführen.',
          inhalt: 'Frege revolutionierte die Logik mit seiner „Begriffsschrift", einer neuen, symbolischen Notation, die weit über die traditionelle aristotelische Syllogistik hinausging und die moderne Quantorenlogik begründete. In der Sprachphilosophie unterschied er scharf zwischen „Sinn" (der Art, wie ein Ausdruck seinen Gegenstand präsentiert) und „Bedeutung" (dem Gegenstand selbst) – etwa bei „Morgenstern" und „Abendstern", die denselben Gegenstand (die Venus) bezeichnen, aber unterschiedlichen Sinn haben.',
          wirkung: 'Frege gilt als Vater der modernen formalen Logik und der analytischen Philosophie und ist der gemeinsame Ausgangspunkt für Russell, Wittgenstein und die gesamte spätere Sprachphilosophie.',
          kritik: 'Freges Versuch, die gesamte Mathematik streng logisch aus wenigen Grundgesetzen abzuleiten, scheiterte, als Bertrand Russell ihm 1902 einen tödlichen Widerspruch in seinem System aufzeigte (Russells Paradoxie), kurz bevor der zweite Band seines Hauptwerks erschien. Seine späten, offen antisemitischen und nationalistischen politischen Tagebucheinträge stehen in scharfem Kontrast zu seinem wissenschaftlichen Werk.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Gottlob Frege" – https://plato.stanford.edu/entries/frege/',
            'Internet Encyclopedia of Philosophy (IEP): „Gottlob Frege" – https://iep.utm.edu/frege/'
          ] },
        { id: 'russell', name: 'Bertrand Russell & G. E. Moore', meta: 'frühes 20. Jh. · Cambridge', year: 1872, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['logik', 'ethik'],
          hauptvertreter: 'Bertrand Russell, George Edward Moore',
          desc: 'Russell (mit Whitehead: Principia Mathematica) versuchte, die Mathematik auf Logik zurückzuführen, und war zugleich ein öffentlicher Intellektueller und Pazifist. Moore begründete die analytische Ethik und die Alltagssprachphilosophie.',
          kernidee: 'Philosophische Probleme lassen sich durch sorgfältige logische Analyse der Sprache klären – und die Mathematik selbst sollte vollständig auf Logik zurückgeführt werden.',
          inhalt: 'Russell versuchte zusammen mit Alfred North Whitehead in den monumentalen „Principia Mathematica", die gesamte Mathematik aus rein logischen Grundlagen abzuleiten (Logizismus), und entwickelte einflussreiche Theorien zu Kennzeichnungen und Bezugnahme in der Sprache. Zugleich war er ein öffentlicher Intellektueller, Pazifist und Nobelpreisträger für Literatur. George Edward Moore begründete mit seiner Verteidigung des gesunden Menschenverstands („Hier ist eine Hand") die analytische Ethik und Alltagssprachphilosophie und kritisierte den „naturalistischen Fehlschluss" in ethischen Theorien.',
          wirkung: 'Russell und Moore gelten neben Frege als Begründer der analytischen Philosophie des 20. Jahrhunderts, die Klarheit, logische Strenge und Sprachanalyse in den Mittelpunkt stellt und bis heute die anglo-amerikanische Philosophie prägt.',
          kritik: 'Russells eigenes logizistisches Programm scheiterte letztlich an Gödels Unvollständigkeitssätzen, die zeigten, dass sich nicht jede mathematische Wahrheit rein logisch ableiten lässt. Moores Berufung auf den „gesunden Menschenverstand" gegen radikale skeptische oder idealistische Argumente wurde von Kritikern als zu wenig philosophisch begründet angesehen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Bertrand Russell" – https://plato.stanford.edu/entries/russell/',
            'Stanford Encyclopedia of Philosophy (SEP): „George Edward Moore" – https://plato.stanford.edu/entries/moore/'
          ] },
        { id: 'wittgenstein', name: 'Ludwig Wittgenstein', meta: '1889–1951 · Sprachphilosophie', year: 1889, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['sprache', 'logik'],
          desc: 'Einer der originellsten Denker der Moderne – mit zwei Philosophien: Im Tractatus bestimmt er die Grenzen des Sagbaren; in den späten Philosophischen Untersuchungen versteht er Sprache als Vielfalt von „Sprachspielen", deren Bedeutung im Gebrauch liegt.',
          kernidee: 'Viele philosophische Probleme entstehen nicht aus der Sache selbst, sondern aus Verwirrungen über die Sprache, in der wir über sie sprechen.',
          inhalt: 'Im frühen „Tractatus logico-philosophicus" bestimmte Wittgenstein die Grenzen des Sagbaren: Sprache bildet die logische Struktur der Welt ab, und „wovon man nicht sprechen kann, darüber muss man schweigen". In den späten „Philosophischen Untersuchungen" verwarf er dieses Bild und verstand Sprache stattdessen als Vielfalt von „Sprachspielen", eingebettet in „Lebensformen", deren Bedeutung sich allein aus ihrem Gebrauch ergibt, nicht aus einer festen Abbildungsbeziehung.',
          wirkung: 'Wittgenstein gilt als einer der einflussreichsten und originellsten Denker des 20. Jahrhunderts mit zwei fundamental verschiedenen, jeweils enorm einflussreichen Philosophien; seine Spätphilosophie prägte die gesamte Sprachphilosophie und Teile der Philosophie des Geistes.',
          kritik: 'Kritiker bemängeln, dass Wittgensteins spätere, bewusst unsystematische, aphoristische Schreibweise seine Thesen oft vage und schwer eindeutig interpretierbar macht, was zu jahrzehntelangen Interpretationsstreitigkeiten führte. Sein früher Tractatus wurde später auch von ihm selbst als in wesentlichen Teilen verfehlt zurückgewiesen.',
          zitat: { text: 'Wovon man nicht sprechen kann, darüber muss man schweigen.', quelle: 'Ludwig Wittgenstein, „Tractatus logico-philosophicus" 7 (1921); vgl. SEP: „Wittgenstein"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Ludwig Wittgenstein" – https://plato.stanford.edu/entries/wittgenstein/',
            'Internet Encyclopedia of Philosophy (IEP): „Ludwig Wittgenstein" – https://iep.utm.edu/wittgens/'
          ],
          book: { title: 'Philosophische Untersuchungen', author: 'Ludwig Wittgenstein', url: 'https://link.amazon/B0ehdsMQN' } },
        { id: 'popper', name: 'Wiener Kreis & Karl Popper', meta: '1920er–1960er · Wissenschaftsphilosophie', year: 1902, tradition: 'west', epoch: 'moderne', str: ['positivismus'], dis: ['wissenschaft', 'epistemologie'],
          hauptvertreter: 'Moritz Schlick, Rudolf Carnap, Karl Popper',
          desc: 'Der logische Positivismus des Wiener Kreises (Carnap, Schlick) wollte Metaphysik als sinnlos ausscheiden und nur empirisch Prüfbares gelten lassen. Karl Popper setzte dagegen das Falsifikationsprinzip: Wissenschaftlich ist eine Theorie, wenn sie widerlegbar ist. In Die offene Gesellschaft verteidigte er die liberale Demokratie.',
          kernidee: 'Eine Theorie ist nur dann wissenschaftlich, wenn sie sich im Prinzip durch Beobachtung widerlegen (falsifizieren) lässt – nicht Bestätigung, sondern Widerlegbarkeit ist das Kennzeichen von Wissenschaft.',
          inhalt: 'Der logische Positivismus des Wiener Kreises um Schlick und Carnap wollte metaphysische Aussagen als buchstäblich sinnlos ausscheiden, da sie sich weder logisch beweisen noch empirisch verifizieren lassen. Karl Popper hielt diesem Verifikationsprinzip entgegen, dass sich auch strenge Wissenschaft nie endgültig verifizieren, wohl aber falsifizieren lässt – eine Theorie ist wissenschaftlich, wenn sie riskante, widerlegbare Vorhersagen macht. In „Die offene Gesellschaft und ihre Feinde" verteidigte er zudem die liberale Demokratie gegen totalitäre Ideologien, die er im „Historizismus" bei Platon, Hegel und Marx am Werk sah.',
          wirkung: 'Poppers Falsifikationsprinzip wurde zur einflussreichsten Antwort auf das Abgrenzungsproblem zwischen Wissenschaft und Pseudowissenschaft und prägt bis heute das Selbstverständnis vieler Naturwissenschaften.',
          kritik: 'Wissenschaftstheoretiker wie Thomas Kuhn und Imre Lakatos zeigten, dass Wissenschaftler in der Praxis selten eine Theorie beim ersten widersprechenden Ergebnis verwerfen, sondern oft an ihr festhalten und Zusatzannahmen einführen – reine Falsifikation beschreibt die tatsächliche Wissenschaftsgeschichte nur unvollständig. Der radikale Sinnverifikationismus des Wiener Kreises geriet zudem selbst in die Kritik, weil sein eigenes Sinnkriterium sich nicht empirisch verifizieren lässt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Karl Popper" – https://plato.stanford.edu/entries/popper/',
            'Stanford Encyclopedia of Philosophy (SEP): „The Vienna Circle" – https://plato.stanford.edu/entries/vienna-circle/'
          ] },
        { id: 'quine', name: 'W. V. O. Quine & spätere Analytiker', meta: '20. Jh. · USA', year: 1908, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['sprache', 'logik', 'wissenschaft'],
          desc: 'Quine kritisierte die Unterscheidung von analytischen und synthetischen Sätzen und prägte einen naturalistischen Holismus. Saul Kripke erneuerte die Modallogik und Bedeutungstheorie; die analytische Philosophie differenzierte sich in Geistes-, Sprach- und Wissenschaftsphilosophie aus.',
          kernidee: 'Es gibt keine scharfe Grenze zwischen Sätzen, die allein aufgrund ihrer Bedeutung wahr sind, und solchen, die von Erfahrung abhängen – unser gesamtes Überzeugungssystem wird immer nur als Ganzes an der Erfahrung geprüft.',
          inhalt: 'Quine griff in „Two Dogmas of Empiricism" die von den logischen Positivisten vorausgesetzte scharfe Unterscheidung zwischen analytischen (bedeutungswahren) und synthetischen (erfahrungsabhängigen) Sätzen an und vertrat stattdessen einen Holismus: Nicht einzelne Sätze, sondern immer nur unser gesamtes Überzeugungsnetz wird an der Erfahrung getestet. Er forderte zudem eine „naturalisierte Erkenntnistheorie", die Philosophie eng mit den empirischen Wissenschaften verzahnt. Später erneuerte Saul Kripke mit seiner Theorie starrer Bezeichner die Modallogik und Bedeutungstheorie grundlegend.',
          wirkung: 'Quines Kritik erschütterte die Grundlagen des logischen Positivismus und öffnete die analytische Philosophie für einen stärker naturalistischen, wissenschaftsnahen Zugang, der bis heute die amerikanische Philosophie prägt.',
          kritik: 'Kritiker wie Paul Grice und Peter Strawson verteidigten die Analytisch-Synthetisch-Unterscheidung gegen Quines Angriff als für das Verständnis von Sprache unverzichtbar. Quines radikaler Holismus wirft zudem die Frage auf, wie einzelne wissenschaftliche Hypothesen dann überhaupt noch gezielt geprüft werden können.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Willard Van Orman Quine" – https://plato.stanford.edu/entries/quine/',
            'Stanford Encyclopedia of Philosophy (SEP): „The Analytic/Synthetic Distinction" – https://plato.stanford.edu/entries/analytic-synthetic/'
          ] },
        { id: 'rawls', name: 'John Rawls', meta: '1921–2002 · Politische Philosophie', year: 1921, tradition: 'west', epoch: 'moderne', str: ['liberalismus', 'kontraktualismus'], dis: ['politik', 'ethik'],
          desc: 'Belebte mit Eine Theorie der Gerechtigkeit (1971) die politische Philosophie neu. Sein Gedankenexperiment des „Schleiers des Nichtwissens" begründet Prinzipien einer gerechten Gesellschaft. Robert Nozick antwortete mit einer libertären Gegenposition.',
          kernidee: 'Gerechte Grundprinzipien einer Gesellschaft sind die, auf die sich vernünftige Menschen einigen würden, wenn sie ihre eigene Stellung in dieser Gesellschaft noch nicht kennten.',
          inhalt: 'Rawls belebte mit „Eine Theorie der Gerechtigkeit" (1971) die politische Philosophie neu, nachdem sie jahrzehntelang von analytischer Sprachphilosophie überschattet worden war. Sein zentrales Gedankenexperiment ist der „Schleier des Nichtwissens": Hinter diesem Schleier, ohne zu wissen, welche gesellschaftliche Position man selbst einnehmen wird, würden vernünftige Menschen zwei Grundsätze wählen – gleiche Grundfreiheiten für alle sowie soziale Ungleichheiten nur dann, wenn sie den Schwächsten am meisten nützen (Differenzprinzip). Robert Nozick antwortete mit einer libertären Gegenposition, die individuelle Eigentumsrechte gegen staatliche Umverteilung verteidigt.',
          wirkung: 'Rawls\' Werk gilt als das einflussreichste Werk der politischen Philosophie des 20. Jahrhunderts und prägt bis heute Debatten über soziale Gerechtigkeit, Wohlfahrtsstaat und Verteilungsfragen.',
          kritik: 'Kommunitaristische Kritiker wie Michael Sandel warfen Rawls vor, mit dem abstrakten, von aller Geschichte und Bindung befreiten Individuum hinter dem Schleier des Nichtwissens ein unrealistisches Menschenbild vorauszusetzen. Nozick kritisierte umgekehrt, dass Rawls\' Umverteilungsprinzipien individuelle Eigentumsrechte unzulässig einschränken.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „John Rawls" – https://plato.stanford.edu/entries/rawls/',
            'Stanford Encyclopedia of Philosophy (SEP): „Original Position" – https://plato.stanford.edu/entries/original-position/'
          ] },

        /* ─── 20./21. JH: KONTINENTAL ─── */
        { id: 'husserl', name: 'Edmund Husserl', meta: '1859–1938 · Begründer der Phänomenologie', year: 1859, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie'], dis: ['geist', 'epistemologie'],
          desc: 'Die Phänomenologie untersucht die Strukturen des Bewusstseins und die Weise, wie sich Dinge dem Erleben zeigen („Zu den Sachen selbst!"). Husserl wurde zum Ausgangspunkt Heideggers, Sartres und Merleau-Pontys.',
          kernidee: 'Bevor man über die Existenz der Außenwelt urteilt, sollte man zunächst genau untersuchen, wie sich die Dinge im eigenen Bewusstsein überhaupt zeigen.',
          inhalt: 'Husserl begründete die Phänomenologie als strenge Methode, mit der „Zu den Sachen selbst!" zurückgegangen werden soll: Statt vorschnelle theoretische Annahmen über die Welt zu machen, soll man durch die „Epoché" (Einklammerung) alle Vorurteile über die reale Existenz der Dinge zunächst zurückstellen und rein beschreiben, wie Bewusstsein Gegenstände konstituiert und wie sie sich ihm zeigen (Intentionalität). Damit wollte er eine „strenge Wissenschaft" der Erkenntnis begründen, jenseits von Psychologismus und Naturalismus.',
          wirkung: 'Husserls Phänomenologie wurde zum Ausgangspunkt einer ganzen Denktradition – Heidegger, Sartre, Merleau-Ponty und die gesamte kontinentale Philosophie des 20. Jahrhunderts bauen unmittelbar auf seiner Methode auf.',
          kritik: 'Sein eigener Schüler Heidegger wandte sich von Husserls Fokus auf das reine Bewusstsein ab und stellte stattdessen die konkrete, in der Welt existierende Existenz (Dasein) ins Zentrum, was Husserl selbst als Abkehr von der Phänomenologie empfand. Kritiker bemängeln zudem, dass die „Epoché" nie ganz konsequent durchführbar ist, da jede Beschreibung immer schon Vorannahmen voraussetzt.',
          zitat: { text: 'Zu den Sachen selbst!', quelle: 'Edmund Husserl, „Logische Untersuchungen" II/1, Einleitung (1901); vgl. SEP: „Husserl"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Edmund Husserl" – https://plato.stanford.edu/entries/husserl/',
            'Internet Encyclopedia of Philosophy (IEP): „Edmund Husserl" – https://iep.utm.edu/husserl/'
          ] },
        { id: 'heidegger', name: 'Martin Heidegger', meta: '1889–1976 · Fundamentalontologie', year: 1889, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie', 'existenzialismus'], dis: ['metaphysik', 'geist'],
          desc: 'Stellte in Sein und Zeit die „Seinsfrage" neu und analysierte den Menschen als „In-der-Welt-sein" (Dasein), geprägt von Sorge, Zeitlichkeit und Endlichkeit. Enorm einflussreich – zugleich wegen seiner Verstrickung in den Nationalsozialismus bis heute umstritten.',
          kernidee: 'Die Philosophie hat vergessen, überhaupt danach zu fragen, was „Sein" eigentlich bedeutet – und muss diese Frage neu stellen, ausgehend vom menschlichen Dasein selbst.',
          inhalt: 'Heidegger stellte in „Sein und Zeit" die von der abendländischen Philosophie angeblich vergessene „Seinsfrage" neu und analysierte den Menschen als „In-der-Welt-sein" (Dasein) – ein Wesen, das sich immer schon in einer Welt aus Sorge, Werkzeugen und Mitmenschen vorfindet. Zentral sind Angst, Sorge, Zeitlichkeit und das „Sein zum Tode": Erst im bewussten Vorlaufen zur eigenen Sterblichkeit könne der Mensch zu einer „eigentlichen" Existenz finden, statt im anonymen „Man" aufzugehen.',
          wirkung: 'Heidegger zählt zu den einflussreichsten und zugleich umstrittensten Philosophen des 20. Jahrhunderts; sein Werk prägte Existenzialismus, Hermeneutik, Dekonstruktion und die gesamte kontinentale Philosophie nach ihm tief.',
          kritik: 'Heideggers aktive Mitgliedschaft in der NSDAP und seine Rolle als nationalsozialistischer Rektor 1933/34, verbunden mit später bekannt gewordenen antisemitischen Passagen in seinen privaten „Schwarzen Heften", werfen bis heute die Frage auf, wie sein Denken und seine politische Verstrickung zusammenhängen. Sein bewusst dunkler, neologismenreicher Stil wird zudem oft als unnötig unzugänglich kritisiert.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Martin Heidegger" – https://plato.stanford.edu/entries/heidegger/',
            'Internet Encyclopedia of Philosophy (IEP): „Martin Heidegger" – https://iep.utm.edu/heidegge/'
          ] },
        { id: 'sartre', name: 'Jean-Paul Sartre & Simone de Beauvoir', meta: '20. Jh. · Existenzialismus', year: 1905, tradition: 'west', epoch: 'moderne', str: ['existenzialismus', 'feminismus'], dis: ['ethik', 'metaphysik'], entry: true,
          desc: 'Sartre: „Die Existenz geht der Essenz voraus" – der Mensch ist zur Freiheit verurteilt und schafft sich selbst durch seine Entscheidungen. Simone de Beauvoir übertrug den Existenzialismus in Das andere Geschlecht auf die Geschlechterfrage („Man wird nicht als Frau geboren, man wird es") und wurde zur Begründerin der modernen feministischen Philosophie. Albert Camus gab dem Denken des Absurden literarische Gestalt.',
          kernidee: 'Der Mensch hat keine vorgegebene Natur oder Bestimmung – er existiert zunächst einfach und erschafft sich selbst erst durch seine freien Entscheidungen.',
          inhalt: 'Sartre fasste den Existenzialismus in der Formel „Die Existenz geht der Essenz voraus": Anders als ein Werkzeug, das nach einem Plan gefertigt wird, hat der Mensch keine vorgegebene Bestimmung – er wird in die Existenz geworfen und muss sich selbst durch seine Entscheidungen erst erschaffen, in radikaler, unentrinnbarer Freiheit. Simone de Beauvoir übertrug diesen Gedanken in „Das andere Geschlecht" auf die Geschlechterfrage: „Man wird nicht als Frau geboren, man wird es" – Weiblichkeit sei kein biologisches Schicksal, sondern gesellschaftlich konstruiert. Albert Camus gab dem verwandten Denken des Absurden – dem Konflikt zwischen menschlichem Sinnverlangen und einem stummen Universum – literarische Gestalt.',
          wirkung: 'Sartre und Beauvoir machten den Existenzialismus zur prägenden Strömung des 20. Jahrhunderts weit über die Fachphilosophie hinaus; Beauvoirs Werk gilt als Gründungstext der modernen feministischen Philosophie.',
          kritik: 'Kritiker wandten ein, dass Sartres Begriff radikaler Freiheit die realen sozialen, ökonomischen und biologischen Beschränkungen menschlichen Handelns unterschätzt. Seine zeitweilige politische Nähe zu autoritären kommunistischen Positionen wurde ihm später von ehemaligen Weggefährten wie Camus scharf vorgeworfen.',
          zitat: { text: 'Die Existenz geht der Essenz voraus.', quelle: 'Jean-Paul Sartre, „Der Existenzialismus ist ein Humanismus" (1946); vgl. SEP: „Sartre"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Jean-Paul Sartre" – https://plato.stanford.edu/entries/sartre/',
            'Stanford Encyclopedia of Philosophy (SEP): „Simone de Beauvoir" – https://plato.stanford.edu/entries/beauvoir/'
          ] },
        { id: 'merleau', name: 'Merleau-Ponty, Gadamer, Arendt', meta: '20. Jh. · Leib, Verstehen, Politik', year: 1906, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie', 'hermeneutik'], dis: ['geist', 'politik'],
          hauptvertreter: 'Maurice Merleau-Ponty, Hans-Georg Gadamer, Hannah Arendt',
          desc: 'Merleau-Ponty rückte den Leib ins Zentrum der Wahrnehmung. Hans-Georg Gadamer begründete die philosophische Hermeneutik (Lehre vom Verstehen). Hannah Arendt analysierte Totalitarismus, Macht und das „Banale des Bösen" und erneuerte das Denken über das politische Handeln.',
          kernidee: 'Wir erkennen die Welt nicht als distanzierter Beobachter, sondern immer schon durch unseren gelebten, wahrnehmenden Körper – und jedes Verstehen ist geschichtlich situiert.',
          inhalt: 'Merleau-Ponty rückte gegen eine rein verstandesorientierte Philosophie den Leib ins Zentrum der Wahrnehmung: Wir erfahren die Welt nicht abstrakt, sondern immer schon leiblich, bevor wir sie begrifflich verarbeiten. Hans-Georg Gadamer begründete mit „Wahrheit und Methode" die philosophische Hermeneutik: Verstehen ist nie voraussetzungslos, sondern immer von der eigenen geschichtlichen Vorprägung mitbestimmt und vollzieht sich als „Verschmelzung von Horizonten". Hannah Arendt analysierte die Ursprünge des Totalitarismus, unterschied Formen menschlichen Handelns (Arbeiten, Herstellen, Handeln) und prägte mit der „Banalität des Bösen" einen bis heute zentralen Begriff zum Verständnis bürokratisch organisierter Gewalt.',
          wirkung: 'Diese drei Denker erweiterten die Phänomenologie um Leib, Verstehen und Politik und beeinflussen bis heute Kognitionswissenschaft, Geisteswissenschaften und politische Theorie.',
          kritik: 'Arendts These von der „Banalität des Bösen" am Beispiel Adolf Eichmanns wurde von Kritikern angezweifelt, die Eichmann für einen überzeugten, keineswegs bloß gedankenlosen Antisemiten hielten. Gadamers Hermeneutik wurde von Jürgen Habermas kritisiert, weil sie überlieferte Traditionen zu unkritisch gegenüber ideologischer Verzerrung mache.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Maurice Merleau-Ponty" – https://plato.stanford.edu/entries/merleau-ponty/',
            'Stanford Encyclopedia of Philosophy (SEP): „Hannah Arendt" – https://plato.stanford.edu/entries/arendt/'
          ] },
        { id: 'frankfurt', name: 'Frankfurter Schule: Adorno, Horkheimer, Habermas', meta: '20. Jh. · Kritische Theorie', year: 1903, tradition: 'west', epoch: 'moderne', str: ['marxismus'], dis: ['politik', 'aesthetik'],
          hauptvertreter: 'Theodor W. Adorno, Max Horkheimer, Jürgen Habermas',
          desc: 'Die Kritische Theorie verband Marx, Freud und Hegel zu einer Diagnose moderner Herrschaft und Kulturindustrie (Dialektik der Aufklärung). Jürgen Habermas entwickelte die Theorie des „kommunikativen Handelns" und der Diskursethik – eine Grundlage heutiger Demokratie- und Öffentlichkeitstheorie.',
          kernidee: 'Die vermeintlich reine, befreiende Vernunft der Aufklärung ist selbst in Herrschaft, Kulturindustrie und Instrumentalisierung umgeschlagen – Gesellschaftskritik muss dies aufdecken.',
          inhalt: 'Adorno und Horkheimer diagnostizierten in der „Dialektik der Aufklärung", dass die aufklärerische Vernunft, die eigentlich zur Befreiung des Menschen von Mythos und Naturzwang gedacht war, selbst in ein neues System der Beherrschung umgeschlagen ist – sichtbar etwa in der „Kulturindustrie", die Kunst zur standardisierten Massenware macht. Jürgen Habermas erneuerte dieses Erbe mit der Theorie des „kommunikativen Handelns": Legitime Normen entstehen im herrschaftsfreien Diskurs, in dem nur das bessere Argument zählen darf – eine Grundlage seiner Diskursethik und heutiger Demokratietheorie.',
          wirkung: 'Die Frankfurter Schule prägte Gesellschafts-, Kultur- und Medienkritik des 20. Jahrhunderts nachhaltig; Habermas\' Diskurstheorie ist bis heute zentral für Debatten über deliberative Demokratie und Öffentlichkeit.',
          kritik: 'Kritiker warfen Adorno und Horkheimer einen elitären, pauschalen Kulturpessimismus gegenüber der modernen Massenkultur vor, der populäre Kunstformen zu Unrecht abwerte. Habermas\' Ideal eines herrschaftsfreien Diskurses wird als zu idealistisch kritisiert, weil reale Machtverhältnisse Kommunikation kaum je vollständig frei von Zwang sein lassen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Critical Theory" – https://plato.stanford.edu/entries/critical-theory/',
            'Stanford Encyclopedia of Philosophy (SEP): „Jürgen Habermas" – https://plato.stanford.edu/entries/habermas/'
          ] },
        { id: 'foucault', name: 'Strukturalismus & Poststrukturalismus', meta: '1960er ff. · Foucault, Derrida u. a.', year: 1926, tradition: 'west', epoch: 'moderne', str: ['strukturalismus'], dis: ['politik', 'sprache'],
          hauptvertreter: 'Michel Foucault, Jacques Derrida, Claude Lévi-Strauss',
          desc: 'Michel Foucault analysierte das Verhältnis von Wissen und Macht und die geschichtliche Formung von Subjekt, Wahnsinn und Sexualität. Jacques Derrida begründete die Dekonstruktion, die feste Bedeutungen und Gegensätze unterläuft. Zusammen mit Lévi-Strauss, Lacan und Deleuze prägten sie das kontinentale Denken der zweiten Jahrhunderthälfte.',
          kernidee: 'Wissen ist nie neutral, sondern immer eng mit Machtverhältnissen verwoben, die bestimmen, was in einer Epoche überhaupt als wahr, normal oder vernünftig gelten kann.',
          inhalt: 'Michel Foucault untersuchte historisch, wie sich Wissen und Macht gegenseitig hervorbringen – etwa in seinen Analysen zur Entstehung von Gefängnis, Klinik und Sexualität, die zeigen, wie gesellschaftliche Normen von „Wahnsinn", Krankheit oder Normalität historisch gemacht statt einfach gegeben sind. Jacques Derrida begründete die Dekonstruktion: eine Lesetechnik, die zeigt, wie Texte scheinbar feste Gegensätze (etwa Sprache/Schrift, Natur/Kultur) unterlaufen und keine endgültige, gesicherte Bedeutung zulassen. Zusammen mit dem Strukturalisten Claude Lévi-Strauss, der Kulturen als Systeme zugrunde liegender Zeichenstrukturen analysierte, sowie Lacan und Deleuze prägten sie das französische Denken der zweiten Jahrhunderthälfte.',
          wirkung: 'Foucaults Machtanalysen und Derridas Dekonstruktion beeinflussten Geistes- und Sozialwissenschaften, Gender Studies, Postcolonial Studies und die Literaturtheorie weltweit tiefgreifend.',
          kritik: 'Kritiker wie Habermas warfen Foucault vor, mit seinem radikalen Machtbegriff selbst keinen Maßstab mehr angeben zu können, von dem aus Kritik an Machtverhältnissen überhaupt noch möglich wäre. Derridas Dekonstruktion wurde vorgeworfen, in Beliebigkeit der Interpretation zu münden und klare Aussagen bewusst zu vermeiden.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Michel Foucault" – https://plato.stanford.edu/entries/foucault/',
            'Stanford Encyclopedia of Philosophy (SEP): „Jacques Derrida" – https://plato.stanford.edu/entries/derrida/'
          ] },
        { id: 'gegenwart', name: 'Weitere Felder der Gegenwart', meta: '20./21. Jh. · Ethik, Geist, Feminismus', year: 1950, tradition: 'west', epoch: 'moderne', str: ['feminismus', 'utilitarismus'], dis: ['ethik', 'geist'],
          hauptvertreter: 'Judith Butler, Peter Singer, Martha Nussbaum, Thomas Nagel',
          desc: 'Wichtige Felder der Gegenwart sind die feministische Philosophie (neben de Beauvoir u. a. Judith Butler, Martha Nussbaum), die Umwelt- und Tierethik (Peter Singer, Hans Jonas), die Angewandte Ethik (Medizin, Technik, KI) sowie die Philosophie des Geistes und der Kognitionswissenschaft (Daniel Dennett, David Chalmers, Thomas Nagel).',
          kernidee: 'Zeitgenössische Philosophie beschäftigt sich zunehmend mit konkreten Fragen von Geschlecht, Tierethik, Technik und Bewusstsein statt nur mit großen geschlossenen Systemen.',
          inhalt: 'Die feministische Philosophie erweiterte, u. a. mit Judith Butler und Martha Nussbaum, de Beauvoirs Ansätze um die Frage, wie Geschlecht sozial erzeugt wird und wie Fähigkeiten (Capabilities) für ein gutes Leben gerecht verteilt sein müssen. In der Tier- und Umweltethik forderten Peter Singer und Hans Jonas, das moralische Mitgefühl auf nichtmenschliche Lebewesen und künftige Generationen auszudehnen. Die Angewandte Ethik befasst sich mit konkreten Fragen in Medizin, Technik und Künstlicher Intelligenz, während die Philosophie des Geistes (Daniel Dennett, David Chalmers, Thomas Nagel) das Rätsel des Bewusstseins – etwa Nagels Frage „Wie ist es, eine Fledermaus zu sein?" – neu stellt.',
          wirkung: 'Diese Felder zeigen, dass Philosophie heute eng mit konkreten gesellschaftlichen, technologischen und wissenschaftlichen Herausforderungen verflochten ist, statt sich auf rein abstrakte Systeme zu beschränken.',
          kritik: 'Kritiker bemängeln, dass die Ausdifferenzierung in immer speziellere Teilgebiete den Blick für große, verbindende philosophische Fragen verlieren lasse. Insbesondere Singers utilitaristische Tierethik wird kontrovers diskutiert, weil sie in Grenzfällen auch traditionelle Vorstellungen vom besonderen moralischen Status menschlichen Lebens infrage stellt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Feminist Philosophy" – https://plato.stanford.edu/entries/feminism-topics/',
            'Stanford Encyclopedia of Philosophy (SEP): „Consciousness" – https://plato.stanford.edu/entries/consciousness/'
          ] },

        /* ─── INDISCHE PHILOSOPHIE ─── */
        { id: 'upanishaden', name: 'Die Upanishaden', meta: 'ab ca. 800 v. Chr. · Vedanta-Grundlage', year: -800, tradition: 'indisch', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          desc: 'Diese Texte lehren die Einheit von individuellem Selbst (Atman) und Weltgrund (Brahman) – „Tat tvam asi" („Das bist du") – und die Befreiung aus dem Kreislauf der Wiedergeburten.',
          kernidee: 'Das tiefste individuelle Selbst und der letzte Weltgrund sind in Wahrheit ein und dasselbe.',
          inhalt: 'Die Upanishaden, die philosophischen Schlussteile der vedischen Literatur, lehren, dass hinter der Vielfalt der Erscheinungen ein einziger, unveränderlicher Weltgrund (Brahman) steht, der mit dem tiefsten individuellen Selbst (Atman) identisch ist – zusammengefasst in der berühmten Formel „Tat tvam asi", „Das bist du". Wer diese Einheit wirklich erkennt, wird aus dem endlosen Kreislauf der Wiedergeburten (Samsara), der durch Handlungen (Karma) angetrieben wird, befreit (Moksha).',
          wirkung: 'Die Upanishaden bilden die philosophische Grundlage des Vedanta, der einflussreichsten Denkschule des Hinduismus, und prägten spätere Denker wie Shankara sowie im Westen unter anderem Schopenhauer.',
          kritik: 'Kritiker aus anderen indischen Traditionen wie dem Buddhismus bestritten gerade die zentrale Annahme eines unveränderlichen Selbst (Atman) und setzten dagegen die Lehre vom Nicht-Selbst (Anatta). Die genaue Verfasserschaft und Datierung der zahlreichen, über Jahrhunderte entstandenen Upanishaden-Texte bleibt zudem historisch unsicher.',
          zitat: { text: 'Tat tvam asi – Das bist du.', quelle: 'Chandogya-Upanishad VI.8.7; vgl. Encyclopaedia Britannica: „Upanishad"' },
          quellen: [
            'Internet Encyclopedia of Philosophy (IEP): „Upanishads" – https://iep.utm.edu/upanisad/',
            'Encyclopaedia Britannica: „Upanishad" – https://www.britannica.com/topic/Upanishad'
          ] },
        { id: 'buddha', name: 'Siddhartha Gautama (Buddha)', meta: 'ca. 563–483 v. Chr. · Buddhismus', year: -563, tradition: 'indisch', epoch: 'antike', str: [], dis: ['ethik', 'metaphysik', 'geist'], entry: true,
          desc: 'Lehrte die „Vier Edlen Wahrheiten" vom Leiden, seiner Ursache (Begierde), seiner Aufhebung und dem „Achtfachen Pfad". Zentral sind Anatta (Nicht-Selbst), Anicca (Vergänglichkeit) und der „mittlere Weg". Der Buddhismus wurde zu einer der großen Weltphilosophien mit reicher Erkenntnistheorie und Logik.',
          kernidee: 'Das Leben ist wesentlich von Leiden geprägt, dessen Ursache im Begehren liegt – wer dieses Begehren durch den Achtfachen Pfad überwindet, kann vom Leiden befreit werden.',
          inhalt: 'Buddha lehrte die „Vier Edlen Wahrheiten": Leiden (Dukkha) durchzieht das Dasein; seine Ursache ist Begierde und Anhaften (Tanha); Leiden kann aufgehoben werden (Nirvana); der Weg dorthin ist der „Achtfache Pfad" aus rechter Erkenntnis, Gesinnung, Rede, Handeln, Lebenswandel, Streben, Achtsamkeit und Sammlung. Zentral sind zudem die Lehren von Anatta (es gibt kein dauerhaftes, unveränderliches Selbst) und Anicca (alles ist vergänglich) sowie der „mittlere Weg" zwischen Genusssucht und selbstquälerischer Askese.',
          wirkung: 'Der Buddhismus wurde zu einer der großen Weltreligionen und -philosophien mit eigener, hoch entwickelter Erkenntnistheorie und Logik und beeinflusst bis heute auch westliche Philosophie und Psychologie, etwa in der Achtsamkeitspraxis.',
          kritik: 'Die Lehre vom Nicht-Selbst (Anatta) wirft die bis heute diskutierte Frage auf, was dann eigentlich von Leben zu Leben wiedergeboren wird, wenn es kein beständiges Selbst gibt. Zudem wird kritisiert, dass die Betonung der Loslösung von weltlichem Begehren in Spannung zu sozialem und politischem Engagement für Gerechtigkeit stehen kann.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Buddha" – https://plato.stanford.edu/entries/buddha/',
            'Internet Encyclopedia of Philosophy (IEP): „Siddhartha Gautama (Buddha)" – https://iep.utm.edu/buddha/'
          ] },
        { id: 'mahavira', name: 'Mahavira', meta: 'ca. 599–527 v. Chr. · Jainismus', year: -599, tradition: 'indisch', epoch: 'antike', str: [], dis: ['ethik', 'metaphysik'],
          desc: 'Prägende Gestalt des Jainismus mit seiner radikalen Gewaltlosigkeit (Ahimsa) und der Lehre von der Vielseitigkeit der Wahrheit (Anekantavada).',
          kernidee: 'Da jedes Lebewesen eine unsterbliche Seele besitzt, ist absolute Gewaltlosigkeit gegenüber allem Lebendigen die höchste ethische Pflicht.',
          inhalt: 'Mahavira, der 24. und letzte Tirthankara (Wegbereiter) des Jainismus, lehrte eine radikale Ethik der Gewaltlosigkeit (Ahimsa), die sich auf jedes noch so kleine Lebewesen erstreckt, verbunden mit strenger Askese, Wahrhaftigkeit und Besitzlosigkeit als Wegen zur Befreiung der Seele aus dem Kreislauf der Wiedergeburt. Erkenntnistheoretisch lehrte der Jainismus die Anekantavada, die „Vielseitigkeit der Wahrheit": Da jede Aussage nur einen von vielen möglichen Blickwinkeln auf die komplexe Wirklichkeit ausdrückt, sollten Urteile stets als perspektivisch begrenzt anerkannt werden.',
          wirkung: 'Der Jainismus zählt zu den ältesten bis heute praktizierten Religionen und Philosophien Indiens; seine Ahimsa-Ethik beeinflusste maßgeblich Mahatma Gandhis Prinzip des gewaltlosen Widerstands.',
          kritik: 'Die konsequente Ahimsa-Praxis, die im Extremfall selbst das versehentliche Töten kleinster Lebewesen wie Insekten vermeiden will, wird von Kritikern als im Alltag kaum vollständig durchführbar angesehen. Die Anekantavada wird zudem manchmal so ausgelegt, dass sie in einen problematischen Relativismus münden könnte, der eine klare Unterscheidung wahr/falsch aufgibt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Jaina Philosophy" – https://plato.stanford.edu/entries/jaina-philosophy/',
            'Encyclopaedia Britannica: „Mahavira" – https://www.britannica.com/biography/Mahavira'
          ] },
        { id: 'nagarjuna', name: 'Nagarjuna', meta: 'ca. 150–250 n. Chr. · Madhyamaka-Buddhismus', year: 150, tradition: 'indisch', epoch: 'antike', str: [], dis: ['metaphysik', 'logik'],
          desc: 'Einer der größten Denker Indiens. Seine Lehre der „Leerheit" (Shunyata): Nichts hat ein unabhängiges Eigenwesen; alles besteht in Abhängigkeit (bedingtes Entstehen). Seine Dialektik gilt als Gipfel indischer Logik.',
          kernidee: 'Nichts in der Wirklichkeit besitzt ein unabhängiges, eigenständiges Wesen – alles existiert nur in wechselseitiger Abhängigkeit von anderem.',
          inhalt: 'Nagarjuna, der Begründer der Madhyamaka-Schule des Buddhismus, entwickelte die Lehre der „Leerheit" (Shunyata): Kein Ding, kein Selbst und kein Begriff besitzt ein unabhängiges Eigenwesen (Svabhava); alles existiert nur im Netz wechselseitiger Bedingtheit (bedingtes Entstehen). Mit einer scharfen, oft paradox anmutenden Dialektik zeigte er, dass sowohl die Behauptung von Existenz als auch die von Nichtexistenz in letzter Konsequenz unhaltbar sind – Leerheit selbst ist dabei kein Nihilismus, sondern die Freiheit von jeder fixierten Position.',
          wirkung: 'Nagarjunas Dialektik gilt als einer der Gipfelpunkte indischer Logik und Metaphysik und wurde zur Grundlage des ostasiatischen Mahayana-Buddhismus, einschließlich des Zen.',
          kritik: 'Kritiker warfen dem Madhyamaka schon in der Antike vor, mit der radikalen Leerheitslehre selbst in einen unhaltbaren Nihilismus abzugleiten, obwohl Nagarjuna dies explizit zurückwies. Die stark negierende, paradoxe Argumentationsweise macht seine genaue philosophische Position bis heute zu einem Gegenstand kontroverser Interpretation.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Nāgārjuna" – https://plato.stanford.edu/entries/nagarjuna/',
            'Internet Encyclopedia of Philosophy (IEP): „Nagarjuna" – https://iep.utm.edu/nagarjun/'
          ] },
        { id: 'shankara', name: 'Patanjali & Adi Shankara', meta: '2. Jh. bzw. 8. Jh. · Yoga und Advaita-Vedanta', year: 700, tradition: 'indisch', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik', 'geist'],
          hauptvertreter: 'Patanjali, Adi Shankara',
          desc: 'Patanjali systematisierte im Yogasutra den Yoga als Weg der Geistesschulung. Adi Shankara begründete den Advaita-Vedanta (strenger Nicht-Dualismus): Nur Brahman ist wirklich, die Vielheit der Welt ist letztlich Maya (Erscheinung). Er ist der einflussreichste Philosoph des Hinduismus.',
          kernidee: 'Letztlich ist nur das eine, unveränderliche Brahman wirklich – die erfahrene Vielfalt der Welt beruht auf einer grundlegenden, aufhebbaren Unwissenheit.',
          inhalt: 'Patanjali systematisierte im Yogasutra den Yoga als achtgliedrigen Weg der Geistesschulung, der über ethische Disziplin, Körperhaltung, Atemkontrolle und Meditation zur Beruhigung der Geistfunktionen und letztlich zur Einsicht führt. Adi Shankara begründete Jahrhunderte später den Advaita-Vedanta, den strengen Nicht-Dualismus: Nur das eine, unveränderliche Brahman ist letztlich wirklich; die erfahrene Vielheit der Welt ist Maya, eine durch Unwissenheit (Avidya) bedingte Erscheinung, die durch philosophische Einsicht in die Identität von Atman und Brahman aufgehoben werden kann.',
          wirkung: 'Adi Shankara gilt als der einflussreichste Philosoph des Hinduismus und ordnete mit seinem Advaita-Vedanta die verschiedenen hinduistischen Strömungen systematisch; Patanjalis Yoga-Praxis prägt bis heute weltweit Meditations- und Körperpraktiken.',
          kritik: 'Konkurrierende Vedanta-Schulen wie der Vishishtadvaita Ramanujas kritisierten Shankaras strengen Nicht-Dualismus als zu abstrakt, weil er der persönlichen, liebenden Gottesbeziehung (Bhakti) wenig Raum lasse. Manche Interpreten sehen zudem eine Spannung zwischen der Vielfalt praktischer Yoga-Übungen bei Patanjali und der rein erkenntnisorientierten Erlösungslehre Shankaras.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Śaṅkara" – https://plato.stanford.edu/entries/shankara/',
            'Internet Encyclopedia of Philosophy (IEP): „Shankara" – https://iep.utm.edu/shankara/'
          ] },

        /* ─── CHINESISCHE PHILOSOPHIE ─── */
        { id: 'konfuzius', name: 'Konfuzius (Kong Fuzi)', meta: '551–479 v. Chr. · Konfuzianismus', year: -551, tradition: 'china', epoch: 'antike', str: ['tugendethik'], dis: ['ethik', 'politik'], entry: true,
          desc: 'Der prägendste Denker Ostasiens. Sein Ideal ist der „edle Mensch" (Junzi), der Menschlichkeit (Ren), Rechtschaffenheit (Yi) und Riten/Anstand (Li) verkörpert. Ordnung entsteht durch moralische Selbstkultivierung, Familienethik und vorbildliche Herrschaft. Seine Gespräche (Lunyu) formten Bildung, Verwaltung und Wertordnung Chinas über zwei Jahrtausende.',
          kernidee: 'Gesellschaftliche Ordnung entsteht nicht durch Zwang und Gesetze, sondern durch die moralische Selbstkultivierung jedes Einzelnen und vorbildhaftes Verhalten der Herrschenden.',
          inhalt: 'Konfuzius\' Ideal ist der „edle Mensch" (Junzi), der Menschlichkeit (Ren), Rechtschaffenheit (Yi) und angemessenes rituelles Verhalten (Li) verkörpert. Gesellschaftliche Ordnung entsteht für ihn nicht primär durch Gesetze und Strafen, sondern durch moralische Selbstkultivierung, gelebte Familienethik (insbesondere kindliche Pietät) und das vorbildliche Verhalten der Herrschenden, dem das Volk von selbst nacheifert. Seine in den „Gesprächen" (Lunyu) überlieferten Aussprüche formten Bildung, Beamtenprüfungen und Wertordnung Chinas und Ostasiens über zwei Jahrtausende.',
          wirkung: 'Konfuzius gilt als der prägendste Denker Ostasiens; der Konfuzianismus wurde über Jahrhunderte zur Staatsdoktrin Chinas und beeinflusst bis heute Familienethik, Bildungsideale und politische Kultur in ganz Ostasien.',
          kritik: 'Kritiker, insbesondere während der Kulturrevolution im China des 20. Jahrhunderts, warfen dem Konfuzianismus vor, starre Hierarchien zwischen Herrscher und Untertan, Mann und Frau, Alt und Jung zu zementieren und gesellschaftlichen Wandel zu behindern. Auch die Rolle der Frau in der traditionellen konfuzianischen Familienordnung wird aus heutiger Sicht scharf kritisiert.',
          zitat: { text: 'Was du selbst nicht wünschst, das füge auch keinem anderen zu.', quelle: 'Konfuzius, „Gespräche" (Lunyu) XV,24; vgl. SEP: „Confucius"' },
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Confucius" – https://plato.stanford.edu/entries/confucius/',
            'Internet Encyclopedia of Philosophy (IEP): „Confucius" – https://iep.utm.edu/confuciu/'
          ] },
        { id: 'menzius', name: 'Menzius (Mengzi) & Xunzi', meta: '4./3. Jh. v. Chr. · Konfuzianische Klassik', year: -372, tradition: 'china', epoch: 'antike', str: ['tugendethik'], dis: ['ethik'],
          hauptvertreter: 'Menzius (Mengzi), Xunzi',
          desc: 'Menzius vertrat die These, der Mensch sei von Natur aus gut. Xunzi widersprach: Die Natur sei roh und müsse durch Erziehung und Riten geformt werden – eine bis heute grundlegende Debatte über die menschliche Natur.',
          kernidee: 'Ob der Mensch von Natur aus zum Guten oder zum Rohen neigt, entscheidet maßgeblich, wie eine konfuzianische Gesellschaftsordnung begründet werden muss.',
          inhalt: 'Menzius vertrat die einflussreiche These, der Mensch trage von Natur aus die Keime des Guten in sich – etwa das spontane Mitgefühl beim Anblick eines fallenden Kindes –, die durch moralische Erziehung nur noch entfaltet werden müssten. Xunzi widersprach dem entschieden: Die menschliche Natur sei roh und auf Eigennutz gerichtet; wahre Tugend entstehe erst durch bewusste Anstrengung, Erziehung und die zivilisierende Kraft der Riten (Li), die den Menschen gegen seine ursprüngliche Natur formen.',
          wirkung: 'Die Kontroverse zwischen Menzius und Xunzi über die menschliche Natur wurde zu einer der grundlegendsten und langlebigsten Debatten der chinesischen Philosophie und beeinflusste noch die spätere neokonfuzianische Synthese.',
          kritik: 'Kritiker bemerken, dass sowohl Menzius\' Güte-These als auch Xunzis Rohheits-These letztlich empirisch schwer zu beweisende Grundannahmen über die menschliche Natur voraussetzen, die sich kaum eindeutig verifizieren lassen. Xunzis stärkere Betonung äußerer Zucht und Riten wurde später zudem als Wegbereiter des autoritäreren Legalismus gelesen, obwohl er sich selbst klar als Konfuzianer verstand.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Mencius" – https://plato.stanford.edu/entries/mencius/',
            'Stanford Encyclopedia of Philosophy (SEP): „Xunzi" – https://plato.stanford.edu/entries/xunzi/'
          ] },
        { id: 'laozi', name: 'Laozi & Zhuangzi', meta: '6.–4. Jh. v. Chr. · Daoismus', year: -500, tradition: 'china', epoch: 'antike', str: [], dis: ['metaphysik', 'ethik'],
          hauptvertreter: 'Laozi, Zhuangzi',
          desc: 'Der Daoismus lehrt das Leben im Einklang mit dem Dao („dem Weg"), der unaussprechlichen Ordnung der Natur, durch Wu wei („Nicht-Erzwingen", absichtsloses Handeln). Das Daodejing (Laozi) und die geistreichen Parabeln des Zhuangzi bilden das Gegengewicht zum konfuzianischen Pflichtdenken.',
          kernidee: 'Wahre Ordnung entsteht nicht durch aktives Eingreifen und starre Regeln, sondern durch das mühelose Sicheinfügen in den natürlichen Lauf der Dinge.',
          inhalt: 'Der Daoismus lehrt das Leben im Einklang mit dem Dao – „dem Weg" –, der unaussprechlichen, alles durchdringenden Ordnung der Natur, durch Wu wei, das absichtslose „Nicht-Erzwingen": Wie Wasser, das durch Nachgeben letztlich Stein aushöhlt, erreicht man durch Anpassung mehr als durch Gewalt. Das Laozi zugeschriebene Daodejing formuliert dies in knappen, paradoxen Versen, während die geistreichen Parabeln des Zhuangzi – etwa der Traum vom Schmetterling, der die Grenze zwischen Traum und Wirklichkeit auflöst – diese Haltung mit spielerischer Skepsis vertiefen.',
          wirkung: 'Der Daoismus bildet neben dem Konfuzianismus die zweite tragende Säule der chinesischen Philosophie und beeinflusste Kunst, Medizin, Kampfkunst und Naturverständnis Ostasiens tief; im Westen wirkt er bis heute in Ökologie- und Achtsamkeitsdiskursen nach.',
          kritik: 'Kritiker aus konfuzianischer Sicht warfen dem Daoismus vor, mit seiner Zurückhaltung gegenüber aktivem gesellschaftlichem Engagement soziale Verantwortung und moralische Verpflichtung zu vernachlässigen. Die genaue historische Existenz Laozis als Einzelperson und die Autorschaft des Daodejing gelten in der Forschung zudem als ungeklärt.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Laozi" – https://plato.stanford.edu/entries/laozi/',
            'Stanford Encyclopedia of Philosophy (SEP): „Zhuangzi" – https://plato.stanford.edu/entries/zhuangzi/'
          ] },
        { id: 'mozi', name: 'Mozi & Han Feizi', meta: '5.–3. Jh. v. Chr. · Mohismus und Legalismus', year: -430, tradition: 'china', epoch: 'antike', str: ['utilitarismus'], dis: ['ethik', 'politik'],
          hauptvertreter: 'Mozi, Han Feizi',
          desc: 'Mozi forderte „unterschiedslose Nächstenliebe" und einen frühen Nützlichkeitsstandard. Der Legalismus (Han Feizi) setzte dagegen auf strenge Gesetze und Staatsmacht – die ideologische Grundlage der Reichseinigung Chinas.',
          kernidee: 'Richtiges Handeln misst sich am Nutzen für alle Menschen gleichermaßen, unabhängig von Familie, Stand oder persönlicher Nähe.',
          inhalt: 'Mozi forderte gegen die konfuzianische Betonung abgestufter Familienliebe eine „unterschiedslose Nächstenliebe" (Jian Ai): Man solle fremde Familien und Staaten ebenso behandeln wie die eigenen, da dies insgesamt mehr Nutzen und weniger Konflikt erzeuge – ein früher, konsequenzialistischer Nützlichkeitsstandard. Der spätere Legalismus, vor allem bei Han Feizi, setzte dagegen nicht auf Moral, sondern auf strenge, unpersönlich durchgesetzte Gesetze, Belohnung und Bestrafung sowie starke Zentralgewalt, um gesellschaftliche Ordnung zu sichern.',
          wirkung: 'Mozis Konsequenzialismus war eine der frühesten systematischen Nutzenethiken der Weltgeschichte, während der Legalismus zur ideologischen Grundlage der ersten Reichseinigung Chinas unter der Qin-Dynastie wurde.',
          kritik: 'Konfuzianer kritisierten Mozis unterschiedslose Nächstenliebe als naturwidrig, weil sie die besondere, natürlich gewachsene Bindung an die eigene Familie leugne. Der Legalismus wiederum wurde – schon von Zeitgenossen und erst recht von späteren Konfuzianern – als unmenschlich hartes System kritisiert, das allein auf Furcht und Strafe statt auf moralische Erziehung setze.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Mozi" – https://plato.stanford.edu/entries/mozi/',
            'Stanford Encyclopedia of Philosophy (SEP): „Han Feizi" – https://plato.stanford.edu/entries/han-feizi/'
          ] },
        { id: 'zhuxi', name: 'Zhu Xi & Wang Yangming', meta: '12./15./16. Jh. · Neokonfuzianismus', year: 1130, tradition: 'china', epoch: 'mittelalter', str: ['tugendethik'], dis: ['metaphysik', 'ethik'],
          hauptvertreter: 'Zhu Xi, Wang Yangming',
          desc: 'Zhu Xi verschmolz Konfuzianismus mit metaphysischen Begriffen (Prinzip li und Lebenskraft qi) zum orthodoxen Neokonfuzianismus. Wang Yangming betonte die „Einheit von Wissen und Handeln" und das angeborene moralische Wissen des Herz-Geistes.',
          kernidee: 'Die konfuzianische Ethik lässt sich mit einer umfassenden Metaphysik von Prinzip und Lebenskraft verbinden – wahres moralisches Wissen zeigt sich aber erst im unmittelbaren Handeln.',
          inhalt: 'Zhu Xi verschmolz den klassischen Konfuzianismus im 12. Jahrhundert mit einer ausgearbeiteten Metaphysik aus einem ordnenden Prinzip (Li) und einer formenden Lebenskraft (Qi) zum orthodoxen Neokonfuzianismus, der Jahrhunderte lang Grundlage der chinesischen Beamtenprüfungen war. Wang Yangming widersprach Zhu Xis Betonung des schrittweisen Studiums äußerer Dinge und lehrte stattdessen die „Einheit von Wissen und Handeln": Echtes moralisches Wissen sei bereits im angeborenen, intuitiven moralischen Wissen des Herz-Geistes (Liangzhi) vorhanden und zeige sich untrennbar im unmittelbaren Handeln.',
          wirkung: 'Zhu Xis Neokonfuzianismus prägte über 700 Jahre das offizielle Staatsdenken Chinas, Koreas und Japans; Wang Yangmings Betonung intuitiven Wissens beeinflusste spätere Reformbewegungen und wird bis heute in Ostasien diskutiert.',
          kritik: 'Kritiker warfen Zhu Xis System vor, mit seiner komplexen Metaphysik von Li und Qi von der ursprünglich praktischen, ethisch-politischen Ausrichtung des frühen Konfuzianismus abzurücken. Wang Yangmings Betonung des intuitiven inneren Wissens wurde umgekehrt vorgeworfen, moralische Beliebigkeit zu begünstigen, da sie das mühsame Studium der klassischen Texte abwerten könnte.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Zhu Xi" – https://plato.stanford.edu/entries/zhu-xi/',
            'Stanford Encyclopedia of Philosophy (SEP): „Wang Yangming" – https://plato.stanford.edu/entries/wang-yangming/'
          ] },

        /* ─── ISLAMISCHE PHILOSOPHIE ─── */
        { id: 'farabi', name: 'al-Kindi & al-Farabi', meta: '9./10. Jh. · Frühe Falsafa', year: 850, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['logik', 'politik', 'metaphysik'],
          desc: 'al-Kindi gilt als „erster Philosoph der Araber". al-Farabi („der zweite Lehrer" nach Aristoteles) verband griechische Logik und politische Philosophie mit dem Islam und entwarf das Modell der „tugendhaften Stadt".',
          hauptvertreter: 'al-Kindi (ca. 801–873), al-Farabi (ca. 872–950)',
          kernidee: 'Die griechische Philosophie – vor allem [[logos:Logik]] und Metaphysik des Aristoteles und Neuplatonismus – lässt sich mit dem Islam vereinbaren; Vernunft und Offenbarung führen zur selben Wahrheit.',
          inhalt: 'al-Kindi gilt als „erster Philosoph der Araber" und Begründer der Falsafa: Er übersetzte und kommentierte griechische Texte und verteidigte die Philosophie als eigenständigen Wissenszweig neben der Theologie. al-Farabi, „der zweite Lehrer" nach Aristoteles, entwickelte eine umfassende Logik- und Emanationsmetaphysik und entwarf in Der Musterstaat das Modell der „tugendhaften Stadt", die von einem philosophisch-prophetischen Herrscher nach Vernunftprinzipien geleitet wird.',
          wirkung: 'Beide begründeten die arabisch-islamische Philosophietradition (Falsafa), die über Avicenna und Averroes bis in die lateinische Scholastik wirkte. al-Farabis politische Philosophie beeinflusste spätere islamische Staatstheorien.',
          kritik: 'Konservative Theologen (später besonders al-Ghazali) warfen der Falsafa vor, zentrale Glaubenssätze wie die Schöpfung aus dem Nichts oder die individuelle Unsterblichkeit der Seele durch griechische Vernunftprinzipien zu untergraben.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „al-Kindi" – https://plato.stanford.edu/entries/al-kindi/',
            'Stanford Encyclopedia of Philosophy (SEP): „al-Farabi" – https://plato.stanford.edu/entries/al-farabi/'
          ] },
        { id: 'avicenna', name: 'Avicenna (Ibn Sina)', meta: '980–1037 · Höhepunkt der Falsafa', year: 980, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'geist'],
          desc: 'Universalgelehrter und einer der größten Denker des Mittelalters. Seine Metaphysik der Unterscheidung von Wesen und Existenz und sein „Fliegender-Mensch"-Argument für das Selbstbewusstsein wirkten tief auf Thomas von Aquin. Sein medizinischer Kanon war bis in die frühe Neuzeit europäisches Standardwerk.',
          kernidee: 'Die Unterscheidung von Wesen (Essenz) und Existenz ist der Schlüssel zur Metaphysik: Nur Gott ist notwendig existent aus sich selbst, alles andere ist bloß möglich und erhält seine Existenz von außen.',
          inhalt: 'Avicenna entwickelte in seinem Buch der Heilung ein umfassendes philosophisches System aus Logik, Naturphilosophie und Metaphysik. Sein „Fliegender-Mensch"-Gedankenexperiment – ein im leeren Raum schwebender Mensch ohne jede Sinneswahrnehmung, der dennoch seiner eigenen Existenz gewiss ist – diente als Argument für die Unmittelbarkeit des Selbstbewusstseins und die Unabhängigkeit der Seele vom Körper. Sein medizinischer Kanon der Medizin war bis in die frühe Neuzeit europäisches Standardwerk.',
          wirkung: 'Avicennas Metaphysik von Essenz und Existenz wirkte tief auf Thomas von Aquin und die gesamte lateinische Scholastik; sein Werk war jahrhundertelang die Grundlage des philosophischen und medizinischen Unterrichts in Europa und der islamischen Welt.',
          kritik: 'al-Ghazali kritisierte in Die Inkohärenz der Philosophen mehrere Kernthesen Avicennas, etwa die Ewigkeit der Welt und die rein geistige (nicht-körperliche) Auferstehung, als mit dem islamischen Glauben unvereinbar.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Ibn Sina [Avicenna]" – https://plato.stanford.edu/entries/ibn-sina/',
            'Encyclopaedia Britannica: „Avicenna" – https://www.britannica.com/biography/Avicenna'
          ] },
        { id: 'ghazali', name: 'al-Ghazali', meta: '1058–1111 · Kritik der Philosophie / Mystik', year: 1058, tradition: 'islam', epoch: 'mittelalter', str: ['skeptizismus'], dis: ['metaphysik', 'epistemologie'],
          desc: 'In Die Inkohärenz der Philosophen kritisierte er den Anspruch der Falsafa, verteidigte Glaube und Sufismus und beeinflusste damit die Entwicklung von Theologie und Skepsis (auch als Anregung für spätere europäische Kausalitätskritik).',
          kernidee: 'Die Vernunftphilosophie der Falsafa (insbesondere Avicennas) untergräbt zentrale Glaubensinhalte des Islam; wahre Gewissheit findet sich letztlich im Glauben und in der mystischen Erfahrung (Sufismus), nicht in reiner Spekulation.',
          inhalt: 'In Die Inkohärenz der Philosophen unterzog al-Ghazali die Falsafa einer scharfen, methodisch versierten Kritik und zeigte anhand von 20 Thesen (etwa der Ewigkeit der Welt oder der Leugnung der Auferstehung des Körpers) deren Widersprüche und Unvereinbarkeit mit dem Islam auf. Zugleich durchlief er selbst eine tiefe Erkenntniskrise, die ihn – wie er in seiner Autobiographie Der Erretter aus dem Irrtum schildert – radikal an sinnlicher und rationaler Erkenntnis zweifeln ließ, bevor er in der mystischen Gotteserfahrung des Sufismus Gewissheit fand.',
          wirkung: 'Al-Ghazalis Kritik schwächte den Einfluss der reinen Falsafa in der sunnitischen Welt erheblich und stärkte zugleich die Stellung des Sufismus als legitime spirituelle Erkenntnisweise. Seine Argumente zur Kausalität (Gott als einzige wahre Ursache) nahmen Gedanken vorweg, die später bei David Hume in der europäischen Kausalitätskritik wiederkehren.',
          kritik: 'Averroes widersprach in Die Inkohärenz der Inkohärenz al-Ghazalis Argumenten Punkt für Punkt und verteidigte die Vereinbarkeit von Philosophie und Glauben; Kritiker werfen al-Ghazali zudem vor, mit seiner Skepsis den Rückgang der freien philosophischen Forschung in Teilen der islamischen Welt mitbefördert zu haben.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „al-Ghazali" – https://plato.stanford.edu/entries/al-ghazali/',
            'Encyclopaedia Britannica: „al-Ghazali" – https://www.britannica.com/biography/al-Ghazali'
          ] },
        { id: 'averroes', name: 'Averroes (Ibn Rushd)', meta: '1126–1198 · Aristotelismus', year: 1126, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'logik'],
          desc: 'Der bedeutendste Aristoteles-Kommentator; im Westen schlicht „der Kommentator" genannt. Er verteidigte die Vernunft (Die Inkohärenz der Inkohärenz) und das Verhältnis von Philosophie und Religion. Der „lateinische Averroismus" prägte die europäischen Universitäten.',
          kernidee: 'Philosophie (Vernunft) und Religion (Offenbarung) widersprechen sich nicht, sondern sind zwei Wege zur selben Wahrheit; wo der wörtliche Sinn der Schrift der demonstrativen Vernunft widerspricht, muss er allegorisch ausgelegt werden.',
          inhalt: 'Averroes verfasste die einflussreichsten mittelalterlichen Kommentare zu nahezu allen Werken des Aristoteles und wurde im lateinischen Westen schlicht „der Kommentator" genannt. In Die Inkohärenz der Inkohärenz verteidigte er die Falsafa gegen al-Ghazalis Angriffe und argumentierte, dass ein streng rationaler Aristotelismus mit dem Islam vereinbar sei. In Die entscheidende Abhandlung begründete er systematisch, warum das Studium der Philosophie religiös nicht nur erlaubt, sondern für die Gebildeten sogar geboten sei.',
          wirkung: 'Der „lateinische Averroismus" prägte ab dem 13. Jahrhundert die europäischen Universitäten (u. a. Paris, Padua) maßgeblich und war eine zentrale Quelle für die Aristoteles-Rezeption der christlichen Scholastik, etwa bei Thomas von Aquin.',
          kritik: 'Die Kirche verurteilte mehrfach averroistische Lehren (u. a. die Einheit des Intellekts aller Menschen) als häretisch; in der islamischen Welt blieb sein Einfluss nach seinem Tod vergleichsweise gering, während er im Westen jahrhundertelang intensiv rezipiert wurde.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Ibn Rushd [Averroes]" – https://plato.stanford.edu/entries/ibn-rushd/',
            'Encyclopaedia Britannica: „Averroes" – https://www.britannica.com/biography/Averroes'
          ] },
        { id: 'khaldun', name: 'Ibn Khaldun', meta: '1332–1406 · Geschichts- und Sozialphilosophie', year: 1332, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['politik'],
          desc: 'Mit der Muqaddima begründete er eine Theorie des Aufstiegs und Zerfalls von Gesellschaften (Asabiyya, sozialer Zusammenhalt) und gilt als früher Vordenker von Soziologie und Geschichtswissenschaft.',
          kernidee: 'Geschichte folgt erkennbaren, gesetzmäßigen Mustern des Aufstiegs und Zerfalls von Gesellschaften, die sich wissenschaftlich untersuchen lassen – der Kern dieser Dynamik ist die Asabiyya, der soziale Zusammenhalt einer Gruppe.',
          inhalt: 'In der Muqaddima (Einführung zu seinem Geschichtswerk) begründete Ibn Khaldun eine neue Wissenschaft, die er ʿilm al-ʿumran („Wissenschaft von der Kultur/Gesellschaft") nannte. Er zeigte, wie Dynastien durch starke Gruppensolidarität (Asabiyya) an die Macht kommen, wie diese Solidarität mit wachsendem Wohlstand und zunehmender Verstädterung erodiert, und wie darauf der Niedergang und die Ablösung durch eine neue, stärker zusammenhaltende Gruppe folgt.',
          wirkung: 'Ibn Khaldun gilt als einer der frühesten Vordenker von Soziologie, Wirtschafts- und Geschichtswissenschaft; der Historiker Arnold Toynbee bezeichnete die Muqaddima als eine der bedeutendsten geschichtsphilosophischen Leistungen überhaupt.',
          kritik: 'Sein zyklisches Geschichtsmodell wurde als zu schematisch kritisiert, da es Fortschritt und irreversiblen sozialen Wandel kaum berücksichtigt; zudem bezog sich seine empirische Basis vorwiegend auf die Dynastien Nordafrikas seiner Zeit.',
          quellen: [
            'Encyclopaedia Britannica: „Ibn Khaldūn" – https://www.britannica.com/biography/Ibn-Khaldun',
            'Encyclopaedia Britannica: „The Muqaddimah – Ibn Khaldūns Geschichtsphilosophie" – https://www.britannica.com/topic/The-Muqaddimah'
          ] },

        /* ─── JÜDISCHE PHILOSOPHIE ─── */
        { id: 'maimonides', name: 'Philon von Alexandria & Maimonides', meta: '1. Jh. bzw. 1138–1204', year: 1138, tradition: 'juedisch', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'ethik'],
          desc: 'Philon verband früh jüdische Schrift und griechische Philosophie. Moses Maimonides (Rambam) vermittelte in Der Führer der Unschlüssigen zwischen aristotelischer Vernunft und jüdischem Glauben und beeinflusste damit auch die christliche Scholastik. In der Moderne setzten Denker wie Martin Buber (Dialogphilosophie „Ich und Du") und Emmanuel Levinas (Ethik des „Anderen") diese Tradition fort.',
          hauptvertreter: 'Philon von Alexandria (ca. 20 v. Chr.–50 n. Chr.), Moses Maimonides (1138–1204); später fortgeführt von Martin Buber und Emmanuel Levinas',
          kernidee: 'Jüdischer Glaube und griechische (v. a. aristotelische) Vernunftphilosophie stehen nicht im Widerspruch, sondern lassen sich durch sorgfältige Auslegung miteinander vermitteln.',
          inhalt: 'Philon von Alexandria verband als einer der ersten systematisch jüdische Schriftauslegung mit platonisch-stoischer Philosophie, etwa durch die allegorische Deutung biblischer Texte. Moses Maimonides (Rambam) entwickelte in Der Führer der Unschlüssigen eine Vermittlung zwischen aristotelischer Metaphysik und jüdischem Offenbarungsglauben und formulierte zugleich mit seinen 13 Glaubensgrundsätzen eine bis heute einflussreiche Zusammenfassung jüdischer Glaubenslehre.',
          wirkung: 'Maimonides beeinflusste maßgeblich die christliche Scholastik, u. a. Thomas von Aquin. In der Moderne setzten Martin Buber (Dialogphilosophie „Ich und Du") und Emmanuel Levinas (Ethik der Verantwortung für den „Anderen") diese Verbindung von jüdischem Denken und Philosophie auf neue Weise fort.',
          kritik: 'Innerhalb der jüdischen Orthodoxie wurde Maimonides’ rationalistische Auslegung der Tora zeitweise heftig angefochten (der „Maimonidesstreit"); manche Ausleger sahen darin eine zu weitgehende Anpassung an griechische Philosophie zulasten der wörtlichen Offenbarung.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Maimonides" – https://plato.stanford.edu/entries/maimonides/',
            'Stanford Encyclopedia of Philosophy (SEP): „Levinas" – https://plato.stanford.edu/entries/levinas/'
          ] },

        /* ─── AFRIKANISCHE PHILOSOPHIE ─── */
        { id: 'ubuntu', name: 'Ubuntu & die „Sage Philosophy"', meta: 'Traditionelles Denken', year: null, tradition: 'afrika', epoch: null, str: [], dis: ['ethik', 'metaphysik'],
          desc: 'Das südliche Konzept Ubuntu („Ich bin, weil wir sind") betont die gemeinschaftliche Konstitution der Person. Die „Sage Philosophy" (Henry Odera Oruka) dokumentiert das reflektierte Denken traditioneller Weiser als echte Philosophie.',
          quote: 'Ubuntu – Ich bin, weil wir sind.',
          kernidee: 'Die Person konstituiert sich wesentlich durch Gemeinschaft: „Ich bin, weil wir sind" – individuelle Identität und Moral sind untrennbar mit den Beziehungen zu anderen verbunden.',
          inhalt: 'Das im südlichen Afrika verbreitete Konzept Ubuntu (u. a. Zulu/Xhosa) beschreibt Menschlichkeit als etwas, das sich erst in Gemeinschaft und gegenseitiger Anerkennung verwirklicht – zusammengefasst im Sprichwort „umuntu ngumuntu ngabantu" („ein Mensch ist ein Mensch durch andere Menschen"). Der kenianische Philosoph Henry Odera Oruka begründete daneben mit seinem Projekt der „Sage Philosophy" einen methodischen Ansatz, der das systematische, kritisch-reflektierte Denken traditioneller afrikanischer Weiser dokumentierte und als eigenständige philosophische Leistung – jenseits bloßer anonymer „Stammesweisheit" – auswies.',
          wirkung: 'Ubuntu wurde durch Desmond Tutu und die südafrikanische Wahrheits- und Versöhnungskommission international bekannt und prägt bis heute Debatten über Gemeinschaftsethik, Versöhnung und afrikanische politische Philosophie. Orukas Sage-Philosophy-Projekt lieferte wichtige methodische Argumente in der Debatte um die Eigenständigkeit afrikanischer Philosophie.',
          kritik: 'Kritiker warnen vor einer romantisierenden oder politisch instrumentalisierten Verwendung von Ubuntu, die reale gesellschaftliche Konflikte und Machtverhältnisse verschleiern könne; an Orukas Projekt wurde bemängelt, dass die Auswahl der befragten „Weisen" und die Übersetzung ihrer Aussagen ins Philosophische stets auch interpretative Eingriffe des Forschers voraussetze.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „African Ethics" – https://plato.stanford.edu/entries/african-ethics/',
            'Stanford Encyclopedia of Philosophy (SEP): „Africana Philosophy" – https://plato.stanford.edu/entries/africana/'
          ] },
        { id: 'fanon', name: 'Amo · Wiredu · Fanon', meta: '18.–20. Jh.', year: 1900, tradition: 'afrika', epoch: 'moderne', str: [], dis: ['politik', 'ethik'],
          desc: 'Anton Wilhelm Amo (aus Ghana) lehrte im 18. Jh. an deutschen Universitäten Philosophie. Kwasi Wiredu arbeitete an einer „begrifflichen Dekolonisierung". Frantz Fanon analysierte Kolonialismus, Rasse und Befreiung und wurde zum Klassiker des postkolonialen Denkens.',
          hauptvertreter: 'Anton Wilhelm Amo (ca. 1703–ca. 1759), Kwasi Wiredu (1931–2022), Frantz Fanon (1925–1961)',
          kernidee: 'Afrikanisches philosophisches Denken muss sich sowohl gegen den Ausschluss aus der westlichen Philosophiegeschichte als auch gegen bloße Übernahme europäischer Begriffe und Kategorien behaupten – durch eigene Vernunftleistung und „begriffliche Dekolonisierung".',
          inhalt: 'Anton Wilhelm Amo, aus dem heutigen Ghana als Kind nach Europa gebracht, promovierte und lehrte im 18. Jahrhundert an deutschen Universitäten (u. a. Halle, Jena) Philosophie und widerlegte damit schon früh rassistische Vorurteile seiner Zeit über die Vernunftfähigkeit Afrikaner:innen. Kwasi Wiredu forderte eine „begriffliche Dekolonisierung": die kritische Prüfung, welche in afrikanische Sprachen importierten westlichen philosophischen Begriffe tatsächlich den einheimischen Denktraditionen entsprechen. Frantz Fanon analysierte in Schwarze Haut, weiße Masken und Die Verdammten dieser Erde die psychologischen und politischen Mechanismen von Kolonialismus, Rassismus und Befreiungskampf.',
          wirkung: 'Fanon wurde zu einem der einflussreichsten Denker des Antikolonialismus und der postkolonialen Theorie weltweit; Wiredus Ansatz prägt bis heute die akademische Debatte über die Methode afrikanischer Philosophie; Amo gilt als historischer Beleg gegen die These, es habe vor dem 20. Jahrhundert keine afrikanischen Philosophen im europäischen akademischen Betrieb gegeben.',
          kritik: 'Fanons Rechtfertigung revolutionärer Gewalt im antikolonialen Kampf wurde – auch von Sympathisanten wie Hannah Arendt – kritisch diskutiert; Wiredus Projekt der „begrifflichen Dekolonisierung" wurde entgegengehalten, dass auch der Rückgriff auf indigene Sprachen keine völlig „unbelastete" Ausgangsbasis liefere.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Frantz Fanon" – https://plato.stanford.edu/entries/frantz-fanon/',
            'Encyclopaedia Britannica: „Frantz Fanon" – https://www.britannica.com/biography/Frantz-Fanon'
          ] },

        /* ─── LATEINAMERIKANISCHE PHILOSOPHIE ─── */
        { id: 'dussel', name: 'Befreiungsphilosophie', meta: '20. Jh. · Enrique Dussel u. a.', year: 1934, tradition: 'latam', epoch: 'moderne', str: ['marxismus'], dis: ['politik', 'ethik'],
          desc: 'Die lateinamerikanische Befreiungsphilosophie (verwandt mit der Befreiungstheologie) denkt Philosophie „von den Armen und Ausgeschlossenen her" und kritisiert die Vorherrschaft der europäischen Perspektive. Ein Beispiel für die wachsende Globalisierung des philosophischen Gesprächs.',
          kernidee: 'Philosophie muss „von den Armen und Ausgeschlossenen her" gedacht werden, statt die europäische Vernunftperspektive als universal vorauszusetzen – das Andere (der/die Arme, der/die Kolonisierte) fordert die dominante Ordnung ethisch heraus.',
          inhalt: 'Die lateinamerikanische Befreiungsphilosophie (filosofía de la liberación), maßgeblich von Enrique Dussel geprägt, entstand in den 1970er Jahren im Umfeld der Befreiungstheologie und kritisiert die Vorherrschaft eurozentrischer Denkmodelle in Politik und Philosophie. Dussel verbindet dabei Motive der Phänomenologie und Ethik des Anderen (in Anlehnung an Levinas) mit marxistischer Gesellschaftskritik und einer Analyse der Kolonialgeschichte Lateinamerikas.',
          wirkung: 'Die Befreiungsphilosophie beeinflusste postkoloniale Theorie, Dekolonialitätsdebatten (etwa um Walter Mignolo) und soziale Bewegungen in ganz Lateinamerika; sie gilt als eigenständiger Beitrag zur globalen Philosophie jenseits nordatlantischer Zentren.',
          kritik: 'Kritiker werfen der Befreiungsphilosophie stellenweise begriffliche Unschärfe und eine zu enge Anlehnung an marxistische Kategorien vor; andere sehen in ihrer Rede vom „Anderen" selbst eine Vereinheitlichung heterogener lateinamerikanischer Erfahrungen.',
          quellen: [
            'Stanford Encyclopedia of Philosophy (SEP): „Latin American Philosophy" – https://plato.stanford.edu/entries/latin-american-philosophy/',
            'Encyclopaedia Britannica: „liberation theology" – https://www.britannica.com/topic/liberation-theology'
          ] }
    ];

    /* Glossar: Fachbegriff-Tooltips, per [[key:Anzeigetext]] in kernidee/inhalt/wirkung/kritik referenziert */
    var glossar = {
        elenchos: 'Sokrates’ Methode des kritischen Nachfragens: Er ließ sich eine Behauptung erklären und stellte so lange gezielte Fragen, bis Widersprüche darin sichtbar wurden.',
        nomos: 'Griechisch für Gesetz, Sitte oder Konvention – also das, was Menschen sich selbst an Regeln geben, im Gegensatz zur Natur (Physis).',
        physis: 'Griechisch für Natur oder das Wesen einer Sache – das, was unabhängig von menschlichen Vereinbarungen einfach so ist.',
        relativismus: 'Die Position, dass Wahrheit, Moral oder Wissen nicht absolut gelten, sondern vom Betrachter, von der Kultur oder den Umständen abhängen.',
        arche: 'Griechisch für Ursprung oder Grundprinzip – der erste, alles erklärende Ausgangspunkt einer Sache oder der Welt.',
        apeiron: 'Griechisch für das Unbegrenzte oder Unbestimmte – Anaximanders Urprinzip, das selbst kein greifbares Element wie Wasser oder Luft ist.',
        logos: 'Griechisch für Wort, Rede oder Vernunft – bei Heraklit die verborgene, vernünftige Ordnung, die den Weltlauf lenkt; später von der Stoa als Weltvernunft aufgegriffen.',
        emanation: 'Der stufenweise Hervorgang der Wirklichkeit aus einem höchsten Ursprung, wie das Ausstrahlen von Licht aus einer Quelle – zentral in Plotins Neuplatonismus.'
    };

    /* Quellen (Teil 6) */
    var sources = [
        'Stanford Encyclopedia of Philosophy (SEP), Stanford University – peer-reviewed. plato.stanford.edu',
        'Internet Encyclopedia of Philosophy (IEP), University of Tennessee at Martin. iep.utm.edu',
        'Routledge Encyclopedia of Philosophy – akademisches Standardwerk. rep.routledge.com',
        'Encyclopædia Britannica, Beiträge zur Philosophiegeschichte. britannica.com'
    ];

    return {
        traditions: traditions,
        epochs: epochs,
        disziplinen: disziplinen,
        stroemungGroups: stroemungGroups,
        stroemungen: stroemungen,
        thinkers: thinkers,
        sources: sources,
        glossar: glossar
    };
})();
