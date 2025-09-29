import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lightning Slots™ - Gamified Casino Slot Machine',
  description: 'Experience the thrill of Lightning Slots™ - a modern slot machine with gamification elements, power meter bonuses, and lightning rounds!',
  keywords: 'slots, casino, gambling, online slots, lightning slots, gamified slots',
  authors: [{ name: 'Lightning Slots' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
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
        <AuthProvider>
          <div id="app-root">
            {children}
          </div>
          <div id="modal-root"></div>
          <div id="toast-root"></div>
        </AuthProvider>
      </body>
    </html>
  );
}