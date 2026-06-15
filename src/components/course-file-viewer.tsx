'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, ChevronLeft, ChevronRight, FileText, Music, Video, Image as ImageIcon, File, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface CourseContentItem {
  id: string;
  title: string;
  file_url: string;
  file_name?: string;
  item_type?: string;
  thumbnail_url?: string;
}

type FileKind = 'pdf' | 'video' | 'audio' | 'image' | 'other';

function detectKind(item: CourseContentItem): FileKind {
  const url = (item.file_url || '').toLowerCase();
  const type = (item.item_type || '').toLowerCase();
  const name = (item.file_name || '').toLowerCase();

  if (type.includes('pdf') || url.endsWith('.pdf') || name.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('video') || /\.(mp4|webm|ogg|mov|mkv|avi)/.test(url)) return 'video';
  if (type.startsWith('audio') || /\.(mp3|wav|ogg|m4a|flac|aac)/.test(url)) return 'audio';
  if (type.startsWith('image') || /\.(jpg|jpeg|png|gif|webp|svg|avif)/.test(url)) return 'image';
  return 'other';
}

const KIND_ICONS: Record<FileKind, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-rose-400" />,
  video: <Video className="h-5 w-5 text-blue-400" />,
  audio: <Music className="h-5 w-5 text-purple-400" />,
  image: <ImageIcon className="h-5 w-5 text-emerald-400" />,
  other: <File className="h-5 w-5 text-slate-400" />,
};

const KIND_LABELS: Record<FileKind, string> = {
  pdf: 'PDF Document',
  video: 'Video',
  audio: 'Audio',
  image: 'Image',
  other: 'File',
};

