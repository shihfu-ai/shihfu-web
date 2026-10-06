'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';

// Public booking page. Opened from the link in a reminder or promo message,
// no login. The link token identifies the customer and the message, so the
// business learns which message brought the booking in. Times are IST.

const TZ = 'Asia/Kolkata';
const LBL = {
  display:'block', fontSize:'.75rem', fontWeight:500,
  letterSpacing:'.1em', textTransform:'uppercase',
  color:'var(--muted)', marginBottom:'.5rem',
};

const dayChip = (date) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', timeZone:'UTC' });
const dayLong = (date) => new Date(date + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', timeZone:'UTC' });
const time12  = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit', hour12:true, timeZone:TZ });
const when    = (iso) => new Date(iso).toLocaleString('en-IN', { weekday:'long', day:'numeric', month:'long', hour:'numeric', minute:'2-digit', hour12:true, timeZone:TZ });

export default function BookingPage() {
  const { token } = useParams();
  const [page, setPage]         = useState(null);
  const [problem, setProblem]   = useState('');
  const [picked, setPicked]     = useState(null);   // chosen slot startAt
  const [dayIdx, setDayIdx]     = useState(0);
  const [notes, setNotes]       = useState('');
  const [changing, setChanging] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  function load() {
    return api.getBookingPage(token)
      .then(res => { setPage(res.data); setProblem(''); })
      .catch(err => setProblem(err.message || 'This booking link is not valid'));
  }
  useEffect(() => { load(); }, [token]);

  async function book(e) {
    e.preventDefault();
    if (!picked) { setError('Please choose a time'); return; }
    setBusy(true); setError('');
    try {
      const res = await api.bookAppointment(token, { startAt: picked, notes: notes.trim() || undefined });
      setConfirmed(res.data); setChanging(false); setCancelled(false);
    } catch (err) {
      setError(err.message || 'Could not book that time. Please try another.');
      load(); // the slot list may have changed under us
      setPicked(null);
    } finally { setBusy(false); }
  }

  async function cancel() {
    if (!window.confirm('Cancel this appointment?')) return;
    setBusy(true); setError('');
    try {
      await api.cancelBooking(token);
      setConfirmed(null); setCancelled(true); setChanging(false);
      await load();
    } catch (err) { setError(err.message || 'Could not cancel. Please call the business.'); }
    finally { setBusy(false); }
  }

  const shell = (children) => (
    <div style={{ minHeight:'100vh', background:'var(--cream)', display:'flex', justifyContent:'center', padding:'2rem 1.25rem' }}>
      <div style={{ width:'100%', maxWidth:560 }}>{children}</div>
    </div>
  );

  if (problem) return shell(
    <div style={{ textAlign:'center', paddingTop:'18vh' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--ink)', marginBottom:'.75rem' }}>We could not open this booking page</h1>
      <p style={{ color:'var(--muted)', fontSize:'.95rem', lineHeight:1.6 }}>{problem}</p>
    </div>
  );
  if (!page) return shell(<div style={{ textAlign:'center', paddingTop:'20vh', color:'var(--muted)' }}>Loading...</div>);

  const existing = confirmed || page.appointment;
  const showPicker = !existing || changing;
  const days = page.slots || [];
  const day = days[Math.min(dayIdx, Math.max(days.length - 1, 0))];
  const call = page.businessPhone ? `+91 ${page.businessPhone}` : null;

  return shell(
    <div>
      <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, color:'var(--muted)', marginBottom:'.5rem' }}>{page.businessName}</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:900, color:'var(--ink)', letterSpacing:'-0.02em', marginBottom:'.5rem' }}>
          {existing && !changing ? 'Your appointment' : `Hi ${page.customerFirstName}, book your appointment`}
        </h1>
        {(page.reminderType || page.entityName) && (
          <p style={{ fontSize:'.9rem', color:'var(--muted)' }}>
            {page.entityName ? `${page.entityName}` : ''}{page.entityName && page.reminderType ? ' / ' : ''}{page.reminderType || ''}
          </p>
        )}
      </div>

      <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, padding:'1.75rem', boxShadow:'0 4px 24px rgba(13,13,13,.06)' }}>
        {error && (
          <div style={{ background:'rgba(196,83,42,.08)', border:'1px solid rgba(196,83,42,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.85rem', color:'var(--rust)' }}>{error}</div>
        )}
        {cancelled && !existing && (
          <div style={{ background:'rgba(74,124,89,.08)', border:'1px solid rgba(74,124,89,.2)', borderRadius:4, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.85rem', color:'#4a7c59' }}>Your appointment has been cancelled. You can pick a new time below.</div>
        )}

        {existing && !changing && (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(74,124,89,.12)', border:'2px solid rgba(74,124,89,.3)', margin:'0 auto 1.25rem', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', color:'#4a7c59' }}>&#10003;</div>
            <div style={{ fontSize:'.8rem', color:'var(--muted)', marginBottom:'.4rem' }}>You are booked for</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.35rem', fontWeight:700, color:'var(--ink)', marginBottom:'1.5rem' }}>{when(existing.startAt)}</div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="sf-btn-ghost" style={{ flex:1, padding:'.8rem' }} onClick={() => { setChanging(true); setPicked(null); setError(''); }}>Choose another time</button>
              <button className="sf-btn-ghost" style={{ flex:1, padding:'.8rem', color:'var(--rust)' }} disabled={busy} onClick={cancel}>Cancel appointment</button>
            </div>
          </div>
        )}

        {showPicker && (
          !page.bookingEnabled || days.length === 0 ? (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <p style={{ color:'var(--muted)', fontSize:'.95rem', lineHeight:1.6 }}>
                {page.bookingEnabled ? 'There are no free times in the next few weeks.' : 'Online booking is not available right now.'}
                {call ? ` Please call ${page.businessName} on ${call}.` : ' Please contact the business directly.'}
              </p>
            </div>
          ) : (
            <form onSubmit={book}>
              <label style={LBL}>Choose a day</label>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6, marginBottom:'1.25rem' }}>
                {days.map((d, i) => (
                  <button type="button" key={d.date} onClick={() => { setDayIdx(i); setPicked(null); }}
                    style={{ flexShrink:0, padding:'.6rem .9rem', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:'.85rem', fontWeight:i===dayIdx?700:500,
                      border:i===dayIdx?'1px solid var(--gold)':'1px solid var(--border)', background:i===dayIdx?'rgba(200,168,75,.12)':'white', color:'var(--ink)' }}>
                    {dayChip(d.date)}
                  </button>
                ))}
              </div>

              <label style={LBL}>Choose a time on {day ? dayLong(day.date) : ''}</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))', gap:8, marginBottom:'1.25rem' }}>
                {day && day.slots.map(s => (
                  <button type="button" key={s.startAt} onClick={() => setPicked(s.startAt)}
                    style={{ padding:'.7rem .5rem', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:'.9rem', fontWeight:picked===s.startAt?700:500,
                      border:picked===s.startAt?'1px solid var(--gold)':'1px solid var(--border)', background:picked===s.startAt?'var(--gold)':'white', color:'var(--ink)' }}>
                    {time12(s.startAt)}
                  </button>
                ))}
              </div>

              <label style={LBL}>Anything we should know? (optional)</label>
              <textarea value={notes} maxLength={300} rows={2} onChange={e => setNotes(e.target.value)}
                style={{ width:'100%', background:'white', border:'1px solid var(--border)', borderRadius:6, padding:'.8rem 1rem', fontFamily:"'DM Sans',sans-serif", fontSize:'.95rem', color:'var(--ink)', outline:'none', marginBottom:'1.25rem', resize:'vertical' }} />

              <button type="submit" className="sf-btn-primary" disabled={busy || !picked} style={{ width:'100%', padding:'1rem', opacity:(busy || !picked)?.6:1 }}>
                {busy ? 'Booking...' : picked ? `Confirm ${time12(picked)}` : 'Choose a time'}
              </button>
              {changing && (
                <button type="button" onClick={() => { setChanging(false); setError(''); }} style={{ width:'100%', marginTop:10, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'.85rem', fontFamily:'inherit' }}>Keep my current appointment</button>
              )}
            </form>
          )
        )}
      </div>

      {call && <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.82rem', color:'var(--muted)' }}>Prefer to call? {page.businessName} on {call}</p>}
      <p style={{ textAlign:'center', marginTop:'.5rem', fontSize:'.72rem', color:'var(--muted)' }}>All times are Indian Standard Time.</p>
    </div>
  );
}
