(() => {
  'use strict';

  const exhibitions = Array.isArray(window.EXHIBITION_DATA) ? window.EXHIBITION_DATA : [];

  function twoDigits(number) {
    return String(number).padStart(2, '0');
  }

  function createImage(src, alt, loading) {
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    if (loading) image.loading = loading;
    return image;
  }

  function displayName(item) {
    return item.archiveName || item.name.replace('\n', '');
  }

  function createVisitTime(item) {
    const time = document.createElement('time');
    time.dateTime = item.visitMonth;
    time.textContent = `看展时间：${item.visitMonth.replace('-', '年')}月`;
    return time;
  }

  function createStatus(item, className) {
    const status = document.createElement('span');
    status.className = className;
    status.dataset.feelingStatus = item.feelingId;
    status.textContent = '尚未记录感受';
    return status;
  }

  function renderWall() {
    const wall = document.querySelector('#exhibition-wall-list');

    exhibitions.forEach((item, index) => {
      const tile = document.createElement('a');
      tile.className = `exhibition-tile tile-${item.theme || 'neutral'}`;
      tile.href = item.href;
      tile.id = item.id;
      tile.dataset.reveal = '';
      tile.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
      tile.setAttribute('aria-label', `${item.action}${displayName(item)}`);

      const media = document.createElement('span');
      media.className = 'tile-media';
      media.append(createImage(item.coverImage, item.coverAlt, index < 4 ? '' : 'lazy'));
      if (item.detailImage) {
        const detail = createImage(item.detailImage, item.detailAlt, 'lazy');
        detail.className = 'tile-detail';
        media.append(detail);
      }

      const action = document.createElement('span');
      action.className = 'tile-action';
      action.setAttribute('aria-hidden', 'true');
      action.textContent = '↗';

      const copy = document.createElement('span');
      copy.className = 'tile-copy';

      const tags = document.createElement('span');
      tags.className = 'tile-tags';
      item.tags.forEach((tag) => {
        const label = document.createElement('span');
        label.textContent = tag;
        tags.append(label);
      });
      if (item.visitMonth) {
        const label = document.createElement('span');
        label.append(createVisitTime(item));
        tags.append(label);
      }

      const heading = document.createElement('h2');
      heading.textContent = item.name;

      const description = document.createElement('span');
      description.className = 'tile-description';
      description.textContent = item.description;

      const foot = document.createElement('span');
      foot.className = 'tile-foot';
      const english = document.createElement('span');
      english.textContent = item.englishName;
      foot.append(english, createStatus(item, 'tile-status'));

      copy.append(tags, heading, description, foot);
      tile.append(media, action, copy);
      wall.append(tile);
    });
  }

  function renderArchive() {
    const list = document.querySelector('#archive-list');

    exhibitions.forEach((item, index) => {
      const link = document.createElement('a');
      link.className = 'archive-item';
      link.href = item.href;

      const number = document.createElement('span');
      number.className = 'archive-number';
      number.textContent = twoDigits(index + 1);

      const name = document.createElement('span');
      name.className = 'archive-name';
      name.textContent = displayName(item);

      const meta = document.createElement('span');
      meta.className = 'archive-meta';
      meta.textContent = item.tags.join(' · ');
      if (item.visitMonth) meta.append(document.createElement('br'), createVisitTime(item));

      const arrow = document.createElement('span');
      arrow.className = 'archive-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';

      link.append(number, name, meta, createStatus(item, 'archive-status'), arrow);
      list.append(link);
    });

    document.querySelectorAll('[data-exhibition-count]').forEach((count) => {
      count.textContent = twoDigits(exhibitions.length);
    });
  }

  function readObject(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch (error) {
      return {};
    }
  }

  function hasText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function updateStatuses() {
    const exhibitionFeelings = readObject('exhibition-experience-feelings-v1');
    const artworkFeelings = readObject('space3-artwork-thoughts');

    document.querySelectorAll('[data-feeling-status]').forEach((status) => {
      const id = status.dataset.feelingStatus;
      const hasFeeling = id === 'material-fields'
        ? Object.values(artworkFeelings).some(hasText)
        : hasText(exhibitionFeelings[id]?.text);
      status.textContent = hasFeeling ? '已记录感受' : '尚未记录感受';
      status.dataset.hasFeeling = String(hasFeeling);
    });
  }

  renderWall();
  renderArchive();
  updateStatuses();

  window.addEventListener('pageshow', updateStatuses);
  window.addEventListener('storage', updateStatuses);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tiles = [...document.querySelectorAll('[data-reveal]')];

  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    tiles.forEach((tile) => observer.observe(tile));
  } else {
    tiles.forEach((tile) => tile.classList.add('is-visible'));
  }
})();
