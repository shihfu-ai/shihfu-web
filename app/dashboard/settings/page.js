'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStaff, isLoggedIn, api } from '../../../lib/api';

export default function SettingsPage() {
  const router     = useRouter();
  const fileRef    = useRef(null);
  const [staff, setStaff]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [activeTab, setActiveTab]   = useState('profile');

  // Profile
  const [profile, setProfile] = useState({ firstName:'', lastName:'', profilePicture:null, previewUrl:null });

  // Contact
  const [phones, setPhones]   = useState(['']);
  const [emails, setEmails]   = useState(['']);
  const [birthday, setBirthday] = useState('');
  const [gender, setGender]   = useState('');

  // Password
  const [pwForm, setPwForm]   = useState({ current:'', newPw:'', confirm:'' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [verifyingPw, setVerifyingPw] = useState(false);
  const [pwVerified, setPwVerified]   = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const s = getStaff();
    if (s) {
      setStaff(s);
      const parts = s.name?.split(' ') || ['',''];
      setProfile(p => ({ ...p, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' }));
      setEmails([s.email || '']);
    }
  }, []);

  function showToast(msg, type='success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Profile picture ─────────────────────────────────────────────
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB','error'); return; }
    if (!file.type.startsWith('image/')) { showToast('Please select an image file','error'); return; }
    const url = URL.createObjectURL(file);
    setProfile(p => ({ ...p, profilePicture: file, previewUrl: url }));
  }

  function handleDeletePicture() {
    if (profile.previewUrl) URL.revokeObjectURL(profile.previewUrl);
    setProfile(p => ({ ...p, profilePicture: null, previewUrl: null }));
    if (fileRef.current) fileRef.current.value = '';
    showToast('Profile picture removed');
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!profile.firstName.trim()) { showToast('First name is required','error'); return; }
    showToast('Profile updated successfully');
  }

  // ── Contact ─────────────────────────────────────────────────────
  function addPhone()  { if (phones.length < 3) setPhones(p => [...p, '']); }
  function addEmail()  { if (emails.length < 3) setEmails(e => [...e, '']); }
  function removePhone(i) { setPhones(p => p.filter((_,idx) => idx!==i)); }
  function removeEmail(i) { setEmails(e => e.filter((_,idx) => idx!==i)); }
  function updatePhone(i, val) { setPhones(p => p.map((v,idx) => idx===i ? val : v)); }
  function updateEmail(i, val) { setEmails(e => e.map((v,idx) => idx===i ? val : v)); }

  async function handleSaveContact(e) {
    e.preventDefault();
    const validPhones = phones.filter(p => p.trim());
    for (const ph of validPhones) {
      if (!/^[6-9]\d{9}$/.test(ph.replace(/\s/g,''))) {
        showToast('Please enter a valid 10-digit Indian mobile number','error'); return;
      }
    }
    showToast('Contact details saved');
  }

  // ── Password ─────────────────────────────────────────────────────
  async function handleVerifyCurrentPassword() {
    if (!pwForm.current) { setPwError('Please enter your current password'); return; }
    setVerifyingPw(true);
    setPwError('');
    try {
      const s = getStaff();
      await api.login({ email: s.email, password: pwForm.current });
      setPwVerified(true);
      showToast('Current password verified');
    } catch {
      setPwError('Current password is incorrect. Please try again.');
      setPwVerified(false);
    } finally { setVerifyingPw(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!pwVerified) { setPwError('Please verify your current password first'); return; }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('New passwords do not match'); return; }
    if (pwForm.newPw === pwForm.current) { setPwError('New password must be different from your current password'); return; }
    setPwError('');
    setPwSuccess(true);
    setPwForm({ current:'', newPw:'', confirm:'' });
    setPwVerified(false);
    showToast('Password updated successfully');
    setTimeout(() => setPwSuccess(false), 4000);
  }

  // Shared styles
  const inp = { width:'100%', background:'white', border:'1px solid var(--border)', borderRadius:4, padding:'0.8rem 1rem', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', color:'var(--ink)', outline:'none', transition:'border-color .2s, box-shadow .2s' };
  const lbl = { display:'block', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.5rem' };
  const sectionTitle = { fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.3rem' };
  const sectionSub   = { fontSize:'0.82rem', color:'var(--muted)', fontWeight:300, marginBottom:'1.5rem', lineHeight:1.6 };
  const card = { background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'2rem', marginBottom:'1.25rem', boxShadow:'0 2px 12px rgba(13,13,13,0.04)' };
  const tabs = [
    { id:'profile',  label:'Profile' },
    { id:'contact',  label:'Contact' },
    { id:'password', label:'Password' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ padding:'1.2rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--muted)', textDecoration:'none' }}>
          Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'3rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.6rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ width:24, height:1, background:'var(--gold)', display:'block' }}></span>
            Configuration
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.4rem', fontWeight:900, color:'var(--ink)', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            Account <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Settings</em>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'2rem', gap:0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:'0.75rem 1.5rem', border:'none', background:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:'0.875rem', fontWeight:500, color:activeTab===t.id?'var(--gold)':'var(--muted)', borderBottom:`2px solid ${activeTab===t.id?'var(--gold)':'transparent'}`, transition:'all .15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab==='profile' && (
          <form onSubmit={handleSaveProfile}>

            {/* Profile picture */}
            <div style={card}>
              <div style={sectionTitle}>Profile Picture</div>
              <div style={{ ...sectionSub, marginBottom:'1.25rem' }}>Upload a clear photo. JPG or PNG, max 5MB.</div>

              <div style={{ display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
                {/* Avatar */}
                <div style={{ width:96, height:96, borderRadius:'50%', background:'rgba(200,168,75,0.15)', border:'2px solid rgba(200,168,75,0.3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                  {profile.previewUrl
                    ? <img src={profile.previewUrl} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'var(--gold)' }}>{profile.firstName?.charAt(0) || staff?.name?.charAt(0) || 'U'}</span>
                  }
                </div>

                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileSelect}/>
                  <button type="button" onClick={() => fileRef.current?.click()} className="sf-btn-primary" style={{ padding:'0.6rem 1.25rem', fontSize:'0.82rem' }}>
                    {profile.previewUrl ? 'Update Photo' : 'Upload Photo'}
                  </button>
                  {profile.previewUrl && (
                    <button type="button" onClick={handleDeletePicture} style={{ padding:'0.6rem 1.25rem', fontSize:'0.82rem', background:'transparent', border:'1px solid rgba(196,83,42,0.3)', color:'var(--rust)', borderRadius:4, cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>
                      Delete Photo
                    </button>
                  )}
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>JPG, PNG up to 5MB</div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div style={card}>
              <div style={sectionTitle}>Personal Information</div>
              <div style={sectionSub}>Your name as it appears on your account and in staff records.</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
                <div>
                  <label style={lbl}>First Name *</label>
                  <input style={inp} placeholder="Priya" required value={profile.firstName} onChange={e => setProfile(p=>({...p,firstName:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
                <div>
                  <label style={lbl}>Last Name</label>
                  <input style={inp} placeholder="Sharma" value={profile.lastName} onChange={e => setProfile(p=>({...p,lastName:e.target.value}))}
                    onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                    onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                </div>
              </div>
            </div>

            <button type="submit" className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem' }}>Save Profile</button>
          </form>
        )}

        {/* ── CONTACT TAB ── */}
        {activeTab==='contact' && (
          <form onSubmit={handleSaveContact}>

            {/* Phone */}
            <div style={card}>
              <div style={sectionTitle}>Phone Numbers</div>
              <div style={sectionSub}>Your primary number is used for WhatsApp Business notifications and account recovery.</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {phones.map((ph, i) => (
                  <div key={i}>
                    <label style={lbl}>{i===0 ? 'Primary Phone *' : `Additional Phone ${i+1}`}</label>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'4px 0 0 4px', padding:'0.8rem 0.9rem', fontSize:'0.82rem', fontWeight:600, color:'var(--gold)', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>+91</div>
                      <input style={{ ...inp, borderRadius:'0 4px 4px 0', flex:1 }} placeholder="98765 43210" maxLength={10} value={ph} onChange={e=>updatePhone(i,e.target.value.replace(/\D/g,'').slice(0,10))}
                        onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}
                        required={i===0}/>
                      {i > 0 && (
                        <button type="button" onClick={()=>removePhone(i)} style={{ padding:'0 0.85rem', background:'rgba(196,83,42,0.06)', border:'1px solid rgba(196,83,42,0.2)', borderRadius:4, color:'var(--rust)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'inherit', whiteSpace:'nowrap' }}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
                {phones.length < 3 && (
                  <button type="button" onClick={addPhone} style={{ alignSelf:'flex-start', background:'transparent', border:'1px dashed var(--border)', borderRadius:4, padding:'0.5rem 1rem', fontSize:'0.78rem', fontWeight:500, color:'var(--muted)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)'}}>
                    + Add another phone number
                  </button>
                )}
              </div>
            </div>

            {/* Birthday */}
            <div style={card}>
              <div style={sectionTitle}>Birthday</div>
              <div style={sectionSub}>Used to send you a birthday greeting. Not shared publicly.</div>
              <div style={{ maxWidth:280 }}>
                <label style={lbl}>Date of Birth</label>
                <input style={inp} type="date" value={birthday} onChange={e=>setBirthday(e.target.value)}
                  onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                  onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
              </div>
            </div>

            {/* Email */}
            <div style={card}>
              <div style={sectionTitle}>Email Addresses</div>
              <div style={sectionSub}>Your primary email is used for login and important account notifications.</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {emails.map((em, i) => (
                  <div key={i}>
                    <label style={lbl}>{i===0 ? 'Primary Email *' : `Additional Email ${i+1}`}</label>
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      <input style={{ ...inp, flex:1 }} type="email" placeholder="priya@example.com" value={em} onChange={e=>updateEmail(i,e.target.value)}
                        onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}
                        required={i===0}/>
                      {i > 0 && (
                        <button type="button" onClick={()=>removeEmail(i)} style={{ padding:'0 0.85rem', background:'rgba(196,83,42,0.06)', border:'1px solid rgba(196,83,42,0.2)', borderRadius:4, color:'var(--rust)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, fontFamily:'inherit' }}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
                {emails.length < 3 && (
                  <button type="button" onClick={addEmail} style={{ alignSelf:'flex-start', background:'transparent', border:'1px dashed var(--border)', borderRadius:4, padding:'0.5rem 1rem', fontSize:'0.78rem', fontWeight:500, color:'var(--muted)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--muted)'}}>
                    + Add another email address
                  </button>
                )}
              </div>
            </div>

            {/* Gender */}
            <div style={card}>
              <div style={sectionTitle}>Gender</div>
              <div style={sectionSub}>This helps us personalise your experience.</div>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {['Male','Female','Prefer not to say'].map(g => (
                  <div key={g} onClick={()=>setGender(g)} style={{ padding:'0.7rem 1.25rem', borderRadius:6, cursor:'pointer', border:`1.5px solid ${gender===g?'var(--gold)':'var(--border)'}`, background:gender===g?'rgba(200,168,75,0.08)':'white', fontSize:'0.875rem', fontWeight:gender===g?600:400, color:gender===g?'var(--gold)':'var(--muted)', transition:'all .2s' }}>
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem' }}>Save Contact Details</button>
          </form>
        )}

        {/* ── PASSWORD TAB ── */}
        {activeTab==='password' && (
          <form onSubmit={handleChangePassword}>
            <div style={card}>
              <div style={sectionTitle}>Change Password</div>
              <div style={sectionSub}>For your security, you must verify your current password before setting a new one. Your new password must be at least 8 characters.</div>

              {pwError && (
                <div style={{ background:'rgba(196,83,42,0.08)', border:'1px solid rgba(196,83,42,0.2)', borderRadius:6, padding:'0.75rem 1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'var(--rust)' }}>
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div style={{ background:'rgba(74,124,89,0.08)', border:'1px solid rgba(74,124,89,0.2)', borderRadius:6, padding:'0.75rem 1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'#4a7c59', fontWeight:500 }}>
                  Password updated successfully.
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

                {/* Step 1 — Current password */}
                <div style={{ padding:'1.25rem', background:'var(--warm)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.75rem' }}>
                    Step 1 — Verify Current Password
                  </div>
                  <label style={lbl}>Current Password</label>
                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    <input style={{ ...inp, flex:1 }} type="password" placeholder="Enter your current password" value={pwForm.current} onChange={e=>{setPwForm(f=>({...f,current:e.target.value}));setPwVerified(false);setPwError('');}}
                      onFocus={e=>{e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}
                      onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}
                      disabled={pwVerified}/>
                    <button type="button" onClick={handleVerifyCurrentPassword} disabled={verifyingPw || pwVerified || !pwForm.current} style={{ padding:'0 1.25rem', borderRadius:4, fontSize:'0.82rem', fontWeight:600, cursor:pwVerified?'default':'pointer', border:'none', fontFamily:'inherit', whiteSpace:'nowrap', background:pwVerified?'rgba(74,124,89,0.1)':verifyingPw?'var(--warm)':'var(--ink)', color:pwVerified?'#4a7c59':verifyingPw?'var(--muted)':'var(--cream)', transition:'all .2s', opacity: !pwForm.current && !pwVerified ? 0.5 : 1 }}>
                      {pwVerified ? 'Verified' : verifyingPw ? 'Checking...' : 'Verify'}
                    </button>
                  </div>
                  {pwVerified && (
                    <div style={{ fontSize:'0.75rem', color:'#4a7c59', marginTop:'0.5rem', fontWeight:500 }}>Current password verified. You can now set a new password.</div>
                  )}
                </div>

                {/* Step 2 — New password (only enabled after verification) */}
                <div style={{ padding:'1.25rem', background: pwVerified ? 'white' : 'var(--warm)', borderRadius:8, border:'1px solid var(--border)', opacity: pwVerified ? 1 : 0.5, transition:'opacity .3s' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:'0.75rem' }}>
                    Step 2 — Set New Password
                    {!pwVerified && <span style={{ marginLeft:'0.5rem', fontWeight:400, textTransform:'none', letterSpacing:0 }}>(verify current password first)</span>}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div>
                      <label style={lbl}>New Password</label>
                      <input style={inp} type="password" placeholder="Minimum 8 characters" value={pwForm.newPw} onChange={e=>setPwForm(f=>({...f,newPw:e.target.value}))} disabled={!pwVerified}
                        onFocus={e=>{if(pwVerified){e.target.style.borderColor='var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}}
                        onBlur={e=>{e.target.style.borderColor='var(--border)';e.target.style.boxShadow='none'}}/>
                      {/* Password strength indicator */}
                      {pwForm.newPw && pwVerified && (
                        <div style={{ marginTop:'0.4rem' }}>
                          <div style={{ display:'flex', gap:'3px', marginBottom:'0.25rem' }}>
                            {[0,1,2,3].map(i => (
                              <div key={i} style={{ flex:1, height:3, borderRadius:2, background: getPasswordStrength(pwForm.newPw) > i ? getStrengthColor(getPasswordStrength(pwForm.newPw)) : 'var(--border)', transition:'background .2s' }}/>
                            ))}
                          </div>
                          <div style={{ fontSize:'0.7rem', color: getStrengthColor(getPasswordStrength(pwForm.newPw)) }}>
                            {['','Weak','Fair','Good','Strong'][getPasswordStrength(pwForm.newPw)]}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={lbl}>Confirm New Password</label>
                      <input style={{ ...inp, borderColor: pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'var(--rust)' : 'var(--border)' }} type="password" placeholder="Re-enter new password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} disabled={!pwVerified}
                        onFocus={e=>{if(pwVerified){e.target.style.borderColor=pwForm.newPw!==pwForm.confirm?'var(--rust)':'var(--gold)';e.target.style.boxShadow='0 0 0 3px rgba(200,168,75,0.1)'}}}
                        onBlur={e=>{e.target.style.borderColor=pwForm.confirm&&pwForm.newPw!==pwForm.confirm?'var(--rust)':'var(--border)';e.target.style.boxShadow='none'}}/>
                      {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                        <div style={{ fontSize:'0.72rem', color:'var(--rust)', marginTop:'0.3rem' }}>Passwords do not match</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="sf-btn-primary" style={{ padding:'0.85rem 2.5rem', opacity: pwVerified ? 1 : 0.4, cursor: pwVerified ? 'pointer' : 'not-allowed' }} disabled={!pwVerified}>
              Update Password
            </button>
          </form>
        )}

      </div>

      {/* TOAST */}
      {toast && (
        <div className={`sf-toast ${toast.type==='error'?'sf-toast-error':''}`} style={{ borderLeftColor: toast.type==='error'?'var(--rust)':toast.type==='success'?'var(--gold)':'var(--muted)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function getStrengthColor(score) {
  return ['','#c4532a','#c8a84b','#4a7c59','#2a6e4a'][score] || 'var(--muted)';
}