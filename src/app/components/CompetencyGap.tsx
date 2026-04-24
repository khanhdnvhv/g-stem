// ============================================
// GELEXIMCO LMS - Phân tích Khoảng cách Năng lực
// Module nâng cao: Đo lường gap giữa năng lực hiện tại vs. yêu cầu
// Custom SVG horizontal bar charts
// ============================================

import * as React from "react";
import {
  Users,
  TrendingUp,
  Target,
  AlertTriangle,
  Award,
  BookOpen,
  ChevronDown,
  Download,
  Filter,
  RefreshCw,
  Search,
  BarChart3,
  User,
  Building2,
  GraduationCap,
} from "lucide-react";

// ============================================
// TYPES & INTERFACES
// ============================================

interface CompetencyGapData {
  id: string;
  competency: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  category: string;
  color: string;
  affectedEmployees: number;
  priority: "high" | "medium" | "low";
  recommendedCourses: string[];
}

interface DepartmentGapSummary {
  department: string;
  totalGaps: number;
  avgGap: number;
  criticalCount: number;
  employeeCount: number;
}

interface EmployeeGapDetail {
  id: string;
  name: string;
  department: string;
  position: string;
  gapCount: number;
  avgGap: number;
  criticalGaps: string[];
}

// ============================================
// MOCK DATA - Dữ liệu Khoảng cách Năng lực
// ============================================

const COMPETENCY_CATEGORIES = [
  { id: "leadership", name: "Lãnh đạo & Quản lý", color: "#c8a84e" },
  { id: "technical", name: "Chuyên môn Kỹ thuật", color: "#2e86de" },
  { id: "business", name: "Kinh doanh & Thị trường", color: "#27ae60" },
  { id: "compliance", name: "Tuân thủ & Rủi ro", color: "#990803" },
  { id: "digital", name: "Chuyển đổi Số", color: "#8e44ad" },
];

