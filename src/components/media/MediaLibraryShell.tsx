"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Download, Folder, Search, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDragSelection } from '@/hooks/useDragSelection';
import { MediaLibraryProvider, useMediaLibraryStore } from '@/store/mediaStore';
import { batchMediaAction, createFolder, deleteFolder, deleteMediaItem, fetchFolders, fetchMedia, updateMediaItem, uploadMedia } from '@/services/mediaService';
import { sidebarItems, sortOptions } from '@/utils/media';
import { cn } from '@/lib/utils';
import MediaCard from './MediaCard';
import MediaPreviewDialog from './MediaPreviewDialog';
import type { MediaAsset, MediaFolder } from '@/utils/media';

type UploadQueueItem = {
  id: string;
  file: File;
  progress: number;
  status: 'waiting' | 'uploading' | 'done' | 'error';
  preview: string;
};

type ToastItem = {
  id?: string;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

type MediaLibraryShellProps = {
  initialMode?: 'library' | 'recycle';
};

function useMediaData(initialMode: 'library' | 'recycle' = 'library') {
  const { state, dispatch } = useMediaLibraryStore();
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebouncedValue(state.search, 350);

  const loadFolders = useCallback(async () => {
    try {
      const response = await fetchFolders(state.activeFolderId || undefined);
      setFolders(response);
    } catch (error) {
      console.error('Failed to load folders', error);
    }
  }, [state.activeFolderId]);

  const loadMedia = useCallback(
    async (requestedPage = 1) => {
      setLoading(true);
      try {
        const response = await fetchMedia({
          folderId: state.activeFolderId || undefined,
          search: debouncedSearch || undefined,
          sortBy: state.sortBy,
          recycle: state.mode === 'recycle',
          page: requestedPage,
          pageSize: 32,
        });
        setItems(prev => (requestedPage === 1 ? response.items : [...prev, ...response.items]));
        setTotal(response.total);
        setHasMore(response.items.length >= 32 && response.items.length + (requestedPage - 1) * 32 < response.total);
      } catch (error) {
        console.error('Failed to load media', error);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, state.activeFolderId, state.mode, state.sortBy]
  );

  useEffect(() => {
    dispatch({ type: 'SET_MODE', payload: initialMode });
  }, [initialMode, dispatch]);

  useEffect(() => {
    setPage(1);
    loadMedia(1);
  }, [loadMedia]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return { items, setItems, folders, loading, hasMore, total, page, setPage, loadMedia, loadFolders };
}

function MediaLibraryContent({ initialMode }: MediaLibraryShellProps) {
  const { state, dispatch } = useMediaLibraryStore();
  const { items, setItems, folders, loading, hasMore, total, page, setPage, loadMedia, loadFolders } = useMediaData(initialMode);
  const [previewItem, setPreviewItem] = useState<MediaAsset | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MediaAsset } | null>(null);
  const [contextItem, setContextItem] = useState<MediaAsset | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveTargetFolder, setMoveTargetFolder] = useState<MediaFolder | null>(null);
  const [toastItems, setToastItems] = useState<ToastItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastSelectedIndex = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { containerRef, selectionState, handlePointerDown, clearSelection } = useDragSelection(selectedIds => {
    dispatch({ type: 'SELECT_IDS', payload: selectedIds });
  });

  const hoveredId = useRef<string | null>(null);

  const selectedItems = useMemo(() => items.filter(item => state.selectedIds.includes(item.id)), [items, state.selectedIds]);

  const addToast = useCallback((toast: ToastItem) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToastItems(prev => [{ ...toast, id }, ...prev].slice(0, 4));
  }, []);

  useEffect(() => {
    const timeout = window.setInterval(() => {
      setToastItems(prev => prev.slice(0, 4));
    }, 8000);
    return () => window.clearInterval(timeout);
  }, []);


  const pageTitle = state.mode === 'recycle' ? 'Recycle Bin' : 'Media Library';
  const description = state.mode === 'recycle' ? 'Restore or permanently delete files.' : 'Drag, search, preview and manage your media assets.';

  const hasSelection = state.selectedIds.length > 0;

  const selectedCountLabel = hasSelection ? `${state.selectedIds.length} selected` : 'No selection';

  const sorted = useMemo(() => sortOptions.find(option => option.value === state.sortBy)?.label || 'Newest', [state.sortBy]);

  const handleMediaSelection = useCallback(
    (item: MediaAsset, index: number, event: MouseEvent<HTMLDivElement>) => {
      const ctrlMeta = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      if (shift && lastSelectedIndex.current !== null) {
        const start = Math.min(lastSelectedIndex.current, index);
        const end = Math.max(lastSelectedIndex.current, index);
        const ids = items.slice(start, end + 1).map(item => item.id);
        dispatch({ type: 'SELECT_IDS', payload: ids });
        return;
      }
      if (ctrlMeta) {
        dispatch({ type: 'SELECT_ITEM', payload: item });
        lastSelectedIndex.current = index;
        return;
      }
      dispatch({ type: 'SELECT_IDS', payload: [item.id] });
      lastSelectedIndex.current = index;
    },
    [dispatch, items]
  );

  const loadNextPage = useCallback(() => {
    if (!hasMore || loading) return;
    setPage(curr => curr + 1);
  }, [hasMore, loading]);

  useEffect(() => {
    if (page === 1) return;
    loadMedia(page);
  }, [page, loadMedia]);

  const handleUploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter(file => /image|video/.test(file.type));
      if (fileArray.length === 0) {
        addToast({ title: 'Unsupported file', description: 'Only image and video files can be uploaded.', variant: 'destructive' });
        return;
      }
      const queueItems = fileArray.map(file => ({ id: `${file.name}-${Date.now()}`, file, progress: 0, status: 'waiting' as const, preview: URL.createObjectURL(file) }));
      setUploadQueue(prev => [...prev, ...queueItems]);

      for (const uploadItem of queueItems) {
        setUploadQueue(prev => prev.map(item => item.id === uploadItem.id ? { ...item, status: 'uploading', progress: 10 } : item));
        try {
          await new Promise(resolve => setTimeout(resolve, 120));
          const asset = await uploadMedia(uploadItem.file, {
            folderId: state.activeFolderId || undefined,
            folderName: folders.find(folder => folder.id === state.activeFolderId)?.name || undefined,
            tags: [],
            name: uploadItem.file.name,
          });
          setUploadQueue(prev => prev.map(item => item.id === uploadItem.id ? { ...item, status: 'done', progress: 100 } : item));
          setItems(prev => [asset, ...prev]);
          addToast({ title: 'Upload complete', description: `${asset.name} uploaded successfully.` });
        } catch (error: any) {
          setUploadQueue(prev => prev.map(item => item.id === uploadItem.id ? { ...item, status: 'error', progress: 100 } : item));
          addToast({ title: 'Upload error', description: error?.message || 'Unable to upload file.', variant: 'destructive' });
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    },
    [addToast, folders, state.activeFolderId, setItems, state.activeFolderId]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      if (!files.length) return;
      handleUploadFiles(files);
    },
    [handleUploadFiles]
  );

  const handleBulkAction = useCallback(
    async (action: 'delete' | 'restore' | 'permanent' | 'move') => {
      try {
        if (!state.selectedIds.length) return;
        if (action === 'move' && moveTargetFolder) {
          await batchMediaAction('move', state.selectedIds, { folder_id: moveTargetFolder.id, folder_name: moveTargetFolder.name });
          addToast({ title: 'Moved', description: `${state.selectedIds.length} assets moved.` });
          setMoveTargetFolder(null);
          setShowMoveDialog(false);
        } else if (action === 'restore') {
          await batchMediaAction('restore', state.selectedIds);
          addToast({ title: 'Restored', description: `${state.selectedIds.length} assets restored.` });
        } else if (action === 'delete') {
          await batchMediaAction('delete', state.selectedIds);
          addToast({ title: 'Deleted', description: `${state.selectedIds.length} assets moved to recycle bin.` });
        } else if (action === 'permanent') {
          for (const id of state.selectedIds) {
            await deleteMediaItem(id, true);
          }
          addToast({ title: 'Permanently deleted', description: `${state.selectedIds.length} assets removed.` });
        }
        dispatch({ type: 'CLEAR_SELECTION' });
        loadMedia(1);
      } catch (error: any) {
        addToast({ title: 'Action failed', description: error?.message || 'Bulk action could not complete.', variant: 'destructive' });
      }
    },
    [addToast, dispatch, loadMedia, moveTargetFolder, state.selectedIds]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        dispatch({ type: 'SELECT_IDS', payload: items.map(item => item.id) });
      }
      if (event.key === 'Escape') {
        dispatch({ type: 'CLEAR_SELECTION' });
        setPreviewItem(null);
      }
      if (event.key === 'Delete' && state.selectedIds.length > 0) {
        handleBulkAction(state.mode === 'recycle' ? 'permanent' : 'delete');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, handleBulkAction, items, state.mode, state.selectedIds.length]);

  const handleFolderChange = useCallback(async () => {
    const name = window.prompt('New folder name');
    if (!name?.trim()) return;
    try {
      await createFolder(name.trim(), state.activeFolderId || undefined);
      addToast({ title: 'Folder created', description: `Created ${name.trim()}.` });
      loadFolders();
    } catch (error: any) {
      addToast({ title: 'Failed to create folder', description: error?.message || 'Please try again.', variant: 'destructive' });
    }
  }, [addToast, loadFolders, state.activeFolderId]);

  const handleFolderClick = useCallback((folder: MediaFolder) => {
    dispatch({ type: 'SET_FOLDER', payload: folder.id });
  }, [dispatch]);

  const handleMoveItem = useCallback(async (targetFolder: MediaFolder) => {
    try {
      if (!contextItem) return;
      await updateMediaItem(contextItem.id, { folder_id: targetFolder.id, folder_name: targetFolder.name });
      addToast({ title: 'Moved asset', description: `${contextItem.name} moved to ${targetFolder.name}.` });
      loadMedia(1);
      setContextItem(null);
    } catch (error: any) {
      addToast({ title: 'Move failed', description: error?.message || 'Unable to move asset.', variant: 'destructive' });
    }
  }, [addToast, contextItem, loadMedia]);

  const handleDeleteItem = useCallback(async (item: MediaAsset, hard = false) => {
    try {
      await deleteMediaItem(item.id, hard);
      addToast({ title: hard ? 'Deleted permanently' : 'Moved to recycle bin', description: `${item.name} has been updated.` });
      loadMedia(1);
    } catch (error: any) {
      addToast({ title: 'Delete failed', description: error?.message || 'Unable to update asset.', variant: 'destructive' });
    }
  }, [addToast, loadMedia]);

  const handleRenameItem = useCallback(async (item: MediaAsset) => {
    const name = window.prompt('Rename file', item.name);
    if (!name || name.trim() === item.name) return;
    try {
      await updateMediaItem(item.id, { name: name.trim() });
      addToast({ title: 'Renamed', description: `${item.name} is now ${name.trim()}.` });
      loadMedia(1);
    } catch (error: any) {
      addToast({ title: 'Rename failed', description: error?.message || 'Unable to rename asset.', variant: 'destructive' });
    }
  }, [addToast, loadMedia]);

  const handleDownload = useCallback((item: MediaAsset) => {
    const anchor = document.createElement('a');
    anchor.href = item.url;
    anchor.download = item.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    addToast({ title: 'Download started', description: `${item.name} is downloading.` });
  }, [addToast]);

  const handleSearchChange = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, [dispatch]);

  const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleUploadFiles(event.target.files);
    event.target.value = '';
  }, [handleUploadFiles]);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const activeFolder = folders.find(folder => folder.id === state.activeFolderId);

  const rootFolders = folders.filter(folder => !folder.parent_folder_id);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleFolderDrop = useCallback(
    async (folder: MediaFolder, event: DragEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (!id) return;
      try {
        await updateMediaItem(id, { folder_id: folder.id, folder_name: folder.name });
        addToast({ title: 'Moved asset', description: `File moved to ${folder.name}.` });
        loadMedia(1);
      } catch (error: any) {
        addToast({ title: 'Move failed', description: error?.message || 'Unable to move asset.', variant: 'destructive' });
      }
    },
    [addToast, loadMedia]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Asset manager</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm" onClick={triggerFilePicker} className="hidden sm:inline-flex">
                <Upload className="h-4 w-4" /> Upload files
              </Button>
              <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleFileInputChange} />
              <Button variant="outline" size="sm" onClick={handleFolderChange}>
                <Folder className="h-4 w-4" /> New folder
              </Button>
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'SET_VIEW', payload: state.viewMode === 'grid' ? 'masonry' : 'grid' })}> 
                {state.viewMode === 'grid' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                {state.viewMode === 'grid' ? 'Masonry' : 'Grid'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={state.mode === 'library' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_MODE', payload: 'library' })}
              >
                Library
              </Button>
              <Button
                variant={state.mode === 'recycle' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => dispatch({ type: 'SET_MODE', payload: 'recycle' })}
              >
                Recycle
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-3">
              <Search className="h-5 w-5 text-slate-400" />
              <Input
                value={state.search}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder="Search by name, tag, folder or type..."
                className="bg-transparent text-slate-100 placeholder:text-slate-500 focus:ring-blue-400/40"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="hidden sm:flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-3">
              <Search className="h-5 w-5 text-slate-400" />
              <Input
                value={state.search}
                onChange={event => handleSearchChange(event.target.value)}
                placeholder="Search by name, tag, folder or type..."
                className="bg-transparent text-slate-100 placeholder:text-slate-500 focus:ring-blue-400/40"
              />
            </div>
            <div className="grid gap-3">
              <div className="grid gap-2 rounded-3xl border border-slate-800 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  <span>Sort by</span>
                  <Badge className="bg-slate-800 text-slate-200">{sorted}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={state.sortBy === option.value ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SORT', payload: option.value })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2 rounded-3xl border border-slate-800 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                  <span>Folder</span>
                  <Badge className="bg-slate-800 text-slate-200">{activeFolder?.name || 'Root'}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'SET_FOLDER', payload: null })}>
                    Root
                  </Button>
                  {folders.slice(0, 4).map(folder => (
                    <Button key={folder.id} variant="ghost" size="sm" onClick={() => handleFolderClick(folder)}>
                      {folder.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          <aside className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl shadow-black/20">
            <div className="space-y-3">
              <h2 className="text-sm uppercase tracking-[0.28em] text-slate-500">Quick navigation</h2>
              <div className="grid gap-2">
                {sidebarItems.map(item => (
                  <a
                    key={item.id}
                    href={item.path}
                    className="rounded-2xl border border-slate-800 px-4 py-3 text-sm transition hover:border-blue-500/80 hover:bg-slate-950"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm uppercase tracking-[0.28em] text-slate-500">Folders</h2>
                <Button size="sm" variant="ghost" onClick={handleFolderChange}>Add</Button>
              </div>
              <div className="space-y-2">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => handleFolderClick(folder)}
                    onDrop={event => handleFolderDrop(folder, event)}
                    onDragOver={event => event.preventDefault()}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-3 text-left text-sm transition',
                      state.activeFolderId === folder.id
                        ? 'border-blue-500/80 bg-blue-500/10 text-slate-100'
                        : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    )}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Selection</p>
                  <h2 className="text-xl font-semibold text-white">{selectedCountLabel}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'CLEAR_SELECTION' })} disabled={!hasSelection}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction(state.mode === 'recycle' ? 'restore' : 'delete')} disabled={!hasSelection}>
                    {state.mode === 'recycle' ? 'Restore' : 'Move to Bin'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction(state.mode === 'recycle' ? 'permanent' : 'delete')} disabled={!hasSelection}>
                    {state.mode === 'recycle' ? 'Delete forever' : 'Delete'}
                  </Button>
                </div>
              </div>
              {hasSelection ? (
                <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-4 text-sm text-slate-300">
                  <p>{selectedItems.length} assets selected. Use bulk actions or right-click any item for context commands.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowMoveDialog(true)} disabled={!hasSelection}>
                      Move selected
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleBulkAction('delete')} disabled={!hasSelection || state.mode === 'recycle'}>
                      Delete selected
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              ref={node => {
                gridRef.current = node;
                if (containerRef) (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              }}
              onPointerDown={handlePointerDown as unknown as React.PointerEventHandler<HTMLDivElement>}
              onDrop={handleDrop}
              onDragOver={event => event.preventDefault()}
              className="relative rounded-3xl border border-slate-800 bg-slate-950/90 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">All media</h3>
                  <p className="text-sm text-slate-400">{total} assets available. Drag files here to upload.</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                  {state.mode === 'recycle' ? 'Recycle bin active' : 'Live library'}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {loading && items.length === 0 ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-[4/3] animate-pulse rounded-3xl bg-slate-900" />
                )) : items.length === 0 ? (
                  <div className="col-span-full rounded-3xl border border-dashed border-slate-700 bg-slate-900/80 p-10 text-center text-slate-400">
                    No assets found. Upload files or change filters to see content.
                  </div>
                ) : items.map((item, index) => (
                  <div key={item.id} className="relative">
                    <MediaCard
                      item={item}
                      selected={state.selectedIds.includes(item.id)}
                      onClick={event => handleMediaSelection(item, index, event)}
                      onDoubleClick={() => setPreviewItem(item)}
                      onContextMenu={event => {
                        event.preventDefault();
                        setContextMenu({ x: event.clientX, y: event.clientY, item });
                      }}
                      onDragStart={event => {
                        event.dataTransfer.setData('text/plain', item.id);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                    />
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {selectionState.active && selectionState.rect.width > 10 && selectionState.rect.height > 10 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      left: selectionState.rect.x,
                      top: selectionState.rect.y,
                      width: selectionState.rect.width,
                      height: selectionState.rect.height,
                    }}
                    className="pointer-events-none absolute z-50 rounded-3xl border border-blue-400/70 bg-blue-500/20"
                  />
                ) : null}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button variant="secondary" size="sm" onClick={() => loadNextPage()} disabled={!hasMore || loading}>
                  {hasMore ? 'Load more' : 'No more assets'}
                </Button>
                <span className="text-xs uppercase tracking-[0.28em] text-slate-500">Scroll for more</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {uploadQueue.length > 0 ? (
        <div className="fixed bottom-5 right-5 z-50 w-[320px] space-y-3 rounded-3xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">Upload queue</p>
              <p className="text-xs text-slate-400">Your files are being uploaded.</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setUploadQueue([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {uploadQueue.map(item => (
              <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-3">
                <div className="flex items-center justify-between gap-2 text-sm text-slate-200">
                  <span className="truncate">{item.file.name}</span>
                  <span>{item.status}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-2xl bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Move selected assets</DialogTitle>
            <DialogDescription>Choose a folder to place your selection into.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            {folders.length ? folders.map(folder => (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  setMoveTargetFolder(folder);
                }}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left text-sm transition',
                  moveTargetFolder?.id === folder.id ? 'border-blue-500/80 bg-blue-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                )}
              >
                {folder.name}
              </button>
            )) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">No folders found yet.</div>
            )}
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowMoveDialog(false)}>Cancel</Button>
            <Button variant="default" onClick={() => handleBulkAction('move')} disabled={!moveTargetFolder}>Move</Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaPreviewDialog
        item={previewItem}
        open={Boolean(previewItem)}
        onOpenChange={open => { if (!open) setPreviewItem(null); }}
        onPrevious={() => {
          if (!previewItem) return;
          const index = items.findIndex(item => item.id === previewItem.id);
          const prev = items[(index - 1 + items.length) % items.length];
          setPreviewItem(prev);
        }}
        onNext={() => {
          if (!previewItem) return;
          const index = items.findIndex(item => item.id === previewItem.id);
          const next = items[(index + 1) % items.length];
          setPreviewItem(next);
        }}
      />

      {contextMenu ? (
        <div
          className="fixed z-50 min-w-[220px] rounded-3xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl shadow-black/50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={event => event.stopPropagation()}
        >
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { setPreviewItem(contextMenu.item); setContextMenu(null); }}>
            Open
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { handleRenameItem(contextMenu.item); setContextMenu(null); }}>
            Rename
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { handleDownload(contextMenu.item); setContextMenu(null); }}>
            Download
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { setShowMoveDialog(true); setContextMenu(null); setContextItem(contextMenu.item); }}>
            Move
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { handleDeleteItem(contextMenu.item, state.mode === 'recycle'); setContextMenu(null); }}>
            {state.mode === 'recycle' ? 'Delete forever' : 'Delete'}
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { const tag = window.prompt('Add a tag'); if (tag && contextMenu) { updateMediaItem(contextMenu.item.id, { tags: Array.from(new Set([...(contextMenu.item.tags || []), tag.trim()])) }); addToast({ title: 'Tag added', description: `${tag} attached to ${contextMenu.item.name}` }); setContextMenu(null); } }}>
            Add tag
          </button>
          <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 hover:bg-slate-900" onClick={() => { navigator.clipboard.writeText(contextMenu.item.url); addToast({ title: 'Link copied', description: 'Share URL copied to clipboard.' }); setContextMenu(null); }}>
            Share
          </button>
        </div>
      ) : null}

      <ToastProvider>
        {toastItems.map(toast => (
          <Toast key={toast.id} open>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}

export default function MediaLibraryShell({ initialMode = 'library' }: MediaLibraryShellProps) {
  return (
    <MediaLibraryProvider initialMode={initialMode}>
      <MediaLibraryContent initialMode={initialMode} />
    </MediaLibraryProvider>
  );
}
