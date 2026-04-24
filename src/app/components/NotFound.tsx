import { Link } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-[#990803]/10 flex items-center justify-center mb-6">
        <span style={{ fontSize: "48px", fontWeight: 700 }} className="text-[#990803]">404</span>
      </div>
      <h1 className="text-foreground" style={{ fontSize: "24px" }}>Trang không tồn tại</h1>
      <p className="text-muted-foreground mt-2 max-w-md" style={{ fontSize: "14px" }}>
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Vui lòng kiểm tra lại đường dẫn.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
          style={{ fontSize: "14px" }}
        >
          <Home className="w-4 h-4" /> Về Tổng quan
        </Link>
        <Link
          to="/courses"
          className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          style={{ fontSize: "14px" }}
        >
          <Search className="w-4 h-4" /> Tìm khóa học
        </Link>
      </div>
    </div>
  );
}
