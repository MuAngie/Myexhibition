(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const chapters = window.AJASHA_CHAPTERS;
  const scenes = window.AJASHA_SCENES;
  const photoPath = id => `assets/photos/IMG_${id}.webp`;
  let chapter = 0, index = 0, scene = 3, view = 'intro', returnView = 'intro';
  let viewerKind = 'photo', scale = 1, x = 0, y = 0, drag = null;

  function setView(next) {
    view = next;
    document.body.dataset.view = next;
    $('intro').hidden = next !== 'intro';
    $('exhibition').hidden = next !== 'exhibition';
    $('space').hidden = next !== 'space';
    $('space-toggle').setAttribute('aria-pressed', String(next === 'space'));
    $('space-toggle').innerHTML = next === 'space' ? '返回观看 <span aria-hidden="true">↙</span>' : '只看空间 <span aria-hidden="true">⤢</span>';
    $('scene-original').hidden = next !== 'space';
    document.querySelectorAll('.chapter').forEach((button, i) => button.setAttribute('aria-current', String(next === 'exhibition' && i === chapter)));
    window.scrollTo(0, 0);
  }

  function showScene(i) {
    scene = i;
    $('backdrop').src = photoPath(scenes[i][0]);
    $('scene-caption').textContent = `现场一瞥 · ${scenes[i][1]}`;
    [...$('scenes').children].forEach((button, n) => button.setAttribute('aria-current', String(i === n)));
  }

  function showPhoto() {
    const item = chapters[chapter].photos[index];
    $('photo').src = photoPath(item[0]);
    $('photo').alt = item[1];
    $('photo-title').textContent = item[1];
    $('photo-kind').textContent = item[2];
    $('photo-reference').textContent = `现场留影 / IMG_${item[0]}`;
    $('counter').textContent = `${String(index + 1).padStart(2, '0')} / ${chapters[chapter].photos.length}`;
    $('previous').disabled = index === 0;
    $('next').disabled = index === chapters[chapter].photos.length - 1;
    [...$('filmstrip').children].forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    const selected = $('filmstrip').children[index];
    if (selected) $('filmstrip').scrollTo({ left: selected.offsetLeft - $('filmstrip').offsetLeft - $('filmstrip').clientWidth / 2 + selected.clientWidth / 2 });
    if (view === 'exhibition' && !$('viewer').open) window.scrollTo(0, 0);
  }

  function selectChapter(i) {
    chapter = i;
    index = 0;
    const group = chapters[i];
    $('chapter-number').textContent = `第 ${String(i + 1).padStart(2, '0')} 章 / ${group.photos.length} 张留影`;
    $('chapter-title').textContent = group.title.replace(/^(侦探小说|阿加莎|从书页)/, '$1\n');
    $('chapter-description').textContent = group.description;
    $('filmstrip').replaceChildren(...group.photos.map((item, n) => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', `第 ${n + 1} 张：${item[1]}`);
      const img = document.createElement('img');
      img.src = `assets/thumbs/IMG_${item[0]}.webp`;
      img.alt = '';
      img.loading = 'lazy';
      button.append(img);
      button.addEventListener('click', () => { index = n; showPhoto(); });
      return button;
    }));
    setView('exhibition');
    showScene(group.scene);
    showPhoto();
  }

  function move(delta) {
    if ($('viewer').open && viewerKind === 'scene') {
      showScene(Math.max(0, Math.min(scenes.length - 1, scene + delta)));
    } else {
      index = Math.max(0, Math.min(chapters[chapter].photos.length - 1, index + delta));
      showPhoto();
    }
    if ($('viewer').open) updateViewer();
  }

  function transform() {
    $('full-image').style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    $('zoom-reset').textContent = `${Math.round(scale * 100)}%`;
    $('image-viewport').classList.toggle('zoomed', scale > 1);
  }

  function zoom(next) {
    scale = Math.max(1, Math.min(5, next));
    if (scale === 1) x = y = 0;
    transform();
  }

  function updateViewer() {
    const item = viewerKind === 'scene' ? scenes[scene] : chapters[chapter].photos[index];
    $('full-image').src = photoPath(item[0]);
    $('full-image').alt = item[1];
    $('viewer-title').textContent = item[1];
    $('viewer-reference').textContent = `现场留影 / IMG_${item[0]}`;
    $('original-link').href = `reference/IMG_${item[0]}.JPG`;
    const current = viewerKind === 'scene' ? scene : index;
    const length = viewerKind === 'scene' ? scenes.length : chapters[chapter].photos.length;
    $('viewer-prev').disabled = current === 0;
    $('viewer-next').disabled = current === length - 1;
    zoom(1);
  }

  function openViewer(kind) {
    viewerKind = kind;
    updateViewer();
    $('viewer').showModal();
    document.body.style.overflow = 'hidden';
    $('viewer-close').focus();
  }

  chapters.forEach((group, i) => {
    const button = document.createElement('button');
    button.className = 'chapter';
    button.innerHTML = `<span class="chapter-number">0${i + 1}</span><span class="chapter-name">${group.short}<small>${group.photos.length} 张现场留影</small></span>`;
    button.addEventListener('click', () => selectChapter(i));
    $('chapters').append(button);
  });
  scenes.forEach((item, i) => {
    const button = document.createElement('button');
    button.innerHTML = `<img src="assets/thumbs/IMG_${item[0]}.webp" alt=""><span>${item[1]}</span>`;
    button.addEventListener('click', () => showScene(i));
    $('scenes').append(button);
  });
  $('home').addEventListener('click', () => { setView('intro'); showScene(3); });
  $('enter').addEventListener('click', () => selectChapter(0));
  $('space-toggle').addEventListener('click', () => {
    if (view === 'space') setView(returnView);
    else { returnView = view; setView('space'); }
  });
  $('previous').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('photo-open').addEventListener('click', () => openViewer('photo'));
  $('scene-original').addEventListener('click', () => openViewer('scene'));
  $('viewer-close').addEventListener('click', () => $('viewer').close());
  $('viewer').addEventListener('close', () => { document.body.style.overflow = ''; });
  $('viewer-prev').addEventListener('click', () => move(-1));
  $('viewer-next').addEventListener('click', () => move(1));
  $('zoom-in').addEventListener('click', () => zoom(scale + .5));
  $('zoom-out').addEventListener('click', () => zoom(scale - .5));
  $('zoom-reset').addEventListener('click', () => zoom(1));
  $('image-viewport').addEventListener('wheel', event => {
    event.preventDefault();
    zoom(scale + (event.deltaY > 0 ? -.2 : .2));
  }, { passive: false });
  $('image-viewport').addEventListener('pointerdown', event => {
    if (scale <= 1) return;
    drag = { startX: event.clientX, startY: event.clientY, x, y };
    $('image-viewport').setPointerCapture(event.pointerId);
  });
  $('image-viewport').addEventListener('pointermove', event => {
    if (!drag) return;
    x = drag.x + event.clientX - drag.startX;
    y = drag.y + event.clientY - drag.startY;
    transform();
  });
  ['pointerup', 'pointercancel'].forEach(type => $('image-viewport').addEventListener(type, () => { drag = null; }));
  window.addEventListener('keydown', event => {
    if (event.target.closest('textarea,input') || !document.querySelector('.experience-feeling-panel')?.hidden) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (view !== 'exhibition' && !$('viewer').open) return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
    if (event.key === 'Escape' && view === 'space' && !$('viewer').open) setView(returnView);
  });
  showScene(3);
})();
