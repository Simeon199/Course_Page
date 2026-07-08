'use strict';

/**
 * Source of the next webinar's start date.
 * Currently reads a static JSON config. To switch to an n8n webhook later,
 * only this function needs to change (e.g. fetch the webhook URL instead).
 * @returns {Promise<string|null>} ISO 8601 start string, or null if unavailable.
 */
async function fetchNextWebinarStart() {
  try {
    const response = await fetch('webinar-config.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.nextWebinar?.start ?? null;
  } catch {
    return null;
  }
}

/**
 * Parses an ISO date string into a future Date, or null if invalid/past.
 * @param {string|null} isoString - The ISO 8601 start string.
 * @returns {Date|null} A valid future Date, otherwise null.
 */
function parseFutureDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.getTime() > Date.now() ? date : null;
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
 * Bootstraps the webinar countdown: loads the date and starts or falls back.
 * @returns {Promise<void>} Resolves once the initial state is applied.
 */
async function initWebinarCountdown() {
  const els = getCountdownElements();
  if (!els) return;
  const target = parseFutureDate(await fetchNextWebinarStart());
  if (target) startCountdown(target, els);
  else toggleViews(els, false);
}

document.addEventListener('DOMContentLoaded', initWebinarCountdown);
