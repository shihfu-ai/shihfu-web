'use client';
import LegalPage from '../components/LegalPage';
import { COMPANY } from '../../lib/company';

const SECTIONS = [
  {
    id: 'who',
    h: '1. Who We Are and Our Role',
    body: `Shih-Fu ("Shih-Fu", "we", "us") is a retention and customer-communication platform for service businesses around the world, such as veterinary clinics, salons, auto repair shops and clinics. It is operated from the ${COMPANY.location}. This policy explains what information we collect, why, and how it is handled, both for the businesses that sign up to use Shih-Fu ("Businesses") and for the customers those Businesses serve ("Customers").

Our role depends on the information:`,
    list: [
      'Account information about the person who signs up (name, email, phone number and business details): we decide how it is used, so we are the controller of it (a "business" under some US state laws).',
      `Information about a Business's Customers: the Business decides what to collect and why, and Shih-Fu handles it only on the Business's behalf, to provide the Service. We are the Business's processor (a "service provider" under some US state laws). If you are a Customer and want to see, correct or delete your information, please contact the Business you deal with first.`,
    ],
  },
  {
    id: 'collect',
    h: '2. Information We Collect',
    list: [
      'Account information you provide when you sign up: business name, owner name, country, phone number, email address, password (stored only as a one-way hash), city and state, time zone and business type.',
      `Customer records you enter or import: your Customers' names, phone numbers, email addresses, addresses, and details about the pets, vehicles or other things you service. Customers can also enter their own details on your quick check-in form.`,
      'Service and communication history: services you log, reminders and campaigns you send, and the delivery status (sent, failed, skipped) of each message.',
      `Booking and follow-up activity: every message to a Customer includes a unique booking link. We record when that link is opened and whether an appointment is booked through it, together with the type of message, the channel it was sent on and when it was sent, plus the appointments themselves (date, time, service and any note the Customer adds).`,
      'If you connect a Google account to send email: the email address of that account and encrypted authorization tokens. See Section 4.',
      'Usage and technical data: sign-in activity and basic technical logs (IP address, browser type) used for security and troubleshooting.',
      'Your acceptance of our Terms of Service and this policy, and the version you accepted.',
    ],
    after: 'We do not collect payment card details. Shih-Fu does not currently take payments.',
  },
  {
    id: 'use',
    h: '3. How We Use Information',
    body: `We use the information above to operate the Service: to let you manage your Customer records, log service visits, send the reminders and promotional messages you configure on your behalf and in your business's name, take bookings, and show you which messages and channels bring your own Customers back. That analysis is done separately for each Business using only that Business's own data. We do not combine one Business's Customer data with another's.

We also use account information to secure the Service, to send service messages (such as password reset codes), to provide support, and to meet legal obligations.

Where the law of your country requires a legal basis (for example the EU and UK GDPR), we rely on: performing our contract with you, our legitimate interests in running and securing the Service, your consent where we ask for it, and legal obligations.

We do not sell personal information, we do not share it for cross-context behavioural advertising, we do not use your Customers' data for our own marketing, and we do not use it to train models that are shared across Businesses.`,
  },
  {
    id: 'google-user-data',
    h: '4. Google User Data and the Limited Use Policy',
    body: `If you choose to connect a Google account so Shih-Fu can send reminder and campaign emails through your own mailbox, we ask Google for two permissions:`,
    list: [
      `Send email on your behalf (Gmail's "gmail.send" scope). Shih-Fu can send the messages you choose to send. It cannot read, search, list, change or delete anything in your mailbox, including your inbox, your existing emails and your Customers' replies, which stay private to you in your own mailbox.`,
      `See your email address (the "userinfo.email" scope). Used only to show which account is connected and to send from it.`,
    ],
    after: `What we store: the connected email address and encrypted access and refresh tokens. We do not store the contents of your mailbox. A copy of each message we send for you (recipient, text and delivery status) is kept in your Shih-Fu message history, which is part of your Business's data.

How we use it: we use Google user data only to provide the email-sending feature you asked for, and for no other purpose. We do not transfer it to others except as needed to provide that feature, to follow the law, or as part of a merger or sale with notice to you. We do not use it for advertising, including retargeting or interest-based ads. We do not use it to develop, improve or train generalised AI or machine learning models. No person at Shih-Fu reads it, except with your permission for support, where needed for security or abuse investigation, or to follow the law.

Shih-Fu's use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy (https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

How to withdraw: you can disconnect at any time in Account Settings under Email. That withdraws the permission with Google and deletes the stored connection immediately. You can also remove Shih-Fu from your Google Account's third-party access page (https://myaccount.google.com/permissions). If Google tells us access has been withdrawn, we delete the stored connection. Deleting your Shih-Fu account deletes the connection as well.`,
  },
  {
    id: 'sharing',
    h: '5. Who We Share Information With',
    body: 'We share information only with the service providers needed to run Shih-Fu and deliver the messages you send, and only the minimum needed for that purpose:',
    list: [
      'Supabase: database hosting (our database is located in Singapore).',
      'Render: hosting of our application servers (the part that stores and sends your data).',
      'Vercel: hosting of the Shih-Fu website.',
      'Meta (WhatsApp Business Platform): to deliver WhatsApp messages you send.',
      `Twilio: to deliver SMS messages you send, in line with each country's telecom rules.`,
      'Google: when you connect Gmail, to send your emails (Section 4).',
      'Twilio SendGrid: to deliver password reset codes by email.',
    ],
    after: 'We may also disclose information when the law requires it, to protect people or our rights, or in a merger or sale of the business, in which case we will tell you and the same protections will continue to apply. We do not sell personal information.',
  },
  {
    id: 'transfers',
    h: '6. Where Information Is Processed',
    body: `Shih-Fu is operated from the ${COMPANY.location} and its database is hosted in Singapore. If you or your Customers are in another country, your information is transferred to and processed in those countries. Businesses are responsible for having a lawful basis under their own law for entering their Customers' details into Shih-Fu and for this transfer. If the law of your country requires a specific transfer mechanism (such as the EU Standard Contractual Clauses), contact us and we will put it in place.`,
  },
  {
    id: 'security',
    h: '7. Security',
    body: `Passwords are stored using industry-standard one-way hashing and are never stored in plain text. Authorization tokens used to send email on your behalf are encrypted at rest. Data is encrypted in transit. Each Business can see only its own data. You can sign out of every device from Account Settings, and changing your password signs out all other devices. No system is perfectly secure. If we learn of a breach affecting your information we will tell the affected Businesses without undue delay so they can meet their own obligations.`,
  },
  {
    id: 'retention',
    h: '8. Keeping and Deleting Information',
    list: [
      'We keep account and Customer information while your account is active.',
      `Removing a Customer from your list stops all messages and booking links for them. Their record and history are kept so you can restore them if they return.`,
      `To erase a Customer completely, use "Delete permanently" on their record. That deletes their details, pets or vehicles, service history, reminders, appointments, booking links and message history from Shih-Fu.`,
      `To close your account, use "Delete account" in Account Settings. That permanently deletes your Business's information, disconnects Gmail, and cannot be undone. You can also ask us by email.`,
      'Copies held in routine backups are removed as those backups expire. Booking links stop working after 90 days.',
      'We may keep a minimal record where the law requires it, for example proof of your acceptance of our Terms.',
    ],
  },
  {
    id: 'rights',
    h: '9. Your Rights',
    body: `Depending on where you live, you may have the right to access, correct, export or delete your personal information, to object to or restrict certain uses, to withdraw consent, and to complain to your data protection authority. Businesses can do most of this themselves in Shih-Fu. Customers should contact the Business they deal with, because the Business controls their information, and we will help the Business respond. You can also write to us at ${COMPANY.email} and we will reply within 30 days. We will not treat you differently for using these rights.`,
  },
  {
    id: 'cookies',
    h: '10. Cookies and Local Storage',
    body: `We do not use advertising or analytics cookies. We use your browser's local storage to keep you signed in. The fonts on our pages are served from our own servers, not from a third party. The booking page and check-in form need no sign-in.`,
  },
  {
    id: 'children',
    h: '11. Children',
    body: 'Shih-Fu is a business-to-business service and is not directed at children. We do not knowingly collect information from children under 16 for our own purposes. A Business that records a child as a Customer (for example a pet owner under 16) is responsible for doing so lawfully.',
  },
  {
    id: 'us-states',
    h: '12. United States State Privacy Notice',
    body: `In the last 12 months we have not sold personal information or shared it for cross-context behavioural advertising. Residents of California and some other US states may have the right to know what we collect, to access, correct and delete it, and to opt out of sale or sharing. For information about a Business's Customers we act as that Business's service provider, so requests about it should go to the Business. For anything else, email ${COMPANY.email}.`,
  },
  {
    id: 'changes',
    h: '13. Changes to This Policy',
    body: 'We may update this policy from time to time. The "Last updated" date above shows the current version. We will tell account owners about significant changes before they take effect.',
  },
  {
    id: 'contact',
    h: '14. Contact Us',
    body: `For any privacy question, request or complaint, write to us at ${COMPANY.email}. We are ${COMPANY.name}, ${COMPANY.location}.`,
  },
];

export default function PrivacyPolicyPage() {
  return <LegalPage title="Privacy" accent="Policy" sections={SECTIONS} />;
}
