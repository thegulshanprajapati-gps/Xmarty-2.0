'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCMS } from '@/components/cms-provider';
import { useUser } from '@/hooks/use-user';

export type ContentBlockValue = string | Record<string, any> | any[];

export function useContentBlock(
  pageSlug: string,
  sectionKey: string,
  contentKey: string,
  defaultValue: ContentBlockValue,
  type: 'text' | 'json' | 'list' = 'text'
) {
  const { contentBlocks, refreshContentBlocks } = useCMS();
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const block = useMemo(() => {
    return contentBlocks.find(
      (block) =>
        block.page_slug === pageSlug &&
        block.section_key === sectionKey &&
        block.content_key === contentKey
    );
  }, [contentBlocks, pageSlug, sectionKey, contentKey]);

  const currentValue = useMemo(() => {
    if (block) {
      return (type === 'json' || type === 'list') ? block.json_value ?? defaultValue : block.value ?? defaultValue;
    }
    return defaultValue;
  }, [block, defaultValue, type]);

  const canEdit = !!user?.id && user?.role === 'admin';

  const save = useCallback(
    async (value: ContentBlockValue) => {
      setSaving(true);
      setError(null);

      async function attemptSave() {
        const payload: any = {
          page_slug: pageSlug,
          section_key: sectionKey,
          content_key: contentKey,
          type,
        };

        if (type === 'json' || type === 'list') {
          payload.json_value = value;
          payload.value = null;
        } else {
          payload.value = String(value ?? '');
          payload.json_value = null;
        }

        const csrfCookie = typeof document !== 'undefined'
          ? document.cookie.split('; ').find(row => row.trim().startsWith('csrf_token='))?.split('=')[1]
          : '';

        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': csrfCookie || ''
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save');
        }

        await refreshContentBlocks();
      }

      try {
        await attemptSave();
      } catch (err: any) {
        setError(err?.message || String(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [pageSlug, sectionKey, contentKey, refreshContentBlocks, type]
  );

  return {
    value: currentValue,
    block,
    canEdit,
    saving,
    error,
    save,
  };
}
