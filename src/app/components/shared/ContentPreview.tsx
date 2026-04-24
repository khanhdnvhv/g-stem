import { useState, useEffect } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack,
  FileText, Image, Video, Headphones, File, BookOpen, Layers,
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw,
} from "lucide-react";

interface ContentPreviewProps {
  type: string; // document | video | audio | slide | image | quiz | template | scorm
  title: string;
  onClose?: () => void;
  inline?: boolean; // if true, renders without modal wrapper
}

// ─── Mock waveform data ───
const WAVE_BARS = Array.from({ length: 60 }, () => 10 + Math.random() * 80);

export function ContentPreview({ type, title, onClose, inline = false }: ContentPreviewProps) {
  const content = (
    <div className="w-full">
      {type === "video" && <VideoPreview title={title} />}
      {type === "audio" && <AudioPreview title={title} />}
      {(type === "document" || type === "template") && <DocumentPreview title={title} />}
      {type === "slide" && <SlidePreview title={title} />}
      {type === "image" && <ImagePreview title={title} />}
      {type === "quiz" && <QuizPreview title={title} />}
      {type === "scorm" && <ScormPreview title={title} />}
    </div>
  );

  if (inline) return content;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-foreground truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</h3>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-56px)]">
          {content}
        </div>
      </div>
    </div>
  );
}

