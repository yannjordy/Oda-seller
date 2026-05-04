import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import RegisterServiceWorker from '@/app/register-service-worker';
import PWAInstallModal from '@/components/PWAInstallModal';

export const metadata = {
  title: 'OdaMarket | L\'application de vente pour vendeurs',
  description: "L'application de vente conçue pour la mobilité. Gérez votre boutique, suivez vos commandes et boostez vos revenus.",
  manifest: '/manifest.json',
  applicationName: 'OdaMarket Seller',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OdaMarket',
  },
  formatDetection: {
    telephone: false,
  },
  appleMobileWebAppCapable: 'yes',
  appleMobileWebAppStatusBarStyle: 'black-translucent',
  icons: {
    icon: [
      { url: '/icons/oda-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/oda-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: ['/icons/oda-192.png'],
    apple: [
      { url: '/icons/oda-192.png', sizes: '192x192' },
      { url: '/icons/oda-512.png', sizes: '512x512' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'OdaMarket Seller',
    'msapplication-TileColor': '#7C3AED',
    'msapplication-tap-highlight': 'no',
  },
};

export const viewport = {
  themeColor: '#7C3AED',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OdaMarket" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/oda-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/oda-512.png" />
        <link rel="icon" href="/icons/oda-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body>
        <AuthProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AuthProvider>
        <RegisterServiceWorker />
        <PWAInstallModal />
      </body>
    </html>
  );
}
