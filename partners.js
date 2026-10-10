(() => {
  const section=document.querySelector('#partners');if(!section)return;
  const grid=section.querySelector('.partners-grid'),marks=[...grid.querySelectorAll('.partner-mark')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;
  for(const [index,items] of [marks.slice(0,6),marks.slice(6)].entries()){
    const row=document.createElement('div');row.className=`partner-row partner-row-${index+1}`;
    const track=document.createElement('div');track.className='partner-track';
    const run=document.createElement('div');run.className='partner-run';run.append(...items);
    const copy=run.cloneNode(true);copy.classList.add('partner-copy');copy.setAttribute('aria-hidden','true');
    copy.querySelectorAll('button').forEach(button=>button.tabIndex=-1);
    track.append(run,copy);row.append(track);grid.append(row);
  }
  section.querySelectorAll('.partner-mark').forEach(mark=>mark.addEventListener('click',()=>mark.setAttribute('aria-pressed',String(mark.getAttribute('aria-pressed')!=='true'))));
  function sync(){section.classList.toggle('partners-running',visible&&!document.hidden&&!reduced.matches&&!document.body.classList.contains('menu-open'));}
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);if(visible)section.classList.add('is-visible');sync();},{threshold:.05});
  observer.observe(section);
  document.addEventListener('visibilitychange',sync);document.addEventListener('mtrp:menuchange',sync);reduced.addEventListener('change',sync);
  addEventListener('pagehide',()=>section.classList.remove('partners-running'));addEventListener('pageshow',sync);
})();
