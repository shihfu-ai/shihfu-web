import '@fontsource/dm-sans/300.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/playfair-display/400-italic.css';
import './globals.css';

// The fonts above are served from our own site, so opening a page does not
// send the visitor's address to Google or any other third party.

export const metadata = {
  title: 'ShihFu AI',
  description: 'Retention-first CRM for service businesses worldwide. Automate follow-ups and online booking for veterinary clinics, salons, auto repair shops, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}