import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const metadata = {
  title: 'OdaMarket',
  description: "L'application de vente conçue pour la mobilité",
  manifest: '/manifest.json',
  icons: { icon: '/images/logo.png' },
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
