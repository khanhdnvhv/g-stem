/* ================================================================ */
/*  useAutoSave — Hook auto-save với debounce + indicator state      */
/*  Dùng trong LessonEditor / ResearchProjectEditor                  */
/* ================================================================ */

import { useState, useEffect, useRef } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  /** Data cần watch — khi đổi → debounce save */
  data: unknown;
  /** Delay debounce (ms) — default 30000 (30s) */
  debounceMs?: number;
  /** Callback save — return Promise để biết success/fail */
  onSave: () => Promise<void> | void;
  /** Disabled (VD khi load lần đầu) */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSavedAt: number | null;
  saveNow: () => Promise<void>;
}

export function useAutoSave({
  data, debounceMs = 30000, onSave, enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);

  const performSave = async () => {
    setStatus("saving");
    try {
      await onSave();
      setStatus("saved");
      setLastSavedAt(Date.now());
    } catch {
      setStatus("error");
    }
  };

  /* Watch data → debounce save */
  useEffect(() => {
    if (!enabled) return;
    /* Skip first run — đừng auto-save khi load lần đầu */
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("idle"); // pending change
    timerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, debounceMs]);

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const saveNow = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await performSave();
  };

  return { status, lastSavedAt, saveNow };
}

/* ── Helper: format "Đã lưu cách đây X" ── */
export function formatLastSaved(at: number | null): string {
  if (!at) return "Chưa lưu";
  const diff = Date.now() - at;
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "Vừa lưu";
  if (sec < 60) return `Lưu ${sec}s trước`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Lưu ${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Lưu ${hr} giờ trước`;
  return new Date(at).toLocaleString("vi-VN");
}
