import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search, X, BookOpen, Users, Route, Award, FileText,
  Settings, BarChart3, MessageCircle, Calendar, Shield,
  Building2, ClipboardCheck, ArrowRight, Command, Hash,
  Megaphone, DollarSign, Target, Gamepad2, Brain,
  Plug, Bot, Workflow, Activity, Grid3x3,
} from "lucide-react";
import { mockCourses, mockEmployees } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Searchable Pages (navigation shortcuts)                            */
/* ------------------------------------------------------------------ */
interface SearchPage {
  title: string;
  path: string;
  icon: React.ElementType;
  keywords: string[];
  category: "nav";
}

const searchPages: SearchPage[] = [
  { title: "Tổng quan", path: "/", icon: BarChart3, keywords: ["dashboard", "tong quan", "home"], category: "nav" },
  { title: "Quản lý Khóa học", path: "/courses", icon: BookOpen, keywords: ["course", "khoa hoc", "hoc"], category: "nav" },
  { title: "Học tập của tôi", path: "/my-learning", icon: BookOpen, keywords: ["learning", "hoc tap"], category: "nav" },
  { title: "Lộ trình Đào tạo", path: "/learning-paths", icon: Route, keywords: ["path", "lo trinh", "dao tao"], category: "nav" },
  { title: "Kiểm tra & Đánh giá", path: "/quizzes", icon: ClipboardCheck, keywords: ["quiz", "kiem tra", "danh gia", "thi"], category: "nav" },
  { title: "Chấm điểm & Sổ điểm", path: "/grading", icon: FileText, keywords: ["grading", "cham diem", "diem"], category: "nav" },
  { title: "Chứng chỉ", path: "/certificates", icon: Award, keywords: ["certificate", "chung chi"], category: "nav" },
  { title: "Đồng bộ Nhân sự", path: "/employees", icon: Users, keywords: ["employee", "nhan su", "nhan vien"], category: "nav" },
  { title: "Đơn vị thành viên", path: "/subsidiaries", icon: Building2, keywords: ["subsidiary", "don vi", "cong ty"], category: "nav" },
  { title: "Phân quyền", path: "/permissions", icon: Shield, keywords: ["permission", "phan quyen", "role"], category: "nav" },
  { title: "Báo cáo & Thống kê", path: "/reports", icon: BarChart3, keywords: ["report", "bao cao", "thong ke"], category: "nav" },
  { title: "Diễn đàn", path: "/forum", icon: MessageCircle, keywords: ["forum", "dien dan"], category: "nav" },
  { title: "Lịch Đào tạo", path: "/calendar", icon: Calendar, keywords: ["calendar", "lich"], category: "nav" },
  { title: "Thông báo", path: "/announcements", icon: Megaphone, keywords: ["announcement", "thong bao"], category: "nav" },
  { title: "Cài đặt", path: "/settings", icon: Settings, keywords: ["settings", "cai dat"], category: "nav" },
  { title: "Ngân sách Đào tạo", path: "/budget", icon: DollarSign, keywords: ["budget", "ngan sach"], category: "nav" },
  { title: "Kế hoạch Phát triển (IDP)", path: "/idp", icon: Target, keywords: ["idp", "ke hoach", "phat trien"], category: "nav" },
  { title: "Gamification", path: "/gamification", icon: Gamepad2, keywords: ["gamification", "game", "diem thuong"], category: "nav" },
  { title: "Gợi ý từ AI", path: "/ai-recommendations", icon: Brain, keywords: ["ai", "goi y", "recommend"], category: "nav" },
  { title: "Tích hợp", path: "/integrations", icon: Plug, keywords: ["integration", "tich hop"], category: "nav" },
  { title: "Quản trị GelBot", path: "/chatbot-admin", icon: Bot, keywords: ["chatbot", "gelbot", "bot"], category: "nav" },
  { title: "Workflow Designer", path: "/workflow-designer", icon: Workflow, keywords: ["workflow", "quy trinh"], category: "nav" },
  { title: "System Health", path: "/system-health", icon: Activity, keywords: ["health", "system", "monitor"], category: "nav" },
  { title: "Skill Matrix", path: "/skill-matrix", icon: Grid3x3, keywords: ["skill", "ky nang", "matrix"], category: "nav" },
];

