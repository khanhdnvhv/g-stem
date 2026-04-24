/**
 * LearningPlayer.tsx — STRIPPED (PresentationViewer only)
 * 
 * All other components extracted to standalone files:
 * - DocumentViewer → ./learning/DocumentViewer.tsx
 * - VideoPlayer → ./learning/VideoPlayer.tsx
 * - AudioPlayer → ./learning/AudioPlayer.tsx
 * - ImageViewer → ./learning/ImageViewer.tsx
 * - ScormViewer → ./learning/ScormViewer.tsx
 * - Main LearningPlayer page → ./LearningPlayerPage.tsx
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { copyToClipboard } from "../utils/clipboard";
import {
  Presentation, StickyNote, Layers, PanelLeft,
  ChevronLeft, ChevronRight, Pause, Timer, Monitor,
  Link2, Download, X, Clock, List, FileText, Target,
  Quote, BarChart3, ArrowLeftRight, Award, Users, TrendingUp,
  CheckCircle2, ExternalLink, Copy, PenLine, Highlighter,
  Type, Eraser, MousePointer2, CircleDot, ScanEye,
  GripVertical, Undo2, Trash2, Palette, Minus, Plus,
  ImageDown, FileDown, Upload,
} from "lucide-react";
import type { Lesson } from "./learning/types";
import { toast } from "sonner";
import { OKR_SLIDES } from "./learning/lesson-content";

/* ═══════════════════════════════════════════════════════════════ */
/* DEAD CODE & EXTRACTED COMPONENTS REMOVED                       */
/* See: ./learning/VideoPlayer.tsx, ./learning/DocumentViewer.tsx  */
/*      ./learning/AudioPlayer.tsx, ./learning/ImageViewer.tsx     */
/* ═══════════════════════════════════════════════════════════════ */

