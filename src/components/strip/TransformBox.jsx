import { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useGesture } from '@use-gesture/react';

export default function TransformBox({
  item,
  isSelected,
  onSelect,
  updateItem,
  onDelete,
  onDuplicate,
  onLayerUp,
  onLayerDown,
  layerRef,
  children
}) {
  const boxRef = useRef(null);

  // High performance local state for 60fps rendering without React renders
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);

  // Sync initial state if it changes externally
  useEffect(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
    rotate.set(0);
  }, [item.x, item.y, item.scale, item.rotate, x, y, scale, rotate]);

  // Gestures
  useGesture(
    {
      onDrag: ({ offset: [dx, dy], first, last }) => {
        // Prevent drag if we are resizing or rotating
        if (first) onSelect();
        
        // Convert pixel drag to percentage relative to layer bounds
        if (layerRef?.current) {
          const rect = layerRef.current.getBoundingClientRect();
          const percentX = (dx / rect.width) * 100;
          const percentY = (dy / rect.height) * 100;
          x.set(percentX);
          y.set(percentY);

          if (last) {
            updateItem(item.id, {
              x: item.x + percentX,
              y: item.y + percentY
            });
            x.set(0);
            y.set(0);
          }
        }
      },
      onPinch: ({ offset: [s, a], last }) => {
        scale.set(s);
        rotate.set(a);
        
        if (last) {
          updateItem(item.id, {
            scale: (item.scale || 1) * s,
            rotate: (item.rotate || 0) + a
          });
          scale.set(1);
          rotate.set(0);
        }
      }
    },
    {
      target: boxRef,
      eventOptions: { passive: false },
      drag: { from: () => [0, 0] },
      pinch: { from: () => [1, 0], scaleBounds: { min: 0.2, max: 5 } }
    }
  );

  // Resize Handle Logic
  const handleResize = (e, direction) => {
    e.stopPropagation();
    onSelect();
    
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startScale = item.scale || 1;

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      const dx = currentX - startX;
      const dy = currentY - startY;
      
      // Calculate generic magnitude for proportional scaling
      const distance = Math.sqrt(dx * dx + dy * dy);
      const directionModifier = (direction.includes('top') ? -dy : dy) + (direction.includes('left') ? -dx : dx);
      
      const scaleDelta = (distance / 200) * Math.sign(directionModifier);
      const newScale = Math.max(0.2, Math.min(5, startScale + scaleDelta));
      
      scale.set(newScale / startScale);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      
      const finalScale = startScale * scale.get();
      updateItem(item.id, { scale: finalScale });
      scale.set(1);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  };

  // Rotate Handle Logic
  const handleRotate = (e) => {
    e.stopPropagation();
    onSelect();

    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startX = e.clientX || (e.touches && e.touches[0].clientX);
    const startY = e.clientY || (e.touches && e.touches[0].clientY);
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);
    const itemStartAngle = item.rotate || 0;

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const currentX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const currentY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      
      const currentAngle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
      const deltaAngle = currentAngle - startAngle;
      
      rotate.set(deltaAngle);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      
      const finalAngle = itemStartAngle + rotate.get();
      updateItem(item.id, { rotate: finalAngle });
      rotate.set(0);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  };

  return (
    <motion.div
      ref={boxRef}
      style={{
        position: 'absolute',
        top: `${item.y}%`,
        left: `${item.x}%`,
        transformOrigin: 'center center',
        zIndex: isSelected ? 999 : item.zIndex || 0,
        pointerEvents: 'auto',
        touchAction: 'none', // Critical for preventing scroll while dragging
        userSelect: 'none',
        padding: '8px',
        opacity: item.opacity !== undefined ? item.opacity : 1,
        // Calculate the dynamic transform combining context state + active gesture state
        transform: `translate(-50%, -50%) translate(calc(${x.get()} * 1vw), calc(${y.get()} * 1vh)) scale(${(item.scale || 1) * scale.get()}) rotate(${(item.rotate || 0) + rotate.get()}deg) scaleX(${item.flipX ? -1 : 1})`
      }}
      // Animate dynamic values continuously
      animate={{
        x: `${x.get()}%`,
        y: `${y.get()}%`,
        scale: scale.get() * (item.scale || 1),
        rotate: rotate.get() + (item.rotate || 0),
      }}
      transition={{ type: 'tween', duration: 0 }}
      onPointerDown={(e) => {
        // Prevent event from bubbling up to deselect overlay
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection Box */}
      <div style={{
        position: 'relative',
        display: 'inline-block',
        border: isSelected ? '2px dashed var(--accent-pink)' : '2px dashed transparent',
        padding: '4px',
        transition: 'border-color 0.2s',
      }}>
        {children}

        {/* Transform Controls (Only when selected) */}
        {isSelected && (
          <>
            {/* Top Rotation Handle */}
            <div 
              onPointerDown={handleRotate}
              style={{
                position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', border: '2px solid var(--accent-pink)',
                cursor: 'grab', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ position: 'absolute', top: '16px', left: '6px', width: '2px', height: '12px', background: 'var(--accent-pink)' }} />
            </div>

            {/* Corner Resize Handles */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
              <div
                key={pos}
                onPointerDown={(e) => handleResize(e, pos)}
                style={{
                  position: 'absolute',
                  width: '14px', height: '14px',
                  borderRadius: '50%',
                  background: 'var(--accent-pink)',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  cursor: `${pos.replace('-', '')}-resize`,
                  ...(pos.includes('top') ? { top: '-7px' } : { bottom: '-7px' }),
                  ...(pos.includes('left') ? { left: '-7px' } : { right: '-7px' }),
                }}
              />
            ))}

            {/* Context Toolbar */}
            <div 
              onPointerDown={e => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 16px)', left: '50%', transform: 'translateX(-50%) scaleX(1)',
                background: 'var(--bg-card)', padding: '6px', borderRadius: '8px',
                display: 'flex', gap: '8px', boxShadow: 'var(--shadow-md)',
                pointerEvents: 'auto', border: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap'
              }}
            >
              {item.emoji && <button className="icon-btn" onPointerDown={() => updateItem(item.id, { flipX: !item.flipX })} title="Flip Horizontal">↔️</button>}
              <button className="icon-btn" onPointerDown={() => updateItem(item.id, { opacity: Math.max(0.1, (item.opacity !== undefined ? item.opacity : 1) - 0.2) })} title="Opacity">👻</button>
              <button className="icon-btn" onPointerDown={onLayerUp} title="Bring Forward">⬆️</button>
              <button className="icon-btn" onPointerDown={onLayerDown} title="Send Backward">⬇️</button>
              <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
              {onDuplicate && <button className="icon-btn" onPointerDown={onDuplicate} title="Duplicate">📋</button>}
              <button className="icon-btn" onPointerDown={onDelete} title="Delete">🗑️</button>
              <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
              <button className="icon-btn" onPointerDown={() => onSelect(null)} title="Done">✔️</button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
