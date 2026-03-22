'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

const VERTICALS = [
  { value:'veterinary',   label:'Veterinary / Pet Care' },
  { value:'salon_beauty', label:'Salon and Beauty' },
  { value:'auto_repair',  label:'Auto Repair and Accessories' },
  { value:'home_services',label:'Home Services' },
  { value:'healthcare',   label:'Clinic and Healthcare' },
  { value:'fitness',      label:'Fitness and Wellness' },
  { value:'education',    label:'Education and Coaching' },
  { value:'retail',       label:'Retail and Shop' },
  { value:'other',        label:'Other Service Business' },
];

const CITIES = ['Bengaluru','Mumbai','Delhi','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Kochi','Other'];

export default function LoginPage() {
  const router  = useRouter();
  const [tab, setTab]       = useState('signin'); // 'signin' | 'signup'
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Sign in form
  const [signIn, setSignIn] = useState({ email:'', password:'' });

  // Sign up form
  const [signUp, setSignUp] = useState({
    businessName:'', ownerName:'', phone:'', email:'',
    password:'', city:'', vertical:'', preferredLang:'en',
  });

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(signIn);
      saveAuth(res.data.accessToken, res.data.staff);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (!signUp.businessName || !signUp.ownerName || !signUp.phone || !signUp.email || !signUp.password) {
      setError('Please fill in all required fields'); return;
    }
    if (!/^[6-9]\d{9}$/.test(signUp.phone)) {
      setError('Enter a valid 10-digit Indian mobile number'); return;
    }
    if (signUp.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      const res = await api.register({
        businessName:  signUp.businessName,
        ownerName:     signUp.ownerName,
        phone:         signUp.phone,
        email:         signUp.email,
        password:      signUp.password,
        city:          signUp.city || undefined,
        vertical:      signUp.vertical || 'other',
        preferredLang: signUp.preferredLang,
      });
      saveAuth(res.data.accessToken, res.data.staff);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  const inp = {
    width:'100%', background:'white', border:'1px solid var(--border)',
    borderRadius:4, padding:'.8rem 1rem', fontFamily:"'DM Sans',sans-serif",
    fontSize:'.9rem', color:'var(--ink)', outline:'none',
    transition:'border-color .2s, box-shadow .2s',
  };
  const lbl = {
    display:'block', fontSize:'.72rem', fontWeight:500,
    letterSpacing:'.1em', textTransform:'uppercase',
    color:'var(--muted)', marginBottom:'.5rem',
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', flexDirection:'column' }}>

      {/* Nav */}
      <nav style={{ padding:'1.25rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,.9)', backdropFilter:'blur(12px)' }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <div style={{ fontSize:'.82rem', color:'var(--muted)' }}>
          India's retention-first CRM for service businesses
        </div>
      </nav>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1.5rem' }}>
        <div style={{ width:'100%', maxWidth:460 }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', marginBottom:'.4rem' }}>
              {tab === 'signin' ? 'Welcome back' : 'Get started free'}
            </h1>
            <p style={{ fontSize:'.875rem', color:'var(--muted)', fontWeight:300 }}>
              {tab === 'signin' ? 'Sign in to your Shih-Fu dashboard' : '30-day free trial. No credit card required.'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', background:'var(--warm)', borderRadius:8, padding:4, marginBottom:'1.5rem', border:'1px solid var(--border)' }}>
            {[{id:'signin',label:'Sign In'},{id:'signup',label:'Sign Up'}].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(''); }} style={{ flex:1, padding:'.65rem', border:'none', borderRadius:6, fontFamily:"'DM Sans',sans-serif", fontSize:'.875rem', fontWeight:600, cursor:'pointer', transition:'all .2s', background:tab===t.id?'white':'transparent', color:tab===t.id?'var(--ink)':'var(--muted)', boxShadow:tab===t.id?'0 1px 4px rgba(13,13,13,0.1)':'none' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'2rem', boxShadow:'0 4px 24px rgba(13,13,13,0.06)' }}>

            {error && (
              <div style={{ background:'rgba(196,83,42,0.08)', border:'1px solid rgba(196,83,42,0.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--rust)' }}>
                {error}
              </div>
            )}

            {/* SIGN IN */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input style={inp} type="email" required placeholder="hello@yourshop.in"
                    value={signIn.email} onChange={e => setSignIn(f=>({...f,email:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <input style={inp} type="password" required placeholder="Your password"
                    value={signIn.password} onChange={e => setSignIn(f=>({...f,password:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <button type="submit" disabled={loading} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem', marginTop:'.25rem', opacity:loading?.6:1 }}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <div style={{ textAlign:'center', fontSize:'.82rem', color:'var(--muted)' }}>
                  No account yet?{' '}
                  <button type="button" onClick={() => { setTab('signup'); setError(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gold)', fontWeight:600, fontSize:'.82rem', fontFamily:'inherit', padding:0 }}>
                    Create one free
                  </button>
                </div>
              </form>
            )}

            {/* SIGN UP */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div>
                  <label style={lbl}>Business Name *</label>
                  <input style={inp} placeholder="e.g. PawCare Veterinary Clinic" required
                    value={signUp.businessName} onChange={e => setSignUp(f=>({...f,businessName:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <div>
                  <label style={lbl}>Your Name *</label>
                  <input style={inp} placeholder="e.g. Dr. Priya Sharma" required
                    value={signUp.ownerName} onChange={e => setSignUp(f=>({...f,ownerName:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div>
                    <label style={lbl}>Mobile *</label>
                    <div style={{ display:'flex' }}>
                      <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'.8rem .85rem', fontSize:'.8rem', fontWeight:600, color:'var(--gold)', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>+91</div>
                      <input style={{ ...inp, borderRadius:'0 4px 4px 0' }} placeholder="98765 43210" maxLength={10}
                        value={signUp.phone} onChange={e => setSignUp(f=>({...f,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))}
                        onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>City</label>
                    <select style={{ ...inp, cursor:'pointer' }} value={signUp.city} onChange={e => setSignUp(f=>({...f,city:e.target.value}))}>
                      <option value="">Select...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Business Email *</label>
                  <input style={inp} type="email" required placeholder="hello@yourbusiness.in"
                    value={signUp.email} onChange={e => setSignUp(f=>({...f,email:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <div>
                  <label style={lbl}>Business Type</label>
                  <select style={{ ...inp, cursor:'pointer' }} value={signUp.vertical} onChange={e => setSignUp(f=>({...f,vertical:e.target.value}))}>
                    <option value="">Select your industry...</option>
                    {VERTICALS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Password *</label>
                  <input style={inp} type="password" required placeholder="Minimum 8 characters"
                    value={signUp.password} onChange={e => setSignUp(f=>({...f,password:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <button type="submit" disabled={loading} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem', marginTop:'.25rem', opacity:loading?.6:1 }}>
                  {loading ? 'Creating account...' : 'Create Free Account'}
                </button>
                <div style={{ textAlign:'center', fontSize:'.78rem', color:'var(--muted)', lineHeight:1.6 }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setTab('signin'); setError(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gold)', fontWeight:600, fontSize:'.78rem', fontFamily:'inherit', padding:0 }}>
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop:'1.25rem', padding:'1rem 1.25rem', background:'rgba(200,168,75,0.08)', border:'1px solid rgba(200,168,75,0.2)', borderRadius:6, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.7 }}>
            <div style={{ fontWeight:600, color:'var(--gold)', marginBottom:'.3rem', letterSpacing:'.05em', textTransform:'uppercase', fontSize:'.68rem' }}>Demo credentials</div>
            <div>Email: priya@pawcare.in</div>
            <div>Password: ShihFu@2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}