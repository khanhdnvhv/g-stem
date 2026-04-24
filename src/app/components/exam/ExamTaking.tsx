import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, Clock, Flag, Eye, EyeOff,
  Calculator, StickyNote, Maximize2, Minimize2, Check, AlertTriangle,
  BookmarkCheck, Send, Lightbulb, Shield, ShieldAlert, ShieldCheck,
  Camera, CameraOff, Monitor, MonitorOff, Wifi, WifiOff,
  ChevronDown, ChevronUp, RotateCcw, Pause, Play, Zap, Brain,
  GripVertical, ArrowUpDown, Save, Trash2, MessageSquare, Hash,
  CircleHelp, Target, CheckCircle2, ArrowLeftRight, Type, Sparkles,
  Link2,
} from "lucide-react";
import type { Exam, ExamQuestion, DifficultyLevel } from "./types";
import { DIFFICULTY_CONFIG, QUESTION_TYPE_CONFIG, QUESTION_BANK, getExamQuestions } from "./types";

// Click-based matching (no DnD — sandbox-safe)
function MatchLeftItem({ pairId, label, num, matched, selected, onSelect, onClear }: { pairId: string; label: string; num: string; matched: boolean; selected: boolean; onSelect: () => void; onClear: () => void }) {
  return (
    <div onClick={onSelect} className={`px-3 py-2.5 rounded-lg border-2 transition-all cursor-pointer ${selected ? "border-[#990803] bg-[#990803]/10 shadow-md scale-[1.02]" : matched ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-[#990803]/30 hover:shadow-sm"}`}>
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center ${selected ? "bg-[#990803] animate-pulse" : matched ? "bg-[#990803]" : "bg-gray-100"}`}><span className={selected || matched ? "text-white" : "text-gray-400"} style={{ fontSize: "10px", fontWeight: 700 }}>{num}</span></div>
        <span className="text-gray-700 flex-1" style={{ fontSize: "13px" }}>{label}</span>
        {matched && <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="p-0.5 text-gray-300 hover:text-red-400 cursor-pointer"><X className="w-3 h-3" /></button>}
      </div>
    </div>
  );
}

function MatchRightItem({ label, matchedByLabel, selectable, onSelect }: { label: string; matchedByLabel?: string; selectable: boolean; onSelect: () => void }) {
  return (
    <div onClick={selectable ? onSelect : undefined} className={`px-3 py-2.5 rounded-lg border-2 transition-all min-h-[44px] ${selectable ? "cursor-pointer hover:border-[#c8a84e] hover:bg-[#c8a84e]/10 hover:shadow-md" : ""} ${matchedByLabel ? "border-[#c8a84e] bg-[#c8a84e]/5" : "border-gray-200 border-dashed"}`}>
      <div className="flex items-center gap-2">
        <span className="text-gray-700 flex-1" style={{ fontSize: "13px" }}>{label}</span>
        {matchedByLabel && <span className="flex items-center gap-1 px-2 py-0.5 bg-[#990803]/10 rounded-full text-[#990803] shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}><Link2 className="w-2.5 h-2.5" /> {matchedByLabel}</span>}
      </div>
    </div>
  );
}

interface ExamTakingProps {
  exam: Exam;
  onSubmit: (answers: Record<string, any>, timeSpent: number, flagged: string[], confidence: Record<string, number>, tabSwitches: number, qTimes: Record<string, number>) => void;
  onExit: () => void;
}

export function ExamTaking({ exam, onSubmit, onExit }: ExamTakingProps) {
  const questions = useMemo(() => getExamQuestions(exam), [exam]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [confidence, setConfidence] = useState<Record<string, number>>({});
  const [showNav, setShowNav] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [notepadText, setNotepadText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [calcValue, setCalcValue] = useState("0");
  const [calcHistory, setCalcHistory] = useState("");

  // Timer
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [timerPaused, setTimerPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const questionTimesRef = useRef<Record<string, number>>({});

  // Proctoring
  const [webcamOn, setWebcamOn] = useState(exam.webcamRequired);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);

  // Auto-save
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  // Matching state (click-based selection)
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [selectedMatchLeft, setSelectedMatchLeft] = useState<string | null>(null);
  // Ordering state
  const [orderingAnswers, setOrderingAnswers] = useState<Record<string, number[]>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  // Stable shuffled right-side pairs for matching (prevents re-shuffle on re-render)
  const shuffledRightRef = useRef<Record<string, { id: string; left: string; right: string }[]>>({});
  const q = questions[currentIdx];

  // Initialize shuffled right sides
  useMemo(() => {
    questions.forEach(question => {
      if (question.type === "matching" && question.matchingPairs && !shuffledRightRef.current[question.id]) {
        shuffledRightRef.current[question.id] = [...question.matchingPairs].sort(() => Math.random() - 0.5);
      }
    });
  }, [questions]);

  // ── Timer ──
  useEffect(() => {
    if (exam.duration === 0 || timerPaused) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(iv); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [timerPaused, exam.duration]);

  // ── Track question time ──
  useEffect(() => {
    questionStartRef.current = Date.now();
    return () => {
      const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
      if (q) {
        questionTimesRef.current[q.id] = (questionTimesRef.current[q.id] || 0) + spent;
      }
    };
  }, [currentIdx]);

  // ── Anti-cheat: tab switch detection ──
  useEffect(() => {
    if (!exam.antiCheat) return;
    const handler = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        setLastWarning("Phát hiện chuyển tab! Hành vi này được ghi nhận.");
        setTimeout(() => setLastWarning(null), 5000);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [exam.antiCheat]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowRight": e.preventDefault(); goNext(); break;
        case "ArrowLeft": e.preventDefault(); goPrev(); break;
        case "f": e.preventDefault(); toggleFlag(); break;
        case "1": case "2": case "3": case "4": case "5": case "6":
          if (q?.type === "single_choice" || q?.type === "true_false" || q?.type === "multiple_choice") {
            const idx = parseInt(e.key) - 1;
            if (q.options && idx < q.options.length) handleOptionClick(idx);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIdx, answers]);

  // ── Auto-save ──
  useEffect(() => {
    const iv = setInterval(() => {
      setSaving(true);
      setTimeout(() => { setLastSaved(new Date()); setSaving(false); }, 500);
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  // ── Navigation ──
  const goNext = () => { if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1); };
  const goPrev = () => { if (currentIdx > 0 && exam.allowBacktrack) setCurrentIdx(currentIdx - 1); };
  const goTo = (idx: number) => { if (exam.allowBacktrack || idx > currentIdx) setCurrentIdx(idx); };
  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
      return next;
    });
  };

  // ── Answer handlers ──
  const handleOptionClick = (optIdx: number) => {
    if (!q) return;
    if (q.type === "single_choice" || q.type === "true_false") {
      setAnswers(prev => ({ ...prev, [q.id]: [optIdx] }));
    } else if (q.type === "multiple_choice") {
      setAnswers(prev => {
        const current: number[] = prev[q.id] || [];
        return { ...prev, [q.id]: current.includes(optIdx) ? current.filter(i => i !== optIdx) : [...current, optIdx] };
      });
    }
  };

  const handleTextAnswer = (text: string) => {
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: text }));
  };

  const handleBlankAnswer = (blankId: string, value: string) => {
    if (!q) return;
    setAnswers(prev => {
      const current = prev[q.id] || {};
      return { ...prev, [q.id]: { ...current, [blankId]: value } };
    });
  };

  const handleMatchingAnswer = (leftId: string, rightId: string) => {
    if (!q) return;
    setMatchingAnswers(prev => {
      const current = prev[q.id] || {};
      // Toggle: if already matched, remove; else set
      const updated = { ...current };
      // Remove any existing match for this left
      delete updated[leftId];
      // Remove any existing match to this right
      Object.keys(updated).forEach(k => { if (updated[k] === rightId) delete updated[k]; });
      // Set new match
      if (current[leftId] !== rightId) updated[leftId] = rightId;
      return { ...prev, [q.id]: updated };
    });
    setAnswers(prev => {
      const current = matchingAnswers[q.id] || {};
      const updated = { ...current };
      delete updated[leftId];
      Object.keys(updated).forEach(k => { if (updated[k] === rightId) delete updated[k]; });
      if ((matchingAnswers[q.id] || {})[leftId] !== rightId) updated[leftId] = rightId;
      return { ...prev, [q.id]: updated };
    });
  };

  const handleOrderMove = (fromIdx: number, dir: "up" | "down") => {
    if (!q || !q.orderItems) return;
    const order = orderingAnswers[q.id] || q.orderItems.map((_, i) => i);
    const newOrder = [...order];
    const toIdx = dir === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= newOrder.length) return;
    [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
    setOrderingAnswers(prev => ({ ...prev, [q.id]: newOrder }));
    setAnswers(prev => ({ ...prev, [q.id]: newOrder }));
  };

  const handleMatrixAnswer = (rowId: string, colId: string) => {
    if (!q) return;
    setAnswers(prev => {
      const current = prev[q.id] || {};
      return { ...prev, [q.id]: { ...current, [rowId]: colId } };
    });
  };

  const handleCaseStudyAnswer = (subQId: string, value: any) => {
    if (!q) return;
    setAnswers(prev => {
      const current = prev[q.id] || {};
      return { ...prev, [q.id]: { ...current, [subQId]: value } };
    });
  };

  const handleConfidence = (level: number) => {
    if (!q) return;
    setConfidence(prev => ({ ...prev, [q.id]: level }));
  };

  const handleSubmit = () => {
    const spent = Math.round((Date.now() - startTimeRef.current) / 1000);
    // Final question time
    const lastSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    if (q) questionTimesRef.current[q.id] = (questionTimesRef.current[q.id] || 0) + lastSpent;
    onSubmit(answers, spent, Array.from(flagged), confidence, tabSwitches, questionTimesRef.current);
  };

  // ── Helpers ──
  const isAnswered = (qId: string) => {
    const a = answers[qId];
    if (a === undefined || a === null) return false;
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === "string") return a.trim().length > 0;
    if (typeof a === "object") return Object.keys(a).length > 0;
    return true;
  };

  const answeredCount = questions.filter(q => isAnswered(q.id)).length;
  const flaggedCount = flagged.size;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timeWarning = exam.duration > 0 ? (timeLeft < exam.duration * 60 * 0.1 ? "critical" : timeLeft < exam.duration * 60 * 0.25 ? "warning" : "normal") : "normal";

  // ── Calculator ──
  const calcClick = (val: string) => {
    if (val === "C") { setCalcValue("0"); setCalcHistory(""); return; }
    if (val === "=") {
      try { const r = Function('"use strict";return (' + calcValue + ')')(); setCalcHistory(calcValue + " ="); setCalcValue(String(r)); } catch { setCalcValue("Error"); }
      return;
    }
    if (val === "⌫") { setCalcValue(prev => prev.length <= 1 ? "0" : prev.slice(0, -1)); return; }
    setCalcValue(prev => prev === "0" && !".+-×÷".includes(val) ? val : prev + val.replace("×", "*").replace("÷", "/"));
  };

  // ── Toggle fullscreen ──
  const toggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        containerRef.current.requestFullscreen?.(); setFullscreen(true);
      } else {
        document.exitFullscreen?.(); setFullscreen(false);
      }
    } catch {
      // Fullscreen blocked by permissions policy (e.g. iframe sandbox)
      setFullscreen(prev => !prev);
    }
  }, []);

  // ── Get section for current question ──
  const getCurrentSection = () => {
    let count = 0;
    for (const section of exam.sections) {
      if (currentIdx < count + section.questions.length) return { section, indexInSection: currentIdx - count };
      count += section.questions.length;
    }
    return { section: exam.sections[0], indexInSection: 0 };
  };
  const { section: currentSection } = getCurrentSection();

  // ─── RENDER ───
  if (!q) return null;
  const dc = DIFFICULTY_CONFIG[q.difficulty];
  const tc = QUESTION_TYPE_CONFIG[q.type];

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-[#f5f6fa] flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setShowExitConfirm(true)} className="p-1.5 text-gray-400 hover:text-[#990803] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-gray-800 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{exam.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-400" style={{ fontSize: "11px" }}>Câu {currentIdx + 1}/{questions.length}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400" style={{ fontSize: "11px" }}>{currentSection.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Proctoring indicators */}
            {exam.proctoringEnabled && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                <div className={`w-1.5 h-1.5 rounded-full ${webcamOn ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                {webcamOn ? <Camera className="w-3.5 h-3.5 text-green-500" /> : <CameraOff className="w-3.5 h-3.5 text-red-500" />}
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                {tabSwitches > 0 && (
                  <span className="flex items-center gap-0.5 text-red-500" style={{ fontSize: "9px", fontWeight: 700 }}>
                    <ShieldAlert className="w-3 h-3" />{tabSwitches}
                  </span>
                )}
              </div>
            )}

            {/* Auto-save indicator */}
            <div className="hidden sm:flex items-center gap-1 text-gray-300" style={{ fontSize: "10px" }}>
              {saving ? (
                <><Save className="w-3 h-3 animate-spin" /> Đang lưu...</>
              ) : (
                <><CheckCircle2 className="w-3 h-3 text-green-400" /> {lastSaved.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</>
              )}
            </div>

            {/* Timer */}
            {exam.duration > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                timeWarning === "critical" ? "bg-red-50 border-red-200 text-red-600 animate-pulse" :
                timeWarning === "warning" ? "bg-amber-50 border-amber-200 text-amber-600" :
                "bg-gray-50 border-gray-200 text-gray-700"
              }`}>
                <Clock className="w-4 h-4" />
                <span style={{ fontSize: "14px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtTime(timeLeft)}</span>
              </div>
            )}

            {/* Progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke={progressPct >= 100 ? "#22c55e" : "#990803"} strokeWidth="3"
                  strokeDasharray={`${progressPct * 0.88} 88`} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-gray-600" style={{ fontSize: "9px", fontWeight: 700 }}>{progressPct}%</span>
            </div>

            <button onClick={toggleFullscreen} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Warning toast ── */}
      {lastWarning && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-2xl" style={{ animation: "slideDown 0.3s ease-out" }}>
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span style={{ fontSize: "13px", fontWeight: 500 }}>{lastWarning}</span>
        </div>
      )}

      {/* ── MAIN BODY ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── Question Area ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6 pb-32">
            {/* Question header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center shadow-lg shadow-[#990803]/20">
                <span className="text-white" style={{ fontSize: "15px", fontWeight: 700 }}>{currentIdx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: tc.color, background: tc.color + "15" }}>
                    {tc.icon} {tc.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: dc.color, background: dc.bg }}>
                    {"★".repeat(dc.stars)}{"☆".repeat(4 - dc.stars)} {dc.label}
                  </span>
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{q.points} điểm</span>
                  {q.category && <span className="text-gray-300" style={{ fontSize: "10px" }}>• {q.category}</span>}
                </div>
                <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 500, lineHeight: 1.7 }}>{q.question}</h2>

                {/* Case study context */}
                {q.type === "case_study" && q.caseStudyContext && (
                  <div className="mt-4 p-4 bg-[#990803]/5 rounded-xl border border-[#990803]/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-[#990803]" />
                      <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em" }}>TÌNH HUỐNG</span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-line" style={{ fontSize: "13px", lineHeight: 1.8 }}>{q.caseStudyContext}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Question Body (by type) ── */}
            <div className="ml-14">
              {/* SINGLE / MULTIPLE CHOICE / TRUE-FALSE */}
              {(q.type === "single_choice" || q.type === "multiple_choice" || q.type === "true_false") && q.options && (
                <div className="space-y-2.5">
                  {q.options.map((opt, idx) => {
                    const selected = (answers[q.id] || []).includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left group ${
                          selected
                            ? "border-[#990803] bg-[#990803]/5 shadow-sm shadow-[#990803]/10"
                            : "border-gray-200 hover:border-[#990803]/30 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          selected ? "bg-[#990803] shadow-md shadow-[#990803]/30" : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                          {q.type === "multiple_choice" ? (
                            selected ? <Check className="w-4 h-4 text-white" /> : <span className="text-gray-400" style={{ fontSize: "12px", fontWeight: 700 }}>{String.fromCharCode(65 + idx)}</span>
                          ) : (
                            selected ? <div className="w-3 h-3 rounded-full bg-white" /> : <span className="text-gray-400" style={{ fontSize: "12px", fontWeight: 700 }}>{String.fromCharCode(65 + idx)}</span>
                          )}
                        </div>
                        <span className={`flex-1 ${selected ? "text-gray-800" : "text-gray-600"}`} style={{ fontSize: "14px" }}>{opt}</span>
                        <span className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: "10px" }}>
                          Phím {idx + 1}
                        </span>
                      </button>
                    );
                  })}
                  {q.type === "multiple_choice" && (
                    <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>💡 Chọn tất cả đáp án đúng</p>
                  )}
                </div>
              )}

              {/* FILL BLANK */}
              {q.type === "fill_blank" && q.blanks && (
                <div className="space-y-4">
                  {q.blanks.map((blank, idx) => (
                    <div key={blank.id} className="flex items-center gap-3">
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-[#c8a84e]/10 flex items-center justify-center text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 700 }}>
                        ({idx + 1})
                      </span>
                      <input
                        type="text"
                        value={(answers[q.id] || {})[blank.id] || ""}
                        onChange={(e) => handleBlankAnswer(blank.id, e.target.value)}
                        placeholder={`Nhập đáp án ${idx + 1}...`}
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#990803] focus:ring-2 focus:ring-[#990803]/10 transition-all"
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SHORT ANSWER / ESSAY */}
              {q.type === "short_answer" && (
                <div>
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#990803] focus:ring-2 focus:ring-[#990803]/10 resize-y transition-all"
                    style={{ fontSize: "14px", lineHeight: 1.7 }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400" style={{ fontSize: "11px" }}>
                      {(answers[q.id] || "").length} ký tự
                    </span>
                    <span className="text-gray-300" style={{ fontSize: "10px" }}>Markdown supported</span>
                  </div>
                </div>
              )}

              {/* MATCHING — Click-based */}
              {q.type === "matching" && q.matchingPairs && (() => {
                const qMatches = matchingAnswers[q.id] || {};
                return (
                <div>
                  <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>🖱️ Chọn một mục bên trái, rồi chọn mục tương ứng bên phải để nối cặp.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-gray-500 mb-1" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>CHỌN TỪ ĐÂY</p>
                      {q.matchingPairs.map((pair) => {
                        const matched = !!qMatches[pair.id];
                        return <MatchLeftItem key={pair.id} pairId={pair.id} label={pair.left} num={pair.id.replace("m", "")} matched={matched}
                          selected={selectedMatchLeft === pair.id}
                          onSelect={() => setSelectedMatchLeft(prev => prev === pair.id ? null : pair.id)}
                          onClear={() => {
                            setMatchingAnswers(prev => { const c = { ...(prev[q.id] || {}) }; delete c[pair.id]; return { ...prev, [q.id]: c }; });
                            setAnswers(prev => { const c = { ...(prev[q.id] || {}) }; delete c[pair.id]; return { ...prev, [q.id]: c }; });
                            if (selectedMatchLeft === pair.id) setSelectedMatchLeft(null);
                          }} />;
                      })}
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500 mb-1" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>NỐI VÀO ĐÂY</p>
                      {(shuffledRightRef.current[q.id] || q.matchingPairs).map((pair) => {
                        const matchedEntry = Object.entries(qMatches).find(([, v]) => v === pair.id);
                        const matchedByLabel = matchedEntry ? q.matchingPairs!.find(p => p.id === matchedEntry[0])?.left : undefined;
                        return <MatchRightItem key={pair.id + "-r"} label={pair.right} matchedByLabel={matchedByLabel}
                          selectable={!!selectedMatchLeft}
                          onSelect={() => {
                            if (selectedMatchLeft) {
                              handleMatchingAnswer(selectedMatchLeft, pair.id);
                              setSelectedMatchLeft(null);
                            }
                          }} />;
                      })}
                    </div>
                  </div>
                  <p className="text-gray-300 mt-2" style={{ fontSize: "10px" }}>{Object.keys(qMatches).length}/{q.matchingPairs.length} cặp đã nối</p>
                </div>
                );
              })()}

              {/* ORDERING — Button-based */}
              {q.type === "ordering" && q.orderItems && (
                <div className="space-y-2">
                  <p className="text-gray-400 mb-2" style={{ fontSize: "11px" }}>Dùng nút ↑↓ để sắp xếp đúng thứ tự:</p>
                  {(orderingAnswers[q.id] || q.orderItems.map((_, i) => i)).map((origIdx, posIdx) => (
                    <div key={`order-${q.id}-${origIdx}`} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-[#990803]/20 hover:shadow-sm transition-all">
                      <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="w-7 h-7 rounded-lg bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{posIdx + 1}</span>
                      <span className="flex-1 text-gray-700" style={{ fontSize: "14px" }}>{q.orderItems![origIdx]}</span>
                      <div className="flex gap-0.5">
                        <button onClick={() => handleOrderMove(posIdx, "up")} disabled={posIdx === 0}
                          className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 cursor-pointer rounded hover:bg-gray-100">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleOrderMove(posIdx, "down")} disabled={posIdx === q.orderItems!.length - 1}
                          className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 cursor-pointer rounded hover:bg-gray-100">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MATRIX */}
              {q.type === "matrix" && q.matrixRows && q.matrixCols && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 text-left bg-gray-50 rounded-tl-lg" style={{ fontSize: "12px" }}></th>
                        {q.matrixCols.map(col => (
                          <th key={col.id} className="p-3 bg-gray-50 text-center" style={{ fontSize: "12px", fontWeight: 600 }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {q.matrixRows.map((row, rIdx) => (
                        <tr key={row.id} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="p-3 border-t border-gray-100" style={{ fontSize: "13px", fontWeight: 500 }}>{row.label}</td>
                          {q.matrixCols!.map(col => {
                            const selected = (answers[q.id] || {})[row.id] === col.id;
                            return (
                              <td key={col.id} className="p-3 text-center border-t border-gray-100">
                                <button onClick={() => handleMatrixAnswer(row.id, col.id)}
                                  className={`w-7 h-7 rounded-full border-2 mx-auto flex items-center justify-center cursor-pointer transition-all ${
                                    selected ? "border-[#990803] bg-[#990803]" : "border-gray-300 hover:border-[#990803]/50"
                                  }`}>
                                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CASE STUDY sub-questions */}
              {q.type === "case_study" && q.subQuestions && (
                <div className="space-y-6 mt-4">
                  {q.subQuestions.map((sq, sqIdx) => (
                    <div key={sq.id} className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>
                          {sqIdx + 1}
                        </span>
                        <span className="text-gray-500" style={{ fontSize: "10px" }}>{sq.points} điểm</span>
                      </div>
                      <p className="text-gray-700 mb-3" style={{ fontSize: "14px", lineHeight: 1.6 }}>{sq.question}</p>
                      {(sq.type === "single_choice" || sq.type === "multiple_choice") && sq.options && (
                        <div className="space-y-2">
                          {sq.options.map((opt, oIdx) => {
                            const val = (answers[q.id] || {})[sq.id];
                            const selected = sq.type === "single_choice" ? val === oIdx : (val || []).includes(oIdx);
                            return (
                              <button key={oIdx} onClick={() => {
                                if (sq.type === "single_choice") handleCaseStudyAnswer(sq.id, oIdx);
                                else {
                                  const cur = (answers[q.id] || {})[sq.id] || [];
                                  handleCaseStudyAnswer(sq.id, cur.includes(oIdx) ? cur.filter((i: number) => i !== oIdx) : [...cur, oIdx]);
                                }
                              }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                                selected ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"
                              }`}>
                                <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${selected ? "bg-[#990803]" : "bg-gray-100"}`}>
                                  <span className={selected ? "text-white" : "text-gray-400"} style={{ fontSize: "10px", fontWeight: 700 }}>{String.fromCharCode(65 + oIdx)}</span>
                                </div>
                                <span style={{ fontSize: "13px" }}>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {sq.type === "short_answer" && (
                        <textarea
                          value={(answers[q.id] || {})[sq.id] || ""}
                          onChange={(e) => handleCaseStudyAnswer(sq.id, e.target.value)}
                          placeholder="Nhập câu trả lời..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#990803] resize-y"
                          style={{ fontSize: "13px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Confidence level ── */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-gray-400 mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>Mức độ tự tin:</p>
                <div className="flex gap-2">
                  {[
                    { level: 1, label: "Đoán", color: "#ef4444", emoji: "😰" },
                    { level: 2, label: "Không chắc", color: "#f59e0b", emoji: "🤔" },
                    { level: 3, label: "Khá chắc", color: "#3b82f6", emoji: "🙂" },
                    { level: 4, label: "Rất chắc", color: "#22c55e", emoji: "😊" },
                  ].map(c => (
                    <button key={c.level} onClick={() => handleConfidence(c.level)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        confidence[q.id] === c.level ? "shadow-sm" : "border-gray-200 hover:border-gray-300"
                      }`}
                      style={confidence[q.id] === c.level ? { borderColor: c.color, background: c.color + "10", color: c.color } : {}}
                    >
                      <span style={{ fontSize: "14px" }}>{c.emoji}</span>
                      <span style={{ fontSize: "11px", fontWeight: 500 }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Hint ── */}
              {q.hint && (
                <div className="mt-4">
                  <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-1.5 text-[#c8a84e] hover:text-[#b0932d] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
                    <Lightbulb className="w-3.5 h-3.5" /> {showHint ? "Ẩn gợi ý" : "Xem gợi ý (-0.5đ)"}
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-[#c8a84e]/10 rounded-lg border border-[#c8a84e]/20">
                      <p className="text-[#8a7235]" style={{ fontSize: "12px" }}>{q.hint}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── NAV SIDEBAR ── */}
        {showNav && (
          <aside className="hidden lg:flex w-72 border-l border-gray-200 bg-white flex-col shrink-0">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Bản đồ câu hỏi</h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{answeredCount}/{questions.length}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {[
                  { color: "bg-[#990803]", label: "Đang xem" },
                  { color: "bg-[#c8a84e]", label: "Đã trả lời" },
                  { color: "bg-gray-200", label: "Chưa làm" },
                  { color: "border-2 border-red-400 bg-white", label: "Đánh dấu" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${l.color}`} />
                    <span className="text-gray-400" style={{ fontSize: "9px" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question grid by section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {exam.sections.map((section, sIdx) => {
                let startIdx = 0;
                for (let i = 0; i < sIdx; i++) startIdx += exam.sections[i].questions.length;
                return (
                  <div key={section.id}>
                    <p className="text-gray-400 mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.03em" }}>{section.title}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {section.questions.map((qId, qIdx) => {
                        const globalIdx = startIdx + qIdx;
                        const isCurrent = globalIdx === currentIdx;
                        const isAnsw = isAnswered(qId);
                        const isFlag = flagged.has(qId);
                        return (
                          <button key={qId} onClick={() => goTo(globalIdx)}
                            className={`relative w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                              isCurrent ? "bg-[#990803] text-white shadow-md shadow-[#990803]/30 scale-110" :
                              isAnsw ? "bg-[#c8a84e] text-white" :
                              "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            } ${isFlag ? "ring-2 ring-red-400 ring-offset-1" : ""}`}
                            style={{ fontSize: "11px", fontWeight: 600 }}
                          >
                            {globalIdx + 1}
                            {isFlag && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit area */}
            <div className="shrink-0 p-4 border-t border-gray-100 space-y-2">
              {flaggedCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg">
                  <Flag className="w-3 h-3 text-red-400" />
                  <span className="text-red-500" style={{ fontSize: "11px", fontWeight: 500 }}>{flaggedCount} câu đánh dấu</span>
                </div>
              )}
              <button onClick={() => setShowSubmitConfirm(true)}
                className="w-full py-3 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 transition-all cursor-pointer"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Nộp bài ({answeredCount}/{questions.length})
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── BOTTOM BAR ── */}
      <footer className="shrink-0 bg-white border-t border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} disabled={currentIdx === 0 || !exam.allowBacktrack}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontSize: "13px" }}
            >
              <ChevronLeft className="w-4 h-4" /> Câu trước
            </button>
            <button onClick={goNext} disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer disabled:opacity-30"
              style={{ fontSize: "13px" }}
            >
              Câu tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                flagged.has(q.id) ? "bg-red-50 text-red-500 border border-red-200" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent"
              }`} style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <Flag className="w-4 h-4" /> {flagged.has(q.id) ? "Bỏ đánh dấu" : "Đánh dấu"}
            </button>

            {exam.allowCalculator && (
              <button onClick={() => { setShowCalc(!showCalc); setShowNotepad(false); }}
                className={`p-2 rounded-lg cursor-pointer transition-all ${showCalc ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                <Calculator className="w-4 h-4" />
              </button>
            )}
            {exam.allowNotepad && (
              <button onClick={() => { setShowNotepad(!showNotepad); setShowCalc(false); }}
                className={`p-2 rounded-lg cursor-pointer transition-all ${showNotepad ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}>
                <StickyNote className="w-4 h-4" />
              </button>
            )}

            <button onClick={() => setShowNav(!showNav)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer lg:block hidden">
              {showNav ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Mobile submit */}
            <button onClick={() => setShowSubmitConfirm(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <Send className="w-3.5 h-3.5" /> Nộp bài
            </button>
          </div>
        </div>
      </footer>

      {/* ── Calculator Popup ── */}
      {showCalc && (
        <div className="fixed bottom-20 right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>Máy tính</span>
            <button onClick={() => setShowCalc(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-4">
            <div className="text-right mb-1 text-gray-400 h-4" style={{ fontSize: "10px" }}>{calcHistory}</div>
            <div className="text-right mb-3 text-gray-800 overflow-hidden" style={{ fontSize: "24px", fontWeight: 700 }}>{calcValue}</div>
            <div className="grid grid-cols-4 gap-1.5">
              {["C", "⌫", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "(", ")", "="].map(btn => (
                <button key={btn} onClick={() => calcClick(btn)}
                  className={`py-2.5 rounded-lg transition-all cursor-pointer ${
                    btn === "=" ? "col-span-1 bg-[#990803] text-white hover:bg-[#7a0602]" :
                    "C⌫%÷×-+()".includes(btn) ? "bg-gray-100 text-gray-600 hover:bg-gray-200" :
                    "bg-white text-gray-800 hover:bg-gray-50 border border-gray-100"
                  } ${btn === "0" ? "col-span-1" : ""}`}
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Notepad Popup ── */}
      {showNotepad && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#c8a84e]/10 border-b border-[#c8a84e]/20">
            <span className="text-[#8a7235]" style={{ fontSize: "12px", fontWeight: 600 }}>📝 Ghi chú nháp</span>
            <button onClick={() => setShowNotepad(false)} className="text-[#8a7235]/50 hover:text-[#8a7235] cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
          <textarea
            value={notepadText}
            onChange={(e) => setNotepadText(e.target.value)}
            placeholder="Ghi chú nháp của bạn..."
            className="w-full h-48 p-4 resize-none focus:outline-none"
            style={{ fontSize: "13px", lineHeight: 1.6 }}
          />
        </div>
      )}

      {/* ── Submit Confirmation Modal ── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-14 h-14 rounded-2xl bg-[#990803]/10 flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-[#990803]" />
            </div>
            <h3 className="text-center text-gray-800 mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>Xác nhận nộp bài?</h3>
            <p className="text-center text-gray-500 mb-4" style={{ fontSize: "13px" }}>Bạn không thể chỉnh sửa sau khi nộp.</p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500" style={{ fontSize: "13px" }}>Đã trả lời</span>
                <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{answeredCount}/{questions.length}</span>
              </div>
              {questions.length - answeredCount > 0 && (
                <div className="flex items-center justify-between px-4 py-2 bg-amber-50 rounded-lg">
                  <span className="text-amber-600" style={{ fontSize: "13px" }}>Chưa trả lời</span>
                  <span className="text-amber-600" style={{ fontSize: "13px", fontWeight: 600 }}>{questions.length - answeredCount} câu</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex items-center justify-between px-4 py-2 bg-red-50 rounded-lg">
                  <span className="text-red-500" style={{ fontSize: "13px" }}>Đánh dấu xem lại</span>
                  <span className="text-red-500" style={{ fontSize: "13px", fontWeight: 600 }}>{flaggedCount} câu</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "14px" }}>
                Xem lại
              </button>
              <button onClick={() => { setShowSubmitConfirm(false); handleSubmit(); }}
                className="flex-1 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-center text-gray-800 mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>Thoát bài thi?</h3>
            <p className="text-center text-gray-500 mb-6" style={{ fontSize: "13px" }}>
              Bài làm sẽ được lưu nháp. Bạn có thể tiếp tục sau nếu còn thời gian.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "14px" }}>
                Tiếp tục thi
              </button>
              <button onClick={onExit} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 cursor-pointer" style={{ fontSize: "14px", fontWeight: 600 }}>
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideDown{0%{opacity:0;transform:translate(-50%,-20px)}100%{opacity:1;transform:translate(-50%,0)}}`}</style>
    </div>
  );
}