import { useState } from "react";
import {
  Globe, Search, Plus, Edit, Trash2, CheckCircle, Clock,
  AlertTriangle, Eye, Download, Upload, RefreshCw,
  BarChart3, Users, BookOpen, FileText, Layers,
  Flag, Languages, ArrowRightLeft, Copy, Check,
  Activity, TrendingUp, Filter, ChevronRight,
  Zap, Star, Award,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Language {
  id: string;
  code: string;
  name: string;
  nameLocal: string;
  flag: string;
  status: "active" | "draft" | "disabled";
  translationProgress: number;
  courses: number;
  ui: number;
  content: number;
  lastUpdated: string;
  translator: string;
  users: number;
}

interface TranslationKey {
  id: string;
  key: string;
  module: string;
  vi: string;
  en: string;
  ja: string;
  ko: string;
  zh: string;
  status: "translated" | "needs_review" | "missing";
}

interface CourseTranslation {
  id: string;
  courseTitle: string;
  category: string;
  vi: number;
  en: number;
  ja: number;
  ko: number;
  zh: number;
  priority: "high" | "medium" | "low";
}

// ─── Mock Data ───
const LANGUAGES: Language[] = [
  { id: "L01", code: "vi", name: "Vietnamese", nameLocal: "Tiếng Việt", flag: "🇻🇳", status: "active", translationProgress: 100, courses: 156, ui: 100, content: 100, lastUpdated: "12/03/2026", translator: "Hệ thống (Gốc)", users: 6200 },
  { id: "L02", code: "en", name: "English", nameLocal: "English", flag: "🇬🇧", status: "active", translationProgress: 92, courses: 142, ui: 98, content: 88, lastUpdated: "11/03/2026", translator: "Nguyễn Minh Anh", users: 380 },
  { id: "L03", code: "ja", name: "Japanese", nameLocal: "日本語", flag: "🇯🇵", status: "active", translationProgress: 68, courses: 45, ui: 85, content: 52, lastUpdated: "10/03/2026", translator: "Tanaka Yuki", users: 24 },
  { id: "L04", code: "ko", name: "Korean", nameLocal: "한국어", flag: "🇰🇷", status: "draft", translationProgress: 42, courses: 28, ui: 72, content: 18, lastUpdated: "08/03/2026", translator: "Kim Soo-jin", users: 12 },
  { id: "L05", code: "zh", name: "Chinese (Simplified)", nameLocal: "简体中文", flag: "🇨🇳", status: "draft", translationProgress: 35, courses: 20, ui: 65, content: 12, lastUpdated: "05/03/2026", translator: "Wang Li", users: 8 },
];

const TRANSLATION_KEYS: TranslationKey[] = [
  { id: "TK01", key: "nav.dashboard", module: "Navigation", vi: "Tổng quan", en: "Dashboard", ja: "ダッシュボード", ko: "대시보드", zh: "仪表板", status: "translated" },
  { id: "TK02", key: "nav.courses", module: "Navigation", vi: "Khóa học", en: "Courses", ja: "コース", ko: "강좌", zh: "课程", status: "translated" },
  { id: "TK03", key: "nav.certificates", module: "Navigation", vi: "Chứng chỉ", en: "Certificates", ja: "証明書", ko: "인증서", zh: "证书", status: "translated" },
  { id: "TK04", key: "action.enroll", module: "Course", vi: "Đăng ký Khóa học", en: "Enroll Now", ja: "今すぐ登録", ko: "지금 등록", zh: "立即注册", status: "translated" },
  { id: "TK05", key: "action.submit_exam", module: "Exam", vi: "Nộp bài", en: "Submit Exam", ja: "試験を提出", ko: "시험 제출", zh: "提交考试", status: "translated" },
  { id: "TK06", key: "label.progress", module: "Learning", vi: "Tiến độ", en: "Progress", ja: "進捗", ko: "진행률", zh: "进度", status: "translated" },
  { id: "TK07", key: "msg.deadline_warning", module: "Notification", vi: "Sắp hết hạn hoàn thành!", en: "Deadline approaching!", ja: "締め切りが近づいています！", ko: "", zh: "", status: "missing" },
  { id: "TK08", key: "label.compliance_required", module: "Compliance", vi: "Đào tạo bắt buộc", en: "Required Training", ja: "必須トレーニング", ko: "필수 교육", zh: "", status: "needs_review" },
  { id: "TK09", key: "gamification.badge_earned", module: "Gamification", vi: "Bạn nhận được huy hiệu mới!", en: "You earned a new badge!", ja: "新しいバッジを獲得しました！", ko: "", zh: "", status: "missing" },
  { id: "TK10", key: "cert.download_pdf", module: "Certificate", vi: "Tải PDF Chứng chỉ", en: "Download Certificate PDF", ja: "証明書PDFをダウンロード", ko: "인증서 PDF 다운로드", zh: "下载证书PDF", status: "translated" },
];

const COURSE_TRANSLATIONS: CourseTranslation[] = [
  { id: "CT01", courseTitle: "Kỹ năng Lãnh đạo 4.0", category: "Lãnh đạo", vi: 100, en: 95, ja: 80, ko: 40, zh: 30, priority: "high" },
  { id: "CT02", courseTitle: "An toàn Lao động Công trường", category: "Compliance", vi: 100, en: 100, ja: 0, ko: 0, zh: 0, priority: "high" },
  { id: "CT03", courseTitle: "Digital Marketing & Social Media", category: "Marketing", vi: 100, en: 100, ja: 60, ko: 55, zh: 45, priority: "medium" },
  { id: "CT04", courseTitle: "Excel & VBA Automation", category: "IT", vi: 100, en: 90, ja: 75, ko: 70, zh: 65, priority: "medium" },
  { id: "CT05", courseTitle: "Customer Experience Excellence", category: "Dịch vụ KH", vi: 100, en: 88, ja: 50, ko: 30, zh: 20, priority: "high" },
  { id: "CT06", courseTitle: "ESG & Báo cáo Phát triển Bền vững", category: "Chiến lược", vi: 100, en: 70, ja: 40, ko: 15, zh: 10, priority: "low" },
  { id: "CT07", courseTitle: "AI & Machine Learning Thực hành", category: "Công nghệ", vi: 100, en: 100, ja: 90, ko: 85, zh: 80, priority: "high" },
  { id: "CT08", courseTitle: "Phòng cháy Chữa cháy", category: "Compliance", vi: 100, en: 100, ja: 0, ko: 0, zh: 0, priority: "medium" },
];

const STATUS_CFG = {
  active: { label: "Hoạt động", color: "#16a34a", bg: "#16a34a10" },
  draft: { label: "Nháp", color: "#c8a84e", bg: "#c8a84e10" },
  disabled: { label: "Tắt", color: "#6b7280", bg: "#6b728010" },
};

const PRIORITY_CFG = {
  high: { label: "Cao", color: "#ef4444" },
  medium: { label: "Trung bình", color: "#ea580c" },
  low: { label: "Thấp", color: "#6b7280" },
};

export function MultiLanguage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"languages" | "ui-keys" | "courses" | "analytics">("languages");
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);

  const activeCount = LANGUAGES.filter(l => l.status === "active").length;
  const totalKeys = TRANSLATION_KEYS.length;
  const missingKeys = TRANSLATION_KEYS.filter(k => k.status === "missing").length;
  const avgProgress = Math.round(LANGUAGES.reduce((s, l) => s + l.translationProgress, 0) / LANGUAGES.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Quản lý Đa ngôn ngữ</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Quản lý bản dịch UI, nội dung khóa học và hỗ trợ đa ngôn ngữ cho LMS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất file translations...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export Translations
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form thêm ngôn ngữ mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm Ngôn ngữ
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Ngôn ngữ", value: `${activeCount}/${LANGUAGES.length}`, icon: Globe, color: "#990803" },
          { label: "Tiến độ TB", value: `${avgProgress}%`, icon: TrendingUp, color: "#c8a84e" },
          { label: "UI Keys", value: totalKeys, icon: Languages, color: "#2563eb" },
          { label: "Thiếu bản dịch", value: missingKeys, icon: AlertTriangle, color: "#ef4444" },
          { label: "Users đa ngôn ngữ", value: LANGUAGES.reduce((s, l) => s + (l.code !== "vi" ? l.users : 0), 0), icon: Users, color: "#16a34a" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Translation Coverage Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Coverage Map: Ngôn ngữ × Module</h3>
        <CoverageHeatmap />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "languages" as const, label: "Ngôn ngữ", icon: Globe },
          { id: "ui-keys" as const, label: "UI Translations", icon: Languages },
          { id: "courses" as const, label: "Khóa học", icon: BookOpen },
          { id: "analytics" as const, label: "Phân tích", icon: BarChart3 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "languages" && <LanguagesTab languages={LANGUAGES} onSelect={setSelectedLang} />}
      {tab === "ui-keys" && <UIKeysTab keys={TRANSLATION_KEYS} search={search} setSearch={setSearch} />}
      {tab === "courses" && <CoursesTab courses={COURSE_TRANSLATIONS} />}
      {tab === "analytics" && <AnalyticsTab languages={LANGUAGES} />}

      {/* Language Detail Modal */}
      {selectedLang && <LanguageDetailModal lang={selectedLang} onClose={() => setSelectedLang(null)} />}
    </div>
  );
}

