'use client';

import { useAuth } from '@/contexts/AuthContext';
import NotificationPermission from './NotificationPermission';

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="main-header">
      <div className="header-container">
        {/* Hamburger (mobile only) */}
        <button className="hamburger-btn md:hidden" onClick={onMenuToggle} aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="brand-section">
          <h1 className="brand-name">Oda</h1>
        </div>

        <div className="header-actions">
          <div className="user-profile">
            <span>👤</span>
            <span className="user-name">{displayName}</span>
          </div>
          <NotificationPermission />
        </div>
      </div>
    </header>
  );
}