/* PLACEHOLDER_START_REMOVE_BEFORE_PRESENTATION */
function _DEAD_VideoPlayer_STUB_EMPTY() {
  const [fullscreen, setFullscreen] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState<{ dir: "fwd" | "bwd"; key: number } | null>(null);
  const [hoverPct, setHoverPct] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [autoplayCountdown, setAutoplayCountdown] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);

  /* ── Quiz state ── */
  const [activeQuiz, setActiveQuiz] = useState<VideoQuiz | null>(null);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const answeredQuizzes = useRef<Set<string>>(new Set());
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);

  /* ── Bookmark state ── */
  const [videoBookmarks, setVideoBookmarks] = useState<VideoBookmarkItem[]>([
    { id: "VB1", pct: 15, label: "Bắt đầu phân tích", color: "#c8a84e" },
    { id: "VB2", pct: 50, label: "Case study chính", color: "#3b82f6" },
  ]);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [bookmarkEditLabel, setBookmarkEditLabel] = useState("");

  /* ── A-B Loop state ── */
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [loopActive, setLoopActive] = useState(false);
  const [showLoopControls, setShowLoopControls] = useState(false);

  /* ── Heatmap tracking ── */
  const heatmapRef = useRef<number[]>(new Array(100).fill(0));
  const maxHeat = useRef(1);

  /* ── Timestamp comments ── */
  const [timeComments, setTimeComments] = useState<TimeComment[]>(MOCK_TIME_COMMENTS);
  const [showTimeComments, setShowTimeComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [hoveredComment, setHoveredComment] = useState<TimeComment | null>(null);

  /* ─��� Screenshot ── */
  const [screenshotFlash, setScreenshotFlash] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const playInterval = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const doubleClickTimer = useRef<ReturnType<typeof setTimeout>>();
  const clickCount = useRef(0);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualities = ["2160p 4K", "1080p HD", "720p", "480p", "360p", "Auto"];

  const totalSec = 1530;
  const currentSec = Math.round((progressPct / 100) * totalSec);
  const bufferedPct = Math.min(100, progressPct + 26);
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  /* ── chapters ── */
  const chapters = [
    { id: "C1", title: "Mở đầu — Bối cảnh ABBank", startPct: 0, startTime: "00:00" },
    { id: "C2", title: "Phân tích tình huống thị trường", startPct: 15, startTime: "03:50" },
    { id: "C3", title: "Quy trình ra quyết định 6 bước", startPct: 30, startTime: "07:39" },
    { id: "C4", title: "Case Study: Tái cấu trúc danh mục", startPct: 50, startTime: "12:45" },
    { id: "C5", title: "Bài học từ thực tiễn Geleximco", startPct: 72, startTime: "18:22" },
    { id: "C6", title: "Tổng kết & Câu hỏi thảo luận", startPct: 88, startTime: "22:26" },
  ];
  const currentChapter = [...chapters].reverse().find((c) => progressPct >= c.startPct) || chapters[0];

  /* ── auto-play progress (with quiz trigger, A-B loop, heatmap) ── */
  useEffect(() => {
    if (playing && !ended && !activeQuiz) {
      const increment = (speed * 100) / (totalSec * 10);
      playInterval.current = setInterval(() => {
        setProgressPct((p) => {
          const next = p + increment;
          // Heatmap tracking
          const bucket = Math.min(99, Math.floor(next));
          if (bucket >= 0 && bucket < 100) {
            heatmapRef.current[bucket] += 1;
            if (heatmapRef.current[bucket] > maxHeat.current) maxHeat.current = heatmapRef.current[bucket];
          }
          // A-B loop
          if (loopActive && loopA !== null && loopB !== null && next >= loopB) {
            return loopA;
          }
          // Quiz trigger
          const quiz = VIDEO_QUIZZES.find((q) => !answeredQuizzes.current.has(q.id) && p < q.triggerPct && next >= q.triggerPct);
          if (quiz) {
            setTimeout(() => {
              setActiveQuiz(quiz);
              setQuizSelectedAnswers([]);
              setQuizSubmitted(false);
              setQuizCorrect(false);
              setPlaying(false);
            }, 0);
            return quiz.triggerPct;
          }
          if (next >= 100) {
            setPlaying(false);
            setEnded(true);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    return () => { if (playInterval.current) clearInterval(playInterval.current); };
  }, [playing, speed, ended, activeQuiz, loopActive, loopA, loopB]);

  /* ── autoplay countdown ── */
  useEffect(() => {
    if (ended && autoplayNext) {
      setAutoplayCountdown(5);
      const iv = setInterval(() => {
        setAutoplayCountdown((c) => {
          if (c === null) return null;
          if (c <= 1) { clearInterval(iv); onAutoplayNext(); return null; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(iv);
    } else {
      setAutoplayCountdown(null);
    }
  }, [ended, autoplayNext]);

  /* ── controls auto-hide ── */
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  /* ── progress bar ── */
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgressPct(pct);
    if (ended && pct < 100) { setEnded(false); setAutoplayCountdown(null); }
  };
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPct(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
  };

  /* ── double-click play/pause ── */
  const handleVideoAreaClick = () => {
    clickCount.current += 1;
    if (clickCount.current === 1) {
      doubleClickTimer.current = setTimeout(() => { clickCount.current = 0; togglePlay(); }, 250);
    } else if (clickCount.current >= 2) {
      if (doubleClickTimer.current) clearTimeout(doubleClickTimer.current);
      clickCount.current = 0;
      togglePlay();
    }
  };

  const togglePlay = () => {
    if (ended) { setEnded(false); setProgressPct(0); setAutoplayCountdown(null); }
    setPlaying((p) => !p);
  };

  /* ── 10s skip with visual feedback ── */
  const skip = useCallback((dir: "fwd" | "bwd") => {
    const delta = (10 / totalSec) * 100;
    setProgressPct((p) => dir === "fwd" ? Math.min(100, p + delta) : Math.max(0, p - delta));
    if (ended && dir === "bwd") { setEnded(false); setAutoplayCountdown(null); }
    setSkipFeedback({ dir, key: Date.now() });
  }, [ended]);

  useEffect(() => {
    if (skipFeedback) { const t = setTimeout(() => setSkipFeedback(null), 700); return () => clearTimeout(t); }
  }, [skipFeedback]);

  /* ── fullscreen ── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.(); setFullscreen(true);
    } else {
      document.exitFullscreen?.(); setFullscreen(false);
    }
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "m": setMuted((m) => !m); break;
        case "f": toggleFullscreen(); break;
        case "t": onToggleTheater(); break;
        case "ArrowRight": e.preventDefault(); skip("fwd"); break;
        case "ArrowLeft": e.preventDefault(); skip("bwd"); break;
        case "ArrowUp": e.preventDefault(); setVolume((v) => Math.min(100, v + 10)); break;
        case "ArrowDown": e.preventDefault(); setVolume((v) => Math.max(0, v - 10)); break;
        case "n": setNoteMode(true); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFullscreen, skip]);

  /* ── note submit ── */
  const submitNote = () => {
    if (!noteText.trim()) return;
    onAddNote(fmt(currentSec), noteText.trim());
    setNoteText(""); setNoteMode(false);
  };
  useEffect(() => { if (noteMode && noteInputRef.current) noteInputRef.current.focus(); }, [noteMode]);

  /* ── Quiz helpers ── */
  const toggleQuizAnswer = (idx: number) => {
    if (quizSubmitted) return;
    if (activeQuiz?.type === "single_choice" || activeQuiz?.type === "true_false" || activeQuiz?.type === "fill_blank") {
      setQuizSelectedAnswers([idx]);
    } else {
      setQuizSelectedAnswers((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
    }
  };
  const submitQuiz = () => {
    if (!activeQuiz || quizSelectedAnswers.length === 0) return;
    const correct = activeQuiz.correctAnswers.length === quizSelectedAnswers.length && activeQuiz.correctAnswers.every((a) => quizSelectedAnswers.includes(a));
    setQuizCorrect(correct);
    setQuizSubmitted(true);
    setQuizTotal((t) => t + 1);
    if (correct) setQuizScore((s) => s + activeQuiz.points);
    answeredQuizzes.current.add(activeQuiz.id);
  };
  const dismissQuiz = () => {
    setActiveQuiz(null);
    setQuizSelectedAnswers([]);
    setQuizSubmitted(false);
  };
  const continueAfterQuiz = () => {
    dismissQuiz();
    setPlaying(true);
  };
  const totalQuizPoints = VIDEO_QUIZZES.reduce((sum, q) => sum + q.points, 0);

  /* ── Bookmark helpers ── */
  const addBookmark = () => {
    const id = `VB-${Date.now()}`;
    const color = BOOKMARK_COLORS[videoBookmarks.length % BOOKMARK_COLORS.length];
    setVideoBookmarks((prev) => [...prev, { id, pct: progressPct, label: `Đánh dấu ${fmt(currentSec)}`, color }]);
  };
  const deleteBookmark = (id: string) => setVideoBookmarks((prev) => prev.filter((b) => b.id !== id));
  const saveBookmarkLabel = (id: string) => {
    setVideoBookmarks((prev) => prev.map((b) => b.id === id ? { ...b, label: bookmarkEditLabel.trim() || b.label } : b));
    setEditingBookmarkId(null);
  };

  /* ── A-B Loop helpers ── */
  const setLoopPoint = (point: "A" | "B") => {
    if (point === "A") { setLoopA(progressPct); if (loopB !== null && progressPct >= loopB) setLoopB(null); }
    else { if (loopA !== null && progressPct > loopA) { setLoopB(progressPct); setLoopActive(true); } }
  };
  const clearLoop = () => { setLoopA(null); setLoopB(null); setLoopActive(false); };

  /* ── Screenshot ── */
  const takeScreenshot = useCallback(() => {
    const w = 1280; const h = 720;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Draw simulated frame
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.3 + progressPct * 0.004, "#990803");
    grad.addColorStop(1, "#0f0f23");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    // Text overlay
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.font = "bold 48px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(currentChapter.title, w / 2, h / 2 - 20);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "24px sans-serif";
    ctx.fillText(`${fmt(currentSec)} / ${fmt(totalSec)}`, w / 2, h / 2 + 30);
    ctx.fillStyle = "rgba(200,168,78,0.15)"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "right";
    ctx.fillText("GELEXIMCO LMS", w - 20, 30);
    const link = document.createElement("a");
    link.download = `geleximco-video-${fmt(currentSec).replace(":", "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setScreenshotFlash(true);
    setTimeout(() => setScreenshotFlash(false), 300);
  }, [progressPct, currentSec, currentChapter, totalSec]);

  /* ── Timestamp comment helpers ── */
  const addTimeComment = () => {
    if (!newCommentText.trim()) return;
    const tc: TimeComment = {
      id: `TC-${Date.now()}`, pct: progressPct, user: "Bạn", initials: "ME",
      text: newCommentText.trim(), time: "Vừa xong", likes: 0,
    };
    setTimeComments((prev) => [...prev, tc].sort((a, b) => a.pct - b.pct));
    setNewCommentText("");
  };

  /* ── hover preview ── */
  const hoverSec = hoverPct !== null ? Math.round((hoverPct / 100) * totalSec) : 0;
  const hoverChapter = hoverPct !== null ? ([...chapters].reverse().find((c) => hoverPct >= c.startPct) || chapters[0]) : null;

  /* ── Quiz type labels ── */
  const quizTypeLabel = (type: string) => {
    switch (type) {
      case "single_choice": return "Một đáp án";
      case "multiple_choice": return "Nhiều đáp án";
      case "true_false": return "Đúng / Sai";
      case "fill_blank": return "Điền khuyết";
      default: return type;
    }
  };
  const quizTypeIcon = (type: string) => {
    switch (type) {
      case "single_choice": return <Target className="w-4 h-4" />;
      case "multiple_choice": return <CheckCircle2 className="w-4 h-4" />;
      case "true_false": return <ArrowLeftRight className="w-4 h-4" />;
      case "fill_blank": return <Hash className="w-4 h-4" />;
      default: return <CircleHelp className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden group select-none" onMouseMove={handleMouseMove} onMouseLeave={() => { if (playing) setShowControls(false); setHoverPct(null); }}>
      {/* Video area — click / double-click */}
      <div className="relative w-full cursor-pointer" style={{ paddingBottom: "56.25%" }} onClick={handleVideoAreaClick}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
          {/* Animated bg */}
          <div className="absolute inset-0 transition-opacity" style={{ background: `radial-gradient(ellipse at ${30 + progressPct * 0.4}% ${35 + Math.sin(progressPct / 10) * 10}%, #990803 0%, transparent 70%)`, opacity: playing ? 0.25 : 0.15 }} />

          {/* Center play button (paused & not ended) */}
          {!playing && !ended && (
            <div className="text-center z-10 pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <p className="text-white/60" style={{ fontSize: "14px" }}>{lesson.title.replace("Video: ", "")}</p>
            </div>
          )}

          {/* Playing equalizer */}
          {playing && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="flex items-end gap-1 h-8 opacity-25">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="w-1 bg-white rounded-full" style={{ height: `${40 + Math.sin((progressPct + i * 20) * 0.3) * 60}%`, transition: "height 0.3s" }} />
                ))}
              </div>
            </div>
          )}

          {/* Skip feedback overlay */}
          {skipFeedback && (
            <div
              key={skipFeedback.key}
              className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none ${skipFeedback.dir === "fwd" ? "right-[20%]" : "left-[20%]"}`}
              style={{ animation: "vpSkipFade 0.7s ease-out forwards" }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  {skipFeedback.dir === "fwd" ? <SkipForward className="w-7 h-7 text-white" /> : <SkipBack className="w-7 h-7 text-white" />}
                </div>
                <span className="text-white" style={{ fontSize: "16px", fontWeight: 700 }}>
                  {skipFeedback.dir === "fwd" ? "+10s" : "−10s"}
                </span>
              </div>
            </div>
          )}

          {/* Ended overlay */}
          {ended && (
            <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center">
              <div className="text-center">
                {autoplayCountdown !== null ? (
                  <>
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="#c8a84e" strokeWidth="4" strokeDasharray={`${(autoplayCountdown / 5) * 213.6} 213.6`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.9s linear" }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white" style={{ fontSize: "24px", fontWeight: 700 }}>{autoplayCountdown}</span>
                      </div>
                    </div>
                    <p className="text-white/80" style={{ fontSize: "14px", fontWeight: 500 }}>Bài tiếp theo trong {autoplayCountdown}s...</p>
                    <button className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer" style={{ fontSize: "12px" }} onClick={(e) => { e.stopPropagation(); setAutoplayCountdown(null); }}>
                      Hủy
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-white" style={{ fontSize: "16px", fontWeight: 600 }}>Đã hoàn thành bài học</p>
                    <div className="flex items-center gap-3 mt-4">
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer" style={{ fontSize: "13px" }} onClick={(e) => { e.stopPropagation(); setProgressPct(0); setEnded(false); }}>
                        <Repeat className="w-4 h-4 inline mr-1.5" />Xem lại
                      </button>
                      <button className="px-4 py-2 bg-[#990803] hover:bg-[#7a0602] text-white rounded-lg cursor-pointer" style={{ fontSize: "13px" }} onClick={(e) => { e.stopPropagation(); onAutoplayNext(); }}>
                        Bài tiếp theo <ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── QUIZ OVERLAY ── */}
          {activeQuiz && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-full max-w-lg mx-4">
                {/* Quiz header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#990803] flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}>KIỂM TRA KIẾN THỨC</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-white/40" style={{ fontSize: "10px" }}>
                        {quizTypeIcon(activeQuiz.type)}
                        {quizTypeLabel(activeQuiz.type)}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-[#c8a84e]/60" style={{ fontSize: "10px", fontWeight: 600 }}>{activeQuiz.points} điểm</span>
                      {activeQuiz.required && <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>Bắt buộc</span>}
                    </div>
                  </div>
                  {!activeQuiz.required && !quizSubmitted && (
                    <button className="ml-auto px-3 py-1.5 text-white/40 hover:text-white/70 cursor-pointer" style={{ fontSize: "11px" }} onClick={continueAfterQuiz}>
                      Bỏ qua →
                    </button>
                  )}
                </div>

                {/* Question */}
                <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-5 mb-4">
                  <p className="text-white mb-4" style={{ fontSize: "15px", fontWeight: 500, lineHeight: 1.6 }}>{activeQuiz.question}</p>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {activeQuiz.options.map((opt, idx) => {
                      const selected = quizSelectedAnswers.includes(idx);
                      const isCorrect = activeQuiz.correctAnswers.includes(idx);
                      const showResult = quizSubmitted;
                      return (
                        <button
                          key={idx}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer text-left ${
                            showResult
                              ? isCorrect
                                ? "bg-green-500/15 border-green-500/50 text-green-300"
                                : selected && !isCorrect
                                  ? "bg-red-500/15 border-red-500/50 text-red-300"
                                  : "bg-white/5 border-white/10 text-white/40"
                              : selected
                                ? "bg-[#c8a84e]/15 border-[#c8a84e]/50 text-white"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                          }`}
                          onClick={() => toggleQuizAnswer(idx)}
                          disabled={quizSubmitted}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            showResult
                              ? isCorrect ? "bg-green-500" : selected ? "bg-red-500" : "bg-white/10"
                              : selected ? "bg-[#c8a84e]" : "bg-white/10"
                          }`}>
                            {showResult && isCorrect ? <CircleCheck className="w-4 h-4 text-white" /> :
                             showResult && selected && !isCorrect ? <CircleX className="w-4 h-4 text-white" /> :
                             <span className="text-white/60" style={{ fontSize: "12px", fontWeight: 700 }}>{String.fromCharCode(65 + idx)}</span>}
                          </div>
                          <span style={{ fontSize: "13px" }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation after submit */}
                {quizSubmitted && (
                  <div className={`rounded-xl border p-4 mb-4 ${quizCorrect ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {quizCorrect ? <Sparkles className="w-4 h-4 text-green-400" /> : <Lightbulb className="w-4 h-4 text-orange-400" />}
                      <span className={quizCorrect ? "text-green-400" : "text-orange-400"} style={{ fontSize: "13px", fontWeight: 600 }}>{quizCorrect ? "Chính xác!" : "Chưa chính xác"}</span>
                      {quizCorrect && <span className="ml-auto text-green-400/60" style={{ fontSize: "11px", fontWeight: 600 }}>+{activeQuiz.points} điểm</span>}
                    </div>
                    <p className="text-white/60" style={{ fontSize: "12px", lineHeight: 1.5 }}>{activeQuiz.explanation}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#c8a84e]" />
                    <span className="text-white/40" style={{ fontSize: "11px" }}>
                      Điểm: <span className="text-[#c8a84e]" style={{ fontWeight: 700 }}>{quizScore}</span> / {totalQuizPoints}
                    </span>
                    <span className="text-white/20 mx-1">•</span>
                    <span className="text-white/30" style={{ fontSize: "10px" }}>{answeredQuizzes.current.size}/{VIDEO_QUIZZES.length} câu</span>
                  </div>
                  {!quizSubmitted ? (
                    <button
                      className="px-5 py-2 bg-[#990803] hover:bg-[#7a0602] text-white rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                      disabled={quizSelectedAnswers.length === 0}
                      onClick={submitQuiz}
                    >
                      Trả lời
                    </button>
                  ) : (
                    <button
                      className="px-5 py-2 bg-[#c8a84e] hover:bg-[#d4b55e] text-[#990803] rounded-xl cursor-pointer transition-all"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                      onClick={continueAfterQuiz}
                    >
                      Tiếp tục xem →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Screenshot flash */}
          {screenshotFlash && <div className="absolute inset-0 bg-white/80 z-40 pointer-events-none" style={{ animation: "screenshotFlash 0.3s ease-out forwards" }} />}

          {/* Quiz score badge (top-left when quiz answered) */}
          {answeredQuizzes.current.size > 0 && !activeQuiz && (
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10">
                <Trophy className="w-3.5 h-3.5 text-[#c8a84e]" />
                <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 700 }}>{quizScore}/{totalQuizPoints}</span>
                <span className="text-white/30" style={{ fontSize: "9px" }}>({answeredQuizzes.current.size}/{VIDEO_QUIZZES.length})</span>
              </div>
            </div>
          )}

          {/* Quiz checkpoint markers in video area */}
          {VIDEO_QUIZZES.map((q) => {
            const answered = answeredQuizzes.current.has(q.id);
            if (answered || q.triggerPct > progressPct + 5) return null;
            return (
              <div key={q.id} className="absolute z-10 pointer-events-none" style={{ left: "50%", bottom: "70px", transform: "translateX(-50%)" }}>
                <div className="flex items-center gap-1.5 bg-[#990803]/80 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
                  <Brain className="w-3 h-3 text-white" />
                  <span className="text-white/80" style={{ fontSize: "10px", fontWeight: 600 }}>Câu hỏi sắp xuất hiện...</span>
                </div>
              </div>
            );
          })}

          {/* Watermark */}
          <div className="absolute top-4 right-4 opacity-30 pointer-events-none">
            <span className="text-white/50" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em" }}>GELEXIMCO LMS</span>
          </div>

          {/* Subtitles */}
          {showSubtitles && playing && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 rounded-lg pointer-events-none max-w-[80%]">
              <p className="text-white text-center" style={{ fontSize: "15px" }}>
                {progressPct < 15 ? "Chào mừng các bạn đến với case study về quy trình ra quyết định tại ABBank..." :
                 progressPct < 30 ? "Thị trường tài chính 2025 đã chứng kiến nhiều biến động đáng kể..." :
                 progressPct < 50 ? "Quy trình ra quyết định 6 bước được áp dụng thành công tại ABBank..." :
                 progressPct < 72 ? "Việc tái cấu trúc danh mục tín dụng đã giúp giảm nợ xấu 2.3%..." :
                 progressPct < 88 ? "Bài học từ ABBank có thể áp dụng cho các đơn vị khác trong Tập đoàn..." :
                 "Câu hỏi thảo luận: Làm thế nào để áp dụng mô hình này tại đơn vị của bạn?"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inline note input */}
      {noteMode && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 p-3 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="w-4 h-4 text-[#c8a84e]" />
              <span className="text-white/80" style={{ fontSize: "12px", fontWeight: 600 }}>Ghi chú tại {fmt(currentSec)}</span>
              <button className="ml-auto text-white/40 hover:text-white/80 cursor-pointer" onClick={() => setNoteMode(false)}><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex gap-2">
              <input
                ref={noteInputRef}
                type="text" value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitNote(); if (e.key === "Escape") setNoteMode(false); }}
                placeholder="Nhập ghi chú..."
                className="flex-1 px-3 py-1.5 bg-white/10 text-white placeholder:text-white/30 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c8a84e]/50"
                style={{ fontSize: "13px" }}
              />
              <button className="px-3 py-1.5 bg-[#c8a84e] text-[#990803] rounded-lg hover:bg-[#d4b55e] cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }} onClick={submitNote}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${showControls && !ended && !activeQuiz ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Progress bar with hover preview */}
        <div className="px-4 pt-8">
          <div
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/prog hover:h-3 transition-all"
            onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverPct(null)}
          >
            {/* Heatmap overlay */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-0 group-hover/prog:opacity-100 transition-opacity">
              {heatmapRef.current.map((v, i) => v > 0 ? (
                <div key={i} className="absolute inset-y-0" style={{ left: `${i}%`, width: "1%", background: `rgba(200,168,78,${Math.min(0.5, (v / Math.max(maxHeat.current, 1)) * 0.5)})` }} />
              ) : null)}
            </div>
            <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${bufferedPct}%` }} />
            {/* A-B Loop range highlight */}
            {loopA !== null && loopB !== null && (
              <div className="absolute inset-y-0 bg-[#c8a84e]/20 rounded-full border-x-2 border-[#c8a84e]/50" style={{ left: `${loopA}%`, width: `${loopB - loopA}%` }} />
            )}
            <div className="absolute inset-y-0 left-0 bg-[#990803] rounded-full" style={{ width: `${progressPct}%`, transition: "none" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/prog:scale-100 transition-transform" style={{ left: `calc(${progressPct}% - 8px)` }} />
            {/* Chapter markers */}
            {chapters.slice(1).map((ch) => (
              <div key={ch.id} className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-[#c8a84e]/60 rounded-full group-hover/prog:h-5 transition-all" style={{ left: `${ch.startPct}%` }} />
            ))}
            {/* Quiz markers */}
            {VIDEO_QUIZZES.map((q) => (
              <div key={q.id} className="absolute top-1/2 -translate-y-1/2 group-hover/prog:h-5 transition-all" style={{ left: `${q.triggerPct}%` }}>
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${answeredQuizzes.current.has(q.id) ? "bg-green-400 border-green-500" : "bg-[#990803] border-white/60"}`} style={{ transform: "translate(-50%, -50%)" }} />
              </div>
            ))}
            {/* Bookmark markers */}
            {videoBookmarks.map((bm) => (
              <div key={bm.id} className="absolute top-1/2 group-hover/prog:h-5 transition-all" style={{ left: `${bm.pct}%`, transform: "translate(-50%, -50%)" }}>
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent" style={{ borderTopColor: bm.color }} />
              </div>
            ))}
            {/* Comment markers */}
            {timeComments.map((tc) => (
              <div key={tc.id} className="absolute top-1/2 cursor-pointer" style={{ left: `${tc.pct}%`, transform: "translate(-50%, -50%)" }}
                onMouseEnter={() => setHoveredComment(tc)} onMouseLeave={() => setHoveredComment(null)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/80" />
              </div>
            ))}
            {/* A-B loop point markers */}
            {loopA !== null && (
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${loopA}%` }}>
                <div className="w-3 h-5 bg-[#c8a84e] rounded-sm flex items-center justify-center" style={{ transform: "translateX(-50%)" }}>
                  <span className="text-[#990803]" style={{ fontSize: "7px", fontWeight: 900 }}>A</span>
                </div>
              </div>
            )}
            {loopB !== null && (
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${loopB}%` }}>
                <div className="w-3 h-5 bg-[#c8a84e] rounded-sm flex items-center justify-center" style={{ transform: "translateX(-50%)" }}>
                  <span className="text-[#990803]" style={{ fontSize: "7px", fontWeight: 900 }}>B</span>
                </div>
              </div>
            )}
            {/* Hovered comment tooltip */}
            {hoveredComment && (
              <div className="absolute bottom-full mb-3 -translate-x-1/2 pointer-events-none z-20" style={{ left: `${Math.max(10, Math.min(90, hoveredComment.pct))}%` }}>
                <div className="bg-gray-900/95 backdrop-blur rounded-lg border border-blue-400/30 px-3 py-2 shadow-xl max-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-300" style={{ fontSize: "8px", fontWeight: 700 }}>{hoveredComment.initials}</span>
                    </div>
                    <span className="text-white/70" style={{ fontSize: "10px", fontWeight: 600 }}>{hoveredComment.user}</span>
                  </div>
                  <p className="text-white/80" style={{ fontSize: "11px", lineHeight: 1.4 }}>{hoveredComment.text}</p>
                </div>
              </div>
            )}
            {/* Hover preview tooltip */}
            {hoverPct !== null && (
              <div className="absolute bottom-full mb-3 -translate-x-1/2 pointer-events-none z-10" style={{ left: `${Math.max(8, Math.min(92, hoverPct))}%` }}>
                <div className="bg-gray-900/95 backdrop-blur rounded-lg border border-white/10 px-2 py-1.5 shadow-xl">
                  <div className="w-28 h-16 rounded bg-gray-700 mb-1 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, #1a1a2e ${hoverPct * 0.3}%, #990803 ${50 + hoverPct * 0.3}%, #0f0f23 100%)` }}>
                      <Play className="w-4 h-4 text-white/30" />
                    </div>
                  </div>
                  <p className="text-white text-center" style={{ fontSize: "12px", fontWeight: 700 }}>{fmt(hoverSec)}</p>
                  {hoverChapter && <p className="text-white/50 text-center truncate max-w-[110px]" style={{ fontSize: "9px" }}>{hoverChapter.title}</p>}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-white/60" style={{ fontSize: "11px" }}>{fmt(currentSec)}</span>
            <span className="text-white/40 truncate mx-2" style={{ fontSize: "10px" }}>{currentChapter.title}</span>
            <span className="text-white/60" style={{ fontSize: "11px" }}>{fmt(totalSec)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between px-4 py-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer relative" onClick={() => skip("bwd")} title="Lùi 10 giây (←)">
              <SkipBack className="w-5 h-5" />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-white/40" style={{ fontSize: "8px", fontWeight: 700 }}>10</span>
            </button>
            <button className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer" onClick={togglePlay}>
              {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>
            <button className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer relative" onClick={() => skip("fwd")} title="Tiến 10 giây (→)">
              <SkipForward className="w-5 h-5" />
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-white/40" style={{ fontSize: "8px", fontWeight: 700 }}>10</span>
            </button>
            <div className="flex items-center gap-1 group/vol ml-1">
              <button className="p-1.5 text-white/80 hover:text-white cursor-pointer" onClick={() => setMuted(!muted)}>
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }} className="w-full h-1 accent-white cursor-pointer" />
              </div>
            </div>
            <span className="text-white/50 ml-2 hidden sm:inline" style={{ fontSize: "12px" }}>{fmt(currentSec)} / {fmt(totalSec)}</span>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Note at timestamp */}
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${noteMode ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`} onClick={() => { setNoteMode(!noteMode); if (playing) setPlaying(false); }} title="Ghi chú (N)">
              <PenLine className="w-4 h-4" />
            </button>
            {/* Screenshot */}
            <button className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer rounded" onClick={(e) => { e.stopPropagation(); takeScreenshot(); }} title="Chụp màn hình">
              <Camera className="w-4 h-4" />
            </button>
            {/* Bookmark */}
            <div className="relative">
              <button className={`p-1.5 rounded transition-colors cursor-pointer ${showBookmarkPanel ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`}
                onClick={() => { setShowBookmarkPanel(!showBookmarkPanel); setShowTimeComments(false); setShowLoopControls(false); }}
                title="Đánh dấu"
              >
                <Bookmark className="w-4 h-4" />
                {videoBookmarks.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#c8a84e] flex items-center justify-center">
                    <span className="text-[#990803]" style={{ fontSize: "7px", fontWeight: 900 }}>{videoBookmarks.length}</span>
                  </span>
                )}
              </button>
              {showBookmarkPanel && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 w-80 z-20 max-h-72 overflow-y-auto shadow-2xl">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
                    <p className="text-white/40" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>ĐÁNH DẤU</p>
                    <button className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#c8a84e]/20 text-[#c8a84e] hover:bg-[#c8a84e]/30 cursor-pointer transition-colors" style={{ fontSize: "10px", fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); addBookmark(); }}>
                      <BookmarkPlus className="w-3 h-3" /> Thêm tại {fmt(currentSec)}
                    </button>
                  </div>
                  {videoBookmarks.length === 0 ? (
                    <p className="text-white/30 text-center py-4" style={{ fontSize: "11px" }}>Chưa có bookmark nào</p>
                  ) : (
                    videoBookmarks.sort((a, b) => a.pct - b.pct).map((bm) => (
                      <div key={bm.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors group/bm">
                        <div className="w-1.5 h-4 rounded-full shrink-0" style={{ background: bm.color }} />
                        <button className="flex-1 text-left cursor-pointer" onClick={() => { setProgressPct(bm.pct); setShowBookmarkPanel(false); if (ended) { setEnded(false); setAutoplayCountdown(null); } }}>
                          {editingBookmarkId === bm.id ? (
                            <input
                              className="w-full bg-transparent text-white border-b border-[#c8a84e] outline-none"
                              style={{ fontSize: "11px" }}
                              value={bookmarkEditLabel}
                              onChange={(e) => setBookmarkEditLabel(e.target.value)}
                              onBlur={() => saveBookmarkLabel(bm.id)}
                              onKeyDown={(e) => { if (e.key === "Enter") saveBookmarkLabel(bm.id); e.stopPropagation(); }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <>
                              <p className="text-white/70 truncate" style={{ fontSize: "11px" }}>{bm.label}</p>
                              <p className="text-white/30" style={{ fontSize: "9px" }}>{fmt(Math.round((bm.pct / 100) * totalSec))}</p>
                            </>
                          )}
                        </button>
                        <button className="p-1 text-white/20 hover:text-white/60 cursor-pointer opacity-0 group-hover/bm:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setEditingBookmarkId(bm.id); setBookmarkEditLabel(bm.label); }} title="Sửa">
                          <PenLine className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-white/20 hover:text-red-400 cursor-pointer opacity-0 group-hover/bm:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); deleteBookmark(bm.id); }} title="Xóa">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* A-B Loop */}
            <div className="relative">
              <button className={`p-1.5 rounded transition-colors cursor-pointer ${loopActive ? "text-[#c8a84e] bg-white/10" : showLoopControls ? "text-white bg-white/10" : "text-white/60 hover:text-white"}`}
                onClick={() => { setShowLoopControls(!showLoopControls); setShowBookmarkPanel(false); setShowTimeComments(false); }}
                title="Lặp A-B"
              >
                <Scissors className="w-4 h-4" />
              </button>
              {showLoopControls && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 p-3 z-20 shadow-2xl" style={{ minWidth: "200px" }}>
                  <p className="text-white/40 mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>LẶP ĐOẠN A-B</p>
                  <div className="flex items-center gap-2 mb-2">
                    <button className={`flex-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${loopA !== null ? "bg-[#c8a84e]/20 text-[#c8a84e] border border-[#c8a84e]/30" : "bg-white/10 text-white/60 hover:bg-white/15 border border-white/10"}`}
                      style={{ fontSize: "11px", fontWeight: 600 }}
                      onClick={() => setLoopPoint("A")}
                    >
                      A: {loopA !== null ? fmt(Math.round((loopA / 100) * totalSec)) : "—"}
                    </button>
                    <ArrowLeftRight className="w-3 h-3 text-white/30 shrink-0" />
                    <button className={`flex-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${loopB !== null ? "bg-[#c8a84e]/20 text-[#c8a84e] border border-[#c8a84e]/30" : "bg-white/10 text-white/60 hover:bg-white/15 border border-white/10"}`}
                      style={{ fontSize: "11px", fontWeight: 600 }}
                      onClick={() => setLoopPoint("B")}
                      disabled={loopA === null}
                    >
                      B: {loopB !== null ? fmt(Math.round((loopB / 100) * totalSec)) : "—"}
                    </button>
                  </div>
                  {loopActive && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-green-400" style={{ fontSize: "10px", fontWeight: 600 }}>
                        <RotateCcw className="w-3 h-3" /> Đang lặp
                      </span>
                      <button className="px-2 py-1 bg-red-500/20 text-red-400 rounded cursor-pointer hover:bg-red-500/30 transition-colors" style={{ fontSize: "10px", fontWeight: 600 }} onClick={clearLoop}>
                        Xóa loop
                      </button>
                    </div>
                  )}
                  {!loopActive && loopA !== null && <p className="text-white/30 text-center mt-1" style={{ fontSize: "9px" }}>Đặt điểm B để bắt đầu lặp</p>}
                </div>
              )}
            </div>
            {/* Timestamp comments */}
            <div className="relative">
              <button className={`p-1.5 rounded transition-colors cursor-pointer ${showTimeComments ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`}
                onClick={() => { setShowTimeComments(!showTimeComments); setShowBookmarkPanel(false); setShowLoopControls(false); }}
                title="Bình luận theo thời gian"
              >
                <MessageSquare className="w-4 h-4" />
                {timeComments.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: "7px", fontWeight: 900 }}>{timeComments.length}</span>
                  </span>
                )}
              </button>
              {showTimeComments && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 w-80 z-20 shadow-2xl">
                  <p className="px-3 py-1.5 text-white/40 border-b border-white/5" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>BÌNH LUẬN THEO THỜI GIAN</p>
                  <div className="max-h-48 overflow-y-auto">
                    {timeComments.map((tc) => (
                      <button key={tc.id} className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setProgressPct(tc.pct); if (ended) { setEnded(false); setAutoplayCountdown(null); } }}>
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-blue-300" style={{ fontSize: "8px", fontWeight: 700 }}>{tc.initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white/60" style={{ fontSize: "10px", fontWeight: 600 }}>{tc.user}</span>
                            <span className="text-[#c8a84e]/50" style={{ fontSize: "9px" }}>{fmt(Math.round((tc.pct / 100) * totalSec))}</span>
                          </div>
                          <p className="text-white/70 truncate" style={{ fontSize: "11px" }}>{tc.text}</p>
                        </div>
                        <span className="flex items-center gap-0.5 text-white/30 shrink-0 mt-1" style={{ fontSize: "9px" }}>
                          <ThumbsUp className="w-2.5 h-2.5" />{tc.likes}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-white/5 px-3 py-2">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-2.5 py-1.5 bg-white/10 text-white placeholder:text-white/30 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                        style={{ fontSize: "11px" }}
                        placeholder={`Bình luận tại ${fmt(currentSec)}...`}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addTimeComment(); e.stopPropagation(); }}
                      />
                      <button className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer disabled:opacity-40" style={{ fontSize: "10px", fontWeight: 600 }} disabled={!newCommentText.trim()} onClick={addTimeComment}>
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Quiz results */}
            {answeredQuizzes.current.size > 0 && (
              <div className="relative">
                <button className={`p-1.5 rounded transition-colors cursor-pointer ${showQuizResults ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`}
                  onClick={() => setShowQuizResults(!showQuizResults)}
                  title="Kết quả quiz"
                >
                  <Brain className="w-4 h-4" />
                </button>
                {showQuizResults && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 w-80 z-20 shadow-2xl">
                    <div className="px-3 py-2 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <p className="text-white/40" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>KẾT QUẢ KIỂM TRA</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-[#c8a84e]" />
                          <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 700 }}>{quizScore}/{totalQuizPoints}</span>
                        </div>
                      </div>
                    </div>
                    {VIDEO_QUIZZES.map((q) => {
                      const answered = answeredQuizzes.current.has(q.id);
                      return (
                        <div key={q.id} className="flex items-center gap-2 px-3 py-2 border-b border-white/5 last:border-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${answered ? "bg-green-500/20" : "bg-white/10"}`}>
                            {answered ? <CircleCheck className="w-3 h-3 text-green-400" /> : <CircleHelp className="w-3 h-3 text-white/30" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate ${answered ? "text-white/70" : "text-white/30"}`} style={{ fontSize: "11px" }}>{q.question.slice(0, 50)}...</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-white/20" style={{ fontSize: "9px" }}>{quizTypeLabel(q.type)}</span>
                              <span className="text-[#c8a84e]/40" style={{ fontSize: "9px" }}>{q.points}đ</span>
                            </div>
                          </div>
                          {!answered && (
                            <button className="px-2 py-0.5 bg-white/10 text-white/50 rounded cursor-pointer hover:bg-white/20 transition-colors" style={{ fontSize: "9px" }} onClick={() => { setProgressPct(q.triggerPct - 1); setShowQuizResults(false); if (ended) { setEnded(false); setAutoplayCountdown(null); } }}>
                              Đến
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {/* Chapters */}
            <div className="relative">
              <button className={`p-1.5 rounded transition-colors cursor-pointer ${showChapters ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`} onClick={() => { setShowChapters(!showChapters); setShowSpeed(false); setShowQuality(false); }} title="Chương">
                <List className="w-4 h-4" />
              </button>
              {showChapters && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 w-72 z-20 max-h-60 overflow-y-auto shadow-2xl">
                  <p className="px-3 py-1.5 text-white/40 border-b border-white/5" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>DANH SÁCH CHƯƠNG</p>
                  {chapters.map((ch) => {
                    const isCur = ch.id === currentChapter.id;
                    return (
                      <button key={ch.id} className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${isCur ? "bg-white/10 text-[#c8a84e]" : "text-white/70 hover:text-white hover:bg-white/5"}`} onClick={() => { setProgressPct(ch.startPct); setShowChapters(false); if (ended) { setEnded(false); setAutoplayCountdown(null); } }}>
                        <span className="shrink-0 text-white/40" style={{ fontSize: "11px", fontWeight: 600, minWidth: "36px" }}>{ch.startTime}</span>
                        <span style={{ fontSize: "12px" }}>{ch.title}</span>
                        {isCur && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c8a84e] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Subtitles */}
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${showSubtitles ? "text-[#c8a84e]" : "text-white/60 hover:text-white"}`} onClick={() => setShowSubtitles(!showSubtitles)} title="Phụ đề">
              <Subtitles className="w-4 h-4" />
            </button>
            {/* Speed */}
            <div className="relative">
              <button className="px-1.5 py-1 text-white/70 hover:text-white transition-colors cursor-pointer rounded" style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => { setShowSpeed(!showSpeed); setShowQuality(false); setShowChapters(false); }}>
                {speed}x
              </button>
              {showSpeed && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 min-w-[100px] z-20 shadow-2xl">
                  <p className="px-3 py-1 text-white/40 border-b border-white/5" style={{ fontSize: "10px", fontWeight: 600 }}>TỐC ĐỘ</p>
                  {speeds.map((s) => (
                    <button key={s} className={`w-full px-3 py-1.5 text-left transition-colors cursor-pointer ${speed === s ? "text-[#c8a84e] bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"}`} style={{ fontSize: "12px" }} onClick={() => { setSpeed(s); setShowSpeed(false); }}>
                      {s}x {s === 1 && <span className="text-white/40 ml-1">Bình thường</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Quality */}
            <div className="relative">
              <button className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer" onClick={() => { setShowQuality(!showQuality); setShowSpeed(false); setShowChapters(false); }} title="Chất lượng">
                <SettingsIcon className="w-4 h-4" />
              </button>
              {showQuality && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur rounded-xl border border-white/10 py-1 min-w-[120px] z-20 shadow-2xl">
                  <p className="px-3 py-1 text-white/40 border-b border-white/5" style={{ fontSize: "10px", fontWeight: 600 }}>CHẤT LƯỢNG</p>
                  {qualities.map((q) => (
                    <button key={q} className={`w-full px-3 py-1.5 text-left transition-colors cursor-pointer ${quality === q.split(" ")[0] ? "text-[#c8a84e] bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"}`} style={{ fontSize: "12px" }} onClick={() => { setQuality(q.split(" ")[0]); setShowQuality(false); }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Autoplay */}
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${autoplayNext ? "text-[#c8a84e]" : "text-white/60 hover:text-white"}`} onClick={onToggleAutoplay} title={autoplayNext ? "Tự động phát: BẬT" : "Tự động phát: TẮT"}>
              <Repeat className="w-4 h-4" />
            </button>
            {/* Theater */}
            <button className={`p-1.5 rounded transition-colors cursor-pointer ${theaterMode ? "text-[#c8a84e] bg-white/10" : "text-white/60 hover:text-white"}`} onClick={onToggleTheater} title="Theater Mode (T)">
              <Monitor className="w-4 h-4" />
            </button>
            {/* PiP */}
            <button className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer hidden sm:block" title="Picture-in-Picture" onClick={() => { import("sonner").then(m => m.toast.success("Đang bật Picture-in-Picture...")); }}>
              <PictureInPicture2 className="w-4 h-4" />
            </button>
            {/* Fullscreen */}
            <button className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer" onClick={toggleFullscreen} title="Toàn màn hình (F)">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className={`absolute top-4 left-4 transition-opacity pointer-events-none ${showControls && !playing && !ended ? "opacity-100" : "opacity-0"}`}>
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <span className="text-white/50" style={{ fontSize: "10px" }}>Space: Play &bull; &larr;&rarr;: &plusmn;10s &bull; N: Ghi chú &bull; T: Theater &bull; F: Fullscreen</span>
        </div>
      </div>

      <style>{`@keyframes vpSkipFade{0%{opacity:0;transform:translateY(-50%) scale(.7)}30%{opacity:1;transform:translateY(-50%) scale(1.1)}100%{opacity:0;transform:translateY(-60%) scale(1)}}@keyframes screenshotFlash{0%{opacity:0.8}100%{opacity:0}}`}</style>
    </div>
  );
}

/* ─── Types for Document Viewer ─── */
type DocAnnotation = { id: string; page: number; paraIdx: number; text: string; selectedText?: string; author: string; initials: string; time: string; color: "yellow" | "blue" | "red" | "green"; replies: { id: string; author: string; initials: string; text: string; time: string }[] };
type DocBookmark = { page: number; label: string; createdAt: string };

/* ─── Document Viewer (Enhanced) ─── */
export function DocumentViewer({ lesson }: { lesson: Lesson }) {
  const totalPages = 18;
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"custom" | "width" | "page">("custom");
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ page: number; snippet: string }[]>([]);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const [highlightsOn, setHighlightsOn] = useState(true);
  const [readPages, setReadPages] = useState<Set<number>>(new Set([1, 2, 3]));
  const searchInputRef = useRef<HTMLInputElement>(null);
  const docAreaRef = useRef<HTMLDivElement>(null);

  /* ── Annotation state ── */
  const [annotations, setAnnotations] = useState<DocAnnotation[]>([
    { id: "a1", page: 1, paraIdx: 1, selectedText: "5 nhóm năng lực chính", text: "Cần bổ sung thêm năng lực số (Digital Competency) vào nhóm thứ 6 — rất quan trọng cho giai đoạn chuyển đổi số hiện tại.", author: "Nguyễn Văn Minh", initials: "NM", time: "08:30, 05/03/2026", color: "yellow", replies: [
      { id: "r1a", author: "Trần Thị Hoa", initials: "TH", text: "Đồng ý. Đã đề xuất lên Ban Đào tạo trong Q1/2026.", time: "09:15, 05/03/2026" }
    ] },
    { id: "a2", page: 1, paraIdx: 2, selectedText: "thang 5 cấp độ từ Nhập môn đến Chuyên gia", text: "Thang 5 cấp độ nên có rubric chi tiết hơn cho từng lĩnh vực. BĐS và Tài chính sẽ rất khác nhau.", author: "Lê Hoàng Anh", initials: "LA", time: "14:20, 06/03/2026", color: "blue", replies: [] },
    { id: "a3", page: 3, paraIdx: 0, selectedText: "thiết lập KPI, OKR và các hệ thống đo lường hiệu su��t", text: "KPI/OKR nên được tích hợp trực tiếp vào dashboard LMS để tracking realtime thay vì review hàng quý.", author: "Phạm Đức Thắng", initials: "PĐ", time: "10:45, 07/03/2026", color: "red", replies: [
      { id: "r3a", author: "Nguyễn Văn Minh", initials: "NM", text: "Module OKR tracking đang được phát triển, dự kiến Q2/2026.", time: "11:30, 07/03/2026" },
      { id: "r3b", author: "Trần Thị Hoa", initials: "TH", text: "Cần thêm tính năng alert khi KPI dưới ngưỡng.", time: "13:00, 07/03/2026" }
    ] },
    { id: "a4", page: 4, paraIdx: 2, selectedText: "200 cặp mentor-mentee xuyên đơn vị", text: "Chương trình Mentoring rất hiệu quả! Đề xuất mở rộng cho cấp Chuyên viên chính.", author: "Vũ Thị Mai", initials: "VM", time: "16:00, 08/03/2026", color: "green", replies: [] },
    { id: "a5", page: 9, paraIdx: 0, text: "Đánh giá 360 cần đảm bảo t��nh ẩn danh. Một số đơn vị phản ánh nhân sự ngại đánh giá cấp trên.", author: "Đỗ Quốc Hùng", initials: "QH", time: "09:00, 09/03/2026", color: "red", replies: [
      { id: "r5a", author: "Nguyễn Văn Minh", initials: "NM", text: "Đã có policy bảo mật đánh giá. Sẽ truyền thông lại cho các đơn vị.", time: "10:00, 09/03/2026" }
    ] },
  ]);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [annotatingPara, setAnnotatingPara] = useState<number | null>(null);
  const [annotationText, setAnnotationText] = useState("");
  const [annotationColor, setAnnotationColor] = useState<DocAnnotation["color"]>("yellow");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const annotationInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  /* ── Bookmark state ── */
  const [bookmarks, setBookmarks] = useState<DocBookmark[]>([
    { page: 1, label: "Tổng quan Khung Năng lực", createdAt: "04/03/2026" },
    { page: 9, label: "Phương pháp Đánh giá 360 độ", createdAt: "07/03/2026" },
    { page: 12, label: "Chương trình Đào tạo Theo Cấp", createdAt: "08/03/2026" },
  ]);
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  const isBookmarked = (pg: number) => bookmarks.some((b) => b.page === pg);

  /* ── Text Selection Annotation state ── */
  const [textSelection, setTextSelection] = useState<{ text: string; paraIdx: number; rect: { top: number; left: number; width: number } } | null>(null);
  const [selAnnotText, setSelAnnotText] = useState("");
  const [selAnnotColor, setSelAnnotColor] = useState<DocAnnotation["color"]>("yellow");
  const [showSelAnnotInput, setShowSelAnnotInput] = useState(false);
  const selAnnotInputRef = useRef<HTMLInputElement>(null);
  const docContentRef = useRef<HTMLDivElement>(null);

  /* ── Text selection handler ── */
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      // Don't clear if we're showing the annotation input
      if (!showSelAnnotInput) setTextSelection(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length < 2) return;

    // Find which paragraph the selection is in
    const anchorNode = selection.anchorNode;
    if (!anchorNode || !docContentRef.current) return;

    // Walk up to find [data-para-idx]
    let el: HTMLElement | null = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode as HTMLElement;
    let paraIdx = -1;
    while (el && el !== docContentRef.current) {
      const idx = el.getAttribute?.("data-para-idx");
      if (idx !== null && idx !== undefined) { paraIdx = parseInt(idx, 10); break; }
      el = el.parentElement;
    }
    if (paraIdx === -1) return;

    // Get position relative to doc content
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = docContentRef.current.getBoundingClientRect();
    setTextSelection({
      text,
      paraIdx,
      rect: { top: rect.top - containerRect.top, left: rect.left - containerRect.left + rect.width / 2, width: rect.width },
    });
  }, [showSelAnnotInput]);

  useEffect(() => {
    const el = docContentRef.current;
    if (!el) return;
    el.addEventListener("mouseup", handleTextSelect);
    return () => el.removeEventListener("mouseup", handleTextSelect);
  }, [handleTextSelect]);

  const submitSelectionAnnotation = () => {
    if (!selAnnotText.trim() || !textSelection) return;
    const newA: DocAnnotation = {
      id: `a${Date.now()}`, page: currentPage, paraIdx: textSelection.paraIdx,
      selectedText: textSelection.text,
      text: selAnnotText.trim(), author: "Bạn", initials: "BN",
      time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
      color: selAnnotColor, replies: [],
    };
    setAnnotations((prev) => [...prev, newA]);
    setSelAnnotText("");
    setTextSelection(null);
    setShowSelAnnotInput(false);
    setShowAnnotationPanel(true);
    window.getSelection()?.removeAllRanges();
  };

  const cancelSelectionAnnotation = () => {
    setTextSelection(null);
    setShowSelAnnotInput(false);
    setSelAnnotText("");
    window.getSelection()?.removeAllRanges();
  };

  /* ── Export functions ── */
  const colorLabelMap: Record<string, string> = { yellow: "Ghi chú", blue: "Câu hỏi", red: "Quan trọng", green: "Đồng ý" };

  const exportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ["STT", "Trang", "Chương", "Đoạn", "Đoạn text được chọn", "Nội dung ghi chú", "Phân loại", "Tác giả", "Thời gian", "Số trả lời", "Nội dung trả lời"];
    const rows = annotations.map((a, idx) => {
      const pg = pageData[Math.min(a.page - 1, pageData.length - 1)];
      const repliesText = a.replies.map((r) => `${r.author} (${r.time}): ${r.text}`).join(" | ");
      return [
        idx + 1,
        a.page,
        `Ch.${pg.chapter}: ${pg.title}`,
        `Đoạn ${a.paraIdx + 1}`,
        a.selectedText || "",
        a.text,
        colorLabelMap[a.color] || a.color,
        a.author,
        a.time,
        a.replies.length,
        repliesText,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const csv = BOM + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Geleximco_LMS_Annotations_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const groupedByPage = annotations.reduce<Record<number, DocAnnotation[]>>((acc, a) => {
      (acc[a.page] = acc[a.page] || []).push(a);
      return acc;
    }, {});
    const sortedPages = Object.keys(groupedByPage).map(Number).sort((a, b) => a - b);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Báo cáo Ghi chú — Geleximco LMS</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: #fff; }
  .header { text-align: center; border-bottom: 3px solid #990803; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #990803; font-size: 22px; margin-bottom: 4px; }
  .header .sub { color: #666; font-size: 12px; }
  .header .logo { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .header .logo-box { background: #990803; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .stats { display: flex; gap: 24px; justify-content: center; margin: 16px 0 24px; }
  .stat { text-align: center; }
  .stat .num { font-size: 24px; font-weight: 700; color: #990803; }
  .stat .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .page-section { margin-bottom: 28px; break-inside: avoid; }
  .page-title { background: #f8f8f8; border-left: 4px solid #990803; padding: 8px 14px; font-size: 13px; font-weight: 600; color: #990803; margin-bottom: 12px; border-radius: 0 4px 4px 0; }
  .annotation { border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
  .anno-header { padding: 10px 14px; display: flex; align-items: center; gap: 10px; }
  .anno-header.yellow { background: #fffef0; border-bottom: 1px solid #fde68a; }
  .anno-header.blue { background: #f0f7ff; border-bottom: 1px solid #bfdbfe; }
  .anno-header.red { background: #fff5f5; border-bottom: 1px solid #fecaca; }
  .anno-header.green { background: #f0fdf4; border-bottom: 1px solid #bbf7d0; }
  .avatar { width: 28px; height: 28px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .avatar.yellow { background: #f59e0b; }
  .avatar.blue { background: #3b82f6; }
  .avatar.red { background: #ef4444; }
  .avatar.green { background: #22c55e; }
  .anno-meta { flex: 1; }
  .anno-author { font-size: 12px; font-weight: 600; color: #333; }
  .anno-info { font-size: 9px; color: #999; margin-top: 1px; }
  .badge { font-size: 9px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
  .badge.yellow { background: #fef3c7; color: #92400e; }
  .badge.blue { background: #dbeafe; color: #1e40af; }
  .badge.red { background: #fee2e2; color: #991b1b; }
  .badge.green { background: #dcfce7; color: #166534; }
  .selected-quote { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 12px; margin: 8px 14px; font-size: 11px; color: #78716c; font-style: italic; border-radius: 0 4px 4px 0; }
  .anno-text { padding: 8px 14px; font-size: 12px; line-height: 1.6; color: #444; }
  .reply { padding: 6px 14px 6px 28px; border-top: 1px solid #f3f3f3; font-size: 11px; color: #666; display: flex; gap: 6px; }
  .reply-arrow { color: #ccc; font-size: 10px; flex-shrink: 0; }
  .reply-author { font-weight: 600; color: #555; white-space: nowrap; }
  .reply-time { font-size: 9px; color: #aaa; }
  .footer { text-align: center; border-top: 1px solid #e5e5e5; padding-top: 16px; margin-top: 32px; font-size: 10px; color: #999; }
  @media print { body { padding: 20px; } .page-section { break-inside: avoid; } }
</style></head><body>
<div class="header">
  <div class="logo"><span class="logo-box">GX</span> GELEXIMCO GROUP</div>
  <h1>Báo cáo Tổng hợp Ghi chú & Nhận xét</h1>
  <p class="sub">Tài liệu: Sổ tay Khung Năng lực Lãnh đạo v3.2 — Xuất ngày: ${new Date().toLocaleDateString("vi-VN")}</p>
</div>
<div class="stats">
  <div class="stat"><div class="num">${annotations.length}</div><div class="label">Ghi chú</div></div>
  <div class="stat"><div class="num">${annotations.reduce((s, a) => s + a.replies.length, 0)}</div><div class="label">Phản hồi</div></div>
  <div class="stat"><div class="num">${sortedPages.length}</div><div class="label">Trang có ghi chú</div></div>
  <div class="stat"><div class="num">${new Set(annotations.map((a) => a.author)).size}</div><div class="label">Người tham gia</div></div>
</div>
${sortedPages.map((pg) => {
  const pgInfo = pageData[Math.min(pg - 1, pageData.length - 1)];
  const annos = groupedByPage[pg];
  return `<div class="page-section">
  <div class="page-title">Trang ${pg} — Chương ${pgInfo.chapter}: ${pgInfo.title}</div>
  ${annos.map((a) => `<div class="annotation">
    <div class="anno-header ${a.color}">
      <div class="avatar ${a.color}">${a.initials}</div>
      <div class="anno-meta">
        <div class="anno-author">${a.author}</div>
        <div class="anno-info">Đoạn ${a.paraIdx + 1} &bull; ${a.time}</div>
      </div>
      <span class="badge ${a.color}">${colorLabelMap[a.color]}</span>
    </div>
    ${a.selectedText ? `<div class="selected-quote">"${a.selectedText}"</div>` : ""}
    <div class="anno-text">${a.text}</div>
    ${a.replies.map((r) => `<div class="reply"><span class="reply-arrow">↳</span><span class="reply-author">${r.author}</span><span class="reply-time">${r.time}</span><span>${r.text}</span></div>`).join("")}
  </div>`).join("")}
</div>`;
}).join("")}
<div class="footer">
  <p>Geleximco LMS — Ban Nhân sự Tập đoàn — Phòng Đào tạo & Phát triển</p>
  <p style="margin-top:4px">Báo cáo được tạo tự động từ hệ thống LMS | ${new Date().toLocaleString("vi-VN")}</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => { setTimeout(() => { win.print(); }, 500); };
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  /* ── Page data for rich content & search ── */
  const pageData: { chapter: string; title: string; paragraphs: string[]; hasTable?: boolean; hasChart?: boolean; highlights?: { text: string; color: string }[] }[] = [
    { chapter: "1", title: "Tổng quan Khung Năng lực", paragraphs: [
      "Khung năng lực lãnh đạo Geleximco được xây dựng dựa trên mô hình năng lực quản trị hiện đại, kết hợp đặc thù văn hóa doanh nghiệp Việt Nam và chiến lược phát triển đa ngành của Tập đoàn.",
      "Hệ thống đánh giá bao gồm 5 nhóm năng lực chính: (1) Tư duy chiến lược, (2) Quản lý & Điều hành, (3) Lãnh đạo con người, (4) Giao tiếp & Ảnh hưởng, (5) Học hỏi & Phát triển bản thân.",
      "Mỗi nhóm năng lực được đánh giá theo thang 5 cấp độ từ Nhập môn đến Chuyên gia, với các chỉ số hành vi cụ thể và tiêu chí đo lường rõ ràng.",
    ], hasTable: true, highlights: [{ text: "5 nhóm năng lực chính", color: "bg-yellow-200/70" }, { text: "5 cấp độ", color: "bg-blue-200/60" }] },
    { chapter: "2", title: "Tư duy Chiến lược", paragraphs: [
      "Tư duy chiến lược là năng lực nền tảng cho mọi cấp lãnh đạo tại Geleximco. Năng lực này bao gồm khả năng nhìn nhận bức tranh toàn cảnh, dự báo xu hướng và đưa ra định hướng phát triển dài hạn.",
      "Ở cấp độ cơ bản, lãnh đạo cần hiểu được chiến lược tổng thể của Tập đoàn và mối liên hệ với đơn vị mình. Ở cấp độ chuyên gia, lãnh đạo có khả năng xây dựng chiến lược mới và dẫn dắt tổ chức qua các giai đoạn chuyển đổi.",
      "Đặc biệt, khung năng lực được thiết kế linh hoạt theo 10 lĩnh vực kinh doanh của Tập đoàn: Tài chính-NH, BĐS, Năng lượng, VLXD, Khoáng sản, Hạ tầng KCN, Thương mại-XNK, Giáo dục, Nông nghiệp CNC, và Công nghệ.",
    ], highlights: [{ text: "Tư duy chiến lược", color: "bg-yellow-200/70" }] },
    { chapter: "3", title: "Quản lý & Điều hành", paragraphs: [
      "Năng lực quản lý và điều hành tập trung vào khả năng tổ chức, phân bổ nguồn lực và giám sát thực thi các kế hoạch chiến lược. Lãnh đạo cần thành thạo trong việc thiết lập KPI, OKR và các hệ thống đo lường hiệu suất.",
      "Quy trình đánh giá được thực hiện hàng quý tại mỗi đơn vị thành viên, với kết quả tổng hợp về Ban Nhân sự Tập đoàn để phân tích xu hướng và lên kế hoạch đào tạo phù hợp.",
      "Mô hình quản lý PDCA (Plan-Do-Check-Act) được áp dụng xuyên suốt, từ cấp Tập đoàn đến từng phòng ban chức năng tại 14 công ty thành viên.",
    ], hasChart: true, highlights: [{ text: "KPI, OKR", color: "bg-green-200/60" }, { text: "PDCA", color: "bg-purple-200/60" }] },
    { chapter: "4", title: "Lãnh đạo Con người", paragraphs: [
      "Lãnh đạo con người là năng lực thiết yếu để xây dựng đội nhóm hiệu quả. Bao gồm khả năng truyền cảm hứng, phát triển nhân tài, tạo môi trường làm việc tích cực và quản lý xung đột.",
      "Với quy mô 6,610 nhân sự phân bố trên 14 đơn vị, việc phát triển năng lực lãnh đạo con người trở thành ưu tiên hàng đầu trong chiến lược nhân sự của Geleximco giai đoạn 2025-2030.",
      "Chương trình Mentoring & Coaching nội bộ đã được triển khai từ Q3/2025, kết nối hơn 200 cặp mentor-mentee xuyên đơn vị, tạo mạng lưới chia sẻ tri thức toàn Tập đoàn.",
    ], highlights: [{ text: "6,610 nhân sự", color: "bg-yellow-200/70" }, { text: "Mentoring & Coaching", color: "bg-blue-200/60" }] },
    { chapter: "5", title: "Giao tiếp & Ảnh hưởng", paragraphs: [
      "Năng lực giao tiếp và ảnh hưởng quyết định khả năng lãnh đạo xây dựng mối quan hệ, thuyết phục stakeholder và truyền đạt tầm nhìn chiến lược một cách hiệu quả.",
      "Trong bối cảnh Tập đoàn đa ngành, lãnh đạo cần có khả năng giao tiếp liên văn hóa, quản lý kỳ vọng của nhiều bên liên quan từ cổ đông, đối tác đến nhân viên tuyến đầu.",
      "Các kỹ thuật thuyết trình, đàm phán và xử lý khủng hoảng truyền thông được đào tạo chuyên sâu thông qua các workshop thực hành và mô phỏng tình huống thực tế.",
    ] },
    { chapter: "6", title: "Năng lực Chuyên môn Tài chính-NH", paragraphs: [
      "Lĩnh vực Tài chính-Ngân hàng (ABBank, Chứng khoán An Bình) yêu cầu năng lực chuyên sâu về quản trị rủi ro tín dụng, tuân thủ quy định Basel III/IV, và phân tích thị trường tài chính.",
      "Lãnh đạo khối tài chính cần nắm vững các sản phẩm fintech, ngân hàng số và chiến lược chuyển đổi số trong lĩnh vực dịch vụ tài chính hiện đại.",
      "Chương trình đào tạo chứng chỉ CFA, FRM được Tập đoàn tài trợ 100% cho cán bộ quy hoạch cấp quản lý tại các đơn vị tài chính.",
    ], hasTable: true },
    { chapter: "7", title: "Năng lực Chuyên môn BĐS", paragraphs: [
      "Khối Bất động sản (Geleximco BĐS, KĐT Lê Trọng Tấn, Dự án An Khánh) yêu cầu năng lực phân tích thị trường bất động sản, quản lý dự án quy mô lớn và phát triển sản phẩm phù hợp phân khúc.",
      "Lãnh đạo BĐS cần am hiểu pháp lý đất đai, quy hoạch đô thị, và có khả năng quản lý chuỗi giá trị từ nghiên cứu thị trường đến bàn giao và vận hành dự án.",
    ] },
    { chapter: "8", title: "Năng lực Chuyên môn Năng lượng & VLXD", paragraphs: [
      "Khối Năng lượng (Thủy điện Quảng Ninh, Nhiệt điện Thăng Long) và VLXD (Xi măng Thăng Long) yêu cầu năng lực quản lý vận hành nhà máy, an toàn lao động, và tối ưu hóa sản xuất.",
      "Công nghệ xanh và phát triển bền vững là xu hướng chuyển đổi quan trọng, đòi hỏi lãnh đạo cần cập nhật kiến thức về ESG, carbon footprint và năng lượng tái tạo.",
      "Hệ thống quản lý chất lượng ISO 9001, ISO 14001, ISO 45001 được triển khai đồng bộ tại tất cả nhà máy sản xuất trong Tập đoàn.",
    ], highlights: [{ text: "ESG, carbon footprint", color: "bg-green-200/60" }] },
    { chapter: "9", title: "Phương pháp Đánh giá 360 độ", paragraphs: [
      "Phương pháp đánh giá 360 độ được áp dụng cho toàn bộ cấp quản lý từ Trưởng phòng trở lên, thu thập phản hồi từ cấp trên, đồng nghiệp, cấp dưới và đối tác liên quan.",
      "Quy trình đánh giá bao gồm: (1) Tự đánh giá, (2) Đánh giá từ quản lý trực tiếp, (3) Đánh giá từ đồng nghiệp, (4) Đánh giá từ cấp dưới, (5) Phản hồi 1-on-1 và lập kế hoạch phát triển.",
      "Dữ liệu đánh giá được phân tích tự động bởi hệ thống LMS, tạo báo cáo năng lực cá nhân và đề xuất lộ trình đào tạo phù hợp cho từng lãnh đạo.",
    ], hasChart: true, highlights: [{ text: "360 độ", color: "bg-yellow-200/70" }] },
    { chapter: "10", title: "KPI & Tiêu chí Đo lường", paragraphs: [
      "Hệ thống KPI cho từng nhóm năng lực được thiết kế theo nguyên tắc SMART, gắn liền với mục tiêu kinh doanh của từng đơn vị và chiến lược tổng thể của Tập đoàn.",
      "Các chỉ tiêu đo lường bao gồm: tỷ lệ hoàn thành đào tạo, điểm đánh giá năng lực, mức độ cải thiện sau đào tạo, và đóng góp vào kết quả kinh doanh thực tế.",
    ], hasTable: true },
    { chapter: "11", title: "Lộ trình Phát triển Cá nhân (IDP)", paragraphs: [
      "Mỗi lãnh đạo được xây dựng Lộ trình Phát triển Cá nhân (Individual Development Plan) dựa trên kết quả đánh giá năng lực và nguyện vọng phát triển sự nghiệp.",
      "IDP bao gồm: mục tiêu phát triển 12 tháng, các khóa học bắt buộc và tự chọn, dự án thực hành, và chỉ tiêu mentor/coaching sessions cần hoàn thành.",
      "Hệ thống LMS tự động theo dõi tiến độ IDP và gửi nhắc nhở, báo cáo định kỳ cho cả học viên và quản lý trực tiếp.",
    ] },
    { chapter: "12", title: "Chương trình Đào tạo Theo Cấp", paragraphs: [
      "Cấp Trưởng phòng: 80 giờ đào tạo/năm, tập trung quản lý đội nhóm, quản lý dự án và kỹ năng mềm cơ bản.",
      "Cấp Phó Giám đốc: 100 giờ đào tạo/năm, bao gồm chiến lược kinh doanh, tài chính cho lãnh đạo và quản trị rủi ro.",
      "Cấp Giám đốc/TGĐ đơn vị: 120 giờ đào tạo/năm, tập trung quản trị cấp cao, leadership development và digital transformation.",
    ], hasTable: true, highlights: [{ text: "80 giờ", color: "bg-blue-200/60" }, { text: "100 giờ", color: "bg-green-200/60" }, { text: "120 giờ", color: "bg-purple-200/60" }] },
    { chapter: "13", title: "Công nghệ & Nền tảng Hỗ trợ", paragraphs: [
      "Hệ thống LMS Geleximco hỗ trợ đa nền tảng (web, mobile), tích hợp SCORM 2004, xAPI, video conference và AI-powered learning path recommendation.",
      "Chatbot GelBot hỗ trợ học viên 24/7 với khả năng trả lời câu hỏi về khóa học, tra cứu tài liệu và đề xuất nội dung học tập phù hợp.",
    ] },
    { chapter: "14", title: "Đánh giá Hiệu quả Đào tạo", paragraphs: [
      "Mô hình Kirkpatrick 4 cấp độ được áp dụng để đánh giá hiệu quả đào tạo: (1) Phản ứng, (2) Học tập, (3) Hành vi, (4) Kết quả kinh doanh.",
      "ROI đào tạo được tính toán dựa trên so sánh chi phí đầu tư đào tạo với mức cải thiện hiệu suất và doanh thu đo được sau mỗi chương trình.",
    ], hasChart: true, highlights: [{ text: "Kirkpatrick 4 cấp độ", color: "bg-yellow-200/70" }] },
    { chapter: "PL-A", title: "Phụ lục A — Biểu mẫu Tự đánh giá", paragraphs: [
      "Biểu mẫu tự đánh giá năng lực dành cho lãnh đạo cấp trung. Hướng dẫn: Chấm điểm từ 1-5 cho mỗi năng lực, ghi nhận minh chứng cụ thể và kế hoạch cải thiện.",
      "Lưu ý: Biểu mẫu cần hoàn thành trước ngày 15 hàng quý và nộp qua hệ thống LMS. Kết quả sẽ được review bởi quản lý trực tiếp trong buổi 1-on-1.",
    ], hasTable: true },
    { chapter: "PL-B", title: "Phụ lục B — Mẫu IDP", paragraphs: [
      "Mẫu Lộ trình Phát triển Cá nhân (IDP) tiêu chuẩn. Bao gồm các phần: Thông tin cá nhân, Kết quả đánh giá hiện tại, Mục tiêu phát triển, Kế hoạch hành động, Nguồn lực cần thiết.",
      "Mẫu này đã được chuẩn hóa và tích hợp trực tiếp vào module IDP trên hệ thống LMS, hỗ trợ tạo tự động từ kết quả đánh giá 360 độ.",
    ] },
    { chapter: "PL-C", title: "Phụ lục C — Danh mục Khóa học", paragraphs: [
      "Danh mục 18 danh mục đào tạo chính thức của Tập đoàn Geleximco: An toàn lao động, Chuyển đổi số, Đào tạo Hội nhập, ESG & Phát triển bền vững, Kỹ năng Lãnh đạo, Kỹ năng Mềm, Kỹ năng Quản lý, Luật & Tuân thủ, Ngoại ngữ, Phát triển Bản thân, Quản lý Dự án, Quản lý Tài chính, Quản trị Rủi ro, Sáng tạo & Đổi mới, Bán hàng & Marketing, Chăm sóc Khách hàng, Chuyên môn Ngành, và Văn hóa Doanh nghiệp.",
      "Mỗi danh mục bao gồm từ 5-15 khóa học, tổng cộng hơn 180 khóa học đang hoạt động trên hệ thống LMS.",
    ] },
    { chapter: "PL-D", title: "Phụ lục D — Liên hệ & Hỗ trợ", paragraphs: [
      "Ban Nhân sự Tập đoàn Geleximco — Phòng Đào tạo & Phát triển. Địa chỉ: Tầng 15, Tòa nhà Geleximco, 36 Hoàng Cầu, Đống Đa, Hà Nội.",
      "Hotline hỗ trợ LMS: 1900-xxxx (giờ hành chính). Email: daotao@geleximco.com.vn. Website: lms.geleximco.com.vn. Chatbot GelBot: truy cập qua LMS 24/7.",
    ] },
  ];

  const getPageInfo = (pg: number) => pageData[Math.min(pg - 1, pageData.length - 1)];
  const allText = pageData.map((p, i) => ({ page: i + 1, text: [p.title, ...p.paragraphs].join(" ") }));

  /* ── Search ── */
  const performSearch = (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    const results: { page: number; snippet: string }[] = [];
    allText.forEach(({ page, text }) => {
      const idx = text.toLowerCase().indexOf(lower);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + q.length + 40);
        results.push({ page, snippet: (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "") });
      }
    });
    setSearchResults(results);
    setActiveResultIdx(0);
    if (results.length > 0) setCurrentPage(results[0].page);
  };

  const goToResult = (idx: number) => {
    const clamped = ((idx % searchResults.length) + searchResults.length) % searchResults.length;
    setActiveResultIdx(clamped);
    setCurrentPage(searchResults[clamped].page);
  };

  /* ── Reading progress tracking ── */
  const goToPage = (pg: number) => {
    const clamped = Math.max(1, Math.min(totalPages, pg));
    setCurrentPage(clamped);
    setReadPages((prev) => new Set([...prev, clamped]));
  };
  useEffect(() => { setReadPages((prev) => new Set([...prev, currentPage])); }, [currentPage]);

  const readProgressPct = Math.round((readPages.size / totalPages) * 100);

  /* ── Fit modes ── */
  const applyFit = (mode: "width" | "page" | "custom") => {
    setFitMode(mode);
    if (mode === "width") setZoom(115);
    else if (mode === "page") setZoom(85);
  };

  /* ── Annotation helpers ── */
  const pageAnnotations = annotations.filter((a) => a.page === currentPage);
  const totalAnnotations = annotations.length;
  const paraHasAnnotation = (pIdx: number) => pageAnnotations.some((a) => a.paraIdx === pIdx);
  const paraAnnotations = (pIdx: number) => pageAnnotations.filter((a) => a.paraIdx === pIdx);

  const submitAnnotation = (overrideSelectedText?: string) => {
    if (!annotationText.trim() || annotatingPara === null) return;
    const newA: DocAnnotation = {
      id: `a${Date.now()}`, page: currentPage, paraIdx: annotatingPara,
      selectedText: overrideSelectedText || undefined,
      text: annotationText.trim(), author: "Bạn", initials: "BN",
      time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
      color: annotationColor, replies: [],
    };
    setAnnotations((prev) => [...prev, newA]);
    setAnnotationText("");
    setAnnotatingPara(null);
    setShowAnnotationPanel(true);
  };

  const submitReply = (annotationId: string) => {
    if (!replyText.trim()) return;
    setAnnotations((prev) => prev.map((a) => a.id === annotationId ? {
      ...a, replies: [...a.replies, {
        id: `r${Date.now()}`, author: "Bạn", initials: "BN", text: replyText.trim(),
        time: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
      }]
    } : a));
    setReplyText("");
    setReplyingTo(null);
  };

  const deleteAnnotation = (id: string) => setAnnotations((prev) => prev.filter((a) => a.id !== id));

  const annotationColorMap = { yellow: { bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-400", ring: "ring-yellow-300" }, blue: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400", ring: "ring-blue-300" }, red: { bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400", ring: "ring-red-300" }, green: { bg: "bg-green-50", border: "border-green-200", dot: "bg-green-400", ring: "ring-green-300" } };

  /* ── Bookmark helpers ── */
  const toggleBookmark = (pg: number) => {
    if (isBookmarked(pg)) {
      setBookmarks((prev) => prev.filter((b) => b.page !== pg));
    } else {
      const pgInfo = getPageInfo(pg);
      setBookmarks((prev) => [...prev, { page: pg, label: pgInfo.title, createdAt: new Date().toLocaleDateString("vi-VN") }]);
    }
  };

  /* ── Highlight rendering helper ── */
  const renderParagraph = (text: string, highlights?: { text: string; color: string }[], searchQ?: string, paraIdx?: number) => {
    // Gather annotation selection highlights for this paragraph
    const annoSelections = paraIdx !== undefined ? pageAnnotations.filter((a) => a.paraIdx === paraIdx && a.selectedText).map((a) => ({
      text: a.selectedText!, color: a.color === "yellow" ? "bg-yellow-100/80 underline decoration-yellow-400 decoration-wavy decoration-1" : a.color === "blue" ? "bg-blue-100/80 underline decoration-blue-400 decoration-wavy decoration-1" : a.color === "red" ? "bg-red-100/80 underline decoration-red-400 decoration-wavy decoration-1" : "bg-green-100/80 underline decoration-green-400 decoration-wavy decoration-1"
    })) : [];
    const hasAnnoSel = annoSelections.length > 0;
    if (!highlightsOn && !searchQ && !hasAnnoSel) return text;
    let parts: { text: string; highlight?: string }[] = [{ text }];
    // apply document highlights
    if (highlightsOn && highlights) {
      highlights.forEach((h) => {
        const newParts: typeof parts = [];
        parts.forEach((part) => {
          if (part.highlight) { newParts.push(part); return; }
          const idx = part.text.indexOf(h.text);
          if (idx === -1) { newParts.push(part); return; }
          if (idx > 0) newParts.push({ text: part.text.slice(0, idx) });
          newParts.push({ text: h.text, highlight: h.color });
          if (idx + h.text.length < part.text.length) newParts.push({ text: part.text.slice(idx + h.text.length) });
        });
        parts = newParts;
      });
    }
    // apply annotation text-selection highlights
    if (hasAnnoSel) {
      annoSelections.forEach((h) => {
        const newParts: typeof parts = [];
        parts.forEach((part) => {
          if (part.highlight) { newParts.push(part); return; }
          const lower = part.text.toLowerCase();
          const idx = lower.indexOf(h.text.toLowerCase());
          if (idx === -1) { newParts.push(part); return; }
          if (idx > 0) newParts.push({ text: part.text.slice(0, idx) });
          newParts.push({ text: part.text.slice(idx, idx + h.text.length), highlight: h.color });
          if (idx + h.text.length < part.text.length) newParts.push({ text: part.text.slice(idx + h.text.length) });
        });
        parts = newParts;
      });
    }
    // apply search highlight
    if (searchQ && searchQ.trim()) {
      const lower = searchQ.toLowerCase();
      const newParts: typeof parts = [];
      parts.forEach((part) => {
        if (part.highlight) { newParts.push(part); return; }
        const idx = part.text.toLowerCase().indexOf(lower);
        if (idx === -1) { newParts.push(part); return; }
        if (idx > 0) newParts.push({ text: part.text.slice(0, idx) });
        newParts.push({ text: part.text.slice(idx, idx + searchQ.length), highlight: "bg-orange-300/80 ring-1 ring-orange-400" });
        if (idx + searchQ.length < part.text.length) newParts.push({ text: part.text.slice(idx + searchQ.length) });
      });
      parts = newParts;
    }
    return (<>{parts.map((p, i) => p.highlight ? <mark key={i} className={`${p.highlight} px-0.5 rounded-sm`} style={{ textDecoration: "none" }}>{p.text}</mark> : <span key={i}>{p.text}</span>)}</>);
  };

  const pageInfo = getPageInfo(currentPage);
  const searchActive = showSearch && searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 16rem)" }}>
      {/* ── Toolbar ── */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Thumbnail toggle */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showThumbnails ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => setShowThumbnails(!showThumbnails)} title="Bảng mục lục">
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700 hidden sm:inline truncate max-w-[200px]" style={{ fontSize: "13px", fontWeight: 500 }}>{lesson.title.replace("Tài liệu: ", "")}</span>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>PDF &bull; 2.4 MB</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showSearch ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100); }} title="Tìm kiếm (Ctrl+F)">
            <Search className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Zoom */}
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.max(50, z - 25)); setFitMode("custom"); }}><ZoomOut className="w-4 h-4" /></button>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600" style={{ fontSize: "11px", fontWeight: 500, minWidth: "42px", textAlign: "center" }}>{zoom}%</span>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.min(200, z + 25)); setFitMode("custom"); }}><ZoomIn className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Fit modes */}
          <button className={`px-2 py-1 rounded cursor-pointer transition-colors ${fitMode === "width" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 600 }} onClick={() => applyFit(fitMode === "width" ? "custom" : "width")} title="Vừa chiều rộng">
            Rộng
          </button>
          <button className={`px-2 py-1 rounded cursor-pointer transition-colors ${fitMode === "page" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 600 }} onClick={() => applyFit(fitMode === "page" ? "custom" : "page")} title="Vừa trang">
            Trang
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Highlight toggle */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${highlightsOn ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setHighlightsOn(!highlightsOn)} title={highlightsOn ? "Tắt highlight" : "Bật highlight"}>
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Bookmark current page */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${isBookmarked(currentPage) ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => toggleBookmark(currentPage)} title={isBookmarked(currentPage) ? "Bỏ bookmark trang này" : "Bookmark trang này"}>
            <Bookmark className={`w-4 h-4 ${isBookmarked(currentPage) ? "fill-current" : ""}`} />
          </button>

          {/* Bookmark list panel toggle */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${showBookmarkPanel ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowBookmarkPanel(!showBookmarkPanel); setShowAnnotationPanel(false); }} title="Danh sách bookmark">
            <BookmarkCheck className="w-4 h-4" />
            {bookmarks.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#c8a84e] text-white rounded-full flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{bookmarks.length}</span>}
          </button>
          <div className="w-px h-5 bg-gray-200" />

          {/* Annotation panel toggle */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${showAnnotationPanel ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowAnnotationPanel(!showAnnotationPanel); setShowBookmarkPanel(false); }} title="Ghi chú & Bình luận">
            <MessageSquare className="w-4 h-4" />
            {totalAnnotations > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{totalAnnotations}</span>}
          </button>

          {/* Print */}
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => window.print()} title="In tài liệu">
            <Printer className="w-4 h-4" />
          </button>

          {/* Download */}
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" title="Tải xuống" onClick={() => { import("sonner").then(m => m.toast.success("Đang tải tài liệu...")); }}>
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      {showSearch && (
        <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-blue-50/50">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm trong tài liệu..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); performSearch(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter") goToResult(activeResultIdx + 1); if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); setSearchResults([]); } }}
            className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
            style={{ fontSize: "12px" }}
          />
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{activeResultIdx + 1}/{searchResults.length}</span>
              <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => goToResult(activeResultIdx - 1)}><ArrowUp className="w-3.5 h-3.5" /></button>
              <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => goToResult(activeResultIdx + 1)}><ArrowDown className="w-3.5 h-3.5" /></button>
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <span className="text-red-400 shrink-0" style={{ fontSize: "11px" }}>Không tìm thấy</span>
          )}
          <button className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ── Reading progress bar ── */}
      <div className="shrink-0 relative h-1 bg-gray-100">
        <div className="absolute inset-y-0 left-0 bg-blue-500/80 transition-all duration-300 rounded-r-full" style={{ width: `${readProgressPct}%` }} />
        {/* Page position indicator */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-blue-700 transition-all" style={{ left: `${((currentPage - 1) / (totalPages - 1)) * 100}%` }} />
      </div>

      {/* ── Body: Thumbnails + Document ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Thumbnail sidebar */}
        {showThumbnails && (
          <div className="w-44 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>MỤC LỤC</span>
                <span className="text-blue-600" style={{ fontSize: "10px", fontWeight: 600 }}>{readProgressPct}% đã đọc</span>
              </div>
              {pageData.map((pg, i) => {
                const pgNum = i + 1;
                const isActive = currentPage === pgNum;
                const isRead = readPages.has(pgNum);
                const isSearchHit = searchResults.some((r) => r.page === pgNum);
                const isBkmk = isBookmarked(pgNum);
                const pgAnnoCount = annotations.filter((a) => a.page === pgNum).length;
                return (
                  <button
                    key={pgNum}
                    onClick={() => goToPage(pgNum)}
                    className={`w-full rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                      isActive ? "border-blue-500 shadow-md" : isSearchHit ? "border-orange-300 shadow-sm" : isBkmk ? "border-[#c8a84e]/50" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* Mini page preview */}
                    <div className="aspect-[3/4] bg-white p-2 relative">
                      <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5">
                        {isBkmk && <Bookmark className="w-2.5 h-2.5 text-[#c8a84e] fill-current" />}
                        {pgAnnoCount > 0 && <div className="w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{pgAnnoCount}</div>}
                        {isRead && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                        {isSearchHit && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                      </div>
                      {/* Simulated content lines */}
                      <div className="space-y-1">
                        <div className="h-1 bg-[#990803]/30 rounded w-3/4 mx-auto" />
                        <div className="h-0.5 bg-gray-200 rounded w-full" />
                        <div className="h-0.5 bg-gray-200 rounded w-11/12" />
                        <div className="h-0.5 bg-gray-200 rounded w-full" />
                        <div className="h-0.5 bg-gray-200 rounded w-4/5" />
                        {pg.hasTable && <div className="h-3 bg-gray-100 border border-gray-200 rounded mt-1" />}
                        {pg.hasChart && <div className="h-3 bg-blue-50 border border-blue-100 rounded mt-1" />}
                        <div className="h-0.5 bg-gray-200 rounded w-full" />
                        <div className="h-0.5 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                    <div className={`px-1.5 py-1 ${isActive ? "bg-blue-50" : "bg-gray-50"}`}>
                      <p className={`truncate ${isActive ? "text-blue-700" : "text-gray-600"}`} style={{ fontSize: "9px", fontWeight: isActive ? 600 : 400 }}>
                        {pgNum}. {pg.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Document content area */}
        <div ref={docAreaRef} className="flex-1 bg-gray-100 overflow-y-auto p-4 lg:p-6 flex justify-center" style={{ scrollbarWidth: "thin" }}>
          <div className="bg-white shadow-lg rounded-sm transition-all" style={{ width: fitMode === "width" ? "100%" : `${5 * zoom / 100}in`, maxWidth: fitMode === "width" ? "800px" : undefined, minHeight: `${7 * zoom / 100}in`, padding: `${36 * (fitMode === "page" ? 0.85 : zoom / 100)}px` }}>
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center pb-4 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-[#990803] flex items-center justify-center"><span className="text-white" style={{ fontSize: "8px", fontWeight: 700 }}>GX</span></div>
                  <span className="text-[#990803]" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em" }}>GELEXIMCO GROUP</span>
                </div>
                <h2 className="text-gray-800 mt-2" style={{ fontSize: "18px", fontWeight: 700 }}>Sổ tay Khung Năng lực Lãnh đạo</h2>
                <p className="text-gray-500 mt-1" style={{ fontSize: "12px" }}>Ban Nhân sự Tập đoàn &bull; Phiên bản 3.2 &bull; Tháng 01/2026</p>
                {/* Bookmark indicator */}
                {isBookmarked(currentPage) && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Bookmark className="w-3 h-3 text-[#c8a84e] fill-current" />
                    <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>Đã bookmark</span>
                  </div>
                )}
              </div>

              {/* Chapter content */}
              <div ref={docContentRef} className="space-y-3 relative">
                {/* Text selection floating popover */}
                {textSelection && !showSelAnnotInput && (
                  <div className="absolute z-30 flex items-center gap-1 bg-gray-900 text-white rounded-lg shadow-xl px-2 py-1.5 -translate-x-1/2 pointer-events-auto" style={{ top: textSelection.rect.top - 44, left: textSelection.rect.left }}>
                    <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-700 cursor-pointer transition-colors" style={{ fontSize: "11px", fontWeight: 500 }} onClick={() => { setShowSelAnnotInput(true); setTimeout(() => selAnnotInputRef.current?.focus(), 100); }}>
                      <MessageSquarePlus className="w-3.5 h-3.5" />Ghi chú
                    </button>
                    <div className="w-px h-4 bg-gray-600" />
                    <button className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-gray-700 cursor-pointer transition-colors" style={{ fontSize: "11px", fontWeight: 500 }} onClick={cancelSelectionAnnotation}>
                      <X className="w-3 h-3" />
                    </button>
                    {/* Arrow down */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
                  </div>
                )}

                {/* Text selection annotation input popover */}
                {textSelection && showSelAnnotInput && (
                  <div className="absolute z-30 bg-white border border-blue-300 rounded-xl shadow-2xl p-3 w-80 -translate-x-1/2" style={{ top: textSelection.rect.top - 8, left: textSelection.rect.left }} onClick={(e) => e.stopPropagation()}>
                    {/* Selected text quote */}
                    <div className="flex items-start gap-2 mb-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-amber-800 line-clamp-2" style={{ fontSize: "11px", lineHeight: 1.4, fontStyle: "italic" }}>"{textSelection.text}"</p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>Ghi chú cho đoạn text đã chọn</span>
                      <div className="flex items-center gap-1 ml-auto">
                        {(["yellow", "blue", "red", "green"] as const).map((c) => (
                          <button key={c} className={`w-4 h-4 rounded-full ${annotationColorMap[c].dot} cursor-pointer transition-all ${selAnnotColor === c ? `ring-2 ${annotationColorMap[c].ring} scale-110` : "opacity-50 hover:opacity-80"}`} onClick={() => setSelAnnotColor(c)} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        ref={selAnnotInputRef}
                        type="text" value={selAnnotText}
                        onChange={(e) => setSelAnnotText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitSelectionAnnotation(); if (e.key === "Escape") cancelSelectionAnnotation(); }}
                        placeholder="Nhập nhận xét về đoạn text này..."
                        className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                        style={{ fontSize: "12px" }}
                      />
                      <button className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer disabled:opacity-40" onClick={submitSelectionAnnotation} disabled={!selAnnotText.trim()}>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button className="px-1.5 py-1.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={cancelSelectionAnnotation}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 600 }}>Chương {pageInfo.chapter}: {pageInfo.title}</h3>
                  {pageInfo.highlights && highlightsOn && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>
                      <Highlighter className="w-2.5 h-2.5 inline mr-0.5" />{pageInfo.highlights.length} highlight
                    </span>
                  )}
                  {pageAnnotations.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded cursor-pointer" style={{ fontSize: "9px", fontWeight: 600 }} onClick={() => setShowAnnotationPanel(true)}>
                      <MessageSquare className="w-2.5 h-2.5 inline mr-0.5" />{pageAnnotations.length} ghi chú
                    </span>
                  )}
                </div>

                {/* Paragraphs with annotation support */}
                {pageInfo.paragraphs.map((para, i) => {
                  const pAnnos = paraAnnotations(i);
                  const hasPAnno = pAnnos.length > 0;
                  const isAnnotating = annotatingPara === i;
                  return (
                    <div key={i} className="group/para relative" data-para-idx={i}>
                      {/* Paragraph with annotation gutter */}
                      <div className={`flex gap-2 ${hasPAnno ? "pl-3 border-l-2 border-blue-300" : ""}`}>
                        <div className="flex-1">
                          <p className={`text-gray-700 transition-colors ${isAnnotating ? "bg-yellow-50 rounded px-1 -mx-1" : ""}`} style={{ fontSize: "13px", lineHeight: 1.8 }}>
                            {renderParagraph(para, pageInfo.highlights, searchActive ? searchQuery : undefined, i)}
                          </p>
                          {/* Inline annotation badges */}
                          {hasPAnno && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pAnnos.map((a) => (
                                <button key={a.id} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${annotationColorMap[a.color].bg} ${annotationColorMap[a.color].border} border cursor-pointer hover:shadow-sm transition-shadow`} style={{ fontSize: "9px" }} onClick={() => setShowAnnotationPanel(true)}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${annotationColorMap[a.color].dot}`} />
                                  {a.selectedText && <Type className="w-2.5 h-2.5 text-amber-500" />}
                                  <span className="text-gray-600" style={{ fontWeight: 500 }}>{a.initials}</span>
                                  <span className="text-gray-400 max-w-[120px] truncate">{a.selectedText ? `"${a.selectedText}" — ` : ""}{a.text}</span>
                                  {a.replies.length > 0 && <span className="text-blue-500" style={{ fontWeight: 600 }}>&middot; {a.replies.length}</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Add annotation button (visible on hover) */}
                        <button
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${isAnnotating ? "bg-blue-500 text-white shadow-md" : "bg-transparent text-transparent group-hover/para:bg-blue-100 group-hover/para:text-blue-500"}`}
                          onClick={() => { setAnnotatingPara(isAnnotating ? null : i); setTimeout(() => annotationInputRef.current?.focus(), 100); }}
                          title="Thêm ghi chú"
                          style={{ marginTop: "2px" }}
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Annotation input overlay */}
                      {isAnnotating && (
                        <div className="mt-2 ml-3 bg-white border border-blue-200 rounded-lg shadow-lg p-3 z-10 relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>Thêm ghi chú tại đoạn {i + 1}</span>
                            {/* Color picker */}
                            <div className="flex items-center gap-1 ml-auto">
                              {(["yellow", "blue", "red", "green"] as const).map((c) => (
                                <button key={c} className={`w-4 h-4 rounded-full ${annotationColorMap[c].dot} cursor-pointer transition-all ${annotationColor === c ? `ring-2 ${annotationColorMap[c].ring} scale-110` : "opacity-50 hover:opacity-80"}`} onClick={() => setAnnotationColor(c)} />
                              ))}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setAnnotatingPara(null)}><X className="w-3.5 h-3.5" /></button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              ref={annotationInputRef}
                              type="text" value={annotationText}
                              onChange={(e) => setAnnotationText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") submitAnnotation(); if (e.key === "Escape") setAnnotatingPara(null); }}
                              placeholder="Nhập ghi chú, nhận xét..."
                              className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                              style={{ fontSize: "12px" }}
                            />
                            <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer disabled:opacity-40" style={{ fontSize: "11px", fontWeight: 600 }} onClick={submitAnnotation} disabled={!annotationText.trim()}>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Table mock */}
                {pageInfo.hasTable && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                    <p className="text-[#990803] mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Bảng {pageInfo.chapter}.1: {currentPage <= 5 ? "Ma trận Năng lực — Cấp độ Quản lý" : currentPage <= 10 ? "Tiêu chí Đo lường Năng lực" : currentPage <= 14 ? "Khung Đánh giá Kết quả" : "Biểu mẫu Đánh giá"}</p>
                    <div className="grid grid-cols-4 gap-px bg-gray-200 rounded overflow-hidden" style={{ fontSize: "10px" }}>
                      {(currentPage <= 10
                        ? ["Năng lực", "Cấp 1-2", "Cấp 3", "Cấp 4-5"]
                        : ["Hạng mục", "Trọng số", "Đạt", "Ghi chú"]
                      ).map((h) => (<div key={h} className="bg-[#990803] text-white px-2 py-1.5 text-center" style={{ fontWeight: 600 }}>{h}</div>))}
                      {(currentPage <= 10
                        ? ["Tư duy chiến lược", "Quản lý điều hành", "Lãnh đạo con người", "Giao tiếp ảnh hưởng"]
                        : ["Hoàn thành KH", "Phát triển đội", "Sáng kiến cải tiến", "Tuân thủ quy trình"]
                      ).map((r) => (
                        (currentPage <= 10 ? [r, "Cơ bản", "Thành thạo", "Chuyên gia"] : [r, "25%", "✓", "—"]).map((c, ci) => (
                          <div key={`${r}-${ci}`} className="bg-white px-2 py-1.5 text-center text-gray-600">{c}</div>
                        ))
                      ))}
                    </div>
                  </div>
                )}

                {/* Chart mock */}
                {pageInfo.hasChart && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-3">
                    <p className="text-blue-700 mb-3" style={{ fontSize: "12px", fontWeight: 600 }}>Biểu đồ {pageInfo.chapter}.1: Phân bố Năng lực theo Cấp độ</p>
                    <div className="flex items-end gap-2 h-24 px-4">
                      {[
                        { label: "Nhập môn", h: 15, color: "bg-gray-300" },
                        { label: "Cơ bản", h: 35, color: "bg-blue-300" },
                        { label: "Trung bình", h: 60, color: "bg-blue-400" },
                        { label: "Thành thạo", h: 80, color: "bg-blue-500" },
                        { label: "Chuyên gia", h: 45, color: "bg-[#990803]" },
                      ].map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full ${bar.color} rounded-t transition-all`} style={{ height: `${bar.h}%` }} />
                          <span className="text-gray-500" style={{ fontSize: "8px" }}>{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Page footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
                <span className="text-gray-400" style={{ fontSize: "9px" }}>GELEXIMCO — Sổ tay Khung Năng lực Lãnh đạo v3.2</span>
                <span className="text-gray-400" style={{ fontSize: "9px" }}>Trang {currentPage} / {totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel: Annotations / Bookmarks ── */}
        {(showAnnotationPanel || showBookmarkPanel) && (
          <div className="w-72 shrink-0 border-l border-gray-200 bg-white overflow-y-auto flex flex-col" style={{ scrollbarWidth: "thin" }}>
            {/* Panel tabs */}
            <div className="shrink-0 flex border-b border-gray-200">
              <button className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${showAnnotationPanel ? "text-blue-700 border-b-2 border-blue-500 bg-blue-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`} onClick={() => { setShowAnnotationPanel(true); setShowBookmarkPanel(false); }}>
                <MessageSquare className="w-3.5 h-3.5" />
                <span style={{ fontSize: "11px", fontWeight: 600 }}>Ghi chú ({totalAnnotations})</span>
              </button>
              <button className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${showBookmarkPanel ? "text-[#c8a84e] border-b-2 border-[#c8a84e] bg-[#c8a84e]/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`} onClick={() => { setShowBookmarkPanel(true); setShowAnnotationPanel(false); }}>
                <Bookmark className="w-3.5 h-3.5" />
                <span style={{ fontSize: "11px", fontWeight: 600 }}>Bookmark ({bookmarks.length})</span>
              </button>
              <button className="px-2 py-2.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => { setShowAnnotationPanel(false); setShowBookmarkPanel(false); }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Annotation panel content */}
            {showAnnotationPanel && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Export & filter bar */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-1">
                    <button className={`flex-1 py-1 rounded-md cursor-pointer transition-colors bg-white shadow-sm text-gray-700`} style={{ fontSize: "10px", fontWeight: 600 }}>Trang {currentPage}</button>
                  </div>
                  {totalAnnotations > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button className="flex items-center gap-1 px-2 py-1 bg-[#990803] hover:bg-[#7a0602] text-white rounded-md cursor-pointer transition-colors" style={{ fontSize: "9px", fontWeight: 600 }} onClick={exportPDF} title="Xuất PDF để in / review">
                        <FileDown className="w-3 h-3" />PDF
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md cursor-pointer transition-colors" style={{ fontSize: "9px", fontWeight: 600 }} onClick={exportCSV} title="Xuất Excel/CSV">
                        <FileSpreadsheet className="w-3 h-3" />Excel
                      </button>
                    </div>
                  )}
                </div>

                {pageAnnotations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>Chưa có ghi chú trên trang này</p>
                    <p className="text-gray-300 mt-1" style={{ fontSize: "10px" }}>Nhấn vào icon <MessageSquarePlus className="w-3 h-3 inline" /> bên cạnh đoạn văn để thêm</p>
                  </div>
                ) : (
                  pageAnnotations.map((a) => {
                    const cMap = annotationColorMap[a.color];
                    return (
                      <div key={a.id} className={`${cMap.bg} border ${cMap.border} rounded-lg overflow-hidden`}>
                        {/* Annotation header */}
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${cMap.dot} text-white flex items-center justify-center shrink-0`} style={{ fontSize: "9px", fontWeight: 700 }}>{a.initials}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{a.author}</span>
                              <p className="text-gray-400 truncate" style={{ fontSize: "9px" }}>Đoạn {a.paraIdx + 1} &bull; {a.time}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5" onClick={() => deleteAnnotation(a.id)} title="Xóa"><Trash2 className="w-3 h-3" /></button>
                          </div>
                          {/* Selected text quote */}
                          {a.selectedText && (
                            <div className="flex items-start gap-1.5 mt-1.5 p-1.5 bg-amber-50/80 border border-amber-200/60 rounded">
                              <Quote className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-amber-700 line-clamp-2" style={{ fontSize: "10px", lineHeight: 1.3, fontStyle: "italic" }}>"{a.selectedText}"</p>
                            </div>
                          )}
                          <p className="text-gray-700 mt-1.5" style={{ fontSize: "12px", lineHeight: 1.5 }}>{a.text}</p>
                        </div>

                        {/* Replies */}
                        {a.replies.length > 0 && (
                          <div className="border-t border-gray-200/50 bg-white/50">
                            {a.replies.map((r) => (
                              <div key={r.id} className="px-3 py-1.5 flex gap-2 items-start border-b border-gray-100 last:border-0">
                                <CornerDownRight className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 600 }}>{r.author}</span>
                                    <span className="text-gray-400" style={{ fontSize: "8px" }}>{r.time}</span>
                                  </div>
                                  <p className="text-gray-600" style={{ fontSize: "11px", lineHeight: 1.4 }}>{r.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        <div className="border-t border-gray-200/50 px-3 py-2 bg-white/30">
                          {replyingTo === a.id ? (
                            <div className="flex gap-1.5">
                              <input
                                ref={replyInputRef}
                                type="text" value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") submitReply(a.id); if (e.key === "Escape") { setReplyingTo(null); setReplyText(""); } }}
                                placeholder="Trả lời..."
                                className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50"
                                style={{ fontSize: "11px" }}
                                autoFocus
                              />
                              <button className="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-40" style={{ fontSize: "10px" }} onClick={() => submitReply(a.id)} disabled={!replyText.trim()}>
                                <Send className="w-3 h-3" />
                              </button>
                              <button className="px-1 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500 cursor-pointer" style={{ fontSize: "10px" }} onClick={() => { setReplyingTo(a.id); setReplyText(""); }}>
                              <Reply className="w-3 h-3" />Trả lời
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* All annotations summary */}
                {totalAnnotations > 0 && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-gray-500 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>TẤT CẢ GHI CHÚ ({totalAnnotations})</p>
                    <div className="space-y-1">
                      {annotations.map((a) => (
                        <button key={a.id} className={`w-full text-left px-2 py-1.5 rounded cursor-pointer transition-colors ${a.page === currentPage ? `${annotationColorMap[a.color].bg}` : "hover:bg-gray-50"}`} onClick={() => { goToPage(a.page); }} style={{ fontSize: "10px" }}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${annotationColorMap[a.color].dot} shrink-0`} />
                            {a.selectedText && <Type className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                            <span className="text-gray-500" style={{ fontWeight: 600 }}>Tr.{a.page}</span>
                            <span className="text-gray-600 truncate">{a.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookmark panel content */}
            {showBookmarkPanel && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>Chưa có bookmark</p>
                    <p className="text-gray-300 mt-1" style={{ fontSize: "10px" }}>Nhấn <Bookmark className="w-3 h-3 inline" /> trên toolbar để thêm</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-500 px-1" style={{ fontSize: "10px", fontWeight: 600 }}>TRANG ĐÃ ĐÁNH DẤU ({bookmarks.length})</p>
                    {bookmarks.sort((a, b) => a.page - b.page).map((bm) => {
                      const isActive = bm.page === currentPage;
                      return (
                        <div key={bm.page} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${isActive ? "border-[#c8a84e] bg-[#c8a84e]/5 shadow-sm" : "border-gray-200 hover:border-[#c8a84e]/50 hover:bg-gray-50"}`} onClick={() => goToPage(bm.page)}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#c8a84e] text-white" : "bg-gray-100 text-gray-500"}`}>
                            <span style={{ fontSize: "12px", fontWeight: 700 }}>{bm.page}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate ${isActive ? "text-[#c8a84e]" : "text-gray-700"}`} style={{ fontSize: "12px", fontWeight: 600 }}>{bm.label}</p>
                            <p className="text-gray-400" style={{ fontSize: "9px" }}>Thêm lúc {bm.createdAt}</p>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 cursor-pointer p-1 shrink-0" onClick={(e) => { e.stopPropagation(); toggleBookmark(bm.page); }} title="Bỏ bookmark">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                    {/* Quick add current page */}
                    {!isBookmarked(currentPage) && (
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-[#c8a84e] hover:border-[#c8a84e] cursor-pointer transition-colors mt-2" onClick={() => toggleBookmark(currentPage)}>
                        <Plus className="w-3.5 h-3.5" />
                        <span style={{ fontSize: "11px", fontWeight: 500 }}>Bookmark trang {currentPage}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom bar: Navigation + Progress ── */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 gap-2">
        {/* Page nav */}
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" disabled={currentPage === 1} onClick={() => goToPage(1)} title="Trang đầu"><ChevronFirst className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-1.5 mx-1">
            <span className="text-gray-500" style={{ fontSize: "12px" }}>Trang</span>
            <input type="number" min={1} max={totalPages} value={currentPage} onChange={(e) => goToPage(Number(e.target.value))} className="w-10 px-1.5 py-0.5 border border-gray-200 rounded text-center bg-white focus:outline-none focus:ring-1 focus:ring-blue-400/30" style={{ fontSize: "12px" }} />
            <span className="text-gray-500" style={{ fontSize: "12px" }}>/ {totalPages}</span>
          </div>
          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)} title="Trang cuối"><ChevronLast className="w-4 h-4" /></button>
        </div>

        {/* Reading progress */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500" style={{ fontSize: "11px" }}>Đã đọc:</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${readProgressPct}%` }} />
            </div>
            <span className="text-blue-600" style={{ fontSize: "11px", fontWeight: 600 }}>{readPages.size}/{totalPages} ({readProgressPct}%)</span>
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Search className="w-3 h-3 text-orange-500" />
              <span className="text-orange-600" style={{ fontSize: "10px", fontWeight: 500 }}>{searchResults.length} kết quả</span>
            </div>
          )}
          {pageAnnotations.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 ml-1 cursor-pointer" onClick={() => setShowAnnotationPanel(true)}>
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span className="text-blue-600" style={{ fontSize: "10px", fontWeight: 500 }}>{pageAnnotations.length} ghi chú</span>
            </div>
          )}
          {isBookmarked(currentPage) && (
            <div className="hidden sm:flex items-center gap-1 ml-1">
              <Bookmark className="w-3 h-3 text-[#c8a84e] fill-current" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// @ts-ignore — dead code, will be removed in next extraction pass
function _DEAD_CODE_AudioPlayer_ImageViewer_WRAPPER(_lesson: any) {
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const cycleRepeat = () => setRepeatMode((m: any) => m === "off" ? "all" : m === "all" ? "one" : "off");

  /* ── A-B Repeat ── */
  const [abRepeat, setAbRepeat] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const isAbActive = abRepeat.a !== null && abRepeat.b !== null;
  const toggleAB = () => {
    if (isAbActive) { setAbRepeat({ a: null, b: null }); return; }
    if (abRepeat.a === null) { setAbRepeat({ a: progress, b: null }); return; }
    if (abRepeat.b === null) { setAbRepeat((p) => ({ ...p, b: Math.max(progress, (p.a ?? 0) + 1) })); }
  };

  /* ── Bookmark timestamps ── */
  const [audioBookmarks, setAudioBookmarks] = useState<{ id: string; timePct: number; label: string }[]>([
    { id: "ab1", timePct: 0, label: "Mở đầu — Giới thiệu tầm nhìn" },
    { id: "ab2", timePct: 13.3, label: "14 đơn vị & 10 lĩnh vực" },
    { id: "ab3", timePct: 28, label: "3 trụ cột đào tạo" },
  ]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const addBookmark = () => {
    const label = `Bookmark @ ${fmtTime(currentSec)}`;
    setAudioBookmarks((prev) => [...prev, { id: `ab${Date.now()}`, timePct: progress, label }]);
    setShowBookmarks(true);
  };
  const removeBookmark = (id: string) => setAudioBookmarks((prev) => prev.filter((b) => b.id !== id));

  /* ── useMemo waveform (stable across re-renders) ── */
  const bars = useMemo(() => Array.from({ length: 80 }, (_, i) => Math.round(15 + Math.random() * 60 + Math.sin(i / 5) * 15)), []);

  /* ── Transcript with seconds for active highlight + auto-scroll ── */
  const transcriptData = useMemo(() => [
    { timeSec: 0, text: "Xin chào tất cả các đồng nghiệp trong Tập đoàn Geleximco. Hôm nay tôi muốn chia sẻ về tầm nhìn đào tạo và phát triển nhân lực của chúng ta." },
    { timeSec: 45, text: "Geleximco đã trải qua hành trình 30 năm phát triển, từ một doanh nghiệp nhỏ thành Tập đoàn đa ngành hàng đầu Việt Nam." },
    { timeSec: 95, text: "Yếu tố then chốt cho thành công đó chính là CON NGƯỜI — nguồn nhân lực chất lượng cao và tinh thần cống hiến." },
    { timeSec: 150, text: "Với 14 đơn vị thành viên trải rộng trên 10 lĩnh vực, việc xây dựng một nền tảng đào tạo chung là vô cùng quan trọng." },
    { timeSec: 225, text: "Từ Tài chính-NH với ABBank, BĐS với các KĐT lớn, đến Năng lượng, VLXD — mỗi lĩnh vực đều cần năng lực chuyên biệt." },
    { timeSec: 315, text: "Chúng ta cần tập trung vào 3 trụ cột: Năng lực chuyên môn ngành, Kỹ năng lãnh đạo, và Văn hóa doanh nghiệp thống nhất." },
    { timeSec: 405, text: "Trụ cột thứ nhất: Chuyên môn ngành. Mỗi lĩnh vực từ BĐS đến Khoáng sản đều có bộ năng lực riêng cần được hệ thống hóa." },
    { timeSec: 495, text: "Trụ cột thứ hai: Kỹ năng lãnh đạo. Mô hình 5 cấp độ lãnh đạo sẽ được triển khai đồng bộ tại tất cả đơn vị." },
    { timeSec: 585, text: "Trụ cột thứ ba: Văn hóa doanh nghiệp. Giá trị cốt lõi của Geleximco cần được truyền tải xuyên suốt trong mọi chương trình đào tạo." },
    { timeSec: 675, text: "Hệ thống LMS mới sẽ hỗ trợ học mọi lúc mọi nơi, tích hợp AI đề xuất lộ trình cá nhân hóa cho từng nhân sự." },
    { timeSec: 765, text: "Chatbot GelBot sẽ đóng vai trò trợ giảng ảo, hỗ trợ 24/7 cho 6,610 nhân sự trên toàn hệ thống." },
    { timeSec: 855, text: "Mục tiêu đến 2027: 100% cán bộ quản lý hoàn thành chương trình phát triển lãnh đạo, tỷ lệ hài lòng đào tạo đạt 90%." },
    { timeSec: 945, text: "Ngân sách đào tạo sẽ tăng 40% trong giai đoạn 2026-2028, tập trung vào chuyển đổi số và phát triển bền vững ESG." },
    { timeSec: 1035, text: "Tôi tin tưởng rằng với sự đồng lòng của tất cả, Geleximco sẽ trở thành tổ chức học tập hàng đầu Việt Nam. Xin cảm ơn." },
  ], []);
  const activeTranscriptIdx = useMemo(() => {
    let idx = 0;
    for (let i = transcriptData.length - 1; i >= 0; i--) {
      if (currentSec >= transcriptData[i].timeSec) { idx = i; break; }
    }
    return idx;
  }, [currentSec, transcriptData]);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const transcriptItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const el = transcriptItemRefs.current[activeTranscriptIdx];
    if (el && transcriptContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeTranscriptIdx]);

  /* ── Simulated playback ── */
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + (100 / totalSec) * speed;
        if (isAbActive && abRepeat.b !== null && next >= abRepeat.b) return abRepeat.a ?? 0;
        if (next >= 100) {
          if (repeatMode === "one" || repeatMode === "all") return 0;
          setPlaying(false);
          return 100;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, speed, repeatMode, isAbActive, abRepeat, totalSec]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
            <Headphones className="w-10 h-10 text-white/80" />
          </div>
          <div className="flex-1">
            <p className="text-white/50" style={{ fontSize: "11px", fontWeight: 500 }}>PODCAST &bull; AUDIO</p>
            <h3 className="text-white mt-1" style={{ fontSize: "18px", fontWeight: 600 }}>{lesson.title.replace("Audio: ", "")}</h3>
            <p className="text-white/60 mt-0.5" style={{ fontSize: "12px" }}>Ban Giám đốc Tập đoàn Geleximco &bull; {lesson.duration}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {repeatMode !== "off" && (
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-white/70" style={{ fontSize: "9px", fontWeight: 600 }}>
                {repeatMode === "all" ? "Loop" : "Repeat 1"}
              </span>
            )}
            {isAbActive && (
              <span className="px-2 py-0.5 bg-orange-500/30 rounded-full text-orange-200" style={{ fontSize: "9px", fontWeight: 600 }}>
                A-B: {fmtTime(Math.round(((abRepeat.a ?? 0) / 100) * totalSec))}-{fmtTime(Math.round(((abRepeat.b ?? 0) / 100) * totalSec))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="px-6 py-4 bg-gray-50 relative">
        <div className="flex items-end justify-center gap-px h-16 cursor-pointer" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - r.left) / r.width) * 100); }}>
          {bars.map((h, i) => {
            const pct = (i / bars.length) * 100;
            const inAB = isAbActive && abRepeat.a !== null && abRepeat.b !== null && pct >= abRepeat.a && pct <= abRepeat.b;
            return <div key={i} className={`w-1 rounded-full transition-colors ${pct <= progress ? (inAB ? "bg-orange-400" : "bg-purple-500") : inAB ? "bg-orange-200" : "bg-gray-300"}`} style={{ height: `${h}%`, minHeight: 3 }} />;
          })}
        </div>
      </div>

      {/* Progress bar + time */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-500 shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>{fmtTime(currentSec)}</span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden cursor-pointer relative" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(((e.clientX - r.left) / r.width) * 100); }}>
            {isAbActive && abRepeat.a !== null && abRepeat.b !== null && (
              <div className="absolute h-full bg-orange-200/60 rounded-full" style={{ left: `${abRepeat.a}%`, width: `${abRepeat.b - abRepeat.a}%` }} />
            )}
            <div className="h-full bg-purple-500 rounded-full transition-all relative z-10" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-gray-500 shrink-0" style={{ fontSize: "12px", fontWeight: 500 }}>{fmtTime(totalSec)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button className={`p-2 rounded-full cursor-pointer transition-colors relative ${repeatMode !== "off" ? "text-purple-600 bg-purple-100" : "text-gray-400 hover:text-gray-600"}`} onClick={cycleRepeat} title={repeatMode === "off" ? "Bật lặp" : repeatMode === "all" ? "Lặp 1 bài" : "Tắt lặp"}>
            <Repeat className="w-4 h-4" />
            {repeatMode === "one" && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-purple-600 text-white rounded-full flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 800 }}>1</span>}
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setProgress((p) => Math.max(0, p - (10 / totalSec) * 100))} title="-10s"><SkipBack className="w-5 h-5" /></button>
          <button className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 cursor-pointer shadow-lg" onClick={() => setPlaying(!playing)}>
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => setProgress((p) => Math.min(100, p + (10 / totalSec) * 100))} title="+10s"><SkipForward className="w-5 h-5" /></button>
          <button className={`px-2 py-1 rounded-full cursor-pointer transition-colors ${isAbActive ? "text-orange-600 bg-orange-100" : abRepeat.a !== null ? "text-orange-500 bg-orange-50 ring-2 ring-orange-300" : "text-gray-400 hover:text-gray-600"}`} onClick={toggleAB} title={isAbActive ? "Xóa A-B" : abRepeat.a !== null ? "Đặt điểm B" : "Đặt điểm A"}>
            <span style={{ fontSize: "10px", fontWeight: 800 }}>A-B</span>
          </button>
        </div>

        {/* Volume, Speed, Bookmark, Download */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setMuted(!muted)}>
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false); }} className="w-20 h-1 accent-purple-600 cursor-pointer" />
          </div>
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25, 1.5, 2].map((s) => (
              <button key={s} className={`px-2 py-0.5 rounded cursor-pointer ${speed === s ? "bg-purple-100 text-purple-700" : "text-gray-400 hover:text-gray-600"}`} style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => setSpeed(s)}>{s}x</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button className={`p-1.5 rounded cursor-pointer transition-colors ${showBookmarks ? "text-[#c8a84e] bg-[#c8a84e]/10" : "text-gray-400 hover:text-gray-600"}`} onClick={() => setShowBookmarks(!showBookmarks)} title="Bookmark">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-[#c8a84e] cursor-pointer" onClick={addBookmark} title="Bookmark thời điểm hiện tại">
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => { import("sonner").then(m => m.toast.success("Đang tải file audio...")); }}><Download className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bookmark panel */}
      {showBookmarks && audioBookmarks.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-[#c8a84e]/5">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-3.5 h-3.5 text-[#c8a84e]" />
            <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>Bookmark ({audioBookmarks.length})</span>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {[...audioBookmarks].sort((a, b) => a.timePct - b.timePct).map((bm) => {
              const sec = Math.round((bm.timePct / 100) * totalSec);
              const isNear = Math.abs(currentSec - sec) < 15;
              return (
                <div key={bm.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isNear ? "bg-[#c8a84e]/15 ring-1 ring-[#c8a84e]/30" : "hover:bg-gray-100"}`} onClick={() => setProgress(bm.timePct)}>
                  <Bookmark className={`w-3 h-3 shrink-0 ${isNear ? "text-[#c8a84e] fill-current" : "text-gray-400"}`} />
                  <span className="text-purple-600 shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{fmtTime(sec)}</span>
                  <span className="text-gray-600 truncate flex-1" style={{ fontSize: "11px" }}>{bm.label}</span>
                  <button className="text-gray-300 hover:text-red-500 cursor-pointer shrink-0 p-0.5" onClick={(e) => { e.stopPropagation(); removeBookmark(bm.id); }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transcript with active highlight + auto-scroll */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-500" style={{ fontSize: "12px", fontWeight: 600 }}>Bản ghi chép (Transcript)</span>
          <span className="text-gray-400 ml-auto" style={{ fontSize: "10px" }}>{transcriptData.length} đoạn</span>
        </div>
        <div ref={transcriptContainerRef} className="space-y-1 max-h-48 overflow-y-auto scroll-smooth" style={{ scrollbarWidth: "thin" }}>
          {transcriptData.map((t, idx) => {
            const isActive = idx === activeTranscriptIdx;
            const nextTime = idx < transcriptData.length - 1 ? transcriptData[idx + 1].timeSec : totalSec;
            const segProgress = isActive ? Math.min(100, ((currentSec - t.timeSec) / (nextTime - t.timeSec)) * 100) : idx < activeTranscriptIdx ? 100 : 0;
            return (
              <div
                key={idx}
                ref={(el) => { transcriptItemRefs.current[idx] = el; }}
                className={`flex gap-3 cursor-pointer rounded-lg p-2 -mx-1 transition-all ${isActive ? "bg-purple-50 ring-1 ring-purple-200 shadow-sm" : idx < activeTranscriptIdx ? "opacity-60" : "hover:bg-gray-100"}`}
                onClick={() => setProgress((t.timeSec / totalSec) * 100)}
              >
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <span className={`shrink-0 ${isActive ? "text-purple-600" : "text-gray-400"}`} style={{ fontSize: "11px", fontWeight: 600 }}>{fmtTime(t.timeSec)}</span>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${isActive ? "text-gray-800" : "text-gray-600"}`} style={{ fontSize: "12px", lineHeight: 1.5 }}>{t.text}</p>
                  {isActive && (
                    <div className="mt-1.5 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 rounded-full transition-all duration-1000" style={{ width: `${segProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Image Viewer — REMOVED (see ./learning/ImageViewer.tsx) ─── */
function _ImageViewer_OLD({ lesson }: { lesson: Lesson }) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(3);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  /* ── Drag-to-pan state ── */
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const images = [
    { id: 1, title: "Quy trình Ra quyết định 6 bước", desc: "Tổng quan toàn bộ quy trình", steps: ["Nhận diện\nvấn đề", "Thu thập\ndữ liệu", "Phân tích\ngiải pháp", "Lựa chọn\nphương án", "Thực hiện\ntriển khai", "Đánh giá\nkết quả"] },
    { id: 2, title: "Bước 1-2: Nhận diện & Thu thập", desc: "Chi tiết giai đoạn phân tích", steps: ["Xác định\nvấn đề", "Đặt câu\nhỏi đúng", "Nguồn dữ\nliệu nội bộ", "Khảo sát\nthực địa", "Phân tích\nđịnh lượng", "Tổng hợp\nbáo cáo"] },
    { id: 3, title: "Bước 3-4: Phân tích & Lựa chọn", desc: "Framework đánh giá giải pháp", steps: ["Ma trận\nquyết định", "SWOT\nAnalysis", "Cost-Benefit\nAnalysis", "Risk\nAssessment", "Consensus\nBuilding", "Final\nSelection"] },
    { id: 4, title: "Bước 5-6: Thực hiện & Đánh giá", desc: "Triển khai và đo lường kết quả", steps: ["Lập kế\nhoạch", "Phân công\nnhiệm vụ", "Giám sát\ntiến độ", "Đo lường\nKPI", "Review &\nFeedback", "Cải tiến\nliên tục"] },
  ];

  const imgCount = images.length;

  /* ── Reset pan when changing image or zoom ── */
  const resetTransform = () => { setPanOffset({ x: 0, y: 0 }); };
  const goToImg = (idx: number) => { setCurrentImg(idx); setRotation(0); resetTransform(); };

  /* ── Keyboard navigation ← → ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goToImg((currentImg - 1 + imgCount) % imgCount); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goToImg((currentImg + 1) % imgCount); }
      else if (e.key === "Escape" && lightbox) { setLightbox(false); }
      else if (e.key === "f" || e.key === "F") { setLightbox((v) => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentImg, imgCount, lightbox]);

  /* ── Auto slideshow ── */
  useEffect(() => {
    if (!slideshowActive) return;
    const timer = setInterval(() => {
      setCurrentImg((prev) => { setRotation(0); resetTransform(); return (prev + 1) % imgCount; });
    }, slideshowInterval * 1000);
    return () => clearInterval(timer);
  }, [slideshowActive, slideshowInterval, imgCount]);

  /* ── Drag-to-pan handlers ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y };
  };
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [isDragging]);
  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  /* ── Rotate ── */
  const rotate = () => { setRotation((r) => (r + 90) % 360); };

  /* ── Image content renderer ── */
  const renderImageContent = (inLightbox = false) => {
    const img = images[currentImg];
    const containerStyle: React.CSSProperties = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
      transformOrigin: "center center",
      transition: isDragging ? "none" : "transform 0.3s ease",
      cursor: zoom > 100 ? (isDragging ? "grabbing" : "grab") : "default",
    };
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${inLightbox ? "max-w-4xl" : ""}`} style={containerStyle} onMouseDown={handleMouseDown}>
        <div className={`${inLightbox ? "w-[700px]" : "w-[600px]"} p-8 select-none`} style={{ background: "linear-gradient(135deg, #fef9ef 0%, #fff5e0 100%)" }}>
          <div className="text-center mb-6">
            <p className="text-[#990803] uppercase" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em" }}>GELEXIMCO GROUP</p>
            <h3 className="text-gray-800 mt-1" style={{ fontSize: "20px", fontWeight: 700 }}>{img.title}</h3>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>{img.desc}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {img.steps.map((step, i) => (
              <div key={i} className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center mx-auto mb-2" style={{ fontSize: "14px", fontWeight: 700 }}>{i + 1}</div>
                <p className="text-gray-700 whitespace-pre-line" style={{ fontSize: "11px", fontWeight: 500 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ── Toolbar ── */
  const renderToolbar = (inLightbox = false) => (
    <div className={`flex items-center ${inLightbox ? "justify-center" : "justify-between"} px-4 py-2.5 ${inLightbox ? "" : "border-b border-gray-200 bg-gray-50"} gap-3`}>
      {!inLightbox && (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-green-600" />
          <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{images[currentImg].title}</span>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>{currentImg + 1} / {imgCount}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.max(50, z - 25)); resetTransform(); }} title="Thu nhỏ"><ZoomOut className="w-4 h-4" /></button>
        <span className={`${inLightbox ? "text-white/70" : "text-gray-500"} min-w-[36px] text-center`} style={{ fontSize: "12px", fontWeight: 500 }}>{zoom}%</span>
        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => setZoom((z) => Math.min(300, z + 25))} title="Phóng to"><ZoomIn className="w-4 h-4" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button className={`p-1.5 hover:bg-gray-200 rounded cursor-pointer transition-colors ${rotation !== 0 ? "text-green-600 bg-green-50" : "text-gray-500 hover:text-gray-700"}`} onClick={rotate} title={`Xoay (${rotation}°)`}><RotateCw className="w-4 h-4" /></button>
        {rotation !== 0 && <span className="text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}>{rotation}°</span>}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        {/* Slideshow */}
        <button className={`p-1.5 rounded cursor-pointer transition-colors ${slideshowActive ? "text-orange-600 bg-orange-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => setSlideshowActive(!slideshowActive)} title={slideshowActive ? "Dừng slideshow" : "Bắt đầu slideshow"}>
          {slideshowActive ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
        </button>
        {slideshowActive && (
          <select value={slideshowInterval} onChange={(e) => setSlideshowInterval(Number(e.target.value))} className="px-1 py-0.5 bg-orange-50 border border-orange-200 rounded text-orange-700 cursor-pointer" style={{ fontSize: "10px" }}>
            {[2, 3, 5, 8].map((s) => <option key={s} value={s}>{s}s</option>)}
          </select>
        )}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button className={`p-1.5 rounded cursor-pointer transition-colors ${lightbox ? "text-blue-600 bg-blue-100" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => setLightbox(!lightbox)} title="Fullscreen (F)">
          {lightbox ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { import("sonner").then(m => m.toast.success("Đang tải hình ảnh...")); }}><Download className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {renderToolbar()}
        <div ref={imgContainerRef} className="bg-gray-100 p-8 min-h-[450px] flex items-center justify-center overflow-hidden relative" onDoubleClick={() => setLightbox(true)}>
          {renderImageContent()}
          {/* Keyboard nav hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white/70" style={{ fontSize: "10px" }}>← → chuyển ảnh &bull; F fullscreen &bull; Kéo để pan khi zoom</span>
          </div>
          {/* Slideshow progress indicator */}
          {slideshowActive && (
            <div className="absolute top-2 left-2 right-2">
              <div className="flex gap-1">
                {images.map((_, i) => (
                  <div key={i} className={`flex-1 h-0.5 rounded-full ${i === currentImg ? "bg-orange-500" : i < currentImg ? "bg-orange-300" : "bg-gray-300"}`} />
                ))}
              </div>
            </div>
          )}
          {/* Nav arrows */}
          <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" style={{ opacity: 0.6 }} onClick={() => goToImg((currentImg - 1 + imgCount) % imgCount)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800 transition-all opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100" style={{ opacity: 0.6 }} onClick={() => goToImg((currentImg + 1) % imgCount)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => goToImg(i)} className={`shrink-0 px-3 py-2 rounded-lg border transition-all cursor-pointer ${currentImg === i ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
              <p className={`${currentImg === i ? "text-[#990803]" : "text-gray-600"}`} style={{ fontSize: "11px", fontWeight: 500 }}>{img.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox fullscreen overlay */}
      {lightbox && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false); }}>
          {/* Lightbox top bar */}
          <div className="shrink-0 flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-green-400" />
              <span className="text-white" style={{ fontSize: "14px", fontWeight: 500 }}>{images[currentImg].title}</span>
              <span className="text-white/40" style={{ fontSize: "12px" }}>{currentImg + 1} / {imgCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.max(50, z - 25)); resetTransform(); }}><ZoomOut className="w-4 h-4" /></button>
              <span className="text-white/50 min-w-[36px] text-center" style={{ fontSize: "12px" }}>{zoom}%</span>
              <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded cursor-pointer" onClick={() => setZoom((z) => Math.min(300, z + 25))}><ZoomIn className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button className={`p-1.5 rounded cursor-pointer ${rotation !== 0 ? "text-green-400 bg-green-400/10" : "text-white/60 hover:text-white hover:bg-white/10"}`} onClick={rotate}><RotateCw className="w-4 h-4" /></button>
              <button className={`p-1.5 rounded cursor-pointer ${slideshowActive ? "text-orange-400 bg-orange-400/10" : "text-white/60 hover:text-white hover:bg-white/10"}`} onClick={() => setSlideshowActive(!slideshowActive)}>
                {slideshowActive ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              </button>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded cursor-pointer" onClick={() => setLightbox(false)}><X className="w-5 h-5" /></button>
            </div>
          </div>
          {/* Lightbox content */}
          <div className="flex-1 flex items-center justify-center overflow-hidden relative px-16" onMouseDown={handleMouseDown}>
            {renderImageContent(true)}
            {/* Nav arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white/70 hover:text-white transition-all" onClick={() => goToImg((currentImg - 1 + imgCount) % imgCount)}>
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white/70 hover:text-white transition-all" onClick={() => goToImg((currentImg + 1) % imgCount)}>
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
          {/* Lightbox thumbnail strip */}
          <div className="shrink-0 flex items-center justify-center gap-3 px-6 py-3 bg-black/50">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => goToImg(i)} className={`shrink-0 px-4 py-2 rounded-lg border transition-all cursor-pointer ${currentImg === i ? "border-white/50 bg-white/10" : "border-white/10 hover:border-white/30 bg-white/5"}`}>
                <p className={`${currentImg === i ? "text-white" : "text-white/50"}`} style={{ fontSize: "11px", fontWeight: 500 }}>{img.title}</p>
              </button>
            ))}
          </div>
          {/* Keyboard hint */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/30" style={{ fontSize: "10px" }}>
            ← → chuyển ảnh &bull; ESC đóng &bull; Kéo để pan khi zoom
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Presentation Viewer (Enhanced) ─── */
type SlideType = "cover" | "toc" | "content" | "diagram" | "quote" | "chart" | "comparison" | "summary";
interface SlideData {
  num: number; type: SlideType; title: string; subtitle?: string;
  content?: string; items?: string[]; notes: string;
  quoteAuthor?: string; quoteRole?: string;
  leftCol?: { heading: string; items: string[] }; rightCol?: { heading: string; items: string[] };
  chartBars?: { label: string; value: number; color: string }[];
  diagramNodes?: { label: string; desc: string }[];
  summaryItems?: { icon: string; label: string; value: string }[];
  bullets?: string[];
}

const PRESENTATION_SLIDES: SlideData[] = [
  { num: 1, type: "cover", title: "Mô hình Lãnh đạo\n5 Cấp độ", subtitle: "Ứng dụng tại Tập đoàn Geleximco", notes: "Slide mở đầu — giới thiệu chủ đề chính. Nhấn mạnh đây là framework lãnh đạo được áp dụng riêng cho hệ sinh thái Geleximco với 14 công ty thành viên." },
  { num: 2, type: "toc", title: "Nội dung trình bày", items: ["Tổng quan mô hình 5 cấp độ", "Cấp độ 1-2: Nền tảng quyền lực", "Cấp độ 3: Năng suất & Kết quả", "Cấp độ 4: Phát triển con người", "Cấp độ 5: Đỉnh cao — Kính trọng", "Áp dụng tại 14 đơn vị Geleximco", "Kế hoạch triển khai 2026-2028"], notes: "Mục lục 7 phần chính. Dự kiến trình bày trong 45 phút. Phần 6 và 7 là trọng tâm cho ban lãnh đạo Geleximco." },
  { num: 3, type: "content", title: "Tại sao cần Mô hình Lãnh đạo?", content: "Với 6,610 nhân sự trải rộng trên 14 đơn vị thành viên và 10 lĩnh vực kinh doanh khác nhau, Geleximco cần một framework lãnh đạo thống nhất nhưng linh hoạt.", bullets: ["Thống nhất ngôn ngữ lãnh đạo toàn Tập đoàn", "Tạo lộ trình phát triển rõ ràng cho cán bộ quản lý", "Đo lường năng lực lãnh đạo bằng tiêu chí cụ thể", "Hỗ trợ quy hoạch cán bộ kế nhiệm"], notes: "Nhấn mạnh tính cấp thiết: 34 phòng ban với phong cách lãnh đạo khác nhau gây khó khăn cho việc phát triển văn hóa chung." },
  { num: 4, type: "diagram", title: "Tổng quan 5 Cấp độ Lãnh đạo", diagramNodes: [{ label: "Cấp 5: Đỉnh cao", desc: "Kính trọng" }, { label: "Cấp 4: Phát triển", desc: "Con người" }, { label: "Cấp 3: Năng suất", desc: "Kết quả" }, { label: "Cấp 2: Cho phép", desc: "Mối quan hệ" }, { label: "Cấp 1: Vị trí", desc: "Quyền hạn" }], notes: "Mô hình kim tự tháp 5 cấp — John C. Maxwell. Mỗi cấp là nền tảng cho cấp tiếp theo. Không thể nhảy cấp." },
  { num: 5, type: "content", title: "Cấp độ 1: Vị trí (Position)", content: "Đây là cấp độ khởi đầu — nhân viên tuân theo vì chức vụ, không phải vì lựa chọn. Quyền lực đến từ bổ nhiệm chính thức.", bullets: ["Nhân viên làm theo vì bắt buộc", "Hiệu quả tối thiểu — chỉ đủ để không bị kỷ luật", "Nhiều quản lý mới tại Geleximco dừng ở cấp này"], notes: "Khoảng 35% cán bộ quản lý cấp phòng ban tại Geleximco hiện đang ở Level 1. Cần đào tạo để chuyển sang Level 2." },
  { num: 6, type: "content", title: "Cấp độ 2: Cho phép (Permission)", content: "Mối quan hệ là nền tảng. Nhân viên tuân theo vì MUỐN, không phải vì PHẢI. Lãnh đạo lắng nghe, quan sát và phục vụ.", bullets: ["Xây dựng niềm tin qua giao tiếp cởi mở", "Tôn trọng giá trị cá nhân của mỗi nhân sự", "Tạo môi trường an toàn để đóng góp ý kiến", "Áp dụng: 1-on-1 meeting hàng tuần tại mỗi đơn vị"], notes: "Level 2 là bước ngoặt quan trọng nhất. Khi lãnh đạo thật sự quan tâm đến con người, năng suất tự nhiên tăng." },
  { num: 7, type: "quote", title: "Tầm nhìn Lãnh đạo", content: "Người lãnh đạo giỏi không tạo ra những người đi theo, mà tạo ra những người lãnh đạo mới. Đó là sứ mệnh của Geleximco trong hành trình phát triển nhân tài.", quoteAuthor: "Vũ Văn Tiền", quoteRole: "Chủ tịch HĐQT Tập đoàn Geleximco", notes: "Trích dẫn từ bài phát biểu của Chủ tịch tại Hội nghị tổng kết 2025. Nhấn mạnh triết lý phát triển người kế nhiệm." },
  { num: 8, type: "chart", title: "Phân bố cấp độ lãnh đạo hiện tại", chartBars: [{ label: "Cấp 1", value: 35, color: "#ef4444" }, { label: "Cấp 2", value: 28, color: "#f97316" }, { label: "Cấp 3", value: 22, color: "#eab308" }, { label: "Cấp 4", value: 12, color: "#22c55e" }, { label: "Cấp 5", value: 3, color: "#8b5cf6" }], notes: "Dữ liệu khảo sát Q4/2025 trên 480 cán bộ quản lý. Mục tiêu 2027: giảm Cấp 1 xuống 15%, tăng Cấp 3+ lên 55%." },
  { num: 9, type: "content", title: "Cấp độ 3: Năng suất (Production)", content: "Kết quả kinh doanh là thước đo. Lãnh đạo cấp 3 dẫn dắt bằng hành động và thành tích cụ thể. Đội nhóm tự hào khi đạt mục tiêu.", bullets: ["Đặt mục tiêu rõ ràng cho từng đơn vị/phòng ban", "Ra quyết định dựa trên dữ liệu (data-driven)", "Giải quyết vấn đề thay vì than phiền", "Tại Geleximco: KPI dashboard cho 14 công ty thành viên"], notes: "Cấp 3 là điểm khác biệt giữa quản lý bình thường và lãnh đạo thực thụ. Chỉ 37% cán bộ QL đạt cấp này." },
  { num: 10, type: "comparison", title: "Level 2 vs Level 3: Khác biệt then chốt", leftCol: { heading: "Level 2 — Mối quan hệ", items: ["Được yêu mến nhưng thiếu kết quả", "Tạo môi trường thoải mái", "Tập trung vào cảm xúc team", "Đôi khi tránh quyết định khó", "Nguy cơ: Nhóm yếu nhưng vui vẻ"] }, rightCol: { heading: "Level 3 — Năng suất", items: ["Được tôn trọng vì thành tích", "Tạo động lực đạt mục tiêu", "Tập trung vào outcome cụ thể", "Quyết đoán khi cần thiết", "Lợi thế: Team mạnh & có kết quả"] }, notes: "Đây là slide so sánh quan trọng. Nhiều cán bộ Geleximco giỏi xây dựng quan hệ (L2) nhưng yếu ở kết quả (L3). Cần phát triển cả hai." },
  { num: 11, type: "content", title: "Cấp độ 4: Phát triển Con người", content: "Đầu tư 80% thời gian vào phát triển người khác. Lãnh đạo cấp 4 nhân bản năng lực — tạo ra thế hệ lãnh đạo tiếp theo.", bullets: ["Coaching & Mentoring chuyên sâu 1-on-1", "Giao quyền có kiểm soát — để người khác trưởng thành", "Xây dựng pipeline kế nhiệm tại mỗi vị trí", "Đo lường thành công bằng sự phát triển của team"], notes: "Level 4 là mục tiêu cho GĐ các công ty thành viên. Hiện chỉ 12% cán bộ QL đạt được — cần chương trình đào tạo chuyên biệt." },
  { num: 12, type: "diagram", title: "Mô hình Phát triển Con người tại Geleximco", diagramNodes: [{ label: "Nhận diện Tài năng", desc: "Assessment Center" }, { label: "Mentoring 1:1", desc: "6 tháng/chu kỳ" }, { label: "Dự án Thực chiến", desc: "Cross-functional" }, { label: "Đánh giá 360°", desc: "Peer + Manager" }, { label: "Bổ nhiệm Kế cận", desc: "Succession Plan" }], notes: "Quy trình 5 bước phát triển nhân tài. Mỗi chu kỳ 12 tháng. Đã pilot tại ABBank và Geleximco Land thành công." },
  { num: 13, type: "quote", title: "Giá trị cốt lõi", content: "Đầu tư vào con người không bao giờ lỗ. Mỗi đồng chi cho đào tạo hôm nay sẽ trả lại gấp mười lần giá trị cho Tập đoàn trong tương lai.", quoteAuthor: "Ban Nhân sự Geleximco", quoteRole: "Triết lý đào tạo 2026", notes: "Ngân sách đào tạo 2026 tăng 40% so với 2025. Tập trung vào phát triển lãnh đạo cấp 3-4 cho các đơn vị trọng điểm." },
  { num: 14, type: "content", title: "Cấp độ 5: Đỉnh cao (Pinnacle)", content: "Cấp độ hiếm hoi — được kính trọng vì toàn bộ sự nghiệp cống hiến. Ảnh hưởng vượt ra ngoài tổ chức, trở thành biểu tượng ngành.", bullets: ["Uy tín tích lũy qua nhiều thập kỷ", "Di sản là thế hệ lãnh đạo được phát triển", "Văn hóa tổ chức phản ánh giá trị cá nhân", "Tại Geleximco: Mục tiêu cho Ban Giám đốc Tập đoàn"], notes: "Level 5 không phải đích đến cho tất cả, mà là nguồn cảm hứng. Chỉ ~3% lãnh đạo toàn cầu đạt được cấp này." },
  { num: 15, type: "chart", title: "Mục tiêu phát triển lãnh đạo 2026-2028", chartBars: [{ label: "2025\n(Hiện tại)", value: 37, color: "#94a3b8" }, { label: "2026\n(Mục tiêu)", value: 48, color: "#f97316" }, { label: "2027\n(Mục tiêu)", value: 62, color: "#22c55e" }, { label: "2028\n(Mục tiêu)", value: 75, color: "#8b5cf6" }], notes: "% cán bộ quản lý đạt Level 3 trở lên. Mục tiêu tăng gấp đôi trong 3 năm nhờ chương trình LDP (Leadership Development Program)." },
  { num: 16, type: "comparison", title: "Lãnh đạo Truyền thống vs Hiện đại tại Geleximco", leftCol: { heading: "Truyền thống (Cũ)", items: ["Ra lệnh từ trên xuống", "Giữ thông tin = giữ quyền lực", "Đánh giá 1 chiều cuối năm", "Thăng chức theo thâm niên", "Đào tạo = chi phí phát sinh"] }, rightCol: { heading: "Hiện đại (Mới)", items: ["Coaching & Empowerment", "Minh bạch thông tin toàn Tập đoàn", "Feedback 360° liên tục", "Thăng chức theo năng lực + kết quả", "Đào tạo = đầu tư chiến lược"] }, notes: "Geleximco đang trong giai đoạn chuyển đổi từ mô hình truyền thống sang hiện đại. LMS là công cụ hỗ trợ quan trọng." },
  { num: 17, type: "content", title: "Chiến lược triển khai tại 14 đơn vị", content: "Mỗi lĩnh vực kinh doanh cần điều chỉnh framework cho phù hợp. Tài chính-NH có đặc thù khác BĐS, Năng lượng khác Du lịch.", bullets: ["Giai đoạn 1 (Q1-Q2/2026): ABBank, Geleximco Land, Thăng Long GTC", "Giai đoạn 2 (Q3-Q4/2026): Khoáng sản, VLXD, Hạ tầng", "Giai đoạn 3 (2027): Năng lượng, Du lịch, Giáo dục, Nông nghiệp", "Mỗi đơn vị cử 5-10 cán bộ tham gia chương trình LDP"], notes: "Ưu tiên đơn vị có quy mô nhân sự lớn nhất. ABBank (1,800+) và Geleximco Land (1,200+) triển khai trước." },
  { num: 18, type: "chart", title: "Ngân sách đào tạo lãnh đạo theo năm", chartBars: [{ label: "2024", value: 45, color: "#94a3b8" }, { label: "2025", value: 58, color: "#64748b" }, { label: "2026", value: 82, color: "#f97316" }, { label: "2027", value: 95, color: "#22c55e" }, { label: "2028", value: 100, color: "#8b5cf6" }], notes: "Đơn vị: tỷ đồng. Tổng ngân sách 3 năm ước tính 277 tỷ. ROI kỳ vọng 3.5x dựa trên tăng trưởng doanh thu & giảm turnover." },
  { num: 19, type: "diagram", title: "Hệ sinh thái Đào tạo Lãnh đạo Geleximco", diagramNodes: [{ label: "LMS Platform", desc: "Nền tảng số" }, { label: "Mentoring Hub", desc: "1:1 & Group" }, { label: "Action Learning", desc: "Dự án thực tế" }, { label: "Assessment Center", desc: "Đánh giá 360°" }, { label: "Community of Practice", desc: "Chia sẻ kinh nghiệm" }], notes: "5 thành phần tạo nên hệ sinh thái hoàn chỉnh. LMS Platform là nền tảng trung tâm kết nối tất cả." },
  { num: 20, type: "content", title: "Vai trò của LMS trong phát triển Lãnh đạo", content: "H�� thống LMS không chỉ là nơi học online, mà là nền tảng quản lý toàn bộ hành trình phát triển lãnh đạo.", bullets: ["Lộ trình học tập cá nhân hóa theo cấp độ hiện tại", "AI GelBot đề xuất nội dung phù hợp từng người", "Dashboard theo dõi tiến độ phát triển real-time", "Gamification & Leaderboard tạo động lực cạnh tranh lành mạnh"], notes: "GelBot đã được train trên dữ liệu 6,610 nhân sự — có khả năng đề xuất chính xác chương trình phù hợp cho từng cá nhân." },
  { num: 21, type: "quote", title: "Cam kết", content: "Mỗi lãnh đạo trong hệ thống Geleximco sẽ là một người thầy, mỗi nhân viên sẽ là một lãnh đạo tương lai. Đó là cách chúng ta xây dựng Tập đoàn bền vững.", quoteAuthor: "Ban Giám đốc", quoteRole: "Cam kết Đào tạo 2026", notes: "Cam kết này sẽ được ký bởi toàn bộ Giám đốc 14 đơn vị tại Hội nghị triển khai Q1/2026." },
  { num: 22, type: "content", title: "Kế hoạch hành động Q1-Q2/2026", content: "Giai đoạn khởi động với 3 hoạt động cốt lõi cần hoàn thành trong 6 tháng đầu tiên.", bullets: ["Tháng 1-2: Khảo sát 360° toàn bộ 480 cán bộ quản lý", "Tháng 3: Workshop \"Khám phá Cấp độ Lãnh đạo\" cho Ban GĐ", "Tháng 4-5: Launch chương trình LDP Cohort 1 (50 người)", "Tháng 6: Review & điều chỉnh trước khi mở rộng quy mô"], notes: "Timeline chặt chẽ — cần sự cam kết của Ban nhân sự và Ban GĐ các đơn vị. Budget phase 1: 28 tỷ." },
  { num: 23, type: "comparison", title: "Trước vs Sau triển khai (Kỳ vọng)", leftCol: { heading: "Trước (2025)", items: ["Không có framework chung", "Đào tạo rời rạc, không hệ thống", "Turnover cấp quản lý: 18%/năm", "Thời gian onboard GĐ mới: 8 tháng", "Engagement score: 62/100"] }, rightCol: { heading: "Sau (2028)", items: ["Framework 5 cấp thống nhất", "LMS + Mentoring + Action Learning", "Turnover cấp quản lý: ≤8%/năm", "Thời gian onboard GĐ mới: 3 tháng", "Engagement score: ≥82/100"] }, notes: "KPI đo lường hiệu quả chương trình. Mỗi chỉ số sẽ được track quarterly trên LMS Dashboard." },
  { num: 24, type: "summary", title: "Tổng kết & Cam kết Hành động", summaryItems: [{ icon: "target", label: "Mục tiêu", value: "75% cán bộ QL đạt Level 3+" }, { icon: "users", label: "Đối tượng", value: "480 cán bộ quản lý" }, { icon: "trending", label: "Ngân sách", value: "277 tỷ VNĐ (3 năm)" }, { icon: "award", label: "KPI chính", value: "Giảm turnover QL ≤8%" }], notes: "Slide kết thúc — kêu gọi hành động. Mỗi GĐ đơn vị cử danh sách 5-10 cán bộ tham gia Cohort 1 trước ngày 15/02/2026." },
];

export function PresentationViewer({ lesson, onContentReady }: { lesson: Lesson; onContentReady?: (ready: boolean) => void }) {
  // ── Resolve lesson-specific slides ──
  const SLIDES = lesson.id === "L10" ? OKR_SLIDES : PRESENTATION_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(1);
  const [showFilmstrip, setShowFilmstrip] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  /* ── New: Presenter Mode, Export, Share ── */
  const [presenterMode, setPresenterMode] = useState(false);
  const [presenterElapsed, setPresenterElapsed] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const presenterStartRef = useRef<number>(0);
  const totalSlides = SLIDES.length;
  const slide = SLIDES[currentSlide - 1];
  const filmstripRef = useRef<HTMLDivElement>(null);

  /* ── Track viewed slides ── */
  const [viewedSlides, setViewedSlides] = useState<Set<number>>(new Set([1]));
  useEffect(() => {
    setViewedSlides(prev => {
      if (prev.has(currentSlide)) return prev;
      return new Set([...prev, currentSlide]);
    });
  }, [currentSlide]);
  useEffect(() => {
    if (onContentReady && viewedSlides.size >= Math.ceil(totalSlides * 0.8)) {
      onContentReady(true);
    }
  }, [viewedSlides.size, totalSlides, onContentReady]);

  /* ── Laser pointer & Annotation drawing ── */
  type PresenterToolType = "pointer" | "laser" | "pen" | "highlighter" | "eraser" | "spotlight" | "text";
  type DrawStroke = { points: { x: number; y: number }[]; color: string; size: number; isEraser: boolean; isHighlighter: boolean };
  type TextAnnotation = { id: string; x: number; y: number; text: string; color: string; fontSize: number };
  const [presenterTool, setPresenterTool] = useState<PresenterToolType>("pointer");
  const [penColor, setPenColor] = useState("#ef4444");
  const [penSize, setPenSize] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [laserTrail, setLaserTrail] = useState<{ x: number; y: number; t: number }[]>([]);
  const annotationsRef = useRef<Map<number, DrawStroke[]>>(new Map());
  const [annotationsVersion, setAnnotationsVersion] = useState(0);
  const currentDrawingRef = useRef<DrawStroke | null>(null);
  const isDrawingRef = useRef(false);
  const slideCanvasRef = useRef<HTMLCanvasElement>(null);
  const slideAreaRef = useRef<HTMLDivElement>(null);
  /* Spotlight */
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number } | null>(null);
  const [spotlightRadius, setSpotlightRadius] = useState(15); // percentage of slide width
  const [spotlightOpacity, setSpotlightOpacity] = useState(0.75);
  /* Text annotations */
  const textAnnotationsRef = useRef<Map<number, TextAnnotation[]>>(new Map());
  const [textAnnotationsVersion, setTextAnnotationsVersion] = useState(0);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState("");
  const [textFontSize, setTextFontSize] = useState(16);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  /* Drag-to-move text */
  const draggingTextRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  /* Export/Import */
  const [showExportMenu, setShowExportMenu] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const ANNOTATION_COLORS = [
    { color: "#ef4444", name: "Đỏ" }, { color: "#3b82f6", name: "Xanh dương" },
    { color: "#22c55e", name: "Xanh lá" }, { color: "#eab308", name: "Vàng" },
    { color: "#ffffff", name: "Trắng" }, { color: "#c8a84e", name: "Gold" },
    { color: "#f97316", name: "Cam" }, { color: "#a855f7", name: "Tím" },
  ];
  const PEN_SIZES = [2, 3, 5, 8, 12];

  const getCurrentAnnotations = useCallback(() => {
    return annotationsRef.current.get(currentSlide) || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, annotationsVersion]);

  const redrawCanvas = useCallback(() => {
    const canvas = slideCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const drawStroke = (stroke: DrawStroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath(); ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (stroke.isEraser) { ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = stroke.size * 3; }
      else if (stroke.isHighlighter) { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 0.35; ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.size * 4; }
      else { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.size; }
      ctx.moveTo(stroke.points[0].x * rect.width, stroke.points[0].y * rect.height);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x * rect.width, stroke.points[i].y * rect.height);
      ctx.stroke(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    };
    for (const stroke of getCurrentAnnotations()) drawStroke(stroke);
    if (currentDrawingRef.current && currentDrawingRef.current.points.length >= 2) drawStroke(currentDrawingRef.current);
  }, [getCurrentAnnotations]);

  useEffect(() => { if (presenterMode) requestAnimationFrame(redrawCanvas); }, [presenterMode, currentSlide, annotationsVersion, redrawCanvas]);

  const getRelativePos = (e: React.MouseEvent) => {
    const area = slideAreaRef.current;
    if (!area) return { x: 0, y: 0 };
    const rect = area.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };
  /* ── Text annotation helpers ── */
  const getTextAnnotations = useCallback(() => {
    return textAnnotationsRef.current.get(currentSlide) || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, textAnnotationsVersion]);

  const addTextAnnotation = (x: number, y: number) => {
    const id = `ta-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ta: TextAnnotation = { id, x, y, text: "", color: penColor, fontSize: textFontSize };
    const list = textAnnotationsRef.current.get(currentSlide) || [];
    list.push(ta);
    textAnnotationsRef.current.set(currentSlide, list);
    setTextAnnotationsVersion((v) => v + 1);
    setEditingTextId(id);
    setEditingTextValue("");
    setTimeout(() => textInputRef.current?.focus(), 50);
  };

  const commitTextAnnotation = () => {
    if (!editingTextId) return;
    const list = textAnnotationsRef.current.get(currentSlide) || [];
    const idx = list.findIndex((t) => t.id === editingTextId);
    if (idx >= 0) {
      if (editingTextValue.trim() === "") {
        list.splice(idx, 1); // remove empty
      } else {
        list[idx] = { ...list[idx], text: editingTextValue.trim() };
      }
      textAnnotationsRef.current.set(currentSlide, list);
      setTextAnnotationsVersion((v) => v + 1);
    }
    setEditingTextId(null);
    setEditingTextValue("");
  };

  const deleteTextAnnotation = (id: string) => {
    const list = textAnnotationsRef.current.get(currentSlide) || [];
    const idx = list.findIndex((t) => t.id === id);
    if (idx >= 0) { list.splice(idx, 1); textAnnotationsRef.current.set(currentSlide, list); setTextAnnotationsVersion((v) => v + 1); }
  };

  const handleSlideMouseDown = (e: React.MouseEvent) => {
    if (presenterTool === "text") {
      e.preventDefault();
      commitTextAnnotation(); // commit any existing
      const pos = getRelativePos(e);
      addTextAnnotation(pos.x, pos.y);
      return;
    }
    if (presenterTool === "laser" || presenterTool === "pointer" || presenterTool === "spotlight") return;
    e.preventDefault();
    const pos = getRelativePos(e);
    isDrawingRef.current = true;
    currentDrawingRef.current = { points: [pos], color: presenterTool === "eraser" ? "#000" : penColor, size: penSize, isEraser: presenterTool === "eraser", isHighlighter: presenterTool === "highlighter" };
  };
  const handleSlideMouseMove = (e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    if (presenterTool === "laser") {
      setLaserPos(pos);
      setLaserTrail((prev) => [...prev.slice(-20), { x: pos.x, y: pos.y, t: Date.now() }]);
    } else { setLaserPos(null); }
    if (presenterTool === "spotlight") { setSpotlightPos(pos); }
    if (isDrawingRef.current && currentDrawingRef.current) { currentDrawingRef.current.points.push(pos); redrawCanvas(); }
  };
  const handleSlideMouseUp = () => {
    if (isDrawingRef.current && currentDrawingRef.current && currentDrawingRef.current.points.length >= 2) {
      const sa = annotationsRef.current.get(currentSlide) || [];
      sa.push({ ...currentDrawingRef.current });
      annotationsRef.current.set(currentSlide, sa);
      setAnnotationsVersion((v) => v + 1);
    }
    isDrawingRef.current = false; currentDrawingRef.current = null;
  };
  const handleSlideMouseLeave = () => { setLaserPos(null); setLaserTrail([]); setSpotlightPos(null); handleSlideMouseUp(); };

  /* ── Spotlight scroll wheel ── */
  const handleSlideWheel = (e: React.WheelEvent) => {
    if (presenterTool !== "spotlight") return;
    e.preventDefault();
    setSpotlightRadius((r) => Math.max(5, Math.min(40, r + (e.deltaY > 0 ? -1 : 1))));
  };

  const undoAnnotation = () => {
    // First try undo text, then drawing
    const texts = textAnnotationsRef.current.get(currentSlide) || [];
    const strokes = annotationsRef.current.get(currentSlide) || [];
    if (texts.length > 0 && (strokes.length === 0 || true)) {
      // Undo whichever was added last — simplified: undo drawing first, then text
    }
    if (strokes.length > 0) { strokes.pop(); annotationsRef.current.set(currentSlide, strokes); setAnnotationsVersion((v) => v + 1); return; }
    if (texts.length > 0) { texts.pop(); textAnnotationsRef.current.set(currentSlide, texts); setTextAnnotationsVersion((v) => v + 1); }
  };
  const clearAnnotations = () => {
    annotationsRef.current.set(currentSlide, []);
    textAnnotationsRef.current.set(currentSlide, []);
    setAnnotationsVersion((v) => v + 1);
    setTextAnnotationsVersion((v) => v + 1);
    setEditingTextId(null);
  };
  const clearAllAnnotations = () => {
    annotationsRef.current.clear();
    textAnnotationsRef.current.clear();
    setAnnotationsVersion((v) => v + 1);
    setTextAnnotationsVersion((v) => v + 1);
    setEditingTextId(null);
  };

  /* ── Drag-to-move text annotations ── */
  const startDragText = (e: React.MouseEvent, taId: string) => {
    e.preventDefault(); e.stopPropagation();
    const area = slideAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const list = textAnnotationsRef.current.get(currentSlide) || [];
    const ta = list.find((t) => t.id === taId);
    if (!ta) return;
    draggingTextRef.current = {
      id: taId,
      startX: (e.clientX - rect.left) / rect.width,
      startY: (e.clientY - rect.top) / rect.height,
      origX: ta.x, origY: ta.y,
    };
    setIsDraggingText(true);
  };

  useEffect(() => {
    if (!isDraggingText) return;
    const handleMouseMove = (e: MouseEvent) => {
      const drag = draggingTextRef.current;
      const area = slideAreaRef.current;
      if (!drag || !area) return;
      const rect = area.getBoundingClientRect();
      const curX = (e.clientX - rect.left) / rect.width;
      const curY = (e.clientY - rect.top) / rect.height;
      const dx = curX - drag.startX; const dy = curY - drag.startY;
      const newX = Math.max(0, Math.min(0.95, drag.origX + dx));
      const newY = Math.max(0, Math.min(0.95, drag.origY + dy));
      const list = textAnnotationsRef.current.get(currentSlide) || [];
      const idx = list.findIndex((t) => t.id === drag.id);
      if (idx >= 0) { list[idx] = { ...list[idx], x: newX, y: newY }; textAnnotationsRef.current.set(currentSlide, list); setTextAnnotationsVersion((v) => v + 1); }
    };
    const handleMouseUp = () => { draggingTextRef.current = null; setIsDraggingText(false); };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [isDraggingText, currentSlide]);

  /* ── Export annotations as PNG ── */
  const exportAnnotationsPNG = useCallback(() => {
    const area = slideAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const w = rect.width * 2; const h = rect.height * 2;
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    // Draw strokes
    const strokes = annotationsRef.current.get(currentSlide) || [];
    for (const stroke of strokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath(); ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (stroke.isEraser) continue; // skip eraser for export
      if (stroke.isHighlighter) { ctx.globalAlpha = 0.35; ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.size * 4; }
      else { ctx.globalAlpha = 1; ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.size; }
      ctx.moveTo(stroke.points[0].x * rect.width, stroke.points[0].y * rect.height);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x * rect.width, stroke.points[i].y * rect.height);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    // Draw text annotations
    const texts = textAnnotationsRef.current.get(currentSlide) || [];
    for (const ta of texts) {
      ctx.globalAlpha = 1;
      ctx.font = `${ta.fontSize}px sans-serif`;
      ctx.fillStyle = ta.color;
      ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
      const lines = ta.text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], ta.x * rect.width + 8, ta.y * rect.height + ta.fontSize * (i + 1));
      }
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    }
    // Download
    const link = document.createElement("a");
    link.download = `geleximco-annotations-slide-${currentSlide}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [currentSlide]);

  /* ── Export all annotations as JSON ── */
  const exportAnnotationsJSON = useCallback(() => {
    const data: Record<string, { strokes: DrawStroke[]; texts: TextAnnotation[] }> = {};
    const allSlides = new Set([...annotationsRef.current.keys(), ...textAnnotationsRef.current.keys()]);
    allSlides.forEach((slideNum) => {
      const strokes = annotationsRef.current.get(slideNum) || [];
      const texts = textAnnotationsRef.current.get(slideNum) || [];
      if (strokes.length > 0 || texts.length > 0) {
        data[slideNum] = { strokes: strokes.map((s) => ({ ...s })), texts: texts.map((t) => ({ ...t })) };
      }
    });
    if (Object.keys(data).length === 0) { toast.warning("Chưa có annotation nào để xuất."); return; }
    const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), source: "Geleximco LMS", totalSlides, data }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `geleximco-annotations-${new Date().toISOString().slice(0, 10)}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, [totalSlides]);

  /* ── Import annotations from JSON ── */
  const importAnnotationsJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.data || typeof parsed.data !== "object") { toast.error("File JSON không hợp lệ."); return; }
        let strokeCount = 0; let textCount = 0;
        for (const [slideStr, val] of Object.entries(parsed.data)) {
          const slideNum = parseInt(slideStr);
          const slideData = val as { strokes?: DrawStroke[]; texts?: TextAnnotation[] };
          if (isNaN(slideNum)) continue;
          if (slideData.strokes && Array.isArray(slideData.strokes)) {
            const existing = annotationsRef.current.get(slideNum) || [];
            annotationsRef.current.set(slideNum, [...existing, ...slideData.strokes]);
            strokeCount += slideData.strokes.length;
          }
          if (slideData.texts && Array.isArray(slideData.texts)) {
            const existing = textAnnotationsRef.current.get(slideNum) || [];
            // Re-generate IDs to avoid duplicates
            const imported = slideData.texts.map((t: TextAnnotation) => ({ ...t, id: `ta-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }));
            textAnnotationsRef.current.set(slideNum, [...existing, ...imported]);
            textCount += imported.length;
          }
        }
        setAnnotationsVersion((v) => v + 1);
        setTextAnnotationsVersion((v) => v + 1);
        toast.success(`Đã nhập: ${strokeCount} nét vẽ, ${textCount} ghi chú text từ ${Object.keys(parsed.data).length} slide.`);
      } catch { toast.error("Lỗi đọc file JSON."); }
    };
    reader.readAsText(file);
    // Reset input
    if (importFileRef.current) importFileRef.current.value = "";
  }, []);

  /* ── Close export menu on click outside ── */
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExportMenu]);

  useEffect(() => {
    if (presenterTool !== "laser" || !presenterMode) return;
    const iv = setInterval(() => setLaserTrail((prev) => prev.filter((p) => Date.now() - p.t < 600)), 50);
    return () => clearInterval(iv);
  }, [presenterTool, presenterMode]);

  /* ── Presenter elapsed timer ── */
  useEffect(() => {
    if (!presenterMode) { setPresenterElapsed(0); return; }
    presenterStartRef.current = Date.now();
    const iv = setInterval(() => {
      setPresenterElapsed(Math.floor((Date.now() - presenterStartRef.current) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [presenterMode]);

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); const s = sec % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  const currentTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };
  const [clockStr, setClockStr] = useState(currentTimeStr());
  useEffect(() => {
    if (!presenterMode) return;
    const iv = setInterval(() => setClockStr(currentTimeStr()), 10000);
    setClockStr(currentTimeStr());
    return () => clearInterval(iv);
  }, [presenterMode]);

  /* ── Share link helpers ── */
  const getSlideLink = (slideNum: number) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?slide=${slideNum}`;
  };
  const copySlideLink = (slideNum: number) => {
    copyToClipboard(getSlideLink(slideNum)).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  /* ── Export PDF (print-ready window) ── */
  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      const win = window.open("", "_blank");
      if (!win) { setExportingPdf(false); return; }
      const slideTypeLabel = (type: SlideType) => {
        switch (type) {
          case "cover": return "Bìa"; case "toc": return "Mục lục"; case "content": return "Nội dung";
          case "diagram": return "Sơ đồ"; case "quote": return "Trích dẫn"; case "chart": return "Biểu đồ";
          case "comparison": return "So sánh"; case "summary": return "Tổng kết";
        }
      };
      const slidesHtml = SLIDES.map((s) => {
        let body = "";
        if (s.type === "cover") {
          body = `<div style="text-align:center;padding:60px 40px"><div style="display:inline-block;background:#c8a84e;color:#990803;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;margin-bottom:16px">GELEXIMCO LMS</div><h1 style="color:white;font-size:36px;font-weight:700;white-space:pre-line;margin:0 0 12px">${s.title}</h1><p style="color:rgba(255,255,255,0.6);font-size:16px;margin:0">${s.subtitle || ""}</p><div style="margin-top:24px;color:#c8a84e;font-size:11px">Phạm Anh Tuấn • Q1/2026</div></div>`;
        } else if (s.type === "toc") {
          body = `<div style="padding:40px"><h2 style="color:#c8a84e;font-size:26px;font-weight:700;margin:0 0 20px">${s.title}</h2>${(s.items || []).map((item, i) => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:600;flex-shrink:0">${i + 1}</div><span style="color:rgba(255,255,255,0.8);font-size:15px">${item}</span></div>`).join("")}</div>`;
        } else if (s.type === "quote") {
          body = `<div style="text-align:center;padding:50px 60px"><div style="font-size:40px;color:#c8a84e;margin-bottom:16px">"</div><p style="color:rgba(255,255,255,0.9);font-size:18px;font-style:italic;line-height:1.7;margin:0 0 24px">${s.content}</p><div style="color:#c8a84e;font-size:14px;font-weight:600">${s.quoteAuthor || ""}</div><div style="color:rgba(255,255,255,0.4);font-size:11px">${s.quoteRole || ""}</div></div>`;
        } else if (s.type === "chart") {
          const maxVal = Math.max(...(s.chartBars?.map(b => b.value) ?? [100]));
          body = `<div style="padding:40px"><h2 style="color:#c8a84e;font-size:24px;font-weight:700;text-align:center;margin:0 0 24px">${s.title}</h2><div style="display:flex;align-items:flex-end;justify-content:center;gap:20px;height:180px">${(s.chartBars || []).map(bar => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px"><span style="color:white;font-size:14px;font-weight:700">${bar.value}%</span><div style="width:100%;height:${(bar.value / maxVal) * 100}%;background:${bar.color};border-radius:4px 4px 0 0"></div><span style="color:rgba(255,255,255,0.6);font-size:10px;text-align:center;white-space:pre-line">${bar.label}</span></div>`).join("")}</div></div>`;
        } else if (s.type === "comparison") {
          body = `<div style="padding:40px"><h2 style="color:#c8a84e;font-size:24px;font-weight:700;text-align:center;margin:0 0 20px">${s.title}</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${[{ col: s.leftCol, color: "#ef4444" }, { col: s.rightCol, color: "#22c55e" }].map(({ col, color }) => `<div style="border:1px solid ${color}40;border-radius:8px;padding:16px;background:${color}08"><h3 style="color:${color};font-size:14px;font-weight:700;border-bottom:1px solid ${color}30;padding-bottom:8px;margin:0 0 12px">${col?.heading || ""}</h3>${(col?.items || []).map(item => `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px"><div style="width:5px;height:5px;border-radius:50%;background:${color};margin-top:6px;flex-shrink:0"></div><span style="color:rgba(255,255,255,0.7);font-size:12px;line-height:1.5">${item}</span></div>`).join("")}</div>`).join("")}</div></div>`;
        } else if (s.type === "diagram") {
          body = `<div style="padding:40px"><h2 style="color:#c8a84e;font-size:24px;font-weight:700;text-align:center;margin:0 0 24px">${s.title}</h2><div style="display:flex;flex-direction:column;align-items:center;gap:4px">${(s.diagramNodes || []).map((node, i) => `<div style="width:${70 - i * 8}%;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:10px 16px;text-align:center;background:rgba(200,168,78,${(0.5 + ((s.diagramNodes?.length || 5) - i) * 0.1) * 0.15})"><div style="color:white;font-size:13px;font-weight:700">${node.label}</div><div style="color:rgba(255,255,255,0.5);font-size:10px">${node.desc}</div></div>`).join("")}</div></div>`;
        } else if (s.type === "summary") {
          body = `<div style="text-align:center;padding:40px"><div style="display:inline-block;background:#c8a84e;color:#990803;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;margin-bottom:12px">TỔNG KẾT</div><h2 style="color:white;font-size:26px;font-weight:700;margin:0 0 24px">${s.title}</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${(s.summaryItems || []).map(item => `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;text-align:center"><div style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:600">${item.label}</div><div style="color:white;font-size:15px;font-weight:700;margin-top:4px">${item.value}</div></div>`).join("")}</div></div>`;
        } else {
          body = `<div style="padding:40px"><p style="color:#c8a84e;font-size:11px;font-weight:600;margin:0 0 6px">Slide ${s.num} / ${totalSlides}</p><h2 style="color:white;font-size:26px;font-weight:700;margin:0 0 12px">${s.title}</h2><p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;margin:0 0 16px">${s.content || ""}</p>${(s.bullets || []).map(b => `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px"><div style="width:6px;height:6px;border-radius:50%;background:#c8a84e;margin-top:7px;flex-shrink:0"></div><span style="color:rgba(255,255,255,0.8);font-size:13px;line-height:1.6">${b}</span></div>`).join("")}</div>`;
        }
        return `<div class="slide-page" style="page-break-after:always;width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#990803,#7a0602,#5a0401);border-radius:8px;overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:center;margin-bottom:24px;box-shadow:0 4px 12px rgba(0,0,0,0.3)"><div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:${slideTypeLabel(s.type) === "Bìa" ? "#c8a84e" : s.type === "toc" ? "#8b5cf6" : s.type === "content" ? "#3b82f6" : s.type === "diagram" ? "#22c55e" : s.type === "quote" ? "#f97316" : s.type === "chart" ? "#ef4444" : s.type === "comparison" ? "#06b6d4" : "#ec4899"}"></div>${body}<div style="position:absolute;bottom:8px;right:12px;color:rgba(255,255,255,0.3);font-size:10px">${slideTypeLabel(s.type)} — ${s.num}/${totalSlides}</div></div><div style="color:#666;font-size:11px;margin:-16px 0 32px 8px;line-height:1.6"><strong>Speaker Notes:</strong> ${s.notes}</div>`;
      }).join("");
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Export — ${lesson.title.replace("Bài thuyết trình: ", "")}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#f3f4f6;padding:40px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}.header{text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #990803}.header h1{color:#990803;font-size:22px}.header p{color:#666;font-size:12px;margin-top:4px}.slide-page{break-inside:avoid}@media print{body{background:white;padding:20px}.header{break-after:page}}</style></head><body><div class="header"><h1>${lesson.title.replace("Bài thuyết trình: ", "")}</h1><p>Geleximco LMS — ${totalSlides} slides — Exported ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p><button onclick="window.print()" style="margin-top:12px;padding:8px 24px;background:#990803;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600">In / Save PDF</button></div>${slidesHtml}</body></html>`);
      win.document.close();
      setExportingPdf(false);
      setShowExportModal(false);
    }, 500);
  };

  /* ── Keyboard arrows ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && presenterMode) { setPresenterMode(false); return; }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setCurrentSlide((s) => Math.max(1, s - 1)); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); setCurrentSlide((s) => Math.min(totalSlides, s + 1)); }
      else if (e.key === "Home") { e.preventDefault(); setCurrentSlide(1); }
      else if (e.key === "End") { e.preventDefault(); setCurrentSlide(totalSlides); }
      else if (e.key === "g" && !presenterMode) { setShowGrid((v) => !v); }
      else if (e.key === "n") { setShowNotes((v) => !v); }
      else if (e.key === "f" && !presenterMode) { setShowFilmstrip((v) => !v); }
      else if (e.key === "p") { setPresenterMode((v) => !v); }
      else if (e.key === "l" && presenterMode) { setPresenterTool("laser"); }
      else if (e.key === "d" && presenterMode) { setPresenterTool("pen"); }
      else if (e.key === "h" && presenterMode) { setPresenterTool("highlighter"); }
      else if (e.key === "e" && presenterMode) { setPresenterTool("eraser"); }
      else if (e.key === "v" && presenterMode) { setPresenterTool("pointer"); }
      else if (e.key === "s" && presenterMode) { setPresenterTool("spotlight"); }
      else if (e.key === "t" && presenterMode) { commitTextAnnotation(); setPresenterTool("text"); }
      else if (e.key === "z" && (e.ctrlKey || e.metaKey) && presenterMode) { e.preventDefault(); undoAnnotation(); }
      else if (e.key === "c" && e.shiftKey && presenterMode) { clearAnnotations(); }
      else if (e.key === "=" && presenterMode && presenterTool === "spotlight") { setSpotlightRadius((r) => Math.min(40, r + 2)); }
      else if (e.key === "-" && presenterMode && presenterTool === "spotlight") { setSpotlightRadius((r) => Math.max(5, r - 2)); }
      else if (e.key === "Escape" && editingTextId) { commitTextAnnotation(); }
      else if (e.key === "Enter" && !e.shiftKey && editingTextId) { e.preventDefault(); commitTextAnnotation(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [totalSlides, presenterMode]);

  /* ── Auto-scroll filmstrip to active ── */
  useEffect(() => {
    if (!filmstripRef.current) return;
    const activeThumb = filmstripRef.current.querySelector(`[data-slide="${currentSlide}"]`) as HTMLElement;
    if (activeThumb) activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentSlide]);

  /* ── Auto-play timer ── */
  useEffect(() => {
    if (!autoPlay) { setAutoPlayCountdown(0); return; }
    setAutoPlayCountdown(autoPlayInterval);
    const interval = setInterval(() => {
      setAutoPlayCountdown((c) => {
        if (c <= 1) {
          setCurrentSlide((s) => {
            if (s >= totalSlides) { setAutoPlay(false); return s; }
            return s + 1;
          });
          return autoPlayInterval;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, totalSlides]);

  /* ── Slide type icon helper ── */
  const slideTypeIcon = (type: SlideType, size = 3) => {
    const cls = `w-${size} h-${size}`;
    switch (type) {
      case "cover": return <Presentation className={cls} />;
      case "toc": return <List className={cls} />;
      case "content": return <FileText className={cls} />;
      case "diagram": return <Target className={cls} />;
      case "quote": return <Quote className={cls} />;
      case "chart": return <BarChart3 className={cls} />;
      case "comparison": return <ArrowLeftRight className={cls} />;
      case "summary": return <Award className={cls} />;
    }
  };
  const slideTypeName = (type: SlideType) => {
    switch (type) {
      case "cover": return "Bìa"; case "toc": return "Mục lục"; case "content": return "Nội dung";
      case "diagram": return "Sơ đồ"; case "quote": return "Trích dẫn"; case "chart": return "Biểu đồ";
      case "comparison": return "So sánh"; case "summary": return "Tổng kết";
    }
  };
  const slideTypeColor = (type: SlideType) => {
    switch (type) {
      case "cover": return "#c8a84e"; case "toc": return "#8b5cf6"; case "content": return "#3b82f6";
      case "diagram": return "#22c55e"; case "quote": return "#f97316"; case "chart": return "#ef4444";
      case "comparison": return "#06b6d4"; case "summary": return "#ec4899";
    }
  };

  /* ── Render slide content on the "stage" ── */
  const renderSlideContent = (s: SlideData) => {
    const bg = "bg-gradient-to-br from-[#990803] via-[#7a0602] to-[#5a0401]";
    return (
      <div className={`w-full h-full ${bg} rounded-lg shadow-xl overflow-hidden relative`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10" style={{ background: "radial-gradient(circle at 80% 30%, #c8a84e 0%, transparent 60%)" }} />
        <div className="absolute bottom-0 left-0 w-40 h-40 border-2 border-white/10 rounded-full -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-0 right-0 w-32 h-32 border border-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />

        <div className="relative z-10 h-full flex flex-col justify-center p-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {s.type === "cover" && (
            <div className="text-center">
              <div className="inline-block px-3 py-1 bg-[#c8a84e] rounded mb-4"><span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 700 }}>GELEXIMCO LMS</span></div>
              <h1 className="text-white whitespace-pre-line" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.3 }}>{s.title}</h1>
              <p className="text-white/60 mt-3" style={{ fontSize: "14px" }}>{s.subtitle}</p>
              <div className="mt-5 flex items-center justify-center gap-2">
                <div className="w-12 h-0.5 bg-[#c8a84e]" /><span className="text-[#c8a84e]" style={{ fontSize: "11px" }}>Phạm Anh Tuấn &bull; Q1/2026</span><div className="w-12 h-0.5 bg-[#c8a84e]" />
              </div>
            </div>
          )}

          {s.type === "toc" && (
            <div>
              <h2 className="text-[#c8a84e] mb-5" style={{ fontSize: "22px", fontWeight: 700 }}>{s.title}</h2>
              <div className="space-y-2.5">
                {s.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentSlide(Math.min(totalSlides, i + 3))}>
                    <div className="w-7 h-7 rounded-full border border-white/30 group-hover:border-[#c8a84e] group-hover:bg-[#c8a84e]/20 flex items-center justify-center transition-colors"><span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>{i + 1}</span></div>
                    <span className="text-white/80 group-hover:text-white transition-colors" style={{ fontSize: "14px" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.type === "content" && (
            <div>
              <p className="text-[#c8a84e] mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>Slide {s.num} / {totalSlides}</p>
              <h2 className="text-white mb-3" style={{ fontSize: "22px", fontWeight: 700 }}>{s.title}</h2>
              <p className="text-white/70 mb-4" style={{ fontSize: "13px", lineHeight: 1.7 }}>{s.content}</p>
              {s.bullets && (
                <div className="space-y-2 pl-1">
                  {s.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#c8a84e] mt-1.5 shrink-0" />
                      <span className="text-white/80" style={{ fontSize: "12px", lineHeight: 1.6 }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {s.type === "diagram" && (
            <div>
              <h2 className="text-[#c8a84e] mb-3 text-center" style={{ fontSize: "18px", fontWeight: 700 }}>{s.title}</h2>
              <div className="flex flex-col items-center gap-0">
                {s.diagramNodes?.map((node, i) => {
                  const nodeCount = s.diagramNodes!.length;
                  const w = 60 - i * (nodeCount > 5 ? 5 : 7);
                  const opacity = 0.5 + (nodeCount - i) * 0.1;
                  return (
                    <div key={i} className="relative flex flex-col items-center">
                      {i > 0 && <div className="w-px h-1.5 bg-white/20" />}
                      <div className="rounded-lg border border-white/20 px-3 py-1.5 text-center transition-all hover:border-[#c8a84e]/50 hover:bg-white/5" style={{ width: `${Math.max(25, w)}%`, background: `rgba(200,168,78,${opacity * 0.15})` }}>
                        <span className="text-white block" style={{ fontSize: "11px", fontWeight: 700 }}>{node.label}</span>
                        <span className="text-white/50 block" style={{ fontSize: "9px" }}>{node.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {s.type === "quote" && (
            <div className="text-center px-6">
              <div className="w-10 h-10 rounded-full bg-[#c8a84e]/20 flex items-center justify-center mx-auto mb-4">
                <Quote className="w-5 h-5 text-[#c8a84e]" />
              </div>
              <p className="text-white/90 italic mb-5" style={{ fontSize: "16px", lineHeight: 1.7 }}>"{s.content}"</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-0.5 bg-[#c8a84e]/50" />
                <div>
                  <p className="text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 600 }}>{s.quoteAuthor}</p>
                  <p className="text-white/40" style={{ fontSize: "10px" }}>{s.quoteRole}</p>
                </div>
                <div className="w-10 h-0.5 bg-[#c8a84e]/50" />
              </div>
            </div>
          )}

          {s.type === "chart" && (
            <div>
              <h2 className="text-[#c8a84e] mb-4 text-center" style={{ fontSize: "20px", fontWeight: 700 }}>{s.title}</h2>
              <div className="flex items-end justify-center gap-4 h-40 px-4">
                {s.chartBars?.map((bar, i) => {
                  const maxVal = Math.max(...(s.chartBars?.map((b) => b.value) ?? [100]));
                  const h = (bar.value / maxVal) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-white" style={{ fontSize: "12px", fontWeight: 700 }}>{bar.value}%</span>
                      <div className="w-full rounded-t-md relative overflow-hidden" style={{ height: `${h}%`, background: bar.color }}>
                        <div className="absolute inset-0 bg-white/10" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)" }} />
                      </div>
                      <span className="text-white/60 text-center whitespace-pre-line" style={{ fontSize: "9px", fontWeight: 500, lineHeight: 1.3 }}>{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {s.type === "comparison" && (
            <div>
              <h2 className="text-[#c8a84e] mb-4 text-center" style={{ fontSize: "20px", fontWeight: 700 }}>{s.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[s.leftCol, s.rightCol].map((col, ci) => (
                  <div key={ci} className={`rounded-lg p-3 border ${ci === 0 ? "border-red-500/30 bg-red-500/5" : "border-green-500/30 bg-green-500/5"}`}>
                    <h3 className={`mb-2.5 pb-1.5 border-b ${ci === 0 ? "text-red-300 border-red-500/20" : "text-green-300 border-green-500/20"}`} style={{ fontSize: "13px", fontWeight: 700 }}>{col?.heading}</h3>
                    <div className="space-y-1.5">
                      {col?.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${ci === 0 ? "bg-red-400" : "bg-green-400"}`} />
                          <span className="text-white/70" style={{ fontSize: "11px", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {s.type === "summary" && (
            <div className="text-center">
              <div className="inline-block px-3 py-1 bg-[#c8a84e] rounded mb-3"><span className="text-[#990803]" style={{ fontSize: "10px", fontWeight: 700 }}>TỔNG KẾT</span></div>
              <h2 className="text-white mb-5" style={{ fontSize: "22px", fontWeight: 700 }}>{s.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {s.summaryItems?.map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#c8a84e]/20 flex items-center justify-center mx-auto mb-2">
                      {item.icon === "target" && <Target className="w-4 h-4 text-[#c8a84e]" />}
                      {item.icon === "users" && <Users className="w-4 h-4 text-[#c8a84e]" />}
                      {item.icon === "trending" && <TrendingUp className="w-4 h-4 text-[#c8a84e]" />}
                      {item.icon === "award" && <Award className="w-4 h-4 text-[#c8a84e]" />}
                    </div>
                    <p className="text-white/50" style={{ fontSize: "10px", fontWeight: 600 }}>{item.label}</p>
                    <p className="text-white mt-0.5" style={{ fontSize: "13px", fontWeight: 700 }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-16 h-0.5 bg-[#c8a84e]/50" />
                <span className="text-[#c8a84e]/60" style={{ fontSize: "10px" }}>Geleximco Leadership Development Program 2026-2028</span>
                <div className="w-16 h-0.5 bg-[#c8a84e]/50" />
              </div>
            </div>
          )}
        </div>
        {/* Slide number badge */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
          <span className="text-white/20" style={{ fontSize: "9px", fontWeight: 500 }}>{slideTypeName(s.type)}</span>
          <span className="text-white/30" style={{ fontSize: "10px" }}>{s.num} / {totalSlides}</span>
        </div>
        {/* Type color accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: slideTypeColor(s.type) }} />
      </div>
    );
  };

  /* ── Filmstrip thumbnail mini render ── */
  const renderThumbContent = (s: SlideData) => {
    const typeCol = slideTypeColor(s.type);
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#990803] via-[#7a0602] to-[#5a0401] flex flex-col items-center justify-center p-1.5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: typeCol }} />
        <div className="w-4 h-4 rounded-full flex items-center justify-center mb-0.5" style={{ background: `${typeCol}30` }}>
          <div style={{ color: typeCol }} className="scale-75">{slideTypeIcon(s.type, 3)}</div>
        </div>
        <span className="text-white/90 text-center leading-tight truncate w-full" style={{ fontSize: "7px", fontWeight: 600 }}>{s.title.split("\n")[0]}</span>
        <span className="text-white/40" style={{ fontSize: "6px" }}>{slideTypeName(s.type)}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Presentation className="w-4 h-4 text-orange-500" />
          <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{lesson.title.replace("Bài thuyết trình: ", "")}</span>
          <span className="text-gray-400 ml-1" style={{ fontSize: "11px" }}>Slide {currentSlide}/{totalSlides}</span>
          <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: "8px", fontWeight: 700, background: slideTypeColor(slide.type) }}>{slideTypeName(slide.type)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showFilmstrip ? "bg-orange-100 text-orange-600" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setShowFilmstrip(!showFilmstrip)} title="Filmstrip (F)"><PanelLeft className="w-4 h-4" /></button>
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showGrid ? "bg-gray-200 text-gray-700" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setShowGrid(!showGrid)} title="Grid view (G)"><Layers className="w-4 h-4" /></button>
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showNotes ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setShowNotes(!showNotes)} title="Speaker notes (N)"><StickyNote className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-gray-300 mx-0.5" />
          {/* Auto-play */}
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${autoPlay ? "bg-green-100 text-green-600" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setAutoPlay(!autoPlay)} title={autoPlay ? "Dừng auto-play" : "Auto-play"}>
            {autoPlay ? <Pause className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
          </button>
          {autoPlay && (
            <div className="flex items-center gap-1">
              <select value={autoPlayInterval} onChange={(e) => setAutoPlayInterval(Number(e.target.value))} className="px-1 py-0.5 bg-green-50 border border-green-200 rounded text-green-700 cursor-pointer" style={{ fontSize: "10px" }}>
                {[3, 5, 8, 10, 15].map((s) => <option key={s} value={s}>{s}s</option>)}
              </select>
              <div className="w-8 h-1 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${((autoPlayInterval - autoPlayCountdown) / autoPlayInterval) * 100}%` }} />
              </div>
              <span className="text-green-600" style={{ fontSize: "9px", fontWeight: 600 }}>{autoPlayCountdown}s</span>
            </div>
          )}
          <div className="w-px h-4 bg-gray-300 mx-0.5" />
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${presenterMode ? "bg-purple-100 text-purple-600" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setPresenterMode(!presenterMode)} title="Presenter Mode (P)"><Monitor className="w-4 h-4" /></button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded cursor-pointer" onClick={() => setShowShareModal(true)} title="Chia sẻ link slide"><Link2 className="w-4 h-4" /></button>
          <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded cursor-pointer" onClick={() => setShowExportModal(true)} title="Export PDF"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {/* ── Grid view ── */}
      {showGrid ? (
        <div className="p-4 grid grid-cols-4 gap-3 max-h-[520px] overflow-y-auto bg-gray-100" style={{ scrollbarWidth: "thin" }}>
          {SLIDES.map((s) => (
            <button key={s.num} onClick={() => { setCurrentSlide(s.num); setShowGrid(false); }} className={`aspect-[16/9] rounded-lg border-2 transition-all cursor-pointer overflow-hidden relative group ${currentSlide === s.num ? "border-[#990803] shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
              <div className="w-full h-full bg-gradient-to-br from-[#990803] via-[#7a0602] to-[#5a0401] flex flex-col items-center justify-center p-2 relative">
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: slideTypeColor(s.type) }} />
                <div className="w-5 h-5 rounded-full flex items-center justify-center mb-1" style={{ background: `${slideTypeColor(s.type)}30` }}>
                  <div style={{ color: slideTypeColor(s.type) }} className="scale-[0.6]">{slideTypeIcon(s.type, 4)}</div>
                </div>
                <span className="text-white/90 text-center leading-tight" style={{ fontSize: "8px", fontWeight: 600 }}>{s.title.split("\n")[0]}</span>
                <span className="text-white/40 mt-0.5" style={{ fontSize: "7px" }}>{slideTypeName(s.type)}</span>
              </div>
              <div className="absolute top-1 left-1 px-1 py-0.5 bg-black/40 rounded" style={{ fontSize: "8px", fontWeight: 600, color: "white" }}>{s.num}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex">
          {/* ── Filmstrip sidebar ── */}
          {showFilmstrip && (
            <div ref={filmstripRef} className="w-[120px] shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto max-h-[480px]" style={{ scrollbarWidth: "thin" }}>
              {SLIDES.map((s) => (
                <div key={s.num} data-slide={s.num} className={`p-1.5 cursor-pointer transition-all ${currentSlide === s.num ? "bg-orange-50" : "hover:bg-gray-100"}`} onClick={() => setCurrentSlide(s.num)}>
                  <div className={`aspect-[16/9] rounded border-2 overflow-hidden transition-all ${currentSlide === s.num ? "border-[#990803] shadow-md" : "border-gray-200"}`}>
                    {renderThumbContent(s)}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-0.5">
                    <span className={`${currentSlide === s.num ? "text-[#990803]" : "text-gray-400"}`} style={{ fontSize: "9px", fontWeight: 600 }}>{s.num}</span>
                    <span className={`truncate ${currentSlide === s.num ? "text-gray-700" : "text-gray-500"}`} style={{ fontSize: "8px" }}>{s.title.split("\n")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Main slide area ── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-gray-100 p-5 flex items-center justify-center relative" style={{ minHeight: showNotes ? 360 : 440 }}>
              <div className="w-full max-w-3xl aspect-[16/9]">
                {renderSlideContent(slide)}
              </div>
              {/* Nav arrows overlay */}
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-20 disabled:cursor-default transition-all" disabled={currentSlide === 1} onClick={() => setCurrentSlide((s) => s - 1)}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white shadow flex items-center justify-center cursor-pointer text-gray-600 hover:text-gray-800 disabled:opacity-20 disabled:cursor-default transition-all" disabled={currentSlide === totalSlides} onClick={() => setCurrentSlide((s) => s + 1)}>
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Auto-play progress bar */}
              {autoPlay && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-200">
                  <div className="h-full bg-green-500 transition-all duration-1000 ease-linear" style={{ width: `${((autoPlayInterval - autoPlayCountdown) / autoPlayInterval) * 100}%` }} />
                </div>
              )}
            </div>

            {/* ── Speaker notes panel ── */}
            {showNotes && (
              <div className="border-t border-gray-200 bg-white px-5 py-3 max-h-[140px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-blue-600" style={{ fontSize: "11px", fontWeight: 600 }}>Speaker Notes — Slide {currentSlide}</span>
                </div>
                <p className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.7 }}>{slide.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
        <button className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" style={{ fontSize: "12px" }} disabled={currentSlide === 1} onClick={() => setCurrentSlide((s) => s - 1)}>
          <ChevronLeft className="w-4 h-4" /> Trước
        </button>
        <div className="flex items-center gap-0.5 max-w-[50%] overflow-hidden">
          {SLIDES.map((s) => (
            <button key={s.num} className={`shrink-0 h-1.5 rounded-full cursor-pointer transition-all ${currentSlide === s.num ? "w-5" : "w-1.5"}`} style={{ background: currentSlide === s.num ? slideTypeColor(s.type) : s.num < currentSlide ? `${slideTypeColor(s.type)}60` : "#d1d5db" }} onClick={() => setCurrentSlide(s.num)} title={`${s.num}. ${s.title.split("\n")[0]}`} />
          ))}
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-30 cursor-pointer" style={{ fontSize: "12px" }} disabled={currentSlide === totalSlides} onClick={() => setCurrentSlide((s) => s + 1)}>
          Tiếp <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Keyboard shortcut hint */}
      <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-3">
        {[
          { key: "← →", label: "Chuyển slide" },
          { key: "F", label: "Filmstrip" },
          { key: "N", label: "Notes" },
          { key: "G", label: "Grid" },
          { key: "P", label: "Presenter" },
          { key: "Space", label: "Tiếp" },
        ].map((h) => (
          <div key={h.key} className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-gray-500 border border-gray-300" style={{ fontSize: "8px", fontWeight: 600 }}>{h.key}</kbd>
            <span className="text-gray-400" style={{ fontSize: "9px" }}>{h.label}</span>
          </div>
        ))}
      </div>

      {/* ══════════ PRESENTER MODE OVERLAY ══════════ */}
      {presenterMode && (
        <div className="fixed inset-0 z-[9999] bg-[#1a1a2e] flex flex-col select-none">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Presentation className="w-4 h-4 text-[#c8a84e]" />
              <span className="text-white/90" style={{ fontSize: "13px", fontWeight: 600 }}>{lesson.title.replace("Bài thuyết trình: ", "")}</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300" style={{ fontSize: "9px", fontWeight: 700 }}>PRESENTER MODE</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Clock */}
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white/60" style={{ fontSize: "13px", fontWeight: 500 }}>{clockStr}</span>
              </div>
              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10">
                <Timer className="w-3.5 h-3.5 text-[#c8a84e]" />
                <span className="text-[#c8a84e] font-mono" style={{ fontSize: "15px", fontWeight: 700 }}>{formatTimer(presenterElapsed)}</span>
              </div>
              {/* Slide counter */}
              <span className="text-white/50" style={{ fontSize: "12px" }}>Slide <span className="text-white" style={{ fontWeight: 700 }}>{currentSlide}</span> / {totalSlides}</span>
              <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded cursor-pointer transition-colors" onClick={() => setPresenterMode(false)} title="Thoát (ESC)">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex min-h-0 p-4 gap-4">
            {/* Left: Current slide (large) + laser + canvas */}
            <div className="flex-[3] flex flex-col min-w-0">
              <div className="flex-1 flex items-center justify-center relative">
                <div ref={slideAreaRef} className="w-full max-w-4xl aspect-[16/9] relative overflow-hidden"
                  style={{ cursor: presenterTool === "laser" || presenterTool === "spotlight" ? "none" : presenterTool === "pen" || presenterTool === "highlighter" ? "crosshair" : presenterTool === "eraser" ? "cell" : presenterTool === "text" ? "text" : "default" }}
                  onMouseDown={handleSlideMouseDown} onMouseMove={handleSlideMouseMove} onMouseUp={handleSlideMouseUp} onMouseLeave={handleSlideMouseLeave} onWheel={handleSlideWheel}
                >
                  {renderSlideContent(slide)}
                  {/* Canvas overlay for annotations */}
                  <canvas ref={slideCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 20 }} />

                  {/* ── Text annotations layer ── */}
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 22 }}>
                    {getTextAnnotations().map((ta) => (
                      <div key={ta.id} className={`absolute pointer-events-auto group ${isDraggingText && draggingTextRef.current?.id === ta.id ? "ring-2 ring-[#c8a84e] ring-offset-1 ring-offset-transparent rounded" : ""}`} style={{ left: `${ta.x * 100}%`, top: `${ta.y * 100}%`, transform: "translate(-2px, -2px)", zIndex: isDraggingText && draggingTextRef.current?.id === ta.id ? 30 : 22 }}>
                        {editingTextId === ta.id ? (
                          <textarea
                            ref={textInputRef}
                            className="bg-black/60 text-white border border-[#c8a84e] rounded px-2 py-1 outline-none resize-none min-w-[120px] max-w-[280px]"
                            style={{ fontSize: `${ta.fontSize}px`, color: ta.color, lineHeight: 1.4, caretColor: ta.color }}
                            value={editingTextValue}
                            onChange={(e) => setEditingTextValue(e.target.value)}
                            onBlur={commitTextAnnotation}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitTextAnnotation(); } if (e.key === "Escape") { commitTextAnnotation(); } e.stopPropagation(); }}
                            rows={Math.max(1, editingTextValue.split("\n").length)}
                            autoFocus
                          />
                        ) : (
                          <div className="relative" onClick={(e) => { e.stopPropagation(); if (presenterTool === "text" || presenterTool === "pointer") { setEditingTextId(ta.id); setEditingTextValue(ta.text); setTimeout(() => textInputRef.current?.focus(), 50); } }}>
                            {/* Drag handle */}
                            <div
                              className="absolute -left-5 top-0 w-4 h-full flex items-start pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                              onMouseDown={(e) => startDragText(e, ta.id)}
                              title="Kéo để di chuyển"
                            >
                              <GripVertical className="w-3.5 h-3.5 text-[#c8a84e] drop-shadow-lg" />
                            </div>
                            <div className={`px-2 py-0.5 rounded whitespace-pre-wrap transition-all ${isDraggingText && draggingTextRef.current?.id === ta.id ? "opacity-80" : ""}`} style={{ fontSize: `${ta.fontSize}px`, color: ta.color, lineHeight: 1.4, textShadow: "0 1px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)", cursor: presenterTool === "text" || presenterTool === "pointer" ? "pointer" : "default" }}>
                              {ta.text}
                            </div>
                            {/* Delete btn on hover */}
                            <button className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ zIndex: 25 }} onClick={(e) => { e.stopPropagation(); deleteTextAnnotation(ta.id); }}>
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ── Spotlight overlay ── */}
                  {presenterTool === "spotlight" && spotlightPos && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 25 }}>
                      <defs>
                        <radialGradient id="spotlight-grad" cx={`${spotlightPos.x * 100}%`} cy={`${spotlightPos.y * 100}%`} r={`${spotlightRadius}%`}>
                          <stop offset="0%" stopColor="black" stopOpacity="0" />
                          <stop offset="70%" stopColor="black" stopOpacity="0" />
                          <stop offset="85%" stopColor="black" stopOpacity={spotlightOpacity * 0.5} />
                          <stop offset="100%" stopColor="black" stopOpacity={spotlightOpacity} />
                        </radialGradient>
                        <mask id="spotlight-mask">
                          <rect width="100%" height="100%" fill="white" />
                          <circle cx={`${spotlightPos.x * 100}%`} cy={`${spotlightPos.y * 100}%`} r={`${spotlightRadius}%`} fill="black" />
                        </mask>
                      </defs>
                      {/* Dark overlay with cutout */}
                      <rect width="100%" height="100%" fill={`rgba(0,0,0,${spotlightOpacity})`} mask="url(#spotlight-mask)" />
                      {/* Soft edge glow ring */}
                      <circle cx={`${spotlightPos.x * 100}%`} cy={`${spotlightPos.y * 100}%`} r={`${spotlightRadius}%`} fill="none" stroke="rgba(200,168,78,0.3)" strokeWidth="2" />
                      <circle cx={`${spotlightPos.x * 100}%`} cy={`${spotlightPos.y * 100}%`} r={`${spotlightRadius + 0.5}%`} fill="none" stroke="rgba(200,168,78,0.1)" strokeWidth="4" />
                    </svg>
                  )}

                  {/* ── Laser pointer dot ── */}
                  {presenterTool === "laser" && laserPos && (
                    <>
                      {laserTrail.map((tp, idx) => {
                        const age = (Date.now() - tp.t) / 600;
                        const opacity = Math.max(0, 1 - age) * 0.4;
                        const size = Math.max(2, 8 * (1 - age));
                        return (
                          <div key={`lt-${idx}`} className="absolute rounded-full pointer-events-none" style={{
                            left: `${tp.x * 100}%`, top: `${tp.y * 100}%`, width: `${size}px`, height: `${size}px`,
                            background: `rgba(239,68,68,${opacity})`, transform: "translate(-50%,-50%)", zIndex: 29,
                          }} />
                        );
                      })}
                      <div className="absolute pointer-events-none" style={{
                        left: `${laserPos.x * 100}%`, top: `${laserPos.y * 100}%`, zIndex: 30, transform: "translate(-50%,-50%)",
                      }}>
                        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" style={{
                          boxShadow: "0 0 12px 4px rgba(239,68,68,0.7), 0 0 24px 8px rgba(239,68,68,0.4), 0 0 40px 12px rgba(239,68,68,0.2)",
                        }} />
                        <div className="absolute w-6 h-px bg-red-400/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute w-px h-6 bg-red-400/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </>
                  )}
                </div>
                {/* Nav arrows */}
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-default transition-all" style={{ zIndex: 40 }} disabled={currentSlide === 1} onClick={() => setCurrentSlide((s) => s - 1)}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-default transition-all" style={{ zIndex: 40 }} disabled={currentSlide === totalSlides} onClick={() => setCurrentSlide((s) => s + 1)}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              {/* Floating annotation toolbar */}
              <div className="flex items-center justify-center gap-1 mt-2">
                {/* Tool buttons */}
                <div className="flex items-center bg-black/40 rounded-xl px-1.5 py-1 gap-0.5 border border-white/10">
                  {([
                    { tool: "pointer" as PresenterToolType, icon: <MousePointer2 className="w-3.5 h-3.5" />, label: "Con trỏ (V)", key: "V" },
                    { tool: "laser" as PresenterToolType, icon: <CircleDot className="w-3.5 h-3.5" />, label: "Laser (L)", key: "L" },
                    { tool: "spotlight" as PresenterToolType, icon: <ScanEye className="w-3.5 h-3.5" />, label: "Spotlight (S)", key: "S" },
                    { tool: "pen" as PresenterToolType, icon: <PenLine className="w-3.5 h-3.5" />, label: "Bút vẽ (D)", key: "D" },
                    { tool: "highlighter" as PresenterToolType, icon: <Highlighter className="w-3.5 h-3.5" />, label: "Đánh dấu (H)", key: "H" },
                    { tool: "text" as PresenterToolType, icon: <Type className="w-3.5 h-3.5" />, label: "Ghi chú (T)", key: "T" },
                    { tool: "eraser" as PresenterToolType, icon: <Eraser className="w-3.5 h-3.5" />, label: "Tẩy (E)", key: "E" },
                  ]).map(({ tool, icon, label, key }) => (
                    <button key={tool} className={`p-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 ${presenterTool === tool ? "bg-white/20 text-white shadow-lg" : "text-white/50 hover:text-white hover:bg-white/10"}`} onClick={() => { if (tool === "text") commitTextAnnotation(); setPresenterTool(tool); }} title={label}>
                      {icon}
                      <kbd className="text-white/30 hidden xl:inline" style={{ fontSize: "8px" }}>{key}</kbd>
                    </button>
                  ))}
                </div>

                {/* Spotlight controls */}
                {presenterTool === "spotlight" && (
                  <div className="flex items-center bg-black/40 rounded-xl px-2 py-1 gap-1.5 border border-white/10 ml-1">
                    <ScanEye className="w-3 h-3 text-[#c8a84e]" />
                    <span className="text-white/40" style={{ fontSize: "9px", fontWeight: 600 }}>Bán kính</span>
                    <button className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all" onClick={() => setSpotlightRadius((r) => Math.max(5, r - 2))} title="Thu nhỏ (−)">
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full relative">
                      <div className="absolute inset-y-0 left-0 bg-[#c8a84e] rounded-full transition-all" style={{ width: `${((spotlightRadius - 5) / 35) * 100}%` }} />
                    </div>
                    <button className="w-5 h-5 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all" onClick={() => setSpotlightRadius((r) => Math.min(40, r + 2))} title="Phóng to (+)">
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="text-[#c8a84e] font-mono" style={{ fontSize: "10px", fontWeight: 600 }}>{spotlightRadius}%</span>
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <span className="text-white/40" style={{ fontSize: "9px", fontWeight: 600 }}>Độ tối</span>
                    <input type="range" min="30" max="95" value={spotlightOpacity * 100} onChange={(e) => setSpotlightOpacity(Number(e.target.value) / 100)} className="w-14 h-1 accent-[#c8a84e] cursor-pointer" title={`${Math.round(spotlightOpacity * 100)}%`} />
                    <span className="text-white/30 whitespace-nowrap" style={{ fontSize: "9px" }}>Scroll = zoom</span>
                  </div>
                )}

                {/* Text annotation controls */}
                {presenterTool === "text" && (
                  <div className="flex items-center bg-black/40 rounded-xl px-2 py-1 gap-1.5 border border-white/10 ml-1">
                    <Type className="w-3 h-3 text-[#c8a84e]" />
                    <span className="text-white/40" style={{ fontSize: "9px", fontWeight: 600 }}>Cỡ chữ</span>
                    {[12, 16, 20, 24, 32].map((fs) => (
                      <button key={fs} className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${textFontSize === fs ? "bg-white/20 text-white" : "text-white/40 hover:text-white hover:bg-white/10"}`} style={{ fontSize: "10px", fontWeight: 600 }} onClick={() => setTextFontSize(fs)}>
                        {fs}
                      </button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    <span className="text-white/40" style={{ fontSize: "9px", fontWeight: 600 }}>Màu</span>
                    {ANNOTATION_COLORS.slice(0, 5).map((c) => (
                      <button key={c.color} className={`w-4 h-4 rounded-full cursor-pointer transition-all border ${penColor === c.color ? "border-white scale-125" : "border-transparent hover:border-white/40"}`} style={{ background: c.color }} onClick={() => setPenColor(c.color)} title={c.name} />
                    ))}
                    <span className="text-white/30" style={{ fontSize: "9px" }}>Click slide để thêm</span>
                  </div>
                )}

                {/* Color & Size (only for pen/highlighter) */}
                {(presenterTool === "pen" || presenterTool === "highlighter") && (
                  <div className="flex items-center bg-black/40 rounded-xl px-1.5 py-1 gap-1 border border-white/10 ml-1 relative">
                    {/* Quick colors */}
                    {ANNOTATION_COLORS.slice(0, 5).map((c) => (
                      <button key={c.color} className={`w-5 h-5 rounded-full cursor-pointer transition-all border-2 ${penColor === c.color ? "border-white scale-125 shadow-lg" : "border-transparent hover:border-white/40"}`} style={{ background: c.color }} onClick={() => setPenColor(c.color)} title={c.name} />
                    ))}
                    {/* More colors */}
                    <button className={`w-5 h-5 rounded-full cursor-pointer transition-all border border-white/20 hover:border-white/50 flex items-center justify-center ${showColorPicker ? "bg-white/20" : "bg-white/5"}`} onClick={() => setShowColorPicker(!showColorPicker)} title="Thêm màu">
                      <Palette className="w-3 h-3 text-white/60" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute bottom-full left-0 mb-2 bg-[#1e1e3a] border border-white/20 rounded-xl p-3 shadow-2xl" style={{ zIndex: 60 }}>
                        <p className="text-white/50 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>BẢNG MÀU</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {ANNOTATION_COLORS.map((c) => (
                            <button key={c.color} className={`w-7 h-7 rounded-lg cursor-pointer transition-all border-2 flex items-center justify-center ${penColor === c.color ? "border-white scale-110" : "border-transparent hover:border-white/40"}`} style={{ background: c.color }} onClick={() => { setPenColor(c.color); setShowColorPicker(false); }} title={c.name}>
                              {penColor === c.color && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: c.color === "#ffffff" || c.color === "#eab308" ? "#000" : "#fff" }} />}
                            </button>
                          ))}
                        </div>
                        <p className="text-white/50 mt-2.5 mb-1.5" style={{ fontSize: "10px", fontWeight: 600 }}>ĐỘ DÀY NÉT</p>
                        <div className="flex items-center gap-1.5">
                          {PEN_SIZES.map((s) => (
                            <button key={s} className={`flex-1 h-8 rounded-lg cursor-pointer transition-all flex items-center justify-center ${penSize === s ? "bg-white/20 border border-white/40" : "bg-white/5 border border-transparent hover:bg-white/10"}`} onClick={() => setPenSize(s)} title={`${s}px`}>
                              <div className="rounded-full bg-white" style={{ width: `${Math.min(s * 1.5, 14)}px`, height: `${Math.min(s * 1.5, 14)}px` }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="w-px h-4 bg-white/10 mx-0.5" />
                    {/* Pen size quick select */}
                    {PEN_SIZES.slice(0, 3).map((s) => (
                      <button key={s} className={`w-5 h-5 rounded-full cursor-pointer transition-all flex items-center justify-center ${penSize === s ? "bg-white/20" : "hover:bg-white/10"}`} onClick={() => setPenSize(s)} title={`${s}px`}>
                        <div className="rounded-full" style={{ width: `${Math.min(s * 1.5, 10)}px`, height: `${Math.min(s * 1.5, 10)}px`, background: penColor }} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center bg-black/40 rounded-xl px-1.5 py-1 gap-0.5 border border-white/10 ml-1">
                  <button className="p-1.5 rounded-lg cursor-pointer text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-default" onClick={undoAnnotation} disabled={getCurrentAnnotations().length === 0 && getTextAnnotations().length === 0} title="Hoàn tác (Ctrl+Z)">
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg cursor-pointer text-white/50 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-default" onClick={clearAnnotations} disabled={getCurrentAnnotations().length === 0 && getTextAnnotations().length === 0} title="Xóa slide này (Shift+C)">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg cursor-pointer text-white/50 hover:text-orange-400 hover:bg-orange-500/10 transition-all" onClick={clearAllAnnotations} title="Xóa tất cả slides">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Export/Import */}
                <div ref={exportMenuRef} className="relative flex items-center bg-black/40 rounded-xl px-1.5 py-1 gap-0.5 border border-white/10 ml-1">
                  <button className="p-1.5 rounded-lg cursor-pointer text-white/50 hover:text-[#c8a84e] hover:bg-[#c8a84e]/10 transition-all" onClick={() => setShowExportMenu((v) => !v)} title="Xuất / Nhập annotations">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#1e1e3a] border border-white/20 rounded-xl shadow-2xl overflow-hidden" style={{ zIndex: 60, minWidth: "200px" }}>
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="text-white/50" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>XUẤT ANNOTATIONS</p>
                      </div>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { exportAnnotationsPNG(); setShowExportMenu(false); }}>
                        <ImageDown className="w-4 h-4 text-green-400" />
                        <div className="text-left">
                          <p style={{ fontSize: "12px", fontWeight: 500 }}>PNG Overlay</p>
                          <p className="text-white/30" style={{ fontSize: "9px" }}>Ảnh nét vẽ + text slide hiện tại</p>
                        </div>
                      </button>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { exportAnnotationsJSON(); setShowExportMenu(false); }}>
                        <FileDown className="w-4 h-4 text-blue-400" />
                        <div className="text-left">
                          <p style={{ fontSize: "12px", fontWeight: 500 }}>JSON Data</p>
                          <p className="text-white/30" style={{ fontSize: "9px" }}>Tất cả slides — có thể nhập lại</p>
                        </div>
                      </button>
                      <div className="px-3 py-2 border-t border-white/10">
                        <p className="text-white/50" style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>NHẬP ANNOTATIONS</p>
                      </div>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" onClick={() => { importFileRef.current?.click(); setShowExportMenu(false); }}>
                        <Upload className="w-4 h-4 text-[#c8a84e]" />
                        <div className="text-left">
                          <p style={{ fontSize: "12px", fontWeight: 500 }}>Nhập từ JSON</p>
                          <p className="text-white/30" style={{ fontSize: "9px" }}>Merge vào annotations hiện tại</p>
                        </div>
                      </button>
                      <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={importAnnotationsJSON} />
                    </div>
                  )}
                </div>

                {/* Annotation count badge */}
                {(getCurrentAnnotations().length > 0 || getTextAnnotations().length > 0) && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#c8a84e]/20 rounded-lg">
                    {getCurrentAnnotations().length > 0 && (
                      <div className="flex items-center gap-1">
                        <PenLine className="w-3 h-3 text-[#c8a84e]" />
                        <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>{getCurrentAnnotations().length}</span>
                      </div>
                    )}
                    {getTextAnnotations().length > 0 && (
                      <div className="flex items-center gap-1">
                        <Type className="w-3 h-3 text-[#c8a84e]" />
                        <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>{getTextAnnotations().length}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Next slide + Notes */}
            <div className="flex-[2] flex flex-col gap-3 min-w-0">
              {/* Next slide preview */}
              <div className="flex-[2] flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/40" style={{ fontSize: "10px", fontWeight: 600 }}>SLIDE TIẾP THEO</span>
                  {currentSlide < totalSlides && (
                    <span className="px-1.5 py-0.5 rounded text-white/60" style={{ fontSize: "8px", fontWeight: 600, background: slideTypeColor(SLIDES[currentSlide]?.type || "content") + "40" }}>
                      {slideTypeName(SLIDES[currentSlide]?.type || "content")}
                    </span>
                  )}
                </div>
                <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden bg-white/5 border border-white/10">
                  {currentSlide < totalSlides ? (
                    <div className="w-full aspect-[16/9] p-2">
                      <div className="w-full h-full opacity-80">{renderSlideContent(SLIDES[currentSlide])}</div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <CheckCircle2 className="w-8 h-8 text-[#c8a84e] mx-auto mb-2" />
                      <p className="text-white/50" style={{ fontSize: "13px", fontWeight: 500 }}>Slide cuối cùng</p>
                      <p className="text-white/30 mt-1" style={{ fontSize: "11px" }}>Bài trình bày đã hoàn tất</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Speaker notes */}
              <div className="flex-[1] min-h-0 bg-white/5 rounded-lg border border-white/10 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 shrink-0">
                  <StickyNote className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300" style={{ fontSize: "11px", fontWeight: 600 }}>Speaker Notes</span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "thin" }}>
                  <p className="text-white/70" style={{ fontSize: "13px", lineHeight: 1.8 }}>{slide.notes}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom progress */}
          <div className="px-6 py-3 bg-black/40 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              {SLIDES.map((s) => (
                <button key={s.num} className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all hover:h-2.5 ${currentSlide === s.num ? "h-2.5" : ""}`} style={{ background: s.num < currentSlide ? `${slideTypeColor(s.type)}90` : s.num === currentSlide ? slideTypeColor(s.type) : "rgba(255,255,255,0.1)" }} onClick={() => setCurrentSlide(s.num)} title={`${s.num}. ${s.title.split("\n")[0]}`} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 cursor-pointer transition-colors" style={{ fontSize: "12px" }} disabled={currentSlide === 1} onClick={() => setCurrentSlide((s) => s - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded disabled:opacity-20 cursor-pointer transition-colors" style={{ fontSize: "12px" }} disabled={currentSlide === totalSlides} onClick={() => setCurrentSlide((s) => s + 1)}>
                  Tiếp <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: "← →", label: "Slide" },
                    { key: "V", label: "Con trỏ" },
                    { key: "L", label: "Laser" },
                    { key: "S", label: "Spotlight" },
                    { key: "D", label: "Bút vẽ" },
                    { key: "H", label: "Highlight" },
                    { key: "T", label: "Text" },
                    { key: "E", label: "Tẩy" },
                    { key: "⌘Z", label: "Undo" },
                    { key: "ESC", label: "Thoát" },
                  ].map((h) => (
                    <div key={h.key} className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 bg-white/10 rounded text-white/40 border border-white/20" style={{ fontSize: "8px", fontWeight: 600 }}>{h.key}</kbd>
                      <span className="text-white/30" style={{ fontSize: "9px" }}>{h.label}</span>
                    </div>
                  ))}
                </div>
                <span className="text-white/20" style={{ fontSize: "10px" }}>
                  {Math.round((currentSlide / totalSlides) * 100)}% hoàn thành
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SHARE MODAL ══════════ */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] max-w-[95vw] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#990803]" />
                <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Chia sẻ Slide</span>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setShowShareModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              {/* Current slide share */}
              <div className="mb-4">
                <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>LINK SLIDE HIỆN TẠI (Slide {currentSlide})</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 overflow-hidden">
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 truncate" style={{ fontSize: "12px" }}>{getSlideLink(currentSlide)}</span>
                  </div>
                  <button className={`px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${copiedLink ? "bg-green-500 text-white" : "bg-[#990803] text-white hover:bg-[#7a0602]"}`} style={{ fontSize: "12px", fontWeight: 600 }} onClick={() => copySlideLink(currentSlide)}>
                    {copiedLink ? <><CheckCircle2 className="w-3.5 h-3.5" /> Đã copy</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Quick links to specific slides */}
              <div>
                <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>CHỌN SLIDE ĐỂ CHIA SẺ</p>
                <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                  {SLIDES.map((s) => (
                    <button key={s.num} className={`text-left px-3 py-2 rounded-lg border transition-all cursor-pointer group ${currentSlide === s.num ? "border-[#990803] bg-red-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`} onClick={() => copySlideLink(s.num)}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1 py-0.5 rounded text-white" style={{ fontSize: "7px", fontWeight: 700, background: slideTypeColor(s.type) }}>{s.num}</span>
                        <span className="text-gray-400 group-hover:text-gray-500" style={{ fontSize: "8px" }}>{slideTypeName(s.type)}</span>
                        <Copy className="w-2.5 h-2.5 text-gray-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-gray-700 truncate" style={{ fontSize: "10px", fontWeight: 500 }}>{s.title.split("\n")[0]}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-400" style={{ fontSize: "10px" }}>Click vào slide để copy link</span>
              <button className="px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" style={{ fontSize: "12px" }} onClick={() => setShowShareModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EXPORT MODAL ══════════ */}
      {showExportModal && (
        <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95vw] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#990803]" />
                <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Export Presentation</span>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-pointer" onClick={() => setShowExportModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-3">
              {/* Export PDF */}
              <button className="w-full text-left p-4 rounded-xl border-2 border-[#990803] bg-red-50 hover:bg-red-100 transition-colors cursor-pointer group" onClick={handleExportPdf} disabled={exportingPdf}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#990803] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>
                      {exportingPdf ? "Đang tạo file..." : "Export PDF (Print-ready)"}
                    </p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>
                      Tất cả {totalSlides} slides + Speaker Notes. Mở cửa sổ in để save PDF.
                    </p>
                  </div>
                  {exportingPdf ? (
                    <div className="w-5 h-5 border-2 border-[#990803] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-[#990803] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </button>

              {/* Export current slide */}
              <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => {
                const win = window.open("", "_blank");
                if (!win) return;
                const s = slide;
                const sHtml = `<div style="width:100%;max-width:960px;aspect-ratio:16/9;margin:40px auto;background:linear-gradient(135deg,#990803,#7a0602,#5a0401);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.3)"><div style="color:white;text-align:center;padding:40px"><h2 style="font-size:28px;font-weight:700;margin:0 0 8px;white-space:pre-line">${s.title}</h2>${s.content ? `<p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0">${s.content}</p>` : ""}${s.subtitle ? `<p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0">${s.subtitle}</p>` : ""}</div></div>`;
                win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Slide ${currentSlide} — ${s.title.split("\n")[0]}</title><style>body{background:#f3f4f6;font-family:-apple-system,sans-serif;margin:0;padding:20px}button{margin:20px auto;display:block;padding:8px 24px;background:#990803;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}</style></head><body><button onclick="window.print()">In Slide ${currentSlide}</button>${sHtml}<div style="text-align:center;color:#999;font-size:11px;margin-top:16px">Slide ${currentSlide}/${totalSlides} — ${slideTypeName(s.type)} — ${s.notes}</div></body></html>`);
                win.document.close();
                setShowExportModal(false);
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Presentation className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Export Slide hiện tại</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>Chỉ slide {currentSlide}: "{slide.title.split("\n")[0]}"</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Share link option */}
              <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => { setShowExportModal(false); setShowShareModal(true); }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Chia sẻ link slide</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>Copy link trực tiếp đến slide cụ thể</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <button className="px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" style={{ fontSize: "12px" }} onClick={() => setShowExportModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── End of file ─── */
