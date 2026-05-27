import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIRTUAL_BACKGROUNDS } from '../../constants/backgrounds';

export default function VirtualBackgroundPanel({ selected, onChange, disabled }) {
  const [expanded, setExpanded] = useState(false);

  const current = VIRTUAL_BACKGROUNDS.find(b => b.id === selected) || VIRTUAL_BACKGROUNDS[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Toggle trigger */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setExpanded(e => !e)}
        disabled={disabled}
        title="Virtual Backgrounds"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{ fontSize: '1rem' }}>{current.icon}</span>
        <span style={{ fontSize: '0.8rem', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current.name}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.7rem', opacity: 0.6 }}
        >
          ▼
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              boxShadow: 'var(--shadow-lg)',
              width: 'min(340px, 90vw)',
            }}
          >
            <p style={{
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
              color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              🖼️ Virtual Backgrounds
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
            }}>
              {VIRTUAL_BACKGROUNDS.map(bg => (
                <motion.button
                  key={bg.id}
                  onClick={() => { onChange(bg.id); setExpanded(false); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    border: selected === bg.id
                      ? '2px solid var(--accent-pink-deep)'
                      : '2px solid transparent',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                    background: 'transparent',
                    position: 'relative',
                  }}
                >
                  {/* Background preview swatch */}
                  <div style={{
                    height: '52px',
                    background: bg.css,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    position: 'relative',
                  }}>
                    {bg.id === 'none' && (
                      <div style={{
                        width: '100%', height: '100%',
                        background: 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, #eee 25%)',
                        backgroundSize: '12px 12px',
                        backgroundPosition: '0 0, 6px 6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>🎥</span>
                      </div>
                    )}
                    {bg.id !== 'none' && (
                      <span style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))', fontSize: '1.3rem' }}>
                        {bg.icon}
                      </span>
                    )}
                    {/* Active indicator */}
                    {selected === bg.id && (
                      <div style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: 'var(--accent-pink-deep)',
                        boxShadow: '0 0 6px rgba(212,112,138,0.8)',
                      }} />
                    )}
                  </div>
                  {/* Label */}
                  <div style={{
                    padding: '4px 6px',
                    background: selected === bg.id ? 'rgba(212,112,138,0.1)' : 'var(--bg-secondary)',
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {bg.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
