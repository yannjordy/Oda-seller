'use client';

import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import PageLoader from '@/components/PageLoader';
import { Icons } from '@/components/icons';

const supabase = getSupabase();


export const LanguageContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ─── Dictionnaire de traductions ─── */
const TRANSLATIONS = {
  fr: {
    loading:          'Chargement...',
    administrator:    'Administrateur',
    sectionMain:      'Principal',
    sectionOthers:    'Autres',
    sectionCommunity: 'Communauté',
    openMenu:         'Ouvrir le menu',
    closeMenu:        'Fermer le menu',
    joinChannel:      'Rejoindre notre chaîne',
    telegramGroup:    'Groupe Telegram',
    dashboard:        'Tableau de bord',
    products:         'Produits',
    orders:           'Commandes',
    clients:          'Clients',
    messages:         'Messages',
    statistics:       'Statistiques',
    settings:         'Paramètres',
    myShop:           'Voir ma boutique',
  },
  en: {
    loading:          'Loading...',
    administrator:    'Administrator',
    sectionMain:      'Main',
    sectionOthers:    'Others',
    sectionCommunity: 'Community',
    openMenu:         'Open menu',
    closeMenu:        'Close menu',
    joinChannel:      'Join our channel',
    telegramGroup:    'Telegram Group',
    dashboard:        'Dashboard',
    products:         'Products',
    orders:           'Orders',
    clients:          'Clients',
    messages:         'Messages',
    statistics:       'Statistics',
    settings:         'Settings',
    myShop:           'View my shop',
  },
};

/* ─── CSS global injecté une seule fois ─── */


