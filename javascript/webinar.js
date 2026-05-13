/* WEBINAR-ANMELDEFORMULAR */

// let WEBHOOK_URL = 'https://n8n.lernenlernenleichtgemacht.de/webhook-test/webinar-anmeldung';
// let MIN_SUBMIT_TIME_MS = 3000;

// function setSubmitting(submitBtn, statusEl) {
//   submitBtn.disabled    = true;
//   submitBtn.textContent = 'Wird gesendet…';
//   statusEl.textContent  = '';
//   statusEl.className    = 'form-status';
// }

// function resetSubmitting(submitBtn) {
//   submitBtn.disabled    = false;
//   submitBtn.textContent = 'Kostenlos anmelden';
// }

// async function sendPayload(payload) {
//   let response = await fetch(WEBHOOK_URL, {
//     method:  'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body:    JSON.stringify(payload),
//   });
//   if(!response.ok){
//     throw new Error(`HTTP ${response.status}`)
//   };
// }

// async function performSubmit(form, submitBtn, statusEl) {
//   setSubmitting(submitBtn, statusEl);
//   try {
//     await sendPayload(collectPayload(form));
//     showStatus(statusEl, 'Anmeldung erfolgreich! Sie erhalten in Kürze eine Bestätigungs-E-Mail.', 'success');
//     form.reset();
//   } catch (error) {
//     console.error('Anmeldefehler:', error);
//     showStatus(statusEl, 'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.', 'error');
//   } finally {
//     resetSubmitting(submitBtn);
//   }
// }

// document.addEventListener('DOMContentLoaded', () => {
//   let form      = document.getElementById('webinar-form');
//   let submitBtn = document.getElementById('submit-btn');
//   let statusEl  = document.getElementById('form-status');
//   let loadTime  = Date.now();

//   if (!form) {
//     return;
//   }

//   form.addEventListener('submit', async event => {
//     event.preventDefault();
//     let guard = checkBotGuards(form, loadTime, MIN_SUBMIT_TIME_MS);
//     if (guard){ 
//       showStatus(statusEl, guard.msg, guard.type); 
//       return; 
//     }
//     if (!validateAll(form)){
//       return;
//     } 
//     await performSubmit(form, submitBtn, statusEl);
//   });
// });
