import { useRef, useCallback } from 'react';

const SOUNDS = {};

// Simple beep generator using Web Audio API
function createBeep(ctx, freq, duration, type = 'sine', vol = 0.3) {
  if (ctx.state === 'suspended') ctx.resume();
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

// Generative Background Music loops
class BackgroundMusic {
  constructor(ctx) {
    this.ctx = ctx;
    this.nodes = [];
    this.isPlaying = false;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);
    this.type = 'none';
  }

  play(type) {
    this.stop();
    this.type = type;
    if (type === 'none') return;
    this.isPlaying = true;
    
    // Fade in
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 2);

    if (type === 'ambient') {
      this._startDrone(150, 'sine', 0.8);
      this._startDrone(200, 'triangle', 0.5);
      this._startDrone(300, 'sine', 0.4);
    } else if (type === 'retro') {
      this._startDrone(100, 'sawtooth', 0.3);
      this._startDrone(150, 'square', 0.2);
      this._startDrone(250, 'sawtooth', 0.2);
    } else if (type === 'lofi') {
      this._startNoise();
      this._startDrone(220, 'sine', 0.6);
      this._startDrone(275, 'sine', 0.5);
      this._startDrone(330, 'triangle', 0.4);
    }
  }

  _startDrone(freq, type, vol) {
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    lfo.type = 'sine';
    lfo.frequency.value = 0.1 + Math.random() * 0.2; // Slow modulation
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfoGain.gain.value = vol * 0.5;

    gain.gain.value = vol * 0.5;

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();
    
    this.nodes.push(osc, lfo, lfoGain, gain);
  }

  _startNoise() {
    // Vinyl crackle / white noise approximation
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Filter to make it sound like lofi tape hiss
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.nodes.push(noise, filter, gain);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    
    // Fade out
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);

    setTimeout(() => {
      this.nodes.forEach(n => {
        try { if (n.stop) n.stop(); } catch(e){}
        try { if (n.disconnect) n.disconnect(); } catch(e){}
      });
      this.nodes = [];
    }, 1200);
  }

  setMuted(muted) {
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    if (muted) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    } else if (this.isPlaying) {
      this.masterGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
    }
  }
}

export function useAudio() {
  const ctxRef = useRef(null);
  const bgMusicRef = useRef(null);
  const mutedRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

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
  }, [getCtx]);

  const playSuccess = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => createBeep(ctx, freq, 0.2, 'sine', 0.2), i * 100);
      });
    } catch {}
  }, [getCtx]);

  const setMuted = useCallback((muted) => {
    mutedRef.current = muted;
    if (bgMusicRef.current) {
      bgMusicRef.current.setMuted(muted);
    }
  }, []);

  const playBackgroundMusic = useCallback((trackId) => {
    try {
      const ctx = getCtx();
      if (!bgMusicRef.current) {
        bgMusicRef.current = new BackgroundMusic(ctx);
      }
      bgMusicRef.current.play(trackId);
      bgMusicRef.current.setMuted(mutedRef.current);
    } catch(e) {
      console.warn('AudioContext failed to start', e);
    }
  }, [getCtx]);

  return { playShutter, playCountdownBeep, playPrint, playSuccess, setMuted, playBackgroundMusic };
}
