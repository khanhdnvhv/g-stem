import { useState, useCallback, useRef, useEffect } from "react";
import {
  WifiOff, Download, Smartphone, HardDrive, RefreshCw,
  CheckCircle, Clock, BookOpen, Video, FileText, Trash2,
  Cloud, CloudOff, ChevronRight, ArrowDown, ArrowUp,
  Play, Pause, MoreVertical, Eye, Star, AlertTriangle,
  Settings, Shield, Database, Wifi, Signal, Battery,
  Monitor, Tablet, Phone, Laptop,
  X, ChevronLeft, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize2, ListOrdered, MessageSquare, Bookmark,
  BookmarkCheck, Lock, Unlock,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";

// ─── Types ───
interface OfflineCourse {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorInitials: string;
  totalLessons: number;
  downloadedLessons: number;
  totalSize: string;
  downloadedSize: string;
  status: "downloaded" | "downloading" | "queued" | "available" | "expired";
  progress: number;
  lastSynced: string;
  downloadDate?: string;
  expiresAt?: string;
  mediaTypes: ("video" | "pdf" | "quiz" | "audio")[];
  rating: number;
  offlineProgress: number;
}

interface SyncLog {
  id: string;
  action: string;
  course: string;
  timestamp: string;
  status: "success" | "failed" | "pending";
  details: string;
  size: string;
}

interface DeviceInfo {
  name: string;
  type: "phone" | "tablet" | "laptop";
  os: string;
  lastActive: string;
  storageUsed: string;
  storageTotal: string;
  syncEnabled: boolean;
  coursesDownloaded: number;
}

// ─── Mock Data ───
const COURSES: OfflineCourse[] = [
  {
    id: "OL01", title: "Kỹ năng Lãnh đạo & Quản trị Cấp trung",
    category: "Quản trị", instructor: "Đỗ Thanh Hương", instructorInitials: "TH",
    totalLessons: 24, downloadedLessons: 24, totalSize: "1.8 GB", downloadedSize: "1.8 GB",
    status: "downloaded", progress: 100, lastSynced: "12/03/2026, 08:30",
    downloadDate: "01/03/2026", expiresAt: "01/04/2026",
    mediaTypes: ["video", "pdf", "quiz"], rating: 4.8, offlineProgress: 67,
  },
  {
    id: "OL02", title: "An toàn Thông tin Doanh nghiệp 2026",
    category: "Compliance", instructor: "Ngô Trung Kiên", instructorInitials: "NK",
    totalLessons: 8, downloadedLessons: 8, totalSize: "450 MB", downloadedSize: "450 MB",
    status: "downloaded", progress: 100, lastSynced: "11/03/2026, 14:00",
    downloadDate: "05/03/2026", expiresAt: "31/03/2026",
    mediaTypes: ["video", "quiz"], rating: 4.2, offlineProgress: 100,
  },
  {
    id: "OL03", title: "Marketing số & Truyền thông",
    category: "Marketing", instructor: "Phạm Anh Tuấn", instructorInitials: "PT",
    totalLessons: 18, downloadedLessons: 12, totalSize: "2.1 GB", downloadedSize: "1.4 GB",
    status: "downloading", progress: 67, lastSynced: "12/03/2026, 09:15",
    mediaTypes: ["video", "pdf", "quiz", "audio"], rating: 4.5, offlineProgress: 35,
  },
  {
    id: "OL04", title: "Phân tích Dữ liệu với Python & Power BI",
    category: "Công nghệ", instructor: "Ngô Trung Kiên", instructorInitials: "NK",
    totalLessons: 32, downloadedLessons: 0, totalSize: "3.2 GB", downloadedSize: "0 MB",
    status: "queued", progress: 0, lastSynced: "—",
    mediaTypes: ["video", "pdf", "quiz"], rating: 4.7, offlineProgress: 0,
  },
  {
    id: "OL05", title: "Tài chính Doanh nghiệp cho Non-Finance",
    category: "Tài chính", instructor: "Trần Thị Hương", instructorInitials: "TH",
    totalLessons: 15, downloadedLessons: 0, totalSize: "1.2 GB", downloadedSize: "0 MB",
    status: "available", progress: 0, lastSynced: "—",
    mediaTypes: ["video", "pdf"], rating: 4.4, offlineProgress: 0,
  },
  {
    id: "OL06", title: "Kỹ năng Đàm phán & Thương lượng",
    category: "Kỹ năng mềm", instructor: "Đỗ Thanh Hương", instructorInitials: "TH",
    totalLessons: 10, downloadedLessons: 10, totalSize: "800 MB", downloadedSize: "800 MB",
    status: "expired", progress: 100, lastSynced: "01/03/2026, 10:00",
    downloadDate: "15/02/2026", expiresAt: "10/03/2026",
    mediaTypes: ["video", "quiz"], rating: 4.9, offlineProgress: 80,
  },
];

const SYNC_LOGS: SyncLog[] = [
  { id: "SL01", action: "Đồng bộ tiến độ", course: "Kỹ năng Lãnh đạo", timestamp: "12/03/2026, 08:30", status: "success", details: "Cập nhật tiến độ 67% → server", size: "2 KB" },
  { id: "SL02", action: "Tải xuống bài", course: "Marketing số", timestamp: "12/03/2026, 09:15", status: "success", details: "Bài 13/18 đã tải xong", size: "120 MB" },
  { id: "SL03", action: "Đồng bộ kết quả quiz", course: "An toàn Thông tin", timestamp: "11/03/2026, 14:00", status: "success", details: "Quiz chương 8: 92/100 điểm", size: "5 KB" },
  { id: "SL04", action: "Tải xuống bài", course: "Marketing số", timestamp: "12/03/2026, 09:10", status: "failed", details: "Lỗi kết nối mạng - thử lại sau", size: "0 MB" },
  { id: "SL05", action: "Xác thực license", course: "Kỹ năng Lãnh đạo", timestamp: "12/03/2026, 08:00", status: "success", details: "License hợp lệ đến 01/04/2026", size: "1 KB" },
  { id: "SL06", action: "Đồng bộ bookmark", course: "Tất cả", timestamp: "12/03/2026, 07:45", status: "pending", details: "Đang chờ kết nối Wi-Fi", size: "—" },
];

const DEVICES: DeviceInfo[] = [
  { name: "iPhone 15 Pro", type: "phone", os: "iOS 19.1", lastActive: "12/03/2026, 09:30", storageUsed: "3.2 GB", storageTotal: "128 GB", syncEnabled: true, coursesDownloaded: 3 },
  { name: "iPad Air M2", type: "tablet", os: "iPadOS 19.1", lastActive: "11/03/2026, 22:00", storageUsed: "5.4 GB", storageTotal: "256 GB", syncEnabled: true, coursesDownloaded: 5 },
  { name: "MacBook Pro 14\"", type: "laptop", os: "macOS 16.2", lastActive: "12/03/2026, 08:00", storageUsed: "8.1 GB", storageTotal: "512 GB", syncEnabled: false, coursesDownloaded: 0 },
];

const STATUS_CONFIG = {
  downloaded: { label: "Đã tải", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  downloading: { label: "Đang tải", color: "#2563eb", bg: "#2563eb10", icon: ArrowDown },
  queued: { label: "Chờ tải", color: "#c8a84e", bg: "#c8a84e10", icon: Clock },
  available: { label: "Có thể tải", color: "#6b7280", bg: "#6b728010", icon: Cloud },
  expired: { label: "Hết hạn", color: "#ef4444", bg: "#ef444410", icon: AlertTriangle },
};

const MEDIA_ICONS: Record<string, { icon: typeof Video; color: string }> = {
  video: { icon: Video, color: "#990803" },
  pdf: { icon: FileText, color: "#2563eb" },
  quiz: { icon: CheckCircle, color: "#16a34a" },
  audio: { icon: Play, color: "#7c3aed" },
};

const DEVICE_ICONS = { phone: Phone, tablet: Tablet, laptop: Laptop };

// ─── Mock Lesson Data per Course ───
interface LessonItem {
  id: string;
  title: string;
  type: "video" | "pdf" | "quiz" | "audio";
  duration: string;
  completed: boolean;
  bookmarked: boolean;
  chapter: string;
}

function generateLessons(course: OfflineCourse): LessonItem[] {
  const CHAPTER_TEMPLATES: Record<string, string[]> = {
    "OL01": [
      "Chương 1: Tư duy Lãnh đạo",
      "Chương 2: Kỹ năng Ra quyết định",
      "Chương 3: Quản trị Đội nhóm",
      "Chương 4: Giao tiếp Chiến lược",
    ],
    "OL02": [
      "Chương 1: Tổng quan ATTT",
      "Chương 2: Phishing & Social Engineering",
      "Chương 3: Bảo vệ Dữ liệu",
      "Chương 4: Incident Response",
    ],
  };
  const defaultChapters = ["Chương 1: Giới thiệu", "Chương 2: Kiến thức Cốt lõi", "Chương 3: Thực hành", "Chương 4: Đánh giá"];
  const chapters = CHAPTER_TEMPLATES[course.id] || defaultChapters;
  const types: LessonItem["type"][] = course.mediaTypes;
  const lessons: LessonItem[] = [];
  const completedCount = Math.round((course.offlineProgress / 100) * course.totalLessons);
  const durations = ["08:30", "12:15", "15:40", "10:20", "18:05", "06:45", "14:30", "11:55", "20:10", "09:35", "16:20", "13:00"];

  for (let i = 0; i < course.totalLessons; i++) {
    const chapterIdx = Math.floor(i / Math.ceil(course.totalLessons / chapters.length));
    lessons.push({
      id: `${course.id}-L${String(i + 1).padStart(2, "0")}`,
      title: `Bài ${i + 1}: ${["Giới thiệu tổng quan", "Khái niệm cơ bản", "Phân tích tình huống", "Case study thực tế", "Bài tập thực hành", "Thảo luận nhóm", "Kiểm tra nhanh", "Tổng kết & Ôn tập", "Kỹ thuật nâng cao", "Ứng dụng thực tiễn", "Workshop tương tác", "Đánh giá cuối chương"][i % 12]}`,
      type: types[i % types.length],
      duration: durations[i % durations.length],
      completed: i < completedCount,
      bookmarked: i === 2 || i === 7,
      chapter: chapters[Math.min(chapterIdx, chapters.length - 1)],
    });
  }
  return lessons;
}

export function OfflineLearning() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"courses" | "sync" | "devices" | "settings">("courses");
  const [courses, setCourses] = useState(COURSES);
  const [isSyncing, setIsSyncing] = useState(false);
  const confirm = useConfirm();

  const downloaded = courses.filter(c => c.status === "downloaded");
  const totalStorageGB = courses.filter(c => c.status === "downloaded" || c.status === "downloading")
    .reduce((s, c) => s + parseFloat(c.downloadedSize.replace(/[^\d.]/g, "")), 0);

  const startSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const startDownload = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: "downloading" as const, progress: 0 } : c));
  };

  const removeDownload = (id: string) => {
    const course = courses.find(c => c.id === id);
    confirm({
      title: "Xóa khóa học offline?",
      message: `Bạn có chắc muốn xóa "${course?.title || "khóa học"}" khỏi bộ nhớ offline? Tiến độ đã đồng bộ sẽ được giữ lại.`,
      confirmLabel: "Xóa",
      variant: "danger",
    }).then(ok => {
      if (ok) {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, status: "available" as const, progress: 0, downloadedLessons: 0, downloadedSize: "0 MB" } : c));
        import("sonner").then(m => m.toast.success("Đã xóa khóa học offline"));
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <WifiOff className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Học Offline</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Tải khóa học về thiết bị, học mọi lúc mọi nơi — tự động đồng bộ khi có mạng
          </p>
        </div>
        <button onClick={startSync} className={`flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer ${isSyncing ? "opacity-60" : ""}`} style={{ fontSize: "12px", fontWeight: 500 }}>
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} /> {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Đã tải", value: `${downloaded.length}`, icon: HardDrive, color: "#990803" },
          { label: "Dung lượng", value: `${totalStorageGB.toFixed(1)} GB`, icon: Database, color: "#2563eb" },
          { label: "Đang tải", value: `${courses.filter(c => c.status === "downloading").length}`, icon: ArrowDown, color: "#c8a84e" },
          { label: "Thiết bị", value: `${DEVICES.filter(d => d.syncEnabled).length}`, icon: Smartphone, color: "#16a34a" },
          { label: "Lần sync", value: "08:30", icon: RefreshCw, color: "#7c3aed" },
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

      {/* Sync Status Banner */}
      <div className="bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100 p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-500" />
          <Signal className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-green-700" style={{ fontSize: "12px", fontWeight: 600 }}>Kết nối Wi-Fi ổn định — Tốc độ: 45 Mbps</p>
          <p className="text-green-500" style={{ fontSize: "10px" }}>Lần đồng bộ cuối: 12/03/2026, 08:30 • Tiếp theo: tự động khi có thay đổi</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Battery className="w-4 h-4 text-green-500" />
          <span className="text-green-600" style={{ fontSize: "11px", fontWeight: 500 }}>78%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "courses" as const, label: "Khóa học Offline", count: courses.length },
          { id: "sync" as const, label: "Lịch sử Đồng bộ", count: SYNC_LOGS.length },
          { id: "devices" as const, label: "Thiết bị", count: DEVICES.length },
          { id: "settings" as const, label: "Cài đặt" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            {t.label}
            {"count" in t && <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-400" style={{ fontSize: "10px" }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "courses" && (
        <OfflineCoursesTab courses={courses} onDownload={startDownload} onRemove={removeDownload} />
      )}
      {tab === "sync" && <SyncHistoryTab />}
      {tab === "devices" && <DevicesTab />}
      {tab === "settings" && <OfflineSettingsTab />}
    </div>
  );
}

