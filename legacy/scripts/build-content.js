#!/usr/bin/env node
/**
 * Hybridlog build step (Phase 2): keeps the site "no build step to VIEW" but adds
 * one build step to KEEP CONTENT FRESH, run in CI on every push that touches content/**.
 *
 * 1) Bundles every Markdown collection (content/posts, content/themen,
 *    content/fachgebiete) into a same-origin data/<name>.json cache, so
 *    js/blog.js + plattform/js/cms-fetch.js no longer need to call the GitHub
 *    API from the browser at runtime (avoids the 60 req/h unauthenticated rate
 *    limit and makes content crawlable without waiting on client-side fetches).
 *    Both call sites still fall back to the live GitHub API if the cache file
 *    is missing/unreachable, so local file:// testing keeps working unchanged.
 * 2) Regenerates sitemap.xml with one <url> per static page + per collection
 *    entry (posts, themen, and only "active"/"public" fachgebiete).
 *
 * Zero npm dependencies on purpose (matches the project's "no build step"
 * philosophy for the site itself) — only Node's built-in `fs`/`path`.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://hybridlog.de';

const COLLECTIONS = [
    { dir: 'content/posts', out: 'data/posts.json' },
    { dir: 'content/themen', out: 'data/themen.json' },
    { dir: 'content/fachgebiete', out: 'data/fachgebiete.json' },
    { dir: 'content/wissensfragen', out: 'data/wissensfragen.json' }
];

const STATIC_PAGES = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/studienplaner.html', changefreq: 'monthly', priority: '0.9' },
    { loc: '/notizbuch.html', changefreq: 'monthly', priority: '0.9' },
    { loc: '/lernjournal.html', changefreq: 'monthly', priority: '0.9' },
    { loc: '/workoutlogbuch.html', changefreq: 'monthly', priority: '0.9' },
    { loc: '/blog.html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/impressum.html', changefreq: 'yearly', priority: '0.3' },
    { loc: '/datenschutz.html', changefreq: 'yearly', priority: '0.3' },
    { loc: '/plattform/', changefreq: 'weekly', priority: '0.8' },
    { loc: '/plattform/welt.html', changefreq: 'monthly', priority: '0.6' },
    { loc: '/plattform/suche.html', changefreq: 'monthly', priority: '0.4' },
    { loc: '/plattform/mental/philosophie/denkschule.html', changefreq: 'monthly', priority: '0.7' },
    { loc: '/tools/', changefreq: 'monthly', priority: '0.6' },
    { loc: '/tools/philosophie/', changefreq: 'monthly', priority: '0.6' },
    { loc: '/tools/blockuniversum/', changefreq: 'monthly', priority: '0.6' },
    { loc: '/human-map/', changefreq: 'monthly', priority: '0.7' },
    { loc: '/human-map/learn.html', changefreq: 'monthly', priority: '0.5' },
    { loc: '/human-map/assessment.html', changefreq: 'monthly', priority: '0.5' }
];

function listMarkdownFiles(dir) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs)
        .filter(function (name) { return /\.md$/i.test(name); })
        .sort();
}

// Minimal scalar-field reader for the frontmatter block — mirrors the simple
// line-based parser already used client-side in js/blog.js. Only handles
// simple `key: value` scalars, which is all posts/fachgebiete/themen need
// for slug/date/status/visibility. Nested blocks (e.g. themen "bloecke")
// are left untouched — the client still owns full frontmatter parsing.
function readFrontmatterField(markdown, field) {
    const match = markdown.match(new RegExp('^' + field + ':\\s*(.*)$', 'm'));
    if (!match) return '';
    return match[1].trim().replace(/^["']|["']$/g, '');
}

function buildCollectionCache(dir, outRelPath) {
    const files = listMarkdownFiles(dir);
    const entries = files.map(function (name) {
        const markdown = fs.readFileSync(path.join(ROOT, dir, name), 'utf8');
        return { name: name, markdown: markdown };
    });

    const outAbs = path.join(ROOT, outRelPath);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, JSON.stringify(entries), 'utf8');

    return entries;
}

function slugFromFile(name, markdown) {
    const explicit = readFrontmatterField(markdown, 'slug');
    return (explicit || name.replace(/\.md$/i, '')).trim();
}

function xmlEscape(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function urlEntry(loc, opts) {
    opts = opts || {};
    const lines = ['    <url>', '        <loc>' + xmlEscape(SITE_URL + loc) + '</loc>'];
    if (opts.lastmod) lines.push('        <lastmod>' + xmlEscape(opts.lastmod) + '</lastmod>');
    lines.push('        <changefreq>' + (opts.changefreq || 'monthly') + '</changefreq>');
    lines.push('        <priority>' + (opts.priority || '0.5') + '</priority>');
    lines.push('    </url>');
    return lines.join('\n');
}

function main() {
    const today = new Date().toISOString().slice(0, 10);
    const urls = STATIC_PAGES.map(function (page) {
        return urlEntry(page.loc, { lastmod: today, changefreq: page.changefreq, priority: page.priority });
    });

    let postCount = 0, themaCount = 0, gebietCount = 0, frageCount = 0;

    // Posts: one URL per blog article, lastmod from frontmatter `date`.
    const posts = buildCollectionCache('content/posts', 'data/posts.json');
    posts.forEach(function (file) {
        const slug = slugFromFile(file.name, file.markdown);
        const date = readFrontmatterField(file.markdown, 'date').slice(0, 10) || today;
        urls.push(urlEntry('/blog-artikel.html?slug=' + encodeURIComponent(slug), {
            lastmod: date, changefreq: 'monthly', priority: '0.6'
        }));
        postCount++;
    });

    // Themen: one URL per lexicon entry, no gating field in this collection.
    const themen = buildCollectionCache('content/themen', 'data/themen.json');
    themen.forEach(function (file) {
        const slug = slugFromFile(file.name, file.markdown);
        urls.push(urlEntry('/plattform/mental/thema.html?slug=' + encodeURIComponent(slug), {
            lastmod: today, changefreq: 'monthly', priority: '0.5'
        }));
        themaCount++;
    });

    // Fachgebiete: only "active" + "public" ones are reachable from the nav.
    const fachgebiete = buildCollectionCache('content/fachgebiete', 'data/fachgebiete.json');
    fachgebiete.forEach(function (file) {
        const status = readFrontmatterField(file.markdown, 'status');
        const visibility = readFrontmatterField(file.markdown, 'visibility');
        if (status !== 'active' || visibility !== 'public') return;
        const slug = slugFromFile(file.name, file.markdown);
        urls.push(urlEntry('/plattform/mental/gebiet.html?g=' + encodeURIComponent(slug), {
            lastmod: today, changefreq: 'monthly', priority: '0.6'
        }));
        gebietCount++;
    });

    // Wissensfragen: eigene, flache SEO-Zielseiten (Google/Bing-KI-Antworten),
    // keine Gating-Felder, jede Datei ist sofort oeffentlich.
    const wissensfragen = buildCollectionCache('content/wissensfragen', 'data/wissensfragen.json');
    wissensfragen.forEach(function (file) {
        const slug = slugFromFile(file.name, file.markdown);
        urls.push(urlEntry('/plattform/mental/frage.html?slug=' + encodeURIComponent(slug), {
            lastmod: today, changefreq: 'monthly', priority: '0.6'
        }));
        frageCount++;
    });

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        urls.join('\n') + '\n' +
        '</urlset>\n';
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');

    console.log(
        'Content build done: ' + posts.length + ' posts, ' + themen.length + ' themen, ' +
        fachgebiete.length + ' fachgebiete, ' + wissensfragen.length + ' wissensfragen cached. Sitemap: ' + urls.length + ' URLs (' +
        STATIC_PAGES.length + ' static, ' + postCount + ' posts, ' + themaCount + ' themen, ' +
        gebietCount + ' gebiete, ' + frageCount + ' wissensfragen).'
    );
}

main();
