(() => {
 const tabs = [...document.querySelectorAll('.label-question-nav [role="tab"]')];
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 function select(tab, focus = false) {
  const changed = tab.getAttribute('aria-selected') !== 'true';
  tabs.forEach(item => {
   const active = item === tab;
   item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1;
   document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (changed && !reducedMotion.matches) {
   const panel = document.getElementById(tab.getAttribute('aria-controls'));
   panel.getAnimations().forEach(animation => animation.cancel());
   panel.animate([
    { opacity: 0, translate: '0 12px', rotate: '.35deg', offset: 0 },
    { opacity: 1, translate: '0 -3px', rotate: '-.12deg', offset: .66 },
    { opacity: 1, translate: '0 0', rotate: '0deg', offset: 1 }
   ], { duration: 480, easing: 'cubic-bezier(.22,.65,.3,1)' });
  }
  if (focus) tab.focus();
 }
 tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', event => {
   let next;
   if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
   if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = tabs.length - 1;
   if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
  });
 });
 const navigation = [...document.querySelectorAll('#main-navigation a')];
 navigation[2].addEventListener('click', () => { if(document.documentElement.dataset.audience === 'labels') select(tabs[0]); });
 navigation[3].addEventListener('click', () => { if(document.documentElement.dataset.audience === 'labels') select(tabs[2]); });
 // Source: https://www.soundon.global/artist-story?lang=en, checked 2026-11-11.
 // Only the first two stories explicitly attribute a promotion strategy to SoundOn.
 const cases = [
  {name:'WizTheMc',image:'protrait02.png',focus:'Playlist pitching',country:'Germany',text:'SoundOn’s targeted playlist strategy helped “Show Me Love” land on 300+ editorial playlists, generating over 70 million editorial streams.'},
  {name:'Silet Open Up',image:'protrait05.png',focus:'Cross-platform promotion',country:'Indonesia',text:'With SoundOn’s cross-platform promotion and TikTok momentum, “TABOLA BALE” reached No. 1 on Spotify’s Indonesia Top Songs chart and No. 30 globally.'},
  {name:'Dendi Nata',image:'protrait07.png',focus:'Social discovery',country:'Indonesia',text:'Featured in SoundOn’s case studies, “Abadi” reached Viral charts across Southeast Asia through social momentum, with all versions surpassing 235 million Spotify streams.'}
 ];
 const rail = document.querySelector('#label-proof-cards');
 rail.innerHTML = cases.map(item => `<a class="label-proof-card" href="https://www.soundon.global/artist-story?lang=en" target="_blank" rel="noopener noreferrer" aria-label="Read ${item.name}’s SoundOn case study"><img src="assets/${item.image}" alt="${item.name}" loading="lazy"><div class="label-case-info"><h3>${item.name}</h3><div class="label-case-tags"><span>${item.focus}</span><span>${item.country}</span></div><p>${item.text}</p><span class="label-case-arrow" aria-hidden="true">↗</span></div></a>`).join('');

 // Repeat the three stories around a central set, so either direction stays filled.
 const markup = rail.innerHTML;
 rail.innerHTML = markup.repeat(5);
 [...rail.children].forEach((card, index) => {
  if (index < cases.length * 2 || index >= cases.length * 3) {
   card.setAttribute('aria-hidden', 'true');
   card.tabIndex = -1;
  }
 });
 rail.setAttribute('aria-label', 'Artist stories');
 const controls = document.createElement('div');
 controls.className = 'label-story-controls label-only wrap';
 controls.innerHTML = '<button type="button" aria-label="Previous artist">←</button><button type="button" aria-label="Next artist">→</button>';
 rail.after(controls);
 let cycle = 0, step = 0, width = 0;
 const resize = new ResizeObserver(() => {
  if (!rail.clientWidth || rail.clientWidth === width) return;
  width = rail.clientWidth;
  step = rail.children[1].offsetLeft - rail.children[0].offsetLeft;
  cycle = step * cases.length;
  const center = rail.children[cases.length * 2 + 1];
  rail.scrollLeft = center.offsetLeft - rail.offsetLeft - (rail.clientWidth - center.clientWidth) / 2;
 });
 resize.observe(rail);
 rail.addEventListener('scroll', () => {
  if (!cycle) return;
  if (rail.scrollLeft < cycle) rail.scrollLeft += cycle;
  else if (rail.scrollLeft > cycle * 3) rail.scrollLeft -= cycle;
 }, {passive:true});
 [...controls.children].forEach((button,index) => button.addEventListener('click', () => {
  rail.scrollBy({left:step * (index ? 1 : -1),behavior:reducedMotion.matches ? 'instant' : 'smooth'});
 }));
 let drag = null, dragged = false;
 rail.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = {x:event.clientX,scroll:rail.scrollLeft}; dragged = false;
 });
 rail.addEventListener('pointermove', event => {
  if (!drag) return;
  const delta = event.clientX - drag.x;
  if (Math.abs(delta) > 5) {
   dragged = true;
   rail.setPointerCapture(event.pointerId);
   rail.classList.add('is-dragging');
   rail.scrollLeft = drag.scroll - delta;
   if (rail.scrollLeft < cycle || rail.scrollLeft > cycle * 3) {
    const shift = rail.scrollLeft < cycle ? cycle : -cycle;
    rail.scrollLeft += shift; drag.scroll += shift;
   }
  }
 });
 const endDrag = () => {drag = null;rail.classList.remove('is-dragging');};
 rail.addEventListener('pointerup', endDrag);
 rail.addEventListener('pointercancel', endDrag);
 rail.addEventListener('lostpointercapture', endDrag);
 rail.addEventListener('click', event => {if(dragged){event.preventDefault();dragged=false;}},true);
 rail.addEventListener('dragstart',event=>event.preventDefault());
})();
