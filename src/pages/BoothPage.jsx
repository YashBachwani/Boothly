import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../context/BoothContext';
import BoothEntry from '../components/booth/BoothEntry';
import PhotoCountSelector from '../components/booth/PhotoCountSelector';
import CameraView from '../components/booth/CameraView';
import PrintAnimation from '../components/booth/PrintAnimation';
import StripThemer from '../components/strip/StripThemer';
import StickerLayer from '../components/strip/StickerLayer';
import DownloadShare from '../components/strip/DownloadShare';
import StripCanvas from '../components/strip/StripCanvas';

export default function BoothPage() {
  const { step, setStep, newSession } = useBooth();

  useEffect(() => {
    // Start fresh when entering
    if (step === 'landing') {
      newSession();
      setStep('entry');
    }
  }, [step, newSession, setStep]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      paddingTop: '64px', // Navbar height
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <AnimatePresence mode="wait">
        {step === 'entry' && <BoothEntry key="entry" />}
        {step === 'select' && <PhotoCountSelector key="select" />}
        {step === 'camera' && <CameraView key="camera" />}
        {step === 'print' && <PrintAnimation key="print" />}
        {step === 'customize' && (
          <motion.div
            key="customize"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flex: 1, padding: '24px', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {/* The strip preview */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <StripCanvas />
              <StickerLayer />
            </div>
            {/* Customization controls */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
              <StripThemer />
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px' }}
                onClick={() => setStep('result')}
              >
                Done Customizing ✦
              </button>
            </div>
          </motion.div>
        )}
        {step === 'result' && <DownloadShare key="result" />}
      </AnimatePresence>
    </div>
  );
}
