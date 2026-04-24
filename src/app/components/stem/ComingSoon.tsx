import { Construction, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router";

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  phase?: string;
}

/**
 * Placeholder cho các route đã đăng ký nhưng component thực chưa build
 * (dùng trong giai đoạn transform để sidebar có thể click mọi menu).
 */
export function ComingSoon({ title, subtitle, phase }: ComingSoonProps) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm"
        style={{ background: "linear-gradient(145deg, #f59e0b20, #f59e0b08)" }}
      >
        <Construction className="w-10 h-10 text-[#f59e0b]" />
      </div>

      <h1 className="text-foreground text-center" style={{ fontSize: "22px", fontWeight: 600 }}>
        {title || "Tính năng đang được phát triển"}
      </h1>
      <p className="text-muted-foreground mt-2 text-center max-w-md" style={{ fontSize: "14px" }}>
        {subtitle ||
          "Trang này được dành sẵn trong lộ trình chuyển đổi STEM Platform. Tính năng sẽ được hoàn thiện trong các Phase triển khai tiếp theo."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 justify-center">
        <span
          className="px-2.5 py-1 rounded-md font-mono"
          style={{
            fontSize: "11px",
            backgroundColor: "var(--secondary)",
            color: "var(--muted-foreground)",
          }}
        >
          {path}
        </span>
        {phase && (
          <span
            className="px-2.5 py-1 rounded-md"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: "#99080310",
              color: "#990803",
            }}
          >
            {phase}
          </span>
        )}
      </div>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Về Dashboard
      </Link>
    </div>
  );
}

export default ComingSoon;
