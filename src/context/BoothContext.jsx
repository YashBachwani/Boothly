import React, { createContext, useContext, useReducer } from 'react';

const BoothContext = createContext();

const initialState = {
  step: 'landing', // 'landing' | 'entry' | 'select' | 'camera' | 'print' | 'customize' | 'result'
  photoCount: 4,
  photos: [],
  currentFilter: 'normal',
  stripLayout: 'vertical',
  stripTheme: 'minimal',
  stickers: [],
  customText: '',
  boothFrame: 'none',
  sessionId: null,
};

function boothReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP': return { ...state, step: action.payload };
    case 'SET_PHOTO_COUNT': return { ...state, photoCount: action.payload };
    case 'ADD_PHOTO': return { ...state, photos: [...state.photos, action.payload] };
    case 'SET_PHOTOS': return { ...state, photos: action.payload };
    case 'SET_FILTER': return { ...state, currentFilter: action.payload };
    case 'SET_LAYOUT': return { ...state, stripLayout: action.payload };
    case 'SET_THEME': return { ...state, stripTheme: action.payload };
    case 'SET_STICKERS': return { ...state, stickers: action.payload };
    case 'ADD_STICKER': return { ...state, stickers: [...state.stickers, action.payload] };
    case 'SET_CUSTOM_TEXT': return { ...state, customText: action.payload };
    case 'SET_FRAME': return { ...state, boothFrame: action.payload };
    case 'RESET_SESSION': return { ...initialState, step: 'select' };
    case 'NEW_SESSION': return { ...initialState, sessionId: Date.now() };
    default: return state;
  }
}

export function BoothProvider({ children }) {
  const [state, dispatch] = useReducer(boothReducer, initialState);

  const setStep = (step) => dispatch({ type: 'SET_STEP', payload: step });
  const setPhotoCount = (count) => dispatch({ type: 'SET_PHOTO_COUNT', payload: count });
  const addPhoto = (photo) => dispatch({ type: 'ADD_PHOTO', payload: photo });
  const setPhotos = (photos) => dispatch({ type: 'SET_PHOTOS', payload: photos });
  const setFilter = (filter) => dispatch({ type: 'SET_FILTER', payload: filter });
  const setLayout = (layout) => dispatch({ type: 'SET_LAYOUT', payload: layout });
  const setTheme = (theme) => dispatch({ type: 'SET_THEME', payload: theme });
  const addSticker = (sticker) => dispatch({ type: 'ADD_STICKER', payload: sticker });
  const setStickers = (stickers) => dispatch({ type: 'SET_STICKERS', payload: stickers });
  const setCustomText = (text) => dispatch({ type: 'SET_CUSTOM_TEXT', payload: text });
  const setFrame = (frame) => dispatch({ type: 'SET_FRAME', payload: frame });
  const resetSession = () => dispatch({ type: 'RESET_SESSION' });
  const newSession = () => dispatch({ type: 'NEW_SESSION' });

  return (
    <BoothContext.Provider value={{
      ...state,
      setStep, setPhotoCount, addPhoto, setPhotos,
      setFilter, setLayout, setTheme, addSticker,
      setStickers, setCustomText, setFrame,
      resetSession, newSession,
    }}>
      {children}
    </BoothContext.Provider>
  );
}

export const useBooth = () => useContext(BoothContext);
