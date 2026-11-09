(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const media = window.DEATH_MEDIA;
  const groups = window.DEATH_GROUPS;
  const photoPath = (item, folder = 'photos') => `assets/${folder}/IMG_${item.id}.webp`;
  const originalPath = item => `reference/IMG_${item.id}.${item.type === 'video' ? 'MOV' : 'JPG'}`;
  const number = n => String(n).padStart(2, '0');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, group = -1, visible = media.map((_, i) => i);
  let scale = 1, x = 0, y = 0, drag = null, videoFailed = false;

  const feelingTrigger = document.querySelector('.experience-feeling-trigger');
  const feelingPanel = document.querySelector('.experience-feeling-panel');
  $('feeling-trigger-slot').append(feelingTrigger);
  $('feeling-slot').append(feelingPanel);
  const textarea = feelingPanel.querySelector('textarea');
  textarea.id = 'exhibition-feeling';
  feelingPanel.querySelector('label').htmlFor = textarea.id;
  textarea.placeholder = '此刻想起的人、还想做的事，或者一句想留住的话……';
  function goToFeeling() {
    if (feelingPanel.hidden) feelingTrigger.click();
    $('reflection').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    textarea.focus({ preventScroll: true });
  }
  $('write-feeling').addEventListener('click', goToFeeling);
  feelingTrigger.addEventListener('click', () => {
    if (!feelingPanel.hidden) {
      $('reflection').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
      textarea.focus({ preventScroll: true });
    }
  });
  function keepFeelingPosition() {
    const top = window.scrollY;
    queueMicrotask(() => { $('write-feeling').focus({ preventScroll: true }); window.scrollTo({ top, behavior: 'instant' }); });
  }
  feelingPanel.querySelector('.experience-feeling-close').addEventListener('click', keepFeelingPosition, { capture: true });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !feelingPanel.hidden && !$('viewer').open) keepFeelingPosition();
  }, { capture: true });

  function photoSequence() { return visible.filter(i => media[i].type !== 'video'); }
  function updateButtons() {
    const position = visible.indexOf(current);
    $('previous').disabled = position === 0;
    $('next').disabled = position === visible.length - 1;
    const sequence = photoSequence(), photoPosition = sequence.indexOf(current);
    $('viewer-prev').disabled = photoPosition <= 0;
    $('viewer-next').disabled = photoPosition === sequence.length - 1;
  }

  function showMedia(index, scroll = false) {
    $('video').pause();
    current = index;
    const item = media[index], chapter = groups[item.group];
    const isVideo = item.type === 'video';
    $('photo-open').hidden = isVideo;
    $('video').hidden = !isVideo;
    $('video-error').hidden = !isVideo || !videoFailed;
    if (!isVideo) {
      $('photo').src = photoPath(item);
      $('photo').alt = item.alt;
      $('photo').width = item.width || 1800;
      $('photo').height = item.height || 2400;
    }
    $('photo-open').setAttribute('aria-label', `放大照片：${item.title}`);
    $('media-stage').classList.toggle('reading', Boolean(item.reading));
    $('current-group').textContent = chapter.name;
    $('group-question').textContent = chapter.question;
    $('group-description').textContent = chapter.description;
    $('media-reference').textContent = `${item.role} / IMG_${item.id}`;
    $('media-title').textContent = item.title;
    $('media-note').textContent = item.note;
    $('media-info').textContent = item.info || '';
    $('media-source').textContent = item.sourceNote || '';
    $('media-original').href = originalPath(item);
    $('media-original').textContent = isVideo ? '打开原视频 ↗' : '打开原片 ↗';
    $('media-type-hint').textContent = isVideo ? '现场拍摄片段 · 2.62 秒 · 点击播放' : item.reading ? '展文按阅读宽度展开 · 可继续向下滚动' : '完整保留现场构图 · 点击细看';
    $('counter').innerHTML = `${number(visible.indexOf(current) + 1)} <span>/ ${number(visible.length)}</span>`;
    $('filmstrip').querySelectorAll('button').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.index) === current)));
    const selected = $('filmstrip').querySelector('[aria-current="true"]');
    if (selected) $('filmstrip').scrollTo({ left: selected.offsetLeft - $('filmstrip').offsetLeft - ($('filmstrip').clientWidth - selected.clientWidth) / 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    updateButtons();
    if ($('viewer').open) updateViewer();
    if (scroll) $('gallery').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function selectGroup(index, preserve = false, scroll = false) {
    group = index;
    visible = media.map((item, i) => group === -1 || item.group === group ? i : -1).filter(i => i !== -1);
    [...$('groups').children].forEach((button, i) => button.setAttribute('aria-pressed', String(i - 1 === group)));
    $('filmstrip').replaceChildren(...visible.map(index => {
      const item = media[index], button = document.createElement('button');
      button.dataset.index = index;
      button.setAttribute('aria-label', `${number(index + 1)} ${item.type === 'video' ? '视频：' : ''}${item.title}`);
      const img = document.createElement('img');
      img.src = item.type === 'video' ? 'assets/video-poster.webp' : photoPath(item, 'thumbs');
      img.alt = '';
      img.loading = 'lazy';
      img.width = 48;
      img.height = 64;
      const label = document.createElement('span');
      label.className = 'thumb-number';
      label.textContent = number(index + 1);
      label.setAttribute('aria-hidden', 'true');
      button.append(img, label);
      if (item.type === 'video') {
        const play = document.createElement('span');
        play.className = 'video-mark'; play.textContent = '▷'; play.setAttribute('aria-hidden', 'true');
        button.append(play);
      }
      button.addEventListener('click', () => showMedia(index, $('gallery').getBoundingClientRect().top < -250));
      return button;
    }));
    showMedia(preserve && visible.includes(current) ? current : visible[0], scroll);
  }

  function move(delta) {
    const sequence = $('viewer').open ? photoSequence() : visible;
    const index = sequence[sequence.indexOf(current) + delta];
    if (index !== undefined) showMedia(index, !$('viewer').open && $('gallery').getBoundingClientRect().top < -350);
  }

  function zoom(value) {
    scale = Math.max(1, Math.min(5, value));
    const image = $('full-image'), viewport = $('image-viewport');
    const maxX = Math.max(0, (image.clientWidth * scale - viewport.clientWidth) / 2);
    const maxY = Math.max(0, (image.clientHeight * scale - viewport.clientHeight) / 2);
    x = Math.max(-maxX, Math.min(maxX, x)); y = Math.max(-maxY, Math.min(maxY, y));
    if (scale === 1) x = y = 0;
    image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    $('zoom-reset').textContent = `${Math.round(scale * 100)}%`;
    $('image-viewport').classList.toggle('zoomed', scale > 1);
    $('zoom-out').disabled = scale === 1; $('zoom-in').disabled = scale === 5;
  }

  function updateViewer() {
    const item = media[current];
    $('full-image').src = originalPath(item); $('full-image').alt = item.alt;
    $('viewer-title').textContent = item.title;
    $('viewer-reference').textContent = `${item.role} / IMG_${item.id} · ${number(visible.indexOf(current) + 1)} / ${number(visible.length)}`;
    $('original-link').href = originalPath(item);
    drag = null; zoom(1);
  }

  [{ name: '全部' }, ...groups].forEach((chapter, i) => {
    const button = document.createElement('button');
    button.innerHTML = `${chapter.name}<span>${i ? media.filter(item => item.group === i - 1).length : media.length}</span>`;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => selectGroup(i - 1, false, $('gallery').getBoundingClientRect().top < -350));
    $('groups').append(button);
  });
  document.querySelectorAll('[data-show-media]').forEach(button => button.addEventListener('click', () => {
    selectGroup(-1, true); showMedia(media.findIndex(item => item.id === Number(button.dataset.showMedia)), true);
  }));
  $('read-foreword').addEventListener('click', () => { selectGroup(0); showMedia(media.findIndex(item => item.id === 5549), true); });
  $('previous').addEventListener('click', () => move(-1)); $('next').addEventListener('click', () => move(1));
  $('photo-open').addEventListener('click', () => { $('video').pause(); updateViewer(); $('viewer').showModal(); zoom(1); });
  $('viewer-close').addEventListener('click', () => $('viewer').close());
  $('viewer').addEventListener('close', () => { drag = null; zoom(1); $('photo-open').focus({ preventScroll: true }); });
  $('viewer-prev').addEventListener('click', () => move(-1)); $('viewer-next').addEventListener('click', () => move(1));
  $('zoom-in').addEventListener('click', () => zoom(scale + .5)); $('zoom-out').addEventListener('click', () => zoom(scale - .5));
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
    x = drag.x + event.clientX - drag.startX; y = drag.y + event.clientY - drag.startY; zoom(scale);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => $('image-viewport').addEventListener(type, () => { drag = null; }));
  function onVideoError() {
    videoFailed = true;
    if (media[current].type === 'video') $('video-error').hidden = false;
  }
  $('video').addEventListener('error', onVideoError);
  $('video').querySelector('source').addEventListener('error', onVideoError);
  $('back-top').addEventListener('click', event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); });
  window.addEventListener('resize', () => { if ($('viewer').open) zoom(scale); });
  window.addEventListener('keydown', event => {
    if (event.target.closest('textarea, input, select, summary, video') || !feelingPanel.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    if ($('viewer').open && ['+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); zoom(event.key === '0' ? 1 : scale + (event.key === '-' ? -.5 : .5)); }
  });
  selectGroup(-1);
})();
