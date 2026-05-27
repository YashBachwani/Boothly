import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { WALLPAPERS, WALLPAPER_CATEGORIES } from '../../constants/wallpapers';

export default function WallpaperPanel() {
  const { stripWallpaper, setWallpaper } = useBooth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const current = WALLPAPERS.find(w => w.id === stripWallpaper) || WALLPAPERS[0];

  const visible = activeCategory === 'all'
    ? WALLPAPERS
    : WALLPAPERS.filter(w => w.category === activeCategory);

  return (
    <div style={{ marginBottom: '4px' }}>
      {/* Section header */}
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          width: '100%', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px 0', marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🖼️</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Strip Background
          </span>
          {stripWallpaper !== 'none' && (
            <span style={{
              fontSize: '0.65rem', padding: '2px 8px',
              borderRadius: '99px', background: 'var(--accent-pink-deep)',
              color: '#fff', fontWeight: 700,
            }}>
              {current.name}
            </span>
          )}
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Category tabs */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '2px' }}>
              {WALLPAPER_CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    flexShrink: 0,
                    padding: '4px 10px', borderRadius: '99px',
                    fontSize: '0.7rem', fontWeight: activeCategory === cat.id ? 700 : 500,
                    background: activeCategory === cat.id ? 'var(--accent-pink-deep)' : 'var(--bg-glass)',
                    color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '3px',
                  }}
                >
                  {cat.icon} {cat.label}
                </motion.button>
              ))}
            </div>

            {/* Wallpaper grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '2px',
            }} className="hide-scrollbar">
              {visible.map(wp => {
                const isActive = stripWallpaper === wp.id;
                return (
                  <motion.button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    title={wp.name}
                    style={{
                      border: `2px solid ${isActive ? 'var(--accent-pink-deep)' : 'var(--border-subtle)'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      background: 'transparent',
                      boxShadow: isActive ? 'var(--shadow-glow-pink)' : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  >
                    {/* Swatch */}
                    <div style={{
                      height: '48px',
                      background: wp.css,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem',
                      position: 'relative',
                    }}>
                      {wp.id === 'none' && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 0 0/14px 14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: '1rem', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>◻️</span>
                        </div>
                      )}
                      {wp.id !== 'none' && (
                        <span style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}>{wp.icon}</span>
                      )}
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: '3px', right: '3px',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: 'var(--accent-pink-deep)',
                          boxShadow: '0 0 6px var(--accent-pink-deep)',
                        }} />
                      )}
                    </div>
                    {/* Label */}
                    <div style={{
                      padding: '3px 4px',
                      background: isActive ? 'rgba(212,112,138,0.1)' : 'var(--bg-secondary)',
                      fontSize: '0.6rem', fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textAlign: 'center',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {wp.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {stripWallpaper !== 'none' && (
              <motion.button
                onClick={() => setWallpaper('none')}
                whileTap={{ scale: 0.96 }}
                style={{
                  width: '100%', marginTop: '8px',
                  padding: '7px', borderRadius: '8px',
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)', fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                ✕ Remove Background
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
