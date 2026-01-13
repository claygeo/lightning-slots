// ============================================
// ROYAL JACKPOT - Root Layout
// ============================================

import type { Metadata, Viewport } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Royal Jackpot | Premium Casino Experience',
  description: 'Experience the thrill of Las Vegas with Royal Jackpot - featuring stunning 3D slots, massive jackpots, and premium rewards.',
  keywords: 'casino, slots, jackpot, gambling, games, royal jackpot',
  authors: [{ name: 'Royal Jackpot' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a0a2e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="app-root">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}
