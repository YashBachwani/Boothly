import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../context/BoothContext';
import BoothEntry from '../components/booth/BoothEntry';
import PhotoCountSelector from '../components/booth/PhotoCountSelector';
import CameraView from '../components/booth/CameraView';
import PrintAnimation from '../components/booth/PrintAnimation';
import StripThemer from '../components/strip/StripThemer';
import StickerLayer, { StickerPicker, StickerToolbar } from '../components/strip/StickerLayer';
import TextEditor, { TextEditPanel, useTextEditorControls } from '../components/strip/TextEditor';
import DownloadShare from '../components/strip/DownloadShare';
import StripCanvas from '../components/strip/StripCanvas';
import AIEnhancementPanel from '../components/booth/AIEnhancementPanel';

// ── Customize step — contains all the complex sticker/text editing UI ─────────

function CustomizeStep({ onDone }) {
  const { stickers, addSticker, updateSticker, removeSticker } = useBooth();

  /* Sticker state */
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const selectedSticker = stickers.find(s => s.id === selectedStickerId) || null;

  /* Text state */
  const textControls = useTextEditorControls();

  /* Active tool tab: 'stickers' | 'text' | null */
  const [activeTool, setActiveTool] = useState(null);

  /* Strip layer ref for coordinate mapping */
  const stripLayerRef = useRef(null);

  const handleAddSticker = useCallback((emoji) => {
    const id = Date.now();
    addSticker({
      id, emoji,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      scale: 1, rotate: 0, opacity: 1, flipH: false,
      zIndex: stickers.length + 1,
    });
    setSelectedStickerId(id);
    setShowStickerPicker(false);
  }, [addSticker, stickers.length]);

  const handleLayerClick = useCallback((e) => {
    if (e.target === stripLayerRef.current) {
      setSelectedStickerId(null);
      textControls.setSelectedId(null);
    }
  }, [textControls]);

  return (
    <motion.div
      key="customize"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="customize-layout"
    >
      {/* ── LEFT: Strip preview + overlays ───────────────────────────────── */}
      <div className="strip-column">

        {/* AI Enhancement mini-toggle above strip */}
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'flex-end' }}>
          <AIEnhancementPanel />
        </div>

        {/* Strip image + interactive overlay layers */}
        <div
          className="strip-wrapper"
          style={{ position: 'relative', overflow: 'visible' }}
        >
          {/* Base canvas strip */}
          <StripCanvas />

          {/* Shared pointer-capture layer */}
          <div
            ref={stripLayerRef}
            onClick={handleLayerClick}
            style={{ position: 'absolute', inset: 0, zIndex: 5, touchAction: 'none' }}
          />

          {/* Sticker overlay */}
          <StickerLayer
            readOnly={false}
            externalSelectedId={selectedStickerId}
            onSelect={setSelectedStickerId}
            onUpdate={updateSticker}
            onDelete={id => { removeSticker(id); setSelectedStickerId(null); }}
            containerRef={stripLayerRef}
          />

          {/* Text overlay */}
          <TextEditor readOnly={false} />
        </div>

        {/* ── Tool FABs (below the strip, not on top of it) */}
        <div style={{
          display: 'flex', gap: '10px',
          justifyContent: 'center', alignItems: 'center',
          marginTop: '10px', flexWrap: 'wrap',
        }}>
          {/* Sticker FAB */}
          <motion.button
            className="btn btn-primary"
            onClick={() => {
              setShowStickerPicker(p => !p);
              setActiveTool(t => t === 'stickers' ? null : 'stickers');
              textControls.setSelectedId(null);
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '10px 18px', borderRadius: '99px',
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '7px',
              background: activeTool === 'stickers'
                ? 'linear-gradient(135deg, var(--accent-pink-deep), var(--accent-lavender-deep))'
                : 'var(--bg-glass)',
              color: activeTool === 'stickers' ? '#fff' : 'var(--text-primary)',
              border: '1.5px solid ' + (activeTool === 'stickers' ? 'transparent' : 'var(--border-subtle)'),
              boxShadow: activeTool === 'stickers' ? 'var(--shadow-glow-pink)' : 'var(--shadow-sm)',
            }}
          >
            <span>✨</span> Stickers
            {stickers.length > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.25)', borderRadius: '99px',
                padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700,
              }}>{stickers.length}</span>
            )}
          </motion.button>

          {/* Text FAB */}
          <motion.button
            className="btn btn-primary"
            onClick={() => {
              textControls.handleAddText();
              setActiveTool('text');
              setShowStickerPicker(false);
              setSelectedStickerId(null);
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '10px 18px', borderRadius: '99px',
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'linear-gradient(135deg, var(--accent-lavender-deep), var(--accent-neon))',
              color: '#fff',
              border: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>✍️</span> Add Text
          </motion.button>
        </div>

        {/* ── Contextual panels (sticker picker / sticker toolbar / text editor) */}
        <AnimatePresence mode="wait">

          {/* Sticker picker */}
          {showStickerPicker && (
            <motion.div key="sticker-picker"
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{ marginTop: '10px', width: '100%' }}
            >
              <StickerPicker
                onAdd={handleAddSticker}
                onClose={() => { setShowStickerPicker(false); setActiveTool(null); }}
              />
            </motion.div>
          )}

          {/* Selected sticker controls (when picker is closed) */}
          {!showStickerPicker && selectedSticker && (
            <motion.div key="sticker-toolbar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}
            >
              <StickerToolbar
                sticker={selectedSticker}
                onUpdate={updateSticker}
                onDelete={removeSticker}
                onDeselect={() => setSelectedStickerId(null)}
              />
            </motion.div>
          )}

          {/* Text edit panel */}
          {textControls.selectedLayer && (
            <motion.div key={`text-panel-${textControls.selectedLayer.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              style={{ marginTop: '10px' }}
            >
              <TextEditPanel
                layer={textControls.selectedLayer}
                onUpdate={textControls.updateTextLayer}
                onClose={textControls.deselect}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── RIGHT: Theme / layout controls ──────────────────────────────── */}
      <div className="customize-controls">
        <StripThemer />
        <motion.button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '16px', padding: '15px', fontSize: '1rem' }}
          onClick={onDone}
          whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(212,112,138,0.5)' }}
          whileTap={{ scale: 0.97 }}
        >
          Done Customizing ✦
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Main BoothPage ────────────────────────────────────────────────────────────

export default function BoothPage() {
  const { step, setStep, newSession } = useBooth();

  useEffect(() => {
    if (step === 'landing') {
      newSession();
      setStep('entry');
    }
  }, [step, newSession, setStep]);

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: 'var(--bg-primary)',
      paddingTop: '64px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <AnimatePresence mode="wait">
        {step === 'entry'      && <BoothEntry key="entry" />}
        {step === 'select'     && <PhotoCountSelector key="select" />}
        {step === 'camera'     && <CameraView key="camera" />}
        {step === 'print'      && <PrintAnimation key="print" />}
        {step === 'customize'  && <CustomizeStep key="customize" onDone={() => setStep('result')} />}
        {step === 'result'     && <DownloadShare key="result" />}
      </AnimatePresence>
    </div>
  );
}
