import { useState, useRef, useCallback } from 'react';

export function useCountdown() {
  const [count, setCount] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const timerRef = useRef(null);

  const clearAll = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Runs a single countdown (3→2→1→capture) and calls onCapture
  const runCountdown = useCallback((onCapture, startCount = 3) => {
    return new Promise((resolve) => {
      setIsRunning(true);
      let c = startCount;
      setCount(c);

      const tick = () => {
        c -= 1;
        if (c > 0) {
          setCount(c);
          timerRef.current = setTimeout(tick, 1000);
        } else {
          // Capture moment
          setCount(0);
          setTimeout(() => {
            setIsFlashing(true);
            const photo = onCapture();
            setTimeout(() => setIsFlashing(false), 400);
            setTimeout(() => {
              setCount(null);
              setIsRunning(false);
              resolve(photo);
            }, 500);
          }, 1000);
        }
      };

      timerRef.current = setTimeout(tick, 1000);
    });
  }, []);

  // Run a full photo session sequentially
  const runSession = useCallback(async (photoCount, onCapture, onPhotoTaken, onComplete, pauseMs = 1500) => {
    setIsRunning(true);
    const photos = [];
    for (let i = 0; i < photoCount; i++) {
      if (i > 0) {
        // Pause between shots
        await new Promise(r => setTimeout(r, pauseMs));
      }
      const photo = await runCountdown(onCapture, 3);
      if (photo) {
        photos.push(photo);
        onPhotoTaken?.(photo, i + 1);
      }
    }
    setIsRunning(false);
    onComplete?.(photos);
    return photos;
  }, [runCountdown]);

  const stop = useCallback(() => {
    clearAll();
    setCount(null);
    setIsRunning(false);
    setIsFlashing(false);
  }, []);

  return { count, isRunning, isFlashing, runCountdown, runSession, stop };
}
