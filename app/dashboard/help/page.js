'use client';
import Link from 'next/link';

const FAQS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'How do I add my first customer?',
        a: 'From your dashboard, click the "+ Add Customer" button in the top right corner. Fill in the customer name, mobile number, and messaging channel preference. You can also add pet, vehicle, or client details depending on your business type.',
      },
      {
        q: 'How do I log a service visit?',
        a: 'Click "+ Log Service" in the top right corner of your dashboard. Select the customer, choose the service type, enter the date, and set when the next reminder should go out. Shih-Fu will automatically schedule the follow-up message.',
      },
      {
        q: 'What happens after I log a service?',
        a: 'Shih-Fu automatically calculates the next reminder date based on the follow-up rule you set (e.g. 7 days, 90 days, 1 year). The reminder appears in your queue and is sent to the customer on the scheduled date via their preferred channel.',
      },
    ],
  },
  {
    section: 'Messaging and Reminders',
    items: [
      {
        q: 'Which messaging channels does Shih-Fu support?',
        a: 'Shih-Fu supports WhatsApp, SMS, and Email. You can enable one or more channels per customer. WhatsApp has the highest open rate and is the recommended primary channel for Indian customers.',
      },
      {
        q: 'Will customers know the messages are sent by Shih-Fu?',
        a: 'No. Every message is sent in your business name. Customers see your clinic, salon, or garage name — not Shih-Fu. The platform works invisibly in the background.',
      },
      {
        q: 'How do I set up WhatsApp Business messaging?',
        a: 'WhatsApp Business API requires a verified Meta Business account. After signing up, contact our support team at shihfu.ai@gmail.com and we will walk you through the setup process. SMS is available immediately on all plans.',
      },
      {
        q: 'Can I customise the reminder messages?',
        a: 'Yes. Go to the Templates section in your dashboard to edit message content for each service type. Messages support variables like customer name, pet name, and due date which are filled in automatically at send time.',
      },
      {
        q: 'What happens if a customer opts out?',
        a: 'If a customer replies STOP to an SMS or unsubscribes from an email, Shih-Fu automatically marks them as opted out and stops all future messages to that channel. You can see their opt-out status in their customer profile.',
      },
    ],
  },
  {
    section: 'Customer Records',
    items: [
      {
        q: 'Can I import my existing customer list?',
        a: 'Yes. From the Customers page, click "Import CSV". Prepare a spreadsheet with columns for name, phone, email, and city. The maximum import batch size is 500 records at a time.',
      },
      {
        q: 'What does removing a customer do?',
        a: 'Removing a customer stops all future reminders and marks them as removed. Their service history and past records are preserved for your reference. This action can be undone by contacting support.',
      },
      {
        q: 'Can one customer have multiple pets or vehicles?',
        a: 'Currently each customer record supports one primary entity (pet or vehicle). Support for multiple entities per customer is on our roadmap and will be available in an upcoming update.',
      },
    ],
  },
  {
    section: 'Billing and Plans',
    items: [
      {
        q: 'What is included in the free trial?',
        a: 'Your 30-day free trial includes full access to all features on the Growth plan with up to 500 customer records. No credit card is required to start.',
      },
      {
        q: 'What happens if I reach my customer limit?',
        a: 'You will see a warning when you are approaching your plan limit. You can upgrade your plan at any time from Account Settings. Existing customers and reminders are never affected by plan changes.',
      },
      {
        q: 'Can I change my plan at any time?',
        a: 'Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle.',
      },
    ],
  },
  {
    section: 'Privacy and Data',
    items: [
      {
        q: 'Where is my data stored?',
        a: 'All data is stored on secure servers in India (Singapore region). Your customer data never leaves your account and is never shared with third parties.',
      },
      {
        q: 'Is my customer data GDPR and DPDP compliant?',
        a: 'Shih-Fu is designed with India\'s Digital Personal Data Protection (DPDP) Act in mind. Consent records, opt-in timestamps, and opt-out handling are all built into the platform. For enterprise compliance queries, contact us at shihfu.ai@gmail.com.',
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', fontFamily:"'DM Sans',sans-serif" }}>

      {/* Nav */}
      <nav style={{ padding:'1.2rem 4rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50 }}>
        <Link href="/" style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:900, color:'var(--ink)', textDecoration:'none', letterSpacing:'-0.02em' }}>
          Shih<span style={{ color:'var(--gold)' }}>-Fu</span>
        </Link>
        <Link href="/dashboard" style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:'0.4rem' }}>
          Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'4rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom:'3rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:500, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
            <span style={{ width:24, height:1, background:'var(--gold)', display:'block' }}></span>
            Support
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2.8rem', fontWeight:900, color:'var(--ink)', lineHeight:1.1, letterSpacing:'-0.02em', marginBottom:'1rem' }}>
            Help and <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Support</em>
          </h1>
          <p style={{ fontSize:'1rem', color:'var(--muted)', lineHeight:1.7, fontWeight:300 }}>
            Everything you need to get the most out of Shih-Fu. If you cannot find your answer below, write to us directly.
          </p>
        </div>

        {/* Contact card */}
        <div style={{ background:'white', border:'1px solid rgba(200,168,75,0.3)', borderRadius:8, padding:'1.5rem 2rem', marginBottom:'3rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem' }}>Contact Support</div>
            <div style={{ fontSize:'0.95rem', fontWeight:600, color:'var(--ink)' }}>We typically respond within 24 hours</div>
            <div style={{ fontSize:'0.85rem', color:'var(--muted)', marginTop:'0.25rem' }}>Monday to Saturday, 9 AM to 6 PM IST</div>
          </div>
          <a href="mailto:shihfu.ai@gmail.com" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'var(--ink)', color:'var(--cream)', padding:'0.75rem 1.5rem', borderRadius:4, fontSize:'0.875rem', fontWeight:600, textDecoration:'none', letterSpacing:'0.04em', transition:'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--ink)'}>
            shihfu.ai@gmail.com
          </a>
        </div>

        {/* FAQ sections */}
        {FAQS.map((section, si) => (
          <div key={si} style={{ marginBottom:'2.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:700, color:'var(--ink)' }}>
                {section.section}
              </h2>
              <div style={{ flex:1, height:1, background:'var(--border)' }}></div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {section.items.map((item, ii) => (
                <FAQItem key={ii} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Bottom contact repeat */}
        <div style={{ background:'var(--ink)', borderRadius:8, padding:'2.5rem', textAlign:'center', marginTop:'3rem' }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:700, color:'var(--cream)', marginBottom:'0.75rem' }}>
            Still need help?
          </h3>
          <p style={{ fontSize:'0.9rem', color:'rgba(245,240,232,0.6)', marginBottom:'1.5rem', lineHeight:1.7 }}>
            Our team is ready to assist you. Write to us and we will get back to you within one business day.
          </p>
          <a href="mailto:shihfu.ai@gmail.com" style={{ display:'inline-block', background:'var(--gold)', color:'var(--ink)', padding:'0.8rem 2rem', borderRadius:4, fontSize:'0.875rem', fontWeight:700, textDecoration:'none', letterSpacing:'0.04em' }}>
            Email shihfu.ai@gmail.com
          </a>
        </div>

      </div>
    </div>
  );
}

// Collapsible FAQ item
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', transition:'box-shadow .2s' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:'100%', padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', background:'none', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left' }}>
        <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--ink)', lineHeight:1.4 }}>{q}</span>
        <span style={{ flexShrink:0, width:22, height:22, borderRadius:'50%', background:'var(--warm)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', color:'var(--gold)', fontWeight:700, transition:'transform .2s', transform:open?'rotate(45deg)':'rotate(0deg)' }}>+</span>
      </button>
      {open && (
        <div style={{ padding:'0 1.25rem 1rem', fontSize:'0.875rem', color:'var(--muted)', lineHeight:1.75, borderTop:'1px solid var(--border)' }}>
          <div style={{ paddingTop:'0.75rem' }}>{a}</div>
        </div>
      )}
    </div>
  );
}

// Need useState import for FAQItem
import { useState } from 'react';