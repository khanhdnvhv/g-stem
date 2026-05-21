import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  nccName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function NccSuspendModal({ nccName, onConfirm, onClose }: Props) {
  const [reason, setReason]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmed  = reason.trim();
  const isValid  = trimmed.length >= 20;
  const remaining = Math.max(0, 20 - trimmed.length);

  const handleConfirm = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setTimeout(() => onConfirm(trimmed), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[440px]"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px]">Đình chỉ hoạt động NCC</p>
            <p className="text-[12.5px] text-muted-foreground mt-0.5 truncate">{nccName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* BR-05 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 space-y-1">
            <p className="text-[12px] font-semibold text-amber-900">Lưu ý hiệu lực đình chỉ — BR-05</p>
            <p className="text-[12px] text-amber-800 leading-relaxed">
              Toàn bộ nội dung của NCC này sẽ bị ẩn khỏi danh mục đối với trường chưa mua.
              Trường đã mua nội dung vẫn tiếp tục truy cập bình thường.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Lý do đình chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả lý do đình chỉ (tối thiểu 20 ký tự)…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-between text-[11px]">
              {!isValid && trimmed.length > 0
                ? <span className="text-red-500">Cần thêm {remaining} ký tự nữa</span>
                : <span />}
              <span className="text-muted-foreground ml-auto">{trimmed.length} / 20+</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-[13px] font-medium hover:bg-secondary transition-colors">
            Huỷ
          </button>
          <button onClick={handleConfirm} disabled={!isValid || submitting}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#dc2626" }}>
            {submitting ? "Đang xử lý…" : "Xác nhận đình chỉ"}
          </button>
        </div>
      </div>
    </div>
  );
}
