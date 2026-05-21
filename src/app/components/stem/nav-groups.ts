import {
  LayoutDashboard, BookOpen, Award, Bell, GraduationCap, BarChart3,
  Calendar, User, Settings, MessageCircle, Megaphone,
  Package, Boxes, Puzzle, Edit, FolderOpen, ClipboardCheck,
  UserCheck, Warehouse, Receipt, Wrench, KeyRound, FileBadge,
  School, Handshake, TrendingUp, UsersRound, ShoppingBag,
  Target, Users, Landmark, Database, Network, IdCard,
  Layers, FileText, Microscope, Bot, PenTool, Activity,
  ScrollText, Shield, Server, Plug, Cpu, Lightbulb,
  FlaskConical, Video, Factory, ClipboardList, Atom,
  Building2, BookMarked, DoorOpen, PieChart, HardDrive,
  MessagesSquare, Trophy,
  ShieldCheck, CalendarDays, Newspaper, Microscope,
  type LucideIcon,
} from "lucide-react";
import type { StemRole } from "../AuthContext";

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

/* ================================================================ */
/*  NAV GROUPS — 7 Phân hệ Geleximco STEM                            */
/*  Ref: docs/IA-7-modules.md                                        */
/* ================================================================ */

const SHARED_PERSONAL: NavGroup = {
  title: "Cá nhân",
  items: [
    { to: "/shared/profile", icon: User, label: "Hồ sơ Cá nhân" },
    { to: "/shared/notifications", icon: Bell, label: "Thông báo" },
    { to: "/shared/settings", icon: Settings, label: "Cài đặt" },
  ],
};

const SUPPLIER_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard NCC" }],
  },
  {
    title: "Sản phẩm & Giải pháp",
    items: [
      { to: "/supplier/packages",  icon: Boxes,      label: "Danh mục gói STEM" },
      { to: "/supplier/devices",   icon: HardDrive,   label: "Danh mục Thiết bị" },
      { to: "/supplier/programs",  icon: Puzzle,      label: "Chương trình STEM" },
      { to: "/supplier/media",     icon: Video,       label: "Thư viện Media" },
    ],
  },
  {
    title: "Nội dung & Đào tạo",
    items: [
      { to: "/supplier/content/authoring", icon: Edit, label: "Studio Biên soạn" },
      { to: "/supplier/content/library", icon: FolderOpen, label: "Ngân hàng Nội dung" },
      { to: "/supplier/exams", icon: ClipboardCheck, label: "Hệ sinh thái Kỳ thi" },
      { to: "/supplier/training", icon: GraduationCap, label: "Tập huấn Giáo viên" },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { to: "/supplier/orders",    icon: Receipt,   label: "Đơn hàng",    badge: "12" },
      { to: "/supplier/contracts", icon: FileText,  label: "Hợp đồng" },
      { to: "/supplier/warranty",  icon: Wrench,    label: "Bảo hành",    badge: "5" },
      { to: "/supplier/licenses",  icon: KeyRound,  label: "License" },
      { to: "/supplier/software",  icon: Cpu,       label: "Bộ cài Phần mềm" },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { to: "/supplier/schools", icon: School, label: "Trường học" },
      { to: "/supplier/distributors", icon: Handshake, label: "Đại lý phân phối" },
    ],
  },
  {
    title: "Phân tích & Báo cáo",
    items: [
      { to: "/supplier/analytics", icon: BarChart3, label: "Hiệu quả giảng dạy" },
      { to: "/supplier/revenue", icon: TrendingUp, label: "Doanh thu tổng hợp" },
    ],
  },
  SHARED_PERSONAL,
];

const SUPPLIER_CONTENT_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Chương trình & Nội dung",
    items: [
      { to: "/supplier/programs", icon: Puzzle, label: "Chương trình STEM" },
      { to: "/supplier/content/authoring", icon: Edit, label: "Studio Biên soạn" },
      { to: "/supplier/content/library", icon: FolderOpen, label: "Ngân hàng Nội dung" },
      { to: "/supplier/media", icon: Video, label: "Thư viện Media" },
    ],
  },
  {
    title: "Đào tạo & Khảo thí",
    items: [
      { to: "/supplier/exams", icon: ClipboardCheck, label: "Hệ sinh thái Kỳ thi" },
      { to: "/supplier/training", icon: GraduationCap, label: "Tập huấn Giáo viên" },
    ],
  },
  SHARED_PERSONAL,
];

