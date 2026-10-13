'use client';
import Link from 'next/link';
import { COMPANY } from '../../lib/company';

// Shared layout for the Privacy Policy and Terms of Service.
// sections: [{ id, h, body?, list?, after? }]. `body` is shown first, then
// the bullet `list`, then `after`. Each section's `id` is an anchor, so the
// app can link straight to one (for example /privacy#google-user-data).
export default function LegalPage({ title, accent, sections, intro }) {
  const para = { fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.8, whiteSpace:'pre-line' };
  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={{ padding:'1.2rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/" style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--muted)', textDecoration:'none' }}>Back to Home</Link>
      </nav>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'4rem 2rem' }}>
        <div style={{ marginBottom:'3rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ width:24, height:1, background:'var(--gold)', display:'block' }}></span>
            Legal
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.6rem', fontWeight:900, color:'var(--ink)', lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'1rem' }}>
            {title} <em style={{ fontStyle:'italic', color:'var(--gold)' }}>{accent}</em>
          </h1>
          <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Last updated: {COMPANY.updated}</p>
          {intro && <p style={{ ...para, marginTop:'1rem' }}>{intro}</p>}
        </div>

        {sections.map((s, i) => (
          <div key={i} id={s.id} style={{ marginBottom:'2.25rem', scrollMarginTop:'5rem' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem' }}>{s.h}</h2>
            {s.body && <p style={para}>{s.body}</p>}
            {s.list && (
              <ul style={{ margin:'0.75rem 0 0', paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {s.list.map((item, li) => (
                  <li key={li} style={{ fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.7 }}>{item}</li>
                ))}
              </ul>
            )}
            {s.after && <p style={{ ...para, marginTop:'0.75rem' }}>{s.after}</p>}
          </div>
        ))}

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', fontSize:'0.8rem', color:'var(--muted)', display:'flex', gap:'1.25rem', flexWrap:'wrap' }}>
          <Link href="/privacy" style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>Terms of Service</Link>
          <a href={`mailto:${COMPANY.email}`} style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>{COMPANY.email}</a>
        </div>
      </div>
    </div>
  );
}
