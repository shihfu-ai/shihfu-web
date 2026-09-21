'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { getConfig, getQuickFields } from '../../../lib/industry-config';
import DynamicField, { applyFieldChange } from '../../components/DynamicField';

// Public quick check-in form. No login: a business shows it on an iPad at
// the counter, or sends the link to someone booking by phone. Add
// ?kiosk=1 to the URL for counter use — the form resets itself a few
// seconds after each check-in so the next person starts fresh.

const CHANNELS = [
  { id:'whatsapp', label:'WhatsApp' },
  { id:'sms',      label:'SMS' },
  { id:'email',    label:'Email' },
];

const INP = {
  width:'100%', background:'white', border:'1px solid var(--border)',
  borderRadius:6, padding:'1rem', fontFamily:"'DM Sans',sans-serif",
  fontSize:'1rem', color:'var(--ink)', outline:'none',
};
const LBL = {
  display:'block', fontSize:'.75rem', fontWeight:500,
  letterSpacing:'.1em', textTransform:'uppercase',
  color:'var(--muted)', marginBottom:'.5rem',
};

const BLANK = { name:'', phone:'', email:'', city:'' };

export default function CheckinPage() {
  const { token } = useParams();
  const [business, setBusiness] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [asset, setAsset]       = useState({});
  const [channels, setChannels] = useState([]);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [done, setDone]         = useState(null); // { status, name }
  const [kiosk, setKiosk]       = useState(false);

  useEffect(() => {
    setKiosk(new URLSearchParams(window.location.search).get('kiosk') === '1');
    api.getPublicCheckin(token)
      .then(res => setBusiness(res.data))
      .catch(() => setNotFound(true));
  }, [token]);

  // Kiosk mode: clear the screen for the next person after a few seconds
  useEffect(() => {
    if (!done || !kiosk) return;
    const t = setTimeout(reset, 10000);
    return () => clearTimeout(t);
  }, [done, kiosk]);

  function reset() {
    setForm(BLANK); setAsset({}); setChannels([]); setError(''); setDone(null);
  }

  const fields = business ? getQuickFields(business.vertical) : [];
  const config = business ? getConfig(business.vertical) : null;

  function toggleChannel(id) {
    setChannels(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) { setError('Please enter your name'); return; }
    if (!/^[6-9]\d{9}$/.test(form.phone)) { setError('Please enter a valid 10-digit mobile number'); return; }
    const missing = fields.find(f => f.required && !asset[f.key]?.trim?.());
    if (missing) { setError(`Please fill in: ${missing.label}`); return; }

    const assetData = {};
    fields.forEach(f => { if (asset[f.key]) assetData[f.key] = asset[f.key]; });

    setSaving(true);
    try {
      const res = await api.submitPublicCheckin(token, {
        name: form.name.trim(),
        phone: form.phone,
        email: form.email.trim() || undefined,
        city: form.city.trim() || undefined,
        channels,
        entity: Object.keys(assetData).length
          ? { name: assetData.entityName || undefined, assetData }
          : undefined,
      });
      setDone({ status: res.data.status, name: form.name.trim().split(' ')[0] });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again or see the front desk.');
    } finally { setSaving(false); }
  }

  function onFocus(e) { e.target.style.borderColor='var(--gold)'; e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,.12)'; }
  function onBlur(e)  { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }

  const shell = (children) => (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', justifyContent:'center', padding:'2rem 1.25rem' }}>
      <div style={{ width:'100%', maxWidth:620 }}>{children}</div>
    </div>
  );

  if (notFound) return shell(
    <div style={{ textAlign:'center', paddingTop:'20vh' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.8rem', color:'var(--ink)', marginBottom:'.75rem' }}>This link is not valid</h1>
      <p style={{ color:'var(--muted)', fontSize:'.95rem' }}>Please ask the business for a fresh check-in link.</p>
    </div>
  );

  if (!business) return shell(<div style={{ textAlign:'center', paddingTop:'20vh', color:'var(--muted)' }}>Loading...</div>);

  if (done) return shell(
    <div style={{ textAlign:'center', paddingTop:'14vh' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(74,124,89,.12)', border:'2px solid rgba(74,124,89,.3)', margin:'0 auto 1.5rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'#4a7c59' }}>&#10003;</div>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.1rem', fontWeight:900, color:'var(--ink)', marginBottom:'.75rem' }}>
        {done.status === 'existing' ? `Welcome back, ${done.name}!` : `Thank you, ${done.name}!`}
      </h1>
      <p style={{ color:'var(--muted)', fontSize:'1.05rem', lineHeight:1.7, marginBottom:'2rem' }}>
        {done.status === 'existing'
          ? `You are already on file with ${business.businessName}. Someone will be with you shortly.`
          : `You are checked in at ${business.businessName}. Someone will be with you shortly.`}
      </p>
      <button onClick={reset} className="sf-btn-ghost" style={{ padding:'.9rem 2rem', fontSize:'1rem' }}>Check in another person</button>
      {kiosk && <div style={{ marginTop:'1rem', fontSize:'.78rem', color:'var(--muted)' }}>This screen will reset automatically.</div>}
    </div>
  );

  return shell(
    <form onSubmit={submit}>
      <div style={{ textAlign:'center', marginBottom:'2rem' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'.95rem', color:'var(--gold)', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:'.6rem' }}>Welcome to</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.2rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', lineHeight:1.15 }}>{business.businessName}</h1>
        <p style={{ color:'var(--muted)', fontSize:'1rem', marginTop:'.6rem' }}>Quick check-in. Takes about a minute.</p>
      </div>

      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:10, padding:'1.75rem', boxShadow:'0 4px 24px rgba(13,13,13,.06)', display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {error && (
          <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:6, padding:'.85rem 1rem', fontSize:'.9rem', color:'var(--rust)' }}>{error}</div>
        )}

        <div>
          <label style={LBL}>Your Name *</label>
          <input style={INP} autoComplete="name" placeholder="Full name" value={form.name}
            onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
        </div>

        <div>
          <label style={LBL}>Mobile Number *</label>
          <div style={{ display:'flex' }}>
            <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'6px 0 0 6px', padding:'1rem', fontWeight:600, color:'var(--gold)', display:'flex', alignItems:'center' }}>+91</div>
            <input style={{ ...INP, borderRadius:'0 6px 6px 0' }} inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210"
              value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} onFocus={onFocus} onBlur={onBlur}/>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.25rem' }}>
          <div>
            <label style={LBL}>Email (optional)</label>
            <input style={INP} type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
              onChange={e=>setForm(f=>({...f,email:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
          </div>
          <div>
            <label style={LBL}>City (optional)</label>
            <input style={INP} autoComplete="address-level2" placeholder="e.g. Bengaluru" value={form.city}
              onChange={e=>setForm(f=>({...f,city:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
          </div>
        </div>

        {fields.length > 0 && (
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.25rem' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, color:'var(--ink)', marginBottom:'.25rem' }}>{config.assetLabel}</div>
            <div style={{ fontSize:'.85rem', color:'var(--muted)', marginBottom:'1rem' }}>Optional, but it helps us get ready for you.</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.25rem' }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label style={LBL}>{f.label}{f.required ? ' *' : ''}</label>
                  <DynamicField field={f} value={asset[f.key]} allValues={asset} large
                    onChange={(key, val) => setAsset(a => applyFieldChange(fields, a, key, val))}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.25rem' }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, color:'var(--ink)', marginBottom:'.25rem' }}>Stay in touch</div>
          <div style={{ fontSize:'.85rem', color:'var(--muted)', marginBottom:'1rem', lineHeight:1.6 }}>
            I agree to receive appointment reminders and occasional offers from {business.businessName} on:
          </div>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
            {CHANNELS.map(ch => {
              const on = channels.includes(ch.id);
              return (
                <div key={ch.id} onClick={() => toggleChannel(ch.id)} style={{ flex:'1 1 120px', padding:'1rem', borderRadius:8, cursor:'pointer', textAlign:'center', userSelect:'none', border:`1.5px solid ${on?'var(--gold)':'var(--border)'}`, background:on?'rgba(200,168,75,.08)':'var(--warm)', fontWeight:600, color:on?'var(--gold)':'var(--ink)', transition:'all .15s' }}>
                  {ch.label}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:'.75rem', color:'var(--muted)', marginTop:'.6rem' }}>You can opt out at any time.</div>
        </div>

        <button type="submit" disabled={saving} className="sf-btn-primary" style={{ width:'100%', padding:'1.1rem', fontSize:'1.05rem', opacity:saving?.7:1 }}>
          {saving ? 'Checking in...' : 'Check In'}
        </button>
      </div>
    </form>
  );
}
