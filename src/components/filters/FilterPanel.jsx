import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { EXTENDED_FILTERS, FILTER_CATEGORIES, getFilterCSS } from '../../utils/filterRenderer';

export default function FilterPanel({ disabled }) {
  const { currentFilter, setFilter, filterIntensity, setFilterIntensity } = useBooth();
  const [activeCategory, setActiveCategory] = useState('all');

  const visibleFilters = activeCategory === 'all'
    ? EXTENDED_FILTERS
    : EXTENDED_FILTERS.filter(f => f.category === activeCategory);

  const currentFilterDef = EXTENDED_FILTERS.find(f => f.id === currentFilter);

  return (
    <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
      {/* Category tabs */}
      <div
        className="hide-scrollbar"
        style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '8px', padding: '2px' }}
      >
        {FILTER_CATEGORIES.map(cat => (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            style={{
              flexShrink: 0,
              padding: '5px 12px',
              borderRadius: '99px',
              fontSize: '0.72rem',
              fontWeight: activeCategory === cat.id ? 700 : 500,
              background: activeCategory === cat.id
                ? 'linear-gradient(135deg, var(--accent-pink-deep), var(--accent-lavender-deep))'
                : 'var(--bg-glass)',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
              border: '1px solid ' + (activeCategory === cat.id ? 'transparent' : 'var(--border-subtle)'),
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.85rem' }}>{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Filter swatches */}
      <div
        className="hide-scrollbar"
        style={{
          display: 'flex', gap: 'clamp(6px, 1.5vw, 10px)',
          overflowX: 'auto', padding: '4px 2px',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
        }}
      >
        {visibleFilters.map(f => {
          const isActive = currentFilter === f.id;
          return (
            <motion.button
              key={f.id}
              onClick={() => setFilter(f.id)}
              whileHover={{ scale: 1.07, y: -2 }}
              whileTap={{ scale: 0.92 }}
              title={f.name}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(212,112,138,0.18), rgba(155,127,204,0.18))'
                  : 'var(--bg-glass)',
                border: `1.5px solid ${isActive ? 'var(--accent-pink-deep)' : 'var(--border-subtle)'}`,
                borderRadius: '12px',
                padding: 'clamp(6px, 1.5vw, 9px) clamp(8px, 2vw, 13px)',
                cursor: 'pointer',
                boxShadow: isActive ? 'var(--shadow-glow-pink)' : 'none',
                scrollSnapAlign: 'start',
                minWidth: 'clamp(52px, 12vw, 66px)',
                position: 'relative',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
            >
              {/* VHS scanline badge */}
              {f.vhsOverlay && (
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  fontSize: '0.45rem', background: '#f00', color: '#fff',
                  padding: '1px 3px', borderRadius: '2px', fontWeight: 800,
                  fontFamily: 'Space Mono, monospace',
                }}>VHS</div>
              )}

              <div style={{ fontSize: 'clamp(16px, 4vw, 22px)', lineHeight: 1, filter: getFilterCSS(f.id, 0.6) }}>
                {f.icon}
              </div>
              <span style={{
                fontSize: 'clamp(0.6rem, 1.7vw, 0.73rem)',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--accent-pink-deep)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {f.name}
              </span>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-pink-deep)' }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Intensity slider */}
      <AnimatePresence>
        {currentFilter !== 'normal' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '8px', padding: '0 4px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', minWidth: '50px' }}>
                {currentFilterDef?.icon} Strength
              </span>
              <input
                type="range"
                min="0" max="100" step="1"
                value={Math.round(filterIntensity * 100)}
                onChange={e => setFilterIntensity(parseFloat(e.target.value) / 100)}
                style={{ flex: 1, accentColor: 'var(--accent-pink-deep)', cursor: 'pointer', height: '4px' }}
              />
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-pink-deep)',
                minWidth: '34px', textAlign: 'right',
              }}>
                {Math.round(filterIntensity * 100)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
