import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertTriangle, Loader2, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning" | "loading" | "default";

interface Props {
  id: string | number;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

const variants: Record<ToastType, {
  card: string;
  iconBg: string;
  icon: React.ElementType;
  bar: string;
  title: string;
  desc: string;
}> = {
  success: {
    card: "bg-green-50 border-green-200",
    iconBg: "bg-green-500",
    icon: CheckCircle2,
    bar: "bg-green-500",
    title: "text-green-900",
    desc: "text-green-700",
  },
  error: {
    card: "bg-white border-red-200",
    iconBg: "bg-red-500",
    icon: XCircle,
    bar: "bg-red-500",
    title: "text-gray-900",
    desc: "text-gray-500",
  },
  info: {
    card: "bg-white border-blue-200",
    iconBg: "bg-blue-500",
    icon: Info,
    bar: "bg-blue-500",
    title: "text-gray-900",
    desc: "text-gray-500",
  },
  warning: {
    card: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-500",
    icon: AlertTriangle,
    bar: "bg-amber-500",
    title: "text-amber-900",
    desc: "text-amber-700",
  },
  loading: {
    card: "bg-white border-blue-200",
    iconBg: "bg-blue-500",
    icon: Loader2,
    bar: "bg-blue-400",
    title: "text-gray-900",
    desc: "text-gray-500",
  },
  default: {
    card: "bg-white border-gray-200",
    iconBg: "bg-gray-600",
    icon: Info,
    bar: "bg-gray-500",
    title: "text-gray-900",
    desc: "text-gray-500",
  },
};

export function CustomToastItem({ id, type, title, description, duration = 4000 }: Props) {
  const v = variants[type] ?? variants.default;
  const Icon = v.icon;
  const isLoading = type === "loading";

  return (
    <div
      className={`relative w-[360px] overflow-hidden rounded-2xl border shadow-xl ${v.card}`}
      style={{ fontSize: "13px" }}
    >
      {/* Content row */}
      <div className="flex items-start gap-3 p-3.5 pr-3">
        {/* Icon badge */}
        <div className={`shrink-0 w-8 h-8 rounded-full ${v.iconBg} flex items-center justify-center shadow-sm mt-0.5`}>
          <Icon className={`w-4 h-4 text-white ${isLoading ? "animate-spin" : ""}`} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold leading-snug ${v.title}`}>{title}</p>
          {description && (
            <p className={`mt-0.5 leading-snug ${v.desc}`} style={{ fontSize: "12px" }}>
              {description}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => sonnerToast.dismiss(id)}
          className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-black/5">
        {isLoading ? (
          /* Indeterminate shimmer */
          <div className="relative h-full overflow-hidden">
            <div
              className={`absolute h-full w-1/3 ${v.bar} rounded-full`}
              style={{ animation: "toast-shimmer 1.6s ease-in-out infinite" }}
            />
          </div>
        ) : (
          /* Determinate progress bar — auto-dismiss handled by useEffect */
          <div
            className={`h-full ${v.bar} origin-left rounded-full`}
            style={{ animation: `toast-progress ${duration}ms linear forwards` }}
          />
        )}
      </div>
    </div>
  );
}
