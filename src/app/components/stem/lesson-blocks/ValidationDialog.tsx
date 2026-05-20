/* ================================================================ */
/*  VALIDATION DIALOG — Hiển thị errors + warnings trước khi submit  */
/*  Errors → BLOCK submit; Warnings → cho phép submit nhưng cảnh báo */
/* ================================================================ */

import {
  X, AlertTriangle, AlertCircle, CheckCircle2, Send,
} from "lucide-react";
import type { LessonValidationResult } from "../../../lib/ct-utils";

interface ValidationDialogProps {
  open: boolean;
  result: LessonValidationResult | null;
  onClose: () => void;
  onConfirmSubmit: () => void;
  lessonTitle: string;
  /** Verb cho nút confirm: "Gửi duyệt" | "Publish ngay" */
  confirmLabel?: string;
}

export function ValidationDialog({
  open, result, onClose, onConfirmSubmit, lessonTitle,
  confirmLabel = "Gửi duyệt dù còn cảnh báo",
}: ValidationDialogProps) {
  if (!open || !result) return null;

  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;
  const allOk = !hasErrors && !hasWarnings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-border ${
          hasErrors ? "bg-red-50 dark:bg-red-900/20"
          : hasWarnings ? "bg-orange-50 dark:bg-orange-900/20"
          : "bg-green-50 dark:bg-green-900/20"
        }`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
            hasErrors ? "bg-[#dc2626] text-white"
            : hasWarnings ? "bg-[#f59e0b] text-white"
            : "bg-[#16a34a] text-white"
          }`}>
            {hasErrors ? <AlertCircle className="w-5 h-5" />
              : hasWarnings ? <AlertTriangle className="w-5 h-5" />
              : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>
              {hasErrors ? "Không thể gửi duyệt"
                : hasWarnings ? "Cảnh báo trước khi gửi"
                : "Sẵn sàng gửi duyệt"}
            </h2>
            <p className="text-muted-foreground truncate" style={{ fontSize: "11.5px" }}>
              "{lessonTitle}"
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {allOk && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-center">
              <CheckCircle2 className="w-10 h-10 text-[#16a34a] mx-auto mb-2" />
              <p className="text-[#16a34a]" style={{ fontSize: "13px", fontWeight: 600 }}>
                Mọi check đều đạt!
              </p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px" }}>
                Bài giảng đầy đủ thông tin bắt buộc, sẵn sàng gửi duyệt publish.
              </p>
            </div>
          )}

          {/* Errors (block submit) */}
          {hasErrors && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-[#dc2626]" />
                <p className="text-[#dc2626]" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}>
                  LỖI BẮT BUỘC SỬA ({result.errors.length})
                </p>
              </div>
              <ul className="space-y-1.5">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 border-l-4 border-[#dc2626] rounded">
                    <span className="text-[#dc2626] shrink-0" style={{ fontSize: "13px", lineHeight: 1, marginTop: 1 }}>×</span>
                    <span style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings (cho phép submit) */}
          {hasWarnings && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                <p className="text-[#f59e0b]" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em" }}>
                  CẢNH BÁO KHUYẾN NGHỊ ({result.warnings.length})
                </p>
              </div>
              <ul className="space-y-1.5">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-[#f59e0b] rounded">
                    <span className="text-[#f59e0b] shrink-0" style={{ fontSize: "12px", marginTop: 1 }}>⚠</span>
                    <span style={{ fontSize: "11.5px", lineHeight: 1.45 }}>{w}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground mt-2 italic" style={{ fontSize: "11px", lineHeight: 1.45 }}>
                Bạn vẫn có thể gửi duyệt, nhưng reviewer có thể yêu cầu bổ sung sau.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            {hasErrors ? "Quay lại sửa" : "Hủy"}
          </button>
          {!hasErrors && (
            <button onClick={() => { onConfirmSubmit(); onClose(); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-white rounded-md hover:opacity-90 ${
                allOk ? "bg-[#16a34a]" : "bg-[#f59e0b]"
              }`}
              style={{ fontSize: "12px", fontWeight: 600 }}>
              <Send className="w-3.5 h-3.5" />
              {allOk ? "Gửi duyệt ngay" : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValidationDialog;
