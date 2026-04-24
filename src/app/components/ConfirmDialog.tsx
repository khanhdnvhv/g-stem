import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { AlertTriangle, Trash2, X, Info, ShieldAlert } from "lucide-react";

// ─── Types ───
type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  requireTyping?: string; // User must type this to confirm
}

interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

// ─── Variant configs ───
const VARIANT_CFG: Record<ConfirmVariant, { icon: typeof Trash2; iconColor: string; iconBg: string; btnColor: string; btnHover: string }> = {
  danger: { icon: Trash2, iconColor: "#dc2626", iconBg: "#fef2f2", btnColor: "#dc2626", btnHover: "#b91c1c" },
  warning: { icon: AlertTriangle, iconColor: "#d97706", iconBg: "#fffbeb", btnColor: "#d97706", btnHover: "#b45309" },
  info: { icon: Info, iconColor: "#2563eb", iconBg: "#eff6ff", btnColor: "#2563eb", btnHover: "#1d4ed8" },
};

// ─── Provider ───
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [typingValue, setTypingValue] = useState("");

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
      setTypingValue("");
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    state?.resolve(confirmed);
    setState(null);
    setTypingValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose(false);
    if (e.key === "Enter" && !state?.requireTyping) handleClose(true);
    if (e.key === "Enter" && state?.requireTyping && typingValue === state.requireTyping) handleClose(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => handleClose(false)} />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button onClick={() => handleClose(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              {(() => {
                const v = VARIANT_CFG[state.variant || "danger"];
                const VIcon = v.icon;
                return (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: v.iconBg }}>
                    <VIcon className="w-6 h-6" style={{ color: v.iconColor }} />
                  </div>
                );
              })()}

              {/* Title */}
              <h3 className="text-center text-gray-900 mb-2" style={{ fontSize: "16px", fontWeight: 700 }}>{state.title}</h3>

              {/* Message */}
              <p className="text-center text-gray-500 mb-4" style={{ fontSize: "13px", lineHeight: "1.6" }}>{state.message}</p>

              {/* Typing confirmation */}
              {state.requireTyping && (
                <div className="mb-4">
                  <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px" }}>
                    Nhập <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600" style={{ fontWeight: 600 }}>{state.requireTyping}</span> để xác nhận:
                  </p>
                  <input
                    autoFocus
                    value={typingValue}
                    onChange={e => setTypingValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    style={{ fontSize: "13px" }}
                    placeholder={state.requireTyping}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {state.cancelLabel || "Hủy"}
                </button>
                <button
                  autoFocus={!state.requireTyping}
                  onClick={() => handleClose(true)}
                  disabled={!!state.requireTyping && typingValue !== state.requireTyping}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: VARIANT_CFG[state.variant || "danger"].btnColor,
                  }}
                  onMouseEnter={e => {
                    if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = VARIANT_CFG[state.variant || "danger"].btnHover;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = VARIANT_CFG[state.variant || "danger"].btnColor;
                  }}
                >
                  {state.confirmLabel || "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
