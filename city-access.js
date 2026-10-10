(() => {
  'use strict';
  const section = document.querySelector('.city-access');
  const status = section.querySelector('.access-status');
  section.querySelector('.access-connect').addEventListener('click', () => {
    // Native link only. No endpoint, copy command or address-bearing fallback text.
    status.textContent = 'يُفتح الرابط عبر FiveM المثبّت على جهازك.';
    section.classList.add('is-torn');
  });
  section.classList.add('is-enhanced');
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) section.classList.add('has-arrived');
  }, {threshold:.12}).observe(section);
})();
