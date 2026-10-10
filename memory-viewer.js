(() => {
  'use strict';
  const events = window.MT_MEMORIES || [];
  const section = document.querySelector('.memories-section');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-dialog';
  dialog.setAttribute('aria-labelledby', 'memory-detail-title');
  dialog.innerHTML = `<article class="memory-sheet"><header class="memory-sheet-top"><span><i aria-hidden="true"></i> THE MEMORY ARCHIVE</span><button type="button" class="memory-close" aria-label="إغلاق الذكرى">×</button><span class="memory-reading-progress" aria-hidden="true"></span></header><div class="memory-editorial"><div class="memory-visual"><img class="memory-cover" alt=""><div class="memory-visual-tag"><span>Rules Town</span><span>ARCHIVED MOMENT ↗</span></div></div><div class="memory-copy"><span class="memory-label"></span><h2 id="memory-detail-title"></h2><div class="memory-blocks" dir="rtl"></div><div class="memory-sheet-foot"><img src="assets/images/mt-logo.png" alt="MT" width="38" height="38"></div></div></div></article>`;
  document.body.append(dialog);
  const sheet = dialog.querySelector('.memory-sheet');
  const cover = dialog.querySelector('.memory-cover');
  const close = dialog.querySelector('.memory-close');
  let origin, closing = false, opening = false, animations = [];
  const covers = new Map(events.map(event => {
    const image = new Image(); image.decoding = 'async';
    return [event.id, image];
  }));
  function cancelAnimations() { animations.forEach(animation => animation.cancel()); animations = []; }
  function animate(element, frames, options) {
    const animation = element.animate(frames, {fill: 'both', ...options});
    animations.push(animation); return animation.finished.catch(() => {});
  }
  function renderBlock(block) {
    if (block.type === 'text' || block.type === 'heading') {
      const node = document.createElement(block.type === 'text' ? 'p' : 'h3');
      node.textContent = block.text || ''; return node;
    }
    if (block.type !== 'image' && block.type !== 'video') return document.createDocumentFragment();
    const figure = document.createElement('figure');
    const media = document.createElement(block.type === 'video' ? 'video' : 'img');
    media.src = block.src;
    if (block.type === 'video') { media.controls = true; media.preload = 'metadata'; media.playsInline = true; if (block.poster) media.poster = block.poster; }
    else { media.alt = block.alt || ''; media.loading = 'lazy'; }
    figure.append(media);
    if (block.caption) { const caption = document.createElement('figcaption'); caption.textContent = block.caption; figure.append(caption); }
    return figure;
  }
  async function openMemory(button) {
    if (dialog.open || opening) return;
    const event = events.find(item => item.id === button.dataset.memory);
    if (!event) return;
    opening = true; origin = button;
    const prepared = covers.get(event.id); prepared.src = event.cover;
    await prepared.decode().catch(() => {});
    const from = button.closest('.memory-frame').getBoundingClientRect();
    cover.src = event.cover; cover.alt = event.title;
    dialog.querySelector('h2').textContent = event.title;
    dialog.querySelector('.memory-label').textContent = event.label;
    dialog.querySelector('.memory-blocks').replaceChildren(...(event.blocks || []).map(renderBlock));
    document.body.classList.add('memory-open');
    sheet.classList.toggle('has-story',Boolean(event.blocks?.length));
    dialog.showModal(); sheet.scrollTop = 0; opening = false;
    sheet.style.setProperty('--reading-progress','0%');
    if (!reduced.matches) {
      const to = sheet.getBoundingClientRect();
      const dx = Math.max(-innerWidth * .35, Math.min(innerWidth * .35, from.x + from.width / 2 - to.x - to.width / 2));
      const dy = Math.max(-innerHeight * .25, Math.min(innerHeight * .25, from.y + from.height / 2 - to.y - to.height / 2));
      await Promise.all([
        animate(sheet, [{transform:`translate(${dx}px,${dy}px) scale(.78)`,opacity:0},{transform:'translate(0,0) scale(1)',opacity:1}], {duration:760,easing:'cubic-bezier(.16,1,.3,1)'}),
        animate(cover, [{clipPath:'inset(10% 0 10% 0)',opacity:0},{clipPath:'inset(0)',opacity:1}], {duration:800,delay:70,easing:'cubic-bezier(.2,.7,.15,1)'}),
        animate(dialog.querySelector('.memory-copy'), [{transform:'translateY(24px)',opacity:0},{transform:'translateY(0)',opacity:1}], {duration:580,delay:220,easing:'cubic-bezier(.16,1,.3,1)'})
      ]);
    }
    if (dialog.open && !closing) { cancelAnimations(); close.focus({preventScroll:true}); }
  }
  async function closeMemory() {
    if (!dialog.open || closing) return;
    closing = true;
    const transform = getComputedStyle(sheet).transform;
    const opacity = getComputedStyle(sheet).opacity;
    cancelAnimations();
    dialog.querySelectorAll('video').forEach(video => video.pause());
    if (!reduced.matches) await animate(sheet,[{transform,opacity},{transform:'translateY(22px) scale(.97)',opacity:0}],{duration:260,easing:'ease-in'});
    dialog.close(); cancelAnimations(); document.body.classList.remove('memory-open');
    const focusTarget = origin?.closest('[aria-hidden="true"]')
      ? section.querySelector(`.memory-group:first-child [data-memory="${origin.dataset.memory}"]`) : origin;
    focusTarget?.focus({preventScroll:true}); closing = false;
  }
  section.querySelectorAll('.memory-group:first-child .memory-frame').forEach((frame, index) => {
    const event = events[index]; if (!event) return;
    const photo = frame.querySelector('.memory-photo img');
    if(window.MT_ASSETS)window.MT_ASSETS.deferImage(photo,event.cover);else photo.src=event.cover; photo.alt = event.title;
    frame.querySelector('figcaption > span').textContent = event.title;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'memory-open-button'; button.dataset.memory = event.id;
    button.setAttribute('aria-label', `فتح ذكرى ${event.title}`); button.setAttribute('aria-haspopup', 'dialog');
    frame.append(button);
    const preload = () => covers.get(event.id).decode().catch(() => {});
    button.addEventListener('pointerenter', preload, {once:true});
    button.addEventListener('focus', preload, {once:true});
  });
  section.addEventListener('click', event => {const button = event.target.closest('.memory-open-button'); if (button) openMemory(button);});
  sheet.addEventListener('scroll',()=>{const distance=sheet.scrollHeight-sheet.clientHeight;sheet.style.setProperty('--reading-progress',`${distance>0?sheet.scrollTop/distance*100:0}%`);},{passive:true});
  close.addEventListener('click', closeMemory);
  dialog.addEventListener('cancel', event => {event.preventDefault(); closeMemory();});
  dialog.addEventListener('click', event => {if(event.target === dialog) closeMemory();});
})();
