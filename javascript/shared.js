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
 * No-ops on pages without a `.hero` section (e.g. the legal pages), since
 * those should render without scroll-reveal animations.
 */

function initScrollAnimations() {
  if (!document.querySelector('.hero')) {
    return;
  }
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
 * Pushes the fixed nav down by the given amount so it stops overlapping
 * content rendered above it, such as the sitewide sales notice.
 * @param {number} offsetPx - Offset in pixels to apply to the nav's top
 */

function setNavOffset(offsetPx) {
  document.documentElement.style.setProperty('--nav-offset', `${offsetPx}px`);
}

/**
 * Shows the sitewide sales notice on every page load and wires up its close
 * button. Dismissal is intentionally not persisted, so the notice reappears
 * on each reload until real course sales go live.
 */

function initSalesNotice() {
  let notice = createSalesNotice();
  document.body.prepend(notice);
  setNavOffset(notice.offsetHeight);
  notice.querySelector('.sitewide-notice-close').addEventListener('click', () => {
    notice.remove();
    setNavOffset(0);
  });
}