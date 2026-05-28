import { useState, useRef, useEffect } from 'react';
import { useBooth } from '../../context/BoothContext';

// Sub-component: drag, resize, rotate, touch interaction on canvas
function DraggableSticker({ sticker, isSelected, layerRef, updateSticker, setSelectedId, bringForward, sendBackward, removeSticker, duplicateSticker }) {
  const elementRef = useRef(null);
  const pointerTracker = useRef({
    type: null,
    startX: 0, startY: 0,
    initX: 0, initY: 0,
    initScale: 1, initRotate: 0,
    centerX: 0, centerY: 0,
    initDist: 0, initAngle: 0,
    pointers: {},
  });

  const [isHovered, setIsHovered] = useState(false);
  const [showSnapX, setShowSnapX] = useState(false);
  const [showSnapY, setShowSnapY] = useState(false);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setSelectedId(sticker.id);

    pointerTracker.current.pointers[e.pointerId] = { clientX: e.clientX, clientY: e.clientY };
    const activePointers = Object.values(pointerTracker.current.pointers);

    if (activePointers.length === 2) {
      const [p1, p2] = activePointers;
      pointerTracker.current.type = 'pinch';
      pointerTracker.current.initDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      pointerTracker.current.initAngle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
      pointerTracker.current.initScale = sticker.scale || 1;
      pointerTracker.current.initRotate = sticker.rotate || 0;
      elementRef.current?.setPointerCapture(e.pointerId);
      return;
    }

    if (e.target.closest('.handle-dot') || e.target.closest('.rotate-handle') || e.target.closest('.mini-action-btn')) return;

    pointerTracker.current.type = 'drag';
    pointerTracker.current.startX = e.clientX;
    pointerTracker.current.startY = e.clientY;
    pointerTracker.current.initX = sticker.x;
    pointerTracker.current.initY = sticker.y;
    elementRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!pointerTracker.current.type) return;
    if (pointerTracker.current.pointers[e.pointerId]) {
      pointerTracker.current.pointers[e.pointerId] = { clientX: e.clientX, clientY: e.clientY };
    }
    const tracker = pointerTracker.current;

    if (tracker.type === 'pinch') {
      const pts = Object.values(tracker.pointers);
      if (pts.length === 2) {
        const [p1, p2] = pts;
        const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
        const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
        updateSticker(sticker.id, {
          scale: Math.max(0.2, Math.min(4, tracker.initScale * (dist / tracker.initDist))),
          rotate: (tracker.initRotate + angle - tracker.initAngle) % 360,
        });
      }
      return;
    }

    if (tracker.type === 'drag' && layerRef.current) {
      const rect = layerRef.current.getBoundingClientRect();
      let newX = tracker.initX + ((e.clientX - tracker.startX) / rect.width) * 100;
      let newY = tracker.initY + ((e.clientY - tracker.startY) / rect.height) * 100;
      const snap = 3;
      const sX = Math.abs(newX - 50) < snap;
      const sY = Math.abs(newY - 50) < snap;
      if (sX) newX = 50;
      if (sY) newY = 50;
      setShowSnapX(sX);
      setShowSnapY(sY);
      updateSticker(sticker.id, { x: newX, y: newY });
    } else if (tracker.type === 'resize') {
      const dist = Math.hypot(e.clientX - tracker.centerX, e.clientY - tracker.centerY);
      updateSticker(sticker.id, { scale: Math.max(0.2, Math.min(4, tracker.initScale * (dist / tracker.initDist))) });
    } else if (tracker.type === 'rotate') {
      const angle = Math.atan2(e.clientY - tracker.centerY, e.clientX - tracker.centerX) * (180 / Math.PI);
      updateSticker(sticker.id, { rotate: (tracker.initRotate + angle - tracker.initAngle) % 360 });
    }
  };

  const handlePointerUp = (e) => {
    delete pointerTracker.current.pointers[e.pointerId];
    try { elementRef.current?.releasePointerCapture(e.pointerId); } catch (_) {}
    if (Object.keys(pointerTracker.current.pointers).length === 0) {
      pointerTracker.current.type = null;
      setShowSnapX(false);
      setShowSnapY(false);
    } else if (Object.keys(pointerTracker.current.pointers).length === 1 && pointerTracker.current.type === 'pinch') {
      pointerTracker.current.type = null;
    }
  };

  const startResize = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    Object.assign(pointerTracker.current, {
      type: 'resize', centerX: cx, centerY: cy,
      initDist: Math.hypot(e.clientX - cx, e.clientY - cy),
      initScale: sticker.scale || 1,
    });
  };

  const startRotate = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    Object.assign(pointerTracker.current, {
      type: 'rotate', centerX: cx, centerY: cy,
      initAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
      initRotate: sticker.rotate || 0,
    });
  };

  return (
    <>
      {showSnapX && <div style={{ position:'absolute', top:0, bottom:0, left:'50%', width:'1px', borderLeft:'1px dashed #ff6eb4', zIndex:900, pointerEvents:'none' }} />}
      {showSnapY && <div style={{ position:'absolute', left:0, right:0, top:'50%', height:'1px', borderTop:'1px dashed #ff6eb4', zIndex:900, pointerEvents:'none' }} />}

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
          top: `${sticker.y}%`, left: `${sticker.x}%`,
          fontSize: '48px',
          pointerEvents: 'auto',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none',
          lineHeight: 1,
          zIndex: isSelected ? 999 : sticker.zIndex || 0,
          transform: `translate(-50%, -50%) scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg) scaleX(${sticker.flipX ? -1 : 1})`,
          opacity: sticker.opacity !== undefined ? sticker.opacity : 1,
          padding: '8px',
        }}
      >
        <div style={{ pointerEvents: 'none' }}>{sticker.emoji}</div>

        {/* Selection / hover outline */}
        {(isSelected || isHovered) && (
          <div style={{
            position: 'absolute', inset: '2px',
            border: `2px ${isSelected ? 'solid' : 'dashed'} #ff6eb4`,
            borderRadius: '4px', pointerEvents: 'none', zIndex: 1,
          }} />
        )}

        {isSelected && (
          <>
            {/* Corner resize handles */}
            <div className="sl-handle top-left"   onPointerDown={startResize} />
            <div className="sl-handle top-right"  onPointerDown={startResize} />
            <div className="sl-handle bottom-left"  onPointerDown={startResize} />
            <div className="sl-handle bottom-right" onPointerDown={startResize} />

            {/* Rotation line + handle */}
            <div style={{ position:'absolute', top:'-20px', left:'50%', width:'2px', height:'20px', background:'#ff6eb4', transform:'translateX(-50%)', pointerEvents:'none' }} />
            <div
              className="sl-rotate-handle"
              onPointerDown={startRotate}
              style={{ position:'absolute', top:'-36px', left:'50%', transform:'translateX(-50%)', width:'20px', height:'20px', background:'#fff', border:'2px solid #ff6eb4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', cursor:'grab', zIndex:10, pointerEvents:'auto' }}
            >🔄</div>

            {/* Mini quick-action bar — appears ABOVE the sticker, never clips below strip */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '4px',
                padding: '4px 8px',
                background: 'rgba(15,15,20,0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,110,180,0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                zIndex: 1000,
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
              }}
            >
              {[
                { icon: '↔️', title: 'Flip', action: () => updateSticker(sticker.id, { flipX: !sticker.flipX }) },
                { icon: '⬆️', title: 'Front', action: () => bringForward(sticker.id) },
                { icon: '⬇️', title: 'Back', action: () => sendBackward(sticker.id) },
                { icon: '👯', title: 'Dupe', action: () => duplicateSticker(sticker.id) },
                { icon: '🗑️', title: 'Del', action: () => removeSticker(sticker.id) },
                { icon: '✔️', title: 'Done', action: () => setSelectedId(null) },
              ].map(({ icon, title, action }) => (
                <button key={title} className="mini-action-btn" title={title} onPointerDown={action}
                  style={{ background:'transparent', border:'none', fontSize:'13px', cursor:'pointer', padding:'2px 3px', borderRadius:'4px', display:'flex', alignItems:'center' }}>
                  {icon}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html:`
        .sl-handle { position:absolute; width:16px; height:16px; background:#fff; border:2px solid #ff6eb4; border-radius:50%; z-index:10; pointer-events:auto; }
        .sl-handle.top-left { top:-8px; left:-8px; cursor:nwse-resize; }
        .sl-handle.top-right { top:-8px; right:-8px; cursor:nesw-resize; }
        .sl-handle.bottom-left { bottom:-8px; left:-8px; cursor:nesw-resize; }
        .sl-handle.bottom-right { bottom:-8px; right:-8px; cursor:nwse-resize; }
        .sl-rotate-handle:active { cursor:grabbing; }
      `}} />
    </>
  );
}

