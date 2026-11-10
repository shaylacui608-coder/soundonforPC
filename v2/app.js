const platforms=[['SoundCloud','soundcloud.jpeg',18,25,58],['Amazon Music','amazon.jpeg',34,20,70],['Beatport','beatport.jpeg',52,8,78],['QQ Music','qq.png',70,25,46],['TikTok','tiktok.png',26,42,110],['Facebook','facebook.jpeg',50,35,95],['Instagram','instagram.jpeg',11,65,50],['YouTube Music','youtube.jpeg',50,65,68],['iHeartRadio','iheart.png',70,57,68],['Deezer','deezer.png',30,78,55],['Spotify','spotify.png',43,87,78],['AWA','awa.jpeg',67,80,80]];
const cloud=document.querySelector('.platform-cloud'),list=document.querySelector('.platform-list');
platforms.forEach(([name,file,x,y,size],i)=>{const img=document.createElement('img');img.src='assets/'+file;img.alt=name;img.className='platform-logo';img.style.cssText=`--x:${x}%;--y:${y*.84}%;--size:${size}px;--delay:-${i*.4}s`;cloud.append(img);const item=document.createElement('div');item.innerHTML=`<img src="assets/${file}" alt="">${name}`;list.append(item);});
document.querySelector('#platforms-open').onclick=()=>document.querySelector('#platform-dialog').showModal();
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
const plans=[
 {name:'Lite',display:'lite',subtitle:'Zero upfront cost. Pay as you earn.',price:'$0.00',features:['<strong>1</strong> primary artist','Keep <strong>90%</strong> streaming earnings','All essential distribution features','Access to Spotify Discovery Mode']},
 {name:'Core',display:'Core',subtitle:'Best value for everything you need.',price:'$3.17',popular:true,features:['Up to <strong>2</strong> primary artists','Unlimited releases across all platforms','Keep <strong>100%</strong> streaming earnings','Full promotion and monetization tools']},
 {name:'Max',display:'Max',subtitle:'Built for advanced artists and growing labels.',price:'$7.92',features:['Everything in Core','Up to <strong>500</strong> primary artists','Flexible team management','Advanced release setup']}
];
plans.forEach(plan=>{
 const card=document.createElement('article');card.className='plan plan-'+plan.name.toLowerCase();
 card.innerHTML=`${plan.popular?'<div class="plan-ribbon"><span>MOST POPULAR</span></div>':''}<div class="plan-pricing"><div class="price">${plan.price}<small> /mo</small></div><p class="billing-note">${plan.name==='Lite'?'No upfront cost.':'Billed annually. Cancel auto-renew anytime.'}</p></div><div class="plan-top"><div class="plan-heading"><h3>${plan.name}</h3></div><p class="subtitle">${plan.subtitle}</p>${plan.name==='Max'?'<div class="artist-capacity"><span class="artist-capacity-icon" aria-hidden="true"></span><span><strong>5</strong> primary artists</span><span class="artist-capacity-chevron" aria-hidden="true"></span></div>':''}</div><ul>${plan.features.map(feature=>`<li><span>${feature}</span></li>`).join('')}</ul><a class="pill" href="https://www.soundon.global/pricing?lang=en" target="_blank" rel="noopener noreferrer" aria-label="Get ${plan.name} plan">Get ${plan.name}</a>`;
 document.querySelector('.plan-grid').append(card);
});
const tabs=[...document.querySelectorAll('[role=tab]')],panels=[...document.querySelectorAll('[role=tabpanel]')];
let selected=0,manualY=null,lastScrollState=-1;
function select(index){document.querySelector('.chart')?.dispatchEvent(new Event('chart-dismiss'));selected=index;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(index===i));tab.tabIndex=index===i?0:-1;panels[i].hidden=index!==i;panels[i].classList.toggle('active',index===i);});}
tabs.forEach((tab,i)=>{tab.onclick=()=>{manualY=scrollY;select(i)};tab.onkeydown=e=>{let next=i;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%3;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();manualY=scrollY;select(next);tabs[next].focus();};});
const section=document.querySelector('.insight-scroll');let scheduled=false;
function updateScroll(){scheduled=false;const rect=section.getBoundingClientRect(),travel=section.offsetHeight-innerHeight;const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));const state=Math.min(2,Math.floor(progress*3));if(manualY!==null&&Math.abs(scrollY-manualY)<100)return;manualY=null;if(rect.top<innerHeight&&rect.bottom>0&&state!==lastScrollState){lastScrollState=state;select(state);}}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();

