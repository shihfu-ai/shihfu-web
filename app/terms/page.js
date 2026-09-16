'use client';
import Link from 'next/link';

const SECTIONS = [
  {
    h: '1. Acceptance of Terms',
    body: 'By creating an account or using Shih-Fu ("the Service"), operated by Shih-Fu Technologies Pvt. Ltd. ("Shih-Fu", "we"), you agree to these Terms of Service. If you do not agree, do not use the Service.',
  },
  {
    h: '2. Description of Service',
    body: 'Shih-Fu is a customer relationship and retention platform that lets service businesses ("Businesses", "you") record customer and service information and send reminder, follow-up, and promotional messages to their own customers via WhatsApp, SMS, and email.',
  },
  {
    h: '3. Your Account',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account, including staff you invite. You must provide accurate information when you register and keep it up to date.',
  },
  {
    h: '4. Your Data and Your Customers’ Consent',
    body: 'You own the customer records and content you upload to Shih-Fu. You are solely responsible for ensuring you have the customers’ own consent, and any legal right, to store their information and to message them via the channels you enable — Shih-Fu is a technical conduit for sending your messages, not a party to your relationship with your customers. You must honour opt-out requests from your customers promptly.',
  },
  {
    h: '5. Acceptable Use',
    body: 'You agree not to use the Service to send spam, unlawful, harassing, or misleading messages, to message anyone who has not consented to be contacted, or to violate WhatsApp Business Platform, Twilio/TRAI, Google, or any other third-party provider’s policies that this Service relies on to deliver your messages. We may suspend accounts that violate this section to protect the deliverability and reputation of the Service for all Businesses.',
  },
  {
    h: '6. Subscription Plans and Billing',
    body: 'Shih-Fu is offered on Starter, Growth, and Scale plans with differing customer limits and features, plus a free trial period. Fees, if applicable to your plan, are billed in advance and are non-refundable except as required by law. We may change plan pricing with advance notice; continued use after a price change constitutes acceptance.',
  },
  {
    h: '7. Third-Party Services',
    body: 'Message delivery depends on third-party platforms — Meta’s WhatsApp Business Platform, Twilio (SMS), and email providers including Google, if you connect your own account. Your use of those channels through Shih-Fu is also subject to each provider’s own terms, and Shih-Fu is not responsible for outages, policy changes, or message rejections caused by those providers.',
  },
  {
    h: '8. Intellectual Property',
    body: 'Shih-Fu and its original content, features, and functionality are owned by Shih-Fu Technologies Pvt. Ltd. and are protected by applicable intellectual property law. You retain all rights to the customer data and message content you create.',
  },
  {
    h: '9. Disclaimer of Warranties',
    body: 'The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that messages will always be delivered, read, or free of delay, as delivery depends on third-party networks outside our control.',
  },
  {
    h: '10. Limitation of Liability',
    body: 'To the maximum extent permitted by law, Shih-Fu Technologies Pvt. Ltd. shall not be liable for any indirect, incidental, or consequential damages, or for lost revenue or lost customers, arising from your use of the Service.',
  },
  {
    h: '11. Termination',
    body: 'You may cancel your account at any time. We may suspend or terminate accounts that violate these Terms, with notice where reasonably possible. Upon termination, we will retain or delete your data in accordance with our Privacy Policy.',
  },
  {
    h: '12. Governing Law',
    body: 'These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.',
  },
  {
    h: '13. Changes to These Terms',
    body: 'We may update these Terms from time to time. Material changes will be communicated to account owners, and continued use of the Service after changes take effect constitutes acceptance.',
  },
  {
    h: '14. Contact Us',
    body: 'Questions about these Terms can be sent to shihfu.ai@gmail.com.',
  },
];

export default function TermsOfServicePage() {
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
            Terms of <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Service</em>
          </h1>
          <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Last updated: 16 September 2026</p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom:'2.25rem' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem' }}>{s.h}</h2>
            <p style={{ fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
