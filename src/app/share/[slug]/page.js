'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ShareRedirectPage({ params }) {
  const router = useRouter();
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const s = params?.slug;
    if (s) {
      setSlug(s);
      router.replace(`/dashboard/boutique?shop=${s}`);
    }
  }, [params?.slug, router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Poppins, sans-serif',
      background: '#F5F5F7',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '12px',
          animation: 'shareSpin 1s linear infinite',
        }}>🏪</div>
        <p style={{ color: '#6E6E73', fontSize: '0.95rem' }}>
          Redirection vers la boutique{slug ? ` ${slug}` : ''}...
        </p>
      </div>
      <style>{`
        @keyframes shareSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
