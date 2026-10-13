'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStaff, isLoggedIn, api, clearAuth } from '../../../lib/api';
import { getGeo, DEFAULT_GEO, checkPhone, phonePlaceholder, timezoneLabel } from '../../../lib/geo';
import { APPOINTMENT_LENGTHS, lengthLabel, DAY_NAMES, toMin, clock } from '../../../lib/booking-options';

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
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // Delete account
  const [delForm, setDelForm]   = useState({ confirmName:'', password:'' });
  const [delError, setDelError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Email connection (Connect Gmail)
  const [emailConnection, setEmailConnection]     = useState(null);
  const [emailConnLoading, setEmailConnLoading]   = useState(true);
  const [connectingGoogle, setConnectingGoogle]   = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);

  // Booking (hours and capacity behind the link in every message)
  const [booking, setBooking]       = useState(null);
  const [geo, setGeo]                 = useState(DEFAULT_GEO);
  const [zones, setZones]             = useState([]);
  const [timezone, setTimezone]       = useState('');
  const [savingBooking, setSavingBooking] = useState(false);

  async function loadBooking() {
    try {
      const res = await api.getBookingSettings();
      setBooking(res.data.settings);
      setZones(res.data.timezones || []);
      setTimezone(res.data.timezone || '');
    }
    catch { /* tab shows a loading line; the rest of settings still works */ }
  }

  async function handleSaveBooking(e) {
    e.preventDefault();
    if (booking.days.length === 0) { showToast('Choose at least one open day','error'); return; }
    if (toMin(booking.close) - toMin(booking.open) < Number(booking.slotMinutes)) { showToast(`Your opening hours are shorter than one ${lengthLabel(booking.slotMinutes)} appointment`,'error'); return; }
    setSavingBooking(true);
    try {
      const res = await api.saveBookingSettings({
        enabled: booking.enabled, days: booking.days, open: booking.open, close: booking.close,
        slotMinutes: Number(booking.slotMinutes), capacity: Number(booking.capacity),
        maxDaysAhead: Number(booking.maxDaysAhead), minNoticeHours: Number(booking.minNoticeHours),
        ...(timezone ? { timezone } : {}),
      });
      setBooking(res.data.settings);
      // keep the zone the dashboard shows times in in step
      const st = getStaff();
      if (st && timezone) localStorage.setItem('shihfu_staff', JSON.stringify({ ...st, timezone }));
      setGeo(getGeo());
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
    setGeo(getGeo());
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

  // Links such as /dashboard/settings?tab=booking open straight to a tab
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['profile', 'email', 'booking', 'password'].includes(t)) setActiveTab(t);
  }, [searchParams]);

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
    const ph = profile.phone ? checkPhone(profile.phone, geo.countryCode) : null;
    if (ph && !ph.ok) { showToast(ph.error,'error'); return; }
    setSavingProfile(true);
    try {
      await api.updateMe({ name: profile.name.trim(), ...(ph ? { phone: ph.national } : {}) });
      // keep the name shown in the dashboard in step
      const s = getStaff();
      if (s) localStorage.setItem('shihfu_staff', JSON.stringify({ ...s, name: profile.name.trim() }));
      showToast('Profile updated');
    } catch (err) {
      showToast(err.message || 'Could not update profile','error');
    } finally { setSavingProfile(false); }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    setDelError('');
    if (!delForm.confirmName.trim() || !delForm.password) { setDelError('Type your business name and your password'); return; }
    if (!window.confirm('Permanently delete this account and all of its data? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.deleteAccount({ password: delForm.password, confirmName: delForm.confirmName.trim() });
      clearAuth();
      router.replace('/');
    } catch (err) {
      setDelError(err.message || 'Could not delete the account');
      setDeleting(false);
    }
  }

  async function handleLogoutAll() {
    if (!window.confirm('Sign out of every other device where you are signed in? This device stays signed in.')) return;
    setLoggingOutAll(true);
    try {
      const res = await api.logoutAll();
      if (res.data?.accessToken) localStorage.setItem('shihfu_token', res.data.accessToken);
      showToast('All other devices have been signed out.');
    } catch (err) {
      showToast(err.message || 'Could not sign out other devices','error');
    } finally { setLoggingOutAll(false); }
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
      const res = await api.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      // Every other device was signed out. This one gets a fresh token so you stay signed in.
      if (res.data?.accessToken) localStorage.setItem('shihfu_token', res.data.accessToken);
      setPwForm({ current:'', newPw:'', confirm:'' });
      showToast('Password updated. Other devices have been signed out.');
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
                    <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'0.8rem', fontWeight:600, color:'var(--gold)', fontSize:'0.85rem', display:'flex', alignItems:'center' }}>+{geo.dialCode}</div>
                    <input style={{ ...inp, borderRadius:'0 4px 4px 0', minWidth:0 }} inputMode="tel" maxLength={20} placeholder={phonePlaceholder(geo.countryCode)}
                      value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value.replace(/[^\d+()\-.\s]/g,'')}))} onFocus={onFocus} onBlur={onBlur}/>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Login Email</label>
                  <input style={{ ...inp, background:'var(--warm)', color:'var(--muted)' }} value={staff?.email || ''} readOnly/>
                </div>
                <div>
                  <label style={lbl}>Country</label>
                  <input style={{ ...inp, background:'var(--warm)', color:'var(--muted)' }} value={`${geo.countryName} (+${geo.dialCode})`} readOnly/>
                </div>
                <div>
                  <label style={lbl}>Currency</label>
                  <input style={{ ...inp, background:'var(--warm)', color:'var(--muted)' }} value={geo.currency} readOnly/>
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem', opacity:savingProfile?.7:1 }}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        )}

        {activeTab==='profile' && staff?.role === 'owner' && (
          <form onSubmit={handleDeleteAccount} style={{ ...card, marginTop:'2.5rem', borderColor:'rgba(196,83,42,.3)' }}>
            <div style={{ ...sectionTitle, color:'var(--rust)' }}>Delete Account</div>
            <div style={sectionSub}>
              Permanently deletes <strong>{staff?.businessName}</strong> and everything in it: customers, service history, reminders, appointments, booking links, message history and your Gmail connection. This cannot be undone. If you only want to remove one customer, use their row in Customers instead.
            </div>
            {delError && (
              <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.82rem', color:'var(--rust)' }}>{delError}</div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.25rem' }}>
              <div>
                <label style={lbl}>Type your business name</label>
                <input style={inp} value={delForm.confirmName} onChange={e=>setDelForm(f=>({...f,confirmName:e.target.value}))} onFocus={onFocus} onBlur={onBlur} placeholder={staff?.businessName}/>
              </div>
              <div>
                <label style={lbl}>Your password</label>
                <input style={inp} type="password" autoComplete="current-password" value={delForm.password} onChange={e=>setDelForm(f=>({...f,password:e.target.value}))} onFocus={onFocus} onBlur={onBlur}/>
              </div>
            </div>
            <button type="submit" disabled={deleting}
              style={{ padding:'0.8rem 1.75rem', fontSize:'0.85rem', background:'var(--rust)', border:'none', color:'white', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontWeight:600, opacity:deleting?0.6:1 }}>
              {deleting ? 'Deleting...' : 'Delete my account permanently'}
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

            <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:6, padding:'1rem 1.15rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'var(--muted)', lineHeight:1.7 }}>
              <div style={{ fontWeight:600, color:'var(--ink)', marginBottom:'0.35rem' }}>What Google will ask you to allow</div>
              <ul style={{ margin:0, paddingLeft:'1.1rem' }}>
                <li><strong style={{ color:'var(--ink)' }}>Send email on your behalf.</strong> Only the reminders and promotions you choose to send to your customers.</li>
                <li><strong style={{ color:'var(--ink)' }}>See your email address.</strong> So we can show which account is connected and use it as the sender.</li>
              </ul>
              <div style={{ marginTop:'0.5rem' }}>
                We do not get access to read, search or delete anything in your mailbox, and we use this permission for nothing else.
                Your access token is stored encrypted, and you can disconnect at any time here or in your Google Account. Details are in our{' '}
                <Link href="/privacy#google-user-data" style={{ color:'var(--gold)', fontWeight:600 }}>Privacy Policy</Link>.
              </div>
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

              {!booking.configured && (
                <div style={{ background:'rgba(196,83,42,.07)', border:'1px solid rgba(196,83,42,.22)', borderRadius:6, padding:'.85rem 1rem', marginBottom:'1.25rem', fontSize:'.84rem', color:'var(--rust)', lineHeight:1.6 }}>
                  Your booking hours are not set yet, so no booking link is added to your messages. Choose your hours below and save to switch booking on.
                </div>
              )}

              <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', fontSize:'0.9rem', fontWeight:600, color:'var(--ink)', marginBottom:'1.5rem', cursor:'pointer' }}>
                <input type="checkbox" checked={booking.enabled} onChange={e=>setBooking(b=>({...b,enabled:e.target.checked}))} style={{ width:18, height:18, accentColor:'var(--gold)' }}/>
                Include a booking link in my messages
              </label>

              <div style={{ opacity:booking.enabled?1:.5, pointerEvents:booking.enabled?'auto':'none' }}>
                <label style={lbl}>Days you take appointments</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1.5rem' }}>
                  {DAY_NAMES.map((n,d) => (
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
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={lbl}>How long is one appointment?</label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {APPOINTMENT_LENGTHS.map(l => {
                        const on = Number(booking.slotMinutes) === l.value;
                        return (
                          <button type="button" key={l.value} onClick={() => setBooking(b=>({...b,slotMinutes:l.value}))}
                            style={{ padding:'0.55rem 1rem', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:'0.85rem', fontWeight:on?700:500,
                              border:on?'1px solid var(--gold)':'1px solid var(--border)', background:on?'rgba(200,168,75,.14)':'white', color:'var(--ink)' }}>{l.label}</button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:'0.5rem', lineHeight:1.6 }}>
                      Customers book one slot of this length, for example {clock(toMin(booking.open))} to {clock(toMin(booking.open) + Number(booking.slotMinutes))}.
                    </div>
                  </div>
                  {zones.length > 1 && (
                    <div style={{ gridColumn:'1/-1' }}>
                      <label style={lbl}>Time zone</label>
                      <select style={{ ...inp, cursor:'pointer' }} value={timezone} onChange={e=>setTimezone(e.target.value)}>
                        {zones.map(z => <option key={z} value={z}>{timezoneLabel(z)}</option>)}
                      </select>
                    </div>
                  )}
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
                  All times are in your time zone ({(timezone || geo.timezone).replace(/_/g, ' ')}). &quot;Customers at the same time&quot; is how many bookings one slot can take, for example the number of chairs, bays or staff you have.
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
              <div style={sectionSub}>Enter your current password, then choose a new one of at least 8 characters. Changing it signs you out everywhere else.</div>
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

        {activeTab==='password' && (
          <div style={{ ...card, marginTop:'1.25rem' }}>
            <div style={sectionTitle}>Signed in on other devices?</div>
            <div style={sectionSub}>
              If you used a shared computer, lost a phone or just want to be sure, sign out of every other device. You stay signed in here, and anyone else has to sign in again with the password.
            </div>
            <button type="button" onClick={handleLogoutAll} disabled={loggingOutAll}
              style={{ padding:'0.7rem 1.4rem', fontSize:'0.85rem', background:'transparent', border:'1px solid rgba(196,83,42,0.3)', color:'var(--rust)', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontWeight:500, opacity:loggingOutAll?0.6:1 }}>
              {loggingOutAll ? 'Signing out...' : 'Sign out of all other devices'}
            </button>
          </div>
        )}
      </div>

      {toast && <div className={`sf-toast ${toast.type==='error'?'sf-toast-error':''}`}>{toast.msg}</div>}
    </div>
  );
}
