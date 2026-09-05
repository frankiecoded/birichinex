import { useCallback, useEffect, useRef, useState } from "react";

interface Pos {
  left: number;
  top: number;
}

interface DragState {
  startX: number;
  startY: number;
  left: number;
  top: number;
  moved: boolean;
}

const DRAG_THRESHOLD = 4;

export function useDraggableFloat() {
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      left: rect.left,
      top: rect.top,
      moved: false,
    };
    setDragging(true);

    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (!d.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) d.moved = true;
      const w = rect.width || 56;
      const h = rect.height || 56;
      const left = Math.min(Math.max(0, d.left + dx), Math.max(0, window.innerWidth - w));
      const top = Math.min(Math.max(0, d.top + dy), Math.max(0, window.innerHeight - h));
      setPos({ left, top });
    };

    const onUp = () => {
      if (dragRef.current?.moved) suppressClickRef.current = true;
      dragRef.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }, []);

  const onClick = useCallback((handler: () => void) => {
    return () => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      handler();
    };
  }, []);

  return { pos, dragging, onPointerDown, onClick };
}

export function useViewport() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 0,
    h: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return size;
}