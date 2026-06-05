(function initPostCarousels() {
  const carousels = document.querySelectorAll('[data-post-carousel]');
  if (!carousels.length) return;

  function storeSlideSrc(slide) {
    if (slide.tagName !== 'IMG') return;
    const src = slide.getAttribute('src');
    if (src && !slide.dataset.src) {
      slide.dataset.src = src;
    }
  }

  function loadSlide(slide) {
    if (slide.tagName !== 'IMG') return;
    storeSlideSrc(slide);
    if (!slide.getAttribute('src') && slide.dataset.src) {
      slide.setAttribute('src', slide.dataset.src);
      if (!slide.hasAttribute('loading')) slide.loading = 'lazy';
      if (!slide.hasAttribute('decoding')) slide.decoding = 'async';
    }
  }

  function unloadSlide(slide) {
    if (slide.tagName !== 'IMG') return;
    storeSlideSrc(slide);
    slide.removeAttribute('src');
  }

  carousels.forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.post-carousel-slide'));
    const prevButton = carousel.querySelector('.post-carousel-prev');
    const nextButton = carousel.querySelector('.post-carousel-next');
    const counter = carousel.querySelector('.post-carousel-counter');
    const dotsContainer = carousel.querySelector('.post-carousel-dots');
    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (activeIndex < 0) activeIndex = 0;
    let hasLoadedActiveSlide = false;

    slides.forEach(storeSlideSrc);

    if (dotsContainer && !dotsContainer.children.length) {
      slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'post-carousel-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1} of ${slides.length}`);
        dot.addEventListener('click', () => goTo(index));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.post-carousel-dot')) : [];

    function updateUI(index, loadActive) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.hidden = !isActive;

        if (isActive && loadActive) {
          loadSlide(slide);
          hasLoadedActiveSlide = true;
        } else if (!isActive) {
          unloadSlide(slide);
        }
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (counter) {
        counter.textContent = `${activeIndex + 1} / ${slides.length}`;
      }
    }

    function goTo(index) {
      updateUI(index, true);
    }

    prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
    nextButton?.addEventListener('click', () => goTo(activeIndex + 1));

    carousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(activeIndex - 1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(activeIndex + 1);
      }
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedActiveSlide) {
            goTo(activeIndex);
            revealObserver.disconnect();
          }
        });
      },
      { rootMargin: '160px', threshold: 0.01 }
    );

    slides.forEach(unloadSlide);
    updateUI(activeIndex, false);
    revealObserver.observe(carousel);
  });
})();

(function initLazyProjectImages() {
  const main = document.querySelector('.project-main');
  if (!main) return;

  const eagerImages = new Set();
  const heroImage = main.querySelector('.hero-image img');
  const overviewSection = main.querySelector('#overview');

  if (heroImage) eagerImages.add(heroImage);
  if (overviewSection) {
    overviewSection.querySelectorAll('img').forEach((img) => eagerImages.add(img));
  }

  let isFirstEager = true;
  main.querySelectorAll('img').forEach((img) => {
    if (eagerImages.has(img)) {
      if (isFirstEager && !img.hasAttribute('fetchpriority')) {
        img.fetchPriority = 'high';
        isFirstEager = false;
      }
      return;
    }

    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
  });
})();

(function initLazyProjectVideos() {
  const main = document.querySelector('.project-main');
  if (!main || typeof initViewportAutoplayVideos !== 'function') return;
  initViewportAutoplayVideos(main);
})();

(function initMobileProjectNav() {
  const sidebar = document.querySelector('.project-sidebar');
  const inner = sidebar?.querySelector('.project-sidebar-inner');
  if (!sidebar || !inner || inner.dataset.mobileNavInit === 'true') return;

  const home = inner.querySelector('.sidebar-home:not(.sidebar-next)');
  const groups = Array.from(inner.querySelectorAll('.sidebar-group'));
  if (!home || !groups.length) return;

  inner.dataset.mobileNavInit = 'true';

  const panel = document.createElement('div');
  panel.className = 'sidebar-sections-panel';
  panel.id = 'sidebar-sections-panel';

  groups.forEach((group) => panel.appendChild(group));

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'sidebar-sections-toggle subtitle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panel.id);
  toggle.innerHTML =
    '<span class="sidebar-sections-toggle-label">Sections</span>' +
    '<span class="sidebar-sections-toggle-icon" aria-hidden="true"></span>';

  home.insertAdjacentElement('afterend', toggle);
  toggle.insertAdjacentElement('afterend', panel);

  const bottom = inner.querySelector('.sidebar-bottom');
  const column = document.querySelector('.project-column');
  const main = column?.querySelector('.project-main');
  const footer = column?.querySelector('.project-footer-minimal');

  const mobileQuery = window.matchMedia('(max-width: 980px)');

  function placeNextProjectLink() {
    if (!bottom || !inner) return;

    if (mobileQuery.matches) {
      bottom.classList.add('sidebar-bottom--page-end');
      if (footer) {
        column.insertBefore(bottom, footer);
      } else if (main) {
        main.insertAdjacentElement('afterend', bottom);
      }
      return;
    }

    bottom.classList.remove('sidebar-bottom--page-end');
    if (bottom.parentElement !== inner) {
      inner.appendChild(bottom);
    }
  }

  placeNextProjectLink();

  function syncNavMetrics() {
    if (!mobileQuery.matches) {
      document.documentElement.style.removeProperty('--project-mobile-nav-offset');
      return;
    }

    document.documentElement.style.setProperty(
      '--project-mobile-nav-offset',
      `${sidebar.getBoundingClientRect().height}px`
    );
  }

  const overlay = document.createElement('button');
  overlay.type = 'button';
  overlay.className = 'sidebar-sections-overlay';
  overlay.setAttribute('aria-label', 'Close sections menu');
  overlay.hidden = true;
  document.body.appendChild(overlay);

  function setSectionsOpen(open) {
    sidebar.classList.toggle('is-sections-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    overlay.hidden = !open;
    document.body.classList.toggle('project-sections-open', open);

    if (open && mobileQuery.matches) {
      syncNavMetrics();
    }
  }

  function closeSections() {
    setSectionsOpen(false);
  }

  toggle.addEventListener('click', () => {
    setSectionsOpen(!sidebar.classList.contains('is-sections-open'));
  });

  overlay.addEventListener('click', closeSections);

  panel.querySelectorAll('.sidebar-links a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeSections);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-sections-open')) {
      closeSections();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (sidebar.classList.contains('is-sections-open')) {
      syncNavMetrics();
    }
  });

  mobileQuery.addEventListener('change', (event) => {
    placeNextProjectLink();
    syncNavMetrics();
    if (!event.matches) {
      closeSections();
    }
  });
})();

