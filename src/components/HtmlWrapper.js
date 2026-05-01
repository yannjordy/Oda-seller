'use client';

import { useTranslation } from '@/contexts/TranslationContext';

export default function HtmlWrapper({ children }) {
  const { lang } = useTranslation();
  return <html lang={lang}>{children}</html>;
}