'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', icon: '📊', label: 'Tableau de bord' },
  { href: '/dashboard/produits', icon: '📦', label: 'Produits' },
  { href: '/dashboard/commandes', icon: '📋', label: 'Commandes' },
  { href: '/dashboard/clients', icon: '👥', label: 'Clients' },
  { href: '/dashboard/messages', icon: '💬', label: 'Messages' },
];

const SECONDARY_LINKS = [
  { href: '/dashboard/statistiques', icon: '📈', label: 'Statistiques' },
  { href: '/dashboard/parametres', icon: '⚙️', label: 'Paramètres' },
  { href: '/dashboard/boutique', icon: '🏪', label: 'Ma Boutique' },
  { href: '/dashboard/abonnement', icon: '💎', label: 'Abonnement' },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/connexion');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const LinkItem = ({ href, icon, label }) => (
    <Link
      href={href}
      onClick={onClose}
      className={`hamburger-link ${isActive(href) ? 'active' : ''}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="hamburger-overlay active" onClick={onClose} />
      )}

      {/* Desktop sidebar */}
      <aside className="sidebar hidden md:flex flex-col">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <p className="sidebar-section-title">Principal</p>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`sidebar-link ${isActive(l.href) ? 'active' : ''}`}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}

          <div className="sidebar-divider" />
          <p className="sidebar-section-title">Plus</p>

          {SECONDARY_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`sidebar-link ${isActive(l.href) ? 'active' : ''}`}>
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}

          <div className="sidebar-divider" />

          {/* Community links */}
          <a href="https://whatsapp.com/channel/0029Vb6mcUm5q08htMMdVA2v" target="_blank" rel="noopener noreferrer" className="modern-link whatsapp" style={{ margin: '0' }}>
            <svg className="link-icon" viewBox="0 0 24 24" fill="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor"/>
              <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.4z" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: '0.8rem' }}>Chaîne WhatsApp</span>
          </a>

          <a href="https://t.me/+hqymnTrseaU2OWRk" target="_blank" rel="noopener noreferrer" className="modern-link telegram" style={{ margin: '0' }}>
            <svg className="link-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: '0.8rem' }}>Groupe Telegram</span>
          </a>
        </nav>

        {/* Sign out */}
        <button onClick={handleSignOut} className="sidebar-link" style={{ marginTop: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Mobile hamburger menu */}
      <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="hamburger-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#007AFF' }}>ODA</span>
          </div>
          <button className="close-menu" onClick={onClose}>×</button>
        </div>
        <nav className="hamburger-nav">
          {NAV_LINKS.map(l => <LinkItem key={l.href} {...l} />)}
          <div className="hamburger-divider" />
          {SECONDARY_LINKS.map(l => <LinkItem key={l.href} {...l} />)}
          <div className="hamburger-divider" />
          <button onClick={handleSignOut} className="hamburger-link" style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </nav>
        <a href="https://whatsapp.com/channel/0029Vb6mcUm5q08htMMdVA2v" target="_blank" rel="noopener noreferrer" className="modern-link whatsapp">
          <span>💬</span>
          <span>Rejoindre notre chaîne</span>
        </a>
        <a href="https://t.me/+hqymnTrseaU2OWRk" target="_blank" rel="noopener noreferrer" className="modern-link telegram">
          <span>✈️</span>
          <span>Rejoindre notre groupe Telegram</span>
        </a>
      </div>
    </>
  );
}
