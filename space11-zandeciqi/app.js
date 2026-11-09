(() => {
  'use strict';
  const { photos, groups } = window.EXHIBITION;
  const $ = (id) => document.getElementById(id);
  const photoPath = (id) => `assets/photos/IMG_${id}.webp`;
  const viewer = $('viewer');
  let activeFilter = 'all';
  let visiblePhotos = photos;
  let viewerPhotos = photos;
  let viewerIndex = 0;
  let lastTrigger;

  function renderArchive() {
    const query = $('search').value.trim().toLowerCase();
    visiblePhotos = photos.filter((photo) => (activeFilter === 'all' || photo.group === activeFilter) && `${photo.title} ${photo.meta} ${photo.tags} IMG_${photo.id}`.toLowerCase().includes(query));
    const fragment = document.createDocumentFragment();
    for (const photo of visiblePhotos) {
      const article = document.createElement('article');
      article.className = 'photo-card';
      const number = String(photos.indexOf(photo) + 1).padStart(2, '0');
      article.innerHTML = `<button data-photo="${photo.id}" aria-label="查看${photo.title}"><div class="thumb-wrap"><img src="assets/thumbs/IMG_${photo.id}.webp" alt="${photo.title}，现场照片" width="420" height="472" loading="lazy"><span class="photo-number">${number}</span></div><h3>${photo.title}</h3><p>${groups[photo.group].short} · IMG_${photo.id}</p></button>`;
      fragment.append(article);
    }
    $('photo-grid').replaceChildren(fragment);
    $('archive-count').textContent = `${visiblePhotos.length} 张现场照片${query ? `，搜索“${$('search').value.trim()}”` : '，按拍摄顺序排列'}`;
    $('empty-state').hidden = visiblePhotos.length !== 0;
  }

  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderArchive();
  }));
  $('search').addEventListener('input', renderArchive);

  function resetZoom() {
    $('viewer-stage').classList.remove('zoomed');
    $('zoom').setAttribute('aria-pressed', 'false');
    $('zoom').textContent = '放大细看 ＋';
    $('viewer-stage').scrollTo(0, 0);
  }

  function showPhoto() {
    const photo = viewerPhotos[viewerIndex];
    resetZoom();
    $('viewer-image').src = photoPath(photo.id);
    $('viewer-image').alt = `${photo.title}，完整现场照片`;
    $('viewer-image').width = Number(photo.id) === 5792 || ['5794', '5795', '5802', '5803', '5806'].includes(photo.id) ? 2000 : 1500;
    $('viewer-image').height = $('viewer-image').width === 2000 ? 1500 : 2000;
    $('viewer-title').textContent = photo.title;
    $('viewer-meta').textContent = photo.meta;
    $('viewer-note').textContent = photo.note;
    $('viewer-id').textContent = `IMG_${photo.id} · 2026.11.09`;
    $('viewer-group').textContent = groups[photo.group].name;
    $('viewer-counter').textContent = `${String(viewerIndex + 1).padStart(2, '0')} / ${viewerPhotos.length}`;
    $('viewer-evidence').textContent = `信息依据：${groups[photo.group].source}。观看提示含本页编辑解读。`;
    $('original').href = `reference/IMG_${photo.id}.JPG`;
    $('viewer-prev').disabled = viewerIndex === 0;
    $('viewer-next').disabled = viewerIndex === viewerPhotos.length - 1;
    viewer.querySelector('.viewer-content').scrollTop = 0;
    viewer.querySelector('.viewer-caption').scrollTop = 0;
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-photo]');
    if (!trigger) return;
    const id = trigger.dataset.photo;
    viewerPhotos = trigger.closest('#photo-grid') ? visiblePhotos : photos;
    viewerIndex = viewerPhotos.findIndex((photo) => photo.id === id);
    lastTrigger = trigger;
    showPhoto();
    viewer.showModal();
    $('viewer-close').focus();
  });
  function movePhoto(direction) {
    const next = viewerIndex + direction;
    if (next < 0 || next >= viewerPhotos.length) return;
    viewerIndex = next;
    showPhoto();
  }
  $('viewer-prev').addEventListener('click', () => movePhoto(-1));
  $('viewer-next').addEventListener('click', () => movePhoto(1));
  $('viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => lastTrigger?.focus({ preventScroll: true }));
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      movePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  $('zoom').addEventListener('click', () => {
    const zoomed = $('viewer-stage').classList.toggle('zoomed');
    $('zoom').setAttribute('aria-pressed', String(zoomed));
    $('zoom').textContent = zoomed ? '恢复全图 −' : '放大细看 ＋';
    if (!zoomed) $('viewer-stage').scrollTo(0, 0);
  });

  const crafts = {
    doucai: {
      id: '5776', caption: '清雍正 · 斗彩寿山福海图盘', key: '釉下 + 釉上，两次配合', title: '蓝色先来，其他颜色随后。',
      description: '先以青花勾画纹样，罩透明釉高温烧成；再在釉面填彩，低温彩烧。看盘心的蓝线，像不像给彩色留出的边界？',
      steps: [['画青花', '在瓷胎上勾绘'], ['施釉高温烧', '蓝色留在釉下'], ['填彩再烧', '釉上低温彩烧']], observe: '照片里的线索：蓝色海浪与红色蝙蝠。', url: 'https://www.dpm.org.cn/collection/ceramic/227290.html'
    },
    enamel: {
      id: '5779', caption: '清乾隆 · 珐琅彩红地剔花寿山福海图碗', key: '瓷胎从景德镇出发，彩绘在清宫完成', title: '一只碗，也有自己的旅程。',
      description: '依现场流程图，瓷胎由景德镇御窑厂制作，彩绘与彩烧由清宫内务府造办处珐琅作完成。器物的来历里，也藏着不同地方的分工。',
      steps: [['制作瓷胎', '景德镇御窑厂'], ['彩绘装饰', '清宫造办处'], ['彩烧完成', '清宫珐琅作']], observe: '照片里的线索：同是寿山福海，红地把纹样衬得更密。', url: 'https://www.dpm.org.cn/collection/ceramic/226816.html'
    },
    famille: {
      id: '5784', caption: '清乾隆 · 景德镇窑粉彩鸡缸杯', key: '釉上彩 · 柔和的层次', title: '小小一只杯，画进了一院子生趣。',
      description: '粉彩可用渲染表现色彩的浓淡和明暗。现场流程图也点出了制作地点：官窑粉彩的瓷胎、彩绘、烧成，都在景德镇御窑厂完成。',
      steps: [['烧制瓷胎', '先有白瓷底子'], ['釉上彩绘', '表现色彩层次'], ['低温彩烧', '在景德镇完成']], observe: '照片里的线索：在公鸡、小鸡与花草间，找一处颜色的深浅变化。', url: 'https://www.dpm.org.cn/collection/ceramic/227290.html'
    },
    underglaze: {
      id: '5783', caption: '对照照片：清乾隆料彩寿山福海图杯', key: '延伸小知识 · 青花用钴，釉里红用铜', title: '看到蓝和红，先别急着下结论。',
      description: '青花与釉里红都是釉下彩：先在胎上绘画，再施透明釉高温烧成，分别以钴料与铜料呈色。这张照片的展签定名却是“料彩”。颜色相似，工艺仍需查证。',
      steps: [['胎上画纹样', '钴蓝 / 铜红料'], ['罩透明釉', '彩绘在釉下'], ['高温烧成', '釉里红控烧较难']], observe: '这张为工艺辨读的对照图，不作为青花釉里红实物示例。', url: 'https://www.dpm.org.cn/collection/ceramic/227118.html'
    }
  };
  document.querySelectorAll('[data-craft]').forEach((button) => button.addEventListener('click', () => {
    const craft = crafts[button.dataset.craft];
    document.querySelectorAll('[data-craft]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    for (const key of ['caption', 'key', 'title', 'description', 'observe']) $(`craft-${key}`).textContent = craft[key];
    $('craft-image').src = photoPath(craft.id);
    $('craft-image').alt = craft.caption;
    $('craft-open').dataset.photo = craft.id;
    $('craft-source').href = craft.url;
    $('craft-process').innerHTML = craft.steps.map((step, index) => `<li><span>0${index + 1}</span><strong>${step[0]}</strong><small>${step[1]}</small></li>`).join('');
  }));

  const paintingStories = {
    friendship: { id: '5801', name: '董其昌 · 燕吴八景图册', description: '在北京，为即将归乡的同僚、同乡杨继礼画下八景。画的是风景，也寄托着故乡与朋友之间的联系。', tip: '把它想成一份亲手画的送别相册，再看一次。', evidence: '据现场展签 IMG_5796 与上博典藏资料。', caption: '明 · 董其昌《燕吴八景图册》局部', url: 'https://www.shanghaimuseum.net/mu/frontend/pg/article/id/CI00005470', link: '上博典藏 · 燕吴八景图册 ↗' },
    garden: { id: '5803', name: '陈廉 · 郊园小景图册', description: '据现场展签，郊园是王时敏延请张南垣，在祖父王锡爵的芍药圃基础上重加营构的园林。册页把一座园子，分成可以一页页重游的小景。', tip: '如果能在画里待一个下午，你会选临水的屋子，还是竹林旁的路？', evidence: '据现场展签 IMG_5802；此处提问为观看邀请。', caption: '明 · 陈廉《郊园小景图册》局部', url: '', link: '' },
    map: { id: '5792', name: '沿着地名，寻找画里的人', description: '展厅这张“上海地区历代书画人文示意图”，把书画家与地方放回同一个视野。读松江画派时，也可以先从自己熟悉的地名开始。', tip: '点开放大，先找一个熟悉的地名，再找一位还不熟悉的画家。', evidence: '依据现场导览图 IMG_5792。', caption: '上海地区历代书画人文示意图 · 现场照片', url: '', link: '' }
  };
  document.querySelectorAll('[data-painting]').forEach((button) => button.addEventListener('click', () => {
    const story = paintingStories[button.dataset.painting];
    document.querySelectorAll('[data-painting]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    for (const key of ['name', 'description', 'tip', 'evidence', 'caption']) $(`painting-${key}`).textContent = story[key];
    $('painting-image').src = photoPath(story.id);
    $('painting-image').alt = story.caption;
    $('painting-image').width = ['5803', '5792'].includes(story.id) ? 2000 : 1500;
    $('painting-image').height = ['5803', '5792'].includes(story.id) ? 1500 : 2000;
    $('painting-open').dataset.photo = story.id;
    $('painting-source').hidden = !story.url;
    $('painting-source').href = story.url;
    $('painting-source').textContent = story.link;
  }));

  const storageKey = 'exhibition-experience-feelings-v1';
  function readNotes() {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  }
  try { $('memory').value = readNotes()['zande']?.text || ''; } catch { $('save-status').textContent = '此浏览器暂不支持本地保存，请下载文本留存'; }
  function updateNoteCount() { $('note-count').textContent = `${$('memory').value.length} / 3000`; }
  $('memory').addEventListener('input', () => {
    updateNoteCount();
    try {
      const notes = readNotes();
      notes.zande = { text: $('memory').value, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(notes));
      $('save-status').textContent = '已保存在当前浏览器';
    } catch { $('save-status').textContent = '暂时无法保存，请下载文本留存'; }
  });
  $('download-note').addEventListener('click', () => {
    const blob = new Blob([`暂得，再看。\n上博看展手记 · 2026.11.09\n\n${$('memory').value}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '上博看展手记.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  updateNoteCount();
  renderArchive();
})();
