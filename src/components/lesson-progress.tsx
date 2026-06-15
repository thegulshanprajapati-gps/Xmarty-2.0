'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LessonProgressProps {
  courseId: string;
  folderId: string;
  isCompleted: boolean;
  completedCount: number;
  totalCount: number;
}

export function LessonProgress({
  courseId,
  folderId,
  isCompleted: initialCompleted,
  completedCount,
  totalCount,
}: LessonProgressProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleCompletion = async () => {
    try {
      setLoading(true);
      const newStatus = !completed;
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          folderId,
          completed: newStatus,
        }),
      });

      if (res.ok) {
        setCompleted(newStatus);
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to update progress', err);
    } finally {
      setLoading(false);
    }
  };

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Progress</h4>
          <p className="text-xl font-headline font-black text-white">
            {percentage}% <span className="text-xs font-normal text-slate-400">({completedCount}/{totalCount} Completed)</span>
          </p>
        </div>
        <Button
          onClick={toggleCompletion}
          disabled={loading}
          variant="outline"
          className={`h-11 rounded-xl px-5 font-bold transition-all text-xs flex items-center gap-2 border border-white/10 ${
            completed
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          {completed ? (
            <>
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              Completed
            </>
          ) : (
            <>
              <Circle className="h-4.5 w-4.5 text-slate-400" />
              Mark as Complete
            </>
          )}
        </Button>
      </div>

      {/* Modern gradient progress bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
        <div
          className="bg-gradient-to-r from-violet-600 via-primary to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
