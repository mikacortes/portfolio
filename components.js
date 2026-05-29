const GA_MEASUREMENT_ID = 'G-939JMB63LX';

(function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;

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
})();

const RESUME_URL =
  'https://drive.google.com/file/d/1mOMvKb67YjsOM65gHeu3iLooPVo6r2ut/view?usp=sharing';

class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const brandHref = this.getAttribute('brand-href') || '/';
    const projectsHref = this.getAttribute('projects-href') || '#featured-projects';

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
            <a href="archive.html">Archive</a>
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
              <a href="archive.html">Archive</a>
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

const SPARKLE_STAR_COUNT = 20;

function initSparkleCursor() {
  if (document.body.dataset.sparkleCursorReady === 'true') return;
  document.body.dataset.sparkleCursorReady = 'true';

  const isFinePointer =
    window.matchMedia &&
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(hover: hover)').matches;

  if (!isFinePointer) return;

  const body = document.body;
  const stars = [];

  for (let index = 0; index < SPARKLE_STAR_COUNT; index += 1) {
    const star = document.createElement('div');
    star.className = 'cursor-star';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = '✦';
    document.body.appendChild(star);
    stars.push(star);
  }

  body.classList.add('has-custom-cursor');

  const coords = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const blueReference = { r: 1, g: 63, b: 167 };
  const blueColors = [
    '#013fa7',
    '#0d4ab1',
    '#1a56ba',
    '#2a63c2',
    '#396fca',
    '#487ad0',
    '#5685d6',
    '#6490db',
    '#729ade',
    '#80a3e1',
    '#8caee4',
    '#97b7e7',
    '#a2c0e9',
    '#acc8eb',
    '#b6d0ed',
    '#bfd8ef',
    '#c7e0f1',
    '#cfe7f3',
    '#d7eef5',
    '#dff4f7',
  ];
  let hasPointerMoved = false;
  let featuredMorph = 0;
  let featuredMorphTarget = 0;
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const featuredMorphEase = prefersReducedMotion ? 1 : 0.14;

  stars.forEach((star, index) => {
    star.x = 0;
    star.y = 0;
    star.style.color = blueColors[index % blueColors.length];
    star.style.opacity = '0';
  });

  function parseRgbColor(color) {
    const match = color && color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) {
      return null;
    }

    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3]),
    };
  }

  function isBlueLikeColor(color) {
    const rgb = parseRgbColor(color);
    if (!rgb) {
      return false;
    }

    const distance = Math.sqrt(
      Math.pow(rgb.r - blueReference.r, 2) +
        Math.pow(rgb.g - blueReference.g, 2) +
        Math.pow(rgb.b - blueReference.b, 2)
    );

    return distance < 90 || (rgb.b > rgb.r + 18 && rgb.b > rgb.g + 10 && rgb.b > 90);
  }

  function updateBlueHoverState(event) {
    const hovered = document.elementFromPoint(event.clientX, event.clientY);
    let element = hovered;
    let isBlueHovering = false;

    while (element && element !== document.body) {
      const styles = window.getComputedStyle(element);
      if (
        isBlueLikeColor(styles.color) ||
        isBlueLikeColor(styles.backgroundColor) ||
        isBlueLikeColor(styles.borderTopColor) ||
        isBlueLikeColor(styles.borderRightColor) ||
        isBlueLikeColor(styles.borderBottomColor) ||
        isBlueLikeColor(styles.borderLeftColor) ||
        isBlueLikeColor(styles.fill) ||
        isBlueLikeColor(styles.stroke)
      ) {
        isBlueHovering = true;
        break;
      }

      element = element.parentElement;
    }

    body.classList.toggle('is-blue-hovering', isBlueHovering);
  }

  window.addEventListener('mousemove', (event) => {
    hasPointerMoved = true;
    coords.x = event.clientX;
    coords.y = event.clientY;
    updateBlueHoverState(event);
  });

  function animateCircles(timestamp = 0) {
    let x = coords.x;
    let y = coords.y;

    if (!hasPointerMoved) {
      const swirlTime = timestamp * 0.00045;
      x += Math.cos(swirlTime) * 18;
      y += Math.sin(swirlTime * 1.15) * 18;
    }

    featuredMorph += (featuredMorphTarget - featuredMorph) * featuredMorphEase;

    const baseScale = 0.74;
    const scaleRange = 0.22;
    const opacityRange = 0.18;
    const minOpacity = 0.04;
    const trailEase = 0.14;
    const morphScale = 1 - featuredMorph * 0.82;
    const morphBlur = featuredMorph * 2.5;

    stars.forEach((star, index) => {
      const offset = 10;
      const trailIndex = (stars.length - index) / stars.length;
      const trailScale = baseScale + trailIndex * scaleRange;
      const trailOpacity = hasPointerMoved
        ? Math.max(minOpacity, trailIndex * opacityRange)
        : 0;

      star.style.left = `${x - offset}px`;
      star.style.top = `${y - offset}px`;
      star.style.transform = `scale(${trailScale * morphScale})`;
      star.style.opacity = `${trailOpacity * (1 - featuredMorph)}`;
      star.style.filter =
        morphBlur > 0.05
          ? `saturate(${0.85 + featuredMorph * 0.15}) blur(${morphBlur}px)`
          : 'saturate(0.85)';

      star.x = x;
      star.y = y;

      const nextStar = stars[index + 1] || stars[0];
      x += (nextStar.x - x) * trailEase;
      y += (nextStar.y - y) * trailEase;
    });

    window.requestAnimationFrame(animateCircles);
  }

  animateCircles();

  function setFeaturedMorphTarget(value) {
    featuredMorphTarget = value;
    body.classList.toggle('is-featured-hovering', value > 0);
  }

  const featuredMorphTargets = document.querySelectorAll('.featured-media');
  const featuredMorphFallback = document.querySelectorAll('.featured-item');

  (featuredMorphTargets.length ? featuredMorphTargets : featuredMorphFallback).forEach(
    (target) => {
      target.addEventListener('pointerenter', () => {
        setFeaturedMorphTarget(1);
      });

      target.addEventListener('pointerleave', () => {
        setFeaturedMorphTarget(0);
      });
    }
  );

  document.querySelectorAll('.featured-item').forEach((featuredItem) => {
    featuredItem.addEventListener('focusin', () => {
      setFeaturedMorphTarget(1);
    });

    featuredItem.addEventListener('focusout', () => {
      setFeaturedMorphTarget(0);
    });
  });
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
const SPARKLE_TRAIL_BLUE_COLORS = [
  '#013fa7',
  '#0d4ab1',
  '#1a56ba',
  '#2a63c2',
  '#396fca',
  '#487ad0',
  '#5685d6',
  '#6490db',
  '#729ade',
  '#80a3e1',
  '#8caee4',
  '#97b7e7',
  '#a2c0e9',
  '#acc8eb',
  '#b6d0ed',
  '#bfd8ef',
  '#c7e0f1',
  '#cfe7f3',
  '#d7eef5',
  '#dff4f7',
];

