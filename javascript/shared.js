document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollAnimations();
  initHamburger();
});

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 40);
});

/**
 * Scrollt die Seite zu einem bestimmten Element mit Berücksichtigung der Navigationsleiste.
 * @param {HTMLElement} target - Das Ziel-Element, zu dem gescrollt werden soll
 */
function scrollToTarget(target) {
  let navHeight = document.querySelector('nav').offsetHeight;
  let targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
  animateScroll(window.scrollY, targetTop - window.scrollY, 700);
}

/**
 * Initialisiert sanfte Scroll-Animation für alle Anker-Links auf der Seite.
 * Verhindert das Standard-Scroll-Verhalten und nutzt stattdessen animateScroll().
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (event) {
      event.preventDefault();
      let target = document.querySelector(this.getAttribute('href'));
      if (target) {
        scrollToTarget(target);
      }
    });
  });
}

/**
 * Animiert das Scrollen der Seite mit einer Easing-Funktion.
 * @param {number} start - Die Startposition des Scrolls in Pixeln
 * @param {number} distance - Die Distanz, die gescrollt werden soll, in Pixeln
 * @param {number} duration - Die Dauer der Animation in Millisekunden
 */
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

/**
 * Easing-Funktion für sanfte Scroll-Animationen (Cubic In-Out).
 * @param {number} t - Der Fortschritt der Animation (0 bis 1)
 * @returns {number} Der eased Fortschritt
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Leitet den Benutzer zur Hauptseite weiter.
 */
function redirectToMainPage(){
  window.location.href = "../index.html"
}

// --- Scroll Animations ---

/**
 * Weist Animations-Klassen zu Elementen zu.
 * Ungerade Elemente erhalten 'reveal-left', gerade Elemente 'reveal-right'.
 */
function assignRevealClasses() {
  document.querySelectorAll('main > *:not(.hero)').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
  });
}

/**
 * Erstellt einen IntersectionObserver für Scroll-Animationen.
 * Fügt die 'active'-Klasse hinzu, wenn ein Element in den Viewport kommt.
 * @returns {IntersectionObserver} Der konfigurierte Observer
 */
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

/**
 * Initialisiert Scroll-Animationen für alle Elemente auf der Seite.
 * Weist Animations-Klassen zu und beobachtet Elemente mit IntersectionObserver.
 * Triggert Animationen auch für Elemente, die beim initialen Laden bereits sichtbar sind.
 */
function initScrollAnimations() {
  assignRevealClasses();
  let observer = createScrollObserver();
  document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
  
  // Trigger animation for elements already in viewport on page load
  setTimeout(() => {
    document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add('active');
        observer.unobserve(el);
      }
    });
  }, 100);
}

// --- Hamburger Menu ---

/**
 * Schließt das Hamburger-Menü durch Entfernen der 'open'-Klasse.
 */
function closeMenu() {
  let hamburger = document.getElementById('hamburger');
  let navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
}

/**
 * Initialisiert das Hamburger-Menü für mobile Navigation.
 * Togglet die 'open'-Klasse beim Klick und schließt das Menü beim Klick auf Links.
 */
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

// function sanitize(str) {
//   let div = document.createElement('div');
//   div.textContent = str;
//   return div.innerHTML.trim();
// }

// function showStatus(statusEl, msg, type) {
//   statusEl.textContent = msg;
//   statusEl.className = `form-status ${type}`;
// }

// function getValidationMessage(input) {
//   let value = input.value.trim();
//   if (input.type === 'checkbox') {
//     return input.checked ? '' : 'Bitte stimmen Sie der Datenschutzerklärung zu.';
//   }
//   if (input.required && !value) return 'Dieses Feld ist erforderlich.';
//   if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//     return 'Bitte eine gültige E-Mail-Adresse eingeben.';
//   }
//   if (input.maxLength > 0 && value.length > input.maxLength) {
//     return `Maximal ${input.maxLength} Zeichen erlaubt.`;
//   }
//   return '';
// }

// function validateField(form, input) {
//   let message = getValidationMessage(input);
//   let errorEl = form.querySelector(`[data-for="${input.id}"]`);
//   if (errorEl) {
//     errorEl.textContent = message;
//   }
//   input.classList.toggle('invalid', !!message);
//   return !message;
// }

// function validateAll(form) {
//   let isValid = true;
//   form.querySelectorAll('input[required]').forEach(input => {
//     if (!validateField(form, input)) {
//       isValid = false;
//     }
//   });
//   return isValid;
// }

// function collectPayload(form) {
//   return {
//     firstName: sanitize(form.firstName.value),
//     lastName: sanitize(form.lastName.value),
//     email: sanitize(form.email.value),
//     registeredAt: new Date().toISOString(),
//   };
// }

// function checkBotGuards(form, loadTime, minTime = 2000) {
//   if (form.querySelector('[name="website"]').value) {
//     return { msg: 'Vielen Dank für Ihre Anmeldung!', type: 'success' };
//   }
//   if (Date.now() - loadTime < minTime) {
//     return { msg: 'Bitte warten Sie einen Moment und versuchen Sie es erneut.', type: 'error' };
//   }
//   return null;
// }
