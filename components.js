const GA_MEASUREMENT_ID = 'G-939JMB63LX';
const CLARITY_PROJECT_ID = 'x0ek0up8lg';

(function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

  function loadAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadAnalytics, { timeout: 3000 });
  } else {
    window.setTimeout(loadAnalytics, 2000);
  }
})();

(function initMicrosoftClarity() {
  if (!CLARITY_PROJECT_ID) return;

  function loadClarity() {
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadClarity, { timeout: 3000 });
  } else {
    window.setTimeout(loadClarity, 2000);
  }
})();

const RESUME_URL =
  'https://drive.google.com/file/d/15hiMYotLD28_68xlZpxlYPcf4pC3u9S1/view?usp=sharing';

class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const brandHref = this.getAttribute('brand-href') || '/';
    const projectsHref = this.getAttribute('projects-href') || '#featured-projects';
    const archiveHref = this.getAttribute('archive-href') || 'play.html';
    const archiveLabel = this.getAttribute('archive-label') || 'Play';

    this.innerHTML = `
      <button
        type="button"
        class="nav-menu-overlay"
        aria-label="Close menu"
        hidden
      ></button>
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="${brandHref}">✦ Monica Cortes ✦</a>
          <button
            class="menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="primary-nav"
            aria-label="Open menu"
          >
            <span class="menu-toggle-bar" aria-hidden="true"></span>
            <span class="menu-toggle-bar" aria-hidden="true"></span>
            <span class="menu-toggle-bar" aria-hidden="true"></span>
          </button>
          <nav class="nav" id="primary-nav" aria-label="Primary">
            <a href="${projectsHref}">Projects</a>
            <a href="${archiveHref}">${archiveLabel}</a>
            <a href="about.html">About</a>
            <a class="external" href="${RESUME_URL}" target="_blank" rel="noopener noreferrer">
              <span>Resume</span>
              <span class="external-arrow" aria-hidden="true">
                <img src="assets/icons/Arrow up-right.svg" alt="" />
              </span>
            </a>
            <a class="external" href="https://www.linkedin.com/in/monica--cortes/">
              <span>LinkedIn</span>
              <span class="external-arrow" aria-hidden="true">
                <img src="assets/icons/Arrow up-right.svg" alt="" />
              </span>
            </a>
          </nav>
        </div>
      </header>
    `;

    this.initMobileMenu();
  }

  initMobileMenu() {
    const topbar = this.querySelector('.topbar');
    const toggle = this.querySelector('.menu-toggle');
    const nav = this.querySelector('.nav');
    const overlay = this.querySelector('.nav-menu-overlay');
    const mobileQuery = window.matchMedia('(max-width: 980px)');

    if (!topbar || !toggle || !nav) return;

    const setMenuOpen = (open) => {
      topbar.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-menu-open', open);
      if (overlay) {
        overlay.hidden = !open;
        overlay.setAttribute('aria-hidden', String(!open));
      }
      if (open) topbar.classList.remove('is-hidden');
    };

    const closeMenu = () => setMenuOpen(false);

    toggle.addEventListener('click', () => {
      setMenuOpen(!topbar.classList.contains('is-menu-open'));
    });

    overlay?.addEventListener('click', closeMenu);

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    mobileQuery.addEventListener('change', () => {
      if (!mobileQuery.matches) closeMenu();
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const footerClass = this.getAttribute('footer-class') || '';
    const brandHref = this.getAttribute('brand-href') || '/';
    const projectsHref = this.getAttribute('projects-href') || '#featured-projects';
    const archiveHref = this.getAttribute('archive-href') || 'play.html';
    const archiveLabel = this.getAttribute('archive-label') || 'Play';
    const className = ['footer', footerClass].filter(Boolean).join(' ');

    this.innerHTML = `
      <footer class="${className}">
        <div class="footer-inner">
          <div class="footer-left">
            <a class="brand" href="${brandHref}">✦ Monica Cortes ✦</a>
            <div class="footer-note">Thank you for visiting!</div>
          </div>

          <div class="footer-right">
            <nav class="nav" aria-label="Footer">
              <a href="${projectsHref}">Projects</a>
              <a href="${archiveHref}">${archiveLabel}</a>
              <a href="about.html">About</a>
              <a class="external" href="${RESUME_URL}" target="_blank" rel="noopener noreferrer">
                <span>Resume</span>
                <span class="external-arrow" aria-hidden="true">
                  <img src="assets/icons/Arrow up-right.svg" alt="" />
                </span>
              </a>
              <a class="external" href="https://www.linkedin.com/in/monica--cortes/">
                <span>LinkedIn</span>
                <span class="external-arrow" aria-hidden="true">
                  <img src="assets/icons/Arrow up-right.svg" alt="" />
                </span>
              </a>
            </nav>
            <div class="copyright">© 2026 Monica Cortes</div>
          </div>
        </div>
      </footer>
    `;
  }
}

if (!customElements.get('site-header')) {
  customElements.define('site-header', SiteHeader);
}

if (!customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooter);
}

