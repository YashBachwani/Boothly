import { useRef, useCallback, useState } from 'react';

// ─── Web Audio helpers ────────────────────────────────────────────────────────

function createBeep(ctx, freq, duration, type = 'sine', vol = 0.3, when = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  const t = ctx.currentTime + when;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function createNoise(ctx, duration, vol = 0.05) {
  const bufLen = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + duration + 0.01);
}

// ─── Generative music engines ─────────────────────────────────────────────────

/** Lo-fi generative loop: soft pad chords + subtle bass */
function scheduleLofi(ctx, gainNode, startTime, bpm = 75) {
  const beat = 60 / bpm;
  const chords = [
    [261.63, 329.63, 392.00], // Cmaj
    [220.00, 261.63, 329.63], // Am
    [196.00, 246.94, 293.66], // Gm
    [174.61, 220.00, 261.63], // Fm
  ];
  const nodeRefs = [];

  chords.forEach((chord, ci) => {
    chord.forEach((freq, fi) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = fi === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      osc.connect(env);
      env.connect(gainNode);
      const t = startTime + ci * beat * 4;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.06, t + 0.2);
      env.gain.linearRampToValueAtTime(0.04, t + beat * 3.5);
      env.gain.linearRampToValueAtTime(0, t + beat * 4);
      osc.start(t);
      osc.stop(t + beat * 4 + 0.05);
      nodeRefs.push(osc);
    });
    // Bass note
    const bass = ctx.createOscillator();
    const bassEnv = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.value = chords[ci][0] / 2;
    bass.connect(bassEnv);
    bassEnv.connect(gainNode);
    const t = startTime + ci * beat * 4;
    bassEnv.gain.setValueAtTime(0, t);
    bassEnv.gain.linearRampToValueAtTime(0.04, t + 0.05);
    bassEnv.gain.linearRampToValueAtTime(0.02, t + beat * 1.5);
    bassEnv.gain.linearRampToValueAtTime(0, t + beat * 2);
    bass.start(t);
    bass.stop(t + beat * 2 + 0.05);
    nodeRefs.push(bass);
  });

  return { duration: beat * 16, nodes: nodeRefs };
}

/** Retro booth generative music: upbeat arpeggios */
function scheduleRetro(ctx, gainNode, startTime, bpm = 110) {
  const beat = 60 / bpm;
  const arp = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
  const nodeRefs = [];

  arp.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(gainNode);
    const t = startTime + i * (beat * 0.5);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.05, t + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.4);
    osc.start(t);
    osc.stop(t + beat * 0.5);
    nodeRefs.push(osc);
  });

  return { duration: beat * 3, nodes: nodeRefs };
}

/** Ambient café: drone pads */
function scheduleAmbient(ctx, gainNode, startTime) {
  const nodeRefs = [];
  const freqs = [130.81, 164.81, 196.00]; // C2 chord

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(env);
    env.connect(gainNode);
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(0.03, startTime + 1.5);
    env.gain.linearRampToValueAtTime(0.02, startTime + 5);
    env.gain.linearRampToValueAtTime(0, startTime + 8);
    osc.start(startTime);
    osc.stop(startTime + 8.1);
    nodeRefs.push(osc);
  });

  return { duration: 8, nodes: nodeRefs };
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useAudio() {
  const ctxRef = useRef(null);
  const mutedRef = useRef(false);
  const musicGainRef = useRef(null);
  const musicTimerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('none');
  const currentTrackRef = useRef('none');

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  };

  // ── SFX ──────────────────────────────────────────────────────────────────────

  const playShutter = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      // Mechanical click
      createBeep(ctx, 1200, 0.015, 'square', 0.25);
      createBeep(ctx, 600, 0.08, 'square', 0.15, 0.01);
      // Noise burst (film grain sound)
      createNoise(ctx, 0.04, 0.08);
    } catch {}
  }, []);

  const playCountdownBeep = useCallback((isLast = false) => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      if (isLast) {
        // Final beep – louder and higher pitch
        createBeep(ctx, 1047, 0.25, 'sine', 0.4);
        createBeep(ctx, 1320, 0.15, 'sine', 0.2, 0.05);
      } else {
        createBeep(ctx, 660, 0.15, 'sine', 0.28);
      }
    } catch {}
  }, []);

  const playPrint = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      // Mechanical whirr + paper feed
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          createBeep(ctx, 80 + i * 15, 0.1, 'sawtooth', 0.06);
          createNoise(ctx, 0.05, 0.03);
        }, i * 70);
      }
    } catch {}
  }, []);

  const playFlash = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      // Soft pop
      createBeep(ctx, 200, 0.05, 'sine', 0.15);
      createNoise(ctx, 0.02, 0.05);
    } catch {}
  }, []);

  const playSuccess = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = getCtx();
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => createBeep(ctx, freq, 0.2, 'sine', 0.18), i * 90);
      });
    } catch {}
  }, []);

  // ── Background Music ──────────────────────────────────────────────────────────

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) {
      clearTimeout(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    if (musicGainRef.current) {
      try {
        const ctx = ctxRef.current;
        musicGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch {}
      musicGainRef.current = null;
    }
  }, []);

  const scheduleLoop = useCallback((trackId) => {
    if (currentTrackRef.current !== trackId) return;
    if (mutedRef.current) return;

    try {
      const ctx = getCtx();
      const gainNode = musicGainRef.current;
      if (!gainNode) return;

      let result;
      const now = ctx.currentTime + 0.05;

      if (trackId === 'lofi') result = scheduleLofi(ctx, gainNode, now);
      else if (trackId === 'retro_booth') result = scheduleRetro(ctx, gainNode, now);
      else if (trackId === 'ambient') result = scheduleAmbient(ctx, gainNode, now);
      else return;

      // Schedule next loop slightly before end
      const loopIn = Math.max(0, (result.duration - 0.2) * 1000);
      musicTimerRef.current = setTimeout(() => scheduleLoop(trackId), loopIn);
    } catch {}
  }, []);

  const playMusic = useCallback((trackId) => {
    stopMusic();
    setCurrentTrack(trackId);
    currentTrackRef.current = trackId;

    if (!trackId || trackId === 'none') return;

    try {
      const ctx = getCtx();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(mutedRef.current ? 0 : 0.7, ctx.currentTime + 0.5);
      gainNode.connect(ctx.destination);
      musicGainRef.current = gainNode;
      scheduleLoop(trackId);
    } catch {}
  }, [stopMusic, scheduleLoop]);

  const toggleMute = useCallback(() => {
    const newMuted = !mutedRef.current;
    mutedRef.current = newMuted;
    setIsMuted(newMuted);

    if (musicGainRef.current && ctxRef.current) {
      try {
        const ctx = ctxRef.current;
        musicGainRef.current.gain.linearRampToValueAtTime(
          newMuted ? 0 : 0.7,
          ctx.currentTime + 0.3
        );
      } catch {}
    }

    return newMuted;
  }, []);

  const setMuted = useCallback((muted) => {
    mutedRef.current = muted;
    setIsMuted(muted);
    if (musicGainRef.current && ctxRef.current) {
      try {
        const ctx = ctxRef.current;
        musicGainRef.current.gain.linearRampToValueAtTime(muted ? 0 : 0.7, ctx.currentTime + 0.3);
      } catch {}
    }
  }, []);

  return {
    playShutter,
    playCountdownBeep,
    playPrint,
    playFlash,
    playSuccess,
    playMusic,
    stopMusic,
    toggleMute,
    setMuted,
    isMuted,
    currentTrack,
  };
}
