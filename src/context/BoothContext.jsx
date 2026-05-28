import React, { createContext, useContext, useReducer } from 'react';

const BoothContext = createContext();

const initialState = {
  step: 'landing', // 'landing' | 'entry' | 'select' | 'camera' | 'print' | 'customize' | 'result'
  photoCount: 4,
  photos: [],
  originalPhotos: [],
  currentFilter: 'normal',
  stripLayout: 'vertical',
  stripTheme: 'minimal',
  stickers: [],
  textLayers: [],
  customText: '',
  boothFrame: 'none',
  sessionId: null,
  // New States
  enhancements: {},
  enhancementIntensity: 0.6,
  enhancementsEnabled: false,
  currentBackground: 'none',
  currentMusic: 'none',
  isMuted: false,
};

function boothReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.payload };
    case 'SET_PHOTO_COUNT': return { ...state, photoCount: action.payload };
    case 'ADD_PHOTO': return { ...state, photos: [...state.photos, action.payload], originalPhotos: [...state.originalPhotos, action.payload] };
    case 'ADD_PHOTO_DUAL': return { ...state, photos: [...state.photos, action.payload.enhanced], originalPhotos: [...state.originalPhotos, action.payload.raw] };
    case 'SET_PHOTOS': return { ...state, photos: action.payload };
    case 'SET_ORIGINAL_PHOTOS': return { ...state, originalPhotos: action.payload };
    case 'SET_FILTER': return { ...state, currentFilter: action.payload };
    case 'SET_LAYOUT': return { ...state, stripLayout: action.payload };
    case 'SET_THEME': return { ...state, stripTheme: action.payload };
    case 'SET_STICKERS': return { ...state, stickers: action.payload };
    case 'ADD_STICKER': return { ...state, stickers: [...state.stickers, action.payload] };
    case 'SET_TEXT_LAYERS': return { ...state, textLayers: action.payload };
    case 'SET_CUSTOM_TEXT': return { ...state, customText: action.payload };
    case 'SET_FRAME': return { ...state, boothFrame: action.payload };
    case 'RESET_SESSION': return { ...initialState, step: 'select', currentBackground: state.currentBackground, currentMusic: state.currentMusic, isMuted: state.isMuted };
    case 'NEW_SESSION': return { ...initialState, sessionId: Date.now(), currentBackground: state.currentBackground, currentMusic: state.currentMusic, isMuted: state.isMuted };
    // Enhancement actions
    case 'SET_ENHANCEMENTS': return { ...state, enhancements: action.payload };
    case 'SET_ENHANCEMENT_INTENSITY': return { ...state, enhancementIntensity: action.payload };
    case 'SET_ENHANCEMENTS_ENABLED': return { ...state, enhancementsEnabled: action.payload };
    // Background & Music actions
    case 'SET_CURRENT_BACKGROUND': return { ...state, currentBackground: action.payload };
    case 'SET_CURRENT_MUSIC': return { ...state, currentMusic: action.payload };
    case 'SET_IS_MUTED': return { ...state, isMuted: action.payload };
    default: return state;
  }
}

export function BoothProvider({ children }) {
  const [state, dispatch] = useReducer(boothReducer, initialState);

  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const setPhotoCount = (count) => dispatch({ type: 'SET_PHOTO_COUNT', payload: count });
  const addPhoto = (photo) => dispatch({ type: 'ADD_PHOTO', payload: photo });
  const addPhotoDual = (raw, enhanced) => dispatch({ type: 'ADD_PHOTO_DUAL', payload: { raw, enhanced } });
  const setPhotos = (photos) => dispatch({ type: 'SET_PHOTOS', payload: photos });
  const setOriginalPhotos = (photos) => dispatch({ type: 'SET_ORIGINAL_PHOTOS', payload: photos });
  const setFilter = (filter) => dispatch({ type: 'SET_FILTER', payload: filter });
  const setLayout = (layout) => dispatch({ type: 'SET_LAYOUT', payload: layout });
  const setTheme = (theme) => dispatch({ type: 'SET_THEME', payload: theme });
  const addSticker = (sticker) => dispatch({ type: 'ADD_STICKER', payload: sticker });
  const setStickers = (stickers) => dispatch({ type: 'SET_STICKERS', payload: stickers });
  const setTextLayers = (layers) => dispatch({ type: 'SET_TEXT_LAYERS', payload: layers });
  const setCustomText = (text) => dispatch({ type: 'SET_CUSTOM_TEXT', payload: text });
  const setFrame = (frame) => dispatch({ type: 'SET_FRAME', payload: frame });
  const resetSession = () => dispatch({ type: 'RESET_SESSION' });
  const newSession = () => dispatch({ type: 'NEW_SESSION' });
  
  const setEnhancements = (enh) => dispatch({ type: 'SET_ENHANCEMENTS', payload: enh });
  const setEnhancementIntensity = (intensity) => dispatch({ type: 'SET_ENHANCEMENT_INTENSITY', payload: intensity });
  const setEnhancementsEnabled = (enabled) => dispatch({ type: 'SET_ENHANCEMENTS_ENABLED', payload: enabled });
  
  const setCurrentBackground = (bg) => dispatch({ type: 'SET_CURRENT_BACKGROUND', payload: bg });
  const setCurrentMusic = (music) => dispatch({ type: 'SET_CURRENT_MUSIC', payload: music });
  const setIsMuted = (muted) => dispatch({ type: 'SET_IS_MUTED', payload: muted });

  return (
    <BoothContext.Provider value={{
      ...state,
      setStep, setPhotoCount, addPhoto, addPhotoDual, setPhotos, setOriginalPhotos,
      setFilter, setLayout, setTheme, addSticker,
      setStickers, setTextLayers, setCustomText, setFrame,
      resetSession, newSession,
      setEnhancements, setEnhancementIntensity, setEnhancementsEnabled,
      setCurrentBackground, setCurrentMusic, setIsMuted,
    }}>
      {children}
    </BoothContext.Provider>
  );
}

export const useBooth = () => useContext(BoothContext);
