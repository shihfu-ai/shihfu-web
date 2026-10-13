'use client';
import LegalPage from '../components/LegalPage';
import { COMPANY } from '../../lib/company';

const SECTIONS = [
  {
    id: 'agreement',
    h: '1. Agreement',
    body: `These Terms of Service ("Terms") are an agreement between you and ${COMPANY.name} ("Shih-Fu", "we", "us"), based in the ${COMPANY.location}. By creating an account or using Shih-Fu (the "Service") you agree to these Terms and to our Privacy Policy. If you use the Service for a business, you confirm that you are at least 18 years old and have the authority to bind that business. If you do not agree, do not use the Service.`,
  },
  {
    id: 'service',
    h: '2. The Service',
    body: 'Shih-Fu helps service businesses keep their customers: it stores customer and service records, schedules and sends reminders and promotional messages, offers a quick check-in form, takes appointment bookings through links in messages, and shows how those messages perform. We may improve, change or remove features over time.',
  },
  {
    id: 'account',
    h: '3. Your Account',
    body: 'You must give accurate information and keep it up to date. Keep your password secret. You are responsible for everything done through your account, so tell us promptly if you think it has been misused. You can sign out of all devices, change your password, or delete your account in Account Settings.',
  },
  {
    id: 'customers',
    h: '4. Your Customers and Consent',
    body: `You decide who to message and what to say, and you are responsible for it. You must have the permission the law of your country and your customers' countries requires before you message someone on a channel. That includes rules on marketing messages, consent, opt-out and data protection, such as the TCPA and CAN-SPAM in the United States, the GDPR and ePrivacy rules in Europe and the UK, CASL in Canada, and local telecom rules such as TRAI in India. Shih-Fu records the consent choices you enter, only sends on the channels you mark, and stops messaging anyone you remove, but we do not check that your consent is valid. Honour every request to stop. Do not message people you have no relationship with, and do not upload purchased or scraped lists.`,
  },
  {
    id: 'acceptable-use',
    h: '5. Acceptable Use',
    body: 'You agree not to use the Service to:',
    list: [
      'send spam or unlawful, harassing, deceptive or misleading messages, or messages that infringe anyone else\'s rights;',
      'store or send payment card numbers, government identity numbers, or other highly sensitive data the Service is not designed for;',
      'break the rules of WhatsApp or Meta, Twilio, Google or any other provider whose network carries your messages;',
      'attempt to access another business\'s data, probe or disrupt the Service, or reverse engineer it;',
      'resell the Service or let anyone outside your business use your account.',
    ],
    after: 'We may remove content or suspend an account that breaks these rules.',
  },
  {
    id: 'providers',
    h: '6. Third-Party Services',
    body: `Messages are delivered through providers such as Google (Gmail), Meta (WhatsApp) and Twilio (SMS). They have their own terms, approval steps, fees and limits, and they can refuse or delay messages. Shih-Fu is not responsible for their services, and delivery is not guaranteed. When you connect your Google account, Google's terms apply to that connection as well as these Terms.`,
  },
  {
    id: 'data',
    h: '7. Your Data and Our Data Processing Terms',
    body: `You own your data, including your customer records. You give us permission to use it only to provide the Service as described in the Privacy Policy. For personal information about your customers, we act as your processor (service provider) and agree that we will:`,
    list: [
      'process it only to provide the Service and on your documented instructions, which are given by your use of the Service;',
      'keep it confidential, and allow access only to people who need it to run the Service and who are bound to confidentiality;',
      'protect it with appropriate security measures, as described in the Privacy Policy;',
      'use only the sub-processors listed in the Privacy Policy, and update that list when it changes;',
      'help you answer your customers\' requests to access, correct or delete their information, for example with the "Delete permanently" tool;',
      'tell you without undue delay if we learn of a breach affecting your customers\' information;',
      'delete your data when you delete your account, or return it on request, unless the law requires us to keep it;',
      'give you information reasonably needed to show that we follow this section.',
    ],
    after: `You confirm that you have a lawful basis to give us your customers' information and that your use of the Service complies with the law that applies to you. If your law requires further terms for transfers of data between countries, such as the EU Standard Contractual Clauses, contact us and we will put them in place.`,
  },
  {
    id: 'fees',
    h: '8. Free Trial, Plans and Fees',
    body: 'New accounts start with a 30 day free trial, with no payment card needed. If we introduce paid plans, we will show you the price and what is included before you are charged, and we will never charge you without your agreement. We may change prices for future periods with at least 30 days notice.',
  },
  {
    id: 'ip',
    h: '9. Ownership of the Service',
    body: 'The Service, including its software, design and content, belongs to us and our licensors. We give you a limited, non-exclusive, non-transferable right to use it for your own business while these Terms apply. If you send us feedback, we may use it without owing you anything.',
  },
  {
    id: 'availability',
    h: '10. Availability and Changes',
    body: 'We work to keep the Service available but do not promise it will be uninterrupted or error-free. We may carry out maintenance or change features. Please keep your own copies of anything critical to your business.',
  },
  {
    id: 'termination',
    h: '11. Ending Your Use',
    body: 'You can stop using the Service and delete your account at any time. We may suspend or end your access if you break these Terms, put the Service or other people at risk, or if the law requires. When an account is deleted, its data is deleted as described in the Privacy Policy. Sections that by their nature should continue (such as ownership, liability and governing law) continue after the Terms end.',
  },
  {
    id: 'disclaimer',
    h: '12. Disclaimers',
    body: 'The Service is provided "as is" and "as available". To the fullest extent the law allows, we disclaim all warranties, including that the Service will be uninterrupted or error-free, that messages will be delivered or read, or that it will bring you any particular results, bookings or revenue.',
  },
  {
    id: 'liability',
    h: '13. Limitation of Liability',
    body: 'To the fullest extent the law allows, Shih-Fu will not be liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, revenue, data or goodwill, arising from your use of the Service. Our total liability for any claim relating to the Service is limited to the greater of the amount you paid us in the 12 months before the claim and 100 US dollars. Nothing in these Terms limits liability that cannot be limited by law.',
  },
  {
    id: 'indemnity',
    h: '14. Your Responsibility for Claims',
    body: `You agree to cover our reasonable losses and costs arising from claims by third parties (including your customers and regulators) that result from the messages you send, your instructions, your breach of these Terms, or your breach of the law. This does not apply where we caused the claim.`,
  },
  {
    id: 'law',
    h: '15. Governing Law and Disputes',
    body: `The Service is available to businesses worldwide, and you are responsible for following the laws that apply where you operate and where your customers are. These Terms are governed by the laws of the United States and of the state in which ${COMPANY.name} is established, without regard to conflict of law rules, and disputes will be brought in the state or federal courts located in that state. Nothing in these Terms limits any right you have under mandatory consumer or data protection law where you live.`,
  },
  {
    id: 'changes',
    h: '16. Changes to These Terms',
    body: 'We may update these Terms. We will give account owners at least 14 days notice of material changes, by email or in the Service. If you keep using the Service after the changes take effect, you accept them. If you do not agree, you can delete your account.',
  },
  {
    id: 'contact',
    h: '17. Contact',
    body: `Questions about these Terms can be sent to ${COMPANY.email}.`,
  },
];

export default function TermsOfServicePage() {
  return <LegalPage title="Terms of" accent="Service" sections={SECTIONS} />;
}
