import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../context/BoothContext';
import BoothEntry from '../components/booth/BoothEntry';
import PhotoCountSelector from '../components/booth/PhotoCountSelector';
import CameraView from '../components/booth/CameraView';
import PrintAnimation from '../components/booth/PrintAnimation';
import StripCanvas from '../components/strip/StripCanvas';
import EditorSidePanel from '../components/strip/EditorSidePanel';
import DownloadShare from '../components/strip/DownloadShare';

export default function BoothPage() {
  const { step, setStep, newSession } = useBooth();

  // Shared selection state: lifted to parent so canvas & side panel both see it
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Clear selection when sticker tab activates text and vice versa
  const handleSetSelectedStickerId = (id) => {
    setSelectedStickerId(id);
    if (id) setSelectedTextId(null);
  };
  const handleSetSelectedTextId = (id) => {
    setSelectedTextId(id);
    if (id) setSelectedStickerId(null);
  };

  useEffect(() => {
    if (step === 'landing') { newSession(); setStep('entry'); }
  }, [step, newSession, setStep]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {step === 'entry'  && <BoothEntry key="entry" />}
        {step === 'select' && <PhotoCountSelector key="select" />}
        {step === 'camera' && <CameraView key="camera" />}
        {step === 'print'  && <PrintAnimation key="print" />}

        {step === 'customize' && (
          <motion.div
            key="customize"
            className="editor-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: 'flex',
              gap: '0',
              height: 'calc(100vh - 64px)',
              overflow: 'clip',
            }}
          >
            {/* ── LEFT: Canvas / Strip Preview ────────────────────── */}
            <div className="editor-canvas-container" style={{
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 20px',
              background: 'var(--bg-primary)',
              position: 'relative',
              overflow: 'visible',
              minWidth: 0,
            }}>
              {/* Subtle background grid for studio feel */}
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                pointerEvents: 'none',
              }} />

              {/* Canvas label */}
              <div className="canvas-label" style={{ position: 'absolute', top: '16px', left: '20px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 5 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6eb4', boxShadow: '0 0 8px #ff6eb4' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', letterSpacing: '0.08em' }}>CANVAS</span>
              </div>

              {/* Hint */}
              <p className="workspace-hint" style={{
                position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.6,
                fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap',
                letterSpacing: '0.04em',
              }}>
                Drag • Resize • Rotate elements directly on strip
              </p>

              {/* The strip */}
              <StripCanvas
                selectedStickerId={selectedStickerId}
                setSelectedStickerId={handleSetSelectedStickerId}
                selectedTextId={selectedTextId}
                setSelectedTextId={handleSetSelectedTextId}
              />
            </div>

            {/* ── RIGHT: Editor Side Panel ─────────────────────────── */}
            <div className="editor-side-panel" style={{
              width: '360px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              overflow: 'hidden',
            }}>
              {/* Panel header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>EDITOR STUDIO</span>
              </div>

              {/* Tabbed panel fills remaining height */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <EditorSidePanel
                  selectedStickerId={selectedStickerId}
                  setSelectedStickerId={handleSetSelectedStickerId}
                  selectedTextId={selectedTextId}
                  setSelectedTextId={handleSetSelectedTextId}
                />
              </div>

              {/* Done button at bottom */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <motion.button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setStep('result')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Done Customizing ✦
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'result' && <DownloadShare key="result" />}
      </AnimatePresence>

      {/* Mobile responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .editor-workspace {
            flex-direction: column !important;
            height: calc(100vh - 64px) !important;
            overflow: hidden !important;
          }
          .editor-canvas-container {
            flex: 1 1 0 !important;
            padding: 12px !important;
            overflow: auto !important;
          }
          .editor-side-panel {
            width: 100% !important;
            height: 48% !important;
            max-height: 420px !important;
            border-left: none !important;
            border-top: 1px solid var(--border-subtle) !important;
          }
          .canvas-label, .workspace-hint {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
