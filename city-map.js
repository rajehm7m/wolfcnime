(() => {
  'use strict';
  const section=document.querySelector('#city-map');if(!section)return;
  const viewport=section.querySelector('.map-viewport'),world=section.querySelector('.map-world'),image=world.querySelector('img');
  const zoomLabel=section.querySelector('.map-zoom-value'),readout=section.querySelector('.map-grid-value'),ping=section.querySelector('.map-ping');
  const title=section.querySelector('.map-location-name'),description=section.querySelector('.map-location-description'),locationLabel=section.querySelector('.map-location-label');
  const mouse=section.querySelector('.map-mouse');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),pointers=new Map(),locations=window.MT_MAP_LOCATIONS||[];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let width=0,height=0,bw=0,bh=0,scale=1,x=0,y=0,frame=0,travel=0,pinch=null,visible=false,disposed=false;
  let glide=null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const maximum=()=>Math.max(1,Math.min(4,(image.naturalWidth||1240)/Math.max(1,bw)));
  function bounded(){
    scale=clamp(scale,1,maximum());
    x=clamp(x,-Math.max(0,(bw*scale-width)/2+width*.18),Math.max(0,(bw*scale-width)/2+width*.18));
    y=clamp(y,-Math.max(0,(bh*scale-height)/2+height*.18),Math.max(0,(bh*scale-height)/2+height*.18));
  }
  function draw(now){
    frame=0;if(disposed)return;
    if(glide){const t=clamp((now-glide.time)/520,0,1),p=1-Math.pow(1-t,4);x=glide.x+(glide.toX-glide.x)*p;y=glide.y+(glide.toY-glide.y)*p;scale=glide.scale+(glide.toScale-glide.scale)*p;if(t===1)glide=null;}
    bounded();world.style.width=`${bw*scale}px`;world.style.height=`${bh*scale}px`;
    world.style.transform=`translate(-50%,-50%) translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
    world.style.setProperty('--map-inverse','1');zoomLabel.textContent=`${scale.toFixed(1)}×`;
    section.querySelector('[data-map-action="out"]').disabled=scale<=1.001;section.querySelector('[data-map-action="in"]').disabled=scale>=maximum()-.001;
    if(glide)queue();
  }
  function queue(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}
  function stop(){glide=null;}
  function measure(){
    stop();const box=viewport.getBoundingClientRect();width=box.width;height=box.height;
    if(image.naturalWidth)section.style.setProperty('--map-scan-image','url("assets/images/city-map-detail.webp")');
    const ratio=(image.naturalWidth||1240)/(image.naturalHeight||1269);bh=Math.min(height*.93,width*.86/ratio);bw=bh*ratio;
    world.style.width=`${bw}px`;world.style.height=`${bh}px`;bounded();queue();
  }
  function zoom(next,cx=0,cy=0){stop();next=clamp(next,1,maximum());const ratio=next/scale;x=cx-(cx-x)*ratio;y=cy-(cy-y)*ratio;scale=next;queue();}
  function moveTo(toScale,toX=0,toY=0){
    stop();toScale=clamp(toScale,1,maximum());if(reduced.matches){scale=toScale;x=toX;y=toY;queue();return;}
    glide={scale,x,y,toScale,toX,toY,time:performance.now()};queue();
  }
  function local(event){const box=viewport.getBoundingClientRect();return {x:event.clientX-box.left-width/2,y:event.clientY-box.top-height/2};}
  function coordinate(point){return {x:((point.x-x)/scale/bw+.5)*100,y:((point.y-y)/scale/bh+.5)*100};}
  function cursor(event){
    const target=coordinate(local(event)),inside=target.x>=0&&target.x<=100&&target.y>=0&&target.y<=100;
    if(mouse){mouse.hidden=!inside;if(inside){mouse.style.left=`${target.x}%`;mouse.style.top=`${target.y}%`;mouse.textContent=`${target.x.toFixed(1)} / ${target.y.toFixed(1)}`;}}
    if(inside)readout.textContent=`${target.x.toFixed(1)} / ${target.y.toFixed(1)}`;
    section.dispatchEvent?.(new CustomEvent('mtrp:mapcursor',{detail:inside?target:null}));
  }
  window.MT_CITY_MAP={pointAt:event=>coordinate(local(event)),viewport,world,get maxZoom(){return maximum();}};
  function signal(point){
    const target=coordinate(point);if(target.x<0||target.x>100||target.y<0||target.y>100)return;
    ping.style.left=`${target.x}%`;ping.style.top=`${target.y}%`;ping.hidden=false;
    ping.getAnimations().forEach(a=>a.cancel());
    if(!reduced.matches)ping.animate([{opacity:1,transform:'translate(-50%,-50%) scale(.2)'},{opacity:0,transform:'translate(-50%,-50%) scale(2.8)'}],{duration:1100,easing:'ease-out',fill:'forwards'});
    readout.textContent=`${target.x.toFixed(1).padStart(4,'0')} / ${target.y.toFixed(1).padStart(4,'0')}`;
  }
  function gesture(){
    const points=[...pointers.values()];if(points.length<2){pinch=null;return;}
    const [a,b]=points,mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance=Math.hypot(a.x-b.x,a.y-b.y);
    if(pinch){const old=scale;scale=clamp(scale*distance/Math.max(1,pinch.distance),1,maximum());x=mid.x-(pinch.mid.x-x)*scale/old;y=mid.y-(pinch.mid.y-y)*scale/old;queue();}
    pinch={mid,distance};
  }
  viewport.addEventListener('pointerdown',event=>{
    if(viewport.dataset.mode&&viewport.dataset.mode!=='pan')return;
    if(event.target.closest('button,input,select,.tactical-tools,.tactical-status')||event.button!==0)return;
    stop();const point=local(event);pointers.set(event.pointerId,point);travel=0;
    viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');
    if(pointers.size>1){travel=10;gesture();}
  });
  viewport.addEventListener('pointermove',event=>{
    cursor(event);
    if(!pointers.has(event.pointerId))return;
    const point=local(event),previous=pointers.get(event.pointerId);pointers.set(event.pointerId,point);
    const dx=point.x-previous.x,dy=point.y-previous.y;travel+=Math.hypot(dx,dy);
    if(pointers.size>1){gesture();return;}x+=dx;y+=dy;queue();
  });
  function end(event){
    if(!pointers.has(event.pointerId))return;
    if(event.type==='pointerup'&&travel<6&&pointers.size===1)signal(local(event));
    pointers.delete(event.pointerId);pinch=null;
    if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
    if(!pointers.size)viewport.classList.remove('is-dragging');else travel=10;
  }
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',event=>{pointers.delete(event.pointerId);if(!pointers.size)viewport.classList.remove('is-dragging');});
  viewport.addEventListener('pointerleave',()=>{if(mouse)mouse.hidden=true;section.dispatchEvent?.(new CustomEvent('mtrp:mapcursor',{detail:null}));});
  // A modifier keeps ordinary page scrolling available over this large section.
  viewport.addEventListener('wheel',event=>{
    if(!event.altKey||event.ctrlKey||event.metaKey)return;
    event.preventDefault();event.stopPropagation();const point=local(event);
    zoom(scale*Math.exp(-event.deltaY*(event.deltaMode===1?.025:.0015)),point.x,point.y);
  },{passive:false});
  viewport.addEventListener('keydown',event=>{
    if(event.target!==viewport||event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.key==='+'||event.key==='=')zoom(scale+.3);
    else if(event.key==='-')zoom(scale-.3);
    else if(event.key==='Home'||event.key==='0')moveTo(1);
    else if(event.key.startsWith('Arrow')){stop();const d=40; if(event.key==='ArrowLeft')x+=d;else if(event.key==='ArrowRight')x-=d;else if(event.key==='ArrowUp')y+=d;else if(event.key==='ArrowDown')y-=d;queue();}
    else return;event.preventDefault();
  });
  section.querySelectorAll('[data-map-action]').forEach(button=>button.addEventListener('click',()=>{
    const action=button.dataset.mapAction;if(action==='reset')moveTo(1);else zoom(scale+(action==='in'?.4:-.4));
  }));
  // Confirmed server locations can be added without changing interaction code.
  const list=section.querySelector('.map-location-list');
  function selectLocation(location){
    title.textContent=location.name;description.textContent=location.description;locationLabel.textContent=location.label||'LOCATION';
    const photo=section.querySelector('.map-location-photo');photo.hidden=!location.image;if(location.image){photo.src=location.image;photo.alt=location.name;}
    section.querySelectorAll('[data-map-location]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapLocation===location.id)));
    const targetScale=2.2;moveTo(targetScale,-(location.x/100-.5)*bw*targetScale,-(location.y/100-.5)*bh*targetScale);
  }
  locations.filter(location=>Number.isFinite(location.x)&&Number.isFinite(location.y)&&location.x>=0&&location.x<=100&&location.y>=0&&location.y<=100).forEach(location=>{
    const marker=document.createElement('button');marker.type='button';marker.className='map-marker';marker.dataset.mapLocation=location.id;marker.style.left=`${location.x}%`;marker.style.top=`${location.y}%`;marker.setAttribute('aria-label',location.name);marker.setAttribute('aria-pressed','false');marker.innerHTML=`<i aria-hidden="true"></i><span>${escape(location.name)}</span>`;
    marker.addEventListener('click',()=>selectLocation(location));world.append(marker);
    const button=document.createElement('button');button.type='button';button.dataset.mapLocation=location.id;button.textContent=location.name;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectLocation(location));list.append(button);
  });
  list.hidden=!locations.length;
  function visibility(){section.classList.toggle('map-running',visible&&!document.hidden&&!reduced.matches&&!document.querySelector('dialog[open]')&&!document.body.classList.contains('menu-open'));}
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visibility();},{threshold:.1});observer.observe(section);
  const resize=new ResizeObserver(measure);resize.observe(viewport);image.addEventListener('load',measure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();visibility();});
  document.addEventListener('mtrp:dossierstate',visibility);document.addEventListener('mtrp:menuchange',visibility);reduced.addEventListener('change',()=>{stop();visibility();queue();});
  addEventListener('pagehide',()=>{disposed=true;stop();cancelAnimationFrame(frame);frame=0;pointers.clear();viewport.classList.remove('is-dragging');section.classList.remove('map-running');});
  addEventListener('pageshow',()=>{disposed=false;measure();visibility();});
  measure();
})();
