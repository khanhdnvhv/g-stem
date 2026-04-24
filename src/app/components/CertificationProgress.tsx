// ============================================
// GELEXIMCO LMS - Tiến độ Đạt Chứng chỉ
// Module: Theo dõi tỉ lệ đạt chứng chỉ theo khóa học
// Custom SVG gradient bars (đỏ → vàng gold)
// ============================================

import * as React from "react";
import {
  Users,
  Award,
  Clock,
  Target,
  TrendingUp,
  Download,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Eye,
  FileText,
  BarChart3,
  Calendar,
  User,
  ChevronRight,
  Printer,
  Mail,
} from "lucide-react";

// ============================================
// TYPES & INTERFACES
// ============================================

interface CourseCertData {
  id: string;
  name: string;
  totalLearners: number;
  certified: number;
  pendingApproval: number;
  avgScore: number;
  passRate: number;
  category: string;
  subsidiary: string;
  deadline?: string;
  lastUpdated: string;
}

interface SubsidiarySummary {
  name: string;
  totalLearners: number;
  certified: number;
  pendingApproval: number;
  passRate: number;
  avgScore: number;
}

// ============================================
// MOCK DATA - Dữ liệu Chứng chỉ theo Khóa
// ============================================

const COURSE_CERT_DATA: CourseCertData[] = [
  {
    id: "cc01",
    name: "An toàn Lao động trong Xây dựng & Khai khoáng",
    totalLearners: 45,
    certified: 38,
    pendingApproval: 3,
    avgScore: 82,
    passRate: 84,
    category: "An toàn Lao động",
    subsidiary: "Geleximco Xây dựng",
    deadline: "30/06/2026",
    lastUpdated: "10/03/2026",
  },
  {
    id: "cc02",
    name: "Quản trị Rủi ro & Kiểm soát Nội bộ",
    totalLearners: 32,
    certified: 28,
    pendingApproval: 2,
    avgScore: 85,
    passRate: 88,
    category: "Quản trị Rủi ro",
    subsidiary: "An Bình Bank",
    deadline: "15/04/2026",
    lastUpdated: "08/03/2026",
  },
  {
    id: "cc03",
    name: "Kỹ năng Lãnh đạo & Quản lý Cấp trung",
    totalLearners: 28,
    certified: 22,
    pendingApproval: 4,
    avgScore: 78,
    passRate: 79,
    category: "Lãnh đạo & Quản lý",
    subsidiary: "Tập đoàn Geleximco",
    deadline: "31/05/2026",
    lastUpdated: "12/03/2026",
  },
  {
    id: "cc04",
    name: "ISO 9001:2015 - Quản lý Chất lượng",
    totalLearners: 36,
    certified: 31,
    pendingApproval: 1,
    avgScore: 81,
    passRate: 86,
    category: "Chất lượng & ISO",
    subsidiary: "Geleximco Xây dựng",
    lastUpdated: "09/03/2026",
  },
  {
    id: "cc05",
    name: "ESG & Phát triển Bền vững",
    totalLearners: 22,
    certified: 18,
    pendingApproval: 2,
    avgScore: 79,
    passRate: 82,
    category: "ESG & Phát triển",
    subsidiary: "Tập đoàn Geleximco",
    deadline: "30/09/2026",
    lastUpdated: "11/03/2026",
  },
  {
    id: "cc06",
    name: "Phòng chống Rửa tiền (AML/CFT)",
    totalLearners: 54,
    certified: 49,
    pendingApproval: 3,
    avgScore: 87,
    passRate: 91,
    category: "Tuân thủ Pháp luật",
    subsidiary: "An Bình Bank",
    deadline: "31/03/2026",
    lastUpdated: "13/03/2026",
  },
  {
    id: "cc07",
    name: "Bảo mật Thông tin & An ninh Mạng",
    totalLearners: 40,
    certified: 33,
    pendingApproval: 5,
    avgScore: 76,
    passRate: 83,
    category: "CNTT & An ninh",
    subsidiary: "Geleximco Digital",
    lastUpdated: "07/03/2026",
  },
  {
    id: "cc08",
    name: "Đạo đức Kinh doanh & Văn hoá Doanh nghiệp",
    totalLearners: 68,
    certified: 61,
    pendingApproval: 0,
    avgScore: 90,
    passRate: 90,
    category: "Văn hoá & Đạo đức",
    subsidiary: "Tập đoàn Geleximco",
    lastUpdated: "06/03/2026",
  },
  {
    id: "cc09",
    name: "Kế toán Quản trị & Phân tích Tài chính",
    totalLearners: 25,
    certified: 20,
    pendingApproval: 3,
    avgScore: 83,
    passRate: 80,
    category: "Tài chính & Kế toán",
    subsidiary: "An Bình Bank",
    deadline: "30/06/2026",
    lastUpdated: "05/03/2026",
  },
  {
    id: "cc10",
    name: "Kỹ năng Đàm phán & Bán hàng Chuyên nghiệp",
    totalLearners: 30,
    certified: 24,
    pendingApproval: 2,
    avgScore: 77,
    passRate: 80,
    category: "Kinh doanh & Bán hàng",
    subsidiary: "Geleximco BĐS",
    lastUpdated: "04/03/2026",
  },
  {
    id: "cc11",
    name: "Onboarding - Chào mừng Thành viên mới",
    totalLearners: 42,
    certified: 40,
    pendingApproval: 1,
    avgScore: 92,
    passRate: 95,
    category: "Onboarding",
    subsidiary: "Tập đoàn Geleximco",
    lastUpdated: "13/03/2026",
  },
  {
    id: "cc12",
    name: "Quản lý Dự án theo chuẩn PMP",
    totalLearners: 18,
    certified: 13,
    pendingApproval: 3,
    avgScore: 74,
    passRate: 72,
    category: "Quản lý Dự án",
    subsidiary: "Geleximco Xây dựng",
    deadline: "15/07/2026",
    lastUpdated: "10/03/2026",
  },
];

