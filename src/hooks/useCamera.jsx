import { useRef, useState, useCallback, useEffect } from 'react';
import { FILTERS } from '../constants';
import { VIRTUAL_BACKGROUNDS } from '../constants/backgrounds';

export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const startCamera = useCallback(async (facing = 'user') => {
    setError(null);
    setIsReady(false);
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      // Check for multiple cameras
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => setIsReady(true));
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and reload.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not access camera. Please check your browser settings.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback((filterId = 'normal', activeBackgroundId = 'none') => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    const activeBg = VIRTUAL_BACKGROUNDS.find(b => b.id === activeBackgroundId) || VIRTUAL_BACKGROUNDS[0];

    // 1. Draw Virtual Background (if any)
    if (activeBg.id !== 'none' && activeBg.canvasColors) {
      let grd;
      if (activeBg.css && activeBg.css.includes('radial')) {
        grd = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height));
      } else {
        grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
      }
      const steps = activeBg.canvasColors.length;
      activeBg.canvasColors.forEach((color, idx) => {
        grd.addColorStop(idx / Math.max(1, steps - 1), color);
      });
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set blend mode for the video layer
      ctx.globalCompositeOperation = 'soft-light';
    }

    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply filter
    const filter = FILTERS.find(f => f.id === filterId);
    if (filter && filter.css !== 'none') {
      ctx.filter = filter.css;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Reset composite operation and add ambient overlay if needed
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw ambient overlay to match UI
    if (activeBg.ambientColor) {
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = activeBg.ambientColor;
      // Undo mirror just for overlay drawing if mirrored
      if (facingMode === 'user') {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.92);
  }, [facingMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return {
    videoRef,
    isReady,
    error,
    facingMode,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    flipCamera,
    capturePhoto,
  };
}
