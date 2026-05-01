'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import TermsModal from '@/components/TermsModal';

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  'https://xjckbqbqxcwzcrlmuvzf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqY2ticWJxeGN3emNybG11dnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk1MzMsImV4cCI6MjA3NjA5NTUzM30.AMzAUwtjFt7Rvof5r2enMyYIYToc1wNWWEjvZqK_YXM'
);

// ── Composant Modal "Mot de passe oublié" (remplace le prompt() natif) ─────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Veuillez entrer une adresse email valide'); return; }

    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (err) throw err;
      setMessage('Un email de réinitialisation a été envoyé à ' + email);
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email de réinitialisation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>Mot de passe oublié</h2>
        {message ? (
          <>
            <p className="modal-success">{message}</p>
            <button className="btn" onClick={onClose}>Fermer</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <i className="bx bxs-envelope"></i>
            </div>
            {error && <p className="modal-error">{error}</p>}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? <><i className="bx bx-loader bx-spin"></i> Envoi...</> : 'Envoyer le lien'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ marginTop: 10 }}>
              Annuler
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ConnexionPage() {
  const router = useRouter();

  // État du panneau actif : false = login, true = register
  const [isActive, setIsActive]           = useState(false);

  // Champs login
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);
  const [showLoginPwd, setShowLoginPwd]   = useState(false);

  // Champs register
  const [regUsername, setRegUsername]     = useState('');
  const [regEmail, setRegEmail]           = useState('');
  const [regPassword, setRegPassword]     = useState('');
  const [regLoading, setRegLoading]       = useState(false);
  const [showRegPwd, setShowRegPwd]       = useState(false);

  // Modal mot de passe oublié
  const [showForgot, setShowForgot]       = useState(false);

  // Conditions d'utilisation
  const [showTerms, setShowTerms]         = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ── Vérifier si déjà connecté ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('✅ Utilisateur déjà connecté, redirection...');
        router.replace('/dashboard');
      }
    });
  }, [router]);

  // ── Vérifier l'acceptation des CGU ─────────────────────────────────────────
  useEffect(() => {
    const accepted = typeof window !== 'undefined' && localStorage.getItem('oda_terms_accepted') === 'true';
    setTermsAccepted(accepted);
    if (!accepted) {
      setShowTerms(true);
    }
  }, []);

  function handleTermsAccept() {
    localStorage.setItem('oda_terms_accepted', 'true');
    setTermsAccepted(true);
    setShowTerms(false);
  }

  function handleTermsDecline() {
    router.push('/');
  }

  // ── Connexion email/mot de passe ───────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    if (!termsAccepted) { setShowTerms(true); return; }
    if (!loginEmail || !loginPassword) { alert('Veuillez remplir tous les champs'); return; }

    setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;

      console.log('✅ Connexion réussie:', data);
      const redirect = sessionStorage.getItem('oda_redirect_after_login') || '/dashboard';
      sessionStorage.removeItem('oda_redirect_after_login');
      router.replace(redirect);

    } catch (err) {
      console.error('Erreur de connexion:', err);
      alert("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setLoginLoading(false);
    }
  }

  // ── Inscription ────────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    if (!termsAccepted) { setShowTerms(true); return; }
    if (!regUsername || !regEmail || !regPassword) { alert('Veuillez remplir tous les champs'); return; }

    setRegLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { name: regUsername, display_name: regUsername },
        },
      });
      if (error) throw error;

      alert('Inscription réussie ! Redirection...');
      router.replace('/dashboard');

    } catch (err) {
      console.error('Détails erreur inscription:', err);
      let msg = err.message;
      if (msg.includes('already registered')) msg = 'Cet email est déjà utilisé.';
      alert('Erreur : ' + msg);
    } finally {
      setRegLoading(false);
    }
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────
  async function handleGoogleLogin(e) {
    e.preventDefault();
    if (!termsAccepted) { setShowTerms(true); return; }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Erreur Google:', err);
      alert('Erreur lors de la connexion avec Google');
    }
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Boxicons CDN */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }

        body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
        }

        /* ── Conteneur principal ── */
        .container {
          position: relative;
          width: 650px;
          height: 450px;
          background: #fff;
          border-radius: 30px;
          box-shadow: 0 0 30px rgba(0, 0, 0, .2);
          overflow: hidden;
          margin: 20px;
        }

        /* ── Boîtes de formulaire ── */
        .form-box {
          position: absolute;
          right: 0;
          width: 50%;
          height: 100%;
          background: #fff;
          display: flex;
          align-items: center;
          color: #333;
          text-align: center;
          padding: 40px;
          z-index: 1;
          transition: .6s ease-in-out 1.2s, visibility 0s 1s;
        }

        .container.active .form-box { right: 50%; }

        .form-box.register { visibility: hidden; }
        .container.active .form-box.register { visibility: visible; }

        form { width: 100%; }

        .container h1 { font-size: 30px; margin: -10px 0; }

        /* ── Champs input ── */
        .input-box { position: relative; margin: 30px 0; }

        .input-box input {
          width: 100%;
          padding: 13px 50px 13px 20px;
          background: #eee;
          border-radius: 8px;
          border: none;
          outline: none;
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        .input-box input::placeholder { color: #888; font-weight: 400; }

        .input-box i {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: #888;
        }

        .input-box .toggle-password {
          right: 50px;
          cursor: pointer;
        }

        /* ── Mot de passe oublié ── */
        .forgot-link { margin: -15px 0 15px; }
        .forgot-link a { font-size: 14.5px; color: #333; text-decoration: none; cursor: pointer; }
        .forgot-link a:hover { color: #7494ec; }

        /* ── Bouton principal ── */
        .btn {
          width: 100%;
          height: 40px;
          background: #7494ec;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, .1);
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #fff;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity .2s;
        }
        .btn:hover { opacity: .9; }
        .btn:disabled { opacity: .6; cursor: not-allowed; }
        .btn-outline {
          background: transparent;
          border: 2px solid #7494ec;
          color: #7494ec;
        }
        .btn-outline:hover { background: #f0f4ff; }

        .container p { font-size: 14.5px; margin: 15px 0; }

        /* ── Bouton Google ── */
        .social-icons { display: flex; justify-content: center; }

        .google-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border: 2px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
          color: #333;
          text-decoration: none;
          background: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
          gap: 8px;
        }
        .google-btn:hover { border-color: #7494ec; background: #f8f9ff; }
        .google-btn i { font-size: 24px; }

        /* ── Toggle box (panneau animé) ── */
        .toggle-box {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .toggle-box::before {
          content: '';
          position: absolute;
          left: -250%;
          width: 300%;
          height: 100%;
          background: #7494ec;
          border-radius: 150px;
          z-index: 2;
          transition: 1.8s ease-in-out;
        }

        .container.active .toggle-box::before { left: 50%; }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 2;
        }

        .toggle-panel.toggle-left {
          left: 0;
          transition-delay: 1.2s;
        }
        .container.active .toggle-panel.toggle-left {
          left: -50%;
          transition-delay: .6s;
        }

        .toggle-panel.toggle-right {
          right: -50%;
          transition-delay: .6s;
        }
        .container.active .toggle-panel.toggle-right {
          right: 0;
          transition-delay: 1.2s;
        }

        .toggle-panel p { margin-bottom: 20px; }

        .toggle-panel .btn {
          width: 160px;
          height: 30px;
          background: transparent;
          border: 2px solid #fff;
          box-shadow: none;
        }
        .toggle-panel .btn:hover { background: rgba(255,255,255,.15); }

        /* ── Modal mot de passe oublié ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn .2s ease;
        }

        .modal-box {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          width: 360px;
          max-width: 90vw;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: popIn .25s ease;
        }

        .modal-box h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
        }

        .modal-success {
          color: #34C759;
          font-size: 0.9rem;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .modal-error {
          color: #FF3B30;
          font-size: 0.85rem;
          margin: -10px 0 10px;
          text-align: left;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn  { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* ── Responsive ── */
        @media screen and (max-width: 600px) {
          .container {
            width: 600px;
            height: calc(100vh + 65px);
          }
          .form-box {
            bottom: 0;
            width: 100%;
            height: 70%;
          }
          .container.active .form-box {
            right: 0;
            bottom: 30%;
          }
          .toggle-box::before {
            left: 0;
            top: -270%;
            width: 100%;
            height: 300%;
            border-radius: 20vw;
          }
          .container.active .toggle-box::before {
            left: 0;
            top: 70%;
          }
          .toggle-panel {
            width: 100%;
            height: 30%;
          }
          .toggle-panel.toggle-left { top: 0; }
          .container.active .toggle-panel.toggle-left {
            left: 0;
            top: -30%;
          }
          .toggle-panel.toggle-right {
            right: 0;
            bottom: -30%;
          }
          .container.active .toggle-panel.toggle-right {
            bottom: 0;
          }
        }

        @media screen and (max-width: 400px) {
          .form-box { padding: 20px; }
          .toggle-panel h1 { font-size: 25px; }
        }
      `}</style>

      {/* ── Page ── */}
      <div className={`container${isActive ? ' active' : ''}`}>

        {/* ════ FORMULAIRE LOGIN ════ */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="text"
                id="loginUsername"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type={showLoginPwd ? 'text' : 'password'}
                id="loginPassword"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
              />
              <i className="bx bxs-lock-alt"></i>
              <i
                className={`bx ${showLoginPwd ? 'bx-show' : 'bx-hide'} toggle-password`}
                onClick={() => setShowLoginPwd(p => !p)}
              ></i>
            </div>

            <div className="forgot-link">
              <a onClick={() => setShowForgot(true)}>Forgot password?</a>
            </div>

            <button type="submit" className="btn" disabled={loginLoading}>
              {loginLoading
                ? <><i className="bx bx-loader bx-spin"></i> Connexion...</>
                : 'Login'
              }
            </button>

            <p style={{ fontSize: '12px', margin: '10px 0 0' }}>
              En vous connectant, vous acceptez nos{' '}
              <a style={{ color: '#7494ec', cursor: 'pointer' }} onClick={() => setShowTerms(true)}>
                conditions d&apos;utilisation
              </a>
            </p>

            <p>or login with</p>

            <div className="social-icons">
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <i className="bx bxl-google"></i>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* ════ FORMULAIRE REGISTER ════ */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

            <div className="input-box">
              <input
                type="text"
                id="registerUsername"
                placeholder="Username"
                required
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                id="registerEmail"
                placeholder="Email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type={showRegPwd ? 'text' : 'password'}
                id="registerPassword"
                placeholder="Password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
              />
              <i className="bx bxs-lock-alt"></i>
              <i
                className={`bx ${showRegPwd ? 'bx-show' : 'bx-hide'} toggle-password`}
                onClick={() => setShowRegPwd(p => !p)}
              ></i>
            </div>

            <button type="submit" className="btn" disabled={regLoading}>
              {regLoading
                ? <><i className="bx bx-loader bx-spin"></i> Inscription...</>
                : 'Register'
              }
            </button>

            <p style={{ fontSize: '12px', margin: '10px 0 0' }}>
              En vous inscrivant, vous acceptez nos{' '}
              <a style={{ color: '#7494ec', cursor: 'pointer' }} onClick={() => setShowTerms(true)}>
                conditions d&apos;utilisation
              </a>
            </p>

            <p>or register with</p>

            <div className="social-icons">
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <i className="bx bxl-google"></i>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>

        {/* ════ PANNEAU TOGGLE ANIMÉ ════ */}
        <div className="toggle-box">
          {/* Gauche → invite à s'inscrire */}
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don&apos;t have an account?</p>
            <button
              type="button"
              className="btn register-btn"
              onClick={() => setIsActive(true)}
            >
              Register
            </button>
          </div>

          {/* Droite → invite à se connecter */}
          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              type="button"
              className="btn login-btn"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* ════ MODAL MOT DE PASSE OUBLIÉ ════ */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      {/* ════ MODAL CONDITIONS D'UTILISATION ════ */}
      {showTerms && <TermsModal onAccept={handleTermsAccept} onDecline={handleTermsDecline} />}
    </>
  );
}