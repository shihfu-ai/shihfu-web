// lib/geo.js
// Everything that depends on the business's country: phone numbers and dial
// codes, time zones, currency, units and date/number formats. The server
// (shihfu-api/src/utils/geo.js) is the authority and re-checks everything;
// this module lets the forms guide people before they submit.
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { getCountry, getCountryForTimezone } from 'countries-and-timezones';
import countryToCurrency from 'country-to-currency';
import { getStaff } from './api';

const regionNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export const countryName = (code) => {
  try { return (regionNames && regionNames.of(code)) || code; } catch { return code; }
};

// Every country with a calling code, sorted by name. libphonenumber also
// lists a few special codes (Ascension and similar) that have no name; skip them.
export const COUNTRIES = getCountries()
  .map(code => ({ code, name: countryName(code), dial: getCountryCallingCode(code) }))
  .filter(c => c.name && c.name !== c.code)
  .sort((a, b) => a.name.localeCompare(b.name));

export const dialCode = (code) => { try { return String(getCountryCallingCode(code)); } catch { return ''; } };

// Countries that span several zones: the first alphabetical entry is rarely the sensible default
const PRIMARY_TZ = {
  US: 'America/New_York', CA: 'America/Toronto', AU: 'Australia/Sydney', BR: 'America/Sao_Paulo',
  RU: 'Europe/Moscow', MX: 'America/Mexico_City', ID: 'Asia/Jakarta', CN: 'Asia/Shanghai',
  KZ: 'Asia/Almaty', AR: 'America/Argentina/Buenos_Aires', CL: 'America/Santiago', CD: 'Africa/Kinshasa',
  MN: 'Asia/Ulaanbaatar', PT: 'Europe/Lisbon', ES: 'Europe/Madrid', EC: 'America/Guayaquil',
  NZ: 'Pacific/Auckland', GL: 'America/Nuuk', UA: 'Europe/Kyiv', FM: 'Pacific/Pohnpei',
};

export function timezonesFor(code) {
  const c = getCountry(code);
  return c ? c.timezones : [];
}

export function defaultTimezone(code) {
  const zones = timezonesFor(code);
  // The visitor's own device zone, if it is one of this country's zones
  try {
    const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (mine && zones.includes(mine)) return mine;
  } catch { /* use the country default */ }
  return PRIMARY_TZ[code] || zones[0] || 'UTC';
}

// "America/New_York (UTC-05:00)"
export function timezoneLabel(tz) {
  try {
    const part = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'longOffset' })
      .formatToParts(new Date()).find(p => p.type === 'timeZoneName');
    const off = part ? part.value.replace('GMT', 'UTC') : '';
    return `${tz.replace(/_/g, ' ')}${off ? ` (${off === 'UTC' ? 'UTC+00:00' : off})` : ''}`;
  } catch { return tz; }
}

// Best guess at the visitor's country from their device, used to preselect it
export function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fromTz = tz && getCountryForTimezone(tz);
    if (fromTz && COUNTRIES.some(c => c.code === fromTz.id)) return fromTz.id;
    const region = (navigator.language || '').split('-')[1];
    if (region && COUNTRIES.some(c => c.code === region.toUpperCase())) return region.toUpperCase();
  } catch { /* fall through */ }
  return '';
}

export const currencyFor = (code) => (countryToCurrency.default || countryToCurrency)[code] || 'USD';

export function currencySymbol(currency, locale = 'en') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0).find(p => p.type === 'currency').value;
  } catch { return currency; }
}

export function localeFor(code) {
  try { new Intl.DateTimeFormat(`en-${code}`); return `en-${code}`; } catch { return 'en'; }
}

const SQFT = new Set(['US', 'IN', 'PK', 'BD', 'LK', 'NP', 'GB', 'CA', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'HK', 'SG', 'MY', 'PH', 'LR', 'MM']);
const POUNDS = new Set(['US', 'LR', 'MM']);
const MILES = new Set(['US', 'LR', 'MM', 'GB']);
export function unitsFor(code) {
  return { weight: POUNDS.has(code) ? 'lb' : 'kg', distance: MILES.has(code) ? 'mi' : 'km', area: SQFT.has(code) ? 'sq ft' : 'sq m' };
}

