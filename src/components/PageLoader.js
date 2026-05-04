'use client';

export default function PageLoader({ text = 'Chargement...' }) {
  return (
    <div className="oda-loader-root">
      <div className="oda-loader-spinner" />
      <p className="oda-loader-label">{text}</p>
      <style jsx>{`
        .oda-loader-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(242, 242, 247, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: odaLoaderFadeIn 0.25s ease;
        }
        .oda-loader-spinner {
          width: 32px;
          height: 32px;
          border: 2.5px solid rgba(0, 122, 255, 0.15);
          border-top-color: #007AFF;
          border-radius: 50%;
          animation: odaLoaderSpin 0.85s linear infinite;
        }
        .oda-loader-label {
          margin-top: 14px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #8E8E93;
          letter-spacing: 0.02em;
        }
        @keyframes odaLoaderSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes odaLoaderFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
