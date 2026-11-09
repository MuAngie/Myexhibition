(() => {
  const stage = document.querySelector('.constellation');
  const canvas = document.querySelector('.starlight');
  const palette = { blue: 'oklch(80% .11 244)', contrast: 'oklch(87% .045 278)', material: 'oklch(84% .1 182)', neutral: 'oklch(83% .08 72)', heishui: 'oklch(79% .12 35)' };
  const seed = Math.floor(Math.random() * 2147483646) + 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function randomSource(initial) {
    let state = initial;
    return () => { state = state * 16807 % 2147483647; return (state - 1) / 2147483646; };
  }

  const random = randomSource(seed);
  const exhibits = window.EXHIBITION_DATA.map((item) => {
    const link = document.createElement('a');
    link.className = 'exhibit';
    link.id = item.id;
    link.href = item.href;
    link.setAttribute('aria-label', `${item.action}${item.archiveName || item.name.replace(/\n/g, '')}`);
    link.style.setProperty('--light', palette[item.theme] || palette.contrast);
    link.style.setProperty('--scale', (.68 + random() * .6).toFixed(3));
    link.style.setProperty('--glint-angle', `${-35 + random() * 70}deg`);
    link.style.setProperty('--float-range', `${6 + random() * 7}px`);
    link.style.setProperty('--duration', `${4 + random() * 3}s`);
    link.style.setProperty('--delay', `${-random() * 7}s`);
    link.innerHTML = '<span class="bubble-space" aria-hidden="true"><span class="aura"></span><span class="bubble"><span class="memory"></span></span><span class="reflection"></span></span><span class="caption"><h2></h2><p></p><span class="enter">进入展览 ↗</span></span>';
    const image = document.createElement('img');
    image.src = item.coverImage;
    image.alt = '';
    image.decoding = 'async';
    link.querySelector('.memory').append(image);
    link.querySelector('h2').textContent = item.archiveName || item.name.replace(/\n/g, '');
    link.querySelector('.caption p').textContent = item.tags.join(' · ');
    stage.append(link);
    return link;
  });

  // 每次打开换一组随机位置；调整窗口时保持同一随机种子。
  function arrange() {
    const width = stage.clientWidth;
    const cardWidth = Math.max(160, ...exhibits.map((link) => link.offsetWidth));
    const cardHeight = Math.max(0, ...exhibits.map((link) => link.offsetHeight)) + 28;
    const margin = width < 600 ? 16 : 48;
    if (width < 600) {
      const pick = randomSource(seed);
      const columns = Math.max(1, Math.floor((width - margin * 2) / (cardWidth + 8)));
      const cellWidth = (width - margin * 2) / columns;
      const slots = Array.from({ length: Math.ceil(exhibits.length / columns) * columns }, (_, index) => index);
      for (let index = slots.length - 1; index > 0; index--) {
        const other = Math.floor(pick() * (index + 1));
        [slots[index], slots[other]] = [slots[other], slots[index]];
      }
      exhibits.forEach((link, index) => {
        const slot = slots[index];
        link.style.left = `${margin + slot % columns * cellWidth + pick() * (cellWidth - cardWidth)}px`;
        link.style.top = `${40 + Math.floor(slot / columns) * (cardHeight + 55) + pick() * 45}px`;
      });
      stage.style.height = `${80 + Math.ceil(exhibits.length / columns) * (cardHeight + 55)}px`;
      return;
    }
    const sizes = exhibits.map((link) => ({ w: link.offsetWidth, h: link.offsetHeight + 32 }));
    let height = Math.max(innerHeight - 220, 580, Math.ceil(sizes.reduce((area, size) => area + (size.w + 24) * size.h, 0) / (width * .55)));
    let positions = [];

    for (let attempt = 0; ; attempt++) {
      const pick = randomSource(seed + attempt * 7919);
      positions = [];
      let packed = true;
      for (const size of sizes) {
        let best;
        let bestScore = -1;
        for (let candidate = 0; candidate < 180; candidate++) {
          const point = { x: margin + pick() * Math.max(0, width - size.w - margin * 2), y: 40 + pick() * Math.max(0, height - size.h - 80), ...size };
          const score = positions.length ? Math.min(...positions.map((other) => Math.max(Math.abs(point.x + point.w / 2 - other.x - other.w / 2) / ((point.w + other.w) / 2 + 24), Math.abs(point.y + point.h / 2 - other.y - other.h / 2) / ((point.h + other.h) / 2)))) : 1;
          if (score > bestScore) { best = point; bestScore = score; }
        }
        positions.push(best);
        if (bestScore < 1) { packed = false; break; }
      }
      if (packed) break;
      if (attempt % 2) height = Math.ceil(height * 1.15);
    }
    stage.style.height = `${height}px`;
    exhibits.forEach((link, index) => {
      link.style.left = `${positions[index].x}px`;
      link.style.top = `${positions[index].y}px`;
    });
  }

  function paintStars() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    const context = canvas.getContext('2d');
    context.scale(ratio, ratio);
    const pick = randomSource(seed + 1);
    const count = Math.min(1400, Math.max(250, Math.round(innerWidth * innerHeight / 1100)));
    for (let index = 0; index < count; index++) {
      const x = pick() * innerWidth;
      const y = pick() * innerHeight;
      const bright = pick() > .94;
      const radius = bright ? 1.1 + pick() * .7 : .3 + pick() * .7;
      context.fillStyle = `rgba(188, 206, 235, ${bright ? .65 + pick() * .3 : .15 + pick() * .45})`;
      context.shadowBlur = bright ? 8 : 0;
      context.shadowColor = 'rgba(147, 185, 245, .7)';
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  const sparkles = document.createElement('div');
  sparkles.className = 'sparkles';
  sparkles.setAttribute('aria-hidden', 'true');
  const starRandom = randomSource(seed + 2);
  for (let index = 0; index < 28; index++) {
    const star = document.createElement('span');
    star.className = 'sparkle';
    star.style.setProperty('--star-x', `${starRandom() * 100}%`);
    star.style.setProperty('--star-y', `${starRandom() * 100}%`);
    star.style.setProperty('--star-size', `${1.4 + starRandom() * 1.4}px`);
    star.style.setProperty('--star-duration', `${3 + starRandom() * 6}s`);
    star.style.setProperty('--star-delay', `${-starRandom() * 9}s`);
    sparkles.append(star);
  }
  canvas.after(sparkles);

  let pointerFrame;
  stage.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 8}px`);
      stage.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 6}px`);
    });
  });
  stage.addEventListener('pointerleave', () => {
    cancelAnimationFrame(pointerFrame);
    stage.style.setProperty('--pointer-x', '0px');
    stage.style.setProperty('--pointer-y', '0px');
  });

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { arrange(); paintStars(); });
  });
  arrange();
  paintStars();
})();