const KIND_COLORS: Record<FileKind, string> = {
  pdf: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  video: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  audio: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  image: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

// ─── Viewer Modal ────────────────────────────────────────────────────────────
interface ViewerModalProps {
  items: CourseContentItem[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function ViewerModal({ items, activeIndex, onClose, onNavigate }: ViewerModalProps) {
  const item = items[activeIndex];
  const kind = detectKind(item);
  const [imageZoom, setImageZoom] = useState(1);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) onNavigate(activeIndex - 1);
  }, [activeIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (activeIndex < items.length - 1) onNavigate(activeIndex + 1);
  }, [activeIndex, items.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, goPrev, goNext]);

  // Reset zoom when item changes
  useEffect(() => setImageZoom(1), [activeIndex]);

  const modal = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Kind badge */}
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${KIND_COLORS[kind]}`}>
            {KIND_ICONS[kind]}
            {KIND_LABELS[kind]}
          </span>
          <h2 className="text-sm font-bold text-white truncate">{item.title}</h2>
          {item.file_name && (
            <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">{item.file_name}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Image zoom controls */}
          {kind === 'image' && (
            <>
              <button onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors" title="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-400 min-w-[40px] text-center">{Math.round(imageZoom * 100)}%</span>
              <button onClick={() => setImageZoom(z => Math.min(4, z + 0.25))} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors" title="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={() => setImageZoom(1)} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors" title="Reset zoom">
                <RotateCcw className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-white/10 mx-1" />
            </>
          )}

          {/* Open in new tab */}
          <a href={item.file_url} target="_blank" rel="noreferrer"
            className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-[11px] font-bold text-slate-300 transition-colors">
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>

          {/* Download */}
          <a href={item.file_url} download target="_blank" rel="noreferrer"
            className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-[11px] font-bold text-slate-300 transition-colors">
            <Download className="h-3.5 w-3.5" /> Download
          </a>

          {/* Close */}
          <button onClick={onClose} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center text-slate-300 transition-colors ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Viewer Area ── */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">

        {/* Prev Arrow */}
        {activeIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-4 z-10 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Next Arrow */}
        {activeIndex < items.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 z-10 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* ── PDF Viewer ── */}
        {kind === 'pdf' && (
          <iframe
            key={item.file_url}
            src={`${item.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={item.title}
            allow="fullscreen"
          />
        )}

        {/* ── Video Player ── */}
        {kind === 'video' && (
          <div className="w-full h-full flex items-center justify-center p-4">
            <video
              key={item.file_url}
              controls
              autoPlay={false}
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10"
              style={{ maxHeight: 'calc(100vh - 140px)' }}
            >
              <source src={item.file_url} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* ── Audio Player ── */}
        {kind === 'audio' && (
          <div className="flex flex-col items-center justify-center gap-8 p-8 text-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-800/30 border border-purple-500/20 flex items-center justify-center animate-pulse">
              <Music className="h-14 w-14 text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              {item.file_name && <p className="text-sm text-slate-400">{item.file_name}</p>}
            </div>
            <audio
              key={item.file_url}
              controls
              autoPlay={false}
              className="w-full max-w-md rounded-full"
              style={{ colorScheme: 'dark' }}
            >
              <source src={item.file_url} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        )}

        {/* ── Image Viewer ── */}
        {kind === 'image' && (
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={item.file_url}
              src={item.file_url}
              alt={item.title}
              className="object-contain rounded-xl shadow-2xl transition-transform duration-200"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 140px)',
                transform: `scale(${imageZoom})`,
                transformOrigin: 'center center',
              }}
              draggable={false}
            />
          </div>
        )}

        {/* ── Other / Unknown File ── */}
        {kind === 'other' && (
          <div className="flex flex-col items-center gap-6 text-center p-8">
            <div className="h-24 w-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <File className="h-10 w-10 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.file_name}</p>
              <p className="text-xs text-slate-500">Preview not available for this file type.</p>
            </div>
            <div className="flex gap-3">
              <a href={item.file_url} target="_blank" rel="noreferrer"
                className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-bold text-white flex items-center gap-2 transition-colors border border-white/10">
                <ExternalLink className="h-4 w-4" /> Open in Browser
              </a>
              <a href={item.file_url} download target="_blank" rel="noreferrer"
                className="h-10 px-5 rounded-xl bg-primary/80 hover:bg-primary text-sm font-bold text-white flex items-center gap-2 transition-colors">
                <Download className="h-4 w-4" /> Download File
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Filmstrip (thumbnails) ── */}
      {items.length > 1 && (
        <div className="shrink-0 border-t border-white/10 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {items.map((it, i) => {
            const k = detectKind(it);
            const isActive = i === activeIndex;
            return (
              <button
                key={it.id}
                onClick={() => onNavigate(i)}
                className={`shrink-0 h-12 w-16 rounded-lg border overflow-hidden flex items-center justify-center transition-all ${
                  isActive
                    ? 'border-primary ring-1 ring-primary scale-105'
                    : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                {it.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.thumbnail_url} alt={it.title} className="h-full w-full object-cover" />
                ) : k === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.file_url} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900">
                    {KIND_ICONS[k]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modal, document.body);
}

// ─── File Cards Grid (Public API) ───────────────────────────────────────────
interface CourseFileViewerProps {
  items: CourseContentItem[];
}

export function CourseFileViewer({ items }: CourseFileViewerProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed p-10 text-center text-sm text-muted-foreground bg-muted/5">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-25" />
        <p className="font-semibold">No resources or lectures uploaded yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── File Cards Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => {
          const kind = detectKind(item);
          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className="group relative text-left rounded-2xl overflow-hidden border border-primary/5 bg-background shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {/* Thumbnail / Icon Preview */}
              <div className="relative h-32 w-full bg-muted/20 overflow-hidden">
                {item.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.file_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className={`h-full w-full flex flex-col items-center justify-center gap-2 transition-colors duration-200 ${KIND_COLORS[kind]} bg-opacity-10`}>
                    <div className="h-12 w-12 rounded-2xl bg-background/80 flex items-center justify-center shadow-md">
                      {KIND_ICONS[kind]}
                    </div>
                    <span className="text-[9px] uppercase font-black tracking-widest opacity-60">{KIND_LABELS[kind]}</span>
                  </div>
                )}

                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all duration-200 scale-75 group-hover:scale-100 shadow-lg">
                    {kind === 'video' ? (
                      <Video className="h-5 w-5 text-slate-800 ml-0.5" />
                    ) : kind === 'audio' ? (
                      <Music className="h-5 w-5 text-slate-800" />
                    ) : kind === 'pdf' ? (
                      <FileText className="h-5 w-5 text-slate-800" />
                    ) : kind === 'image' ? (
                      <ZoomIn className="h-5 w-5 text-slate-800" />
                    ) : (
                      <Download className="h-5 w-5 text-slate-800" />
                    )}
                  </div>
                </div>
              </div>

              {/* Info row */}
              <div className="p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground leading-tight truncate">{item.title}</p>
                  {item.file_name && (
                    <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{item.file_name}</p>
                  )}
                </div>
                <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${KIND_COLORS[kind]}`}>
                  {KIND_LABELS[kind]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Fullscreen Viewer Modal ── */}
      {activeIndex !== null && (
        <ViewerModal
          items={items}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      )}
    </>
  );
}
