/**
 * Hybridlogs – Component System
 * Shared UI components rendered via JS to eliminate duplication.
 * Each page only defines its own content; header, footer, cookie banner
 * are injected once from here.
 */

const HybridlogsComponents = (() => {

    // ——— Configuration ———
    const CONFIG = {
        siteName: 'Hybridlogs',
        instagram: 'https://www.instagram.com/hybridlogjournals/',
        year: new Date().getFullYear(),
    };

    const NAV_ITEMS = [
        { label: 'Home', href: 'index.html', id: 'home' },
        {
            label: 'Produkte', href: 'index.html#produkte', id: 'produkte',
            children: [
                { label: 'Studienplaner', href: 'studienplaner.html', id: 'studienplaner' },
                { label: 'Schul-Notizbuch', href: 'notizbuch.html', id: 'notizbuch' },
                { label: 'Lernjournal', href: 'lernjournal.html', id: 'lernjournal' },
            ]
        },
        { label: 'Blog', href: 'blog.html', id: 'blog' },
        { label: 'Über uns', href: 'index.html#story', id: 'about' },
    ];

    const FOOTER_PRODUCTS = [
        { label: 'Studienplaner', href: 'studienplaner.html' },
        { label: 'Schul-Notizbuch', href: 'notizbuch.html' },
        { label: 'Lernjournal', href: 'lernjournal.html' },
    ];

    const FOOTER_LEGAL = [
        { label: 'Impressum', href: 'impressum.html' },
        { label: 'Datenschutzerklärung', href: 'datenschutz.html' },
    ];

    // ——— SVG Icons ———
    const ICONS = {
        menu: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
        close: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        chevronDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
        check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
        arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
        book: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        target: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
        sparkles: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/></svg>`,
        layout: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
        instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
        cookie: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>`,
        shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
        calendar: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        clipboardCheck: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h-2a3 3 0 1 0-4 0H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M9 14l2 2 4-4"/></svg>`,
        globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    };

    // ——— Helpers ———
    function getPageId() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path.replace('.html', '');
    }

    function icon(name, className = '') {
        return `<span class="icon ${className}" aria-hidden="true">${ICONS[name] || ''}</span>`;
    }

    // ——— Header ———
    function renderHeader() {
        const pageId = getPageId();
        const isProductPage = ['studienplaner', 'notizbuch', 'lernjournal'].includes(pageId);

        const navLinksHTML = NAV_ITEMS.map(item => {
            const isActive = item.id === pageId || (item.id === 'home' && pageId === 'index');
            const isProductDropdown = item.children && isProductPage;

            if (item.children) {
                const childrenHTML = item.children.map(child => {
                    const childActive = child.id === pageId;
                    return `<li><a href="${child.href}" ${childActive ? 'class="active"' : ''}>${child.label}</a></li>`;
                }).join('');

                return `
                    <li class="dropdown">
                        <a href="${item.href}" class="dropdown-toggle ${isProductDropdown ? 'active' : ''}">${item.label} ${icon('chevronDown', 'chevron')}</a>
                        <ul class="dropdown-menu">${childrenHTML}</ul>
                    </li>`;
            }

            return `<li><a href="${item.href}" ${isActive ? 'class="active"' : ''}>${item.label}</a></li>`;
        }).join('');

        return `
        <header class="site-header" id="siteHeader">
            <nav class="navbar container">
                <a href="index.html" class="logo" aria-label="Hybridlogs – Startseite">
                    <img src="images/Logo/Logo.png" alt="Hybridlogs" class="logo-img">
                    <span class="logo-text">Hybridlogs</span>
                </a>
                <button class="nav-toggle" id="navToggle" aria-label="Navigation umschalten" aria-expanded="false">
                    <span class="nav-toggle-icon" id="navToggleIcon">${ICONS.menu}</span>
                </button>
                <div class="nav-overlay" id="navOverlay"></div>
                <ul class="nav-links" id="navLinks">${navLinksHTML}</ul>
            </nav>
        </header>`;
    }

    // ——— Footer ———
    function renderFooter() {
        const productsHTML = FOOTER_PRODUCTS.map(p => `<li><a href="${p.href}">${p.label}</a></li>`).join('');
        const legalHTML = FOOTER_LEGAL.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('');

        return `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-top">
                    <div class="footer-brand">
                        <a href="index.html" class="footer-logo">
                            <img src="images/Logo/Logo.png" alt="Hybridlogs" class="logo-img" style="height:32px;margin-bottom:var(--space-2)">
                            Hybridlogs
                        </a>
                        <p>Journals für Klarheit und Erfolg in Schule, Studium und Weiterbildung.</p>
                        <div class="footer-social">
                            <a href="${CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
                        </div>
                    </div>
                    <div class="footer-links">
                        <div class="footer-col">
                            <h4>Produkte</h4>
                            <ul>${productsHTML}</ul>
                        </div>
                        <div class="footer-col">
                            <h4>Rechtliches</h4>
                            <ul>${legalHTML}</ul>
                        </div>
                        <div class="footer-col">
                            <h4>Links</h4>
                            <ul>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${CONFIG.year} ${CONFIG.siteName}. Alle Rechte vorbehalten.</p>
                </div>
            </div>
        </footer>`;
    }


    // ——— Stars (for ratings) ———
    function renderStars(count = 5) {
        return `<div class="stars" aria-label="${count} von 5 Sternen">${ICONS.star.repeat(count)}</div>`;
    }

    // ——— Public Init ———
    function init() {
        // Inject header
        const headerSlot = document.getElementById('header-slot');
        if (headerSlot) headerSlot.outerHTML = renderHeader();

        // Inject footer
        const footerSlot = document.getElementById('footer-slot');
        if (footerSlot) footerSlot.outerHTML = renderFooter();

        // Inject cookie banner
        const cookieSlot = document.getElementById('cookie-slot');
        if (cookieSlot) cookieSlot.outerHTML = renderCookieBanner();
    }

    return { init, icon, renderStars, ICONS };
})();

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    HybridlogsComponents.init();

    // Dispatch custom event so main.js knows components are ready
    document.dispatchEvent(new CustomEvent('components:ready'));
});
