import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { STRIP_THEMES, LAYOUTS } from '../../constants';
import WallpaperPanel from './WallpaperPanel';

const TABS = [
  { id: 'theme',   label: 'Theme',      icon: '🎨' },
  { id: 'layout',  label: 'Layout',     icon: '▦' },
  { id: 'text',    label: 'Caption',    icon: '✍️' },
  { id: 'bg',      label: 'Background', icon: '🖼️' },
];

export default function StripThemer() {
  const {
    stripTheme, setTheme,
    stripLayout, setLayout,
    customText, setCustomText,
  } = useBooth();
  const [activeTab, setActiveTab] = useState('theme');

  return (
    <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        overflowX: 'auto',
        flexShrink: 0,
      }} className="hide-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 0 auto',
              padding: '12px 8px',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-pink-deep)' : 'transparent'}`,
              background: activeTab === tab.id ? 'rgba(212,112,138,0.06)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-pink-deep)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'theme' && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Strip Theme
              </p>
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {STRIP_THEMES.map(t => {
                  const isActive = stripTheme === t.id;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.94 }}
                      title={`${t.name} — ${t.description}`}
                      style={{
                        flexShrink: 0,
                        width: '58px',
                        borderRadius: '14px',
                        background: t.bg.startsWith('linear') ? t.bg : t.bg,
                        border: `3px solid ${isActive ? 'var(--accent-neon)' : t.border}`,
                        boxShadow: isActive ? '0 0 16px var(--accent-neon), 0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: t.textColor,
                        gap: '4px',
                        padding: '10px 4px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                      <span style={{ fontSize: '0.58rem', fontWeight: 600, opacity: 0.85, fontFamily: t.fontFamily }}>
                        {t.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
              {/* Active theme info */}
              {stripTheme && (
                <motion.div
                  key={stripTheme}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-secondary)' }}
                >
                  {(() => {
                    const t = STRIP_THEMES.find(t => t.id === stripTheme);
                    return t ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: t.bg.startsWith('linear') ? t.bg : t.bg, flexShrink: 0, border: `2px solid ${t.border}` }} />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t.description}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Strip Layout
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {LAYOUTS.map(l => {
                  const isActive = stripLayout === l.id;
                  return (
                    <motion.button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '14px 12px', borderRadius: '12px',
                        background: isActive ? 'linear-gradient(135deg, rgba(212,112,138,0.15), rgba(155,127,204,0.15))' : 'var(--bg-secondary)',
                        border: `1.5px solid ${isActive ? 'var(--accent-pink-deep)' : 'var(--border-subtle)'}`,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>{l.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500 }}>{l.name}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{l.description}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Strip Caption
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                This text appears at the bottom of your strip. For rich text layers on the strip itself, use the ✍️ button in the preview.
              </p>
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="e.g. Best day ever! ✨"
                maxLength={32}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'var(--bg-secondary)',
                  border: '1.5px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-pink-deep)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)'; }}
              />
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {customText.length}/32
              </div>
            </motion.div>
          )}

          {activeTab === 'bg' && (
            <motion.div
              key="bg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
            >
              <WallpaperPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
