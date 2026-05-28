import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { useCamera } from '../../hooks/useCamera';
import { useCountdown } from '../../hooks/useCountdown';
import { useAudio } from '../../hooks/useAudio';
import { FILTERS } from '../../constants';
import FilterPanel from '../filters/FilterPanel';
import AIEnhancementPanel from './AIEnhancementPanel';
import VirtualBackgroundPanel from './VirtualBackgroundPanel';
import MusicPlayer from './MusicPlayer';
import { VIRTUAL_BACKGROUNDS } from '../../constants/backgrounds';
import { generateEnhancedPreview } from '../../utils/imageEnhancement';

export default function CameraView() {
  const { 
    photoCount, currentFilter, addPhoto, addPhotoDual, setStep, 
    currentBackground, setCurrentBackground, currentMusic, setCurrentMusic, 
    isMuted, setIsMuted, enhancements, enhancementIntensity, enhancementsEnabled 
  } = useBooth();
  const { videoRef, isReady, error, startCamera, flipCamera, hasMultipleCameras, capturePhoto } = useCamera();
  const { count, isRunning, isFlashing, runSession } = useCountdown();
  const { playShutter, playCountdownBeep, playBackgroundMusic, setMuted } = useAudio();
  
  const [photosTaken, setPhotosTaken] = useState(0);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (count !== null) {
      playCountdownBeep(count === 0);
    }
  }, [count, playCountdownBeep]);

  // Sync mute state with audio context
  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted, setMuted]);

  // Handle background music playing
  useEffect(() => {
    playBackgroundMusic(currentMusic);
  }, [currentMusic, playBackgroundMusic]);

  const activeFilterCss = FILTERS.find(f => f.id === currentFilter)?.css || 'none';
  const activeBg = VIRTUAL_BACKGROUNDS.find(b => b.id === currentBackground) || VIRTUAL_BACKGROUNDS[0];

  const handleStartSession = () => {
    runSession(
      photoCount,
      () => {
        playShutter();
        return capturePhoto(currentFilter, currentBackground);
      },
      async (photo, numTaken) => {
        let finalPhoto = photo;
        if (enhancementsEnabled && Object.values(enhancements).some(Boolean)) {
          try {
            const { enhanced } = await generateEnhancedPreview(photo, enhancements, enhancementIntensity);
            finalPhoto = enhanced;
          } catch (e) {
            console.warn('AI enhancement on capture failed:', e);
          }
        }
        addPhotoDual(photo, finalPhoto);
        setPhotosTaken(numTaken);
      },
      () => {
        // Session complete
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '16px', position: 'relative' }}>
      
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="pill" style={{ margin: 0 }}>
            {Math.min(photosTaken + 1, photoCount)} / {photoCount}
          </div>
          <VirtualBackgroundPanel selected={currentBackground} onChange={setCurrentBackground} disabled={isRunning} />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <MusicPlayer currentTrack={currentMusic} onTrackChange={setCurrentMusic} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />
          {hasMultipleCameras && !isRunning && (
            <button className="btn btn-ghost btn-sm" onClick={flipCamera} style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
              🔄 Flip
            </button>
          )}
        </div>
      </div>

      {/* Camera container */}
      <div style={{
        flex: 1, position: 'relative', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {!isReady && (
          <div style={{ position: 'absolute', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: '24px', height: '24px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
            Starting camera...
          </div>
        )}

        {/* Virtual Background Render */}
        {activeBg.id !== 'none' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: activeBg.css,
            zIndex: 1, pointerEvents: 'none',
          }} />
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: activeFilterCss,
            transform: 'scaleX(-1)', // Mirror front camera by default
            opacity: isReady ? 1 : 0, transition: 'opacity 0.4s',
            zIndex: 2,
            mixBlendMode: activeBg.id !== 'none' ? 'soft-light' : 'normal', // Blend video into background
          }}
        />

        {/* Floating Emojis for Virtual Background */}
        <AnimatePresence>
          {activeBg.emoji && activeBg.emoji.length > 0 && !isRunning && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
              {activeBg.emoji.map((emj, i) => (
                <motion.div
                  key={`${activeBg.id}-${i}`}
                  initial={{ y: '110%', x: Math.random() * 80 + 10 + '%', opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: '-10%', 
                    x: Math.random() * 80 + 10 + '%', 
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1.2, 0.8],
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: Math.random() * 4 + 4,
                    repeat: Infinity,
                    delay: i * 1.5,
                    ease: 'linear'
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: '2rem',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                  }}
                >
                  {emj}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Ambient Overlay to tint the scene */}
        {activeBg.ambientColor && (
          <div style={{
            position: 'absolute', inset: 0,
            background: activeBg.ambientColor,
            zIndex: 4, pointerEvents: 'none', mixBlendMode: 'overlay'
          }} />
        )}
        {activeBg.overlay && (
          <div style={{
            position: 'absolute', inset: 0,
            background: activeBg.overlay,
            zIndex: 5, pointerEvents: 'none'
          }} />
        )}

        {/* Flash Overlay */}
        <AnimatePresence>
          {isFlashing && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10 }}
            />
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {count !== null && count > 0 && (
            <motion.div
              key={count}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute',
                fontSize: '120px', fontWeight: 800,
                color: '#fff', fontFamily: 'Inter, sans-serif',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                zIndex: 5,
              }}
            >
              {count}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls / Filters */}
      <div className="camera-controls-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
        <div className="camera-controls-flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ flex: 1, overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
            <FilterPanel disabled={isRunning} />
          </div>
          <div className="camera-ai-btn" style={{ flexShrink: 0 }}>
            <AIEnhancementPanel />
          </div>
        </div>
        
        {!isRunning && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.button
              className="btn btn-primary"
              onClick={handleStartSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '16px 40px', fontSize: '1.1rem' }}
            >
              {photosTaken === 0 ? 'Start Capture ✦' : 'Continue Capture'}
            </motion.button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .camera-controls-flex-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .camera-ai-btn {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
          }
          .camera-ai-btn > div {
            width: 100% !important;
          }
          .camera-ai-btn button {
            width: 100% !important;
            padding: 12px !important;
            justify-content: center !important;
          }
        }
      `}} />
    </div>
  );
}
