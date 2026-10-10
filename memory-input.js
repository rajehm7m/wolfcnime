(() => {
  const section = document.querySelector('.memories-section');
  // Focus restored after a mouse click must not freeze the carousel.
  // Keyboard visitors can still hold it steady while tabbing through the cards.
  const usePointer = () => section.classList.remove('is-keyboard-nav');
  document.addEventListener('pointerdown', usePointer, {passive:true});
  document.addEventListener('pointermove', usePointer, {passive:true});
  document.addEventListener('keydown', event => {
    if (['Tab','ArrowLeft','ArrowRight','Enter',' '].includes(event.key)) section.classList.add('is-keyboard-nav');
  });
})();
