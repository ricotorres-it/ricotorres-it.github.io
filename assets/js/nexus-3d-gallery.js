/* PrimeView Nexus actual-screenshot 3D carousel.
   Static-site equivalent of the requested React/Framer Motion component.
   No stock imagery or unredacted screenshots are used. */
(() => {
  'use strict';
  const gallery = document.querySelector('[data-project-detail="primeview-nexus"] [data-project-gallery]');
  const project = window.portfolioData?.projects?.find(item => item.slug === 'primeview-nexus');
  if (!gallery || !project || !Array.isArray(project.screenshots) || !project.screenshots.length) return;
  const images = project.screenshots;
  const names = images.map((_, index) => project.screenshotLabels?.[index] || `Screenshot ${index + 1}`);
  const base = document.body.dataset.base || '../../';
  const paths = images.map(path => new URL(base + path, location.href).href);
  const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const step = 360 / images.length;
  let current = 0;
  let pointerId = null, dragOrigin = 0, startingAngle = 0, dragging = false, ignoreClicksUntil = 0;
  let expanded = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  gallery.className = 'nx-3d-gallery';
  gallery.innerHTML = `
    <div class="nx-3d-layout">
      <div class="nx-3d-viewport" role="region" aria-roledescription="carousel" aria-label="Actual redacted Nexus screenshots" tabindex="0">
        <div class="nx-3d-cylinder">
          ${paths.map((src, i) => `<button class="nx-3d-face" type="button" data-nx-face="${i}" aria-label="View ${esc(names[i])}" style="--face:${i};--step:${step}deg">
            <img src="${esc(src)}" alt="${esc(names[i])} redacted Nexus interface" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
          </button>`).join('')}
        </div>
      </div>
      <div class="nx-3d-info">
        <div><span class="nx-3d-eyebrow">PRIMEVIEW NEXUS / LIVE UI</span><h3 data-nx-name></h3><p>Real application screenshot. Sensitive information blurred.</p></div>
        <div class="nx-3d-actions"><button type="button" data-nx-prev aria-label="Previous screenshot">←</button><span data-nx-count aria-live="polite"></span><button type="button" data-nx-next aria-label="Next screenshot">→</button><button type="button" data-nx-open>Expand <span aria-hidden="true">↗</span></button></div>
      </div>
    </div>
    <div class="nx-3d-strip" aria-label="Choose screenshot">
      ${paths.map((src, i) => `<button class="nx-3d-pick" data-nx-pick="${i}" type="button" aria-label="Select ${esc(names[i])}" aria-pressed="${i === 0}">
        <img src="${esc(src)}" alt="" loading="lazy" decoding="async"><span>${esc(names[i])}</span></button>`).join('')}
    </div>
    <div class="nx-3d-lightbox" role="dialog" aria-modal="true" aria-label="Nexus screenshot enlarged" hidden>
      <div class="nx-3d-lightbox-head"><strong data-nx-modal-title></strong><button type="button" data-nx-close aria-label="Close enlarged image">✕</button></div>
      <img data-nx-modal-image alt="">
    </div>`;
  const cylinder = gallery.querySelector('.nx-3d-cylinder');
  const viewport = gallery.querySelector('.nx-3d-viewport');
  const faces = [...gallery.querySelectorAll('[data-nx-face]')];
  const picks = [...gallery.querySelectorAll('[data-nx-pick]')];
  const dialog = gallery.querySelector('.nx-3d-lightbox');
  const modalImg = gallery.querySelector('[data-nx-modal-image]');
  const closeButton = gallery.querySelector('[data-nx-close]');
  let lastFocused = null;
  const normalize = n => (n % images.length + images.length) % images.length;
  const paint = (animate = true) => {
    cylinder.style.transition = animate && !reducedMotion.matches ? 'transform 650ms cubic-bezier(.2,.8,.2,1)' : 'none';
    cylinder.style.transform = `rotateY(${-current * step}deg)`;
    const active = normalize(current);
    gallery.querySelector('[data-nx-name]').textContent = names[active];
    gallery.querySelector('[data-nx-count]').textContent = `${String(active + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
    faces.forEach((face, i) => {
      const distance = Math.min(normalize(i - active), normalize(active - i));
      face.tabIndex = distance === 0 ? 0 : -1;
      face.setAttribute('aria-current', String(i === active));
    });
    picks.forEach((pick, i) => pick.setAttribute('aria-pressed', String(i === active)));
  };
  const goTo = value => { current = value; paint(); };
  const open = () => {
    expanded = true;
    const i = normalize(current);
    lastFocused = document.activeElement;
    modalImg.src = paths[i]; modalImg.alt = names[i] + ' — sensitive details blurred';
    gallery.querySelector('[data-nx-modal-title]').textContent = names[i];
    dialog.hidden = false; document.body.classList.add('nx-modal-open'); closeButton.focus();
  };
  const close = () => {
    if (!expanded) return;
    expanded = false; dialog.hidden = true; document.body.classList.remove('nx-modal-open');
    if (lastFocused?.isConnected) lastFocused.focus();
  };
  gallery.querySelector('[data-nx-prev]').addEventListener('click', () => goTo(current - 1));
  gallery.querySelector('[data-nx-next]').addEventListener('click', () => goTo(current + 1));
  gallery.querySelector('[data-nx-open]').addEventListener('click', open);
  closeButton.addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  picks.forEach((pick, i) => pick.addEventListener('click', () => goTo(i)));
  faces.forEach((face, i) => face.addEventListener('click', () => {
    if (dragging || Date.now() < ignoreClicksUntil) return;
    if (normalize(current) === i) open(); else goTo(current + ((i - normalize(current) + images.length) % images.length > images.length / 2 ? -(images.length - ((i - normalize(current) + images.length) % images.length)) : (i - normalize(current) + images.length) % images.length));
  }));
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0 || expanded) return;
    pointerId = e.pointerId; dragOrigin = e.clientX; startingAngle = current; dragging = false;
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', e => {
    if (e.pointerId !== pointerId) return;
    const distance = e.clientX - dragOrigin;
    if (Math.abs(distance) > 8) dragging = true;
    if (dragging) {
      cylinder.style.transition = 'none';
      cylinder.style.transform = `rotateY(${-startingAngle * step + distance * .14}deg)`;
    }
  });
  const stopDrag = e => {
    if (e.pointerId !== pointerId) return;
    const delta = e.clientX - dragOrigin;
    if (dragging) { current = startingAngle - Math.round(delta * .14 / step); ignoreClicksUntil = Date.now() + 240; }
    pointerId = null; paint();
    setTimeout(() => { dragging = false; }, 0);
  };
  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); goTo(current + (e.key === 'ArrowLeft' ? -1 : 1)); }
    if (e.key === 'Enter') { e.preventDefault(); open(); }
  });
  document.addEventListener('keydown', e => {
    if (!expanded) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); closeButton.focus(); }
  });
  paint(false);
})();
