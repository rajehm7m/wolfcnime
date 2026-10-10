(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let target = scrollY, frame = 0, previous = 0;
  const limit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  function stop() { cancelAnimationFrame(frame); frame = 0; target = scrollY; }
  function step(now) {
    const dt = Math.min(40, now - previous || 16); previous = now;
    target = Math.max(0, Math.min(limit(), target));
    const distance = target - scrollY;
    if (Math.abs(distance) < .8) { scrollTo({top:target,behavior:'instant'}); frame = 0; return; }
    scrollTo({top:scrollY + distance * (1 - Math.exp(-dt / 115)),behavior:'instant'});
    frame = requestAnimationFrame(step);
  }
  addEventListener('wheel', event => {
    if (reduced.matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.defaultPrevented || !event.cancelable) return;
    if (document.body.matches('.intro-active,.menu-open,.story-open,.memory-open,.dossier-open')) {stop();return;}
    // Nested content, controls and native modal scrolling keep their own behaviour.
    for(let node = event.target instanceof Element ? event.target : null; node && node !== document.body; node = node.parentElement) {
      if (node.matches('input,textarea,select,video,[contenteditable=true]')) return;
      if (node.scrollHeight > node.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(node).overflowY)) return;
    }
    if (!limit()) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    if (!frame) target = scrollY;
    target = Math.max(0,Math.min(limit(), target + event.deltaY * unit * .86));
    if (!frame) {previous = performance.now(); frame = requestAnimationFrame(step);}
  }, {passive:false});
  addEventListener('pointerdown', stop, {passive:true});
  addEventListener('touchstart', stop, {passive:true});
  addEventListener('keydown', stop);
  addEventListener('hashchange', stop);
  addEventListener('resize', stop);
  document.addEventListener('click', stop);
  document.addEventListener('mtrp:dossierstate', stop);
  reduced.addEventListener('change', stop);
  document.addEventListener('visibilitychange', () => {if (document.hidden) stop();});
})();