// Shared spherical coordinates keep the logos tangent to their wireframe globe.
// A compact, asymmetric cluster on the front hemisphere: one anchor, two
// supporting platforms, and small satellites with deliberate breathing room.
const orbitServices={
 TikTok:[-2,-4,132],
 Spotify:[-17,-31,96],
 Facebook:[27,5,88],
 'Amazon Music':[7,29,76],
 Instagram:[25,-27,70],
 SoundCloud:[-27,-4,60],
 'YouTube Music':[-19,22,48],
 Deezer:[8,-38,38],
 Beatport:[-33,-25,32],
 'QQ Music':[27,26,28],
 AWA:[-31,14,26]
};
const orbitNodes=[...cloud.children].flatMap(img=>{
 const place=orbitServices[img.alt];if(!place){img.remove();return []}
 img.style.setProperty('--size',place[2]/7+'%');return [{img,lon:place[0]*Math.PI/180,lat:place[1]*Math.PI/180}];
});
const globeWorld=document.querySelector('.platform-world'),wire=globeWorld.querySelector('svg');
wire.setAttribute('viewBox','0 0 700 600');wire.setAttribute('preserveAspectRatio','xMidYMid meet');
wire.innerHTML='<path class="wire-back"/><path class="wire-front"/>';
const back=wire.querySelector('.wire-back'),front=wire.querySelector('.wire-front');
const meridians=Array.from({length:12},(_,i)=>Array.from({length:61},(_,j)=>[i*Math.PI/6,(j/60-.5)*Math.PI]));
const parallels=Array.from({length:7},(_,i)=>Array.from({length:121},(_,j)=>[j/120*Math.PI*2,(i-3)*Math.PI/8]));
let aimX=0,aimY=0,yaw=0,pitch=0,orbitVisible=false,orbitFrame=0,lastFrame=0;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
function sphere(lon,lat,turn,tilt){
 const x=Math.sin(lon)*Math.cos(lat),y=Math.sin(lat),z=Math.cos(lon)*Math.cos(lat);
 const xx=x*Math.cos(turn)+z*Math.sin(turn),zz=z*Math.cos(turn)-x*Math.sin(turn);
 return [xx,y*Math.cos(tilt)-zz*Math.sin(tilt),y*Math.sin(tilt)+zz*Math.cos(tilt)];
}
function paintOrbit(now=0){
 const turn=yaw+(motionPreference.matches?0:Math.sin(now/5500)*.024),tilt=-.09+pitch+(motionPreference.matches?0:Math.cos(now/6400)*.016);
 let near='',far='';
 for(const line of [...meridians,...parallels]){
  let prior=null;
  for(const [lon,lat] of line){const [x,y,z]=sphere(lon,lat,turn,tilt),side=z>=0;const point=(350+x*315).toFixed(1)+','+(300-y*270).toFixed(1);const command=prior===side?'L':'M';if(side)near+=command+point;else far+=command+point;prior=side;}
 }
 front.setAttribute('d',near);back.setAttribute('d',far);
 orbitNodes.forEach(({img,lon,lat})=>{
  const [x,y,z]=sphere(lon,lat,turn,tilt),scale=.84+.16*z;
  img.style.left=(50+45*x)+'%';img.style.top=(50-45*y)+'%';
  img.style.transform=`translate(-50%,-50%) perspective(650px) rotateY(${x*43}deg) rotateX(${y*32}deg) scale(${scale})`;
  img.style.filter=`brightness(${.84+.16*z})`;img.style.zIndex=String(Math.round(z*100));
 });
}
function orbitTick(now){orbitFrame=0;if(!orbitVisible||document.hidden||motionPreference.matches)return;
 if(now-lastFrame>32){yaw+=(aimX-yaw)*.07;pitch+=(aimY-pitch)*.07;paintOrbit(now);lastFrame=now;}
 orbitFrame=requestAnimationFrame(orbitTick);
}
function startOrbit(){if(orbitVisible&&!document.hidden&&!motionPreference.matches&&!orbitFrame)orbitFrame=requestAnimationFrame(orbitTick);}
globeWorld.addEventListener('pointermove',e=>{const r=globeWorld.getBoundingClientRect();aimX=((e.clientX-r.left)/r.width-.5)*.14;aimY=((e.clientY-r.top)/r.height-.5)*.1;});
globeWorld.addEventListener('pointerleave',()=>{aimX=0;aimY=0;});
new IntersectionObserver(entries=>{orbitVisible=entries[0].isIntersecting;startOrbit();}).observe(globeWorld);
document.addEventListener('visibilitychange',startOrbit);motionPreference.addEventListener('change',()=>{paintOrbit();startOrbit();});paintOrbit();
const artists=[
 {name:'Jordan Susanto',tiktok:'https://www.tiktok.com/@jordansusantosings',genre:'R&B/Soul',country:'Indonesia',image:'protrait01.png',text:'“Senopati in the Rain” topped Spotify’s Global Viral chart and earned Jordan Best Soul/R&B Solo Artist at the 2024 AMI Awards.'},
 {name:'Dendi Nata',tiktok:'https://www.tiktok.com/@dendinataa',genre:'Pop',country:'Indonesia',image:'protrait07.png',text:'Social momentum helped “Abadi” reach Spotify’s Viral charts across Southeast Asia, with all versions together surpassing 235 million Spotify streams.'},
 {name:'Fabio Asher',tiktok:'https://www.tiktok.com/@fabioasher',genre:'Pop',country:'Indonesia',image:'protrait08.png',text:'With hits like “Rumah Singgah,” Fabio reached No. 1 on Spotify’s Global Viral chart and earned Best New Artist at the AMI Awards.'},
 {name:'WizTheMc',tiktok:'https://www.tiktok.com/@wizthemc',genre:'Afropop',country:'Germany',image:'protrait02.png',text:'“Show Me Love” landed on 300+ editorial playlists, including Today’s Top Hits, generating over 70 million editorial streams through SoundOn’s targeted playlist strategy.'},
 {name:'Rio Clappy',tiktok:'https://www.tiktok.com/@rio_clappy',genre:'Pop',country:'Indonesia',image:'protrait03.png',text:'“Bunga Abadi” reached No. 1 on Spotify’s Indonesia Viral chart and No. 6 on its Indonesia Top Songs chart.'},
 {name:'Silet Open Up',tiktok:'https://www.tiktok.com/@siletopenup',genre:'Dance',country:'Indonesia',image:'protrait05.png',text:'With SoundOn’s cross-platform promotion and explosive TikTok momentum, “TABOLA BALE” reached No. 1 on Spotify’s Indonesia Top Songs chart and No. 30 globally.'},
 {name:'Nuh...',tiktok:'https://www.tiktok.com/@nuh..cobacoba',genre:'Pop',country:'Indonesia',image:'protrait04.png',text:'“Teruntuk Mia” reached No. 2 on Spotify’s Indonesia Viral chart and No. 85 on its Indonesia Top Songs chart.'},
 {name:'Mazaya Amania',tiktok:'https://www.tiktok.com/@daddynmazaya',genre:'Pop',country:'Indonesia',image:'protrait06.png',text:'With “Ayam Piyik,” Mazaya earned Best Solo Child Artist at the 2024 AMI Awards, bringing Indonesian children’s music into the spotlight.'}
];
const track=document.querySelector('.story-track');
Array.from({length:3},()=>artists).flat().forEach((artist,index)=>{
 const card=document.createElement('a');
 card.className='story-card';
 card.tabIndex=index>=artists.length&&index<artists.length*2?0:-1;
 card.href=artist.tiktok;
 card.target='_blank';
 card.rel='noopener noreferrer';
 card.setAttribute('aria-label',`View ${artist.name} on TikTok (opens in a new tab)`);
 card.innerHTML=`<img src="assets/${artist.image}" alt="" loading="lazy"><div class="story-info"><h3>${artist.name}</h3><div class="story-tags"><span>${artist.genre}</span><span>${artist.country}</span></div><p>${artist.text}</p><span class="story-link" aria-hidden="true">↗</span></div>`;
 track.append(card);
});
const prev=document.querySelector('.story-prev'),next=document.querySelector('.story-next');
const smooth=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
let featuredIndex=2,loopTimer;
function storyStep(){return track.firstElementChild.getBoundingClientRect().width+20}
function centeredPosition(index){
 const card=track.children[index];
 return track.scrollLeft+card.getBoundingClientRect().left-track.getBoundingClientRect().left-(track.clientWidth-card.clientWidth)/2;
}
function settleStories(){
 const step=storyStep(),base=centeredPosition(artists.length);
 const offset=Math.round((track.scrollLeft-base)/step);
 featuredIndex=((offset%artists.length)+artists.length)%artists.length;
 // Swap identical copies only after scrolling settles, so either edge stays populated.
 if(offset<0||offset>=artists.length){
  track.scrollTo({left:base+featuredIndex*step,behavior:'instant'});
 }
}
function moveStory(direction){
 const step=storyStep(),base=centeredPosition(artists.length);
 const nearest=Math.round((track.scrollLeft-base)/step);
 track.scrollTo({left:base+(nearest+direction)*step,behavior:smooth});
}
prev.onclick=()=>moveStory(-1);next.onclick=()=>moveStory(1);
track.addEventListener('scroll',()=>{clearTimeout(loopTimer);loopTimer=setTimeout(settleStories,180)},{passive:true});
track.addEventListener('scrollend',settleStories);
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveStory(e.key==='ArrowRight'?1:-1)}});
let storyViewportWidth=0;
new ResizeObserver(()=>{
 if(track.clientWidth===storyViewportWidth)return;
 storyViewportWidth=track.clientWidth;
 track.scrollTo({left:centeredPosition(artists.length+featuredIndex),behavior:'instant'});
}).observe(track);

