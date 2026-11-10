const track=document.querySelector('.records'),viewport=document.querySelector('.record-viewport');
const previous=document.querySelector('.previous'),next=document.querySelector('.next'),status=document.querySelector('#record-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Official SoundOn artist-story highlights, in the user's Portrait 1–8 order.
const artists=[
 {name:'WizTheMc',category:'Editorial streams',achievement:'70M+'},
 {name:'Fabio Asher',category:'AMI Awards',achievement:'Best New Artist'},
 {name:'Rio Clappy',category:'Spotify Viral · Indonesia',achievement:'#1'},
 {name:'Silet Open Up',category:'Spotify Top Songs · Indonesia',achievement:'#1'},
 {name:'Dendi Nata',category:'Spotify Viral · Indonesia',achievement:'#1'},
 {name:'Jordan Susanto',category:'AMI Awards 2024',achievement:'Best Soul/R&B Solo Artist',lines:'Best Soul/R&B<br>Solo Artist'},
 {name:'Nuh...',category:'Spotify Viral · Indonesia',achievement:'#2'},
 {name:'Mazaya Amania',category:'AMI Awards 2024',achievement:'Best Kid Solo Artist'}
];
const labels=['#de9657','#b6b6b4','#ae805f','#6597a4','#a0b653','#caba9b','#8c9fa2','#e5a1b0'];
for(let i=1;i<=artists.length;i++){
 const artist=artists[i-1];
 const storyUrl='https://www.soundon.global/artist-story?lang=en#:~:text='+encodeURIComponent(artist.name);
 const item=document.createElement('div');item.className='record-item';item.setAttribute('role','listitem');
 item.innerHTML=`<a class="record" href="${storyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Read ${artist.name} on SoundOn (opens in a new tab)"><span class="record-shadow"></span><span class="jacket" style="--label:${labels[i-1]}"><span class="vinyl" aria-hidden="true"></span><img src="assets/portrait-${i}.jpg" alt="${artist.name} artwork" draggable="false"></span><span class="plaque" aria-hidden="true"><span class="plaque-summary"><small>${artist.category}</small><span class="achievement">${artist.lines||artist.achievement}</span></span><strong>${artist.name}</strong></span></a>`;
 track.append(item);
}
let destination=null;
function update(){
 const end=viewport.scrollWidth-viewport.clientWidth;
 previous.disabled=viewport.scrollLeft<=1;next.disabled=viewport.scrollLeft>=end-1;
 const itemWidth=track.firstElementChild.getBoundingClientRect().width;
 const first=Math.min(8,Math.floor((viewport.scrollLeft+1)/itemWidth)+1),last=Math.min(8,Math.ceil((viewport.scrollLeft+viewport.clientWidth-1)/itemWidth));
 status.textContent=`Records ${first} to ${last} of 8`;
 if(destination!==null&&Math.abs(viewport.scrollLeft-destination)<1)destination=null;
}
function page(direction){
 const end=Math.max(0,viewport.scrollWidth-viewport.clientWidth);
 destination=Math.max(0,Math.min(end,(destination??viewport.scrollLeft)+direction*viewport.clientWidth));
 viewport.scrollTo({left:destination,behavior:reduced.matches?'instant':'smooth'});
}
previous.onclick=()=>page(-1);next.onclick=()=>page(1);
viewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();page(event.key==='ArrowRight'?1:-1);}});
viewport.addEventListener('pointerdown',()=>destination=null);
viewport.addEventListener('wheel',()=>destination=null,{passive:true});
viewport.addEventListener('scroll',update,{passive:true});
new ResizeObserver(()=>{destination=null;update();}).observe(viewport);update();
