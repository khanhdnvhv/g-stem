import { Search, FileX, Inbox, Filter, FolderOpen, AlertCircle } from "lucide-react";

type EmptyVariant = "search" | "empty" | "filter" | "folder" | "error";

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  compact?: boolean;
}

const VARIANT_CFG: Record<EmptyVariant, { icon: typeof Search; color: string; bg: string; defaultTitle: string; defaultMessage: string }> = {
  search: { icon: Search, color: "#6b7280", bg: "#f9fafb", defaultTitle: "Không tìm thấy kết quả", defaultMessage: "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc" },
  empty: { icon: Inbox, color: "#9ca3af", bg: "#f9fafb", defaultTitle: "Chưa có dữ liệu", defaultMessage: "Dữ liệu sẽ hiển thị khi có nội dung mới" },
  filter: { icon: Filter, color: "#6b7280", bg: "#f9fafb", defaultTitle: "Không có kết quả phù hợp", defaultMessage: "Thử điều chỉnh bộ lọc để xem thêm kết quả" },
  folder: { icon: FolderOpen, color: "#c8a84e", bg: "#fffbeb", defaultTitle: "Thư mục trống", defaultMessage: "Chưa có tệp nào trong thư mục này" },
  error: { icon: AlertCircle, color: "#dc2626", bg: "#fef2f2", defaultTitle: "Đã xảy ra lỗi", defaultMessage: "Vui lòng thử lại sau" },
};

export function EmptyState({ variant = "empty", title, message, action, compact }: EmptyStateProps) {
  const cfg = VARIANT_CFG[variant];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-6 px-4 rounded-xl" style={{ backgroundColor: cfg.bg }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.color + "10" }}>
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div>
          <p className="text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>{title || cfg.defaultTitle}</p>
          <p className="text-gray-400" style={{ fontSize: "11px" }}>{message || cfg.defaultMessage}</p>
        </div>
        {action && (
          <button onClick={action.onClick} className="ml-auto px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>
            {action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl" style={{ backgroundColor: cfg.bg }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: cfg.color + "12" }}>
        <Icon className="w-7 h-7" style={{ color: cfg.color }} />
      </div>
      <p className="text-gray-600 mb-1" style={{ fontSize: "15px", fontWeight: 600 }}>{title || cfg.defaultTitle}</p>
      <p className="text-gray-400 text-center max-w-sm" style={{ fontSize: "12px", lineHeight: "1.5" }}>{message || cfg.defaultMessage}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer shadow-sm" style={{ fontSize: "12px", fontWeight: 500 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
