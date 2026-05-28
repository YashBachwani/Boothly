import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Web Audio Synth System ──────────────────────────────────────────
// Synthesizes analog photobooth sounds natively without loading large MP3s
let audioCtx = null;
let humNode = null;
let oscNode = null;

function initAudio() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
}

function playRelayClick(isMuted) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Fast mechanical switch snap (relay click)
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.012);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.012);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
  } catch (e) {
    console.warn('Relay click failed:', e);
  }
}

function playHum(isMuted) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Warm analog low-frequency studio hum (50Hz sub-bass and 100Hz harmonic)
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(50, audioCtx.currentTime);
    
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(100, audioCtx.currentTime);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    humNode = { osc1, osc2, gain };
  } catch (e) {
    console.warn('Ambience hum failed:', e);
  }
}

function stopHum() {
  if (humNode) {
    try {
      humNode.osc1.stop();
      humNode.osc1.disconnect();
      humNode.osc2.stop();
      humNode.osc2.disconnect();
      humNode.gain.disconnect();
    } catch (_) {}
    humNode = null;
  }
}

function playCurtainSlide(isMuted) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;

    // Filtered noise sweep for fabric sliding friction
    const bufferSize = audioCtx.sampleRate * 1.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.8, audioCtx.currentTime);
    filter.frequency.setValueAtTime(150, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(550, audioCtx.currentTime + 1.0);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.1);

    source.connect(filter).connect(gain).connect(audioCtx.destination);
    source.start();
  } catch (e) {
    console.warn('Slide sound failed:', e);
  }
}

function playFlashCharge(isMuted) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;

    // Sweeping pitch simulating flash capacitor charging up
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2200, audioCtx.currentTime + 1.1);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.012, audioCtx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.05);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.1);
    oscNode = osc;
  } catch (e) {
    console.warn('Charge sound failed:', e);
  }
}

function playCameraFlash(isMuted) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;

    // Shutter click (mechanical snap)
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);

    const clickGain = audioCtx.createGain();
    clickGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    osc.connect(clickGain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);

    // High frequency white noise blast for flash discharge
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2600, audioCtx.currentTime);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);

    noise.connect(filter).connect(noiseGain).connect(audioCtx.destination);
    noise.start();
  } catch (e) {
    console.warn('Flash sound failed:', e);
  }
}

