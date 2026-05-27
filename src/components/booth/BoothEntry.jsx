import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';

export default function BoothEntry() {
  const { setStep } = useBooth();
  const [loadingText, setLoadingText] = useState('Opening curtain...');

  useEffect(() => {
    const t1 = setTimeout(() => setLoadingText('Powering on camera...'), 1200);
    const t2 = setTimeout(() => setLoadingText('Ready.'), 2400);
    const t3 = setTimeout(() => setStep('select'), 3000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setStep]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '40px', marginBottom: '24px',
        boxShadow: 'var(--shadow-glow-pink)',
        animation: 'pulse-glow 2s infinite',
      }}>
        📷
      </div>
      <h2 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '2rem', color: 'var(--text-primary)',
        marginBottom: '12px',
      }}>
        Entering Booth
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ width: '16px', height: '16px', border: '2px solid var(--accent-pink)', borderTopColor: 'transparent', borderRadius: '50%' }}
        />
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.85rem' }}>{loadingText}</span>
      </div>
    </motion.div>
  );
}
