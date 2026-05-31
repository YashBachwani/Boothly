import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';

const SOURCES = [
  {
    id: 'camera',
    icon: '📷',
    iconClass: 'camera-icon',
    title: 'Capture New Memories',
    desc: 'Use your camera to take live photos in the booth',
    step: 'camera',
  },
  {
    id: 'gallery',
    icon: '🖼️',
    iconClass: 'gallery-icon',
    title: 'Create From Memories',
    desc: 'Upload photos from your device gallery',
    step: 'upload',
  },
];

export default function SourceSelector() {
  const { setCaptureMode, setStep, photoCount } = useBooth();

  const handleSelect = (source) => {
    setCaptureMode(source.id);
    setStep(source.step);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Decorative floating elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '8%', right: '12%',
          fontSize: '3rem', opacity: 0.08, pointerEvents: 'none',
        }}
      >✦</motion.div>
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', bottom: '12%', left: '10%',
          fontSize: '2.5rem', opacity: 0.06, pointerEvents: 'none',
        }}
      >◈</motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', top: '20%', left: '8%',
          fontSize: '2rem', opacity: 0.05, pointerEvents: 'none',
        }}
      >♡</motion.div>

      {/* Back button */}
      <motion.button
        className="btn btn-ghost btn-sm"
        onClick={() => setStep('select')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '0.8rem' }}
      >
        ← Back
      </motion.button>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <div className="pill" style={{ marginBottom: '16px' }}>
          {photoCount} photos selected
        </div>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          How would you <span className="gradient-text">like to start?</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px' }}>
          Take fresh photos with your camera or upload existing ones from your gallery
        </p>
      </motion.div>

      {/* Source Cards */}
      <div className="source-cards-wrapper">
        {SOURCES.map((source, i) => (
          <motion.div
            key={source.id}
            className="source-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(source)}
          >
            <motion.div
              className={`source-card-icon ${source.iconClass}`}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
            >
              {source.icon}
            </motion.div>
            <div className="source-card-title">{source.title}</div>
            <div className="source-card-desc">{source.desc}</div>

            {/* Subtle shimmer line */}
            <motion.div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, transparent, var(--accent-pink), var(--accent-lavender), transparent)',
                opacity: 0,
              }}
              whileHover={{ opacity: 0.6 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
