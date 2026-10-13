'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { lengthLabel } from '../../../lib/booking-options';

// Public booking page. Opened from the link in a reminder or promo message,
// no login. The link token identifies the customer and the message, so the
// business learns which message brought the booking in. Every time shown is
// in the business's own time zone (not the visitor's), and the page says so.

const LBL = {
  display:'block', fontSize:'.75rem', fontWeight:500,
  letterSpacing:'.1em', textTransform:'uppercase',
  color:'var(--muted)', marginBottom:'.5rem',
};

// Formatters bound to the business's locale and time zone
function formatters(locale, tz) {
  const safe = (fn) => (v) => { try { return fn(v); } catch { return ''; } };
  return {
    dayChip: safe(date => new Date(date + 'T00:00:00Z').toLocaleDateString(locale, { weekday:'short', day:'numeric', month:'short', timeZone:'UTC' })),
    dayLong: safe(date => new Date(date + 'T00:00:00Z').toLocaleDateString(locale, { weekday:'long', day:'numeric', month:'long', timeZone:'UTC' })),
    time:    safe(iso => new Date(iso).toLocaleTimeString(locale, { hour:'numeric', minute:'2-digit', timeZone:tz })),
    when:    safe(iso => new Date(iso).toLocaleString(locale, { weekday:'long', day:'numeric', month:'long', hour:'numeric', minute:'2-digit', timeZone:tz })),
    zone:    safe(() => {
      const p = new Intl.DateTimeFormat(locale, { timeZone:tz, timeZoneName:'short' }).formatToParts(new Date()).find(x => x.type === 'timeZoneName');
      return `${tz.replace(/_/g, ' ')}${p ? ` (${p.value})` : ''}`;
    }),
  };
}