// Main StickerLayer — canvas only; no floating picker UI here
export default function StickerLayer({ readOnly = false, selectedId, setSelectedId }) {
  const { stickers, setStickers } = useBooth();
  const layerRef = useRef(null);

  // Internal fallback state if not driven externally
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const activeSelectedId = selectedId !== undefined ? selectedId : internalSelectedId;
  const activeSetSelectedId = setSelectedId !== undefined ? setSelectedId : setInternalSelectedId;

  useEffect(() => {
    if (readOnly) return;
    const handle = (e) => {
      if (layerRef.current && e.target === layerRef.current) activeSetSelectedId(null);
    };
    window.addEventListener('pointerdown', handle);
    return () => window.removeEventListener('pointerdown', handle);
  }, [readOnly, activeSetSelectedId]);

  const updateSticker = (id, props) => setStickers(stickers.map(s => s.id === id ? { ...s, ...props } : s));
  const removeSticker = (id) => { setStickers(stickers.filter(s => s.id !== id)); if (activeSelectedId === id) activeSetSelectedId(null); };
  const duplicateSticker = (id) => {
    const orig = stickers.find(s => s.id === id); if (!orig) return;
    const copy = { ...orig, id: Date.now() + Math.random(), x: Math.min(90, orig.x + 5), y: Math.min(90, orig.y + 5), zIndex: stickers.length };
    setStickers([...stickers, copy]); activeSetSelectedId(copy.id);
  };
  const bringForward = (id) => { const s = stickers.find(s => s.id === id); if (s) updateSticker(id, { zIndex: s.zIndex + 1 }); };
  const sendBackward = (id) => { const s = stickers.find(s => s.id === id); if (s && s.zIndex > 0) updateSticker(id, { zIndex: s.zIndex - 1 }); };

  return (
    <div id="sticker-layer" ref={layerRef} style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible', zIndex:10 }}>
      {stickers.slice().sort((a, b) => (a.zIndex||0) - (b.zIndex||0)).map(sticker => {
        if (readOnly) {
          return (
            <div key={sticker.id} style={{
              position:'absolute', top:`${sticker.y}%`, left:`${sticker.x}%`, fontSize:'48px', lineHeight:1, userSelect:'none',
              transform:`translate(-50%,-50%) scale(${sticker.scale||1}) rotate(${sticker.rotate||0}deg) scaleX(${sticker.flipX?-1:1})`,
              opacity: sticker.opacity !== undefined ? sticker.opacity : 1, zIndex: sticker.zIndex || 0,
            }}>{sticker.emoji}</div>
          );
        }
        return (
          <DraggableSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={activeSelectedId === sticker.id}
            layerRef={layerRef}
            updateSticker={updateSticker}
            setSelectedId={activeSetSelectedId}
            bringForward={bringForward}
            sendBackward={sendBackward}
            removeSticker={removeSticker}
            duplicateSticker={duplicateSticker}
          />
        );
      })}
    </div>
  );
}
