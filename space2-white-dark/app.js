(() => {
  'use strict';

  const sceneRoot = document.getElementById('scene');
  const intro = document.getElementById('intro');
  const enterButton = document.getElementById('enter');
  const interfaceLayer = document.getElementById('interface');
  const zoneName = document.getElementById('zone-name');
  const zoneButtons = [...document.querySelectorAll('.zone-button')];
  const resetButton = document.getElementById('reset');
  const crosshair = document.getElementById('crosshair');
  const targetLabel = document.getElementById('target-label');
  const loading = document.getElementById('loading');
  const transition = document.getElementById('transition');
  const transitionLabel = transition.querySelector('span');
  const viewer = document.getElementById('viewer');
  const viewerImage = document.getElementById('viewer-image');
  const viewerCaption = document.getElementById('viewer-caption');
  const viewerClose = document.getElementById('viewer-close');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!window.THREE) {
    loading.textContent = '3D 引擎未能载入';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sceneRoot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc8c5be);
  scene.fog = new THREE.FogExp2(0xc8c5be, 0.018);
  scene.add(new THREE.AmbientLight(0xb8c2c8, 0.085));

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.07, 70);
  camera.rotation.order = 'YXZ';

  const zones = {
    white: {
      name: '白厅 / WHITE HALL',
      transition: '白厅',
      start: new THREE.Vector3(0, 1.65, 5.35),
      yaw: 0,
      pitch: -0.035,
      background: 0xc8c5be,
      fog: 0.018,
    },
    dark: {
      name: '暗室 / LOWER DARK ROOM',
      transition: '暗室',
      start: new THREE.Vector3(40, 1.65, 3.35),
      yaw: 0,
      pitch: -0.025,
      background: 0x07090b,
      fog: 0.034,
    },
    upper: {
      name: '楼上 / UPPER LANDING',
      transition: '楼上',
      start: new THREE.Vector3(80, 1.65, 3.65),
      yaw: 0.12,
      pitch: -0.035,
      background: 0x090b0e,
      fog: 0.027,
    },
  };

  let currentZone = 'white';
  let yaw = zones.white.yaw;
  let pitch = zones.white.pitch;
  camera.position.copy(zones.white.start);
  camera.rotation.set(pitch, yaw, 0);

  const roots = {
    white: new THREE.Group(),
    dark: new THREE.Group(),
    upper: new THREE.Group(),
  };
  roots.dark.position.x = 40;
  roots.upper.position.x = 80;
  Object.values(roots).forEach((root) => scene.add(root));

  const imageLoader = new THREE.TextureLoader();
  const assets = './assets/artworks/';
  const embeddedTextures = window.location.protocol === 'file:' ? window.TESTMODEL2_EMBEDDED_TEXTURES || {} : {};
  const textureSource = (file) => embeddedTextures[file] || assets + file;
  const artMeshes = [];
  const portalMeshes = [];
  const keys = new Set();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(0, 0);
  const clock = new THREE.Clock();

  let entered = false;
  let isDragging = false;
  let didDrag = false;
  let lastX = 0;
  let lastY = 0;
  let hoverTarget = null;
  let focusedArtwork = null;
  let focusAnimation = null;
  let zoneTimer = null;

  const concreteTexture = makeConcreteTexture(0xd8d4cc, 0x918f89, true);
  concreteTexture.repeat.set(2.5, 2.5);
  const wallTexture = makeConcreteTexture(0xf5f5f2, 0xd8d9d6, false);
  wallTexture.repeat.set(3, 2);
  const darkTexture = makeConcreteTexture(0x181b1e, 0x090b0d, true);
  darkTexture.repeat.set(3, 2);
  const floorTexture = makeFloorTexture();
  floorTexture.repeat.set(3, 4);
  const diamondTexture = makeDiamondTexture();
  diamondTexture.repeat.set(6, 8);

  const materials = {
    whiteWall: new THREE.MeshStandardMaterial({ color: 0xffffff, map: wallTexture, roughness: 0.95 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xffffff, map: concreteTexture, roughness: 0.96 }),
    whiteFloor: new THREE.MeshStandardMaterial({ color: 0xffffff, map: floorTexture, roughness: 0.74, metalness: 0.04 }),
    darkWall: new THREE.MeshStandardMaterial({ color: 0xffffff, map: darkTexture, roughness: 0.98 }),
    darkFloor: new THREE.MeshStandardMaterial({ color: 0xffffff, map: diamondTexture, roughness: 0.5, metalness: 0.28 }),
    rail: new THREE.MeshStandardMaterial({ color: 0x202429, roughness: 0.42, metalness: 0.75 }),
    shadow: new THREE.MeshStandardMaterial({ color: 0x0b0d0f, roughness: 0.82 }),
    whiteBacking: new THREE.MeshStandardMaterial({ color: 0xe8e6df, roughness: 0.8 }),
  };

  buildWhiteHall();
  buildLowerDarkRoom();
  buildUpperLanding();
  addAtmosphere();

  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (!entered || event.button !== 0 || viewer.open) return;
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
    if (Math.abs(dx) + Math.abs(dy) > 2) {
      didDrag = true;
      focusedArtwork = null;
    }
    yaw -= dx * 0.0031;
    pitch -= dy * 0.00245;
    pitch = THREE.MathUtils.clamp(pitch, -1.02, 1.02);
    lastX = event.clientX;
    lastY = event.clientY;
    focusAnimation = null;
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    if (!isDragging) return;
    isDragging = false;
    sceneRoot.classList.remove('is-dragging');
    renderer.domElement.releasePointerCapture(event.pointerId);
    if (didDrag || !hoverTarget) return;

    if (hoverTarget.userData.isPortal) {
      switchZone(hoverTarget.userData.targetZone);
      return;
    }

    if (focusedArtwork === hoverTarget) openArtwork(hoverTarget);
    else {
      focusedArtwork = hoverTarget;
      focusOnArtwork(hoverTarget);
    }
  });

  renderer.domElement.addEventListener('wheel', (event) => {
    if (!entered || viewer.open) return;
    event.preventDefault();
    focusAnimation = null;
    focusedArtwork = null;
    moveForward(-event.deltaY * 0.00265);
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (viewer.open) return;
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
      keys.add(event.code);
      focusAnimation = null;
      focusedArtwork = null;
    }
  });

  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('resize', onResize);

  enterButton.addEventListener('click', () => {
    entered = true;
    intro.hidden = true;
    interfaceLayer.classList.add('is-visible');
    interfaceLayer.classList.add('is-light');
    interfaceLayer.setAttribute('aria-hidden', 'false');
  });

  zoneButtons.forEach((button) => button.addEventListener('click', () => switchZone(button.dataset.zone)));
  resetButton.addEventListener('click', resetCamera);
  viewerClose.addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (event) => {
    if (event.target === viewer) viewer.close();
  });

  setTimeout(() => loading.classList.add('is-done'), 950);
  animate();

  function buildWhiteHall() {
    const group = roots.white;
    addBox(group, 11, 0.14, 14, 0, -0.07, 0, materials.whiteFloor, false, true);
    addBox(group, 0.18, 5.5, 14, -5.5, 2.75, 0, materials.whiteWall, false, true);
    addBox(group, 0.18, 5.5, 14, 5.5, 2.75, 0, materials.whiteWall, false, true);
    addBox(group, 8.1, 5.5, 0.18, -1.45, 2.75, -7, materials.whiteWall, false, true);
    addBox(group, 1.5, 5.5, 0.18, 4.75, 2.75, -7, materials.whiteWall, false, true);
    addBox(group, 1.4, 2.25, 0.18, 3.3, 4.38, -7, materials.whiteWall, false, true);
    addBox(group, 11, 0.18, 14, 0, 5.55, 0, materials.concrete, false, true);

    addBox(group, 5.7, 0.28, 3.45, -2.35, 3.57, -4.45, materials.whiteWall, true, true);
    addBox(group, 5.7, 1.05, 0.2, -2.35, 4.18, -2.75, materials.whiteWall, true, true);
    addBox(group, 0.72, 5.5, 0.72, 0, 2.75, -0.55, materials.concrete, true, true);

    addStoryStrip(group);
    addSlatInstallation(group);
    addArtwork(group, {
      file: 'white-diptych.jpg', label: '双联作品', zone: 'white', side: 'right',
      x: 5.39, y: 2.32, z: -0.5, width: 3.35, backing: materials.whiteBacking,
    });

    const doorway = addPortal(group, {
      label: '穿过黑门 · 进入暗室', targetZone: 'dark', side: 'back',
      x: 3.3, y: 1.55, z: -6.89, width: 1.4, height: 3.1, color: 0x050607,
    });
    doorway.material.opacity = 0.98;

    addWindowWall(group);
    addWhiteLighting(group);
  }

  function buildLowerDarkRoom() {
    const group = roots.dark;
    addBox(group, 5.6, 0.12, 9, 0, -0.06, 0, materials.darkFloor, false, true);
    addBox(group, 0.16, 3.75, 9, -2.8, 1.875, 0, materials.darkWall, false, true);
    addBox(group, 0.16, 3.75, 9, 2.8, 1.875, 0, materials.darkWall, false, true);
    addBox(group, 5.6, 3.75, 0.16, 0, 1.875, -4.5, materials.darkWall, false, true);
    addBox(group, 5.6, 0.14, 9, 0, 3.82, 0, materials.darkWall, false, true);

    addArtwork(group, {
      file: 'dark-pale.jpg', label: '暗室竖幅作品', zone: 'dark', side: 'back',
      x: 0, y: 1.83, z: -4.4, width: 1.28, luminous: true,
    });

    addPortal(group, {
      label: '楼梯意向 · 通往楼上', targetZone: 'upper', side: 'left',
      x: -2.69, y: 1.78, z: 0.55, width: 1.24, height: 2.75,
      texture: 'stair-connection.jpg',
    });
    addPortal(group, {
      label: '返回白厅', targetZone: 'white', side: 'front',
      x: 0, y: 1.55, z: 4.4, width: 1.35, height: 3.05, color: 0xe7e5df,
    });

    addRailLight(group, 0, 3.56, 0.4, 2.8, -3.4, 0xfff0d8, 1.25);
    const glow = new THREE.PointLight(0xffe4bb, 1.35, 7, 2);
    glow.position.set(0, 2.0, -3.55);
    group.add(glow);
  }

  function buildUpperLanding() {
    const group = roots.upper;
    addBox(group, 8, 0.12, 10, 0, -0.06, 0, materials.darkFloor, false, true);
    addBox(group, 0.16, 3.6, 10, -4, 1.8, 0, materials.darkWall, false, true);
    addBox(group, 0.16, 3.6, 10, 4, 1.8, 0, materials.darkWall, false, true);
    addBox(group, 6.15, 3.6, 0.16, -0.925, 1.8, -5, materials.darkWall, false, true);
    addBox(group, 8, 0.14, 10, 0, 3.67, 0, materials.darkWall, false, true);

    addBox(group, 1.7, 0.12, 6.2, 3.05, -0.06, -8.05, materials.darkFloor, false, true);
    addBox(group, 0.14, 3.6, 6.2, 2.18, 1.8, -8.05, materials.darkWall, false, true);
    addBox(group, 0.14, 3.6, 6.2, 3.92, 1.8, -8.05, materials.darkWall, false, true);
    addBox(group, 1.88, 3.6, 0.14, 3.05, 1.8, -11.15, materials.darkWall, false, true);
    addBox(group, 1.88, 0.14, 6.2, 3.05, 3.67, -8.05, materials.darkWall, false, true);

    addArtwork(group, {
      file: 'upper-red.jpg', label: '红色横幅作品', zone: 'upper', side: 'left',
      x: -3.91, y: 2.02, z: 0.8, width: 1.78, luminous: true,
    });
    addArtwork(group, {
      file: 'upper-pair.jpg', label: '双幅小作品', zone: 'upper', side: 'back',
      x: 0.85, y: 1.98, z: -4.9, width: 1.12, luminous: true,
    });
    addArtwork(group, {
      file: 'corridor-light.jpg', label: '狭长通道尽端作品', zone: 'upper', side: 'back',
      x: 3.05, y: 1.9, z: -11.05, width: 0.62, luminous: true,
    });

    addUpperStair(group);
    addRailing(group);
    addPortal(group, {
      label: '沿楼梯回到暗室', targetZone: 'dark', side: 'front',
      x: -2.75, y: 1.35, z: 4.9, width: 1.45, height: 2.6, color: 0x07090b,
    });

    addRailLight(group, -1.6, 3.42, 0.5, -2.5, -3.4, 0xffe9d2, 0.65);
    const redGlow = new THREE.PointLight(0xff554e, 0.72, 6.5, 2);
    redGlow.position.set(-3.15, 2.0, 0.8);
    group.add(redGlow);
    const pairGlow = new THREE.PointLight(0xffecd5, 0.78, 5.5, 2);
    pairGlow.position.set(0.85, 2.0, -3.9);
    group.add(pairGlow);
    const upperFill = new THREE.PointLight(0x7d8d9e, 0.55, 10, 2);
    upperFill.position.set(0, 2.6, 1.1);
    group.add(upperFill);
  }

  function addStoryStrip(group) {
    imageLoader.load(textureSource('story-strip.jpg'), (texture) => {
      prepareTexture(texture);
      const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 4.78), material);
      mesh.position.set(0, 2.55, -0.184);
      mesh.userData = {
        isArtwork: true,
        file: 'story-strip.jpg',
        label: '柱面迁徙叙事长卷',
        zone: 'white',
        side: 'back',
        focusDistance: 3.7,
      };
      group.add(mesh);
      artMeshes.push(mesh);
    });
  }

  function addSlatInstallation(group) {
    const startX = -4.45;
    for (let index = 0; index < 6; index += 1) {
      const texture = makeSlatTexture(index);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffeee3,
        map: texture,
        roughness: 0.68,
        metalness: 0.06,
        emissive: 0x281713,
        emissiveIntensity: 0.08,
      });
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.35, 0.14), material);
      slat.position.set(startX + index * 0.62, 1.69, -6.77);
      slat.rotation.z = -0.105;
      slat.castShadow = true;
      group.add(slat);
    }
    addBox(group, 4.1, 0.12, 0.62, -2.86, 0.06, -6.66, materials.whiteBacking, false, true);
    const wash = new THREE.PointLight(0xffe7d8, 0.72, 5.5, 2);
    wash.position.set(-2.85, 1.4, -6.15);
    group.add(wash);
  }

  function addWindowWall(group) {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x505256, roughness: 0.42, metalness: 0.66 });
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xf4efe5, toneMapped: false });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(8.7, 4.6), lightMaterial);
    glow.position.set(-0.55, 2.55, 6.94);
    glow.rotation.y = Math.PI;
    group.add(glow);
    for (const x of [-4.9, -2.75, -0.6, 1.55, 3.7]) addBox(group, 0.09, 4.7, 0.09, x, 2.55, 6.87, frameMaterial, false, false);
    addBox(group, 9.0, 0.09, 0.09, -0.55, 1.65, 6.87, frameMaterial, false, false);
    addBox(group, 9.0, 0.09, 0.09, -0.55, 3.55, 6.87, frameMaterial, false, false);
    const daylight = new THREE.PointLight(0xf7f1e7, 2.0, 18, 1.7);
    daylight.position.set(-0.5, 3.4, 5.4);
    daylight.castShadow = true;
    daylight.shadow.mapSize.set(1024, 1024);
    group.add(daylight);
  }

  function addWhiteLighting(group) {
    for (const x of [-3.15, 2.4]) addBox(group, 0.045, 0.045, 10.8, x, 5.23, -0.25, materials.rail, false, false);
    const positions = [
      [-3.15, 3.8, -3.2, 0], [-3.15, 1.0, -2.6, -0.5], [-3.15, -1.8, -3.0, -2.5],
      [2.4, 3.8, 4.8, 0], [2.4, 0.7, 4.7, -0.4], [2.4, -2.6, 3.2, -4.5],
    ];
    positions.forEach(([x, z, tx, tz]) => addRailLight(group, x, 5.13, z, tx, tz, 0xfff4e8, 0.72));
  }

  function addRailLight(group, x, y, z, targetX, targetZ, color, intensity) {
    const fixture = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.28, 14), materials.rail);
    fixture.position.set(x, y - 0.12, z);
    fixture.rotation.x = Math.PI / 2;
    group.add(fixture);
    const light = new THREE.SpotLight(color, intensity, 10, Math.PI / 5.5, 0.6, 1.6);
    light.position.set(x, y - 0.24, z);
    light.target.position.set(targetX, 1.7, targetZ);
    light.castShadow = false;
    group.add(light, light.target);
  }

  function addUpperStair(group) {
    for (let index = 0; index < 11; index += 1) {
      addBox(group, 1.55, 0.14, 0.38, -2.78, 0.07 + index * 0.12, 5.25 + index * 0.33, materials.darkFloor, false, true);
    }
  }

  function addRailing(group) {
    for (const z of [1.7, 3.2, 4.7]) addBox(group, 0.05, 1.1, 0.05, 3.1, 0.58, z, materials.rail, false, false);
    addBox(group, 0.06, 0.06, 4.7, 3.1, 1.12, 2.35, materials.rail, false, false);
    addBox(group, 0.06, 0.06, 4.7, 3.1, 0.56, 2.35, materials.rail, false, false);
  }

  function addArtwork(group, config) {
    imageLoader.load(textureSource(config.file), (texture) => {
      prepareTexture(texture);
      const aspect = texture.image.width / texture.image.height;
      const width = config.width;
      const height = config.height || width / aspect;
      const material = config.luminous
        ? new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        : new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
      const backingMaterial = config.backing || materials.shadow;
      const backing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.07, height + 0.07, 0.07), backingMaterial);
      const image = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      placeOnSurface(backing, config.side, config.x, config.y, config.z, -0.045);
      placeOnSurface(image, config.side, config.x, config.y, config.z, 0.004);
      backing.castShadow = true;
      image.userData = {
        isArtwork: true,
        file: config.file,
        label: config.label,
        zone: config.zone,
        side: config.side,
      };
      group.add(backing, image);
      artMeshes.push(image);
    });
  }

  function addPortal(group, config) {
    let material;
    if (config.texture) {
      const texture = imageLoader.load(textureSource(config.texture), prepareTexture);
      material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    } else {
      material = new THREE.MeshBasicMaterial({ color: config.color, toneMapped: false });
    }
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(config.width, config.height), material);
    placeOnSurface(portal, config.side, config.x, config.y, config.z, 0);
    portal.userData = {
      isPortal: true,
      label: config.label,
      targetZone: config.targetZone,
      zone: config.targetZone === 'white' ? currentZone : config.targetZone,
    };
    group.add(portal);
    portalMeshes.push(portal);
    return portal;
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

  function addBox(group, width, height, depth, x, y, z, material, castShadow = false, receiveShadow = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    group.add(mesh);
    return mesh;
  }

  function prepareTexture(texture) {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return texture;
  }

  function makeConcreteTexture(light, dark, scratches) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    const lightColor = new THREE.Color(light);
    const darkColor = new THREE.Color(dark);
    const image = context.createImageData(canvas.width, canvas.height);
    for (let index = 0; index < image.data.length; index += 4) {
      const mix = Math.min(1, Math.max(0, 0.62 + (Math.random() - 0.5) * 0.22));
      image.data[index] = Math.round(THREE.MathUtils.lerp(darkColor.r, lightColor.r, mix) * 255);
      image.data[index + 1] = Math.round(THREE.MathUtils.lerp(darkColor.g, lightColor.g, mix) * 255);
      image.data[index + 2] = Math.round(THREE.MathUtils.lerp(darkColor.b, lightColor.b, mix) * 255);
      image.data[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    if (scratches) {
      context.globalAlpha = 0.1;
      for (let index = 0; index < 42; index += 1) {
        context.strokeStyle = index % 2 ? '#ece9e1' : '#26292c';
        context.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        context.moveTo(x, y);
        context.lineTo(x + (Math.random() - 0.5) * 80, y + Math.random() * 90);
        context.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function makeFloorTexture() {
    const texture = makeConcreteTexture(0xa8aaa8, 0x747878, true);
    const canvas = texture.image;
    const context = canvas.getContext('2d');
    context.strokeStyle = 'rgba(40, 42, 43, 0.2)';
    context.lineWidth = 1;
    for (let index = 0; index < 7; index += 1) {
      context.beginPath();
      context.moveTo(Math.random() * 512, Math.random() * 512);
      context.bezierCurveTo(Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512);
      context.stroke();
    }
    texture.needsUpdate = true;
    return texture;
  }

  function makeDiamondTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#202327';
    context.fillRect(0, 0, 256, 256);
    context.strokeStyle = 'rgba(125, 131, 138, 0.22)';
    context.lineWidth = 2;
    for (let y = -16; y < 272; y += 24) {
      for (let x = -16; x < 272; x += 24) {
        context.beginPath();
        context.moveTo(x, y + 7);
        context.lineTo(x + 8, y);
        context.lineTo(x + 16, y + 7);
        context.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function makeSlatTexture(index) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, '#dce4e7');
    gradient.addColorStop(0.28, '#f1cfbd');
    gradient.addColorStop(0.82, '#edc0ad');
    gradient.addColorStop(1, '#abc0c8');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 1024);
    context.fillStyle = index < 2 ? 'rgba(213, 102, 72, 0.78)' : 'rgba(255, 255, 255, 0.74)';
    const count = index === 0 ? 1 : 4 + index;
    for (let dot = 0; dot < count; dot += 1) {
      const radius = index === 0 ? 22 : 7 + (dot % 3) * 2;
      const y = 260 + ((dot * 103 + index * 149) % 650);
      context.beginPath();
      context.arc(64, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function addAtmosphere() {
    const count = 360;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const zoneOffset = [0, 40, 80][index % 3];
      positions[index * 3] = zoneOffset + (Math.random() - 0.5) * 10;
      positions[index * 3 + 1] = 0.35 + Math.random() * 4.8;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xd9e0e2, size: 0.016, transparent: true, opacity: 0.24, depthWrite: false });
    const dust = new THREE.Points(geometry, material);
    dust.name = 'dust';
    scene.add(dust);
  }

  function updatePointer(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function updateHover() {
    if (!entered || isDragging || viewer.open) return;
    raycaster.setFromCamera(pointer, camera);
    const candidates = [...artMeshes, ...portalMeshes].filter((mesh) => mesh.userData.zone === currentZone || mesh.parent === roots[currentZone]);
    const hit = raycaster.intersectObjects(candidates, false)[0];
    hoverTarget = hit && hit.distance < 9 ? hit.object : null;
    crosshair.classList.toggle('is-active', Boolean(hoverTarget));
    sceneRoot.classList.toggle('is-pointing', Boolean(hoverTarget));
    targetLabel.classList.toggle('is-visible', Boolean(hoverTarget));
    if (!hoverTarget) return;
    if (hoverTarget.userData.isPortal) targetLabel.textContent = hoverTarget.userData.label;
    else {
      const action = focusedArtwork === hoverTarget ? '再次点击查看原图' : '点击靠近';
      targetLabel.textContent = hoverTarget.userData.label + ' · ' + action;
    }
  }

  function focusOnArtwork(artwork) {
    const world = new THREE.Vector3();
    artwork.getWorldPosition(world);
    const target = world.clone();
    const side = artwork.userData.side;
    if (side === 'left') target.x += 1.65;
    else if (side === 'right') target.x -= 1.65;
    else if (side === 'front') target.z -= 1.7;
    else target.z += artwork.userData.focusDistance || 1.75;
    target.y = 1.65;

    const direction = world.clone().sub(target);
    const targetYaw = Math.atan2(-direction.x, -direction.z);
    const horizontal = Math.hypot(direction.x, direction.z);
    const targetPitch = -Math.atan2(direction.y - 1.65, horizontal);
    focusAnimation = {
      startTime: performance.now(),
      duration: reducedMotion ? 1 : 950,
      fromPosition: camera.position.clone(),
      toPosition: target,
      fromYaw: yaw,
      toYaw: nearestAngle(yaw, targetYaw),
      fromPitch: pitch,
      toPitch: targetPitch,
    };
  }

  function openArtwork(artwork) {
    viewerImage.src = assets + artwork.userData.file;
    viewerImage.alt = artwork.userData.label + ' 原图';
    viewerCaption.textContent = artwork.userData.label;
    keys.clear();
    viewer.showModal();
  }

  function switchZone(name, immediate = false) {
    if (!zones[name]) return;
    if (name === currentZone && !immediate) {
      resetCamera();
      return;
    }
    clearTimeout(zoneTimer);
    transitionLabel.textContent = zones[name].transition;
    transition.classList.add('is-active');
    const delay = immediate || reducedMotion ? 0 : 250;
    zoneTimer = setTimeout(() => {
      currentZone = name;
      camera.position.copy(zones[name].start);
      yaw = zones[name].yaw;
      pitch = zones[name].pitch;
      focusAnimation = null;
      focusedArtwork = null;
      hoverTarget = null;
      keys.clear();
      scene.background.setHex(zones[name].background);
      scene.fog.color.setHex(zones[name].background);
      scene.fog.density = zones[name].fog;
      zoneName.textContent = zones[name].name;
      interfaceLayer.classList.toggle('is-light', name === 'white');
      zoneButtons.forEach((button) => button.classList.toggle('is-current', button.dataset.zone === name));
      setTimeout(() => transition.classList.remove('is-active'), reducedMotion ? 1 : 320);
    }, delay);
  }

  function resetCamera() {
    const zone = zones[currentZone];
    focusedArtwork = null;
    focusAnimation = {
      startTime: performance.now(),
      duration: reducedMotion ? 1 : 850,
      fromPosition: camera.position.clone(),
      toPosition: zone.start.clone(),
      fromYaw: yaw,
      toYaw: nearestAngle(yaw, zone.yaw),
      fromPitch: pitch,
      toPitch: zone.pitch,
    };
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
    const previous = camera.position.clone();
    const next = camera.position.clone().add(delta);
    if (currentZone === 'white') {
      next.x = THREE.MathUtils.clamp(next.x, -5.05, 5.05);
      next.z = THREE.MathUtils.clamp(next.z, -6.35, 6.35);
      if (Math.abs(next.x) < 0.62 && next.z < -0.05 && next.z > -1.05) return;
    } else if (currentZone === 'dark') {
      next.x = THREE.MathUtils.clamp(next.x, 37.55, 42.45);
      next.z = THREE.MathUtils.clamp(next.z, -4.05, 4.05);
    } else {
      const localX = next.x - 80;
      next.z = THREE.MathUtils.clamp(next.z, -10.72, 4.45);
      if (next.z < -4.55) {
        if (localX < 2.28 || localX > 3.72) next.copy(previous);
        else next.x = THREE.MathUtils.clamp(next.x, 82.28, 83.72);
      } else {
        next.x = THREE.MathUtils.clamp(next.x, 76.4, 83.6);
      }
    }
    camera.position.copy(next);
  }

  function nearestAngle(from, to) {
    while (to - from > Math.PI) to -= Math.PI * 2;
    while (to - from < -Math.PI) to += Math.PI * 2;
    return to;
  }

  function updateFocus(now) {
    if (!focusAnimation) return;
    const raw = Math.min((now - focusAnimation.startTime) / focusAnimation.duration, 1);
    const eased = 1 - Math.pow(1 - raw, 5);
    camera.position.lerpVectors(focusAnimation.fromPosition, focusAnimation.toPosition, eased);
    yaw = THREE.MathUtils.lerp(focusAnimation.fromYaw, focusAnimation.toYaw, eased);
    pitch = THREE.MathUtils.lerp(focusAnimation.fromPitch, focusAnimation.toPitch, eased);
    if (raw === 1) focusAnimation = null;
  }

  function updateKeyboard(delta) {
    if (!entered || viewer.open) return;
    const speed = delta * 2.2;
    if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward(speed);
    if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward(-speed);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) moveSide(-speed);
    if (keys.has('KeyD') || keys.has('ArrowRight')) moveSide(speed);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  }

  function animate(now = performance.now()) {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.04);
    updateKeyboard(delta);
    updateFocus(now);
    updateHover();
    camera.rotation.set(pitch, yaw, 0);
    const dust = scene.getObjectByName('dust');
    if (dust && !reducedMotion) dust.rotation.y = now * 0.000008;
    renderer.render(scene, camera);
  }
})();
