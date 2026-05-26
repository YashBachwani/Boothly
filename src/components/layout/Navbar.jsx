import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const BGM_TRACKS = [
  { id: 'none', name: 'No Music', url: '' },
  { id: 'chill', name: 'Chill Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'upbeat', name: 'Upbeat Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'synth', name: 'Synthwave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(BGM_TRACKS[0]);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isBooth = location.pathname === '/booth';

  useEffect(() => {
    if (audioRef.current) {
      if (currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.play().catch(e => console.log('Autoplay blocked', e));
      } else {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'var(--bg-glass)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-glass)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      {/* Logo */}
      <motion.button
        onClick={() => navigate('/')}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <img src="/favicon.png" alt="Boothly Logo" style={{ width: '34px', height: '34px', borderRadius: '10px' }} />
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.4rem', fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>Boothly</span>
      </motion.button>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Hidden Audio Element */}
        <audio ref={audioRef} loop />

        {/* Music Selector */}
        <div style={{ position: 'relative' }}>
          <NavBtn
            onClick={() => setShowMusicMenu(!showMusicMenu)}
            title="Background Music"
          >
            {currentTrack.id === 'none' ? '🔇' : '🎵'}
          </NavBtn>

          <AnimatePresence>
            {showMusicMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="glass-card"
                style={{
                  position: 'absolute', top: '50px', right: '0',
                  width: '200px', padding: '8px', zIndex: 100,
                  display: 'flex', flexDirection: 'column', gap: '4px',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Background Music</div>
                {BGM_TRACKS.map(track => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrack(track);
                      setShowMusicMenu(false);
                    }}
                    style={{
                      background: currentTrack.id === track.id ? 'var(--bg-primary)' : 'transparent',
                      border: currentTrack.id === track.id ? '1px solid var(--accent-pink)' : '1px solid transparent',
                      padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                      textAlign: 'left', color: 'var(--text-primary)', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {currentTrack.id === track.id && <span style={{ color: 'var(--accent-pink)' }}>▶</span>}
                    {track.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme toggle */}
        <NavBtn onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </NavBtn>

        {/* Enter booth (only on landing) */}
        {!isBooth && (
          <motion.button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/booth')}
            whileHover={{ scale: 1.04, translateY: -1 }}
            whileTap={{ scale: 0.96 }}
            style={{ fontSize: '0.85rem', padding: '10px 20px' }}
          >
            Enter Booth ✦
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}

function NavBtn({ children, onClick, title }) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        cursor: 'pointer', fontSize: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </motion.button>
  );
}
