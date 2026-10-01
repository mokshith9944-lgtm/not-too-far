import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Not Too Far | Netflix-Inspired Video Sync & Community Watch Platform',
  description: 'Ultra-low latency streaming synchronization and Discord-style Universes for co-watching cinema with friends.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Not Too Far - Stream Together, Zero Drift',
    description: 'Ultra-low latency streaming synchronization, real-time video calls, and community watch parties.',
    siteName: 'Not Too Far',
    locale: 'en_US',
    type: 'website',
  },
};

import { AuthProvider } from '@/lib/firebase/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-netflix-base text-white antialiased min-h-screen selection:bg-netflix-red selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
