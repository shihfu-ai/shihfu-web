'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const heroRef = useRef(null);

  useEffect(() => {
    const els = document.querySelectorAll('.fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: '#f5f0e8', color: '#0d0d0d', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --ink:#0d0d0d; --cream:#f5f0e8; --warm:#f0e9d6;
          --gold:#c8a84b; --muted:#6b6456; --border:rgba(13,13,13,0.12);
        }
        .fade-up { opacity:0; transform:translateY(28px); transition:opacity .7s ease,transform .7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .btn-primary {
          background:var(--ink); color:var(--cream); padding:.9rem 2rem;
          font-size:.9rem; font-weight:500; border:none; cursor:pointer;
          text-decoration:none; display:inline-block; border-radius:2px;
          transition:background .25s; letter-spacing:.05em;
        }
        .btn-primary:hover { background:var(--gold); color:var(--ink); }
        .btn-ghost {
          color:var(--ink); font-size:.9rem; font-weight:500;
          text-decoration:none; display:inline-flex; align-items:center;
          gap:.5rem; padding:.9rem 0; border-bottom:1px solid var(--ink);
          transition:color .2s,border-color .2s;
        }
        .btn-ghost:hover { color:var(--gold); border-color:var(--gold); }
        .nav-link {
          font-size:.85rem; font-weight:500; letter-spacing:.08em;
          text-transform:uppercase; color:var(--muted); text-decoration:none;
          transition:color .2s;
        }
        .nav-link:hover { color:var(--ink); }
        .nav-cta {
          background:var(--ink); color:var(--cream) !important;
          padding:.6rem 1.4rem; border-radius:2px;
        }
        .nav-cta:hover { background:var(--gold) !important; color:var(--ink) !important; }
        .industry-card {
          background:var(--cream); border:1px solid var(--border);
          border-radius:8px; padding:2rem; cursor:default;
          transition:transform .3s,box-shadow .3s; position:relative;
          overflow:hidden;
        }
        .industry-card::before {
          content:''; position:absolute; bottom:0; left:0;
          width:100%; height:3px; background:var(--gold);
          transform:scaleX(0); transform-origin:left; transition:transform .3s ease;
        }
        .industry-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.1); }
        .industry-card:hover::before { transform:scaleX(1); }
        .proof-card {
          background:var(--cream); border:1px solid var(--border);
          border-radius:8px; padding:2rem;
        }
        .price-card {
          border:1px solid var(--border); border-radius:8px;
          padding:2.5rem 2rem; background:var(--cream);
          transition:transform .3s; position:relative;
        }
        .price-card:hover { transform:translateY(-4px); }
        .price-card.featured { background:var(--ink); color:var(--cream); border-color:var(--ink); }
        .price-cta {
          display:block; text-align:center; padding:.85rem; margin-top:2rem;
          border-radius:4px; font-size:.875rem; font-weight:600;
          text-decoration:none; letter-spacing:.05em; transition:all .25s;
          border:1.5px solid var(--ink); color:var(--ink); background:transparent;
        }
        .price-cta:hover { background:var(--ink); color:var(--cream); }
        .featured .price-cta { background:var(--gold); color:var(--ink); border-color:var(--gold); }
        .featured .price-cta:hover { background:#f5b429; }
        .trigger-pill {
          font-size:.7rem; font-weight:500; padding:.25rem .65rem;
          background:var(--warm); border:1px solid var(--border);
          border-radius:20px; color:var(--muted);
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'1.4rem 4rem',
        background:'rgba(245,240,232,0.85)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid var(--border)',
      }}>
        <Link href="/" style={{
          fontFamily:"'Playfair Display',serif", fontSize:'1.5rem',
          fontWeight:900, letterSpacing:'-0.02em', color:'#0d0d0d', textDecoration:'none',
        }}>
          Shih<span style={{color:'#c8a84b'}}>-Fu</span>
        </Link>
        <div style={{ display:'flex', gap:'2.5rem', alignItems:'center' }}>
          <a href="#industries" className="nav-link">Industries</a>
          <a href="#how" className="nav-link">How It Works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link href="/signup" className="nav-link nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight:'100vh', display:'grid',
        gridTemplateColumns:'1fr 1fr', alignItems:'center',
        padding:'8rem 4rem 4rem', gap:'4rem',
      }}>
        <div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'.6rem',
            fontSize:'.78rem', fontWeight:500, letterSpacing:'.14em',
            textTransform:'uppercase', color:'#c8a84b', marginBottom:'1.5rem',
          }}>
            <span style={{width:28,height:1,background:'#c8a84b',display:'block'}}></span>
            Retention-First CRM for India
          </div>
          <h1 style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'clamp(3rem,5vw,5.2rem)', fontWeight:900,
            lineHeight:1.05, letterSpacing:'-0.02em', marginBottom:'1.5rem',
          }}>
            Never lose a<br />customer to{' '}
            <em style={{ fontStyle:'italic', color:'#c8a84b' }}>silence</em>
            <br />again.
          </h1>
          <p style={{
            fontSize:'1.1rem', lineHeight:1.7, color:'#6b6456',
            maxWidth:480, marginBottom:'2.5rem', fontWeight:300,
          }}>
            Shih-Fu automates follow-ups, service reminders, and re-engagement
            for veterinary clinics, salons, and auto repair shops across India.
          </p>
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
            <Link href="/signup" className="btn-primary">Start Free Trial</Link>
            <a href="#how" className="btn-ghost">See how it works</a>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ position:'relative' }}>
          <div style={{
            background:'white', borderRadius:12, padding:'2rem',
            boxShadow:'0 24px 80px rgba(0,0,0,.12)',
            border:'1px solid var(--border)',
          }}>
            <div style={{
              display:'flex', alignItems:'center',
              justifyContent:'space-between', marginBottom:'1.5rem',
            }}>
              <span style={{
                fontSize:'.75rem', fontWeight:500, letterSpacing:'.1em',
                textTransform:'uppercase', color:'#6b6456',
              }}>Live Reminders Queue</span>
              <span style={{
                background:'#ecfdf5', color:'#059669',
                fontSize:'.72rem', fontWeight:600, padding:'.25rem .7rem',
                borderRadius:20,
              }}>4 Active</span>
            </div>
            {[
              { name:'Priya Sharma', meta:'PawCare Clinic — Vaccine due', tag:'Due Today', tagColor:'#fef3c7', tagText:'#92400e' },
              { name:'Deepika Iyer', meta:'Glam Studio — Color retouch', tag:'SMS Sent', tagColor:'#ecfdf5', tagText:'#065f46' },
              { name:'Rahul Menon', meta:'QuickFix Garage — Oil change', tag:'In 3 Days', tagColor:'#eff6ff', tagText:'#1e40af' },
              { name:'Sunita Rao', meta:'PawCare Clinic — Grooming', tag:'WhatsApp', tagColor:'#ecfdf5', tagText:'#065f46' },
            ].map((r, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'.9rem',
                padding:'.75rem', background:'#f0e9d6', borderRadius:8, marginBottom:'.6rem',
              }}>
                <div style={{
                  width:38, height:38, borderRadius:'50%',
                  background:'#fef3c7', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  fontSize:'.8rem', fontWeight:700, color:'#92400e', flexShrink:0,
                }}>
                  {r.name.charAt(0)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.875rem', fontWeight:500 }}>{r.name}</div>
                  <div style={{ fontSize:'.75rem', color:'#6b6456', marginTop:1 }}>{r.meta}</div>
                </div>
                <span style={{
                  fontSize:'.7rem', fontWeight:600, padding:'.2rem .6rem',
                  borderRadius:4, background:r.tagColor, color:r.tagText,
                }}>{r.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{
        background:'#0d0d0d', color:'#f5f0e8',
        padding:'1.4rem 4rem', display:'flex',
        justifyContent:'space-around', alignItems:'center',
      }}>
        {[
          { num:'68%', label:'Revenue lost to missed follow-ups' },
          { num:'3x', label:'Higher retention with automation' },
          { num:'< 5 min', label:'Setup per business' },
          { num:'Zero', label:'Manual follow-up work' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <div style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:'2.2rem', fontWeight:700,
              color:'#c8a84b', lineHeight:1,
            }}>{s.num}</div>
            <div style={{
              fontSize:'.75rem', color:'rgba(245,240,232,.6)',
              letterSpacing:'.08em', textTransform:'uppercase', marginTop:'.25rem',
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* INDUSTRIES */}
      <section id="industries" style={{ padding:'7rem 4rem', background:'#f0e9d6' }}>
        <div className="fade-up" style={{
          fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em',
          textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem',
          display:'flex', alignItems:'center', gap:'.6rem',
        }}>
          <span style={{width:24,height:1,background:'#c8a84b',display:'block'}}></span>
          Built for Your Industry
        </div>
        <h2 className="fade-up" style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(2.2rem,4vw,3.4rem)', fontWeight:900,
          lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'3.5rem',
        }}>
          Three verticals.<br />
          One <em style={{fontStyle:'italic',color:'#c4532a'}}>intelligent</em> platform.
        </h2>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem',
        }}>
          {[
            {
              icon:'V', name:'Veterinary Clinics',
              desc:'Track every pet vaccination schedule, grooming appointments, and annual checkups.',
              pills:['Vaccine reminders','Grooming cycles','Annual checkups','Post-visit follow-up'],
            },
            {
              icon:'S', name:'Salons & Beauty',
              desc:'Bring clients back on schedule with smart reminders for colour touch-ups and treatments.',
              pills:['Color retouch cycles','Nail appointments','Seasonal promos','Loyalty milestones'],
            },
            {
              icon:'A', name:'Auto Repair & Accessories',
              desc:'Keep vehicles and customers coming back. Automate oil change reminders and warranty follow-ups.',
              pills:['Oil change cycles','Tyre rotation','Warranty renewals','Parts restock alerts'],
            },
          ].map((c, i) => (
            <div key={i} className={`industry-card fade-up`} style={{ transitionDelay:`${i*0.1}s` }}>
              <div style={{
                width:48, height:48, borderRadius:8,
                background:'#f0e9d6', border:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'.9rem', fontWeight:700, color:'#c8a84b',
                marginBottom:'1.2rem',
              }}>{c.icon}</div>
              <div style={{
                fontFamily:"'Playfair Display',serif",
                fontSize:'1.4rem', fontWeight:700, marginBottom:'.75rem',
              }}>{c.name}</div>
              <div style={{ fontSize:'.875rem', color:'#6b6456', lineHeight:1.65, marginBottom:'1.2rem' }}>
                {c.desc}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'.4rem' }}>
                {c.pills.map((p, j) => (
                  <span key={j} className="trigger-pill">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:'7rem 4rem' }}>
        <div className="fade-up" style={{
          fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em',
          textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem',
          display:'flex', alignItems:'center', gap:'.6rem',
        }}>
          <span style={{width:24,height:1,background:'#c8a84b',display:'block'}}></span>
          The Workflow
        </div>
        <h2 className="fade-up" style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(2.2rem,4vw,3.4rem)', fontWeight:900,
          lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'4rem',
        }}>
          Five steps.<br />
          Fully <em style={{fontStyle:'italic',color:'#c4532a'}}>automatic.</em>
        </h2>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(5,1fr)',
          gap:0, position:'relative',
        }}>
          <div style={{
            position:'absolute', top:32, left:'10%', width:'80%',
            height:1, background:'rgba(13,13,13,.12)',
          }}></div>
          {[
            { num:'1', title:'Customer Enters', desc:'Via intake form, QR code, or staff entry.' },
            { num:'2', title:'Service Logged', desc:'Treatment or appointment recorded instantly.' },
            { num:'3', title:'Rules Fire', desc:'Automation calculates next engagement date.' },
            { num:'4', title:'Message Sent', desc:'Personalised message via WhatsApp, SMS, or Email.' },
            { num:'5', title:'Customer Returns', desc:'New event logged, cycle resets automatically.' },
          ].map((s, i) => (
            <div key={i} className="fade-up" style={{
              textAlign:'center', padding:'0 1rem',
              transitionDelay:`${i*0.1}s`, position:'relative', zIndex:1,
            }}>
              <div style={{
                width:64, height:64, borderRadius:'50%',
                background:'#f5f0e8', border:'2px solid rgba(13,13,13,.12)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Playfair Display',serif", fontSize:'1.4rem',
                fontWeight:700, margin:'0 auto 1.2rem',
              }}>{s.num}</div>
              <div style={{ fontWeight:600, fontSize:'.9rem', marginBottom:'.5rem' }}>{s.title}</div>
              <div style={{ fontSize:'.8rem', color:'#6b6456', lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:'7rem 4rem', background:'#f0e9d6' }}>
        <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <div className="fade-up" style={{
            fontSize:'.75rem', fontWeight:500, letterSpacing:'.16em',
            textTransform:'uppercase', color:'#c8a84b', marginBottom:'1rem',
          }}>Simple Pricing</div>
          <h2 className="fade-up" style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:'clamp(2.2rem,4vw,3.4rem)', fontWeight:900,
            lineHeight:1.1, letterSpacing:'-0.02em',
          }}>
            One price. No surprises.<br />
            <em style={{fontStyle:'italic',color:'#c4532a'}}>No per-seat traps.</em>
          </h2>
        </div>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:'1.5rem', maxWidth:960, margin:'0 auto',
        }}>
          {[
            {
              tier:'Starter', price:'₹999', period:'/ month up to 500 customers',
              features:['Up to 500 customer records','Email + SMS reminders','3 automation templates','Basic dashboard','CSV import','1 location'],
              featured:false,
            },
            {
              tier:'Growth', price:'₹2,499', period:'/ month up to 2,500 customers',
              features:['Up to 2,500 customer records','Email + SMS + WhatsApp','Unlimited automation rules','Full analytics','Multi-step sequences','Up to 3 locations','Priority support'],
              featured:true, badge:'Most Popular',
            },
            {
              tier:'Scale', price:'₹5,999', period:'/ month up to 10,000 customers',
              features:['Up to 10,000 customer records','All channels + API access','Custom rule builder','Revenue recovery reports','POS integrations','Unlimited locations','Dedicated onboarding'],
              featured:false,
            },
          ].map((p, i) => (
            <div key={i} className={`price-card fade-up ${p.featured ? 'featured' : ''}`}
              style={{ transitionDelay:`${i*0.1}s` }}>
              {p.badge && (
                <div style={{
                  position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
                  background:'#c8a84b', color:'#0d0d0d', fontSize:'.7rem',
                  fontWeight:700, padding:'.25rem 1rem', borderRadius:20,
                  letterSpacing:'.1em', textTransform:'uppercase', whiteSpace:'nowrap',
                }}>{p.badge}</div>
              )}
              <div style={{
                fontSize:'.75rem', fontWeight:500, letterSpacing:'.12em',
                textTransform:'uppercase', color: p.featured ? 'rgba(245,240,232,.6)' : '#6b6456',
                marginBottom:'.75rem',
              }}>{p.tier}</div>
              <div style={{
                fontFamily:"'Playfair Display',serif", fontSize:'3rem',
                fontWeight:700, lineHeight:1, marginBottom:'.25rem',
                color: p.featured ? '#c8a84b' : '#0d0d0d',
              }}>{p.price}</div>
              <div style={{
                fontSize:'.8rem', marginBottom:'1.5rem',
                color: p.featured ? 'rgba(245,240,232,.5)' : '#6b6456',
              }}>{p.period}</div>
              <hr style={{ border:'none', borderTop:`1px solid ${p.featured ? 'rgba(245,240,232,.15)' : 'rgba(13,13,13,.12)'}`, margin:'1.5rem 0' }}/>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'.75rem' }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{
                    display:'flex', alignItems:'center', gap:'.7rem',
                    fontSize:'.875rem',
                    color: p.featured ? 'rgba(245,240,232,.75)' : '#6b6456',
                  }}>
                    <span style={{ color: p.featured ? '#e8c96a' : '#4a7c59', fontWeight:700, fontSize:'.8rem' }}>+</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="price-cta">
                {p.featured ? 'Start Free Trial' : 'Get Started'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{
        background:'#0d0d0d', padding:'6rem 4rem', textAlign:'center',
      }}>
        <h2 className="fade-up" style={{
          fontFamily:"'Playfair Display',serif",
          fontSize:'clamp(2.5rem,5vw,4.5rem)', fontWeight:900,
          color:'#f5f0e8', lineHeight:1.05, marginBottom:'1.5rem',
        }}>
          Your customers are waiting<br />
          to hear from{' '}
          <em style={{fontStyle:'italic',color:'#c8a84b'}}>you.</em>
        </h2>
        <p style={{
          color:'rgba(245,240,232,.6)', fontSize:'1.05rem',
          maxWidth:520, margin:'0 auto 2.5rem', lineHeight:1.7,
        }}>
          Join the waitlist for early access. First 50 businesses get 3 months free on any plan.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/signup" style={{
            background:'#f5f0e8', color:'#0d0d0d', padding:'.9rem 2rem',
            fontSize:'.9rem', fontWeight:600, textDecoration:'none',
            borderRadius:2, transition:'all .25s', display:'inline-block',
          }}>Request Early Access</Link>
          <Link href="/login" style={{
            border:'1.5px solid rgba(245,240,232,.35)', color:'#f5f0e8',
            padding:'.9rem 2rem', fontSize:'.9rem', fontWeight:500,
            textDecoration:'none', borderRadius:2, display:'inline-block',
          }}>Login</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background:'#080808', padding:'3.5rem 4rem',
        display:'flex', alignItems:'center',
        justifyContent:'space-between', flexWrap:'wrap', gap:'1rem',
      }}>
        <div style={{
          fontFamily:"'Playfair Display',serif", fontSize:'1.3rem',
          fontWeight:900, color:'#f5f0e8',
        }}>
          Shih<span style={{color:'#c8a84b'}}>-Fu</span>
        </div>
        <div style={{ display:'flex', gap:'2rem' }}>
          {['Privacy Policy','Terms of Service','Contact'].map((l, i) => (
            <a key={i} href="#" style={{
              fontSize:'.8rem', color:'rgba(245,240,232,.4)',
              textDecoration:'none', letterSpacing:'.05em',
            }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize:'.75rem', color:'rgba(245,240,232,.25)' }}>
          2025 Shih-Fu Technologies Pvt. Ltd. Made in India
        </div>
      </footer>
    </div>
  );
}