import { Inter } from 'next/font/google';
import { AuthProvider } from '../lib/contexts/AuthContext';
import { AppProvider } from '../lib/contexts/AppContext';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Marketplace - Find Perfect Service Providers',
  description: 'Connect with professional photographers, videographers, event managers, and more',
  keywords: 'marketplace, services, photography, videography, event management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} theme-dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 min-h-screen`}>
        <AuthProvider>
          <AppProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {children}
            </div>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}