// Extended filter definitions including new cinematic/aesthetic filters

export const EXTENDED_FILTERS = [
  // ── Basics ──────────────────────────────────────────────
  { id: 'normal',     name: 'Normal',      icon: '✨', css: 'none', category: 'basic' },
  { id: 'bw',         name: 'B&W',         icon: '🎞️', css: 'grayscale(100%)', category: 'basic' },
  { id: 'sepia',      name: 'Sepia',       icon: '🍂', css: 'sepia(100%) contrast(105%)', category: 'basic' },
  { id: 'polaroid',   name: 'Polaroid',    icon: '📸', css: 'contrast(108%) brightness(106%) saturate(88%) sepia(12%)', category: 'film' },

  // ── Film ────────────────────────────────────────────────
  { id: 'vintage',    name: 'Vintage',     icon: '📷', css: 'sepia(60%) contrast(110%) brightness(90%)', category: 'film' },
  { id: 'retro',      name: 'Retro Film',  icon: '🎬', css: 'sepia(40%) hue-rotate(-20deg) saturate(150%) contrast(105%)', category: 'film' },
  { id: 'cinematic',  name: 'Cinematic',   icon: '🎥', css: 'contrast(125%) brightness(82%) saturate(75%)', category: 'film' },
  { id: 'vhs',        name: 'VHS',         icon: '📼', css: 'contrast(110%) brightness(95%) saturate(80%) hue-rotate(-5deg)', category: 'film', vhsOverlay: true },
  { id: 'filmgrain',  name: 'Film Grain',  icon: '🌫️', css: 'contrast(108%) brightness(96%) saturate(90%)', category: 'film', grainOverlay: true },

  // ── Mood ────────────────────────────────────────────────
  { id: 'warm',       name: 'Warm',        icon: '🌅', css: 'sepia(25%) saturate(130%) hue-rotate(5deg) brightness(105%)', category: 'mood' },
  { id: 'cold',       name: 'Cool',        icon: '❄️', css: 'hue-rotate(195deg) saturate(70%) brightness(108%)', category: 'mood' },
  { id: 'dreamy',     name: 'Dreamy',      icon: '☁️', css: 'brightness(112%) saturate(120%) contrast(90%)', category: 'mood' },
  { id: 'glow',       name: 'Soft Glow',   icon: '🌸', css: 'brightness(115%) contrast(88%) saturate(110%)', category: 'mood' },
  { id: 'sunset',     name: 'Sunset Glow', icon: '🌇', css: 'sepia(35%) saturate(170%) hue-rotate(-10deg) brightness(108%) contrast(105%)', category: 'mood' },
  { id: 'mist',       name: 'Morning Mist',icon: '🌫️', css: 'brightness(115%) contrast(85%) saturate(80%) blur(0.4px)', category: 'mood' },

  // ── Aesthetic ───────────────────────────────────────────
  { id: 'kawaii',     name: 'Kawaii',      icon: '🌷', css: 'saturate(175%) brightness(112%) hue-rotate(325deg) contrast(95%)', category: 'aesthetic' },
  { id: 'cyberpunk',  name: 'Cyberpunk',   icon: '⚡', css: 'contrast(130%) brightness(90%) saturate(180%) hue-rotate(200deg)', category: 'aesthetic' },
  { id: 'neon',       name: 'Neon Nights', icon: '🌃', css: 'contrast(125%) brightness(85%) saturate(200%) hue-rotate(185deg)', category: 'aesthetic' },
  { id: 'aurora',     name: 'Aurora',      icon: '🌌', css: 'hue-rotate(150deg) saturate(140%) brightness(105%) contrast(95%)', category: 'aesthetic' },
  { id: 'velvet',     name: 'Velvet',      icon: '🍇', css: 'hue-rotate(270deg) saturate(120%) brightness(95%) contrast(110%)', category: 'aesthetic' },
];

export const FILTER_CATEGORIES = [
  { id: 'all',       label: 'All',       icon: '✨' },
  { id: 'basic',     label: 'Basic',     icon: '◐' },
  { id: 'film',      label: 'Film',      icon: '🎞️' },
  { id: 'mood',      label: 'Mood',      icon: '🌅' },
  { id: 'aesthetic', label: 'Aesthetic', icon: '💜' },
];

/**
 * Returns a CSS filter string scaled by intensity (0.0–1.0)
 */
export function getFilterCSS(filterId, intensity = 1.0) {
  const filter = EXTENDED_FILTERS.find(f => f.id === filterId);
  if (!filter || filter.css === 'none') return 'none';

  if (intensity >= 0.99) return filter.css;

  // Parse and scale filter values
  const lerped = filter.css.replace(/(\d+\.?\d*)(deg|%|px)/g, (match, num, unit) => {
    const base = parseFloat(num);
    // For brightness/contrast near 100%, lerp from 100% baseline
    if (unit === '%' && (match.includes('brightness') || match.includes('contrast'))) {
      const centered = (base - 100) * intensity + 100;
      return `${centered.toFixed(1)}${unit}`;
    }
    if (unit === 'deg') {
      return `${(base * intensity).toFixed(1)}${unit}`;
    }
    // saturate, sepia, grayscale, hue-rotate
    const scaled = base * intensity;
    return `${scaled.toFixed(1)}${unit}`;
  });

  return lerped;
}
