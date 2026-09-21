'use client';

// Shared by the dashboard's Add/Edit Customer forms and the public quick
// check-in page, so both get the same cascading dropdowns.
const INP = {
  width:'100%', background:'white', border:'1px solid var(--border)',
  borderRadius:4, padding:'.75rem 1rem', fontFamily:"'DM Sans',sans-serif",
  fontSize:'.875rem', color:'var(--ink)', outline:'none',
};

// ─── DynamicField - renders one field from a config entry ─────────
// MUST be defined at module level to prevent the cursor/typing bug.
//
// A field can depend on one or more sibling fields (e.g. Breed depends
// on Pet Type; Model depends on Make which depends on Vehicle Type).
// `dependsOn` names the parent key(s); `optionsMap` is keyed by the
// parent value ("Dog", "Cat", ...) or, for multi-parent fields, by
// each parent value joined with "::" in dependsOn order ("Car::Maruti
// Suzuki"). `allValues` is the full asset object so a field can look
// up its parent(s)' current value.
export default function DynamicField({ field, value, onChange, allValues, large }) {
  // Larger touch targets for the iPad/kiosk check-in form
  const BASE = large ? { ...INP, padding:'1rem', fontSize:'1rem' } : INP;

  if (field.type === 'select' && field.dependsOn) {
    const depKeys = Array.isArray(field.dependsOn) ? field.dependsOn : [field.dependsOn];
    const depValues = depKeys.map(k => allValues?.[k]);
    const ready = depValues.every(Boolean);
    const options = ready ? (field.optionsMap?.[depValues.join('::')] || []) : [];

    return (
      <select style={{ ...BASE, cursor: ready ? 'pointer' : 'not-allowed' }} value={value||''} disabled={!ready}
        onChange={e => onChange(field.key, e.target.value)}>
        <option value="">{ready ? 'Select...' : `Select ${field.dependsOnLabel || 'the field above'} first`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (field.type === 'select') {
    return (
      <select style={{ ...BASE, cursor:'pointer' }} value={value||''} onChange={e => onChange(field.key, e.target.value)}>
        <option value="">Select...</option>
        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input
      style={BASE}
      type={field.type === 'date' ? 'date' : 'text'}
      placeholder={field.placeholder || ''}
      value={value||''}
      onChange={e => onChange(field.key, e.target.value)}
    />
  );
}

// Applies a field change and clears any field(s) that cascade from it
// (directly or transitively) — e.g. a new Vehicle Type clears Make, which
// clears Model — so a stale, no-longer-valid selection never lingers.
export function applyFieldChange(fields, values, key, val) {
  const next = { ...values, [key]: val };
  const cleared = new Set([key]);
  let progress = true;
  while (progress) {
    progress = false;
    for (const f of fields) {
      if (cleared.has(f.key) || !next[f.key]) continue;
      const deps = Array.isArray(f.dependsOn) ? f.dependsOn : (f.dependsOn ? [f.dependsOn] : []);
      if (deps.some(d => cleared.has(d))) {
        next[f.key] = '';
        cleared.add(f.key);
        progress = true;
      }
    }
  }
  return next;
}
