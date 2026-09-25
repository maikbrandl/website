// tools/shared/nav.js
// Simple navigation helper for the Tools section.
// Provides utility functions; actual nav markup is inline in each page.

window.ToolsNav = {
    // Scroll smoothly to a section by id
    scrollTo: function (id) {
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