/* ------------------------------------------------------------------ */
/*  Search result types                                                */
/* ------------------------------------------------------------------ */
interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  path: string;
  category: "course" | "employee" | "nav";
}

function normalizeVN(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search
  const results: SearchResult[] = useCallback(() => {
    if (!query.trim()) {
      // Show recent / popular pages
      return searchPages.slice(0, 8).map((p) => ({
        id: `nav-${p.path}`,
        title: p.title,
        subtitle: "Chuyển đến trang",
        icon: p.icon,
        path: p.path,
        category: "nav" as const,
      }));
    }

    const q = normalizeVN(query);
    const items: SearchResult[] = [];

    // Search courses
    mockCourses
      .filter(
        (c) =>
          normalizeVN(c.title).includes(q) ||
          normalizeVN(c.category).includes(q) ||
          normalizeVN(c.instructor).includes(q) ||
          c.tags.some((t) => normalizeVN(t).includes(q))
      )
      .slice(0, 5)
      .forEach((c) => {
        items.push({
          id: `course-${c.id}`,
          title: c.title,
          subtitle: `${c.category} • ${c.instructor}`,
          icon: BookOpen,
          path: `/courses/${c.id}`,
          category: "course",
        });
      });

    // Search employees
    mockEmployees
      .filter(
        (e) =>
          normalizeVN(e.name).includes(q) ||
          normalizeVN(e.department).includes(q) ||
          normalizeVN(e.subsidiary).includes(q) ||
          normalizeVN(e.position).includes(q)
      )
      .slice(0, 5)
      .forEach((e) => {
        items.push({
          id: `emp-${e.id}`,
          title: e.name,
          subtitle: `${e.position} • ${e.department}`,
          icon: Users,
          path: "/employees",
          category: "employee",
        });
      });

    // Search pages
    searchPages
      .filter(
        (p) =>
          normalizeVN(p.title).includes(q) ||
          p.keywords.some((k) => k.includes(q))
      )
      .slice(0, 5)
      .forEach((p) => {
        items.push({
          id: `nav-${p.path}`,
          title: p.title,
          subtitle: "Chuyển đến trang",
          icon: p.icon,
          path: p.path,
          category: "nav",
        });
      });

    return items;
  }, [query])();

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIdx]) {
        e.preventDefault();
        navigate(results[selectedIdx].path);
        onClose();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selectedIdx, navigate, onClose]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    course: "Khóa học",
    employee: "Nhân sự",
    nav: "Trang",
  };

  // Group results by category
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  let globalIdx = -1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-xl bg-card rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khóa học, nhân viên, trang..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              style={{ fontSize: "15px" }}
            />
            <kbd
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-muted-foreground"
              style={{ fontSize: "11px" }}
            >
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
                  Không tìm thấy kết quả cho "{query}"
                </p>
                <p className="text-muted-foreground/60 mt-1" style={{ fontSize: "12px" }}>
                  Thử tìm kiếm với từ khóa khác
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="px-4 py-1.5">
                    <span
                      className="text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1.5"
                      style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}
                    >
                      <Hash className="w-3 h-3" />
                      {categoryLabels[cat] || cat}
                    </span>
                  </div>
                  {items.map((item) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const isSelected = idx === selectedIdx;
                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#990803]/10 text-[#990803]"
                            : "text-foreground hover:bg-secondary"
                        }`}
                        onClick={() => {
                          navigate(item.path);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIdx(idx)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#990803] text-white"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate ${isSelected ? "text-[#990803]" : ""}`}
                            style={{ fontSize: "14px", fontWeight: 500 }}
                          >
                            {item.title}
                          </p>
                          <p
                            className="text-muted-foreground truncate"
                            style={{ fontSize: "12px" }}
                          >
                            {item.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 text-[#990803] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-muted-foreground" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-secondary rounded" style={{ fontSize: "10px" }}>↑↓</kbd> Di chuyển
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-secondary rounded" style={{ fontSize: "10px" }}>Enter</kbd> Chọn
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-secondary rounded" style={{ fontSize: "10px" }}>Esc</kbd> Đóng
              </span>
            </div>
            <span className="text-muted-foreground/50 flex items-center gap-1" style={{ fontSize: "11px" }}>
              <Command className="w-3 h-3" /> Geleximco LMS
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