const SUPPLIER_SALES_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard Sales" }],
  },
  {
    title: "Kinh doanh",
    items: [
      { to: "/supplier/orders", icon: Receipt, label: "Đơn hàng", badge: "12" },
      { to: "/supplier/revenue", icon: TrendingUp, label: "Doanh thu" },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { to: "/supplier/schools", icon: School, label: "Trường học" },
      { to: "/supplier/distributors", icon: Handshake, label: "Đại lý" },
      { to: "/distributor/orders", icon: ShoppingBag, label: "Đơn hàng Đại lý" },
    ],
  },
  SHARED_PERSONAL,
];

const SUPPLIER_WARRANTY_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/supplier/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Hậu mãi & Phần mềm",
    items: [
      { to: "/supplier/warranty", icon: Wrench, label: "Hàng đợi Bảo hành", badge: "5" },
      { to: "/supplier/licenses", icon: KeyRound, label: "License" },
      { to: "/supplier/software", icon: Cpu, label: "Bộ cài Phần mềm" },
    ],
  },
  SHARED_PERSONAL,
];

const DISTRIBUTOR_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/distributor/dashboard", icon: LayoutDashboard, label: "Dashboard Đại lý" }],
  },
  {
    title: "Kinh doanh",
    items: [
      { to: "/distributor/orders", icon: Receipt, label: "Đơn hàng (Kanban)", badge: "8" },
      { to: "/distributor/contracts", icon: FileText, label: "Hợp đồng" },
      { to: "/distributor/sales-app", icon: ShoppingBag, label: "Sales App" },
    ],
  },
  {
    title: "Kho vận",
    items: [
      { to: "/distributor/inventory", icon: Warehouse, label: "Kho ảo" },
    ],
  },
  {
    title: "Tài chính",
    items: [
      { to: "/distributor/revenue", icon: TrendingUp, label: "Doanh thu" },
      { to: "/distributor/commission", icon: Receipt, label: "Đối soát Hoa hồng" },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { to: "/distributor/customers", icon: Users, label: "CRM Khách hàng" },
      { to: "/distributor/customer-care", icon: MessageCircle, label: "Chăm sóc KH" },
    ],
  },
  SHARED_PERSONAL,
];

const DISTRIBUTOR_SALES_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/distributor/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Bán hàng",
    items: [
      { to: "/distributor/orders", icon: Receipt, label: "Đơn hàng", badge: "8" },
      { to: "/distributor/contracts", icon: FileText, label: "Hợp đồng" },
      { to: "/distributor/sales-app", icon: ShoppingBag, label: "Sales App" },
    ],
  },
  {
    title: "CRM",
    items: [
      { to: "/distributor/customers", icon: Users, label: "Khách hàng" },
      { to: "/distributor/customer-care", icon: MessageCircle, label: "Chăm sóc" },
    ],
  },
  SHARED_PERSONAL,
];

const DISTRIBUTOR_FINANCE_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/distributor/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Tài chính",
    items: [
      { to: "/distributor/revenue", icon: TrendingUp, label: "Báo cáo Doanh thu" },
      { to: "/distributor/commission", icon: Receipt, label: "Đối soát Hoa hồng" },
      { to: "/distributor/inventory", icon: Warehouse, label: "Kho ảo" },
    ],
  },
  SHARED_PERSONAL,
];

