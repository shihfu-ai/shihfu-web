'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, saveAuth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
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
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        padding: '1.4rem 4rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(245,240,232,0.9)',
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.4rem',
          fontWeight: 900,
          color: 'var(--ink)',
          textDecoration: 'none',
          letterSpacing: '-0.02em',
        }}>
          Shih<span style={{ color: 'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/signup" style={{
          fontSize: '0.85rem',
          color: 'var(--muted)',
          textDecoration: 'none',
          fontWeight: 500,
        }}>
          No account?{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Register free</span>
        </Link>
      </nav>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.2rem',
              fontWeight: 900,
              color: 'var(--ink)',
              lineHeight: 1.1,
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 300 }}>
              Sign in to your Shih-Fu dashboard
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '2.5rem',
            boxShadow: '0 4px 24px rgba(13,13,13,0.06)',
          }}>

            {error && (
              <div style={{
                background: 'rgba(196,83,42,0.08)',
                border: '1px solid rgba(196,83,42,0.2)',
                borderRadius: 4,
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--rust)',
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="sf-label">Business Email</label>
                <input
                  className="sf-input"
                  type="email"
                  required
                  placeholder="hello@yourshop.in"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="sf-label">Password</label>
                <input
                  className="sf-input"
                  type="password"
                  required
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sf-btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.82rem',
              color: 'var(--muted)',
            }}>
              No account yet?{' '}
              <Link href="/signup" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                Register your business
              </Link>
            </div>
          </div>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: 'rgba(200,168,75,0.08)',
            border: '1px solid rgba(200,168,75,0.2)',
            borderRadius: 6,
            fontSize: '0.78rem',
            color: 'var(--muted)',
            lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--gold)', marginBottom: '0.3rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
              Demo credentials
            </div>
            <div>Email: priya@pawcare.in</div>
            <div>Password: ShihFu@2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}