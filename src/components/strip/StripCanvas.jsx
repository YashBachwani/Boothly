import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { generateStrip } from '../../utils/stripBuilder';

export default function StripCanvas() {
  const {
    photos, stripLayout, stripTheme, customText,
    stripWallpaper, currentFilter, filterIntensity,
    stickers, textLayers,
  } = useBooth();

  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    // Debounce to avoid regenerating too fast while dragging
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateStrip({
        photos: photos.length > 0 ? photos : ['/assets/placeholder.jpg'],
        layout: stripLayout,
        themeId: stripTheme,
        customText,
        showDate: true,
        wallpaperId: stripWallpaper,
        filterId: currentFilter,
        filterIntensity,
      }).then(url => {
        if (active) {
          setDataUrl(url);
          setLoading(false);
        }
      });
    }, 250);

    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
  }, [photos, stripLayout, stripTheme, customText, stripWallpaper, currentFilter, filterIntensity]);

  return (
    <div
      className="strip-wrapper"
      style={{
        position: 'relative',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: '4px',
        background: 'var(--bg-glass)',
        overflow: 'hidden',
      }}
    >
      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.08)',
              gap: '10px',
              borderRadius: '4px',
              zIndex: 2,
              backdropFilter: 'blur(2px)',
            }}
          >
            <div className="dot-loader" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span /><span /><span />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Rendering strip…
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strip image */}
      {dataUrl && (
        <motion.img
          key={dataUrl}
          src={dataUrl}
          alt="Photo Strip Preview"
          className="strip-preview"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{ display: 'block' }}
        />
      )}
    </div>
  );
}
