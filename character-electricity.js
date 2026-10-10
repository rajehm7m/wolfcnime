(() => {
  'use strict';
  const dock=document.querySelector('.hero-bottom');if(!dock)return;
  const cards=[...dock.querySelectorAll('.character-choice')];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');canvas.className='character-electricity';canvas.setAttribute('aria-hidden','true');dock.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  let frame=0,timer=0,visible=false,chapter=false,intro=document.body.classList.contains('intro-active'),menu=false,burst=null,lastPattern=0,paths=[],width=0,height=0;
  const allowed=()=>visible&&!document.hidden&&!motion.matches&&!chapter&&!intro&&!menu;
  const random=(a,b)=>a+Math.random()*(b-a);
  function clear(){cancelAnimationFrame(frame);clearTimeout(timer);frame=timer=0;burst=null;paths=[];ctx.clearRect(0,0,width,height);}
  function resize(){const rect=dock.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);width=rect.width+24;height=rect.height+24;canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function schedule(){clearTimeout(timer);if(allowed())timer=setTimeout(()=>ignite(cards.find(card=>card.classList.contains('active'))),random(3600,6200));}
  function zigzag(x,y,dx,dy,length){
    const points=[[x,y]],steps=7;
    for(let i=1;i<=steps;i++){const t=i/steps,jitter=random(-7,7)*Math.sin(Math.PI*t);points.push([x+dx*length*t-dy*jitter,y+dy*length*t+dx*jitter]);}
    return points;
  }
  function build(){
    paths=[];const {x,y,w,h}=burst;
    for(let i=0;i<3;i++){
      const top=Math.random()>.5,edge=y+(top?2:h-2),dir=Math.random()>.5?1:-1,length=random(18,Math.min(62,w*.35));
      const start=x+(dir>0?random(12,w-length-12):random(length+12,w-12));
      const points=zigzag(start,edge,dir,top?-.08:.08,length);paths.push(points);
      const junction=points[3];paths.push(zigzag(junction[0],junction[1],dir*.45,top?-1:1,random(8,17)));
    }
  }
  function draw(now){
    frame=0;if(!allowed()||!burst){clear();return;}
    const age=now-burst.start;
    ctx.clearRect(0,0,width,height);
    if(age>430){burst=null;schedule();return;}
    if(now-lastPattern>65){build();lastPattern=now;}
    const envelope=Math.sin(Math.PI*Math.min(1,age/430));
    ctx.lineJoin='round';ctx.lineCap='round';
    for(const [stroke,lineWidth,alpha] of [['#ff650d',7,.10],['#ff871f',3,.35],['#ffd29a',1,1]]){
      ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.globalAlpha=envelope*alpha;
      for(const points of paths){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
    }
    ctx.globalAlpha=envelope;ctx.fillStyle='#ffe3af';
    for(const points of paths){const [x,y]=points.at(-1);ctx.fillRect(x-1,y-1,1.5,1.5);}
    ctx.globalAlpha=1;frame=requestAnimationFrame(draw);
  }
  function ignite(card){
    if(!card||!allowed())return;
    clearTimeout(timer);const base=dock.getBoundingClientRect(),rect=card.getBoundingClientRect();
    burst={x:rect.left-base.left+12,y:rect.top-base.top+12,w:rect.width,h:rect.height,start:performance.now()};lastPattern=-Infinity;
    if(!frame)frame=requestAnimationFrame(draw);
  }
  function sync(){if(!allowed())clear();else schedule();}
  cards.forEach(card=>{card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')ignite(card);});card.addEventListener('focus',()=>ignite(card));});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.4}).observe(dock);
  document.addEventListener('mtrp:scenechange',()=>ignite(cards.find(card=>card.classList.contains('active'))));
  document.addEventListener('mtrp:chapterstate',event=>{chapter=event.detail.active;sync();});
  document.addEventListener('mtrp:introstate',event=>{intro=event.detail.active;sync();});
  document.addEventListener('mtrp:menuchange',event=>{menu=event.detail.open;sync();});
  document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
  addEventListener('resize',()=>{clear();resize();sync();});addEventListener('pagehide',clear);addEventListener('pageshow',sync);
  resize();
})();
