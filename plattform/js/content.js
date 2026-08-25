/**
 * Hybridlog Plattform – Inhaltstexte (Beitraege)
 * Volltext-Abschnitte je Beitrag, statisch in JS gepflegt (kein Build).
 * window.HLContent[slug] = { lead?, sections: [{ h2, html }] }
 * Tools ohne eigene Island bekommen hier eine Beschreibung + Status.
 */
(function () {
    'use strict';

    const C = {
        'stoizismus-alltag': {
            lead: 'Die Stoiker hatten eine einfache erste Frage, bevor sie sich aufregten, worauf habe ich hier überhaupt Einfluss.',
            sections: [
                {
                    h2: 'Die eine Unterscheidung', html:
                        '<p>Im Kern des Stoizismus steht eine Trennung, die zunächst banal klingt und doch alles verändert. Manches steht in deiner Macht, dein Urteil, deine Absicht, dein nächster Schritt. Anderes nicht, das Wetter, die Meinung anderer, der Ausgang vieler Dinge. Leiden entsteht, wenn wir die zweite Gruppe behandeln, als gehöre sie zur ersten.</p>' +
                        '<p>Epiktet brachte es auf den Punkt. Nicht die Dinge beunruhigen uns, sondern unsere Urteile über die Dinge. Zwischen einem Ereignis und deiner Reaktion liegt immer ein Urteil, und genau dort hast du Spielraum.</p>'
                },
                {
                    h2: 'Wie es im Alltag aussieht', html:
                        '<p>Bevor du dich das nächste Mal ärgerst, stell die stoische Frage. Ist das mein Teil oder nicht. Ist es dein Teil, handle ruhig und klar. Ist es nicht dein Teil, übe dich darin, es geschehen zu lassen, ohne dich innerlich daran festzuhaken.</p>' +
                        '<p>Das ist keine Gleichgültigkeit. Der Stoiker handelt entschlossen, er klammert sich nur nicht an das Ergebnis, das er nicht kontrollieren kann.</p>'
                },
                {
                    h2: 'Warum es traegt', html:
                        '<p>Diese Haltung macht dich weniger abhängig von Glück und Zufall. Du gibst dein Bestes im Bereich deiner Kontrolle und findest Ruhe im Rest. Das ist der Kern dessen, was die Stoiker Seelenruhe nannten, und der Grund, warum ihre Texte nach zweitausend Jahren noch gelesen werden.</p>'
                },
            ],
        },

        'mbti-ueberblick': {
            lead: 'Vier Gegensatzpaare, sechzehn Typen, viel Faszination, und einige berechtigte Zweifel.',
            sections: [
                { h2: 'Woher das Modell kommt', html: '<p>Das MBTI geht auf Katharine Cook Briggs und ihre Tochter Isabel Briggs Myers zurück, die Ideen von Carl Jung zu einem Fragebogen ausbauten. Es beschreibt Persönlichkeit über vier Dimensionen, Introversion und Extraversion, Wahrnehmung über Sinne oder Intuition, Entscheiden über Denken oder Fühlen, und einen Lebensstil zwischen Urteilen und Wahrnehmen.</p>' },
                { h2: 'Was ein Typ aussagt', html: '<p>Aus den vier Dimensionen ergeben sich sechzehn Kombinationen wie INTJ oder ESFP. Der Reiz liegt darin, dass sich viele in ihrem Kürzel wiedererkennen. Der Typ ist aber eine Vereinfachung. Menschen sitzen selten am Extrem einer Dimension, die meisten liegen in der Mitte.</p>' },
                { h2: 'Wie viel darf man glauben', html: '<p>Wissenschaftlich gilt das MBTI als wenig zuverlässig, dieselbe Person bekommt bei Wiederholung oft ein anderes Ergebnis. Als Gesprächsanlass über Vorlieben und Unterschiede ist es trotzdem nützlich, solange man es nicht als festes Etikett nimmt.</p>' },
            ],
        },

        'active-recall': {
            lead: 'Sich selbst abfragen schlägt das erneute Durchlesen deutlich, und das ist gut belegt.',
            sections: [
                { h2: 'Was Active Recall ist', html: '<p>Active Recall bedeutet, Wissen aktiv aus dem Gedächtnis zu holen, statt es passiv wieder aufzunehmen. Du schließt das Buch und versuchst, den Inhalt aus dem Kopf zu rekonstruieren. Jeder erfolgreiche Abruf stärkt die Spur im Gedächtnis.</p>' },
                { h2: 'Warum es wirkt', html: '<p>Beim Wiederlesen fühlt sich Stoff vertraut an, und Vertrautheit täuscht Können vor. Beim Abrufen merkst du sofort, was wirklich sitzt. Diese Anstrengung ist der Punkt, gerade weil es schwerer ist, lernst du mehr. Studien nennen das den Testing-Effekt.</p>' },
                { h2: 'So setzt du es um', html: '<p>Verwandle Notizen in Fragen. Decke Antworten ab und prüfe dich. Nutze Karteikarten, am besten mit wachsenden Abständen zwischen den Wiederholungen. Wichtig ist, dich zu irren und den Fehler zu korrigieren, nicht ihn zu vermeiden.</p>' },
            ],
        },

        'disziplin-system': {
            lead: 'Nicht Willenskraft entscheidet, sondern die Umgebung und die Routine.',
            sections: [
                { h2: 'Disziplin ist kein Talent', html: '<p>Wir stellen uns disziplinierte Menschen als besonders willensstark vor. In Wahrheit haben sie meist bessere Systeme. Sie müssen sich seltener entscheiden, weil ihre Umgebung die richtige Wahl leicht und die falsche schwer macht.</p>' },
                { h2: 'Die Umgebung entscheidet', html: '<p>Willenskraft ist eine schwankende Ressource. Verlass dich nicht darauf. Räum stattdessen Reibung aus dem Weg, leg die Laufschuhe bereit, lösche die App vom Startbildschirm. Kleine Änderungen an der Umgebung wirken stärker als große Vorsätze.</p>' },
                { h2: 'Vom Vorsatz zum System', html: '<p>Ersetze das vage Ziel durch eine feste Wenn-dann-Regel. Wenn es acht Uhr ist, setze ich mich fünf Minuten hin. Klein anfangen, an eine bestehende Gewohnheit koppeln, wiederholen. So wird aus Anstrengung ein Automatismus.</p>' },
            ],
        },

        'deep-work': {
            lead: 'Flow braucht klare Ziele, sofortiges Feedback und die richtige Schwierigkeit.',
            sections: [
                { h2: 'Was Deep Work ist', html: '<p>Deep Work meint konzentriertes Arbeiten ohne Ablenkung an einer anspruchsvollen Aufgabe. In diesem Zustand entsteht der meiste Wert und oft das Gefühl, das der Psychologe Mihaly Csikszentmihalyi Flow nannte.</p>' },
                { h2: 'Wie Flow entsteht', html: '<p>Flow braucht drei Dinge, ein klares Ziel, unmittelbares Feedback und eine Aufgabe, die weder zu leicht noch zu schwer ist. Liegt die Schwierigkeit knapp über deinem Können, zieht die Aufgabe dich hinein.</p>' },
                { h2: 'So löst du ihn aus', html: '<p>Schütze zusammenhängende Blöcke von einer bis zwei Stunden. Entferne Ablenkungen, bevor sie auftauchen, das Handy außer Reichweite, Mitteilungen aus. Beginne mit einem klaren nächsten Schritt, der Einstieg ist die halbe Miete.</p>' },
            ],
        },

        'zeit-erinnerung': {
            lead: 'Neue Eindrücke verlangsamen das gefühlte Vergehen der Zeit.',
            sections: [
                { h2: 'Warum die Zeit rast', html: '<p>Je älter wir werden, desto schneller scheint die Zeit zu vergehen. Ein Grund ist, dass der Alltag routinierter wird. Das Gehirn misst Zeit nicht in Stunden, sondern in neuen Erinnerungen, und Routine erzeugt kaum welche.</p>' },
                { h2: 'Erinnerungen als Maß', html: '<p>Ein Urlaub voller neuer Eindrücke fühlt sich rückblickend lang an, obwohl er kurz war. Eine gleichförmige Woche verschwimmt zu einem einzigen Tag. Nicht die Dauer zählt fürs Gefühl, sondern die Dichte des Neuen.</p>' },
                { h2: 'Wie du sie dehnst', html: '<p>Suche bewusst Neues, andere Wege, neue Menschen, ungewohnte Aufgaben. Wer aufmerksam lebt und Neues sucht, füllt die Zeit mit Erinnerungen und erlebt sie wieder als reicher und länger.</p>' },
            ],
        },

        'ki-lernen': {
            lead: 'KI als Sparringspartner, nicht als Abkürzung zum fertigen Ergebnis.',
            sections: [
                { h2: 'Werkzeug oder Krücke', html: '<p>Künstliche Intelligenz kann Erklärungen liefern, Fragen stellen und Feedback geben. Sie kann aber auch das Denken abnehmen, das eigentlich den Lerneffekt ausmacht. Der Unterschied liegt darin, wie du sie einsetzt.</p>' },
                { h2: 'Gut einsetzen', html: '<p>Lass dir nicht die Lösung geben, sondern Hinweise. Bitte die KI, dich abzufragen, deine Erklärung zu prüfen oder ein Konzept auf drei Arten zu erklären. So bleibt die Denkarbeit bei dir, die KI schärft sie nur.</p>' },
                { h2: 'Die Grenze kennen', html: '<p>Wo du nur kopierst, lernst du nichts. Nutze KI, um dich zu fordern, nicht um dich zu entlasten. Das gilt umso mehr für Themen, die du wirklich beherrschen willst.</p>' },
            ],
        },
    };

    // Tools ohne eigene Island: Beschreibung + Status
    const TOOL_STUB = {
        'denkfehler': { note: 'Dieses Tool wird gerade gebaut.', html: '<p>Eine kurze Selbstprüfung führt dich durch typische Denkfehler wie Bestätigungsfehler oder Verlustangst und zeigt, welche bei dir am stärksten ziehen.</p>' },
        'lernplan': { note: 'Dieses Tool wird gerade gebaut.', html: '<p>Der Planer verteilt deinen Stoff auf sinnvolle Einheiten mit eingebauten Wiederholungen, damit du verteiltes Lernen leicht umsetzen kannst.</p>' },
        'gewohnheiten': { note: 'Dieses Tool wird gerade gebaut.', html: '<p>Ein paar Fragen zeigen dir, welche einzelne Gewohnheit den größten Hebel für dein Ziel hat, statt dich in zu vielen Vorsätzen zu verlieren.</p>' },
    };

    window.HLContent = C;
    window.HLToolStub = TOOL_STUB;
})();