export default function BookingPage() {
  const { token } = useParams();
  const [page, setPage]         = useState(null);
  const [problem, setProblem]   = useState('');
  const [picked, setPicked]     = useState(null);   // chosen slot (the whole slot object)
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
      const res = await api.bookAppointment(token, { startAt: picked.startAt, notes: notes.trim() || undefined });
      setConfirmed(res.data); setChanging(false); setCancelled(false); setPicked(null);
      load();
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
      <div style={{ width:'100%', maxWidth:580 }}>{children}</div>
    </div>
  );

  if (problem) return shell(
    <div style={{ textAlign:'center', paddingTop:'18vh' }}>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.7rem', color:'var(--ink)', marginBottom:'.75rem' }}>We could not open this booking page</h1>
      <p style={{ color:'var(--muted)', fontSize:'.95rem', lineHeight:1.6 }}>{problem}</p>
    </div>
  );
  if (!page) return shell(<div style={{ textAlign:'center', paddingTop:'20vh', color:'var(--muted)' }}>Loading...</div>);

  const fmt = formatters(page.locale || 'en', page.timezone || 'UTC');
  const existing = confirmed || page.appointment;
  const showPicker = !existing || changing;
  const days = page.slots || [];
  const dayIndex = Math.min(dayIdx, Math.max(days.length - 1, 0));
  const day = days[dayIndex];
  const len = Number(page.slotMinutes);
  const openCount = day ? day.slots.filter(s => s.available || s.mine).length : 0;

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
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.35rem', fontWeight:700, color:'var(--ink)', marginBottom:'.35rem' }}>{fmt.when(existing.startAt)}</div>
            <div style={{ fontSize:'.85rem', color:'var(--muted)', marginBottom:'1.5rem' }}>
              {fmt.time(existing.startAt)} to {fmt.time(new Date(new Date(existing.startAt).getTime() + (existing.durationMin || len) * 60000).toISOString())} ({lengthLabel(existing.durationMin || len)})
            </div>
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
                {page.bookingEnabled ? 'There are no times to book in the next few weeks.' : 'Online booking is not available right now.'}
                {page.businessPhone ? ` Please call ${page.businessName} on ${page.businessPhone}.` : ' Please contact the business directly.'}
              </p>
            </div>
          ) : (
            <form onSubmit={book}>
              <div style={{ background:'var(--warm)', border:'1px solid var(--border)', borderRadius:6, padding:'.65rem .9rem', marginBottom:'1.25rem', fontSize:'.8rem', color:'var(--muted)', lineHeight:1.6 }}>
                Each appointment is <strong style={{ color:'var(--ink)' }}>{lengthLabel(len)}</strong>. Times are in <strong style={{ color:'var(--ink)' }}>{fmt.zone()}</strong>, the time zone of {page.businessName}.
              </div>

              <label style={LBL}>Choose a day</label>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:6, marginBottom:'1.25rem' }}>
                {days.map((d, i) => {
                  const full = d.availableCount === 0;
                  return (
                    <button type="button" key={d.date} onClick={() => { setDayIdx(i); setPicked(null); }}
                      style={{ flexShrink:0, padding:'.55rem .9rem', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:'.85rem', fontWeight:i===dayIndex?700:500, textAlign:'center',
                        border:i===dayIndex?'1px solid var(--gold)':'1px solid var(--border)', background:i===dayIndex?'rgba(200,168,75,.12)':'white', color:full?'var(--muted)':'var(--ink)' }}>
                      <div>{fmt.dayChip(d.date)}</div>
                      <div style={{ fontSize:'.66rem', fontWeight:500, marginTop:2, color:full?'var(--rust)':'#4a7c59' }}>{full ? 'Fully booked' : `${d.availableCount} open`}</div>
                    </button>
                  );
                })}
              </div>

              <label style={LBL}>Choose a time on {day ? fmt.dayLong(day.date) : ''}</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(112px, 1fr))', gap:8, marginBottom:'.75rem' }}>
                {day && day.slots.map(s => {
                  const chosen = picked && picked.startAt === s.startAt;
                  const taken = !s.available && !s.mine;
                  return (
                    <button type="button" key={s.startAt} disabled={taken} onClick={() => setPicked(s)}
                      title={taken ? 'This time is already booked' : s.mine ? 'Your current appointment' : `${fmt.time(s.startAt)} to ${fmt.time(s.endAt)}`}
                      style={{ padding:'.6rem .4rem', borderRadius:6, cursor:taken?'not-allowed':'pointer', fontFamily:'inherit', fontSize:'.88rem', fontWeight:chosen?700:500, lineHeight:1.25,
                        border:chosen?'1px solid var(--gold)':s.mine?'1px dashed var(--gold)':'1px solid var(--border)',
                        background:chosen?'var(--gold)':taken?'var(--warm)':'white',
                        color:taken?'#a39a88':'var(--ink)', textDecoration:taken?'line-through':'none' }}>
                      {fmt.time(s.startAt)}
                      <div style={{ fontSize:'.64rem', fontWeight:500, textDecoration:'none', color:chosen?'var(--ink)':taken?'var(--rust)':s.mine?'var(--gold)':'var(--muted)' }}>
                        {taken ? 'Booked' : s.mine ? 'Your booking' : `to ${fmt.time(s.endAt)}`}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'.72rem', color:'var(--muted)', marginBottom:'1.25rem' }}>
                <span><span style={{ display:'inline-block', width:10, height:10, border:'1px solid var(--border)', background:'white', borderRadius:2, marginRight:5 }}/>Available ({openCount})</span>
                <span><span style={{ display:'inline-block', width:10, height:10, background:'var(--warm)', border:'1px solid var(--border)', borderRadius:2, marginRight:5 }}/>Booked</span>
              </div>

              {picked && (
                <div style={{ background:'rgba(200,168,75,.1)', border:'1px solid rgba(200,168,75,.3)', borderRadius:6, padding:'.7rem .9rem', marginBottom:'1.25rem', fontSize:'.85rem', color:'var(--ink)' }}>
                  <strong>{fmt.when(picked.startAt)}</strong>, {fmt.time(picked.startAt)} to {fmt.time(picked.endAt)} ({lengthLabel(len)})
                </div>
              )}

              <label style={LBL}>Anything we should know? (optional)</label>
              <textarea value={notes} maxLength={300} rows={2} onChange={e => setNotes(e.target.value)}
                style={{ width:'100%', background:'white', border:'1px solid var(--border)', borderRadius:6, padding:'.8rem 1rem', fontFamily:"'DM Sans',sans-serif", fontSize:'.95rem', color:'var(--ink)', outline:'none', marginBottom:'1.25rem', resize:'vertical' }} />

              <button type="submit" className="sf-btn-primary" disabled={busy || !picked} style={{ width:'100%', padding:'1rem', opacity:(busy || !picked)?.6:1 }}>
                {busy ? 'Booking...' : picked ? `Confirm ${fmt.time(picked.startAt)}` : 'Choose a time'}
              </button>
              {changing && (
                <button type="button" onClick={() => { setChanging(false); setError(''); }} style={{ width:'100%', marginTop:10, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'.85rem', fontFamily:'inherit' }}>Keep my current appointment</button>
              )}
            </form>
          )
        )}
      </div>

      {page.businessPhone && <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'.82rem', color:'var(--muted)' }}>Prefer to call? {page.businessName} on {page.businessPhone}</p>}
    </div>
  );
}
