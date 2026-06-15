'use client'

import * as React from 'react';
import type { MediaAsset, MediaFolder } from '@/utils/media';

export type MediaLibraryState = {
  activeFolderId: string | null;
  selectedIds: string[];
  selectedItems: MediaAsset[];
  viewMode: 'grid' | 'masonry';
  sortBy: 'newest' | 'oldest' | 'name' | 'size' | 'type';
  search: string;
  mode: 'library' | 'recycle';
  folders: MediaFolder[];
};

export type MediaLibraryAction =
  | { type: 'SET_FOLDER'; payload: string | null }
  | { type: 'SET_MODE'; payload: MediaLibraryState['mode'] }
  | { type: 'SET_VIEW'; payload: MediaLibraryState['viewMode'] }
  | { type: 'SET_SORT'; payload: MediaLibraryState['sortBy'] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_FOLDERS'; payload: MediaFolder[] }
  | { type: 'SELECT_IDS'; payload: string[] }
  | { type: 'SELECT_ITEM'; payload: MediaAsset }
  | { type: 'DESELECT_ALL' }
  | { type: 'CLEAR_SELECTION' };

const initialState: MediaLibraryState = {
  activeFolderId: null,
  selectedIds: [],
  selectedItems: [],
  viewMode: 'grid',
  sortBy: 'newest',
  search: '',
  mode: 'library',
  folders: [],
};

function reducer(state: MediaLibraryState, action: MediaLibraryAction): MediaLibraryState {
  switch (action.type) {
    case 'SET_FOLDER':
      return { ...state, activeFolderId: action.payload, selectedIds: [], selectedItems: [] };
    case 'SET_MODE':
      return { ...state, mode: action.payload, selectedIds: [], selectedItems: [] };
    case 'SET_VIEW':
      return { ...state, viewMode: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload };
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'SELECT_IDS':
      return { ...state, selectedIds: action.payload };
    case 'SELECT_ITEM': {
      const duplicate = state.selectedIds.includes(action.payload.id);
      const selectedIds = duplicate
        ? state.selectedIds.filter(id => id !== action.payload.id)
        : [...state.selectedIds, action.payload.id];
      const selectedItems = duplicate
        ? state.selectedItems.filter(item => item.id !== action.payload.id)
        : [...state.selectedItems, action.payload];
      return { ...state, selectedIds, selectedItems };
    }
    case 'DESELECT_ALL':
      return { ...state, selectedIds: [], selectedItems: [] };
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: [], selectedItems: [] };
    default:
      return state;
  }
}

const MediaLibraryContext = React.createContext<{
  state: MediaLibraryState;
  dispatch: React.Dispatch<MediaLibraryAction>;
} | null>(null);

export function MediaLibraryProvider({ children, initialMode }: { children: React.ReactNode; initialMode?: MediaLibraryState['mode'] }) {
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    mode: initialMode || initialState.mode,
  });

  const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <MediaLibraryContext.Provider value={value}>{children}</MediaLibraryContext.Provider>;
}

export function useMediaLibraryStore() {
  const context = React.useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibraryStore must be used inside MediaLibraryProvider');
  }
  return context;
}
