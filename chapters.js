(() => {
  'use strict';
  const root=document.documentElement;
  const hero=document.querySelector('#home'),stories=document.querySelector('#stories'),memories=document.querySelector('#memories'),connect=document.querySelector('#connect'),footer=document.querySelector('.site-footer');
  if(!hero||!stories||!memories||!connect||!footer||!window.MT_PORTAL_SHAPES||!window.MT_HEADLINE_GLYPHS)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width: 1000px) and (min-height: 700px)');
  const clamp=v=>Math.max(0,Math.min(1,v)),range=(v,a,b)=>clamp((v-a)/(b-a)),smooth=v=>v*v*(3-2*v);
  const softFade=v=>v*v*v*(v*(v*6-15)+10);
  const written=new WeakMap();
  const property=(node,name,value)=>{let cache=written.get(node);if(!cache){cache={};written.set(node,cache);}value=String(value);if(cache[name]!==value){cache[name]=value;node.style.setProperty(name,value);}};
  const wrap=(node,className)=>{const wrapper=document.createElement('div');wrapper.className=className;node.before(wrapper);wrapper.append(node);return wrapper;};
  const heroChapter=wrap(hero,'hero-chapter');
  const stack=wrap(stories,'chapter-stack');stack.append(memories);
  const memoryChapter=wrap(memories,'memory-chapter');
  const evolution=document.querySelector('#evolution'),partners=document.querySelector('#partners');
  const closing=wrap(connect,'closing-chapters');if(evolution)closing.append(evolution);if(partners)closing.append(partners);closing.append(footer);footer.setAttribute('role','contentinfo');
  const heading=hero.querySelector('h1');
  const layer=document.createElement('div');layer.className='portal-layer';layer.setAttribute('aria-hidden','true');layer.inert=true;
  const preview=stories.cloneNode(true);preview.classList.add('portal-preview');preview.removeAttribute('id');preview.removeAttribute('aria-labelledby');preview.inert=true;
  preview.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  preview.querySelectorAll('button,a').forEach(node=>node.tabIndex=-1);
  layer.append(preview);hero.append(layer);
  const ns='http://www.w3.org/2000/svg';
  const svgNode=(name,attrs={})=>{const node=document.createElementNS(ns,name);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);return node;};
  const vector=svgNode('svg',{class:'portal-type','aria-hidden':'true',preserveAspectRatio:'none'}),camera=svgNode('g');vector.append(camera);hero.append(vector);
  const svg=svgNode('svg',{class:'chapter-definitions',width:'0',height:'0','aria-hidden':'true'}),defs=svgNode('defs');
  const aperture=svgNode('clipPath',{id:'chapter-counter',clipPathUnits:'userSpaceOnUse'}),counter=svgNode('path');
  const organic=svgNode('clipPath',{id:'memory-reveal',clipPathUnits:'userSpaceOnUse'}),edge=svgNode('path');
  aperture.append(counter);organic.append(edge);defs.append(aperture,organic);svg.append(defs);document.body.append(svg);
  const glow=svgNode('svg',{class:'memory-edge','aria-hidden':'true',preserveAspectRatio:'none'});
  const rim=svgNode('path',{id:'memory-rim',fill:'none'}),rimDefs=svgNode('defs');rimDefs.append(rim);glow.append(rimDefs);
  for(const [width,opacity,color] of [[16,.045,'#ff6818'],[8,.12,'#ff6818'],[3.5,.32,'#ff781f'],[1.3,.95,'#ffab61']])glow.append(svgNode('use',{href:'#memory-rim',stroke:color,'stroke-width':width,opacity,fill:'none','stroke-linejoin':'round','stroke-linecap':'round'}));
  memoryChapter.append(glow);
  const phases=Array.from({length:5},()=>Math.random()*Math.PI*2);
  let frame=0,layout=null,anchor=null,portalActive=false,chapterHeld=false,footerReady=true,disposed=false,geometryDirty=true,edgeRunning=false,memoryPosition=0,lastEdge=-Infinity,lastScroll=NaN;
  const enabled=()=>!reduced.matches,full=()=>enabled()&&desktop.matches;
  function footerState(ready){if(ready!==footerReady){footerReady=ready;document.dispatchEvent(new CustomEvent('mtrp:footerreveal',{detail:{visible:ready}}));}}
  function portalState(active,held=active){if(active!==portalActive){portalActive=active;hero.classList.toggle('is-portal-active',active);}if(held!==chapterHeld){chapterHeld=held;document.dispatchEvent(new CustomEvent('mtrp:chapterstate',{detail:{active:held}}));}}
  function captureLetter(){
    // Measure once, then draw font outlines in a viewport-sized SVG. Never enlarge
    // a composited DOM text texture or create a giant offscreen bitmap.
    const box=heading.getBoundingClientRect(),heroBox=hero.getBoundingClientRect();
    const candidates=[],paths=[];
    for(const line of hero.querySelectorAll('.headline-line')){
      const text=line.firstChild;if(!text||text.nodeType!==3)continue;
      const style=getComputedStyle(line),unit=parseFloat(style.fontSize)/window.MT_PORTAL_SHAPES.O.em;
      const marker=document.createElement('span');marker.className='portal-baseline';marker.setAttribute('aria-hidden','true');line.append(marker);
      const baseline=marker.getBoundingClientRect().top;marker.remove();
      for(let index=0;index<text.length;index++){
        const char=text.textContent[index],outline=window.MT_HEADLINE_GLYPHS[char];if(!outline)continue;
        const selection=document.createRange();selection.setStart(text,index);selection.setEnd(text,index+1);
        const rect=selection.getBoundingClientRect();
        paths.push(svgNode('path',{d:outline,fill:style.color,transform:`translate(${rect.left-heroBox.left} ${baseline-heroBox.top}) scale(${unit})`}));
        if(!window.MT_PORTAL_SHAPES[char])continue;
        // Favor a counter near the centre of the phrase, rather than its first letter.
        const score=Math.abs(rect.left+rect.width/2-(box.left+box.width*.42))+Math.abs(rect.top+rect.height/2-(box.top+box.height*.5))*.8;
        candidates.push({char,rect,score,unit,baseline});
      }
    }
    const selected=candidates.sort((a,b)=>a.score-b.score)[0];
    if(!selected)return null;
    const {char,rect,unit,baseline}=selected,shape=window.MT_PORTAL_SHAPES[char];
    const x=rect.left+shape.cx*unit,y=baseline+shape.cy*unit;
    const result={shape,unit,x:x-heroBox.left,y:y-heroBox.top};
    counter.setAttribute('d',shape.hole);
    camera.replaceChildren(...paths);
    return result;
  }
  function measure(){
    if(disposed)return;
    root.classList.toggle('cinema-on',enabled());root.classList.toggle('cinema-desktop',full());
    const vh=innerHeight,vw=hero.clientWidth||innerWidth,hh=hero.offsetHeight,travel=vh*1.25;
    property(root,'--hero-size',`${hh}px`);property(root,'--hero-run',`${hh+travel}px`);
    property(stack,'--story-pin',`${Math.min(0,vh-stories.offsetHeight)}px`);
    edge.setAttribute('transform',`translate(0 ${Math.max(0,stories.offsetHeight-vh)})`);
    footer.classList.toggle('footer-tall',footer.offsetHeight>vh-40);
    const heroTop=heroChapter.getBoundingClientRect().top+scrollY,mark=footer.querySelector('.footer-wordmark');
    layout={vh,vw,hh,travel,heroTop,storyOffset:Math.max(0,stories.offsetHeight-vh),markOffset:mark.offsetTop,markHeight:mark.offsetHeight};
    vector.setAttribute('viewBox',`0 0 ${vw} ${hh}`);glow.setAttribute('viewBox',`0 0 ${innerWidth} ${vh+220}`);
    glow.style.height=`${vh+220}px`;
    anchor=null;
    if(!full()){portalState(false);footerState(true);hero.style.visibility='';hero.classList.remove('is-departed','has-vector','is-portrait-muted');edgeRunning=false;memoryChapter.classList.remove('has-reveal');}
    queue();
  }
  function revealMemories(top,vh,vw,now){
    const p=clamp((vh-top)/vh);
    property(memories,'--memory-pin',`${-Math.max(0,top)}px`);
    property(glow,'--memory-pin',`${-Math.max(0,top)}px`);
    memories.classList.toggle('is-revealing',p>0&&p<1);
    memories.classList.toggle('is-covered',p===0);
    stories.classList.toggle('is-revealing',p>0&&p<1);
    stories.classList.toggle('is-reveal-complete',p===1);
    edgeRunning=p>0&&p<1;memoryChapter.classList.toggle('has-reveal',edgeRunning);
    if(!edgeRunning)return;
    // Seeded phases drift continuously: organic motion without per-frame jumps.
    if(now-lastEdge<32&&!geometryDirty)return;
    lastEdge=now;
    const centre=(1-p)*(vh+220)-110,amplitude=Math.sin(Math.PI*p);
    let contour='';const time=now*.00022;
    for(let i=0;i<=144;i++){
      const t=i/144;
      const wave=52*Math.sin(t*11+phases[0]+time)+29*Math.sin(t*27+phases[1]-time*1.4)+15*Math.sin(t*63+phases[2]+time*.8)+7*Math.sin(t*147+phases[3]-time*1.7)+3*Math.sin(t*307+phases[4]+time);
      contour+=`${i?' L':'M'} ${(t*vw).toFixed(1)} ${(centre+wave*amplitude).toFixed(1)}`;
    }
    rim.setAttribute('d',contour);
    // Clip the stationary story layer above the edge, not the moving gallery.
    // The gallery keeps its own composited scrolling layer throughout the reveal.
    edge.setAttribute('d',`${contour} L ${vw+2} ${-layout.storyOffset-2} L -2 ${-layout.storyOffset-2} Z`);
  }
  function render(now=0){
    frame=0;if(!layout||!enabled()||document.hidden)return;
    // Wheel easing can update scrollY before the browser delivers its scroll event.
    // Never draw an idle edge frame using the previous scroll position.
    if(scrollY!==lastScroll)geometryDirty=true;
    if(!geometryDirty&&edgeRunning){revealMemories(memoryPosition,layout.vh,innerWidth,now);if(edgeRunning)queue(false);return;}
    const {vh,vw,hh,travel,heroTop}=layout;
    const connectBox=connect.getBoundingClientRect(),memoryTop=memoryChapter.getBoundingClientRect().top,footerTop=footer.getBoundingClientRect().top;
    if(full()){
      const p=clamp((scrollY-heroTop)/travel),q=range(p,.09,1);
      const active=q>0&&p<1;
      // Allow an in-flight portrait change to finish before measuring its text.
      const changing=hero.dataset.transitioning==='true';
      if(active&&!anchor&&!changing)anchor=captureLetter();
      portalState(active,p>.09);
      hero.classList.toggle('has-vector',active&&!!anchor);
      hero.classList.toggle('is-departed',p===1);
      const portrait=softFade(range(q,0,.48));
      property(hero,'--portrait-ink',1-portrait);
      property(hero,'--portrait-rise',`${portrait*24}px`);
      property(hero,'--portrait-scale',1-portrait*.035);
      // Hide the expensive portrait layers only once their fade is fully finished.
      hero.classList.toggle('is-portrait-muted',portrait===1);
      if(active&&anchor){
        const {shape,unit,x,y}=anchor;
        const target=Math.max(vw/shape.width,hh/shape.height)*4;
        const zoom=Math.pow(target/unit,smooth(q));
        const pan=smooth(range(q,0,.55));
        const dx=(vw/2-x)*pan,dy=(hh/2-y)*pan;
        camera.setAttribute('transform',`translate(${x+dx} ${y+dy}) scale(${zoom}) translate(${-x} ${-y})`);
        counter.setAttribute('transform',`translate(${x+dx} ${y+dy}) scale(${unit*zoom}) translate(${-shape.cx} ${-shape.cy})`);
        property(hero,'--portal-ink',smooth(range(q,.10,.27)));
        property(hero,'--hero-ink',1-smooth(range(q,0,.25)));
      }else if(!active){
        property(hero,'--portal-ink',0);property(hero,'--hero-ink',1);
        if(p===0||p<=.09)anchor=null;
      }
      hero.style.visibility=p===1?'hidden':'';
      memoryPosition=memoryTop;revealMemories(memoryTop,vh,innerWidth,now);
      const wordmarkBottom=footerTop+layout.markOffset+layout.markHeight;
      const coverBottom=partners?partners.getBoundingClientRect().bottom:evolution&&!evolution.hidden?evolution.getBoundingClientRect().bottom:connectBox.bottom;
      const reveal=smooth(clamp((wordmarkBottom-coverBottom)/Math.max(1,layout.markHeight)));
      property(footer,'--footer-ink',.3+.7*reveal);property(footer,'--footer-rise',`${(1-reveal)*22}px`);footerState(reveal>.55);
    }else{
      hero.style.visibility='';
      const departure=smooth(clamp((scrollY-heroTop)/hh));
      property(hero,'--lite-zoom',1+departure*.05);property(hero,'--lite-ink',1-departure*.3);
      const portrait=softFade(range((scrollY-heroTop)/hh,0,.7));
      property(hero,'--portrait-ink',1-portrait);property(hero,'--portrait-rise',`${portrait*16}px`);property(hero,'--portrait-scale',1-portrait*.025);
    }
    // A continuous, quiet arrival on the same background. No detached line,
    // sweeping outline or wait for the frame to finish before showing the ticket.
    const absoluteTop=connectBox.top+scrollY;
    const start=absoluteTop-vh*.94,end=Math.max(start+1,Math.min(absoluteTop-vh*.34,root.scrollHeight-vh));
    const arrival=smooth(range(scrollY,start,end));
    property(connect,'--ticket-ink',arrival);property(connect,'--ticket-rise',`${(1-arrival)*38}px`);
    property(connect,'--ticket-scale',.975+.025*arrival);
    property(connect,'--ticket-button',smooth(range(arrival,.15,.85)));
    lastScroll=scrollY;geometryDirty=false;if(edgeRunning)queue(false);
  }
  function queue(dirty=true){if(dirty!==false)geometryDirty=true;if(!frame&&!disposed)frame=requestAnimationFrame(render);}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',measure);addEventListener('hashchange',queue);
  document.addEventListener('mtrp:scenechange',()=>{anchor=null;queue();});
  document.addEventListener('focusin',event=>{
    if(full()&&memories.contains(event.target)&&memoryChapter.getBoundingClientRect().top>0){
      memoryChapter.scrollIntoView({behavior:'instant',block:'start'});queue();
    }
  });
  document.addEventListener('mtrp:introstate',queue);document.addEventListener('visibilitychange',queue);
  reduced.addEventListener('change',measure);desktop.addEventListener('change',measure);
  const sizing=new ResizeObserver(measure);[hero,stories,memories,connect,footer].forEach(node=>sizing.observe(node));
  if(evolution)sizing.observe(evolution);
  if(partners)sizing.observe(partners);
  document.fonts?.ready.then(measure);
  addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);frame=0;});
  addEventListener('pageshow',()=>{disposed=false;measure();});
  measure();
})();
