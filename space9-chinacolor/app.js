(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const photos = window.CHINACOLOR_PHOTOS;
  const groups = window.CHINACOLOR_GROUPS;
  const path = (photo, folder = 'photos') => `assets/${folder}/IMG_${photo.id}.webp`;
  const original = photo => `IMG_${photo.id}.JPG`;
  const number = n => String(n).padStart(2, '0');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 1, visible = photos.map((_, i) => i), group = -1;
  let scale = 1, x = 0, y = 0, drag = null;

  document.querySelector('.header-end').append(document.querySelector('.experience-feeling-trigger'));
  $('feeling-slot').append(document.querySelector('.experience-feeling-panel'));
  const textarea = document.querySelector('.experience-feeling-panel textarea');
  textarea.id = 'exhibition-feeling';
  document.querySelector('.experience-feeling-panel label').htmlFor = textarea.id;
  $('write-feeling').addEventListener('click', () => {
    if (document.querySelector('.experience-feeling-panel').hidden) document.querySelector('.experience-feeling-trigger').click();
    textarea.focus();
  });
  document.querySelector('.experience-feeling-trigger').addEventListener('click', () => {
    if (!document.querySelector('.experience-feeling-panel').hidden) $('feeling-slot').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });

  function updateButtons() {
    const position = visible.indexOf(current);
    for (const id of ['previous', 'viewer-prev']) $(id).disabled = position === 0;
    for (const id of ['next', 'viewer-next']) $(id).disabled = position === visible.length - 1;
  }

  function showPhoto(index, scroll = false) {
    current = index;
    const item = photos[current];
    $('photo').src = path(item);
    $('photo').alt = item.alt;
    $('photo').width = item.width;
    $('photo').height = item.height;
    $('photo-open').setAttribute('aria-label', `放大照片：${item.title}`);
    $('photo-title').textContent = item.title;
    $('photo-reference').textContent = `${item.role} / IMG_${item.id}`;
    $('gallery').dataset.tone = groups[item.group].tone;
    $('read-chapter').textContent = `读${item.group === 5 ? '展览前言' : groups[item.group].name + '釉展文'} ↗`;
    $('counter').innerHTML = `${number(visible.indexOf(current) + 1)} <span>/ ${number(visible.length)}</span>`;
    $('photo-stage').classList.toggle('reading', ['前言', '展文'].includes(item.role));
    $('filmstrip').querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.index) === current)));
    const selected = $('filmstrip').querySelector('[aria-current="true"]');
    if (selected) $('filmstrip').scrollTo({ left: selected.offsetLeft - $('filmstrip').offsetLeft - ($('filmstrip').clientWidth - selected.clientWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    updateButtons();
    if ($('viewer').open) updateViewer();
    else if (scroll) $('photo-stage').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function selectGroup(index, preserve = false, scroll = false) {
    group = index;
    visible = photos.map((item, i) => group === -1 || item.group === group ? i : -1).filter(i => i !== -1);
    [...$('groups').children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === group)));
    $('all-photos').setAttribute('aria-pressed', String(group === -1));
    $('chapter-kicker').textContent = group < 0 ? '红 · 蓝 · 黄 · 白 · 青 · 其他' : `${groups[group].name}${group === 5 ? '' : '釉'} · ${visible.length} 张留影`;
    $('chapter-title').textContent = group < 0 ? '这一场，留在照片里。' : groups[group].title;
    $('chapter-copy').textContent = group < 0 ? '从器物到釉面，从完整轮廓到细部，慢慢看。' : groups[group].copy;
    $('filmstrip').replaceChildren(...visible.map(index => {
      const item = photos[index];
      const button = document.createElement('button');
      button.dataset.index = index;
      button.setAttribute('aria-label', `${number(index + 1)} ${item.title}`);
      const img = document.createElement('img');
      img.src = path(item, 'thumbs');
      img.alt = '';
      img.loading = 'lazy';
      img.width = 59;
      img.height = 76;
      const label = document.createElement('span');
      label.className = 'thumb-number';
      label.textContent = number(index + 1);
      label.setAttribute('aria-hidden', 'true');
      button.append(img, label);
      button.addEventListener('click', () => showPhoto(index));
      return button;
    }));
    const first = group < 0 ? 1 : photos.findIndex(item => item.id === groups[group].first);
    showPhoto(preserve && visible.includes(current) ? current : first, scroll);
  }

  function move(delta, scroll = false) {
    const next = visible[visible.indexOf(current) + delta];
    if (next !== undefined) showPhoto(next, scroll);
  }

  function zoom(value) {
    scale = Math.max(1, Math.min(5, value));
    const image = $('full-image'), viewport = $('image-viewport');
    const maxX = Math.max(0, (image.clientWidth * scale - viewport.clientWidth) / 2);
    const maxY = Math.max(0, (image.clientHeight * scale - viewport.clientHeight) / 2);
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    if (scale === 1) x = y = 0;
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    $('zoom-reset').textContent = `${Math.round(scale * 100)}%`;
    viewport.classList.toggle('zoomed', scale > 1);
    $('zoom-out').disabled = scale === 1;
    $('zoom-in').disabled = scale === 5;
  }

  function updateViewer() {
    const item = photos[current];
    $('full-image').src = original(item);
    $('full-image').alt = item.alt;
    $('viewer-title').textContent = item.title;
    $('viewer-reference').textContent = `${item.role} / IMG_${item.id} · ${number(visible.indexOf(current) + 1)} / ${number(visible.length)}`;
    $('original-link').href = original(item);
    drag = null;
    zoom(1);
  }

  groups.forEach((item, i) => {
    const button = document.createElement('button');
    button.innerHTML = `<span class="color-name">${item.name}</span><span class="color-text">${item.title}<span class="color-count">${item.photos.length} 张</span></span>`;
    button.dataset.tone = item.tone;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectGroup(i));
    $('groups').append(button);
  });
  function openForeword() { selectGroup(5); showPhoto(photos.findIndex(item => item.id === '5350'), true); }
  $('all-photos').addEventListener('click', () => selectGroup(-1, true));
  $('read-chapter').addEventListener('click', () => {
    const chapterGroup = group < 0 ? photos[current].group : group;
    showPhoto(photos.findIndex(item => item.id === groups[chapterGroup].chapter), true);
  });
  $('foreword').addEventListener('click', openForeword);
  $('source-foreword').addEventListener('click', openForeword);
  $('previous').addEventListener('click', () => move(-1, false));
  $('next').addEventListener('click', () => move(1, false));
  $('photo-open').addEventListener('click', () => { updateViewer(); $('viewer').showModal(); zoom(1); });
  $('viewer-close').addEventListener('click', () => $('viewer').close());
  $('viewer').addEventListener('close', () => { drag = null; zoom(1); $('photo-open').focus({ preventScroll: true }); });
  $('viewer-prev').addEventListener('click', () => move(-1));
  $('viewer-next').addEventListener('click', () => move(1));
  $('zoom-in').addEventListener('click', () => zoom(scale + .5));
  $('zoom-out').addEventListener('click', () => zoom(scale - .5));
  $('zoom-reset').addEventListener('click', () => zoom(1));
  $('image-viewport').addEventListener('dblclick', () => zoom(scale === 1 ? 2 : 1));
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
  window.addEventListener('resize', () => { if ($('viewer').open) zoom(scale); });
  window.addEventListener('keydown', event => {
    if (event.target.closest('textarea, input, select, summary') || !document.querySelector('.experience-feeling-panel').hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    if ($('viewer').open && ['+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); zoom(event.key === '0' ? 1 : scale + (event.key === '-' ? -.5 : .5)); }
  });
  selectGroup(-1, true, false);
})();
