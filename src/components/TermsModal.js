'use client';

import { useState, useEffect } from 'react';

const TERMS_TEXT = [
  {
    title: '1. Acceptation des conditions',
    content: 'En accédant et en utilisant la plateforme OdaMarket, vous acceptez pleinement et sans réserve les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser nos services.',
  },
  {
    title: '2. Description du service',
    content: 'OdaMarket est une plateforme de commerce en ligne permettant aux vendeurs de créer leur boutique numérique, gérer leurs produits, traiter des commandes et recevoir des paiements. Le service inclut la gestion de boutique, le suivi des commandes, la messagerie client et des outils de marketing.',
  },
  {
    title: '3. Inscription et compte',
    content: 'Pour utiliser les services OdaMarket, vous devez créer un compte en fournissant des informations exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée.',
  },
  {
    title: '4. Obligations du vendeur',
    content: 'En tant que vendeur, vous vous engagez à : fournir des descriptions de produits exactes et honnêtes ; respecter les lois et réglementations applicables ; honorer toutes les commandes passées par les clients ; fournir un service client de qualité ; ne pas vendre de produits illicites, dangereux ou prohibés.',
  },
  {
    title: '5. Politique de paiement',
    content: 'OdaMarket supporte plusieurs méthodes de paiement : Mobile Money (MTN, Orange), carte bancaire et paiement à la livraison. Les transactions sont sécurisées via nos partenaires de paiement. OdaMarket peut prélever des frais de service sur chaque transaction selon le plan d\'abonnement souscrit.',
  },
  {
    title: '6. Propriété intellectuelle',
    content: 'Le contenu de la plateforme OdaMarket (design, logos, textes, code source) est protégé par les droits de propriété intellectuelle. Les vendeurs conservent les droits sur leurs propres contenus (photos, descriptions de produits).',
  },
  {
    title: '7. Protection des données',
    content: 'OdaMarket collecte et traite vos données personnelles conformément à notre politique de confidentialité. Vos données sont utilisées pour fournir et améliorer nos services, traiter vos transactions et vous communiquer des informations importantes.',
  },
  {
    title: '8. Responsabilité',
    content: 'OdaMarket agit comme intermédiaire technique entre vendeurs et acheteurs. Nous ne sommes pas responsables de la qualité des produits vendus, des litiges entre utilisateurs, ou des interruptions de service dues à des cas de force majeure.',
  },
  {
    title: '9. Résiliation',
    content: 'OdaMarket se réserve le droit de suspendre ou résilier votre compte en cas de violation des présentes conditions, sans préavis. Vous pouvez également résilier votre compte à tout moment depuis les paramètres de votre compte.',
  },
  {
    title: '10. Modification des conditions',
    content: 'OdaMarket peut modifier ces conditions d\'utilisation à tout moment. Les utilisateurs seront notifiés des changements significatifs. L\'utilisation continue du service après modification constitue une acceptation des nouvelles conditions.',
  },
  {
    title: '11. Loi applicable',
    content: 'Les présentes conditions sont régies par la loi en vigueur dans le pays d\'exploitation de la plateforme. En cas de litige, une tentative de résolution amiable sera privilégiée avant toute action judiciaire.',
  },
];