(function initSidebarScrollSpy() {
  const navLinks = document.querySelectorAll('.project-sidebar .sidebar-links a[href^="#"]');
  if (!navLinks.length) return;

  const sections = [];

  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) {
      sections.push({ id, section, link });
    }
  });

  if (!sections.length) return;

  let scrollTicking = false;

  function setActiveLink(activeId) {
    sections.forEach(({ id, link }) => {
      const isActive = id === activeId;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveSection() {
    const viewportCenter = window.innerHeight / 2;
    let activeId = sections[0].id;
    let minDistance = Infinity;

    sections.forEach(({ id, section }) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        return;
      }

      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < minDistance) {
        minDistance = distance;
        activeId = id;
      }
    });

    setActiveLink(activeId);
  }

  function scheduleActiveUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  }

  updateActiveSection();
  window.addEventListener('scroll', scheduleActiveUpdate, { passive: true });
  window.addEventListener('resize', updateActiveSection);
})();

(function initSidebarNextPreview() {
  const nextLink = document.querySelector('.sidebar-next');
  const preview = document.querySelector('.sidebar-next-preview');

  if (!nextLink || !preview) {
    return;
  }

  const viewportPadding = 12;
  const pointerOffset = 6;
  let isVisible = false;

  const placePreview = (clientX, clientY) => {
    const rect = preview.getBoundingClientRect();
    let left = clientX + pointerOffset;
    let top = clientY + pointerOffset;

    if (left + rect.width + viewportPadding > window.innerWidth) {
      left = clientX - rect.width - pointerOffset;
    }

    if (top + rect.height + viewportPadding > window.innerHeight) {
      top = clientY - rect.height - pointerOffset;
    }

    left = Math.max(
      viewportPadding + rect.width / 2,
      Math.min(left, window.innerWidth - viewportPadding - rect.width / 2)
    );
    top = Math.max(
      viewportPadding + rect.height / 2,
      Math.min(top, window.innerHeight - viewportPadding - rect.height / 2)
    );

    preview.style.left = `${left}px`;
    preview.style.top = `${top}px`;
  };

  const showPreview = (event) => {
    isVisible = true;
    preview.classList.add('is-visible');
    if (event) {
      placePreview(event.clientX, event.clientY);
    }
  };

  const hidePreview = () => {
    isVisible = false;
    preview.classList.remove('is-visible');
  };

  nextLink.addEventListener('pointerenter', showPreview);
  nextLink.addEventListener('pointermove', (event) => {
    if (isVisible) {
      placePreview(event.clientX, event.clientY);
    }
  });
  nextLink.addEventListener('pointerleave', hidePreview);
  nextLink.addEventListener('focus', () => {
    const rect = nextLink.getBoundingClientRect();
    showPreview({
      clientX: rect.right,
      clientY: rect.top + rect.height / 2,
    });
  });
  nextLink.addEventListener('blur', hidePreview);
})();

function initTrubelLightbox(triggerSelector, lightboxId) {
  const trigger = document.querySelector(triggerSelector);
  const lightbox = document.getElementById(lightboxId);

  if (!trigger || !lightbox) {
    return;
  }

  const backdrop = lightbox.querySelector('[data-close-lightbox]');
  const backButton = lightbox.querySelector('.trubel-lightbox-back');
  let lastFocusedElement = null;

  function openLightbox() {
    lastFocusedElement = document.activeElement;
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('trubel-lightbox-open');
    backButton.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('trubel-lightbox-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  trigger.addEventListener('click', openLightbox);
  backButton.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

initTrubelLightbox('.color-coding-trigger:not(.blog-examples-trigger)', 'color-coding-lightbox');
initTrubelLightbox('.blog-examples-trigger', 'blog-examples-lightbox');