const SPARKLE_TRAIL_CHARS = ['✦', '✧', '·'];
const SPARKLE_TRAIL_LIGHT_COLORS = [
  '#ffffff',
  '#f4f7ff',
  '#e8efff',
  '#dce7ff',
  '#d0dfff',
  '#c4d7ff',
  '#b8ceff',
];

const SPARKLE_TRAIL_ZONE_CONFIGS = [
  {
    selector: '.hero',
    sparkleClass: 'sparkle-trail-particle sparkle-trail-particle--light',
    colors: SPARKLE_TRAIL_LIGHT_COLORS,
  },
];

function initSparkleTrailZones() {
  if (document.body.dataset.sparkleTrailZonesReady === 'true') return;

  const zones = SPARKLE_TRAIL_ZONE_CONFIGS.map((config) => {
    const element = document.querySelector(config.selector);
    if (!element) return null;
    return { ...config, element };
  }).filter(Boolean);

  if (zones.length === 0) return;
  document.body.dataset.sparkleTrailZonesReady = 'true';

  const isFinePointer =
    window.matchMedia &&
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(hover: hover)').matches;
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isFinePointer || prefersReducedMotion) return;

  const spawnIntervalMs = 28;
  const minTravelPx = 10;
  let lastSpawnAt = 0;
  let lastSpawnX = 0;
  let lastSpawnY = 0;

  function spawnSparkle(x, y, zone) {
    const sparkle = document.createElement('span');
    sparkle.className = zone.sparkleClass;
    sparkle.setAttribute('aria-hidden', 'true');
    sparkle.textContent =
      SPARKLE_TRAIL_CHARS[Math.floor(Math.random() * SPARKLE_TRAIL_CHARS.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty(
      '--sparkle-color',
      zone.colors[Math.floor(Math.random() * zone.colors.length)]
    );
    sparkle.style.setProperty('--sparkle-rotate', `${Math.floor(Math.random() * 360)}deg`);
    const scaleMin = zone.sparkleScaleMin ?? 0.55;
    const scaleMax = zone.sparkleScaleMax ?? 1.3;
    const fontMin = zone.sparkleFontMin ?? 12;
    const fontMax = zone.sparkleFontMax ?? 26;
    sparkle.style.setProperty(
      '--sparkle-scale',
      `${scaleMin + Math.random() * (scaleMax - scaleMin)}`
    );
    sparkle.style.setProperty('--sparkle-duration', `${620 + Math.floor(Math.random() * 280)}ms`);
    sparkle.style.fontSize = `${fontMin + Math.floor(Math.random() * (fontMax - fontMin))}px`;

    document.body.appendChild(sparkle);

    const removeSparkle = () => {
      sparkle.remove();
    };

    sparkle.addEventListener('animationend', removeSparkle, { once: true });
    window.setTimeout(removeSparkle, 1100);
  }

  function maybeSpawnSparkle(x, y, zone) {
    const now = performance.now();
    const travel = Math.hypot(x - lastSpawnX, y - lastSpawnY);

    if (now - lastSpawnAt < spawnIntervalMs && travel < minTravelPx) {
      return;
    }

    lastSpawnAt = now;
    lastSpawnX = x;
    lastSpawnY = y;
    spawnSparkle(x, y, zone);
  }

  function isPointInsideZone(zone, clientX, clientY) {
    const rect = zone.element.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  function findZoneAtPoint(clientX, clientY) {
    return zones.find((zone) => isPointInsideZone(zone, clientX, clientY)) || null;
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      const zone = findZoneAtPoint(event.clientX, event.clientY);
      if (!zone) return;
      maybeSpawnSparkle(event.clientX, event.clientY, zone);
    },
    { passive: true }
  );
}

function initViewportAutoplayVideos(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const videos = scope.querySelectorAll('video[autoplay][muted]');
  if (!videos.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    videos.forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
    });
    return;
  }

  videos.forEach((video) => {
    video.autoplay = false;
    video.preload = 'none';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload === 'none') {
            video.preload = 'auto';
            video.load();
          }
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { rootMargin: '120px', threshold: 0.15 }
  );

  videos.forEach((video) => observer.observe(video));
}