export default function TermsModal({ onAccept, onDecline }) {
  const [agreed, setAgreed] = useState(false);
  const [scrollRead, setScrollRead] = useState(false);
  const [section, setSection] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleContinue() {
    if (agreed) {
      onAccept();
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes keyterms-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes keyterms-slideUp { from { opacity: 0; transform: translateY(40px) scale(.97); } to { opacity: 1; transform: none; } }

        .terms-overlay {
          position: fixed; inset: 0; z-index: 100000;
          background: rgba(0,0,0,.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; animation: keyterms-fadeIn .3s ease;
        }
        @media (max-width: 640px) {
          .terms-overlay { padding: 0; align-items: flex-end; }
        }

        .terms-card {
          background: white; border-radius: 20px;
          width: 100%; max-width: 560px; max-height: 90vh;
          display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,.35);
          animation: keyterms-slideUp .4s cubic-bezier(.25,.46,.45,.94);
        }
        @media (max-width: 640px) {
          .terms-card { max-height: 95vh; border-radius: 18px 18px 0 0; }
        }

        /* Header */
        .terms-header {
          padding: 24px 24px 16px; border-bottom: 1px solid #F0F0F2;
          flex-shrink: 0; background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white;
        }
        .terms-header h2 {
          font-size: 1.2rem; font-weight: 800; margin: 0 0 4px;
          display: flex; align-items: center; gap: 10px;
          font-family: 'Poppins', -apple-system, sans-serif;
        }
        .terms-header p {
          font-size: .82rem; opacity: .85; margin: 0;
          font-family: 'Poppins', -apple-system, sans-serif;
        }

        /* Progress bar */
        .terms-progress {
          height: 3px; background: rgba(255,255,255,.2); margin-top: 12px; border-radius: 2px; overflow: hidden;
        }
        .terms-progress-fill {
          height: 100%; background: white; border-radius: 2px;
          transition: width .4s ease;
        }

        /* Nav tabs */
        .terms-nav {
          display: flex; gap: 0; overflow-x: auto; padding: 0 24px;
          border-bottom: 1px solid #F0F0F2; background: #FAFAFA;
          flex-shrink: 0;
        }
        .terms-nav::-webkit-scrollbar { display: none; }
        .terms-tab {
          padding: 10px 14px; font-size: .72rem; font-weight: 600;
          white-space: nowrap; border: none; background: none;
          color: #6E6E73; cursor: pointer; transition: .2s;
          border-bottom: 2px solid transparent;
          font-family: 'Poppins', -apple-system, sans-serif;
        }
        .terms-tab:hover { color: #4F46E5; }
        .terms-tab.active {
          color: #4F46E5; border-bottom-color: #4F46E5;
        }

        /* Content */
        .terms-content {
          flex: 1; overflow-y: auto; padding: 24px;
        }
        .terms-content::-webkit-scrollbar { width: 4px; }
        .terms-content::-webkit-scrollbar-thumb { background: #D2D2D7; border-radius: 2px; }

        .terms-section { animation: keyterms-fadeIn .3s ease; }
        .terms-section-title {
          font-size: 1rem; font-weight: 700; color: #1D1D1F;
          margin: 0 0 12px; font-family: 'Poppins', -apple-system, sans-serif;
        }
        .terms-section-text {
          font-size: .9rem; color: #4B5563; line-height: 1.75;
          font-family: 'Poppins', -apple-system, sans-serif;
        }

        /* Footer */
        .terms-footer {
          padding: 16px 24px; border-top: 1px solid #F0F0F2;
          background: #FAFAFA; flex-shrink: 0;
        }

        .terms-checkbox {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px; background: white; border-radius: 12px;
          border: 2px solid #E5E7EB; margin-bottom: 14px;
          cursor: pointer; transition: .2s;
        }
        .terms-checkbox:hover { border-color: #4F46E5; }
        .terms-checkbox.checked {
          border-color: #4F46E5; background: rgba(79,70,229,.04);
        }

        .terms-checkbox-box {
          width: 22px; height: 22px; border-radius: 6px;
          border: 2px solid #D2D2D7; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: .2s; margin-top: 1px;
        }
        .terms-checkbox.checked .terms-checkbox-box {
          background: #4F46E5; border-color: #4F46E5;
        }
        .terms-checkbox-box svg {
          opacity: 0; transform: scale(.5); transition: .2s;
        }
        .terms-checkbox.checked .terms-checkbox-box svg {
          opacity: 1; transform: scale(1);
        }

        .terms-checkbox-label {
          font-size: .85rem; color: #1D1D1F; font-weight: 500;
          font-family: 'Poppins', -apple-system, sans-serif; line-height: 1.4;
        }

        .terms-actions {
          display: flex; gap: 10px;
        }
        .terms-btn {
          flex: 1; padding: 13px 20px; border-radius: 12px;
          font-family: 'Poppins', -apple-system, sans-serif;
          font-size: .9rem; font-weight: 700; cursor: pointer;
          transition: .2s; border: none; text-align: center;
        }
        .terms-btn-decline {
          background: #F5F5F7; color: #6E6E73;
        }
        .terms-btn-decline:hover { background: #FEE2E2; color: #FF3B30; }
        .terms-btn-accept {
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          color: white; box-shadow: 0 2px 8px rgba(79,70,229,.25);
        }
        .terms-btn-accept:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(79,70,229,.35);
        }
        .terms-btn-accept:disabled {
          opacity: .4; cursor: not-allowed; transform: none;
          box-shadow: none;
        }
      `}</style>

      <div className="terms-overlay">
        <div className="terms-card">

          {/* Header */}
          <div className="terms-header">
            <h2>📋 Conditions d'Utilisation</h2>
            <p>Veuillez lire et accepter nos conditions pour continuer</p>
            <div className="terms-progress">
              <div
                className="terms-progress-fill"
                style={{ width: `${((section + 1) / TERMS_TEXT.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Nav */}
          <div className="terms-nav">
            {TERMS_TEXT.map((t, i) => (
              <button
                key={i}
                className={`terms-tab${section === i ? ' active' : ''}`}
                onClick={() => setSection(i)}
              >
                {t.title.split('.')[0]}
              </button>
            ))}
          </div>

          {/* Content */}
          <div
            className="terms-content"
            onScroll={e => {
              const el = e.target;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                setScrollRead(true);
              }
            }}
          >
            <div className="terms-section">
              <h3 className="terms-section-title">{TERMS_TEXT[section].title}</h3>
              <p className="terms-section-text">{TERMS_TEXT[section].content}</p>
            </div>

            {section < TERMS_TEXT.length - 1 && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button
                  onClick={() => setSection(s => s + 1)}
                  style={{
                    padding: '10px 24px', background: '#4F46E5', color: 'white',
                    border: 'none', borderRadius: 10, fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600, fontSize: '.85rem', cursor: 'pointer',
                  }}
                >
                  Section suivante →
                </button>
              </div>
            )}

            {section === TERMS_TEXT.length - 1 && (
              <div style={{
                marginTop: 24, padding: '16px 20px', background: 'rgba(79,70,229,.06)',
                borderRadius: 12, border: '1px solid rgba(79,70,229,.15)',
              }}>
                <p style={{
                  fontSize: '.82rem', color: '#4F46E5', fontWeight: 600,
                  margin: 0, fontFamily: 'Poppins, sans-serif',
                }}>
                  ℹ️ Vous avez atteint la fin des conditions. Veuillez les accepter ou refuser ci-dessous.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="terms-footer">
            <div
              className={`terms-checkbox${agreed ? ' checked' : ''}`}
              onClick={() => setAgreed(a => !a)}
            >
              <div className="terms-checkbox-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="terms-checkbox-label">
                J'ai lu et j'accepte les conditions d'utilisation d'OdaMarket
              </span>
            </div>

            <div className="terms-actions">
              <button className="terms-btn terms-btn-decline" onClick={onDecline}>
                Refuser
              </button>
              <button
                className="terms-btn terms-btn-accept"
                disabled={!agreed}
                onClick={handleContinue}
              >
                Accepter et continuer
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
