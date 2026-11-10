import * as THREE from './vendor/three.module.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced,clock=0,previous=performance.now();
const pointer=new THREE.Vector2(),smooth=new THREE.Vector2();
window.addEventListener('pointermove',e=>pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2));
window.addEventListener('pointerleave',()=>pointer.set(0,0));
const fragment=`
precision highp float;
uniform sampler2D photo;
uniform vec2 light;
uniform float aspect;
varying vec2 vUv;
void main(){
 vec2 p=vUv*2.-1.; float r=length(p);
 float alpha=1.-smoothstep(.985,1.,r);
 if(r>=1.)discard;
 float z=sqrt(max(0.,1.-r*r));
 vec3 n=vec3(p,z);
 // Curved glass: keep the face clear, compress the image toward the rim.
 float bend=1.-.15*pow(r,3.)+.065*pow(r,14.);
 vec2 uv=.5+p*.5*bend+light*.009*z;
 if(aspect>1.)uv.x=(uv.x-.5)/aspect+.5;
 else uv.y=(uv.y-.5)*aspect+.5;
 vec3 col=texture2D(photo,uv).rgb;
 // Clear emissive-looking image under polished glass, without a grey veil.
 float luma=dot(col,vec3(.2126,.7152,.0722));
 col=mix(vec3(luma),col,1.13);
 col=clamp((col-.5)*1.10+.53,0.,1.);
 float edge=pow(1.-z,3.5);
 col*=1.-edge*.18;
 // Narrow dark/bright edge pair gives the water lens its thickness.
 float inner=exp(-pow((r-.962)/.010,2.));
 col*=1.-inner*.40;
 float rim=exp(-pow((r-.986)/.0045,2.));
 col=mix(col,vec3(.94,.98,1.),rim*.88);
 vec3 lamp=normalize(vec3(-.48+light.x*.22,.72+light.y*.14,.65));
 float reflection=pow(max(dot(n,lamp),0.),230.);
 // Crisp curved light strips sit near the rim, keeping the portrait unobscured.
 float topArc=exp(-pow((r-.924)/.009,2.))*smoothstep(.40,.84,p.y)*(1.-smoothstep(.1,.65,p.x));
 float topHalo=exp(-pow((r-.924)/.024,2.))*smoothstep(.50,.88,p.y)*.08;
 float rightArc=exp(-pow((r-.954)/.005,2.))*exp(-pow((p.y+.17)/.28,2.))*smoothstep(.6,.9,p.x);
 float glint=clamp(reflection*.78+topArc*.90+rightArc*.80+topHalo,0.,.96);
 col=mix(col,vec3(1.),glint);
 float bottom=exp(-pow((r-.966)/.006,2.))*smoothstep(.6,.96,-p.y);
 col+=vec3(.20,.27,.30)*bottom;
 gl_FragColor=vec4(col,alpha);
}`;
const vertex='varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const bubbles=[];
for(const [index,el] of [...document.querySelectorAll('.orb')].entries()){
 const renderer=new THREE.WebGLRenderer({canvas:el.querySelector('canvas'),alpha:true,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 const scene=new THREE.Scene(),camera=new THREE.Camera();
 const texture=await new THREE.TextureLoader().loadAsync('assets/'+el.dataset.image);
 const uniforms={photo:{value:texture},light:{value:smooth},aspect:{value:texture.image.width/texture.image.height}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 const resize=()=>{const size=el.clientWidth;renderer.setSize(size,size,false);};
 new ResizeObserver(resize).observe(el);resize();
 el.addEventListener('click',()=>{const selected=el.classList.toggle('selected');el.setAttribute('aria-pressed',String(selected));});
 bubbles.push({el,renderer,scene,camera,index});
}
const motion=document.querySelector('#motion');
function updateLabel(){motion.textContent=paused?'Resume motion ▷':'Pause motion Ⅱ';motion.setAttribute('aria-label',paused?'Resume motion':'Pause motion');}
motion.onclick=()=>{paused=!paused;updateLabel();};updateLabel();
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;if(!paused)clock+=dt;
 smooth.lerp(reduced?new THREE.Vector2():pointer,.04);
 for(const {el,renderer,scene,camera,index} of bubbles){
  const x=paused?0:Math.sin(clock*.37+index*1.7)*6+smooth.x*(index+2)*2;
  const y=paused?0:Math.sin(clock*.46+index*2.1)*9-smooth.y*(index+2)*1.5;
  el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');renderer.render(scene,camera);
 }
}requestAnimationFrame(frame);
