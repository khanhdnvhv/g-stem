import React, { useState, useEffect, useRef, useCallback } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import {
  Brain, Sparkles, Timer, Target, TrendingUp, Trophy,
  Clock, Calendar, Flame, Award, Star, ChevronDown, ChevronUp,
  Play, Pause, RotateCcw, X, Copy, Plus, Trash2, Shuffle,
  ChevronLeft, ChevronRight, FileText,
  Keyboard, Eye, CheckCircle2, MessageSquare, Download,
  Layers, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

/* ================================================================ */
/*  1. KEYBOARD SHORTCUTS OVERLAY                                    */
/* ================================================================ */

interface ShortcutsOverlayProps {
  show: boolean;
  onClose: () => void;
}

export function ShortcutsOverlay({ show, onClose }: ShortcutsOverlayProps) {
  if (!show) return null;

  const shortcuts = [
    { category: "Phát lại", items: [
      { keys: ["Space"], desc: "Phát / Tạm dừng" },
      { keys: ["←"], desc: "Tua lùi 10 giây" },
      { keys: ["→"], desc: "Tua tới 10 giây" },
      { keys: ["J"], desc: "Tua lùi 10 giây" },
      { keys: ["L"], desc: "Tua tới 10 giây" },
      { keys: ["K"], desc: "Phát / Tạm dừng" },
      { keys: ["0-9"], desc: "Nhảy tới 0%-90%" },
    ]},
    { category: "Điều khiển", items: [
      { keys: ["↑"], desc: "Tăng âm lượng" },
      { keys: ["↓"], desc: "Giảm âm lượng" },
      { keys: ["M"], desc: "Tắt/Bật tiếng" },
      { keys: ["<"], desc: "Giảm tốc độ" },
      { keys: [">"], desc: "Tăng tốc độ" },
      { keys: ["C"], desc: "Phụ đề" },
    ]},
    { category: "Giao diện", items: [
      { keys: ["F"], desc: "Toàn màn hình" },
      { keys: ["T"], desc: "Theater mode" },
      { keys: ["N"], desc: "Mở ghi chú" },
      { keys: ["B"], desc: "Thêm bookmark" },
      { keys: ["?"], desc: "Phím tắt" },
      { keys: ["Esc"], desc: "Đóng popup" },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#990803]/5 to-transparent">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#990803]" />
            <h3 style={{ fontSize: "16px", fontWeight: 600 }} className="text-gray-800">Phím tắt</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-3 gap-6">
          {shortcuts.map(cat => (
            <div key={cat.category}>
              <p className="text-[#990803] mb-3" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat.category}</p>
              <div className="space-y-2">
                {cat.items.map(item => (
                  <div key={item.keys.join('-')} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {item.keys.map(k => (
                        <kbd key={k} className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-700 min-w-[24px] text-center" style={{ fontSize: "10px", fontWeight: 600 }}>{k}</kbd>
                      ))}
                    </div>
                    <span className="text-gray-500 text-right" style={{ fontSize: "11px" }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-gray-400" style={{ fontSize: "11px" }}>Nhấn <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 mx-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>?</kbd> bất kỳ lúc nào để mở bảng phím tắt</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  2. SMART RESUME BANNER                                           */
/* ================================================================ */

interface SmartResumeBannerProps {
  lessonTitle: string;
  savedPosition: string; // e.g. "15:30"
  savedPct: number;
  onResume: () => void;
  onStartOver: () => void;
  onDismiss: () => void;
}

export function SmartResumeBanner({ lessonTitle, savedPosition, savedPct, onResume, onStartOver, onDismiss }: SmartResumeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#990803]/10 via-[#990803]/5 to-transparent rounded-xl border border-[#990803]/15 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center shrink-0">
        <RotateCcw className="w-5 h-5 text-[#990803]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Chào mừng trở lại!</p>
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Bạn đang ở <span className="text-[#990803]" style={{ fontWeight: 600 }}>{savedPosition}</span> ({savedPct}%) — {lessonTitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onStartOver} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Học lại</button>
        <button onClick={onResume} className="px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
          <Play className="w-3.5 h-3.5" /> Tiếp tục
        </button>
        <button onClick={onDismiss} className="p-1 text-gray-300 hover:text-gray-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  3. FOCUS TIMER (Pomodoro)                                        */
/* ================================================================ */

interface FocusTimerProps {
  show: boolean;
  onClose: () => void;
}

export function FocusTimer({ show, onClose }: FocusTimerProps) {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRunning(false);
          if (mode === "focus") {
            setSessions(s => s + 1);
            setMode("break");
            toast.success("Nghỉ giải lao! Bạn đã hoàn thành 1 phiên tập trung 🎉");
            return breakDuration * 60;
          } else {
            setMode("focus");
            toast.info("Sẵn sàng cho phiên tập trung tiếp theo!");
            return focusDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running, mode, focusDuration, breakDuration]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const pct = mode === "focus"
    ? ((focusDuration * 60 - timeLeft) / (focusDuration * 60)) * 100
    : ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100;

  const reset = () => {
    setRunning(false);
    setMode("focus");
    setTimeLeft(focusDuration * 60);
  };

  if (!show) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[#990803]" />
          <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Focus Timer</span>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-0.5 rounded-lg">
        <button onClick={() => { if (!running) { setMode("focus"); setTimeLeft(focusDuration * 60); } }} className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${mode === "focus" ? "bg-[#990803] text-white shadow-sm" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>Tập trung</button>
        <button onClick={() => { if (!running) { setMode("break"); setTimeLeft(breakDuration * 60); } }} className={`flex-1 py-1.5 rounded-md cursor-pointer transition-all ${mode === "break" ? "bg-green-600 text-white shadow-sm" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>Nghỉ giải lao</button>
      </div>

      {/* Timer circle */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={mode === "focus" ? "#990803" : "#16a34a"} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 2.764} 276.4`} className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-gray-800" style={{ fontSize: "28px", fontWeight: 700, fontFamily: "monospace" }}>{formatTime(timeLeft)}</span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>{mode === "focus" ? "Tập trung" : "Nghỉ"}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <button onClick={reset} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => setRunning(!running)} className={`px-6 py-2 rounded-lg cursor-pointer text-white ${mode === "focus" ? "bg-[#990803] hover:bg-[#990803]/90" : "bg-green-600 hover:bg-green-700"}`} style={{ fontSize: "13px", fontWeight: 500 }}>
          {running ? <Pause className="w-4 h-4 inline" /> : <Play className="w-4 h-4 inline" />}
          <span className="ml-1.5">{running ? "Dừng" : "Bắt đầu"}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-gray-600" style={{ fontSize: "11px" }}>{sessions} phiên hôm nay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-gray-600" style={{ fontSize: "11px" }}>{sessions * focusDuration} phút</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  4. LEARNING STATS WIDGET                                         */
/* ================================================================ */

export function LearningStatsWidget() {
  const stats = {
    todayMinutes: 47,
    weekMinutes: 215,
    streak: 5,
    completedThisWeek: 4,
    totalCompleted: 23,
    avgScore: 85,
  };

  const weekData = [35, 42, 28, 55, 47, 0, 0]; // Mon-Sun
  const maxWeek = Math.max(...weekData, 1);
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#990803]" />
          <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Thống kê học tập</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 rounded-full">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-orange-600" style={{ fontSize: "10px", fontWeight: 700 }}>{stats.streak} ngày liên tục</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Hôm nay", value: `${stats.todayMinutes}p`, color: "#990803", icon: Clock },
          { label: "Tuần này", value: `${Math.round(stats.weekMinutes / 60)}h ${stats.weekMinutes % 60}p`, color: "#2563eb", icon: Calendar },
          { label: "Điểm TB", value: `${stats.avgScore}%`, color: "#16a34a", icon: Target },
        ].map(s => (
          <div key={s.label} className="p-2 bg-gray-50 rounded-lg text-center">
            <s.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: s.color }} />
            <p style={{ fontSize: "14px", fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div>
        <p className="text-gray-500 mb-2" style={{ fontSize: "10px", fontWeight: 500 }}>Thời gian học trong tuần (phút)</p>
        <div className="flex items-end gap-1 h-12">
          {weekData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t" style={{
                height: `${Math.max(2, (val / maxWeek) * 40)}px`,
                backgroundColor: i < 5 ? (val > 0 ? "#990803" : "#e5e7eb") : "#e5e7eb",
                opacity: val > 0 ? 1 : 0.3,
              }} />
              <span className="text-gray-400" style={{ fontSize: "8px" }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements preview */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <Award className="w-3.5 h-3.5 text-[#c8a84e]" />
        <span className="text-gray-500" style={{ fontSize: "11px" }}>Hoàn thành {stats.completedThisWeek} bài tuần này</span>
        <div className="ml-auto flex -space-x-1">
          {["🎯", "📚", "🔥", "⭐"].map((e, i) => (
            <span key={i} className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center" style={{ fontSize: "10px" }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  5. AI SUMMARY PANEL                                              */
/* ================================================================ */

interface AISummaryProps {
  lessonTitle: string;
  lessonType: string;
}

export function AISummaryPanel({ lessonTitle, lessonType }: AISummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "keypoints" | "quiz">("summary");

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
      setExpanded(true);
    }, 2000);
  };

  const summary = `Bài học phân tích case study thực tế về quy trình ra quyết định chiến lược tại ABBank — một thành viên trong hệ sinh thái Geleximco. Nội dung bao gồm: (1) Bối cảnh thị trường tài chính 2023-2025, (2) Quy trình ra quyết định 6 bước được áp dụng tại ABBank, (3) Kết quả thực tế sau khi triển khai mô hình, và (4) Bài học rút ra cho các đơn vị khác trong Tập đoàn.`;

  const keypoints = [
    "Quy trình ra quyết định 6 bước: Nhận diện → Thu thập → Phân tích → Lựa chọn → Thực hiện → Đánh giá",
    "ABBank giảm tỷ lệ nợ xấu (NPL) từ 4.2% xuống 1.9% sau 18 tháng tái cấu trúc",
    "Nguyên tắc vàng: Dữ liệu — Đồng thuận — Hành động",
    "SWOT có thể áp dụng ở mọi cấp độ — từ tập đoàn đến chi nhánh vùng",
    "Mô hình lãnh đạo 5 cấp độ John Maxwell ứng dụng tại Geleximco",
  ];

  const quizSuggestions = [
    { q: "ABBank thuộc hệ sinh thái nào?", a: "Tập đoàn Geleximco" },
    { q: "Tỷ lệ NPL giảm bao nhiêu sau tái cấu trúc?", a: "Từ 4.2% xuống 1.9%" },
    { q: "Nguyên tắc vàng gồm mấy bước?", a: "3 bước: Dữ liệu — Đồng thuận — Hành động" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => generated ? setExpanded(!expanded) : handleGenerate()}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>AI Tóm tắt thông minh</span>
            {!generated && <span className="text-gray-400 ml-2" style={{ fontSize: "10px" }}>Nhấn để tạo</span>}
          </div>
        </div>
        {loading ? (
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        ) : generated ? (
          expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <Sparkles className="w-4 h-4 text-purple-500" />
        )}
      </div>

      {generated && expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-100">
            {([["summary", "Tóm tắt", FileText], ["keypoints", "Ý chính", Target], ["quiz", "Câu hỏi ôn", Brain]] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 cursor-pointer ${activeTab === key ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/50" : "text-gray-400 hover:text-gray-600"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === "summary" && (
              <div>
                <p className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.8 }}>{summary}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => { copyToClipboard(summary); toast.success("Đã sao chép tóm tắt"); }} className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer" style={{ fontSize: "10px" }}>
                    <Copy className="w-3 h-3" /> Sao chép
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer" style={{ fontSize: "10px" }}>
                    <Download className="w-3 h-3" /> Tải PDF
                  </button>
                </div>
              </div>
            )}

            {activeTab === "keypoints" && (
              <div className="space-y-2">
                {keypoints.map((kp, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-purple-50/50 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5" style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</div>
                    <p className="text-gray-700" style={{ fontSize: "12px", lineHeight: 1.6 }}>{kp}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="space-y-3">
                {quizSuggestions.map((q, i) => (
                  <QuizCard key={i} question={q.q} answer={q.a} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuizCard({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-gray-700 mb-2" style={{ fontSize: "12px", fontWeight: 500 }}>
        <span className="text-purple-500 mr-1.5">Q{index + 1}.</span>{question}
      </p>
      {revealed ? (
        <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
          <p className="text-green-700" style={{ fontSize: "11px" }}>{answer}</p>
        </div>
      ) : (
        <button onClick={() => setRevealed(true)} className="flex items-center gap-1 px-2 py-1 text-purple-500 hover:bg-purple-50 rounded cursor-pointer" style={{ fontSize: "11px" }}>
          <Eye className="w-3 h-3" /> Hiện đáp án
        </button>
      )}
    </div>
  );
}

/* ================================================================ */
/*  6. FLASHCARD MODE                                                */
/* ================================================================ */

interface FlashcardModeProps {
  show: boolean;
  onClose: () => void;
  notes: { id: string; text: string; timestamp: string }[];
}

export function FlashcardMode({ show, onClose, notes }: FlashcardModeProps) {
  const cards = notes.length > 0 ? notes.map(n => ({
    front: n.text.length > 60 ? n.text.substring(0, 60) + "..." : n.text,
    back: n.text,
    source: n.timestamp,
  })) : [
    { front: "Quy trình ra quyết định có mấy bước?", back: "6 bước: Nhận diện → Thu thập → Phân tích → Lựa chọn → Thực hiện → Đánh giá", source: "Bài L05" },
    { front: "Tỷ lệ NPL của ABBank sau tái cấu trúc?", back: "Giảm từ 4.2% xuống 1.9% sau 18 tháng", source: "Bài L05" },
    { front: "Nguyên tắc vàng tại Geleximco?", back: "Dữ liệu — Đồng thuận — Hành động", source: "Bài L05" },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Set<number>>(new Set());

  if (!show) return null;

  const card = cards[currentIdx];
  const progress = Math.round((mastered.size / cards.length) * 100);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c8a84e]" />
            <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Flashcards</span>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>({currentIdx + 1}/{cards.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400" style={{ fontSize: "11px" }}>{mastered.size} đã thuộc</span>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#c8a84e] transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Card */}
        <div className="p-6">
          <div
            onClick={() => setFlipped(!flipped)}
            className="min-h-[200px] flex items-center justify-center p-6 rounded-xl cursor-pointer transition-all border-2 border-dashed"
            style={{
              backgroundColor: flipped ? "#fef3c7" : "#fafafa",
              borderColor: flipped ? "#c8a84e" : "#e5e7eb",
            }}
          >
            <div className="text-center">
              {!flipped ? (
                <>
                  <p className="text-gray-800" style={{ fontSize: "16px", fontWeight: 500, lineHeight: 1.6 }}>{card.front}</p>
                  <p className="text-gray-400 mt-3" style={{ fontSize: "11px" }}>Nhấn để xem đáp án</p>
                </>
              ) : (
                <>
                  <p className="text-amber-800" style={{ fontSize: "14px", lineHeight: 1.8 }}>{card.back}</p>
                  <p className="text-amber-500 mt-2" style={{ fontSize: "10px" }}>Nguồn: {card.source}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setFlipped(false); }}
            disabled={currentIdx === 0}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => { setMastered(prev => { const n = new Set(prev); if (n.has(currentIdx)) n.delete(currentIdx); else n.add(currentIdx); return n; }); }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${mastered.has(currentIdx) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              style={{ fontSize: "11px", fontWeight: 500 }}>
              {mastered.has(currentIdx) ? "✓ Đã thuộc" : "Đánh dấu thuộc"}
            </button>
            <button onClick={() => { const shuffled = Math.floor(Math.random() * cards.length); setCurrentIdx(shuffled); setFlipped(false); }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer">
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setCurrentIdx(Math.min(cards.length - 1, currentIdx + 1)); setFlipped(false); }}
            disabled={currentIdx === cards.length - 1}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  7. TRANSCRIPT PANEL                                              */
/* ================================================================ */

interface TranscriptPanelProps {
  currentTimeSec: number;
  onSeek: (pct: number) => void;
}

export function TranscriptPanel({ currentTimeSec, onSeek }: TranscriptPanelProps) {
  const transcriptData = [
    { start: 0, end: 15, text: "Xin chào các bạn, hôm nay chúng ta sẽ cùng phân tích một case study rất thú vị từ ABBank — một trong những ngân hàng thuộc hệ sinh thái Tập đoàn Geleximco." },
    { start: 15, end: 35, text: "ABBank được thành lập năm 1999, và từ năm 2007, Geleximco đã trở thành cổ đông chiến lược lớn nhất. Điều này mang lại nhiều lợi thế cạnh tranh." },
    { start: 35, end: 58, text: "Trong bối cảnh thị trường tài chính biến động 2023 đến 2025, ABBank đã phải đối mặt với tỷ lệ nợ xấu tăng cao, đạt mức 4.2 phần trăm." },
    { start: 58, end: 82, text: "Đây là lúc ban lãnh đạo quyết định áp dụng quy trình ra quyết định 6 bước — một phương pháp luận đã được chứng minh hiệu quả tại nhiều đơn vị trong Tập đoàn." },
    { start: 82, end: 110, text: "Bước 1: Nhận diện vấn đề. Đội ngũ ABBank đã xác định rõ ràng các nguyên nhân gốc rễ dẫn đến tỷ lệ nợ xấu cao, bao gồm thẩm định tín dụng chưa chặt chẽ và giám sát sau cho vay còn hạn chế." },
    { start: 110, end: 140, text: "Bước 2 và 3: Thu thập dữ liệu thị trường và Phân tích rủi ro định lượng. ABBank đã sử dụng các công cụ phân tích dữ liệu lớn để đánh giá danh mục cho vay." },
    { start: 140, end: 175, text: "Bước 4: Lựa chọn phương án. Sau khi phân tích, ABBank đã chọn chiến lược tái cấu trúc danh mục cho vay, tập trung vào phân khúc khách hàng cá nhân chất lượng cao." },
    { start: 175, end: 210, text: "Bước 5: Thực hiện. Quá trình triển khai kéo dài 18 tháng với sự giám sát chặt chẽ từ Ban Giám đốc và Hội đồng Quản trị." },
    { start: 210, end: 245, text: "Bước 6: Đánh giá kết quả. Sau 18 tháng, tỷ lệ nợ xấu giảm từ 4.2% xuống còn 1.9%, tương đương giảm 2.3 điểm phần trăm — một kết quả ấn tượng." },
    { start: 245, end: 280, text: "Nguyên tắc vàng rút ra: Dữ liệu — Đồng thuận — Hành động. Đây là 3 trụ cột trong quy trình ra quyết định tại Geleximco." },
    { start: 280, end: 320, text: "Bài học này có thể áp dụng cho tất cả các đơn vị trong Tập đoàn, từ bất động sản, xi măng, đến năng lượng và tài chính." },
    { start: 320, end: 350, text: "Các bạn hãy suy nghĩ về câu hỏi thảo luận: Đơn vị của bạn có thể áp dụng quy trình 6 bước này như thế nào cho một quyết định cụ thể đang cần giải quyết?" },
  ];

  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTimeSec]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="space-y-1">
      {transcriptData.map((seg, i) => {
        const isActive = currentTimeSec >= seg.start && currentTimeSec < seg.end;
        return (
          <div
            key={i}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek((seg.start / 1530) * 100)}
            className={`flex gap-2 p-2 rounded-lg cursor-pointer transition-all ${isActive ? "bg-[#990803]/5 border border-[#990803]/10" : "hover:bg-gray-50"}`}
          >
            <span className={`shrink-0 ${isActive ? "text-[#990803]" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 600, fontFamily: "monospace", minWidth: "36px" }}>
              {fmt(seg.start)}
            </span>
            <p className={`${isActive ? "text-gray-800" : "text-gray-500"}`} style={{ fontSize: "12px", lineHeight: 1.6 }}>
              {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#990803] mr-1.5 mb-0.5 animate-pulse" />}
              {seg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================ */
/*  8. SPEED READING ESTIMATOR                                       */
/* ================================================================ */

export function SpeedIndicator({ speed, duration, progressPct }: { speed: number; duration: string; progressPct: number }) {
  // Parse duration like "25:10" or "15 phút đọc"
  let totalMin = 25;
  if (duration.includes(":")) {
    const [m, s] = duration.split(":").map(Number);
    totalMin = m + s / 60;
  } else {
    const match = duration.match(/(\d+)/);
    if (match) totalMin = parseInt(match[1]);
  }

  const remainingMin = (totalMin * (100 - progressPct)) / 100 / speed;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg">
      <Clock className="w-3 h-3 text-gray-400" />
      <span className="text-gray-500" style={{ fontSize: "10px" }}>
        Còn ~{remainingMin < 1 ? "< 1" : Math.ceil(remainingMin)} phút
        {speed !== 1 && <span className="text-[#990803] ml-1">({speed}x)</span>}
      </span>
    </div>
  );
}

/* ================================================================ */
/*  9. ACHIEVEMENT TOAST                                             */
/* ================================================================ */

export function showAchievementToast(title: string, desc: string) {
  toast.custom(() => (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#c8a84e] to-[#b8962e] text-white px-4 py-3 rounded-xl shadow-lg">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <Trophy className="w-5 h-5" />
      </div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 700 }}>{title}</p>
        <p style={{ fontSize: "11px", opacity: 0.9 }}>{desc}</p>
      </div>
    </div>
  ), { duration: 4000 });
}

/* ================================================================ */
/*  10. COLLABORATIVE ANNOTATIONS                                    */
/* ================================================================ */

export function CollaborativeAnnotations() {
  const annotations = [
    { id: "A1", user: "Nguyễn Văn Minh", initials: "NM", text: "Phần 6 bước rất hay, áp dụng được cho team PM", timestamp: "07:39", likes: 8, department: "VP Tập đoàn" },
    { id: "A2", user: "Trần Thị Lan", initials: "TL", text: "Slide SWOT cần download về share cho chi nhánh", timestamp: "12:45", likes: 4, department: "ABBank" },
    { id: "A3", user: "Phạm Đức Hùng", initials: "PH", text: "Nguyên tắc vàng: Data → Consensus → Action 💡", timestamp: "18:22", likes: 15, department: "Xi măng Thăng Long" },
    { id: "A4", user: "Lê Hoàng Anh", initials: "LA", text: "So sánh với Hải Phòng Thermal rất insight", timestamp: "22:00", likes: 6, department: "Hải Phòng Thermal" },
  ];

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>{annotations.length} ghi chú từ đồng nghiệp</span>
      </div>
      {annotations.map(ann => (
        <div key={ann.id} className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{ann.initials}</div>
            <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{ann.user}</span>
            <span className="text-gray-400" style={{ fontSize: "9px" }}>• {ann.department}</span>
            <span className="ml-auto text-blue-500" style={{ fontSize: "10px", fontWeight: 600, fontFamily: "monospace" }}>{ann.timestamp}</span>
          </div>
          <p className="text-gray-600 ml-7" style={{ fontSize: "11px", lineHeight: 1.5 }}>{ann.text}</p>
          <div className="flex items-center gap-2 ml-7 mt-1">
            <button onClick={() => setLikedIds(prev => { const n = new Set(prev); if (n.has(ann.id)) n.delete(ann.id); else n.add(ann.id); return n; })}
              className={`flex items-center gap-1 cursor-pointer ${likedIds.has(ann.id) ? "text-blue-500" : "text-gray-400 hover:text-blue-500"}`} style={{ fontSize: "10px" }}>
              <Star className={`w-3 h-3 ${likedIds.has(ann.id) ? "fill-blue-500" : ""}`} />
              {ann.likes + (likedIds.has(ann.id) ? 1 : 0)}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}