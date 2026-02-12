import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GoogleTag } from '@/components/GoogleTag';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resume Builder - AI-Powered ATS Optimization',
  description: 'Create professional resumes with AI-powered ATS optimization. Get hired faster with our resume builder.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleTag />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
