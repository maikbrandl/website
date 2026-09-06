/**
 * Hybridlogs Tools – mobile Bottom-Tab-Bar (Wissen/Suche/Tools/Mehr)
 * Setzt window.TOOLS_BASE ('./' auf tools/index.html, '../' in Unterordnern
 * wie tools/blockuniversum/) vor dem Einbinden dieses Skripts.
 */
(function () {
    'use strict';

    const TOOLS_BASE = window.TOOLS_BASE || './';
    const SITE_BASE = TOOLS_BASE + '../';

    const ICONS = {
        wissen: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 2z"/></svg>',
        suche: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        tools: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"/></svg>',
        mehr: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    };

    function markup() {
        return '<nav class="bottom-nav" aria-label="Mobile Wissensraum-Navigation">' +
            '<a href="' + SITE_BASE + 'plattform/index.html" class="bottom-nav-item">' + ICONS.wissen + '<span>Wissen</span></a>' +
            '<a href="' + SITE_BASE + 'plattform/suche.html" class="bottom-nav-item">' + ICONS.suche + '<span>Suche</span></a>' +
            '<a href="' + TOOLS_BASE + 'index.html" class="bottom-nav-item active">' + ICONS.tools + '<span>Tools</span></a>' +
            '<button type="button" class="bottom-nav-item" data-mehr-toggle aria-haspopup="true" aria-expanded="false">' + ICONS.mehr + '<span>Mehr</span></button>' +
            '</nav>' +
            '<div class="mehr-overlay" data-mehr-overlay hidden>' +
            '<div class="mehr-backdrop" data-mehr-close></div>' +
            '<div class="mehr-panel">' +
            '<p class="eyebrow">Mehr</p>' +
            '<a href="' + SITE_BASE + 'index.html">Home</a>' +
            '<a href="' + SITE_BASE + 'index.html#produkte">Produkte</a>' +
            '<a href="' + SITE_BASE + 'index.html#story">Über uns</a>' +
            '<button type="button" class="mehr-close" data-mehr-close>Schließen</button>' +
            '</div>' +
            '</div>';
    }

    function init() {
        document.body.insertAdjacentHTML('beforeend', markup());
        const overlay = document.querySelector('[data-mehr-overlay]');
        const toggle = document.querySelector('[data-mehr-toggle]');
        if (!overlay || !toggle) return;

        function open() {
            overlay.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('active');
        }
        function close() {
            overlay.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('active');
        }
        toggle.addEventListener('click', function () {
            if (overlay.hidden) open(); else close();
        });
        overlay.querySelectorAll('[data-mehr-close]').forEach(function (el) {
            el.addEventListener('click', close);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) close();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
