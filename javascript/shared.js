document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
});

function scrollToTarget(target) {
  const navHeight = document.querySelector('nav').offsetHeight;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
  animateScroll(window.scrollY, targetTop - window.scrollY, 700);
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) scrollToTarget(target);
    });
  });
}

function animateScroll(start, distance, duration) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function redirectToMainPage(){
  window.location.href = "../index.html"
}