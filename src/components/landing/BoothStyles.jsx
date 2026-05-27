import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { STRIP_THEMES } from '../../constants';

export default function BoothStyles() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  // Show just a subset
  const showcaseThemes = STRIP_THEMES.slice(0, 8);

  return (
    <section style={{
      padding: 'clamp(70px, 10vw, 120px) 0',
      background: 'var(--bg-secondary)',
      overflow: 'hidden',
    }}>
      <div ref={ref} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', marginBottom: '48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center' }}
        >
          <span className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Themes</span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            marginTop: '16px', color: 'var(--text-primary)',
          }}>
            Your strip, your <span className="gradient-text-warm" style={{ fontStyle: 'italic' }}>aesthetic</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1rem' }}>
            10 premium themes with unique borders, fonts, and color palettes
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll showcase */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          display: 'flex', gap: '20px',
          padding: '20px 40px',
          overflowX: 'auto', overflowY: 'visible',
        }}
        className="hide-scrollbar"
      >
        {showcaseThemes.map((theme, i) => (
          <motion.div
            key={theme.id}
            whileHover={{ y: -12, scale: 1.04, transition: { duration: 0.3 } }}
            style={{
              flexShrink: 0,
              width: '150px',
              cursor: 'pointer',
            }}
          >
            {/* Theme strip preview */}
            <div style={{
              width: '150px',
              background: theme.bg.startsWith('linear') ? theme.bg : theme.bg,
              border: `${theme.borderWidth}px solid ${theme.border}`,
              borderRadius: `${theme.borderRadius + 4}px`,
              padding: '10px',
              display: 'flex', flexDirection: 'column', gap: '6px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}>
              {/* 3 fake photos */}
              {[0,1,2].map(j => (
                <div key={j} style={{
                  width: '100%', height: '70px',
                  background: `linear-gradient(135deg, ${theme.accentColor}44, ${theme.accentColor}22)`,
                  borderRadius: `${Math.max(0, theme.borderRadius - 4)}px`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: theme.textColor, fontSize: '22px', opacity: 0.7 + j * 0.1,
                }}>
                  {j === 1 ? '📷' : ''}
                </div>
              ))}
              {/* Theme name */}
              <div style={{
                fontFamily: theme.fontFamily + ', sans-serif',
                fontSize: '11px', color: theme.textColor,
                textAlign: 'center', paddingTop: '4px',
                opacity: 0.8,
              }}>
                ✦ boothly
              </div>
            </div>

            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <div style={{
                fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)',
              }}>{theme.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {theme.description}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