const SCHOOL_PRINCIPAL_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [
      { to: "/school/dashboard", icon: LayoutDashboard, label: "Dashboard Trường" },
      { to: "/school/profile", icon: Building2, label: "Hồ sơ Trường học" },
    ],
  },
  {
    title: "Nhân sự & Lớp học",
    items: [
      { to: "/school/teachers", icon: UserCheck, label: "Danh sách Giáo viên" },
      { to: "/school/students", icon: UsersRound, label: "Danh sách Học sinh" },
      { to: "/school/classes", icon: GraduationCap, label: "Danh sách Lớp" },
    ],
  },
  {
    title: "Phòng STEM & TKB",
    items: [
      { to: "/school/rooms", icon: DoorOpen, label: "Phòng STEM" },
      { to: "/school/rooms/booking", icon: Calendar, label: "Đặt phòng STEM" },
      { to: "/school/schedule", icon: Calendar, label: "TKB Toàn trường" },
      { to: "/school/stem-slots", icon: Layers, label: "Xếp tiết STEM" },
    ],
  },
  {
    title: "Thiết bị & Bảo hành",
    items: [
      { to: "/school/equipment", icon: Boxes, label: "Thiết bị STEM" },
      { to: "/school/warranty", icon: Wrench, label: "Yêu cầu Bảo hành", badge: "2" },
    ],
  },
  {
    title: "Khóa học & License",
    items: [
      { to: "/school/purchase", icon: ShoppingBag, label: "Mua sắm gói STEM" },
      { to: "/school/courses", icon: BookMarked, label: "Khóa STEM đã mua" },
      { to: "/school/licenses", icon: KeyRound, label: "Pool License" },
      { to: "/school/license-assign", icon: Users, label: "Gán / Thu hồi License" },
    ],
  },
  {
    title: "Báo cáo & Phân tích",
    items: [
      { to: "/school/reports", icon: BarChart3, label: "Hiệu quả STEM" },
      { to: "/school/reports/roi", icon: PieChart, label: "Thống kê phòng (ROI)" },
      { to: "/school/reports/builder", icon: FileText, label: "Report Builder" },
    ],
  },
  {
    title: "Quản trị",
    items: [
      { to: "/school/settings", icon: Settings, label: "Cài đặt Trường" },
      { to: "/shared/announcements", icon: Megaphone, label: "Thông báo" },
    ],
  },
  SHARED_PERSONAL,
];

const SCHOOL_ADMIN_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/school/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "Nhân sự",
    items: [
      { to: "/school/teachers", icon: UserCheck, label: "Giáo viên" },
      { to: "/school/students", icon: UsersRound, label: "Học sinh" },
      { to: "/school/classes", icon: GraduationCap, label: "Lớp học" },
    ],
  },
  {
    title: "Vận hành",
    items: [
      { to: "/school/purchase", icon: ShoppingBag, label: "Mua sắm STEM" },
      { to: "/school/courses", icon: BookMarked, label: "Khóa học STEM" },
      { to: "/school/equipment", icon: Boxes, label: "Thiết bị" },
      { to: "/school/warranty", icon: Wrench, label: "Bảo hành" },
      { to: "/school/licenses", icon: KeyRound, label: "License" },
      { to: "/school/license-assign", icon: Users, label: "Gán License" },
    ],
  },
  {
    title: "Cài đặt",
    items: [
      { to: "/school/settings", icon: Settings, label: "Cài đặt Trường" },
    ],
  },
  SHARED_PERSONAL,
];

const SCHOOL_ITADMIN_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/school/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    title: "CNTT",
    items: [
      { to: "/school/equipment", icon: Boxes, label: "Thiết bị & QR scan" },
      { to: "/school/warranty", icon: Wrench, label: "Bảo hành" },
      { to: "/school/licenses", icon: KeyRound, label: "License" },
    ],
  },
  SHARED_PERSONAL,
];

const AUTHORITY_ADMIN_NAV: NavGroup[] = [
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
      { to: "/authority/equipment-compliance", icon: ClipboardCheck, label: "Tình trạng & Chuẩn" },
      { to: "/authority/reports/procurement",  icon: TrendingUp,     label: "Chi phí Mua sắm" },
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
  SHARED_PERSONAL,
];

const AUTHORITY_VIEWER_NAV: NavGroup[] = [
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
      { to: "/authority/reports/tt38",    icon: FileText,       label: "Báo cáo TT38" },
      { to: "/authority/reports/cv1014",  icon: ClipboardCheck, label: "Báo cáo CV1014" },
      { to: "/authority/reports/builder", icon: Microscope,     label: "Báo cáo tùy chỉnh" },
      { to: "/authority/analytics",       icon: BarChart3,      label: "Phân tích Nâng cao" },
    ],
  },
  SHARED_PERSONAL,
];

const TEACHER_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ to: "/teacher/dashboard", icon: LayoutDashboard, label: "Dashboard Giáo viên" }],
  },
  {
    title: "Giảng dạy",
    items: [
      { to: "/teacher/schedule", icon: Calendar, label: "Thời khóa biểu" },
      { to: "/teacher/lessons", icon: BookOpen, label: "Bài giảng CT1–CT5" },
      { to: "/teacher/lesson-plan-builder", icon: Lightbulb, label: "Soạn giáo án (AI)" },
      { to: "/teacher/resources", icon: FolderOpen, label: "Học liệu & Giáo án" },
      { to: "/teacher/exams", icon: ClipboardCheck, label: "Kiểm tra & Đề thi" },
    ],
  },
  {
    title: "Học sinh",
    items: [
      { to: "/teacher/classes", icon: UsersRound, label: "Lớp phụ trách" },
      { to: "/teacher/grading", icon: PenTool, label: "Chấm điểm" },
      { to: "/school/students", icon: GraduationCap, label: "Danh sách HS" },
    ],
  },
  {
    title: "Tập huấn",
    items: [
      { to: "/teacher/training", icon: Award, label: "Kho tập huấn 5 năm" },
    ],
  },
  {
    title: "Cơ sở vật chất",
    items: [
      { to: "/teacher/equipment-check", icon: Activity, label: "Check thiết bị tại lớp" },
    ],
  },
  SHARED_PERSONAL,
];

