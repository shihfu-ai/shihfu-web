'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

const STEPS     = ['Business Profile', 'Industry', 'Channels', 'Review'];
const VERTICALS = [
  { value: 'veterinary',   label: 'Veterinary Clinic',          hint: 'Pets, vaccines, grooming & checkups' },
  { value: 'salon_beauty', label: 'Salon & Beauty',             hint: 'Hair, skin, nails & wellness' },
  { value: 'auto_repair',  label: 'Auto Repair & Accessories',  hint: 'Garages, service centres & fitment shops' },
];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pa', label: 'Punjabi' },
];
const CITIES = [
  'Bengaluru','Mumbai','Delhi','Hyderabad','Chennai',
  'Pune','Kolkata','Ahmedabad','Jaipur','Kochi',
  'Chandigarh','Indore','Nagpur','Surat','Lucknow','Other',
];
const CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', sub: '500M+ Indian users. Highest open rate.' },
  { id: 'sms',      label: 'SMS',      sub: 'Instant delivery. No app required.' },
  { id: 'email',    label: 'Email',    sub: 'Detailed reminders and promotional offers.' },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]       = useState(0);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    businessName: '', ownerName: '', phone: '', email: '',
    password: '', city: '', vertical: '',
    preferredLang: 'en', channels: ['whatsapp'],
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  function toggleChannel(ch) {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter(c => c !== ch)
        : [...f.channels, ch],
    }));
  }

  function validateStep() {
    setError('');
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
    return true;
  }

  function next() {
    if (validateStep()) setStep(s => s + 1);
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

  const selectStyle = {
    width: '100%',
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: 4,
    padding: '0.8rem 1rem',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.9rem',
    color: 'var(--ink)',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b6456' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{
        padding: '1.4rem 4rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(245,240,232,0.9)', backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.4rem', fontWeight: 900,
          color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.02em',
        }}>
          Shih<span style={{ color: 'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</span>
        </Link>
      </nav>

      {/* Main */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '3rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem', fontWeight: 900, color: 'var(--ink)',
              lineHeight: 1.1, marginBottom: '0.5rem', letterSpacing: '-0.02em',
            }}>
              Set up your business
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 300 }}>
              Takes less than 3 minutes
            </p>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', marginBottom: '2rem', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 14, left: '10%', width: '80%',
              height: 1, background: 'var(--border)', zIndex: 0,
            }} />
            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', margin: '0 auto 0.5rem',
                  background: i === step ? 'var(--gold)' : i < step ? 'rgba(200,168,75,0.2)' : 'white',
                  border: `1.5px solid ${i <= step ? 'var(--gold)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: i === step ? 'var(--ink)' : i < step ? 'var(--gold)' : 'var(--muted)',
                }}>{i + 1}</div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.05em',
                  color: i === step ? 'var(--gold)' : 'var(--muted)',
                  textTransform: 'uppercase',
                }}>{s}</div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{
            background: 'white', border: '1px solid var(--border)',
            borderRadius: 8, padding: '2.5rem',
            boxShadow: '0 4px 24px rgba(13,13,13,0.06)',
          }}>

            {error && (
              <div style={{
                background: 'rgba(196,83,42,0.08)', border: '1px solid rgba(196,83,42,0.2)',
                borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1.5rem',
                fontSize: '0.82rem', color: 'var(--rust)',
              }}>{error}</div>
            )}

            {/* Step 0 — Business Profile */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Business Profile
                </h2>
                <div>
                  <label className="sf-label">Business Name *</label>
                  <input className="sf-input" placeholder="PawCare Veterinary Clinic"
                    value={form.businessName} onChange={e => update('businessName', e.target.value)} />
                </div>
                <div>
                  <label className="sf-label">Owner Name *</label>
                  <input className="sf-input" placeholder="Dr. Priya Sharma"
                    value={form.ownerName} onChange={e => update('ownerName', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="sf-label">Mobile (10 digits) *</label>
                    <div style={{ display: 'flex' }}>
                      <div style={{
                        background: 'var(--warm)', border: '1px solid var(--border)', borderRight: 'none',
                        borderRadius: '4px 0 0 4px', padding: '0.8rem 0.9rem',
                        fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold)',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                      }}>+91</div>
                      <input className="sf-input" style={{ borderRadius: '0 4px 4px 0' }}
                        placeholder="98765 43210" maxLength={10}
                        value={form.phone}
                        onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                  </div>
                  <div>
                    <label className="sf-label">City</label>
                    <select style={selectStyle} value={form.city} onChange={e => update('city', e.target.value)}>
                      <option value="">Select city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="sf-label">Business Email *</label>
                  <input className="sf-input" type="email" placeholder="hello@yourshop.in"
                    value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <label className="sf-label">Password *</label>
                  <input className="sf-input" type="password" placeholder="Minimum 8 characters"
                    value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div>
                  <label className="sf-label">Message Language</label>
                  <select style={selectStyle} value={form.preferredLang} onChange={e => update('preferredLang', e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 1 — Industry */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Select Your Industry
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem', fontWeight: 300 }}>
                  We load the right service templates and reminder cycles for you.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {VERTICALS.map(v => (
                    <div key={v.value} onClick={() => update('vertical', v.value)} style={{
                      padding: '1.2rem 1.5rem', borderRadius: 6, cursor: 'pointer',
                      border: `1.5px solid ${form.vertical === v.value ? 'var(--gold)' : 'var(--border)'}`,
                      background: form.vertical === v.value ? 'rgba(200,168,75,0.06)' : 'var(--warm)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.2rem' }}>{v.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 300 }}>{v.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Channels */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Messaging Channels
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem', fontWeight: 300 }}>
                  Select how you want to reach your customers. You can change this later.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {CHANNELS.map(ch => (
                    <div key={ch.id} onClick={() => toggleChannel(ch.id)} style={{
                      padding: '1.2rem 1.5rem', borderRadius: 6, cursor: 'pointer',
                      border: `1.5px solid ${form.channels.includes(ch.id) ? 'var(--gold)' : 'var(--border)'}`,
                      background: form.channels.includes(ch.id) ? 'rgba(200,168,75,0.06)' : 'var(--warm)',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.2rem' }}>{ch.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 300 }}>{ch.sub}</div>
                      </div>
                      <div style={{
                        width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${form.channels.includes(ch.id) ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.channels.includes(ch.id) ? 'var(--gold)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', color: 'var(--ink)', fontWeight: 700,
                      }}>
                        {form.channels.includes(ch.id) ? '+' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Review & Launch
                </h2>
                {[
                  { label: 'Business Name', value: form.businessName },
                  { label: 'Owner',         value: form.ownerName },
                  { label: 'Mobile',        value: `+91 ${form.phone}` },
                  { label: 'Email',         value: form.email },
                  { label: 'City',          value: form.city || 'Not specified' },
                  { label: 'Industry',      value: VERTICALS.find(v => v.value === form.vertical)?.label },
                  { label: 'Channels',      value: form.channels.join(', ') },
                  { label: 'Language',      value: LANGUAGES.find(l => l.value === form.preferredLang)?.label },
                ].map((r, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      {r.label}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500 }}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="sf-btn-ghost">
                  Back
                </button>
              ) : (
                <Link href="/login" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
                  Already have an account?
                </Link>
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={next} className="sf-btn-primary">
                  Continue
                </button>
              ) : (
                <button onClick={submit} disabled={loading} className="sf-btn-primary">
                  {loading ? 'Launching...' : 'Launch My Business'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}