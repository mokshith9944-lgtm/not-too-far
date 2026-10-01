import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Antigravity - Cinematic Ultra-Sync Community Watch Platform',
  description:
    'Netflix-grade synchronized watch parties and Discord-style Universes with real-time video sync, WebRTC voice/video stages, and instant extension bridges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#141414] text-white antialiased selection:bg-[#E50914] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
