const plans=[
 {name:'Lite',display:'lite',subtitle:'Zero upfront cost. Pay as you earn.',price:'$0.00',features:['<strong>1</strong> primary artist','Keep <strong>90%</strong> streaming earnings','All essential distribution features','Access to Spotify Discovery Mode']},
 {name:'Core',display:'Core',subtitle:'Best value for everything you need.',price:'$3.17',popular:true,features:['Up to <strong>2</strong> primary artists','Unlimited releases across all platforms','Keep <strong>100%</strong> streaming earnings','Full promotion and monetization tools']},
 {name:'Max',display:'Max',subtitle:'Built for advanced artists and growing labels.',price:'$7.92',features:['Everything in Core','Up to <strong>500</strong> primary artists','Flexible team management','Advanced release setup']}
];
plans.forEach(plan=>{
 const card=document.createElement('article');card.className='plan plan-'+plan.name.toLowerCase();
 card.innerHTML=`${plan.popular?'<div class="plan-ribbon artist-only"><span>MOST POPULAR</span></div>':''}${plan.name==='Max'?'<div class="plan-ribbon label-only"><span>Highly recommended</span></div>':''}<div class="plan-pricing"><div class="price">${plan.price}<small> /mo</small></div><p class="billing-note">${plan.name==='Lite'?'No upfront cost.':'Billed annually. Cancel auto-renew anytime.'}</p></div><div class="plan-top"><div class="plan-heading"><h3>${plan.name}</h3></div><p class="subtitle">${plan.subtitle}</p>${plan.name==='Max'?`<div class="capacity-picker"><button type="button" class="artist-capacity" aria-label="Number of primary artists" aria-haspopup="listbox" aria-expanded="false" aria-controls="max-capacity-options"><span class="artist-capacity-icon" aria-hidden="true"></span><span class="capacity-label">5 primary artists</span><span class="artist-capacity-chevron" aria-hidden="true"></span></button><div id="max-capacity-options" class="capacity-menu" role="listbox" aria-label="Number of primary artists" hidden>${[[5,'7.92'],[10,'14.83'],[20,'27.58'],[50,'62.58'],[100,'115.58'],[500,'561.08']].map(([count,price],i)=>`<button type="button" class="capacity-option" role="option" aria-selected="${i===0}" tabindex="-1" data-price="${price}"><span>${count} primary artists</span><span class="capacity-check" aria-hidden="true">✓</span></button>`).join('')}</div></div>`:''}</div><ul>${plan.features.map(feature=>`<li><span>${feature}</span></li>`).join('')}</ul><a class="pill" href="https://www.soundon.global/pricing?lang=en" target="_blank" rel="noopener noreferrer" aria-label="Get ${plan.name} plan">Get ${plan.name}</a>`;
 document.querySelector('.plan-grid').append(card);
 const picker = card.querySelector('.capacity-picker');
 if (picker) {
  const trigger=picker.querySelector('.artist-capacity');
  const menu=picker.querySelector('.capacity-menu');
  const options=[...menu.querySelectorAll('.capacity-option')];
  const close=(restore=false)=>{menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();};
  const open=()=>{menu.hidden=false;trigger.setAttribute('aria-expanded','true');options.find(o=>o.getAttribute('aria-selected')==='true').focus();};
  trigger.addEventListener('click',()=>menu.hidden?open():close());
  trigger.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open();}if(e.key==='Escape')close(true);});
  options.forEach(option=>option.addEventListener('click',()=>{
   options.forEach(o=>o.setAttribute('aria-selected',String(o===option)));
   trigger.querySelector('.capacity-label').textContent=option.querySelector('span').textContent;
   const price=card.querySelector('.price');
   price.setAttribute('aria-live','polite');
   price.innerHTML='$'+option.dataset.price+'<small> /mo</small>';
   close(true);
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)price.animate([{opacity:.4,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
  }));
  menu.addEventListener('keydown',e=>{
   const i=options.indexOf(document.activeElement);
   if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
    e.preventDefault();options[e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();
   }
   if(e.key==='Escape'){e.preventDefault();close(true);}
  });
  document.addEventListener('pointerdown',e=>{if(!picker.contains(e.target))close();});
  picker.addEventListener('focusout',e=>{if(!picker.contains(e.relatedTarget))close();});
  window.addEventListener('audiencechange',()=>close());
 }


});

