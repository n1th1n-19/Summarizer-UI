import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import CustomThemeProvider from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Research Paper Summarizer',
  description: 'Intelligent document analysis and summarization',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#fafbfc' }}>
        <CustomThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CustomThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}