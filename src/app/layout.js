import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext'; // ← retirer useTranslation ici
import RegisterServiceWorker from './register-service-worker';
import PWAInstallButton from '@/components/PWAInstallButton';
import LanguageToggle from '@/components/LanguageToggle';
import HtmlWrapper from '@/components/HtmlWrapper'; // ← nouveau

export const metadata = { /* ... inchangé */ };

export default function RootLayout({ children }) {
  // ← plus de useTranslation() ici
  return (
    <AuthProvider>
      <TranslationProvider>
        {/* HtmlWrapper est à l'intérieur du provider → peut lire le contexte ✅ */}
        <HtmlWrapper>
          <head>
            <link rel="icon" type="image/jpg" sizes="192x192" href="/images/logo.png" />
            <link rel="apple-touch-icon" href="/images/logo.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          </head>
          <body>
            <LanguageToggle />
            <RegisterServiceWorker />
            {children}
            <PWAInstallButton />
          </body>
        </HtmlWrapper>
      </TranslationProvider>
    </AuthProvider>
  );
}