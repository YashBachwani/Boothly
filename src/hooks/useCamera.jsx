import { useRef, useState, useCallback, useEffect } from 'react';
import { FILTERS } from '../constants';
import { applyEnhancements, getSmartCropRegion } from '../utils/imageEnhancement';

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

  /**
   * Capture a photo with optional filter, AI enhancements, and smart crop
   */
  const capturePhoto = useCallback((
    filterId = 'normal',
    enhancementOptions = {},
    virtualBgColors = null,
  ) => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    // Apply smart crop to get a better-framed photo
    const { sx, sy, sw, sh } = getSmartCropRegion(w, h, 4 / 3);

    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');

    // Draw virtual background if provided
    if (virtualBgColors && virtualBgColors.length >= 2) {
      const grad = ctx.createLinearGradient(0, 0, sw, sh);
      virtualBgColors.forEach((color, i) => {
        grad.addColorStop(i / (virtualBgColors.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, sw, sh);
    }

    // Mirror for front camera
    if (facingMode === 'user') {
      ctx.translate(sw, 0);
      ctx.scale(-1, 1);
    }

    // Apply filter
    const filter = FILTERS.find(f => f.id === filterId);
    if (filter && filter.css !== 'none') {
      ctx.filter = filter.css;
    }

    // Draw the video frame cropped
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);

    // Reset transform for enhancement
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';

    // Apply AI enhancements if any are enabled
    const hasEnhancements = Object.values(enhancementOptions).some(Boolean);
    if (hasEnhancements) {
      return applyEnhancements(canvas, enhancementOptions);
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
