/**
 * Hybridlog Plattform – CMS-Fetch (Decap/GitHub, vanilla)
 * Holt Markdown-Collections (Fachgebiete, Themen) zur Laufzeit von GitHub,
 * analog zu js/blog.js, aber mit echtem YAML-Parser (js-yaml) fuer verschachtelte
 * Bloecke/Listen im Frontmatter. Kein Build-Schritt.
 * window.HLCms = { fetchCollection }
 */
(function () {
    'use strict';

    const DEFAULT_SOURCE = { owner: 'maikbrandl', repo: 'website', branch: 'master' };
    const CACHE_TTL_MS = 10 * 60 * 1000;

    function cmsSource() {
        const cfg = window.HybridlogsCmsSource || {};
        return {
            owner: cfg.owner || DEFAULT_SOURCE.owner,
            repo: cfg.repo || DEFAULT_SOURCE.repo,
            branch: cfg.branch || DEFAULT_SOURCE.branch,
        };
    }

    function parseFrontmatter(markdown) {
        const text = String(markdown || '').replace(/\r\n?/g, '\n');
        if (!text.startsWith('---\n')) return { data: {}, body: text };
        const end = text.indexOf('\n---\n', 4);
        if (end === -1) return { data: {}, body: text };
        const raw = text.slice(4, end);
        const body = text.slice(end + 5).trim();
        let data = {};
        try {
            data = (window.jsyaml && window.jsyaml.load(raw)) || {};
        } catch (e) {
            console.error('CMS: YAML-Frontmatter konnte nicht geparst werden', e);
            data = {};
        }
        return { data: data, body: body };
    }

    function cacheGet(key) {
        try {
            const raw = sessionStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || (Date.now() - parsed.t) > CACHE_TTL_MS) return null;
            return parsed.v;
        } catch (e) { return null; }
    }

    function cacheSet(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
        } catch (e) { /* Speicher voll oder deaktiviert, dann eben ohne Cache */ }
    }

    // Holt alle .md Dateien eines Ordners, parst Frontmatter zu Objekten.
    // Jeder Eintrag traegt zusaetzlich `slug` (Dateiname ohne .md, falls kein
    // eigener slug im Frontmatter steht) und `_body` (Markdown-Rumpf).
    async function fetchCollection(folder) {
        const cacheKey = 'hl_cms_v1_' + folder;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;

        const source = cmsSource();
        const listUrl = 'https://api.github.com/repos/' + encodeURIComponent(source.owner) + '/' +
            encodeURIComponent(source.repo) + '/contents/' + folder + '?ref=' + encodeURIComponent(source.branch);
        const listRes = await fetch(listUrl, { headers: { 'Accept': 'application/vnd.github+json' } });
        if (!listRes.ok) throw new Error('CMS: Ordner konnte nicht gelistet werden (' + folder + '): ' + listRes.status);

        const files = await listRes.json();
        const markdownFiles = Array.isArray(files)
            ? files.filter(function (item) { return item && item.type === 'file' && /\.md$/i.test(item.name) && item.download_url; })
            : [];

        const items = await Promise.all(markdownFiles.map(async function (file) {
            const res = await fetch(file.download_url);
            if (!res.ok) return null;
            const markdown = await res.text();
            const parsed = parseFrontmatter(markdown);
            const slug = (parsed.data.slug || file.name.replace(/\.md$/i, '')).trim();
            return Object.assign({}, parsed.data, { slug: slug, _body: parsed.body });
        }));

        const result = items.filter(Boolean);
        cacheSet(cacheKey, result);
        return result;
    }

    window.HLCms = { fetchCollection };
})();
