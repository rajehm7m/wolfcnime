(() => {
  'use strict';
  const roles = {
    police: {title:'POLICE', kicker:'PROTECT THE CITY', image:'police-bintallal.webp', description:'احمِ المدينة، واصنع حكايتك على جانب القانون.', paths:['دوريات وبلاغات','قضايا وتحقيقات','عمل جماعي']},
    medic: {title:'MEDIC', kicker:'EVERY SECOND COUNTS', image:'medic.webp', description:'كن الأمل حين تحتاجك المدينة. كل ثانية تصنع فرقًا.', paths:['استجابة للبلاغات','إنقاذ وطوارئ','فريق المستشفى']},
    criminal: {title:'CRIMINAL', kicker:'LIVE ON THE EDGE', image:'criminal.webp', description:'عش على حافة المخاطرة. كل قرار يترك أثرًا.', paths:['تحالفات','تخطيط وصفقات','مخاطرة وعواقب']},
    citizen: {title:'CITIZEN', image:'citizen.webp', kicker:'BUILD YOUR OWN WORLD', description:'حياة بطريقتك. اصنع مكانك في المدينة.', paths:['مهن وأعمال','مشاريع','علاقات وحكايات']}
  };
  const dialog = document.querySelector('.story-dialog');
  const panel = dialog.querySelector('.story-panel');
  const stage = dialog.querySelector('.story-flight');
  const turner = dialog.querySelector('.story-turner');
  const close = dialog.querySelector('.story-close');
  const apply = document.createElement('a');
  apply.className = 'story-apply';
  apply.href = 'https://discord.gg/mt';
  apply.target = '_blank';
  apply.rel = 'noopener noreferrer';
  apply.innerHTML = '<span>قدّم الآن<small>التقديم عبر ديسكورد MT</small></span><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  apply.hidden = true;
  panel.querySelector('.story-detail-footer').before(apply);
  const composition = document.createElement('div');
  composition.className = 'story-content';
  ['.story-detail-top','.story-detail-art','.story-detail-copy'].forEach(selector => composition.append(panel.querySelector(selector)));
  panel.append(composition);
  const ranks = {police:['01','♠'],medic:['02','♥'],criminal:['03','♣'],citizen:['04','♦']};
  const rank = document.createElement('span');
  rank.className = 'story-detail-rank'; rank.setAttribute('aria-hidden','true'); panel.append(rank);
  function fitStory() {
    if (!dialog.open) return;
    const height = composition.scrollHeight;
    const scale = Math.min(1, panel.clientHeight / Math.max(1,height));
    composition.style.setProperty('--story-fit', String(scale));
    composition.style.setProperty('--story-offset', `${Math.min(12,Math.max(0,(panel.clientHeight-height*scale)/2))}px`);
  }
  if ('ResizeObserver' in window) {
    const sizing = new ResizeObserver(fitStory);
    sizing.observe(panel); sizing.observe(composition);
  }
  document.fonts?.ready.then(fitStory);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let origin, returnFocus, flight, rotation, closing = false, preparing = false;
  // Reuse decoded artwork so opening a card never waits for a fresh image layer.
  const artwork = new Map(Object.entries(roles).map(([key, role]) => {
    const image = document.createElement(role.image ? 'img' : 'span');
    if (role.image) { image.src = `assets/images/${role.image}`; image.alt = ''; image.decode().catch(() => {}); }
    else image.textContent = 'MT';
    return [key, image];
  }));
  function originTransform() {
    const from = origin.getBoundingClientRect();
    return `translate(${from.x+from.width/2-dialog.clientWidth/2}px,${from.y+from.height/2-dialog.clientHeight/2}px) rotateZ(${getComputedStyle(origin).getPropertyValue('--angle')}) scale(${origin.offsetWidth/stage.offsetWidth},${origin.offsetHeight/stage.offsetHeight})`;
  }
  async function openStory(button, opener = button) {
    if (dialog.open || preparing) return;
    preparing = true;
    origin = button; returnFocus = opener;
    const key = button.dataset.story, role = roles[key];
    rank.innerHTML = `${ranks[key][0]}<span>${ranks[key][1]}</span>`;
    apply.hidden = key !== 'police';
    stage.dataset.story = key;
    panel.querySelector('h2').textContent = role.title;
    panel.querySelector('.story-detail-eyebrow').textContent = role.kicker;
    panel.querySelector('p').textContent = role.description;
    panel.querySelector('ul').replaceChildren(...role.paths.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    const art = panel.querySelector('.story-detail-art');
    const image = artwork.get(key);
    if (role.image) await image.decode().catch(() => {});
    art.replaceChildren(image);
    document.body.classList.add('story-open');
    dialog.showModal(); panel.scrollTop = 0;
    fitStory();
    preparing = false;
    origin.style.visibility = 'hidden';
    const start = originTransform();
    if (!reduced.matches) {
      dialog.classList.add('is-animating');
      flight = stage.animate([{transform:start},{transform:'translate(0,0) rotateZ(0deg) scale(1)'}],{duration:1550,easing:'cubic-bezier(.22,.65,.18,1)',fill:'both'});
      rotation = turner.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(360deg)'}],{duration:1550,easing:'cubic-bezier(.3,.05,.25,1)',fill:'both'});
      try { await Promise.all([flight.finished,rotation.finished]); } catch {}
    }
    if (dialog.open && !closing) {
      flight?.cancel(); rotation?.cancel(); dialog.classList.remove('is-animating');
      close.focus({preventScroll:true});
    }
  }
  async function closeStory() {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.classList.add('is-animating');
    const currentFlight = getComputedStyle(stage).transform;
    const currentTurn = getComputedStyle(turner).transform;
    flight?.cancel(); rotation?.cancel();
    if (!reduced.matches) {
      flight = stage.animate([{transform:currentFlight,opacity:1},{transform:originTransform(),opacity:0}],{duration:450,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'});
      rotation = turner.animate([{transform:currentTurn},{transform:'rotateY(0deg)'}],{duration:400,easing:'ease-out',fill:'both'});
      try { await Promise.all([flight.finished,rotation.finished]); } catch {}
    }
    dialog.close(); document.body.classList.remove('story-open');
    flight?.cancel(); rotation?.cancel(); dialog.classList.remove('is-animating');
    origin.style.visibility = ''; returnFocus.focus({preventScroll:true}); closing = false;
  }
  document.querySelectorAll('.story-card').forEach(button => {
    const portrait = document.createElement('span'); portrait.className = 'story-card-portrait';
    const nodes = ['img'];
    nodes.forEach(selector => portrait.append(button.querySelector(selector))); button.append(portrait);
    const reverse = document.createElement('span'); reverse.className = 'story-corner story-corner-opposite'; reverse.setAttribute('aria-hidden','true');
    const [number,suit] = ranks[button.dataset.story]; reverse.innerHTML = `${number}<span>${suit}</span>`; button.append(reverse);
    const foil = document.createElement('span'); foil.className = 'story-foil'; foil.setAttribute('aria-hidden','true'); button.append(foil);
    button.addEventListener('click', () => openStory(button));
  });
  document.querySelectorAll('[data-story-open]').forEach(button => {
    button.addEventListener('click', () => openStory(document.querySelector(`.story-card[data-story="${button.dataset.storyOpen}"]`), button));
  });
  close.addEventListener('click',closeStory);
  dialog.addEventListener('cancel',event => {event.preventDefault();closeStory();});
  dialog.addEventListener('click',event => {if(event.target === dialog) closeStory();});

  // Visual glitch only; the navbar intentionally has no sound.
  const brand = document.querySelector('.brand');
  let glitchTimer;
  function glitch(){
    brand.classList.remove('is-glitching'); void brand.offsetWidth;
    brand.classList.add('is-glitching');clearTimeout(glitchTimer);
    glitchTimer=setTimeout(()=>brand.classList.remove('is-glitching'),700);
  }
  brand.addEventListener('pointerenter',glitch);
  brand.addEventListener('focus',glitch);
  document.addEventListener('mtrp:menuchange',glitch);
})();

