/**
 * Hybridlog Plattform – Theme (Prompt 1)
 * Setzt data-theme am root, merkt die Wahl in localStorage (try/catch).
 * Standard folgt prefers-color-scheme (kein data-theme gesetzt).
 *
 * Die fruehe Anwendung (gegen FOUC) passiert inline im <head> jeder Seite:
 *   (function(){try{var t=localStorage.getItem('hl-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
 */
(function () {
    'use strict';

    const KEY = 'hl-theme';
    const root = document.documentElement;

    function stored() {
        try {
            return localStorage.getItem(KEY);
        } catch (e) {
            return null;
        }
    }

    function save(value) {
        try {
            if (value) localStorage.setItem(KEY, value);
            else localStorage.removeItem(KEY);
        } catch (e) {
            /* localStorage nicht verfuegbar – kein Problem, Theme bleibt fuer die Sitzung */
        }
    }

    function prefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function currentIsDark() {
        const explicit = root.getAttribute('data-theme');
        if (explicit === 'dark') return true;
        if (explicit === 'light') return false;
        return prefersDark();
    }

    function apply(theme) {
        if (theme === 'dark' || theme === 'light') {
            root.setAttribute('data-theme', theme);
        } else {
            root.removeAttribute('data-theme');
        }
    }

    function toggle() {
        const next = currentIsDark() ? 'light' : 'dark';
        apply(next);
        save(next);
        updateButtons();
    }

    function updateButtons() {
        const dark = currentIsDark();
        document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(dark));
            btn.setAttribute('aria-label', dark ? 'Zu hellem Design wechseln' : 'Zu dunklem Design wechseln');
        });
    }

    function markup() {
        return '<button type="button" class="iconbtn" data-theme-toggle aria-label="Theme wechseln">◐</button>';
    }

    // Einen Toggle-Button verdrahten, genau einmal (idempotent).
    function attach(btn) {
        if (!btn || btn.dataset.themeWired) return;
        btn.dataset.themeWired = '1';
        if (!btn.textContent.trim()) btn.textContent = '◐';
        btn.addEventListener('click', toggle);
        updateButtons();
    }

    function init() {
        // Persistierte Wahl anwenden (falls inline-Script sie nicht schon gesetzt hat)
        const t = stored();
        if (t) apply(t);

        document.querySelectorAll('[data-theme-toggle]').forEach(attach);

        // Auf Systemwechsel reagieren, solange keine explizite Wahl getroffen wurde
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (!stored()) updateButtons();
            });
        }

        updateButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.HLTheme = { toggle, apply, markup, attach, updateButtons, currentIsDark };
})();
