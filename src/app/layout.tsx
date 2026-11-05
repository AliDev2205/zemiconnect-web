import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { APP_NAME } from '@/lib/constants';
import './globals.css';

// Deux graisses seulement (400 et 600) pour alléger les pages publiques.
// font-bold et font-extrabold sont ramenés à 600 dans globals.css.
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: 'Registre des conducteurs de taxi-moto de Parakou.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0E4D64',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* React Query et les toasts sont montés par les layouts qui s'en servent (AppProviders). */}
        {children}
      </body>
    </html>
  );
}
