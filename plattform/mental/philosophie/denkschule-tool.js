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
                (idx > 0 ? '<button type="button" class="btn btn--ghost btn--sm" data-back>Zurück</button>' : '<span></span>') +
                '<button type="button" class="btn btn--area btn--sm" data-next ' + (answers[idx] === null ? 'disabled' : '') + '>' +
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

            const bars = Object.keys(SCHOOLS).map((k) => {
                const p = Math.round(score[k] / total * 100);
                return '<div class="dt__bar-row"><span>' + esc(SCHOOLS[k].name) + '</span>' +
                    '<span class="dt__bar"><span style="width:' + p + '%"></span></span></div>';
            }).join('');

            root.innerHTML =
                '<div class="dt dt--result">' +
                '<p class="dt__step">Deine Denkschule</p>' +
                '<h3 class="dt__result-name">' + esc(s.name) + '</h3>' +
                '<p class="dt__result-line">' + esc(s.line) + '</p>' +
                '<p class="dt__result-text">' + esc(s.text) + '</p>' +
                '<div class="dt__bars">' + bars + '</div>' +
                '<div class="dt__nav">' +
                '<button type="button" class="btn btn--ghost btn--sm" data-again>Noch einmal</button>' +
                (opts.deeperHref ? '<a class="btn btn--area btn--sm" href="' + esc(opts.deeperHref) + '">' + esc(opts.deeperLabel || 'Mehr erfahren') + '</a>' : '') +
                '</div>' +
                '</div>';
            root.querySelector('[data-again]').addEventListener('click', () => { for (let i = 0; i < answers.length; i++) answers[i] = null; idx = 0; render(); });
        }

        render();
    }

    window.DenkschuleTool = { mount };
})();
