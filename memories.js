(() => {
  'use strict';
  const section = document.querySelector('.memories-section');
  const group = section.querySelector('.memory-group');
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden','true');
  duplicate.querySelectorAll('button').forEach(button => button.tabIndex = -1);
  section.querySelector('.memory-track').append(duplicate);
  const observer = new IntersectionObserver(entries => section.classList.toggle('is-offscreen',!entries[0].isIntersecting));
  observer.observe(section);

  // A fixed short thumb preserves dragging, track clicks and keyboard scrolling.
  const bar = document.createElement('div');
  bar.className = 'page-scrollbar'; bar.tabIndex = 0;
  bar.setAttribute('role','scrollbar'); bar.setAttribute('aria-label','تمرير الصفحة');
  bar.setAttribute('aria-controls','main'); bar.setAttribute('aria-orientation','vertical');
  bar.setAttribute('aria-valuemin','0'); bar.setAttribute('aria-valuemax','100');
  const thumb = document.createElement('span'); thumb.className = 'page-scroll-thumb';
  bar.append(thumb); document.body.append(bar); document.documentElement.classList.add('custom-scrollbar');
  let scrollFrame = 0, grab = null;
  const maxScroll = () => Math.max(0,document.documentElement.scrollHeight-innerHeight);
  function updateBar() {
    scrollFrame = 0;
    const max = maxScroll(), travel = Math.max(0,bar.clientHeight-thumb.offsetHeight);
    const ratio = max ? Math.max(0,Math.min(1,scrollY/max)) : 0;
    bar.hidden = !max; thumb.style.transform = `translateY(${ratio*travel}px)`;
    bar.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
  }
  function queueBar() {if (!scrollFrame) scrollFrame = requestAnimationFrame(updateBar);}
  addEventListener('scroll',queueBar,{passive:true}); addEventListener('resize',queueBar);
  new ResizeObserver(queueBar).observe(document.body); updateBar();
  function scrollFromPointer(event) {
    const travel = bar.clientHeight-thumb.offsetHeight;
    const ratio = Math.max(0,Math.min(1,(event.clientY-bar.getBoundingClientRect().top-grab)/travel));
    scrollTo({top:ratio*maxScroll(),behavior:'instant'});
  }
  bar.addEventListener('pointerdown',event => {
    if(event.button !== 0) return;
    event.preventDefault(); bar.focus({preventScroll:true});
    const rect = thumb.getBoundingClientRect();
    grab = event.clientY >= rect.top && event.clientY <= rect.bottom ? event.clientY-rect.top : rect.height/2;
    bar.setPointerCapture(event.pointerId); scrollFromPointer(event);
  });
  bar.addEventListener('pointermove',event => {if(grab !== null) scrollFromPointer(event);});
  bar.addEventListener('pointerup',()=>{grab=null;}); bar.addEventListener('lostpointercapture',()=>{grab=null;});
  bar.addEventListener('keydown',event => {
    const keys = {ArrowDown:80,ArrowUp:-80,PageDown:innerHeight*.85,PageUp:-innerHeight*.85,Home:-maxScroll(),End:maxScroll()};
    if (!(event.key in keys)) return;
    event.preventDefault(); scrollTo({top:Math.max(0,Math.min(maxScroll(),scrollY+keys[event.key])),behavior:'instant'});
  });

  // Keep the native cursor. A small orange satellite follows it with a fading trail.
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canvas = document.createElement('canvas'); canvas.className = 'cursor-trail'; canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let x=0,y=0,tx=0,ty=0,visible=false,raf=0,last=0,points=[],radius=3.5,targetRadius=3.5;
  function updateTarget(element) {
    targetRadius = element instanceof Element && element.closest('a,button:not(:disabled),[role="button"],[role="scrollbar"],summary,input,select,textarea,video') ? 17 : 3.5;
    if (visible && !raf) raf = requestAnimationFrame(draw);
  }
  document.addEventListener('pointerover',event=>updateTarget(event.target),{passive:true});
  document.addEventListener('scroll',()=>{if(visible) updateTarget(document.elementFromPoint(tx,ty));},{passive:true,capture:true});
  function resizeTrail() {const dpr=Math.min(devicePixelRatio||1,2); canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function clearTrail() {visible=false;points=[];cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,innerWidth,innerHeight);}
  function draw(now) {
    raf=0;
    if(!visible || motion.matches || !fine.matches) return clearTrail();
    const dt=Math.min(40,now-last||16);last=now;
    const ease=1-Math.exp(-dt/95); x+=(tx-x)*ease; y+=(ty-y)*ease;
    radius+=(targetRadius-radius)*(1-Math.exp(-dt/90));
    if(!points.length || Math.hypot(x-points[points.length-1].x,y-points[points.length-1].y)>.45) points.push({x,y,t:now});
    points=points.filter(p=>now-p.t<520);
    ctx.clearRect(0,0,innerWidth,innerHeight);ctx.lineWidth=1;ctx.lineCap='round';
    for(let i=1;i<points.length;i++) {ctx.strokeStyle=`rgba(255,114,36,${.65*Math.max(0,1-(now-points[i].t)/520)})`;ctx.beginPath();ctx.moveTo(points[i-1].x,points[i-1].y);ctx.lineTo(points[i].x,points[i].y);ctx.stroke();}
    const expanded=Math.max(0,Math.min(1,(radius-3.5)/13.5));
    ctx.fillStyle=`rgba(255,120,40,${1-expanded*.93})`;ctx.strokeStyle='#ff8b42';ctx.shadowColor='#ff782850';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    if(Math.hypot(tx-x,ty-y)>.1 || points.length>1 || Math.abs(radius-targetRadius)>.05) raf=requestAnimationFrame(draw);
  }
  document.addEventListener('pointermove',event => {
    if(event.pointerType==='touch' || motion.matches || !fine.matches) return;
    tx=event.clientX;ty=event.clientY;
    updateTarget(event.target);
    if(!visible){x=tx;y=ty;visible=true;last=performance.now();}
    if(!raf) raf=requestAnimationFrame(draw);
  },{passive:true});
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget)clearTrail();});
  addEventListener('blur',clearTrail);addEventListener('resize',resizeTrail);
  motion.addEventListener('change',clearTrail);fine.addEventListener('change',clearTrail);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTrail();});
  // Native modal dialogs live above ordinary z-index layers.
  const dialogObserver = new MutationObserver(() => {
    const host=document.querySelector('dialog[open]')||document.body;
    if(canvas.parentElement!==host) host.append(canvas);
  });
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
  resizeTrail();
})();

