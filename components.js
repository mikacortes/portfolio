class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const brandHref = this.getAttribute('brand-href') || '/';
    const projectsHref = this.getAttribute('projects-href') || '#featured-projects';

    this.innerHTML = `
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
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    if (!topbar || !toggle || !nav) return;

    const setMenuOpen = (open) => {
      topbar.classList.toggle('is-menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-menu-open', open);
      if (open) topbar.classList.remove('is-hidden');
    };

    const closeMenu = () => setMenuOpen(false);

    toggle.addEventListener('click', () => {
      setMenuOpen(!topbar.classList.contains('is-menu-open'));
    });

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
