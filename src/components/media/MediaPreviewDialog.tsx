"use client"

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MediaAsset } from '@/utils/media';
import { ArrowLeft, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PreviewDialogProps = {
  item: MediaAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function MediaPreviewDialog({ item, open, onOpenChange, onPrevious, onNext }: PreviewDialogProps) {
  const [zoom, setZoom] = useState(1);
  const previewSource = item?.thumbnail_url || item?.url || '';

  const metadata = useMemo(
    () => [
      { label: 'File name', value: item?.name || '-' },
      { label: 'Type', value: item?.mime_type || '-' },
      { label: 'Size', value: item?.size ? `${Math.round(item.size / 1024)} KB` : '-' },
      { label: 'Folder', value: item?.folder_name || 'Root' },
      { label: 'Uploaded', value: item?.created_at ? new Date(item.created_at).toLocaleString() : '-' },
      { label: 'Tags', value: item?.tags?.join(', ') || 'None' },
    ],
    [item]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full bg-slate-950 text-slate-100">
        <DialogHeader>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle>{item?.name || 'Preview'}</DialogTitle>
              <DialogDescription>Full-screen preview with metadata and navigation.</DialogDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onPrevious}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={onNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.2))}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-black">
            {item?.media_type === 'video' ? (
              <video
                controls
                src={item?.url}
                className={cn('max-h-[82vh] max-w-full transition-transform duration-300', zoom > 1 ? 'cursor-zoom-out' : 'cursor-default')}
                style={{ transform: `scale(${zoom})` }}
              />
            ) : (
              <img
                src={previewSource}
                alt={item?.name || 'Preview'}
                className={cn('max-h-[82vh] max-w-full object-contain transition-transform duration-300', zoom > 1 ? 'cursor-zoom-out' : 'cursor-default')}
                style={{ transform: `scale(${zoom})` }}
              />
            )}
          </div>

          <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
            <div className="space-y-3">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Asset metadata</div>
              <Separator className="border-slate-800" />
            </div>
            <div className="space-y-3">
              {metadata.map(item => (
                <div key={item.label} className="grid grid-cols-[110px_1fr] gap-3 text-sm text-slate-300">
                  <span className="font-semibold text-slate-400">{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
              <div className="mb-3 font-semibold text-slate-200">Preview controls</div>
              <div className="space-y-2 text-xs leading-5">
                <p>Use zoom buttons to inspect images or videos.</p>
                <p>Use previous / next to move through the current selection.</p>
                <p>Press ESC to close the preview.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
