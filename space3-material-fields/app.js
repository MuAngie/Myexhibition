(() => {
  'use strict';

  const sceneRoot = document.querySelector('#scene');
  const intro = document.querySelector('#intro');
  const enterButton = document.querySelector('#enter');
  const interfaceLayer = document.querySelector('#interface');
  const zoneName = document.querySelector('#zone-name');
  const zoneButtons = [...document.querySelectorAll('.zone-button')];
  const resetButton = document.querySelector('#reset');
  const crosshair = document.querySelector('#crosshair');
  const targetLabel = document.querySelector('#target-label');
  const loading = document.querySelector('#loading');
  const transition = document.querySelector('#transition');
  const transitionIndex = document.querySelector('#transition-index');
  const transitionName = document.querySelector('#transition-name');
  const transitionMood = document.querySelector('#transition-mood');
  const artworkGallery = document.querySelector('#artwork-gallery');
  const galleryWalls = [...document.querySelectorAll('.gallery-wall')];
  const allGalleryArtworks = [...document.querySelectorAll('.gallery-art')];
  let galleryArtworks = allGalleryArtworks.filter((button) => button.closest('.gallery-wall').dataset.galleryZone === 'hall2');
  const galleryArtworkNumber = document.querySelector('#gallery-artwork-number');
  const galleryArtworkTotal = document.querySelector('#gallery-artwork-total');
  const galleryZoneTitle = document.querySelector('#gallery-zone-title');
  const galleryDescription = document.querySelector('#gallery-description');
  const galleryHint = document.querySelector('#gallery-hint');
  const thoughtToggle = document.querySelector('#thought-toggle');
  const thoughtPanel = document.querySelector('#thought-panel');
  const thoughtClose = document.querySelector('#thought-close');
  const thoughtName = document.querySelector('#thought-name');
  const thoughtInput = document.querySelector('#thought-input');
  const thoughtStatus = document.querySelector('#thought-status');
  const thoughtCount = document.querySelector('#thought-count');
  const artworkDetail = document.querySelector('#artwork-detail');
  const artworkDetailClose = document.querySelector('#artwork-detail-close');
  const artworkDetailViewport = document.querySelector('#artwork-detail-viewport');
  const artworkDetailImage = document.querySelector('#artwork-detail-image');
  const artworkZoomOut = document.querySelector('#artwork-zoom-out');
  const artworkZoomLevel = document.querySelector('#artwork-zoom-level');
  const artworkZoomIn = document.querySelector('#artwork-zoom-in');
  const artworkZoomReset = document.querySelector('#artwork-zoom-reset');
  const artworkDetailCategory = document.querySelector('#artwork-detail-category');
  const artworkDetailTitle = document.querySelector('#artwork-detail-title');
  const artworkDetailSubtitle = document.querySelector('#artwork-detail-subtitle');
  const artworkDetailMeta = document.querySelector('#artwork-detail-meta');
  const artworkDetailArtist = document.querySelector('#artwork-detail-artist');
  const artworkDetailYear = document.querySelector('#artwork-detail-year');
  const artworkDetailSize = document.querySelector('#artwork-detail-size');
  const artworkDetailMedium = document.querySelector('#artwork-detail-medium');
  const artworkDetailSource = document.querySelector('#artwork-detail-source');

  const galleryModes = {
    hall1: {
      title: '02 / 展开',
      description: '白模空间随作品切换改变视角，12 张照片悬浮于前景。',
      ariaLabel: '02 展开展品陈列',
      hint: '点击主图查看大图与作品信息 · 点击侧图、滚轮或方向键切换',
      referenceFolder: '1',
      details: true,
    },
    hall2: {
      title: '03 / 沉积',
      description: '白模空间随作品切换改变视角，14 张照片悬浮于前景。',
      ariaLabel: '03 沉积作品陈列',
      hint: '点击主图查看大图与作品信息 · 点击侧图、滚轮或方向键切换',
      referenceFolder: '2',
      details: true,
    },
    hall3: {
      title: '04 / 回声',
      description: '白模空间随作品切换改变视角，13 张照片悬浮于前景。',
      ariaLabel: '04 回声展品陈列',
      hint: '点击主图查看大图与作品信息 · 点击侧图、滚轮或方向键切换',
      referenceFolder: '3',
      details: true,
    },
  };

  const artworkInformation = {
    IMG_3244: { category: '特邀作品', title: '自由飞翔 - 与玛格丽特对话', artist: '薛松', year: '2026', size: '185×110 cm', medium: '综合材料', source: 'IMG_3245' },
    IMG_3249: { category: '展品信息', title: '物游记', artist: '李沙', year: '2026', size: '170×103 cm', medium: '综合材料', source: 'IMG_3247' },
    IMG_3251: { category: '特邀作品', title: '海市蜃楼115号', subtitle: 'Mirage No 115', artist: '赵葆康', year: '2014', size: '200×93 cm', medium: '布上综合材料', source: 'IMG_3252' },
    IMG_3255: { category: '特邀作品', title: '天窗', artist: '王勍音', year: '2019', size: '29×29×3 cm', medium: '书籍、裁剪、喷漆', source: 'IMG_3256' },
    IMG_3257: { category: '特邀作品', title: '天窗', artist: '王勍音', year: '2019', size: '29×29×3 cm', medium: '书籍、裁剪、喷漆', source: 'IMG_3256' },
    IMG_3258: { category: '展品信息', title: 'π - China', artist: '李立宏', year: '2026', size: '尺寸可变', medium: '综合材料', source: 'IMG_3260' },
    IMG_3263: { category: '评委作品', title: '@KimiK3. 月的暗面', artist: '何伟', year: '', size: '122×240 cm', medium: '铝塑板、油墨、铁、塑料', source: 'IMG_3262' },
    IMG_3265: { category: '特邀作品', title: "北纬31°14'手稿系列", artist: '谭根雄', year: '2026', size: '90×120 cm', medium: '综合材料', source: 'IMG_3266' },
    IMG_3270: { category: '特邀作品', title: '不确定', artist: '杨劲松', year: '2025', size: '200×200 cm', medium: '布面综合材料', source: 'IMG_3269' },
    IMG_3275: { category: '特邀作品', title: '叠窗—洞窗四时', artist: '郭健濂', year: '2025', size: '221×81 cm', medium: '综合材料', source: 'IMG_3274' },
    IMG_3277: { category: '特邀作品', title: '蓝色幻象之二', artist: '张元', year: '2025', size: '60×60 cm', medium: '综合材料', source: 'IMG_3276' },
    IMG_3206: { category: '展品信息', title: '致敬古建', artist: '李青', year: '2026', size: '100×100×5 cm', medium: '原照片字迹不清，暂未可靠辨认', source: 'IMG_3206' },
    IMG_3209: { category: '展品信息', title: '故园', artist: '孟祥俐', year: '2026', size: '120×160×7 cm', medium: '原照片字迹不清，暂未可靠辨认', source: 'IMG_3209' },
    IMG_3210: { category: '展品信息', title: '重帷', artist: '张辰祺', year: '2026', size: '10×140×190 cm', medium: '牛皮、铁锈', source: 'IMG_3210' },
    IMG_3211: { category: '展品信息', title: '地质纪系列', artist: '王志强', year: '2023', size: '125×90×17 cm', medium: '木板、有色砂岩、有色土、矿物', source: 'IMG_3212' },
    IMG_3213: { category: '展品信息', title: '甜·釉', artist: '张永瑾', year: '2025', size: '78×78×2 cm', medium: '陶瓷', source: 'IMG_3213' },
    IMG_3215: { category: '展品信息', title: '城市物质褶皱', artist: '葛优优', year: '2026', size: '125×110×5 cm', medium: '', source: 'IMG_3215' },
    IMG_3218: { category: '展品信息', title: '造境·器生', artist: '王昶', year: '2021', size: '240×180×4 cm', medium: '矿物色综合材料', source: 'IMG_3218' },
    IMG_3221: { category: '展品信息', title: '生长', artist: '陈斐', year: '2025', size: '70×100×8 cm', medium: '综合材料', source: 'IMG_3221' },
    IMG_3222: { category: '展品信息', title: '风抱空山苔衣寒', artist: '黄煜', year: '2026', size: '144×180×8 cm', medium: '宣纸、麻布、墨、丙烯、氧化铁蓝、苔藓、石英砂、立德粉', source: 'IMG_3223' },
    IMG_3229: { category: '展品信息', title: '土素书 - Ⅰ', artist: '徐瀚', year: '2025', size: '120×120×5 cm', medium: '紫土、白土、高岭土、方解石', source: 'IMG_3228' },
    IMG_3231: { category: '展品信息', title: '日子', artist: '位启源', year: '2026', size: '100×100×5 cm', medium: '有色土、墨、丙烯胶', source: 'IMG_3232' },
    IMG_3233: { category: '两件作品', title: '止水隅—牙（一） / 摹吴镇墨戏图页', artist: '乔建欣 / 梁国兴', year: '2026 / 2025', size: '80×80×3 cm / 10×66×63 cm', medium: '有色土、矿物颜料、丙烯粘合剂、白乳胶、腻子粉 / PLA、宣纸、亚克力', source: 'IMG_3234' },
    IMG_3236: { category: '展品信息', title: '江山 2024-1', artist: '马俊营', year: '2024', size: '200×200×5 cm', medium: '大漆材料', source: 'IMG_3235' },
    IMG_3239: { category: '展品信息', title: '新景 - 链接', artist: '武智勇', year: '2025', size: '80×72×76 cm', medium: '金属、木、大漆、玻璃、树脂等综合材料', source: 'IMG_3240' },
    IMG_3287: { category: '展品信息', title: '水迷宫（上海吴淞口）', artist: '邱源晟', year: '2025', size: '90×120×2 cm', medium: '宣纸、丙烯、色粉', source: 'IMG_3286' },
    IMG_3289: { category: '展品信息', title: '等待 / 一个借用和衍生', artist: '宋玲玲', year: '2026', size: '98×180×3 cm', medium: '袋子', source: 'IMG_3288' },
    IMG_3293: { category: '展品信息', title: '进去看看', artist: '曾希诺', year: '2025', size: '200×150×5 cm', medium: '综合材料', source: 'IMG_3292' },
    IMG_3301: { category: '展品信息', title: '曼陀罗 2019-14', artist: '顾奔驰', year: '2019', size: '160×160×7 cm', medium: '涤纶丝线、不锈钢钉、丙烯', source: 'IMG_3302' },
    IMG_3305: { category: '展品信息', title: '清风竹影', artist: '姜潇', year: '2026', size: '100×80×5 cm', medium: '卡纸、色粉、油彩、炭条', source: 'IMG_3304' },
    IMG_3307: { category: '展品信息', title: '有声', artist: '金战天、宫晓东', year: '2026', size: '120×160×3 cm', medium: '综合材料、电影胶片、木板、透明玻璃胶', source: 'IMG_3306' },
    IMG_3317: { category: '展品信息', title: '新碎片画报 01', artist: '刘梦醒', year: '2019', size: '100×100×5 cm', medium: '布面丙烯着色报纸拼贴', source: 'IMG_3316' },
  };

  if (!window.THREE) {
    loading.textContent = '本地 3D 运行库未找到';
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assets = './assets/textures/';
  const embeddedTextures = window.location.protocol === 'file:' ? window.SPACE3_EMBEDDED_TEXTURES || {} : {};
  const textureSource = (file) => embeddedTextures[file] || `${assets}${file}?v=13`;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sceneRoot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x191918);
  scene.fog = new THREE.FogExp2(0x191918, 0.018);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.08, 160);
  camera.rotation.order = 'YXZ';

  const roots = {};
  const portalMeshes = [];
  const keys = new Set();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  const imageLoader = new THREE.TextureLoader();
  const clock = new THREE.Clock();

  const zones = {
    atrium: {
      index: '01', name: '序厅 / ATRIUM', shortName: '序厅', mood: '尺度从挑高中出现',
      offset: new THREE.Vector3(0, 0, 0), start: new THREE.Vector3(0, 1.68, 10.2),
      yaw: 0, pitch: -0.015, bounds: { x: [-7.2, 7.2], z: [-9.7, 10.2] }, fog: 0.012,
    },
    hall1: {
      index: '02', name: '展开 / OPEN FIELD', shortName: '展开', mood: '作品在白模前景依次展开',
      offset: new THREE.Vector3(50, 0, 0), start: new THREE.Vector3(42.4, 1.68, 15.2),
      yaw: 0, pitch: -0.015, bounds: { x: [-10.5, 10.5], z: [-16.1, 17.0] }, fog: 0.010,
    },
    hall2: {
      index: '03', name: '沉积 / MATERIAL FIELD', shortName: '沉积', mood: '作品在白模前景依次浮现',
      offset: new THREE.Vector3(100, 0, 0), start: new THREE.Vector3(93.7, 1.68, 10.0),
      yaw: -0.24, pitch: 0, bounds: { x: [-8.7, 8.7], z: [-11.1, 10.2] }, fog: 0.014,
    },
    hall3: {
      index: '04', name: '回声 / FINAL HALL', shortName: '回声', mood: '前廊收束，终厅重新打开',
      offset: new THREE.Vector3(150, 0, 0), start: new THREE.Vector3(150, 1.68, 10.0),
      yaw: 0, pitch: 0, bounds: { x: [-8.3, 8.3], z: [-11.0, 10.4] }, fog: 0.013,
    },
  };

  Object.entries(zones).forEach(([name, zone]) => {
    const root = new THREE.Group();
    root.position.copy(zone.offset);
    root.userData.zone = name;
    scene.add(root);
    roots[name] = root;
  });

  let currentZone = 'atrium';
  let entered = false;
  let yaw = zones.atrium.yaw;
  let pitch = zones.atrium.pitch;
  let isDragging = false;
  let didDrag = false;
  let lastX = 0;
  let lastY = 0;
  let hoverTarget = null;
  let cameraAnimation = null;
  let transitionTimer = 0;
  let galleryArtworkIndex = 0;
  let galleryWheelLocked = false;
  let thoughtOpen = false;
  let artworkDetailOpen = false;
  let artworkDetailTrigger = null;
  let artworkZoom = 1;
  let artworkPanX = 0;
  let artworkPanY = 0;
  let artworkPanning = false;
  let artworkPanStartX = 0;
  let artworkPanStartY = 0;
  let artworkPanOriginX = 0;
  let artworkPanOriginY = 0;
  let thoughtStatusTimer = 0;
  let thoughts = {};
  try {
    thoughts = JSON.parse(localStorage.getItem('space3-artwork-thoughts') || '{}');
  } catch (error) {
    thoughts = {};
  }

  const wallTexture = makeNoiseTexture('#e9e7e0', '#c9c5bb', 640, 0.055);
  wallTexture.repeat.set(4, 3);
  const stoneTexture = makeNoiseTexture('#b8b1a4', '#817b72', 480, 0.18);
  stoneTexture.repeat.set(4, 3);
  const floorTexture = makeFloorTexture();
  floorTexture.repeat.set(7, 9);

  const materials = {
    wall: new THREE.MeshStandardMaterial({ color: 0xf0eee8, map: wallTexture, roughness: 0.96 }),
    wallWarm: new THREE.MeshStandardMaterial({ color: 0xe8e2d8, map: wallTexture, roughness: 0.95 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xc3b9aa, map: stoneTexture, roughness: 0.9 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x575859, map: floorTexture, roughness: 0.63, metalness: 0.08 }),
    floorDark: new THREE.MeshStandardMaterial({ color: 0x2d3031, map: floorTexture, roughness: 0.68, metalness: 0.06 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0x131517, roughness: 0.84 }),
    beam: new THREE.MeshStandardMaterial({ color: 0x202326, roughness: 0.72 }),
    whiteMetal: new THREE.MeshStandardMaterial({ color: 0xdeddd8, roughness: 0.38, metalness: 0.18 }),
    darkMetal: new THREE.MeshStandardMaterial({ color: 0x17191b, roughness: 0.34, metalness: 0.62 }),
    plinth: new THREE.MeshStandardMaterial({ color: 0xe5e4df, roughness: 0.72 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x147bd1, roughness: 0.58 }),
    root: new THREE.MeshStandardMaterial({ color: 0x816751, roughness: 0.94 }),
    portal: new THREE.MeshStandardMaterial({ color: 0x171719, roughness: 0.86, emissive: 0x19140f, emissiveIntensity: 0.32 }),
  };

  scene.add(new THREE.HemisphereLight(0xe6e0d4, 0x202326, 0.72));
  buildAtrium();
  buildHallOne();
  buildHallTwo();
  buildHallThree();
  addAtmosphere();
  setVisibleZone('atrium');
  resetCamera(true);

  const query = new URLSearchParams(window.location.search);
  const planMode = query.get('plan') === '02';
  const qaView = query.get('qa');
  if (planMode || qaView) {
    currentZone = 'hall1';
    entered = true;
    setVisibleZone('hall2');
    intro.classList.add('is-hidden');
    interfaceLayer.classList.add('is-visible');
    interfaceLayer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-gallery');
    artworkGallery.setAttribute('aria-hidden', 'false');
    zoneName.textContent = zones.hall1.name;
    zoneButtons.forEach((button) => button.classList.toggle('is-current', button.dataset.zone === 'hall1'));
    scene.background.set(0xd1d0cb);
    scene.fog.color.set(0xd1d0cb);

    let referenceSource = '';
    let referenceAlt = '';
    if (planMode) {
      camera.position.set(zones.hall1.offset.x, 38, 0.4);
      yaw = 0;
      pitch = -Math.PI / 2;
      roots.hall1.children.forEach((child) => {
        if (child.userData.isPlanCeiling) child.visible = false;
      });
      referenceSource = './analysis/space02-floor-plan-reference.png';
      referenceAlt = '用户提供的 02 空间平面图';
    } else {
      const views = {
        front: { position: [-7.6, 1.68, 14.7], yaw: 0, source: 'IMG_3242.JPG' },
        right: { position: [0.4, 1.68, 0], yaw: -Math.PI / 2, source: 'IMG_3246.JPG' },
        left: { position: [-0.4, 1.68, 0], yaw: Math.PI / 2, source: 'IMG_3272.JPG' },
        rear: { position: [0, 1.68, -8.2], yaw: 0, source: 'IMG_3268.JPG' },
      };
      const view = views[qaView] || views.front;
      camera.position.set(zones.hall1.offset.x + view.position[0], view.position[1], view.position[2]);
      yaw = view.yaw;
      pitch = -0.015;
      referenceSource = `./reference/1/${view.source}`;
      referenceAlt = `02 空间现场照片 ${view.source}`;
    }

    configureGallery('hall1');
    setGalleryArtwork(0, true);

    const qaReference = document.createElement('img');
    qaReference.src = referenceSource;
    qaReference.alt = referenceAlt;
    Object.assign(qaReference.style, {
      position: 'fixed', left: '28px', top: '110px', width: '240px', maxHeight: '68vh',
      objectFit: 'contain', zIndex: '20', background: '#fff', opacity: '0.92',
      boxShadow: '0 12px 32px rgba(0,0,0,.28)', pointerEvents: 'none',
    });
    document.body.appendChild(qaReference);
  }

  const galleryQa = query.get('galleryqa');
  if (galleryQa) {
    const galleryQaZones = { '02': 'hall1', '03': 'hall2', '04': 'hall3' };
    currentZone = galleryQaZones[galleryQa] || 'hall2';
    entered = true;
    setVisibleZone('hall2');
    intro.classList.add('is-hidden');
    interfaceLayer.classList.add('is-visible');
    interfaceLayer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-gallery');
    artworkGallery.setAttribute('aria-hidden', 'false');
    zoneName.textContent = zones[currentZone].name;
    zoneButtons.forEach((button) => button.classList.toggle('is-current', button.dataset.zone === currentZone));
    scene.background.set(0xd1d0cb);
    scene.fog.color.set(0xd1d0cb);
    configureGallery(currentZone);
    setGalleryArtwork(0, true);

    const galleryReference = document.createElement('img');
    galleryReference.src = `./analysis/contact-sheet-${galleryModes[currentZone].referenceFolder}.jpg`;
    galleryReference.alt = `${zones[currentZone].index} 空间照片与单张作品联系表`;
    Object.assign(galleryReference.style, {
      position: 'fixed', right: '58px', bottom: '56px', width: '220px', maxHeight: '38vh',
      objectFit: 'contain', zIndex: '20', background: '#171716', opacity: '0.94',
      boxShadow: '0 12px 32px rgba(0,0,0,.28)', pointerEvents: 'none',
    });
    document.body.appendChild(galleryReference);
  }

  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (!entered || event.button !== 0) return;
    updatePointer(event);
    updateHover();
    isDragging = true;
    didDrag = false;
    lastX = event.clientX;
    lastY = event.clientY;
    sceneRoot.classList.add('is-dragging');
    renderer.domElement.setPointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener('pointermove', (event) => {
    updatePointer(event);
    if (!isDragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) didDrag = true;
    yaw -= dx * 0.0031;
    pitch -= dy * 0.00245;
    pitch = THREE.MathUtils.clamp(pitch, -0.98, 0.98);
    lastX = event.clientX;
    lastY = event.clientY;
    cameraAnimation = null;
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    if (!isDragging) return;
    isDragging = false;
    sceneRoot.classList.remove('is-dragging');
    renderer.domElement.releasePointerCapture(event.pointerId);
    updatePointer(event);
    updateHover();
    if (!didDrag && hoverTarget) switchZone(hoverTarget.userData.targetZone);
  });

  renderer.domElement.addEventListener('wheel', (event) => {
    if (!entered) return;
    event.preventDefault();
    cameraAnimation = null;
    moveForward(-event.deltaY * 0.00265);
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (artworkDetailOpen) {
      if (event.code === 'Escape') {
        closeArtworkDetail();
        event.preventDefault();
      } else if (['Equal', 'NumpadAdd'].includes(event.code)) {
        setArtworkZoom(artworkZoom + 0.25);
        event.preventDefault();
      } else if (['Minus', 'NumpadSubtract'].includes(event.code)) {
        setArtworkZoom(artworkZoom - 0.25);
        event.preventDefault();
      } else if (event.code === 'Digit0') {
        resetArtworkZoom();
        event.preventDefault();
      }
      return;
    }
    if (!entered) return;
    if (isArtworkGalleryZone()) {
      if (event.code === 'Escape' && thoughtOpen) {
        setThoughtOpen(false);
        thoughtToggle.focus();
        event.preventDefault();
        return;
      }
      if (event.target === thoughtInput) return;
      if (event.code === 'ArrowLeft') setGalleryArtwork(galleryArtworkIndex - 1);
      if (event.code === 'ArrowRight') setGalleryArtwork(galleryArtworkIndex + 1);
      if (['ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      return;
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
      keys.add(event.code);
      cameraAnimation = null;
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('resize', onResize);

  enterButton.addEventListener('click', () => {
    entered = true;
    intro.classList.add('is-hidden');
    interfaceLayer.classList.add('is-visible');
    interfaceLayer.setAttribute('aria-hidden', 'false');
  });
  zoneButtons.forEach((button) => button.addEventListener('click', () => switchZone(button.dataset.zone)));
  resetButton.addEventListener('click', () => resetCamera(false));
  document.querySelector('#gallery-prev').addEventListener('click', () => setGalleryArtwork(galleryArtworkIndex - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => setGalleryArtwork(galleryArtworkIndex + 1));
  allGalleryArtworks.forEach((button) => {
    const image = button.querySelector('img');
    const prepareSize = () => sizeGalleryArtwork(button, image);
    if (image.complete) prepareSize();
    else image.addEventListener('load', prepareSize, { once: true });
    button.addEventListener('click', () => {
      const index = galleryArtworks.indexOf(button);
      if (index < 0) return;
      if (index === galleryArtworkIndex && galleryModes[currentZone].details) {
        openArtworkDetail(button);
        return;
      }
      setGalleryArtwork(index === galleryArtworkIndex ? index + 1 : index);
    });
  });
  artworkDetailClose.addEventListener('click', () => closeArtworkDetail());
  artworkDetail.addEventListener('click', (event) => {
    if (event.target === artworkDetail) closeArtworkDetail();
  });
  artworkZoomOut.addEventListener('click', () => setArtworkZoom(artworkZoom - 0.25));
  artworkZoomIn.addEventListener('click', () => setArtworkZoom(artworkZoom + 0.25));
  artworkZoomReset.addEventListener('click', resetArtworkZoom);
  artworkDetailViewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setArtworkZoom(artworkZoom + (event.deltaY < 0 ? 0.2 : -0.2));
  }, { passive: false });
  artworkDetailViewport.addEventListener('dblclick', (event) => {
    event.preventDefault();
    resetArtworkZoom();
  });
  artworkDetailViewport.addEventListener('pointerdown', (event) => {
    if (artworkZoom <= 1) return;
    artworkPanning = true;
    artworkPanStartX = event.clientX;
    artworkPanStartY = event.clientY;
    artworkPanOriginX = artworkPanX;
    artworkPanOriginY = artworkPanY;
    artworkDetailViewport.classList.add('is-panning');
    artworkDetailViewport.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  artworkDetailViewport.addEventListener('pointermove', (event) => {
    if (!artworkPanning) return;
    artworkPanX = artworkPanOriginX + event.clientX - artworkPanStartX;
    artworkPanY = artworkPanOriginY + event.clientY - artworkPanStartY;
    constrainArtworkPan();
    updateArtworkTransform();
  });
  artworkDetailViewport.addEventListener('pointerup', stopArtworkPan);
  artworkDetailViewport.addEventListener('pointercancel', stopArtworkPan);
  artworkDetailImage.addEventListener('load', () => {
    constrainArtworkPan();
    updateArtworkTransform();
  });
  thoughtToggle.addEventListener('click', () => setThoughtOpen(true));
  thoughtClose.addEventListener('click', () => setThoughtOpen(false));
  thoughtInput.addEventListener('input', saveThought);
  artworkGallery.addEventListener('wheel', (event) => {
    if (artworkDetailOpen) return;
    if (event.target.closest('#thought-panel')) return;
    event.preventDefault();
    if (galleryWheelLocked || Math.abs(event.deltaY) < 4) return;
    galleryWheelLocked = true;
    setGalleryArtwork(galleryArtworkIndex + Math.sign(event.deltaY));
    setTimeout(() => { galleryWheelLocked = false; }, reducedMotion ? 1 : 420);
  }, { passive: false });

  setTimeout(() => loading.classList.add('is-done'), 850);
  animate();

  function buildAtrium() {
    const root = roots.atrium;
    addBox(root, 16, 0.12, 22, 0, -0.06, 0, materials.floorDark, false, true);
    addBox(root, 0.25, 8.2, 22, -8, 4.1, 0, materials.stone, false, true);
    addBox(root, 0.25, 8.2, 22, 8, 4.1, 0, materials.stone, false, true);
    addBox(root, 16, 8.2, 0.25, 0, 4.1, -11, materials.wallWarm, false, true);
    addBox(root, 16, 0.22, 5.6, 0, 8.1, 7.8, materials.wall, false, true);
    addBox(root, 6.2, 0.22, 9, -4.9, 8.1, -3.2, materials.ceiling, false, true);
    addBox(root, 6.2, 0.22, 9, 4.9, 8.1, -3.2, materials.ceiling, false, true);
    addBox(root, 15.5, 0.5, 0.5, 0, 5.75, -9.7, materials.wallWarm, false, true);
    addBox(root, 0.35, 2.0, 11.5, -7.1, 5.1, -1.8, materials.wallWarm, false, true);

    addArtwork(root, { file: 'atrium-screen.jpg', side: 'back', x: -1.1, y: 4.55, z: -10.84, width: 5.8, height: 6.2, frame: false, luminous: true });
    addArtwork(root, { file: 'atrium-diptych.jpg', side: 'right', x: 7.84, y: 2.45, z: 3.0, width: 3.3 });

    [[-2.6, 0.25, 1.4, 1.0, 1.8], [-0.6, 0.18, 0.8, 1.5, 1.0], [1.4, 0.24, 2.0, 0.9, 1.2], [3.0, 0.16, 0.7, 1.15, 0.8], [-1.7, 0.12, 2.7, 0.7, 0.65]].forEach(([x, y, z, sx, sz], index) => {
      const form = new THREE.Mesh(new THREE.TetrahedronGeometry(1, 0), materials.blue);
      form.position.set(x, y + 0.18, z);
      form.scale.set(sx, 0.45 + index * 0.03, sz);
      form.rotation.set(0.08, index * 0.63, 0.03);
      form.castShadow = true;
      form.receiveShadow = true;
      root.add(form);
    });

    addTotem(root, 3.5, 0.2, 1.4, 4.5, 0);
    addTotem(root, 5.2, 0.15, -0.8, 3.65, 1);
    addTotem(root, 4.8, 0.14, 3.5, 3.1, 2);
    addRootLine(root);
    addBarrierLoop(root, [[-5.4, 5.0], [-5.5, -2.2], [-2.2, -5.6], [5.9, -4.8], [6.1, 5.0]]);
    addStair(root);
    addPortal(root, { zone: 'atrium', targetZone: 'hall1', label: '进入 02 · 展开', side: 'back', x: 5.7, y: 1.75, z: -10.82, width: 2.1, height: 3.5 });

    addSpot(root, -1.3, 7.5, -4, -1.1, 2.5, -8.8, 1.9, 0.52);
    addSpot(root, 0, 7.6, 4, 0, 0, 1, 1.2, 0.6);
    addSpot(root, 4.5, 7.5, 2, 3.7, 1.2, 1.0, 1.35, 0.45);
  }

  function buildHallOne() {
    const root = roots.hall1;
    const wallHeight = 5.35;
    const ceilingHeight = 7.05;
    const hallWall = new THREE.MeshStandardMaterial({ color: 0xe9e6de, roughness: 0.94 });
    const hallFloor = new THREE.MeshStandardMaterial({ color: 0x5c5d5d, roughness: 0.58, metalness: 0.07 });
    const hallCeiling = new THREE.MeshStandardMaterial({ color: 0x151718, roughness: 0.86, side: THREE.DoubleSide });
    const floorPlan = [
      [-11.0, 14.0], [-11.0, -10.6], [-5.2, -16.8],
      [7.4, -16.8], [11.0, -10.8], [11.0, 5.1],
      [4.2, 5.1], [4.2, 17.6], [-4.3, 17.6], [-4.3, 13.4],
    ];

    addHorizontalPolygon(root, floorPlan, -0.02, hallFloor);
    const ceiling = addHorizontalPolygon(root, floorPlan, ceilingHeight, hallCeiling);
    ceiling.userData.isPlanCeiling = true;

    // Outer envelope with one straight diagonal at each rear corner.
    addWallSegment(root, -11.0, 14.0, -11.0, -10.6, wallHeight, hallWall);
    addWallSegment(root, -11.0, -10.6, -5.2, -16.8, wallHeight, hallWall);
    addWallSegment(root, -5.2, -16.8, 7.4, -16.8, wallHeight, hallWall);
    addWallSegment(root, 7.4, -16.8, 11.0, -10.8, wallHeight, hallWall);
    addWallSegment(root, 11.0, -10.8, 11.0, 5.1, wallHeight, hallWall);

    // Two opposing wall pairs leave the broad central passage shown in the sketch.
    addWallSegment(root, -11.0, 5.1, -5.0, 5.1, wallHeight, hallWall, 0.46);
    addWallSegment(root, 4.2, 5.1, 11.0, 5.1, wallHeight, hallWall, 0.46);
    addWallSegment(root, -11.0, -5.2, -5.3, -5.2, wallHeight, hallWall, 0.68);
    addWallSegment(root, 4.4, -5.2, 11.0, -5.2, wallHeight, hallWall, 0.46);

    // Bottom U-shaped enclosure and the entry opening at its left.
    addWallSegment(root, 4.2, 5.1, 4.2, 17.6, wallHeight, hallWall);
    addWallSegment(root, 4.2, 17.6, -4.3, 17.6, wallHeight, hallWall);
    addWallSegment(root, -4.3, 17.6, -4.3, 13.4, wallHeight, hallWall);

    // Individually photographed works only; the walls themselves remain untextured.
    addArtwork(root, { file: 'hall1-work-bird.jpg', side: 'back', x: 7.4, y: 2.55, z: 5.31, width: 1.55, frame: false });
    addArtwork(root, { file: 'hall1-work-small-sculpture.jpg', side: 'right', x: 4.13, y: 2.4, z: 10.6, width: 1.05, frame: false });

    // Right middle bay — IMG_3246.
    addArtwork(root, { file: 'hall1-work-window-blue.jpg', side: 'back', x: 5.35, y: 2.45, z: -4.95, width: 0.72, frame: false });
    addArtwork(root, { file: 'hall1-work-window-red.jpg', side: 'back', x: 6.35, y: 2.45, z: -4.95, width: 0.72, frame: false });
    addArtwork(root, { file: 'hall1-work-textile.jpg', side: 'front', x: 8.55, y: 2.55, z: 4.85, width: 2.65, frame: false });
    addArtwork(root, { file: 'hall1-work-blue-light.jpg', side: 'right', x: 10.87, y: 2.45, z: 0.2, width: 2.35, frame: false });

    // The number work sits on the exposed end of the right partition.
    addArtwork(root, { file: 'hall1-work-numbers.jpg', side: 'right', x: 4.37, y: 2.68, z: -5.2, width: 0.82, height: 4.75, frame: false });

    // Rear room — IMG_3261/3264/3268.
    addArtwork(root, { file: 'hall1-work-black-metal.jpg', side: 'front', x: -8.0, y: 2.55, z: -5.54, width: 4.0, frame: false });
    addArtwork(root, { file: 'hall1-work-circle.jpg', side: 'back', x: -4.15, y: 2.48, z: -16.67, width: 1.65, frame: false });
    addArtwork(root, { file: 'hall1-work-green.jpg', side: 'back', x: 2.75, y: 2.45, z: -16.67, width: 0.9, frame: false });

    // Left middle bay — IMG_3272/3273.
    addArtwork(root, { file: 'hall1-work-blue-framed.jpg', side: 'front', x: -7.7, y: 2.38, z: 4.85, width: 1.35, frame: false });
    addArtwork(root, { file: 'hall1-work-triptych.jpg', side: 'left', x: -10.87, y: 2.5, z: 0.0, width: 2.55, frame: false });

    root.add(new THREE.AmbientLight(0xf0eadf, 0.78));
    addHallOneCeilingTracks(root, ceilingHeight);
    addSpot(root, -7.5, 6.7, 9.0, -7.8, 2.7, 5.1, 1.2, 0.5);
    addSpot(root, 7.5, 6.7, 8.5, 7.2, 2.7, 5.1, 1.1, 0.5);
    addSpot(root, -7.5, 6.7, -1.0, -7.5, 2.7, -5.2, 1.15, 0.52);
    addSpot(root, 7.5, 6.7, -1.0, 7.5, 2.7, -5.2, 1.15, 0.52);
    addSpot(root, 0.0, 6.7, -12.5, 0.0, 2.6, -16.5, 1.25, 0.56);

    addPortal(root, { zone: 'hall1', targetZone: 'hall2', label: '进入 03 · 沉积', side: 'back', x: 6.0, y: 1.7, z: -16.62, width: 1.8, height: 3.4 });
  }

  function buildHallTwo() {
    const root = roots.hall2;
    addBox(root, 22, 0.12, 30, 0, -0.06, 0, materials.plinth, false, true);
    addBox(root, 0.28, 7.2, 30, -11, 3.6, 0, materials.wall, false, true);
    addBox(root, 0.28, 7.2, 30, 11, 3.6, 0, materials.wall, false, true);
    addBox(root, 22, 7.2, 0.28, 0, 3.6, -15, materials.wall, false, true);
    addBox(root, 22, 0.22, 30, 0, 7.25, 0, materials.wall, false, true);

    addBox(root, 4.8, 4.6, 0.34, -5.4, 2.3, -5.0, materials.wallWarm, false, true);
    addBox(root, 0.34, 5.8, 7.4, 5.2, 2.9, -2.0, materials.wallWarm, false, true);
    addBox(root, 2.3, 2.3, 2.3, -1.0, 1.15, -9.2, materials.wallWarm, false, true);
    addBox(root, 5.4, 0.72, 2.0, 2.3, 0.36, 3.8, materials.wallWarm, false, true);

    root.add(new THREE.AmbientLight(0xf8f4ea, 1.2));
    addSpot(root, -5.5, 6.6, 7.5, -4.5, 2.0, -5.0, 1.4, 0.62);
    addSpot(root, 5.5, 6.6, 6.0, 4.8, 2.2, -3.0, 1.35, 0.62);
    addSpot(root, 0, 6.8, -7.0, 0, 1.4, -10.0, 1.45, 0.66);
  }

  function buildHallThree() {
    const root = roots.hall3;
    addBox(root, 18, 0.12, 22, 0, -0.06, -1.0, materials.floor, false, true);
    addBox(root, 0.24, 5.7, 15.5, -9, 2.85, -4.25, materials.wall, false, true);
    addBox(root, 0.24, 5.7, 15.5, 9, 2.85, -4.25, materials.wall, false, true);
    addBox(root, 18, 5.7, 0.24, 0, 2.85, -12, materials.wall, false, true);
    addBox(root, 6.7, 3.4, 0.24, -5.65, 1.7, 6.2, materials.wall, false, true);
    addBox(root, 6.7, 3.4, 0.24, 5.65, 1.7, 6.2, materials.stone, false, true);
    addBox(root, 0.24, 3.4, 4.4, -2.3, 1.7, 8.2, materials.wall, false, true);
    addBox(root, 0.24, 3.4, 4.4, 2.3, 1.7, 8.2, materials.stone, false, true);
    addBox(root, 4.8, 0.2, 4.4, 0, 3.42, 8.2, materials.wallWarm, false, true);
    addBox(root, 18, 0.22, 18.2, 0, 5.9, -3.0, materials.ceiling, false, true);
    addCeilingSlats(root, 18, 18, 5.77, -3.0);
    addBox(root, 18, 0.45, 0.48, 0, 5.28, 4.7, materials.wall, false, true);
    addBox(root, 1.2, 5.6, 1.2, -3.4, 2.8, -2.0, materials.wall, false, true);
    addBox(root, 1.2, 5.6, 1.2, 3.4, 2.8, -2.0, materials.wall, false, true);

    addArtwork(root, { file: 'foyer-mural.jpg', side: 'left', x: -2.16, y: 1.72, z: 8.2, width: 3.8, height: 3.0, frame: false });
    addArtwork(root, { file: 'hall3-abstract.jpg', side: 'left', x: -8.84, y: 2.55, z: 1.6, width: 2.45 });
    addArtwork(root, { file: 'hall3-straps.jpg', side: 'right', x: 8.84, y: 2.5, z: 1.2, width: 1.75 });
    addArtwork(root, { file: 'hall3-geometry.jpg', side: 'back', x: -5.5, y: 2.45, z: -11.84, width: 3.0 });
    addArtwork(root, { file: 'hall3-red.jpg', side: 'back', x: -1.3, y: 2.45, z: -11.84, width: 2.15 });
    addArtwork(root, { file: 'hall3-green.jpg', side: 'back', x: 2.0, y: 2.45, z: -11.84, width: 2.1 });
    addArtwork(root, { file: 'hall3-bw.jpg', side: 'right', x: 8.84, y: 2.45, z: -6.2, width: 1.65 });
    addArtwork(root, { file: 'hall3-orange.jpg', side: 'left', x: -8.84, y: 2.55, z: -6.5, width: 2.75 });
    addArtwork(root, { file: 'hall3-pink.jpg', side: 'right', x: 8.84, y: 2.4, z: -9.1, width: 2.3 });

    addPlinth(root, 3.4, 0.82, 1.45, 0, 0.41, 0.8);
    addPlinth(root, 2.5, 0.68, 2.0, -4.8, 0.34, -4.2);
    addPlinth(root, 2.8, 0.76, 1.6, 4.9, 0.38, -5.0);
    addGlassForms(root, 0, 1.05, 0.8);
    addBarrierLine(root, -7.8, 7.8, -10.5, 'x', 9);
    addPortal(root, { zone: 'hall3', targetZone: 'atrium', label: '回到 01 · 序厅', side: 'back', x: 6.9, y: 1.75, z: -11.82, width: 2.0, height: 3.5 });
    addGalleryLights(root, 18, 22, 5.72, 2);
  }

  function buildGalleryShell(root, width, depth, height) {
    addBox(root, width, 0.12, depth, 0, -0.06, 0, materials.floor, false, true);
    addBox(root, 0.24, height, depth, -width / 2, height / 2, 0, materials.wall, false, true);
    addBox(root, 0.24, height, depth, width / 2, height / 2, 0, materials.wall, false, true);
    addBox(root, width, height, 0.24, 0, height / 2, -depth / 2, materials.wall, false, true);
    addBox(root, width, 0.2, depth, 0, height + 0.15, 0, materials.ceiling, false, true);
    for (let x = -width / 2 + 1.2; x < width / 2; x += 3.0) {
      addBox(root, 0.07, 0.07, depth - 1.0, x, height - 0.18, 0, materials.beam, false, false);
    }
  }

  function addArtwork(root, config) {
    imageLoader.load(textureSource(config.file), (texture) => {
      prepareTexture(texture);
      const aspect = texture.image.width / texture.image.height;
      const width = config.width;
      const height = config.height || width / aspect;
      const backing = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.055),
        new THREE.MeshStandardMaterial({ color: config.frame === false ? 0xdedcd5 : 0x313235, roughness: 0.68 })
      );
      const image = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: !config.luminous })
      );
      placeOnSurface(backing, config.side, config.x, config.y, config.z, 0.035);
      placeOnSurface(image, config.side, config.x, config.y, config.z, 0.07);
      backing.castShadow = true;
      root.add(backing, image);
    });
  }

  function addHorizontalPolygon(root, points, y, material) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], -points[0][1]);
    points.slice(1).forEach(([x, z]) => shape.lineTo(x, -z));
    shape.closePath();
    const surface = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = y;
    surface.receiveShadow = true;
    root.add(surface);
    return surface;
  }

  function addWallSegment(root, x1, z1, x2, z2, height, material, thickness = 0.24) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const wall = addBox(root, Math.hypot(dx, dz), height, thickness, (x1 + x2) / 2, height / 2, (z1 + z2) / 2, material, false, true);
    wall.rotation.y = -Math.atan2(dz, dx);
    return wall;
  }

  function addWallSurfaceSegment(root, file, x1, z1, x2, z2, height, face = 1, thickness = 0.24) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const normalX = -dz / length;
    const normalZ = dx / length;
    const offset = (thickness / 2 + 0.015) * face;
    addWallSurface(root, {
      file,
      x: (x1 + x2) / 2 + normalX * offset,
      y: height / 2 + 0.08,
      z: (z1 + z2) / 2 + normalZ * offset,
      width: length - 0.08,
      height,
      rotationY: -Math.atan2(dz, dx) + (face < 0 ? Math.PI : 0),
    });
  }

  function addWallSurface(root, config) {
    imageLoader.load(textureSource(config.file), (texture) => {
      prepareTexture(texture);
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(config.width, config.height),
        new THREE.MeshStandardMaterial({ map: texture, color: 0xf2efe8, roughness: 0.88, metalness: 0.0, side: THREE.DoubleSide })
      );
      surface.position.set(config.x, config.y, config.z);
      surface.rotation.y = config.rotationY || 0;
      surface.receiveShadow = true;
      root.add(surface);
    });
  }

  function addHallOneCeilingTracks(root, height) {
    const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x414240 });
    const stripMaterial = new THREE.MeshBasicMaterial({ color: 0xc9c6bd });
    [-8.8, -4.4, 0.0, 4.4, 8.8].forEach((x) => {
      addBox(root, 0.04, 0.035, 31.0, x, height - 0.18, 0.4, trackMaterial, false, false);
      addBox(root, 0.04, 0.035, 31.0, x + 0.18, height - 0.18, 0.4, trackMaterial, false, false);
      for (let z = -13.5; z < 15.5; z += 5.8) {
        addBox(root, 0.055, 0.04, 1.0, x + 0.09, height - 0.16, z, stripMaterial, false, false);
      }
    });
  }

  function addPortal(root, config) {
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(config.width, config.height), materials.portal.clone());
    placeOnSurface(portal, config.side, config.x, config.y, config.z, 0.04);
    portal.userData = { isPortal: true, zone: config.zone, targetZone: config.targetZone, label: config.label };
    root.add(portal);
    portalMeshes.push(portal);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(portal.geometry),
      new THREE.LineBasicMaterial({ color: 0xa58c72, transparent: true, opacity: 0.48 })
    );
    edges.position.copy(portal.position);
    edges.rotation.copy(portal.rotation);
    root.add(edges);
  }

  function addTotem(root, x, z, rotation, height, variant) {
    const palette = [0x8d8178, 0x97745e, 0x697e70, 0xa36963, 0x887a9a];
    const group = new THREE.Group();
    const levels = Math.round(height / 0.36);
    for (let index = 0; index < levels; index += 1) {
      const material = new THREE.MeshStandardMaterial({ color: palette[(index + variant) % palette.length], roughness: 0.84 });
      const radius = index % 3 === 0 ? 0.38 : index % 3 === 1 ? 0.18 : 0.29;
      const geometry = index % 2 === 0
        ? new THREE.CylinderGeometry(radius * 0.55, radius, 0.28, 16)
        : new THREE.TorusGeometry(radius * 0.72, 0.07, 8, 20);
      const part = new THREE.Mesh(geometry, material);
      part.position.y = 0.18 + index * 0.31;
      part.rotation.x = index % 2 === 0 ? 0 : Math.PI / 2;
      part.castShadow = true;
      group.add(part);
    }
    group.position.set(x, 0.05, z);
    group.rotation.y = rotation;
    root.add(group);
  }

  function addRootLine(root) {
    const points = [
      new THREE.Vector3(-5.4, 0.08, 4.7), new THREE.Vector3(-4.6, 0.12, 3.1),
      new THREE.Vector3(-5.0, 0.10, 1.3), new THREE.Vector3(-3.8, 0.11, -0.1),
      new THREE.Vector3(-4.4, 0.08, -2.4), new THREE.Vector3(-2.8, 0.10, -4.8),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const rootLine = new THREE.Mesh(new THREE.TubeGeometry(curve, 42, 0.105, 7, false), materials.root);
    rootLine.castShadow = true;
    root.add(rootLine);
  }

  function addStair(root) {
    for (let index = 0; index < 11; index += 1) {
      const step = addBox(root, 3.0, 0.18, 0.58, 5.8, 0.09 + index * 0.31, -7.5 + index * 0.5, materials.wallWarm, true, true);
      step.rotation.y = -0.03;
    }
    addBox(root, 0.18, 4.0, 7.0, 7.35, 2.0, -4.8, materials.wallWarm, false, true);
  }

  function addGlassForms(root, x, y, z) {
    const colors = [0xb7d8dc, 0xd8c3a4, 0x4ba2bd, 0xd9d1c2, 0x9cb3b8];
    colors.forEach((color, index) => {
      const material = new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.72, roughness: 0.12, metalness: 0.05, clearcoat: 0.8 });
      const form = new THREE.Mesh(new THREE.SphereGeometry(0.22 + (index % 2) * 0.08, 24, 16), material);
      form.position.set(x - 1.1 + index * 0.55, y + (index % 2) * 0.12, z + Math.sin(index) * 0.18);
      form.scale.y = 1.25;
      form.castShadow = true;
      root.add(form);
    });
  }

  function addPlinth(root, width, height, depth, x, y, z) {
    return addBox(root, width, height, depth, x, y, z, materials.plinth, true, true);
  }

  function addBarrierLoop(root, points) {
    points.forEach(([x, z]) => addPost(root, x, z));
    for (let index = 0; index < points.length; index += 1) {
      const start = points[index];
      const end = points[(index + 1) % points.length];
      addRope(root, start[0], start[1], end[0], end[1]);
    }
  }

  function addBarrierLine(root, start, end, fixed, axis, count) {
    let previous = null;
    for (let index = 0; index < count; index += 1) {
      const value = THREE.MathUtils.lerp(start, end, index / (count - 1));
      const point = axis === 'x' ? [value, fixed] : [fixed, value];
      addPost(root, point[0], point[1]);
      if (previous) addRope(root, previous[0], previous[1], point[0], point[1]);
      previous = point;
    }
  }

  function addPost(root, x, z) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.72, 12), materials.darkMetal);
    post.position.set(x, 0.36, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.035, 18), materials.darkMetal);
    base.position.set(x, 0.018, z);
    root.add(post, base);
  }

  function addRope(root, x1, z1, x2, z2) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, 0.67, z1),
      new THREE.Vector3((x1 + x2) / 2, 0.58, (z1 + z2) / 2),
      new THREE.Vector3(x2, 0.67, z2),
    ]);
    root.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x242427, transparent: true, opacity: 0.86 })));
  }

  function addWallVent(root, side, x, z, length) {
    const group = new THREE.Group();
    for (let index = 0; index < 24; index += 1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, length / 24 - 0.025), materials.beam);
      slat.position.set(x, 0.45 + index * 0.018, z - length / 2 + (index + 0.5) * length / 24);
      group.add(slat);
    }
    group.rotation.y = side === 'left' ? 0 : Math.PI;
    root.add(group);
  }

  function addCeilingSlats(root, width, depth, y, zCenter) {
    for (let x = -width / 2 + 0.2; x < width / 2; x += 0.34) {
      addBox(root, 0.08, 0.13, depth, x, y, zCenter, materials.beam, false, false);
    }
    addBox(root, width, 0.25, 0.32, 0, y - 0.03, zCenter + 2.6, materials.whiteMetal, false, false);
  }

  function addGalleryLights(root, width, depth, height, shift) {
    const zRows = [-depth * 0.30, 0, depth * 0.30];
    zRows.forEach((z, row) => {
      addBox(root, width - 2.0, 0.06, 0.06, 0, height - 0.12, z, materials.darkMetal, false, false);
      for (let x = -width / 2 + 2.0; x < width / 2 - 1.0; x += 3.4) {
        addSpot(root, x, height - 0.2, z, x + ((row + shift) % 2 ? 0.8 : -0.8), 2.1, z - 2.1, 0.8, 0.48);
      }
    });
  }

  function addSpot(root, x, y, z, tx, ty, tz, intensity, angle) {
    const light = new THREE.SpotLight(0xffedd2, intensity, 12, angle, 0.55, 1.5);
    light.position.set(x, y, z);
    light.target.position.set(tx, ty, tz);
    light.castShadow = false;
    root.add(light, light.target);
  }

  function addBox(root, width, height, depth, x, y, z, material, castShadow = false, receiveShadow = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    root.add(mesh);
    return mesh;
  }

  function placeOnSurface(mesh, side, x, y, z, offset) {
    if (side === 'left') {
      mesh.position.set(x + offset, y, z);
      mesh.rotation.y = Math.PI / 2;
    } else if (side === 'right') {
      mesh.position.set(x - offset, y, z);
      mesh.rotation.y = -Math.PI / 2;
    } else if (side === 'front') {
      mesh.position.set(x, y, z - offset);
      mesh.rotation.y = Math.PI;
    } else {
      mesh.position.set(x, y, z + offset);
    }
  }

  function prepareTexture(texture) {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  function makeNoiseTexture(base, speck, size, amount) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const context = canvas.getContext('2d');
    context.fillStyle = base;
    context.fillRect(0, 0, size, size);
    context.fillStyle = speck;
    const count = Math.floor(size * size * amount);
    for (let index = 0; index < count; index += 1) {
      const radius = Math.random() * 0.7 + 0.1;
      context.globalAlpha = Math.random() * 0.12;
      context.fillRect(Math.random() * size, Math.random() * size, radius, radius);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function makeFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = '#696b6b';
    context.fillRect(0, 0, 512, 512);
    for (let index = 0; index < 9000; index += 1) {
      const light = 70 + Math.floor(Math.random() * 42);
      context.fillStyle = `rgba(${light},${light},${light},${Math.random() * 0.12})`;
      context.fillRect(Math.random() * 512, Math.random() * 512, 1.2, 1.2);
    }
    context.strokeStyle = 'rgba(20,22,23,.18)';
    context.lineWidth = 1;
    context.strokeRect(0, 0, 512, 512);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  function addAtmosphere() {
    Object.entries(roots).forEach(([name, root], zoneIndex) => {
      const positions = new Float32Array(520 * 3);
      for (let index = 0; index < positions.length; index += 3) {
        positions[index] = (Math.random() - 0.5) * 17;
        positions[index + 1] = 0.35 + Math.random() * (zoneIndex === 0 ? 7.1 : 5.2);
        positions[index + 2] = (Math.random() - 0.5) * 21;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xd8d2c5, size: 0.014, transparent: true, opacity: 0.18, depthWrite: false }));
      points.userData.zone = name;
      root.add(points);
    });
  }

  function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function updateHover() {
    if (!entered || isDragging) return;
    raycaster.setFromCamera(pointer, camera);
    const candidates = portalMeshes.filter((mesh) => mesh.userData.zone === currentZone);
    const hit = raycaster.intersectObjects(candidates, false)[0];
    hoverTarget = hit && hit.distance < 18 ? hit.object : null;
    crosshair.classList.toggle('is-active', Boolean(hoverTarget));
    sceneRoot.classList.toggle('is-pointing', Boolean(hoverTarget));
    targetLabel.classList.toggle('is-visible', Boolean(hoverTarget));
    if (hoverTarget) targetLabel.textContent = hoverTarget.userData.label;
  }

  function isArtworkGalleryZone(name = currentZone) {
    return Boolean(galleryModes[name]);
  }

  function configureGallery(name) {
    const mode = galleryModes[name];
    if (!mode) return;
    galleryArtworks = allGalleryArtworks.filter((button) => button.closest('.gallery-wall').dataset.galleryZone === name);
    galleryArtworkIndex = 0;
    galleryZoneTitle.textContent = mode.title;
    galleryDescription.textContent = mode.description;
    galleryHint.textContent = mode.hint;
    galleryArtworkTotal.textContent = String(galleryArtworks.length).padStart(2, '0');
    artworkGallery.setAttribute('aria-label', mode.ariaLabel);
    galleryWalls.forEach((wall) => {
      const current = wall.dataset.galleryZone === name;
      wall.classList.toggle('is-current', current);
      wall.setAttribute('aria-hidden', String(!current));
    });
    allGalleryArtworks.forEach((button) => {
      if (galleryArtworks.includes(button)) return;
      button.classList.remove('is-active', 'is-adjacent', 'is-near');
      button.tabIndex = -1;
    });
  }

  function switchZone(name) {
    if (!zones[name] || name === currentZone) {
      if (isArtworkGalleryZone(name)) {
        setGalleryArtwork(0);
        return;
      }
      resetCamera(false);
      return;
    }
    clearTimeout(transitionTimer);
    if (artworkDetailOpen) closeArtworkDetail(false);
    const zone = zones[name];
    transitionIndex.textContent = zone.index;
    transitionName.textContent = zone.shortName;
    transitionMood.textContent = zone.mood;
    transition.classList.add('is-active');
    const delay = reducedMotion ? 0 : 360;
    transitionTimer = setTimeout(() => {
      currentZone = name;
      const galleryVisible = isArtworkGalleryZone(name);
      setVisibleZone(galleryVisible ? 'hall2' : name);
      camera.position.copy(zone.start);
      yaw = zone.yaw;
      pitch = zone.pitch;
      cameraAnimation = null;
      hoverTarget = null;
      keys.clear();
      scene.fog.density = zone.fog;
      zoneName.textContent = zone.name;
      document.body.classList.toggle('is-gallery', galleryVisible);
      artworkGallery.setAttribute('aria-hidden', String(!galleryVisible));
      scene.background.set(galleryVisible ? 0xd1d0cb : 0x191918);
      scene.fog.color.set(galleryVisible ? 0xd1d0cb : 0x191918);
      if (galleryVisible) {
        configureGallery(name);
        setGalleryArtwork(0, true);
      }
      else setThoughtOpen(false);
      zoneButtons.forEach((button) => button.classList.toggle('is-current', button.dataset.zone === name));
      setTimeout(() => transition.classList.remove('is-active'), reducedMotion ? 1 : 360);
    }, delay);
  }

  function setGalleryArtwork(index, immediate = false) {
    galleryArtworkIndex = (index + galleryArtworks.length) % galleryArtworks.length;
    galleryArtworks.forEach((button, buttonIndex) => {
      let offset = buttonIndex - galleryArtworkIndex;
      if (offset > galleryArtworks.length / 2) offset -= galleryArtworks.length;
      if (offset < -galleryArtworks.length / 2) offset += galleryArtworks.length;
      const distance = Math.abs(offset);
      const visible = distance <= 2;
      button.classList.toggle('is-active', offset === 0);
      button.classList.toggle('is-adjacent', distance === 1);
      button.classList.toggle('is-near', visible);
      button.style.setProperty('--shift', `${offset * 40}vw`);
      button.style.setProperty('--lift', `${distance * 16}px`);
      button.style.setProperty('--turn', `${offset * -7}deg`);
      button.style.setProperty('--scale', String(offset === 0 ? 1 : distance === 1 ? 0.30 : 0.16));
      button.style.zIndex = String(4 - distance);
      button.tabIndex = visible ? 0 : -1;
    });
    galleryArtworkNumber.textContent = String(galleryArtworkIndex + 1).padStart(2, '0');
    updateThoughtPanel();
    updateThoughtAnchor();
    if (isArtworkGalleryZone()) moveGalleryCamera(galleryArtworkIndex, immediate);
  }

  function sizeGalleryArtwork(button, image) {
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const maxWidth = Math.min(window.innerWidth * 0.74, 1200);
    const maxHeight = Math.min(window.innerHeight * 0.74, 1000);
    button.style.setProperty('--art-width', `${Math.min(maxWidth, maxHeight * ratio)}px`);
    button.dataset.format = ratio >= 1 ? 'landscape' : 'portrait';
    if (button.classList.contains('is-active')) updateThoughtAnchor();
  }

  function updateThoughtAnchor() {
    const artwork = galleryArtworks[galleryArtworkIndex];
    const image = artwork && artwork.querySelector('img');
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const width = Math.min(window.innerWidth * 0.74, 1200, Math.min(window.innerHeight * 0.74, 1000) * ratio);
    const artworkHeight = width / ratio + 30;
    const anchorY = Math.min(window.innerHeight - 74, window.innerHeight * 0.49 + artworkHeight / 2 + 10);
    artworkGallery.style.setProperty('--thought-anchor-y', `${anchorY}px`);
  }

  function setThoughtOpen(open) {
    thoughtOpen = open;
    document.body.classList.toggle('is-thought-open', open);
    thoughtPanel.setAttribute('aria-hidden', String(!open));
    thoughtToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      updateThoughtPanel();
      setTimeout(() => thoughtInput.focus(), reducedMotion ? 1 : 320);
    }
  }

  function openArtworkDetail(artwork) {
    const name = artwork.dataset.name;
    const info = artworkInformation[name];
    artworkDetailOpen = true;
    artworkDetailTrigger = artwork;
    resetArtworkZoom();
    setThoughtOpen(false);
    document.body.classList.add('is-artwork-detail-open');
    artworkDetail.setAttribute('aria-hidden', 'false');
    artworkDetailImage.src = artwork.dataset.full;
    artworkDetailImage.alt = info ? `${info.title}，${info.artist}，原始拍摄` : `${name} 原始拍摄`;
    artworkDetailCategory.textContent = info ? info.category : '暂无对应作品签';
    artworkDetailTitle.textContent = info ? info.title : name;
    artworkDetailSubtitle.textContent = info && info.subtitle ? info.subtitle : '';
    artworkDetailSubtitle.hidden = !(info && info.subtitle);
    artworkDetailMeta.hidden = !info;
    if (info) {
      setArtworkDetailField(artworkDetailArtist, info.artist);
      setArtworkDetailField(artworkDetailYear, info.year);
      setArtworkDetailField(artworkDetailSize, info.size);
      setArtworkDetailField(artworkDetailMedium, info.medium);
      artworkDetailSource.textContent = `信息照片 ${info.source}`;
    } else {
      artworkDetailSource.textContent = `未在 reference/${galleryModes[currentZone].referenceFolder} 中找到可与此照片可靠对应的作品签。`;
    }
    setTimeout(() => artworkDetailClose.focus(), reducedMotion ? 1 : 260);
  }

  function setArtworkDetailField(element, value) {
    element.textContent = value;
    element.parentElement.hidden = !value;
  }

  function closeArtworkDetail(restoreFocus = true) {
    artworkDetailOpen = false;
    resetArtworkZoom();
    document.body.classList.remove('is-artwork-detail-open');
    artworkDetail.setAttribute('aria-hidden', 'true');
    artworkDetailImage.removeAttribute('src');
    if (restoreFocus && artworkDetailTrigger) artworkDetailTrigger.focus();
    artworkDetailTrigger = null;
  }

  function setArtworkZoom(nextZoom) {
    artworkZoom = Math.min(4, Math.max(1, Math.round(nextZoom * 100) / 100));
    if (artworkZoom === 1) {
      artworkPanX = 0;
      artworkPanY = 0;
    }
    constrainArtworkPan();
    updateArtworkTransform();
  }

  function resetArtworkZoom() {
    artworkZoom = 1;
    artworkPanX = 0;
    artworkPanY = 0;
    artworkPanning = false;
    artworkDetailViewport.classList.remove('is-panning');
    updateArtworkTransform();
  }

  function constrainArtworkPan() {
    const viewportWidth = artworkDetailViewport.clientWidth;
    const viewportHeight = artworkDetailViewport.clientHeight;
    const overflowX = (artworkDetailImage.clientWidth * artworkZoom - viewportWidth) / 2;
    const overflowY = (artworkDetailImage.clientHeight * artworkZoom - viewportHeight) / 2;
    const baseOffsetX = artworkDetailImage.offsetLeft + artworkDetailImage.clientWidth / 2 - viewportWidth / 2;
    const baseOffsetY = artworkDetailImage.offsetTop + artworkDetailImage.clientHeight / 2 - viewportHeight / 2;
    if (overflowX > 0) artworkPanX = Math.min(overflowX - baseOffsetX, Math.max(-overflowX - baseOffsetX, artworkPanX));
    else artworkPanX = 0;
    if (overflowY > 0) artworkPanY = Math.min(overflowY - baseOffsetY, Math.max(-overflowY - baseOffsetY, artworkPanY));
    else artworkPanY = 0;
  }

  function updateArtworkTransform() {
    artworkDetailImage.style.transform = `translate3d(${artworkPanX}px, ${artworkPanY}px, 0) scale(${artworkZoom})`;
    artworkDetailViewport.classList.toggle('is-zoomed', artworkZoom > 1);
    artworkZoomLevel.value = `${Math.round(artworkZoom * 100)}%`;
    artworkZoomOut.disabled = artworkZoom <= 1;
    artworkZoomIn.disabled = artworkZoom >= 4;
    artworkZoomReset.disabled = artworkZoom === 1 && artworkPanX === 0 && artworkPanY === 0;
  }

  function stopArtworkPan(event) {
    if (!artworkPanning) return;
    artworkPanning = false;
    artworkDetailViewport.classList.remove('is-panning');
    if (artworkDetailViewport.hasPointerCapture(event.pointerId)) artworkDetailViewport.releasePointerCapture(event.pointerId);
  }

  function updateThoughtPanel() {
    const artwork = galleryArtworks[galleryArtworkIndex];
    if (!artwork) return;
    const name = artwork.dataset.name;
    thoughtName.textContent = name;
    thoughtInput.value = thoughts[name] || '';
    thoughtCount.textContent = `${thoughtInput.value.length} / 1000`;
    thoughtStatus.textContent = '自动保存在此浏览器';
  }

  function saveThought() {
    const name = galleryArtworks[galleryArtworkIndex].dataset.name;
    thoughts[name] = thoughtInput.value;
    localStorage.setItem('space3-artwork-thoughts', JSON.stringify(thoughts));
    thoughtCount.textContent = `${thoughtInput.value.length} / 1000`;
    thoughtStatus.textContent = '已保存';
    clearTimeout(thoughtStatusTimer);
    thoughtStatusTimer = setTimeout(() => {
      thoughtStatus.textContent = '自动保存在此浏览器';
    }, 1200);
  }

  function moveGalleryCamera(index, immediate) {
    const poses = [
      [-4.6, 1.85, 10.4, -0.30], [-2.7, 2.10, 8.3, -0.20], [0.1, 1.72, 6.8, 0.02],
      [3.0, 1.95, 8.2, 0.23], [4.8, 1.78, 10.0, 0.32], [4.3, 2.08, 5.2, 0.46],
      [2.0, 1.75, 2.0, 0.34], [-0.2, 2.12, -0.8, 0.00], [-3.0, 1.82, 2.0, -0.34],
      [-4.8, 2.02, 5.0, -0.46], [-4.0, 1.76, -2.2, -0.50], [-2.0, 2.10, -5.1, -0.28],
      [2.0, 1.80, -5.0, 0.28], [4.1, 2.04, -2.0, 0.50],
    ];
    const [localX, y, z, targetYaw] = poses[index];
    const targetPosition = new THREE.Vector3(zones.hall2.offset.x + localX, y, z);
    if (immediate || reducedMotion) {
      camera.position.copy(targetPosition);
      yaw = targetYaw;
      pitch = -0.02;
      cameraAnimation = null;
      return;
    }
    cameraAnimation = {
      startTime: performance.now(), duration: 820,
      fromPosition: camera.position.clone(), toPosition: targetPosition,
      fromYaw: yaw, toYaw: nearestAngle(yaw, targetYaw), fromPitch: pitch, toPitch: -0.02,
    };
  }

  function setVisibleZone(name) {
    Object.entries(roots).forEach(([rootName, root]) => { root.visible = rootName === name; });
  }

  function resetCamera(immediate) {
    const zone = zones[currentZone];
    if (immediate) {
      camera.position.copy(zone.start);
      yaw = zone.yaw;
      pitch = zone.pitch;
      return;
    }
    cameraAnimation = {
      startTime: performance.now(), duration: reducedMotion ? 1 : 850,
      fromPosition: camera.position.clone(), toPosition: zone.start.clone(),
      fromYaw: yaw, toYaw: nearestAngle(yaw, zone.yaw), fromPitch: pitch, toPitch: zone.pitch,
    };
  }

  function updateCameraAnimation(now) {
    if (!cameraAnimation) return;
    const raw = Math.min((now - cameraAnimation.startTime) / cameraAnimation.duration, 1);
    const eased = 1 - Math.pow(1 - raw, 5);
    camera.position.lerpVectors(cameraAnimation.fromPosition, cameraAnimation.toPosition, eased);
    yaw = THREE.MathUtils.lerp(cameraAnimation.fromYaw, cameraAnimation.toYaw, eased);
    pitch = THREE.MathUtils.lerp(cameraAnimation.fromPitch, cameraAnimation.toPitch, eased);
    if (raw === 1) cameraAnimation = null;
  }

  function updateKeyboard(delta) {
    if (!entered) return;
    const speed = delta * 2.45;
    if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward(speed);
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward(-speed);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveSide(-speed);
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveSide(speed);
  }

  function moveForward(distance) {
    const direction = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    tryMove(direction.multiplyScalar(distance));
  }

  function moveSide(distance) {
    const direction = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    tryMove(direction.multiplyScalar(distance));
  }

  function tryMove(delta) {
    const next = camera.position.clone().add(delta);
    const zone = zones[currentZone];
    const localX = next.x - zone.offset.x;
    const localZ = next.z - zone.offset.z;
    next.x = zone.offset.x + THREE.MathUtils.clamp(localX, zone.bounds.x[0], zone.bounds.x[1]);
    next.z = zone.offset.z + THREE.MathUtils.clamp(localZ, zone.bounds.z[0], zone.bounds.z[1]);
    if (currentZone === 'hall3' && localZ > 5.9) next.x = zone.offset.x + THREE.MathUtils.clamp(localX, -1.95, 1.95);
    camera.position.copy(next);
  }

  function nearestAngle(from, to) {
    while (to - from > Math.PI) to -= Math.PI * 2;
    while (to - from < -Math.PI) to += Math.PI * 2;
    return to;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    galleryArtworks.forEach((button) => sizeGalleryArtwork(button, button.querySelector('img')));
    updateThoughtAnchor();
    if (artworkDetailOpen) {
      constrainArtworkPan();
      updateArtworkTransform();
    }
  }

  function animate(now = performance.now()) {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.04);
    updateKeyboard(delta);
    updateCameraAnimation(now);
    updateHover();
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    renderer.render(scene, camera);
  }
})();
