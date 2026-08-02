(() => {
  'use strict';

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  document.getElementById('year').textContent = new Date().getFullYear();

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  document.querySelectorAll('[data-lightbox]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.lightbox;
      lightbox.showModal();
    });
  });
  lightbox?.querySelector('.lightbox__close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', (event) => {
    const box = lightbox.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) lightbox.close();
  });

  const toast = document.getElementById('toast');
  document.getElementById('linkedin-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    toast?.classList.add('is-visible');
    window.setTimeout(() => toast?.classList.remove('is-visible'), 2500);
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
