import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { processUploadedPhoto } from '../../utils/imageEnhancement';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = '.jpg,.jpeg,.png,.webp';

export default function GalleryUpload() {
  const { photoCount, addPhotoDual, setStep } = useBooth();

  // Each slot: { file, preview (thumbnail URL), raw, enhanced, status }
  const [slots, setSlots] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replaceIdxRef = useRef(null);

  const filledCount = slots.length;
  const remaining = photoCount - filledCount;
  const isComplete = filledCount === photoCount;

  // ── Validate & add files ─────────────────────────────────────
  const addFiles = useCallback((files) => {
    setError(null);
    const validFiles = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Use JPG, PNG, or WEBP.`);
        continue;
      }
      validFiles.push(file);
    }

    // Cap at remaining slots
    const toAdd = validFiles.slice(0, remaining);
    if (validFiles.length > remaining && remaining > 0) {
      setError(`Only ${remaining} more photo${remaining > 1 ? 's' : ''} needed. Extra files were ignored.`);
    }
    if (remaining <= 0 && validFiles.length > 0) {
      setError(`All ${photoCount} photos are already selected.`);
      return;
    }

    // Create preview thumbnails
    const newSlots = toAdd.map((file) => {
      const preview = URL.createObjectURL(file);
      return { file, preview, raw: null, enhanced: null, status: 'ready' };
    });

    setSlots((prev) => [...prev, ...newSlots]);
  }, [remaining, photoCount]);

  // ── Drag & Drop on upload zone ───────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // ── Delete photo ─────────────────────────────────────────────
  const handleDelete = (idx) => {
    setSlots((prev) => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
    setError(null);
  };

  // ── Replace photo ────────────────────────────────────────────
  const handleReplace = (idx) => {
    replaceIdxRef.current = idx;
    replaceInputRef.current?.click();
  };
  const handleReplaceChange = (e) => {
    const idx = replaceIdxRef.current;
    if (idx == null || !e.target.files?.length) return;
    const file = e.target.files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`"${file.name}" is not a supported format.`);
      e.target.value = '';
      return;
    }
    setSlots((prev) => {
      const copy = [...prev];
      if (copy[idx]?.preview) URL.revokeObjectURL(copy[idx].preview);
      copy[idx] = { file, preview: URL.createObjectURL(file), raw: null, enhanced: null, status: 'ready' };
      return copy;
    });
    setError(null);
    e.target.value = '';
  };

  // ── Drag-reorder between cards ───────────────────────────────
  const handleCardDragStart = (idx) => setDragIdx(idx);
  const handleCardDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleCardDragEnd = () => {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      setSlots((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(dragIdx, 1);
        copy.splice(dragOverIdx, 0, moved);
        return copy;
      });
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // ── Add via empty slot ───────────────────────────────────────
  const handleEmptySlotClick = () => fileInputRef.current?.click();

  // ── Clear all ────────────────────────────────────────────────
  const handleClearAll = () => {
    slots.forEach((s) => { if (s.preview) URL.revokeObjectURL(s.preview); });
    setSlots([]);
    setError(null);
  };

  // ── Process & Continue ───────────────────────────────────────
  const handleContinue = async () => {
    setProcessing(true);
    setProcessProgress(0);
    setError(null);

    try {
      for (let i = 0; i < slots.length; i++) {
        const { raw, enhanced } = await processUploadedPhoto(slots[i].file);
        addPhotoDual(raw, enhanced);
        setProcessProgress(((i + 1) / slots.length) * 100);
      }
      // Clean up blob URLs
      slots.forEach((s) => { if (s.preview) URL.revokeObjectURL(s.preview); });
      // Go to print animation
      setTimeout(() => setStep('print'), 400);
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to process some photos. Please try again.');
      setProcessing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '24px',
        overflow: 'auto', gap: '20px',
      }}
    >
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXT}
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED_EXT}
        style={{ display: 'none' }}
        onChange={handleReplaceChange}
      />

      {/* Header */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <motion.button
          className="btn btn-ghost btn-sm"
          onClick={() => setStep('source')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: '0.8rem' }}
        >
          ← Back
        </motion.button>
        <div className="pill" style={{ margin: 0 }}>
          {filledCount} / {photoCount} photos
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          Upload your <span className="gradient-text">memories</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Select {photoCount} photos to create your strip
        </p>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 80, 80, 0.12)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              color: '#ff6b6b',
              fontSize: '0.82rem',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Zone — shown when not all slots filled */}
      {!isComplete && (
        <motion.div
          className={`upload-zone${isDragOver ? ' drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          style={{ width: '100%', maxWidth: '560px' }}
        >
          <motion.div
            className="upload-zone-icon"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {isDragOver ? '✨' : '🖼️'}
          </motion.div>
          <div className="upload-zone-title">
            {isDragOver ? 'Drop your photos here!' : 'Drag & drop photos here'}
          </div>
          <div className="upload-zone-hint">
            or click to browse • JPG, PNG, WEBP • {remaining} more needed
          </div>
        </motion.div>
      )}

      {/* Photo Preview Grid */}
      {slots.length > 0 && (
        <motion.div
          className="photo-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {slots.map((slot, idx) => (
            <motion.div
              key={`photo-${idx}-${slot.file.name}`}
              className={`photo-card${dragIdx === idx ? ' dragging' : ''}${dragOverIdx === idx && dragIdx !== idx ? ' drag-target' : ''}`}
              draggable
              onDragStart={() => handleCardDragStart(idx)}
              onDragOver={(e) => handleCardDragOver(e, idx)}
              onDragEnd={handleCardDragEnd}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              layout
            >
              <div className="photo-badge">{idx + 1}</div>
              <img src={slot.preview} alt={`Photo ${idx + 1}`} draggable={false} />
              <div className="photo-card-overlay">
                <button
                  className="photo-action-btn"
                  onClick={(e) => { e.stopPropagation(); handleReplace(idx); }}
                  title="Replace"
                >🔄</button>
                <button
                  className="photo-action-btn delete"
                  onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                  title="Remove"
                >✕</button>
              </div>
            </motion.div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: remaining }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              className="photo-slot-empty"
              onClick={handleEmptySlotClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (slots.length + i) * 0.06 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              +
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Processing Progress */}
      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
          >
            <div className="upload-progress">
              <div className="upload-progress-bar" style={{ width: `${processProgress}%` }} />
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Optimizing photos... {Math.round(processProgress)}%
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!processing && slots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={handleClearAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear All
          </motion.button>
          <motion.button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.05 } : {}}
            whileTap={isComplete ? { scale: 0.95 } : {}}
            style={{
              padding: '14px 36px',
              fontSize: '1rem',
              opacity: isComplete ? 1 : 0.5,
              cursor: isComplete ? 'pointer' : 'not-allowed',
            }}
          >
            Continue ✦
          </motion.button>
        </motion.div>
      )}

      {/* Drag reorder hint */}
      {slots.length > 1 && !processing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontFamily: 'Space Mono, monospace',
            letterSpacing: '0.04em',
          }}
        >
          Drag photos to reorder • Click to replace or remove
        </motion.p>
      )}
    </motion.div>
  );
}
