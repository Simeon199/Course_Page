document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollAnimations();
  initHamburger();
});

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 40);
});

function scrollToTarget(target) {
  let navHeight = document.querySelector('nav').offsetHeight;
  let targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
  animateScroll(window.scrollY, targetTop - window.scrollY, 700);
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      let target = document.querySelector(this.getAttribute('href'));
      if (target) {
        scrollToTarget(target);
      }
    });
  });
}

function animateScroll(start, distance, duration) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) {
      startTime = timestamp;
    }
    let progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function redirectToMainPage(){
  window.location.href = "../index.html"
}

// --- Scroll Animations ---

function assignRevealClasses() {
  document.querySelectorAll('main > *:not(.hero)').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
  });
}

function createScrollObserver() {
  let obs = new IntersectionObserver((entries) => {
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
  let observer = createScrollObserver();
  document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => observer.observe(el));
}

// --- Hamburger Menu ---

function closeMenu() {
  let hamburger = document.getElementById('hamburger');
  let navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
}

function initHamburger() {
  let hamburger = document.getElementById('hamburger');
  let navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) {
    return;
  }
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

// --- Form Validation & Utilities ---

function sanitize(str) {
  let div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.trim();
}

function showStatus(statusEl, msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `form-status ${type}`;
}

function getValidationMessage(input) {
  let value = input.value.trim();
  if (input.type === 'checkbox') {
    return input.checked ? '' : 'Bitte stimmen Sie der Datenschutzerklärung zu.';
  }
  if (input.required && !value) return 'Dieses Feld ist erforderlich.';
  if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Bitte eine gültige E-Mail-Adresse eingeben.';
  }
  if (input.maxLength > 0 && value.length > input.maxLength) return `Maximal ${input.maxLength} Zeichen erlaubt.`;
  return '';
}

function validateField(form, input) {
  let message = getValidationMessage(input);
  let errorEl = form.querySelector(`[data-for="${input.id}"]`);
  if (errorEl) {
    errorEl.textContent = message;
  }
  input.classList.toggle('invalid', !!message);
  return !message;
}

function validateAll(form) {
  let isValid = true;
  form.querySelectorAll('input[required]').forEach(input => {
    if (!validateField(form, input)) {
      isValid = false;
    }
  });
  return isValid;
}

function collectPayload(form) {
  return {
    firstName: sanitize(form.firstName.value),
    lastName: sanitize(form.lastName.value),
    email: sanitize(form.email.value),
    registeredAt: new Date().toISOString(),
  };
}

function checkBotGuards(form, loadTime, minTime = 2000) {
  if (form.querySelector('[name="website"]').value) {
    return { msg: 'Vielen Dank für Ihre Anmeldung!', type: 'success' };
  }
  if (Date.now() - loadTime < minTime) {
    return { msg: 'Bitte warten Sie einen Moment und versuchen Sie es erneut.', type: 'error' };
  }
  return null;
}
