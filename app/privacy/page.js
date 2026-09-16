'use client';
import Link from 'next/link';

const SECTIONS = [
  {
    h: '1. Who We Are',
    body: `Shih-Fu ("Shih-Fu", "we", "us") is a product of Shih-Fu Technologies Pvt. Ltd., a retention and customer-communication platform for service businesses in India (veterinary clinics, salons, auto repair garages, and similar). This policy explains what information we collect, why, and how it is handled — both for the businesses who sign up to use Shih-Fu ("Businesses") and the customers those Businesses serve ("Customers").`,
  },
  {
    h: '2. Information We Collect',
    body: null,
    list: [
      'Account information you provide when you sign up: business name, owner name, phone number, email address, password, city/state, and business type.',
      'Customer records you enter or import: your customers’ names, phone numbers, email addresses, addresses, and details about the pets, vehicles, or other assets you service, entered by you or your staff.',
      'Service and communication history: service events you log, reminders and campaigns you send, and delivery status (sent, failed, skipped) for each message.',
      'If you connect a Google account to send email: the email address of the connected account and a narrowly-scoped authorization token that lets Shih-Fu send messages through that account on your behalf. See Section 4 below.',
      'Usage data: log-in activity and basic technical logs (IP address, browser type) used for security and troubleshooting.',
    ],
  },
  {
    h: '3. How We Use Information',
    body: 'We use the information above only to operate the Service: to let you manage your customer records, log service visits, and send the reminders and promotional messages you configure, on your behalf and in your business’s name. We do not sell personal data, and we do not use your customers’ data for our own marketing.',
  },
  {
    h: '4. Google User Data and the "Limited Use" Policy',
    body: `If you choose to connect a Google account so Shih-Fu can send reminder and campaign emails through your own mailbox, we request only the narrow "send email" permission (Gmail's gmail.send scope). With this permission, Shih-Fu can compose and send messages through your account, but cannot read your inbox, your existing emails, or anyone's replies to you — those stay private to you in your own mailbox.

Shih-Fu's use and transfer of information received from Google APIs to any other app will adhere to the Google API Services User Data Policy, including the Limited Use requirements. We use the Google user data we receive solely to send the messages you request through this Service, and for no other purpose. You can revoke this access at any time from your Shih-Fu account settings or directly from your Google Account's third-party access settings, and we delete the associated access token immediately when you do.`,
  },
  {
    h: '5. How We Share Information',
    body: 'We share information only with the service providers needed to deliver messages you send, and only the minimum needed for that purpose:',
    list: [
      'Meta (WhatsApp Business Platform) — to deliver WhatsApp messages.',
      'Twilio — to deliver SMS messages, in compliance with India’s TRAI DLT regulations.',
      'Your connected email provider (e.g. Google) or our email delivery provider — to deliver email messages.',
      'Our database and hosting infrastructure providers — to store and run the Service securely.',
    ],
  },
  {
    h: '6. Data Security',
    body: 'Passwords are stored using industry-standard one-way hashing and are never stored in plain text. Any OAuth tokens used to send email on your behalf are encrypted at rest. Access to customer data within Shih-Fu is isolated per business — one Business can never see another Business’s customers or messages.',
  },
  {
    h: '7. Data Retention',
    body: 'We retain account and customer data for as long as your account is active. If you remove a customer record, we anonymise their personal identifiers while preserving anonymised service history for your own records. You may request full deletion of your account and associated data at any time by writing to us.',
  },
  {
    h: '8. Your Rights',
    body: 'You may access, correct, export, or request deletion of the personal data associated with your account, and Businesses are responsible for honouring the same rights for their own Customers under India’s Digital Personal Data Protection Act, 2023 and other applicable law. To exercise these rights or raise a grievance, contact our Grievance Officer at the email below.',
  },
  {
    h: '9. Children’s Privacy',
    body: 'Shih-Fu is a business-to-business service and is not directed at, or knowingly used by, children.',
  },
  {
    h: '10. Changes to This Policy',
    body: 'We may update this policy from time to time. Material changes will be reflected by an updated "Last updated" date below, and significant changes will be communicated to account owners directly.',
  },
  {
    h: '11. Contact Us',
    body: 'For any privacy question, request, or grievance, write to us at shihfu.ai@gmail.com.',
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy <em style={{ fontStyle:'italic', color:'var(--gold)' }}>Policy</em>
          </h1>
          <p style={{ fontSize:'0.85rem', color:'var(--muted)' }}>Last updated: 16 September 2026</p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom:'2.25rem' }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:700, color:'var(--ink)', marginBottom:'0.75rem' }}>{s.h}</h2>
            {s.body && <p style={{ fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.8, whiteSpace:'pre-line' }}>{s.body}</p>}
            {s.list && (
              <ul style={{ margin:'0.75rem 0 0', paddingLeft:'1.25rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {s.list.map((item, li) => (
                  <li key={li} style={{ fontSize:'0.9rem', color:'var(--muted)', lineHeight:1.7 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
