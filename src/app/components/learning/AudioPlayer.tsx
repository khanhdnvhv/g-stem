import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  Headphones, FileText, Bookmark, Download, Repeat, Plus, X,
} from "lucide-react";
import type { Lesson } from "./types";
import { AUDIO_CONTENT } from "./lesson-content";

/* ─── Audio Player (Enhanced) ─── */
export function AudioPlayer({ lesson, onContentReady }: { lesson: Lesson; onContentReady?: (ready: boolean) => void }) {
  // ── Resolve lesson-specific content ──
  const lessonContent = AUDIO_CONTENT[lesson.id];

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(lesson.id === "L09" ? 0 : 18);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(75);
  const [muted, setMuted] = useState(false);
  const totalSec = lessonContent?.totalSec ?? 1125;
  const currentSec = Math.round((progress / 100) * totalSec);
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  /* ── Loop / Repeat mode ── */
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const cycleRepeat = () => setRepeatMode((m) => m === "off" ? "all" : m === "all" ? "one" : "off");

  /* ── A-B Repeat ── */
  const [abRepeat, setAbRepeat] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const isAbActive = abRepeat.a !== null && abRepeat.b !== null;
  const toggleAB = () => {
    if (isAbActive) { setAbRepeat({ a: null, b: null }); return; }
    if (abRepeat.a === null) { setAbRepeat({ a: progress, b: null }); return; }
    if (abRepeat.b === null) { setAbRepeat((p) => ({ ...p, b: Math.max(progress, (p.a ?? 0) + 1) })); }
  };

  /* ── Bookmark timestamps ── */
  const [audioBookmarks, setAudioBookmarks] = useState<{ id: string; timePct: number; label: string }[]>(
    lessonContent?.bookmarks ?? [
      { id: "ab1", timePct: 0, label: "Mở đầu — Giới thiệu tầm nhìn" },
      { id: "ab2", timePct: 13.3, label: "14 đơn vị & 10 lĩnh vực" },
      { id: "ab3", timePct: 28, label: "3 trụ cột đào tạo" },
    ]
  );
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
  const transcriptData = useMemo(() =>
    lessonContent?.transcript ?? [
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
    ],
  [lessonContent]);
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

  /* ── Content ready tracking ── */
  useEffect(() => {
    if (onContentReady && progress >= 90) {
      onContentReady(true);
    }
  }, [progress, onContentReady]);

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
            <p className="text-white/50" style={{ fontSize: "11px", fontWeight: 500 }}>{lessonContent?.headerLabel ?? "PODCAST • AUDIO"}</p>
            <h3 className="text-white mt-1" style={{ fontSize: "18px", fontWeight: 600 }}>{lesson.title.replace("Audio: ", "")}</h3>
            <p className="text-white/60 mt-0.5" style={{ fontSize: "12px" }}>{lessonContent?.headerSubtitle ?? `Ban Giám đốc Tập đoàn Geleximco • ${lesson.duration}`}</p>
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