'use client';

import { useTranslation } from '@/contexts/TranslationContext';

export default function LanguageToggle() {
  const { lang, changeLang } = useTranslation();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <button
        onClick={() => changeLang('fr')}
        className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium ${lang === 'fr' ? 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md' : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'}`}
        aria-label="Switch to French"
      >
        🇫🇷 FR
      </button>
      <button
        onClick={() => changeLang('en')}
        className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium ${lang === 'en' ? 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md' : 'bg-gray-50 hover:bg-gray-100 border border-gray-300'}`}
        aria-label="Switch to English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
}