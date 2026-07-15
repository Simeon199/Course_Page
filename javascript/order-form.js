document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.order-form').forEach(setupOrderForm);
});

/**
 * Wires up submit handling for a single course order form.
 * @param {HTMLFormElement} form - The order form element.
 */
function setupOrderForm(form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }
    window.location.href = buildMailtoUrl(form);
  });
}

/**
 * Builds a mailto: URL prefilled with the course order request.
 * @param {HTMLFormElement} form - The order form element.
 * @returns {string} The mailto URL.
 */
function buildMailtoUrl(form) {
  let course = form.dataset.course;
  let name = form.querySelector('[name="name"]').value.trim();
  let email = form.querySelector('[name="email"]').value.trim();
  let subject = `Kursanfrage: ${course}`;
  let body = `Name: ${name}\nE-Mail: ${email}\nGewählter Kurs: ${course}`;
  return `mailto:info@rein-campus.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
