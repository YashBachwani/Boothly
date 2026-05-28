import { useEffect, useState } from 'react';
import { useBooth } from '../../context/BoothContext';
import { generateStrip } from '../../utils/stripBuilder';
import StickerLayer from './StickerLayer';
import TextLayer from './TextLayer';

export default function StripCanvas({ readOnly = false, selectedStickerId, setSelectedStickerId, selectedTextId, setSelectedTextId }) {
  const { photos, stripLayout, stripTheme, currentBackground, customText } = useBooth();
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateStrip({
      photos: photos.length > 0 ? photos : ['/assets/placeholder.jpg'],
      layout: stripLayout,
      themeId: stripTheme,
      backgroundId: currentBackground,
      customText,
      showDate: true,
    }).then(url => {
      if (active) { setDataUrl(url); setLoading(false); }
    });

    return () => { active = false; };
  }, [photos, stripLayout, stripTheme, currentBackground, customText]);

  const handleZoomOut = () => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))));
  const handleZoomIn = () => setZoom(z => Math.min(2.0, parseFloat((z + 0.1).toFixed(1))));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      gap: '16px',
    }}>
      {/* Zoom and Workspace Control Bar */}
      {!readOnly && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'var(--bg-glass)',
          borderRadius: '30px',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 100,
          userSelect: 'none',
        }}>
          <button 
            onClick={handleZoomOut} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', padding: '6px' }} 
            title="Zoom Out"
          >
            ➖
          </button>
          <span style={{ fontSize: '0.78rem', fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)', minWidth: '46px', textAlign: 'center', fontWeight: 'bold' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={handleZoomIn} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', padding: '6px' }} 
            title="Zoom In"
          >
            ➕
          </button>
          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <button 
            onClick={() => setZoom(1.0)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--accent-pink-deep)', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', padding: '2px 8px' }}
          >
            Fit (100%)
          </button>
        </div>
      )}

      {/* Spacing & Scaling container */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: isMobile ? 'hidden' : 'auto',
        padding: isMobile ? '8px' : '20px',
        boxSizing: 'border-box',
      }}>
        {/* Wrapper that constrains to the image dimensions */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            isolation: 'isolate',
            boxShadow: '0 12px 60px rgba(0,0,0,0.45)',
            borderRadius: '8px',
            lineHeight: 0,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Loading spinner overlays the image area */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.18)',
              borderRadius: '8px',
            }}>
              <div style={{ width: '28px', height: '28px', border: '3px solid #ff6eb4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
            </div>
          )}

          {/* The photo strip image */}
          {dataUrl && (
            <img
              src={dataUrl}
              alt="Photo Strip Preview"
              draggable={false}
              style={{
                maxHeight: isMobile ? '38vh' : '62vh',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.2s',
                borderRadius: '8px',
                position: 'relative',
                zIndex: 1,
              }}
            />
          )}

          {/* Interactive sticker + text layers */}
          {!loading && dataUrl && (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              overflow: 'visible',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}>
              <StickerLayer
                readOnly={readOnly}
                selectedId={selectedStickerId}
                setSelectedId={setSelectedStickerId}
              />
              <TextLayer
                readOnly={readOnly}
                selectedId={selectedTextId}
                setSelectedId={setSelectedTextId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
