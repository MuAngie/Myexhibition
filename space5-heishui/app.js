(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const chapters = window.HEISHUI_CHAPTERS;
  const photoPath = (id, thumbnail = false) => `assets/${thumbnail ? 'thumbs' : 'photos'}/IMG_${id}.webp`;
  const originalPath = (chapter, item) => `reference/${chapter.id}/IMG_${item[0]}.${item[2] === '视频' ? 'MOV' : 'JPG'}`;
  let chapter = chapters[0];
  let selected = 0;
  let sceneOnly = false;
  let viewerItems = [];
  let viewerIndex = 0;
  let viewerChapter = chapter;
  let scale = 1, panX = 0, panY = 0;
  let drag = null;
  const video = $('video');
  const viewer = $('viewer');
  new ResizeObserver(([entry]) => {
    entry.target.style.setProperty('--stage-height', `${entry.contentRect.height}px`);
  }).observe(document.querySelector('.media-stage'));

  chapters.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'chapter-link';
    button.dataset.chapter = item.id;
    button.innerHTML = `<span>${item.number}</span><strong>${item.short}</strong>`;
    button.addEventListener('click', () => goTo(item.id));
    $('chapters').append(button);
  });

  function stopVideo() {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  function setSceneOnly(value) {
    sceneOnly = value;
    document.body.classList.toggle('scene-only', value);
    $('scene-toggle').setAttribute('aria-pressed', String(value));
    $('scene-toggle').innerHTML = value ? '返回观看 <span aria-hidden="true">↙</span>' : '只看空间 <span aria-hidden="true">⤢</span>';
    $('scene-original').hidden = !value;
    if (value) video.pause();
  }

  function goTo(id) {
    if (location.hash.slice(1) === id) showChapter(id);
    else location.hash = id;
  }

  function showChapter(id) {
    chapter = chapters.find((item) => item.id === id) || chapters[0];
    selected = 0;
    setSceneOnly(false);
    stopVideo();
    const intro = chapter.id === 'main';
    $('intro').hidden = !intro;
    $('exhibition').hidden = intro;
    document.body.classList.toggle('browsing', !intro);
    $('backdrop').src = photoPath(chapter.background);
    $('scene-caption').textContent = `现场一瞥 · ${chapter.scene}`;
    document.querySelectorAll('.chapter-link').forEach((button) => {
      if (button.dataset.chapter === chapter.id) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    const videos = chapter.photos.filter((item) => item[2] === '视频').length;
    $('chapter-number').textContent = `${chapter.number} / ${chapter.photos.length - videos} 张照片${videos ? ` · ${videos} 段视频` : ''}`;
    $('chapter-title').textContent = chapter.title;
    $('chapter-description').textContent = chapter.description;
    $('filmstrip').replaceChildren();
    chapter.photos.forEach((item, index) => {
      const button = document.createElement('button');
      button.className = 'thumb';
      button.setAttribute('aria-label', `${index + 1}. ${item[1]}${item[2] === '视频' ? '，视频' : ''}`);
      button.title = item[1];
      const image = document.createElement('img');
      image.alt = '';
      image.loading = 'lazy';
      image.src = photoPath(item[2] === '视频' ? (item[0] === 4932 ? 4927 : 4933) : item[0], true);
      button.append(image);
      if (item[2] === '视频') {
        const play = document.createElement('span');
        play.className = 'play';
        play.textContent = '▷';
        play.setAttribute('aria-hidden', 'true');
        button.append(play);
      }
      button.addEventListener('click', () => showMedia(index));
      $('filmstrip').append(button);
    });
    if (!intro) showMedia(0);
    window.scrollTo(0, 0);
  }

  function showMedia(index) {
    selected = Math.max(0, Math.min(chapter.photos.length - 1, index));
    const item = chapter.photos[selected];
    const isVideo = item[2] === '视频';
    stopVideo();
    $('photo-open').hidden = isVideo;
    $('video-container').hidden = !isVideo;
    $('video-error').hidden = true;
    if (isVideo) {
      video.poster = photoPath(item[0] === 4932 ? 4927 : 4933);
      video.src = originalPath(chapter, item);
      $('video-download').href = video.src;
    } else {
      $('photo').src = photoPath(item[0]);
      $('photo').alt = item[1];
    }
    $('media-kind').textContent = item[2];
    $('media-title').textContent = item[1];
    $('media-reference').textContent = `现场记录 / IMG_${item[0]}`;
    $('counter').textContent = `${String(selected + 1).padStart(2, '0')} / ${chapter.photos.length}`;
    $('previous').disabled = selected === 0;
    $('next').disabled = selected === chapter.photos.length - 1;
    [...$('filmstrip').children].forEach((button, index) => button.setAttribute('aria-pressed', String(selected === index)));
    const thumb = $('filmstrip').children[selected];
    const strip = $('filmstrip');
    strip.scrollLeft = thumb.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
  }

  function openViewer(targetChapter, items, index) {
    video.pause();
    viewerChapter = targetChapter;
    viewerItems = items;
    viewerIndex = index;
    viewer.showModal();
    document.body.style.overflow = 'hidden';
    updateViewer();
    $('viewer-close').focus();
  }

  function transformImage() {
    const viewport = $('image-viewport');
    const img = $('full-image');
    const maxX = Math.max(0, (img.clientWidth * scale - viewport.clientWidth) / 2);
    const maxY = Math.max(0, (img.clientHeight * scale - viewport.clientHeight) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    $('zoom-reset').textContent = `${Math.round(scale * 100)}%`;
    viewport.classList.toggle('zoomed', scale > 1);
    $('zoom-out').disabled = scale === 1;
    $('zoom-in').disabled = scale === 4;
  }

  function zoom(value) {
    scale = Math.max(1, Math.min(4, value));
    if (scale === 1) panX = panY = 0;
    transformImage();
  }

  function updateViewer() {
    const item = viewerItems[viewerIndex];
    $('full-image').src = originalPath(viewerChapter, item);
    $('full-image').alt = item[1];
    $('viewer-title').textContent = item[1];
    $('viewer-count').textContent = `${viewerChapter.short} / ${viewerIndex + 1} · ${viewerItems.length}`;
    $('original-link').href = originalPath(viewerChapter, item);
    $('viewer-prev').disabled = viewerIndex === 0;
    $('viewer-next').disabled = viewerIndex === viewerItems.length - 1;
    zoom(1);
  }

  function viewerStep(delta) {
    const next = viewerIndex + delta;
    if (next < 0 || next >= viewerItems.length) return;
    viewerIndex = next;
    updateViewer();
  }

  $('home').addEventListener('click', () => goTo('main'));
  $('enter').addEventListener('click', () => goTo('1'));
  $('preface').addEventListener('click', () => openViewer(chapters[0], chapters[0].photos, 1));
  $('previous').addEventListener('click', () => showMedia(selected - 1));
  $('next').addEventListener('click', () => showMedia(selected + 1));
  $('photo-open').addEventListener('click', () => {
    const items = chapter.photos.filter((item) => item[2] !== '视频');
    openViewer(chapter, items, items.indexOf(chapter.photos[selected]));
  });
  $('scene-toggle').addEventListener('click', () => setSceneOnly(!sceneOnly));
  $('scene-original').addEventListener('click', () => {
    const sourceChapter = chapters.find((item) => item.id === (chapter.backgroundGroup || chapter.id));
    openViewer(sourceChapter, [[chapter.background, chapter.scene, '全景']], 0);
  });
  $('viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => { document.body.style.overflow = ''; });
  $('viewer-prev').addEventListener('click', () => viewerStep(-1));
  $('viewer-next').addEventListener('click', () => viewerStep(1));
  $('zoom-in').addEventListener('click', () => zoom(scale + .5));
  $('zoom-out').addEventListener('click', () => zoom(scale - .5));
  $('zoom-reset').addEventListener('click', () => zoom(1));
  $('full-image').addEventListener('load', transformImage);
  $('image-viewport').addEventListener('wheel', (event) => {
    event.preventDefault();
    zoom(scale + (event.deltaY < 0 ? .25 : -.25));
  }, { passive: false });
  $('image-viewport').addEventListener('pointerdown', (event) => {
    if (scale <= 1) return;
    drag = { x: event.clientX - panX, y: event.clientY - panY };
    $('image-viewport').setPointerCapture(event.pointerId);
    $('image-viewport').classList.add('dragging');
  });
  $('image-viewport').addEventListener('pointermove', (event) => {
    if (!drag) return;
    panX = event.clientX - drag.x;
    panY = event.clientY - drag.y;
    transformImage();
  });
  const stopDrag = () => { drag = null; $('image-viewport').classList.remove('dragging'); };
  $('image-viewport').addEventListener('pointerup', stopDrag);
  $('image-viewport').addEventListener('pointercancel', stopDrag);
  video.addEventListener('error', () => { if (video.getAttribute('src')) $('video-error').hidden = false; });
  window.addEventListener('hashchange', () => showChapter(location.hash.slice(1)));
  window.addEventListener('resize', () => { if (viewer.open) transformImage(); });
  window.addEventListener('keydown', (event) => {
    if (event.target.closest('textarea,input,video') || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape' && sceneOnly) setSceneOnly(false);
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    if (viewer.open) { event.preventDefault(); viewerStep(delta); }
    else if (chapter.id !== 'main' && !sceneOnly) { event.preventDefault(); showMedia(selected + delta); }
  });
  showChapter(location.hash.slice(1));
})();
