document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initScrollAnimations();
  initHamburger();
  initFaqAccordion();
  initJourneyAnimation();
  initSalesNotice();
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

// --- FAQ Accordion ---

/**
 * Fades and slides the FAQ answer text in or out with GSAP, synced to the
 * CSS grid-row height transition. No-ops if GSAP is unavailable or the user
 * prefers reduced motion.
 * @param {HTMLElement} inner - The .FAQ-answer-inner element to animate
 * @param {boolean} shouldOpen - Whether the answer is opening or closing
 */

function animateFaqText(inner, shouldOpen) {
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  gsap.fromTo(inner,
    { opacity: shouldOpen ? 0 : 1, y: shouldOpen ? 8 : 0 },
    { opacity: shouldOpen ? 1 : 0, y: shouldOpen ? 0 : 8, duration: 0.25, delay: shouldOpen ? 0.15 : 0, ease: 'power1.out' }
  );
}

/**
 * Opens or closes a single FAQ item, syncs its ARIA state, and animates its text.
 * @param {HTMLElement} item - The .FAQ-item element to update
 * @param {boolean} shouldOpen - Whether the item should end up open
 */

function setFaqItemOpen(item, shouldOpen) {
  let button = item.querySelector('.FAQ-question');
  let answer = item.querySelector('.FAQ-answer');
  item.classList.toggle('open', shouldOpen);
  button.setAttribute('aria-expanded', String(shouldOpen));
  answer.setAttribute('aria-hidden', String(!shouldOpen));
  animateFaqText(item.querySelector('.FAQ-answer-inner'), shouldOpen);
}

/**
 * Closes every FAQ item except the one passed in, enforcing single-open behavior.
 * @param {HTMLElement} currentItem - The FAQ item to keep open
 * @param {NodeListOf<HTMLElement>} allItems - All .FAQ-item elements in the section
 */

function closeOtherFaqItems(currentItem, allItems) {
  allItems.forEach(item => {
    if (item !== currentItem) {
      setFaqItemOpen(item, false);
    }
  });
}

/**
 * Initializes accordion behavior for the FAQ section.
 * Clicking a question opens its answer and closes any other open item.
 */

function initFaqAccordion() {
  let items = document.querySelectorAll('.FAQ-item');
  items.forEach(item => {
    let button = item.querySelector('.FAQ-question');
    if (!button) return;
    button.addEventListener('click', () => {
      let isOpen = item.classList.contains('open');
      closeOtherFaqItems(item, items);
      setFaqItemOpen(item, !isOpen);
    });
  });
}

// --- Journey Path Progress Animation ---

/**
 * Removes the static "current" fallback marker from the last journey stop so
 * the scroll-driven animation can reveal it progressively instead.
 * @param {HTMLElement} path - The .journey-path container
 */

function resetJourneyFallback(path) {
  let current = path.querySelector('.journey-stop.current');
  if (current) {
    current.classList.remove('current');
  }
}

/**
 * Animates the amber progress line growing from top to bottom of the
 * journey path, scrubbed to the user's scroll position.
 * @param {HTMLElement} path - The .journey-path container
 * @param {HTMLElement} fill - The .journey-path-fill overlay element
 */

function animateJourneyLine(path, fill) {
  gsap.to(fill, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: path, start: 'top 60%', end: 'bottom 60%', scrub: true }
  });
}

/**
 * Marks each journey stop as "reached" once it scrolls past the same
 * viewport line the progress line is scrubbed against, keeping both in sync.
 * @param {NodeListOf<HTMLElement>} stops - All .journey-stop elements in the path
 */

function animateJourneyStops(stops) {
  stops.forEach(stop => {
    ScrollTrigger.create({
      trigger: stop,
      start: 'top 60%',
      once: true,
      toggleClass: { targets: stop, className: 'reached' }
    });
  });
}

/**
 * Initializes the scroll-driven journey progress animation (line fill and
 * stop markers). No-ops if GSAP/ScrollTrigger are missing or the user
 * prefers reduced motion, leaving the static "current" fallback in place.
 */

function initJourneyAnimation() {
  let path = document.querySelector('.journey-path');
  let fill = document.querySelector('.journey-path-fill');
  if (!path || !fill || !window.gsap || !window.ScrollTrigger) {
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  resetJourneyFallback(path);
  animateJourneyLine(path, fill);
  animateJourneyStops(path.querySelectorAll('.journey-stop'));
}

// --- Sitewide Sales Notice ---

const SALES_NOTICE_DISMISSED_KEY = 'salesNoticeDismissed';

/**
 * Builds the dismissible sitewide banner informing visitors that the site
 * is already public but real course purchases are not enabled yet.
 * @returns {HTMLElement} The constructed banner element
 */

function createSalesNotice() {
  let notice = document.createElement('div');
  notice.className = 'sitewide-notice';
  notice.setAttribute('role', 'status');
  notice.innerHTML = `
    <div class="sitewide-notice-inner">
      <span class="sitewide-notice-text">Hinweis: Unsere Website ist bereits online – der Kursverkauf startet jedoch erst in Kürze. Vielen Dank für Ihre Geduld!</span>
      <button class="sitewide-notice-close" type="button" aria-label="Hinweis schließen">&times;</button>
    </div>
  `;
  return notice;
}

/**
 * Shows the sitewide sales notice unless it was already dismissed earlier
 * in this browser session, and wires up its close button.
 */

function initSalesNotice() {
  if (sessionStorage.getItem(SALES_NOTICE_DISMISSED_KEY)) {
    return;
  }
  let notice = createSalesNotice();
  document.body.prepend(notice);
  notice.querySelector('.sitewide-notice-close').addEventListener('click', () => {
    notice.remove();
    sessionStorage.setItem(SALES_NOTICE_DISMISSED_KEY, 'true');
  });
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
//     firstname: sanitize(form.firstname.value),
//     lastname: sanitize(form.lastname.value),
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