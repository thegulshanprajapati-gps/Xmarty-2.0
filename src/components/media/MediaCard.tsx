"use client"

import { motion } from 'framer-motion';
import { CheckCircle2, FileImage, Film, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaAsset } from '@/utils/media';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type MediaCardProps = {
  item: MediaAsset;
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
};

export default function MediaCard({ item, selected, onClick, onDoubleClick, onContextMenu, onDragStart }: MediaCardProps) {
  return (
    <motion.div
      layout
      data-media-card={item.id}
      data-ignore-selection="true"
      onDragStart={onDragStart as unknown as (event: MouseEvent | TouchEvent | PointerEvent) => void}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-3xl border border-border/60 bg-slate-950/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/80',
        selected && 'border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.24)] ring-1 ring-blue-400/30'
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
        {item.media_type === 'video' ? (
          <video
            src={item.url}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={item.thumbnail_url || item.url}
            alt={item.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-200 backdrop-blur-sm">
          {item.media_type}
        </div>
        <div className="absolute right-4 top-4 text-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-sm text-slate-100">
          <div className="truncate font-semibold">{item.name}</div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-400">
            <span>{item.size ? `${Math.round(item.size / 1024)} KB` : ''}</span>
            <span>{item.tags?.slice(0, 2).join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Badge variant="secondary" className="rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em]">
          {item.folder_name || 'Root'}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {item.tags?.length ? <Tag className="h-3.5 w-3.5" /> : null}
          <span>{item.tags?.length || 0} tags</span>
        </div>
      </div>

      <Separator className="border-slate-800" />
      <div className="flex items-center justify-between gap-2 px-4 py-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          {item.favorite ? <span className="text-blue-400">★</span> : <span className="text-slate-600">☆</span>}
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileImage className="h-3.5 w-3.5" />
          <span>{item.mime_type.replace('image/', '').replace('video/', '')}</span>
        </div>
      </div>
    </motion.div>
  );
}
