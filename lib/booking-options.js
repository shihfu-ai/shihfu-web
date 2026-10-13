// lib/booking-options.js
// Choices shared by the signup hours step and Settings > Booking.

// How long one appointment lasts. Customers book one slot of this length.
export const APPOINTMENT_LENGTHS = [
  { value:15,  label:'15 min' },
  { value:30,  label:'30 min' },
  { value:45,  label:'45 min' },
  { value:60,  label:'1 hour' },
  { value:90,  label:'1.5 hours' },
  { value:120, label:'2 hours' },
  { value:180, label:'3 hours' },
  { value:240, label:'4 hours' },
];
export const lengthLabel = (m) => APPOINTMENT_LENGTHS.find(l => l.value === Number(m))?.label || `${m} min`;
export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const toMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

// Minutes since midnight -> "10:30 AM" (or "10:30" on 24-hour devices)
export const clock = (min) =>
  new Date(Date.UTC(2000, 0, 1, Math.floor(min / 60), min % 60))
    .toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit', timeZone:'UTC' });
