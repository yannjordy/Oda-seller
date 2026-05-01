'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const PAGE_CSS = `
  @keyframes st-fadeIn  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes st-slideIn { from{transform:translateX(400px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes st-fadeOut { to{opacity:0;transform:translateY(-10px)} }

  .st-stat-card {
    background:white; border-radius:16px; padding:20px;
    box-shadow:0 2px 8px rgba(0,0,0,.08); transition:.3s ease;
    display:flex; gap:16px; align-items:center;
    animation:st-fadeIn .5s ease both;
    min-width:0;
  }
  .st-stat-card:hover { transform:translateY(-4px); box-shadow:0 4px 16px rgba(0,0,0,.10); }

  .st-card-icon {
    width:56px; height:56px; border-radius:14px;
    display:flex; align-items:center; justify-content:center;
    font-size:1.75rem; box-shadow:0 2px 8px rgba(0,0,0,.08); flex-shrink:0;
  }

  .st-graph-card {
    background:white; border-radius:16px; padding:20px;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
    animation:st-fadeIn .6s ease both;
    overflow-x:auto;
  }

  .st-period-btn {
    padding:8px 18px; border-radius:20px; border:none; cursor:pointer;
    font-weight:600; font-size:.85rem; transition:.25s ease;
    font-family:Poppins,sans-serif;
  }
  .st-period-btn.active { background:#007AFF; color:white; box-shadow:0 4px 12px rgba(0,122,255,.3); }
  .st-period-btn:not(.active) { background:#F5F5F7; color:#6E6E73; }
  .st-period-btn:not(.active):hover { background:#E5E5EA; }

  .st-top-bar {
    height:8px; border-radius:4px; transition:width .8s ease;
  }

  .st-notif {
    background:white; padding:16px 24px; border-radius:12px;
    box-shadow:0 8px 25px rgba(0,0,0,.15); animation:st-slideIn .5s ease;
    max-width:350px; font-family:Poppins,sans-serif; font-weight:500; color:#1D1D1F;
  }

  /* Activity feed */
  .st-activity-item {
    padding:10px 14px 10px 16px; border-left:3px solid #007AFF;
    background:rgba(0,122,255,.05); border-radius:8px; margin-bottom:8px;
    transition:.25s ease; animation:st-fadeIn .4s ease both;
  }
  .st-activity-item:hover { background:rgba(0,122,255,.09); }

  /* Category row */
  .st-cat-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; }

  /* ══════════════════════════════════════════════════════════
     RESPONSIVE STYLES
  ══════════════════════════════════════════════════════════ */

  /* Mobile (< 640px) */
  @media (max-width: 639px) {
    .st-stat-card {
      padding:16px;
      gap:12px;
      flex-direction:column;
      text-align:center;
    }
    
    .st-card-icon {
      width:48px;
      height:48px;
      font-size:1.5rem;
    }

    .st-graph-card {
      padding:16px;
      margin-bottom:16px;
    }

    .st-graph-card > div:first-child {
      font-size:0.95rem;
    }

    /* Grille stats (1 colonne) */
    .st-stats-grid {
      grid-template-columns: 1fr !important;
      gap:12px !important;
    }

    /* Grille 2 colonnes -> 1 colonne */
    .st-grid-2col {
      grid-template-columns: 1fr !important;
      gap:16px !important;
    }

    /* Grille 2fr 1fr -> 1 colonne */
    .st-grid-2fr-1fr {
      grid-template-columns: 1fr !important;
      gap:16px !important;
    }

    /* Répartition catégories - 2 colonnes */
    .st-grid-auto {
      grid-template-columns: repeat(2, 1fr) !important;
      gap:12px !important;
    }
  }

  /* Tablette (640px à 1023px) */
  @media (min-width: 640px) and (max-width: 1023px) {
    .st-stat-card {
      padding:18px;
      gap:14px;
    }

    .st-card-icon {
      width:48px;
      height:48px;
      font-size:1.5rem;
    }

    .st-graph-card {
      padding:18px;
    }

    /* Grille stats (2 colonnes) */
    .st-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap:16px !important;
    }

    /* Revenus + Catégories (empilé) */
    .st-grid-2fr-1fr {
      grid-template-columns: 1fr !important;
      gap:16px !important;
    }

    /* Autres grilles 2 colonnes */
    .st-grid-2col {
      grid-template-columns: 1fr !important;
      gap:16px !important;
    }

    /* Répartition catégories - 3 colonnes */
    .st-grid-auto {
      grid-template-columns: repeat(3, 1fr) !important;
      gap:12px !important;
    }
  }

  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    .st-stat-card {
      padding:24px;
      gap:20px;
      flex-direction:row;
      text-align:left;
    }

    .st-card-icon {
      width:56px;
      height:56px;
      font-size:1.75rem;
    }

    .st-graph-card {
      padding:24px;
    }

    /* Grille stats (4 colonnes) */
    .st-stats-grid {
      grid-template-columns: repeat(4, 1fr) !important;
      gap:24px !important;
    }

    /* Revenus + Catégories */
    .st-grid-2fr-1fr {
      grid-template-columns: 2fr 1fr !important;
      gap:24px !important;
    }

    /* Autres grilles 2 colonnes */
    .st-grid-2col {
      grid-template-columns: 1fr 1fr !important;
      gap:24px !important;
    }

    /* Répartition catégories */
    .st-grid-auto {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
      gap:16px !important;
    }
  }
`;

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('st-page-style')) return;
  const el = document.createElement('style');
  el.id = 'st-page-style';
  el.textContent = PAGE_CSS;
  document.head.appendChild(el);
}

/* ── Counter animation hook ── */
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const fps = 60;
    const frames = Math.round(duration / (1000 / fps));
    const inc = target / frames;
    let cur = 0;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      cur += inc;
      if (frame >= frames) { setValue(target); clearInterval(id); }
      else setValue(Math.floor(cur));
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [target]);
  return value;
}

/* ── Animated KPI Card ── */
function StatCard({ icon, label, value, subtitle, color, bg, delay = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display  = typeof value === 'number' ? animated.toLocaleString('fr-FR') : value;
  return (
    <div className="st-stat-card" style={{ animationDelay:`${delay}s` }}>
      <div className="st-card-icon" style={{ background: bg }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'.85rem', color:'#6E6E73', fontWeight:500, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:'6px' }}>{label}</div>
        <div style={{ fontSize:'2rem', fontWeight:700, color:'#1D1D1F', lineHeight:1, marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis' }}>{display}</div>
        {subtitle && <div style={{ fontSize:'.8rem', color: color, overflow:'hidden', textOverflow:'ellipsis' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* Graphique barres — revenus par jour */
function RevenueChart({ data }) {
  const ref  = useRef(null);
  const inst = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (inst.current) inst.current.destroy();
      const ctx = ref.current?.getContext('2d');
      if (!ctx) return;
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, 'rgba(0,122,255,.6)');
      grad.addColorStop(1, 'rgba(90,200,250,.1)');
      inst.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            label: 'Revenus (FCFA)',
            data: data.map(d => d.value),
            backgroundColor: grad,
            borderColor: '#007AFF',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(0,122,255,.8)',
          }],
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          animation: { duration: 1500, easing: 'easeInOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(29,29,31,.95)', padding: 12, cornerRadius: 10,
              titleFont: { family: 'Poppins', size: 13, weight: '600' },
              bodyFont:  { family: 'Poppins', size: 12 },
              callbacks: { label: ctx => ` ${ctx.raw.toLocaleString('fr-FR')} FCFA` },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,.05)' },
              ticks: { font:{ family:'Poppins', size:11 }, callback: v => `${(v/1000).toFixed(0)}k` },
            },
            x: {
              grid: { display:false },
              ticks: { font:{ family:'Poppins', size:10 } },
            },
          },
        },
      });
    })();
    return () => {
      if (inst.current) inst.current.destroy();
    };
  }, [data]);

  return (
    <div ref={containerRef} style={{ position:'relative', width:'100%', height:'300px' }}>
      <canvas ref={ref} />
    </div>
  );
}

/* Graphique doughnut — catégories */
function CategoryDoughnut({ categories }) {
  const ref  = useRef(null);
  const inst = useRef(null);
  const COLORS = ['#007AFF','#34C759','#FF9500','#5856D6','#FF3B30','#00C7BE','#FF2D55','#5AC8FA'];

  useEffect(() => {
    const labels = Object.keys(categories);
    const values = Object.values(categories);
    if (!labels.length) return;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (inst.current) inst.current.destroy();
      const ctx = ref.current?.getContext('2d');
      if (!ctx) return;
      inst.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 0, hoverOffset: 15 }],
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          animation: { duration: 1500, easing: 'easeInOutQuart' },
          plugins: {
            legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, pointStyle: 'circle', font: { family:'Poppins', size:11, weight:'500' } } },
            tooltip: { backgroundColor:'rgba(29,29,31,.95)', padding:12, cornerRadius:10, titleFont:{family:'Poppins',size:13,weight:'600'}, bodyFont:{family:'Poppins',size:12} },
          },
        },
      });
    })();
    return () => {
      if (inst.current) inst.current.destroy();
    };
  }, [categories]);

  return (
    <div style={{ position:'relative', height:'300px' }}>
      {!Object.keys(categories).length
        ? <div style={{ height:'300px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#6E6E73' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>🗂️</div>
            <p>Aucun produit disponible</p>
          </div>
        : <canvas ref={ref} />
      }
    </div>
  );
}

/* Graphique barres horizontal — statuts commandes */
function OrderStatusChart({ data }) {
  const ref  = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;
    (async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (inst.current) inst.current.destroy();
      const ctx = ref.current?.getContext('2d');
      if (!ctx) return;
      inst.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => d.label),
          datasets: [{
            label: 'Commandes',
            data: data.map(d => d.value),
            backgroundColor: data.map(d => d.color + '99'),
            borderColor: data.map(d => d.color),
            borderWidth: 2,
            borderRadius: 8,
          }],
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false,
          indexAxis: 'y',
          animation: { duration: 1500, easing: 'easeInOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor:'rgba(29,29,31,.95)', padding:12, cornerRadius:10, titleFont:{family:'Poppins',size:13,weight:'600'}, bodyFont:{family:'Poppins',size:12} },
          },
          scales: {
            x: { beginAtZero:true, ticks:{ stepSize:1, font:{family:'Poppins',size:11} }, grid:{color:'rgba(0,0,0,.05)'} },
            y: { ticks:{ font:{family:'Poppins',size:11} }, grid:{display:false} },
          },
        },
      });
    })();
    return () => {
      if (inst.current) inst.current.destroy();
    };
  }, [data]);

  return (
    <div style={{ position:'relative', height:'220px' }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════════════════════ */
export default function StatistiquesPage() {
  injectStyles();
  const supabase = getSupabase();
  const { user } = useAuth();

  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  /* Stats principales */
  const [totalProduits, setTotalProduits] = useState(0);
  const [produitsPublies, setProduitsPublies] = useState(0);
  const [totalCommandes, setTotalCommandes] = useState(0);
  const [commandesLivrees, setCommandesLivrees] = useState(0);
  const [revenuTotal, setRevenuTotal] = useState(0);
  const [totalClients, setTotalClients] = useState(0);

  /* Données graphiques */
  const [revenueData, setRevenueData] = useState([]);
  const [categories, setCategories] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [topProduits, setTopProduits] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => { injectStyles(); }, []);
  useEffect(() => { if (user) loadData(); }, [user, period]);

  function getStartDate() {
    const now = new Date();
    if (period === 'week') return new Date(now.getTime() - 7 * 86_400_000);
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(now.getFullYear(), 0, 1);
  }

  async function loadData() {
    setLoading(true);
    try {
      const start = getStartDate().toISOString();

      const [produitsRes, commandesRes, clientsRes] = await Promise.all([
        supabase.from('produits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('commandes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const prods = produitsRes.data || [];
      const cmds = commandesRes.data || [];
      const nbClients = clientsRes.count || 0;

      /* ── KPIs ── */
      setTotalProduits(prods.length);
      setProduitsPublies(prods.filter(p => p.statut === 'published').length);
      setTotalClients(nbClients);

      // Filtrer commandes par période
      const cmdsFiltered = cmds.filter(c => new Date(c.created_at) >= new Date(start));

      setTotalCommandes(cmdsFiltered.length);
      setCommandesLivrees(cmdsFiltered.filter(c => ['delivered', 'livree'].includes(c.statut)).length);

      const revenu = cmds
        .filter(c => !['cancelled', 'annulee'].includes(c.statut))
        .reduce((s, c) => s + (c.montant_total || 0), 0);
      setRevenuTotal(revenu);

      /* ── Données graphique revenus (par jour) ── */
      const grouped = {};
      cmdsFiltered
        .filter(c => !['cancelled', 'annulee'].includes(c.statut))
        .forEach(c => {
          const d = new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          grouped[d] = (grouped[d] || 0) + (c.montant_total || 0);
        });
      setRevenueData(Object.entries(grouped).slice(-14).map(([label, value]) => ({ label, value })));

      /* ── Catégories produits ── */
      const cats = {};
      prods.forEach(p => { const c = p.categorie || 'Autre'; cats[c] = (cats[c] || 0) + 1; });
      setCategories(cats);

      /* ── Statuts commandes ── */
      const statusMap = {
        'En attente': { keys: ['en_attente', 'pending'], color: '#FF9500' },
        'Confirmées': { keys: ['confirmee', 'processing'], color: '#007AFF' },
        'En livraison': { keys: ['en_livraison', 'shipped'], color: '#5856D6' },
        'Livrées': { keys: ['livree', 'delivered'], color: '#34C759' },
        'Annulées': { keys: ['annulee', 'cancelled'], color: '#FF3B30' },
      };
      setStatusData(
        Object.entries(statusMap).map(([label, { keys, color }]) => ({
          label,
          value: cmds.filter(c => keys.includes(c.statut)).length,
          color,
        })).filter(d => d.value > 0)
      );

      /* ── Top produits (depuis produits_data des commandes) ── */
      const compteur = {};
      cmds.forEach(c => {
        const items = c.produits_data || c.produits || [];
        if (Array.isArray(items)) {
          items.forEach(p => {
            const key = p.nom || 'Produit inconnu';
            compteur[key] = (compteur[key] || 0) + (p.quantite || 1);
          });
        }
      });
      setTopProduits(
        Object.entries(compteur)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([nom, count]) => ({ nom, count }))
      );

      /* ── Activité récente ── */
      setRecentActivity(cmds.slice(0, 6));

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const growthRevenu = '+12%';
  const growthCmds = '+8%';
  const growthClients = '+5%';

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#007AFF', '#34C759'];

  function getTemps(date) {
    const diff = Date.now() - new Date(date);
    const h = Math.floor(diff / 3.6e6);
    const j = Math.floor(h / 24);
    if (j > 0) return `Il y a ${j}j`;
    if (h > 0) return `Il y a ${h}h`;
    return "À l'instant";
  }

  function getStatutLabel(s) {
    const m = { en_attente: 'En attente', pending: 'En attente', confirmee: 'Confirmée', processing: 'En traitement', en_livraison: 'En livraison', shipped: 'Expédiée', livree: 'Livrée', delivered: 'Livrée', annulee: 'Annulée', cancelled: 'Annulée' };
    return m[s] || s;
  }

  /* ══ RENDER ══ */
  return (
    <div style={{ fontFamily: "'Poppins',-apple-system,sans-serif", padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── EN-TÊTE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg,#007AFF,#5856D6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '4px' }}>
            📈 Statistiques
          </h1>
          <p style={{ color: '#6E6E73', margin: 0 }}>Analysez vos performances en temps réel</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[['week', 'Cette semaine'], ['month', 'Ce mois'], ['year', 'Cette année']].map(([val, label]) => (
            <button key={val} className={`st-period-btn${period === val ? ' active' : ''}`} onClick={() => setPeriod(val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="st-stats-grid" style={{ display: 'grid', marginBottom: '32px' }}>
        <StatCard icon="💰" label="Revenu total" value={revenuTotal} subtitle={`${growthRevenu} vs période préc.`} color="#34C759" bg="rgba(0,122,255,.10)" delay={0} />
        <StatCard icon="📋" label="Commandes" value={totalCommandes} subtitle={`${commandesLivrees} livrées`} color="#007AFF" bg="rgba(0,122,255,.10)" delay={0.05} />
        <StatCard icon="📦" label="Produits" value={totalProduits} subtitle={`${produitsPublies} publiés`} color="#FF9500" bg="rgba(255,149,0,.10)" delay={0.10} />
        <StatCard icon="👥" label="Clients" value={totalClients} subtitle={`${growthClients} vs période préc.`} color="#AF52DE" bg="rgba(175,82,222,.10)" delay={0.15} />
      </div>

      {/* ── REVENUS + CATÉGORIES ── */}
      <div className="st-grid-2fr-1fr" style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
        {/* Revenus */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Évolution des revenus
          </div>
          {loading
            ? <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : <RevenueChart data={revenueData} />
          }
        </div>

        {/* Catégories */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🗂️ Catégories produits
          </div>
          {loading
            ? <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : <CategoryDoughnut categories={categories} />
          }
        </div>
      </div>

      {/* ── STATUTS COMMANDES + TOP PRODUITS ── */}
      <div className="st-grid-2col" style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
        {/* Statuts */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📋 Statuts des commandes
          </div>
          {loading
            ? <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : statusData.length === 0
              ? <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6E6E73' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📋</div>
                  <p>Aucune commande</p>
                </div>
              : <OrderStatusChart data={statusData} />
          }
        </div>

        {/* Top produits */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 Produits les plus vendus
          </div>
          {loading
            ? <div style={{ padding: '40px', textAlign: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : topProduits.length === 0
              ? <div style={{ padding: '40px', textAlign: 'center', color: '#6E6E73' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
                  <p>Pas encore de données</p>
                </div>
              : topProduits.map((p, i) => (
                <div key={i} className="st-cat-row">
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: RANK_COLORS[i] || '#6E6E73', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
                      <span style={{ fontSize: '.85rem', color: '#6E6E73', flexShrink: 0 }}>{p.count} vendu{p.count > 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div className="st-top-bar" style={{ width: `${Math.min(100, (p.count / (topProduits[0]?.count || 1)) * 100)}%`, background: `linear-gradient(135deg,#007AFF,#5AC8FA)` }} />
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* ── ACTIVITÉ RÉCENTE + RÉPARTITION ── */}
      <div className="st-grid-2col" style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
        {/* Activité */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡ Activité récente
          </div>
          {loading
            ? <div style={{ padding: '20px', textAlign: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : recentActivity.length === 0
              ? <div style={{ padding: '30px', textAlign: 'center', color: '#6E6E73' }}>Aucune activité récente</div>
              : recentActivity.map((c, i) => (
                <div key={i} className="st-activity-item" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ fontWeight: 600, fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Commande #{c.id?.toString().substring(0, 8) || i} — <span style={{ fontWeight: 400, color: '#6E6E73' }}>{getStatutLabel(c.statut)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.8rem', color: '#007AFF', fontWeight: 600 }}>{(c.montant_total || 0).toLocaleString('fr-FR')} FCFA</span>
                    <span style={{ fontSize: '.78rem', color: '#86868B' }}>{getTemps(c.created_at)}</span>
                  </div>
                </div>
              ))
          }
        </div>

        {/* Répartition */}
        <div className="st-graph-card">
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📦 Répartition des produits
          </div>
          {loading
            ? <div style={{ padding: '20px', textAlign: 'center', color: '#6E6E73' }}>⏳ Chargement...</div>
            : Object.entries(categories).length === 0
              ? <div style={{ padding: '30px', textAlign: 'center', color: '#6E6E73' }}>Aucun produit</div>
              : (() => {
                  const total = Object.values(categories).reduce((s, v) => s + v, 0);
                  const COLORS = ['#007AFF', '#34C759', '#FF9500', '#5856D6', '#FF3B30', '#00C7BE', '#FF2D55', '#5AC8FA'];
                  return Object.entries(categories)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([cat, count], i) => (
                      <div key={cat} className="st-cat-row">
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', gap: '8px' }}>
                            <span style={{ fontSize: '.88rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                            <span style={{ fontSize: '.82rem', color: '#6E6E73', flexShrink: 0 }}>{count} ({((count / total) * 100).toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: '5px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div className="st-top-bar" style={{ width: `${(count / total) * 100}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      </div>
                    ));
                })()
          }
        </div>
      </div>

      {/* ── CHIFFRES CLÉS ── */}
      <div className="st-graph-card" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📌 Chiffres clés — {period === 'week' ? 'Cette semaine' : period === 'month' ? 'Ce mois' : 'Cette année'}
        </div>
        <div className="st-grid-auto" style={{ display: 'grid' }}>
          {[
            { label: 'Revenu moyen / commande', value: totalCommandes > 0 ? `${Math.round(revenuTotal / totalCommandes).toLocaleString('fr-FR')} FCFA` : '—' },
            { label: 'Taux de livraison', value: totalCommandes > 0 ? `${((commandesLivrees / totalCommandes) * 100).toFixed(0)}%` : '—' },
            { label: 'Produits publiés', value: totalProduits > 0 ? `${((produitsPublies / totalProduits) * 100).toFixed(0)}%` : '—' },
            { label: 'Total clients', value: totalClients },
          ].map((k, i) => (
            <div key={i} style={{ background: '#F5F5F7', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '.82rem', color: '#6E6E73', marginBottom: '8px', fontWeight: 500 }}>{k.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#007AFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {loading ? '...' : (typeof k.value === 'number' ? k.value.toLocaleString('fr-FR') : k.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}