const SPARKLE_TRAIL_ZONE_CONFIGS = [
  {
    selector: '.hero',
    bodyClass: 'is-hero-cursor-zone',
    sparkleClass: 'sparkle-trail-particle sparkle-trail-particle--light',
    colors: SPARKLE_TRAIL_LIGHT_COLORS,
  },
  {
    selector: '.contact',
    bodyClass: 'is-contact-sparkle-zone',
    sparkleClass: 'sparkle-trail-particle sparkle-trail-particle--blue',
    colors: SPARKLE_TRAIL_BLUE_COLORS,
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

  const body = document.body;
  const spawnIntervalMs = 28;
  const minTravelPx = 10;
  let lastSpawnAt = 0;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  let activeZone = null;

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

  function updateZoneState(zone) {
    if (zone === activeZone) return;

    zones.forEach((entry) => {
      body.classList.toggle(entry.bodyClass, entry === zone);
    });
    activeZone = zone;
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      const zone = findZoneAtPoint(event.clientX, event.clientY);
      updateZoneState(zone);
      if (!zone) return;
      maybeSpawnSparkle(event.clientX, event.clientY, zone);
    },
    { passive: true }
  );
}

function initCursorEffects() {
  initSparkleCursor();
  initSparkleTrailZones();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCursorEffects);
} else {
  initCursorEffects();
}
