import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { EXTENDED_STICKERS, EXTENDED_STICKER_CATEGORIES } from '../../constants/stickers';

// ── Individual Sticker with drag / scale / rotate handles ────────────────────

function StickerItem({ sticker, isSelected, onSelect, onUpdate, onDelete, containerRef }) {
  const startPosRef = useRef(null);
  const startStickerRef = useRef(null);

  /* ─ Drag ─────────────────────────────────────────────────────────────────── */
  const handlePointerDown = useCallback((e) => {
    if (e.target.dataset.handle) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    onSelect(sticker.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    startPosRef.current  = { px: e.clientX, py: e.clientY };
    startStickerRef.current = { x: sticker.x, y: sticker.y };
  }, [sticker, onSelect, containerRef]);

  const handlePointerMove = useCallback((e) => {
    if (!startPosRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - startPosRef.current.px) / rect.width)  * 100;
    const dy = ((e.clientY - startPosRef.current.py) / rect.height) * 100;
    onUpdate(sticker.id, {
      x: Math.max(0, Math.min(98, startStickerRef.current.x + dx)),
      y: Math.max(0, Math.min(98, startStickerRef.current.y + dy)),
    });
  }, [sticker.id, onUpdate, containerRef]);

  const handlePointerUp = useCallback(() => {
    startPosRef.current = null;
    startStickerRef.current = null;
  }, []);

  /* ─ Scale ────────────────────────────────────────────────────────────────── */
  const handleScaleDown = useCallback((e) => {
    e.stopPropagation();
    const startScale = sticker.scale || 1;
    const startPx = e.clientX;
    const startPy = e.clientY;
    const onMove = (ev) => {
      const d = Math.sqrt(
        Math.pow(ev.clientX - startPx, 2) + Math.pow(ev.clientY - startPy, 2)
      );
      const sign = (ev.clientX > startPx || ev.clientY > startPy) ? 1 : -1;
      onUpdate(sticker.id, { scale: Math.max(0.3, Math.min(5, startScale + sign * d * 0.01)) });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [sticker, onUpdate]);

  /* ─ Rotate ───────────────────────────────────────────────────────────────── */
  const handleRotateDown = useCallback((e) => {
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + (sticker.x / 100) * rect.width;
    const cy = rect.top  + (sticker.y / 100) * rect.height;
    const startAngle  = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRotate = sticker.rotate || 0;
    const onMove = (ev) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      onUpdate(sticker.id, { rotate: startRotate + (angle - startAngle) });
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [sticker, onUpdate, containerRef]);

  const scale  = sticker.scale  || 1;
  const rotate = sticker.rotate || 0;
  const opacity = sticker.opacity ?? 1;
  const flipH  = sticker.flipH  || false;
  const size   = Math.round(40 * scale);
  const handleOffset = Math.max(10, size * 0.15);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${sticker.x}%`,
        top:  `${sticker.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scaleX(${flipH ? -1 : 1})`,
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        zIndex: (sticker.zIndex || 1) + (isSelected ? 100 : 0),
        opacity,
      }}
    >
      {/* Emoji */}
      <div style={{
        fontSize: `${size}px`,
        lineHeight: 1,
        filter: isSelected ? 'drop-shadow(0 0 8px rgba(212,112,138,0.9))' : 'none',
        transition: 'filter 0.2s',
      }}>
        {sticker.emoji}
      </div>

      {/* Handles — only visible when selected */}
      {isSelected && (
        <>
          {/* Dashed selection ring */}
          <div style={{
            position: 'absolute',
            inset: `-${handleOffset}px`,
            border: '2px dashed var(--accent-pink-deep)',
            borderRadius: '8px',
            pointerEvents: 'none',
          }} />

          {/* ✕ Delete — top-left */}
          <button
            data-handle="delete"
            onPointerDown={e => { e.stopPropagation(); onDelete(sticker.id); }}
            style={{
              position: 'absolute',
              top: `-${handleOffset + 2}px`, left: `-${handleOffset + 2}px`,
              width: '22px', height: '22px',
              borderRadius: '50%', border: 'none',
              background: '#ef4444', color: '#fff',
              fontSize: '11px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, zIndex: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >✕</button>

          {/* ↻ Rotate — top-right */}
          <div
            data-handle="rotate"
            onPointerDown={handleRotateDown}
            style={{
              position: 'absolute',
              top: `-${handleOffset + 2}px`, right: `-${handleOffset + 2}px`,
              width: '22px', height: '22px',
              borderRadius: '50%',
              border: '2px solid var(--accent-pink-deep)',
              background: 'var(--bg-card)',
              fontSize: '12px', cursor: 'grab',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 20, touchAction: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >↻</div>

          {/* ⤡ Scale — bottom-right */}
          <div
            data-handle="scale"
            onPointerDown={handleScaleDown}
            style={{
              position: 'absolute',
              bottom: `-${handleOffset + 2}px`, right: `-${handleOffset + 2}px`,
              width: '22px', height: '22px',
              borderRadius: '5px',
              border: '2px solid var(--accent-lavender-deep)',
              background: 'var(--bg-card)',
              fontSize: '10px', cursor: 'nwse-resize',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 20, touchAction: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >⤡</div>
        </>
      )}
    </div>
  );
}

// ── Sticker picker panel ──────────────────────────────────────────────────────

function StickerPicker({ onAdd, onClose }) {
  const [activeCategory, setActiveCategory] = useState(EXTENDED_STICKER_CATEGORIES[0].id);
  const visible = EXTENDED_STICKERS.filter(s => s.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="glass-card"
      style={{
        width: 'min(290px, 88vw)',
        padding: '14px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          ✨ Sticker Library
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
      </div>

      {/* Category tabs */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
        {EXTENDED_STICKER_CATEGORIES.map(cat => (
          <motion.button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            whileTap={{ scale: 0.92 }}
            style={{
              flexShrink: 0,
              padding: '4px 10px', borderRadius: '99px',
              fontSize: '0.68rem', fontWeight: activeCategory === cat.id ? 700 : 500,
              background: activeCategory === cat.id ? 'var(--accent-pink-deep)' : 'var(--bg-glass)',
              color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '3px',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="hide-scrollbar" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '5px',
        maxHeight: '190px', overflowY: 'auto',
        padding: '2px',
      }}>
        {visible.map(s => (
          <motion.button
            key={s.id}
            onClick={() => onAdd(s.emoji)}
            whileHover={{ scale: 1.22, background: 'var(--bg-secondary)' }}
            whileTap={{ scale: 0.88 }}
            style={{
              background: 'transparent', border: 'none',
              fontSize: '24px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              aspectRatio: '1', borderRadius: '8px',
              padding: '4px',
            }}
          >
            {s.emoji}
          </motion.button>
        ))}
      </div>

      <p style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
        Tap a sticker to add it · Drag to move · Handles to resize/rotate
      </p>
    </motion.div>
  );
}

// ── Selected-sticker inline toolbar ──────────────────────────────────────────

function StickerToolbar({ sticker, onUpdate, onDelete, onDeselect }) {
  if (!sticker) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="glass-card"
      style={{
        display: 'flex', alignItems: 'center',
        gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
        padding: '8px 12px',
        borderRadius: '12px',
        maxWidth: 'min(340px, 95vw)',
      }}
    >
      {/* Opacity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Opacity</span>
        <input
          type="range" min="10" max="100" step="5"
          value={Math.round((sticker.opacity ?? 1) * 100)}
          onChange={e => onUpdate(sticker.id, { opacity: parseInt(e.target.value) / 100 })}
          style={{ width: '65px', accentColor: 'var(--accent-pink-deep)', cursor: 'pointer' }}
        />
      </div>

      {/* Flip */}
      <motion.button
        className="btn btn-ghost btn-sm"
        onClick={() => onUpdate(sticker.id, { flipH: !sticker.flipH })}
        whileTap={{ scale: 0.9 }}
        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
      >
        ⇄ Flip
      </motion.button>

      {/* Layer order */}
      <div style={{ display: 'flex', gap: '3px' }}>
        <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.9 }}
          onClick={() => onUpdate(sticker.id, { zIndex: (sticker.zIndex || 1) + 1 })}
          style={{ padding: '5px 9px', fontSize: '0.78rem' }} title="Bring forward"
        >↑</motion.button>
        <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.9 }}
          onClick={() => onUpdate(sticker.id, { zIndex: Math.max(1, (sticker.zIndex || 1) - 1) })}
          style={{ padding: '5px 9px', fontSize: '0.78rem' }} title="Send back"
        >↓</motion.button>
      </div>

      {/* Delete */}
      <motion.button whileTap={{ scale: 0.9 }}
        onClick={() => { onDelete(sticker.id); onDeselect(); }}
        style={{
          padding: '5px 10px', borderRadius: '8px',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
        }}
      >🗑 Delete</motion.button>
    </motion.div>
  );
}

// ── Main StickerLayer ─────────────────────────────────────────────────────────
//
// Props:
//   readOnly           – render-only, no editing
//   externalSelectedId – controlled selected sticker id (from BoothPage)
//   onSelect           – callback(id) when a sticker is tapped
//   onUpdate           – callback(id, changes)
//   onDelete           – callback(id)
//   containerRef       – ref to the coordinate container element

export default function StickerLayer({
  readOnly = false,
  externalSelectedId,
  onSelect,
  onUpdate,
  onDelete,
  containerRef: externalContainerRef,
}) {
  const { stickers } = useBooth();
  const internalRef = useRef(null);
  const containerRef = externalContainerRef || internalRef;

  /* ─── READ-ONLY mode ──────────────────────────────────────────────────────── */
  if (readOnly) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', overflow: 'visible', zIndex: 10,
      }}>
        {stickers.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            transform: `translate(-50%,-50%) rotate(${s.rotate || 0}deg) scaleX(${s.flipH ? -1 : 1})`,
            fontSize: `${Math.round(40 * (s.scale || 1))}px`,
            lineHeight: 1, opacity: s.opacity ?? 1,
            zIndex: s.zIndex || 1, userSelect: 'none',
          }}>{s.emoji}</div>
        ))}
      </div>
    );
  }

  /* ─── INTERACTIVE mode — just renders the sticker items on the strip ─── */
  return (
    <div
      ref={internalRef}
      style={{
        position: 'absolute', inset: 0,
        zIndex: 10, touchAction: 'none',
        // overflow: visible so handles don't clip
      }}
    >
      {stickers.map(s => (
        <StickerItem
          key={s.id}
          sticker={s}
          isSelected={externalSelectedId === s.id}
          onSelect={onSelect || (() => {})}
          onUpdate={onUpdate || (() => {})}
          onDelete={onDelete || (() => {})}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

// ── Exported sub-components so BoothPage can place them correctly ─────────────
export { StickerPicker, StickerToolbar };
