import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const font = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Shih-Fu — Never Lose a Customer Again',
  description: 'Retention-first CRM for Indian service businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}