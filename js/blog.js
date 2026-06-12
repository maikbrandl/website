(function () {
    const DEFAULT_CMS_SOURCE = {
        owner: 'maikbrandl',
        repo: 'website',
        branch: 'master',
        folder: 'content/posts'
    };

    function cmsSource() {
        const cfg = window.HybridlogsCmsSource || {};
        return {
            owner: cfg.owner || DEFAULT_CMS_SOURCE.owner,
            repo: cfg.repo || DEFAULT_CMS_SOURCE.repo,
            branch: cfg.branch || DEFAULT_CMS_SOURCE.branch,
            folder: cfg.folder || DEFAULT_CMS_SOURCE.folder
        };
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(isoDate) {
        const parsed = new Date(isoDate);
        if (Number.isNaN(parsed.getTime())) return isoDate;

        return new Intl.DateTimeFormat('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(parsed);
    }

    function postUrl(slug) {
        return 'blog-artikel.html?slug=' + encodeURIComponent(slug);
    }

    function readingTimeMarkup(value) {
        return '<span class="reading-time"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + escapeHtml(value) + '</span>';
    }

    function inlineMarkdownToHtml(text) {
        // Extract images and links before HTML escaping to preserve URL integrity
        const tokens = [];
        // Images first (must come before links since syntax overlaps)
        const withPlaceholders = text
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(m, alt, src) {
                const i = tokens.length;
                tokens.push({ type: 'img', alt: alt, src: src });
                return '\x02TOKEN' + i + '\x03';
            })
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, linkText, href) {
                const i = tokens.length;
                tokens.push({ type: 'a', text: linkText, href: href });
                return '\x02TOKEN' + i + '\x03';
            });

        let html = escapeHtml(withPlaceholders);
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // Re-insert tokens
        html = html.replace(/\x02TOKEN(\d+)\x03/g, function(m, idx) {
            const token = tokens[parseInt(idx, 10)];
            if (!token) return '';
            if (token.type === 'img') {
                const safeSrc = token.src.replace(/"/g, '%22');
                return '<img src="' + safeSrc + '" alt="' + escapeHtml(token.alt) + '" loading="lazy" decoding="async" class="prose-img">';
            }
            const isExternal = /^https?:\/\//.test(token.href);
            const safeHref = token.href.replace(/"/g, '%22');
            return '<a href="' + safeHref + '"' + (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + escapeHtml(token.text) + '</a>';
        });
        return html;
    }

    function markdownToHtml(markdown) {
        const normalized = String(markdown || '').replace(/\r\n?/g, '\n').trim();
        if (!normalized) return '';

        const blocks = normalized.split(/\n\s*\n/);

        return blocks.map(function (block) {
            const lines = block.split('\n').map(function (line) { return line.trim(); }).filter(Boolean);
            if (!lines.length) return '';

            if (lines.every(function (line) { return /^-\s+/.test(line); })) {
                const items = lines.map(function (line) {
                    return '<li>' + inlineMarkdownToHtml(line.replace(/^-\s+/, '')) + '</li>';
                }).join('');
                return '<ul>' + items + '</ul>';
            }

            const first = lines[0];
            if (/^###\s+/.test(first)) return '<h3>' + inlineMarkdownToHtml(first.replace(/^###\s+/, '')) + '</h3>';
            if (/^##\s+/.test(first)) return '<h2>' + inlineMarkdownToHtml(first.replace(/^##\s+/, '')) + '</h2>';
            if (/^#\s+/.test(first)) return '<h1>' + inlineMarkdownToHtml(first.replace(/^#\s+/, '')) + '</h1>';

            // Standalone image block
            if (lines.length === 1 && /^!\[/.test(first)) {
                return '<figure class="prose-figure">' + inlineMarkdownToHtml(first) + '</figure>';
            }

            return '<p>' + lines.map(inlineMarkdownToHtml).join('<br>') + '</p>';
        }).join('');
    }

    function markdownToPlain(markdown) {
        return String(markdown || '')
            .replace(/\r\n?/g, '\n')
            .replace(/^---[\s\S]*?---\s*/m, '')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
            .replace(/^#+\s+/gm, '')
            .replace(/^[-*+]\s+/gm, '')
            .replace(/[>*_~]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function estimateReadingTime(text) {
        const words = String(text || '').split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return minutes + ' Min.';
    }

    function parseFrontmatter(markdown) {
        const text = String(markdown || '').replace(/\r\n?/g, '\n');
        if (!text.startsWith('---\n')) return { data: {}, body: text };

        const end = text.indexOf('\n---\n', 4);
        if (end === -1) return { data: {}, body: text };

        const raw = text.slice(4, end);
        const body = text.slice(end + 5).trim();
        const data = {};
        let lastKey = null;

        raw.split('\n').forEach(function (line) {
            // Continuation line (indented) – append to last key
            if (lastKey && /^\s+/.test(line)) {
                data[lastKey] = (data[lastKey] + ' ' + line.trim()).trim();
                return;
            }
            const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
            if (!match) { lastKey = null; return; }
            lastKey = match[1].trim();
            let value = match[2].trim();
            value = value.replace(/^['"]|['"]$/g, '');
            data[lastKey] = value;
        });

        return { data: data, body: body };
    }

    function normalizeImagePath(path) {
        if (!path) return '';
        if (/^https?:\/\//.test(path)) return path;
        return path.charAt(0) === '/' ? path : '/' + path;
    }

    function normalizeMarkdownPost(file, markdown) {
        const parsed = parseFrontmatter(markdown);
        const meta = parsed.data;
        const body = parsed.body;
        const plainBody = markdownToPlain(body);
        const slug = (meta.slug || file.name.replace(/\.md$/i, '')).trim();

        return {
            slug: slug,
            title: meta.title || slug,
            date: meta.date || new Date().toISOString().slice(0, 10),
            category: meta.category || 'Blog',
            readingTime: meta.readingTime || estimateReadingTime(plainBody),
            image: normalizeImagePath(meta.cover || meta.image || ''),
            imageAlt: meta.imageAlt || meta.title || slug,
            excerpt: meta.excerpt || plainBody.slice(0, 180),
            content: plainBody ? [plainBody] : [],
            htmlContent: markdownToHtml(body),
            relatedPostSlug: meta.related_post_slug || '',
            relatedPostTitle: meta.related_post_title || '',
            relatedPostExcerpt: meta.related_post_excerpt || ''
        };
    }

    async function fetchMarkdownFiles() {
        const source = cmsSource();
        const listUrl = 'https://api.github.com/repos/' + encodeURIComponent(source.owner) + '/' + encodeURIComponent(source.repo) + '/contents/' + source.folder + '?ref=' + encodeURIComponent(source.branch);
        const listRes = await fetch(listUrl, { headers: { 'Accept': 'application/vnd.github+json' } });
        if (!listRes.ok) throw new Error('Cannot list posts: ' + listRes.status);

        const files = await listRes.json();
        const markdownFiles = Array.isArray(files)
            ? files.filter(function (item) {
                return item && item.type === 'file' && /\.md$/i.test(item.name) && item.download_url;
            })
            : [];

        const posts = await Promise.all(markdownFiles.map(async function (file) {
            const res = await fetch(file.download_url);
            if (!res.ok) return null;
            const markdown = await res.text();
            return normalizeMarkdownPost(file, markdown);
        }));

        return posts.filter(Boolean);
    }

    function getStaticPosts() {
        return Array.isArray(window.HybridlogsBlogPosts) ? window.HybridlogsBlogPosts : [];
    }

    async function getPosts() {
        const staticPosts = getStaticPosts();
        let markdownPosts = [];

        try {
            markdownPosts = await fetchMarkdownFiles();
        } catch (error) {
            console.warn('Markdown posts could not be loaded, using static fallback.', error);
        }

        const postMap = new Map();
        staticPosts.forEach(function (post) {
            postMap.set(post.slug, post);
        });
        markdownPosts.forEach(function (post) {
            postMap.set(post.slug, post);
        });

        return Array.from(postMap.values()).sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }

    function buildCard(post) {
        const imageHtml = post.image
            ? '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.imageAlt || post.title) + '" loading="lazy" decoding="async">'
            : '<div class="blog-card-placeholder"><span>Bild folgt</span></div>';

        return [
            '<article class="blog-card" data-category="' + escapeHtml(post.category || 'Blog') + '">',
            '<a class="blog-card-link" href="' + postUrl(post.slug) + '" aria-label="' + escapeHtml(post.title) + ' lesen">',
            '<div class="blog-card-image">' + imageHtml + '</div>',
            '<div class="blog-card-body">',
            '<span class="blog-date">' + escapeHtml(formatDate(post.date)) + ' · ' + escapeHtml(post.category || 'Blog') + '</span>',
            readingTimeMarkup(post.readingTime || ''),
            '<h2>' + escapeHtml(post.title) + '</h2>',
            '<p>' + escapeHtml(post.excerpt || '') + '</p>',
            '<span class="read-more">Weiterlesen',
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
            '</span>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function initBlogList(posts) {
        const blogGrid = document.getElementById('blogGrid');
        const tagsWrap = document.getElementById('blogCategoryTags');
        const emptyState = document.getElementById('blogEmptyState');
        if (!blogGrid || !tagsWrap) return;

        const categories = Array.from(new Set(posts.map(function (post) {
            return post.category || 'Blog';
        }))).sort();
        const allCategories = ['Alle'].concat(categories);
        let activeCategory = 'Alle';

        function renderTags() {
            tagsWrap.innerHTML = allCategories.map(function (category) {
                const activeClass = category === activeCategory ? ' active' : '';
                return '<button class="tag' + activeClass + '" type="button" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>';
            }).join('');

            tagsWrap.querySelectorAll('[data-category]').forEach(function (button) {
                button.addEventListener('click', function () {
                    activeCategory = button.getAttribute('data-category') || 'Alle';
                    renderTags();
                    renderCards();
                });
            });
        }

        function renderCards() {
            const visiblePosts = activeCategory === 'Alle'
                ? posts
                : posts.filter(function (post) { return (post.category || 'Blog') === activeCategory; });

            blogGrid.innerHTML = visiblePosts.map(buildCard).join('');
            if (emptyState) emptyState.hidden = visiblePosts.length > 0;
        }

        renderTags();
        renderCards();
    }

    function findPostBySlug(posts, slug) {
        return posts.find(function (post) { return post.slug === slug; });
    }

    function getSlugFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug') || '';
    }

    function buildMeta(post) {
        return escapeHtml(formatDate(post.date)) + ' · ' + escapeHtml(post.category || 'Blog') + ' · ' + readingTimeMarkup(post.readingTime || '');
    }

    function renderPostContent(target, post) {
        if (post.htmlContent) {
            target.innerHTML = post.htmlContent;
            return;
        }

        const parts = Array.isArray(post.content) ? post.content : [];
        target.innerHTML = parts.map(function (paragraph) {
            return '<p>' + escapeHtml(paragraph) + '</p>';
        }).join('');
    }

    function initBlogDetail(posts) {
        const postNode = document.getElementById('blogPost');
        const notFoundNode = document.getElementById('blogPostNotFound');
        const titleNode = document.getElementById('blogPostTitle');
        const breadcrumbNode = document.getElementById('blogBreadcrumbTitle');
        const metaNode = document.getElementById('blogPostMeta');
        const categoryNode = document.getElementById('blogPostCategory');
        const excerptNode = document.getElementById('blogPostExcerpt');
        const contentNode = document.getElementById('blogPostContent');
        const imageWrapNode = document.getElementById('blogPostImageWrap');
        const imageNode = document.getElementById('blogPostImage');

        if (!postNode || !titleNode || !contentNode) return;

        const slug = getSlugFromQuery();
        const post = findPostBySlug(posts, slug);

        if (!post) {
            postNode.hidden = true;
            if (notFoundNode) notFoundNode.hidden = false;
            document.title = 'Artikel nicht gefunden - Hybridlogs';
            return;
        }

        postNode.hidden = false;
        titleNode.textContent = post.title;
        if (breadcrumbNode) breadcrumbNode.textContent = post.title;
        if (categoryNode) categoryNode.textContent = post.category || 'Blog';
        if (excerptNode) excerptNode.textContent = post.excerpt || '';
        if (metaNode) metaNode.innerHTML = buildMeta(post);

        if (post.image && imageWrapNode && imageNode) {
            imageNode.src = post.image;
            imageNode.alt = post.imageAlt || post.title;
            imageWrapNode.hidden = false;
        }

        renderPostContent(contentNode, post);
        document.title = post.title + ' - Hybridlogs Blog';

        const description = document.querySelector('meta[name="description"]');
        if (description && post.excerpt) {
            description.setAttribute('content', post.excerpt);
        }

        // Related post CTA
        if (post.relatedPostSlug) {
            const related = findPostBySlug(posts, post.relatedPostSlug);
            const relatedWrap = document.getElementById('relatedPostWrap');
            if (related && relatedWrap) {
                const title = post.relatedPostTitle || related.title;
                const excerpt = post.relatedPostExcerpt || related.excerpt || '';
                const category = related.category || 'Blog';
                const imgHtml = related.image
                    ? '<img src="' + escapeHtml(related.image) + '" alt="' + escapeHtml(title) + '" loading="lazy" decoding="async">'
                    : '<div class="related-post-img-placeholder"></div>';

                relatedWrap.innerHTML =
                    '<a href="' + postUrl(related.slug) + '" class="related-post-card">' +
                    '<div class="related-post-img">' + imgHtml + '</div>' +
                    '<div class="related-post-body">' +
                    '<span class="related-post-label">Weiterlesen</span>' +
                    '<span class="related-post-category">' + escapeHtml(category) + '</span>' +
                    '<h3>' + escapeHtml(title) + '</h3>' +
                    (excerpt ? '<p>' + escapeHtml(excerpt.slice(0, 140)) + (excerpt.length > 140 ? '…' : '') + '</p>' : '') +
                    '<span class="read-more">Artikel lesen <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>' +
                    '</div>' +
                    '</a>';
                relatedWrap.hidden = false;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', async function () {
        const posts = await getPosts();
        initBlogList(posts);
        initBlogDetail(posts);
    });
})();

