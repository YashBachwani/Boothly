import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { PHOTO_COUNTS } from '../../constants';

export default function PhotoCountSelector() {
  const { setPhotoCount, setStep } = useBooth();

  const handleSelect = (count) => {
    setPhotoCount(count);
    setStep('camera');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <h2 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        color: 'var(--text-primary)',
        marginBottom: '12px', textAlign: 'center',
      }}>
        Choose your <span className="gradient-text">strip</span>
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', textAlign: 'center' }}>
        How many photos do you want to capture?
      </p>

      <div style={{
        display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {PHOTO_COUNTS.map((opt, i) => (
          <motion.div
            key={opt.count}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(opt.count)}
            className="glass-card"
            style={{
              padding: '24px', width: '180px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              cursor: 'pointer',
              border: '2px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-pink)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            {/* Strip visualizer */}
            <div style={{
              width: '60px', background: 'var(--bg-primary)',
              padding: '6px', borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              marginBottom: '20px',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              {Array.from({ length: opt.count }).map((_, j) => (
                <div key={j} style={{
                  width: '100%', aspectRatio: '4/3',
                  background: 'var(--bg-secondary)', borderRadius: '2px',
                }} />
              ))}
            </div>

            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {opt.desc}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
