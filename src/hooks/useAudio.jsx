import { useRef, useCallback } from 'react';

const SOUNDS = {};

// Simple beep generator using Web Audio API
function createBeep(ctx, freq, duration, type = 'sine', vol = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useAudio() {
  const ctxRef = useRef(null);
  const bgMusicRef = useRef(null);
  const mutedRef = useRef(false);

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const playShutter = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      // Click sound
      createBeep(ctx, 800, 0.05, 'square', 0.2);
      setTimeout(() => createBeep(ctx, 400, 0.08, 'square', 0.15), 30);
    } catch {}
  }, []);

  const playCountdownBeep = useCallback((isLast = false) => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      if (isLast) {
        createBeep(ctx, 880, 0.2, 'sine', 0.35);
      } else {
        createBeep(ctx, 660, 0.15, 'sine', 0.25);
      }
    } catch {}
  }, []);

  const playPrint = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      // Mechanical whirr approximation
      for (let i = 0; i < 8; i++) {
        setTimeout(() => createBeep(ctx, 120 + i * 20, 0.12, 'sawtooth', 0.08), i * 80);
      }
    } catch {}
  }, []);

  const playSuccess = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => createBeep(ctx, freq, 0.2, 'sine', 0.2), i * 100);
      });
    } catch {}
  }, []);

  const setMuted = useCallback((muted) => {
    mutedRef.current = muted;
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = muted ? 0 : 0.15;
    }
  }, []);

  return { playShutter, playCountdownBeep, playPrint, playSuccess, setMuted };
}
