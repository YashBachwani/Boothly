import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { useAudio } from '../../hooks/useAudio';

const MESSAGES = [
  { text: '📷 Developing your photos…', delay: 0 },
  { text: '🎞️ Processing film…', delay: 1600 },
  { text: '✨ Adding final touches…', delay: 3200 },
  { text: '🖨️ Ready to print!', delay: 4400 },
];

export default function PrintAnimation() {
  const { setStep, photoCount } = useBooth();
  const { playPrint } = useAudio();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    playPrint();

    // Progress bar animation
    const start = Date.now();
    const totalMs = 5200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / totalMs) * 100));
    }, 50);

    // Message rotation
    const timers = MESSAGES.slice(1).map((m, i) =>
      setTimeout(() => setMsgIndex(i + 1), m.delay)
    );

    const done = setTimeout(() => setStep('customize'), totalMs);

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [setStep, playPrint]);

  const photoSlots = Math.max(photoCount, 3);

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
        padding: '24px',
        gap: '32px',
      }}
    >
      {/* Background ambient glow */}
      <motion.div
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(195,177,225,0.08) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, rgba(212,112,138,0.12) 0%, transparent 70%)',
            'radial-gradient(circle at 50% 50%, rgba(195,177,225,0.08) 0%, transparent 70%)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Printer machine */}
      <div style={{ position: 'relative' }}>
        {/* Printer body */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
          style={{
            width: 'clamp(160px, 40vw, 220px)',
            height: '70px',
            background: 'linear-gradient(135deg, #2a2a2e, #1a1a1e)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* LED indicator */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: '#5EFFD8',
              boxShadow: '0 0 12px rgba(94,255,216,0.8)',
              position: 'absolute',
              right: '16px', top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          {/* Slot */}
          <div style={{
            width: 'calc(100% - 40px)', height: '6px',
            background: '#000',
            borderRadius: '3px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,1)',
          }} />
          {/* Printer logo */}
          <div style={{
            position: 'absolute',
            left: '14px',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.05em',
          }}>
            BOOTHLY
          </div>
        </motion.div>

        {/* Strip sliding out */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 5,
        }}>
          <motion.div
            initial={{ y: 0, height: 0 }}
            animate={{ y: 0, height: `${photoSlots * 68 + 40}px` }}
            transition={{ duration: 4.5, ease: 'linear' }}
            style={{
              width: 'clamp(100px, 25vw, 140px)',
              background: 'linear-gradient(180deg, #fff 0%, #FDFAF6 100%)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              display: 'flex', flexDirection: 'column',
              padding: '10px 10px 14px',
              gap: '6px',
              transformOrigin: 'top',
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: photoSlots }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * (4.5 / photoSlots), duration: 0.3 }}
                style={{
                  flex: 1,
                  minHeight: '50px',
                  background: 'linear-gradient(135deg, #e8d5c4, #d4bfb0)',
                  borderRadius: '2px',
                }}
              />
            ))}
            {/* Watermark line */}
            <div style={{
              height: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontSize: '7px', color: '#bbb',
                fontFamily: 'Space Mono, monospace',
                letterSpacing: '0.1em',
              }}>
                ✦ BOOTHLY
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Status messages */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '340px' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'Space Mono, monospace',
              color: 'var(--text-muted)',
              fontSize: 'clamp(0.82rem, 2.5vw, 1rem)',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {MESSAGES[msgIndex].text}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div style={{
          width: '100%', height: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-pink-deep), var(--accent-lavender), var(--accent-neon))',
              backgroundSize: '200% 100%',
              borderRadius: '99px',
              width: `${progress}%`,
            }}
            animate={{ backgroundPosition: ['0% center', '100% center', '0% center'] }}
            transition={{ backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' } }}
          />
        </div>

        <p style={{
          fontSize: '0.72rem', color: 'var(--text-muted)',
          opacity: 0.6, letterSpacing: '0.05em',
        }}>
          {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  );
}