// ─── Video Preview ───
function VideoPreview({ title }: { title: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const duration = 145; // 2:25

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) { setPlaying(false); return 0; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
      {/* Mock video content */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
      <div className="absolute inset-0 flex items-center justify-center">
        {!playing ? (
          <button onClick={() => setPlaying(true)}
            className="w-16 h-16 rounded-full bg-[#990803]/90 hover:bg-[#990803] flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-2xl">
            <Play className="w-7 h-7 text-white ml-1" />
          </button>
        ) : (
          <div className="text-center">
            <Video className="w-12 h-12 text-white/20 mx-auto" />
            <p className="text-white/40 mt-2" style={{ fontSize: "13px" }}>{title}</p>
            <p className="text-white/20 mt-0.5" style={{ fontSize: "11px" }}>Đang phát...</p>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
        {/* Progress */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-2 group cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.floor(pct * duration));
          }}>
          <div className="h-full bg-[#990803] rounded-full transition-all relative" style={{ width: `${(currentTime / duration) * 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentTime(Math.max(0, currentTime - 10))} className="text-white/70 hover:text-white cursor-pointer"><SkipBack className="w-4 h-4" /></button>
          <button onClick={() => setPlaying(!playing)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))} className="text-white/70 hover:text-white cursor-pointer"><SkipForward className="w-4 h-4" /></button>
          <span className="text-white/60" style={{ fontSize: "11px" }}>{fmt(currentTime)} / {fmt(duration)}</span>
          <div className="flex-1" />
          <button onClick={() => setMuted(!muted)} className="text-white/70 hover:text-white cursor-pointer">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button className="text-white/70 hover:text-white cursor-pointer"><Maximize className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Audio Preview ───
function AudioPreview({ title }: { title: string }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 2700; // 45:00
  const activeBar = Math.floor((currentTime / duration) * WAVE_BARS.length);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) { setPlaying(false); return 0; }
        return prev + 1;
      });
    }, 100); // Speed up for demo
    return () => clearInterval(interval);
  }, [playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="p-6 bg-gradient-to-br from-[#990803]/5 to-[#c8a84e]/5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-[#990803]/10 flex items-center justify-center">
          <Headphones className="w-8 h-8 text-[#990803]" />
        </div>
        <div>
          <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{title}</p>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Podcast • {fmt(duration)}</p>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-end gap-[2px] h-16 mb-4 cursor-pointer"
        onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentTime(Math.floor(pct * duration));
        }}>
        {WAVE_BARS.map((h, i) => (
          <div key={i} className="flex-1 rounded-full transition-all duration-150"
            style={{
              height: `${h}%`,
              backgroundColor: i <= activeBar ? "#990803" : "#99080320",
            }} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 justify-center">
        <button onClick={() => setCurrentTime(Math.max(0, currentTime - 300))} className="p-2 rounded-full hover:bg-secondary cursor-pointer text-muted-foreground"><SkipBack className="w-5 h-5" /></button>
        <button onClick={() => setPlaying(!playing)} className="w-12 h-12 rounded-full bg-[#990803] text-white flex items-center justify-center cursor-pointer hover:bg-[#990803]/90 shadow-lg">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 300))} className="p-2 rounded-full hover:bg-secondary cursor-pointer text-muted-foreground"><SkipForward className="w-5 h-5" /></button>
      </div>
      <p className="text-center text-muted-foreground mt-2" style={{ fontSize: "11px" }}>{fmt(currentTime)} / {fmt(duration)}</p>
    </div>
  );
}

// ─── Document Preview ───
function DocumentPreview({ title }: { title: string }) {
  const [page, setPage] = useState(1);
  const totalPages = 12;
  return (
    <div className="p-6">
      {/* Mock PDF pages */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mx-auto max-w-md aspect-[3/4] p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded bg-[#990803]/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#990803]" />
          </div>
          <div>
            <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>Trang {page} / {totalPages}</p>
          </div>
        </div>
        {/* Mock text lines */}
        <div className="space-y-3 flex-1">
          {Array.from({ length: 8 + page % 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {i === 0 && <div className="h-3 bg-gray-200 rounded w-2/3" />}
              {i === 1 && <div className="h-3 bg-gray-100 rounded w-full" />}
              {i === 2 && <div className="h-3 bg-gray-100 rounded w-5/6" />}
              {i === 3 && page === 1 && <div className="h-16 bg-[#990803]/5 rounded-lg w-full border border-[#990803]/10 flex items-center justify-center"><span className="text-[#990803]/30" style={{ fontSize: "10px" }}>Biểu đồ minh họa</span></div>}
              {i > 3 && <div className="h-3 bg-gray-100 rounded" style={{ width: `${50 + Math.random() * 50}%` }} />}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-gray-300" style={{ fontSize: "9px" }}>
          <span>Geleximco LMS</span>
          <span>Trang {page}</span>
        </div>
      </div>

      {/* Page controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Trang {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
      </div>
    </div>
  );
}

// ─── Slide Preview ───
function SlidePreview({ title }: { title: string }) {
  const [slide, setSlide] = useState(1);
  const totalSlides = 24;
  const SLIDE_COLORS = ["#990803", "#c8a84e", "#2563eb", "#16a34a", "#7c3aed"];
  const color = SLIDE_COLORS[(slide - 1) % SLIDE_COLORS.length];

  return (
    <div className="p-6">
      {/* Slide mock */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mx-auto max-w-lg aspect-video flex flex-col overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
          {slide === 1 ? (
            <>
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
                <File className="w-6 h-6" style={{ color }} />
              </div>
              <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{title}</p>
              <p className="text-gray-400 mt-2" style={{ fontSize: "12px" }}>Geleximco Training Academy</p>
              <div className="w-12 h-0.5 mt-3 rounded-full" style={{ backgroundColor: color }} />
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4" style={{ fontSize: "16px", fontWeight: 600 }}>Nội dung Slide {slide}</p>
              <div className="space-y-2 w-full max-w-xs">
                {Array.from({ length: 3 + slide % 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <div className="h-3 bg-gray-100 rounded flex-1" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </div>
                ))}
              </div>
              {slide % 3 === 0 && (
                <div className="w-40 h-20 mt-4 rounded-lg border border-gray-100 flex items-center justify-center" style={{ backgroundColor: color + "08" }}>
                  <span style={{ fontSize: "10px", color: color + "50" }}>Biểu đồ / Hình ảnh</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-gray-300" style={{ fontSize: "9px" }}>
          <span>Geleximco Academy</span>
          <span>{slide} / {totalSlides}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button disabled={slide <= 1} onClick={() => setSlide(p => p - 1)} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalSlides, 8) }).map((_, i) => {
            const s = i + 1;
            return (
              <button key={s} onClick={() => setSlide(s)}
                className={`w-6 h-1.5 rounded-full cursor-pointer transition-all ${s === slide ? "bg-[#990803]" : "bg-gray-200 hover:bg-gray-300"}`} />
            );
          })}
          {totalSlides > 8 && <span className="text-muted-foreground mx-1" style={{ fontSize: "10px" }}>...</span>}
        </div>
        <button disabled={slide >= totalSlides} onClick={() => setSlide(p => p + 1)} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 cursor-pointer"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
      </div>
      <p className="text-center text-muted-foreground mt-1" style={{ fontSize: "11px" }}>Slide {slide} / {totalSlides}</p>
    </div>
  );
}

// ─── Image Preview ───
function ImagePreview({ title }: { title: string }) {
  const [zoom, setZoom] = useState(100);
  return (
    <div className="p-6">
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mx-auto max-w-lg aspect-video flex items-center justify-center relative"
        style={{ transform: `scale(${zoom / 100})`, transition: "transform 0.2s" }}>
        {/* Mock infographic content */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#990803]/5 via-white to-[#c8a84e]/5">
          <div className="text-center">
            <Image className="w-12 h-12 text-[#990803]/20 mx-auto" />
            <p className="text-gray-600 mt-2" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>Infographic • PNG</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-16 h-20 rounded-lg border border-gray-200 bg-white flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: `${["#990803", "#c8a84e", "#2563eb"][i - 1]}15` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <button onClick={() => setZoom(p => Math.max(50, p - 25))} className="p-2 rounded-lg hover:bg-secondary cursor-pointer"><ZoomOut className="w-4 h-4 text-muted-foreground" /></button>
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{zoom}%</span>
        <button onClick={() => setZoom(p => Math.min(200, p + 25))} className="p-2 rounded-lg hover:bg-secondary cursor-pointer"><ZoomIn className="w-4 h-4 text-muted-foreground" /></button>
        <button onClick={() => setZoom(100)} className="p-2 rounded-lg hover:bg-secondary cursor-pointer"><RotateCw className="w-4 h-4 text-muted-foreground" /></button>
      </div>
    </div>
  );
}

// ─── Quiz Preview ───
function QuizPreview({ title }: { title: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const options = [
    "Phải đội mũ bảo hiểm khi vào khu vực thi công",
    "Chỉ cần mang găng tay là đủ",
    "Không cần trang bị bảo hộ nếu dưới 30 phút",
    "Giám sát sẽ cung cấp PPE nếu cần",
  ];
  const correct = 0;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mx-auto max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#7c3aed]" />
          </div>
          <div>
            <p className="text-gray-500" style={{ fontSize: "10px" }}>Xem trước câu hỏi</p>
            <p className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{title}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-4" style={{ fontSize: "14px", fontWeight: 500 }}>
          Câu 1: Quy định bắt buộc khi vào khu vực thi công xây dựng là gì?
        </p>

        <div className="space-y-2">
          {options.map((opt, i) => (
            <button key={i} onClick={() => { setSelected(i); setShowAnswer(true); }}
              className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                showAnswer && i === correct ? "border-[#16a34a] bg-[#16a34a]/5" :
                showAnswer && i === selected && i !== correct ? "border-red-300 bg-red-50" :
                selected === i ? "border-[#990803] bg-[#990803]/5" :
                "border-gray-200 hover:border-gray-300"
              }`} style={{ fontSize: "13px" }}>
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  showAnswer && i === correct ? "border-[#16a34a] bg-[#16a34a]" :
                  showAnswer && i === selected && i !== correct ? "border-red-400 bg-red-400" :
                  selected === i ? "border-[#990803] bg-[#990803]" :
                  "border-gray-300"
                }`}>
                  {(selected === i || (showAnswer && i === correct)) && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={showAnswer && i === correct ? "text-[#16a34a]" : "text-gray-700"}>{opt}</span>
              </div>
            </button>
          ))}
        </div>

        {showAnswer && (
          <div className="mt-4 p-3 bg-[#16a34a]/5 border border-[#16a34a]/10 rounded-lg">
            <p className="text-[#16a34a]" style={{ fontSize: "12px", fontWeight: 600 }}>✓ Đáp án đúng: A</p>
            <p className="text-gray-600 mt-1" style={{ fontSize: "11px" }}>Theo quy định ATLĐ, tất cả người vào khu vực thi công phải đội mũ bảo hiểm.</p>
          </div>
        )}

        <button onClick={() => { setSelected(null); setShowAnswer(false); }}
          className="w-full mt-3 py-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 cursor-pointer" style={{ fontSize: "12px" }}>
          Câu tiếp theo →
        </button>
      </div>
    </div>
  );
}

// ─── SCORM Preview ───
function ScormPreview({ title }: { title: string }) {
  return (
    <div className="p-6">
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mx-auto max-w-lg aspect-video flex flex-col">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#c8a84e]" />
          <span className="text-white/80" style={{ fontSize: "11px", fontWeight: 500 }}>SCORM 2004 Player</span>
          <div className="flex-1" />
          <div className="flex gap-1">
            {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />)}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <Layers className="w-10 h-10 text-[#c8a84e]/30 mx-auto" />
            <p className="text-gray-600 mt-2" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "11px" }}>Gói SCORM đang được tải...</p>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 overflow-hidden">
              <div className="h-full bg-[#c8a84e] rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}