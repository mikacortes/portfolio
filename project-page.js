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
    const dotHalfWidth = Math.max(slides.length * 8 - 4, 0);
    carousel.style.setProperty('--carousel-dots-half', `${dotHalfWidth}px`);

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

(function initBondedImageCaptions() {
  if (!document.body.classList.contains('bonded-diamond-page')) return;

  const section = document.getElementById('overview');
  if (!section) return;

  const images = section.querySelectorAll(
    '.platform-preview-grid:not([data-bonded-static]) > img'
  );
  if (!images.length) return;

  function getOrientationLabel(img) {
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (width && height) {
      const ratio = width / height;
      if (Math.abs(ratio - 1) <= 0.05) return 'Square';
      if (ratio > 1) return 'Landscape';
      return 'Portrait';
    }

    const src = img.getAttribute('src') || img.dataset.src || '';
    const name = decodeURIComponent(src.split('/').pop() || '').toLowerCase();
    if (name.includes('square')) return 'Square';
    if (name.includes('portrait')) return 'Portrait';
    if (name.includes('landscape')) return 'Landscape';
    return 'Landscape';
  }

  function fixManualGridSwaps(grid) {
    if (!grid.classList.contains('bonded-manual-order')) return;

    const figures = Array.from(grid.querySelectorAll(':scope > .bonded-media-item'));
    const seventh = figures[7];
    const eighth = figures[8];
    if (!seventh || !eighth) return;

    const cap7 = seventh.querySelector('.bonded-media-caption')?.textContent?.trim();
    const cap8 = eighth.querySelector('.bonded-media-caption')?.textContent?.trim();

    if (cap7 === 'Portrait' && cap8 === 'Square') {
      eighth.insertAdjacentElement('beforebegin', seventh);
    }
  }

  function reorderGrid(grid) {
    if (grid.classList.contains('bonded-manual-order')) return;

    const imageFigures = Array.from(grid.querySelectorAll(':scope > .bonded-media-item'));
    if (!imageFigures.length) return;

    const landscape = [];
    const square = [];
    const portrait = [];

    imageFigures.forEach((figure) => {
      const caption = figure.querySelector('.bonded-media-caption');
      const label = caption?.textContent?.trim();

      if (label === 'Square') {
        square.push(figure);
      } else if (label === 'Portrait') {
        portrait.push(figure);
      } else {
        landscape.push(figure);
      }
    });

    const ordered = [];
    const maxLength = Math.max(landscape.length, square.length, portrait.length);
    for (let i = 0; i < maxLength; i += 1) {
      if (landscape[i]) ordered.push(landscape[i]);
      if (square[i]) ordered.push(square[i]);
      if (portrait[i]) ordered.push(portrait[i]);
    }

    const nonImageItems = Array.from(grid.children).filter(
      (child) => !child.classList.contains('bonded-media-item')
    );

    ordered.forEach((item) => grid.appendChild(item));
    nonImageItems.forEach((item) => grid.appendChild(item));
  }

  images.forEach((img) => {
    if (img.closest('.bonded-media-item')) return;

    const figure = document.createElement('figure');
    figure.className = 'platform-preview-item bonded-media-item';
    img.parentNode.insertBefore(figure, img);
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    caption.className = 'bonded-media-caption';
    caption.textContent = getOrientationLabel(img);
    figure.appendChild(caption);

    const grid = img.closest('.platform-preview-grid');

    if (!img.complete) {
      img.addEventListener(
        'load',
        () => {
          caption.textContent = getOrientationLabel(img);
          if (grid && grid.dataset.bondedStatic !== 'true') {
            reorderGrid(grid);
            fixManualGridSwaps(grid);
          }
        },
        { once: true }
      );
    }
  });

  const grids = section.querySelectorAll('.platform-preview-grid');
  grids.forEach((grid) => {
    if (grid.dataset.bondedStatic === 'true') return;
    reorderGrid(grid);
    fixManualGridSwaps(grid);
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

(function initSimilarProjects() {
  // Keep similar-project links aligned with each portfolio landing page featured grid.
  const PRODUCT_DESIGN_FEATURED = [
    'unlocked-labs',
    'trubel-co',
    'nenos',
    'furever-diamond',
  ];

  const GRAPHIC_DESIGN_FEATURED = [
    'wscuc',
    'bonded-diamond',
    'furever-diamond',
    'scriptchain-health-gd',
    'unlocked-labs',
    'trubel-co',
    'nenos',
  ];

  const GRAPHIC_DESIGN_CASE_STUDIES = new Set(['wscuc', 'bonded-diamond', 'scriptchain-health-gd']);

  const PORTFOLIO_PROJECTS = [
    {
      id: 'unlocked-labs',
      path: 'project.html',
      title: 'Designing a parole-prep dashboard for 500+ incarcerated learners',
      image: 'assets/images/Unlocked Labs Preview.png',
      similar: ['trubel-co', 'nenos', 'furever-diamond'],
    },
    {
      id: 'trubel-co',
      path: 'projects/trubel-co.html',
      title: 'Untangling workshop discovery and sign-up for an ed-tech nonprofit',
      image: 'assets/images/trubel_co Preview.png',
      similar: ['nenos', 'unlocked-labs', 'furever-diamond'],
    },
    {
      id: 'wscuc',
      path: 'projects/wscuc.html',
      title: "Designing the university's 2024 accreditation report",
      image: 'assets/images/WSCUC Preview.png',
      similar: ['furever-diamond', 'scriptchain-health-gd', 'bonded-diamond'],
    },
    {
      id: 'nenos',
      path: 'projects/nenos.html',
      title: 'Redesigning supporter flows for an ethical social media nonprofit',
      image: 'assets/images/nenos Preview.png',
      similar: ['trubel-co', 'unlocked-labs', 'furever-diamond'],
    },
    {
      id: 'bonded-diamond',
      path: 'projects/bonded-diamond.html',
      title: 'Advertising a luxury diamond jewelry brand',
      image: 'assets/images/Bonded Diamond Preview.png',
      similar: ['furever-diamond', 'scriptchain-health-gd', 'wscuc'],
    },
    {
      id: 'furever-diamond',
      path: 'projects/furever-diamond.html',
      title: 'Designing a memorial purchase experience for pet owners',
      image: 'assets/images/Furever Diamond Preview.jpg',
      similar: ['unlocked-labs', 'trubel-co', 'nenos'],
    },
    {
      id: 'scriptchain-product',
      path: 'projects/scriptchain-product.html',
      title: 'Designing product experiences for a healthcare startup',
      image: 'assets/images/ScriptChain Health Preview.png',
      similar: ['nenos', 'trubel-co', 'unlocked-labs'],
    },
    {
      id: 'learvo',
      path: 'projects/learvo.html',
      title: 'Designing new features and analyzing user behavior at an ed-tech startup',
      image: 'assets/images/Learvo Preview.png',
      similar: ['nenos', 'trubel-co', 'unlocked-labs'],
    },
    {
      id: 'scriptchain-health-gd',
      path: 'projects/scriptchain-health-gd.html',
      title: 'Leading marketing design for a healthcare startup',
      image: 'assets/images/ScriptChain Health Preview.png',
      similar: ['furever-diamond', 'unlocked-labs', 'trubel-co'],
    },
  ];

  function isInProjectsDir() {
    return /\/projects\/[^/]+\.html(?:$|[?#])/.test(window.location.pathname);
  }

  function resolvePortfolioPath(rootPath) {
    if (rootPath.startsWith('projects/')) {
      return isInProjectsDir() ? rootPath.slice('projects/'.length) : rootPath;
    }

    return isInProjectsDir() ? `../${rootPath}` : rootPath;
  }

  function getCurrentProjectId() {
    const path = window.location.pathname;

    if (/\/project\.html(?:$|[?#])/.test(path)) {
      return 'unlocked-labs';
    }

    const match = path.match(/\/projects\/([^/]+)\.html(?:$|[?#])/);
    return match ? match[1] : null;
  }

  function getFeaturedAllowlist(currentId) {
    if (GRAPHIC_DESIGN_CASE_STUDIES.has(currentId)) {
      return GRAPHIC_DESIGN_FEATURED;
    }

    return PRODUCT_DESIGN_FEATURED;
  }

  function pickSimilarProjects(currentId) {
    const current = PORTFOLIO_PROJECTS.find((project) => project.id === currentId);
    if (!current) return [];

    const allowlist = new Set(getFeaturedAllowlist(currentId));
    const curated = (current.similar ?? [])
      .map((projectId) => PORTFOLIO_PROJECTS.find((project) => project.id === projectId))
      .filter((project) => project && project.id !== currentId && allowlist.has(project.id));

    if (curated.length >= 3) {
      return curated.slice(0, 3);
    }

    const curatedIds = new Set(curated.map((project) => project.id));
    const backfill = getFeaturedAllowlist(currentId)
      .filter((projectId) => projectId !== currentId && !curatedIds.has(projectId))
      .map((projectId) => PORTFOLIO_PROJECTS.find((project) => project.id === projectId))
      .filter(Boolean);

    return [...curated, ...backfill].slice(0, 3);
  }

  const container = document.querySelector('.project-main .container');
  const currentId = getCurrentProjectId();
  if (!container || !currentId || container.querySelector('.similar-projects-section')) {
    return;
  }

  const similarProjects = pickSimilarProjects(currentId);
  if (!similarProjects.length) {
    return;
  }

  const section = document.createElement('section');
  section.className = 'project-section similar-projects-section';
  section.id = 'similar-projects';
  section.setAttribute('aria-labelledby', 'similar-projects-heading');

  const heading = document.createElement('h2');
  heading.id = 'similar-projects-heading';
  heading.textContent = 'Check out similar projects!';
  section.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'similar-projects-grid';

  similarProjects.forEach((project) => {
    const item = document.createElement('article');
    item.className = 'similar-project-item';

    const card = document.createElement('a');
    card.className = 'similar-project-card card';
    card.href = resolvePortfolioPath(project.path);

    const media = document.createElement('span');
    media.className = 'similar-project-media';

    const image = document.createElement('img');
    image.src = resolvePortfolioPath(project.image);
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';

    const cursor = document.createElement('span');
    cursor.className = 'featured-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML =
      '<span>View Case Study</span>' +
      `<span class="featured-cursor-arrow" aria-hidden="true"><img src="${resolvePortfolioPath('assets/icons/Arrow up-right.svg')}" alt="" /></span>`;

    const title = document.createElement('p');
    title.className = 'similar-project-title';
    title.textContent = project.title;

    media.appendChild(image);
    card.appendChild(media);
    item.appendChild(card);
    item.appendChild(cursor);
    item.appendChild(title);
    grid.appendChild(item);
  });

  section.appendChild(grid);
  container.appendChild(section);

  initSimilarProjectCursors(section);
})();

function initSimilarProjectCursors(root = document) {
  root.querySelectorAll('.similar-project-item').forEach((item) => {
    const media = item.querySelector('.similar-project-media');
    const cursor = item.querySelector('.featured-cursor');
    if (!media || !cursor || media.dataset.cursorInit === 'true') {
      return;
    }

    media.dataset.cursorInit = 'true';

    function positionCursor(event) {
      const rect = media.getBoundingClientRect();
      cursor.style.left = `${event.clientX - rect.left}px`;
      cursor.style.top = `${event.clientY - rect.top}px`;
    }

    media.addEventListener('pointerenter', (event) => {
      positionCursor(event);
      item.classList.add('is-cursor-active');
    });

    media.addEventListener('pointermove', positionCursor);

    media.addEventListener('pointerleave', () => {
      item.classList.remove('is-cursor-active');
    });
  });
}
