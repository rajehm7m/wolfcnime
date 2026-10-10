(() => {
  'use strict';
  const sections=['#stories','#memories','#city-map','#connect','#evolution','#partners','footer'];
  const prepared=new Map(),pending=new WeakMap();
  const idle=()=>new Promise(resolve=>window.requestIdleCallback?window.requestIdleCallback(resolve,{timeout:650}):setTimeout(resolve,40));
  function imageReady(image,priority='low'){
    if(pending.has(image))return pending.get(image);
    const promise=new Promise(resolve=>{
      let done=false,timer;
      const finish=()=>{if(done)return;done=true;clearTimeout(timer);image.removeEventListener('load',loaded);image.removeEventListener('error',finish);resolve();};
      const loaded=()=>Promise.resolve(image.decode?.()).catch(()=>{}).finally(finish);
      image.decoding='async';image.fetchPriority=priority;
      image.addEventListener('load',loaded,{once:true});image.addEventListener('error',finish,{once:true});
      timer=setTimeout(finish,12000); // One failed asset must not block later sections.
      if(image.dataset.src){image.loading='eager';image.src=image.dataset.src;delete image.dataset.src;}
      if(image.complete&&image.naturalWidth)loaded();
    });
    pending.set(image,promise);return promise;
  }
  const domReady=new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  const audio=document.querySelector('#brand-audio');
  const audioReady=new Promise(resolve=>{
    if(!audio||audio.readyState>=3){resolve();return;}
    const timer=setTimeout(done,3500);
    function done(){clearTimeout(timer);audio.removeEventListener('canplay',done);audio.removeEventListener('error',done);resolve();}
    audio.addEventListener('canplay',done,{once:true});audio.addEventListener('error',done,{once:true});
  });
  const introReady=Promise.allSettled([
    document.fonts.load('16px Serpentine'),
    audioReady,...[...document.querySelectorAll('#intro .intro-logo')].map(image=>imageReady(image,'high'))
  ]);
  const heroReady=Promise.allSettled([introReady,domReady]).then(async()=>{
    const images=[...document.querySelectorAll('#home img,.site-header img')].filter(image=>!image.closest('.portal-preview'));
    const first=images.filter(image=>image.closest('.character-layer.current')||image.closest('.site-header'));
    await Promise.allSettled(first.map(image=>imageReady(image,'high')));
    document.documentElement.dataset.heroReady='true';
  });
  const homeReady=heroReady.then(async()=>{
    for(const image of document.querySelectorAll('#home img[data-src]')){if(image.closest('.portal-preview'))continue;await idle();await imageReady(image,'low');}
  });
  function prepare(selector){
    if(prepared.has(selector))return prepared.get(selector);
    const section=document.querySelector(selector);if(!section)return Promise.resolve();
    const promise=(async()=>{
      const images=[...section.querySelectorAll('img[data-src]')];
      if(selector==='#stories')images.push(...document.querySelectorAll('.portal-preview img[data-src]'));
      section.dataset.assets='loading';
      // Two requests/decodes per batch, with time left for input and animation.
      for(let i=0;i<images.length;i+=2){await idle();await Promise.allSettled(images.slice(i,i+2).map(image=>imageReady(image)));}
      section.dataset.assets='ready';
    })();
    prepared.set(selector,promise);return promise;
  }
  window.MT_ASSETS={introReady,heroReady,deferImage(image,src){image.dataset.src=src;image.decoding='async';},prepare};
  async function start(){
    await homeReady;
    for(const selector of sections)await prepare(selector);
  }
  document.addEventListener('DOMContentLoaded',start,{once:true});
  // An explicit jump gets its destination ready without waiting for unrelated images.
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]'),href=link?.getAttribute('href');
    if(sections.includes(href))heroReady.then(()=>prepare(href));
  });
})();
