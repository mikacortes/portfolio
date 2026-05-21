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
            <a class="external" href="https://drive.google.com/drive/u/0/folders/1XbnYRbWaqmWYE9XXKzeN9OAETWf2YSIV">
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
              <a class="external" href="#resume">
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

    const baseScale = 0.74;
    const scaleRange = 0.22;
    const opacityRange = 0.18;
    const minOpacity = 0.04;
    const trailEase = 0.14;

    stars.forEach((star, index) => {
      const offset = 10;
      star.style.left = `${x - offset}px`;
      star.style.top = `${y - offset}px`;
      star.style.transform = `scale(${baseScale + ((stars.length - index) / stars.length) * scaleRange})`;
      star.style.opacity = hasPointerMoved
        ? `${Math.max(minOpacity, ((stars.length - index) / stars.length) * opacityRange)}`
        : '0';

      star.x = x;
      star.y = y;

      const nextStar = stars[index + 1] || stars[0];
      x += (nextStar.x - x) * trailEase;
      y += (nextStar.y - y) * trailEase;
    });

    window.requestAnimationFrame(animateCircles);
  }

  animateCircles();

  document.querySelectorAll('.featured-item').forEach((featuredItem) => {
    featuredItem.addEventListener('pointerenter', () => {
      body.classList.add('is-featured-hovering');
    });

    featuredItem.addEventListener('pointerleave', () => {
      body.classList.remove('is-featured-hovering');
    });

    featuredItem.addEventListener('focusin', () => {
      body.classList.add('is-featured-hovering');
    });

    featuredItem.addEventListener('focusout', () => {
      body.classList.remove('is-featured-hovering');
    });
  });
}

const HERO_SPARKLE_CHARS = ['✦', '✧', '·'];
const HERO_SPARKLE_COLORS = [
  '#ffffff',
  '#f4f7ff',
  '#e8efff',
  '#dce7ff',
  '#d0dfff',
  '#c4d7ff',
  '#b8ceff',
];

function initHeroSparkleTrail() {
  const hero = document.querySelector('.hero');
  if (!hero || document.body.dataset.heroSparkleTrailReady === 'true') return;
  document.body.dataset.heroSparkleTrailReady = 'true';

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
  let isPointerInHero = false;

  function spawnSparkle(x, y) {
    const sparkle = document.createElement('span');
    sparkle.className = 'hero-cursor-sparkle';
    sparkle.setAttribute('aria-hidden', 'true');
    sparkle.textContent =
      HERO_SPARKLE_CHARS[Math.floor(Math.random() * HERO_SPARKLE_CHARS.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.setProperty(
      '--sparkle-color',
      HERO_SPARKLE_COLORS[Math.floor(Math.random() * HERO_SPARKLE_COLORS.length)]
    );
    sparkle.style.setProperty('--sparkle-rotate', `${Math.floor(Math.random() * 360)}deg`);
    sparkle.style.setProperty('--sparkle-scale', `${0.55 + Math.random() * 0.75}`);
    sparkle.style.setProperty('--sparkle-duration', `${620 + Math.floor(Math.random() * 280)}ms`);
    sparkle.style.fontSize = `${12 + Math.floor(Math.random() * 14)}px`;

    document.body.appendChild(sparkle);

    const removeSparkle = () => {
      sparkle.remove();
    };

    sparkle.addEventListener('animationend', removeSparkle, { once: true });
    window.setTimeout(removeSparkle, 1100);
  }

  function maybeSpawnSparkle(x, y) {
    const now = performance.now();
    const travel = Math.hypot(x - lastSpawnX, y - lastSpawnY);

    if (now - lastSpawnAt < spawnIntervalMs && travel < minTravelPx) {
      return;
    }

    lastSpawnAt = now;
    lastSpawnX = x;
    lastSpawnY = y;
    spawnSparkle(x, y);
  }

  function isPointInsideHero(clientX, clientY) {
    const rect = hero.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      const insideHero = isPointInsideHero(event.clientX, event.clientY);

      if (insideHero !== isPointerInHero) {
        isPointerInHero = insideHero;
        body.classList.toggle('is-hero-cursor-zone', insideHero);
      }

      if (!insideHero) return;
      maybeSpawnSparkle(event.clientX, event.clientY);
    },
    { passive: true }
  );

  hero.addEventListener(
    'pointerleave',
    () => {
      isPointerInHero = false;
      body.classList.remove('is-hero-cursor-zone');
    },
    { passive: true }
  );
}

function initCursorEffects() {
  initSparkleCursor();
  initHeroSparkleTrail();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCursorEffects);
} else {
  initCursorEffects();
}
