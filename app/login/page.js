'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [signIn, setSignIn] = useState({ email:'', password:'' });

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

  function onFocus(e) { e.target.style.borderColor='var(--gold)'; e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,.1)'; }
  function onBlur(e)  { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }

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

          {/* Heading */}
          <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', marginBottom:'.4rem' }}>
              Welcome back
            </h1>
            <p style={{ fontSize:'.875rem', color:'var(--muted)', fontWeight:300 }}>
              Sign in to your Shih-Fu dashboard
            </p>
          </div>

          {/* Card */}
          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'2rem', boxShadow:'0 4px 24px rgba(13,13,13,.06)' }}>

            {error && (
              <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--rust)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div>
                <label style={lbl}>Business Email</label>
                <input style={inp} type="email" required placeholder="hello@yourshop.in"
                  value={signIn.email} onChange={e=>setSignIn(f=>({...f,email:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <label style={lbl}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize:'.75rem', color:'var(--gold)', fontWeight:500, textDecoration:'none', marginBottom:'.5rem' }}>Forgot password?</Link>
                </div>
                <input style={inp} type="password" required placeholder="Your password"
                  value={signIn.password} onChange={e=>setSignIn(f=>({...f,password:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <button type="submit" disabled={loading} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem', marginTop:'.25rem', opacity:loading?.6:1 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div style={{ textAlign:'center', fontSize:'.82rem', color:'var(--muted)' }}>
                No account yet?{' '}
                <Link href="/signup" style={{ color:'var(--gold)', fontWeight:600, textDecoration:'none' }}>
                  Create one free
                </Link>
              </div>
            </form>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop:'1.25rem', padding:'1rem 1.25rem', background:'rgba(200,168,75,.08)', border:'1px solid rgba(200,168,75,.2)', borderRadius:6, fontSize:'.78rem', color:'var(--muted)', lineHeight:1.7 }}>
            <div style={{ fontWeight:600, color:'var(--gold)', marginBottom:'.3rem', letterSpacing:'.05em', textTransform:'uppercase', fontSize:'.68rem' }}>Demo credentials</div>
            <div>Email: priya@pawcare.in</div>
            <div>Password: ShihFu@2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}