window.initViewportAutoplayVideos = initViewportAutoplayVideos;

function initHomeFeaturedAutoplay() {
  const videos = document.querySelectorAll('.featured-video');
  if (!videos.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    videos.forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
    });
    return;
  }

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    if (!video.hasAttribute('autoplay')) {
      video.setAttribute('autoplay', '');
    }
    if (!video.getAttribute('preload')) {
      video.preload = 'metadata';
    }

    const tryPlay = () => {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.addEventListener('canplay', tryPlay, { once: true });

    const card = video.closest('.featured-item');
    if (card) {
      if (card.classList.contains('is-revealed')) {
        tryPlay();
      } else {
        const revealWatcher = new MutationObserver(() => {
          if (card.classList.contains('is-revealed')) {
            tryPlay();
            revealWatcher.disconnect();
          }
        });
        revealWatcher.observe(card, { attributes: true, attributeFilter: ['class'] });
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: '80px', threshold: 0.1 }
    );

    observer.observe(video);
  });
}

function initHomePageLazyMedia() {
  const recentSection = document.querySelector('.recent-grid, #recent-work');
  if (recentSection) {
    recentSection.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
  }

  const featuredItems = document.querySelectorAll('.featured-item');
  featuredItems.forEach((item, index) => {
    if (index < 2) return;
    item.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
    });
  });

  initHomeFeaturedAutoplay();
}

function loadArchiveGalleryVideo(video) {
  if (video.dataset.srcLoaded === 'true') return;

  const source = video.querySelector('source[data-src]');
  if (!source) return;

  source.src = source.getAttribute('data-src');
  source.removeAttribute('data-src');
  video.preload = 'metadata';
  video.load();
  video.dataset.srcLoaded = 'true';
  video.addEventListener(
    'loadedmetadata',
    () => {
      video.style.height = 'auto';
    },
    { once: true }
  );

  if (!video.hasAttribute('autoplay')) return;

  const tryPlay = () => {
    video.play().catch(() => {});
  };

  tryPlay();
  video.addEventListener('canplay', tryPlay, { once: true });
}

function initArchiveLazyMedia() {
  const gallery = document.querySelector('.archive-gallery');
  if (!gallery) return;

  gallery.querySelectorAll('img').forEach((img, index) => {
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    if (!img.hasAttribute('loading') && index > 1) img.loading = 'lazy';
    if (index > 7 && !img.hasAttribute('fetchpriority')) {
      img.fetchPriority = 'low';
    }
  });

  const videos = gallery.querySelectorAll('.archive-gallery-video-media');
  if (!videos.length) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadWhenNeeded = (video) => {
    loadArchiveGalleryVideo(video);
  };

  videos.forEach((video) => {
    video.preload = 'none';

    if (prefersReducedMotion && video.hasAttribute('autoplay')) {
      video.removeAttribute('autoplay');
    }

    if (!video.hasAttribute('autoplay')) {
      video.addEventListener('pointerdown', () => loadWhenNeeded(video), { once: true });
      video.addEventListener('focusin', () => loadWhenNeeded(video), { once: true });
    }
  });

  if (!('IntersectionObserver' in window)) {
    videos.forEach(loadWhenNeeded);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const isAutoplay = video.hasAttribute('autoplay');

        if (entry.isIntersecting) {
          loadWhenNeeded(video);
          if (isAutoplay && video.dataset.srcLoaded === 'true') {
            video.play().catch(() => {});
          }
          if (!isAutoplay) {
            observer.unobserve(video);
          }
        } else if (isAutoplay) {
          video.pause();
        }
      });
    },
    { rootMargin: '240px', threshold: 0.01 }
  );

  videos.forEach((video) => observer.observe(video));
}

function resolveArchiveGalleryItemSrc(element) {
  if (element.matches('img')) {
    return element.getAttribute('src') || '';
  }

  const source = element.querySelector('source[data-src], source[src]');
  return source?.getAttribute('data-src') || source?.getAttribute('src') || '';
}

