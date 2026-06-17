'use client';

import { useMemo, useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import { useContentBlock } from '@/hooks/use-content-block';
import { cn } from '@/lib/utils';
import { useCMS } from '@/components/cms-provider';

type EditableTextProps = {
  pageSlug: string;
  sectionKey: string;
  contentKey: string;
  defaultValue: string;
  className?: string;
  placeholder?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export function EditableText({
  pageSlug,
  sectionKey,
  contentKey,
  defaultValue,
  className,
  placeholder,
  as: Component = 'span',
}: EditableTextProps) {
  const { value, canEdit, save, saving } = useContentBlock(
    pageSlug,
    sectionKey,
    contentKey,
    defaultValue,
    'text'
  );
  const { loading: cmsLoading } = useCMS();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const isEmpty = useMemo(() => {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (str === '') return true;
    const clean = str.replace(/<[^>]*>/g, '').trim();
    return clean === '' || clean === '&nbsp;';
  }, [value]);

  const displayValue = useMemo(() => {
    if (isEmpty) return '';
    return String(value ?? defaultValue ?? '');
  }, [value, defaultValue, isEmpty]);

  const handleEdit = async () => {
    const next = window.prompt('Edit content for ' + contentKey, displayValue || defaultValue);
    if (next === null) return;
    if (next === displayValue) return;
    try {
      await save(next);
      setDraft(next);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  // If empty and not admin, hide completely
  if (isEmpty && !canEdit) {
    return null;
  }

  const finalHTML = draft || displayValue || (canEdit ? (placeholder || defaultValue || '[Empty]') : '');

  return (
    <Component className={cn(className, 'inline-flex items-center gap-2 group', isEmpty && canEdit && 'opacity-40')}
      data-editable={canEdit ? 'true' : undefined}
      onDoubleClick={canEdit ? handleEdit : undefined}
    >
      <span 
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: finalHTML }} 
      />
      {canEdit && (
        <button
          type="button"
          onClick={handleEdit}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-primary"
          aria-label={`Edit ${contentKey}`}
        >
          {saving ? <Save className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
        </button>
      )}
    </Component>
  );
}
