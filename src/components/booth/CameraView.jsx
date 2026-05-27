import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { useCamera } from '../../hooks/useCamera';
import { useCountdown } from '../../hooks/useCountdown';
import { useAudio } from '../../hooks/useAudio';
import { FILTERS } from '../../constants';
import FilterPanel from '../filters/FilterPanel';

export default function CameraView() {
  const { photoCount, currentFilter, addPhoto, setStep } = useBooth();
  const { videoRef, isReady, error, startCamera, flipCamera, hasMultipleCameras, capturePhoto } = useCamera();
  const { count, isRunning, isFlashing, runSession } = useCountdown();
  const { playShutter, playCountdownBeep } = useAudio();
  
  const [photosTaken, setPhotosTaken] = useState(0);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (count !== null) {
      playCountdownBeep(count === 0);
    }
  }, [count, playCountdownBeep]);

  const activeFilterCss = FILTERS.find(f => f.id === currentFilter)?.css || 'none';

  const handleStartSession = () => {
    runSession(
      photoCount,
      () => {
        playShutter();
        return capturePhoto(currentFilter);
      },
      (photo, numTaken) => {
        addPhoto(photo);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
        <div className="pill">
          Photo {Math.min(photosTaken + 1, photoCount)} of {photoCount}
        </div>
        {hasMultipleCameras && !isRunning && (
          <button className="btn btn-ghost btn-sm" onClick={flipCamera}>
            🔄 Flip Camera
          </button>
        )}
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

        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: activeFilterCss,
            transform: 'scaleX(-1)', // Mirror front camera by default
            opacity: isReady ? 1 : 0, transition: 'opacity 0.4s',
          }}
        />

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
      <div style={{ height: '120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <FilterPanel disabled={isRunning} />
        
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
    </div>
  );
}
