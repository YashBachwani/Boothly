import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { STICKERS, STICKER_CATEGORIES } from '../../constants';

export default function StickerLayer({ readOnly = false }) {
  const { stickers, setStickers } = useBooth();
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const layerRef = useRef(null);

  const addSticker = (emoji) => {
    setStickers([...stickers, { id: Date.now(), emoji, x: 50, y: 50, scale: 1, rotate: 0 }]);
    setShowPicker(false);
  };

  const updateSticker = (id, newProps) => {
    setStickers(stickers.map(s => s.id === id ? { ...s, ...newProps } : s));
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  return (
    <>
      {/* Container overlay over the strip canvas */}
      <div
        id="sticker-layer"
        ref={layerRef}
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {stickers.map((sticker, i) => {
          if (readOnly) {
            return (
              <div
                key={sticker.id}
                style={{
                  position: 'absolute',
                  top: `${sticker.y}%`, left: `${sticker.x}%`,
                  fontSize: '48px',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {sticker.emoji}
              </div>
            );
          }

          return (
            <motion.div
              key={`${sticker.id}-${sticker.x}-${sticker.y}`}
              drag
              dragMomentum={false}
              dragConstraints={layerRef}
              onDragEnd={(e, info) => {
                if (!layerRef.current) return;
                const rect = layerRef.current.getBoundingClientRect();
                const newX = sticker.x + (info.offset.x / rect.width) * 100;
                const newY = sticker.y + (info.offset.y / rect.height) * 100;
                updateSticker(sticker.id, { x: newX, y: newY });
              }}
              style={{
                position: 'absolute',
                top: `${sticker.y}%`, left: `${sticker.x}%`,
                fontSize: '48px',
                pointerEvents: 'auto',
                cursor: 'grab',
                userSelect: 'none',
                lineHeight: 1,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ cursor: 'grabbing', scale: 0.9 }}
              onDoubleClick={() => removeSticker(sticker.id)}
            >
              {sticker.emoji}
              <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 4px', borderRadius: '4px', opacity: 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }} className="sticker-hint">
                Double click to delete
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Add Sticker Button */}
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
              {/* Categories */}
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

              {/* Stickers Grid */}
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
              
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px' }}>
                Double-click a sticker to remove it
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      
      {!readOnly && (
        <style dangerouslySetInnerHTML={{__html:`
          .sticker-hint { opacity: 0; }
          div:hover > .sticker-hint { opacity: 1; }
        `}} />
      )}
    </>
  );
}
