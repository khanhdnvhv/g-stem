/* ================================================================ */
/*  CONFIRM DIALOG — Popup xác nhận dùng chung toàn hệ thống          */
/*  Chuyên nghiệp: backdrop blur, icon cảnh báo, item highlight       */
/*  Dùng cho mọi thao tác Xóa / hành động không thể hoàn tác          */
/* ================================================================ */

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export type ConfirmVariant = "danger" | "warning";

interface ConfirmDialogProps {
  open: boolean;
  /** Tiêu đề — VD "Xóa thiết bị" */
  title: string;
  /** Mô tả ngắn — hậu quả của hành động */
  message: string;
  /** Tên đối tượng bị tác động — hiển thị nổi bật */
  itemName?: string;
  /** Nhãn nút xác nhận — default "Xóa" */
  confirmLabel?: string;
  /** Nhãn nút hủy — default "Hủy" */
  cancelLabel?: string;
  /** danger (đỏ) | warning (cam) — default danger */
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onClose: () => void;
}

const VARIANT_META: Record<ConfirmVariant, {
  ring: string; iconBg: string; iconColor: string; confirmBg: string; confirmHover: string;
}> = {
  danger: {
    ring: "#dc2626", iconBg: "#dc262615", iconColor: "#dc2626",
    confirmBg: "#dc2626", confirmHover: "#b91c1c",
  },
  warning: {
    ring: "#f59e0b", iconBg: "#f59e0b15", iconColor: "#d97706",
    confirmBg: "#d97706", confirmHover: "#b45309",
  },
};

export function ConfirmDialog({
  open, title, message, itemName,
  confirmLabel = "Xóa", cancelLabel = "Hủy",
  variant = "danger",
  onConfirm, onClose,
}: ConfirmDialogProps) {
  /* Đóng bằng phím Esc, xác nhận bằng Enter */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter")  onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  const m = VARIANT_META[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "confirmPop 0.16s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close X */}
        <div className="flex justify-end px-3 pt-3">
          <button onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-2 text-center">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ backgroundColor: m.iconBg }}
          >
            {variant === "danger"
              ? <Trash2 className="w-6 h-6" style={{ color: m.iconColor }} />
              : <AlertTriangle className="w-6 h-6" style={{ color: m.iconColor }} />}
          </div>

          <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{title}</h2>

          <p className="text-muted-foreground mt-1.5" style={{ fontSize: "12.5px", lineHeight: 1.55 }}>
            {message}
          </p>

          {/* Item name highlight */}
          {itemName && (
            <div
              className="mt-3 px-3 py-2 rounded-lg border"
              style={{ backgroundColor: m.iconBg, borderColor: m.ring + "40" }}
            >
              <p className="truncate" style={{ fontSize: "13px", fontWeight: 600, color: m.iconColor }}>
                {itemName}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ fontSize: "13px", fontWeight: 600, backgroundColor: m.confirmBg }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = m.confirmHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = m.confirmBg)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Keyframe — scale-in nhẹ */}
      <style>{`
        @keyframes confirmPop {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ConfirmDialog;
