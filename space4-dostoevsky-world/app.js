(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const manifest = window.PHOTO_MANIFEST;
  const embeddedTextures = window.location.protocol === 'file:' ? window.SPACE4_EMBEDDED_TEXTURES || {} : {};
  const photos = new Map(manifest.map((photo) => [Number(photo.source.slice(4, 8)), photo]));
  const zones = [
    { id: 'green', name: '绿', title: '童年与早期作品', color: '#a6ae55', accent: '#c2c77e', width: 9, start: 0, end: -11, overview: [3668,3669,3670,3673,3674,3683,3684] },
    { id: 'grey', name: '灰', title: '转折与流放', color: '#817567', accent: '#c1b4a6', width: 6.6, start: -11, end: -21, overview: [3685,3688,3689,3690,3691] },
    { id: 'blue', name: '蓝', title: '重返写作', color: '#385561', accent: '#91b6c2', width: 6.4, start: -21, end: -35, overview: [3695,3696,3697,3700,3702,3703] },
    { id: 'red', name: '红', title: '《罪与罚》与《白痴》', color: '#9a303d', accent: '#e9a1a6', width: 9, start: -35, end: -47, overview: [3705,3706,3707,3721,3722] },
    { id: 'yellow', name: '黄', title: '晚期作品与回望', color: '#b3a580', accent: '#ddd0a2', width: 8, start: -47, end: -65, overview: [3725,3726,3729,3730,3732,3733,3734,3739,3740,3743,3744,3745,3747,3748,3749] },
  ];
  // Titles below are transcribed only where the photographed label is readable.
  const titles = {
    3671:'军事工程学校的低年级学生', 3672:'工程兵宫', 3675:'《穷人》', 3693:'旧礼仪派教徒', 3694:'沉睡者',
    3698:'卷首画', 3711:'索涅奇卡与斯维德里盖洛夫', 3724:'《白痴》',
    3727:'《群魔》手稿（复制件）', 3731:'阴郁的女人', 3741:'肖像与雕塑 · 组合展柜',
    3742:'陀思妥耶夫斯基肖像', 3749:'语录墙',
  };
  const labelSources = {3680:3681,3686:3687,3708:3709};
  const overviewPanels = new Set([3669,3685,3696,3707,3725]);
  const opticalFrames = [3713,3714,3715,3716,3717,3718,3719,3720];
  const works = manifest.filter((photo) => photo.selected).map((photo) => ({
    ...photo, number:Number(photo.source.slice(4,8)), title: titles[Number(photo.source.slice(4,8))] || `展品 · ${photo.source.slice(0,-4)}`,
  }));
  const workMap = new Map(works.map((work) => [work.number,work]));
  const stage = $('#scene');
  const viewer = $('#viewer');
  const authorGuide = $('#author-guide');
  const authorFrame = $('#author-frame');
  const image = $('#full-image');
  let currentZone = -1, currentWork = null, focusedWork = null, entered = false, authorReturnFocus = null;
  let camera, renderer, scene, yaw = .38, pitch = 0, flight = null;
  const keys = new Set(), colliders = [], pickables = [], textureCache = new Map(), roomLights=[];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let textureFailures = 0;

  function setFeelingContext(work) {
    const zone=work&&zones.find(zone=>zone.id===work.zone);
    dispatchEvent(new CustomEvent('exhibition-feeling-context',{detail:{
      exhibitionId:'dostoevsky-world',key:work?.number||'',title:work?.title||'',
      eyebrow:work&&zone?(work.number==='optical'?`${zone.name}区 · 八张连拍`:`${zone.name}区 · IMG_${work.number}`):'当前展品',
    }}));
  }

  function photoUrl(n) { return photos.get(n).photo; }
  function texture(url) {
    if (!textureCache.has(url)) {
      const map = new THREE.TextureLoader(manager).load(embeddedTextures[url] || url);
      map.encoding = THREE.sRGBEncoding;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textureCache.set(url,map);
    }
    return textureCache.get(url);
  }
  const manager = new THREE.LoadingManager();
  manager.onError = () => { textureFailures++; };
  manager.onLoad = () => {
    $('#enter').disabled = false;
    $('#enter').textContent = '走进展厅 →';
    if (textureFailures) { $('#failure').hidden = false; $('#failure').textContent = '部分照片加载失败，请刷新页面重试。'; }
  };

  function material(color) { return new THREE.MeshLambertMaterial({color:new THREE.Color(color).convertSRGBToLinear()}); }
  function box(parent,w,h,d,x,y,z,mat,solid=false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z); parent.add(mesh);
    if (solid) { mesh.updateWorldMatrix(true,false); colliders.push(new THREE.Box3().setFromObject(mesh)); }
    return mesh;
  }
  function canvasTexture(width,height,paint) {
    const canvas = document.createElement('canvas'); canvas.width=width;canvas.height=height;
    paint(canvas.getContext('2d'),width,height);
    const map = new THREE.CanvasTexture(canvas); map.encoding=THREE.sRGBEncoding; return map;
  }
  function surface(color,lit=false) {
    const map=canvasTexture(256,256,(ctx,w,h)=>{
      ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
      let seed=42;
      for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
        seed=(seed*1664525+1013904223)>>>0;const v=seed/4294967296;
        ctx.fillStyle=`rgba(${v>.5?'220,210,186':'15,18,15'},${.012+v*.018})`;ctx.fillRect(x,y,1,1);
      }
      if(lit){const glow=ctx.createRadialGradient(128,70,5,128,90,180);glow.addColorStop(0,'rgba(255,242,200,.22)');glow.addColorStop(1,'rgba(5,10,7,.22)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);}
    });
    return new THREE.MeshLambertMaterial({map});
  }
  function plane(parent,w,h,x,y,z,map,basic=true) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h), basic ? new THREE.MeshBasicMaterial({map, toneMapped:false}) : new THREE.MeshLambertMaterial({map}));
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function wordTexture(lines,bg,fg='#e8e1cc') {
    return canvasTexture(768,512,(ctx,w,h)=>{
      ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.textAlign='center';
      ctx.font='34px SimSun';
      lines.forEach((line,i)=>ctx.fillText(line,w/2,215+i*58));
      ctx.strokeStyle=fg;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(285,140);ctx.lineTo(483,140);ctx.stroke();
    });
  }
  function addTextPanel(n,x,z,rotation,width=1.25,height=2.1) {
    const p=photos.get(n),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
    if(p.role==='text'){
      const scale=overviewPanels.has(n)?1.4:1.25;
      height*=scale;width=height*(p.aspect||p.width/p.height);
    }
    const mesh=plane(g,width,height,0,1.8,.03,texture(p.asset||p.photo));
    mesh.userData.panel=n;pickables.push(mesh);
  }
  function addOpticalPanel(n,x,z,rotation,width=1.35,height=1.8) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
    const mesh=plane(g,width,height,0,height/2,.03,texture(photoUrl(n)));
    mesh.userData.optical=true;pickables.push(mesh);
  }
  function addWork(group,n,x,y,maxWidth,maxHeight,flat=false) {
    const work=workMap.get(n),w=Math.min(maxWidth,maxHeight*work.aspect),h=w/work.aspect;
    const mesh=plane(group,w,h,x,y,flat?.43:.09,texture(work.asset));
    if(flat)mesh.rotation.x=-Math.PI/2+.23;
    mesh.userData.work=n;pickables.push(mesh);work.mesh=mesh;
    const plaque=wordTexture([String(n)],'#c9c3ae','#383b33');
    const label=plane(group,.22,.10,x+w*.27,flat?.86:y-h/2-.105,flat?.72:.105,plaque);
    if(flat)label.rotation.x=-.4;
  }
  function cabinet({x,z,r=0,w=3.6,hang=[],shelf=[],groupPhoto=false}) {
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=r;scene.add(group);
    const dark=material('#20221f'),felt=surface('#a29d90',true);
    box(group,w,2.25,.10,0,1.83,-.05,felt);
    box(group,w+.18,.68,.72,0,.37,.21,dark,true);
    box(group,w+.18,.15,.73,0,3.0,.23,dark);
    box(group,.09,2.65,.65,-w/2-.045,1.69,.18,dark);
    box(group,.09,2.65,.65,w/2+.045,1.69,.18,dark);
    box(group,w,.075,.8,0,.91,.28,material('#77766b'));
    for(let i=0;i<3;i++) {
      const lamp=box(group,.15,.025,.12,(i-1)*w*.3,2.915,.43,new THREE.MeshBasicMaterial({color:'#eee6d1'}));
      lamp.rotation.x=.1;
    }
    hang.forEach((n,i)=>addWork(group,n,(i-(hang.length-1)/2)*(w-.35)/Math.max(hang.length,1),1.95,(w-.5)/Math.max(hang.length,1)-.12,groupPhoto?1.85:1.48));
    shelf.forEach((n,i)=>addWork(group,n,(i-(shelf.length-1)/2)*(w-.25)/shelf.length,1.025,(w-.45)/shelf.length-.1,.62,true));
    group.updateWorldMatrix(true,true);
    return group;
  }

  function buildRoom(zone,index) {
    const width=zone.width, length=zone.start-zone.end,mid=(zone.start+zone.end)/2;
    const wall=surface(zone.color,true),dark=material('#222722');
    box(scene,width,.08,length,0,-.045,mid,surface(index===3?'#672a34':'#30322e'));
    box(scene,.18,3.45,length,-width/2,1.725,mid,wall,true);
    box(scene,.18,3.45,length,width/2,1.725,mid,wall,true);
    box(scene,width,.09,length,0,3.73,mid,material('#151c19'));
    if(index===0) box(scene,width,3.45,.18,0,1.725,0,wall,true);
    const doorLeft=.6,doorRight=2.6;
    if(index<4) {
      const boundaryWidth=Math.max(width,zones[index+1].width);
      box(scene,boundaryWidth/2+doorLeft,3.45,.20,(-boundaryWidth/2+doorLeft)/2,1.725,zone.end,wall,true);
      box(scene,boundaryWidth/2-doorRight,3.45,.20,(boundaryWidth/2+doorRight)/2,1.725,zone.end,wall,true);
      box(scene,2, .52,.21,1.6,3.19,zone.end,wall);
      box(scene,.025,2.88,.025,.64,1.44,zone.end+.12,new THREE.MeshBasicMaterial({color:'#e9e6d4'}));
      const sign=wordTexture([`${zones[index+1].name} →`],zone.color);
      plane(scene,.7,.46,1.6,3.18,zone.end+.115,sign);
    } else box(scene,width,3.45,.20,0,1.725,zone.end,wall,true);
    // Exposed ceiling, transverse beams and two continuous lighting tracks.
    for(let z=zone.start-1.1;z>zone.end;z-=2.8) {
      box(scene,width,.15,.12,0,3.5,z,dark);
      for(const side of [-1,1]) {
        const x=side*(width/2-1.05);
        box(scene,.08,.14,.30,x,3.27,z,dark);
        box(scene,.08,.02,.13,x,3.185,z,new THREE.MeshBasicMaterial({color:'#d6d0b7'}));
      }
    }
    for(const side of [-1,1]) {
      box(scene,.055,.07,length,side*(width/2-1.05),3.4,mid,dark);
      box(scene,.04,.08,length,side*(width/2-.12),.07,mid,dark);
    }
  }
  function buildScene() {
    scene=new THREE.Scene();scene.background=new THREE.Color('#171c18');scene.fog=new THREE.Fog('#242723',19,46);
    camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.06,90);camera.rotation.order='YXZ';
    renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
    renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
    renderer.outputEncoding=THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight('#ede5cd','#343b35',.58));
    const light=new THREE.DirectionalLight('#fff1d8',.3);light.position.set(-3,8,4);scene.add(light);
    for(let i=0;i<3;i++) {
      const spot=new THREE.SpotLight('#fff0d5',.9,14,Math.PI/3,.85,1);
      scene.add(spot,spot.target);roomLights.push(spot);
    }
    zones.forEach(buildRoom);
    cabinet({x:-4.36,z:-4.75,r:Math.PI/2,w:3.7,hang:[3672,3671]});
    // Preserve the photographed contents of the tall alcove as one contextual view.
    addTextPanel(3670,-4.35,-8.25,Math.PI/2,.98,2.55);
    const arch=new THREE.Group();arch.position.set(-4.33,0,-8.25);arch.rotation.y=Math.PI/2;scene.add(arch);
    const archShape=new THREE.Shape();archShape.absarc(0,2.65,.62,0,Math.PI,false);archShape.lineTo(.62,2.65);
    const archCap=new THREE.Mesh(new THREE.ShapeGeometry(archShape),material('#525e2e'));archCap.position.z=.02;arch.add(archCap);
    addTextPanel(3669,4.37,-1.5,-Math.PI/2,1.1,2.1);
    cabinet({x:4.36,z:-5.65,r:-Math.PI/2,w:5.6,hang:[3676,3677,3678,3679],shelf:[3675]});
    addTextPanel(3674,-4.37,-1.7,Math.PI/2,1.25,2.1);
    cabinet({x:-1.95,z:-10.83,w:4.1,hang:[3680,3682]});
    cabinet({x:3.16,z:-15.65,r:-Math.PI/2,w:3.8,hang:[3686]});
    addTextPanel(3685,3.17,-12.35,-Math.PI/2,1.0,2.0);
    cabinet({x:-3.16,z:-16.5,r:Math.PI/2,w:4.6,hang:[3693,3694],shelf:[3692]});
    addTextPanel(3691,-3.17,-12.8,Math.PI/2,1.1,2.1);
    const mural=new THREE.Group();mural.position.set(-1.23,0,-20.85);scene.add(mural);addWork(mural,3689,0,1.75,3.4,2.4);
    cabinet({x:3.06,z:-26.05,r:-Math.PI/2,w:3.9,hang:[3698],shelf:[3699]});
    addTextPanel(3696,3.07,-22.35,-Math.PI/2,1.0,2.0);
    cabinet({x:-3.06,z:-30,r:Math.PI/2,w:4.3,hang:[3701],shelf:[3704]});
    addTextPanel(3700,-3.07,-26.55,Math.PI/2,1.1,2.1);
    addTextPanel(3697,-3.07,-23.2,Math.PI/2,1.2,2.1);
    addTextPanel(3703,-1.2,-34.85,0,2.8,2.1);
    addTextPanel(3707,4.37,-36.6,-Math.PI/2,1.05,2.1);
    addTextPanel(3705,4.37,-38.7,-Math.PI/2,.55,2.0);
    cabinet({x:4.36,z:-42.4,r:-Math.PI/2,w:5.2,hang:[3708,3710,3711],shelf:[3712]});
    cabinet({x:-4.36,z:-42.3,r:Math.PI/2,w:4.3,hang:[3723],shelf:[3724]});
    addTextPanel(3722,-4.37,-38.8,Math.PI/2,1.3,2.1);
    addOpticalPanel(3716,-1.75,-46.86,0,2.59,3.45);
    cabinet({x:-3.86,z:-51.65,r:Math.PI/2,w:3.7,hang:[3728],shelf:[3727]});
    addTextPanel(3725,-3.87,-48.45,Math.PI/2,1.0,2.0);
    cabinet({x:3.86,z:-51.55,r:-Math.PI/2,w:3.7,hang:[3731]});
    addTextPanel(3729,3.87,-48.5,-Math.PI/2,1.0,2.0);
    cabinet({x:-3.86,z:-56.4,r:Math.PI/2,w:5.1,hang:[3735,3736],shelf:[3737,3738]});
    addTextPanel(3734,-3.87,-60,Math.PI/2,1.15,2.1);
    addTextPanel(3732,3.87,-55,-Math.PI/2,1.1,2.1);
    cabinet({x:3.86,z:-58.2,r:-Math.PI/2,w:3.9,hang:[3741],groupPhoto:true});
    cabinet({x:3.86,z:-62,r:-Math.PI/2,w:2.4,hang:[3742]});
    addTextPanel(3740,-3.87,-62.4,Math.PI/2,1.15,2.1);
    const quoteWall=new THREE.Group();quoteWall.position.set(0,0,-64.84);scene.add(quoteWall);addWork(quoteWall,3749,0,1.8,3.5,2.8);
    scene.updateMatrixWorld(true);
    setZone(0,true);
    requestAnimationFrame(tick);
  }

  zones.forEach((zone,index)=>{
    const button=document.createElement('button');button.textContent=zone.name;button.style.setProperty('--swatch',zone.accent);
    button.setAttribute('aria-label',`${index+1} ${zone.name}区 ${zone.title}`);
    button.addEventListener('click',()=>setZone(index,true));$('#zones').appendChild(button);
  });
  function updateZone(index) {
    if(index===currentZone)return;
    currentZone=index;const zone=zones[index];
    roomLights.forEach((light,i)=>{
      const side=i===0?-1:1;
      light.position.set(i===2?-.8:side*(zone.width/2-1.2),3.16,i===2?zone.end+1.8:zone.start-(i===0?4.5:6));
      light.target.position.set(i===2?-1.5:side*zone.width/2,1.65,i===2?zone.end:zone.start-(i===0?5.3:6.8));
    });
    document.documentElement.style.setProperty('--accent',zone.accent);
    $('#zone-title').textContent=`0${index+1} / ${zone.name}`;
    $('#zone-description').textContent=zone.title;
    [...$('#zones').children].forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));
    $('#next-zone').textContent=index===4?'在语录墙前停留 →':`走向${zones[index+1].name}区 →`;
    $('#optical-entry').hidden=index!==3;
    $('#catalog-list').replaceChildren();
    works.filter(w=>w.zone===zone.id).forEach(work=>{
      const button=document.createElement('button'),img=document.createElement('img'),text=document.createElement('span');
      img.src=work.asset;img.alt='';text.textContent=work.title;button.append(img,text);
      button.addEventListener('click',()=>{closeCatalog();focusWork(work.number);});$('#catalog-list').appendChild(button);
    });
  }
  function setZone(index,reset=false) {
    index=Math.max(0,Math.min(4,index));updateZone(index);focusedWork=null;currentWork=null;flight=null;keys.clear();
    setFeelingContext();
    if(reset){camera.position.set(index<4?-.2:.2,1.66,zones[index].start-.7);yaw=index===3?-1.08:index<4?-1.12:1.12;pitch=0;orient();}
    closeCatalog();$('#open-current').hidden=true;$('#hover-hint').textContent='拖拽环顾 · 滚轮向上前进 / 向下后退';
  }
  function orient() { camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld(); }
  function validPosition(x,z) {
    const radius=.24;
    return !colliders.some(b=>x>b.min.x-radius&&x<b.max.x+radius&&z>b.min.z-radius&&z<b.max.z+radius);
  }
  function move(dx,dz) {
    if(validPosition(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
    if(validPosition(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
    const index=zones.findIndex(zone=>camera.position.z<=zone.start&&camera.position.z>=zone.end);
    if(index>=0&&index!==currentZone){focusedWork=null;currentWork=null;setFeelingContext();updateZone(index);}
  }
  function stopFocus() { focusedWork=null;flight=null;$('#open-current').hidden=true; }
  function focusWork(n) {
    const work=workMap.get(n);if(!work?.mesh)return;
    const target=work.mesh.getWorldPosition(new THREE.Vector3());
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(work.mesh.parent.getWorldQuaternion(new THREE.Quaternion()));
    const distance=work.mesh.rotation.x?1.4:Math.max(1.6,work.mesh.geometry.parameters.height*1.2);
    const position=target.clone().addScaledVector(normal,distance);position.y=1.66;
    const delta=target.clone().sub(position);
    const nextYaw=Math.atan2(-delta.x,-delta.z),nextPitch=Math.atan2(delta.y,Math.hypot(delta.x,delta.z));
    updateZone(zones.findIndex(zone=>zone.id===work.zone));
    // Catalog jumps use a short fade-like camera cut if the path crosses a partition.
    let clear=true;
    for(let i=1;i<=16;i++){const p=camera.position.clone().lerp(position,i/16);if(!validPosition(p.x,p.z)){clear=false;break;}}
    flight={from:camera.position.clone(),to:position,yawFrom:yaw,yawTo:nextYaw,pitchFrom:pitch,pitchTo:nextPitch,start:performance.now(),duration:reducedMotion||!clear?0:650};
    currentWork=n;focusedWork=n;keys.clear();$('#open-current').hidden=false;
    setFeelingContext(work);
    $('#hover-hint').textContent=`${work.title} · 再次点击查看大图`;
  }
  function stepWork(step) {
    const list=works.filter(work=>work.zone===zones[currentZone].id);
    const index=list.findIndex(work=>work.number===currentWork);
    const next=index<0?(step>0?0:list.length-1):(index+step+list.length)%list.length;
    focusWork(list[next].number);
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pick(event) {
    const rect=stage.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    ray.setFromCamera(pointer,camera);
    const hit=ray.intersectObjects(pickables)[0];if(!hit||hit.distance>18)return null;
    // Solid walls and cabinet bases also occlude picking.
    for(const bounds of colliders){const point=ray.ray.intersectBox(bounds,new THREE.Vector3());if(point&&point.distanceTo(ray.ray.origin)<hit.distance-.15)return null;}
    return hit.object.userData;
  }
  let drag=null;
  stage.addEventListener('pointerdown',event=>{
    if(!entered||viewer.open||event.button!==0)return;stage.focus();
    drag={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove',event=>{
    if(!entered||viewer.open)return;
    if(drag){
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4)drag.moved=true;
      if(drag.moved){stopFocus();yaw-=(event.clientX-drag.lastX)*.003;pitch=Math.max(-.85,Math.min(.8,pitch-(event.clientY-drag.lastY)*.003));orient();stage.classList.add('dragging');}
      drag.lastX=event.clientX;drag.lastY=event.clientY;
    }else{
      const hit=pick(event);stage.classList.toggle('pointing',!!hit);
      $('#hover-hint').textContent=hit?.work?(focusedWork===hit.work?'再次点击查看大图':`${workMap.get(hit.work).title} · 点击靠近`):hit?.panel?'点击阅读现场文字':hit?.optical?'点击连续查看八张人物光影':'拖拽环顾 · 滚轮向上前进 / 向下后退';
    }
  });
  stage.addEventListener('pointerup',event=>{
    if(!drag)return;
    const click=!drag.moved;drag=null;stage.classList.remove('dragging');
    if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
    if(click){const hit=pick(event);if(hit?.work){if(focusedWork===hit.work&&!flight)openWork(hit.work);else focusWork(hit.work);}else if(hit?.panel)openPhotos([hit.panel],'现场文字');else if(hit?.optical)openOptical();}
  });
  stage.addEventListener('pointercancel',()=>{drag=null;stage.classList.remove('dragging');});
  stage.addEventListener('wheel',event=>{
    if(!entered||viewer.open)return;event.preventDefault();stopFocus();
    const step=Math.max(-.55,Math.min(.55,-event.deltaY*.006));
    move(-Math.sin(yaw)*step,-Math.cos(yaw)*step);
  },{passive:false});
  function inputActive() { return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName); }
  addEventListener('keydown',event=>{
    if(inputActive())return;
    if(viewer.open){
      if(event.key==='ArrowLeft'){event.preventDefault();stepImage(-1);}if(event.key==='ArrowRight'){event.preventDefault();stepImage(1);}
      if(event.key==='+'||event.key==='=')zoomTo(scale+.25);if(event.key==='-')zoomTo(scale-.25);if(event.key==='0')zoomTo(1);return;
    }
    if(!entered)return;
    if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();keys.add(event.key);stopFocus();}
    if(event.key==='Escape')closeCatalog();
  });
  addEventListener('keyup',event=>keys.delete(event.key));
  addEventListener('blur',()=>{keys.clear();drag=null;});
  document.addEventListener('visibilitychange',()=>keys.clear());
  let previousTime=0;
  function tick(time) {
    requestAnimationFrame(tick);const dt=Math.min((time-previousTime)/1000,.05);previousTime=time;
    if(entered&&!viewer.open&&!authorGuide.open&&!inputActive()) {
      if(flight){
        const t=flight.duration?Math.min(1,(time-flight.start)/flight.duration):1,ease=1-Math.pow(1-t,4);
        camera.position.lerpVectors(flight.from,flight.to,ease);
        const difference=Math.atan2(Math.sin(flight.yawTo-flight.yawFrom),Math.cos(flight.yawTo-flight.yawFrom));
        yaw=flight.yawFrom+difference*ease;pitch=flight.pitchFrom+(flight.pitchTo-flight.pitchFrom)*ease;if(t===1)flight=null;
      }else if(keys.size){
        const forward=Number(keys.has('w')||keys.has('ArrowUp'))-Number(keys.has('s')||keys.has('ArrowDown'));
        const right=Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft'));
        const speed=dt*2.1/(forward&&right?Math.SQRT2:1);
        move((-Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed,(-Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed);
      }
    }
    orient();renderer.render(scene,camera);
  }
  function closeCatalog() { $('#catalog').hidden=true;$('#catalog-toggle').setAttribute('aria-expanded','false'); }
  $('#catalog-toggle').addEventListener('click',()=>{const open=$('#catalog').hidden;$('#catalog').hidden=!open;$('#catalog-toggle').setAttribute('aria-expanded',String(open));});
  $('#catalog-close').addEventListener('click',closeCatalog);
  function openAuthorGuide() {
    authorReturnFocus=document.activeElement;keys.clear();flight=null;
    if(!authorFrame.getAttribute('src'))authorFrame.src=authorFrame.dataset.src;
    authorGuide.showModal();$('#author-close').focus();
  }
  function closeAuthorGuide() { authorGuide.close();authorReturnFocus?.focus(); }
  $('#author-intro').addEventListener('click',openAuthorGuide);
  $('#author-open').addEventListener('click',openAuthorGuide);
  $('#author-close').addEventListener('click',closeAuthorGuide);
  authorGuide.addEventListener('cancel',event=>{event.preventDefault();closeAuthorGuide();});
  $('#enter').addEventListener('click',()=>{entered=true;$('#intro').hidden=true;$('#hud').hidden=false;stage.focus();});
  $('#reset').addEventListener('click',()=>setZone(currentZone,true));
  $('#next-zone').addEventListener('click',()=>currentZone===4?focusWork(3749):setZone(currentZone+1,true));
  $('#previous-work').addEventListener('click',()=>stepWork(-1));$('#next-work').addEventListener('click',()=>stepWork(1));
  $('#open-current').addEventListener('click',()=>{if(currentWork)openWork(currentWork);});
  $('#room-photos').addEventListener('click',()=>openPhotos(zones[currentZone].overview,`${zones[currentZone].name}区 · 现场照片`));
  $('#prologue').addEventListener('click',()=>openPhotos([3664,3665,3666,3667],'入场时的照片'));
  function openOptical() {
    setFeelingContext({number:'optical',title:'人物光影 · 八张连拍',zone:'red'});
    openPhotos(opticalFrames,'人物光影','同一个位置，按拍摄顺序留下的八次光影。','optical');
  }
  $('#optical-open').addEventListener('click',openOptical);

  let frames=[],frameIndex=0,viewerTitle='',viewerCaption='',noteKey='',scale=1,panX=0,panY=0,imageDrag=null,returnFocus=null;
  function readThoughts(){try{return JSON.parse(localStorage.getItem('space4-artwork-thoughts-v1')||'{}');}catch{return {};}}
  let thoughts=readThoughts();
  function openWork(n) {
    const work=workMap.get(n);
    currentWork=n;focusedWork=n;setFeelingContext(work);
    frames=[{n},...(labelSources[n]?[{n:labelSources[n]}]:[])];
    if(n===3749)frames.push(...[3744,3745,3747,3748].map(n=>({n})));
    viewerTitle=work.title;viewerCaption=`${zones.find(zone=>zone.id===work.zone).name}区 · ${work.source}。展品信息以现场展签为准。`;
    noteKey=String(n);$('#viewer-kind').textContent='展品细看';showViewer();
  }
  function openPhotos(numbers,title,caption='',key='') {
    frames=numbers.map(n=>({n}));viewerTitle=title;viewerCaption=caption;noteKey=key;$('#viewer-kind').textContent=key==='optical'?'红区 · 八张连看':'现场记录';showViewer();
  }
  function showViewer() {
    returnFocus=document.activeElement;keys.clear();flight=null;frameIndex=0;
    thoughts=readThoughts();
    $('#thoughts').hidden=!noteKey;$('#thoughts').open=false;$('#thought-input').value=thoughts[noteKey]||'';
    $('#thought-status').textContent='仅保存在此浏览器';
    $('#viewer-title').textContent=viewerTitle;$('#viewer-caption').textContent=viewerCaption;
    viewer.showModal();renderFrame();$('#viewer-close').focus();
  }
  function renderFrame() {
    const frame=frames[frameIndex];scale=1;panX=0;panY=0;
    image.src=photoUrl(frame.n);
    image.alt=`${viewerTitle}，第 ${frameIndex+1} 张，IMG_${frame.n}`;
    $('#image-count').textContent=`${String(frameIndex+1).padStart(2,'0')} / ${String(frames.length).padStart(2,'0')} · IMG_${frame.n}`;
    $('#original-link').href=`reference/IMG_${frame.n}.JPG`;
    $('#image-prev').hidden=frames.length===1;$('#image-next').hidden=frames.length===1;
    $('#image-prev').disabled=frameIndex===0;$('#image-next').disabled=frameIndex===frames.length-1;
    $('#sequence-dots').replaceChildren();
    if(frames.length>1&&frames.length<=15)frames.forEach((frame,i)=>{
      const button=document.createElement('button');button.textContent=i+1;button.setAttribute('aria-label',`第 ${i+1} 张，IMG_${frame.n}`);
      if(i===frameIndex)button.setAttribute('aria-current','true');button.addEventListener('click',()=>{frameIndex=i;renderFrame();});$('#sequence-dots').appendChild(button);
    });
    applyZoom();
  }
  function stepImage(step) { const next=Math.max(0,Math.min(frames.length-1,frameIndex+step));if(next!==frameIndex){frameIndex=next;renderFrame();} }
  function applyZoom() {
    const maxX=Math.max(0,(image.offsetWidth*scale-innerWidth)/2+60),maxY=Math.max(0,(image.offsetHeight*scale-innerHeight)/2+60);
    panX=scale===1?0:Math.max(-maxX,Math.min(maxX,panX));panY=scale===1?0:Math.max(-maxY,Math.min(maxY,panY));
    image.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;$('#zoom-level').textContent=`${Math.round(scale*100)}%`;
    $('#image-viewport').style.cursor=scale>1?'grab':'default';$('#zoom-out').disabled=scale===1;$('#zoom-in').disabled=scale===4;
  }
  function zoomTo(next) { scale=Math.max(1,Math.min(4,next));applyZoom(); }
  function closeViewer() { viewer.close();scale=1;panX=0;panY=0;applyZoom();returnFocus?.focus(); }
  $('#viewer-close').addEventListener('click',closeViewer);viewer.addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
  $('#image-viewport').addEventListener('click',event=>{if(event.target===$('#image-viewport')&&scale===1)closeViewer();});
  $('#image-prev').addEventListener('click',()=>stepImage(-1));$('#image-next').addEventListener('click',()=>stepImage(1));
  $('#zoom-in').addEventListener('click',()=>zoomTo(scale+.25));$('#zoom-out').addEventListener('click',()=>zoomTo(scale-.25));$('#zoom-reset').addEventListener('click',()=>zoomTo(1));
  $('#image-viewport').addEventListener('wheel',event=>{event.preventDefault();zoomTo(scale+(event.deltaY<0?.15:-.15));},{passive:false});
  image.addEventListener('load',applyZoom);image.addEventListener('dragstart',event=>event.preventDefault());
  $('#image-viewport').addEventListener('pointerdown',event=>{if(scale<=1)return;imageDrag={x:event.clientX,y:event.clientY};$('#image-viewport').setPointerCapture(event.pointerId);});
  $('#image-viewport').addEventListener('pointermove',event=>{if(!imageDrag)return;panX+=event.clientX-imageDrag.x;panY+=event.clientY-imageDrag.y;imageDrag={x:event.clientX,y:event.clientY};applyZoom();});
  $('#image-viewport').addEventListener('pointerup',()=>imageDrag=null);$('#image-viewport').addEventListener('pointercancel',()=>imageDrag=null);
  $('#image-viewport').addEventListener('dblclick',()=>zoomTo(1));
  $('#thought-input').addEventListener('input',()=>{thoughts[noteKey]=$('#thought-input').value;try{localStorage.setItem('space4-artwork-thoughts-v1',JSON.stringify(thoughts));$('#thought-status').textContent='已保存在此浏览器';}catch{$('#thought-status').textContent='当前浏览器无法保存，请先复制记录。';}});
  addEventListener('resize',()=>{if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);if(viewer.open)applyZoom();});
  try{buildScene();}catch(error){$('#failure').hidden=false;console.error(error);}
})();
