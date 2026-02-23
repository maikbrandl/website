/**
 * Hybridlogs – Main JavaScript
 * Interactions, animations, and behavior.
 * Waits for components:ready event before binding.
 */

document.addEventListener('components:ready', () => {

    // ===== Mobile Navigation =====
    const navToggle = document.getElementById('navToggle');
    const navToggleIcon = document.getElementById('navToggleIcon');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    function openNav() {
        navLinks.classList.add('open');
        navOverlay.classList.add('visible');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggleIcon.innerHTML = HybridlogsComponents.ICONS.close;
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        navLinks.classList.remove('open');
        navOverlay.classList.remove('visible');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggleIcon.innerHTML = HybridlogsComponents.ICONS.menu;
        document.body.style.overflow = '';
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.contains('open') ? closeNav() : openNav();
        });
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });
    }

    // ===== Dropdown (Touch / Mobile) =====
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });

    // ===== Scroll Animations =====
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
        const animObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    animObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -80px 0px',
            threshold: 0.05
        });

        animatedElements.forEach(el => animObserver.observe(el));
    }

    // ===== Stagger children animation =====
    const staggerContainers = document.querySelectorAll('[data-stagger]');
    if (staggerContainers.length > 0 && 'IntersectionObserver' in window) {
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const children = entry.target.children;
                    Array.from(children).forEach((child, i) => {
                        child.style.transitionDelay = `${i * 0.1}s`;
                        child.classList.add('is-visible');
                    });
                    staggerObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -60px 0px',
            threshold: 0.05
        });

        staggerContainers.forEach(el => staggerObserver.observe(el));
    }

    // ===== Header behavior =====
    const header = document.getElementById('siteHeader');
    if (header) {
        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScroll = window.scrollY;

                    // Add shadow after scrolling
                    header.classList.toggle('scrolled', currentScroll > 50);

                    // Hide/show on scroll direction
                    if (currentScroll > 300) {
                        header.classList.toggle('header-hidden', currentScroll > lastScroll);
                    } else {
                        header.classList.remove('header-hidden');
                    }

                    lastScroll = currentScroll;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ===== Smooth scroll for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerH = document.getElementById('siteHeader')?.offsetHeight || 0;
                    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 24;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            } catch (err) {
                // Invalid selector, ignore
            }
        });
    });

    // ===== Image Gallery + Lightbox (for product pages) =====
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    const galleryMain = document.querySelector('.gallery-main-img');
    const galleryMainWrap = document.querySelector('.gallery-main');

    // Collect all image sources for lightbox navigation
    const gallerySources = [];
    galleryThumbs.forEach(thumb => {
        gallerySources.push({ src: thumb.dataset.src, alt: thumb.dataset.alt || '' });
    });

    let currentIndex = 0;

    // Thumbnail click → only swap main image (no lightbox)
    if (galleryThumbs.length > 0 && galleryMain) {
        galleryThumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                galleryThumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                galleryMain.src = thumb.dataset.src;
                galleryMain.alt = thumb.dataset.alt || '';
                currentIndex = index;
            });
        });
    }

    // --- Lightbox (minimal robust implementation) ---
    let overlay = null;
    let lbImage = null;
    let lbInfo = null;
    let lbStatus = null;
    let lockedScrollY = 0;

    function buildLightbox() {
        if (overlay) return;

        // Create overlay
        overlay = document.createElement('div');
        overlay.style.cssText = 'display:none;position:fixed;inset:0;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;z-index:999999;background:rgba(0,0,0,0.9);align-items:center;justify-content:center;cursor:zoom-out;';
        overlay.style.setProperty('position', 'fixed', 'important');
        overlay.style.setProperty('inset', '0', 'important');
        overlay.style.setProperty('top', '0', 'important');
        overlay.style.setProperty('left', '0', 'important');
        overlay.style.setProperty('right', '0', 'important');
        overlay.style.setProperty('bottom', '0', 'important');
        overlay.style.setProperty('width', '100vw', 'important');
        overlay.style.setProperty('height', '100vh', 'important');
        overlay.style.setProperty('z-index', '2147483647', 'important');

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'Schließen');
        closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
        closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.setAttribute('aria-label', 'Vorheriges Bild');
        prevBtn.style.cssText = 'position:absolute;top:50%;left:20px;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
        prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.setAttribute('aria-label', 'Nächstes Bild');
        nextBtn.style.cssText = 'position:absolute;top:50%;right:20px;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);color:#fff;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
        nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';

        // Real image renderer with absolute URL
        lbImage = document.createElement('img');
        lbImage.setAttribute('role', 'img');
        lbImage.style.cssText = 'display:block;max-width:88vw;max-height:88vh;width:auto;height:auto;object-fit:contain;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.55);background:#111;cursor:default;opacity:1;visibility:visible;position:relative;z-index:5;';
        lbImage.style.setProperty('opacity', '1', 'important');
        lbImage.style.setProperty('visibility', 'visible', 'important');
        lbImage.style.setProperty('filter', 'none', 'important');
        lbImage.style.setProperty('mix-blend-mode', 'normal', 'important');
        lbImage.style.setProperty('transform', 'none', 'important');
        lbImage.style.setProperty('isolation', 'isolate', 'important');

        overlay.style.setProperty('filter', 'none', 'important');
        overlay.style.setProperty('mix-blend-mode', 'normal', 'important');
        overlay.style.setProperty('isolation', 'isolate', 'important');

        // Counter
        lbInfo = document.createElement('span');
        lbInfo.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:14px;color:rgba(255,255,255,0.65);font-weight:500;z-index:10;';

        lbStatus = document.createElement('div');
        lbStatus.style.cssText = 'position:absolute;bottom:52px;left:50%;transform:translateX(-50%);font-size:13px;color:#fff;background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:8px;z-index:11;display:none;';

        // Assemble
        overlay.appendChild(closeBtn);
        overlay.appendChild(prevBtn);
        overlay.appendChild(lbImage);
        overlay.appendChild(nextBtn);
        overlay.appendChild(lbInfo);
        overlay.appendChild(lbStatus);
        document.documentElement.appendChild(overlay);

        // Events
        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLB(); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navLB(-1); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navLB(1); });
        lbImage.addEventListener('click', (e) => { e.stopPropagation(); });
        overlay.addEventListener('click', closeLB);

        document.addEventListener('keydown', (e) => {
            if (!overlay || overlay.style.display === 'none') return;
            if (e.key === 'Escape') closeLB();
            if (e.key === 'ArrowLeft') navLB(-1);
            if (e.key === 'ArrowRight') navLB(1);
        });

        window.addEventListener('resize', () => {
            if (!overlay || overlay.style.display === 'none' || gallerySources.length === 0) return;
            renderLightboxImage(gallerySources[currentIndex].src, gallerySources[currentIndex].alt || 'Produktbild');
        });
    }

    function renderLightboxImage(src, alt) {
        lbStatus.style.display = 'none';
        const absoluteSrc = new URL(src, window.location.href).href;

        lbImage.onload = () => {
            lbStatus.style.display = 'none';
        };

        lbImage.onerror = () => {
            lbStatus.textContent = `Fehler beim Laden: ${absoluteSrc}`;
            lbStatus.style.display = 'block';
        };

        lbImage.src = absoluteSrc;
        lbImage.alt = alt || 'Produktbild';
    }

    function openLB(index) {
        buildLightbox();
        currentIndex = index;
        const src = gallerySources[currentIndex].src;
        renderLightboxImage(src, gallerySources[currentIndex].alt || 'Produktbild');
        lbInfo.textContent = (currentIndex + 1) + ' / ' + gallerySources.length;
        // Show with display:flex
        overlay.style.display = 'flex';
        lockedScrollY = window.scrollY || window.pageYOffset || 0;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${lockedScrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
    }

    function closeLB() {
        if (!overlay) return;
        overlay.style.display = 'none';
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, lockedScrollY);
    }

    function navLB(dir) {
        currentIndex = (currentIndex + dir + gallerySources.length) % gallerySources.length;
        const src = gallerySources[currentIndex].src;
        renderLightboxImage(src, gallerySources[currentIndex].alt || 'Produktbild');
        lbInfo.textContent = (currentIndex + 1) + ' / ' + gallerySources.length;
        // Sync thumbnail + main image
        galleryThumbs.forEach(t => t.classList.remove('active'));
        if (galleryThumbs[currentIndex]) galleryThumbs[currentIndex].classList.add('active');
        if (galleryMain) {
            galleryMain.src = gallerySources[currentIndex].src;
            galleryMain.alt = gallerySources[currentIndex].alt;
        }
    }

    // Click on main image → open lightbox
    if (galleryMainWrap && gallerySources.length > 0) {
        galleryMainWrap.addEventListener('click', () => {
            openLB(currentIndex);
        });
    }

    // ===== Counter animation (for stats) =====
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const countObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count, 10);
                    const duration = 1500;
                    const start = performance.now();

                    const tick = (now) => {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                        el.textContent = Math.floor(eased * target);
                        if (progress < 1) requestAnimationFrame(tick);
                        else el.textContent = target;
                    };

                    requestAnimationFrame(tick);
                    countObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => countObserver.observe(el));
    }

    // ===== Parallax (subtle) =====
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                parallaxElements.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax) || 0.15;
                    const rect = el.getBoundingClientRect();
                    const offset = (rect.top - window.innerHeight / 2) * speed;
                    el.style.transform = `translateY(${offset}px)`;
                });
            });
        }, { passive: true });
    }

    // ===== Back to Top Button =====
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== Sticky CTA (Product Pages) =====
    const stickyCta = document.getElementById('stickyCta');
    const productHeroCta = document.querySelector('.product-hero-content .btn-amazon');
    if (stickyCta && productHeroCta) {
        const stickyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Show sticky CTA when the hero Amazon button scrolls out of view
                stickyCta.classList.toggle('visible', !entry.isIntersecting);
            });
        }, { rootMargin: '-72px 0px 0px 0px' });

        stickyObserver.observe(productHeroCta);
    }
});


