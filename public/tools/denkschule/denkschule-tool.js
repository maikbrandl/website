/**
 * Island "Welche Denkschule bist du?" (Prompt 4)
 * Eigenstaendiges, funktionierendes Tool. Laedt nur auf Tool-Seiten.
 * Mountet in ein Element: DenkschuleTool.mount(el)
 * Voll tastaturbedienbar (Radio-Gruppe je Frage), respektiert reduced-motion (CSS).
 */
(function () {
    'use strict';

    const SCHOOLS = {
        stoa: {
            name: 'Stoizismus',
            line: 'Du richtest deine Kraft auf das, was in deiner Macht steht, und lässt den Rest ruhen.',
            text: 'Wie die Stoiker suchst du Gelassenheit über die klare Trennung zwischen dem Beeinflussbaren und dem Unabänderlichen. Handeln ja, aber ohne dich an Ergebnissen festzuklammern.',
        },
        existenz: {
            name: 'Existenzialismus',
            line: 'Du glaubst, dass Sinn nicht gefunden, sondern gemacht wird, durch deine eigenen Entscheidungen.',
            text: 'Freiheit ist für dich Verantwortung. Kein fertiges Drehbuch, sondern die Aufgabe, dich in jeder Wahl selbst zu entwerfen, auch wenn das unbequem ist.',
        },
        empirie: {
            name: 'Empirismus und Pragmatismus',
            line: 'Du vertraust der Erfahrung und fragst zuerst, was in der Praxis wirklich funktioniert.',
            text: 'Ideen zählen für dich, wenn sie sich bewähren. Du prüfst, beobachtest und korrigierst, statt an Prinzipien festzuhalten, die der Wirklichkeit nicht standhalten.',
        },
        rationalismus: {
            name: 'Rationalismus',
            line: 'Du suchst nach klaren Prinzipien und baust dein Denken von der Vernunft her auf.',
            text: 'Wie die Rationalisten traust du dem folgerichtigen Argument. Aus wenigen sicheren Grundsätzen leitest du ab, was stimmig ist, unabhängig von der Stimmung des Augenblicks.',
        },
    };

    const QUESTIONS = [
        {
            q: 'Etwas läuft schief, das du nicht geplant hast. Dein erster Gedanke?',
            opts: [
                { t: 'Was davon kann ich beeinflussen, der Rest ist nicht meine Sache.', s: 'stoa' },
                { t: 'Ich entscheide jetzt, was ich daraus mache.', s: 'existenz' },
                { t: 'Mal sehen, was in der Praxis am besten hilft.', s: 'empirie' },
                { t: 'Ich denke es sauber durch und finde die richtige Regel.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Woraus schöpfst du am ehesten Sinn?',
            opts: [
                { t: 'Aus innerer Ruhe und einem klaren Blick.', s: 'stoa' },
                { t: 'Aus dem, was ich selbst wähle und verantworte.', s: 'existenz' },
                { t: 'Aus konkreten Erfahrungen und Ergebnissen.', s: 'empirie' },
                { t: 'Aus Wahrheit, die logisch Bestand hat.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Wie triffst du eine wichtige Entscheidung?',
            opts: [
                { t: 'Ich frage, was ich wirklich in der Hand habe.', s: 'stoa' },
                { t: 'Ich höre auf meine Freiheit, nicht auf Erwartungen.', s: 'existenz' },
                { t: 'Ich probiere, sammle Hinweise, passe an.', s: 'empirie' },
                { t: 'Ich leite sie aus festen Grundsätzen ab.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Was hält dich am ehesten zurück?',
            opts: [
                { t: 'Wenn ich mich an Dingen aufreibe, die ich nicht ändern kann.', s: 'stoa' },
                { t: 'Wenn ich mich von anderen bestimmen lasse.', s: 'existenz' },
                { t: 'Wenn ich zu lange nachdenke statt zu handeln.', s: 'empirie' },
                { t: 'Wenn Argumente unklar und widersprüchlich sind.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Welcher Satz klingt am meisten nach dir?',
            opts: [
                { t: 'Nicht die Dinge beunruhigen uns, sondern unsere Urteile.', s: 'stoa' },
                { t: 'Der Mensch ist zur Freiheit verurteilt.', s: 'existenz' },
                { t: 'Wahr ist, was sich bewährt.', s: 'empirie' },
                { t: 'Ich denke, also bin ich.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Ein guter Rat an einen Freund wäre eher:',
            opts: [
                { t: 'Konzentriere dich auf deinen Teil, lass den Rest los.', s: 'stoa' },
                { t: 'Steh zu deiner Wahl, auch wenn sie ungewohnt ist.', s: 'existenz' },
                { t: 'Teste es einfach und schau, was passiert.', s: 'empirie' },
                { t: 'Kläre zuerst, was logisch wirklich folgt.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Wie denkst du über die eigene Vergänglichkeit?',
            opts: [
                { t: 'Sie gehört zum Lauf der Dinge, Angst davor ändert nichts daran.', s: 'stoa' },
                { t: 'Gerade weil das Leben endlich ist, muss ich selbst entscheiden, wofür ich es nutze.', s: 'existenz' },
                { t: 'Ich beschäftige mich damit, wenn sie konkret ansteht, nicht vorher.', s: 'empirie' },
                { t: 'Ich versuche, sie als folgerichtigen Teil eines logischen Weltbilds zu verstehen.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Jemand kritisiert dich offen vor anderen. Wie reagierst du innerlich?',
            opts: [
                { t: 'Ich prüfe, was an der Kritik stimmt, der Rest ist sein Problem, nicht meins.', s: 'stoa' },
                { t: 'Ich entscheide selbst, ob ich mich davon definieren lasse.', s: 'existenz' },
                { t: 'Ich schaue, ob die Kritik in der Praxis etwas verbessert, und probiere es aus.', s: 'empirie' },
                { t: 'Ich zerlege das Argument und prüfe, ob es logisch haltbar ist.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Du hast einen klaren Fehler gemacht. Was ist dein erster Schritt?',
            opts: [
                { t: 'Ich akzeptiere, dass er passiert ist, und kümmere mich um das, was ich jetzt noch ändern kann.', s: 'stoa' },
                { t: 'Ich stehe dazu, weil er aus meiner eigenen Entscheidung kam.', s: 'existenz' },
                { t: 'Ich schaue, was er mir fürs nächste Mal zeigt, und passe mein Vorgehen an.', s: 'empirie' },
                { t: 'Ich suche den Denkfehler, der dazu geführt hat.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Wie stehst du zu Regeln und Autoritäten?',
            opts: [
                { t: 'Ich folge ihnen gelassen, solange sie meine innere Freiheit nicht einschränken.', s: 'stoa' },
                { t: 'Ich prüfe jede Regel daran, ob ich sie selbst noch bejahen kann.', s: 'existenz' },
                { t: 'Ich halte mich daran, wenn sie sich in der Praxis bewährt haben.', s: 'empirie' },
                { t: 'Ich folge ihnen, wenn sie einer nachvollziehbaren Begründung standhalten.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Was bedeutet Erfolg für dich am ehesten?',
            opts: [
                { t: 'Dass ich getan habe, was in meiner Macht stand, unabhängig vom Ausgang.', s: 'stoa' },
                { t: 'Dass ich meinem eigenen Weg treu geblieben bin.', s: 'existenz' },
                { t: 'Dass etwas spürbar funktioniert hat und anderen nützt.', s: 'empirie' },
                { t: 'Dass das Ergebnis einer klaren, stimmigen Idee folgt.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Eine große Veränderung steht unerwartet an. Wie reagierst du?',
            opts: [
                { t: 'Ich nehme sie an, denn Widerstand gegen das Unvermeidliche kostet nur Kraft.', s: 'stoa' },
                { t: 'Ich sehe darin eine neue Gelegenheit, mich neu zu entscheiden.', s: 'existenz' },
                { t: 'Ich beobachte erst, wie sie sich auswirkt, bevor ich urteile.', s: 'empirie' },
                { t: 'Ich frage, welche Prinzipien jetzt noch gelten und welche nicht.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Du hast etwas oder jemanden verloren. Was hilft dir am meisten?',
            opts: [
                { t: 'Zu erkennen, was ohnehin nie wirklich meins war, sondern nur geliehen.', s: 'stoa' },
                { t: 'Den Verlust in meine eigene Geschichte einzubauen, statt ihn zu verdrängen.', s: 'existenz' },
                { t: 'Zeit und neue Erfahrungen, die zeigen, dass es weitergeht.', s: 'empirie' },
                { t: 'Eine klare Erklärung dafür zu finden, warum es so gekommen ist.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Was macht für dich ein gutes Leben aus?',
            opts: [
                { t: 'Inneren Frieden, unabhängig von äußeren Umständen.', s: 'stoa' },
                { t: 'Eines, das ich bewusst selbst gewählt habe.', s: 'existenz' },
                { t: 'Eines, das sich im Alltag als stimmig und brauchbar erweist.', s: 'empirie' },
                { t: 'Eines, das in sich logisch und widerspruchsfrei ist.', s: 'rationalismus' },
            ],
        },
        {
            q: 'In einem Streit mit jemandem, der dir wichtig ist, reagierst du eher:',
            opts: [
                { t: 'Ruhig, weil ich meine eigene Reaktion kontrollieren kann, seine nicht.', s: 'stoa' },
                { t: 'Direkt, weil ich zu meiner Sicht stehen will, auch wenn es unbequem ist.', s: 'existenz' },
                { t: 'Abwartend, ich schaue erst, was den Streit tatsächlich löst.', s: 'empirie' },
                { t: 'Argumentativ, ich will die Sache logisch klären.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Wie gehst du mit neuem Wissen um, das deiner bisherigen Meinung widerspricht?',
            opts: [
                { t: 'Gelassen, meine Ruhe hängt nicht an meiner alten Meinung.', s: 'stoa' },
                { t: 'Ich prüfe, ob ich mich davon wirklich überzeugen lasse, aus freien Stücken.', s: 'existenz' },
                { t: 'Ich teste es, und wenn es sich bewährt, übernehme ich es.', s: 'empirie' },
                { t: 'Ich prüfe die Argumente dahinter auf Folgerichtigkeit.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Was denkst du über die Zukunft, die du nicht kennst?',
            opts: [
                { t: 'Ich bereite mich auf das vor, was ich beeinflussen kann, den Rest lasse ich offen.', s: 'stoa' },
                { t: 'Sie ist das Feld, in dem ich mich erst noch entwerfen werde.', s: 'existenz' },
                { t: 'Ich warte Erfahrungen ab, statt sie vorab zu verplanen.', s: 'empirie' },
                { t: 'Ich versuche, sie aus dem, was ich heute weiß, logisch abzuleiten.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Eine starke Versuchung meldet sich, etwa zu viel zu kaufen oder etwas aufzuschieben. Was hilft dir?',
            opts: [
                { t: 'Mir klarzumachen, dass der Impuls vorübergeht und ich ihn nicht sofort erfüllen muss.', s: 'stoa' },
                { t: 'Mich zu fragen, ob das wirklich meine eigene Entscheidung wäre.', s: 'existenz' },
                { t: 'Auszuprobieren, welche Ablenkung in der Praxis tatsächlich hilft.', s: 'empirie' },
                { t: 'Mir die Gründe aufzuschreiben, die dagegen sprechen.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Welche Rolle spielen Geld oder Besitz in deinem Denken?',
            opts: [
                { t: 'Nützlich, aber nichts, woran ich mein inneres Gleichgewicht hänge.', s: 'stoa' },
                { t: 'Ein Mittel, mit dem ich die Freiheit habe, meine eigenen Entscheidungen zu treffen.', s: 'existenz' },
                { t: 'Ich bewerte es daran, was es im Alltag tatsächlich ermöglicht.', s: 'empirie' },
                { t: 'Ich plane es nach klaren, durchdachten Regeln.', s: 'rationalismus' },
            ],
        },
        {
            q: 'Ziehst du eher die Gemeinschaft oder dich selbst als Maßstab heran?',
            opts: [
                { t: 'Beides, aber meine Ruhe hole ich mir zuerst bei mir selbst.', s: 'stoa' },
                { t: 'Mich selbst, denn am Ende verantworte ich meine Entscheidungen allein.', s: 'existenz' },
                { t: 'Die Gemeinschaft, weil sich dort zeigt, was tatsächlich funktioniert.', s: 'empirie' },
                { t: 'Ein Prinzip, das für beide gleichermaßen gelten müsste.', s: 'rationalismus' },
            ],
        },
    ];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function mount(root, opts) {
        opts = opts || {};
        const answers = new Array(QUESTIONS.length).fill(null);
        let idx = 0;

        function render() {
            const q = QUESTIONS[idx];
            const pct = Math.round((idx) / QUESTIONS.length * 100);
            root.innerHTML =
                '<div class="dt">' +
                '<div class="dt__progress" aria-hidden="true"><span style="width:' + pct + '%"></span></div>' +
                '<p class="dt__step">Frage ' + (idx + 1) + ' von ' + QUESTIONS.length + '</p>' +
                '<fieldset class="dt__field">' +
                '<legend class="dt__q">' + esc(q.q) + '</legend>' +
                '<div class="dt__opts" role="radiogroup">' +
                q.opts.map((o, i) =>
                    '<button type="button" class="dt__opt" role="radio" aria-checked="' + (answers[idx] === i ? 'true' : 'false') + '" data-i="' + i + '">' +
                    '<span class="dt__opt-mark" aria-hidden="true"></span><span>' + esc(o.t) + '</span></button>'
                ).join('') +
                '</div></fieldset>' +
                '<div class="dt__nav">' +
                (idx > 0 ? '<button type="button" class="btn ghost" data-back>Zurück</button>' : '<span></span>') +
                '<button type="button" class="btn" data-next ' + (answers[idx] === null ? 'disabled' : '') + '>' +
                (idx === QUESTIONS.length - 1 ? 'Ergebnis zeigen' : 'Weiter') + '</button>' +
                '</div>' +
                '</div>';

            root.querySelectorAll('.dt__opt').forEach((btn) => {
                btn.addEventListener('click', () => { answers[idx] = Number(btn.dataset.i); render(); });
            });
            const back = root.querySelector('[data-back]');
            if (back) back.addEventListener('click', () => { idx--; render(); });
            const next = root.querySelector('[data-next]');
            if (next) next.addEventListener('click', () => {
                if (answers[idx] === null) return;
                if (idx === QUESTIONS.length - 1) result();
                else { idx++; render(); }
            });
            // Fokus auf die erste Option fuer Tastaturbedienung
            const firstOpt = root.querySelector('.dt__opt');
            if (firstOpt && idx > 0) firstOpt.focus();
        }

        function result() {
            const score = {};
            Object.keys(SCHOOLS).forEach((k) => score[k] = 0);
            answers.forEach((a, i) => { if (a != null) score[QUESTIONS[i].opts[a].s]++; });
            const winner = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
            const s = SCHOOLS[winner];
            const total = QUESTIONS.length;

            const bars = Object.keys(SCHOOLS)
                .sort((a, b) => score[b] - score[a])
                .map((k) => {
                    const p = Math.round(score[k] / total * 100);
                    return '<div class="dt__bar-row' + (k === winner ? ' is-winner' : '') + '"><span>' + esc(SCHOOLS[k].name) + '</span>' +
                        '<span class="dt__bar"><span style="width:' + p + '%"></span></span>' +
                        '<span class="dt__bar-pct">' + p + '&nbsp;%</span></div>';
                }).join('');

            root.innerHTML =
                '<div class="dt dt--result">' +
                '<p class="dt__step">Deine Denkschule</p>' +
                '<h3 class="dt__result-name">' + esc(s.name) + '</h3>' +
                '<p class="dt__result-line">' + esc(s.line) + '</p>' +
                '<p class="dt__result-text">' + esc(s.text) + '</p>' +
                '<p class="dt__bars-label">Deine Übereinstimmung je Denkschule</p>' +
                '<div class="dt__bars">' + bars + '</div>' +
                '<div class="dt__nav">' +
                '<button type="button" class="btn ghost" data-again>Noch einmal</button>' +
                (opts.deeperHref ? '<a class="btn" href="' + esc(opts.deeperHref) + '">' + esc(opts.deeperLabel || 'Mehr erfahren') + '</a>' : '') +
                '</div>' +
                '</div>';
            root.querySelector('[data-again]').addEventListener('click', () => { for (let i = 0; i < answers.length; i++) answers[i] = null; idx = 0; render(); });
        }

        render();
    }

    window.DenkschuleTool = { mount };
})();
