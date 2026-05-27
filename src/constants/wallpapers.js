// Wallpaper/background definitions for the photo strip
// Each wallpaper renders as a CSS gradient (no external images)

export const WALLPAPERS = [
  { id: 'none', name: 'None', icon: '◻️', css: 'transparent', category: 'basic' },

  // ── Realistic ────────────────────────────────────────────
  {
    id: 'cafe_wall',
    name: 'Café',
    icon: '☕',
    category: 'realistic',
    css: 'radial-gradient(ellipse at 20% 50%, #3d2b1f 0%, #6b4226 40%, #8b5a2b 70%, #5c3d1e 100%)',
    canvasColors: ['#3d2b1f', '#6b4226', '#8b5a2b', '#5c3d1e'],
  },
  {
    id: 'beach_wall',
    name: 'Beach',
    icon: '🌊',
    category: 'realistic',
    css: 'linear-gradient(180deg, #87CEEB 0%, #64B5D8 40%, #F4D03F 55%, #C2956C 75%, #A0784E 100%)',
    canvasColors: ['#87CEEB', '#64B5D8', '#F4D03F', '#C2956C'],
  },
  {
    id: 'studio_wall',
    name: 'Studio',
    icon: '🎙️',
    category: 'realistic',
    css: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
    canvasColors: ['#1a1a2e', '#16213e', '#0f3460', '#1a1a2e'],
  },
  {
    id: 'vintage_room',
    name: 'Vintage Room',
    icon: '📺',
    category: 'realistic',
    css: 'linear-gradient(160deg, #D4A017 0%, #C17F2A 30%, #8B4513 60%, #5C2D0A 100%)',
    canvasColors: ['#D4A017', '#C17F2A', '#8B4513', '#5C2D0A'],
  },

  // ── Cute ────────────────────────────────────────────────
  {
    id: 'clouds',
    name: 'Clouds',
    icon: '☁️',
    category: 'cute',
    css: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 40%, #E0F8FF 70%, #FFFFFF 100%)',
    canvasColors: ['#87CEEB', '#B0E0E6', '#E0F8FF', '#FFFFFF'],
  },
  {
    id: 'starfield',
    name: 'Starfield',
    icon: '🌟',
    category: 'cute',
    css: 'radial-gradient(ellipse at top, #0a0020 0%, #1a0040 40%, #0d0030 70%, #000010 100%)',
    canvasColors: ['#0a0020', '#1a0040', '#0d0030', '#000010'],
  },
  {
    id: 'pastel_pink',
    name: 'Pastel Pink',
    icon: '🌸',
    category: 'cute',
    css: 'linear-gradient(135deg, #FFE4E1 0%, #FFC0CB 40%, #FFB6C1 70%, #FF9AA2 100%)',
    canvasColors: ['#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF9AA2'],
  },
  {
    id: 'pastel_blue',
    name: 'Pastel Blue',
    icon: '💙',
    category: 'cute',
    css: 'linear-gradient(135deg, #E8F4F8 0%, #B8DEF0 40%, #85C8E8 70%, #5BA8D0 100%)',
    canvasColors: ['#E8F4F8', '#B8DEF0', '#85C8E8', '#5BA8D0'],
  },
  {
    id: 'pastel_green',
    name: 'Pastel Mint',
    icon: '🌿',
    category: 'cute',
    css: 'linear-gradient(135deg, #E8F8E8 0%, #B8E8B8 40%, #85D085 70%, #5CB85C 100%)',
    canvasColors: ['#E8F8E8', '#B8E8B8', '#85D085', '#5CB85C'],
  },

  // ── Cinematic ───────────────────────────────────────────
  {
    id: 'cyberpunk_city',
    name: 'Cyberpunk',
    icon: '🌃',
    category: 'cinematic',
    css: 'linear-gradient(180deg, #0a0015 0%, #1a0030 30%, #0d001a 60%, #110022 80%, #0a0015 100%)',
    canvasColors: ['#0a0015', '#1a0030', '#0d001a', '#110022'],
  },
  {
    id: 'sunset_room',
    name: 'Sunset',
    icon: '🌇',
    category: 'cinematic',
    css: 'linear-gradient(180deg, #FF6B35 0%, #F7931E 30%, #FFD23F 60%, #FF8C42 80%, #E84855 100%)',
    canvasColors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF8C42'],
  },
  {
    id: 'retro_arcade',
    name: 'Retro Arcade',
    icon: '🕹️',
    category: 'cinematic',
    css: 'linear-gradient(135deg, #1a0a2e 0%, #2d0a4e 30%, #4a0a6e 50%, #2d0a4e 70%, #1a0a2e 100%)',
    canvasColors: ['#1a0a2e', '#2d0a4e', '#4a0a6e', '#2d0a4e'],
  },
  {
    id: 'noir',
    name: 'Noir',
    icon: '🎬',
    category: 'cinematic',
    css: 'radial-gradient(ellipse at center, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
    canvasColors: ['#2a2a2a', '#1a1a1a', '#0a0a0a', '#000000'],
  },

  // ── Festival ────────────────────────────────────────────
  {
    id: 'birthday_party',
    name: 'Birthday',
    icon: '🎂',
    category: 'festival',
    css: 'linear-gradient(135deg, #FFE066 0%, #FFB347 30%, #FF6B9D 60%, #C084FC 100%)',
    canvasColors: ['#FFE066', '#FFB347', '#FF6B9D', '#C084FC'],
  },
  {
    id: 'wedding_bliss',
    name: 'Wedding',
    icon: '💍',
    category: 'festival',
    css: 'linear-gradient(160deg, #FFF9F0 0%, #FFF0E0 30%, #FDEBD0 60%, #F5CBA7 100%)',
    canvasColors: ['#FFF9F0', '#FFF0E0', '#FDEBD0', '#F5CBA7'],
  },
  {
    id: 'graduation',
    name: 'Graduation',
    icon: '🎓',
    category: 'festival',
    css: 'linear-gradient(135deg, #1a3a5c 0%, #2e5b8a 30%, #1a3a5c 60%, #0d1f33 100%)',
    canvasColors: ['#1a3a5c', '#2e5b8a', '#1a3a5c', '#0d1f33'],
  },
  {
    id: 'diwali',
    name: 'Diwali',
    icon: '🪔',
    category: 'festival',
    css: 'radial-gradient(circle at 30% 40%, #FF6B35 0%, #D4380D 20%, #722B00 40%, #2D0A00 70%, #0D0000 100%)',
    canvasColors: ['#FF6B35', '#D4380D', '#722B00', '#2D0A00'],
  },
  {
    id: 'christmas',
    name: 'Christmas',
    icon: '🎄',
    category: 'festival',
    css: 'linear-gradient(160deg, #0d2818 0%, #1a4a28 30%, #0d2818 60%, #08180e 100%)',
    canvasColors: ['#0d2818', '#1a4a28', '#0d2818', '#08180e'],
  },
];

export const WALLPAPER_CATEGORIES = [
  { id: 'all',        label: 'All',        icon: '🎨' },
  { id: 'basic',      label: 'None',       icon: '◻️' },
  { id: 'realistic',  label: 'Realistic',  icon: '🌿' },
  { id: 'cute',       label: 'Cute',       icon: '🌸' },
  { id: 'cinematic',  label: 'Cinematic',  icon: '🎬' },
  { id: 'festival',   label: 'Festival',   icon: '🎊' },
];
