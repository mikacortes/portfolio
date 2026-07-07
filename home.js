/*
  HOME PAGE INTERACTIONS
  Shared by product/UX and graphic design landing pages.
*/
(function () {
  const body = document.body;
  const heroFontOptions = new Set([
    'architects-daughter',
    'caveat',
    'gloria-hallelujah',
    'handlee',
    'kalam',
    'patrick-hand',
    'reenie-beanie',
    'shadows-into-light',
  ]);

  if (body.classList.contains('home-page--product')) {
    const heroFont = new URLSearchParams(window.location.search).get('heroFont');
    if (heroFont && heroFontOptions.has(heroFont)) {
      body.dataset.heroFont = heroFont;
    }
  }

  const topbar = document.querySelector('.topbar');
  const heroCopies = document.querySelectorAll('.hero-copy');
  const revealCards = document.querySelectorAll('.reveal-card');
  const featuredMedias = document.querySelectorAll('.featured-media');

  function showSupportingUi() {
    topbar?.classList.add('is-visible-on-load');
    heroCopies.forEach((copy, index) => {
      window.setTimeout(() => {
        copy.classList.add('is-visible');
      }, index * 120);
    });
    body.classList.remove('preload-ui');
  }

  showSupportingUi();

  const filterBar = document.querySelector('.project-tag-filters');
  if (filterBar) {
    const filterButtons = Array.from(filterBar.querySelectorAll('.project-tag'));
    const filterableProjects = document.querySelectorAll('.featured-item[data-project-tags]');
    const projectsSection = document.getElementById('projects');
    const defaultFilter = filterBar.dataset.defaultFilter || 'all';

    function updateFilteredSections() {
      if (!projectsSection) return;
      const grid = projectsSection.querySelector('.featured-grid');
      if (!grid) return;
      const hasVisibleProject = Array.from(grid.children).some(
        (item) => !item.classList.contains('is-filter-hidden')
      );
      projectsSection.classList.toggle('is-filter-empty', !hasVisibleProject);
    }

    function applyProjectFilter(filter) {
      filterableProjects.forEach((project) => {
        const tags = (project.dataset.projectTags || '').trim().split(/\s+/);
        const isVisible = filter === 'all' || tags.includes(filter);
        project.classList.toggle('is-filter-hidden', !isVisible);
      });
      updateFilteredSections();
    }

    function setActiveFilterButton(button) {
      filterButtons.forEach((entry) => {
        const isActive = entry === button;
        entry.classList.toggle('is-active', isActive);
        entry.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setActiveFilterButton(button);
        applyProjectFilter(button.dataset.filter || 'all');
      });
    });

    const defaultButton =
      filterButtons.find((button) => button.dataset.filter === defaultFilter) || filterButtons[0];
    if (defaultButton) {
      setActiveFilterButton(defaultButton);
      applyProjectFilter(defaultButton.dataset.filter || 'all');
    }
  }

  featuredMedias.forEach((featuredMedia) => {
    const card = featuredMedia.closest('.featured-item');
    const cursor = card ? card.querySelector('.featured-cursor') : null;
    if (!cursor) return;

    function positionCursor(event) {
      const rect = featuredMedia.getBoundingClientRect();
      cursor.style.left = `${event.clientX - rect.left}px`;
      cursor.style.top = `${event.clientY - rect.top}px`;
    }

    featuredMedia.addEventListener('pointerenter', (event) => {
      positionCursor(event);
      card.classList.add('is-cursor-active');
    });

    featuredMedia.addEventListener('pointermove', positionCursor);

    featuredMedia.addEventListener('pointerleave', () => {
      card.classList.remove('is-cursor-active');
    });
  });

  document.querySelectorAll('video[data-playback-rate]').forEach((video) => {
    const rate = Number(video.dataset.playbackRate);
    if (Number.isFinite(rate) && rate > 0) {
      video.playbackRate = rate;
    }
  });

  let lastScrollY = window.scrollY;
  function handleHeaderScroll() {
    if (!topbar || topbar.classList.contains('is-menu-open')) return;

    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      topbar.classList.add('is-hidden');
    } else {
      topbar.classList.remove('is-hidden');
    }
    lastScrollY = Math.max(currentScrollY, 0);
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -20% 0px',
    }
  );

  revealCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      card.classList.add('is-revealed');
    }
    revealObserver.observe(card);
  });
})();