const COMPETENCY_GAP_DATA: CompetencyGapData[] = [
  {
    id: "cg001",
    competency: "Tư duy Chiến lược",
    currentLevel: 3.0,
    requiredLevel: 5.0,
    gap: 2.0,
    category: "leadership",
    color: "#c8a84e",
    affectedEmployees: 142,
    priority: "high",
    recommendedCourses: ["Strategic Thinking Masterclass", "Business Strategy Fundamentals"],
  },
  {
    id: "cg002",
    competency: "Phân tích Tài chính",
    currentLevel: 3.5,
    requiredLevel: 5.5,
    gap: 2.0,
    category: "business",
    color: "#2e86de",
    affectedEmployees: 89,
    priority: "high",
    recommendedCourses: ["Financial Analysis for Managers", "Corporate Finance Advanced"],
  },
  {
    id: "cg003",
    competency: "M&A & Due Diligence",
    currentLevel: 2.8,
    requiredLevel: 4.8,
    gap: 2.0,
    category: "business",
    color: "#2e86de",
    affectedEmployees: 56,
    priority: "high",
    recommendedCourses: ["M&A Fundamentals", "Due Diligence Best Practices"],
  },
  {
    id: "cg004",
    competency: "Tuân thủ & Compliance",
    currentLevel: 3.2,
    requiredLevel: 5.2,
    gap: 2.0,
    category: "compliance",
    color: "#990803",
    affectedEmployees: 234,
    priority: "high",
    recommendedCourses: ["Regulatory Compliance", "Risk Management Framework"],
  },
  {
    id: "cg005",
    competency: "Digital Marketing",
    currentLevel: 2.5,
    requiredLevel: 4.5,
    gap: 2.0,
    category: "digital",
    color: "#2e86de",
    affectedEmployees: 67,
    priority: "medium",
    recommendedCourses: ["Digital Marketing Strategy", "Social Media Marketing"],
  },
  {
    id: "cg006",
    competency: "Phân tích Dữ liệu",
    currentLevel: 3.0,
    requiredLevel: 5.0,
    gap: 2.0,
    category: "technical",
    color: "#2e86de",
    affectedEmployees: 123,
    priority: "high",
    recommendedCourses: ["Data Analytics with Python", "Business Intelligence Tools"],
  },
  {
    id: "cg007",
    competency: "Sáng tạo Nội dung",
    currentLevel: 3.3,
    requiredLevel: 5.3,
    gap: 2.0,
    category: "digital",
    color: "#990803",
    affectedEmployees: 45,
    priority: "medium",
    recommendedCourses: ["Content Strategy & Creation", "Creative Writing for Business"],
  },
  {
    id: "cg008",
    competency: "HR Strategy",
    currentLevel: 3.1,
    requiredLevel: 5.1,
    gap: 2.0,
    category: "leadership",
    color: "#c8a84e",
    affectedEmployees: 38,
    priority: "medium",
    recommendedCourses: ["Strategic HR Management", "Talent Development"],
  },
  {
    id: "cg009",
    competency: "Quản lý Dự án",
    currentLevel: 3.4,
    requiredLevel: 5.0,
    gap: 1.6,
    category: "leadership",
    color: "#c8a84e",
    affectedEmployees: 156,
    priority: "medium",
    recommendedCourses: ["PMP Fundamentals", "Agile Project Management"],
  },
  {
    id: "cg010",
    competency: "Quản trị Rủi ro",
    currentLevel: 2.9,
    requiredLevel: 5.2,
    gap: 2.3,
    category: "compliance",
    color: "#990803",
    affectedEmployees: 98,
    priority: "high",
    recommendedCourses: ["Enterprise Risk Management", "Operational Risk Assessment"],
  },
  {
    id: "cg011",
    competency: "Chuyển đổi Số",
    currentLevel: 2.6,
    requiredLevel: 4.8,
    gap: 2.2,
    category: "digital",
    color: "#8e44ad",
    affectedEmployees: 187,
    priority: "high",
    recommendedCourses: ["Digital Transformation Strategy", "Cloud Computing Basics"],
  },
  {
    id: "cg012",
    competency: "Lãnh đạo Thay đổi",
    currentLevel: 3.2,
    requiredLevel: 5.0,
    gap: 1.8,
    category: "leadership",
    color: "#c8a84e",
    affectedEmployees: 72,
    priority: "medium",
    recommendedCourses: ["Change Management", "Leading Through Change"],
  },
];

const DEPARTMENT_GAPS: DepartmentGapSummary[] = [
  {
    department: "Ban Giám đốc Tập đoàn",
    totalGaps: 24,
    avgGap: 1.9,
    criticalCount: 8,
    employeeCount: 15,
  },
  {
    department: "Ban Chiến lược & Phát triển",
    totalGaps: 32,
    avgGap: 2.1,
    criticalCount: 12,
    employeeCount: 22,
  },
  {
    department: "Khối Ngân hàng Bán lẻ",
    totalGaps: 156,
    avgGap: 1.7,
    criticalCount: 45,
    employeeCount: 342,
  },
  {
    department: "Khối Quản trị Rủi ro",
    totalGaps: 78,
    avgGap: 2.3,
    criticalCount: 34,
    employeeCount: 67,
  },
  {
    department: "Ban Kinh doanh BĐS",
    totalGaps: 89,
    avgGap: 1.8,
    criticalCount: 28,
    employeeCount: 124,
  },
];

const EMPLOYEE_GAPS: EmployeeGapDetail[] = [
  {
    id: "emp001",
    name: "Nguyễn Văn An",
    department: "Ban Chiến lược & Phát triển",
    position: "Trưởng phòng Phát triển",
    gapCount: 5,
    avgGap: 2.2,
    criticalGaps: ["Tư duy Chiến lược", "M&A & Due Diligence"],
  },
  {
    id: "emp002",
    name: "Trần Thị Bình",
    department: "Khối Quản trị Rủi ro",
    position: "Chuyên viên Cao cấp",
    gapCount: 4,
    avgGap: 2.4,
    criticalGaps: ["Quản trị Rủi ro", "Tuân thủ & Compliance"],
  },
  {
    id: "emp003",
    name: "Lê Văn Cường",
    department: "Ban CNTT & Chuyển đổi số",
    position: "Phó Giám đốc CNTT",
    gapCount: 6,
    avgGap: 2.1,
    criticalGaps: ["Chuyển đổi Số", "Phân tích Dữ liệu", "Tư duy Chiến lược"],
  },
];

