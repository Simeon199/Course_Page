'use strict';

/**
 * Source of the next webinar's configuration.
 * Currently reads a static JSON config. To switch to an n8n webhook later,
 * only this function needs to change (e.g. fetch the webhook URL instead).
 * @returns {Promise<Object|null>} The `nextWebinar` object, or null if unavailable.
 */
async function fetchWebinarConfig() {
  try {
    const response = await fetch('webinar-config.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.nextWebinar ?? null;
  } catch {
    return null;
  }
}

/**
 * Parses an ISO date string into a valid Date, or null if invalid.
 * @param {string|undefined} isoString - The ISO 8601 start string.
 * @returns {Date|null} A valid Date, otherwise null.
 */
function parseDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date as a long German date (e.g. "15. September 2026").
 * @param {Date} date - The date to format.
 * @param {string|undefined} timeZone - IANA time zone for consistent display.
 * @returns {string} The localized date string.
 */
function formatWebinarDate(date, timeZone) {
  const options = { day: 'numeric', month: 'long', year: 'numeric', timeZone };
  return new Intl.DateTimeFormat('de-DE', options).format(date);
}

/**
 * Formats a date as a German clock time with unit (e.g. "19:00 Uhr").
 * @param {Date} date - The date to format.
 * @param {string|undefined} timeZone - IANA time zone for consistent display.
 * @returns {string} The localized time string.
 */
function formatWebinarTime(date, timeZone) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone };
  return `${new Intl.DateTimeFormat('de-DE', options).format(date)} Uhr`;
}

/**
 * Formats a duration in minutes as an approximate label (e.g. "ca. 60 Min.").
 * @param {number} minutes - The duration in minutes.
 * @returns {string} The duration label.
 */
function formatDuration(minutes) {
  return `ca. ${minutes} Min.`;
}

/**
 * Writes a value into the date-row field carrying the given data-field name.
 * @param {string} name - The data-field identifier.
 * @param {string} value - The text to display.
 * @returns {void}
 */
function setDateField(name, value) {
  const el = document.querySelector(`[data-field="${name}"]`);
  if (el) el.textContent = value;
}

/**
 * Populates the date-row (date, time, duration) from the webinar config.
 * @param {Object} config - The `nextWebinar` configuration object.
 * @param {Date} date - The parsed webinar start date.
 * @returns {void}
 */
function fillDateRow(config, date) {
  const timeZone = config.timezoneLabel;
  setDateField('date', formatWebinarDate(date, timeZone));
  setDateField('time', formatWebinarTime(date, timeZone));
  if (config.durationMinutes) {
    setDateField('duration', formatDuration(config.durationMinutes));
  }
}

/**
 * Splits a positive millisecond span into days, hours, minutes and seconds.
 * @param {number} diffMs - Remaining milliseconds until the target.
 * @returns {{days:number,hours:number,minutes:number,seconds:number}} Unit breakdown.
 */
function splitDuration(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

/**
 * Pads a number to at least two digits for stable display.
 * @param {number} value - The number to pad.
 * @returns {string} The zero-padded string.
 */
function padZero(value) {
  return String(value).padStart(2, '0');
}

/**
 * Writes the unit breakdown into the countdown's value elements.
 * @param {HTMLElement} root - The countdown container.
 * @param {{days:number,hours:number,minutes:number,seconds:number}} parts - Unit values.
 * @returns {void}
 */
function renderUnits(root, parts) {
  root.querySelector('[data-unit="days"]').textContent = padZero(parts.days);
  root.querySelector('[data-unit="hours"]').textContent = padZero(parts.hours);
  root.querySelector('[data-unit="minutes"]').textContent = padZero(parts.minutes);
  root.querySelector('[data-unit="seconds"]').textContent = padZero(parts.seconds);
}

/**
 * Toggles between the countdown and its fallback message.
 * @param {{countdown:HTMLElement,fallback:HTMLElement}} els - Countdown DOM references.
 * @param {boolean} showCountdown - Whether the live countdown should be visible.
 * @returns {void}
 */
function toggleViews(els, showCountdown) {
  els.countdown.hidden = !showCountdown;
  els.fallback.hidden = showCountdown;
}

/**
 * Performs a single tick: renders remaining time or ends the countdown on expiry.
 * @param {Date} target - The webinar start date.
 * @param {{countdown:HTMLElement,fallback:HTMLElement}} els - Countdown DOM references.
 * @returns {boolean} True while counting down, false once the target is reached.
 */
function tick(target, els) {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) {
    toggleViews(els, false);
    return false;
  }
  renderUnits(els.countdown, splitDuration(diffMs));
  return true;
}

/**
 * Starts the per-second countdown loop toward the given target date.
 * @param {Date} target - The webinar start date.
 * @param {{countdown:HTMLElement,fallback:HTMLElement}} els - Countdown DOM references.
 * @returns {void}
 */
function startCountdown(target, els) {
  toggleViews(els, true);
  tick(target, els);
  const intervalId = setInterval(() => {
    if (!tick(target, els)) clearInterval(intervalId);
  }, 1000);
}

/**
 * Collects the countdown DOM references used across the module.
 * @returns {{countdown:HTMLElement,fallback:HTMLElement}|null} References, or null if missing.
 */
function getCountdownElements() {
  const countdown = document.getElementById('countdown');
  const fallback = document.getElementById('countdown-fallback');
  if (!countdown || !fallback) return null;
  return { countdown, fallback };
}

/**
 * Bootstraps the webinar UI: loads the config, syncs the date-row and countdown.
 * @returns {Promise<void>} Resolves once the initial state is applied.
 */
async function initWebinarCountdown() {
  const els = getCountdownElements();
  if (!els) return;
  const config = await fetchWebinarConfig();
  const date = parseDate(config?.start);
  if (config && date) fillDateRow(config, date);
  if (date && date.getTime() > Date.now()) startCountdown(date, els);
  else toggleViews(els, false);
}

document.addEventListener('DOMContentLoaded', initWebinarCountdown);
