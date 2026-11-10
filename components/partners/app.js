import * as THREE from './vendor/three.module.js';
const artists=await(await fetch('artists.json')).json();
const $=s=>document.querySelector(s), reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode=new URLSearchParams(location.search).get('mode')==='plain'?'plain':'spotlight';
let paused=reduce, hovered=false, visible=false, index=artists.findIndex(a=>a.name==='Dendi Nata'), switching=false, elapsed=0, cycle=0;
const card=$('#featured'), spotlight=$('.spotlight'), name=$('#artist-name');
function setArtist(){const a=artists[index];$('#portrait').src=a.file;$('#portrait').alt=a.name;name.textContent=a.name;$('#caption-name').textContent=a.name;$('#achievement').textContent='SoundOn artist';card.href='https://www.soundon.global/?lang=en#showcase';card.setAttribute('aria-label','Explore '+a.name+' and other artists on SoundOn');}
function setMode(next,notify=false){mode=next;document.body.classList.toggle('plain',mode==='plain');spotlight.inert=mode==='plain';$('#mode').innerHTML=mode==='plain'?'Meet the artists <span>↗</span>':'Explore the ocean <span>↗</span>';name.textContent=mode==='plain'?'artists like you.':artists[index].name;cycle=0;if(notify)parent.postMessage({type:'partners-mode',mode},location.origin);}
function advance(direction){if(switching||mode==='plain')return;switching=true;cycle=0;card.classList.add('leaving');name.classList.add('changing');setTimeout(()=>{index=(index+direction+artists.length)%artists.length;setArtist();if(mode==='plain')name.textContent='artists like you.';requestAnimationFrame(()=>{card.classList.remove('leaving');name.classList.remove('changing');switching=false;});},reduce?0:370);}
$('#previous').onclick=()=>advance(-1);$('#next').onclick=()=>advance(1);
$('#mode').onclick=()=>setMode(mode==='plain'?'spotlight':'plain',true);
function updatePause(){$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Play animation':'Pause animation');$('#pause').setAttribute('aria-pressed',String(paused));}
$('#pause').onclick=()=>{paused=!paused;updatePause();};
spotlight.addEventListener('pointerenter',()=>hovered=true);spotlight.addEventListener('pointerleave',()=>hovered=false);
spotlight.addEventListener('focusin',()=>hovered=true);spotlight.addEventListener('focusout',e=>{if(!spotlight.contains(e.relatedTarget))hovered=false;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:.05}).observe(document.querySelector('main'));
setArtist();setMode(mode);updatePause();artists.forEach(a=>{const image=new Image();image.src=a.file;});
let draw=()=>{};
let previous=performance.now();
function frame(now){requestAnimationFrame(frame);const delta=Math.min((now-previous)/1000,.05);previous=now;if(!visible||document.hidden)return;if(!paused&&!hovered){elapsed+=delta;cycle+=delta;if(cycle>=5.5&&mode==='spotlight')advance(1);}draw(elapsed);}
requestAnimationFrame(frame);
async function buildOcean(){
 const list=artists;
 const fallback=$('.fallback');for(let i=0;i<72;i++){const img=document.createElement('img');img.src=list[i%list.length].file;img.alt='';fallback.append(img);}
 const loaded=(await Promise.all(list.map(a=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=a.file;})))).filter(Boolean);
 if(!loaded.length)return;
 const atlas=document.createElement('canvas');atlas.width=atlas.height=2048;const ctx=atlas.getContext('2d');
 loaded.forEach((img,i)=>{const size=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-size)/2,(img.height-size)/2,size,size,(i%8)*256,Math.floor(i/8)*256,256,256);});
 const renderer=new THREE.WebGLRenderer({canvas:$('#ocean'),antialias:true});renderer.setClearColor(0xf3f3f1);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 const texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,150);
 const columns=34,rows=28,count=columns*rows,geometry=new THREE.PlaneGeometry(.9,.9);geometry.rotateX(-Math.PI/2);
 const offsets=new Float32Array(count*2);
 const material=new THREE.ShaderMaterial({uniforms:{atlas:{value:texture}},vertexShader:`attribute vec2 tile;varying vec2 vUv;varying float vDistance;void main(){vec4 p=instanceMatrix*vec4(position,1.0);vec4 view=modelViewMatrix*p;vDistance=-view.z;vUv=(uv*.96+.02+tile)/8.0;gl_Position=projectionMatrix*view;}`,fragmentShader:`uniform sampler2D atlas;varying vec2 vUv;varying float vDistance;void main(){vec3 color=texture2D(atlas,vUv).rgb;float fog=smoothstep(14.0,36.0,vDistance);gl_FragColor=vec4(mix(color,vec3(.95294,.95294,.94510),fog),1.0);}`,side:THREE.DoubleSide});
 const tiles=new THREE.InstancedMesh(geometry,material,count),transform=new THREE.Object3D();tiles.frustumCulled=false;
 for(let i=0;i<count;i++){const j=(i*17+Math.floor(i/columns)*7)%loaded.length;offsets[i*2]=j%8;offsets[i*2+1]=7-Math.floor(j/8);}
 geometry.setAttribute('tile',new THREE.InstancedBufferAttribute(offsets,2));scene.add(tiles);
 const sea=$('.sea');function resize(){const w=sea.clientWidth,h=sea.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(sea);resize();
 draw=time=>{camera.position.set(Math.sin(time*.075)*.45,8.8,13.5);camera.lookAt(0,0,-7);for(let i=0;i<count;i++){const x=(i%columns-columns/2)*1.01,z=10-Math.floor(i/columns)*1.01;const y=Math.sin(x*.32+time*.34)*.45+Math.cos(z*.29+time*.28)*.55+Math.sin(x*.2+z*.19+time*.2)*.35;transform.position.set(x,y,z);transform.rotation.set(0,Math.sin(i*17.3)*.025,0);transform.updateMatrix();tiles.setMatrixAt(i,transform.matrix);}tiles.instanceMatrix.needsUpdate=true;renderer.render(scene,camera);};draw(0);document.body.classList.add('webgl');
}
buildOcean().catch(error=>{console.warn('Using artist grid fallback:',error);$('#ocean').hidden=true;});
