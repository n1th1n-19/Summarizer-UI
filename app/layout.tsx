import type { Metadata } from 'next';
import CustomThemeProvider from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'AI Research Paper Summarizer',
  description: 'Intelligent document analysis and summarization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}