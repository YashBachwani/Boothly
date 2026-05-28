import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 24px 40px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '60px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/favicon.png" alt="Boothly Logo" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.4rem', fontWeight: 600,
                color: 'var(--text-primary)',
              }}>Boothly</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '240px' }}>
              The internet's aesthetic photobooth. Capture the moment beautifully.
            </p>
            <p style={{
              marginTop: '16px', fontSize: '0.78rem',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              🔒 Privacy-first. No data stored.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Explore</h4>
            {['Enter Booth', 'How It Works', 'Themes', 'Features'].map(link => (
              <div key={link} style={{ marginBottom: '10px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (link === 'Enter Booth') navigate('/booth'); }}
                  style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent-pink)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  {link}
                </a>
              </div>
            ))}
          </div>

          {/* Themes */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Themes</h4>
            {['Minimal', 'Retro', 'Kawaii', 'Y2K', 'Neon', 'Wedding'].map(t => (
              <div key={t} style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Start Now</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '20px' }}>
              Your photobooth is waiting. No sign-up needed.
            </p>
            <motion.button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/booth')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              📷 Enter Booth ✦
            </motion.button>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '28px',
          display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {year} Boothly v2.0 • Developed By Yash Bachwani. Made with ❤️ for moments worth keeping.
          </span>
          <span style={{
            fontSize: '0.8rem', color: 'var(--text-muted)',
            fontFamily: 'Space Mono, monospace',
          }}>
            v2.0 ✦ boothly
          </span>
        </div>
      </div>
    </footer>
  );
}
