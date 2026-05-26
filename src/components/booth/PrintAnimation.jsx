import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { useAudio } from '../../hooks/useAudio';

export default function PrintAnimation() {
  const { setStep } = useBooth();
  const { playPrint } = useAudio();
  const [text, setText] = useState('Developing...');

  useEffect(() => {
    playPrint();
    const t1 = setTimeout(() => setText('Printing your memories...'), 1500);
    const t2 = setTimeout(() => setText('Almost ready...'), 3500);
    const t3 = setTimeout(() => setStep('customize'), 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [setStep, playPrint]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Printer slot line */}
      <div style={{
        position: 'absolute', top: '20%', width: '300px', height: '4px',
        background: '#000', borderRadius: '4px',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.2)'
      }} />

      {/* Animated Strip sliding down */}
      <motion.div
        initial={{ y: '-70%', clipPath: 'inset(100% 0 0 0)' }}
        animate={{ y: '10%', clipPath: 'inset(0 0 0 0)' }}
        transition={{ duration: 4.5, ease: 'linear' }}
        style={{
          width: '180px', height: '500px',
          background: '#fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          padding: '12px', gap: '8px', zIndex: 5,
        }}
      >
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, background: '#eee', borderRadius: '2px' }} />
        ))}
      </motion.div>

      {/* Status Text */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: '20%',
          fontFamily: 'Space Mono, monospace',
          color: 'var(--text-muted)', fontSize: '1.1rem',
        }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}