// Reveal the three figures together once, with a shared clock and ease-out curve.
const stats=document.querySelector('.stats');
if(stats&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
 const numberFormat=new Intl.NumberFormat('en-US');
 const counters=[...stats.querySelectorAll('[data-count]')].map(el=>{
  const target=Number(el.dataset.count),prefix=el.dataset.prefix||'',suffix=el.dataset.suffix||'';
  const accessible=document.createElement('span');accessible.className='count-accessible';accessible.textContent=el.textContent;
  const visual=document.createElement('span');visual.className='count-visual';visual.setAttribute('aria-hidden','true');
  const before=document.createElement('span');before.textContent=prefix;
  const slot=document.createElement('span');slot.className='count-slot';
  const reserve=document.createElement('span');reserve.className='count-reserve';reserve.textContent=numberFormat.format(target);
  const current=document.createElement('span');current.className='count-current';current.textContent='0';
  const after=document.createElement('span');after.textContent=suffix;
  slot.append(reserve,current);visual.append(before,slot,after);el.replaceChildren(accessible,visual);
  return {target,current};
 });
 stats.dataset.countState='idle';
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.85))return;
  observer.disconnect();stats.dataset.countState='running';
  let start;
  function countFrame(now){
   start??=now;
   const progress=Math.min(1,(now-start)/1500),eased=1-Math.pow(1-progress,3);
   counters.forEach(({target,current})=>current.textContent=numberFormat.format(progress===1?target:Math.floor(target*eased)));
   if(progress<1)requestAnimationFrame(countFrame);
   else stats.dataset.countState='complete';
  }
  requestAnimationFrame(countFrame);
 },{threshold:.85,rootMargin:'0px 0px -40px 0px'});
 observer.observe(stats);
}

