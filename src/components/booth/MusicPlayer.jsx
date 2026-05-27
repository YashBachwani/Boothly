import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MUSIC_TRACKS } from '../../constants/backgrounds';

export default function MusicPlayer({ currentTrack, onTrackChange, isMuted, onToggleMute }) {
  const [expanded, setExpanded] = useState(false);
  const track = MUSIC_TRACKS.find(t => t.id === currentTrack) || MUSIC_TRACKS[0];
  const isPlaying = currentTrack !== 'none' && !isMuted;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Mute toggle */}
      <motion.button
        className="btn btn-ghost btn-sm"
        onClick={onToggleMute}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        title={isMuted ? 'Unmute' : 'Mute'}
        style={{
          padding: '8px 10px',
          fontSize: '1rem',
          lineHeight: 1,
          minWidth: 0,
          position: 'relative',
        }}
      >
        {isMuted ? '🔇' : isPlaying ? '🔊' : '🔕'}
        {/* Equalizer animation when playing */}
        {isPlaying && !isMuted && (
          <div style={{
            position: 'absolute', bottom: '3px', left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: '2px', alignItems: 'flex-end',
          }}>
            {[1, 1.5, 0.8, 1.3].map((h, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, h, 0.6, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                style={{
                  width: '2px',
                  height: '6px',
                  background: 'var(--accent-pink-deep)',
                  borderRadius: '1px',
                  transformOrigin: 'bottom',
                }}
              />
            ))}
          </div>
        )}
      </motion.button>

      {/* Track selector trigger */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setExpanded(e => !e)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '0.8rem',
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>{track.icon}</span>
          <span style={{
            maxWidth: '70px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {track.name}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: '0.7rem', opacity: 0.6 }}
          >
            ▼
          </motion.span>
        </button>

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
                width: '200px',
              }}
            >
              <p style={{
                fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
                color: 'var(--text-muted)', marginBottom: '8px',
                textTransform: 'uppercase', textAlign: 'center',
              }}>
                🎵 Booth Music
              </p>

              {MUSIC_TRACKS.map(t => (
                <motion.button
                  key={t.id}
                  onClick={() => { onTrackChange(t.id); setExpanded(false); }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    background: currentTrack === t.id
                      ? 'linear-gradient(135deg, rgba(212,112,138,0.15), rgba(155,127,204,0.15))'
                      : 'transparent',
                    marginBottom: '2px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 600,
                      color: currentTrack === t.id ? 'var(--accent-pink-deep)' : 'var(--text-primary)',
                    }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>
                      {t.description}
                    </div>
                  </div>
                  {currentTrack === t.id && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: 'var(--accent-pink-deep)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
