document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollAnimations();
  initHamburger();
});

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 40);
});

/**
 * Scrolls the page to a specific element, accounting for the navigation bar height.
 * @param {HTMLElement} target - The target element to scroll to
 */
function scrollToTarget(target) {
  let navHeight = document.querySelector('nav').offsetHeight;
  let targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
  animateScroll(window.scrollY, targetTop - window.scrollY, 700);
}

/**
 * Initializes smooth scroll animation for all anchor links on the page.
 * Prevents default scroll behavior and uses animateScroll() instead.
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
 * Animates page scrolling with an easing function.
 * @param {number} start - The starting scroll position in pixels
 * @param {number} distance - The distance to scroll in pixels
 * @param {number} duration - The animation duration in milliseconds
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
 * Easing function for smooth scroll animations (Cubic In-Out).
 * @param {number} t - The animation progress (0 to 1)
 * @returns {number} The eased progress value
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Redirects the user to the main page.
 */
function redirectToMainPage(){
  window.location.href = "../index.html"
}

// --- Scroll Animations ---

/**
 * Assigns animation classes to elements.
 * Odd-indexed elements receive 'reveal-left', even-indexed elements receive 'reveal-right'.
 */
function assignRevealClasses() {
  document.querySelectorAll('main > *:not(.hero)').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
  });
}

/**
 * Creates an IntersectionObserver for scroll animations.
 * Adds the 'active' class when an element enters the viewport.
 * @returns {IntersectionObserver} The configured observer instance
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
 * Initializes scroll animations for all elements on the page.
 * Assigns animation classes and observes elements with IntersectionObserver.
 * Triggers animations for elements that are already visible on initial page load.
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
 * Closes the hamburger menu by removing the 'open' class.
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
 * Initializes the hamburger menu for mobile navigation.
 * Toggles the 'open' class on click and closes the menu when links are clicked.
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
