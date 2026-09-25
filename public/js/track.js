/**
 * Hybridlog: zentrale Event Erfassung (Klicks auf [data-track]).
 * Sendet an Umami, sobald das Umami Skript geladen ist.
 */
(function () {
    'use strict';

    function track(name, meta) {
        if (window.console && console.debug) {
            console.debug('[hybridlog:event]', name, meta || {});
        }
        if (window.umami && typeof window.umami.track === 'function') {
            window.umami.track(name, meta || {});
        }
    }

    document.addEventListener('click', function (e) {
        const el = e.target.closest('[data-track]');
        if (!el) return;
        const meta = {};
        if (el.getAttribute('data-produkt')) meta.produkt = el.getAttribute('data-produkt');
        if (el.getAttribute('href')) meta.ziel = el.getAttribute('href').slice(0, 200);
        track(el.getAttribute('data-track'), meta);
    });

    window.HLTrack = track;
})();
