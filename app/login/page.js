'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(form);
      saveAuth(res.data.accessToken, res.data.staff);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#111214',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'inherit', padding:'2rem',
    }}>
      <style>{`
        .login-input {
          width:100%; background:#1e2025; border:1px solid rgba(255,255,255,.07);
          border-radius:6px; padding:.8rem 1rem; font-size:.9rem;
          color:#e4e6eb; outline:none; transition:border-color .2s;
          font-family:inherit;
        }
        .login-input:focus { border-color:rgba(240,165,0,.4); }
        .login-input::placeholder { color:#5c6070; }
      `}</style>

      <div style={{
        background:'#18191d', border:'1px solid rgba(255,255,255,.07)',
        borderRadius:12, padding:'2.5rem', width:'100%', maxWidth:420,
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link href="/" style={{
            fontFamily:'Georgia,serif', fontSize:'1.8rem',
            fontWeight:700, color:'#e4e6eb', textDecoration:'none',
          }}>
            Shih<span style={{color:'#f0a500'}}>-Fu</span>
          </Link>
          <div style={{
            fontSize:'.8rem', color:'#9499a6', marginTop:'.5rem',
            fontFamily:'monospace', letterSpacing:'.05em',
          }}>Sign in to your dashboard</div>
        </div>

        {error && (
          <div style={{
            background:'rgba(240,82,82,.1)', border:'1px solid rgba(240,82,82,.2)',
            borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.5rem',
            fontSize:'.82rem', color:'#f05252',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
          <div>
            <label style={{
              display:'block', fontFamily:'monospace',
              fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase',
              color:'#9499a6', marginBottom:'.5rem',
            }}>Business Email</label>
            <input
              className="login-input"
              type="email" required
              placeholder="hello@yourshop.in"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label style={{
              display:'block', fontFamily:'monospace',
              fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase',
              color:'#9499a6', marginBottom:'.5rem',
            }}>Password</label>
            <input
              className="login-input"
              type="password" required
              placeholder="Your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#5c6070' : '#f0a500',
              color:'#111', border:'none', borderRadius:6,
              padding:'.9rem', fontSize:'.85rem', fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:'inherit', letterSpacing:'.06em',
              textTransform:'uppercase', transition:'all .2s',
              marginTop:'.5rem',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign:'center', marginTop:'1.5rem',
          fontSize:'.82rem', color:'#9499a6',
        }}>
          No account yet?{' '}
          <Link href="/signup" style={{ color:'#f0a500', textDecoration:'none', fontWeight:600 }}>
            Register your business
          </Link>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop:'1.5rem', padding:'1rem',
          background:'rgba(240,165,0,.06)', border:'1px solid rgba(240,165,0,.15)',
          borderRadius:6, fontSize:'.75rem', color:'#9499a6',
        }}>
          <div style={{ fontWeight:600, color:'#f0a500', marginBottom:'.4rem', fontFamily:'monospace' }}>
            Demo credentials
          </div>
          <div>Email: priya@pawcare.in</div>
          <div>Password: ShihFu@2024</div>
        </div>
      </div>
    </div>
  );
}