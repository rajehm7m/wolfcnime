'use strict';

const scenes = [
  { name: 'IAA', arabic: 'IAA', image: 'abdulsamad.webp', lines: ['TRUST', 'NO ONE.', 'REMEMBER', 'EVERYTHING.'], phrase: 'TRUST NO ONE. REMEMBER EVERYTHING.', accent: '#ff6b1b', rgb: '255,107,27', word: 'F-0', label: 'THE ART OF DISTRUST', story: 'بعض الأسرار لا تُقال. وبعض الوجوه لا تُنسى.' },
  { name: 'MARINES', arabic: 'المارينز', image: 'mhna.webp', lines: ['POWER ISN’T', 'GIVEN.', 'IT’S', 'TAKEN.'], phrase: 'POWER ISN’T GIVEN. IT’S TAKEN.', accent: '#e6a451', rgb: '230,164,81', word: 'P-1', label: 'THE PRICE OF POWER', story: 'لا تنتظر مكانك في القمة. اصنع الطريق إليه.' },
  { name: 'S.W.A.T', arabic: 'S.W.A.T', image: 'vladi.webp', lines: ['THE CITY', 'WATCHES.', 'THE CITY', 'REMEMBERS.'], phrase: 'THE CITY WATCHES. THE CITY REMEMBERS.', accent: '#81b8b5', rgb: '129,184,181', word: 'P-2', label: 'NOTHING GOES UNSEEN', story: 'لكل خطوة شاهد. ولكل حكاية أثر.' },
  { name: 'ANONYMOUS', arabic: 'أنونيموس', image: 'Snake.webp', lines: ['ONE', 'DECISION', 'CAN CHANGE', 'EVERYTHING.'], phrase: 'ONE DECISION CAN CHANGE EVERYTHING.', accent: '#b4bc80', rgb: '180,188,128', word: 'CHOOSE', label: 'THE MOMENT OF NO RETURN', story: 'بين ما كنت عليه وما ستصبحه، قرار واحد.' }
];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const hero = $('.hero');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let introActive = document.body.classList.contains('intro-active');
let chapterTransition = false;
document.addEventListener('mtrp:chapterstate', event => { chapterTransition = event.detail.active; elapsed = 0; });
document.addEventListener('mtrp:introstate', event => { introActive = event.detail.active; elapsed = 0; lastTime = performance.now(); });
const pauseButton = $('.autoplay-toggle');
const period = 7200;
let active = 0;
let busy = false;
let requested = null;
let paused = reduced.matches;
let hovering = false;
let inView = true;
let elapsed = 0;
let lastTime = performance.now();
let raf = 0;
let transitionAnimations = [];

// Decode the four supplied portraits before each transition, so a slow image
// cannot leave an empty stage. They are also cached by the thumbnail selectors.
const portraits = scenes.map((scene) => {
  const image = new Image();
  image.decoding = 'async'; image.fetchPriority = scene === scenes[0] ? 'high' : 'low';
  if(!window.MT_ASSETS)image.src = `assets/images/${scene.image}`;
  return image;
});

function animate(element, frames, options) {
  const animation = element.animate(frames, { fill: 'both', ...options });
  transitionAnimations.push(animation);
  return animation.finished.catch(() => {});
}

function applyScene(index, announce) {
  const scene = scenes[index];
  hero.style.setProperty('--accent', scene.accent);
  hero.style.setProperty('--accent-rgb', scene.rgb);
  $$('.headline-line').forEach((line, i) => { line.textContent = scene.lines[i]; });
  $('.identity-name').textContent = scene.name;
  $('.identity-overline').textContent = scene.label;
  $('.ghost-word').textContent = scene.word;
  $('.scene-number').textContent = `0${index + 1}`;
  $('.chapter-current').textContent = `0${index + 1}`;
  $$('.character-choice').forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  if (announce) $('.scene-status').textContent = `${scene.arabic}. ${scene.phrase}`;
  hero.dataset.scene = String(index);
}

