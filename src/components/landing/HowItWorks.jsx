import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    icon: '📷',
    title: 'Enter the Booth',
    desc: 'Click "Enter Photo Booth" and grant camera access. Choose how many photos you want: 3, 4, or 6.',
    color: 'var(--accent-pink)',
  },
  {
    num: '02',
    icon: '⏱️',
    title: 'Strike a Pose',
    desc: 'The booth auto-counts down 3…2…1 and captures each photo sequentially. No clicking needed!',
    color: 'var(--accent-lavender)',
  },
  {
    num: '03',
    icon: '🎨',
    title: 'Style Your Strip',
    desc: 'Apply filters, choose a theme, add stickers, and type a custom caption on your photostrip.',
    color: 'var(--accent-neon)',
  },
  {
    num: '04',
    icon: '⬇️',
    title: 'Download & Share',
    desc: 'Download your strip as a high-quality PNG and share it instantly to Instagram, WhatsApp, and more.',
    color: 'var(--accent-warm)',
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" style={{
      padding: 'clamp(70px, 10vw, 120px) 24px',
      background: 'var(--bg-secondary)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 80% 50%, rgba(195,177,225,0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div ref={ref} style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '70px' }}
        >
          <span className="pill" style={{ marginBottom: '16px', display: 'inline-flex' }}>
            How it works
          </span>
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            marginTop: '16px', color: 'var(--text-primary)',
          }}>
            From click to{' '}
            <span className="gradient-text">keepsake</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.05rem' }}>
            Four simple steps to your perfect photostrip
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass-card"
              style={{ padding: '32px 28px', position: 'relative', overflow: 'hidden', cursor: 'default' }}
            >
              {/* Number background */}
              <div style={{
                position: 'absolute', top: '-10px', right: '-10px',
                fontSize: '6rem', fontWeight: 800,
                fontFamily: 'Playfair Display, serif',
                color: step.color, opacity: 0.08, lineHeight: 1,
                userSelect: 'none',
              }}>
                {step.num}
              </div>

              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: `linear-gradient(135deg, ${step.color}33, ${step.color}11)`,
                border: `2px solid ${step.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '20px',
              }}>
                {step.icon}
              </div>

              <div style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.7rem', color: step.color,
                letterSpacing: '0.1em', marginBottom: '10px',
              }}>
                STEP {step.num}
              </div>

              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.3rem', fontWeight: 600,
                color: 'var(--text-primary)', marginBottom: '12px',
              }}>
                {step.title}
              </h3>

              <p style={{
                color: 'var(--text-muted)', lineHeight: 1.65,
                fontSize: '0.92rem',
              }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
