(() => {
  'use strict';
  const rail=document.querySelector('#evolution .evolution-rail');if(!rail)return;
  const nav=document.querySelector('#evolution .evolution-nav'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');canvas.className='timeline-electricity';canvas.setAttribute('aria-hidden','true');rail.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  let width=0,visible=false,timer=0,frame=0,burst=null,last=0,paths=[];
  const random=(a,b)=>a+Math.random()*(b-a);
  const allowed=()=>visible&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('menu-open')&&!document.querySelector('dialog[open]');
  function clear(){clearTimeout(timer);cancelAnimationFrame(frame);timer=frame=0;burst=null;ctx.clearRect(0,0,width,64);}
  function schedule(){clearTimeout(timer);if(allowed())timer=setTimeout(()=>ignite(),random(1900,3500));}
  function measure(){clear();width=rail.getBoundingClientRect().width;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.ceil(width*dpr);canvas.height=64*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
  function pattern(){
    paths=[];const center=burst.x,length=Math.min(width*.42,random(90,190)),start=Math.max(0,Math.min(width-length,center-length/2));
    const main=[];
    for(let i=0;i<=18;i++)main.push([start+i/18*length,32+(i===0||i===18?0:random(-5,5))]);
    paths.push(main);
    for(let branch=0;branch<3;branch++){const [x,y]=main[3+branch*5];paths.push([[x,y],[x+random(-6,6),y-6],[x+random(-8,8),y+random(-20,20)],[x+random(-13,13),y+random(-24,24)]]);}
  }
  function draw(now){
    frame=0;if(!allowed()){clear();return;}
    const age=now-burst.start;ctx.clearRect(0,0,width,64);
    if(age>=390){burst=null;schedule();return;}
    if(now-last>70){pattern();last=now;}
    const strength=Math.sin(Math.PI*age/390);ctx.lineJoin='round';ctx.lineCap='round';
    for(const [color,line,opacity] of [['#ff6c17',7,.1],['#ff983f',3,.4],['#ffe1b7',.9,1]]){
      ctx.strokeStyle=color;ctx.lineWidth=line;ctx.globalAlpha=strength*opacity;
      for(const path of paths){ctx.beginPath();path.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
    }
    ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
  }
  function ignite(button){
    if(!allowed()||width<1)return;clearTimeout(timer);
    let x=random(width*.08,width*.92);
    if(button){const a=button.getBoundingClientRect(),b=rail.getBoundingClientRect();x=Math.max(0,Math.min(width,a.left+a.width/2-b.left));}
    burst={x,start:performance.now()};last=-Infinity;if(!frame)frame=requestAnimationFrame(draw);
  }
  function sync(){if(allowed())schedule();else clear();}
  nav.querySelectorAll('.era-jump').forEach(button=>{button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')ignite(button);});button.addEventListener('focus',()=>ignite(button));button.addEventListener('click',()=>ignite(button));});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0}).observe(nav);
  new ResizeObserver(measure).observe(rail);
  document.addEventListener('visibilitychange',sync);document.addEventListener('mtrp:menuchange',sync);document.addEventListener('close',sync,true);reduced.addEventListener('change',sync);
  addEventListener('pagehide',clear);addEventListener('pageshow',sync);measure();
})();
