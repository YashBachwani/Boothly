import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const TESTIMONIALS = [
  {
    name: 'Sofia K.',
    handle: '@sofiasnaps',
    avatar: '🌸',
    rating: 5,
    text: 'This is SO much better than those actual booths at malls. The filters are gorgeous and the strips look so professional!',
    theme: 'Kawaii',
    color: '#FFB7C5',
  },
  {
    name: 'James R.',
    handle: '@jamesrphoto',
    avatar: '📸',
    rating: 5,
    text: 'Used this at my birthday party — everyone loved it! The automatic countdown is so fun and the Neon theme looked incredible.',
    theme: 'Neon',
    color: '#5EFFD8',
  },
  {
    name: 'Aisha M.',
    handle: '@aisha.moments',
    avatar: '✨',
    rating: 5,
    text: 'The Vintage filter + Film Strip layout = absolute perfection. I printed my strip and it looks like an actual analog photo!',
    theme: 'Vintage',
    color: '#C4922A',
  },
  {
    name: 'Yuki T.',
    handle: '@yukidesign',
    avatar: '🌷',
    rating: 5,
    text: 'As someone who grew up going to Japanese photobooths, this genuinely captures that nostalgic feeling. The design is 💜',
    theme: 'Minimal',
    color: '#C3B1E1',
  },
  {
    name: 'Priya S.',
    handle: '@priyasnaps',
    avatar: '🎀',
    rating: 5,
    text: 'Used it for our graduation! The strip downloads beautifully. Definitely bookmarked for every event from now on.',
    theme: 'Y2K',
    color: '#FF69B4',
  },
  {
    name: 'Marcus L.',
    handle: '@marcuslens',
    avatar: '🎬',
    rating: 5,
    text: 'The Cinematic filter is incredible. The sticker layer and drag-to-place functionality is surprisingly polished. Love it!',
    theme: 'Noir',
    color: '#9B7FCC',
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section style={{
      padding: 'clamp(70px, 10vw, 120px) 24px',
      background: 'var(--bg-primary)',
    }}>
      <div ref={ref} style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <span className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>Loved by creators</span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            marginTop: '16px', color: 'var(--text-primary)',
          }}>
            Real moments, <span className="gradient-text">shared</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="glass-card"
              style={{ padding: '28px', cursor: 'default' }}
            >
              {/* Stars */}
              <div style={{ marginBottom: '16px', fontSize: '14px' }}>
                {'⭐'.repeat(t.rating)}
              </div>

              {/* Text */}
              <p style={{
                fontSize: '0.95rem', lineHeight: 1.65,
                color: 'var(--text-secondary)', marginBottom: '20px',
                fontStyle: 'italic',
              }}>
                "{t.text}"
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `${t.color}33`,
                    border: `2px solid ${t.color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.handle}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', padding: '4px 10px', borderRadius: '99px',
                  background: `${t.color}22`,
                  border: `1px solid ${t.color}44`,
                  color: t.color, fontWeight: 600,
                }}>
                  {t.theme}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