const SUBSIDIARY_SUMMARIES: SubsidiarySummary[] = [
  { name: "Tập đoàn Geleximco", totalLearners: 45, certified: 38, pendingApproval: 3, passRate: 84, avgScore: 82 },
  { name: "An Bình Bank (ABBank)", totalLearners: 38, certified: 32, pendingApproval: 4, passRate: 84, avgScore: 85 },
  { name: "Geleximco Xây dựng", totalLearners: 28, certified: 23, pendingApproval: 2, passRate: 82, avgScore: 79 },
  { name: "Geleximco BĐS", totalLearners: 22, certified: 18, pendingApproval: 1, passRate: 82, avgScore: 78 },
  { name: "Geleximco Digital", totalLearners: 15, certified: 13, pendingApproval: 1, passRate: 87, avgScore: 81 },
  { name: "Geleximco Khoáng sản", totalLearners: 15, certified: 13, pendingApproval: 1, passRate: 87, avgScore: 80 },
];

const CATEGORIES = [
  "Tất cả Danh mục",
  "An toàn Lao động",
  "Quản trị Rủi ro",
  "Lãnh đạo & Quản lý",
  "Chất lượng & ISO",
  "ESG & Phát triển",
  "Tuân thủ Pháp luật",
  "CNTT & An ninh",
  "Văn hoá & Đạo đức",
  "Tài chính & Kế toán",
  "Kinh doanh & Bán hàng",
  "Onboarding",
  "Quản lý Dự án",
];

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
      style={{ backgroundColor: bgColor }}
    >
      <div style={{ color }}>{icon}</div>
    </div>
    <div className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </div>
);

// ============================================
// GRADIENT BAR COMPONENT (theo screenshot)
// ============================================

interface GradientBarProps {
  percent: number;
  id: string;
}

