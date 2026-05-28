import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { generateEnhancedPreview } from '../../utils/imageEnhancement';

const ENHANCEMENT_LIST = [
  { id: 'autoBrightness',  label: 'Auto Brightness',   icon: '☀️',  desc: 'Balance exposure' },
  { id: 'autoContrast',    label: 'Smart Contrast',     icon: '◑',   desc: 'Deepen richness' },
  { id: 'skinSmoothing',   label: 'Skin Smoothing',     icon: '✨',  desc: 'Natural softening' },
  { id: 'noiseReduction',  label: 'Noise Reduction',    icon: '🌫️', desc: 'Remove grain' },
  { id: 'colorEnhance',    label: 'Color Enhance',      icon: '🎨',  desc: 'Vivid & warm' },
  { id: 'portraitBlur',    label: 'Portrait Blur',      icon: '🌸',  desc: 'Soft background' },
];

function Toggle({ checked, onChange }) {
  return (
    <motion.button
      onClick={onChange}
      animate={{ backgroundColor: checked ? 'var(--accent-pink-deep)' : 'rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
      style={{
        width: '38px', height: '22px', borderRadius: '99px',
        cursor: 'pointer', position: 'relative',
        border: 'none', flexShrink: 0, padding: 0,
      }}
      aria-pressed={checked}
    >
      <motion.div
        animate={{ x: checked ? 17 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute', top: '3px',
          width: '16px', height: '16px',
          borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </motion.button>
  );
}

export default function AIEnhancementPanel({ inline = false }) {
  const {
    photos, setPhotos,
    originalPhotos, setOriginalPhotos,
    enhancements, setEnhancements,
    enhancementIntensity, setEnhancementIntensity,
    enhancementsEnabled, setEnhancementsEnabled,
  } = useBooth();

  const [expanded, setExpanded] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState(null); // { original, enhanced }
  const [showBefore, setShowBefore] = useState(false);
  const [applying, setApplying] = useState(false);
  const debounceRef = useRef(null);

  const activeCount = Object.values(enhancements).filter(Boolean).length;

  // Generate preview when enhancements/intensity change
  useEffect(() => {
    if (!expanded || !photos.length) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const result = await generateEnhancedPreview(photos[0], enhancements, enhancementIntensity);
        setPreviewData(result);
      } finally {
        setPreviewing(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [expanded, enhancements, enhancementIntensity, photos]);

  const handleApply = async () => {
    // If no photos taken yet (e.g. configuring enhancements on the camera view)
    if (photos.length === 0) {
      setEnhancementsEnabled(true);
      setExpanded(false);
      return;
    }

    if (applying) return;
    setApplying(true);
    try {
      // Use originalPhotos as pristine base to avoid compounded enhancements
      const basePhotos = originalPhotos && originalPhotos.length > 0 ? originalPhotos : photos;
      
      const enhanced = await Promise.all(
        basePhotos.map(async (dataUrl) => {
          const { enhanced } = await generateEnhancedPreview(dataUrl, enhancements, enhancementIntensity);
          return enhanced;
        })
      );
      
      if (!originalPhotos || originalPhotos.length === 0) {
        setOriginalPhotos(basePhotos);
      }
      
      setPhotos(enhanced);
      setEnhancementsEnabled(true);
      setExpanded(false);
    } catch (e) {
      console.error('AI Enhancement apply failed:', e);
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    if (originalPhotos && originalPhotos.length > 0) {
      setPhotos(originalPhotos);
    }
    const cleared = {};
    ENHANCEMENT_LIST.forEach(e => { cleared[e.id] = false; });
    setEnhancements(cleared);
    setEnhancementsEnabled(false);
    setExpanded(false);
  };

  const toggleAll = () => {
    const allOn = activeCount === ENHANCEMENT_LIST.length;
    const next = {};
    ENHANCEMENT_LIST.forEach(e => { next[e.id] = !allOn; });
    setEnhancements(next);
  };

  return (
    <div style={inline ? { width: '100%' } : { position: 'relative' }}>
      {/* Trigger button */}
      <motion.button
        className="btn btn-ghost btn-sm"
        onClick={() => setExpanded(e => !e)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: inline ? 'space-between' : 'center',
          width: inline ? '100%' : 'auto',
          padding: inline ? '12px 16px' : '8px 12px',
          borderRadius: inline ? '10px' : '99px',
          border: inline ? '1.5px solid var(--border-subtle)' : 'none',
          background: inline ? 'var(--bg-glass)' : 'transparent',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🤖</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {inline ? 'AI Enhance Options' : 'Enhance'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeCount > 0 && inline && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '20px',
              background: enhancementsEnabled ? 'var(--accent-neon)' : 'var(--accent-pink-deep)',
              fontSize: '0.68rem',
              color: '#000',
              fontWeight: 800,
            }}>
              {activeCount} active
            </span>
          )}
          {inline && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{expanded ? '▲' : '▼'}</span>}
        </div>
        
        {activeCount > 0 && !inline && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: '-5px', right: '-5px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: enhancementsEnabled ? 'var(--accent-neon)' : 'var(--accent-pink-deep)',
              fontSize: '0.6rem', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            {activeCount}
          </motion.span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={inline ? {
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              zIndex: 10,
              boxSizing: 'border-box',
            } : {
              position: 'absolute',
              bottom: 'calc(100% + 10px)',
              right: '0',
              zIndex: 200,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              boxShadow: 'var(--shadow-lg)',
              width: 'min(320px, 92vw)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🤖</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>AI Enhance</span>
              </div>
              <button
                onClick={toggleAll}
                style={{
                  fontSize: '0.7rem', background: 'none', border: 'none',
                  color: 'var(--accent-pink-deep)', cursor: 'pointer', fontWeight: 700,
                }}
              >
                {activeCount === ENHANCEMENT_LIST.length ? 'All Off' : 'All On'}
              </button>
            </div>

            {/* Before/After Preview */}
            {photos.length > 0 && (
              <div style={{ marginBottom: '14px', position: 'relative' }}>
                <div style={{
                  borderRadius: '10px', overflow: 'hidden', position: 'relative',
                  aspectRatio: '4/3', background: '#000',
                }}>
                  {previewing && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 5,
                      background: 'rgba(0,0,0,0.5)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: '20px', height: '20px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }}
                      />
                    </div>
                  )}
                  {previewData && (
                    <img
                      src={showBefore ? previewData.original : previewData.enhanced}
                      alt={showBefore ? 'Original' : 'Enhanced'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.25s' }}
                    />
                  )}
                  {!previewData && !previewing && (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem',
                    }}>
                      Take photos to preview
                    </div>
                  )}

                  {/* Before/After badge */}
                  {previewData && (
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      background: showBefore ? 'rgba(0,0,0,0.7)' : 'var(--accent-pink-deep)',
                      color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                      padding: '3px 8px', borderRadius: '99px',
                      letterSpacing: '0.05em',
                    }}>
                      {showBefore ? 'BEFORE' : 'AFTER'}
                    </div>
                  )}
                </div>

                {/* Toggle before/after */}
                {previewData && (
                  <button
                    onPointerDown={() => setShowBefore(true)}
                    onPointerUp={() => setShowBefore(false)}
                    onPointerLeave={() => setShowBefore(false)}
                    style={{
                      width: '100%', marginTop: '6px',
                      padding: '6px', borderRadius: '8px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Hold to see Before
                  </button>
                )}
              </div>
            )}

            {/* Enhancement toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {ENHANCEMENT_LIST.map(e => (
                <motion.div
                  key={e.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setEnhancements({ ...enhancements, [e.id]: !enhancements[e.id] })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '7px 10px', borderRadius: '10px',
                    cursor: 'pointer',
                    background: enhancements[e.id] ? 'rgba(212,112,138,0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{e.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{e.label}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{e.desc}</div>
                  </div>
                  <Toggle
                    checked={!!enhancements[e.id]}
                    onChange={e2 => { e2.stopPropagation(); setEnhancements({ ...enhancements, [e.id]: !enhancements[e.id] }); }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Intensity slider */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Enhancement Strength
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-pink-deep)', fontWeight: 700 }}>
                  {Math.round(enhancementIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0" max="100" step="1"
                value={Math.round(enhancementIntensity * 100)}
                onChange={e => setEnhancementIntensity(parseFloat(e.target.value) / 100)}
                style={{ width: '100%', accentColor: 'var(--accent-pink-deep)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>Subtle</span>
                <span>Natural</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying || activeCount === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem', opacity: activeCount === 0 ? 0.5 : 1 }}
              >
                {applying ? (
                  <span className="dot-loader" style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <span /><span /><span />
                  </span>
                ) : (
                  '✨ Apply'
                )}
              </motion.button>
              {enhancementsEnabled && (
                <motion.button
                  className="btn btn-ghost btn-sm"
                  onClick={handleReset}
                  whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 14px', fontSize: '0.82rem' }}
                >
                  Reset
                </motion.button>
              )}
            </div>

            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', lineHeight: 1.4 }}>
              Applies to all {photos.length} photo{photos.length !== 1 ? 's' : ''}. Enhancement is subtle and natural.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
