import { useEffect, useState, useRef } from 'react';
import { useBooth } from '../../context/BoothContext';
import { generateStrip } from '../../utils/stripBuilder';
import StickerLayer from './StickerLayer';
import TextLayer from './TextLayer';

export default function StripCanvas({ readOnly = false }) {
  const { photos, stripLayout, stripTheme, currentBackground } = useBooth();
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null);

  // Measure container width to provide relative scaling to fixed-size stickers
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Base reference width is 300px (standard preview width)
        setScaleFactor(entry.contentRect.width / 300);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateStrip({
      photos: photos.length > 0 ? photos : ['/assets/placeholder.jpg'], // fallback if no photos
      layout: stripLayout,
      themeId: stripTheme,
      backgroundId: currentBackground, // Pass background for generating base
      showDate: true,
    }).then(url => {
      if (active) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [photos, stripLayout, stripTheme, currentBackground]);

  return (
    <div style={{
      position: 'relative',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: '4px',
      maxWidth: '100%',
      maxHeight: '70vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-glass)',
    }}>
      <div 
        ref={containerRef}
        style={{ position: 'relative', display: 'inline-block', maxHeight: '70vh', maxWidth: '100%' }}
      >
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', zIndex: 1 }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid var(--accent-pink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }} />
          </div>
        )}
        
        {dataUrl && (
          <img
            src={dataUrl}
            alt="Photo Strip Preview"
            style={{
              maxHeight: '70vh',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.2s'
            }}
          />
        )}

        {/* Interactive Layers */}
        {!loading && dataUrl && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <StickerLayer readOnly={readOnly} scaleFactor={scaleFactor} />
            <TextLayer readOnly={readOnly} scaleFactor={scaleFactor} />
          </div>
        )}
      </div>
    </div>
  );
}
