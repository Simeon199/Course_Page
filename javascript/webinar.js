let WEBHOOK_URL = 'https://n8n.lernenlernenleichtgemacht.de/webhook-test/39ce9bf9-6ed9-47bb-b551-9a9e4cf775e3';
let MIN_SUBMIT_TIME_MS = 3000;
let defaultSuccessMessage = 'Anmeldung erfolgreich! Sie erhalten in Kürze eine Bestätigungs-E-Mail.';

let schema = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string' },
  timezone: { type: 'string' },
  webinarId: { type: 'integer' },
  webinarDateIds: { type: 'array' },
  privacy: { type: 'boolean' }
}

document.addEventListener('DOMContentLoaded', () => {
  let form      = document.getElementById('webinar-form');
  let submitBtn = document.getElementById('submit-btn');
  let statusEl  = document.getElementById('form-status');
  let loadTime  = Date.now();

  if (!form) {
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    let guard = checkBotGuards(form, loadTime, MIN_SUBMIT_TIME_MS);
    if (guard){ 
      showStatus(statusEl, guard.msg, guard.type); 
      return; 
    }
    if (!validateAll(form)){
      return;
    } 
    await performSubmit(form, submitBtn, statusEl);
  });
});

function checkBotGuards(form, loadTime, minSubmitTimeMs) {
  let currentTime = Date.now();
  let elapsedTime = currentTime - loadTime;
  
  if (elapsedTime < minSubmitTimeMs) {
    return {
      msg: 'Bitte warten Sie einen Moment, bevor Sie das Formular absenden.',
      type: 'error'
    };
  }
  
  return null;
}

function showStatus(statusEl, message, type) {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
}

function validateField(name, value) {
  switch(name) {
    case 'firstName':
    case 'lastName':
      handleLastNameCase(name, value);
      break;
    case 'email':
      handleEmailCase(value);
      break;
    case 'timezone':
      break;
    case 'privacy':
      handlePrivacyCheckboxCase();
      break;
  }
  return null;
}

function handleLastNameCase(name, value){
  if (!isLastNameValid(value)) {
    return `${name === 'firstName' ? 'Vorname' : 'Nachname'} zu kurz`
  };
}

function handleEmailCase(value){
  if (!isEmailValid(value)){
    return 'Ungültige E-Mail';
  }
}

function handleTimeZoneCase(value){
  if (!isTimeZoneValid(value)){
    return 'Zeitzone erforderlich';
  }
}

function handlePrivacyCheckboxCase(){
  if (isPrivacyCheckboxInvalid()){
    return 'Datenschutz zustimmen erforderlich';
  }
}

function isLastNameValid(value){
  return value && value.trim().length >= 2;
}

function isEmailValid(value){
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isTimeZoneValid(value){
  return !!value;
}

function isPrivacyCheckboxInvalid(){
  return !document.getElementById('privacy').checked;
}

function validateAll(form) {
  let isValid = true;
  let inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
  });
  
  // Email-Validierung
  let emailInput = form.querySelector('input[type="email"]');
  if (emailInput && emailInput.value.trim()) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      isValid = false;
      emailInput.classList.add('error');
    }
  }
  
  if (!isValid) {
    showStatus(form.querySelector('#form-status'), 'Bitte füllen Sie alle erforderlichen Felder korrekt aus.', 'error');
  }
  
  return isValid;
}

async function performSubmit(form, submitBtn, statusEl) {
  setSubmitting(submitBtn, statusEl);
  try {
    await submittingForm(form);
  } catch (error) {
    handleErrorScenario(error);
  } finally {
    resetSubmitting(submitBtn);
  }
}

async function submittingForm(form){
  let payload = collectPayload(form, schema);
  let result = await sendPayload(payload);
    
  if (result.success) {
    showSuccess(defaultSuccessMessage);
    handleSuccessfullSubmit(form, result);
  } else {
    showError(result.error || 'Anmeldung fehlgeschlagen');
  }
}

function handleSuccessfullSubmit(form, result){
  form.reset();    
  if (isWebinarLinkValid(result)) {
    setTimeout(() => {
      window.location.href = result.webinarLink;
    }, 2000);
  }
}

function isWebinarLinkValid(result){
  return result.webinarLink && result.webinarLink.startsWith('https://');
}

function handleErrorScenario(error){
  console.error('Anmeldefehler:', error);
  if (error.name === 'AbortError') {
    showError('Request Timeout - bitte versuchen Sie es später');
  } else {
    showError('Netzwerkfehler - prüfen Sie Ihre Verbindung');
  }
}

function setSubmitting(submitBtn, statusEl) {
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Wird gesendet…';
  statusEl.textContent  = '';
  statusEl.className    = 'form-status';
}

async function sendPayload(payload) {
  let response = await fetch(WEBHOOK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
    signal:  AbortSignal.timeout(10000)
  });
  if(!response.ok){
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return await response.json();
}

function collectPayload(form, fieldSchema){
  let formData = new FormData(form);
  let payload = {};

  formData.forEach((value, key) => {
    if(!fieldSchema[key]){
      return ;
    }

    let config = fieldSchema[key];

    if(isDatatype(config.type, "integer")){ 
      payload[key] = parseInt(value, 10);
    } else if(isDatatype(config.type, "array")){ 
      payload[key] = value.split(',').map(value => parseInt(value.trim(), 10)).filter(value => !isNaN(value));
    } else if(isDatatype(config.type, "boolean")){ 
      payload[key] = form.querySelector(`[name="${key}"]`).checked;
    } else {
      payload[key] = value;
    }
  });
  
  return payload;
}

function isDatatype(configType, dataType){
  return configType == dataType;
}

function resetSubmitting(submitBtn) {
  submitBtn.disabled    = false;
  submitBtn.textContent = 'Kostenlos anmelden';
}

function showError(message) {
  let statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = `<div class="form-status__error">${message}</div>`;
  statusDiv.classList.add('form-status--error');
}

function showSuccess(message) {
  let statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = `<div class="form-status__success">${message}</div>`;
  statusDiv.classList.add('form-status--success');
}

function showLoading(message) {
  let statusDiv = document.getElementById('form-status');
  statusDiv.innerHTML = `<div class="form-status__loading">${message}</div>`;
  statusDiv.classList.add('form-status--loading');
}
