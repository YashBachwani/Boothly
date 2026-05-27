import React, { createContext, useContext, useReducer } from 'react';

const BoothContext = createContext();

const initialState = {
  step: 'landing', // 'landing' | 'entry' | 'select' | 'camera' | 'print' | 'customize' | 'result'
  photoCount: 4,
  photos: [],        // raw captured dataURLs
  currentFilter: 'normal',
  filterIntensity: 1.0,
  stripLayout: 'vertical',
  stripTheme: 'minimal',
  stickers: [],      // { id, emoji, x, y, scale, rotate, opacity, flipH, zIndex }
  textLayers: [],    // { id, text, x, y, fontSize, fontFamily, color, opacity, rotation, shadow, outline }
  customText: '',    // simple caption for strip footer
  boothFrame: 'none',
  stripWallpaper: 'none',
  sessionId: null,
  enhancements: {
    autoBrightness: true,
    autoContrast: true,
    skinSmoothing: false,
    noiseReduction: false,
    portraitBlur: false,
  },
  enhancementIntensity: 0.6,
  enhancementsEnabled: false, // master toggle — only applied after explicit user action
};

function boothReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':               return { ...state, step: action.payload };
    case 'SET_PHOTO_COUNT':        return { ...state, photoCount: action.payload };
    case 'ADD_PHOTO':              return { ...state, photos: [...state.photos, action.payload] };
    case 'SET_PHOTOS':             return { ...state, photos: action.payload };
    case 'SET_FILTER':             return { ...state, currentFilter: action.payload };
    case 'SET_FILTER_INTENSITY':   return { ...state, filterIntensity: action.payload };
    case 'SET_LAYOUT':             return { ...state, stripLayout: action.payload };
    case 'SET_THEME':              return { ...state, stripTheme: action.payload };
    case 'SET_STICKERS':           return { ...state, stickers: action.payload };
    case 'ADD_STICKER':            return { ...state, stickers: [...state.stickers, action.payload] };
    case 'UPDATE_STICKER':
      return {
        ...state,
        stickers: state.stickers.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.props } : s
        ),
      };
    case 'REMOVE_STICKER':         return { ...state, stickers: state.stickers.filter(s => s.id !== action.payload) };
    case 'SET_TEXT_LAYERS':        return { ...state, textLayers: action.payload };
    case 'ADD_TEXT_LAYER':         return { ...state, textLayers: [...state.textLayers, action.payload] };
    case 'UPDATE_TEXT_LAYER':
      return {
        ...state,
        textLayers: state.textLayers.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.props } : t
        ),
      };
    case 'REMOVE_TEXT_LAYER':      return { ...state, textLayers: state.textLayers.filter(t => t.id !== action.payload) };
    case 'SET_CUSTOM_TEXT':        return { ...state, customText: action.payload };
    case 'SET_FRAME':              return { ...state, boothFrame: action.payload };
    case 'SET_WALLPAPER':          return { ...state, stripWallpaper: action.payload };
    case 'SET_ENHANCEMENTS':       return { ...state, enhancements: { ...state.enhancements, ...action.payload } };
    case 'SET_ENHANCEMENT_INTENSITY': return { ...state, enhancementIntensity: action.payload };
    case 'SET_ENHANCEMENTS_ENABLED':  return { ...state, enhancementsEnabled: action.payload };
    case 'RESET_SESSION':          return { ...initialState, step: 'select' };
    case 'NEW_SESSION':            return { ...initialState, sessionId: Date.now() };
    default: return state;
  }
}

export function BoothProvider({ children }) {
  const [state, dispatch] = useReducer(boothReducer, initialState);

  const setStep                = (step)      => dispatch({ type: 'SET_STEP', payload: step });
  const setPhotoCount          = (count)     => dispatch({ type: 'SET_PHOTO_COUNT', payload: count });
  const addPhoto               = (photo)     => dispatch({ type: 'ADD_PHOTO', payload: photo });
  const setPhotos              = (photos)    => dispatch({ type: 'SET_PHOTOS', payload: photos });
  const setFilter              = (filter)    => dispatch({ type: 'SET_FILTER', payload: filter });
  const setFilterIntensity     = (val)       => dispatch({ type: 'SET_FILTER_INTENSITY', payload: val });
  const setLayout              = (layout)    => dispatch({ type: 'SET_LAYOUT', payload: layout });
  const setTheme               = (theme)     => dispatch({ type: 'SET_THEME', payload: theme });
  const addSticker             = (sticker)   => dispatch({ type: 'ADD_STICKER', payload: sticker });
  const setStickers            = (stickers)  => dispatch({ type: 'SET_STICKERS', payload: stickers });
  const updateSticker          = (id, props) => dispatch({ type: 'UPDATE_STICKER', payload: { id, props } });
  const removeSticker          = (id)        => dispatch({ type: 'REMOVE_STICKER', payload: id });
  const addTextLayer           = (layer)     => dispatch({ type: 'ADD_TEXT_LAYER', payload: layer });
  const setTextLayers          = (layers)    => dispatch({ type: 'SET_TEXT_LAYERS', payload: layers });
  const updateTextLayer        = (id, props) => dispatch({ type: 'UPDATE_TEXT_LAYER', payload: { id, props } });
  const removeTextLayer        = (id)        => dispatch({ type: 'REMOVE_TEXT_LAYER', payload: id });
  const setCustomText          = (text)      => dispatch({ type: 'SET_CUSTOM_TEXT', payload: text });
  const setFrame               = (frame)     => dispatch({ type: 'SET_FRAME', payload: frame });
  const setWallpaper           = (wp)        => dispatch({ type: 'SET_WALLPAPER', payload: wp });
  const setEnhancements        = (e)         => dispatch({ type: 'SET_ENHANCEMENTS', payload: e });
  const setEnhancementIntensity= (val)       => dispatch({ type: 'SET_ENHANCEMENT_INTENSITY', payload: val });
  const setEnhancementsEnabled = (val)       => dispatch({ type: 'SET_ENHANCEMENTS_ENABLED', payload: val });
  const resetSession           = ()          => dispatch({ type: 'RESET_SESSION' });
  const newSession             = ()          => dispatch({ type: 'NEW_SESSION' });

  return (
    <BoothContext.Provider value={{
      ...state,
      setStep, setPhotoCount, addPhoto, setPhotos,
      setFilter, setFilterIntensity, setLayout, setTheme,
      addSticker, setStickers, updateSticker, removeSticker,
      addTextLayer, setTextLayers, updateTextLayer, removeTextLayer,
      setCustomText, setFrame, setWallpaper,
      setEnhancements, setEnhancementIntensity, setEnhancementsEnabled,
      resetSession, newSession,
    }}>
      {children}
    </BoothContext.Provider>
  );
}

export const useBooth = () => useContext(BoothContext);
