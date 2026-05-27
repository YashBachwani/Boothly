import { motion } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { FILTERS } from '../../constants';

export default function FilterPanel({ disabled }) {
  const { currentFilter, setFilter } = useBooth();

  return (
    <div style={{
      display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px',
      opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto',
    }} className="hide-scrollbar">
      {FILTERS.map(f => {
        const isActive = currentFilter === f.id;
        return (
          <motion.button
            key={f.id}
            onClick={() => setFilter(f.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flexShrink: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: isActive ? 'var(--bg-glass)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--accent-pink)' : 'transparent'}`,
              borderRadius: '12px', padding: '8px 12px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '20px' }}>{f.icon}</div>
            <span style={{
              fontSize: '0.75rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>{f.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