// Sample the existing curves, so hover values and markers follow their actual geometry.
const performanceChart=document.querySelector('.chart');
if(performanceChart){
 const svg=performanceChart.querySelector('svg'),ns='http://www.w3.org/2000/svg';
 const plot=document.createElement('div');plot.className='chart-plot';plot.tabIndex=0;
 plot.setAttribute('role','group');plot.setAttribute('aria-label','Illustrative platform performance. Use left and right arrows to explore, up and down to switch platforms.');
 svg.before(plot);plot.append(svg);
 const platforms=['TikTok','Spotify','Apple Music','YouTube Music'];
 const textColors=['#fe2c55','#555','#666','#444'];
 const series=[...svg.querySelectorAll('.chart-line')].map((path,i)=>{
  const length=path.getTotalLength(),steps=Math.ceil(length/3),points=[];
  for(let j=0;j<=steps;j++){const p=path.getPointAtLength(length*j/steps);points.push({x:p.x,y:p.y});}
  return {name:platforms[i],color:path.getAttribute('stroke'),textColor:textColors[i],points};
 });
 const guide=document.createElementNS(ns,'g');guide.classList.add('chart-guide');guide.setAttribute('aria-hidden','true');
 const line=document.createElementNS(ns,'line');line.setAttribute('stroke','#777');line.setAttribute('stroke-width','1');line.setAttribute('opacity','.7');
 const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','4.5');dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','1.2');
 guide.append(line,dot);svg.append(guide);
 const tooltip=document.createElement('div');tooltip.className='chart-tooltip';tooltip.id='performance-tooltip';tooltip.setAttribute('role','tooltip');tooltip.setAttribute('aria-hidden','true');
 const name=document.createElement('span'),value=document.createElement('strong');name.className='chart-tooltip-name';value.className='chart-tooltip-value';tooltip.append(name,value);plot.append(tooltip);
 plot.setAttribute('aria-describedby',tooltip.id);
 let frame=0,pending=null,activeIndex=0,activeX=215;
 function hide(){pending=null;if(frame)cancelAnimationFrame(frame);frame=0;plot.classList.remove('is-inspecting');tooltip.setAttribute('aria-hidden','true');}
 function show(index,point){
  const matrix=svg.getScreenCTM();if(!matrix)return;
  const rect=plot.getBoundingClientRect(),screen=new DOMPoint(point.x,point.y).matrixTransform(matrix);
  const x=screen.x-rect.left,y=screen.y-rect.top,s=series[index];activeIndex=index;activeX=point.x;
  line.setAttribute('x1',point.x);line.setAttribute('x2',point.x);line.setAttribute('y1',point.y);line.setAttribute('y2','230');
  dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);dot.setAttribute('fill',s.color);
  // A fixed illustrative scale: 0 at the baseline, 34k at the top grid line.
  const count=Math.max(0,Math.round((230-point.y)*200));
  name.textContent=s.name;value.textContent=(count/1000).toFixed(1)+'k';value.style.color=s.textColor;
  const w=tooltip.offsetWidth,h=tooltip.offsetHeight,gap=15,padding=8;
  let left=x+gap;if(left+w>rect.width-padding)left=x-gap-w;
  left=Math.max(padding,Math.min(left,rect.width-w-padding));
  const top=Math.max(padding,Math.min(y-12,rect.height-h-padding));
  tooltip.style.left=left+'px';tooltip.style.top=top+'px';
  tooltip.setAttribute('aria-hidden','false');plot.classList.add('is-inspecting');
 }
 function inspect(){
  frame=0;if(!pending)return;
  const matrix=svg.getScreenCTM();if(!matrix)return hide();
  const position=new DOMPoint(pending.x,pending.y).matrixTransform(matrix.inverse());
  let best=null;
  series.forEach((s,index)=>{
   for(let i=1;i<s.points.length;i++){
    const a=s.points[i-1],b=s.points[i],dx=b.x-a.x,dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    const point={x:a.x+t*dx,y:a.y+t*dy};
    const screen=new DOMPoint(point.x,point.y).matrixTransform(matrix);
    const distance=Math.hypot(screen.x-pending.x,screen.y-pending.y);
    if(!best||distance<best.distance)best={index,point,distance};
   }
  });
  if(best&&best.distance<=36)show(best.index,best.point);else hide();
 }
 plot.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;pending={x:event.clientX,y:event.clientY};if(!frame)frame=requestAnimationFrame(inspect);});
 plot.addEventListener('pointerleave',hide);plot.addEventListener('pointercancel',hide);
 plot.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'){pending={x:event.clientX,y:event.clientY};inspect();}});
 function keyboardPoint(){
  const points=series[activeIndex].points;activeX=Math.max(points[0].x,Math.min(points.at(-1).x,activeX));
  for(let i=1;i<points.length;i++)if(points[i].x>=activeX){const a=points[i-1],b=points[i],t=(activeX-a.x)/(b.x-a.x||1);show(activeIndex,{x:activeX,y:a.y+t*(b.y-a.y)});return;}
 }
 plot.addEventListener('focus',()=>{if(plot.matches(':focus-visible'))keyboardPoint();});
 plot.addEventListener('blur',hide);
 plot.addEventListener('keydown',event=>{
  if(event.key==='Escape'){hide();return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();
  if(event.key==='ArrowLeft')activeX-=20;if(event.key==='ArrowRight')activeX+=20;
  if(event.key==='ArrowUp')activeIndex=(activeIndex+3)%4;if(event.key==='ArrowDown')activeIndex=(activeIndex+1)%4;
  keyboardPoint();
 });
 performanceChart.addEventListener('chart-dismiss',hide);
 new ResizeObserver(hide).observe(plot);
}

