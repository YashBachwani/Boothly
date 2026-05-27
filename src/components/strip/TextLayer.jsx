import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { FONTS, FONT_CATEGORIES } from '../../constants';

// Sub-component for premium drag, resize, rotate, and touch interaction
function DraggableText({ tLayer, isSelected, layerRef, updateText, setSelectedId, setShowEditor, bringForward, sendBackward, removeText, duplicateText, textStyle }) {
  const elementRef = useRef(null);
  const pointerTracker = useRef({
    type: null, // 'drag' | 'resize' | 'rotate'
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    initScale: 1,
    initRotate: 0,
    centerX: 0,
    centerY: 0,
    initDist: 0,
    initAngle: 0,
    pointers: {}, // For multi-touch pinching
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showSnapX, setShowSnapX] = useState(false);
  const [showSnapY, setShowSnapY] = useState(false);

  // Handle pointer down on the text (Drag/Select/Multi-touch)
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setSelectedId(tLayer.id);
    setShowEditor(true);

    // Save active pointer for multi-touch detection
    pointerTracker.current.pointers[e.pointerId] = { clientX: e.clientX, clientY: e.clientY };
    const activePointers = Object.values(pointerTracker.current.pointers);

    if (activePointers.length === 2) {
      // Initialize pinch-zoom / rotate
      const [p1, p2] = activePointers;
      pointerTracker.current.type = 'pinch';
      pointerTracker.current.initDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      pointerTracker.current.initAngle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
      pointerTracker.current.initScale = tLayer.scale || 1;
      pointerTracker.current.initRotate = tLayer.rotate || 0;
      elementRef.current.setPointerCapture(e.pointerId);
      return;
    }

    if (e.target.closest('.control-btn') || e.target.closest('.handle-dot') || e.target.closest('.rotate-handle')) {
      // Do not start drag if clicking interactive handles
      return;
    }

    pointerTracker.current.type = 'drag';
    pointerTracker.current.startX = e.clientX;
    pointerTracker.current.startY = e.clientY;
    pointerTracker.current.initX = tLayer.x;
    pointerTracker.current.initY = tLayer.y;

    elementRef.current.setPointerCapture(e.pointerId);
  };

  // Handle pointer move
  const handlePointerMove = (e) => {
    if (!pointerTracker.current.type) return;

    // Update active pointer location
    if (pointerTracker.current.pointers[e.pointerId]) {
      pointerTracker.current.pointers[e.pointerId] = { clientX: e.clientX, clientY: e.clientY };
    }

    const tracker = pointerTracker.current;

    if (tracker.type === 'pinch') {
      const activePointers = Object.values(tracker.pointers);
      if (activePointers.length === 2) {
        const [p1, p2] = activePointers;
        const currentDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
        const currentAngle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
        
        const scaleFactor = currentDist / tracker.initDist;
        const angleDiff = currentAngle - tracker.initAngle;

        updateText(tLayer.id, {
          scale: Math.max(0.2, Math.min(4, tracker.initScale * scaleFactor)),
          rotate: (tracker.initRotate + angleDiff) % 360,
        });
      }
      return;
    }

    if (tracker.type === 'drag' && layerRef.current) {
      const rect = layerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - tracker.startX;
      const deltaY = e.clientY - tracker.startY;

      let newX = tracker.initX + (deltaX / rect.width) * 100;
      let newY = tracker.initY + (deltaY / rect.height) * 100;

      // Smart Snapping alignment guides (Snaps to horizontal and vertical center)
      const snapThreshold = 3; // percentage limit to trigger snap
      let snapX = false;
      let snapY = false;

      if (Math.abs(newX - 50) < snapThreshold) {
        newX = 50;
        snapX = true;
      }
      if (Math.abs(newY - 50) < snapThreshold) {
        newY = 50;
        snapY = true;
      }

      setShowSnapX(snapX);
      setShowSnapY(snapY);

      updateText(tLayer.id, { x: newX, y: newY });
    } else if (tracker.type === 'resize') {
      const currentDist = Math.hypot(e.clientX - tracker.centerX, e.clientY - tracker.centerY);
      const newScale = Math.max(0.2, Math.min(4, tracker.initScale * (currentDist / tracker.initDist)));
      updateText(tLayer.id, { scale: newScale });
    } else if (tracker.type === 'rotate') {
      const currentAngle = Math.atan2(e.clientY - tracker.centerY, e.clientX - tracker.centerX) * (180 / Math.PI);
      const angleDiff = currentAngle - tracker.initAngle;
      updateText(tLayer.id, { rotate: (tracker.initRotate + angleDiff) % 360 });
    }
  };

  // Handle pointer up / cancel
  const handlePointerUp = (e) => {
    delete pointerTracker.current.pointers[e.pointerId];
    if (elementRef.current && e.pointerId !== undefined) {
      try {
        elementRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    const activePointers = Object.values(pointerTracker.current.pointers);
    if (activePointers.length === 0) {
      pointerTracker.current.type = null;
      setShowSnapX(false);
      setShowSnapY(false);
    } else if (activePointers.length === 1 && pointerTracker.current.type === 'pinch') {
      // Revert to simple drag if down to 1 finger
      pointerTracker.current.type = null;
    }
  };

  // Start resize transformation
  const startResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pointerTracker.current = {
      ...pointerTracker.current,
      type: 'resize',
      centerX,
      centerY,
      initDist: Math.hypot(e.clientX - centerX, e.clientY - centerY),
      initScale: tLayer.scale || 1,
    };
  };

  // Start rotation transformation
  const startRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pointerTracker.current = {
      ...pointerTracker.current,
      type: 'rotate',
      centerX,
      centerY,
      initAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI),
      initRotate: tLayer.rotate || 0,
    };
  };

  return (
    <>
      {/* Dynamic Snap Guidelines */}
      {showSnapX && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%',
          width: '1px', borderLeft: '1px dashed var(--accent-pink)',
          zIndex: 900, pointerEvents: 'none'
        }} />
      )}
      {showSnapY && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%',
          height: '1px', borderTop: '1px dashed var(--accent-pink)',
          zIndex: 900, pointerEvents: 'none'
        }} />
      )}

      <div
        ref={elementRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          top: `${tLayer.y}%`,
          left: `${tLayer.x}%`,
          fontSize: '32px',
          pointerEvents: 'auto',
          cursor: pointerTracker.current.type === 'drag' ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          lineHeight: 1.2,
          zIndex: isSelected ? 999 : tLayer.zIndex || 0,
          transform: `translate(-50%, -50%) scale(${tLayer.scale || 1}) rotate(${tLayer.rotate || 0}deg)`,
          opacity: tLayer.opacity !== undefined ? tLayer.opacity : 1,
          padding: '8px',
          transition: pointerTracker.current.type ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)',
          ...textStyle
        }}
      >
        {/* Render Text Content */}
        <div style={{ pointerEvents: 'none' }}>
          {tLayer.text}
        </div>

        {/* Bounding Box Outline (Selected or Hovered State) */}
        {(isSelected || isHovered) && (
          <div style={{
            position: 'absolute',
            inset: '2px',
            border: `2px ${isSelected ? 'solid' : 'dashed'} var(--accent-pink)`,
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1,
          }} />
        )}

        {/* Professional Corner Resize Handles */}
        {isSelected && (
          <>
            {/* Corner Resize Handles */}
            <div className="handle-dot top-left" onPointerDown={startResize} />
            <div className="handle-dot top-right" onPointerDown={startResize} />
            <div className="handle-dot bottom-left" onPointerDown={startResize} />
            <div className="handle-dot bottom-right" onPointerDown={startResize} />

            {/* Rotation Handle (At top center) */}
            <div className="rotate-line" />
            <div className="rotate-handle" onPointerDown={startRotate}>
              🔄
            </div>

            {/* Premium Interactive Action Floating Toolbar */}
            <div
              className="text-toolbar glass-card"
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 16px)',
                left: '50%',
                transform: 'translateX(-50%) scale(calc(1 / var(--text-scale, 1)))',
                transformOrigin: 'top center',
                display: 'flex',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '20px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                zIndex: 1000,
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
              }}
            >
              <button className="icon-btn control-btn" title="Layer Up" onPointerDown={() => bringForward(tLayer.id)}>⬆️</button>
              <button className="icon-btn control-btn" title="Layer Down" onPointerDown={() => sendBackward(tLayer.id)}>⬇️</button>
              <button className="icon-btn control-btn" title="Duplicate" onPointerDown={() => duplicateText(tLayer.id)}>👯</button>
              <button className="icon-btn control-btn" title="Delete" onPointerDown={() => removeText(tLayer.id)}>🗑️</button>
              <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
              <button className="icon-btn control-btn active" title="Deselect" onPointerDown={() => { setSelectedId(null); setShowEditor(false); }}>✔️</button>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .handle-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #fff;
          border: 2px solid var(--accent-pink);
          border-radius: 50%;
          z-index: 10;
          pointer-events: auto;
        }
        .handle-dot.top-left { top: -6px; left: -6px; cursor: nwse-resize; }
        .handle-dot.top-right { top: -6px; right: -6px; cursor: nesw-resize; }
        .handle-dot.bottom-left { bottom: -6px; left: -6px; cursor: nesw-resize; }
        .handle-dot.bottom-right { bottom: -6px; right: -6px; cursor: nwse-resize; }

        .rotate-line {
          position: absolute;
          top: -20px;
          left: 50%;
          width: 2px;
          height: 20px;
          background: var(--accent-pink);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 9;
        }
        .rotate-handle {
          position: absolute;
          top: -36px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 22px;
          background: #fff;
          border: 2px solid var(--accent-pink);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: grab;
          z-index: 10;
          pointer-events: auto;
          box-shadow: var(--shadow-sm);
        }
        .rotate-handle:active {
          cursor: grabbing;
        }
        .text-toolbar {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
        }
      `}} />
    </>
  );
}

export default function TextLayer({ readOnly = false }) {
  const { textLayers, setTextLayers } = useBooth();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const layerRef = useRef(null);

  // Global deselect click handler on window
  useEffect(() => {
    if (readOnly) return;
    const handleGlobalClick = (e) => {
      if (layerRef.current && layerRef.current.contains(e.target)) {
        if (e.target.id === 'text-layer') {
          setSelectedId(null);
          setShowEditor(false);
        }
      }
    };
    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, [readOnly]);

  const addTextLayer = () => {
    const newLayer = {
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
    };
    setTextLayers([...textLayers, newLayer]);
    setSelectedId(newLayer.id);
    setShowEditor(true);
  };

  const updateText = (id, newProps) => {
    setTextLayers(textLayers.map(t => t.id === id ? { ...t, ...newProps } : t));
  };

  const removeText = (id) => {
    setTextLayers(textLayers.filter(t => t.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setShowEditor(false);
    }
  };

  const duplicateText = (id) => {
    const original = textLayers.find(t => t.id === id);
    if (!original) return;
    const copy = {
      ...original,
      id: Date.now() + Math.random(),
      x: Math.min(90, original.x + 5),
      y: Math.min(90, original.y + 5),
      zIndex: textLayers.length
    };
    setTextLayers([...textLayers, copy]);
    setSelectedId(copy.id);
    setShowEditor(true);
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
        style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 15,
        }}
      >
        {textLayers.slice().sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((tLayer) => {
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
                  fontSize: '32px',
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
            <DraggableText
              key={tLayer.id}
              tLayer={tLayer}
              isSelected={isSelected}
              layerRef={layerRef}
              updateText={updateText}
              setSelectedId={setSelectedId}
              setShowEditor={setShowEditor}
              bringForward={bringForward}
              sendBackward={sendBackward}
              removeText={removeText}
              duplicateText={duplicateText}
              textStyle={textStyle}
            />
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
