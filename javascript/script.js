const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

// --- Scroll Animations ---

function assignRevealClasses() {
  document.querySelectorAll('main > *:not(.hero)').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
  });
}

function createScrollObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  return obs;
}

function initScrollAnimations() {
  assignRevealClasses();
  const observer = createScrollObserver();
  document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

// --- Hamburger Menu ---

function closeMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}

function initHamburger() {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initHamburger();
  initSmoothScroll();
});