const navToggle=document.querySelector('.nav-toggle'),mainNavigation=document.querySelector('#main-navigation');
function closeNavigation(){mainNavigation.classList.remove('is-open');navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','Open navigation');}
navToggle.addEventListener('click',()=>{const open=navToggle.getAttribute('aria-expanded')!=='true';mainNavigation.classList.toggle('is-open',open);navToggle.setAttribute('aria-expanded',String(open));navToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
mainNavigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNavigation));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navToggle.getAttribute('aria-expanded')==='true'){closeNavigation();navToggle.focus();}});
addEventListener('resize',()=>{if(innerWidth>1000)closeNavigation();});


// Fit the complete shelf collection into the parent page without an inner scrollbar.
const artistShelves=document.querySelector('#artist-shelves');
const communityArtistName=document.querySelector('#community-artist-name');
let communityNameAnimation;
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==artistShelves.contentWindow)return;
 if(event.data?.type==='soundon-shelf-height'){
  const height=event.data.height;
  if(Number.isFinite(height)&&height>=300&&height<=2400)artistShelves.style.height=height+'px';
 }else if(event.data?.type==='soundon-shelf-artist'){
  const name=event.data.name;
  if(typeof name!=='string'||!name.trim()||name.length>60||communityArtistName.textContent===name)return;
  communityNameAnimation?.cancel();
  communityArtistName.textContent=name;
  if(!motionPreference.matches)communityNameAnimation=communityArtistName.animate([{opacity:.35},{opacity:1}],{duration:220,easing:'ease-out'});
 }
});
