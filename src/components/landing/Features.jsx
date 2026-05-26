import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FEATURES = [
  { icon: '🤖', title: 'Auto Capture', desc: 'Sequential countdown captures — just pose, no button mashing.', color: '#C3B1E1' },
  { icon: '🎨', title: '12 Live Filters', desc: 'Preview B&W, Vintage, Kawaii, Cinematic, and more in real time.', color: '#E8A5B5' },
  { icon: '🎞️', title: '4 Strip Layouts', desc: 'Vertical, Grid, Polaroid, or Film Strip — your vibe, your choice.', color: '#7EDDD4' },
  { icon: '🪄', title: '10 Themes', desc: 'From Minimal to Neon Cyberpunk — frames, fonts, and mood.', color: '#F0C090' },
  { icon: '🩷', title: 'Sticker Layer', desc: 'Drag & drop 35+ emojis and stickers. Touch-friendly on mobile.', color: '#D4708A' },
  { icon: '📥', title: 'Instant Download', desc: 'Export your strip as a print-ready high-res PNG instantly.', color: '#9B7FCC' },
  { icon: '🔒', title: '100% Private', desc: 'All processing is local. Photos never leave your device.', color: '#6EC4A7' },
  { icon: '📱', title: 'Mobile First', desc: 'Designed for phones. Front/back camera switch. Portrait ready.', color: '#F4A261' },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section style={{
      padding: 'clamp(70px, 10vw, 120px) 24px',
      background: 'var(--bg-primary)',
      position: 'relative',
    }}>
      <div ref={ref} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '70px' }}
        >
          <span className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Features</span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            marginTop: '16px', color: 'var(--text-primary)',
          }}>
            Everything you <span className="gradient-text">love</span><br />
            about a real booth
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '18px',
        }}>
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.25 } }}
              className="glass-card"
              style={{ padding: '26px', cursor: 'default' }}
            >
              <div style={{
                width: '46px', height: '46px', borderRadius: '14px',
                background: `${feat.color}22`,
                border: `1.5px solid ${feat.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', marginBottom: '16px',
              }}>
                {feat.icon}
              </div>
              <h3 style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem', fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: '8px',
              }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
