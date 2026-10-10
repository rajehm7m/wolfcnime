(() => {
  'use strict';
  const section=document.querySelector('#evolution'),config=window.MT_EVOLUTION;
  if(!section)return;
  if(!config?.enabled||!config.chapters?.length){section.remove();return;}
  const chapters=config.chapters;
  const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const stage=make('div','evolution-stage'),top=make('header','evolution-top'),title=make('h2','','MT / THROUGH THE YEARS');
  title.id='evolution-title';top.append(title);
  const scenes=make('div','evolution-scenes'),navigation=make('nav','evolution-nav');navigation.setAttribute('aria-label','سنوات ميستري تاون');
  const bottom=make('div','evolution-bottom'),counter=make('b','','01 / 06');
  bottom.append(make('span','','2019 — AN ONGOING STORY'),counter);
  const rail=make('div','evolution-rail'),railInk=make('span','evolution-rail-ink'),railHead=make('span','evolution-rail-head');
  rail.setAttribute('aria-hidden','true');rail.append(railInk,railHead);navigation.append(rail);
  const articles=[],buttons=[];
  chapters.forEach((chapter,index)=>{
    const number=String(index+1).padStart(2,'0'),article=make('article','era');article.id=`era-${chapter.year}`;article.dataset.motif=chapter.motif;
    article.setAttribute('aria-labelledby',`era-title-${index}`);
    const year=make('img','era-year');if(window.MT_ASSETS)window.MT_ASSETS.deferImage(year,`assets/images/era-${chapter.year}.svg`);else year.src=`assets/images/era-${chapter.year}.svg`;year.alt='';year.setAttribute('aria-hidden','true');year.width=3200;year.height=740;
    const art=make('figure','era-art');art.setAttribute('aria-hidden','true');
    const artTop=make('div','era-art-top');
    const logo=make('img','era-logo');logo.src='assets/images/mt-logo.png';logo.alt='';logo.width=52;logo.height=42;
    artTop.append(logo);
    if(chapter.image){const photo=make('img','era-photo');if(window.MT_ASSETS)window.MT_ASSETS.deferImage(photo,chapter.image);else photo.src=chapter.image;photo.alt='';photo.loading='lazy';art.append(photo);art.classList.add('has-photo');}
    
    art.append(artTop,make('div','era-metric',chapter.metric),make('div','era-detail',chapter.detail));
    const copy=make('div','era-copy'),heading=make('h3','',chapter.title);heading.id=`era-title-${index}`;
    copy.append(make('span','era-label',chapter.label),heading,make('p','',chapter.text),make('div','era-copy-foot',chapter.tag));
    article.append(year,art,copy);scenes.append(article);articles.push(article);
    const button=make('button','era-jump',chapter.label);button.type='button';button.setAttribute('aria-label',`${chapter.label}: ${chapter.title}`);button.setAttribute('aria-controls',article.id);
    button.append(make('small','',number));
    button.addEventListener('click',()=>go(index));navigation.append(button);buttons.push(button);
  });
  stage.append(top,scenes,navigation,bottom);section.append(stage);section.hidden=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width: 1000px) and (min-height: 700px)');
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=n=>n*n*(3-2*n);
  let pinned=false,layout=null,frame=0,disposed=false,active=-1;
  const cache=new WeakMap();
  function prop(node,key,value){let values=cache.get(node);if(!values){values={};cache.set(node,values);}value=String(value);if(values[key]!==value){values[key]=value;node.style.setProperty(key,value);}}
  function select(index){
    if(active===index)return;active=index;
    articles.forEach((article,i)=>{article.classList.toggle('is-current',i===index);article.inert=pinned&&i!==index;if(pinned&&i!==index)article.setAttribute('aria-hidden','true');else article.removeAttribute('aria-hidden');buttons[i].setAttribute('aria-current',String(i===index));});
    counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}`;
  }
  function measure(){
    if(disposed)return;
    pinned=wide.matches&&!reduced.matches;active=-1;
    const step=innerHeight*.88,lead=innerHeight*.16,tail=innerHeight*.2;
    prop(section,'--evolution-height',`${innerHeight+lead+(chapters.length-1)*step+tail}px`);
    section.classList.toggle('is-pinned',pinned);
    const start=section.getBoundingClientRect().top+scrollY;
    layout={start,step,lead,positions:articles.map(article=>article.getBoundingClientRect().top+scrollY)};
    if(!pinned)articles.forEach(article=>{article.inert=false;article.removeAttribute('aria-hidden');});
    queue();
  }
  function render(){
    frame=0;if(!layout||disposed||document.hidden)return;
    if(!pinned){let index=0;layout.positions.forEach((y,i)=>{if(scrollY+innerHeight*.5>=y)index=i;});select(index);prop(navigation,'--timeline-progress',index/Math.max(1,chapters.length-1));return;}
    const position=clamp((scrollY-layout.start-layout.lead)/layout.step,0,chapters.length-1);
    // Each chapter holds still before the next one arrives. Reverse scroll uses
    // identical geometry and never restarts a timer or an animation timeline.
    const base=Math.floor(position),fraction=position-base,mix=ease(clamp((fraction-.36)/.64));
    select(Math.min(chapters.length-1,base+(mix>=.5?1:0)));
    // The rail follows the very same chapter blend: no one-segment lead.
    prop(navigation,'--timeline-progress',((base+mix)/Math.max(1,chapters.length-1)).toFixed(5));
    articles.forEach((article,index)=>{
      const outgoing=index===base,incoming=index===base+1,visible=outgoing||incoming&&mix>0;
      article.classList.toggle('is-visible',visible);
      if(visible){
        const phase=outgoing?-mix:1-mix;
        prop(article,'--era-ink',(outgoing?1-mix:mix).toFixed(4));
        const contentBlend=ease(clamp((mix-.38)/.24));
        const contentInk=outgoing?1-contentBlend:contentBlend;
        prop(article,'--content-ink',contentInk.toFixed(4));
        prop(article,'--art-shift',`${(phase*32).toFixed(2)}px`);
        prop(article,'--copy-shift',`${(phase*24).toFixed(2)}px`);
        prop(article,'--year-shift',`${(phase*65).toFixed(2)}px`);
      }

    });
  }
  function queue(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(render);}
  function go(index){
    if(!layout)return;
    const top=pinned?layout.start+layout.lead+index*layout.step:layout.positions[index]-90;
    scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
  }
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',measure);
  document.addEventListener('visibilitychange',queue);
  reduced.addEventListener('change',measure);wide.addEventListener('change',measure);
  // chapters.js rearranges the closing sections synchronously after this script.
  // A single body resize observer refreshes cached offsets when earlier content grows.
  const sizing=new ResizeObserver(measure);sizing.observe(document.body);
  document.fonts?.ready.then(measure);
  addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);frame=0;sizing.disconnect();});
  addEventListener('pageshow',()=>{disposed=false;sizing.observe(document.body);measure();});
  measure();requestAnimationFrame(measure);
})();
