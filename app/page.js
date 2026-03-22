'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background:'#f5f0e8', color:'#0d0d0d', overflowX:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        :root { --ink:#0d0d0d; --cream:#f5f0e8; --warm:#f0e9d6; --gold:#c8a84b; --muted:#6b6456; --border:rgba(13,13,13,0.12); --rust:#c4532a; }
        .fade-up { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .nav-link { font-size:.85rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color .2s; }
        .nav-link:hover { color:var(--ink); }
        .btn-primary { background:var(--ink); color:var(--cream); padding:.75rem 1.75rem; font-size:.875rem; font-weight:600; border:none; cursor:pointer; text-decoration:none; display:inline-block; border-radius:3px; transition:background .25s; letter-spacing:.04em; }
        .btn-primary:hover { background:var(--gold); color:var(--ink); }
        .btn-outline { color:var(--ink); font-size:.875rem; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; gap:.5rem; padding:.75rem 0; border-bottom:1px solid var(--ink); transition:color .2s,border-color .2s; }
        .btn-outline:hover { color:var(--gold); border-color:var(--gold); }
        .card-hover { transition:transform .3s,box-shadow .3s; }
        .card-hover:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.1); }
        .feature-card { background:white; border:1px solid var(--border); border-radius:8px; padding:1.75rem; position:relative; overflow:hidden; }
        .feature-card::before { content:''; position:absolute; bottom:0; left:0; width:100%; height:3px; background:var(--gold); transform:scaleX(0); transform-origin:left; transition:transform .3s ease; }
        .feature-card:hover::before { transform:scaleX(1); }
        .industry-pill { font-size:.75rem; font-weight:500; padding:.3rem .8rem; background:var(--warm); border:1px solid var(--border); border-radius:20px; color:var(--muted); white-space:nowrap; }
        .proof-card { background:var(--cream); border:1px solid var(--border); border-radius:8px; padding:2rem; }
      `}</style>

      {/* NAV — Fix #2: renamed to Sign In / Sign Up */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 4rem', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)' }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, letterSpacing:'-0.02em', color:'#0d0d0d', textDecoration:'none' }}>
          Shih<span style={{ color:'#c8a84b' }}>-Fu</span>
        </Link>
        <div style={{ display:'flex', gap:'2rem', alignItems:'center' }}>
          <a href="#how" className="nav-link">How It Works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#contact" className="nav-link">Contact</a>
          {/* Fix #2 — Sign In / Sign Up button */}
          <Link href="/login" style={{ fontSize:'.85rem', fontWeight:600, color:'var(--muted)', textDecoration:'none', letterSpacing:'.05em', paddingRight:'1rem', borderRight:'1px solid var(--border)' }}>Sign In</Link>
          <Link href="/signup" className="btn-primary" style={{ padding:'.6rem 1.4rem', fontSize:'.82rem' }}>Sign Up Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', alignItems:'center', padding:'8rem 4rem 4rem', gap:'4rem' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.6rem', fontSize:'.78rem', fontWeight:500, letterSpacing:'.14em', textTransform:'uppercase', color:'#c8a84b', marginBottom:'1.5rem' }}>
            <span style={{ width:28, height:1, background:'#c8a84b', display:'block' }}></span>
            Retention-First CRM for India
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2.8rem,5vw,5rem)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:'1.5rem' }}>
            Never lose a<br/>customer to{' '}
            <em style={{ fontStyle:'italic', color:'#c8a84b' }}>silence</em>
            <br/>again.
          </h1>
          <p style={{ fontSize:'1.05rem', lineHeight:1.75, color:'#6b6456', maxWidth:480, marginBottom:'2.5rem', fontWeight:300 }}>
            Shih-Fu automates follow-ups, service reminders, and re-engagement for any service-based business across India — so no customer ever slips through the cracks.
          </p>
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
            <Link href="/signup" className="btn-primary">Start Free — No Card Needed</Link>
            <a href="#how" className="btn-outline">See how it works</a>
          </div>
          <div style={{ marginTop:'2rem', fontSize:'.8rem', color:'var(--muted)', display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            <span>30-day free trial</span>
            <span>No setup fees</span>
            <span>Made in India</span>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ position:'relative' }}>
          <div style={{ background:'white', borderRadius:12, padding:'2rem', boxShadow:'0 24px 80px rgba(0,0,0,.12)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
              <span style={{ fontSize:'.75rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'#6b6456' }}>Live Reminder Queue</span>
              <span style={{ background:'#ecfdf5', color:'#059669', fontSize:'.72rem', fontWeight:600, padding:'.25rem .7rem', borderRadius:20 }}>4 Active</span>
            </div>
            {[
              { initials:'PS', name:'Priya Sharma', meta:'Wellness Clinic — Annual checkup due', tag:'Due Today', tagBg:'#fef3c7', tagColor:'#92400e' },
              { initials:'RM', name:'Rahul Menon',  meta:'AutoFix Garage — Oil change reminder', tag:'SMS Sent', tagBg:'#ecfdf5', tagColor:'#065f46' },
              { initials:'SK', name:'Sunita Kumar', meta:'Glam Studio — Colour retouch cycle', tag:'In 3 Days', tagBg:'#eff6ff', tagColor:'#1e40af' },
              { initials:'VA', name:'Vikram Anand', meta:'QuickServe — Maintenance due', tag:'WhatsApp', tagBg:'#ecfdf5', tagColor:'#065f46' },
            ].map((r, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'.9rem', padding:'.75rem', background:'#f0e9d6', borderRadius:8, marginBottom:'.6rem' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(200,168,75,0.15)', border:'1px solid rgba(200,168,75,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.72rem', fontWeight:700, color:'#c8a84b', flexShrink:0 }}>{r.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.875rem', fontWeight:600 }}>{r.name}</div>
                  <div style={{ fontSize:'.75rem', color:'#6b6456', marginTop:1 }}>{r.meta}</div>
                </div>
                <span style={{ fontSize:'.7rem', fontWeight:600, padding:'.2rem .6rem', borderRadius:4, background:r.tagBg, color:r.tagColor }}>{r.tag}</span>
              </div>
            ))}
          </div>
          <div style={{ position:'absolute', bottom:'-1.5rem', left:'-2rem', background:'#0d0d0d', color:'#f5f0e8', padding:'.8rem 1.2rem', borderRadius:10, fontSize:'.8rem', fontWeight:500, boxShadow:'0 12px 40px rgba(0,0,0,.25)', whiteSpace:'nowrap' }}>
            +3 customers rebooked this week via reminder
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background:'#0d0d0d', color:'#f5f0e8', padding:'1.4rem 4rem', display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap:'1.5rem' }}>
        {[
          { num:'68%', label:'Revenue lost to missed follow-ups' },
          { num:'3x',  label:'Higher retention with automation' },
          { num:'5 min', label:'Average setup time per business' },
          { num:'Zero', label:'Manual follow-up work required' },
        ].map((s,i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700, color:'#c8a84b', lineHeight:1 }}>{s.num}</div>
            <div style={{ fontSize:'.75rem', color:'rgba(245,240,232,.6)', letterSpacing:'.08em', textTransform:'uppercase', marginTop:'.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Fix #6 — GENERIC WHO IT'S FOR (replaces industry-specific section) */}
      <section id="features" style={{ padding:'7rem 4rem', background:'#f0e9d6' }}>
        <div className="fade-up" style={{ fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
          <span style={{ width:24, height:1, background:'#c8a84b', display:'block' }}></span>
          Built for Service Businesses
        </div>
        <h2 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'1rem' }}>
          Any business that serves customers<br/>
          <em style={{ fontStyle:'italic', color:'var(--rust)' }}>can use Shih-Fu.</em>
        </h2>
        <p className="fade-up" style={{ color:'var(--muted)', maxWidth:600, lineHeight:1.75, fontSize:'.95rem', marginBottom:'2.5rem', fontWeight:300 }}>
          Whether you run a clinic, a garage, a salon, a repair shop, a fitness studio, a home services company, or any business where customers come back — Shih-Fu keeps the relationship alive automatically.
        </p>

        {/* Business type pills — generic */}
        <div className="fade-up" style={{ display:'flex', flexWrap:'wrap', gap:'.6rem', marginBottom:'3.5rem' }}>
          {['Clinics and Healthcare','Auto Repair and Garages','Salons and Spas','Fitness and Wellness','Home Services','Repair Shops','Pet Services','Education and Coaching','Real Estate','Retail Stores','Hospitality','and many more...'].map(t => (
            <span key={t} className="industry-pill">{t}</span>
          ))}
        </div>

        {/* Fix #4 — Features section replaces pricing */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem' }}>
          {[
            {
              icon:'A',
              title:'Automated Follow-Ups',
              desc:'Set it once. Shih-Fu automatically sends reminders on the right day via WhatsApp, SMS, or Email — without you lifting a finger.',
              highlights:['Time-based triggers','Condition-based rules','Multi-step sequences'],
            },
            {
              icon:'B',
              title:'Customer Lifecycle Tracking',
              desc:'Every visit, purchase, and service is logged. Know exactly who is active, who is dormant, and who is about to churn — before it happens.',
              highlights:['Full service history','Lifetime value tracking','Churn risk alerts'],
            },
            {
              icon:'C',
              title:'WhatsApp, SMS and Email',
              desc:'Reach customers on the channels they actually use. Messages go out in your business name — customers never see Shih-Fu.',
              highlights:['500M+ WhatsApp users in India','TRAI DLT compliant SMS','Branded email reminders'],
            },
            {
              icon:'D',
              title:'Revenue Recovery Dashboard',
              desc:'See exactly how much revenue you are losing to missed follow-ups — and how much you have recovered through automated reminders.',
              highlights:['Revenue at risk view','Reactivation tracking','Reminder ROI reports'],
            },
            {
              icon:'E',
              title:'Multi-Location Support',
              desc:'Manage multiple branches, staff members, and customer lists from a single dashboard. Each location stays isolated and organised.',
              highlights:['Unlimited locations (Scale plan)','Per-staff access controls','Consolidated reporting'],
            },
            {
              icon:'F',
              title:'Works in Your Language',
              desc:'Send reminders in the language your customers speak — Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, and more.',
              highlights:['10 Indian languages','Per-customer language preference','Bilingual message templates'],
            },
          ].map((f, i) => (
            <div key={i} className={`feature-card card-hover fade-up`} style={{ transitionDelay:`${i*0.08}s` }}>
              <div style={{ width:44, height:44, borderRadius:8, background:'rgba(200,168,75,0.12)', border:'1px solid rgba(200,168,75,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.8rem', fontWeight:800, color:'var(--gold)', marginBottom:'1.25rem', fontFamily:"'Playfair Display',serif" }}>{f.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.15rem', fontWeight:700, marginBottom:'.6rem', color:'var(--ink)' }}>{f.title}</div>
              <div style={{ fontSize:'.875rem', color:'var(--muted)', lineHeight:1.7, marginBottom:'1rem', fontWeight:300 }}>{f.desc}</div>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'.35rem' }}>
                {f.highlights.map((h,j) => (
                  <li key={j} style={{ fontSize:'.78rem', color:'var(--muted)', display:'flex', alignItems:'center', gap:'.5rem' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--gold)', display:'inline-block', flexShrink:0 }}></span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:'7rem 4rem' }}>
        <div className="fade-up" style={{ fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
          <span style={{ width:24, height:1, background:'#c8a84b', display:'block' }}></span>
          The Workflow
        </div>
        <h2 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'4rem' }}>
          Five steps. Fully <em style={{ fontStyle:'italic', color:'var(--rust)' }}>automatic.</em>
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', position:'relative' }}>
          <div style={{ position:'absolute', top:32, left:'10%', width:'80%', height:1, background:'var(--border)', zIndex:0 }}></div>
          {[
            { num:'1', title:'Customer Added', desc:'Via form, QR code, CSV import, or manual entry.' },
            { num:'2', title:'Service Logged', desc:'Record every visit, job, or appointment with full details.' },
            { num:'3', title:'Rules Trigger', desc:'The system calculates when to reach out next.' },
            { num:'4', title:'Message Sent', desc:'Personalised reminder delivered on their preferred channel.' },
            { num:'5', title:'Customer Returns', desc:'New event logged, cycle resets. Retention grows.' },
          ].map((s, i) => (
            <div key={i} className="fade-up" style={{ textAlign:'center', padding:'0 1rem', transitionDelay:`${i*0.1}s`, position:'relative', zIndex:1 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f5f0e8', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:700, margin:'0 auto 1.2rem' }}>{s.num}</div>
              <div style={{ fontWeight:600, fontSize:'.9rem', marginBottom:'.5rem' }}>{s.title}</div>
              <div style={{ fontSize:'.8rem', color:'#6b6456', lineHeight:1.6, fontWeight:300 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MESSAGING CHANNELS */}
      <section style={{ background:'#0d0d0d', padding:'6rem 4rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
        <div>
          <div className="fade-up" style={{ fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'#e8c96a', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
            <span style={{ width:24, height:1, background:'#e8c96a', display:'block' }}></span>
            Omnichannel Messaging
          </div>
          <h2 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,3.5vw,3rem)', fontWeight:900, color:'#f5f0e8', lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'1rem' }}>
            Meet customers where<br/>they <em style={{ fontStyle:'italic', color:'#c8a84b' }}>already are.</em>
          </h2>
          <p className="fade-up" style={{ color:'rgba(245,240,232,.55)', fontSize:'.95rem', lineHeight:1.75, maxWidth:420, marginBottom:'2rem', fontWeight:300 }}>
            Every message is branded as your business. Customers never see Shih-Fu.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
            {[
              { label:'WhatsApp', sub:'The #1 messaging app in India. 98% open rate.' },
              { label:'SMS',      sub:'Instant delivery. No internet or app required.' },
              { label:'Email',    sub:'Detailed reminders, receipts, and special offers.' },
            ].map((ch, i) => (
              <div key={i} className="fade-up" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', border:'1px solid rgba(245,240,232,.1)', borderRadius:8, background:'rgba(245,240,232,.04)', transitionDelay:`${i*0.1}s` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#c8a84b', flexShrink:0 }}></div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'.9rem', color:'#f5f0e8', marginBottom:'.15rem' }}>{ch.label}</div>
                  <div style={{ fontSize:'.78rem', color:'rgba(245,240,232,.5)' }}>{ch.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample messages */}
        <div style={{ background:'rgba(245,240,232,.06)', border:'1px solid rgba(245,240,232,.1)', borderRadius:12, padding:'2rem' }}>
          <div style={{ fontSize:'.7rem', letterSpacing:'.12em', textTransform:'uppercase', color:'#e8c96a', marginBottom:'1.5rem', fontWeight:500 }}>Sample Messages</div>
          {[
            { ch:'WhatsApp', bg:'rgba(37,211,102,.06)', border:'rgba(37,211,102,.3)', msg:'Namaste Priya! Aapki annual service ka time aa gaya hai. Aaj hi appointment book karein — reply YES karein.' },
            { ch:'SMS',      bg:'rgba(59,130,246,.06)', border:'rgba(59,130,246,.3)', msg:'Dear Rahul, your next service is due. Book your appointment today. Reply BOOK to confirm.' },
            { ch:'Email',    bg:'rgba(200,168,75,.06)',  border:'rgba(200,168,75,.3)',  msg:'Hi Sunita, it has been a while since your last visit. We have a special offer waiting for you this month.' },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom:'.75rem', padding:'1rem 1.2rem', borderRadius:8, background:m.bg, border:`1px solid ${m.border}` }}>
              <div style={{ fontSize:'.68rem', fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(245,240,232,.5)', marginBottom:'.4rem' }}>{m.ch}</div>
              <div style={{ fontSize:'.875rem', color:'rgba(245,240,232,.8)', lineHeight:1.65 }}>{m.msg}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding:'7rem 4rem', background:'#f0e9d6' }}>
        <div className="fade-up" style={{ fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
          <span style={{ width:24, height:1, background:'#c8a84b', display:'block' }}></span>
          Early Feedback
        </div>
        <h2 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2rem,4vw,3rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'3rem' }}>
          Businesses across India that <em style={{ fontStyle:'italic', color:'var(--rust)' }}>never forget</em><br/>outperform those that do.
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
          {[
            { stars:5, text:'We used to lose 30 to 40 percent of our annual customers simply because we forgot to send reminders. Shih-Fu ended that problem completely.', name:'Dr. Priya Nair', biz:'PawCare Clinic, Bengaluru' },
            { stars:5, text:'Our rebooking rate went from 42 percent to 71 percent in 90 days. The WhatsApp reminders feel personal — clients think I message them personally.', name:'Deepika Iyer', biz:'Glam Studio, Mumbai' },
            { stars:5, text:'I have 800 plus customers. Before Shih-Fu, maybe 60 came back regularly. Now my service bay is booked two weeks out. The ROI is undeniable.', name:'Suresh Anand', biz:'SpeedTrack Auto, Chennai' },
          ].map((p, i) => (
            <div key={i} className={`proof-card card-hover fade-up`} style={{ transitionDelay:`${i*0.1}s` }}>
              <div style={{ color:'#c8a84b', fontSize:'.9rem', letterSpacing:2, marginBottom:'1rem' }}>{'★'.repeat(p.stars)}</div>
              <p style={{ fontSize:'.9rem', lineHeight:1.75, color:'#0d0d0d', marginBottom:'1.5rem', fontStyle:'italic', fontWeight:300 }}>"{p.text}"</p>
              <div>
                <div style={{ fontWeight:600, fontSize:'.875rem' }}>{p.name}</div>
                <div style={{ fontSize:'.78rem', color:'#6b6456' }}>{p.biz}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER — Fix #2: sign in / sign up options */}
      <section id="contact" style={{ background:'#0d0d0d', padding:'6rem 4rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <h2 className="fade-up" style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2.2rem,5vw,4rem)', fontWeight:900, color:'#f5f0e8', lineHeight:1.05, marginBottom:'1.5rem' }}>
          Your customers are waiting<br/>to hear from{' '}
          <em style={{ fontStyle:'italic', color:'#c8a84b' }}>you.</em>
        </h2>
        <p className="fade-up" style={{ color:'rgba(245,240,232,.6)', fontSize:'1rem', maxWidth:520, margin:'0 auto 2.5rem', lineHeight:1.75, fontWeight:300 }}>
          Join thousands of service businesses across India using Shih-Fu to retain more customers automatically. First 50 businesses get 3 months free.
        </p>
        <div className="fade-up" style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/signup" style={{ background:'#f5f0e8', color:'#0d0d0d', padding:'.9rem 2rem', fontSize:'.9rem', fontWeight:700, textDecoration:'none', borderRadius:3, transition:'all .25s', display:'inline-block', letterSpacing:'.04em' }}
            onMouseEnter={e => e.currentTarget.style.background='#c8a84b'}
            onMouseLeave={e => e.currentTarget.style.background='#f5f0e8'}>
            Create Free Account
          </Link>
          <Link href="/login" style={{ border:'1.5px solid rgba(245,240,232,.35)', color:'#f5f0e8', padding:'.9rem 2rem', fontSize:'.9rem', fontWeight:500, textDecoration:'none', borderRadius:3, display:'inline-block', letterSpacing:'.04em' }}>
            Sign In to Dashboard
          </Link>
        </div>
        <div style={{ marginTop:'1.5rem', fontSize:'.78rem', color:'rgba(245,240,232,.35)', letterSpacing:'.05em' }}>
          No credit card required. Setup in 5 minutes.
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#080808', padding:'3rem 4rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:900, color:'#f5f0e8' }}>
          Shih<span style={{ color:'#c8a84b' }}>-Fu</span>
        </div>
        <div style={{ display:'flex', gap:'2rem', flexWrap:'wrap' }}>
          {['Privacy Policy','Terms of Service','Contact','Help'].map(l => (
            <a key={l} href="#" style={{ fontSize:'.8rem', color:'rgba(245,240,232,.4)', textDecoration:'none', letterSpacing:'.05em' }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:'.75rem', color:'rgba(245,240,232,.25)' }}>
          2025 Shih-Fu Technologies Pvt. Ltd. Made in India
        </div>
      </footer>
    </div>
  );
}