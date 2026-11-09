(() => {
  'use strict';

  const script = document.currentScript;
  const exhibitionId = script?.dataset.exhibitionId || '';
  const exhibitionTitle = script?.dataset.exhibitionTitle || document.title;
  const feelingsMode = script?.dataset.feelings || 'on';
  const feelingsEnabled = feelingsMode !== 'off';
  const contextualFeelings = feelingsMode === 'contextual';
  const storageKey = script?.dataset.feelingStorageKey || 'exhibition-experience-feelings-v1';
  const flatStorage = script?.dataset.feelingStorageFormat === 'flat';

  const homeLink = document.createElement('a');
  homeLink.className = 'experience-hall-link';
  homeLink.href = '../index.html';
  homeLink.textContent = '展览体验馆';
  document.body.appendChild(homeLink);

  if (!feelingsEnabled || !exhibitionId) return;

  const trigger = document.createElement('button');
  trigger.className = 'experience-feeling-trigger';
  trigger.type = 'button';
  trigger.textContent = '我的感受 ＋';
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('section');
  panel.className = 'experience-feeling-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header>
      <div><small class="experience-feeling-context">这次展览</small><h2></h2></div>
      <button class="experience-feeling-close" type="button">收起</button>
    </header>
    <label>我的感受</label>
    <textarea maxlength="1200" placeholder="记下光线、作品，或者身体停留的感觉……"></textarea>
    <p class="experience-feeling-status"><span>自动保存在此浏览器</span><span class="experience-feeling-count">0 / 1200</span></p>
  `;
  panel.querySelector('h2').textContent = exhibitionTitle;

  document.body.append(trigger, panel);

  const textarea = panel.querySelector('textarea');
  const closeButton = panel.querySelector('.experience-feeling-close');
  const count = panel.querySelector('.experience-feeling-count');
  const saveLabel = panel.querySelector('.experience-feeling-status span');
  const contextLabel = panel.querySelector('.experience-feeling-context');
  const contextTitle = panel.querySelector('h2');
  let saveTimer = 0;
  let contextKey = '';

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (error) {
      return {};
    }
  }

  function updateCount() {
    count.textContent = `${textarea.value.length} / 1200`;
  }

  function entryKey() {
    if (flatStorage) return contextKey;
    return contextKey ? `${exhibitionId}:${contextKey}` : exhibitionId;
  }

  function readCurrentText() {
    const saved = readStore()[entryKey()];
    return flatStorage ? (typeof saved === 'string' ? saved : '') : saved?.text || '';
  }

  function contextReference() {
    return contextKey === 'optical' ? '人物光影' : `IMG_${contextKey}`;
  }

  function closedTriggerText() {
    if (!contextualFeelings) return '我的感受 ＋';
    return contextKey ? `我的感受 · ${contextReference()} ＋` : '我的感受 · 先选择展品';
  }

  function openPanel() {
    if (contextualFeelings && !contextKey) return;
    textarea.value = readCurrentText();
    updateCount();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.textContent = contextualFeelings ? `我的感受 · ${contextReference()} ×` : '我的感受 ×';
    textarea.focus();
  }

  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.textContent = closedTriggerText();
    if (!trigger.disabled) trigger.focus();
  }

  function saveFeeling() {
    window.clearTimeout(saveTimer);
    updateCount();
    saveLabel.textContent = '正在保存';
    const targetKey = entryKey();
    const text = textarea.value;
    saveTimer = window.setTimeout(() => {
      const store = readStore();
      store[targetKey] = flatStorage ? text : { text, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(storageKey, JSON.stringify(store));
        saveLabel.textContent = '已保存在此浏览器';
      } catch (error) {
        saveLabel.textContent = '暂时无法保存';
      }
    }, 220);
  }

  trigger.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  closeButton.addEventListener('click', closePanel);
  textarea.addEventListener('input', saveFeeling);
  textarea.addEventListener('keydown', (event) => event.stopPropagation());
  window.addEventListener('exhibition-feeling-context', (event) => {
    const detail = event.detail || {};
    if (detail.exhibitionId && detail.exhibitionId !== exhibitionId) return;
    contextKey = detail.key ? String(detail.key) : '';
    contextLabel.textContent = detail.eyebrow || (contextualFeelings ? '当前展品' : '这次展览');
    contextTitle.textContent = detail.title || exhibitionTitle;
    trigger.disabled = contextualFeelings && !contextKey;
    trigger.textContent = panel.hidden ? closedTriggerText() : `我的感受 · ${contextReference()} ×`;
    if (trigger.disabled && !panel.hidden) closePanel();
    else if (!panel.hidden) {
      textarea.value = readCurrentText();
      updateCount();
      saveLabel.textContent = '自动保存在此浏览器';
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  if (contextualFeelings) {
    trigger.disabled = true;
    trigger.textContent = closedTriggerText();
  }
})();
