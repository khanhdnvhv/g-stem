import {
  LayoutDashboard, School, ClipboardCheck, TrendingUp,
  BookOpen, ShieldCheck, ClipboardList, GraduationCap, KeyRound,
  CalendarDays, Newspaper, Network, Layers, FileText, BarChart3,
  Microscope,
  type LucideIcon,
} from "lucide-react";

/* ================================================================ */
/*  AUTHORITY CONFIG — Toàn bộ cấu hình nav + permission cho Sở/Bộ  */
/*  Chỉnh sửa nav hoặc quyền cấp Sở → vào file này, không đâu khác  */
/* ================================================================ */

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  badge?: string;
  indent?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  authority_admin — Quản trị viên Sở/Bộ, toàn quyền                 */
/* ------------------------------------------------------------------ */
export const AUTHORITY_ADMIN_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [
      { to: "/authority/dashboard", icon: LayoutDashboard, label: "Dashboard Toàn ngành" },
      { to: "/authority/schools",   icon: School,          label: "Danh bạ Trường" },
    ],
  },
  {
    title: "Thiết bị & CSVC",
    items: [
      { to: "/authority/equipment-compliance",   icon: ClipboardCheck, label: "Tình trạng & Chuẩn" },
      { to: "/authority/reports/procurement",    icon: TrendingUp,     label: "Chi phí Mua sắm" },
    ],
  },
  {
    title: "Đào tạo & Khảo thí",
    items: [
      { to: "/authority/programs",         icon: BookOpen,      label: "Chương trình CT1–CT5" },
      { to: "/authority/content-review",   icon: ShieldCheck,   label: "Kiểm duyệt Học liệu" },
      { to: "/authority/exam-monitor",     icon: ClipboardList, label: "Giám sát Kỳ thi STEM" },
      { to: "/authority/learning-results", icon: GraduationCap, label: "Kết quả Học tập" },
      { to: "/authority/licenses",         icon: KeyRound,      label: "License & Tài khoản" },
    ],
  },
  {
    title: "Cộng đồng",
    items: [
      { to: "/authority/events", icon: CalendarDays, label: "Sự kiện Giáo dục" },
      { to: "/authority/news",   icon: Newspaper,    label: "Tin tức & Xu hướng" },
    ],
  },
  {
    title: "Dữ liệu & Liên thông",
    items: [
      { to: "/authority/data-sync", icon: Network, label: "CSDL Quốc gia & VNeID" },
      { to: "/authority/catalogs",  icon: Layers,  label: "Danh mục dùng chung" },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { to: "/authority/reports",   icon: FileText,  label: "Báo cáo Bộ GD&ĐT" },
      { to: "/authority/analytics", icon: BarChart3, label: "Analytics Nâng cao" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  authority_viewer — Cán bộ Sở, chủ yếu xem và xuất báo cáo         */
/* ------------------------------------------------------------------ */
export const AUTHORITY_VIEWER_NAV: NavGroup[] = [
  {
    title: "Giám sát & Điều hành",
    items: [
      { to: "/authority/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
      { to: "/authority/schools",   icon: School,          label: "Danh sách Trường học" },
    ],
  },
  {
    title: "Thiết bị & CSVC",
    items: [
      { to: "/authority/equipment-compliance", icon: ClipboardCheck, label: "Tình trạng & Chuẩn" },
      { to: "/authority/reports/procurement",  icon: TrendingUp,     label: "Chi phí Mua sắm" },
    ],
  },
  {
    title: "Dữ liệu & Liên thông",
    items: [
      { to: "/authority/data-sync", icon: Network, label: "CSDL Quốc gia & VNeID" },
      { to: "/authority/catalogs",  icon: Layers,  label: "Danh mục dùng chung" },
    ],
  },
  {
    title: "Báo cáo & Tuân thủ",
    items: [
      { to: "/authority/reports/tt38",     icon: FileText,       label: "Báo cáo TT38" },
      { to: "/authority/reports/cv1014",   icon: ClipboardCheck, label: "Báo cáo CV1014" },
      { to: "/authority/reports/builder",  icon: Microscope,     label: "Báo cáo tùy chỉnh" },
      { to: "/authority/analytics",        icon: BarChart3,      label: "Phân tích Nâng cao" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Permissions — danh sách route prefix được phép truy cập           */
/* ------------------------------------------------------------------ */
export const AUTHORITY_ADMIN_PERMISSIONS: string[] = [
  "/authority",
  "/school",
  "/shared",
];

export const AUTHORITY_VIEWER_PERMISSIONS: string[] = [
  "/authority/dashboard",
  "/authority/schools",
  "/authority/equipment-compliance",
  "/authority/reports",
  "/authority/analytics",
  "/authority/data-sync",
  "/authority/catalogs",
  "/shared",
];
