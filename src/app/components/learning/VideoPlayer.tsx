import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
  SkipBack, SkipForward, Settings as SettingsIcon, PictureInPicture2,
  CheckCircle2, StickyNote, Bookmark, ThumbsUp, List, X,
  Repeat, PenLine, Trash2, Send, Monitor, Subtitles,
  MessageSquare, BookmarkPlus, ArrowLeftRight, Target,
  Brain, Hash, Camera, CircleHelp, CircleCheck, CircleX,
  Scissors, RotateCcw, Sparkles, Trophy, Lightbulb, ChevronRight,
} from "lucide-react";
import type { Lesson, VideoQuiz, VideoBookmarkItem, TimeComment } from "./types";
import { VIDEO_QUIZZES, MOCK_TIME_COMMENTS, BOOKMARK_COLORS } from "./types";
import { VIDEO_CONTENT } from "./lesson-content";

/* ============================================================ */
/*  VIDEO PLAYER (Enhanced)                                     */
/* ============================================================ */

export function VideoPlayer({
  lesson,
  onAddNote,
  theaterMode,
  onToggleTheater,
  autoplayNext,
  onToggleAutoplay,
  onAutoplayNext,
  onContentReady,
}: {
  lesson: Lesson;
  onAddNote: (timestamp: string, text: string) => void;
  theaterMode: boolean;
  onToggleTheater: () => void;
  autoplayNext: boolean;
  onToggleAutoplay: () => void;
  onAutoplayNext: () => void;
  onContentReady?: (ready: boolean) => void;
}) {
  // ── Resolve lesson-specific content (must be before any useState that references it) ──
  const lessonVideo = VIDEO_CONTENT[lesson.id];
  const QUIZZES_DATA: VideoQuiz[] = lessonVideo?.quizzes ?? VIDEO_QUIZZES;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [quality, setQuality] = useState("1080p");
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
  const [videoBookmarks, setVideoBookmarks] = useState<VideoBookmarkItem[]>(
    lesson.id === "L12"
      ? [
          { id: "VB1", pct: 8, label: "Recap Module 1", color: "#c8a84e" },
          { id: "VB2", pct: 60, label: "5 Bài học chính", color: "#3b82f6" },
          { id: "VB3", pct: 78, label: "IDP cá nhân", color: "#22c55e" },
        ]
      : [
          { id: "VB1", pct: 15, label: "Bắt đầu phân tích", color: "#c8a84e" },
          { id: "VB2", pct: 50, label: "Case study chính", color: "#3b82f6" },
        ]
  );
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
  const [timeComments, setTimeComments] = useState<TimeComment[]>(
    lessonVideo?.timeComments ?? MOCK_TIME_COMMENTS
  );
  const [showTimeComments, setShowTimeComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [hoveredComment, setHoveredComment] = useState<TimeComment | null>(null);

  /* ── Screenshot ── */
  const [screenshotFlash, setScreenshotFlash] = useState(false);

  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const playInterval = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);
  const doubleClickTimer = useRef<ReturnType<typeof setTimeout>>();
  const clickCount = useRef(0);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualities = ["2160p 4K", "1080p HD", "720p", "480p", "360p", "Auto"];

  const totalSec = lessonVideo?.totalSec ?? 1530;
  const currentSec = Math.round((progressPct / 100) * totalSec);
  const bufferedPct = Math.min(100, progressPct + 26);
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  /* ── chapters ── */
  const defaultChapters = [
    { id: "C1", title: "Mở đầu — Bối cảnh ABBank", startPct: 0, startTime: "00:00" },
    { id: "C2", title: "Phân tích tình huống thị trường", startPct: 15, startTime: "03:50" },
    { id: "C3", title: "Quy trình ra quyết định 6 bước", startPct: 30, startTime: "07:39" },
    { id: "C4", title: "Case Study: Tái cấu trúc danh mục", startPct: 50, startTime: "12:45" },
    { id: "C5", title: "Bài học từ thực tiễn Geleximco", startPct: 72, startTime: "18:22" },
    { id: "C6", title: "Tổng kết & Câu hỏi thảo luận", startPct: 88, startTime: "22:26" },
  ];
  const chapters = lessonVideo
    ? lessonVideo.chapters.map((ch, i) => ({ id: `C${i + 1}`, title: ch.label, startPct: ch.pct, startTime: fmt(Math.round((ch.pct / 100) * totalSec)) }))
    : defaultChapters;
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
          const quiz = QUIZZES_DATA.find((q) => !answeredQuizzes.current.has(q.id) && p < q.triggerPct && next >= q.triggerPct);
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

  /* ── Content ready tracking ── */
  useEffect(() => {
    if (onContentReady && (progressPct >= 90 || ended)) {
      onContentReady(true);
    }
  }, [progressPct, ended, onContentReady]);

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
  const totalQuizPoints = QUIZZES_DATA.reduce((sum, q) => sum + q.points, 0);

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
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(0.3 + progressPct * 0.004, "#990803");
    grad.addColorStop(1, "#0f0f23");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
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
                    <span className="text-white/30" style={{ fontSize: "10px" }}>{answeredQuizzes.current.size}/{QUIZZES_DATA.length} câu</span>
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
                <span className="text-white/30" style={{ fontSize: "9px" }}>({answeredQuizzes.current.size}/{QUIZZES_DATA.length})</span>
              </div>
            </div>
          )}

          {/* Quiz checkpoint markers in video area */}
          {QUIZZES_DATA.map((q) => {
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
          {showSubtitles && playing && (() => {
            const subs = lessonVideo?.subtitles;
            if (subs) {
              const activeSub = subs.find((s) => progressPct >= s.startPct && progressPct < s.endPct);
              if (!activeSub) return null;
              return (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 rounded-lg pointer-events-none max-w-[80%]">
                  <p className="text-white text-center" style={{ fontSize: "15px" }}>{activeSub.text}</p>
                </div>
              );
            }
            return (
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
            );
          })()}
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
            {QUIZZES_DATA.map((q) => (
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
                    {QUIZZES_DATA.map((q) => {
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
