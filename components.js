class SiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const brandHref = this.getAttribute('brand-href') || '#home';
    const projectsHref = this.getAttribute('projects-href') || '#featured-projects';

    this.innerHTML = `
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="${brandHref}">✦ Monica Cortes ✦</a>
          <nav class="nav" aria-label="Primary">
            <a href="${projectsHref}">Projects</a>
            <a href="archive.html">Archive</a>
            <a href="about.html">About</a>
            <a class="external" href="#resume">
              <span>Resume</span>
              <span class="external-arrow" aria-hidden="true">
                <img src="assets/icons/Arrow up-right.svg" alt="" />
              </span>
            </a>
            <a class="external" href="#linkedin">
              <span>LinkedIn</span>
              <span class="external-arrow" aria-hidden="true">
                <img src="assets/icons/Arrow up-right.svg" alt="" />
              </span>
            </a>
          </nav>
        </div>
      </header>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered === 'true') return;
    this.dataset.rendered = 'true';

    const footerClass = this.getAttribute('footer-class') || '';
    const brandHref = this.getAttribute('brand-href') || '#home';
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
              <a class="external" href="#linkedin">
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
