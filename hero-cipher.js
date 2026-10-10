(() => {
  'use strict';
  const hero=document.querySelector('#home');
  const targets=[...document.querySelectorAll('.headline-line,.story-eyebrow,.story-heading h2,.story-heading p,.memory-eyebrow,.memories-heading h2,.memories-intro p')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const symbols=['+','*','-','_','?','/','\\',':','#','\u00d7'];
  const jobs=new Map(),sealed=new Set();let frame=0,heroBlocked=false,arrivalPlayed=false;
  const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  function clear(target){const job=jobs.get(target);if(!job)return;job.overlay.remove();target.classList.remove('is-decoding');jobs.delete(target);}
  function stop(onlyHero=false){
    for(const [target,job] of jobs)if(!onlyHero||job.isHero)clear(target);
    if(!jobs.size){cancelAnimationFrame(frame);frame=0;}
  }
  function tick(now){
    frame=0;if(document.hidden){stop();return;}if(reduced.matches)return;
    for(const [target,job] of jobs){
      if(target.firstChild!==job.source||now-job.start>=job.duration||(job.isHero&&(heroBlocked||hero.dataset.transitioning==='true'))){clear(target);continue;}
      if(now<job.start)continue;
      if(now-job.last<(job.persistent?110:40))continue;job.last=now;
      const progress=job.persistent?0:Math.max(0,Math.min(1,((now-job.start)/job.duration-.20)/.72));
      const hidden=(100-progress*100).toFixed(2)+'%';
      job.resolved.style.clipPath=job.rtl?`inset(0 0 0 ${hidden})`:`inset(0 ${hidden} 0 0)`;
      for(const slot of job.glyphs){
        if(progress>=slot.threshold){slot.node.style.opacity='0';continue;}
        const next=symbols[Math.floor(Math.random()*symbols.length)];
        if(slot.node.textContent!==next)slot.node.textContent=next;
      }
    }
    if(jobs.size)frame=requestAnimationFrame(tick);
  }
  function begin(target,event={},options={}){
    const isHero=!!hero?.contains(target);
    if(jobs.get(target)?.automatic&&!options.automatic)return;
    if((!options.automatic&&!options.persistent&&(event.pointerType==='touch'||!fine.matches))||(reduced.matches&&!options.persistent)||document.hidden||(isHero&&(heroBlocked||hero.dataset.transitioning==='true'))||(!options.automatic&&document.body.classList.contains('intro-active'))||document.body.classList.contains('menu-open'))return;
    clear(target);
    const source=target.firstChild;if(!source)return;
    const bounds=target.getBoundingClientRect(),rtl=getComputedStyle(target).direction==='rtl',slots=[];
    const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);let text;
    // Measure graphemes including nested emphasis, wrapped lines and Arabic marks.
    while((text=walker.nextNode())){
      const size=parseFloat(getComputedStyle(text.parentElement).fontSize);
      const chunks=segmenter?[...segmenter.segment(text.data)]:Array.from(text.data,(segment,index)=>({segment,index}));
      for(const {segment,index} of chunks){
        if(/^\s+$/.test(segment))continue;
        const range=document.createRange();range.setStart(text,index);range.setEnd(text,index+segment.length);
        const rect=range.getBoundingClientRect();if(!rect.width||!rect.height)continue;
        const left=rect.left-bounds.left;
        slots.push({left,top:rect.top-bounds.top,width:rect.width,height:rect.height,size,threshold:Math.max(0,Math.min(1,rtl?1-(left+rect.width/2)/bounds.width:(left+rect.width/2)/bounds.width))});
      }
    }
    if(!slots.length)return;
    const overlay=document.createElement('span');overlay.className=options.automatic?'cipher-overlay cipher-arrival':'cipher-overlay';overlay.setAttribute('aria-hidden','true');
    // Reveal a complete copy, not isolated Arabic letters: joining and diacritics
    // remain native to the browser's text shaping, including original <br>/<em>.
    const resolved=document.createElement('span');resolved.className='cipher-resolved';resolved.innerHTML=target.innerHTML;resolved.style.clipPath='inset(0 100% 0 0)';overlay.append(resolved);
    const glyphs=slots.map(slot=>{
      const node=document.createElement('span');node.className='cipher-glyph';
      Object.assign(node.style,{left:`${slot.left}px`,top:`${slot.top}px`,width:`${slot.width}px`,height:`${slot.height}px`,fontSize:`${slot.size*.77}px`});
      node.textContent=symbols[Math.floor(Math.random()*symbols.length)];overlay.append(node);return {node,threshold:slot.threshold};
    });
    target.append(overlay);target.classList.add('is-decoding');
    if(options.persistent)resolved.style.visibility='hidden';
    jobs.set(target,{source,overlay,resolved,glyphs,rtl,isHero,persistent:!!options.persistent,automatic:!!options.automatic,start:performance.now()+(options.delay||0),duration:options.persistent?Infinity:options.automatic?1700:900,last:-Infinity});
    if(!frame&&!reduced.matches)frame=requestAnimationFrame(tick);
  }
  function refreshSealed(){for(const target of sealed)begin(target,{}, {persistent:true});}
  document.addEventListener('mtrp:cipherseal',event=>{
    for(const target of event.detail.targets){
      if(event.detail.enabled){sealed.add(target);target.classList.add('cipher-target');begin(target,{}, {persistent:true});}
      else{sealed.delete(target);clear(target);}
    }
    if(!jobs.size){cancelAnimationFrame(frame);frame=0;}
  });
  targets.forEach(target=>{target.classList.add('cipher-target');target.addEventListener('pointerenter',event=>begin(target,event));});
  document.addEventListener('mtrp:introreveal',()=>{
    if(arrivalPlayed)return;arrivalPlayed=true;
    targets.filter(target=>hero?.contains(target)).forEach((target,index)=>begin(target,{}, {automatic:true,delay:index*85}));
  });
  document.addEventListener('mtrp:chapterstate',event=>{heroBlocked=event.detail.active;if(heroBlocked)stop(true);});
  document.addEventListener('mtrp:scenewillchange',()=>stop(true));
  document.addEventListener('mtrp:introstate',event=>{if(event.detail.active)stop();});
  document.addEventListener('mtrp:menuchange',event=>{if(event.detail.open)stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else refreshSealed();});
  reduced.addEventListener('change',()=>{stop();refreshSealed();});fine.addEventListener('change',()=>{stop();refreshSealed();});
  addEventListener('resize',()=>{stop();refreshSealed();});addEventListener('pagehide',()=>{stop();sealed.clear();});
})();