/* ══════════════════════════════════════════════════════════
   DASHBOARD LAYOUT — menu hamburger intégré et persistant
╚═════════════════════════════════════════════════════════ */
export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLangState]   = useState('fr');
  const { user, loading }       = useAuth();
  const router                  = useRouter();
  const pathname                = usePathname();

  /* ── Notifications de changement de plan ── */
  const [planNotifs, setPlanNotifs] = useState([]);
  const notifIdRef = useRef(0);

  function showPlanNotif(msg, type = 'info') {
    const id = ++notifIdRef.current;
    setPlanNotifs(p => [...p, { id, msg, type }]);
    setTimeout(() => setPlanNotifs(p => p.filter(n => n.id !== id)), 6000);
  }

  /* ── Écouter les changements d'abonnement en temps réel ── */
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-abonnement-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'abonnements', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'UPDATE' && oldRecord?.plan !== newRecord?.plan) {
            const planNames = {
              gratuit: 'Gratuit',
              starter: 'Starter',
              business: 'Business',
              premium: 'Premium',
            };
            const fromName = planNames[oldRecord.plan] || oldRecord.plan;
            const toName = planNames[newRecord.plan] || newRecord.plan;

            showPlanNotif(
              `🔄 Votre abonnement est passé de ${fromName} à ${toName}`,
              'warning'
            );

            if (newRecord.plan === 'gratuit') {
              showPlanNotif('⚠️ Votre limite de produits est maintenant de 10', 'warning');
            } else {
              showPlanNotif(`✅ Votre nouvelle limite est de ${newRecord.limite_produits} produits`, 'success');
            }
          }

          if (eventType === 'INSERT' && !oldRecord) {
            const planNames = {
              gratuit: 'Gratuit',
              starter: 'Starter',
              business: 'Business',
              premium: 'Premium',
            };
            const planName = planNames[newRecord.plan] || newRecord.plan;
            showPlanNotif(`🎉 Nouvel abonnement activé : ${planName}`, 'success');
          }

          if (eventType === 'DELETE') {
            showPlanNotif('❌ Votre abonnement a été supprimé', 'error');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /* Charger la langue sauvegardée */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oda-lang');
      if (saved === 'en' || saved === 'fr') setLangState(saved);
    } catch (_) {}
  }, []);

  function setLang(l) {
    setLangState(l);
    try { localStorage.setItem('oda-lang', l); } catch (_) {}
  }

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['fr'][key] ?? key;

  const NAV_LINKS = [
    { href: '/dashboard',              icon: Icons.dashboard,  labelKey: 'dashboard',  color: 'blue'   },
    { href: '/dashboard/produits',     icon: Icons.products,   labelKey: 'products',   color: 'orange' },
    { href: '/dashboard/commandes',    icon: Icons.orders,     labelKey: 'orders',     color: 'green'  },
    { href: '/dashboard/clients',      icon: Icons.clients,    labelKey: 'clients',    color: 'purple' },
    { href: '/dashboard/messages',     icon: Icons.messages,   labelKey: 'messages',   color: 'pink'   },
     { href: '/dashboard/marketing',     icon: Icons.marketing,   labelKey: 'marketing',   color: 'red'   },
  ];

  const NAV_LINKS_SECONDARY = [
    { href: '/dashboard/statistiques', icon: Icons.statistics, labelKey: 'statistics', color: 'teal'   },
    { href: '/dashboard/parametres',   icon: Icons.settings,   labelKey: 'settings',   color: 'indigo' },
    { href: '/dashboard/boutique',     icon: Icons.shop,       labelKey: 'myShop',     color: 'red'    },
  ];

  /* Redirect si non authentifié */
  useEffect(() => {
    if (!loading && !user) router.replace('/connexion');
  }, [user, loading, router]);

  /* Bloquer le scroll quand le menu est ouvert */
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('oda-noscroll');
    } else {
      document.body.classList.remove('oda-noscroll');
    }
    return () => document.body.classList.remove('oda-noscroll');
  }, [menuOpen]);

  /* Fermer le menu lors d'un changement de route */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Chargement */
  if (loading) {
    return <PageLoader />;
  }

  if (!user) return null;

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.name         ||
    user?.user_metadata?.full_name    ||
    user?.email?.split('@')[0]        ||
    'Admin';

  const initiale = displayName.charAt(0).toUpperCase();

  function closeMenu() { setMenuOpen(false); }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="oda-layout">

        {/* ── OVERLAY ── */}
        <div
          className={`oda-overlay${menuOpen ? ' open' : ''}`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* ── MENU PANEL ── */}
        <nav className={`oda-menu${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">

          {/* Hero : logo + profil */}
          <div className="oda-menu-hero">
            <div className="oda-hero-top">
              <div className="oda-hero-logo">
                <div className="oda-hero-logo-icon">{Icons.edit}</div>
                <span className="oda-hero-logo-text">ODA</span>
              </div>
              <button className="oda-hero-close" onClick={closeMenu} aria-label={t('closeMenu')}>
                {Icons.close}
              </button>
            </div>
            <div className="oda-hero-profile">
              <div className="oda-hero-avatar">{initiale}</div>
              <div className="oda-hero-info">
                <div className="oda-hero-info-name">{displayName}</div>
                <div className="oda-hero-info-role">{t('administrator')}</div>
              </div>
              <div className="oda-hero-badge" />
            </div>
          </div>

          {/* Navigation */}
          <div className="oda-menu-nav">

            <div className="oda-nav-section-label">{t('sectionMain')}</div>

            {NAV_LINKS.map(({ href, icon, labelKey, color }, i) => (
              <Link
                key={href}
                href={href}
                data-color={color}
                className={`oda-nav-link oda-nav-anim-${i + 1}${pathname === href || (href !== '/dashboard' && pathname?.startsWith(href)) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <div className="oda-nav-icon-wrap"><span>{icon}</span></div>
                <span>{t(labelKey)}</span>
                <span className="oda-nav-chevron">›</span>
              </Link>
            ))}

            <div className="oda-divider" />
            <div className="oda-nav-section-label">{t('sectionOthers')}</div>

            {NAV_LINKS_SECONDARY.map(({ href, icon, labelKey, color }, i) => (
              <Link
                key={href}
                href={href}
                data-color={color}
                className={`oda-nav-link oda-nav-anim-${NAV_LINKS.length + i + 1}${pathname?.startsWith(href) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <div className="oda-nav-icon-wrap"><span>{icon}</span></div>
                <span>{t(labelKey)}</span>
                <span className="oda-nav-chevron">›</span>
              </Link>
            ))}

            <div className="oda-divider" />
            <div className="oda-nav-section-label">{t('sectionCommunity')}</div>

            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb6mcUm5q08htMMdVA2v"
              className={`oda-social-link whatsapp oda-nav-anim-${NAV_LINKS.length + NAV_LINKS_SECONDARY.length + 1}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <div className="oda-nav-icon-wrap">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.4z"/>
                </svg>
              </div>
              <span>{t('joinChannel')}</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+hqymnTrseaU2OWRk"
              className={`oda-social-link telegram oda-nav-anim-${NAV_LINKS.length + NAV_LINKS_SECONDARY.length + 2}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <div className="oda-nav-icon-wrap">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </div>
              <span>{t('telegramGroup')}</span>
            </a>

          </div>
        </nav>

        {/* ── HEADER ── */}
        <header className="oda-header">
          <div className="oda-header-inner">

            {/* Bouton hamburger */}
            <button
              className={`oda-ham-btn${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
            >
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </button>

            {/* Marque centrée */}
            <span className="oda-brand">ODA</span>

            {/* Côté droit */}
            <div className="oda-header-right">

              {/* FR / EN */}
              <div className="oda-lang-btn" role="group" aria-label="Langue / Language">
                <button
                  className={`oda-lang-option${lang === 'fr' ? ' active' : ''}`}
                  onClick={() => setLang('fr')}
                  aria-pressed={lang === 'fr'}
                >FR</button>
                <button
                  className={`oda-lang-option${lang === 'en' ? ' active' : ''}`}
                  onClick={() => setLang('en')}
                  aria-pressed={lang === 'en'}
                >EN</button>
              </div>

              {/* Profil utilisateur — nom masqué sur petit écran via CSS */}
              <div className="oda-user-pill">
                <div className="oda-user-avatar">{initiale}</div>
                <span className="oda-user-name">{displayName}</span>
              </div>

            </div>
          </div>
        </header>

        {/* ── CONTENU ── */}
        <main className="oda-content">
          {children}
        </main>

        {/* ── NOTIFICATIONS CHANGEMENT DE PLAN ── */}
        {planNotifs.length > 0 && (
          <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
            {planNotifs.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '12px 18px',
                  borderRadius: 14,
                  fontSize: '.88rem',
                  fontWeight: 600,
                  maxWidth: 340,
                  pointerEvents: 'all',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,.1)',
                  animation: 'slideInRight .4s cubic-bezier(.25,.8,.25,1)',
                  background: n.type === 'success' ? 'rgba(16,185,129,.18)' : n.type === 'error' ? 'rgba(239,68,68,.18)' : 'rgba(245,158,11,.18)',
                  borderColor: n.type === 'success' ? 'rgba(16,185,129,.4)' : n.type === 'error' ? 'rgba(239,68,68,.4)' : 'rgba(245,158,11,.4)',
                  color: n.type === 'success' ? '#6EE7B7' : n.type === 'error' ? '#FCA5A5' : '#FCD34D',
                }}
              >
                {n.msg}
              </div>
            ))}
          </div>
        )}

      </div>
    </LanguageContext.Provider>
  );
}