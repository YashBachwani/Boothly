import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3 seconds total loading for maximum cinematic effect
    const duration = 3000;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Easing out the progress
      const rawProgress = currentStep / steps;
      // standard easeOutQuad
      const easedProgress = 1 - (1 - rawProgress) * (1 - rawProgress);
      setProgress(Math.min(easedProgress * 100, 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => setLoading(false), 400); // Small pause at 100%
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader-wrapper"
          style={{
            position: 'fixed', inset: 0,
            zIndex: 9999, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Top Panel */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{
              flex: 1, background: '#0E0E0F',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden'
            }}
          >
             {/* Huge Marquee Text Top */}
             <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
              style={{
                position: 'absolute', bottom: '20px', left: 0,
                display: 'flex', whiteSpace: 'nowrap',
                fontSize: '8rem', fontFamily: 'Playfair Display, serif',
                fontWeight: 900, color: 'transparent',
                WebkitTextStroke: '2px rgba(255,107,157,0.1)',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              BOOTHLY ✦ BOOTHLY ✦ BOOTHLY ✦ BOOTHLY ✦ 
            </motion.div>
          </motion.div>

          {/* Bottom Panel */}
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{
              flex: 1, background: '#0E0E0F',
              position: 'relative', overflow: 'hidden'
            }}
          >
             {/* Huge Marquee Text Bottom */}
             <motion.div
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
              style={{
                position: 'absolute', top: '20px', left: 0,
                display: 'flex', whiteSpace: 'nowrap',
                fontSize: '8rem', fontFamily: 'Playfair Display, serif',
                fontWeight: 900, color: 'transparent',
                WebkitTextStroke: '2px rgba(181,147,255,0.1)',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              STUDIO ✦ STUDIO ✦ STUDIO ✦ STUDIO ✦ 
            </motion.div>
          </motion.div>

          {/* Floating Polaroids */}
          <FloatingPolaroid src="https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=300&auto=format&fit=crop" delay={0.2} x="15%" y="20%" rotate={-15} />
          <FloatingPolaroid src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300&auto=format&fit=crop" delay={0.8} x="75%" y="60%" rotate={20} />
          <FloatingPolaroid src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" delay={1.4} x="20%" y="70%" rotate={10} />

          {/* Center Glass Orb */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2.5, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px', height: '300px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,107,157,0.2)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 10
            }}
          >
            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute', inset: -1, borderRadius: '50%',
                border: '1px solid var(--accent-pink)', pointerEvents: 'none'
              }}
            />
            
            <img src="/favicon.png" alt="Logo" style={{ width: '40px', height: '40px', marginBottom: '16px', borderRadius: '8px' }} />
            
            <div style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '4.5rem', fontWeight: 600,
              color: '#FFF', lineHeight: 1,
              background: 'linear-gradient(135deg, #FFF, var(--accent-lavender))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {Math.floor(progress)}<span style={{ fontSize: '2rem' }}>%</span>
            </div>
            <div style={{
              fontFamily: 'Space Mono, monospace', fontSize: '0.8rem',
              color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em',
              marginTop: '12px'
            }}>
              Initializing
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FloatingPolaroid({ src, delay, x, y, rotate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100, rotate: rotate - 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, rotate: rotate, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', top: y, left: x,
        width: '140px', height: '170px',
        background: '#FFF', padding: '10px 10px 30px 10px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        zIndex: 5, pointerEvents: 'none'
      }}
    >
      <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#DDD' }} alt="polaroid" />
    </motion.div>
  );
}
