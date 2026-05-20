/* ================================================================ */
/*  useBlockDragDrop — HTML5 native DnD cho block list                */
/*  Reorder trong cùng phase                                          */
/* ================================================================ */

import { useState, type DragEvent } from "react";

export type DropPosition = "before" | "after";

interface UseBlockDragDropOptions<T> {
  /** Items hiện tại (đã filter cho phase) */
  items: T[];
  /** Key extract — VD (item) => item.id */
  getKey: (item: T) => string;
  /** Callback khi reorder xong */
  onReorder: (newOrder: T[]) => void;
}

interface DragState {
  draggingId: string | null;
  hoverTargetId: string | null;
  hoverPosition: DropPosition | null;
}

export function useBlockDragDrop<T>({
  items, getKey, onReorder,
}: UseBlockDragDropOptions<T>) {
  const [state, setState] = useState<DragState>({
    draggingId: null, hoverTargetId: null, hoverPosition: null,
  });

  const handleDragStart = (e: DragEvent<HTMLElement>, item: T) => {
    setState({ draggingId: getKey(item), hoverTargetId: null, hoverPosition: null });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", getKey(item));
    /* Make dragged element semi-transparent */
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "";
    }
    setState({ draggingId: null, hoverTargetId: null, hoverPosition: null });
  };

  const handleDragOver = (e: DragEvent<HTMLElement>, item: T) => {
    e.preventDefault();
    if (!state.draggingId || state.draggingId === getKey(item)) return;
    e.dataTransfer.dropEffect = "move";

    /* Determine hover position based on cursor Y vs element midpoint */
    if (e.currentTarget instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const position: DropPosition = e.clientY < midY ? "before" : "after";
      setState((prev) => ({
        ...prev,
        hoverTargetId: getKey(item),
        hoverPosition: position,
      }));
    }
  };

  const handleDragLeave = () => {
    /* Don't clear immediately — sẽ get set lại nếu drag over item kế */
  };

  const handleDrop = (e: DragEvent<HTMLElement>, target: T) => {
    e.preventDefault();
    const sourceId = state.draggingId;
    const targetId = getKey(target);
    if (!sourceId || sourceId === targetId) {
      setState({ draggingId: null, hoverTargetId: null, hoverPosition: null });
      return;
    }

    const sourceIdx = items.findIndex((x) => getKey(x) === sourceId);
    const targetIdx = items.findIndex((x) => getKey(x) === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const next = [...items];
    const [moved] = next.splice(sourceIdx, 1);
    /* Adjust target index after splice */
    let insertIdx = next.findIndex((x) => getKey(x) === targetId);
    if (state.hoverPosition === "after") insertIdx += 1;
    next.splice(insertIdx, 0, moved);

    onReorder(next);
    setState({ draggingId: null, hoverTargetId: null, hoverPosition: null });
  };

  /** Bind props cho 1 item */
  const getDragProps = (item: T) => {
    const key = getKey(item);
    const isDragging = state.draggingId === key;
    const isHoverTarget = state.hoverTargetId === key;
    return {
      draggable: true,
      onDragStart: (e: DragEvent<HTMLElement>) => handleDragStart(e, item),
      onDragEnd: handleDragEnd,
      onDragOver: (e: DragEvent<HTMLElement>) => handleDragOver(e, item),
      onDragLeave: handleDragLeave,
      onDrop: (e: DragEvent<HTMLElement>) => handleDrop(e, item),
      "data-dragging": isDragging || undefined,
      "data-drop-target": isHoverTarget || undefined,
      "data-drop-position": isHoverTarget ? state.hoverPosition : undefined,
    };
  };

  return {
    getDragProps,
    isDragging: state.draggingId !== null,
    draggingId: state.draggingId,
    hoverTargetId: state.hoverTargetId,
    hoverPosition: state.hoverPosition,
  };
}
