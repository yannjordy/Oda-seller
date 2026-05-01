// ==========================================
// 💾 CACHE MANAGER — ODA Boutique (Next.js)
// ==========================================

const PREFIX = 'oda_cache_';

const CACHE_TTL = {
  produits: 5 * 60 * 1000,
  commandes: 5 * 60 * 1000,
  abonnements: 60 * 60 * 1000,
  stats: 10 * 60 * 1000,
};

export function cacheSet(key, data) {
  if (typeof window === 'undefined') return false;
  try {
    const entry = {
      data,
      ts: Date.now(),
      ttl: CACHE_TTL[key] || 5 * 60 * 1000,
    };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    return true;
  } catch {
    return false;
  }
}

export function cacheGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry.data ?? null;
  } catch {
    return null;
  }
}

export function cacheRemove(key) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}

export function cacheIsStale(key) {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return true;
    const { ts, ttl } = JSON.parse(raw);
    return Date.now() - ts > (ttl || 5 * 60 * 1000);
  } catch {
    return true;
  }
}

export function cacheClear() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

// Helpers spécialisés
export const OdaCache = {
  getProduits: () => cacheGet('produits'),
  setProduits: (data) => cacheSet('produits', data),
  getCommandes: () => cacheGet('commandes'),
  setCommandes: (data) => cacheSet('commandes', data),
  getStats: () => cacheGet('stats'),
  setStats: (data) => cacheSet('stats', data),
  getAbonnement: () => cacheGet('abonnement'),
  setAbonnement: (data) => cacheSet('abonnement', data),
  getUser: () => cacheGet('currentUser'),
  setUser: (data) => cacheSet('currentUser', data),
  isStale: cacheIsStale,
  clear: cacheClear,
};

export default OdaCache;
