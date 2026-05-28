import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { STICKERS, STICKER_CATEGORIES } from '../../constants';
import TransformBox from './TransformBox';

export default function StickerLayer({ readOnly = false, scaleFactor = 1 }) {
  const { stickers, setStickers } = useBooth();
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const layerRef = useRef(null);

  const addSticker = (emoji) => {
    setStickers([...stickers, { 
      id: Date.now(), emoji, 
      x: 50, y: 50, 
      scale: 1, rotate: 0, 
      opacity: 1, flipX: false, zIndex: stickers.length 
    }]);
    setShowPicker(false);
  };

  const updateSticker = (id, newProps) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...newProps } : s));
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const bringForward = (id) => {
    const s = stickers.find(s => s.id === id);
    if (s) updateSticker(id, { zIndex: s.zIndex + 1 });
  };

  const sendBackward = (id) => {
    const s = stickers.find(s => s.id === id);
    if (s && s.zIndex > 0) updateSticker(id, { zIndex: s.zIndex - 1 });
  };

  return (
    <>
      <div
        id="sticker-layer"
        ref={layerRef}
        onClick={(e) => {
          if (e.target.id === 'sticker-layer') setSelectedId(null);
        }}
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {stickers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((sticker) => {
          if (readOnly) {
            return (
              <div
                key={sticker.id}
                style={{
                  position: 'absolute',
                  top: `${sticker.y}%`, left: `${sticker.x}%`,
                  fontSize: `${48 * scaleFactor}px`,
                  lineHeight: 1,
                  userSelect: 'none',
                  transform: `translate(-50%, -50%) scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg) scaleX(${sticker.flipX ? -1 : 1})`,
                  opacity: sticker.opacity !== undefined ? sticker.opacity : 1,
                  zIndex: sticker.zIndex || 0
                }}
              >
                {sticker.emoji}
              </div>
            );
          }

          const isSelected = selectedId === sticker.id;

          return (
            <TransformBox
              key={sticker.id}
              item={sticker}
              isSelected={isSelected}
              onSelect={(id = sticker.id) => setSelectedId(id)}
              updateItem={updateSticker}
              onDelete={() => removeSticker(sticker.id)}
              onDuplicate={() => addSticker(sticker.emoji)}
              onLayerUp={() => bringForward(sticker.id)}
              onLayerDown={() => sendBackward(sticker.id)}
              layerRef={layerRef}
            >
              <div style={{ fontSize: `${48 * scaleFactor}px`, lineHeight: 1 }}>
                {sticker.emoji}
              </div>
            </TransformBox>
          );
        })}
      </div>

      {!readOnly && (
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowPicker(!showPicker)}
          style={{
            position: 'absolute', bottom: '16px', right: '16px',
            width: '50px', height: '50px', borderRadius: '50%',
            padding: 0, fontSize: '24px',
            zIndex: 20, boxShadow: 'var(--shadow-lg)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✨
        </motion.button>
      )}

      {!readOnly && (
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="glass-card"
              style={{
                position: 'absolute', bottom: '80px', right: '16px',
                width: '280px', padding: '16px', zIndex: 20,
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
                {STICKER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '6px 12px', borderRadius: '16px',
                      background: activeCategory === cat ? 'var(--accent-pink)' : 'var(--bg-glass)',
                      color: activeCategory === cat ? '#fff' : 'var(--text-primary)',
                      border: 'none', fontSize: '0.8rem', cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px', maxHeight: '160px', overflowY: 'auto',
                padding: '4px',
              }} className="hide-scrollbar">
                {STICKERS.filter(s => s.category === activeCategory).map(s => (
                  <motion.button
                    key={s.id}
                    onClick={() => addSticker(s.emoji)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'transparent', border: 'none',
                      fontSize: '28px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {s.emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <style dangerouslySetInnerHTML={{__html:`
        .icon-btn {
          background: transparent; border: none; font-size: 14px; cursor: pointer; padding: 2px;
          border-radius: 4px; display: flex; align-items: center; justify-content: center;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </>
  );
}
