import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mr. Better Boss | AI-Powered JobTread Sidebar',
  description:
    'BetterBossOS Sidebar - Your AI-powered JobTread command center. Rapid estimates, smart scheduling, profit tracking, and AI assistant for contractors.',
  keywords: [
    'JobTread',
    'construction management',
    'roofing software',
    'BetterBossOS',
    'contractor tools',
    'AI estimating',
    'Better Boss',
  ],
  authors: [{ name: 'Better Boss', url: 'https://better-boss.ai' }],
  openGraph: {
    title: 'Mr. Better Boss | AI-Powered JobTread Sidebar',
    description: 'Your AI-powered JobTread command center for contractors.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-boss-black text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