async function changeScene(index, manual = false) {
  index = (index + scenes.length) % scenes.length;
  if (busy) { requested = { index, manual }; return; }
  if (index === active) { elapsed = 0; return; }
  busy = true;
  hero.dataset.transitioning = 'true';
  document.dispatchEvent(new CustomEvent('mtrp:scenewillchange'));
  elapsed = 0;
  const oldLayer = $('.character-layer.current');
  const newLayer = $('.character-layer.standby');
  try {
    if(!portraits[index].src)portraits[index].src=`assets/images/${scenes[index].image}`;
    await portraits[index].decode();
    newLayer.querySelector('img').src = portraits[index].src;
    await newLayer.querySelector('img').decode();
    const quick = reduced.matches;
    newLayer.style.visibility = 'visible';
    newLayer.style.zIndex = '2';
    const imageOut = animate(oldLayer, quick ? [{ opacity: 1 }, { opacity: 0 }] : [
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 0 },
      { transform: 'translate3d(-1%,9%,0) scale(.985)', opacity: 1, offset: .27 },
      { transform: 'translate3d(-3%,105%,0) scale(.92)', opacity: .1, offset: 1 }
    ], { duration: quick ? 100 : 760, easing: 'cubic-bezier(.5,0,.85,.45)' });
    const imageIn = animate(newLayer, quick ? [{ opacity: 0 }, { opacity: 1 }] : [
      { transform: 'translate3d(5%,112%,0) scale(1.06)', opacity: 1, offset: 0 },
      { transform: 'translate3d(0,-1.1%,0) scale(1.005)', opacity: 1, offset: .85 },
      { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, offset: 1 }
    ], { delay: quick ? 0 : 230, duration: quick ? 130 : 1150, easing: 'cubic-bezier(.16,1,.3,1)' });
    const lines = $$('.headline-line');
    const textOut = lines.map((line, i) => animate(line, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: quick ? 'none' : 'translateY(32px)' }], { duration: quick ? 60 : 210, delay: quick ? 0 : i * 24, easing: 'ease-in' }));
    const identityOut = animate($('.identity'), [{ opacity: 1 }, { opacity: 0 }], { duration: quick ? 60 : 200 });
    animate($('.ghost-word'), [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: quick ? 'none' : 'translateY(-65px)' }], { duration: quick ? 60 : 260 });
    animate($('.ambient-particles'), [{ transform: 'translateY(0)', opacity: 1 }, { transform: quick ? 'none' : 'translateY(-90px)', opacity: 0 }], { duration: quick ? 60 : 350 });
    await Promise.all([...textOut, identityOut]);
    applyScene(index, manual);
    const textIn = lines.map((line, i) => animate(line, [{ opacity: 0, transform: quick ? 'none' : 'translateY(45px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: quick ? 80 : 700, delay: quick ? 0 : 70 + i * 65, easing: 'cubic-bezier(.16,1,.3,1)' }));
    animate($('.identity'), [{ opacity: 0 }, { opacity: 1 }], { delay: quick ? 0 : 300, duration: quick ? 80 : 550 });
    animate($('.ghost-word'), [{ opacity: 0, transform: quick ? 'none' : 'translateY(75px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: quick ? 80 : 1100, easing: 'cubic-bezier(.16,1,.3,1)' });
    animate($('.ambient-particles'), [{ transform: quick ? 'none' : 'translateY(95px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: quick ? 80 : 1100 });
    await Promise.all([imageOut, imageIn, ...textIn]);
    oldLayer.classList.replace('current', 'standby');
    oldLayer.style.visibility = 'hidden';
    newLayer.classList.replace('standby', 'current');
    newLayer.style.visibility = 'visible';
    oldLayer.style.zIndex = '';
    newLayer.style.zIndex = '';
    active = index;
  } catch (error) {
    newLayer.style.visibility = 'hidden';
    oldLayer.style.visibility = 'visible';
    applyScene(active, false);
    $('.scene-status').textContent = 'تعذر تحميل الشخصية. حاول مرة أخرى.';
    console.error('Portrait transition failed:', error);
  } finally {
    transitionAnimations.forEach((animation) => animation.cancel());
    transitionAnimations = [];
    busy = false;
    hero.dataset.transitioning = 'false';
    document.dispatchEvent(new CustomEvent('mtrp:scenechange'));
    elapsed = 0;
    if (requested) {
      const next = requested;
      requested = null;
      if (next.index !== active) changeScene(next.index, next.manual);
    }
  }
}

function syncPause() {
  if (!pauseButton) return;
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? 'تشغيل التبديل التلقائي' : 'إيقاف التبديل التلقائي');
}
pauseButton?.addEventListener('click', () => { paused = !paused; syncPause(); elapsed = 0; });
reduced.addEventListener('change', () => { paused = reduced.matches; syncPause(); });
syncPause();
applyScene(0, false);

$$('.character-choice').forEach((button) => button.addEventListener('click', () => changeScene(Number(button.dataset.scene), true)));
$$('.roster-card').forEach((button) => button.addEventListener('click', () => {
  paused = true;
  syncPause();
  changeScene(Number(button.dataset.scene), true);
  hero.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
  hero.focus({ preventScroll: true });
}));
hero.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    changeScene(active + (event.key === 'ArrowRight' ? 1 : -1), true);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    changeScene(event.key === 'Home' ? 0 : scenes.length - 1, true);
  }
});
$('.character-selectors').addEventListener('pointerenter', () => { hovering = true; });
$('.character-selectors').addEventListener('pointerleave', () => { hovering = false; });
let touchStart = null;
hero.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || event.target.closest('button, a')) return;
  touchStart = { x: event.clientX, y: event.clientY };
});
hero.addEventListener('pointercancel', () => { touchStart = null; });
hero.addEventListener('pointerup', (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) changeScene(active + (dx < 0 ? 1 : -1), true);
});
hero.addEventListener('pointermove', (event) => {
  if (reduced.matches || event.pointerType !== 'mouse' || innerWidth < 900) return;
  const rect = hero.getBoundingClientRect();
  hero.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 12}px`);
  hero.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 7}px`);
});
hero.addEventListener('pointerleave', () => { hero.style.setProperty('--pointer-x', '0px'); hero.style.setProperty('--pointer-y', '0px'); });

