import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Particle background using canvas
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        color: ['#E8A5B5', '#C3B1E1', '#7EDDD4', '#F0C090'][Math.floor(Math.random() * 4)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none',
    }} />
  );
}

// Floating animated photostrip
function FloatingStrip({ images, style, rotation = 0, delay = 0 }) {
  return (
    <motion.div
      className="floating-strip"
      animate={{ y: [0, -16, 0], rotate: [rotation, rotation + 2, rotation] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'absolute',
        ...style,
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <div style={{
        width: '90px',
        background: '#111',
        padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '5px',
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: '74px', height: '56px',
            background: `hsl(${(i * 80 + 200)}deg, 30%, ${30 + i * 10}%)`,
            borderRadius: '2px',
            flexShrink: 0,
          }} />
        ))}
        <div style={{
          color: '#888', fontSize: '9px', textAlign: 'center',
          fontFamily: 'Space Mono, monospace', paddingTop: '4px',
        }}>✦ boothly</div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg-primary)',
      paddingTop: '80px',
    }}>
      {/* Ambient gradient blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(195,177,225,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,165,181,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '20%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(126,221,212,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <ParticleCanvas />

      {/* Floating photostrips */}
      <FloatingStrip
        style={{ left: '4%', top: '15%' }}
        rotation={-12}
        delay={0}
      />
      <FloatingStrip
        style={{ right: '4%', top: '20%' }}
        rotation={8}
        delay={1.5}
      />
      <FloatingStrip
        style={{ left: '12%', bottom: '12%' }}
        rotation={6}
        delay={2.5}
      />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '0 24px', maxWidth: '800px',
        gap: '28px',
      }}>
        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="pill">
            <span>✨</span> Now with 12 filters & 10 themes
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}>
            The internet's<br />
            <span className="gradient-text">aesthetic</span>{' '}
            <span style={{ fontStyle: 'italic' }}>photobooth.</span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}
        >
          Capture the moment beautifully. Auto-capture, stunning filters,
          and real photostrips — all in your browser.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          style={{
            display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          {[['12', 'Filters'], ['10', 'Themes'], ['4', 'Layouts'], ['100%', 'Private']].map(([num, label]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.6rem', fontWeight: 700,
                color: 'var(--accent-lavender-deep)',
              }}>{num}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            id="hero-enter-booth"
            className="btn btn-primary"
            onClick={() => navigate('/booth')}
            whileHover={{ scale: 1.05, translateY: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{ fontSize: '1.05rem', padding: '16px 34px' }}
          >
            📷 Enter Photo Booth
          </motion.button>
          <motion.button
            className="btn btn-ghost"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            See how it works ↓
          </motion.button>
        </motion.div>

        {/* Privacy note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          🔒 Your photos are processed locally and never stored.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute', bottom: '30px',
          color: 'var(--text-muted)', fontSize: '22px',
        }}
      >↓</motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .floating-strip {
            display: none !important;
          }
        }
      `}} />
    </section>
  );
}
