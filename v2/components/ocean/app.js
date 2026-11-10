import * as THREE from './vendor/three.module.js';

const canvas = document.querySelector('#ocean');
const loading = document.querySelector('#loading');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reducedMotion;
const pause = document.querySelector('#pause');
function updatePause() {
  pause.textContent = paused ? '▶' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
}
updatePause();
pause.onclick = () => { paused = !paused; updatePause(); };

async function start() {
  const response = await fetch('./albums.json?v=brand-pink-1');
  if (!response.ok) throw new Error('Album collection could not be loaded.');
  const allAlbums = await response.json();
  const loaded = await Promise.all(allAlbums.map(album => new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve({ ...album, image });
    image.onerror = () => resolve(null);
    image.src = album.file;
  })));
  const albums = loaded.filter(Boolean);
  if (!albums.length) throw new Error('Album artwork is unavailable. Please reload.');
  const atlas = document.createElement('canvas');
  atlas.width = atlas.height = 1024;
  const context = atlas.getContext('2d');
  albums.forEach((album, index) => {
    context.drawImage(album.image, (index % 8) * 128, Math.floor(index / 8) * 128, 128, 128);
  });
  const texture = new THREE.CanvasTexture(atlas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x080808);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 150);
  const columns = 34, rows = 26, count = columns * rows;
  const geometry = new THREE.PlaneGeometry(.88, .88);
  geometry.rotateX(-Math.PI / 2);
  const offsets = new Float32Array(count * 2);
  const coverIndices = [];
  // Replace only the red-dominant covers, retaining the original mixed palette.
  const redReplacements = new Map([
    ['Nectar','Hot Pink'],
    ['The Slow Rush','Fine Line'],
    ['French Exit','Lover'],
    ['Heaven Or Las Vegas (Remastered)','Chromatica'],
    ['Amnesiac','Kiss (Deluxe Version)'],
    ['CINEMA','SQUARE UP - EP']
  ]);
  const coverPool=albums.flatMap((album,index)=>{
    if(album.palette==='brand-pink')return [];
    const replacement=redReplacements.get(album.title);
    const replacementIndex=replacement?albums.findIndex(item=>item.title===replacement):-1;
    return [replacementIndex>=0?replacementIndex:index];
  });
  const coverUses=new Map(coverPool.map(index=>[index,0]));
  function randomAt(index,salt){const value=Math.sin(index*127.1+salt*311.7)*43758.5453;return value-Math.floor(value);}
  function chooseCover(index,column){
    const nearby=new Set(coverIndices.slice(Math.max(0,index-5),index));
    if(index>=columns){
      for(let delta=-2;delta<=2;delta++){
        if(column+delta>=0&&column+delta<columns)nearby.add(coverIndices[index-columns+delta]);
      }
    }
    const candidates=coverPool.filter(cover=>!nearby.has(cover));
    const available=candidates.length?candidates:coverPool;
    const leastUsed=Math.min(...available.map(cover=>coverUses.get(cover)));
    const balanced=available.filter(cover=>coverUses.get(cover)===leastUsed);
    const choice=balanced[Math.floor(randomAt(index,2)*balanced.length)];
    coverUses.set(choice,coverUses.get(choice)+1);
    return choice;
  }

  const material = new THREE.ShaderMaterial({
    uniforms: { atlas: { value: texture }, time: { value: 0 }, motion: { value: reducedMotion ? 0 : 1 } },
    vertexShader: `
      attribute vec2 tile;
      varying vec2 vUv;
      varying float vDistance;
      varying float vLight;
      uniform float time;
      uniform float motion;
      void main() {
        vec4 p = instanceMatrix * vec4(position, 1.0);
        vec3 center = instanceMatrix[3].xyz;
        float wave = sin(center.x * .32 + time * .43) * .65 +
                     cos(center.z * .29 + time * .36) * .8 +
                     sin(center.x * .2 + center.z * .19 + time * .25) * .55;
        
        vec4 view = modelViewMatrix * p;
        vDistance = -view.z;
        vLight = .83 + wave * .075;
        vUv = (uv * .96 + .02 + tile) / 8.0;
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform sampler2D atlas;
      varying vec2 vUv;
      varying float vDistance;
      varying float vLight;
      void main() {
        vec3 color = texture2D(atlas, vUv).rgb * vLight;
        float fog = smoothstep(17.0, 43.0, vDistance);
        gl_FragColor = vec4(mix(color, vec3(.031373,.031373,.031373), fog), 1.0);
      }`,
    side: THREE.DoubleSide
  });
  const tiles = new THREE.InstancedMesh(geometry, material, count);
  const transform = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const column = i % columns, row = Math.floor(i / columns);
    transform.position.set((column - columns / 2) * 1.01, 0, 10 - row * 1.01);
    transform.rotation.set(0, Math.sin(i * 17.3) * .045, 0);
    transform.updateMatrix();
    tiles.setMatrixAt(i, transform.matrix);
    const albumIndex=chooseCover(i,column);
    coverIndices.push(albumIndex);
    offsets[i * 2] = albumIndex % 8;
    offsets[i * 2 + 1] = 7 - Math.floor(albumIndex / 8);
  }
  geometry.setAttribute('tile', new THREE.InstancedBufferAttribute(offsets, 2));
  tiles.frustumCulled = false;
  scene.add(tiles);
  const pointer = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let targetX = 0, targetY = 0, panX = 0, panY = 0, travel = 0, targetTravel = 0;
  let previousTime = performance.now(), elapsed = 0;
  function resize() {
    renderer.setSize(innerWidth, Math.max(innerHeight, 650));
    camera.aspect = innerWidth / Math.max(innerHeight, 650);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', event => {
    targetX = (event.clientX / innerWidth - .5) * 2;
    targetY = (event.clientY / innerHeight - .5) * 2;
  });


  canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(tiles)[0];
    if (!hit) return;
    const album = albums[coverIndices[hit.instanceId]];
    document.querySelector('#album-name').textContent = album.title;
    document.querySelector('#artist-name').textContent = album.artist;
    document.querySelector('#album-art').src = album.file;
    document.querySelector('#album-source').href = album.source;
    document.querySelector('#selected').hidden = false;
  });
  document.querySelector('#close').onclick = () => { document.querySelector('#selected').hidden = true; };
  document.querySelector('#count').textContent = albums.length + ' ALBUMS · ONE OPEN WORLD';
  loading.hidden = true;
  function animate(now) {
    const delta = Math.min((now - previousTime) / 1000, .05);
    previousTime = now;
    if (!paused) elapsed += delta;
    const easing = 1 - Math.exp(-delta * 3);
    panX += (targetX - panX) * easing;
    panY += (targetY - panY) * easing;
    travel += (targetTravel - travel) * easing;
    const entrance = reducedMotion ? 1 : Math.min(elapsed / 4, 1);
    const initialPullback = (1 - entrance) ** 3 * 3;
    camera.position.set(panX * 1.2, 8.8 + panY * .5 + travel * .3, 13.5 + travel + initialPullback);
    camera.lookAt(panX * .3, 0, -7);
    // Keep visible geometry and raycasting in sync.
    for (let i = 0; i < count; i++) {
      const column = i % columns, row = Math.floor(i / columns);
      const x = (column - columns / 2) * 1.01;
      const z = 10 - row * 1.01;
      const y = Math.sin(x * .32 + elapsed * .43) * .65
        + Math.cos(z * .29 + elapsed * .36) * .8
        + Math.sin(x * .2 + z * .19 + elapsed * .25) * .55;
      transform.position.set(x, y, z);
      transform.rotation.set(0, Math.sin(i * 17.3) * .045, 0);
      transform.updateMatrix();
      tiles.setMatrixAt(i, transform.matrix);
    }
    tiles.instanceMatrix.needsUpdate = true;
    tiles.computeBoundingSphere();
    material.uniforms.time.value = elapsed;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
start().catch(error => {
  loading.hidden = true;
  const message = document.querySelector('#error');
  message.textContent = error.message;
  message.hidden = false;
  console.error(error);
});
