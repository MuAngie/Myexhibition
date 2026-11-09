(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const photos = window.MEINSIDE_PHOTOS;
  const groups = window.MEINSIDE_GROUPS;
  const path = (item, folder = 'photos') => `assets/${folder}/IMG_${item[0]}.webp`;
  const number = n => String(n).padStart(2, '0');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelector('.masthead').append(document.querySelector('.experience-feeling-trigger'));
  let current = 8, group = -1, visible = photos.map((_, i) => i);
  let request = 0, scale = 1, x = 0, y = 0, drag = null, swipe = null;

  function updateButtons() {
    const position = visible.indexOf(current);
    for (const id of ['previous', 'viewer-prev']) $(id).disabled = position === 0;
    for (const id of ['next', 'viewer-next']) $(id).disabled = position === visible.length - 1;
  }

  function showPhoto(index) {
    current = index;
    const item = photos[index];
    const token = ++request;
    $('photo').classList.remove('is-entering');
    $('photo').onload = () => {
      if (token !== request) return;
      $('photo').classList.add('is-entering');
    };
    $('photo').src = path(item);
    $('photo').alt = item[3];
    $('photo-title').textContent = item[1];
    $('photo-reference').textContent = `照片导览 · IMG_${item[0]}`;
    const position = visible.indexOf(index);
    $('counter').innerHTML = `${number(position + 1)} <span>/ ${number(visible.length)}</span>`;
    document.querySelectorAll('.filmstrip button').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.index) === index)));
    const selected = $('filmstrip').querySelector('[aria-current="true"]');
    if (selected) $('filmstrip').scrollTo({ left: selected.offsetLeft - $('filmstrip').offsetLeft - ($('filmstrip').clientWidth - selected.clientWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    updateButtons();
    if ($('viewer').open) updateViewer();
    const next = visible[position + 1];
    if (next !== undefined) { const preload = new Image(); preload.src = path(photos[next]); }
  }

  function selectGroup(index, preserve = false) {
    group = index;
    visible = photos.map((item, i) => item[2] === group || group === -1 ? i : -1).filter(i => i !== -1);
    [...$('groups').children].forEach((button, i) => button.setAttribute('aria-pressed', String(i - 1 === group)));
    $('filmstrip').replaceChildren(...visible.map(index => {
      const item = photos[index];
      const button = document.createElement('button');
      button.dataset.index = index;
      button.setAttribute('aria-label', `${number(index + 1)} ${item[1]}`);
      const img = document.createElement('img');
      img.src = path(item, 'thumbs');
      img.alt = '';
      img.loading = 'lazy';
      img.width = img.height = 66;
      const label = document.createElement('span');
      label.className = 'thumb-number';
      label.textContent = number(index + 1);
      label.setAttribute('aria-hidden', 'true');
      button.append(img, label);
      button.addEventListener('click', () => showPhoto(index));
      return button;
    }));
    showPhoto(preserve && visible.includes(current) ? current : visible[0]);
  }

  function move(delta) {
    const next = visible[visible.indexOf(current) + delta];
    if (next !== undefined) showPhoto(next);
  }

  function zoom(value) {
    scale = Math.max(1, Math.min(5, value));
    if (scale === 1) x = y = 0;
    $('full-image').style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    $('zoom-reset').textContent = `${Math.round(scale * 100)}%`;
    $('image-viewport').classList.toggle('zoomed', scale > 1);
    $('zoom-out').disabled = scale === 1;
    $('zoom-in').disabled = scale === 5;
  }

  function updateViewer() {
    const item = photos[current];
    $('full-image').src = path(item);
    $('full-image').alt = item[3];
    $('viewer-title').textContent = item[1];
    $('viewer-reference').textContent = `现场留影 · IMG_${item[0]}`;
    $('original-link').href = `reference/IMG_${item[0]}.JPG`;
    drag = null;
    zoom(1);
  }

  ['全部', ...groups].forEach((title, index) => {
    const button = document.createElement('button');
    const count = index === 0 ? photos.length : photos.filter(item => item[2] === index - 1).length;
    button.innerHTML = `${title}<span>${count}</span>`;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectGroup(index - 1));
    $('groups').append(button);
  });
  $('start').addEventListener('click', () => selectGroup(-1));
  $('foreword').addEventListener('click', () => { selectGroup(0); showPhoto(1); });
  $('previous').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('photo-open').addEventListener('click', () => { updateViewer(); $('viewer').showModal(); });
  $('viewer-close').addEventListener('click', () => $('viewer').close());
  $('viewer').addEventListener('close', () => { drag = null; $('photo-open').focus({ preventScroll: true }); });
  $('viewer-prev').addEventListener('click', () => move(-1));
  $('viewer-next').addEventListener('click', () => move(1));
  $('zoom-in').addEventListener('click', () => zoom(scale + .5));
  $('zoom-out').addEventListener('click', () => zoom(scale - .5));
  $('zoom-reset').addEventListener('click', () => zoom(1));
  $('image-viewport').addEventListener('wheel', event => { event.preventDefault(); zoom(scale + (event.deltaY > 0 ? -.2 : .2)); }, { passive: false });
  $('image-viewport').addEventListener('pointerdown', event => {
    if (scale <= 1) return;
    drag = { startX: event.clientX, startY: event.clientY, x, y };
    $('image-viewport').setPointerCapture(event.pointerId);
  });
  $('image-viewport').addEventListener('pointermove', event => {
    if (!drag) return;
    x = drag.x + event.clientX - drag.startX;
    y = drag.y + event.clientY - drag.startY;
    zoom(scale);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('image-viewport').addEventListener(type, () => { drag = null; });
  $('photo-stage').addEventListener('pointerdown', event => { if (event.pointerType === 'touch') swipe = { x: event.clientX, y: event.clientY }; });
  $('photo-stage').addEventListener('pointerup', event => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx > 0 ? -1 : 1);
  });
  $('photo-stage').addEventListener('pointercancel', () => { swipe = null; });
  window.addEventListener('keydown', event => {
    if (event.target.closest('textarea, input') || !document.querySelector('.experience-feeling-panel')?.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  selectGroup(-1, true);
})();
