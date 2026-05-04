'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Vetements','Electroniques','Decoration','Electromenager','Beaute & soin',
  'Accessoires','Bebe','Jeux & jouets','Bricolage','Alimentation','Boissons',
  'Livre','Hygiene & sante','Fitness','Animaux','Luxe','Bureau','Peruque',
  'Chaussures','Telephone','Outils','Enfants','Bijoux','Autre','Site-web',
  'Voiture','Formation',
];

export default function ProductForm({ initialData, onSubmit, onCancel, loading }) {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [prix, setPrix] = useState(initialData?.prix || '');
  const [prixPromo, setPrixPromo] = useState(initialData?.prixPromo || '');
  const [prixInitial, setPrixInitial] = useState(initialData?.prixInitial || '');
  const [stock, setStock] = useState(initialData?.stock || '');
  const [categorie, setCategorie] = useState(initialData?.categorie || '');

  const hasPromo = prixPromo && Number(prixPromo) > 0 && Number(prixPromo) < Number(prix);

  function handleSubmit(e) {
    e.preventDefault();
    if (!nom.trim() || !prix) return;
    onSubmit({
      nom: nom.trim(),
      description: description.trim(),
      prix: Number(prix),
      prixPromo: hasPromo ? Number(prixPromo) : null,
      prixInitial: prixInitial ? Number(prixInitial) : null,
      stock: Number(stock) || 0,
      categorie,
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Nom */}
      <div>
        <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>Nom du produit *</label>
        <input
          type="text" required
          value={nom} onChange={e => setNom(e.target.value)}
          placeholder="Ex: Robe Wax Kente"
          style={{
            width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
            fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
            outline:'none', transition:'all .25s ease'
          }}
          onFocus={e => e.target.style.borderColor = '#007AFF'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>Description</label>
        <textarea
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Décrivez votre produit..."
          rows={4}
          style={{
            width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
            fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
            outline:'none', transition:'all .25s ease', resize:'vertical', minHeight:'100px'
          }}
          onFocus={e => e.target.style.borderColor = '#007AFF'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Prix & Stock */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px' }}>
        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>Prix actuel (FCFA) *</label>
          <input
            type="number" required min="0"
            value={prix} onChange={e => setPrix(e.target.value)}
            placeholder="Ex: 5000"
            style={{
              width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
              fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
              outline:'none', transition:'all .25s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#007AFF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>
            Prix avant promo (FCFA)
            <span style={{ fontWeight:400, color:'#6E6E73', fontSize:'.78rem' }}> — optionnel</span>
          </label>
          <input
            type="number" min="0"
            value={prixInitial} onChange={e => setPrixInitial(e.target.value)}
            placeholder="Ex: 8000"
            style={{
              width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
              fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
              outline:'none', transition:'all .25s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#007AFF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>
            Prix promotionnel (FCFA)
            <span style={{ fontWeight:400, color:'#6E6E73', fontSize:'.78rem' }}> — optionnel</span>
          </label>
          <input
            type="number" min="0" max={prix || undefined}
            value={prixPromo} onChange={e => setPrixPromo(e.target.value)}
            placeholder="Ex: 4500"
            style={{
              width:'100%', padding:'12px 16px', border:`1.5px solid ${hasPromo ? '#34C759' : '#E5E7EB'}`, borderRadius:'10px',
              fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
              outline:'none', transition:'all .25s ease',
              ...(hasPromo ? { backgroundColor:'rgba(52,199,89,.04)' } : {})
            }}
            onFocus={e => e.target.style.borderColor = '#007AFF'}
            onBlur={e => e.target.style.borderColor = hasPromo ? '#34C759' : '#E5E7EB'}
          />
          {hasPromo && (
            <p style={{ margin:'6px 0 0', fontSize:'.78rem', color:'#34C759', fontWeight:500 }}>
              ✅ Promo: {Math.round((1 - Number(prixPromo)/Number(prix)) * 100)}% de réduction
            </p>
          )}
          {prixPromo && Number(prixPromo) >= Number(prix) && (
            <p style={{ margin:'6px 0 0', fontSize:'.78rem', color:'#FF3B30', fontWeight:500 }}>
              ⚠️ Le prix promo doit être inférieur au prix actuel
            </p>
          )}
        </div>
      </div>

      {/* Stock & Catégorie */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>Stock *</label>
          <input
            type="number" required min="0"
            value={stock} onChange={e => setStock(e.target.value)}
            placeholder="Ex: 10"
            style={{
              width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
              fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
              outline:'none', transition:'all .25s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#007AFF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        <div>
          <label style={{ display:'block', fontWeight:600, marginBottom:'8px', fontSize:'.9rem', color:'#1D1D1F' }}>Catégorie</label>
          <select
            value={categorie} onChange={e => setCategorie(e.target.value)}
            style={{
              width:'100%', padding:'12px 16px', border:'1.5px solid #E5E7EB', borderRadius:'10px',
              fontFamily:"'Poppins',sans-serif", fontSize:'.92rem', color:'#1D1D1F',
              outline:'none', transition:'all .25s ease', cursor:'pointer',
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23007AFF' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:'36px', appearance:'none'
            }}
            onFocus={e => e.target.style.borderColor = '#007AFF'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          >
            <option value="">🏷️ Choisir une catégorie</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Aperçu prix */}
      {(prix || prixPromo) && (
        <div style={{ padding:'16px', background:'#F9FAFB', borderRadius:'12px', border:'1px solid #E5E7EB' }}>
          <p style={{ margin:'0 0 8px', fontSize:'.82rem', color:'#6E6E73', fontWeight:500 }}>Aperçu du prix :</p>
          <div style={{ display:'flex', alignItems:'baseline', gap:'10px' }}>
            {prixPromo && Number(prixPromo) > 0 && Number(prixPromo) < Number(prix) ? (
              <>
                <span style={{ fontSize:'1.1rem', fontWeight:700, color:'#007AFF' }}>{Number(prixPromo).toLocaleString('fr-FR')} FCFA</span>
                {prixInitial && (
                  <span style={{ fontSize:'.85rem', color:'#6E6E73', textDecoration:'line-through' }}>{Number(prixInitial).toLocaleString('fr-FR')} FCFA</span>
                )}
                {!prixInitial && (
                  <span style={{ fontSize:'.85rem', color:'#6E6E73', textDecoration:'line-through' }}>{Number(prix).toLocaleString('fr-FR')} FCFA</span>
                )}
                <span style={{ fontSize:'.75rem', background:'#34C759', color:'white', padding:'2px 8px', borderRadius:'20px', fontWeight:600 }}>
                  -{Math.round((1 - Number(prixPromo)/Number(prix)) * 100)}%
                </span>
              </>
            ) : (
              <span style={{ fontSize:'1.1rem', fontWeight:700, color:'#007AFF' }}>{Number(prix).toLocaleString('fr-FR')} FCFA</span>
            )}
          </div>
        </div>
      )}

      {/* Boutons */}
      <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex:1, padding:'12px 24px', background: loading ? '#E5E7EB' : 'linear-gradient(135deg, #007AFF, #5856D6)',
            color:'white', border:'none', borderRadius:'10px', fontFamily:"'Poppins',sans-serif",
            fontSize:'.95rem', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer',
            transition:'all .25s ease', boxShadow:'0 4px 12px rgba(0,122,255,.2)'
          }}
        >
          {loading ? '⏳ Enregistrement...' : (initialData ? '✅ Modifier' : '➕ Ajouter')} le produit
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding:'12px 24px', background:'white', color:'#6E6E73', border:'1.5px solid #E5E7EB',
            borderRadius:'10px', fontFamily:"'Poppins',sans-serif", fontSize:'.95rem', fontWeight:600,
            cursor:'pointer', transition:'all .25s ease'
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
