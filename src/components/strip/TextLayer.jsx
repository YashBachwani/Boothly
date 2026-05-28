import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { FONTS, FONT_CATEGORIES } from '../../constants';
import TransformBox from './TransformBox';

export default function TextLayer({ readOnly = false, scaleFactor = 1 }) {
  const { textLayers, setTextLayers } = useBooth();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const layerRef = useRef(null);

  const addTextLayer = () => {
    setTextLayers([...textLayers, {
      id: Date.now(),
      text: 'New Text',
      x: 50, y: 50,
      scale: 1, rotate: 0,
      opacity: 1,
      color: '#ffffff',
      font: FONTS[0].family,
      shadow: false,
      outline: false,
      zIndex: textLayers.length
    }]);
    setShowEditor(false);
  };

  const updateText = (id, newProps) => {
    setTextLayers(textLayers.map(t => t.id === id ? { ...t, ...newProps } : t));
  };

  const removeText = (id) => {
    setTextLayers(textLayers.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const bringForward = (id) => {
    const t = textLayers.find(x => x.id === id);
    if (t) updateText(id, { zIndex: t.zIndex + 1 });
  };

  const sendBackward = (id) => {
    const t = textLayers.find(x => x.id === id);
    if (t && t.zIndex > 0) updateText(id, { zIndex: t.zIndex - 1 });
  };

  const activeText = textLayers.find(t => t.id === selectedId);

  return (
    <>
      <div
        id="text-layer"
        ref={layerRef}
        onClick={(e) => {
          if (e.target.id === 'text-layer') {
            setSelectedId(null);
            setShowEditor(false);
          }
        }}
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 15,
        }}
      >
        {textLayers.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((tLayer) => {
          const isSelected = selectedId === tLayer.id;

          const textStyle = {
            fontFamily: tLayer.font,
            color: tLayer.color,
            textShadow: tLayer.shadow ? '0 2px 10px rgba(0,0,0,0.5)' : (tLayer.outline ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' : 'none'),
            opacity: tLayer.opacity !== undefined ? tLayer.opacity : 1,
            whiteSpace: 'nowrap',
          };

          if (readOnly) {
            return (
              <div
                key={tLayer.id}
                style={{
                  position: 'absolute',
                  top: `${tLayer.y}%`, left: `${tLayer.x}%`,
                  fontSize: `${32 * scaleFactor}px`,
                  lineHeight: 1.2,
                  userSelect: 'none',
                  transform: `translate(-50%, -50%) scale(${tLayer.scale || 1}) rotate(${tLayer.rotate || 0}deg)`,
                  zIndex: tLayer.zIndex || 0,
                  ...textStyle
                }}
              >
                {tLayer.text}
              </div>
            );
          }

          return (
            <TransformBox
              key={tLayer.id}
              item={tLayer}
              isSelected={isSelected}
              onSelect={(id = tLayer.id) => {
                setSelectedId(id);
                if (id) setShowEditor(true);
              }}
              updateItem={updateText}
              onDelete={() => { removeText(tLayer.id); setShowEditor(false); }}
              onDuplicate={() => addTextLayer()} // Not quite duplicate but adds a new one
              onLayerUp={() => bringForward(tLayer.id)}
              onLayerDown={() => sendBackward(tLayer.id)}
              layerRef={layerRef}
            >
              <div style={{ fontSize: `${32 * scaleFactor}px`, lineHeight: 1.2, whiteSpace: 'nowrap', ...textStyle }}>
                {tLayer.text}
              </div>
            </TransformBox>
          );
        })}
      </div>

      {!readOnly && (
        <motion.button
          className="btn btn-primary"
          onClick={() => {
            if (!activeText) addTextLayer();
            else setShowEditor(!showEditor);
          }}
          style={{
            position: 'absolute', bottom: '16px', right: '76px',
            width: '50px', height: '50px', borderRadius: '50%',
            padding: 0, fontSize: '24px',
            zIndex: 20, boxShadow: 'var(--shadow-lg)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          T
        </motion.button>
      )}

      {!readOnly && activeText && showEditor && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-card"
            style={{
              position: 'absolute', bottom: '80px', right: '16px',
              width: '300px', padding: '16px', zIndex: 20,
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}
          >
            <input
              type="text"
              value={activeText.text}
              onChange={(e) => updateText(activeText.id, { text: e.target.value })}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%' }}
              placeholder="Enter text..."
            />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <input type="color" value={activeText.color} onChange={(e) => updateText(activeText.id, { color: e.target.value })} style={{ width: '32px', height: '32px', cursor: 'pointer', padding: 0, border: 'none', borderRadius: '4px' }} />
              <button className="btn btn-ghost btn-sm" onClick={() => updateText(activeText.id, { shadow: !activeText.shadow })} style={{ background: activeText.shadow ? 'var(--bg-glass)' : 'transparent' }}>Shadow</button>
              <button className="btn btn-ghost btn-sm" onClick={() => updateText(activeText.id, { outline: !activeText.outline })} style={{ background: activeText.outline ? 'var(--bg-glass)' : 'transparent' }}>Outline</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Opacity</span>
              <input type="range" min="0.1" max="1" step="0.1" value={activeText.opacity !== undefined ? activeText.opacity : 1} onChange={(e) => updateText(activeText.id, { opacity: parseFloat(e.target.value) })} style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }} className="hide-scrollbar">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fonts</span>
              {FONT_CATEGORIES.map(cat => (
                <div key={cat}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '4px' }}>{cat}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {FONTS.filter(f => f.category === cat).map(f => (
                      <button
                        key={f.id}
                        onClick={() => updateText(activeText.id, { font: f.family })}
                        style={{
                          padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)',
                          background: activeText.font === f.family ? 'var(--accent-pink)' : 'var(--bg-secondary)',
                          color: activeText.font === f.family ? '#fff' : 'var(--text-primary)',
                          fontFamily: f.family, fontSize: '14px', cursor: 'pointer'
                        }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
