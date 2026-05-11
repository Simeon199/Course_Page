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
  initWebinarModal();
});
