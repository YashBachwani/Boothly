import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { useCamera } from '../../hooks/useCamera';
import { useCountdown } from '../../hooks/useCountdown';
import { useAudio } from '../../hooks/useAudio';
import { EXTENDED_FILTERS } from '../../utils/filterRenderer';
import { getFilterCSS } from '../../utils/filterRenderer';
import { VIRTUAL_BACKGROUNDS } from '../../constants/backgrounds';
import FilterPanel from '../filters/FilterPanel';
import VirtualBackgroundPanel from './VirtualBackgroundPanel';
import AIEnhancementPanel from './AIEnhancementPanel';
import MusicPlayer from './MusicPlayer';

const RIPPLE_DURATION = 600;

export default function CameraView() {
  const { photoCount, currentFilter, filterIntensity, addPhoto, setStep } = useBooth();
  const { videoRef, isReady, error, startCamera, flipCamera, hasMultipleCameras, capturePhoto } = useCamera();
  const { count, isRunning, isFlashing, runSession } = useCountdown();
  const audio = useAudio();

  const [photosTaken, setPhotosTaken] = useState(0);
  const [virtualBg, setVirtualBg] = useState('none');
  const [enhancements, setEnhancements] = useState({
    autoBrightness: true,
    autoContrast: true,
    skinSmoothing: false,
  });
  const [ripples, setRipples] = useState([]);
  const [showStartHint, setShowStartHint] = useState(true);

  const bgData = VIRTUAL_BACKGROUNDS.find(b => b.id === virtualBg) || VIRTUAL_BACKGROUNDS[0];
  const activeFilterDef = EXTENDED_FILTERS.find(f => f.id === currentFilter);
  const activeFilterCss = getFilterCSS(currentFilter, filterIntensity);
  const videoFilterClass = [
    activeFilterDef?.vhsOverlay ? 'filter-vhs' : '',
    activeFilterDef?.grainOverlay ? 'filter-grain' : '',
  ].filter(Boolean).join(' ');

  useEffect(() => {
    startCamera();
    // Hide hint after 3s
    const t = setTimeout(() => setShowStartHint(false), 3000);
    return () => clearTimeout(t);
  }, [startCamera]);

  useEffect(() => {
    if (count !== null) {
      audio.playCountdownBeep(count === 0);
    }
  }, [count, audio.playCountdownBeep]);

  // Ripple effect on button click
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), RIPPLE_DURATION);
  };

  const handleStartSession = (e) => {
    addRipple(e);
    setShowStartHint(false);
    runSession(
      photoCount,
      () => {
        audio.playShutter();
        return capturePhoto(
          currentFilter,
          enhancements,
          bgData.canvasColors,
        );
      },
      (photo, numTaken) => {
        addPhoto(photo);
        setPhotosTaken(numTaken);
      },
      () => {
        audio.playSuccess();
        setTimeout(() => setStep('print'), 1000);
      }
    );
  };

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📷</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Camera Access Denied</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => startCamera()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 'clamp(8px, 2vw, 16px)',
      gap: 'clamp(8px, 1.5vw, 16px)',
      position: 'relative',
      maxHeight: 'calc(100vh - 64px)',
      overflow: 'hidden',
    }}>

      {/* ── Top Control Bar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '0 4px',
        flexShrink: 0,
      }}>
        {/* Progress pill */}
        <motion.div
          className="pill"
          key={photosTaken}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span style={{ color: 'var(--accent-pink-deep)' }}>●</span>
          Photo {Math.min(photosTaken + 1, photoCount)} / {photoCount}
        </motion.div>

        {/* Right controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <MusicPlayer
            currentTrack={audio.currentTrack}
            onTrackChange={audio.playMusic}
            isMuted={audio.isMuted}
            onToggleMute={audio.toggleMute}
          />
          {hasMultipleCameras && !isRunning && (
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={flipCamera}
              whileHover={{ scale: 1.05 }}
              whileTap={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              title="Flip Camera"
            >
              🔄
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Camera Container ────────────────────────────────────── */}
      <div style={{
        flex: 1,
        position: 'relative',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)',
        minHeight: 0, // allow flex shrink
        maxHeight: 'clamp(240px, 55vh, 520px)',
      }}>

        {/* Virtual background layer (CSS visual only – not captured, just aesthetic) */}
        {virtualBg !== 'none' && (
          <motion.div
            key={virtualBg}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: bgData.css,
              zIndex: 0,
            }}
          />
        )}

        {/* Ambient color glow */}
        {virtualBg !== 'none' && bgData.ambientColor && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: bgData.ambientColor,
            pointerEvents: 'none',
            zIndex: 2,
            mixBlendMode: 'overlay',
          }} />
        )}

        {/* Loading state */}
        {!isReady && (
          <div style={{
            position: 'absolute', color: '#fff',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
            zIndex: 5,
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '28px', height: '28px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
              }}
            />
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Starting camera…</span>
          </div>
        )}

        {/* Video element */}
        <div className={videoFilterClass} style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1, display: 'flex' }}>
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: activeFilterCss,
              transform: 'scaleX(-1)',
              opacity: isReady ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />
        </div>

        {/* Flash overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: '#fff',
                zIndex: 20,
              }}
            />
          )}
        </AnimatePresence>

        {/* Countdown overlay */}
        <AnimatePresence>
          {count !== null && count > 0 && (
            <motion.div
              key={count}
              initial={{ opacity: 0, scale: 0.4, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.8, y: -20 }}
              transition={{ duration: 0.35, ease: 'backOut' }}
              style={{
                position: 'absolute',
                zIndex: 15,
                pointerEvents: 'none',
              }}
            >
              <div style={{
                fontSize: 'clamp(72px, 15vw, 130px)',
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                textShadow: '0 4px 40px rgba(0,0,0,0.6), 0 0 80px rgba(212,112,138,0.5)',
                lineHeight: 1,
              }}>
                {count}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo count progress bar */}
        {isRunning && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '3px', background: 'rgba(255,255,255,0.2)',
            zIndex: 18,
          }}>
            <motion.div
              initial={{ width: `${((photosTaken) / photoCount) * 100}%` }}
              animate={{ width: `${(photosTaken / photoCount) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-lavender))',
              }}
            />
          </div>
        )}

        {/* Virtual bg emoji decorations */}
        {virtualBg !== 'none' && bgData.emoji && !isRunning && isReady && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            pointerEvents: 'none', overflow: 'hidden',
          }}>
            {bgData.emoji.map((em, i) => (
              <motion.div
                key={em}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3 + i * 0.7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
                style={{
                  position: 'absolute',
                  fontSize: 'clamp(16px, 3vw, 24px)',
                  opacity: 0.7,
                  top: `${15 + i * 18}%`,
                  left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
                  right: i % 2 === 1 ? `${5 + i * 2}%` : undefined,
                  filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                }}
              >
                {em}
              </motion.div>
            ))}
          </div>
        )}

        {/* Start hint */}
        <AnimatePresence>
          {showStartHint && isReady && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'absolute', bottom: '16px',
                left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                color: '#fff', fontSize: '0.78rem',
                padding: '6px 16px', borderRadius: '99px',
                whiteSpace: 'nowrap', zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              👆 Tap below to start
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls ─────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Filter panel + extra controls row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <FilterPanel disabled={isRunning} />
          </div>
        </div>

        {/* AI & background row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <AIEnhancementPanel
            enhancements={enhancements}
            onChange={setEnhancements}
            disabled={isRunning}
          />
          <VirtualBackgroundPanel
            selected={virtualBg}
            onChange={setVirtualBg}
            disabled={isRunning}
          />
        </div>

        {/* Capture button */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <motion.button
                id="start-capture-btn"
                className="btn btn-primary"
                onClick={handleStartSession}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 12px 40px rgba(212,112,138,0.55)',
                }}
                whileTap={{ scale: 0.94 }}
                style={{
                  padding: 'clamp(14px, 2.5vw, 18px) clamp(28px, 6vw, 48px)',
                  fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 'min(260px, 80vw)',
                }}
              >
                {/* Ripple effects */}
                {ripples.map(r => (
                  <span
                    key={r.id}
                    style={{
                      position: 'absolute',
                      left: r.x,
                      top: r.y,
                      width: '200px',
                      height: '200px',
                      transform: 'translate(-50%, -50%) scale(0)',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.35)',
                      animation: `ripple ${RIPPLE_DURATION}ms ease-out forwards`,
                      pointerEvents: 'none',
                    }}
                  />
                ))}
                {photosTaken === 0 ? '✦ Start Capture' : `Continue · ${photosTaken}/${photoCount} done`}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Running state indicator */}
        {isRunning && (
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ color: 'var(--accent-pink-deep)' }}
              >
                ●
              </motion.span>
              Recording…
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