// ── Main Preloader Component ──────────────────────────────────────
export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Stages: 'intro' -> 'lights' -> 'curtains-appear' -> 'curtains-open' -> 'flash' -> 'reveal'
  const [scene, setScene] = useState('intro');
  const [lightsActive, setLightsActive] = useState(false);

  // Floating ambient dust particles (optimized for mobile with 3D X/Y sway)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 12 : 28;
  const particles = useRef(
    Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 6,
      delay: Math.random() * -8,
      sway: Math.random() * 40 - 20,
    }))
  );

  const startCinematicFlow = () => {
    setHasEntered(true);
    playHum(isMuted);

    // Highly optimized, cinematic 4.8s sequence
    // 1. Camera Lights Activate (0.6s)
    setTimeout(() => {
      setScene('lights');
      setLightsActive(true);
      playRelayClick(isMuted);
      playFlashCharge(isMuted);
    }, 600);

    // 2. Curtains Appear & Slide Closed (1.8s)
    setTimeout(() => {
      setScene('curtains-appear');
      playCurtainSlide(isMuted);
    }, 1800);

    // 3. Curtains Open Horizontally (2.9s)
    setTimeout(() => {
      setScene('curtains-open');
      playCurtainSlide(isMuted);
    }, 2900);

    // 4. Shutter Click & Bright Camera Flash (4.0s)
    setTimeout(() => {
      setScene('flash');
      playCameraFlash(isMuted);
    }, 4000);

    // 5. Complete Reveal & Unmount (4.8s)
    setTimeout(() => {
      setScene('reveal');
      stopHum();
      setLoading(false);
    }, 4800);
  };

  useEffect(() => {
    return () => {
      stopHum();
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="cinematic-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#070709',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          {/* Ambient Studio Lighting (Background Glows) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(18,15,22,1) 0%, rgba(5,4,6,1) 100%)',
            zIndex: 1,
          }} />

          {/* Vignette Layer */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.9) 100%)',
            pointerEvents: 'none',
            zIndex: 3,
          }} />

          {/* Glowing Neon Lights behind curtains */}
          <AnimatePresence>
            {lightsActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.15, 0.45, 0.2, 0.55, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'min(650px, 95vw)',
                  height: '350px',
                  background: 'radial-gradient(circle, rgba(255,110,180,0.2) 0%, rgba(195,177,225,0.08) 40%, transparent 75%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {/* Floating Studio Dust Particles */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', overflow: 'hidden' }}>
            {particles.current.map((p, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: ['0vh', '-110vh'], 
                  opacity: [0, 0.7, 0],
                  x: [0, p.sway] 
                }}
                transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  bottom: '-5%',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 0 6px rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          {/* Glassmorphic Viewport Lens / Camera Viewfinder centerpiece */}
          {hasEntered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={
                scene === 'lights' ? { opacity: 0.12, scale: 1 } :
                scene === 'curtains-appear' ? { opacity: 0, scale: 0.95 } :
                scene === 'curtains-open' ? { opacity: 0.32, scale: 1.06 } :
                { opacity: 0 }
              }
              transition={{ duration: 1.0, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: 'min(360px, 80vw)',
                height: 'min(360px, 80vw)',
                borderRadius: '50%',
                border: '2px dashed rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <div style={{
                width: '85%',
                height: '85%',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.04)',
                background: 'radial-gradient(circle, rgba(255,110,180,0.03) 0%, transparent 80%)',
                boxShadow: 'inset 0 0 45px rgba(255,255,255,0.02)',
              }} />
            </motion.div>
          )}

          {/* ── CENTRAL BRANDING OR ENTRY TRIGGER ────────────────────── */}
          <AnimatePresence mode="wait">
            {!hasEntered ? (
              /* Splash screen requiring user click to initialize AudioContext */
              <motion.div
                key="splash-trigger"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: '24px', zIndex: 10, padding: '40px 32px',
                  background: 'rgba(255, 255, 255, 0.015)',
                  border: '1.5px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '32px',
                  boxShadow: '0 30px 100px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(20px)',
                  maxWidth: '480px',
                  width: '90%',
                  margin: '16px',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img src="/favicon.png" alt="Logo" style={{ width: '56px', height: '56px', borderRadius: '16px', boxShadow: '0 0 25px rgba(255,110,180,0.3)', marginBottom: '8px' }} />
                  {/* Subtle pulsing live indicator badge */}
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: 'var(--accent-neon)', boxShadow: '0 0 10px var(--accent-neon)',
                  }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(2rem, 6vw, 2.8rem)',
                    fontWeight: 700,
                    color: '#FFF',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    margin: 0,
                    textShadow: '0 0 20px rgba(255,255,255,0.1)',
                  }}>
                    BOOTHLY <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--accent-pink)' }}>STUDIO</span>
                  </h1>
                  <p style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.68rem',
                    color: 'var(--accent-pink)',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    margin: 0,
                    opacity: 0.8,
                  }}>
                    ブースリー ✦ 네컷 스튜디오
                  </p>
                </div>
                
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                  color: 'var(--text-secondary)',
                  maxWidth: '380px',
                  margin: 0,
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}>
                  Step inside the digital photobooth experience. Premium cameras, custom filters, and nostalgic aesthetic styles, now fully online.
                </p>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  marginTop: '12px',
                }}>
                  <motion.button
                    onClick={startCinematicFlow}
                    whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(255,110,180,0.35)' }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      padding: '16px 36px',
                      borderRadius: '99px',
                      border: '1.5px solid var(--accent-pink)',
                      background: 'rgba(255,110,180,0.08)',
                      color: '#FFF',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      letterSpacing: '0.15em',
                      fontFamily: 'Space Mono, monospace',
                      boxShadow: '0 0 30px rgba(255,110,180,0.15)',
                      transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                      width: '100%',
                      maxWidth: '280px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-pink)'; e.currentTarget.style.color = '#000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,110,180,0.08)'; e.currentTarget.style.color = '#FFF'; }}
                  >
                    ENTER STUDIO ✦
                  </motion.button>
                  
                  <p style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '8px 0 0 0',
                  }}>
                    <span>v2.0 • Developed By Yash Bachwani</span>
                    <span>🎧 HEADPHONES RECOMMENDED</span>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* The Active Cinematic branding reveal sequence */
              <motion.div
                key="branding-sequence"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', zIndex: 10, position: 'absolute',
                }}
              >
                {/* Simulated Top Studio LED indicators */}
                <div style={{
                  display: 'flex', gap: '20px', padding: '8px 24px',
                  borderRadius: '99px', background: 'rgba(255,255,255,0.02)',
                  border: '1.5px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)',
                  marginBottom: '40px',
                  opacity: scene === 'intro' ? 0.2 : 1, transition: 'opacity 0.6s'
                }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={lightsActive ? { 
                        boxShadow: ['0 0 6px #ff6eb4', '0 0 20px #ff6eb4', '0 0 6px #ff6eb4'],
                        background: ['#ff6eb4', '#fff', '#ff6eb4']
                      } : {}}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                      style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: '#3a202d',
                        border: '1.5px solid rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                </div>

                {/* Main logo with float motion & ambient text */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                >
                  <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: 'clamp(3.2rem, 11vw, 7rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.04em',
                    margin: 0,
                    background: 'linear-gradient(135deg, #FFF 0%, #ffcbd5 40%, #e8a5b5 70%, #C3B1E1 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 25px rgba(255,110,180,0.45))',
                    animation: 'shimmer 5s linear infinite',
                  }}>
                    BOOTHLY
                  </h1>

                  <p style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    margin: '8px 0 0 0',
                    opacity: 0.9,
                    textShadow: '0 0 10px rgba(255,255,255,0.15)',
                  }}>
                    The real photobooth experience, now online.
                  </p>

                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(0.6rem, 1.5vw, 0.72rem)',
                    color: 'var(--accent-pink)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    margin: '12px 0 0 0',
                    opacity: 0.75,
                    fontWeight: 500,
                  }}>
                    네컷 스튜디오 ✦ プリクラ
                  </p>

                  <p style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 'clamp(0.58rem, 1.4vw, 0.68rem)',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '18px 0 0 0',
                    opacity: 0.6,
                  }}>
                    v2.0 ✦ Developed By Yash Bachwani
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── THE VELVET STUDIO CURTAINS ────────────────────────────── */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', display: 'flex' }}>
            {/* Left Curtain */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={
                scene === 'curtains-appear' ? { x: '0%' } :
                scene === 'curtains-open' || scene === 'flash' || scene === 'reveal' ? { x: '-100%' } :
                { x: '-100%' }
              }
              transition={
                scene === 'curtains-appear' 
                  ? { duration: 1.1, ease: [0.25, 1, 0.5, 1] } 
                  : { duration: 1.3, ease: [0.76, 0, 0.24, 1] }
              }
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, #1c0207 0%, #80122a 60%, #30030c 100%)',
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.15) 30px, rgba(255,255,255,0.06) 60px, rgba(0,0,0,0.15) 90px, rgba(0,0,0,0.3) 120px)',
                boxShadow: '15px 0 50px rgba(0,0,0,0.9)',
                borderRight: '3px solid #dfb76c', // Luxury gold trim edge!
                position: 'relative',
              }}
            >
              {/* Highlight Overlay on Left Curtain */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none'
              }} />
            </motion.div>

            {/* Right Curtain */}
            <motion.div
              initial={{ x: '100%' }}
              animate={
                scene === 'curtains-appear' ? { x: '0%' } :
                scene === 'curtains-open' || scene === 'flash' || scene === 'reveal' ? { x: '100%' } :
                { x: '100%' }
              }
              transition={
                scene === 'curtains-appear' 
                  ? { duration: 1.1, ease: [0.25, 1, 0.5, 1] } 
                  : { duration: 1.3, ease: [0.76, 0, 0.24, 1] }
              }
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(-90deg, #1c0207 0%, #80122a 60%, #30030c 100%)',
                backgroundImage: 'repeating-linear-gradient(-90deg, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.15) 30px, rgba(255,255,255,0.06) 60px, rgba(0,0,0,0.15) 90px, rgba(0,0,0,0.3) 120px)',
                boxShadow: '-15px 0 50px rgba(0,0,0,0.9)',
                borderLeft: '3px solid #dfb76c', // Luxury gold trim edge!
                position: 'relative',
              }}
            >
              {/* Highlight Overlay on Right Curtain */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none'
              }} />
            </motion.div>
          </div>

          {/* ── RADIAL REVEAL LIGHT (Seen behind opening curtains) ──── */}
          <AnimatePresence>
            {(scene === 'curtains-open' || scene === 'flash') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: '600px',
                  height: '600px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(212,112,138,0.12) 40%, rgba(94,255,216,0.04) 70%, transparent 100%)',
                  zIndex: 18,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {/* ── THE THUNDERous CAMERA FLASH OVERLAY ──────────────────── */}
          <AnimatePresence>
            {scene === 'flash' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#FFF',
                  zIndex: 999999,
                  pointerEvents: 'none',
                  boxShadow: 'inset 0 0 120px rgba(255,255,255,1)',
                }}
              />
            )}
          </AnimatePresence>

          {/* ── MUTE / UNMUTE BUTTON ─────────────────────────────────── */}
          {hasEntered && (
            <motion.button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) {
                  stopHum();
                } else {
                  playHum(false);
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                zIndex: 999999,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                color: '#FFF',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s',
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
