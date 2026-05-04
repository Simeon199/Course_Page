/* Nav: Scrolled-State */

window.addEventListener('scroll', () => {
  document.querySelector('nav').classList.toggle('nav-scrolled', window.scrollY > 40);
});

/* WEBINAR-ANMELDEFORMULAR */

const WEBHOOK_URL = 'https://n8n.lernenlernenleichtgemacht.de/webhook-test/webinar-anmeldung';
const MIN_SUBMIT_TIME_MS = 3000;

function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.trim();
}

function showStatus(statusEl, msg, type) {
  statusEl.textContent = msg;
  statusEl.className   = `form-status ${type}`;
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
  if (input.maxLength > 0 && value.length > input.maxLength) return `Maximal ${input.maxLength} Zeichen erlaubt.`;
  return '';
}

function validateField(form, input) {
  const message = getValidationMessage(input);
  const errorEl = form.querySelector(`[data-for="${input.id}"]`);
  if (errorEl) errorEl.textContent = message;
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
    firstName:    sanitize(form.firstName.value),
    lastName:     sanitize(form.lastName.value),
    email:        sanitize(form.email.value),
    registeredAt: new Date().toISOString(),
  };
}

function setSubmitting(submitBtn, statusEl) {
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Wird gesendet…';
  statusEl.textContent  = '';
  statusEl.className    = 'form-status';
}

function resetSubmitting(submitBtn) {
  submitBtn.disabled    = false;
  submitBtn.textContent = 'Kostenlos anmelden';
}

async function sendPayload(payload) {
  const response = await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

function checkBotGuards(form, loadTime) {
  if (form.querySelector('[name="website"]').value) {
    return { msg: 'Vielen Dank für Ihre Anmeldung!', type: 'success' };
  }
  if (Date.now() - loadTime < MIN_SUBMIT_TIME_MS) {
    return { msg: 'Bitte warten Sie einen Moment und versuchen Sie es erneut.', type: 'error' };
  }
  return null;
}

async function performSubmit(form, submitBtn, statusEl) {
  setSubmitting(submitBtn, statusEl);
  try {
    await sendPayload(collectPayload(form));
    showStatus(statusEl, 'Anmeldung erfolgreich! Sie erhalten in Kürze eine Bestätigungs-E-Mail.', 'success');
    form.reset();
  } catch (error) {
    console.error('Anmeldefehler:', error);
    showStatus(statusEl, 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'error');
  } finally {
    resetSubmitting(submitBtn);
  }
}

// function registerLiveValidation(form) {
//   form.querySelectorAll('input[required]').forEach(input => {
//     input.addEventListener('blur', () => validateField(form, input));
//     input.addEventListener('input', () => {
//       if (input.classList.contains('invalid')) validateField(form, input);
//     });
//   });
// }

// function registerSubmitHandler(form, submitBtn, statusEl, loadTime) {
//   form.addEventListener('submit', async e => {
//     e.preventDefault();
//     const guard = checkBotGuards(form, loadTime);
//     if (guard) { showStatus(statusEl, guard.msg, guard.type); return; }
//     if (!validateAll(form)) return;
//     await performSubmit(form, submitBtn, statusEl);
//   });
// }

// document.addEventListener('DOMContentLoaded', () => {
//   const form      = document.getElementById('webinar-form');
//   const submitBtn = document.getElementById('submit-btn');
//   const statusEl  = document.getElementById('form-status');
//   registerLiveValidation(form);
//   registerSubmitHandler(form, submitBtn, statusEl, Date.now());
// });
