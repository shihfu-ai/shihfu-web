'use client';
import Link from 'next/link';

const FAQS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'How do I add my first customer?',
        a: 'Click "+ Add Customer" at the top of your dashboard. Fill in the customer name, mobile number, and how they would like to be messaged. You can also add pet, vehicle, or property details depending on your business type. Or let customers do it themselves with the Check-in Form (see below).',
      },
      {
        q: 'What is the Check-in Form?',
        a: 'A short form your new customers fill in themselves. Click "Check-in Form" at the top of your dashboard to get your link. Open counter mode on an iPad or display so each walk-in can check themselves in, or send the link by WhatsApp or SMS to someone who calls to book. They appear in your Customers list marked "Check-in", and you can open Edit to add the remaining details.',
      },
      {
        q: 'How do I log a service visit?',
        a: 'Click "+ Log Service" at the top of your dashboard. Select the customer, choose the service type, enter the date, and choose when the next reminder should go out. Shih-Fu schedules the follow-up for you.',
      },
      {
        q: 'What happens after I log a service?',
        a: 'If you chose a follow-up period (for example 30 days or 1 year), the reminder appears in your Reminder Queue and is sent on the due date to the customer on their preferred channel. You can also send it early with "Send Now" or skip it.',
      },
    ],
  },
  {
    section: 'Messaging and Reminders',
    items: [
      {
        q: 'Which messaging channels does Shih-Fu support?',
        a: 'WhatsApp, SMS, and Email. Each customer has a preferred channel, and messages only go to customers who have agreed to receive them on that channel. Email is available as soon as you connect your Gmail. WhatsApp and SMS need a one-time setup on our side; write to us and we will guide you.',
      },
      {
        q: 'How does email get sent, and will customers see Shih-Fu?',
        a: 'Go to Account Settings, then Email, and connect your Gmail account. Emails are then sent from your own Gmail address in your business name, and they appear in your Gmail Sent folder. Customer replies arrive in your own inbox. Shih-Fu can only send, and cannot read your inbox. Until you connect Gmail, email cannot be sent.',
      },
      {
        q: 'Can I send a message to all my customers at once?',
        a: 'Yes. On the Customers page click "Send All" to send a festival greeting or offer to everyone who has opted in on the channels you choose. You can send it now or schedule it for a future date and time, and scheduled campaigns can be cancelled from the same page.',
      },
      {
        q: 'What happens if a customer does not want messages?',
        a: 'Only customers who have agreed to a channel are messaged on it. If a customer asks you to stop, open their Edit form and untick that channel, or use Remove. Removed customers are skipped by all future reminders and campaigns.',
      },
    ],
  },
  {
    section: 'Customer Records',
    items: [
      {
        q: 'What does removing a customer do?',
        a: 'Removing a customer takes them off your list and cancels their upcoming reminders. Their service history is kept. If you add the same mobile number again later, the customer is restored with their history.',
      },
      {
        q: 'Can one customer have multiple pets or vehicles?',
        a: 'Currently each customer record supports one main pet, vehicle, or property. Support for more is planned.',
      },
    ],
  },
  {
    section: 'Account and Billing',
    items: [
      {
        q: 'What is included in the free trial?',
        a: 'Your 30-day free trial includes all features with up to 500 customer records. No credit card is required.',
      },
      {
        q: 'I forgot my password. What do I do?',
        a: 'On the sign in page click "Forgot password?" and enter your business email. We email a 6-digit code (from your connected Gmail if you have connected one). Enter the code and choose a new password. If you have not connected Gmail and do not receive a code, write to us and we will help you back in.',
      },
      {
        q: 'How do I change my details or password?',
        a: 'Open Account Settings from the profile menu at the top right of your dashboard.',
      },
    ],
  },
  {
    section: 'Privacy and Data',
    items: [
      {
        q: 'Where is my data stored?',
        a: 'Your data is stored on secure cloud servers in Singapore. Your records are kept separate from every other business, and no other business can see them.',
      },
      {
        q: 'Who else handles my customers\' details?',
        a: 'Only the services needed to deliver your messages: Meta (WhatsApp), your SMS provider, and Google (for email sent from your own Gmail). We do not sell data or use your customers\' details for our own marketing. See our Privacy Policy for the full detail.',
      },
      {
        q: 'Is Shih-Fu compliant with India\'s DPDP Act?',
        a: 'Shih-Fu is built with the DPDP Act in mind: we record what each customer has agreed to and when, and only message customers on channels they have agreed to. As the business, you remain responsible for having the right to contact your own customers. For specific compliance questions, write to shihfu.ai@gmail.com.',
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