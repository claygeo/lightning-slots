import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lightning Slots™ - Gamified Casino Slot Machine',
  description: 'Experience the thrill of Lightning Slots™ - a modern slot machine with gamification elements, power meter bonuses, and lightning rounds!',
  keywords: 'slots, casino, gambling, online slots, lightning slots, gamified slots',
  authors: [{ name: 'Lightning Slots' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1a1a2e',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <div id="app-root">
          {children}
        </div>
        <div id="modal-root"></div>
        <div id="toast-root"></div>
      </body>
    </html>
  );
}