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

// --- Webinar Modal ---

function initWebinarModal() {
  const modal = document.getElementById('webinar-modal');
  const closeBtn = document.getElementById('webinar-modal-close');
  const form = document.getElementById('webinar-form');
  const statusEl = document.getElementById('form-status');
  const loadTime = Date.now();
  const MIN_SUBMIT_TIME_MS = 2000;

  if (!modal) return;

  // Modal schließen
  closeBtn.addEventListener('click', closeWebinarModal);

  // Außerhalb des Modals klicken zum Schließen
  document.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeWebinarModal();
    }
  });

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Bot-Schutz prüfen
    const botCheck = checkBotGuards(form, loadTime);
    if (botCheck) {
      showStatus(statusEl, botCheck.msg, botCheck.type);
      return;
    }

    // Validierung
    if (!validateAll(form)) {
      showStatus(statusEl, 'Bitte füllen Sie alle erforderlichen Felder aus.', 'error');
      return;
    }

    await performSubmit(form, form.querySelector('button[type="submit"]'), statusEl);
  });

  function closeWebinarModal() {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('closing');
    }, 600);
  }
}

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.trim();
}

function showStatus(statusEl, msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `form-status ${type}`;
}

function getValidationMessage(input) {
  const value = input.value.trim();
  if (input.type === 'checkbox') {
    return input.checked ? '' : 'Bitte stimmen Sie der Datenschutzerklärung zu.';
  }
  if (input.required && !value) return 'Dieses Feld ist erforderlich.';
  if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Bitte eine gültige E-Mail-Adresse eingeben.';
  }
  return '';
}

function validateField(form, input) {
  const message = getValidationMessage(input);
  input.classList.toggle('invalid', !!message);
  return !message;
}

function validateAll(form) {
  let isValid = true;
  form.querySelectorAll('input[required]').forEach(input => {
    if (!validateField(form, input)) isValid = false;
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

function checkBotGuards(form, loadTime) {
  if (form.querySelector('[name="website"]').value) {
    return { msg: 'Vielen Dank für Ihre Anmeldung!', type: 'success' };
  }
  if (Date.now() - loadTime < 2000) {
    return { msg: 'Bitte warten Sie einen Moment und versuchen Sie es erneut.', type: 'error' };
  }
  return null;
}

async function performSubmit(form, submitBtn, statusEl) {
  submitBtn.disabled = true;
  submitBtn.textContent = 'Wird gesendet…';
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  try {
    const payload = collectPayload(form);
    console.log('Anmeldung:', payload);
    
    showStatus(statusEl, 'Anmeldung erfolgreich! Sie erhalten in Kürze eine Bestätigungs-E-Mail.', 'success');
    form.reset();
    
    setTimeout(() => {
      document.getElementById('webinar-modal').classList.add('closing');
      setTimeout(() => {
        document.getElementById('webinar-modal').style.display = 'none';
      }, 600);
    }, 2000);
  } catch (error) {
    console.error('Anmeldefehler:', error);
    showStatus(statusEl, 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Jetzt anmelden';
  }
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initHamburger();
  initSmoothScroll();
  initWebinarModal();
});
