'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

const STEPS = ['Business Profile', 'Industry', 'Channels', 'Review'];

const VERTICALS = [
  { value:'veterinary',   label:'Veterinary Clinic',         hint:'Pets, vaccines, grooming' },
  { value:'salon_beauty', label:'Salon & Beauty',            hint:'Hair, skin, nails, wellness' },
  { value:'auto_repair',  label:'Auto Repair & Accessories', hint:'Garages, service centres' },
];

const LANGUAGES = [
  { value:'en', label:'English' },
  { value:'hi', label:'Hindi' },
  { value:'ta', label:'Tamil' },
  { value:'te', label:'Telugu' },
  { value:'kn', label:'Kannada' },
  { value:'ml', label:'Malayalam' },
  { value:'mr', label:'Marathi' },
  { value:'gu', label:'Gujarati' },
];

const CITIES = [
  'Bengaluru','Mumbai','Delhi','Hyderabad','Chennai',
  'Pune','Kolkata','Ahmedabad','Jaipur','Kochi','Other',
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName:'', ownerName:'', phone:'', email:'',
    password:'', city:'', state:'', vertical:'',
    preferredLang:'en', channels:['whatsapp'],
  });

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleChannel(ch) {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter(c => c !== ch)
        : [...f.channels, ch],
    }));
  }

  function validateStep() {
    if (step === 0) {
      if (!form.businessName || !form.ownerName || !form.phone || !form.email || !form.password) {
        setError('Please fill in all required fields'); return false;
      }
      if (!/^[6-9]\d{9}$/.test(form.phone)) {
        setError('Enter a valid 10-digit Indian mobile number'); return false;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters'); return false;
      }
    }
    if (step === 1 && !form.vertical) {
      setError('Please select your industry'); return false;
    }
    if (step === 2 && form.channels.length === 0) {
      setError('Please select at least one messaging channel'); return false;
    }
    setError('');
    return true;
  }

  function next() {
    if (!validateStep()) return;
    setStep(s => s + 1);
  }

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const res = await api.register({
        businessName:  form.businessName,
        ownerName:     form.ownerName,
        phone:         form.phone,
        email:         form.email,
        password:      form.password,
        city:          form.city,
        vertical:      form.vertical,
        preferredLang: form.preferredLang,
      });
      saveAuth(res.data.accessToken, res.data.staff);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width:'100%', background:'#1e2025',
    border:'1px solid rgba(255,255,255,.07)', borderRadius:6,
    padding:'.8rem 1rem', fontSize:'.9rem', color:'#e4e6eb',
    outline:'none', fontFamily:'inherit',
  };

  const labelStyle = {
    display:'block', fontFamily:'monospace',
    fontSize:'.63rem', letterSpacing:'.1em', textTransform:'uppercase',
    color:'#9499a6', marginBottom:'.5rem',
  };

  return (
    <div style={{
      minHeight:'100vh', background:'#111214',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'inherit', padding:'2rem',
    }}>
      <div style={{
        background:'#18191d', border:'1px solid rgba(255,255,255,.07)',
        borderRadius:12, padding:'2.5rem', width:'100%', maxWidth:520,
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link href="/" style={{
            fontFamily:'Georgia,serif', fontSize:'1.6rem',
            fontWeight:700, color:'#e4e6eb', textDecoration:'none',
          }}>
            Shih<span style={{color:'#f0a500'}}>-Fu</span>
          </Link>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', gap:0, marginBottom:'2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex:1, textAlign:'center' }}>
              <div style={{
                width:28, height:28, borderRadius:'50%',
                background: i === step ? '#f0a500' : i < step ? 'rgba(240,165,0,.2)' : '#1e2025',
                border: `1.5px solid ${i <= step ? '#f0a500' : 'rgba(255,255,255,.07)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                margin:'0 auto .5rem',
                fontSize:'.75rem', fontWeight:700,
                color: i === step ? '#111' : i < step ? '#f0a500' : '#5c6070',
              }}>{i + 1}</div>
              <div style={{
                fontSize:'.62rem', fontFamily:'monospace', letterSpacing:'.05em',
                color: i === step ? '#f0a500' : '#5c6070',
              }}>{s}</div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            background:'rgba(240,82,82,.1)', border:'1px solid rgba(240,82,82,.2)',
            borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.5rem',
            fontSize:'.82rem', color:'#f05252',
          }}>{error}</div>
        )}

        {/* Step 0 — Business Profile */}
        {step === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#e4e6eb', marginBottom:'.5rem' }}>
              Business Profile
            </h2>
            <div>
              <label style={labelStyle}>Business Name *</label>
              <input style={inputStyle} placeholder="PawCare Veterinary Clinic"
                value={form.businessName} onChange={e => update('businessName', e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Owner Name *</label>
              <input style={inputStyle} placeholder="Dr. Priya Sharma"
                value={form.ownerName} onChange={e => update('ownerName', e.target.value)}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <label style={labelStyle}>Mobile (10 digits) *</label>
                <div style={{ display:'flex' }}>
                  <div style={{
                    background:'#252830', border:'1px solid rgba(255,255,255,.07)',
                    borderRight:'none', borderRadius:'6px 0 0 6px',
                    padding:'.8rem .9rem', fontSize:'.8rem',
                    color:'#f0a500', fontFamily:'monospace', whiteSpace:'nowrap',
                  }}>+91</div>
                  <input style={{ ...inputStyle, borderRadius:'0 6px 6px 0' }}
                    placeholder="98765 43210" maxLength={10}
                    value={form.phone}
                    onChange={e => update('phone', e.target.value.replace(/\D/g,'').slice(0,10))}/>
                </div>
              </div>
              <div>
                <label style={labelStyle}>City</label>
                <select style={{ ...inputStyle, cursor:'pointer' }}
                  value={form.city} onChange={e => update('city', e.target.value)}>
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Business Email *</label>
              <input style={inputStyle} type="email" placeholder="hello@yourshop.in"
                value={form.email} onChange={e => update('email', e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Password *</label>
              <input style={inputStyle} type="password" placeholder="Minimum 8 characters"
                value={form.password} onChange={e => update('password', e.target.value)}/>
            </div>
            <div>
              <label style={labelStyle}>Message Language</label>
              <select style={{ ...inputStyle, cursor:'pointer' }}
                value={form.preferredLang} onChange={e => update('preferredLang', e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 1 — Industry */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#e4e6eb', marginBottom:'.5rem' }}>
              Select Your Industry
            </h2>
            <p style={{ fontSize:'.82rem', color:'#9499a6', marginBottom:'1.5rem' }}>
              We load the right templates and reminder cycles for your business type.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
              {VERTICALS.map(v => (
                <div key={v.value}
                  onClick={() => update('vertical', v.value)}
                  style={{
                    padding:'1.2rem 1.5rem', borderRadius:8, cursor:'pointer',
                    border: `1.5px solid ${form.vertical === v.value ? '#f0a500' : 'rgba(255,255,255,.07)'}`,
                    background: form.vertical === v.value ? 'rgba(240,165,0,.06)' : '#1e2025',
                    transition:'all .2s',
                  }}>
                  <div style={{ fontWeight:600, color:'#e4e6eb', marginBottom:'.2rem' }}>{v.label}</div>
                  <div style={{ fontSize:'.78rem', color:'#9499a6' }}>{v.hint}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Channels */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#e4e6eb', marginBottom:'.5rem' }}>
              Messaging Channels
            </h2>
            <p style={{ fontSize:'.82rem', color:'#9499a6', marginBottom:'1.5rem' }}>
              Select how you want to reach your customers.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
              {[
                { id:'whatsapp', label:'WhatsApp', sub:'500M+ Indian users. Highest open rate.' },
                { id:'sms',      label:'SMS',       sub:'Instant delivery. No app required.' },
                { id:'email',    label:'Email',     sub:'Detailed reminders and offers.' },
              ].map(ch => (
                <div key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  style={{
                    padding:'1.2rem 1.5rem', borderRadius:8, cursor:'pointer',
                    border: `1.5px solid ${form.channels.includes(ch.id) ? '#f0a500' : 'rgba(255,255,255,.07)'}`,
                    background: form.channels.includes(ch.id) ? 'rgba(240,165,0,.06)' : '#1e2025',
                    transition:'all .2s', display:'flex', alignItems:'center',
                    justifyContent:'space-between',
                  }}>
                  <div>
                    <div style={{ fontWeight:600, color:'#e4e6eb', marginBottom:'.2rem' }}>{ch.label}</div>
                    <div style={{ fontSize:'.78rem', color:'#9499a6' }}>{ch.sub}</div>
                  </div>
                  <div style={{
                    width:20, height:20, borderRadius:4, flexShrink:0,
                    border: `1.5px solid ${form.channels.includes(ch.id) ? '#f0a500' : 'rgba(255,255,255,.2)'}`,
                    background: form.channels.includes(ch.id) ? '#f0a500' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'.7rem', color:'#111', fontWeight:700,
                  }}>{form.channels.includes(ch.id) ? '+' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#e4e6eb', marginBottom:'1.5rem' }}>
              Review & Launch
            </h2>
            {[
              { label:'Business Name', value: form.businessName },
              { label:'Owner', value: form.ownerName },
              { label:'Mobile', value: `+91 ${form.phone}` },
              { label:'Email', value: form.email },
              { label:'City', value: form.city || 'Not specified' },
              { label:'Industry', value: VERTICALS.find(v => v.value === form.vertical)?.label },
              { label:'Channels', value: form.channels.join(', ') },
              { label:'Language', value: LANGUAGES.find(l => l.value === form.preferredLang)?.label },
            ].map((r, i) => (
              <div key={i} style={{
                display:'flex', justifyContent:'space-between',
                padding:'.75rem 0',
                borderBottom:'1px solid rgba(255,255,255,.07)',
              }}>
                <span style={{ fontSize:'.78rem', fontFamily:'monospace', letterSpacing:'.05em', color:'#9499a6', textTransform:'uppercase' }}>
                  {r.label}
                </span>
                <span style={{ fontSize:'.85rem', color:'#e4e6eb', fontWeight:500 }}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{
          display:'flex', justifyContent:'space-between',
          alignItems:'center', marginTop:'2rem', gap:'1rem',
        }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{
              background:'transparent', border:'1px solid rgba(255,255,255,.07)',
              borderRadius:6, padding:'.8rem 1.5rem', fontSize:'.82rem',
              fontWeight:600, color:'#9499a6', cursor:'pointer', fontFamily:'inherit',
            }}>Back</button>
          ) : (
            <Link href="/login" style={{ fontSize:'.82rem', color:'#9499a6', textDecoration:'none' }}>
              Already have an account?
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={next} style={{
              background:'#f0a500', color:'#111', border:'none',
              borderRadius:6, padding:'.8rem 2rem', fontSize:'.85rem',
              fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              letterSpacing:'.05em', textTransform:'uppercase',
            }}>Continue</button>
          ) : (
            <button onClick={submit} disabled={loading} style={{
              background: loading ? '#5c6070' : '#f0a500',
              color:'#111', border:'none', borderRadius:6,
              padding:'.8rem 2rem', fontSize:'.85rem',
              fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', letterSpacing:'.05em', textTransform:'uppercase',
            }}>
              {loading ? 'Launching...' : 'Launch My Business'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}