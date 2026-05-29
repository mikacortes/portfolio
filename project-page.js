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