const root=document.documentElement;const switchers=[...document.querySelectorAll('[data-mode]')];
function audience(mode){root.dataset.audience=mode;document.querySelector(".site-header .brand img").src=mode==="artists"?"assets/soundon-logo-dark.svg":"assets/soundon-logo-provided.svg";switchers.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));const u=new URL(location.href);u.searchParams.set('audience',mode);history.replaceState(null,'',u);document.querySelector('#plans h2').textContent=mode==='labels'?'A plan that grows with your roster':'Choose your plan';document.querySelector('#plans .wrap > p').textContent=mode==='labels'?'Find the right plan to manage your roster, grow your catalog and keep your team moving.':'Simple, transparent pricing for artists and teams. Find the right plan to grow your audience and keep more of your royalties.';
 document.querySelectorAll('.plan').forEach((card,i)=>{card.querySelector('.subtitle').textContent=mode==='labels'?'Best value for everything you need.':plans[i].subtitle;card.querySelector('.billing-note').textContent=i===0?'No upfront cost.':mode==='labels'&&i===2?'Built for advanced artists and growing labels.':'Billed annually. Cancel auto-renew anytime.';});
 window.dispatchEvent(new CustomEvent('audiencechange',{detail:mode}));}
switchers.forEach(b=>b.onclick=()=>audience(b.dataset.mode));audience(new URLSearchParams(location.search).get('audience')==='artists'?'artists':'labels');
const services=[['TikTok','tiktok.png',44,44,22],['Spotify','spotify.png',68,60,15],['Amazon Music','amazon.jpeg',61,18,16],['Facebook','facebook.jpeg',32,20,14],['YouTube Music','youtube.jpeg',18,47,12],['SoundCloud','soundcloud.jpeg',24,72,15],['Deezer','deezer.png',62,83,10]];
const mini=document.querySelector('#platform-mini');
mini.innerHTML=`<div class="mini-globe-surface" aria-hidden="true"><svg viewBox="0 0 320 320" fill="none" stroke="#9b8e91" stroke-width=".8"><circle cx="250" cy="78" r="240"/><ellipse cx="250" cy="78" rx="195" ry="240"/><ellipse cx="250" cy="78" rx="135" ry="240"/><ellipse cx="250" cy="78" rx="65" ry="240"/><ellipse cx="250" cy="78" rx="240" ry="92"/><path d="M12 44C80-16 316-22 480 42M16 132C90 216 358 223 477 132M39 194C122 267 344 279 454 201M93 260C174 308 319 316 394 270"/></svg></div>`;
const miniServices=[
 ['TikTok','tiktok.png',54,53,25,2,-5,1],
 ['Amazon Music','amazon.jpeg',39,24,17,9,-13,-3],
 ['Facebook','facebook.jpeg',75,26,16,10,17,3],
 ['YouTube Music','youtube.jpeg',22,45,13,0,-23,-5],
 ['Spotify','spotify.png',29,73,17,-12,-17,-4],
 ['Deezer','deezer.png',76,77,12,-17,17,4],
 ['SoundCloud','soundcloud.jpeg',88,52,9,0,25,5]
];
miniServices.forEach(([name,file,x,y,size,rx,ry,rz])=>mini.insertAdjacentHTML('beforeend',`<span class="mini-platform" style="--x:${x}%;--y:${y}%;--s:${size}%;--rx:${rx}deg;--ry:${ry}deg;--rz:${rz}deg"><img src="assets/${file}" alt="${name}"></span>`));
services.forEach(([name,file,x,y,size])=>{document.querySelector('.platform-list').insertAdjacentHTML('beforeend',`<div><img src="assets/${file}" alt="">${name}</div>`);document.querySelector('#artist-platforms').insertAdjacentHTML('beforeend',`<div class="platform-node" style="--x:${x}%;--y:${y}%;--size:${size}%"><img class="platform-logo" src="assets/${file}" alt="${name}"></div>`)});
const dialog=document.querySelector('dialog');document.querySelector('#platforms-open').onclick=()=>dialog.showModal();dialog.querySelector('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
const menu=document.querySelector('.nav-toggle');menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',open);document.querySelector('#main-navigation').classList.toggle('is-open',open)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const orbs=[...document.querySelectorAll('.orb')];orbs.forEach(o=>o.onclick=()=>o.classList.toggle('selected'));if(!reduced){let start=performance.now();function tick(t){if(!document.hidden){orbs.forEach((o,i)=>{o.style.setProperty('--x',Math.sin((t-start)*.0003+i*1.7)*7+'px');o.style.setProperty('--y',Math.sin((t-start)*.00036+i*2.1)*11+'px')})}requestAnimationFrame(tick)}requestAnimationFrame(tick)}
document.querySelectorAll('#main-navigation a').forEach(link=>link.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#main-navigation').classList.remove('is-open')}));

// Reveal each visible section once, without hiding content before scripts run.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
 const entranceObserver = new IntersectionObserver(entries => {
  entries.forEach(({target, isIntersecting}) => {
   if (!isIntersecting || !target.getClientRects().length) return;
   target.animate([{opacity:0, translate:'0 14px'}, {opacity:1, translate:'0 0'}],
    {duration:650, easing:'cubic-bezier(.2,.65,.3,1)'});
   entranceObserver.unobserve(target);
  });
 }, {threshold:0, rootMargin:'0px 0px -32px 0px'});
 document.querySelectorAll('main .section, main .label-intro, main .journey-tools, main .unified-hero')
  .forEach(section => entranceObserver.observe(section));
}
