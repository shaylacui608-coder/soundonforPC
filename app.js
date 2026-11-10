// Centers and diameters on a 500 × 530 composition, scaled together at every viewport.
const platforms=[
 ['SoundCloud','soundcloud.jpeg',90,78,80],
 ['Amazon Music','amazon.jpeg',394,144,94],
 ['Beatport','beatport.jpeg',306,40,30],
 ['QQ Music','qq.png',443,294,78],
 ['TikTok','tiktok.png',280,278,174],
 ['Facebook','facebook.jpeg',89,239,110],
 ['Instagram','instagram.jpeg',145,404,102],
 ['YouTube Music','youtube.jpeg',386,450,108],
 ['iHeartRadio','iheart.png',39,365,36],
 ['Deezer','deezer.png',259,461,34],
 ['Spotify','spotify.png',207,133,110],
 ['AWA','awa.jpeg',424,41,28]
];
const cloud=document.querySelector('.platform-cloud'),list=document.querySelector('.platform-list');
platforms.forEach(([name,file,x,y,size],i)=>{
 const node=document.createElement('div');node.className='platform-node';
 node.style.cssText=`--x:${x/5}%;--y:${y/5.3}%;--size:${size/5}%;--delay:-${i*.7}s;--duration:${8+i%4}s`;
 const img=document.createElement('img');img.src='assets/'+file;img.alt=name;img.className='platform-logo';
 node.append(img);cloud.append(node);
 const item=document.createElement('div');item.innerHTML=`<img src="assets/${file}" alt="">${name}`;list.append(item);
});
document.querySelector('#platforms-open').onclick=()=>document.querySelector('#platform-dialog').showModal();
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});});
const plans=[
 {name:'Lite',display:'lite',subtitle:'Zero upfront cost. Pay as you earn.',price:'$0.00',features:['<strong>1</strong> primary artist','Keep <strong>90%</strong> streaming earnings','All essential distribution features','Access to Spotify Discovery Mode']},
 {name:'Core',display:'Core',subtitle:'Best value for everything you need.',price:'$3.17',popular:true,features:['Up to <strong>2</strong> primary artists','Unlimited releases across all platforms','Keep <strong>100%</strong> streaming earnings','Full promotion and monetization tools']},
 {name:'Max',display:'Max',subtitle:'Built for advanced artists and growing labels.',price:'$7.92',features:['Everything in Core','Up to <strong>500</strong> primary artists','Flexible team management','Advanced release setup']}
];
plans.forEach(plan=>{
 const card=document.createElement('article');card.className='plan plan-'+plan.name.toLowerCase();
 card.innerHTML=`${plan.popular?'<div class="plan-ribbon"><span>MOST POPULAR</span></div>':''}<div class="plan-pricing"><div class="price">${plan.price}<small> /mo</small></div><p class="billing-note">${plan.name==='Lite'?'No upfront cost.':'Billed annually. Cancel auto-renew anytime.'}</p></div><div class="plan-top"><div class="plan-heading"><h3>${plan.name}</h3></div><p class="subtitle">${plan.subtitle}</p>${plan.name==='Max'?'<div class="artist-capacity"><span class="artist-capacity-icon" aria-hidden="true"></span><span><strong>5</strong> primary artists</span><span class="artist-capacity-chevron" aria-hidden="true"></span></div>':''}</div><ul>${plan.features.map(feature=>`<li><span>${feature}</span></li>`).join('')}</ul><button class="pill" aria-label="Get ${plan.name} plan">Get ${plan.name}</button>`;
 card.querySelector('button').onclick=()=>{document.querySelector('#plan-title').textContent=plan.name+' plan';document.querySelector('#plan-dialog').showModal();};document.querySelector('.plan-grid').append(card);
});

const tabs=[...document.querySelectorAll('[role=tab]')],panels=[...document.querySelectorAll('[role=tabpanel]')];
let selected=0,manualY=null,lastScrollState=-1;
function select(index){document.querySelector('.chart')?.dispatchEvent(new Event('chart-dismiss'));selected=index;tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(index===i));tab.tabIndex=index===i?0:-1;panels[i].hidden=index!==i;panels[i].classList.toggle('active',index===i);});}
tabs.forEach((tab,i)=>{tab.onclick=()=>{manualY=scrollY;select(i)};tab.onkeydown=e=>{let next=i;if(['ArrowDown','ArrowRight'].includes(e.key))next=(i+1)%3;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(i+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();manualY=scrollY;select(next);tabs[next].focus();};});
const section=document.querySelector('.insight-scroll');let scheduled=false;
function updateScroll(){scheduled=false;const rect=section.getBoundingClientRect(),travel=section.offsetHeight-innerHeight;const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,travel)));const state=Math.min(2,Math.floor(progress*3));if(manualY!==null&&Math.abs(scrollY-manualY)<100)return;manualY=null;if(rect.top<innerHeight&&rect.bottom>0&&state!==lastScrollState){lastScrollState=state;select(state);}}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();

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

// Keep both artist ocean modes addressable and preserve the chosen mode on reload.
const partnersFrame=document.querySelector('#partners-ocean');
const oceanMode=new URLSearchParams(location.search).get('ocean');
if(oceanMode==='plain')partnersFrame.src='components/partners/?mode=plain';
addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==partnersFrame.contentWindow||event.data?.type!=='partners-mode')return;
 if(!['plain','spotlight'].includes(event.data.mode))return;
 const url=new URL(location.href);url.searchParams.set('ocean',event.data.mode);history.replaceState(null,'',url);
});