// ============================================
// CUSTOM SVG HORIZONTAL BAR CHART
// ============================================

interface HorizontalBarChartProps {
  data: CompetencyGapData[];
  maxValue?: number;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, maxValue = 5.0 }) => {
  const barHeight = 28;
  const barSpacing = 48;
  const labelWidth = 180;
  const chartWidth = 320;
  const padding = { top: 10, right: 60, bottom: 10, left: labelWidth };

  const chartHeight = data.length * barSpacing + padding.top + padding.bottom;

  return (
    <svg width="100%" height={chartHeight} className="overflow-visible">
      {data.map((item, index) => {
        const y = padding.top + index * barSpacing;
        const barWidth = (item.gap / maxValue) * chartWidth;

        return (
          <g key={item.id}>
            {/* Label */}
            <text
              x={labelWidth - 12}
              y={y + barHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-sm text-gray-700 font-medium"
            >
              {item.competency}
            </text>

            {/* Background bar */}
            <rect
              x={padding.left}
              y={y}
              width={chartWidth}
              height={barHeight}
              fill="#f3f4f6"
              rx={4}
            />

            {/* Value bar with gradient */}
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={item.color} stopOpacity={1} />
              </linearGradient>
            </defs>
            <rect
              x={padding.left}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={`url(#grad-${item.id})`}
              rx={4}
              className="transition-all duration-300"
            />

            {/* Value label */}
            <text
              x={padding.left + barWidth + 8}
              y={y + barHeight / 2}
              dominantBaseline="middle"
              className="text-sm font-semibold"
              fill={item.color}
            >
              {item.gap.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendUp,
  color = "#990803",
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                size={14}
                className={trendUp ? "text-green-600" : "text-red-600"}
                style={{ transform: trendUp ? "none" : "rotate(180deg)" }}
              />
              <span
                className={`text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}
              >
                {trend}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function CompetencyGap() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedView, setSelectedView] = React.useState<"overview" | "department" | "employee">(
    "overview"
  );
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter data
  const filteredData = React.useMemo(() => {
    let filtered = COMPETENCY_GAP_DATA;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.competency.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.gap - a.gap);
  }, [selectedCategory, searchTerm]);

  // Stats
  const stats = React.useMemo(() => {
    const totalGaps = COMPETENCY_GAP_DATA.length;
    const avgGap =
      COMPETENCY_GAP_DATA.reduce((sum, item) => sum + item.gap, 0) / totalGaps;
    const criticalGaps = COMPETENCY_GAP_DATA.filter((item) => item.gap >= 2.0).length;
    const totalAffected = COMPETENCY_GAP_DATA.reduce(
      (sum, item) => sum + item.affectedEmployees,
      0
    );

    return { totalGaps, avgGap, criticalGaps, totalAffected };
  }, []);

  return (
    <div className="p-[0px]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
                <Target className="text-white" size={22} />
              </div>
              Phân tích Khoảng cách Năng lực
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Đo lường gap giữa năng lực hiện tại và yêu cầu công việc - Tập đoàn Geleximco
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <RefreshCw size={16} />
              Làm mới
            </button>
            <button className="px-4 py-2 bg-[#990803] text-white rounded-lg text-sm font-medium hover:bg-[#7a0602] flex items-center gap-2">
              <Download size={16} />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Tổng Khoảng cách"
          value={stats.totalGaps}
          color="#990803"
        />
        <StatCard
          icon={<Target size={20} />}
          label="Mức Gap Trung bình"
          value={stats.avgGap.toFixed(1)}
          trend="+0.3 so với tháng trước"
          trendUp={false}
          color="#c8a84e"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Gap Nghiêm trọng (≥2.0)"
          value={stats.criticalGaps}
          color="#e74c3c"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Nhân sự Cần đào tạo"
          value={stats.totalAffected.toLocaleString()}
          color="#2e86de"
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedView("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === "overview"
                ? "bg-[#990803] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Award size={16} className="inline mr-2" />
            Tổng quan Năng lực
          </button>
          <button
            onClick={() => setSelectedView("department")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === "department"
                ? "bg-[#990803] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Building2 size={16} className="inline mr-2" />
            Theo Phòng ban
          </button>
          <button
            onClick={() => setSelectedView("employee")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedView === "employee"
                ? "bg-[#990803] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <User size={16} className="inline mr-2" />
            Theo Nhân sự
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm năng lực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#990803]"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#990803] cursor-pointer"
            >
              <option value="all">Tất cả Danh mục</option>
              {COMPETENCY_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === "overview" && (
        <div className="grid grid-cols-1 gap-6">
          {/* Top Competency Gaps Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-[#990803]" size={20} />
              <h2 className="text-lg font-bold text-gray-900">
                Top Năng lực cần Phát triển (Trung bình Gap)
              </h2>
            </div>

            {filteredData.length > 0 ? (
              <HorizontalBarChart data={filteredData.slice(0, 8)} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy dữ liệu phù hợp
              </div>
            )}
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Chi tiết Khoảng cách Năng lực
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Năng lực
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Danh mục
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Hiện tại
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Yêu cầu
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Gap
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Nhân sự
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Độ ưu tiên
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => {
                    const category = COMPETENCY_CATEGORIES.find((c) => c.id === item.category);
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.competency}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${category?.color}15`,
                              color: category?.color,
                            }}
                          >
                            {category?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {item.currentLevel.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {item.requiredLevel.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: item.gap >= 2.0 ? "#fef2f2" : "#fef9c3",
                              color: item.gap >= 2.0 ? "#dc2626" : "#ca8a04",
                            }}
                          >
                            {item.gap.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {item.affectedEmployees}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.priority === "high"
                              ? "Cao"
                              : item.priority === "medium"
                                ? "Trung bình"
                                : "Thấp"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-[#990803] hover:text-[#7a0602] text-sm font-medium flex items-center gap-1 ml-auto">
                            <BookOpen size={14} />
                            Gợi ý Khóa học
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedView === "department" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-[#990803]" />
            Khoảng cách Năng lực theo Phòng ban
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Phòng ban
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Tổng Gap
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Gap TB
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Gap Nghiêm trọng
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Nhân sự
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENT_GAPS.map((dept, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{dept.department}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {dept.totalGaps}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: dept.avgGap >= 2.0 ? "#fef2f2" : "#fef9c3",
                          color: dept.avgGap >= 2.0 ? "#dc2626" : "#ca8a04",
                        }}
                      >
                        {dept.avgGap.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {dept.criticalCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {dept.employeeCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-[#990803] hover:text-[#7a0602] text-sm font-medium">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedView === "employee" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-[#990803]" />
            Khoảng cách Năng lực theo Nhân sự
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Nhân sự
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Phòng ban
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Vị trí
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Số Gap
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Gap TB
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Gap Nghiêm trọng
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {EMPLOYEE_GAPS.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center text-white text-xs font-semibold">
                          {emp.name
                            .split(" ")
                            .slice(-2)
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="font-medium text-gray-900">{emp.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.department}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{emp.position}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {emp.gapCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: emp.avgGap >= 2.0 ? "#fef2f2" : "#fef9c3",
                          color: emp.avgGap >= 2.0 ? "#dc2626" : "#ca8a04",
                        }}
                      >
                        {emp.avgGap.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.criticalGaps.slice(0, 2).map((gap, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                          >
                            {gap}
                          </span>
                        ))}
                        {emp.criticalGaps.length > 2 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{emp.criticalGaps.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-[#990803] hover:text-[#7a0602] text-sm font-medium flex items-center gap-1 ml-auto">
                        <GraduationCap size={14} />
                        Lập kế hoạch IDP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
