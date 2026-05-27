import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { FONT_FAMILIES, FONT_CATEGORIES } from '../../constants/fonts';

const DEFAULT_TEXT_LAYER = {
  text: 'Your text',
  x: 50, y: 40,
  fontSize: 22,
  fontFamily: "'Inter', sans-serif",
  color: '#ffffff',
  opacity: 1,
  rotation: 0,
  shadow: true,
  outline: false,
  bold: false,
  italic: false,
};

// ── Font selector ─────────────────────────────────────────────────────────────

function FontSelector({ value, onChange, previewText }) {
  const [activeCategory, setActiveCategory] = useState('aesthetic');
  const visible = FONT_FAMILIES.filter(f => f.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
        {FONT_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            flexShrink: 0, padding: '4px 10px', borderRadius: '99px',
            fontSize: '0.68rem', fontWeight: activeCategory === cat.id ? 700 : 500,
            background: activeCategory === cat.id ? 'var(--accent-lavender-deep)' : 'var(--bg-glass)',
            color: activeCategory === cat.id ? '#fff' : 'var(--text-muted)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>
      <div className="hide-scrollbar" style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {visible.map(f => {
          const isActive = value === f.family;
          return (
            <motion.button key={f.id} onClick={() => onChange(f.family)}
              whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              style={{
                textAlign: 'left', padding: '7px 12px', borderRadius: '8px',
                background: isActive ? 'rgba(155,127,204,0.15)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-lavender-deep)' : 'transparent'}`,
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: f.family, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {previewText || f.preview}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginLeft: '8px', flexShrink: 0 }}>{f.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Individual draggable text item (on the strip overlay) ─────────────────────

function TextItem({ layer, isSelected, onSelect, onUpdate, onDelete, containerRef }) {
  const startPosRef   = useRef(null);
  const startLayerRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    onSelect(layer.id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    startPosRef.current   = { px: e.clientX, py: e.clientY };
    startLayerRef.current = { x: layer.x, y: layer.y };
  }, [layer, onSelect, containerRef]);

  const handlePointerMove = useCallback((e) => {
    if (!startPosRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - startPosRef.current.px) / rect.width)  * 100;
    const dy = ((e.clientY - startPosRef.current.py) / rect.height) * 100;
    onUpdate(layer.id, {
      x: Math.max(2, Math.min(98, startLayerRef.current.x + dx)),
      y: Math.max(2, Math.min(98, startLayerRef.current.y + dy)),
    });
  }, [layer.id, onUpdate, containerRef]);

  const handlePointerUp = useCallback(() => {
    startPosRef.current = null;
    startLayerRef.current = null;
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${layer.x}%`, top: `${layer.y}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation || 0}deg)`,
        cursor: 'grab', touchAction: 'none',
        userSelect: 'none', WebkitUserSelect: 'none',
        zIndex: isSelected ? 200 : 50,
      }}
    >
      <div style={{
        fontFamily: layer.fontFamily,
        fontSize: `${layer.fontSize}px`,
        color: layer.color,
        opacity: layer.opacity,
        fontWeight: layer.bold ? 700 : 400,
        fontStyle: layer.italic ? 'italic' : 'normal',
        textShadow: layer.shadow ? '2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.3)' : 'none',
        WebkitTextStroke: layer.outline ? '1.5px rgba(0,0,0,0.9)' : 'none',
        whiteSpace: 'nowrap', lineHeight: 1.2,
        outline: isSelected ? '2px dashed var(--accent-lavender-deep)' : 'none',
        outlineOffset: '5px',
        padding: '2px 4px', borderRadius: '4px',
      }}>
        {layer.text}
      </div>
      {isSelected && (
        <button
          onPointerDown={e => { e.stopPropagation(); onDelete(layer.id); }}
          style={{
            position: 'absolute', top: '-14px', right: '-14px',
            width: '20px', height: '20px',
            borderRadius: '50%', border: 'none',
            background: '#ef4444', color: '#fff',
            fontSize: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, zIndex: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          }}
        >✕</button>
      )}
    </div>
  );
}

// ── Text edit panel (rendered OUTSIDE the strip by BoothPage) ─────────────────

export function TextEditPanel({ layer, onUpdate, onClose }) {
  const [showFonts, setShowFonts] = useState(false);
  if (!layer) return null;

  return (
    <motion.div
      key={layer.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className="glass-card"
      style={{
        padding: '14px', borderRadius: '16px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        maxHeight: '65vh', overflowY: 'auto',
        width: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>✍️ Edit Text</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
      </div>

      {/* Text input */}
      <input
        type="text"
        value={layer.text}
        onChange={e => onUpdate(layer.id, { text: e.target.value })}
        maxLength={60}
        autoFocus
        style={{
          width: '100%', padding: '10px 12px',
          background: 'var(--bg-secondary)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontFamily: layer.fontFamily,
          fontSize: '0.92rem', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent-lavender-deep)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
      />

      {/* Color + Size */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Color</span>
          <input type="color" value={layer.color}
            onChange={e => onUpdate(layer.id, { color: e.target.value })}
            style={{ width: '30px', height: '30px', borderRadius: '6px', border: 'none', cursor: 'pointer', padding: 0 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '110px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>Size</span>
          <input type="range" min="10" max="80" step="2" value={layer.fontSize}
            onChange={e => onUpdate(layer.id, { fontSize: parseInt(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent-lavender-deep)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-lavender-deep)', fontWeight: 700, minWidth: '26px' }}>
            {layer.fontSize}
          </span>
        </div>
      </div>

      {/* Style toggles */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { key: 'bold',    icon: 'B',   fontWeight: 900 },
          { key: 'italic',  icon: 'I',   fontStyle: 'italic' },
          { key: 'shadow',  icon: '💫',  label: 'Shadow' },
          { key: 'outline', icon: '⬜',  label: 'Outline' },
        ].map(({ key, icon, fontWeight: fw, fontStyle: fs }) => (
          <motion.button key={key}
            onClick={() => onUpdate(layer.id, { [key]: !layer[key] })}
            whileTap={{ scale: 0.93 }}
            style={{
              padding: '5px 12px', borderRadius: '8px',
              background: layer[key] ? 'var(--accent-lavender-deep)' : 'var(--bg-glass)',
              border: `1px solid ${layer[key] ? 'transparent' : 'var(--border-subtle)'}`,
              color: layer[key] ? '#fff' : 'var(--text-muted)',
              fontSize: '0.78rem', fontWeight: fw || 500,
              fontStyle: fs || 'normal', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >{icon}</motion.button>
        ))}
      </div>

      {/* Opacity + Rotation */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '100px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>Opacity</span>
          <input type="range" min="10" max="100" step="5" value={Math.round(layer.opacity * 100)}
            onChange={e => onUpdate(layer.id, { opacity: parseInt(e.target.value) / 100 })}
            style={{ flex: 1, accentColor: 'var(--accent-lavender-deep)', cursor: 'pointer' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '100px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>Rotate</span>
          <input type="range" min="-180" max="180" step="5" value={layer.rotation || 0}
            onChange={e => onUpdate(layer.id, { rotation: parseInt(e.target.value) })}
            style={{ flex: 1, accentColor: 'var(--accent-lavender-deep)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Font selector */}
      <motion.button className="btn btn-ghost btn-sm"
        onClick={() => setShowFonts(p => !p)} whileTap={{ scale: 0.96 }}
        style={{ width: '100%', fontSize: '0.8rem', fontFamily: layer.fontFamily }}
      >
        {showFonts ? '▲ Hide Fonts' : `🔤 Font: ${FONT_FAMILIES.find(f => f.family === layer.fontFamily)?.name || 'Select'}`}
      </motion.button>

      <AnimatePresence>
        {showFonts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <FontSelector
              value={layer.fontFamily}
              onChange={val => onUpdate(layer.id, { fontFamily: val })}
              previewText={layer.text.slice(0, 12) || 'Preview'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main TextEditor (only the overlay layer + items) ─────────────────────────
// FABs and panels are managed by BoothPage for correct z-index/positioning

export default function TextEditor({ readOnly = false }) {
  const { textLayers, addTextLayer, updateTextLayer, removeTextLayer } = useBooth();
  const [selectedId, setSelectedId] = useState(null);
  const layerRef = useRef(null);

  const selectedLayer = textLayers.find(t => t.id === selectedId) || null;

  const handleAddText = useCallback(() => {
    const id = Date.now();
    addTextLayer({ ...DEFAULT_TEXT_LAYER, id,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    });
    setSelectedId(id);
  }, [addTextLayer]);

  const handleLayerClick = useCallback((e) => {
    if (e.target === layerRef.current) setSelectedId(null);
  }, []);

  // Read-only: just render text, no interaction
  if (readOnly) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 15 }}>
        {textLayers.map(l => (
          <div key={l.id} style={{
            position: 'absolute',
            left: `${l.x}%`, top: `${l.y}%`,
            transform: `translate(-50%, -50%) rotate(${l.rotation || 0}deg)`,
            fontFamily: l.fontFamily, fontSize: `${l.fontSize}px`,
            color: l.color, opacity: l.opacity,
            fontWeight: l.bold ? 700 : 400,
            fontStyle: l.italic ? 'italic' : 'normal',
            textShadow: l.shadow ? '2px 2px 6px rgba(0,0,0,0.6)' : 'none',
            WebkitTextStroke: l.outline ? '1px rgba(0,0,0,0.8)' : 'none',
            whiteSpace: 'nowrap', userSelect: 'none',
          }}>{l.text}</div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Overlay layer — sits on top of the strip image */}
      <div
        ref={layerRef}
        onClick={handleLayerClick}
        style={{ position: 'absolute', inset: 0, zIndex: 15, touchAction: 'none' }}
      >
        {textLayers.map(l => (
          <TextItem
            key={l.id}
            layer={l}
            isSelected={selectedId === l.id}
            onSelect={setSelectedId}
            onUpdate={updateTextLayer}
            onDelete={id => { removeTextLayer(id); setSelectedId(null); }}
            containerRef={layerRef}
          />
        ))}
      </div>

      {/* Edit panel + Add button are exposed via separate exports for BoothPage to place */}
      {/* They are accessed via useTextEditorState hook below */}
    </>
  );
}

// ── Hook so BoothPage can access text state & actions ─────────────────────────
export function useTextEditorControls() {
  const { textLayers, addTextLayer, updateTextLayer, removeTextLayer } = useBooth();
  const [selectedId, setSelectedId] = useState(null);

  const selectedLayer = textLayers.find(t => t.id === selectedId) || null;

  const handleAddText = useCallback(() => {
    const id = Date.now();
    addTextLayer({ ...DEFAULT_TEXT_LAYER, id,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
    });
    setSelectedId(id);
  }, [addTextLayer]);

  const deselect = useCallback(() => setSelectedId(null), []);

  return {
    selectedLayer, selectedId, setSelectedId,
    handleAddText, deselect,
    updateTextLayer, removeTextLayer,
    textLayers,
  };
}