// ─── Phone numbers ───────────────────────────────────────────────
// Returns { ok, national, error }. `national` is what the server stores.
export function checkPhone(raw, code) {
  const text = String(raw || '').trim();
  if (!text) return { ok: false, error: 'Enter a phone number' };
  const p = parsePhoneNumberFromString(text, code);
  const valid = p && p.isValid() && String(p.countryCallingCode) === dialCode(code)
    && (code !== 'IN' || /^[6-9]\d{9}$/.test(String(p.nationalNumber)));
  if (!valid) return { ok: false, error: `Enter a valid phone number for ${countryName(code)}` };
  return { ok: true, national: String(p.nationalNumber) };
}

// Stored national number -> "+1 415 555 2671"
export function formatPhone(national, code) {
  if (!national) return '';
  try {
    const p = parsePhoneNumberFromString(`+${dialCode(code)}${national}`);
    if (p) return p.formatInternational();
  } catch { /* fall back below */ }
  return `+${dialCode(code)} ${national}`;
}

// What to show as the example inside a phone box
export function phonePlaceholder(code) {
  const examples = { IN: '98765 43210', US: '(415) 555-2671', CA: '(604) 555-0199', GB: '07911 123456', AU: '0412 345 678', AE: '050 123 4567', SG: '9123 4567', DE: '0151 23456789', FR: '06 12 34 56 78', BR: '(11) 91234-5678', JP: '090-1234-5678', ZA: '082 123 4567', NZ: '021 123 4567' };
  return examples[code] || 'Your mobile number';
}

// ─── The signed-in business ──────────────────────────────────────
// Everyone who signed up before countries existed is Indian, and their
// stored session has no country fields, so default to what they had.
// What the server renders before the signed-in business is known (everyone
// before countries existed was Indian). Use as the initial state, then call
// getGeo() in an effect, so server and browser render the same first frame.
export const DEFAULT_GEO = {
  countryCode: 'IN', countryName: 'India', dialCode: '91', timezone: 'Asia/Kolkata', currency: 'INR',
  units: { weight: 'kg', distance: 'km', area: 'sq ft' }, locale: 'en-IN',
};

export function getGeo() {
  const s = getStaff() || {};
  const countryCode = s.countryCode || 'IN';
  const timezone = s.timezone || (s.countryCode ? defaultTimezone(countryCode) : 'Asia/Kolkata');
  const currency = s.currency || currencyFor(countryCode);
  return {
    countryCode, countryName: s.countryName || countryName(countryCode),
    dialCode: s.dialCode || dialCode(countryCode),
    timezone, currency,
    units: s.units ? { ...unitsFor(countryCode), ...s.units } : unitsFor(countryCode),
    locale: s.locale || localeFor(countryCode),
  };
}

// ─── Formatting in the business's zone and locale ────────────────
export const fmtMoney = (amount, geo) => {
  try { return new Intl.NumberFormat(geo.locale, { style: 'currency', currency: geo.currency, maximumFractionDigits: 2 }).format(Number(amount)); }
  catch { return `${geo.currency} ${amount}`; }
};

// value: ISO string, Date or 'YYYY-MM-DD'. Date-only values are calendar
// dates with no time zone, so they are formatted as-is in UTC.
export function fmtDate(value, geo, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const dateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (isNaN(d)) return '';
  return d.toLocaleDateString(geo.locale, { ...opts, timeZone: dateOnly ? 'UTC' : geo.timezone });
}
export const fmtTime = (value, geo) =>
  new Date(value).toLocaleTimeString(geo.locale, { hour: 'numeric', minute: '2-digit', timeZone: geo.timezone });
export const fmtDateTime = (value, geo, opts = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) =>
  new Date(value).toLocaleString(geo.locale, { ...opts, timeZone: geo.timezone });

// "2026-10-20T14:30" typed in a datetime-local box, meaning 14:30 in `tz`
// (not in the browser's zone) -> UTC ISO string.
function offsetMs(utcMs, tz) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(utcMs));
  const g = (t) => Number(p.find(x => x.type === t).value);
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - utcMs;
}
export function zonedInputToISO(value, tz) {
  const [d, t] = value.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  const wall = Date.UTC(y, m - 1, day, hh, mm);
  let guess = wall - offsetMs(wall, tz);
  guess = wall - offsetMs(guess, tz);   // second pass settles daylight-saving edges
  return new Date(guess).toISOString();
}

// Today's calendar date (YYYY-MM-DD) where the business is, not where the server or browser is
export const todayIn = (tz) => new Date().toLocaleDateString('en-CA', { timeZone: tz });