const STUDENT_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [
      { to: "/student/dashboard", icon: LayoutDashboard, label: "Trang chủ" },
      { to: "/student/schedule",  icon: Calendar,        label: "Thời khóa biểu" },
    ],
  },
  {
    title: "Học tập",
    items: [
      { to: "/student/courses",  icon: BookOpen,        label: "Khóa học STEM" },
      { to: "/student/forum",    icon: MessagesSquare,  label: "Diễn đàn lớp"  },
    ],
  },
  {
    title: "Thành tích",
    items: [
      { to: "/student/achievements", icon: Trophy, label: "Thành tích & Badge" },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    title: "Tổng quan",
    items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    title: "Quản lý Tổ chức",
    items: [
      { to: "/admin/organizations",      icon: Building2,    label: "Danh sách tổ chức" },
      { to: "/admin/organizations/tree", icon: Network,      label: "Cây phân cấp hành chính" },
    ],
  },
  {
    title: "Quản lý Nhà Cung Cấp",
    items: [
      { to: "/admin/suppliers",         icon: Factory, label: "Danh sách NCC" },
      { to: "/admin/suppliers/content", icon: Layers,  label: "Giám sát nội dung & Gói STEM" },
    ],
  },
  {
    title: "Quản lý Tài khoản",
    items: [
      { to: "/admin/accounts", icon: Users,  label: "Danh sách tài khoản" },
      { to: "/admin/roles",    icon: Shield, label: "Vai trò & Phân quyền" },
    ],
  },
  {
    title: "Cấu hình & Thông báo",
    items: [
      { to: "/admin/platform",       icon: Settings,  label: "Cấu hình nền tảng" },
      { to: "/shared/announcements", icon: Megaphone, label: "Thông báo hệ thống" },
    ],
  },
  {
    title: "Giám sát & Nhật ký",
    items: [
      { to: "/admin/audit", icon: ScrollText, label: "Nhật ký kiểm tra" },
    ],
  },
  {
    title: "Danh mục dùng chung",
    items: [
      { to: "/admin/master-data/levels",    icon: GraduationCap, label: "Cấp học" },
      { to: "/admin/master-data/grades",    icon: Layers,        label: "Khối học" },
      { to: "/admin/master-data/subjects",  icon: BookOpen,      label: "Môn học" },
      { to: "/admin/master-data/textbooks", icon: BookMarked,    label: "Sách giáo khoa" },
      { to: "/admin/master-data/misc",      icon: Boxes,         label: "Danh mục khác" },
    ],
  },
  SHARED_PERSONAL,
];

export function getNavGroups(role: StemRole): NavGroup[] {
  switch (role) {
    case "supplier_admin":     return SUPPLIER_NAV;
    case "supplier_content":   return SUPPLIER_CONTENT_NAV;
    case "supplier_sales":     return SUPPLIER_SALES_NAV;
    case "supplier_warranty":  return SUPPLIER_WARRANTY_NAV;
    case "distributor_admin":  return DISTRIBUTOR_NAV;
    case "distributor_sales":  return DISTRIBUTOR_SALES_NAV;
    case "distributor_finance":return DISTRIBUTOR_FINANCE_NAV;
    case "school_principal":   return SCHOOL_PRINCIPAL_NAV;
    case "school_admin":       return SCHOOL_ADMIN_NAV;
    case "school_itadmin":     return SCHOOL_ITADMIN_NAV;
    case "authority_admin":    return AUTHORITY_ADMIN_NAV;
    case "authority_viewer":   return AUTHORITY_VIEWER_NAV;
    case "teacher":            return TEACHER_NAV;
    case "student":            return STUDENT_NAV;
    case "system_admin":       return ADMIN_NAV;
    default:                   return [SHARED_PERSONAL];
  }
}
