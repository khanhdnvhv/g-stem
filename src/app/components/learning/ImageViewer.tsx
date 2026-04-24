import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw,
  Maximize2, Minimize2, Download, Pause, PlayCircle,
  Image as ImageIcon, X,
} from "lucide-react";
import type { Lesson } from "./types";

/* ─── Image Viewer (Enhanced) ─── */
export function ImageViewer({ lesson, onContentReady }: { lesson: Lesson; onContentReady?: (ready: boolean) => void }) {
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

  /* ── Track viewed images ── */
  const [viewedImages, setViewedImages] = useState<Set<number>>(new Set([0]));
  useEffect(() => {
    setViewedImages(prev => {
      if (prev.has(currentImg)) return prev;
      return new Set([...prev, currentImg]);
    });
  }, [currentImg]);
  useEffect(() => {
    if (onContentReady && viewedImages.size >= imgCount) {
      onContentReady(true);
    }
  }, [viewedImages.size, imgCount, onContentReady]);

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