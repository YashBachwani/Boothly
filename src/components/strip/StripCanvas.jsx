import { useEffect, useState } from 'react';
import { useBooth } from '../../context/BoothContext';
import { generateStrip } from '../../utils/stripBuilder';

export default function StripCanvas() {
  const { photos, stripLayout, stripTheme, customText } = useBooth();
  const [dataUrl, setDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    generateStrip({
      photos: photos.length > 0 ? photos : ['/assets/placeholder.jpg'], // fallback if no photos
      layout: stripLayout,
      themeId: stripTheme,
      customText,
      showDate: true,
    }).then(url => {
      if (active) {
        setDataUrl(url);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [photos, stripLayout, stripTheme, customText]);

  return (
    <div style={{
      position: 'relative',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: '4px',
      overflow: 'hidden',
      maxWidth: '100%',
      maxHeight: '70vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-glass)',
    }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)' }}>
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
          }}
        />
      )}
    </div>
  );
}
