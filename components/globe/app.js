const stage=document.querySelector('.stage'), canvas=stage.querySelector('canvas'), ctx=canvas.getContext('2d'), labels=stage.querySelector('.labels');
// Fictional creator names and roles for the prototype; portraits are existing visual assets.
const people=[
 ['Maya','CA','TikTok vlog creator','Katherine_Li.jpg',-20,18],
 ['Elias','NO','TikTok music creator','Alan_Walker.jpg',20,42],
 ['Nina','US','TikTok vlog creator','AleMor.jpg',-48,-4],
 ['Raka','ID','TikTok music creator','Raim_Laode.jpg',39,-20],
 ['Sophie','UK','TikTok vlog creator','Grace_Gachot.jpg',8,-39],
 ['Theo','UK','TikTok music creator','James_Carter.jpg',58,12],
 ['Jules','US','TikTok vlog creator','Mon_Rovia.jpg',-65,42],
 ['Dimas','ID','TikTok music creator','Fabio_Asher.jpg',98,0],
 ['Camille','FR','TikTok vlog creator','Annick.jpg',140,32],
 ['Alya','ID','TikTok vlog creator','Keljo.jpg',170,-20],
 ['Owen','US','TikTok music creator','Vincent_Mason.jpg',-130,15],
 ['Luca','BR','TikTok music creator','Agroplay.jpg',-90,-30]
];
const countries=[['United States','🇺🇸','124.8k',-100,30],['Brazil','🇧🇷','62.4k',-50,-18],['United Kingdom','🇬🇧','38.2k',-5,52],['Germany','🇩🇪','28.9k',18,34],['India','🇮🇳','56.7k',77,20],['Japan','🇯🇵','41.3k',138,35],['Indonesia','🇮🇩','72.1k',113,-10],['Australia','🇦🇺','19.6k',136,-33]];
let width=0,height=0,zoom=1,targetZoom=1,longitude=0,latitude=-8,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,holdUntil=0,dragged=false;
const projection=d3.geoOrthographic().clipAngle(90), path=d3.geoPath(projection,ctx), grid=d3.geoGraticule().step([20,20])();
function element(kind,markup,coord){const el=document.createElement('button');el.className='bubble '+kind;el.innerHTML=markup;el.tabIndex=-1;labels.append(el);el.addEventListener('click',e=>{e.stopPropagation();if(!dragged)setZoom(kind==='country'?1:0)});return {el,coord,kind}}
const markers=[...people.map(([name,code,job,img,lon,lat])=>element('person',`<img src="assets/${img}" alt="" draggable="false"><span><span class="name">${name}, ${code}</span><span class="meta">${job}</span></span>`,[lon,lat])),...countries.map(([name,flag,count,lon,lat])=>element('country',`<span class="flag">${flag}</span><span><span class="name">${name}</span><span class="meta">Total streams ${count}</span></span>`,[lon,lat]))];
function setZoom(value){targetZoom=Math.max(0,Math.min(1,value));holdUntil=performance.now()+1200;document.querySelector('#toggle').textContent=targetZoom>.5?'查看国家':'查看创作者';document.querySelector('#level').textContent=targetZoom>.5?'CREATOR CONNECTIONS':'GLOBAL LISTENERS';document.querySelector('#caption').textContent=targetZoom>.5?'01 — People behind the plays':'02 — Your sound across borders'}
document.querySelector('#out').onclick=()=>setZoom(0);document.querySelector('#in').onclick=()=>setZoom(1);document.querySelector('#toggle').onclick=()=>setZoom(targetZoom>.5?0:1);
const motion=document.querySelector('#motion');function updateMotion(){motion.textContent=paused?'▶':'Ⅱ';motion.setAttribute('aria-label',paused?'开始自动旋转':'暂停自动旋转')}updateMotion();motion.onclick=()=>{paused=!paused;updateMotion()};
new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;const dpr=Math.min(devicePixelRatio,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}).observe(stage);
function smooth(a,b,v){let t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;zoom+=(targetZoom-zoom)*(1-Math.exp(-dt*5));if(!paused&&!pointers.size&&now>holdUntil)longitude+=dt*3.2;
 const far=Math.min(width*.33,height*.405),near=Math.max(width*.56,height*.91),radius=far+(near-far)*zoom;
 projection.translate([width*.5,height*.51]).scale(radius).rotate([longitude,latitude,0]);
 ctx.clearRect(0,0,width,height);ctx.beginPath();path({type:'Sphere'});ctx.fillStyle='#fff';ctx.fill();
 ctx.beginPath();path(worldLand);ctx.fillStyle='#e5e7e6';ctx.fill();
 ctx.beginPath();path(grid);ctx.strokeStyle='#e1e4e3';ctx.lineWidth=.85;ctx.stroke();
 ctx.beginPath();path({type:'Sphere'});ctx.strokeStyle='#d8dcda';ctx.lineWidth=1;ctx.stroke();
 const rotation=d3.geoRotation([longitude,latitude,0]);const accepted=[];
 const ranked=markers.map(m=>{const r=rotation(m.coord),depth=Math.cos(r[0]*Math.PI/180)*Math.cos(r[1]*Math.PI/180);return {...m,depth}}).sort((a,b)=>b.depth-a.depth);
 for(const m of ranked){const active=m.kind==='person'?smooth(.38,.72,zoom):1-smooth(.2,.55,zoom);let opacity=smooth(.03,.32,m.depth)*active;const p=projection(m.coord);let scale=m.kind==='person'?.68+.48*Math.max(0,m.depth):.92;
 if(width<600)scale*=.76;
 const w=m.el.offsetWidth*scale,h=m.el.offsetHeight*scale;const box={x:p[0]-w/2,y:p[1]-h/2,w,h};if(opacity>.1){if(accepted.some(b=>Math.abs(box.x+w/2-b.x-b.w/2)<(w+b.w)/2+5&&Math.abs(box.y+h/2-b.y-b.h/2)<(h+b.h)/2+6))opacity=0;else accepted.push(box)}
 m.el.style.transform=`translate(${p[0]-m.el.offsetWidth/2}px,${p[1]-m.el.offsetHeight/2}px) scale(${scale})`;const displayedOpacity=(Number(m.el.style.opacity)||0)+(opacity-(Number(m.el.style.opacity)||0))*(1-Math.exp(-dt*12));m.el.style.opacity=displayedOpacity;m.el.style.visibility=displayedOpacity<.015?'hidden':'visible';m.el.style.pointerEvents=opacity>.6?'auto':'none';m.el.tabIndex=opacity>.6?0:-1;m.el.style.zIndex=Math.round(m.depth*100);
 }requestAnimationFrame(frame)}
const pointers=new Map();let previous=null,pinch=0;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('.controls'))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);stage.setPointerCapture(e.pointerId);previous=[e.clientX,e.clientY];dragged=false;stage.classList.add('dragging');if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])}});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],distance=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);setZoom(targetZoom+(distance-pinch)/230);pinch=distance;dragged=true}else if(previous){const dx=e.clientX-previous[0],dy=e.clientY-previous[1];if(Math.abs(dx)+Math.abs(dy)>1)dragged=true;longitude+=dx*.19;latitude=Math.max(-65,Math.min(65,latitude-dy*.14));previous=[e.clientX,e.clientY]}});
function release(e){pointers.delete(e.pointerId);previous=null;holdUntil=performance.now()+1300;if(!pointers.size)stage.classList.remove('dragging');if(e.type==='pointerup'&&!dragged&&!e.target.closest('.controls'))setZoom(targetZoom>.5?0:1)}
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
stage.addEventListener('wheel',e=>{e.preventDefault();setZoom(targetZoom-e.deltaY*.0025)},{passive:false});requestAnimationFrame(frame);
