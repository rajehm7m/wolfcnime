(() => {
  'use strict';
  const wordmark=document.querySelector('.wordmark-art');
  if(!wordmark)return;
  const glyphs=[...wordmark.querySelectorAll('.wordmark-glyph')];
  if(!glyphs.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,revealed=true,timer=0,release=0,active=[],last=-1;
  function stop(){
    clearTimeout(timer);clearTimeout(release);timer=release=0;
    active.forEach(glyph=>glyph.classList.remove('is-auto-filled'));active=[];
  }
  function schedule(delay=2600+Math.random()*2200){
    clearTimeout(timer);
    if(!visible||!revealed||document.hidden||reduced.matches)return;
    timer=setTimeout(()=>{
      let index=Math.floor(Math.random()*glyphs.length);
      if(index===last)index=(index+1)%glyphs.length;
      last=index;
      // A rotated, spaced group keeps five letters distributed across both words.
      active=Array.from({length:Math.min(5,glyphs.length)},(_,offset)=>glyphs[(index+offset*2)%glyphs.length]);
      active.forEach(glyph=>glyph.classList.add('is-auto-filled'));
      release=setTimeout(()=>{active.forEach(glyph=>glyph.classList.remove('is-auto-filled'));active=[];release=0;},850);
      schedule();
    },delay);
  }
  function sync(){stop();schedule(900);}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.15}).observe(wordmark);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('mtrp:footerreveal',event=>{revealed=event.detail.visible;sync();});
  reduced.addEventListener('change',sync);
  addEventListener('pagehide',stop);
  addEventListener('pageshow',sync);
  const brand=document.querySelector('.footer-brand');
  let glitchTimer;
  function glitch(){
    if(reduced.matches)return;
    clearTimeout(glitchTimer);brand.classList.remove('is-glitching');void brand.offsetWidth;
    brand.classList.add('is-glitching');
    glitchTimer=setTimeout(()=>brand.classList.remove('is-glitching'),700);
  }
  brand?.addEventListener('pointerenter',glitch);
  brand?.addEventListener('focus',glitch);
})();
