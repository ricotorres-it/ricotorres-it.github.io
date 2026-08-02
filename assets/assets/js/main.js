(() => {
  'use strict';

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  const closeNav = () => {
    nav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  };

  navToggle?.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = nav?.classList.toggle('is-open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    if (nav.contains(event.target) || navToggle?.contains(event.target)) return;
    closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('img');

  const closeLightbox = () => {
    if (lightbox?.open) lightbox.close();
  };

  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightbox || '';
      const thumbnail = button.querySelector('img');
      lightboxImage.alt = thumbnail?.alt ? `Expanded view: ${thumbnail.alt}` : 'Expanded project screenshot';
      lightbox.showModal();
    });
  });

  lightbox?.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  const toast = document.getElementById('toast');
  let toastTimer;
  document.getElementById('linkedin-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    window.clearTimeout(toastTimer);
    toast?.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast?.classList.remove('is-visible'), 2500);
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
