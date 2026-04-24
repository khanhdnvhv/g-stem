import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { copyToClipboard } from "../utils/clipboard";
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown,
  CheckCircle2, Lock, Clock, StickyNote, MessageCircle, Bookmark,
  ThumbsUp, Flag, Share2, List, X, Layers,
  Repeat, Heart, Trash2, Plus, Send, Timer, Brain,
  Keyboard, Download, Zap, ZapOff, GraduationCap, Users,
  FileText,
} from "lucide-react";
import { mockCourses } from "./mock-data";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import {
  type Lesson, type NoteItem, type QAItem,
  courseModules, allLessons,
  mockNotes, mockQA, contentTypeConfig,
} from "./learning/types";
import { VideoPlayer } from "./learning/VideoPlayer";
import { AudioPlayer } from "./learning/AudioPlayer";
import { ImageViewer } from "./learning/ImageViewer";
import { ScormViewer } from "./learning/ScormViewer";
import { DocumentViewer } from "./learning/DocumentViewer";
import { PresentationViewer } from "./learning/PresentationViewer";
import {
  ShortcutsOverlay,
  SmartResumeBanner,
  FocusTimer,
  LearningStatsWidget,
  AISummaryPanel,
  FlashcardMode,
  TranscriptPanel,
  SpeedIndicator,
  CollaborativeAnnotations,
  showAchievementToast,
} from "./learning/SmartFeatures";
import { toast } from "sonner";

/* ============================================================ */
/*  MAIN COMPONENT: LearningPlayer (Enhanced)                    */
/* ============================================================ */

