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
          desc: 'Gilt traditionell als erster Philosoph des Abendlandes. Er erklärte das Wasser zum Urstoff aller Dinge und versuchte, Naturphänomene ohne Rückgriff auf die Götter zu deuten. Ihm werden auch geometrische und astronomische Leistungen zugeschrieben.' },
        { id: 'anaximander', name: 'Anaximander & Anaximenes', meta: '6. Jh. v. Chr. · Milesische Schule', year: -580, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['metaphysik'],
          desc: 'Anaximander setzte das unbegrenzte Apeiron als Urprinzip an; Anaximenes die Luft. Gemeinsam begründeten die Milesier die Idee einer aus einem Prinzip erklärbaren, gesetzmäßigen Natur.' },
        { id: 'pythagoras', name: 'Pythagoras', meta: 'ca. 570–495 v. Chr. · Pythagoreer', year: -570, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          desc: 'Sah in Zahlen und mathematischen Verhältnissen das Wesen der Wirklichkeit. Seine Schule verband Mathematik, Musiktheorie und die Lehre von der Seelenwanderung und prägte die abendländische Idee einer mathematisch geordneten Welt.' },
        { id: 'heraklit', name: 'Heraklit', meta: 'ca. 540–480 v. Chr. · Ephesos', year: -540, tradition: 'west', epoch: 'antike', str: [], dis: ['metaphysik'],
          quote: 'Man kann nicht zweimal in denselben Fluss steigen.',
          desc: '„Alles fließt" (panta rhei): Heraklit betonte den beständigen Wandel und den Gegensatz als treibende Kraft. Das ordnende Weltgesetz nannte er Logos.' },
        { id: 'parmenides', name: 'Parmenides & die Eleaten', meta: 'ca. 515–450 v. Chr. · Elea', year: -515, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik', 'logik'],
          desc: 'Parmenides stellte dem Werden das unveränderliche, einheitliche Sein gegenüber: Was ist, ist; Werden und Vergehen seien bloßer Schein. Sein Schüler Zenon verteidigte diese Lehre mit den berühmten Paradoxien (Achilles und die Schildkröte).' },
        { id: 'demokrit', name: 'Demokrit', meta: 'ca. 460–370 v. Chr. · Atomismus', year: -460, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['metaphysik'],
          desc: 'Entwarf mit Leukipp die Lehre, alles bestehe aus unteilbaren Atomen und leerem Raum. Der antike Atomismus ist ein früher Vorläufer materialistischer und naturwissenschaftlicher Weltbilder.' },
        { id: 'sophisten', name: 'Die Sophisten', meta: '5. Jh. v. Chr. · Protagoras, Gorgias', year: -450, tradition: 'west', epoch: 'antike', str: ['skeptizismus'], dis: ['epistemologie', 'sprache'],
          desc: 'Im 5. Jahrhundert verlagerte sich das Interesse von der Natur auf den Menschen, auf Sprache, Recht und Moral. Die Sophisten (u. a. Protagoras – „Der Mensch ist das Maß aller Dinge" – und Gorgias) waren Wanderlehrer der Rhetorik und vertraten einen frühen Relativismus.' },
        { id: 'sokrates', name: 'Sokrates', meta: '469–399 v. Chr. · Athen · Begründer der Ethik', year: -469, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['ethik', 'epistemologie'], entry: true,
          quote: 'Ich weiß, dass ich nichts weiß.',
          desc: 'Sokrates schrieb selbst nichts; wir kennen ihn vor allem durch seinen Schüler Platon. Mit seiner Methode des prüfenden Gesprächs (Elenchos, „sokratische Ironie" und „Hebammenkunst") deckte er Scheinwissen auf und machte die Frage nach dem richtigen Leben zum Zentrum der Philosophie. 399 v. Chr. wurde er wegen „Gottlosigkeit" und „Verführung der Jugend" zum Tod durch den Schierlingsbecher verurteilt – ein Gründungsmythos der intellektuellen Redlichkeit.' },
        { id: 'platon', name: 'Platon', meta: '428/427–348/347 v. Chr. · Gründer der Akademie', year: -427, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik', 'epistemologie', 'politik'],
          quote: 'Der Anfang ist der wichtigste Teil der Arbeit.',
          desc: 'Einer der einflussreichsten Denker überhaupt. In kunstvollen Dialogen entwickelte er die Ideenlehre: Hinter der wandelbaren Sinnenwelt liegt eine Welt unveränderlicher, vollkommener Ideen (Formen), an denen die Dinge nur „teilhaben". Das Höhlengleichnis veranschaulicht den Aufstieg der Erkenntnis vom Schein zur Wahrheit. In der Politeia entwarf er den idealen, von „Philosophenkönigen" geleiteten Staat. Sein Werk begründete Metaphysik, Erkenntnistheorie und politische Philosophie zugleich.',
          book: { title: 'Der Staat', author: 'Platon', url: 'https://link.amazon/B0gpLNCNC' } },
        { id: 'aristoteles', name: 'Aristoteles', meta: '384–322 v. Chr. · Gründer des Lyzeums', year: -384, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['logik', 'metaphysik', 'ethik', 'politik'],
          quote: 'Der Mensch ist von Natur aus ein staatenbildendes Lebewesen (zoon politikon).',
          desc: 'Platons bedeutendster Schüler und der wohl universalste Gelehrte der Antike. Er begründete die formale Logik (Syllogistik), systematisierte Biologie, Physik, Ethik, Politik, Rhetorik und Poetik. Gegen Platon verlegte er das Wesen (die „Form") in die Einzeldinge selbst. Seine Nikomachische Ethik begründet die Tugendethik: Das Gute liegt in der rechten Mitte (Mesotes), Ziel ist die Eudaimonia (gelingendes Leben). Über die arabische Welt prägte Aristoteles das gesamte europäische Mittelalter.',
          book: { title: 'Nikomachische Ethik', author: 'Aristoteles', url: 'https://link.amazon/B04Ie1PfP' } },
        { id: 'epikur', name: 'Epikur', meta: '341–270 v. Chr. · Epikureismus', year: -341, tradition: 'west', epoch: 'antike', str: ['materialismus'], dis: ['ethik'],
          desc: 'Lehrte, das höchste Gut sei die Lust, richtig verstanden als dauerhafte Schmerz- und Angstfreiheit (Ataraxie). Er verband dies mit dem Atomismus und einer Ethik des maßvollen, freundschaftlichen Lebens im „Garten".' },
        { id: 'stoa', name: 'Zenon von Kition & die Stoa', meta: '334–262 v. Chr. · Stoizismus', year: -334, tradition: 'west', epoch: 'antike', str: ['tugendethik'], dis: ['ethik'],
          desc: 'Begründer der Stoa. Ideal ist das Leben „gemäß der Natur" und der Vernunft (Logos): Tugend allein macht glücklich, äußere Güter sind gleichgültig. Spätere Stoiker – Seneca, Epiktet und Kaiser Marc Aurel – prägten eine bis heute wirksame Ethik der Gelassenheit und Selbstbeherrschung.',
          book: { title: 'Selbstbetrachtungen', author: 'Mark Aurel', url: 'https://link.amazon/B0e8ntgvB' } },
        { id: 'pyrrhon', name: 'Pyrrhon & die Skeptiker', meta: 'ca. 360–270 v. Chr. · Skeptizismus', year: -360, tradition: 'west', epoch: 'antike', str: ['skeptizismus'], dis: ['epistemologie'],
          desc: 'Der antike Skeptizismus empfahl die Urteilsenthaltung (Epoché) gegenüber allen dogmatischen Behauptungen, um zur Seelenruhe zu gelangen. Sextus Empiricus systematisierte diese Position.' },
        { id: 'plotin', name: 'Plotin', meta: 'ca. 205–270 n. Chr. · Neuplatonismus', year: 205, tradition: 'west', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          desc: 'Hauptvertreter des Neuplatonismus. Aus dem überseienden, unaussprechlichen „Einen" gehen stufenweise Geist, Seele und Sinnenwelt hervor (Emanation). Seine Mystik der Rückkehr zum Einen beeinflusste christliche, islamische und jüdische Denker tief und bildet die Brücke zum Mittelalter.' },

        /* ─── MITTELALTER ─── */
        { id: 'augustinus', name: 'Augustinus von Hippo', meta: '354–430 · Patristik', year: 354, tradition: 'west', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik', 'ethik'],
          quote: 'Unruhig ist unser Herz, bis es Ruhe findet in Dir.',
          desc: 'Der einflussreichste Kirchenvater des Westens. In den Bekenntnissen (erste große Autobiographie der Weltliteratur) und Vom Gottesstaat verband er platonisches Denken mit christlicher Theologie. Themen wie Zeit, Erinnerung, Wille, Gnade und Sünde prägten das abendländische Selbstverständnis über ein Jahrtausend.' },
        { id: 'boethius', name: 'Boethius', meta: 'ca. 477–524 · Brücke Antike–Mittelalter', year: 477, tradition: 'west', epoch: 'mittelalter', str: [], dis: ['logik', 'metaphysik'],
          desc: 'Übersetzte und kommentierte aristotelische Logik und bewahrte so antikes Wissen. Sein im Kerker verfasster Trost der Philosophie war eines der meistgelesenen Bücher des Mittelalters.' },
        { id: 'anselm', name: 'Anselm von Canterbury', meta: '1033–1109 · Frühscholastik', year: 1033, tradition: 'west', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik'],
          desc: '„Vater der Scholastik". Berühmt für den ontologischen Gottesbeweis: Gott als das, „über das hinaus nichts Größeres gedacht werden kann", müsse notwendig existieren. Sein Programm: fides quaerens intellectum – der Glaube, der Einsicht sucht.' },
        { id: 'thomas', name: 'Thomas von Aquin', meta: '1225–1274 · Hochscholastik · Thomismus', year: 1225, tradition: 'west', epoch: 'mittelalter', str: ['nominalismus'], dis: ['metaphysik', 'ethik'],
          desc: 'Die zentrale Gestalt der mittelalterlichen Philosophie. In der Summa theologiae vereinte er die neu zugängliche aristotelische Philosophie mit der christlichen Lehre. Seine „fünf Wege" sind klassische Gottesbeweise; er lehrte, Glaube und Vernunft könnten sich nicht widersprechen. Der Thomismus ist bis heute prägend für die katholische Philosophie.' },
        { id: 'ockham', name: 'Duns Scotus & Wilhelm von Ockham', meta: '13./14. Jh. · Spätscholastik', year: 1300, tradition: 'west', epoch: 'mittelalter', str: ['nominalismus'], dis: ['metaphysik', 'logik'],
          desc: 'Duns Scotus („doctor subtilis") betonte den Willen und die Einzelheit des Seienden. Ockham gilt als Begründer des Nominalismus (Allgemeinbegriffe sind bloße Namen) und formulierte das Sparsamkeitsprinzip „Ockhams Rasiermesser": Man solle die Zahl der Annahmen nicht unnötig vermehren.' },

        /* ─── RENAISSANCE ─── */
        { id: 'machiavelli', name: 'Niccolò Machiavelli', meta: '1469–1527 · Politische Philosophie', year: 1469, tradition: 'west', epoch: 'renaissance', str: [], dis: ['politik'],
          desc: 'Sein Der Fürst analysiert Macht nüchtern und losgelöst von Moral und Religion – der Beginn der modernen, „realistischen" politischen Theorie.' },
        { id: 'montaigne', name: 'Erasmus von Rotterdam & Michel de Montaigne', meta: '15./16. Jh. · Humanismus', year: 1500, tradition: 'west', epoch: 'renaissance', str: ['skeptizismus'], dis: ['ethik'],
          quote: 'Was weiß ich?',
          desc: 'Erasmus verkörperte den gelehrten, kritischen Humanismus. Montaigne begründete mit seinen Essais eine skeptische, selbstprüfende Denkform: „Was weiß ich?"' },
        { id: 'bacon', name: 'Francis Bacon', meta: '1561–1626 · Wegbereiter des Empirismus', year: 1561, tradition: 'west', epoch: 'renaissance', str: ['empirismus'], dis: ['wissenschaft', 'epistemologie'],
          quote: 'Wissen ist Macht.',
          desc: 'Forderte eine auf Beobachtung und Induktion gegründete Wissenschaft und formulierte früh das Programm einer methodischen Naturbeherrschung: „Wissen ist Macht."' },

        /* ─── NEUZEIT: RATIONALISMUS ─── */
        { id: 'descartes', name: 'René Descartes', meta: '1596–1650 · „Vater der neuzeitlichen Philosophie"', year: 1596, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['epistemologie', 'metaphysik', 'geist'],
          quote: 'Cogito, ergo sum.',
          desc: 'Suchte mit dem methodischen Zweifel einen unerschütterlichen Ausgangspunkt und fand ihn im denkenden Ich: „Cogito, ergo sum" – ich denke, also bin ich. Sein Dualismus von res cogitans (Geist) und res extensa (Materie) prägte die Philosophie des Geistes bis heute. Zugleich war er ein bedeutender Mathematiker (analytische Geometrie).',
          book: { title: 'Meditationen über die Erste Philosophie', author: 'René Descartes', url: 'https://link.amazon/B06Hs7H1M' } },
        { id: 'spinoza', name: 'Baruch de Spinoza', meta: '1632–1677 · Rationalismus / Pantheismus', year: 1632, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['metaphysik', 'ethik'],
          desc: 'Entwarf in seiner Ethik „nach geometrischer Methode" ein monistisches System: Es gibt nur eine Substanz – „Gott bzw. die Natur" (Deus sive Natura). Freiheit besteht in der Einsicht in die Notwendigkeit. Wegen seiner radikalen Ansichten wurde er aus der jüdischen Gemeinde ausgeschlossen; heute gilt er als früher Denker der Aufklärung und Religionskritik.' },
        { id: 'leibniz', name: 'Gottfried Wilhelm Leibniz', meta: '1646–1716 · Rationalismus / Universalgelehrter', year: 1646, tradition: 'west', epoch: 'neuzeit', str: ['rationalismus'], dis: ['metaphysik', 'logik'],
          desc: 'Entwarf die Monadenlehre: Die Welt besteht aus unteilbaren, seelenartigen Kraftzentren (Monaden) in „prästabilierter Harmonie". Berühmt ist seine These, die wirkliche Welt sei „die beste aller möglichen Welten". Unabhängig von Newton entwickelte er die Infinitesimalrechnung und gilt als Pionier der Logik und Informatik (binäres System).' },

        /* ─── NEUZEIT: EMPIRISMUS ─── */
        { id: 'locke', name: 'John Locke', meta: '1632–1704 · Empirismus / Liberalismus', year: 1632, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'liberalismus', 'kontraktualismus'], dis: ['epistemologie', 'politik'],
          desc: 'Der Geist ist bei Geburt ein „unbeschriebenes Blatt" (tabula rasa); alles Wissen stammt aus Erfahrung. In der politischen Philosophie begründete Locke den Liberalismus: natürliche Rechte auf Leben, Freiheit und Eigentum, Gewaltenteilung und Regierung mit Zustimmung der Regierten. Er beeinflusste die amerikanische Unabhängigkeitserklärung maßgeblich.' },
        { id: 'berkeley', name: 'George Berkeley', meta: '1685–1753 · Immaterialismus', year: 1685, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'idealismus'], dis: ['metaphysik', 'epistemologie'],
          quote: 'Esse est percipi.',
          desc: 'Radikalisierte den Empirismus zum Idealismus: „esse est percipi" – zu sein heißt, wahrgenommen zu werden. Es gebe keine vom Geist unabhängige Materie.' },
        { id: 'hume', name: 'David Hume', meta: '1711–1776 · Empirismus / Skeptizismus', year: 1711, tradition: 'west', epoch: 'neuzeit', str: ['empirismus', 'skeptizismus'], dis: ['epistemologie', 'ethik'],
          desc: 'Der konsequenteste Empirist. Er zeigte, dass wir Kausalität nicht beobachten, sondern nur gewohnheitsmäßig erwarten, und dass sich aus einem Sein kein Sollen logisch ableiten lässt (Humes Gesetz). Seine Kritik an Induktion, Substanz und Ich weckte – nach eigenen Worten Kants – diesen „aus dem dogmatischen Schlummer".' },

        /* ─── AUFKLÄRUNG ─── */
        { id: 'rousseau', name: 'Voltaire, Montesquieu & Rousseau', meta: '18. Jh. · Französische Aufklärung', year: 1712, tradition: 'west', epoch: 'neuzeit', str: ['kontraktualismus'], dis: ['politik'],
          desc: 'Voltaire kämpfte für Meinungs- und Glaubensfreiheit gegen Fanatismus. Montesquieu begründete mit Vom Geist der Gesetze die Lehre der Gewaltenteilung. Jean-Jacques Rousseau prägte mit dem Gesellschaftsvertrag („Volkssouveränität", „Gemeinwille") und mit seiner Erziehungslehre (Émile) Demokratietheorie, Pädagogik und die Romantik.' },
        { id: 'kant', name: 'Immanuel Kant', meta: '1724–1804 · Zentralgestalt der Neuzeit', year: 1724, tradition: 'west', epoch: 'neuzeit', str: ['idealismus', 'deontologie'], dis: ['epistemologie', 'metaphysik', 'ethik'], entry: true,
          quote: 'Zwei Dinge erfüllen das Gemüt … der bestirnte Himmel über mir und das moralische Gesetz in mir.',
          desc: 'Kant vollzog die „kopernikanische Wende" der Erkenntnistheorie: Nicht der Verstand richtet sich nach den Gegenständen, sondern die Gegenstände nach den Anschauungsformen und Kategorien des Verstandes. In der Kritik der reinen Vernunft zeigt er Möglichkeit und Grenzen der Erkenntnis; wir erkennen die Dinge nur als Erscheinung, nie das „Ding an sich". In der Ethik formuliert er den kategorischen Imperativ: „Handle nur nach derjenigen Maxime, durch die du zugleich wollen kannst, dass sie ein allgemeines Gesetz werde." Kant ist der Angelpunkt, an dem sich fast alle spätere Philosophie abarbeitet.',
          book: { title: 'Kritik der reinen Vernunft', author: 'Immanuel Kant', url: 'https://link.amazon/B024U5n6l' } },

        /* ─── 19. JAHRHUNDERT ─── */
        { id: 'hegel', name: 'Fichte, Schelling, Hegel', meta: '1762–1831 · Deutscher Idealismus', year: 1770, tradition: 'west', epoch: 'idealismus', str: ['idealismus'], dis: ['metaphysik', 'politik'],
          desc: 'Fichte stellte das tätige „Ich" ins Zentrum, Schelling die Natur als sichtbaren Geist. Georg Wilhelm Friedrich Hegel entwarf das großartigste System: Die Wirklichkeit ist Entfaltung des „Weltgeistes" in einem dialektischen Prozess (These – Antithese – Synthese) hin zur Freiheit. Seine Geschichts- und Staatsphilosophie wirkt bis heute – auch über seine Gegner (Marx, Kierkegaard).',
          book: { title: 'Phänomenologie des Geistes', author: 'Georg Wilhelm Friedrich Hegel', url: 'https://link.amazon/B0e4KFvBY' } },
        { id: 'schopenhauer', name: 'Arthur Schopenhauer', meta: '1788–1860 · Willensmetaphysik / Pessimismus', year: 1788, tradition: 'west', epoch: 'idealismus', str: ['idealismus'], dis: ['metaphysik', 'aesthetik'],
          desc: 'Gegen Hegel: Die Welt sei nicht Vernunft, sondern blinder Wille (Die Welt als Wille und Vorstellung). Erlösung vom Leiden gebe es nur durch Kunst, Mitleid und Verneinung des Willens – Gedanken, die er auch aus indischer Philosophie schöpfte.',
          book: { title: 'Die Welt als Wille und Vorstellung', author: 'Arthur Schopenhauer', url: 'https://link.amazon/B0hESNJah' } },
        { id: 'kierkegaard', name: 'Søren Kierkegaard', meta: '1813–1855 · Vater des Existenzialismus', year: 1813, tradition: 'west', epoch: 'idealismus', str: ['existenzialismus'], dis: ['ethik', 'metaphysik'],
          desc: 'Stellte gegen Hegels System das konkrete, einzelne Individuum, seine Angst, Verzweiflung und Entscheidung. Der Glaube sei ein „Sprung", nicht Ergebnis von Beweisen. Er gilt als wichtigster Vorläufer des Existenzialismus.',
          book: { title: 'Entweder – Oder', author: 'Søren Kierkegaard', url: 'https://link.amazon/B0a9ZKIba' } },
        { id: 'mill', name: 'John Stuart Mill', meta: '1806–1873 · Utilitarismus / Liberalismus', year: 1806, tradition: 'west', epoch: 'idealismus', str: ['utilitarismus', 'liberalismus'], dis: ['ethik', 'politik'],
          desc: 'Verfeinerte den von Jeremy Bentham begründeten Utilitarismus (richtig ist, was das größte Glück der größten Zahl fördert) und verteidigte in Über die Freiheit individuelle Freiheit, Meinungsfreiheit und – früh – die Gleichberechtigung der Frau.',
          book: { title: 'Der Utilitarismus', author: 'John Stuart Mill', url: 'https://link.amazon/B03aSTtvh' } },
        { id: 'marx', name: 'Karl Marx', meta: '1818–1883 · Historischer Materialismus', year: 1818, tradition: 'west', epoch: 'idealismus', str: ['materialismus', 'marxismus'], dis: ['politik', 'metaphysik'],
          desc: 'Stellte Hegels Dialektik „vom Kopf auf die Füße": Nicht Ideen, sondern die materiellen Produktionsverhältnisse treiben die Geschichte (historischer Materialismus). Seine Analyse von Kapital, Klasse und Entfremdung wurde zur Grundlage des Marxismus und einer der folgenreichsten politischen Theorien der Weltgeschichte.',
          book: { title: 'Das Kommunistische Manifest', author: 'Karl Marx', url: 'https://link.amazon/B0iflkCe1' } },
        { id: 'dostojewski', name: 'Fjodor Dostojewski', meta: '1821–1881 · Literarischer Wegbereiter des Existenzialismus', year: 1821, tradition: 'west', epoch: 'idealismus', str: ['existenzialismus'], dis: ['ethik', 'metaphysik', 'geist'],
          quote: 'Wenn es Gott nicht gibt, ist alles erlaubt.',
          desc: 'Der russische Romancier war kein Systemphilosoph, doch seine Werke – Schuld und Sühne, Die Brüder Karamasow, Aufzeichnungen aus dem Kellerloch – gehören zu den tiefsten philosophischen Auseinandersetzungen mit Freiheit, Schuld, Leid und Glaube. In der „Großinquisitor"-Parabel und der Frage, ob „ohne Gott alles erlaubt" sei, nahm er zentrale Motive des Existenzialismus und Nihilismus vorweg. Er beeinflusste Nietzsche, Kierkegaard-nahe Denker sowie Sartre, Camus und Heidegger tief.',
          book: { title: 'Die Brüder Karamasow', author: 'Fjodor Dostojewski', url: 'https://link.amazon/B0cM1IFoB' } },
        { id: 'nietzsche', name: 'Friedrich Nietzsche', meta: '1844–1900 · Lebensphilosophie / Kulturkritik', year: 1844, tradition: 'west', epoch: 'idealismus', str: [], dis: ['ethik', 'metaphysik'], entry: true,
          quote: 'Was mich nicht umbringt, macht mich stärker.',
          desc: 'Radikaler Kritiker von Moral, Religion und Metaphysik. Mit der Diagnose „Gott ist tot" benannte er den Verlust verbindlicher Werte (Nihilismus) und forderte eine „Umwertung aller Werte". Zentrale Motive: Wille zur Macht, Übermensch, ewige Wiederkehr. Sein Stil und seine Verdachtshermeneutik prägten die gesamte Moderne.',
          book: { title: 'Also sprach Zarathustra', author: 'Friedrich Nietzsche', url: 'https://link.amazon/B0eWsTbJB' } },
        { id: 'peirce', name: 'Charles S. Peirce & William James', meta: '19. Jh. · Amerikanischer Pragmatismus', year: 1842, tradition: 'west', epoch: 'idealismus', str: ['pragmatismus'], dis: ['epistemologie', 'logik'],
          desc: 'Der Pragmatismus misst die Bedeutung und Wahrheit einer Idee an ihren praktischen Folgen. Peirce begründete ihn als Logiker, James popularisierte ihn; später führte John Dewey ihn in Pädagogik und Demokratietheorie weiter.',
          book: { title: 'Pragmatismus und Pragmatizismus', author: 'William James', url: 'https://link.amazon/B0aWblFlM' } },

        /* ─── 20./21. JH: ANALYTISCH ─── */
        { id: 'frege', name: 'Gottlob Frege', meta: '1848–1925 · Begründer der modernen Logik', year: 1848, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['logik', 'sprache'],
          desc: 'Revolutionierte die Logik (Begriffsschrift) und die Sprachphilosophie (Unterscheidung von „Sinn" und „Bedeutung"). Er ist der gemeinsame Ausgangspunkt der analytischen Philosophie.' },
        { id: 'russell', name: 'Bertrand Russell & G. E. Moore', meta: 'frühes 20. Jh. · Cambridge', year: 1872, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['logik', 'ethik'],
          desc: 'Russell (mit Whitehead: Principia Mathematica) versuchte, die Mathematik auf Logik zurückzuführen, und war zugleich ein öffentlicher Intellektueller und Pazifist. Moore begründete die analytische Ethik und die Alltagssprachphilosophie.' },
        { id: 'wittgenstein', name: 'Ludwig Wittgenstein', meta: '1889–1951 · Sprachphilosophie', year: 1889, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['sprache', 'logik'],
          quote: 'Wovon man nicht sprechen kann, darüber muss man schweigen.',
          desc: 'Einer der originellsten Denker der Moderne – mit zwei Philosophien: Im Tractatus bestimmt er die Grenzen des Sagbaren; in den späten Philosophischen Untersuchungen versteht er Sprache als Vielfalt von „Sprachspielen", deren Bedeutung im Gebrauch liegt.',
          book: { title: 'Philosophische Untersuchungen', author: 'Ludwig Wittgenstein', url: 'https://link.amazon/B0ehdsMQN' } },
        { id: 'popper', name: 'Wiener Kreis & Karl Popper', meta: '1920er–1960er · Wissenschaftsphilosophie', year: 1902, tradition: 'west', epoch: 'moderne', str: ['positivismus'], dis: ['wissenschaft', 'epistemologie'],
          desc: 'Der logische Positivismus des Wiener Kreises (Carnap, Schlick) wollte Metaphysik als sinnlos ausscheiden und nur empirisch Prüfbares gelten lassen. Karl Popper setzte dagegen das Falsifikationsprinzip: Wissenschaftlich ist eine Theorie, wenn sie widerlegbar ist. In Die offene Gesellschaft verteidigte er die liberale Demokratie.' },
        { id: 'quine', name: 'W. V. O. Quine & spätere Analytiker', meta: '20. Jh. · USA', year: 1908, tradition: 'west', epoch: 'moderne', str: ['analytische'], dis: ['sprache', 'logik', 'wissenschaft'],
          desc: 'Quine kritisierte die Unterscheidung von analytischen und synthetischen Sätzen und prägte einen naturalistischen Holismus. Saul Kripke erneuerte die Modallogik und Bedeutungstheorie; die analytische Philosophie differenzierte sich in Geistes-, Sprach- und Wissenschaftsphilosophie aus.' },
        { id: 'rawls', name: 'John Rawls', meta: '1921–2002 · Politische Philosophie', year: 1921, tradition: 'west', epoch: 'moderne', str: ['liberalismus', 'kontraktualismus'], dis: ['politik', 'ethik'],
          desc: 'Belebte mit Eine Theorie der Gerechtigkeit (1971) die politische Philosophie neu. Sein Gedankenexperiment des „Schleiers des Nichtwissens" begründet Prinzipien einer gerechten Gesellschaft. Robert Nozick antwortete mit einer libertären Gegenposition.' },

        /* ─── 20./21. JH: KONTINENTAL ─── */
        { id: 'husserl', name: 'Edmund Husserl', meta: '1859–1938 · Begründer der Phänomenologie', year: 1859, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie'], dis: ['geist', 'epistemologie'],
          quote: 'Zu den Sachen selbst!',
          desc: 'Die Phänomenologie untersucht die Strukturen des Bewusstseins und die Weise, wie sich Dinge dem Erleben zeigen („Zu den Sachen selbst!"). Husserl wurde zum Ausgangspunkt Heideggers, Sartres und Merleau-Pontys.' },
        { id: 'heidegger', name: 'Martin Heidegger', meta: '1889–1976 · Fundamentalontologie', year: 1889, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie', 'existenzialismus'], dis: ['metaphysik', 'geist'],
          desc: 'Stellte in Sein und Zeit die „Seinsfrage" neu und analysierte den Menschen als „In-der-Welt-sein" (Dasein), geprägt von Sorge, Zeitlichkeit und Endlichkeit. Enorm einflussreich – zugleich wegen seiner Verstrickung in den Nationalsozialismus bis heute umstritten.' },
        { id: 'sartre', name: 'Jean-Paul Sartre & Simone de Beauvoir', meta: '20. Jh. · Existenzialismus', year: 1905, tradition: 'west', epoch: 'moderne', str: ['existenzialismus', 'feminismus'], dis: ['ethik', 'metaphysik'], entry: true,
          quote: 'Die Existenz geht der Essenz voraus.',
          desc: 'Sartre: „Die Existenz geht der Essenz voraus" – der Mensch ist zur Freiheit verurteilt und schafft sich selbst durch seine Entscheidungen. Simone de Beauvoir übertrug den Existenzialismus in Das andere Geschlecht auf die Geschlechterfrage („Man wird nicht als Frau geboren, man wird es") und wurde zur Begründerin der modernen feministischen Philosophie. Albert Camus gab dem Denken des Absurden literarische Gestalt.' },
        { id: 'merleau', name: 'Merleau-Ponty, Gadamer, Arendt', meta: '20. Jh. · Leib, Verstehen, Politik', year: 1906, tradition: 'west', epoch: 'moderne', str: ['phaenomenologie', 'hermeneutik'], dis: ['geist', 'politik'],
          desc: 'Merleau-Ponty rückte den Leib ins Zentrum der Wahrnehmung. Hans-Georg Gadamer begründete die philosophische Hermeneutik (Lehre vom Verstehen). Hannah Arendt analysierte Totalitarismus, Macht und das „Banale des Bösen" und erneuerte das Denken über das politische Handeln.' },
        { id: 'frankfurt', name: 'Frankfurter Schule: Adorno, Horkheimer, Habermas', meta: '20. Jh. · Kritische Theorie', year: 1903, tradition: 'west', epoch: 'moderne', str: ['marxismus'], dis: ['politik', 'aesthetik'],
          desc: 'Die Kritische Theorie verband Marx, Freud und Hegel zu einer Diagnose moderner Herrschaft und Kulturindustrie (Dialektik der Aufklärung). Jürgen Habermas entwickelte die Theorie des „kommunikativen Handelns" und der Diskursethik – eine Grundlage heutiger Demokratie- und Öffentlichkeitstheorie.' },
        { id: 'foucault', name: 'Strukturalismus & Poststrukturalismus', meta: '1960er ff. · Foucault, Derrida u. a.', year: 1926, tradition: 'west', epoch: 'moderne', str: ['strukturalismus'], dis: ['politik', 'sprache'],
          desc: 'Michel Foucault analysierte das Verhältnis von Wissen und Macht und die geschichtliche Formung von Subjekt, Wahnsinn und Sexualität. Jacques Derrida begründete die Dekonstruktion, die feste Bedeutungen und Gegensätze unterläuft. Zusammen mit Lévi-Strauss, Lacan und Deleuze prägten sie das kontinentale Denken der zweiten Jahrhunderthälfte.' },
        { id: 'gegenwart', name: 'Weitere Felder der Gegenwart', meta: '20./21. Jh. · Ethik, Geist, Feminismus', year: 1950, tradition: 'west', epoch: 'moderne', str: ['feminismus', 'utilitarismus'], dis: ['ethik', 'geist'],
          desc: 'Wichtige Felder der Gegenwart sind die feministische Philosophie (neben de Beauvoir u. a. Judith Butler, Martha Nussbaum), die Umwelt- und Tierethik (Peter Singer, Hans Jonas), die Angewandte Ethik (Medizin, Technik, KI) sowie die Philosophie des Geistes und der Kognitionswissenschaft (Daniel Dennett, David Chalmers, Thomas Nagel).' },

        /* ─── INDISCHE PHILOSOPHIE ─── */
        { id: 'upanishaden', name: 'Die Upanishaden', meta: 'ab ca. 800 v. Chr. · Vedanta-Grundlage', year: -800, tradition: 'indisch', epoch: 'antike', str: ['idealismus'], dis: ['metaphysik'],
          quote: 'Tat tvam asi – Das bist du.',
          desc: 'Diese Texte lehren die Einheit von individuellem Selbst (Atman) und Weltgrund (Brahman) – „Tat tvam asi" („Das bist du") – und die Befreiung aus dem Kreislauf der Wiedergeburten.' },
        { id: 'buddha', name: 'Siddhartha Gautama (Buddha)', meta: 'ca. 563–483 v. Chr. · Buddhismus', year: -563, tradition: 'indisch', epoch: 'antike', str: [], dis: ['ethik', 'metaphysik', 'geist'], entry: true,
          desc: 'Lehrte die „Vier Edlen Wahrheiten" vom Leiden, seiner Ursache (Begierde), seiner Aufhebung und dem „Achtfachen Pfad". Zentral sind Anatta (Nicht-Selbst), Anicca (Vergänglichkeit) und der „mittlere Weg". Der Buddhismus wurde zu einer der großen Weltphilosophien mit reicher Erkenntnistheorie und Logik.' },
        { id: 'mahavira', name: 'Mahavira', meta: 'ca. 599–527 v. Chr. · Jainismus', year: -599, tradition: 'indisch', epoch: 'antike', str: [], dis: ['ethik', 'metaphysik'],
          desc: 'Prägende Gestalt des Jainismus mit seiner radikalen Gewaltlosigkeit (Ahimsa) und der Lehre von der Vielseitigkeit der Wahrheit (Anekantavada).' },
        { id: 'nagarjuna', name: 'Nagarjuna', meta: 'ca. 150–250 n. Chr. · Madhyamaka-Buddhismus', year: 150, tradition: 'indisch', epoch: 'antike', str: [], dis: ['metaphysik', 'logik'],
          desc: 'Einer der größten Denker Indiens. Seine Lehre der „Leerheit" (Shunyata): Nichts hat ein unabhängiges Eigenwesen; alles besteht in Abhängigkeit (bedingtes Entstehen). Seine Dialektik gilt als Gipfel indischer Logik.' },
        { id: 'shankara', name: 'Patanjali & Adi Shankara', meta: '2. Jh. bzw. 8. Jh. · Yoga und Advaita-Vedanta', year: 700, tradition: 'indisch', epoch: 'mittelalter', str: ['idealismus'], dis: ['metaphysik', 'geist'],
          desc: 'Patanjali systematisierte im Yogasutra den Yoga als Weg der Geistesschulung. Adi Shankara begründete den Advaita-Vedanta (strenger Nicht-Dualismus): Nur Brahman ist wirklich, die Vielheit der Welt ist letztlich Maya (Erscheinung). Er ist der einflussreichste Philosoph des Hinduismus.' },

        /* ─── CHINESISCHE PHILOSOPHIE ─── */
        { id: 'konfuzius', name: 'Konfuzius (Kong Fuzi)', meta: '551–479 v. Chr. · Konfuzianismus', year: -551, tradition: 'china', epoch: 'antike', str: ['tugendethik'], dis: ['ethik', 'politik'], entry: true,
          quote: 'Was du selbst nicht wünschst, das füge auch keinem anderen zu.',
          desc: 'Der prägendste Denker Ostasiens. Sein Ideal ist der „edle Mensch" (Junzi), der Menschlichkeit (Ren), Rechtschaffenheit (Yi) und Riten/Anstand (Li) verkörpert. Ordnung entsteht durch moralische Selbstkultivierung, Familienethik und vorbildliche Herrschaft. Seine Gespräche (Lunyu) formten Bildung, Verwaltung und Wertordnung Chinas über zwei Jahrtausende.' },
        { id: 'menzius', name: 'Menzius (Mengzi) & Xunzi', meta: '4./3. Jh. v. Chr. · Konfuzianische Klassik', year: -372, tradition: 'china', epoch: 'antike', str: ['tugendethik'], dis: ['ethik'],
          desc: 'Menzius vertrat die These, der Mensch sei von Natur aus gut. Xunzi widersprach: Die Natur sei roh und müsse durch Erziehung und Riten geformt werden – eine bis heute grundlegende Debatte über die menschliche Natur.' },
        { id: 'laozi', name: 'Laozi & Zhuangzi', meta: '6.–4. Jh. v. Chr. · Daoismus', year: -500, tradition: 'china', epoch: 'antike', str: [], dis: ['metaphysik', 'ethik'],
          desc: 'Der Daoismus lehrt das Leben im Einklang mit dem Dao („dem Weg"), der unaussprechlichen Ordnung der Natur, durch Wu wei („Nicht-Erzwingen", absichtsloses Handeln). Das Daodejing (Laozi) und die geistreichen Parabeln des Zhuangzi bilden das Gegengewicht zum konfuzianischen Pflichtdenken.' },
        { id: 'mozi', name: 'Mozi & Han Feizi', meta: '5.–3. Jh. v. Chr. · Mohismus und Legalismus', year: -430, tradition: 'china', epoch: 'antike', str: ['utilitarismus'], dis: ['ethik', 'politik'],
          desc: 'Mozi forderte „unterschiedslose Nächstenliebe" und einen frühen Nützlichkeitsstandard. Der Legalismus (Han Feizi) setzte dagegen auf strenge Gesetze und Staatsmacht – die ideologische Grundlage der Reichseinigung Chinas.' },
        { id: 'zhuxi', name: 'Zhu Xi & Wang Yangming', meta: '12./15./16. Jh. · Neokonfuzianismus', year: 1130, tradition: 'china', epoch: 'mittelalter', str: ['tugendethik'], dis: ['metaphysik', 'ethik'],
          desc: 'Zhu Xi verschmolz Konfuzianismus mit metaphysischen Begriffen (Prinzip li und Lebenskraft qi) zum orthodoxen Neokonfuzianismus. Wang Yangming betonte die „Einheit von Wissen und Handeln" und das angeborene moralische Wissen des Herz-Geistes.' },

        /* ─── ISLAMISCHE PHILOSOPHIE ─── */
        { id: 'farabi', name: 'al-Kindi & al-Farabi', meta: '9./10. Jh. · Frühe Falsafa', year: 850, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['logik', 'politik', 'metaphysik'],
          desc: 'al-Kindi gilt als „erster Philosoph der Araber". al-Farabi („der zweite Lehrer" nach Aristoteles) verband griechische Logik und politische Philosophie mit dem Islam und entwarf das Modell der „tugendhaften Stadt".' },
        { id: 'avicenna', name: 'Avicenna (Ibn Sina)', meta: '980–1037 · Höhepunkt der Falsafa', year: 980, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'geist'],
          desc: 'Universalgelehrter und einer der größten Denker des Mittelalters. Seine Metaphysik der Unterscheidung von Wesen und Existenz und sein „Fliegender-Mensch"-Argument für das Selbstbewusstsein wirkten tief auf Thomas von Aquin. Sein medizinischer Kanon war bis in die frühe Neuzeit europäisches Standardwerk.' },
        { id: 'ghazali', name: 'al-Ghazali', meta: '1058–1111 · Kritik der Philosophie / Mystik', year: 1058, tradition: 'islam', epoch: 'mittelalter', str: ['skeptizismus'], dis: ['metaphysik', 'epistemologie'],
          desc: 'In Die Inkohärenz der Philosophen kritisierte er den Anspruch der Falsafa, verteidigte Glaube und Sufismus und beeinflusste damit die Entwicklung von Theologie und Skepsis (auch als Anregung für spätere europäische Kausalitätskritik).' },
        { id: 'averroes', name: 'Averroes (Ibn Rushd)', meta: '1126–1198 · Aristotelismus', year: 1126, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'logik'],
          desc: 'Der bedeutendste Aristoteles-Kommentator; im Westen schlicht „der Kommentator" genannt. Er verteidigte die Vernunft (Die Inkohärenz der Inkohärenz) und das Verhältnis von Philosophie und Religion. Der „lateinische Averroismus" prägte die europäischen Universitäten.' },
        { id: 'khaldun', name: 'Ibn Khaldun', meta: '1332–1406 · Geschichts- und Sozialphilosophie', year: 1332, tradition: 'islam', epoch: 'mittelalter', str: [], dis: ['politik'],
          desc: 'Mit der Muqaddima begründete er eine Theorie des Aufstiegs und Zerfalls von Gesellschaften (Asabiyya, sozialer Zusammenhalt) und gilt als früher Vordenker von Soziologie und Geschichtswissenschaft.' },

        /* ─── JÜDISCHE PHILOSOPHIE ─── */
        { id: 'maimonides', name: 'Philon von Alexandria & Maimonides', meta: '1. Jh. bzw. 1138–1204', year: 1138, tradition: 'juedisch', epoch: 'mittelalter', str: [], dis: ['metaphysik', 'ethik'],
          desc: 'Philon verband früh jüdische Schrift und griechische Philosophie. Moses Maimonides (Rambam) vermittelte in Der Führer der Unschlüssigen zwischen aristotelischer Vernunft und jüdischem Glauben und beeinflusste damit auch die christliche Scholastik. In der Moderne setzten Denker wie Martin Buber (Dialogphilosophie „Ich und Du") und Emmanuel Levinas (Ethik des „Anderen") diese Tradition fort.' },

        /* ─── AFRIKANISCHE PHILOSOPHIE ─── */
        { id: 'ubuntu', name: 'Ubuntu & die „Sage Philosophy"', meta: 'Traditionelles Denken', year: null, tradition: 'afrika', epoch: null, str: [], dis: ['ethik', 'metaphysik'],
          quote: 'Ubuntu – Ich bin, weil wir sind.',
          desc: 'Das südliche Konzept Ubuntu („Ich bin, weil wir sind") betont die gemeinschaftliche Konstitution der Person. Die „Sage Philosophy" (Henry Odera Oruka) dokumentiert das reflektierte Denken traditioneller Weiser als echte Philosophie.' },
        { id: 'fanon', name: 'Amo · Wiredu · Fanon', meta: '18.–20. Jh.', year: 1900, tradition: 'afrika', epoch: 'moderne', str: [], dis: ['politik', 'ethik'],
          desc: 'Anton Wilhelm Amo (aus Ghana) lehrte im 18. Jh. an deutschen Universitäten Philosophie. Kwasi Wiredu arbeitete an einer „begrifflichen Dekolonisierung". Frantz Fanon analysierte Kolonialismus, Rasse und Befreiung und wurde zum Klassiker des postkolonialen Denkens.' },

        /* ─── LATEINAMERIKANISCHE PHILOSOPHIE ─── */
        { id: 'dussel', name: 'Befreiungsphilosophie', meta: '20. Jh. · Enrique Dussel u. a.', year: 1934, tradition: 'latam', epoch: 'moderne', str: ['marxismus'], dis: ['politik', 'ethik'],
          desc: 'Die lateinamerikanische Befreiungsphilosophie (verwandt mit der Befreiungstheologie) denkt Philosophie „von den Armen und Ausgeschlossenen her" und kritisiert die Vorherrschaft der europäischen Perspektive. Ein Beispiel für die wachsende Globalisierung des philosophischen Gesprächs.' }
    ];

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
        sources: sources
    };
})();
