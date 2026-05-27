import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { STRIP_THEMES, LAYOUTS } from '../../constants';
import AIEnhancementPanel from '../booth/AIEnhancementPanel';

export default function StripThemer() {
  const { stripTheme, setTheme, stripLayout, setLayout, customText, setCustomText } = useBooth();

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Smart Enhancements */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Enhance</h4>
          <div style={{ position: 'relative' }}>
            <AIEnhancementPanel />
          </div>
        </div>
      </div>

      {/* Layout Selection */}
      <div>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {LAYOUTS.map(l => {
            const isActive = stripLayout === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setLayout(l.id)}
                style={{
                  padding: '12px', borderRadius: '8px',
                  background: isActive ? 'var(--bg-primary)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent-pink)' : 'var(--border-subtle)'}`,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{l.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 400 }}>{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme</h4>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }} className="hide-scrollbar">
          {STRIP_THEMES.map(t => {
            const isActive = stripTheme === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTheme(t.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  flexShrink: 0,
                  width: '60px', height: '60px', borderRadius: '12px',
                  background: t.bg.startsWith('linear') ? t.bg : t.bg,
                  border: `2px solid ${isActive ? 'var(--accent-neon)' : t.border}`,
                  boxShadow: isActive ? '0 0 15px var(--accent-neon)' : 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: t.textColor, fontSize: '20px',
                }}
                title={t.name}
              >
                {t.icon}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Text */}
      <div>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caption</h4>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="e.g. Best day ever! ✨"
          maxLength={30}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}
