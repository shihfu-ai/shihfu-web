'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStaff, isLoggedIn, api } from '../../../lib/api';

// useSearchParams() requires a Suspense boundary during static
// prerendering, or `next build` fails outright - Next.js bails the whole
// build on it.
export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageInner />
    </Suspense>
  );
}

function SettingsPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [staff, setStaff]         = useState(null);
  const [toast, setToast]         = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profile, setProfile]   = useState({ name:'', phone:'' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [pwForm, setPwForm]     = useState({ current:'', newPw:'', confirm:'' });
  const [pwError, setPwError]   = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // Email connection (Connect Gmail)
  const [emailConnection, setEmailConnection]     = useState(null);
  const [emailConnLoading, setEmailConnLoading]   = useState(true);
  const [connectingGoogle, setConnectingGoogle]   = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);

  // Booking (hours and capacity behind the link in every message)
  const [booking, setBooking]       = useState(null);
  const [savingBooking, setSavingBooking] = useState(false);

  async function loadBooking() {
    try { const res = await api.getBookingSettings(); setBooking(res.data.settings); }
    catch { /* tab shows a loading line; the rest of settings still works */ }
  }

  async function handleSaveBooking(e) {
    e.preventDefault();
    if (booking.days.length === 0) { showToast('Choose at least one open day','error'); return; }
    if (booking.close <= booking.open) { showToast('Closing time must be after opening time','error'); return; }
    setSavingBooking(true);
    try {
      const res = await api.saveBookingSettings({
        enabled: booking.enabled, days: booking.days, open: booking.open, close: booking.close,
        slotMinutes: Number(booking.slotMinutes), capacity: Number(booking.capacity),
        maxDaysAhead: Number(booking.maxDaysAhead), minNoticeHours: Number(booking.minNoticeHours),
      });
      setBooking(res.data.settings);
      showToast('Booking settings saved');
    } catch (err) {
      showToast(err.message || 'Could not save booking settings','error');
    } finally { setSavingBooking(false); }
  }

  function toggleDay(d) {
    setBooking(b => ({ ...b, days: b.days.includes(d) ? b.days.filter(x => x !== d) : [...b.days, d].sort() }));
  }

  function showToast(msg, type='success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const s = getStaff();
    if (s) {
      setStaff(s);
      setProfile(p => ({ ...p, name: s.name || '' }));
    }
    api.me().then(res => {
      setProfile({ name: res.data.name || '', phone: res.data.business_phone || '' });
    }).catch(() => {});
    loadEmailConnection();
    loadBooking();
  }, []);

  // After Google redirects back from the consent screen
  useEffect(() => {
    if (searchParams.get('email_connected')) {
      setActiveTab('email');
      showToast('Google account connected. Emails will now send from your own mailbox.');
      loadEmailConnection();
      router.replace('/dashboard/settings');
    } else if (searchParams.get('email_error')) {
      setActiveTab('email');
      showToast(searchParams.get('email_error'), 'error');
      router.replace('/dashboard/settings');
    }
  }, [searchParams]);

  async function loadEmailConnection() {
    setEmailConnLoading(true);
    try {
      const res = await api.getEmailConnectionStatus();
      setEmailConnection(res.data);
    } catch {
      setEmailConnection({ connected: false });
    } finally {
      setEmailConnLoading(false);
    }
  }

  async function handleConnectGoogle() {
    setConnectingGoogle(true);
    try {
      const res = await api.getGoogleConnectUrl();
      window.location.href = res.data.url;
    } catch (err) {
      showToast(err.message || 'Could not start Google connection','error');
      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!window.confirm('Disconnect your Gmail? Reminders and campaigns cannot be emailed until you connect it again.')) return;
    setDisconnectingGoogle(true);
    try {
      await api.disconnectGoogleEmail();
      setEmailConnection({ connected: false });
      showToast('Google account disconnected');
    } catch (err) {
      showToast(err.message || 'Failed to disconnect','error');
    } finally {
      setDisconnectingGoogle(false);
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (profile.name.trim().length < 2) { showToast('Please enter your name','error'); return; }
    if (profile.phone && !/^[6-9]\d{9}$/.test(profile.phone)) { showToast('Enter a valid 10-digit Indian mobile number','error'); return; }
    setSavingProfile(true);
    try {
      await api.updateMe({ name: profile.name.trim(), ...(profile.phone ? { phone: profile.phone } : {}) });
      // keep the name shown in the dashboard in step
      const s = getStaff();
      if (s) localStorage.setItem('shihfu_staff', JSON.stringify({ ...s, name: profile.name.trim() }));
      showToast('Profile updated');
    } catch (err) {
      showToast(err.message || 'Could not update profile','error');
    } finally { setSavingProfile(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError('');
    if (!pwForm.current) { setPwError('Enter your current password'); return; }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPw === pwForm.current) { setPwError('New password must be different from your current password'); return; }
    setSavingPw(true);
    try {
      await api.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwForm({ current:'', newPw:'', confirm:'' });
      showToast('Password updated');
    } catch (err) {
      setPwError(err.message || 'Could not update password');
    } finally { setSavingPw(false); }
  }

  const inp = { width:'100%', background:'white', border:'1px solid var(--border)', borderRadius:4, padding:'0.8rem 1rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', color:'var(--ink)', outline:'none' };
  const lbl = { display:'block', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.5rem' };
  const sectionTitle = { fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.3rem' };
  const sectionSub   = { fontSize:'0.82rem', color:'var(--muted)', fontWeight:300, marginBottom:'1.5rem', lineHeight:1.6 };
  const card = { background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'2rem', marginBottom:'1.25rem', boxShadow:'0 2px 12px rgba(13,13,13,0.04)' };
  const tabs = [
    { id:'profile',  label:'Profile' },
    { id:'email',    label:'Email' },
    { id:'booking',  label:'Booking' },
    { id:'password', label:'Password' },
  ];
  const onFocus = e => { e.target.style.borderColor='var(--gold)'; e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'; };
  const onBlur  = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', fontFamily:"'DM Sans',sans-serif" }}>

      <nav style={{ padding:'1.2rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--muted)', textDecoration:'none' }}>
          Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'3rem 2rem' }}>

        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ width:24, height:1, background:'var(--gold)', display:'block' }}></span>
            Configuration
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.4rem', fontWeight:900, color:'var(--ink)', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            Account <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Settings</em>
          </h1>
        </div>

        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'2rem' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:'0.75rem 1.5rem', border:'none', background:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:500, color:activeTab===t.id?'var(--gold)':'var(--muted)', borderBottom:`2px solid ${activeTab===t.id?'var(--gold)':'transparent'}`, transition:'all .15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {activeTab==='profile' && (
          <form onSubmit={handleSaveProfile}>
            <div style={card}>
              <div style={sectionTitle}>Your Details</div>
              <div style={sectionSub}>Your name as it appears on your account, and the main phone number for your business.</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={lbl}>Your Name *</label>
                  <input style={inp} value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div>
                  <label style={lbl}>Business Mobile</label>
                  <div style={{ display:'flex' }}>
                    <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'0.8rem', fontWeight:600, color:'var(--gold)', fontSize:'0.85rem', display:'flex', alignItems:'center' }}>+91</div>
                    <input style={{ ...inp, borderRadius:'0 4px 4px 0' }} inputMode="numeric" maxLength={10} placeholder="98765 43210"
                      value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value.replace(/\D/g,'').slice(0,10)}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Login Email</label>
                  <input style={{ ...inp, background:'var(--warm)', color:'var(--muted)' }} value={staff?.email || ''} readOnly/>
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem', opacity:savingProfile?.7:1 }}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* ── EMAIL ── */}
        {activeTab==='email' && (
          <div style={card}>
            <div style={sectionTitle}>Send Email From Your Own Mailbox</div>
            <div style={sectionSub}>
              Reminder and promo emails are sent from your own Gmail address, in your business&apos;s name, and appear in your Gmail Sent folder.
              Shih-Fu only gets permission to send - never to read your inbox or your customers&apos; replies. Email cannot be sent until you connect a Gmail account.
            </div>

            {emailConnLoading ? (
              <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Checking connection...</div>
            ) : emailConnection?.connected ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', padding:'1rem 1.25rem', background:'rgba(74,124,89,0.06)', border:'1px solid rgba(74,124,89,0.2)', borderRadius:6 }}>
                <div>
                  <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#4a7c59', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem' }}>Connected</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--ink)' }}>{emailConnection.email}</div>
                </div>
                <button type="button" onClick={handleDisconnectGoogle} disabled={disconnectingGoogle}
                  style={{ padding:'0.6rem 1.25rem', fontSize:'0.82rem', background:'transparent', border:'1px solid rgba(196,83,42,0.3)', color:'var(--rust)', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontWeight:500, opacity:disconnectingGoogle?0.6:1 }}>
                  {disconnectingGoogle ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', padding:'1rem 1.25rem', background:'rgba(196,83,42,0.05)', border:'1px solid rgba(196,83,42,0.2)', borderRadius:6 }}>
                <div>
                  <div style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--rust)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.3rem' }}>Not Connected</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Connect Gmail to send email reminders and campaigns to your customers.</div>
                </div>
                <button type="button" onClick={handleConnectGoogle} disabled={connectingGoogle} className="sf-btn-primary" style={{ padding:'0.7rem 1.5rem', fontSize:'0.85rem', opacity:connectingGoogle?0.7:1, whiteSpace:'nowrap' }}>
                  {connectingGoogle ? 'Redirecting...' : 'Connect Gmail'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── BOOKING ── */}
        {activeTab==='booking' && (
          !booking ? <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Loading...</div> : (
          <form onSubmit={handleSaveBooking}>
            <div style={card}>
              <div style={sectionTitle}>Online Booking</div>
              <div style={sectionSub}>
                Every reminder and promotion you send includes a link where the customer can pick a time and book. These settings decide which times they can choose.
                Bookings appear under Appointments in your dashboard, and Shih-Fu tracks which messages lead to bookings so you can see what works.
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.9rem', fontWeight:600, color:'var(--ink)', marginBottom:'1.5rem', cursor:'pointer' }}>
                <input type="checkbox" checked={booking.enabled} onChange={e=>setBooking(b=>({...b,enabled:e.target.checked}))} style={{ width:18, height:18, accentColor:'var(--gold)' }}/>
                Include a booking link in my messages
              </label>

              <div style={{ opacity:booking.enabled?1:.5, pointerEvents:booking.enabled?'auto':'none' }}>
                <label style={lbl}>Days you take appointments</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1.5rem' }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((n,d) => (
                    <button type="button" key={d} onClick={() => toggleDay(d)}
                      style={{ padding:'0.55rem 1rem', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:'0.85rem', fontWeight:booking.days.includes(d)?700:500,
                        border:booking.days.includes(d)?'1px solid var(--gold)':'1px solid var(--border)', background:booking.days.includes(d)?'rgba(200,168,75,.14)':'white', color:'var(--ink)' }}>{n}</button>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
                  <div>
                    <label style={lbl}>Opens</label>
                    <input style={inp} type="time" value={booking.open} onChange={e=>setBooking(b=>({...b,open:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                  <div>
                    <label style={lbl}>Closes</label>
                    <input style={inp} type="time" value={booking.close} onChange={e=>setBooking(b=>({...b,close:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                  <div>
                    <label style={lbl}>Appointment length</label>
                    <select style={{ ...inp, cursor:'pointer' }} value={booking.slotMinutes} onChange={e=>setBooking(b=>({...b,slotMinutes:e.target.value}))}>
                      {[15,20,30,45,60,90,120].map(m => <option key={m} value={m}>{m} minutes</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Customers at the same time</label>
                    <input style={inp} type="number" min="1" max="50" value={booking.capacity} onChange={e=>setBooking(b=>({...b,capacity:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                  <div>
                    <label style={lbl}>How far ahead (days)</label>
                    <input style={inp} type="number" min="1" max="90" value={booking.maxDaysAhead} onChange={e=>setBooking(b=>({...b,maxDaysAhead:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                  <div>
                    <label style={lbl}>Minimum notice (hours)</label>
                    <input style={inp} type="number" min="0" max="72" value={booking.minNoticeHours} onChange={e=>setBooking(b=>({...b,minNoticeHours:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                </div>
                <div style={{ fontSize:'0.78rem', color:'var(--muted)', lineHeight:1.6 }}>
                  Times are Indian Standard Time. &quot;Customers at the same time&quot; is how many bookings one slot can take, for example the number of chairs, bays or staff you have.
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingBooking} className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem', opacity:savingBooking?.7:1 }}>
              {savingBooking ? 'Saving...' : 'Save Booking Settings'}
            </button>
          </form>
          )
        )}

        {/* ── PASSWORD ── */}
        {activeTab==='password' && (
          <form onSubmit={handleChangePassword}>
            <div style={card}>
              <div style={sectionTitle}>Change Password</div>
              <div style={sectionSub}>Enter your current password, then choose a new one of at least 8 characters.</div>
              {pwError && (
                <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--rust)' }}>{pwError}</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                <div>
                  <label style={lbl}>Current Password</label>
                  <input style={inp} type="password" autoComplete="current-password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div>
                  <label style={lbl}>New Password</label>
                  <input style={inp} type="password" autoComplete="new-password" placeholder="Minimum 8 characters" value={pwForm.newPw} onChange={e=>setPwForm(f=>({...f,newPw:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div>
                  <label style={lbl}>Confirm New Password</label>
                  <input style={inp} type="password" autoComplete="new-password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingPw} className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem', opacity:savingPw?.7:1 }}>
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {toast && <div className={`sf-toast ${toast.type==='error'?'sf-toast-error':''}`}>{toast.msg}</div>}
    </div>
  );
}