function getArchiveGalleryTags(src) {
  const tags = new Set();
  if (!src) return tags;

  const isDigital =
    /\.mp4(?:$|[?#])/i.test(src) ||
    /bonded diamond|helping-hands|Nexus VR|girls-who-code|asuc-student-government\/asuc graphic|geography slide|op graphic -|Changemaker Postcard|Daily Cal Ads #4|scriptchain-health\/social/i.test(
      src
    );

  const isPrint =
    /asuc banner|blue-gold-yearbook|Quotes Version|daily cal np|FOR PRINT\] Daily Cal Printed Ad|ls110 poster|scriptchain-health\/marketing\/SCH(?:%20| )POSTER|scriptchain-health\/marketing\/SCH(?:%20| )Brochure/i.test(
      src
    );

  const isBoth =
    /uc-berkeley-sts\/signage\/sts sit|uc-berkeley-sts\/event\/sts event|the-daily-californian\/graphics\/daily cal graphic|project-specific\/wscuc/i.test(
      src
    );

  if (isDigital || isBoth) tags.add('digital');
  if (isPrint || isBoth) tags.add('print');

  return tags;
}

function initArchiveGalleryFilters() {
  const filterBar = document.querySelector('.archive-gallery-filters');
  const gallery = document.querySelector('.archive-gallery');
  if (!filterBar || !gallery) return;

  const filterButtons = Array.from(filterBar.querySelectorAll('.project-tag'));
  const filterableItems = [
    ...gallery.querySelectorAll('img'),
    ...gallery.querySelectorAll('.archive-gallery-video'),
  ];

  filterableItems.forEach((item) => {
    if (item.dataset.galleryTags) return;

    const tags = getArchiveGalleryTags(resolveArchiveGalleryItemSrc(item));
    if (tags.size) {
      item.dataset.galleryTags = [...tags].join(' ');
    }
  });

  function updateFilteredGallery() {
    const activeFilter =
      filterButtons.find((button) => button.classList.contains('is-active'))?.dataset.filter || 'all';
    let visibleCount = 0;

    filterableItems.forEach((item) => {
      const itemTags = (item.dataset.galleryTags || '').split(/\s+/).filter(Boolean);
      const isVisible =
        activeFilter === 'all' ||
        (activeFilter === 'digital' && itemTags.includes('digital')) ||
        (activeFilter === 'print' && itemTags.includes('print'));

      item.classList.toggle('is-filter-hidden', !isVisible);
      if (isVisible) visibleCount += 1;
    });

    gallery.classList.toggle('is-filter-empty', visibleCount === 0);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((peer) => {
        const isActive = peer === button;
        peer.classList.toggle('is-active', isActive);
        peer.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      updateFilteredGallery();
    });
  });

  updateFilteredGallery();
}

function initSharedEnhancements() {
  initSparkleTrailZones();
  if (document.querySelector('.featured-grid, .featured-item')) {
    initHomePageLazyMedia();
  }
  initArchiveLazyMedia();
  initArchiveGalleryFilters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSharedEnhancements);
} else {
  initSharedEnhancements();
}

function getComponentsAssetBase() {
  const script = document.querySelector('script[src*="components.js"]');
  if (!script) return './';
  return script.getAttribute('src').replace(/components\.js.*$/, '');
}

function initPortfolioChat() {
  if (document.querySelector('.project-layout')) return;
  if (document.body.dataset.portfolioChatReady === 'true') return;
  document.body.dataset.portfolioChatReady = 'true';

  const base = getComponentsAssetBase();
  const stylesheetId = 'portfolio-chat-styles';

  if (!document.getElementById(stylesheetId)) {
    const link = document.createElement('link');
    link.id = stylesheetId;
    link.rel = 'stylesheet';
    link.href = `${base}portfolio-chat.css`;
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-portfolio-chat="true"]')) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${base}portfolio-chat.js`;
    script.dataset.portfolioChat = 'true';
    document.head.appendChild(script);
  }

  const mountChat = () => {
    if (document.querySelector('portfolio-chat')) return;
    document.body.appendChild(document.createElement('portfolio-chat'));
  };

  if (customElements.get('portfolio-chat')) {
    mountChat();
    return;
  }

  customElements.whenDefined('portfolio-chat').then(mountChat);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioChat);
} else {
  initPortfolioChat();
}
