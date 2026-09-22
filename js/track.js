/**
 * Hybridlog – zentrale Event-Erfassung (Klicks auf [data-track]).
 *
 * Hintergrund: Cloudflare Web Analytics (unser gewaehltes Analytics-Tool)
 * unterstuetzt aktuell KEINE Custom Events, nur Pageviews/Performance
 * (Stand Cloudflare-FAQ: "Does Web Analytics support custom events? Not
 * yet, but we may add support for this in the future."). Damit die im
 * Markup bereits gesetzten data-track-Attribute (Tool-Start, Klick
 * verwandtes Thema, Klick Journal, Klick Affiliate, ...) nicht verloren
 * gehen, sammelt dieses kleine Skript sie zentral und loggt sie strukturiert.
 * Sobald ein Tool mit Custom-Event-Support angebunden wird (z.B. Plausible),
 * muss nur die track()-Funktion unten erweitert werden, das Markup bleibt
 * unveraendert.
 */
(function () {
    'use strict';

    function track(name, meta) {
        if (window.console && console.debug) {
            console.debug('[hybridlog:event]', name, meta || {});
        }
        // TODO: sobald ein Analytics-Tool mit Custom-Event-Support aktiv ist,
        // hier den entsprechenden Aufruf ergaenzen (z.B. plausible(name, {props: meta})).
    }

    document.addEventListener('click', function (e) {
        const el = e.target.closest('[data-track]');
        if (!el) return;
        track(el.getAttribute('data-track'), {
            href: el.getAttribute('href') || null,
            text: (el.textContent || '').trim().slice(0, 80),
        });
    });

    window.HLTrack = track;
})();
