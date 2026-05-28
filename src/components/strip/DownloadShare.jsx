import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useBooth } from '../../context/BoothContext';
import StripCanvas from './StripCanvas';

export default function DownloadShare() {
  const { newSession, setStep } = useBooth();
  const [isExporting, setIsExporting] = useState(false);
  const compositeRef = useRef(null);

  const handleDownload = async () => {
    if (!compositeRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(compositeRef.current, {
        scale: 2, // High resolution
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boothly-${Date.now()}.png`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate final image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async (platform) => {
    if (!compositeRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(compositeRef.current, {
        scale: 2, backgroundColor: null, useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob creation failed');
        
        const file = new File([blob], `boothly-${Date.now()}.png`, { type: 'image/png' });
        
        if (platform === 'native' && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Boothly Strip',
            text: 'Check out my aesthetic photobooth strip! ✨',
            files: [file],
          });
        } else {
          // Fallback clipboard copy
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Image copied to clipboard!');
          } catch {
            alert('Sharing not supported on this browser. Please download the image instead.');
          }
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section"
      style={{
        display: 'flex', gap: '40px', flexWrap: 'wrap',
        justifyContent: 'center', alignItems: 'flex-start',
        paddingTop: '20px',
      }}
    >
      {/* Final Preview Container */}
      <div style={{ position: 'relative' }}>
        <div
          ref={compositeRef}
          style={{
            position: 'relative',
            display: 'inline-block', // shrink to fit children
          }}
        >
          {/* Base strip with read-only layers inside */}
          <StripCanvas readOnly />
        </div>

        {isExporting && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '1.2rem', fontFamily: 'Space Mono, monospace',
            backdropFilter: 'blur(4px)', zIndex: 50,
            borderRadius: '4px',
          }}>
            Exporting...
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="glass-card download-share-card" style={{ padding: '32px', minWidth: '280px', maxWidth: '400px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Your <span className="gradient-text">memories</span>, ready.
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
          Download your high-resolution photostrip or share it instantly with friends.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <motion.button
            className="btn btn-primary"
            onClick={handleDownload}
            disabled={isExporting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '16px', fontSize: '1rem' }}
          >
            ⬇️ Download Image (PNG)
          </motion.button>

          <motion.button
            className="btn btn-ghost"
            onClick={() => handleShare('native')}
            disabled={isExporting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ padding: '16px', fontSize: '1rem' }}
          >
            📤 Share / Copy
          </motion.button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={() => setStep('customize')}
            style={{ flex: 1 }}
          >
            ← Back to Edit
          </motion.button>
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={() => { newSession(); setStep('select'); }}
            style={{ flex: 1, color: 'var(--accent-pink)' }}
          >
            Take Another 📷
          </motion.button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 600px) {
          .download-share-card {
            padding: 20px 16px !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}} />
    </motion.div>
  );
}
