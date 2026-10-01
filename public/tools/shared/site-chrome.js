// Verhalten fuer Kopfzeile und mobile Leiste der Tools (Markup steht statisch im HTML).
(function () {
    'use strict';

    var wegeTrigger = document.querySelector('[data-site-wege-trigger]');
    var wegePanel = document.querySelector('[data-site-wege-panel]');
    var leiste = document.querySelector('.site-tableiste');
    var sucheTab = document.querySelector('[data-site-suche-tab]');
    var sucheBlatt = document.getElementById('site-mobil-suche');
    var sucheEingabe = sucheBlatt ? sucheBlatt.querySelector('input') : null;
    var mehr = document.querySelector('[data-site-mehr]');

    function wegeSchliessen() {
        if (!wegeTrigger || !wegePanel) return;
        wegeTrigger.setAttribute('aria-expanded', 'false');
        wegePanel.hidden = true;
    }

    function sucheSchliessen() {
        if (!sucheBlatt || sucheBlatt.hidden) return;
        sucheBlatt.hidden = true;
        if (sucheTab) sucheTab.setAttribute('aria-expanded', 'false');
    }

    if (wegeTrigger && wegePanel) {
        wegeTrigger.addEventListener('click', function () {
            if (wegeTrigger.getAttribute('aria-expanded') === 'true') {
                wegeSchliessen();
            } else {
                wegeTrigger.setAttribute('aria-expanded', 'true');
                wegePanel.hidden = false;
            }
        });
    }

    if (sucheTab && sucheBlatt && sucheEingabe) {
        sucheTab.addEventListener('click', function (ev) {
            ev.preventDefault();
            if (mehr) mehr.open = false;
            if (!sucheBlatt.hidden) {
                sucheSchliessen();
                return;
            }
            sucheBlatt.hidden = false;
            sucheTab.setAttribute('aria-expanded', 'true');
            // Fokus noch im Klick setzen, sonst oeffnet iOS die Tastatur nicht.
            sucheEingabe.focus();
        });
    }

    if (mehr) {
        mehr.addEventListener('toggle', function () {
            if (mehr.open) sucheSchliessen();
        });
    }

    document.addEventListener('click', function (ev) {
        if (wegeTrigger && wegePanel && !wegeTrigger.contains(ev.target) && !wegePanel.contains(ev.target)) wegeSchliessen();
        if (leiste && leiste.contains(ev.target)) return;
        sucheSchliessen();
        if (mehr) mehr.open = false;
    });

    document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Escape') return;
        wegeSchliessen();
        sucheSchliessen();
        if (mehr) mehr.open = false;
    });
})();