// ─── Coverage Heatmap ───
function CoverageHeatmap() {
  const modules = ["Navigation", "Course", "Exam", "Learning", "Notification", "Compliance", "Gamification", "Certificate"];
  const langs = [
    { code: "vi", flag: "🇻🇳" },
    { code: "en", flag: "🇬🇧" },
    { code: "ja", flag: "🇯🇵" },
    { code: "ko", flag: "🇰🇷" },
    { code: "zh", flag: "🇨🇳" },
  ];
  // Mock coverage matrix
  const coverage: Record<string, Record<string, number>> = {
    vi: { Navigation: 100, Course: 100, Exam: 100, Learning: 100, Notification: 100, Compliance: 100, Gamification: 100, Certificate: 100 },
    en: { Navigation: 100, Course: 95, Exam: 98, Learning: 92, Notification: 85, Compliance: 100, Gamification: 80, Certificate: 95 },
    ja: { Navigation: 90, Course: 75, Exam: 80, Learning: 70, Notification: 50, Compliance: 85, Gamification: 45, Certificate: 80 },
    ko: { Navigation: 80, Course: 50, Exam: 60, Learning: 40, Notification: 20, Compliance: 70, Gamification: 15, Certificate: 55 },
    zh: { Navigation: 70, Course: 40, Exam: 45, Learning: 30, Notification: 10, Compliance: 60, Gamification: 10, Certificate: 40 },
  };

  const cellW = 50, cellH = 24, pL = 80, pT = 25;
  const W = pL + modules.length * (cellW + 4) + 10;
  const H = pT + langs.length * (cellH + 4) + 10;

  function getColor(v: number) {
    if (v >= 95) return "#16a34a";
    if (v >= 70) return "#22c55e";
    if (v >= 40) return "#eab308";
    if (v > 0) return "#ef4444";
    return "#e5e7eb";
  }

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Module headers */}
      {modules.map((m, i) => (
        <text key={m} x={pL + i * (cellW + 4) + cellW / 2} y={15} textAnchor="middle" fill="#6b7280" style={{ fontSize: "7px", fontWeight: 600 }}>{m}</text>
      ))}
      {/* Rows */}
      {langs.map((lang, li) => {
        const y = pT + li * (cellH + 4);
        return (
          <g key={lang.code}>
            <text x={5} y={y + cellH / 2 + 1} dominantBaseline="central" fill="#374151" style={{ fontSize: "10px" }}>{lang.flag} {lang.code.toUpperCase()}</text>
            {modules.map((m, mi) => {
              const x = pL + mi * (cellW + 4);
              const v = coverage[lang.code]?.[m] || 0;
              const color = getColor(v);
              return (
                <g key={m}>
                  <rect x={x} y={y} width={cellW} height={cellH} rx="4" fill={color} opacity={0.15 + (v / 100) * 0.6} />
                  <text x={x + cellW / 2} y={y + cellH / 2 + 1} textAnchor="middle" dominantBaseline="central" fill={color} style={{ fontSize: "8px", fontWeight: 700 }}>{v}%</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Languages Tab ───
function LanguagesTab({ languages, onSelect }: { languages: Language[]; onSelect: (l: Language) => void }) {
  return (
    <div className="space-y-3">
      {languages.map(lang => {
        const stCfg = STATUS_CFG[lang.status];
        return (
          <div key={lang.id} onClick={() => onSelect(lang)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "32px" }}>{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{lang.nameLocal}</h4>
                  <span className="text-gray-400" style={{ fontSize: "12px" }}>({lang.name})</span>
                  <span className="font-mono text-gray-300 px-1.5 py-0.5 bg-gray-50 rounded" style={{ fontSize: "9px" }}>{lang.code}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>{lang.courses} khóa học</span>
                  <span>UI: {lang.ui}%</span>
                  <span>Content: {lang.content}%</span>
                  <span>{lang.users.toLocaleString()} users</span>
                  <span>Dịch giả: {lang.translator}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${lang.translationProgress}%`,
                      backgroundColor: lang.translationProgress >= 90 ? "#16a34a" : lang.translationProgress >= 60 ? "#c8a84e" : "#ef4444",
                    }} />
                  </div>
                  <span style={{
                    fontSize: "12px", fontWeight: 700,
                    color: lang.translationProgress >= 90 ? "#16a34a" : lang.translationProgress >= 60 ? "#c8a84e" : "#ef4444",
                  }}>{lang.translationProgress}%</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── UI Keys Tab ───
function UIKeysTab({ keys, search, setSearch }: { keys: TranslationKey[]; search: string; setSearch: (s: string) => void }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const filtered = keys.filter(k => {
    if (search && !k.key.toLowerCase().includes(search.toLowerCase()) && !k.vi.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && k.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm key hoặc bản dịch..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả</option>
          <option value="translated">Đã dịch</option>
          <option value="needs_review">Cần review</option>
          <option value="missing">Thiếu</option>
        </select>
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} keys</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Key</th>
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>🇻🇳 VI</th>
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>🇬🇧 EN</th>
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>🇯🇵 JA</th>
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>🇰🇷 KO</th>
                <th className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>🇨🇳 ZH</th>
                <th className="px-3 py-2 text-center text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => {
                const stColor = k.status === "translated" ? "#16a34a" : k.status === "needs_review" ? "#c8a84e" : "#ef4444";
                const stLabel = k.status === "translated" ? "✓" : k.status === "needs_review" ? "⚠" : "✗";
                return (
                  <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="font-mono text-[#990803]" style={{ fontSize: "10px" }}>{k.key}</span>
                      <span className="text-gray-300 ml-1" style={{ fontSize: "8px" }}>{k.module}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-700" style={{ fontSize: "11px" }}>{k.vi}</td>
                    <td className="px-3 py-2 text-gray-600" style={{ fontSize: "11px" }}>{k.en}</td>
                    <td className="px-3 py-2 text-gray-600" style={{ fontSize: "11px" }}>{k.ja || <span className="text-red-400 italic">—</span>}</td>
                    <td className="px-3 py-2 text-gray-600" style={{ fontSize: "11px" }}>{k.ko || <span className="text-red-400 italic">—</span>}</td>
                    <td className="px-3 py-2 text-gray-600" style={{ fontSize: "11px" }}>{k.zh || <span className="text-red-400 italic">—</span>}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 700, color: stColor, backgroundColor: stColor + "10" }}>{stLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Courses Tab ───
function CoursesTab({ courses }: { courses: CourseTranslation[] }) {
  const langFlags = [
    { code: "vi", flag: "🇻🇳" },
    { code: "en", flag: "🇬🇧" },
    { code: "ja", flag: "🇯🇵" },
    { code: "ko", flag: "🇰🇷" },
    { code: "zh", flag: "🇨🇳" },
  ];

  return (
    <div className="space-y-2">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Tiến độ dịch nội dung khóa học theo ngôn ngữ</p>
      {courses.map(c => {
        const prCfg = PRIORITY_CFG[c.priority];
        const langValues = [c.vi, c.en, c.ja, c.ko, c.zh];
        return (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-[#990803]" />
              <h4 className="text-gray-800 flex-1" style={{ fontSize: "13px", fontWeight: 600 }}>{c.courseTitle}</h4>
              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: prCfg.color, backgroundColor: prCfg.color + "10" }}>
                Ưu tiên: {prCfg.label}
              </span>
              <span className="text-gray-300" style={{ fontSize: "9px" }}>{c.category}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {langFlags.map((lf, i) => {
                const val = langValues[i];
                const color = val >= 90 ? "#16a34a" : val >= 50 ? "#c8a84e" : val > 0 ? "#ef4444" : "#e5e7eb";
                return (
                  <div key={lf.code} className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <span style={{ fontSize: "12px" }}>{lf.flag}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color }}>{val}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Analytics Tab ───
function AnalyticsTab({ languages }: { languages: Language[] }) {
  return (
    <div className="space-y-3">
      {/* Progress comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>So sánh Tiến độ Dịch thuật</h3>
        <svg width="100%" height="140" viewBox="0 0 520 140" preserveAspectRatio="xMidYMid meet">
          {languages.map((lang, i) => {
            const y = 10 + i * 25;
            const barW = (lang.translationProgress / 100) * 300;
            const color = lang.translationProgress >= 90 ? "#16a34a" : lang.translationProgress >= 60 ? "#c8a84e" : "#ef4444";
            return (
              <g key={lang.id}>
                <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "10px" }}>{lang.flag} {lang.code.toUpperCase()}</text>
                <rect x="60" y={y} width={barW} height="18" rx="4" fill={color} opacity="0.7" />
                <text x={65 + barW} y={y + 10} dominantBaseline="central" fill={color} style={{ fontSize: "10px", fontWeight: 700 }}>{lang.translationProgress}%</text>
                {/* Sub-bars for UI vs Content */}
                <rect x="60" y={y + 14} width={(lang.ui / 100) * 300} height="3" rx="1" fill="#2563eb" opacity="0.3" />
                <rect x="60" y={y + 14} width={(lang.content / 100) * 300} height="3" rx="1" fill="#990803" opacity="0.3" />
              </g>
            );
          })}
          <rect x="400" y="10" width="8" height="8" rx="2" fill="#2563eb" opacity="0.3" />
          <text x="412" y="17" fill="#6b7280" style={{ fontSize: "8px" }}>UI</text>
          <rect x="400" y="24" width="8" height="8" rx="2" fill="#990803" opacity="0.3" />
          <text x="412" y="31" fill="#6b7280" style={{ fontSize: "8px" }}>Content</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Users by language */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Người dùng theo Ngôn ngữ</h3>
          <div className="space-y-2">
            {languages.map(lang => {
              const maxU = Math.max(...languages.map(l => l.users));
              return (
                <div key={lang.id} className="flex items-center gap-2">
                  <span style={{ fontSize: "14px" }}>{lang.flag}</span>
                  <span className="w-8 text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>{lang.code.toUpperCase()}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#990803]" style={{ width: `${(lang.users / maxU) * 100}%`, opacity: 0.5 + (lang.users / maxU) * 0.5 }} />
                  </div>
                  <span className="w-12 text-right text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{lang.users.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Translation speed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tốc độ Dịch (keys/tuần)</h3>
          <div className="space-y-2">
            {[
              { lang: "🇬🇧 EN", speed: 85, trend: "+12%" },
              { lang: "🇯🇵 JA", speed: 42, trend: "+8%" },
              { lang: "🇰🇷 KO", speed: 28, trend: "+15%" },
              { lang: "🇨🇳 ZH", speed: 22, trend: "+5%" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span className="w-12 text-gray-600" style={{ fontSize: "11px" }}>{s.lang}</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#c8a84e]" style={{ width: `${(s.speed / 85) * 100}%` }} />
                </div>
                <span className="text-gray-700 w-10 text-right" style={{ fontSize: "11px", fontWeight: 600 }}>{s.speed}</span>
                <span className="text-green-500 w-10 text-right" style={{ fontSize: "9px" }}>{s.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Language Detail Modal ───
function LanguageDetailModal({ lang, onClose }: { lang: Language; onClose: () => void }) {
  const stCfg = STATUS_CFG[lang.status];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontSize: "40px" }}>{lang.flag}</span>
            <div>
              <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{lang.nameLocal}</h3>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>{lang.name} ({lang.code})</p>
              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "UI Translation", value: `${lang.ui}%`, color: lang.ui >= 90 ? "#16a34a" : "#c8a84e" },
              { label: "Content", value: `${lang.content}%`, color: lang.content >= 90 ? "#16a34a" : "#c8a84e" },
              { label: "Khóa học", value: `${lang.courses}`, color: "#2563eb" },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: "Tổng tiến độ", value: lang.translationProgress },
              { label: "UI Elements", value: lang.ui },
              { label: "Nội dung Khóa học", value: lang.content },
            ].map((p, i) => {
              const color = p.value >= 90 ? "#16a34a" : p.value >= 60 ? "#c8a84e" : "#ef4444";
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-500" style={{ fontSize: "11px" }}>{p.label}</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color }}>{p.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 mb-4">
            {[
              { label: "Dịch giả", value: lang.translator },
              { label: "Cập nhật", value: lang.lastUpdated },
              { label: "Người dùng", value: `${lang.users.toLocaleString()} users` },
            ].map((info, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{info.label}</span>
                <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{info.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở trình chỉnh sửa bản dịch...")); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <Edit className="w-4 h-4" /> Chỉnh sửa
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}