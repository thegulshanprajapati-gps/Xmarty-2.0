import { useCallback, useEffect, useRef, useState } from 'react';

export type DragSelectionState = {
  active: boolean;
  rect: { x: number; y: number; width: number; height: number };
};

export function useDragSelection(onChange: (selectedIds: string[]) => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const selectionFrame = useRef<number | null>(null);
  const [selectionState, setSelectionState] = useState<DragSelectionState>({
    active: false,
    rect: { x: 0, y: 0, width: 0, height: 0 },
  });

  const clearSelection = useCallback(() => {
    pointerStartRef.current = null;
    setSelectionState({ active: false, rect: { x: 0, y: 0, width: 0, height: 0 } });
    if (selectionFrame.current) {
      cancelAnimationFrame(selectionFrame.current);
      selectionFrame.current = null;
    }
    if (scrollFrame.current) {
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
    }
  }, []);

  const getCardElements = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [] as HTMLElement[];
    return Array.from(container.querySelectorAll<HTMLElement>('[data-media-card]'));
  }, []);

  const getSelectionRect = useCallback((x: number, y: number) => {
    const start = pointerStartRef.current;
    if (!start) return { x, y, width: 0, height: 0 };
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    return {
      x: left,
      y: top,
      width: Math.abs(x - start.x),
      height: Math.abs(y - start.y),
    };
  }, []);

  const getIntersectedIds = useCallback((rect: DragSelectionState['rect']) => {
    const cards = getCardElements();
    return cards.filter(card => {
      const bounds = card.getBoundingClientRect();
      const selectionBounds = {
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height,
      };
      const intersects =
        bounds.left < selectionBounds.right &&
        bounds.right > selectionBounds.left &&
        bounds.top < selectionBounds.bottom &&
        bounds.bottom > selectionBounds.top;
      return intersects;
    }).map(card => card.dataset.mediaCard || '');
  }, [getCardElements]);

  const updateScroll = useCallback((clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const threshold = 80;
    let speed = 0;
    if (clientY - rect.top < threshold) {
      speed = -8;
    } else if (rect.bottom - clientY < threshold) {
      speed = 8;
    }

    if (selectionFrame.current) {
      cancelAnimationFrame(selectionFrame.current);
      selectionFrame.current = null;
    }

    if (speed !== 0) {
      const animate = () => {
        container.scrollBy({ top: speed, left: 0, behavior: 'auto' });
        scrollFrame.current = requestAnimationFrame(animate);
      };
      scrollFrame.current = requestAnimationFrame(animate);
    } else if (scrollFrame.current) {
      cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
    }
  }, []);

  const updateSelection = useCallback(
    (clientX: number, clientY: number) => {
      const rect = getSelectionRect(clientX, clientY);
      setSelectionState({ active: true, rect });
      const ids = getIntersectedIds(rect).filter(Boolean);
      onChange(ids);
      updateScroll(clientY);
    },
    [getIntersectedIds, getSelectionRect, onChange, updateScroll]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!pointerStartRef.current) return;
      event.preventDefault();
      updateSelection(event.clientX, event.clientY);
    },
    [updateSelection]
  );

  const handlePointerUp = useCallback(() => {
    clearSelection();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [clearSelection, handlePointerMove]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-ignore-selection]') || target.closest('button,a,input,textarea')) {
        return;
      }
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      setSelectionState({ active: true, rect: { x: event.clientX, y: event.clientY, width: 0, height: 0 } });
    },
    [handlePointerMove, handlePointerUp]
  );

  useEffect(() => {
    return () => {
      clearSelection();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [clearSelection, handlePointerMove, handlePointerUp]);

  return { containerRef, selectionState, handlePointerDown, clearSelection };
}