export function LearningPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const course = mockCourses.find((c) => c.id === id) || mockCourses[0];

  /* ── Core state ── */
  const [activeLessonId, setActiveLessonId] = useState("L05");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<"notes" | "qa" | "bookmarks" | "transcript" | "annotations">("notes");
  const [showBottom, setShowBottom] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ M1: true, M2: true, M3: true, M4: true });
  const [notes, setNotes] = useState<NoteItem[]>(mockNotes);
  const [newNote, setNewNote] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(allLessons.filter(l => l.completed).map(l => l.id))
  );
  const [extraQuestions, setExtraQuestions] = useState<QAItem[]>([]);
  const [likedQAs, setLikedQAs] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [extraReplies, setExtraReplies] = useState<Record<string, { user: string; initials: string; text: string; time: string }[]>>({});

  /* ── Content consumption tracking ── */
  const [contentReadyMap, setContentReadyMap] = useState<Record<string, boolean>>(() => {
    // Already completed lessons are considered content-ready
    const map: Record<string, boolean> = {};
    allLessons.filter(l => l.completed).forEach(l => { map[l.id] = true; });
    return map;
  });
  const handleContentReady = React.useCallback((ready: boolean) => {
    if (ready) {
      setContentReadyMap(prev => ({ ...prev, [activeLessonId]: true }));
    }
  }, [activeLessonId]);
  const isContentReady = contentReadyMap[activeLessonId] || completedLessons.has(activeLessonId);

  /* ── Smart features state ── */
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(true);
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"outline" | "stats">("outline");
  const [studyTime, setStudyTime] = useState(0); // seconds studied this session
  const [showKeyHint, setShowKeyHint] = useState(true);

  /* ── Derived state ── */
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[4];
  const activeLessonIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null;
  const completedCount = completedLessons.size;
  const totalProgress = Math.round((completedCount / allLessons.length) * 100);
  const typeConf = contentTypeConfig[activeLesson.type];
  const TypeIcon = typeConf.icon;

  /* ── Study time tracker ── */
  useEffect(() => {
    const iv = setInterval(() => setStudyTime(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const studyTimeStr = React.useMemo(() => {
    const m = Math.floor(studyTime / 60);
    const s = studyTime % 60;
    return m > 0 ? `${m}p ${s.toString().padStart(2, "0")}s` : `${s}s`;
  }, [studyTime]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      switch (e.key) {
        case "?": e.preventDefault(); setShowShortcuts(s => !s); break;
        case "n": case "N": e.preventDefault(); setShowBottom(true); setBottomTab("notes"); break;
        case "b": case "B": e.preventDefault(); setBookmarked(b => !b); toast.success(bookmarked ? "Đã bỏ đánh dấu" : "Đã đánh dấu bài học"); break;
        case "t": case "T": e.preventDefault(); setTheaterMode(t => !t); if (!theaterMode) setSidebarOpen(false); else setSidebarOpen(true); break;
        case "Escape": setShowShortcuts(false); setShowFlashcards(false); setShowFocusTimer(false); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [bookmarked, theaterMode]);

  /* ── Dismiss key hint after 8 seconds ── */
  useEffect(() => {
    const t = setTimeout(() => setShowKeyHint(false), 8000);
    return () => clearTimeout(t);
  }, []);

  /* ── Handlers ── */
  const toggleModule = (mid: string) => setExpandedModules((prev) => ({ ...prev, [mid]: !prev[mid] }));

  const handleSelectLesson = (lesson: Lesson) => {
    if (!lesson.locked) {
      setActiveLessonId(lesson.id);
      setShowResumeBanner(false);
    }
  };

  const addNote = (timestamp?: string, text?: string) => {
    const t = text || newNote.trim();
    if (!t) return;
    const note: NoteItem = { id: `N${Date.now()}`, timestamp: timestamp || "—", text: t, lessonId: activeLessonId, createdAt: "13/03/2026" };
    setNotes([note, ...notes]);
    setNewNote("");
    if (!showBottom) { setShowBottom(true); setBottomTab("notes"); }
  };

  const handleAutoplayNext = () => {
    if (nextLesson && !nextLesson.locked) {
      setActiveLessonId(nextLesson.id);
    }
  };

  const handleCompleteLesson = async () => {
    const wasCompleted = completedLessons.has(activeLessonId);

    // Issue #2: Bỏ hoàn thành cần ConfirmDialog xác nhận
    if (wasCompleted) {
      const confirmed = await confirm({
        title: "Bỏ hoàn thành bài học",
        message: `Bạn có chắc muốn đánh dấu "${activeLesson.title}" là chưa hoàn thành? Tiến độ khóa học sẽ được cập nhật lại.`,
        confirmLabel: "Bỏ hoàn thành",
        cancelLabel: "Giữ nguyên",
        variant: "warning",
      });
      if (!confirmed) return;
      setCompletedLessons(prev => {
        const next = new Set(prev);
        next.delete(activeLessonId);
        return next;
      });
      // Issue #3: Toast phản hồi khi bỏ hoàn thành
      toast.info(`Đã bỏ hoàn thành "${activeLesson.title}"`);
      return;
    }

    // Đánh dấu hoàn thành
    setCompletedLessons(prev => {
      const next = new Set(prev);
      next.add(activeLessonId);
      return next;
    });

    const newCount = completedCount + 1;
    // Achievement checks
    if (newCount === 1) showAchievementToast("🎉 Bắt đầu hành trình!", "Hoàn thành bài học đầu tiên");
    else if (newCount === 5) showAchievementToast("⭐ Học viên chăm chỉ!", "Hoàn thành 5 bài học");
    else if (newCount === allLessons.length) showAchievementToast("🏆 Hoàn thành khóa học!", `Bạn đã hoàn thành tất cả ${allLessons.length} bài`);

    // Issue #1: Auto-advance phải thực sự chuyển bài
    if (nextLesson && !nextLesson.locked && autoplayNext) {
      toast.success(`Hoàn thành! Chuyển sang "${nextLesson.title}"...`);
      setTimeout(() => {
        setActiveLessonId(nextLesson.id);
      }, 1200);
    } else if (!nextLesson || nextLesson.locked) {
      toast.success("Hoàn thành bài học!");
    } else {
      toast.success("Hoàn thành bài học!");
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const q: QAItem = {
      id: `QA_${Date.now()}`,
      user: user?.name || "Bạn",
      initials: user?.initials || "B",
      question: newQuestion.trim(),
      time: "Vừa xong",
      likes: 0,
      replies: [],
    };
    setExtraQuestions(prev => [q, ...prev]);
    setNewQuestion("");
  };

  const toggleLikeQA = (qaId: string) => {
    setLikedQAs(prev => {
      const next = new Set(prev);
      if (next.has(qaId)) next.delete(qaId); else next.add(qaId);
      return next;
    });
  };

  const handleAddReply = (qaId: string) => {
    if (!replyText.trim()) return;
    setExtraReplies(prev => ({
      ...prev,
      [qaId]: [...(prev[qaId] || []), { user: user?.name || "Bạn", initials: user?.initials || "B", text: replyText.trim(), time: "Vừa xong" }],
    }));
    setReplyText("");
    setReplyingTo(null);
  };

  const allQA = [...mockQA, ...extraQuestions];
  const lessonNotes = notes.filter(n => n.lessonId === activeLessonId);

  /* ── Bottom tabs config ── */
  const bottomTabs = [
    { key: "notes" as const, label: "Ghi chú", icon: StickyNote, count: lessonNotes.length },
    { key: "qa" as const, label: "Hỏi đáp", icon: MessageCircle, count: allQA.length },
    { key: "transcript" as const, label: "Phiên âm", icon: FileText, show: activeLesson.type === "video" || activeLesson.type === "audio" },
    { key: "annotations" as const, label: "Đồng nghiệp", icon: Users },
    { key: "bookmarks" as const, label: "Đánh dấu", icon: Bookmark },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] -m-4 lg:-m-6">
      {/* ═══════════════ TOP BAR ═══════════════ */}
      <div className={`shrink-0 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 transition-all ${focusMode ? "opacity-0 hover:opacity-100" : ""}`}>
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/courses/${course.id}`} className="p-1.5 text-gray-500 hover:text-[#990803] hover:bg-gray-100 rounded-lg transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-gray-400 truncate" style={{ fontSize: "11px" }}>{course.title}</p>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded flex items-center justify-center ${typeConf.bg}`}><TypeIcon className={`w-3 h-3 ${typeConf.color}`} /></div>
              <h1 className="text-gray-800 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{activeLesson.title}</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 mr-1">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#990803] rounded-full transition-all" style={{ width: `${totalProgress}%` }} />
            </div>
            <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{totalProgress}%</span>
          </div>

          {/* Study time */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: "10px", fontFamily: "monospace" }}>{studyTimeStr}</span>
          </div>

          {/* Autoplay */}
          <button
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer ${autoplayNext ? "bg-[#990803]/10 text-[#990803]" : "bg-gray-100 text-gray-400"}`}
            style={{ fontSize: "10px", fontWeight: 600 }}
            onClick={() => setAutoplayNext(!autoplayNext)}
            title={autoplayNext ? "Tự động phát: BẬT" : "Tự động phát: TẮT"}
          >
            <Repeat className="w-3 h-3" />
            Auto
          </button>

          {/* Focus mode */}
          <button
            className={`p-1.5 rounded-lg cursor-pointer ${focusMode ? "text-purple-500 bg-purple-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
            onClick={() => { setFocusMode(!focusMode); if (!focusMode) { setSidebarOpen(false); setShowBottom(false); } else { setSidebarOpen(true); } }}
            title="Chế độ tập trung"
          >
            {focusMode ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          </button>

          {/* Focus Timer */}
          <div className="relative">
            <button
              className={`p-1.5 rounded-lg cursor-pointer ${showFocusTimer ? "text-[#990803] bg-[#990803]/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setShowFocusTimer(!showFocusTimer)}
              title="Pomodoro Timer"
            >
              <Timer className="w-4 h-4" />
            </button>
            {showFocusTimer && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <FocusTimer show={showFocusTimer} onClose={() => setShowFocusTimer(false)} />
              </div>
            )}
          </div>

          {/* AI Summary */}
          <button
            className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg cursor-pointer"
            onClick={() => { setShowBottom(true); setBottomTab("notes"); }}
            title="AI Tóm tắt"
          >
            <Brain className="w-4 h-4" />
          </button>

          {/* Flashcards */}
          <button
            className="p-1.5 text-gray-400 hover:text-[#c8a84e] hover:bg-[#c8a84e]/10 rounded-lg cursor-pointer"
            onClick={() => setShowFlashcards(true)}
            title="Flashcards"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Bookmark */}
          <button className={`p-1.5 rounded-lg cursor-pointer ${bookmarked ? "text-[#c8a84e] bg-[#c8a84e]/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`} onClick={() => { setBookmarked(!bookmarked); toast.success(bookmarked ? "Đã bỏ đánh dấu" : "Đã đánh dấu bài học"); }} title="Đánh dấu">
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>

          {/* Like */}
          <button className={`p-1.5 rounded-lg cursor-pointer ${liked ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`} onClick={() => setLiked(!liked)} title="Thích">
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>

          {/* Notes toggle */}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer" title="Ghi chú" onClick={() => { setShowBottom(!showBottom); setBottomTab("notes"); }}>
            <StickyNote className="w-4 h-4" />
          </button>

          {/* Keyboard shortcuts */}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer" title="Phím tắt (?)" onClick={() => setShowShortcuts(true)}>
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Mobile sidebar toggle */}
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══════════════ BODY ═══════════════ */}
      <div className="flex flex-1 min-h-0 relative">
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* ─── Main Content ─── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1 p-4 lg:p-6 space-y-4">

            {/* Keyboard hint banner */}
            {showKeyHint && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900/90 text-white rounded-xl">
                <span style={{ fontSize: "11px" }}>
                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded mx-0.5" style={{ fontSize: "10px" }}>Space</kbd>: Play •
                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded mx-0.5" style={{ fontSize: "10px" }}>←→</kbd>: ±10s •
                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded mx-0.5" style={{ fontSize: "10px" }}>N</kbd>: Ghi chú •
                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded mx-0.5" style={{ fontSize: "10px" }}>T</kbd>: Theater •
                  <kbd className="px-1.5 py-0.5 bg-white/20 rounded mx-0.5" style={{ fontSize: "10px" }}>F</kbd>: Fullscreen
                </span>
                <span className="text-white/40 ml-auto hidden sm:inline" style={{ fontSize: "10px" }}>GELEXIMCO LMS</span>
                <button onClick={() => setShowKeyHint(false)} className="p-0.5 text-white/40 hover:text-white cursor-pointer ml-2"><X className="w-3 h-3" /></button>
              </div>
            )}

            {/* Smart Resume Banner */}
            {showResumeBanner && activeLessonId === "L05" && (
              <SmartResumeBanner
                lessonTitle={activeLesson.title}
                savedPosition="15:30"
                savedPct={61}
                onResume={() => { setShowResumeBanner(false); toast.success("Tiếp tục từ 15:30"); }}
                onStartOver={() => { setShowResumeBanner(false); toast.info("Bắt đầu lại từ đầu"); }}
                onDismiss={() => setShowResumeBanner(false)}
              />
            )}

            {/* Content renderer */}
            {activeLesson.type === "video" && (
              <VideoPlayer
                lesson={activeLesson}
                onAddNote={(ts, text) => addNote(ts, text)}
                theaterMode={theaterMode}
                onToggleTheater={() => { setTheaterMode(!theaterMode); if (!theaterMode) setSidebarOpen(false); else setSidebarOpen(true); }}
                autoplayNext={autoplayNext}
                onToggleAutoplay={() => setAutoplayNext(!autoplayNext)}
                onAutoplayNext={handleAutoplayNext}
                onContentReady={handleContentReady}
              />
            )}
            {activeLesson.type === "document" && <DocumentViewer lesson={activeLesson} onContentReady={handleContentReady} />}
            {activeLesson.type === "audio" && <AudioPlayer lesson={activeLesson} onContentReady={handleContentReady} />}
            {activeLesson.type === "image" && <ImageViewer lesson={activeLesson} onContentReady={handleContentReady} />}
            {activeLesson.type === "presentation" && <PresentationViewer lesson={activeLesson} onContentReady={handleContentReady} />}
            {activeLesson.type === "scorm" && <ScormViewer lesson={activeLesson} onContentReady={handleContentReady} />}

            {/* Lesson info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded ${typeConf.bg} ${typeConf.color}`} style={{ fontSize: "10px", fontWeight: 600 }}>{typeConf.label}</span>
                    <span className="text-gray-400" style={{ fontSize: "11px" }}>{activeLesson.duration}</span>
                    <SpeedIndicator speed={1} duration={activeLesson.duration} progressPct={activeLessonId === "L05" ? 61 : 0} />
                    {completedLessons.has(activeLessonId) && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px", fontWeight: 600 }}>
                        <CheckCircle2 className="w-3 h-3" /> Đã hoàn thành
                      </span>
                    )}
                  </div>
                  <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>{activeLesson.title}</h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { copyToClipboard(window.location.href); toast.success("Đã sao chép link bài học"); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"><Share2 className="w-4 h-4" /></button>
                  <button onClick={() => toast.info("Đã báo cáo bài học. Chúng tôi sẽ xem xét.")} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"><Flag className="w-4 h-4" /></button>
                  <button onClick={() => toast.success("Đã tải bài học cho xem offline")} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer"><Download className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-gray-500" style={{ fontSize: "13px", lineHeight: 1.7 }}>{activeLesson.description}</p>
            </div>

            {/* AI Summary Panel */}
            <AISummaryPanel lessonTitle={activeLesson.title} lessonType={activeLesson.type} />

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-3">
              {prevLesson ? (
                <button className="flex-1 flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-[#990803]/30 hover:shadow-sm transition-all cursor-pointer text-left" onClick={() => handleSelectLesson(prevLesson)}>
                  <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>Bài trước</p>
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{prevLesson.title}</p>
                  </div>
                </button>
              ) : <div className="flex-1" />}

              <div className="relative group/complete shrink-0">
                <button
                  onClick={handleCompleteLesson}
                  disabled={!isContentReady && !completedLessons.has(activeLessonId)}
                  className={`px-5 py-2.5 rounded-xl shadow-sm transition-all ${
                    completedLessons.has(activeLessonId)
                      ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                      : isContentReady
                        ? "bg-[#990803] text-white hover:bg-[#7a0602] cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                  }`}
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                  {completedLessons.has(activeLessonId)
                    ? "✓ Đã hoàn thành"
                    : isContentReady
                      ? "Hoàn thành bài học"
                      : "Chưa học xong"}
                </button>
                {!isContentReady && !completedLessons.has(activeLessonId) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white rounded-lg whitespace-nowrap opacity-0 group-hover/complete:opacity-100 transition-opacity pointer-events-none z-50" style={{ fontSize: "11px" }}>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-yellow-400" />
                      <span>Vui lòng {
                        activeLesson.type === "video" ? "xem ≥90% video" :
                        activeLesson.type === "audio" ? "nghe ≥90% audio" :
                        activeLesson.type === "document" ? "đọc ≥80% trang" :
                        activeLesson.type === "image" ? "xem hết tất cả ảnh" :
                        activeLesson.type === "presentation" ? "xem ≥80% slide" :
                        activeLesson.type === "scorm" ? "hoàn thành & đạt ≥70% bài kiểm tra" :
                        "hoàn thành nội dung"
                      } trước</span>
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-800" />
                  </div>
                )}
              </div>

              {nextLesson && !nextLesson.locked ? (
                <button className="flex-1 flex items-center justify-end gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-[#990803]/30 hover:shadow-sm transition-all cursor-pointer text-right" onClick={() => handleSelectLesson(nextLesson)}>
                  <div className="min-w-0">
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>Bài tiếp</p>
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{nextLesson.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ) : <div className="flex-1" />}
            </div>
          </div>

          {/* ─── Bottom Panel ─── */}
          {showBottom && (
            <div className="shrink-0 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <div className="flex gap-0.5 overflow-x-auto">
                  {bottomTabs.filter(t => t.show !== false).map(({ key, label, icon: Icon, count }) => (
                    <button key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap ${bottomTab === key ? "bg-[#990803]/10 text-[#990803]" : "text-gray-500 hover:bg-gray-100"}`} style={{ fontSize: "12px", fontWeight: 500 }} onClick={() => setBottomTab(key)}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                      {count !== undefined && count > 0 && <span className="ml-0.5 px-1.5 py-0 rounded-full bg-gray-200 text-gray-600" style={{ fontSize: "9px", fontWeight: 700 }}>{count}</span>}
                    </button>
                  ))}
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowBottom(false)}><X className="w-4 h-4" /></button>
              </div>

              <div className="p-4 max-h-72 overflow-y-auto">
                {/* Notes tab */}
                {bottomTab === "notes" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Thêm ghi chú cho bài học này..." value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addNote()} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "13px" }} />
                      <button className="px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" onClick={() => addNote()}><Plus className="w-4 h-4" /></button>
                    </div>
                    {lessonNotes.length === 0 ? (
                      <div className="text-center py-6">
                        <StickyNote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400" style={{ fontSize: "13px" }}>Chưa có ghi chú nào</p>
                        <p className="text-gray-300" style={{ fontSize: "11px" }}>Nhấn <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded mx-0.5" style={{ fontSize: "10px" }}>N</kbd> để thêm nhanh</p>
                      </div>
                    ) : lessonNotes.map((note) => (
                      <div key={note.id} className="flex gap-3 p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                        <span className="text-[#c8a84e] shrink-0" style={{ fontSize: "11px", fontWeight: 600, fontFamily: "monospace" }}>{note.timestamp}</span>
                        <p className="text-gray-700 flex-1" style={{ fontSize: "12px", lineHeight: 1.5 }}>{note.text}</p>
                        <button onClick={() => { setNotes(prev => prev.filter(n => n.id !== note.id)); toast.success("Đã xóa ghi chú"); }} className="p-0.5 text-gray-300 hover:text-red-400 cursor-pointer shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Q&A tab */}
                {bottomTab === "qa" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Đặt câu hỏi cho giảng viên..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && newQuestion.trim()) handleAddQuestion(); }} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "13px" }} />
                      <button onClick={handleAddQuestion} className="px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer"><Send className="w-4 h-4" /></button>
                    </div>
                    {allQA.map((qa) => (
                      <div key={qa.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>{qa.initials}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{qa.user}</span>
                              <span className="text-gray-400" style={{ fontSize: "10px" }}>{qa.time}</span>
                            </div>
                            <p className="text-gray-600 mt-0.5" style={{ fontSize: "12px" }}>{qa.question}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <button onClick={() => toggleLikeQA(qa.id)} className={`flex items-center gap-1 cursor-pointer ${likedQAs.has(qa.id) ? "text-[#990803]" : "text-gray-400 hover:text-[#990803]"}`} style={{ fontSize: "11px" }}><ThumbsUp className={`w-3 h-3 ${likedQAs.has(qa.id) ? "fill-[#990803]" : ""}`} /> {likedQAs.has(qa.id) ? qa.likes + 1 : qa.likes}</button>
                              <button onClick={() => { setReplyingTo(qa.id); setReplyText(""); }} className="text-gray-400 hover:text-[#990803] cursor-pointer" style={{ fontSize: "11px" }}>Trả lời</button>
                            </div>
                            {/* Existing replies */}
                            {qa.replies.map((reply, ri) => (
                              <div key={ri} className="mt-2 ml-4 p-2 bg-white rounded-lg border border-gray-100">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{reply.initials}</div>
                                  <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>{reply.user}</span>
                                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{reply.time}</span>
                                </div>
                                <p className="text-gray-600 mt-0.5 ml-6" style={{ fontSize: "11px" }}>{reply.text}</p>
                              </div>
                            ))}
                            {/* Reply input */}
                            {replyingTo === qa.id && (
                              <div className="mt-2 ml-4 flex items-center gap-2">
                                <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddReply(qa.id)} placeholder="Viết trả lời..." className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "12px" }} />
                                <button onClick={() => handleAddReply(qa.id)} className="px-2 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setReplyingTo(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            )}
                            {/* Extra replies */}
                            {extraReplies[qa.id]?.map((reply, ri) => (
                              <div key={`extra-${ri}`} className="mt-2 ml-4 p-2 bg-white rounded-lg border border-gray-100">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{reply.initials}</div>
                                  <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>{reply.user}</span>
                                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{reply.time}</span>
                                </div>
                                <p className="text-gray-600 mt-0.5 ml-6" style={{ fontSize: "11px" }}>{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transcript tab */}
                {bottomTab === "transcript" && (
                  <TranscriptPanel currentTimeSec={Math.round(0.61 * 1530)} onSeek={(pct) => toast.info(`Nhảy tới ${Math.round(pct)}%`)} />
                )}

                {/* Annotations tab */}
                {bottomTab === "annotations" && <CollaborativeAnnotations />}

                {/* Bookmarks tab */}
                {bottomTab === "bookmarks" && (
                  <div className="text-center py-6">
                    <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500" style={{ fontSize: "13px" }}>Bấm <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded mx-0.5" style={{ fontSize: "10px" }}>B</kbd> hoặc <strong>Bookmark</strong> trên thanh công cụ để đánh dấu</p>
                    {bookmarked && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#c8a84e]/10 rounded-lg">
                        <Bookmark className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
                        <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 500 }}>Đã đánh dấu bài hiện tại</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside className={`fixed lg:static right-0 top-0 bottom-0 z-40 lg:z-auto w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} ${theaterMode || focusMode ? "lg:hidden" : ""}`}>
          {/* Sidebar header with tabs */}
          <div className="shrink-0 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
                <button onClick={() => setSidebarTab("outline")} className={`px-3 py-1 rounded-md cursor-pointer ${sidebarTab === "outline" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>Nội dung</button>
                <button onClick={() => setSidebarTab("stats")} className={`px-3 py-1 rounded-md cursor-pointer ${sidebarTab === "stats" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>Thống kê</button>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 lg:hidden cursor-pointer" onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            {sidebarTab === "outline" && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#990803] rounded-full transition-all" style={{ width: `${totalProgress}%` }} />
                </div>
                <span className="text-gray-500 shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>{completedCount}/{allLessons.length}</span>
              </div>
            )}
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {sidebarTab === "outline" ? (
              /* Course Outline */
              <>
                {courseModules.map((mod) => (
                  <div key={mod.id}>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 cursor-pointer border-b border-gray-50" onClick={() => toggleModule(mod.id)}>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform shrink-0 ${expandedModules[mod.id] ? "" : "-rotate-90"}`} />
                      <span className="text-gray-700 flex-1" style={{ fontSize: "12px", fontWeight: 600 }}>{mod.title}</span>
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{mod.lessons.filter((l) => completedLessons.has(l.id)).length}/{mod.lessons.length}</span>
                    </button>
                    {expandedModules[mod.id] && (
                      <div>
                        {mod.lessons.map((lesson) => {
                          const lConf = contentTypeConfig[lesson.type];
                          const LIcon = lConf.icon;
                          const isActive = lesson.id === activeLessonId;
                          const isCompleted = completedLessons.has(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleSelectLesson(lesson)}
                              disabled={lesson.locked}
                              className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-all ${isActive ? "bg-[#990803]/5 border-r-2 border-[#990803]" : lesson.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : lesson.locked ? <Lock className="w-4 h-4 text-gray-300" /> : isActive ? (
                                  <div className="w-4 h-4 rounded-full border-2 border-[#990803] flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-[#990803] animate-pulse" /></div>
                                ) : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`truncate ${isActive ? "text-[#990803]" : isCompleted ? "text-gray-500" : "text-gray-700"}`} style={{ fontSize: "12px", fontWeight: isActive ? 600 : 400 }}>{lesson.title}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`flex items-center gap-1 ${lConf.color}`} style={{ fontSize: "10px" }}><LIcon className="w-3 h-3" /> {lConf.label}</span>
                                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{lesson.duration}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              /* Stats tab */
              <div className="p-4 space-y-4">
                <LearningStatsWidget />

                {/* Session info */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-[#990803]" />
                    <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Phiên học hiện tại</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: "12px" }}>Thời gian học</span>
                      <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600, fontFamily: "monospace" }}>{studyTimeStr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: "12px" }}>Bài đã hoàn thành</span>
                      <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{completedCount}/{allLessons.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500" style={{ fontSize: "12px" }}>Tiến độ</span>
                      <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 700 }}>{totalProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-full transition-all" style={{ width: `${totalProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Công cụ học tập</p>
                  <div className="space-y-1.5">
                    {[
                      { icon: Layers, label: "Mở Flashcards", color: "#c8a84e", onClick: () => setShowFlashcards(true) },
                      { icon: Timer, label: "Focus Timer", color: "#990803", onClick: () => setShowFocusTimer(true) },
                      { icon: Keyboard, label: "Xem phím tắt", color: "#6b7280", onClick: () => setShowShortcuts(true) },
                      { icon: Download, label: "Tải offline", color: "#2563eb", onClick: () => toast.success("Đã tải bài học cho xem offline") },
                    ].map(action => (
                      <button key={action.label} onClick={action.onClick} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-left" style={{ fontSize: "12px" }}>
                        <action.icon className="w-4 h-4" style={{ color: action.color }} />
                        <span className="text-gray-700">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-gray-400 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>LOẠI NỘI DUNG</p>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(contentTypeConfig).map(([key, conf]) => {
                const I = conf.icon;
                return (<div key={key} className="flex items-center gap-1"><I className={`w-3 h-3 ${conf.color}`} /><span className="text-gray-500" style={{ fontSize: "10px" }}>{conf.label}</span></div>);
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════ OVERLAYS ═══════════════ */}
      <ShortcutsOverlay show={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <FlashcardMode show={showFlashcards} onClose={() => setShowFlashcards(false)} notes={lessonNotes} />
    </div>
  );
}

export default LearningPlayer;