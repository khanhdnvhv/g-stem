/* ================================================================ */
/*  AUTO-SAVE INDICATOR — Hiển thị status auto-save                  */
/* ================================================================ */

import { useState, useEffect } from "react";
import { Loader2, Check, AlertCircle, Cloud } from "lucide-react";
import type { AutoSaveStatus } from "../../../lib/useAutoSave";
import { formatLastSaved } from "../../../lib/useAutoSave";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: number | null;
}

export function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  /* Force re-render mỗi 15s để update "X phút trước" */
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!lastSavedAt) return;
    const t = setInterval(() => setTick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, [lastSavedAt]);

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-[#0891b2]" style={{ fontSize: "10.5px", fontWeight: 500 }}>
        <Loader2 className="w-3 h-3 animate-spin" />
        Đang lưu...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-1 text-[#dc2626]" style={{ fontSize: "10.5px", fontWeight: 500 }}>
        <AlertCircle className="w-3 h-3" />
        Lỗi auto-save
      </span>
    );
  }

  if (status === "idle" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
        <Cloud className="w-3 h-3" />
        Có thay đổi · {formatLastSaved(lastSavedAt)}
      </span>
    );
  }

  if (status === "saved" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "10.5px", fontWeight: 500 }}>
        <Check className="w-3 h-3" />
        {formatLastSaved(lastSavedAt)}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
      <Cloud className="w-3 h-3" />
      Chưa lưu
    </span>
  );
}

export default AutoSaveIndicator;
