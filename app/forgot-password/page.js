'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';

// useSearchParams() (used below to prefill the email from the signup
// page's "Reset your password instead" link) requires a Suspense
// boundary, or `next build` fails outright - see dashboard/settings.
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordInner />
    </Suspense>
  );
}

function ForgotPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep]       = useState('email'); // 'email' | 'reset' | 'done'
  const [email, setEmail]     = useState(searchParams.get('email') || '');
  const [otp, setOtp]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [loading, setLoading] = useState(false);

  const inp = {
    width:'100%', background:'white', border:'1px solid var(--border)',
    borderRadius:4, padding:'.8rem 1rem', fontFamily:"'DM Sans',sans-serif",
    fontSize:'.9rem', color:'var(--ink)', outline:'none',
  };
  const lbl = {
    display:'block', fontSize:'.72rem', fontWeight:500,
    letterSpacing:'.1em', textTransform:'uppercase',
    color:'var(--muted)', marginBottom:'.5rem',
  };

  async function handleRequestCode(e) {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email.trim()) { setError('Enter your business email'); return; }
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setInfo(res.message || 'If an account exists for that email, we have sent a reset code to it.');
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email'); return; }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.resetPassword({ email: email.trim(), otp, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally { setLoading(false); }
  }

  function onFocus(e) { e.target.style.borderColor='var(--gold)'; e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,.1)'; }
  function onBlur(e)  { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', flexDirection:'column' }}>
      <nav style={{ padding:'1.25rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,.9)', backdropFilter:'blur(12px)' }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/login" style={{ fontSize:'.85rem', fontWeight:500, color:'var(--muted)', textDecoration:'none' }}>Back to Sign In</Link>
      </nav>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 1.5rem' }}>
        <div style={{ width:'100%', maxWidth:440 }}>

          <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', marginBottom:'.4rem' }}>
              {step === 'done' ? 'Password updated' : 'Reset your password'}
            </h1>
            <p style={{ fontSize:'.875rem', color:'var(--muted)', fontWeight:300 }}>
              {step === 'email' && 'Enter your business email and we will send you a reset code.'}
              {step === 'reset' && 'Check your email for the 6-digit code.'}
              {step === 'done'  && 'You can now sign in with your new password.'}
            </p>
          </div>

          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'2rem', boxShadow:'0 4px 24px rgba(13,13,13,.06)' }}>

            {error && (
              <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--rust)' }}>
                {error}
              </div>
            )}
            {info && step === 'reset' && (
              <div style={{ background:'rgba(74,124,89,.08)', border:'1px solid rgba(74,124,89,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'#4a7c59' }}>
                {info}
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleRequestCode} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                <div>
                  <label style={lbl}>Business Email</label>
                  <input style={inp} type="email" required placeholder="hello@yourshop.in"
                    value={email} onChange={e=>setEmail(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <button type="submit" disabled={loading} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem', opacity:loading?.6:1 }}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                <div>
                  <label style={lbl}>6-Digit Code</label>
                  <input style={{ ...inp, letterSpacing:'.3em', textAlign:'center', fontSize:'1.1rem' }} inputMode="numeric" maxLength={6} required placeholder="000000"
                    value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div>
                  <label style={lbl}>New Password</label>
                  <input style={inp} type="password" required placeholder="Minimum 8 characters"
                    value={newPassword} onChange={e=>setNewPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div>
                  <label style={lbl}>Confirm New Password</label>
                  <input style={inp} type="password" required placeholder="Re-enter new password"
                    value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <button type="submit" disabled={loading} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem', opacity:loading?.6:1 }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => { setStep('email'); setError(''); setInfo(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'.8rem', fontFamily:'inherit', textAlign:'center' }}>
                  Didn't get a code? Try a different email
                </button>
              </form>
            )}

            {step === 'done' && (
              <button onClick={() => router.push('/login')} className="sf-btn-primary" style={{ width:'100%', padding:'.9rem' }}>
                Go to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
