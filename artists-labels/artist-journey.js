// The example release is deliberately separate from the real artist stories.
(() => {
 const tablist = document.querySelector('.progress-navigation [role="tablist"]');
 const tabs = [...tablist.querySelectorAll('[role="tab"]')];
 function activate(tab, focus = false) {
  tabs.forEach(item => {
   const selected = item === tab;
   item.setAttribute('aria-selected', String(selected));
   item.tabIndex = selected ? 0 : -1;
   document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
 }
 tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
   let next;
   if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
   if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = tabs.length - 1;
   if (next !== undefined) { event.preventDefault(); activate(tabs[next], true); }
  });
 });
 document.querySelectorAll('[data-open-platforms]').forEach(button => button.addEventListener('click', () => document.querySelector('#platform-dialog').showModal()));
 const links = [...document.querySelectorAll('#main-navigation a')];
 const artistTargets = ['artist-distribution', 'artist-promotion', 'artist-progress', 'artist-progress', 'artists', 'plans'];
 const labelTargets = ['distribution', 'promotion', 'insights', 'earnings', 'artists', 'plans'];
 function updateNavigation() {
  const isArtist = document.documentElement.dataset.audience === 'artists';
  links.forEach((link, index) => link.setAttribute('href', '#' + (isArtist ? artistTargets : labelTargets)[index]));
 }
 links[2].addEventListener('click', () => { if(document.documentElement.dataset.audience === 'artists') activate(tabs[0]); });
 links[3].addEventListener('click', () => { if(document.documentElement.dataset.audience === 'artists') activate(tabs[1]); });
 window.addEventListener('audiencechange', updateNavigation);
 updateNavigation();
})();

// One preview accumulates assets; switching back reverses the same composition.
(() => {
 const builder = document.querySelector('.release-builder');
 if (!builder) return;
 const buttons = [...builder.querySelectorAll('[data-build-step]')];
 const preview = builder.querySelector('.release-build-preview');
 const cta = builder.querySelector('.build-release-cta');
 function selectStep(index) {
  buttons.forEach((button, i) => {
   button.setAttribute('aria-expanded', String(i === index));
   document.getElementById(button.getAttribute('aria-controls')).hidden = i !== index;
  });
  preview.dataset.buildState = String(index + 1);
  cta.hidden = index !== 3;
 }
 buttons.forEach((button, i) => button.addEventListener('click', () => selectStep(i)));
})();