function tick(now) {
  const delta = Math.min(now - lastTime, 100);
  lastTime = now;
  const focusedControl = hero.contains(document.activeElement) && document.activeElement !== hero && document.activeElement.matches(':focus-visible');
  if (!introActive && !chapterTransition && !paused && !busy && !hovering && inView && !document.hidden && !focusedControl && !document.querySelector('dialog[open]') && !document.body.classList.contains('menu-open')) {
    elapsed += delta;
    if (elapsed >= period) changeScene(active + 1);
  }
  raf = requestAnimationFrame(tick);
}
new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .2 }).observe(hero);
document.addEventListener('visibilitychange', () => { lastTime = performance.now(); });
raf = requestAnimationFrame(tick);
window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
window.addEventListener('pageshow', (event) => { if (event.persisted) { lastTime = performance.now(); raf = requestAnimationFrame(tick); } });

$('#year').textContent = new Date().getFullYear();

// Keep navigation visible and mark the section currently passing under it.
const siteHeader = $('.site-header');
const navLinks = $$('.site-header nav a[href^="#"]');
const navSections = navLinks.map(link => document.querySelector(link.hash));
let navFrame = 0;
function updateNavigation() {
  navFrame = 0;
  siteHeader.classList.toggle('is-scrolled', scrollY > 30);
  const threshold = siteHeader.getBoundingClientRect().height + 100;
  let current = navSections[0];
  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= threshold) current = section;
  }
  navLinks.forEach(link => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => { if (!navFrame) navFrame = requestAnimationFrame(updateNavigation); }, {passive:true});
addEventListener('resize', updateNavigation);
updateNavigation();

const menuToggle = $('.menu-toggle');
const studioMenu = $('#studio-menu');
const menuBackdrop = $('.menu-backdrop');
const menuBackground = $$('main, footer');
function setMenu(open, restoreFocus = true) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  studioMenu.hidden = !open;
  menuBackdrop.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  document.dispatchEvent(new CustomEvent('mtrp:menuchange', {detail:{open}}));
  menuBackground.forEach(element => { element.inert = open; });
  if (open) navLinks[0].focus({preventScroll:true});
  else if (restoreFocus) menuToggle.focus({preventScroll:true});
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menuBackdrop.addEventListener('click', () => setMenu(false));
$('.nav-store').addEventListener('click', () => setMenu(false));
navLinks.forEach(link => link.addEventListener('click', () => {
  setMenu(false, false);
  const section = document.querySelector(link.hash);
  section.setAttribute('tabindex', '-1');
  section.focus({preventScroll:true});
}));
document.addEventListener('keydown', event => {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
  if (event.key === 'Tab') {
    const items = [$('.brand'), menuToggle, ...navLinks, $('.nav-store')];
    const index = items.indexOf(document.activeElement);
    event.preventDefault();
    items[(index + (event.shiftKey ? -1 : 1) + items.length) % items.length].focus();
  }
});
$('.brand').addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false, false);
});
