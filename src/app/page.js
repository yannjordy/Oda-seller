'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';

// Chart.js lazy load
const LineChart = dynamic(() => import('@/components/PerformanceChart'), { ssr: false });

const LANGUAGES = {
  fr: { flag: '🇫🇷', code: 'FR' },
  en: { flag: '🇬🇧', code: 'EN' },
};

export default function LandingPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const totalPages = 4;
  const { lang, changeLang } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('oda_language');
    if (saved) changeLang(saved);
  }, [changeLang]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  // Scroll to page
  const goToPage = (index) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    setCurrentPage(index);
  };

  // Track scroll position for dots
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setCurrentPage(idx);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center pointer-events-none">
        <div className="font-extrabold text-2xl text-red-600 pointer-events-auto">
          ODA<span className="text-amber-500">MARKET</span>
        </div>

        <div className="hidden md:block text-xs font-bold text-gray-400 uppercase tracking-widest pointer-events-auto">
          {lang === 'fr' ? 'Glissez pour explorer →' : 'Swipe to explore →'}
        </div>
      </header>

      {/* Nav dots */}
      <nav className="nav-dots">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} onClick={() => goToPage(i)} className={`nav-dot ${currentPage === i ? 'active' : ''}`} aria-label={`Page ${i + 1}`} />
        ))}
      </nav>

      {/* Horizontal scroll container */}
      <div ref={scrollRef} className="horizontal-wrapper" id="scrollContainer">

        {
          
        }
        <section className="landing-section bg-slate-50">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* --- Texte gauche --- */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-4">
                {lang === 'fr'
                  ? <> Votre Boutique, <br /><span className="text-red-600">Partout avec vous.</span></>
                  : <> Your Shop, <br /><span className="text-red-600">Always with you.</span></>}
              </h1>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto lg:mx-0">
                {lang === 'fr'
                  ? "L'application de vente conçue pour la mobilité. Gérez, vendez et encaissez en un glissement de doigt."
                  : "The sales app designed for mobility. Manage, sell and collect with a swipe of your finger."}
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="text-red-600 font-bold flex items-center gap-2" style={{ animation: 'swipeHint 2s infinite' }}>
                  <span>{lang === 'fr' ? 'Glissez vers la droite' : 'Swipe right'}</span>
                  <span className="text-2xl">→</span>
                </div>
              </div>
            </div>

            {/* --- Visuel droite : LOGO / IMAGE ODAMARKET --- */}
            <div className="order-1 lg:order-2 flex justify-center items-center">
              <div className="relative flex flex-col items-center">

                {/* Halo décoratif derrière l'image */}
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-20 -rotate-12 pointer-events-none" />

                {
                }
                <div className="rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden bg-white max-w-xs md:max-w-sm">
                  <Image
                    src="/images/logo.png"
                    alt="OdaMarket – Votre application de vente mobile"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ width: '100%', height: 'auto' }}
                    priority
                  />
                </div>

                {/* Badge flottant sous l'image */}
                <div className="mt-4 bg-white shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3 border border-slate-100">
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <p className="font-black text-slate-800 text-sm">OdaMarket</p>
                    <p className="text-xs text-gray-400">
                      {lang === 'fr' ? 'Votre app de vente' : 'Your sales app'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* PAGE 2 — Stats */}
        <section className="landing-section bg-white">
          <div className="container mx-auto px-6 w-full max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">
                {lang === 'fr' ? <>Boostez vos <span className="text-amber-500">Revenus</span></> : <>Boost your <span className="text-amber-500">Revenue</span></>}
              </h2>
              <p className="text-gray-500">{lang === 'fr' ? 'Voyez la différence avec une interface optimisée.' : 'See the difference with an optimized interface.'}</p>
            </div>
            <div className="bg-slate-50 p-6 md:p-10 rounded-3xl shadow-inner grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm border-l-4 border-red-600">
                  <span className="text-xs font-bold text-gray-400 uppercase">{lang === 'fr' ? 'Conversion Mobile' : 'Mobile Conversion'}</span>
                  <div className="text-3xl font-black text-red-600">+ 45%</div>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border-l-4 border-amber-500">
                  <span className="text-xs font-bold text-gray-400 uppercase">{lang === 'fr' ? 'Temps de Gestion' : 'Management Time'}</span>
                  <div className="text-3xl font-black text-amber-500">{lang === 'fr' ? '- 2h / jour' : '- 2h / day'}</div>
                </div>
              </div>
              <div style={{ height: '250px', width: '100%' }}>
                <LineChart />
              </div>
            </div>
          </div>
        </section>

        {/* PAGE 3 — Features */}
        <section className="landing-section bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-black text-center mb-12">
              {lang === 'fr' ? <>Pensé pour le <span className="text-red-600">Succès</span></> : <>Built for <span className="text-red-600">Success</span></>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: '📱', title: lang === 'fr' ? 'Interface Intuitive' : 'Intuitive Interface', desc: lang === 'fr' ? 'Une prise en main en moins de 5 minutes, sans formation.' : 'Up and running in under 5 minutes, no training needed.', hover: 'hover:bg-red-600' },
                { icon: '⚡', title: lang === 'fr' ? 'Rapidité Extrême' : 'Extreme Speed', desc: lang === 'fr' ? 'Traitement des commandes instantané, même en 3G.' : 'Instant order processing, even on 3G.', hover: 'hover:bg-amber-500' },
                { icon: '💳', title: lang === 'fr' ? 'Paiement Mobile' : 'Mobile Payment', desc: lang === 'fr' ? 'Encaissez par Mobile Money ou carte bancaire partout.' : 'Collect via Mobile Money or bank card anywhere.', hover: 'hover:bg-slate-800' },
              ].map((f, i) => (
                <div key={i} className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center group ${f.hover} transition-colors duration-300`}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-white">{f.title}</h3>
                  <p className="text-gray-500 text-sm group-hover:text-white/80">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PAGE 4 — CTA */}
        <section className="landing-section bg-slate-900 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full blur-[120px] opacity-20"></div>
          <div className="text-center px-6 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              {lang === 'fr' ? <>Rejoignez la <br /><span className="text-red-500">Révolution.</span></> : <>Join the <br /><span className="text-red-500">Revolution.</span></>}
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              {lang === 'fr' ? "Le commerce de demain est dans votre poche. Commencez votre essai gratuit dès aujourd'hui." : "Tomorrow's commerce is in your pocket. Start your free trial today."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/connexion" className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl shadow-red-600/30 hover:scale-105 transition-all inline-block text-center">
                {lang === 'fr' ? 'COMMENCER MAINTENANT' : 'GET STARTED NOW'}
              </Link>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center justify-center gap-3">
                <span>📲</span>
                {lang === 'fr' ? "INSTALLER L'APP" : 'INSTALL THE APP'}
              </button>
            </div>
            <div className="mt-16 pt-8 border-t border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              {lang === 'fr' ? 'Disponible sur iOS et Android' : 'Available on iOS and Android'}
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes swipeHint {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}