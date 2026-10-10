(() => {
  'use strict';
  const screen = document.querySelector('#intro');
  const loader = screen.querySelector('.intro-loader');
  const meter = screen.querySelector('.intro-loading-line');
  const counter = screen.querySelector('.intro-percent');
  const titles = [...screen.querySelectorAll('.intro-title')];
  const audio = document.querySelector('#brand-audio');
  const soundEnable = screen.querySelector('.intro-audio-enable');
  const background = [...document.querySelectorAll('.site-header, main, footer, .skip-link')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cues = [[.48,1.01],[1.06,1.38],[1.43,2.43],[2.61,3.30],[3.36,4.53]];
  const duration = 5.18;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  let mode = 'loading', generation = 0, frame, cue = -1;
  let silent = false, silentStart = 0, previousFrame = 0, mediaTime = 0, mediaStall = 0;
  let ready = false, completed = 0, completionTarget = 0, progress = 0;
  let restoreFocus;
  function setActive(active) {
    document.body.classList.toggle('intro-active', active);
    background.forEach(element => { element.inert = active; });
    document.dispatchEvent(new CustomEvent('mtrp:introstate', {detail:{active}}));
  }
  function showCue(index) {
    if (cue === index) return;
    cue = index;
    titles.forEach((title, i) => {
      title.classList.toggle('is-visible', i === index);
      title.setAttribute('aria-hidden', String(i !== index));
    });
    screen.dataset.cue = String(index);
  }
  function useSilentClock(time = 0) {
    audio.pause(); silent = true;
    silentStart = performance.now() - time * 1000;
    screen.dataset.audio = 'silent';
    soundEnable.hidden = false;
  }
  function render(now) {
    if (mode !== 'playing') return;
    const delta = Math.min(now - previousFrame, 100);
    previousFrame = now;
    const time = silent ? (now - silentStart) / 1000 : audio.currentTime;
    if (!silent && !document.hidden) {
      mediaStall = Math.abs(time - mediaTime) < .001 ? mediaStall + delta : 0;
      mediaTime = time;
      if (mediaStall > 1500) useSilentClock(time);
    }
    showCue(cues.findIndex(([start,end]) => time >= start && time < end));
    if (time >= duration || (!silent && audio.ended)) { finish(); return; }
    frame = requestAnimationFrame(render);
  }
  async function play() {
    const token = generation;
    mode = 'starting'; silent = false; audio.currentTime = 0; audio.volume = 1;
    const started = await Promise.race([audio.play().then(() => {
      delete screen.dataset.audioError;
      return true;
    }, error => {
      screen.dataset.audioError = error.name;
      return false;
    }),wait(1500).then(() => false)]);
    if (token !== generation) { audio.pause(); return; }
    if (!started) useSilentClock();
    mode = 'playing'; screen.dataset.state = 'playing';
    screen.dataset.audio = silent ? 'silent' : 'playing';
    loader.classList.add('is-away');
    if (silent) silentStart = performance.now();
    previousFrame = performance.now(); mediaTime = audio.currentTime; mediaStall = 0;
    frame = requestAnimationFrame(render);
  }
  async function finish() {
    if (mode === 'done' || mode === 'ending') return;
    mode = 'ending'; screen.dataset.state = 'ending'; generation++;
    if(window.MT_ASSETS)await window.MT_ASSETS.heroReady;
    soundEnable.hidden = true;
    cancelAnimationFrame(frame); audio.pause(); showCue(-1);
    document.body.classList.add('intro-reveal', 'experience-ready');
    document.dispatchEvent(new CustomEvent('mtrp:introreveal'));
    screen.classList.add('is-ending');
    await wait(motion.matches ? 100 : 650);
    screen.hidden = true; mode = 'done'; screen.dataset.state = 'done';
    setActive(false);
    (restoreFocus || document.querySelector('.hero')).focus({preventScroll:true});
    document.body.classList.add('experience-ready');
    document.body.classList.remove('intro-reveal');
  }
  function paintProgress(value) {
    progress = value;
    const rounded = Math.floor(value);
    counter.textContent = String(rounded).padStart(3,'0');
    meter.setAttribute('aria-valuenow', String(rounded));
    screen.style.setProperty('--load-progress', `${value}%`);
    screen.style.setProperty('--load-fraction', String(value / 100));
    screen.querySelector('.intro-load-status').textContent = value < 48 ? 'DRAWING THE MARK' : value < 99 ? 'BRINGING IT TO LIFE' : 'WELCOME TO YOUR NEXT CHAPTER';
  }
  async function load() {
    const token = ++generation;
    mode = 'loading'; screen.dataset.state = 'loading'; setActive(true);
    screen.focus({preventScroll:true});
    const resources = window.MT_ASSETS ? [window.MT_ASSETS.introReady] : [document.fonts.load('16px Serpentine'),screen.querySelector('.intro-logo').decode(), ...[...document.querySelectorAll('#home img')].map(image => image.decode())];
    const resourcesReady = Promise.allSettled(resources.map(resource => resource.finally(() => { completionTarget = ++completed / resources.length * 100; })));
    Promise.race([resourcesReady,wait(6000)]).then(() => { ready = true; completionTarget = 100; });
    const started = performance.now(), minimum = motion.matches ? 600 : 1800;
    let lastLoadFrame = started;
    await new Promise(resolve => {
      function loadingFrame(now) {
        if (token !== generation) { resolve(); return; }
        // Counts asset preparation plus the logo's draw/fill initialization.
        const phase = Math.min((now - started) / minimum, 1);
        const visualProgress = (phase * phase * (3 - 2 * phase)) * 100;
        const target = Math.min(visualProgress, ready ? 100 : Math.min(completionTarget,94));
        const delta = Math.min(now - lastLoadFrame, 50);
        lastLoadFrame = now;
        const eased = progress + Math.max(0, target - progress) * (1 - Math.exp(-delta / 135));
        const next = target === 100 && eased > 99.97 ? 100 : eased;
        paintProgress(next);
        if (next >= 100) resolve(); else frame = requestAnimationFrame(loadingFrame);
      }
      frame = requestAnimationFrame(loadingFrame);
    });
    if (token !== generation) return;
    await wait(240); await play();
  }
  audio.addEventListener('ended', () => { if (mode === 'playing' && !silent) finish(); });
  // Browsers may require a real interaction before permitting audible playback.
  let unlocking = false;
  async function unlockSound() {
    if (unlocking || (mode !== 'loading' && !(mode === 'playing' && silent))) return;
    unlocking = true;
    const duringLoad = mode === 'loading';
    if (duringLoad) audio.volume = 0;
    else {
      audio.volume = 1;
      audio.currentTime = Math.min((performance.now() - silentStart) / 1000, duration);
    }
    try {
      await audio.play();
      if (duringLoad && mode === 'loading') { audio.pause(); audio.currentTime = 0; }
      else if (mode === 'playing') {
        silent = false; screen.dataset.audio = 'playing';
        soundEnable.hidden = true;
        mediaStall = 0; mediaTime = audio.currentTime;
      } else if (mode === 'done' || mode === 'ending') audio.pause();
    } catch { /* Keep the visual sequence running when audio is blocked. */ }
    finally { audio.volume = 1; unlocking = false; }
  }
  screen.addEventListener('pointerdown', unlockSound);
  screen.addEventListener('click', unlockSound);
  screen.addEventListener('touchend', unlockSound, {passive:true});
  soundEnable.addEventListener('click', unlockSound);
  screen.addEventListener('keydown', unlockSound);
  screen.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      (soundEnable.hidden ? screen : soundEnable).focus({preventScroll:true});
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (silent || mode !== 'playing') return;
    if (document.hidden) audio.pause();
    else audio.play().catch(() => useSilentClock(audio.currentTime));
  });
  load();
})();