const GradientBar: React.FC<GradientBarProps> = ({ percent, id }) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  return (
    <svg width="100%" height="10" className="block">
      <defs>
        <linearGradient id={`bar-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#990803" />
          <stop offset="60%" stopColor="#c8a84e" />
          <stop offset="100%" stopColor="#c8a84e" />
        </linearGradient>
        <clipPath id={`bar-clip-${id}`}>
          <rect x="0" y="0" width={`${clampedPercent}%`} height="10" rx="5" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="100%" height="10" rx="5" fill="#f3f4f6" />
      <rect
        x="0"
        y="0"
        width="100%"
        height="10"
        rx="5"
        fill={`url(#bar-grad-${id})`}
        clipPath={`url(#bar-clip-${id})`}
      />
    </svg>
  );
};

// ============================================
// COURSE CERT ROW (theo screenshot)
// ============================================

interface CourseCertRowProps {
  course: CourseCertData;
  onView: (id: string) => void;
}

const CourseCertRow: React.FC<CourseCertRowProps> = ({ course, onView }) => (
  <div
    className="border-b border-gray-100 last:border-b-0 py-5 px-5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
    onClick={() => onView(course.id)}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-gray-900 mb-1.5" style={{ fontWeight: 600, fontSize: "15px" }}>
          {course.name}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-[#990803]" style={{ fontWeight: 600 }}>
            {course.certified}/{course.totalLearners} đạt CC
          </span>
          <span className="text-xs text-gray-500">
            Điểm TB: <span style={{ fontWeight: 600 }}>{course.avgScore}%</span>
          </span>
          {course.pendingApproval > 0 && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <Clock size={12} />
              {course.pendingApproval} chờ duyệt
            </span>
          )}
          {course.deadline && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar size={12} />
              Hạn: {course.deadline}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div
          className="text-2xl"
          style={{
            fontWeight: 700,
            color: course.passRate >= 85 ? "#22c55e" : course.passRate >= 75 ? "#c8a84e" : "#990803",
          }}
        >
          {course.passRate}%
        </div>
        <div className="text-xs text-gray-400">Tỉ lệ đạt</div>
      </div>
    </div>
    <GradientBar percent={course.passRate} id={course.id} />
  </div>
);

// ============================================
// SUBSIDIARY TABLE ROW
// ============================================

const SubsidiaryRow: React.FC<{ item: SubsidiarySummary; index: number }> = ({ item, index }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="py-3 px-4">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
          style={{
            fontWeight: 700,
            background: `linear-gradient(135deg, #990803, #c8a84e)`,
          }}
        >
          {index + 1}
        </div>
        <span className="text-gray-900" style={{ fontWeight: 500, fontSize: "14px" }}>{item.name}</span>
      </div>
    </td>
    <td className="py-3 px-4 text-center text-sm text-gray-600">{item.totalLearners}</td>
    <td className="py-3 px-4 text-center text-sm text-green-700" style={{ fontWeight: 600 }}>
      {item.certified}
    </td>
    <td className="py-3 px-4 text-center">
      {item.pendingApproval > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700" style={{ fontWeight: 500 }}>
          <Clock size={11} />
          {item.pendingApproval}
        </span>
      ) : (
        <span className="text-xs text-gray-400">—</span>
      )}
    </td>
    <td className="py-3 px-4 text-center">
      <span
        className="text-sm"
        style={{
          fontWeight: 700,
          color: item.passRate >= 85 ? "#22c55e" : item.passRate >= 75 ? "#c8a84e" : "#990803",
        }}
      >
        {item.passRate}%
      </span>
    </td>
    <td className="py-3 px-4 text-center text-sm text-gray-600">{item.avgScore}%</td>
    <td className="py-3 px-4">
      <div className="w-full">
        <GradientBar percent={item.passRate} id={`sub-${index}`} />
      </div>
    </td>
  </tr>
);

// ============================================
// DETAIL MODAL
// ============================================

interface DetailModalProps {
  course: CourseCertData | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ course, onClose }) => {
  if (!course) return null;

  const uncertified = course.totalLearners - course.certified - course.pendingApproval;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 text-white"
          style={{ background: "linear-gradient(135deg, #990803, #7a0602)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Award size={24} />
            <h3 style={{ fontWeight: 700, fontSize: "16px" }}>Chi tiết Chứng chỉ Khóa học</h3>
          </div>
          <p className="text-white/80 text-sm">{course.name}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xl text-green-700" style={{ fontWeight: 700 }}>{course.certified}</div>
              <div className="text-xs text-green-600">Đã đạt CC</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-xl text-amber-700" style={{ fontWeight: 700 }}>{course.pendingApproval}</div>
              <div className="text-xs text-amber-600">Chờ duyệt</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl text-gray-700" style={{ fontWeight: 700 }}>{uncertified > 0 ? uncertified : 0}</div>
              <div className="text-xs text-gray-500">Chưa đạt</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tỉ lệ đạt chứng chỉ</span>
              <span
                className="text-lg"
                style={{
                  fontWeight: 700,
                  color: course.passRate >= 85 ? "#22c55e" : course.passRate >= 75 ? "#c8a84e" : "#990803",
                }}
              >
                {course.passRate}%
              </span>
            </div>
            <GradientBar percent={course.passRate} id={`modal-${course.id}`} />
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            {[
              { label: "Tổng học viên", value: course.totalLearners, icon: <Users size={14} /> },
              { label: "Điểm trung bình", value: `${course.avgScore}%`, icon: <BarChart3 size={14} /> },
              { label: "Danh mục", value: course.category, icon: <BookOpen size={14} /> },
              { label: "Đơn vị", value: course.subsidiary, icon: <Building2 size={14} /> },
              { label: "Cập nhật lần cuối", value: course.lastUpdated, icon: <Calendar size={14} /> },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  {row.icon} {row.label}
                </span>
                <span className="text-sm text-gray-900" style={{ fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            {course.deadline && (
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <AlertCircle size={14} /> Hạn hoàn thành
                </span>
                <span className="text-sm text-red-700" style={{ fontWeight: 600 }}>{course.deadline}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Đóng
          </button>
          <button
            className="px-4 py-2 bg-[#990803] text-white rounded-lg text-sm hover:bg-[#7a0602] transition-colors flex items-center gap-2 cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            <Eye size={14} /> Xem danh sách Học viên
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CertificationProgress() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Tất cả Danh mục");
  const [activeView, setActiveView] = React.useState<"course" | "subsidiary">("course");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<"passRate" | "name" | "learners">("passRate");
  const [sortAsc, setSortAsc] = React.useState(false);

  // Compute summary stats
  const summary = React.useMemo(() => {
    const totalLearners = COURSE_CERT_DATA.reduce((s, c) => s + c.totalLearners, 0);
    const totalCertified = COURSE_CERT_DATA.reduce((s, c) => s + c.certified, 0);
    const totalPending = COURSE_CERT_DATA.reduce((s, c) => s + c.pendingApproval, 0);
    const passRate = totalLearners > 0 ? Math.round((totalCertified / totalLearners) * 100) : 0;
    const avgScore = Math.round(COURSE_CERT_DATA.reduce((s, c) => s + c.avgScore, 0) / COURSE_CERT_DATA.length);
    return { totalLearners, totalCertified, totalPending, passRate, avgScore };
  }, []);

  // Filter & sort courses
  const filteredCourses = React.useMemo(() => {
    let data = [...COURSE_CERT_DATA];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerTerm) ||
          c.category.toLowerCase().includes(lowerTerm)
      );
    }

    if (selectedCategory !== "Tất cả Danh mục") {
      data = data.filter((c) => c.category === selectedCategory);
    }

    data.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "passRate") cmp = a.passRate - b.passRate;
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name, "vi");
      else if (sortBy === "learners") cmp = a.totalLearners - b.totalLearners;
      return sortAsc ? cmp : -cmp;
    });

    return data;
  }, [searchTerm, selectedCategory, sortBy, sortAsc]);

  const selectedCourse = selectedCourseId
    ? COURSE_CERT_DATA.find((c) => c.id === selectedCourseId) || null
    : null;

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else {
      setSortBy(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-3" style={{ fontWeight: 700 }}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
              <Award className="text-white" size={22} />
            </div>
            Tiến độ Đạt Chứng chỉ
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tỉ lệ đạt chứng chỉ theo từng khóa học — Tập đoàn Geleximco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            <Printer size={16} />
            In báo cáo
          </button>
          <button className="px-4 py-2 bg-[#990803] text-white rounded-lg text-sm hover:bg-[#7a0602] flex items-center gap-2 transition-colors cursor-pointer" style={{ fontWeight: 500 }}>
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stat Cards - 5 columns matching screenshot */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard
          icon={<Users size={20} />}
          value={summary.totalLearners}
          label="Tổng học viên"
          color="#990803"
          bgColor="#99080315"
        />
        <StatCard
          icon={<Award size={20} />}
          value={summary.totalCertified}
          label="Đã đạt CC"
          color="#2563eb"
          bgColor="#2563eb15"
        />
        <StatCard
          icon={<Clock size={20} />}
          value={summary.totalPending}
          label="Chờ xác nhận"
          color="#d97706"
          bgColor="#d9770615"
        />
        <StatCard
          icon={<Target size={20} />}
          value={`${summary.passRate}%`}
          label="Tỉ lệ đạt"
          color="#16a34a"
          bgColor="#16a34a15"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          value={`${summary.avgScore}%`}
          label="Điểm TB"
          color="#7c3aed"
          bgColor="#7c3aed15"
        />
      </div>

      {/* View Toggle & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("course")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeView === "course"
                ? "bg-[#990803] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{ fontWeight: 500 }}
          >
            <BookOpen size={16} className="inline mr-2" />
            Theo Khóa học
          </button>
          <button
            onClick={() => setActiveView("subsidiary")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeView === "subsidiary"
                ? "bg-[#990803] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={{ fontWeight: 500 }}
          >
            <Building2 size={16} className="inline mr-2" />
            Theo Đơn vị
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#990803]/30 focus:border-[#990803]"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#990803]/30 focus:border-[#990803] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#990803]/30 focus:border-[#990803] cursor-pointer"
            >
              <option value="passRate">Sắp xếp: Tỉ lệ đạt</option>
              <option value="name">Sắp xếp: Tên khóa</option>
              <option value="learners">Sắp xếp: Số học viên</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Content: By Course */}
      {activeView === "course" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 flex items-center gap-2" style={{ fontWeight: 700, fontSize: "16px" }}>
              <FileText size={18} className="text-[#990803]" />
              Tỉ lệ đạt Chứng chỉ theo Khóa
            </h2>
            <span className="text-xs text-gray-400">
              {filteredCourses.length} khóa học
            </span>
          </div>

          {filteredCourses.length > 0 ? (
            <div>
              {filteredCourses.map((course) => (
                <CourseCertRow
                  key={course.id}
                  course={course}
                  onView={(id) => setSelectedCourseId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
              <p style={{ fontWeight: 500 }}>Không tìm thấy khóa học phù hợp</p>
              <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          )}
        </div>
      )}

      {/* Content: By Subsidiary */}
      {activeView === "subsidiary" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-gray-900 flex items-center gap-2" style={{ fontWeight: 700, fontSize: "16px" }}>
              <Building2 size={18} className="text-[#990803]" />
              Tỉ lệ đạt Chứng chỉ theo Đơn vị Thành viên
            </h2>
            <button className="text-[#990803] text-sm flex items-center gap-1 hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
              <Download size={14} /> Xuất báo cáo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70">
                  <th className="text-left py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Đơn vị
                  </th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Tổng HV
                  </th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Đạt CC
                  </th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Chờ duyệt
                  </th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Tỉ lệ đạt
                  </th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    Điểm TB
                  </th>
                  <th className="py-3 px-4 text-xs text-gray-500 w-48" style={{ fontWeight: 600 }}>
                    Tiến độ
                  </th>
                </tr>
              </thead>
              <tbody>
                {SUBSIDIARY_SUMMARIES.map((item, idx) => (
                  <SubsidiaryRow key={idx} item={item} index={idx} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Summary Bar */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                Tổng kết: {summary.totalCertified}/{summary.totalLearners} học viên đã đạt chứng chỉ
              </div>
              <div className="text-xs text-gray-500">
                Cập nhật lần cuối: 13/03/2026 • {summary.totalPending} chứng chỉ đang chờ phê duyệt
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-[#990803]/20 rounded-lg text-xs text-[#990803] hover:bg-[#990803]/5 transition-colors flex items-center gap-1 cursor-pointer" style={{ fontWeight: 500 }}>
              <Mail size={13} /> Gửi nhắc nhở
            </button>
            <button className="px-3 py-1.5 bg-[#990803] text-white rounded-lg text-xs hover:bg-[#7a0602] transition-colors flex items-center gap-1 cursor-pointer" style={{ fontWeight: 500 }}>
              <ArrowUpRight size={13} /> Xem báo cáo đầy đủ
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal course={selectedCourse} onClose={() => setSelectedCourseId(null)} />
    </div>
  );
}
