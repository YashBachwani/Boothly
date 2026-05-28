import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/BoothContext';
import { STICKERS, STICKER_CATEGORIES, FONTS, FONT_CATEGORIES, STRIP_THEMES, LAYOUTS } from '../../constants';
import AIEnhancementPanel from '../booth/AIEnhancementPanel';
import FilterPanel from '../filters/FilterPanel';


/* ─── Sticker Library Panel ─────────────────────────────────────────── */
function StickerPanel({ selectedStickerId, setSelectedStickerId }) {
  const { stickers, setStickers } = useBooth();
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0]);

  const addSticker = (emoji) => {
    const newSticker = { id: Date.now(), emoji, x: 50, y: 50, scale: 1, rotate: 0, opacity: 1, flipX: false, zIndex: stickers.length };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSticker = (id, props) => setStickers(stickers.map(s => s.id === id ? { ...s, ...props } : s));
  const removeSticker = (id) => { setStickers(stickers.filter(s => s.id !== id)); if (selectedStickerId === id) setSelectedStickerId(null); };
  const selectedSticker = stickers.find(s => s.id === selectedStickerId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Category tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        overflowX: 'auto', 
        flexWrap: 'nowrap', 
        paddingBottom: '6px',
        width: '100%',
      }} className="hide-scrollbar">
        {STICKER_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', border: 'none', cursor: 'pointer',
            flexShrink: 0,
            background: activeCategory.id === cat.id ? 'var(--accent-pink)' : 'var(--bg-glass)',
            color: activeCategory.id === cat.id ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'all 0.2s',
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>

      {/* Sticker grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }} className="hide-scrollbar">
        {STICKERS.filter(s => s.category === activeCategory.id).map(s => (
          <motion.button key={s.id} onClick={() => addSticker(s.emoji)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            title="Click to add to strip"
            style={{ background: 'transparent', border: 'none', fontSize: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px' }}>
            {s.emoji}
          </motion.button>
        ))}
      </div>

      {/* Selected sticker editor */}
      {selectedSticker && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Editing: {selectedSticker.emoji}
            </span>
            <button onClick={() => setSelectedStickerId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          {/* Scale */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Size</span>
            <input type="range" min="0.2" max="4" step="0.05" value={selectedSticker.scale || 1}
              onChange={e => updateSticker(selectedSticker.id, { scale: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{((selectedSticker.scale || 1) * 100).toFixed(0)}%</span>
          </div>

          {/* Rotation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Rotate</span>
            <input type="range" min="-180" max="180" step="1" value={selectedSticker.rotate || 0}
              onChange={e => updateSticker(selectedSticker.id, { rotate: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{Math.round(selectedSticker.rotate || 0)}°</span>
          </div>

          {/* Opacity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Opacity</span>
            <input type="range" min="0.1" max="1" step="0.05" value={selectedSticker.opacity !== undefined ? selectedSticker.opacity : 1}
              onChange={e => updateSticker(selectedSticker.id, { opacity: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{Math.round((selectedSticker.opacity !== undefined ? selectedSticker.opacity : 1) * 100)}%</span>
          </div>

          {/* Quick actions row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => updateSticker(selectedSticker.id, { flipX: !selectedSticker.flipX })}
              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: selectedSticker.flipX ? 'var(--accent-pink)' : 'var(--bg-glass)', color: selectedSticker.flipX ? '#fff' : 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
              ↔️ Flip
            </button>
            <button onClick={() => removeSticker(selectedSticker.id)}
              style={{ flex: 1, padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.4)', background: 'rgba(255,80,80,0.08)', color: '#ff5050', cursor: 'pointer', fontSize: '12px' }}>
              🗑️ Delete
            </button>
          </div>
        </motion.div>
      )}

      {/* Layer list */}
      {stickers.length > 0 && (
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            On Strip ({stickers.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stickers.slice().reverse().map(s => (
              <div key={s.id} onClick={() => setSelectedStickerId(s.id === selectedStickerId ? null : s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                  borderRadius: '8px', cursor: 'pointer',
                  background: selectedStickerId === s.id ? 'var(--bg-glass)' : 'transparent',
                  border: `1px solid ${selectedStickerId === s.id ? 'var(--accent-pink)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: '20px' }}>{s.emoji}</span>
                <span style={{ flex: 1, fontSize: '12px', color: 'var(--text-muted)' }}>x:{Math.round(s.x)}% y:{Math.round(s.y)}%</span>
                <button onClick={e => { e.stopPropagation(); removeSticker(s.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Text Layer Panel ──────────────────────────────────────────────── */
function TextPanel({ selectedTextId, setSelectedTextId }) {
  const { textLayers, setTextLayers } = useBooth();

  const addText = () => {
    const layer = {
      id: Date.now(), text: 'New Text', x: 50, y: 50, scale: 1, rotate: 0,
      opacity: 1, color: '#ffffff', font: FONTS[0].family, shadow: false, outline: false, zIndex: textLayers.length,
    };
    setTextLayers([...textLayers, layer]);
    setSelectedTextId(layer.id);
  };

  const updateText = (id, props) => setTextLayers(textLayers.map(t => t.id === id ? { ...t, ...props } : t));
  const removeText = (id) => { setTextLayers(textLayers.filter(t => t.id !== id)); if (selectedTextId === id) setSelectedTextId(null); };

  const activeText = textLayers.find(t => t.id === selectedTextId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Add text button */}
      <motion.button className="btn btn-primary" onClick={addText} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        style={{ padding: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        ＋ Add Text Layer
      </motion.button>

      {/* Editor for active text */}
      {activeText && (
        <motion.div key={activeText.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Text</span>
            <button onClick={() => setSelectedTextId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>

          {/* Text input */}
          <input type="text" value={activeText.text} onChange={e => updateText(activeText.id, { text: e.target.value })}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Type your text..." />

          {/* Color + style row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Color</label>
              <input type="color" value={activeText.color} onChange={e => updateText(activeText.id, { color: e.target.value })}
                style={{ width: '36px', height: '28px', cursor: 'pointer', border: 'none', background: 'none', borderRadius: '4px' }} />
            </div>
            <button onClick={() => updateText(activeText.id, { shadow: !activeText.shadow })}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', cursor: 'pointer', background: activeText.shadow ? 'var(--accent-pink)' : 'var(--bg-glass)', color: activeText.shadow ? '#fff' : 'var(--text-muted)' }}>
              Shadow
            </button>
            <button onClick={() => updateText(activeText.id, { outline: !activeText.outline })}
              style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '12px', cursor: 'pointer', background: activeText.outline ? 'var(--accent-pink)' : 'var(--bg-glass)', color: activeText.outline ? '#fff' : 'var(--text-muted)' }}>
              Outline
            </button>
          </div>

          {/* Alignment controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Align</span>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-glass)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              {[
                { value: 'left', icon: '◀ Left' },
                { value: 'center', icon: '⏺ Center' },
                { value: 'right', icon: 'Right ▶' }
              ].map(opt => {
                const isSel = (activeText.align || 'center') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateText(activeText.id, { align: opt.value })}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: isSel ? 'var(--accent-pink)' : 'transparent',
                      color: isSel ? '#fff' : 'var(--text-primary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Size</span>
            <input type="range" min="0.3" max="4" step="0.05" value={activeText.scale || 1}
              onChange={e => updateText(activeText.id, { scale: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{((activeText.scale || 1) * 100).toFixed(0)}%</span>
          </div>

          {/* Rotation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Rotate</span>
            <input type="range" min="-180" max="180" step="1" value={activeText.rotate || 0}
              onChange={e => updateText(activeText.id, { rotate: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{Math.round(activeText.rotate || 0)}°</span>
          </div>

          {/* Opacity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '40px' }}>Opacity</span>
            <input type="range" min="0.1" max="1" step="0.05" value={activeText.opacity !== undefined ? activeText.opacity : 1}
              onChange={e => updateText(activeText.id, { opacity: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: 'var(--accent-pink)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '30px' }}>{Math.round((activeText.opacity !== undefined ? activeText.opacity : 1) * 100)}%</span>
          </div>

          {/* Fonts */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Font</p>
            <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }} className="hide-scrollbar">
              {FONT_CATEGORIES.map(cat => (
                <div key={cat}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.6, marginBottom: '4px' }}>{cat}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {FONTS.filter(f => f.category === cat).map(f => (
                      <button key={f.id} onClick={() => updateText(activeText.id, { font: f.family })}
                        style={{
                          padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)',
                          background: activeText.font === f.family ? 'var(--accent-pink)' : 'var(--bg-primary)',
                          color: activeText.font === f.family ? '#fff' : 'var(--text-primary)',
                          fontFamily: f.family, fontSize: '13px', cursor: 'pointer',
                        }}>{f.name}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete */}
          <button onClick={() => removeText(activeText.id)}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,80,80,0.4)', background: 'rgba(255,80,80,0.08)', color: '#ff5050', cursor: 'pointer', fontSize: '13px' }}>
            🗑️ Delete Layer
          </button>
        </motion.div>
      )}

      {/* Text layer list */}
      {textLayers.length > 0 && (
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Text Layers ({textLayers.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {textLayers.slice().reverse().map(t => (
              <div key={t.id} onClick={() => setSelectedTextId(t.id === selectedTextId ? null : t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                  background: selectedTextId === t.id ? 'var(--bg-glass)' : 'transparent',
                  border: `1px solid ${selectedTextId === t.id ? 'var(--accent-pink)' : 'transparent'}`, transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: '18px', fontFamily: t.font, color: t.color, textShadow: '0 0 4px rgba(0,0,0,0.5)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</span>
                <button onClick={e => { e.stopPropagation(); removeText(t.id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Design Panel (themes, layouts, caption) ───────────────────────── */
function DesignPanel() {
  const { stripTheme, setTheme, stripLayout, setLayout, customText, setCustomText } = useBooth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* AI Enhance */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Enhance</p>
        <AIEnhancementPanel inline />
      </div>

      {/* Filters */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</p>
        <FilterPanel />
      </div>

      {/* Layout */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Layout</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {LAYOUTS.map(l => {
            const isActive = stripLayout === l.id;
            return (
              <button key={l.id} onClick={() => setLayout(l.id)} style={{
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'var(--bg-primary)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-pink)' : 'var(--border-subtle)'}`,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '1rem' }}>{l.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400 }}>{l.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme</p>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
          {STRIP_THEMES.map(t => {
            const isActive = stripTheme === t.id;
            return (
              <motion.button key={t.id} onClick={() => setTheme(t.id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                title={t.name}
                style={{
                  flexShrink: 0, width: '52px', height: '52px', borderRadius: '10px',
                  background: t.bg, border: `2px solid ${isActive ? 'var(--accent-pink)' : t.border || 'transparent'}`,
                  boxShadow: isActive ? '0 0 12px var(--accent-pink)' : 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: t.textColor, fontSize: '18px',
                }}>
                {t.icon}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Caption */}
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caption</p>
        <input type="text" value={customText} onChange={e => setCustomText(e.target.value)}
          placeholder="e.g. Best day ever! ✨" maxLength={30}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '8px',
            border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)',
            color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', outline: 'none',
            boxSizing: 'border-box',
          }} />
      </div>
    </div>
  );
}

/* ─── Main Editor Side Panel ────────────────────────────────────────── */
const TABS = [
  { id: 'stickers', label: '✨ Stickers', icon: '✨' },
  { id: 'text',     label: '𝐓 Text',     icon: 'T' },
  { id: 'design',   label: '🎨 Design',   icon: '🎨' },
];

export default function EditorSidePanel({ selectedStickerId, setSelectedStickerId, selectedTextId, setSelectedTextId }) {
  const [activeTab, setActiveTab] = useState('design');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '13px 8px', border: 'none', cursor: 'pointer',
            background: 'transparent', fontSize: '0.8rem', fontWeight: activeTab === tab.id ? 700 : 400,
            color: activeTab === tab.id ? 'var(--accent-pink)' : 'var(--text-muted)',
            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-pink)' : 'transparent'}`,
            marginBottom: '-1px', transition: 'all 0.2s', letterSpacing: '0.02em',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }} className="hide-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'stickers' && (
            <motion.div key="stickers" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <StickerPanel selectedStickerId={selectedStickerId} setSelectedStickerId={setSelectedStickerId} />
            </motion.div>
          )}
          {activeTab === 'text' && (
            <motion.div key="text" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <TextPanel selectedTextId={selectedTextId} setSelectedTextId={setSelectedTextId} />
            </motion.div>
          )}
          {activeTab === 'design' && (
            <motion.div key="design" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <DesignPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