// ─── Offline Courses Tab ───
function OfflineCoursesTab({ courses, onDownload, onRemove }: {
  courses: OfflineCourse[]; onDownload: (id: string) => void; onRemove: (id: string) => void;
}) {
  const [playingCourse, setPlayingCourse] = useState<OfflineCourse | null>(null);

  // Storage usage chart
  const categories = [
    { name: "Video", size: 3.8, color: "#990803" },
    { name: "PDF", size: 0.6, color: "#2563eb" },
    { name: "Quiz", size: 0.2, color: "#16a34a" },
    { name: "Audio", size: 0.4, color: "#7c3aed" },
  ];
  const totalGB = categories.reduce((s, c) => s + c.size, 0);

  return (
    <div className="space-y-3">
      {/* Storage Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>Dung lượng Offline</h3>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>{totalGB.toFixed(1)} GB / 10 GB giới hạn</span>
        </div>
        {/* Stacked bar */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          {categories.map((cat, i) => (
            <div key={i} className="h-full" style={{ width: `${(cat.size / 10) * 100}%`, backgroundColor: cat.color }} title={`${cat.name}: ${cat.size} GB`} />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2">
          {categories.map((cat, i) => (
            <span key={i} className="flex items-center gap-1 text-gray-400" style={{ fontSize: "10px" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}: {cat.size} GB
            </span>
          ))}
          <span className="text-gray-300 ml-auto" style={{ fontSize: "10px" }}>Còn trống: {(10 - totalGB).toFixed(1)} GB</span>
        </div>
      </div>

      {/* Course List */}
      <div className="space-y-2">
        {courses.map(course => {
          const stCfg = STATUS_CONFIG[course.status];
          const StIcon = stCfg.icon;
          return (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stCfg.bg }}>
                  <StIcon className="w-5 h-5" style={{ color: stCfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                    <span className="text-gray-300" style={{ fontSize: "9px" }}>{course.category}</span>
                    <div className="flex items-center gap-0.5">
                      {course.mediaTypes.map(mt => {
                        const mc = MEDIA_ICONS[mt];
                        const MI = mc.icon;
                        return <MI key={mt} className="w-2.5 h-2.5" style={{ color: mc.color }} />;
                      })}
                    </div>
                    {course.expiresAt && course.status !== "expired" && (
                      <span className="text-gray-400" style={{ fontSize: "9px" }}>⏰ Hết hạn: {course.expiresAt}</span>
                    )}
                  </div>
                  <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{course.title}</h4>

                  {/* Progress bars */}
                  <div className="flex items-center gap-4 mt-2">
                    {/* Download progress */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-gray-400" style={{ fontSize: "9px" }}>Tải xuống: {course.downloadedLessons}/{course.totalLessons} bài</span>
                        <span className="text-gray-400" style={{ fontSize: "9px" }}>{course.downloadedSize}/{course.totalSize}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${course.progress}%`, backgroundColor: stCfg.color }} />
                      </div>
                    </div>
                    {/* Learning progress */}
                    {course.status === "downloaded" && (
                      <div className="w-28">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-400" style={{ fontSize: "9px" }}>Đã học</span>
                          <span className="text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>{course.offlineProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#c8a84e]" style={{ width: `${course.offlineProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-gray-400" style={{ fontSize: "10px" }}>
                    <span className="flex items-center gap-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "5px", fontWeight: 700 }}>{course.instructorInitials}</div>
                      {course.instructor}
                    </span>
                    <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#c8a84e] fill-[#c8a84e]" /> {course.rating}</span>
                    {course.lastSynced !== "—" && <span>Sync: {course.lastSynced}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {course.status === "downloaded" && (
                    <>
                      <button onClick={() => setPlayingCourse(course)} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <Play className="w-3 h-3" /> Học offline
                      </button>
                      <button onClick={() => onRemove(course.id)} className="text-gray-300 hover:text-red-400 cursor-pointer" style={{ fontSize: "10px" }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {course.status === "downloading" && (
                    <button onClick={() => { import("sonner").then(m => m.toast.info("Đã tạm dừng tải xuống")); }} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}>
                      <Pause className="w-3 h-3" /> Tạm dừng
                    </button>
                  )}
                  {course.status === "queued" && (
                    <span className="text-[#c8a84e]" style={{ fontSize: "10px" }}>Đợi Wi-Fi...</span>
                  )}
                  {course.status === "available" && (
                    <button onClick={() => onDownload(course.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <Download className="w-3 h-3" /> Tải xuống
                    </button>
                  )}
                  {course.status === "expired" && (
                    <button onClick={() => onDownload(course.id)} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <RefreshCw className="w-3 h-3" /> Gia hạn
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offline Player Overlay */}
      {playingCourse && (
        <OfflinePlayer course={playingCourse} onClose={() => setPlayingCourse(null)} />
      )}
    </div>
  );
}

// ─── Offline Player ───
function OfflinePlayer({ course, onClose }: { course: OfflineCourse; onClose: () => void }) {
  const [lessons] = useState(() => generateLessons(course));
  const firstIncomplete = lessons.findIndex(l => !l.completed);
  const [activeIdx, setActiveIdx] = useState(firstIncomplete >= 0 ? firstIncomplete : 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [lessonState, setLessonState] = useState<LessonItem[]>(lessons);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<{ lessonId: string; text: string; time: number }[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeLesson = lessonState[activeIdx];
  const totalDurationSec = (() => {
    const [m, s] = activeLesson.duration.split(":").map(Number);
    return m * 60 + s;
  })();
  const completedCount = lessonState.filter(l => l.completed).length;
  const overallProgress = Math.round((completedCount / lessonState.length) * 100);

  // Group lessons by chapter
  const chapters = lessonState.reduce<{ chapter: string; lessons: (LessonItem & { idx: number })[] }[]>((acc, l, i) => {
    const last = acc[acc.length - 1];
    if (last && last.chapter === l.chapter) {
      last.lessons.push({ ...l, idx: i });
    } else {
      acc.push({ chapter: l.chapter, lessons: [{ ...l, idx: i }] });
    }
    return acc;
  }, []);

  // Playback timer
  useEffect(() => {
    if (isPlaying && (activeLesson.type === "video" || activeLesson.type === "audio")) {
      timerRef.current = setInterval(() => {
        setPlaybackTime(prev => {
          const next = prev + playbackSpeed;
          if (next >= totalDurationSec) {
            setIsPlaying(false);
            setLessonState(ls => ls.map((l, i) => i === activeIdx ? { ...l, completed: true } : l));
            import("sonner").then(m => m.toast.success(`Hoàn thành: ${activeLesson.title}`));
            return totalDurationSec;
          }
          return next;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, playbackSpeed, totalDurationSec, activeIdx, activeLesson.title, activeLesson.type]);

  useEffect(() => { setPlaybackTime(0); setIsPlaying(false); }, [activeIdx]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  const goToLesson = (idx: number) => { if (idx >= 0 && idx < lessonState.length) setActiveIdx(idx); };
  const toggleBookmark = (idx: number) => { setLessonState(prev => prev.map((l, i) => i === idx ? { ...l, bookmarked: !l.bookmarked } : l)); };
  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [...prev, { lessonId: activeLesson.id, text: noteText.trim(), time: playbackTime }]);
    setNoteText("");
    import("sonner").then(m => m.toast.success("Đã lưu ghi chú"));
  };

  const TYPE_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
    video: { bg: "#990803", fg: "#fff", label: "Video" },
    pdf: { bg: "#2563eb", fg: "#fff", label: "PDF" },
    quiz: { bg: "#16a34a", fg: "#fff", label: "Quiz" },
    audio: { bg: "#7c3aed", fg: "#fff", label: "Audio" },
  };
  const typeCfg = TYPE_COLORS[activeLesson.type];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: "oflFadeInUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[#990803]/5 to-transparent shrink-0">
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 text-[#990803]" />
              <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: "9px", fontWeight: 600, backgroundColor: typeCfg.bg }}>{typeCfg.label}</span>
              <h2 className="text-gray-800 truncate" style={{ fontSize: "15px", fontWeight: 700 }}>{course.title}</h2>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{course.instructor} · {course.category}</span>
              <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600 }}>{overallProgress}% hoàn thành</span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#c8a84e] transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg cursor-pointer transition-colors ${sidebarOpen ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`} title="Danh sách bài">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button onClick={() => setShowNotes(!showNotes)} className={`p-2 rounded-lg cursor-pointer transition-colors ${showNotes ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-gray-100 text-gray-400"}`} title="Ghi chú">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Video / Content Area */}
            <div className="flex-1 bg-gray-900 relative flex items-center justify-center min-h-[300px]">
              {activeLesson.type === "video" && (
                <>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative">
                      {isPlaying && (
                        <div className="absolute inset-0 -m-5 flex items-center justify-center">
                          <div className="w-full h-full rounded-full border-2 border-[#c8a84e]/30 animate-ping" />
                        </div>
                      )}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                        style={{ background: isPlaying ? "rgba(200,168,78,0.9)" : "rgba(153,8,3,0.9)" }}
                      >
                        {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                      </button>
                    </div>
                    <p className="text-white/80 mt-4" style={{ fontSize: "14px", fontWeight: 500 }}>{activeLesson.title}</p>
                    <p className="text-white/40 mt-1" style={{ fontSize: "11px" }}>Chế độ offline · Đã tải về thiết bị</p>
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 mt-5 h-8">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="w-1 rounded-full bg-[#c8a84e]/60" style={{ animation: `oflWave 0.8s ease-in-out ${i * 0.05}s infinite alternate` }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-lg backdrop-blur-sm">
                    <WifiOff className="w-3 h-3 text-[#c8a84e]" />
                    <span className="text-white/80" style={{ fontSize: "10px", fontWeight: 500 }}>OFFLINE</span>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    {[0.5, 1, 1.25, 1.5, 2].map(spd => (
                      <button key={spd} onClick={() => setPlaybackSpeed(spd)} className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${playbackSpeed === spd ? "bg-[#c8a84e] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`} style={{ fontSize: "10px", fontWeight: 600 }}>{spd}x</button>
                    ))}
                  </div>
                </>
              )}

              {activeLesson.type === "pdf" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <FileText className="w-16 h-16 text-blue-300 mb-3" />
                  <p className="text-gray-600" style={{ fontSize: "15px", fontWeight: 600 }}>{activeLesson.title}</p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Tài liệu PDF · Đã tải offline</p>
                  <button
                    onClick={() => { setIsPlaying(true); setTimeout(() => { setIsPlaying(false); setLessonState(prev => prev.map((l, i) => i === activeIdx ? { ...l, completed: true } : l)); import("sonner").then(m => m.toast.success("Đã đọc xong tài liệu")); }, 2000); }}
                    className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 flex items-center gap-2"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    <Eye className="w-4 h-4" /> {isPlaying ? "Đang mở..." : "Mở tài liệu"}
                  </button>
                </div>
              )}

              {activeLesson.type === "quiz" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
                  <CheckCircle className="w-16 h-16 text-green-300 mb-3" />
                  <p className="text-gray-600" style={{ fontSize: "15px", fontWeight: 600 }}>{activeLesson.title}</p>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Kiểm tra nhanh · Có thể làm offline</p>
                  <button
                    onClick={() => { setIsPlaying(true); setTimeout(() => { setIsPlaying(false); setLessonState(prev => prev.map((l, i) => i === activeIdx ? { ...l, completed: true } : l)); import("sonner").then(m => m.toast.success("Quiz hoàn thành! Kết quả sẽ đồng bộ khi có mạng")); }, 3000); }}
                    className="mt-4 px-5 py-2.5 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 flex items-center gap-2"
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    <Play className="w-4 h-4" /> {isPlaying ? "Đang làm bài..." : "Bắt đầu Quiz"}
                  </button>
                </div>
              )}

              {activeLesson.type === "audio" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 to-gray-900">
                  <div className="relative">
                    {isPlaying && (
                      <div className="absolute inset-0 -m-5 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border-2 border-purple-400/30 animate-ping" />
                      </div>
                    )}
                    <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                      {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                    </button>
                  </div>
                  <p className="text-white/80 mt-4" style={{ fontSize: "14px", fontWeight: 500 }}>{activeLesson.title}</p>
                  <p className="text-white/40 mt-1" style={{ fontSize: "11px" }}>Audio · Nghe offline</p>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 mt-5 h-8">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="w-0.5 rounded-full bg-purple-400/60" style={{ animation: `oflWave 0.6s ease-in-out ${i * 0.03}s infinite alternate` }} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="px-5 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 shrink-0" style={{ fontSize: "10px", fontFamily: "monospace" }}>{formatTime(playbackTime)}</span>
                <div
                  className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden cursor-pointer group relative"
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    setPlaybackTime(pct * totalDurationSec);
                  }}
                >
                  <div className="h-full rounded-full bg-[#990803] transition-all relative" style={{ width: `${(playbackTime / totalDurationSec) * 100}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#990803] rounded-full border-2 border-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {notes.filter(n => n.lessonId === activeLesson.id).map((n, i) => (
                    <div key={i} className="absolute top-0 w-1 h-full bg-[#c8a84e]" style={{ left: `${(n.time / totalDurationSec) * 100}%` }} title={n.text} />
                  ))}
                </div>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "10px", fontFamily: "monospace" }}>{activeLesson.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => goToLesson(activeIdx - 1)} disabled={activeIdx === 0} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-default transition-colors"><SkipBack className="w-4 h-4 text-gray-500" /></button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-2.5 bg-[#990803] hover:bg-[#7a0602] rounded-xl cursor-pointer transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                  </button>
                  <button onClick={() => goToLesson(activeIdx + 1)} disabled={activeIdx >= lessonState.length - 1} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-default transition-colors"><SkipForward className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>Bài {activeIdx + 1}/{lessonState.length}</span>
                  <button onClick={() => toggleBookmark(activeIdx)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                    {activeLesson.bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#c8a84e]" /> : <Bookmark className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => setMuted(!muted)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                    {muted ? <VolumeX className="w-4 h-4 text-gray-300" /> : <Volume2 className="w-4 h-4 text-gray-400" />}
                  </button>
                  {activeLesson.completed && (
                    <span className="flex items-center gap-1 text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}><CheckCircle className="w-3 h-3" /> Hoàn thành</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes panel */}
            {showNotes && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#990803]" />
                  <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>Ghi chú bài học</span>
                  <span className="text-gray-300" style={{ fontSize: "10px" }}>({notes.filter(n => n.lessonId === activeLesson.id).length})</span>
                </div>
                <div className="flex gap-2">
                  <input value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder={`Ghi chú tại ${formatTime(playbackTime)}...`} className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
                  <button onClick={addNote} className="px-3 py-2 bg-[#990803] text-white rounded-lg cursor-pointer hover:bg-[#7a0602]" style={{ fontSize: "11px", fontWeight: 600 }}>Lưu</button>
                </div>
                {notes.filter(n => n.lessonId === activeLesson.id).length > 0 && (
                  <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                    {notes.filter(n => n.lessonId === activeLesson.id).map((n, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                        <button onClick={() => setPlaybackTime(n.time)} className="text-[#990803] shrink-0 cursor-pointer hover:underline" style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600 }}>{formatTime(n.time)}</button>
                        <span className="text-gray-600" style={{ fontSize: "11px" }}>{n.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Lesson List */}
          {sidebarOpen && (
            <div className="w-80 border-l border-gray-100 bg-gray-50/80 flex flex-col shrink-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Nội dung khóa học</h3>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>{completedCount}/{lessonState.length} bài hoàn thành</p>
                </div>
                <div className="w-10 h-10 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#c8a84e" strokeWidth="3" strokeDasharray={`${overallProgress * 0.94} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 700 }}>{overallProgress}%</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chapters.map((ch, ci) => (
                  <div key={ci}>
                    <div className="px-4 py-2 sticky top-0 bg-gray-100/90 backdrop-blur-sm z-10">
                      <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{ch.chapter}</span>
                      <span className="text-gray-300 ml-1.5" style={{ fontSize: "9px" }}>({ch.lessons.filter(l => l.completed).length}/{ch.lessons.length})</span>
                    </div>
                    {ch.lessons.map(lesson => {
                      const isActive = lesson.idx === activeIdx;
                      const LIcon = MEDIA_ICONS[lesson.type]?.icon || Video;
                      const lColor = MEDIA_ICONS[lesson.type]?.color || "#6b7280";
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => goToLesson(lesson.idx)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-2.5 cursor-pointer transition-all border-l-2 ${isActive ? "bg-[#990803]/5 border-[#990803]" : "border-transparent hover:bg-white"}`}
                        >
                          <div className="relative shrink-0">
                            {lesson.completed ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-green-500" /></div>
                            ) : isActive && isPlaying ? (
                              <div className="w-6 h-6 rounded-full bg-[#990803] flex items-center justify-center">
                                <div className="flex items-end gap-px h-2.5">
                                  {[0, 1, 2].map(b => (<div key={b} className="w-0.5 bg-white rounded-full" style={{ height: "6px", animation: `oflWave 0.5s ease-in-out ${b * 0.15}s infinite alternate` }} />))}
                                </div>
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: lColor + "15" }}>
                                <LIcon className="w-3 h-3" style={{ color: lColor }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate ${isActive ? "text-[#990803]" : lesson.completed ? "text-gray-400" : "text-gray-600"}`} style={{ fontSize: "11px", fontWeight: isActive ? 600 : 400 }}>{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-gray-300" style={{ fontSize: "9px" }}>{lesson.duration}</span>
                              <span className="px-1 py-0 rounded" style={{ fontSize: "8px", fontWeight: 600, color: lColor, backgroundColor: lColor + "10" }}>{lesson.type.toUpperCase()}</span>
                            </div>
                          </div>
                          {lesson.bookmarked && <Bookmark className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes oflFadeInUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes oflWave { 0% { height: 4px; } 100% { height: 20px; } }
        `}</style>
      </div>
    </div>
  );
}

// ─── Sync History Tab ───
function SyncHistoryTab() {
  const statusCfg = {
    success: { label: "Thành công", color: "#16a34a", bg: "#16a34a10" },
    failed: { label: "Thất bại", color: "#ef4444", bg: "#ef444410" },
    pending: { label: "Đang chờ", color: "#c8a84e", bg: "#c8a84e10" },
  };

  return (
    <div className="space-y-2">
      {/* Sync summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tổng hợp Đồng bộ</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-green-600" style={{ fontSize: "20px", fontWeight: 700 }}>24</p>
            <p className="text-green-500" style={{ fontSize: "10px" }}>Thành công</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-red-500" style={{ fontSize: "20px", fontWeight: 700 }}>2</p>
            <p className="text-red-400" style={{ fontSize: "10px" }}>Thất bại</p>
          </div>
          <div className="text-center p-2 bg-[#c8a84e]/10 rounded-lg">
            <p className="text-[#c8a84e]" style={{ fontSize: "20px", fontWeight: 700 }}>1</p>
            <p className="text-[#c8a84e]/70" style={{ fontSize: "10px" }}>Đang chờ</p>
          </div>
        </div>
      </div>

      {/* Log list */}
      {SYNC_LOGS.map(log => {
        const sCfg = statusCfg[log.status];
        return (
          <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: sCfg.bg }}>
              {log.status === "success" ? <CheckCircle className="w-4 h-4" style={{ color: sCfg.color }} /> :
               log.status === "failed" ? <AlertTriangle className="w-4 h-4" style={{ color: sCfg.color }} /> :
               <Clock className="w-4 h-4" style={{ color: sCfg.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{log.action}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sCfg.color, backgroundColor: sCfg.bg }}>{sCfg.label}</span>
              </div>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{log.course} — {log.details}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{log.timestamp}</p>
              <p className="text-gray-300" style={{ fontSize: "9px" }}>{log.size}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Devices Tab ───
function DevicesTab() {
  return (
    <div className="space-y-2">
      {DEVICES.map((device, i) => {
        const DevIcon = DEVICE_ICONS[device.type];
        const storageUsed = parseFloat(device.storageUsed);
        const storageTotal = parseFloat(device.storageTotal);
        const storagePct = (storageUsed / storageTotal) * 100;
        return (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                <DevIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>{device.name}</h4>
                  {device.syncEnabled ? (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>Sync ON</span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>Sync OFF</span>
                  )}
                </div>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{device.os} • Active: {device.lastActive} • {device.coursesDownloaded} khóa đã tải</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-gray-400 shrink-0" style={{ fontSize: "10px" }}>{device.storageUsed}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${storagePct}%`, backgroundColor: storagePct > 80 ? "#ef4444" : storagePct > 50 ? "#c8a84e" : "#16a34a" }} />
                  </div>
                  <span className="text-gray-300 shrink-0" style={{ fontSize: "10px" }}>{device.storageTotal}</span>
                </div>
              </div>
              <button onClick={() => { import("sonner").then(m => m.toast.info("Cài đặt đồng bộ...")); }} className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <Settings className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Settings Tab ───
function OfflineSettingsTab() {
  const confirm = useConfirm();
  const settings = [
    { label: "Tự động tải khi có Wi-Fi", desc: "Tự động tải khóa học mới trong lộ trình khi kết nối Wi-Fi", enabled: true },
    { label: "Chỉ tải qua Wi-Fi", desc: "Không sử dụng dữ liệu di động để tải nội dung", enabled: true },
    { label: "Chất lượng video", desc: "720p (tiết kiệm) | 1080p (chuẩn) | 1440p (cao)", enabled: false },
    { label: "Tự động đồng bộ tiến độ", desc: "Đồng bộ tiến độ học offline lên server khi có mạng", enabled: true },
    { label: "Thông báo hết hạn", desc: "Nhắc nhở 3 ngày trước khi nội dung offline hết hạn", enabled: true },
    { label: "Xóa cache cũ tự động", desc: "Tự động xóa nội dung đã hoàn thành sau 30 ngày", enabled: false },
    { label: "Mã hóa nội dung offline", desc: "Mã hóa AES-256 cho tất cả nội dung đào tạo đã tải", enabled: true },
  ];

  return (
    <div className="space-y-2">
      {settings.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{s.label}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{s.desc}</p>
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.success(`Đã ${s.enabled ? "tắt" : "bật"} ${s.label}`)); }} className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${s.enabled ? "bg-[#990803]" : "bg-gray-200"}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${s.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Giới hạn Dung lượng Offline</h4>
        <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>Đặt giới hạn dung lượng tối đa cho nội dung offline trên mỗi thiết bị.</p>
        <div className="flex items-center gap-3 mt-3">
          {[5, 10, 20, 50].map(gb => (
            <button key={gb} onClick={() => { import("sonner").then(m => m.toast.success(`Đã đặt giới hạn ${gb} GB`)); }} className={`px-4 py-2 rounded-lg cursor-pointer border ${gb === 10 ? "border-[#990803] bg-[#990803]/5 text-[#990803]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`} style={{ fontSize: "13px", fontWeight: gb === 10 ? 600 : 400 }}>
              {gb} GB
            </button>
          ))}
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở cài đặt dung lượng tùy chỉnh...")); }} className="px-4 py-2 rounded-lg cursor-pointer border border-gray-200 text-gray-500 hover:bg-gray-50" style={{ fontSize: "13px" }}>
            Tùy chỉnh
          </button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl border border-red-100 p-4">
        <h4 className="text-red-600" style={{ fontSize: "13px", fontWeight: 600 }}>Xóa tất cả Dữ liệu Offline</h4>
        <p className="text-red-400 mt-1" style={{ fontSize: "11px" }}>Xóa toàn bộ khóa học, tiến độ chưa đồng bộ và cache. Hành động này không thể hoàn tác.</p>
        <button onClick={async () => {
          const ok = await confirm({
            title: "Xóa tất cả dữ liệu offline?",
            message: "Toàn bộ khóa học đã tải, tiến độ chưa đồng bộ và cache sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.",
            confirmLabel: "Xóa tất cả",
            variant: "danger",
            requireTyping: "XOA TAT CA",
          });
          if (ok) import("sonner").then(m => m.toast.error("Đã xóa tất cả dữ liệu offline (5 GB)!"));
        }} className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
          <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả ({5} GB)
        </button>
      </div>
    </div>
  );
}