const gallery=document.querySelector("#gallery");
const compact=matchMedia("(max-width:600px)");
// Same verified homepage artist collection as Scheme 1’s final community section.
const artists=[
  {
    "name": "Grace Gachot",
    "category": "SoundOn artist",
    "file": "assets/community-artist-10.jpg"
  },
  {
    "name": "Mon Rovia",
    "category": "SoundOn artist",
    "file": "assets/community-artist-16.jpg"
  },
  {
    "name": "Katherine Li",
    "category": "SoundOn artist",
    "file": "assets/community-artist-12.jpg"
  },
  {
    "name": "Alan Walker",
    "category": "SoundOn artist",
    "file": "assets/community-artist-03.jpg"
  },
  {
    "name": "Dendi Nata",
    "category": "SoundOn artist",
    "file": "assets/community-artist-06.jpg"
  },
  {
    "name": "Annick",
    "category": "SoundOn artist",
    "file": "assets/community-artist-05.jpg"
  },
  {
    "name": "James Carter",
    "category": "SoundOn artist",
    "file": "assets/community-artist-11.jpg"
  },
  {
    "name": "AleMor",
    "category": "SoundOn artist",
    "file": "assets/community-artist-04.jpg"
  }
];
let featuredName='Dendi Nata';
function featureArtist(name){
 featuredName=name;
 gallery.querySelectorAll('.record').forEach(record=>record.setAttribute('aria-pressed',String(record.dataset.artist===name)));
 parent.postMessage({type:'soundon-shelf-artist',name},location.origin);
}
const labels=['#de9657','#b6b6b4','#ae805f','#6597a4','#a0b653','#caba9b','#8c9fa2','#e5a1b0'];

function renderShelves(){
 gallery.replaceChildren();
 const perRow=compact.matches?2:4;
 for(let start=0;start<artists.length;start+=perRow){
  const row=document.createElement('section');row.className='gallery';row.setAttribute('aria-label',`Artist shelf ${start/perRow+1}`);
  row.innerHTML='<div class="shelf-shadow" aria-hidden="true"></div><div class="shelf" aria-hidden="true"></div><div class="records" role="list"></div>';
  artists.slice(start,start+perRow).forEach((artist,offset)=>{
   const index=start+offset;
   const item=document.createElement('div');item.className='record-item';item.setAttribute('role','listitem');
   item.innerHTML=`<button type="button" class="record" aria-label="Feature ${artist.name}" aria-pressed="${artist.name===featuredName}"><span class="record-shadow"></span><span class="jacket" style="--label:${labels[index]}"><span class="vinyl" aria-hidden="true"></span><img src="${artist.file}" alt="${artist.name}" draggable="false"></span><span class="plaque" aria-hidden="true"><span class="plaque-summary"><small>${artist.category}</small></span><strong>${artist.name}</strong></span></button>`;
   const record=item.querySelector('.record');
   record.dataset.artist=artist.name;
   record.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')featureArtist(artist.name);});
   record.addEventListener('focus',()=>featureArtist(artist.name));
   record.addEventListener('click',()=>featureArtist(artist.name));
   row.querySelector('.records').append(item);
  });
  gallery.append(row);
 }
}
renderShelves();compact.addEventListener('change',renderShelves);
new ResizeObserver(()=>{
 const height=Math.ceil(document.querySelector('main').getBoundingClientRect().height);
 parent.postMessage({type:'soundon-shelf-height',height},location.origin);
}).observe(document.querySelector('main'));
