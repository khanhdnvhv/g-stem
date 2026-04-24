import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import {
  Award, Plus, Edit3, Trash2, Copy, Eye, CheckCircle2,
  Palette, Settings, Star, X, ChevronDown, Type, Layout,
  Maximize2, Image, Layers, PenTool, Users, FileText,
  Tag, Hash, RotateCw, Monitor, Smartphone, Zap,
  Minus, ChevronRight, Grid3X3, List, Search,
  Shield, Sparkles, Building2, Flame, HardHat, Landmark,
  BookOpen, AlertTriangle, ToggleLeft, ToggleRight,
  ArrowLeft, Undo2, Redo2, Move, MousePointer, GripVertical,
} from "lucide-react";
import type { CertTemplate } from "./CertPreview";
import { useConfirm } from "../ConfirmDialog";
import { DEFAULT_TEMPLATES, CertificatePreviewSVG, CertMiniPreview } from "./CertPreview";

// ════════════════════════════════════════
// ── Undo/Redo History Hook ──
// ════════════════════════════════════════
const MAX_HISTORY = 60;

function useHistory(initial: CertTemplate | null) {
  const [history, setHistory] = useState<CertTemplate[]>(initial ? [initial] : []);
  const [index, setIndex] = useState(0);

  const current = history[index] || null;
  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  const push = useCallback((state: CertTemplate) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, index + 1);
      const next = [...trimmed, state];
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [index]);

  const undo = useCallback(() => {
    if (canUndo) setIndex(i => i - 1);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) setIndex(i => i + 1);
  }, [canRedo]);

  const reset = useCallback((state: CertTemplate) => {
    setHistory([state]);
    setIndex(0);
  }, []);

  return { current, push, undo, redo, canUndo, canRedo, reset, historyLength: history.length, currentIndex: index };
}

// ════════════════════════════════════════
// ── Interactive Canvas with Drag-and-Drop ──
// ════════════════════════════════════════
type DragTarget = "logo" | "qr" | "seal" | "header" | "subtitle" | "signer1" | "signer2" | "signer3" | null;

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 8; // px proximity to snap to guide

function InteractiveCertCanvas({
  template,
  studentName, courseName, score, issuedDate, expiryDate, certNo,
  canvasMode, snapEnabled, showGrid,
  onDragEnd,
}: {
  template: CertTemplate;
  studentName: string; courseName: string; score: number;
  issuedDate: string; expiryDate: string; certNo: string;
  canvasMode: boolean; snapEnabled: boolean; showGrid: boolean;
  onDragEnd: (target: DragTarget, x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hovering, setHovering] = useState<DragTarget>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  const isPortrait = (template.orientation || "landscape") === "portrait";
  const svgW = isPortrait ? 566 : 800;
  const svgH = isPortrait ? 800 : 566;
  const cxCanvas = svgW / 2;
  const cyCanvas = svgH / 2;

  const toSVG = useCallback((e: React.MouseEvent | MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svgW;
    const y = ((e.clientY - rect.top) / rect.height) * svgH;
    return { x: Math.round(x), y: Math.round(y) };
  }, [svgW, svgH]);

  // Get default position for every draggable target
  const getElementPos = useCallback((id: DragTarget): { x: number; y: number } => {
    const logoY = isPortrait ? 80 : 72;
    const headerY = isPortrait ? 135 : 122;
    const subtitleY = isPortrait ? 175 : 158;
    const signerY = isPortrait ? 540 : 465;
    const cx = svgW / 2;
    const d = {
      logoPosition: template.logoPosition || "top-center",
      logoSize: template.logoSize || 28,
      qrPosition: template.qrPosition || "bottom-right",
      qrSize: template.qrSize || 22,
      sealPosition: template.sealPosition || "between-signers",
      signerLayout: template.signerLayout || "2-sides",
    };
    switch (id) {
      case "logo": {
        if (template.logoXY) return template.logoXY;
        const lx = d.logoPosition === "top-left" ? 70 : d.logoPosition === "top-right" ? svgW - 70 : cx;
        return { x: lx, y: logoY };
      }
      case "qr": {
        if (template.qrXY) return template.qrXY;
        const qs = d.qrSize;
        const qp = d.qrPosition;
        const qx = qp === "bottom-left" ? 45 + qs : qp === "top-right" ? svgW - 45 - qs : svgW - 45 - qs;
        const qy = qp === "top-right" ? 45 + qs : svgH - 45 - qs;
        return { x: qx, y: qy };
      }
      case "seal": {
        if (template.sealXY) return template.sealXY;
        const sp = d.sealPosition;
        const sx = sp === "left" ? svgW * 0.2 : sp === "right" ? svgW * 0.8 : cx;
        return { x: sx, y: signerY - 10 };
      }
      case "header": return template.headerXY || { x: cx, y: headerY };
      case "subtitle": return template.subtitleXY || { x: cx, y: subtitleY };
      case "signer1": {
        if (template.signer1XY) return template.signer1XY;
        return { x: d.signerLayout === "center-only" ? cx : d.signerLayout === "3-across" ? svgW * 0.2 : svgW * 0.26, y: signerY };
      }
      case "signer2": {
        if (template.signer2XY) return template.signer2XY;
        return { x: d.signerLayout === "3-across" ? cx : svgW * 0.74, y: signerY };
      }
      case "signer3": return template.signer3XY || { x: svgW * 0.8, y: signerY };
      default: return { x: 0, y: 0 };
    }
  }, [template, svgW, svgH, isPortrait]);

  // All positions for alignment guide computation
  const allPositions = useMemo(() => {
    const items: { id: DragTarget; pos: { x: number; y: number } }[] = [];
    if (template.hasLogo) items.push({ id: "logo", pos: getElementPos("logo") });
    if (template.hasQR) items.push({ id: "qr", pos: getElementPos("qr") });
    if (template.hasSeal) items.push({ id: "seal", pos: getElementPos("seal") });
    items.push({ id: "header", pos: getElementPos("header") });
    items.push({ id: "subtitle", pos: getElementPos("subtitle") });
    if (template.signer1Name) items.push({ id: "signer1", pos: getElementPos("signer1") });
    if (template.signer2Name) items.push({ id: "signer2", pos: getElementPos("signer2") });
    if (template.signer3Name) items.push({ id: "signer3", pos: getElementPos("signer3") });
    return items;
  }, [template, getElementPos]);

  // Snap logic: grid + alignment
  const applySnap = useCallback((rawPos: { x: number; y: number }, currentId: DragTarget): { x: number; y: number } => {
    let { x, y } = rawPos;
    const newGuides: { x?: number; y?: number } = {};

    if (snapEnabled) {
      // 1. Snap to grid
      const gx = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const gy = Math.round(y / GRID_SIZE) * GRID_SIZE;
      if (Math.abs(x - gx) < SNAP_THRESHOLD) x = gx;
      if (Math.abs(y - gy) < SNAP_THRESHOLD) y = gy;

      // 2. Snap to canvas center
      if (Math.abs(x - cxCanvas) < SNAP_THRESHOLD) { x = cxCanvas; newGuides.x = cxCanvas; }
      if (Math.abs(y - cyCanvas) < SNAP_THRESHOLD) { y = cyCanvas; newGuides.y = cyCanvas; }

      // 3. Snap to other elements (alignment guides)
      for (const item of allPositions) {
        if (item.id === currentId) continue;
        if (Math.abs(x - item.pos.x) < SNAP_THRESHOLD) { x = item.pos.x; newGuides.x = item.pos.x; }
        if (Math.abs(y - item.pos.y) < SNAP_THRESHOLD) { y = item.pos.y; newGuides.y = item.pos.y; }
      }
    }

    setGuides(newGuides);
    return { x: Math.max(20, Math.min(svgW - 20, x)), y: Math.max(20, Math.min(svgH - 20, y)) };
  }, [snapEnabled, cxCanvas, cyCanvas, allPositions, svgW, svgH]);

  const handleMouseDown = useCallback((target: DragTarget, e: React.MouseEvent) => {
    if (!canvasMode) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(target);
    setDragPos(toSVG(e));
  }, [canvasMode, toSVG]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const raw = toSVG(e);
      setDragPos(applySnap(raw, dragging));
    };
    const handleUp = () => {
      if (dragPos) onDragEnd(dragging, dragPos.x, dragPos.y);
      setDragging(null);
      setDragPos(null);
      setGuides({});
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [dragging, dragPos, toSVG, applySnap, onDragEnd]);

  // Build template with drag position override
  const displayTemplate = useMemo(() => {
    if (!dragging || !dragPos) return template;
    const fieldMap: Record<string, string> = { logo: "logoXY", qr: "qrXY", seal: "sealXY", header: "headerXY", subtitle: "subtitleXY", signer1: "signer1XY", signer2: "signer2XY", signer3: "signer3XY" };
    return { ...template, [fieldMap[dragging]]: dragPos };
  }, [template, dragging, dragPos]);

  // All draggable elements
  type DragItem = { id: DragTarget; label: string; visible: boolean; shape: "circle" | "rect"; size: number; hw?: number; hh?: number };
  const draggableElements: DragItem[] = [
    { id: "logo", label: "Logo", visible: !!template.hasLogo, shape: "circle", size: template.logoSize || 28 },
    { id: "qr", label: "QR", visible: !!template.hasQR, shape: "circle", size: template.qrSize || 22 },
    { id: "seal", label: "Seal", visible: !!template.hasSeal, shape: "circle", size: template.sealSize || 28 },
    { id: "header", label: "Header", visible: true, shape: "rect", size: 0, hw: 120, hh: 10 },
    { id: "subtitle", label: "Title", visible: true, shape: "rect", size: 0, hw: 140, hh: 16 },
    { id: "signer1", label: "CK1", visible: !!template.signer1Name, shape: "rect", size: 0, hw: 90, hh: 18 },
    { id: "signer2", label: "CK2", visible: !!template.signer2Name && (template.signerLayout || "2-sides") !== "center-only", shape: "rect", size: 0, hw: 90, hh: 18 },
    { id: "signer3", label: "CK3", visible: !!template.signer3Name && (template.signerLayout || "2-sides") === "3-across", shape: "rect", size: 0, hw: 90, hh: 18 },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <CertificatePreviewSVG
        template={displayTemplate}
        studentName={studentName}
        courseName={courseName}
        score={score}
        issuedDate={issuedDate}
        expiryDate={expiryDate}
        certNo={certNo}
      />

      {/* Canvas overlay */}
      {canvasMode && (
        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid slice"
          style={{ cursor: dragging ? "grabbing" : "default", zIndex: 10 }}>

          {/* Grid overlay */}
          {showGrid && (
            <g opacity="0.08">
              {Array.from({ length: Math.floor(svgW / GRID_SIZE) + 1 }).map((_, i) => (
                <line key={`gv${i}`} x1={i * GRID_SIZE} y1="0" x2={i * GRID_SIZE} y2={svgH}
                  stroke="#6b7280" strokeWidth={i * GRID_SIZE === cxCanvas ? "1.5" : "0.5"} />
              ))}
              {Array.from({ length: Math.floor(svgH / GRID_SIZE) + 1 }).map((_, i) => (
                <line key={`gh${i}`} x1="0" y1={i * GRID_SIZE} x2={svgW} y2={i * GRID_SIZE}
                  stroke="#6b7280" strokeWidth={i * GRID_SIZE === cyCanvas ? "1.5" : "0.5"} />
              ))}
            </g>
          )}

          {/* Center guides (always faint) */}
          <line x1={cxCanvas} y1="0" x2={cxCanvas} y2={svgH} stroke="#e11d48" strokeWidth="0.3" strokeDasharray="6 6" opacity="0.15" />
          <line x1="0" y1={cyCanvas} x2={svgW} y2={cyCanvas} stroke="#e11d48" strokeWidth="0.3" strokeDasharray="6 6" opacity="0.15" />

          {/* Active alignment guides (green) */}
          {guides.x !== undefined && dragging && (
            <line x1={guides.x} y1="0" x2={guides.x} y2={svgH} stroke="#22c55e" strokeWidth="1" opacity="0.6" />
          )}
          {guides.y !== undefined && dragging && (
            <line x1="0" y1={guides.y} x2={svgW} y2={guides.y} stroke="#22c55e" strokeWidth="1" opacity="0.6" />
          )}

          {/* Draggable elements */}
          {draggableElements.filter(el => el.visible).map(el => {
            const pos = (dragging === el.id && dragPos) ? dragPos : getElementPos(el.id);
            const isHover = hovering === el.id;
            const isDrag = dragging === el.id;
            const isText = el.shape === "rect";
            const hw = el.hw || 60;
            const hh = el.hh || 14;

            return (
              <g key={el.id}
                onMouseDown={(e) => handleMouseDown(el.id, e)}
                onMouseEnter={() => setHovering(el.id)}
                onMouseLeave={() => setHovering(null)}
                style={{ cursor: isDrag ? "grabbing" : "grab" }}>
                {/* Hit area */}
                {isText
                  ? <rect x={pos.x - hw - 4} y={pos.y - hh - 4} width={(hw + 4) * 2} height={(hh + 4) * 2} fill="transparent" />
                  : <circle cx={pos.x} cy={pos.y} r={el.size + 8} fill="transparent" />
                }
                {/* Selection indicator */}
                {(isHover || isDrag) && (
                  <>
                    {isText ? (
                      <rect x={pos.x - hw} y={pos.y - hh} width={hw * 2} height={hh * 2} rx="3"
                        fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray={isDrag ? "none" : "4 3"} opacity={isDrag ? 0.9 : 0.5} />
                    ) : (
                      <circle cx={pos.x} cy={pos.y} r={el.size + 4} fill="none" stroke="#3b82f6" strokeWidth="2"
                        strokeDasharray={isDrag ? "none" : "4 3"} opacity={isDrag ? 0.9 : 0.6} />
                    )}
                    {/* Corner handles */}
                    {isText ? (
                      [[-1,-1],[1,-1],[-1,1],[1,1]].map(([dx,dy], i) => (
                        <rect key={i} x={pos.x + dx * hw - 3} y={pos.y + dy * hh - 3}
                          width="6" height="6" rx="1" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                      ))
                    ) : (
                      [[-1,-1],[1,-1],[-1,1],[1,1]].map(([dx,dy], i) => (
                        <rect key={i} x={pos.x + dx * (el.size + 4) - 3} y={pos.y + dy * (el.size + 4) - 3}
                          width="6" height="6" rx="1" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                      ))
                    )}
                    {/* Label badge */}
                    {(() => {
                      const labelW = el.label.length * 6 + 12;
                      const badgeY = isText ? pos.y - hh - 18 : pos.y - el.size - 18;
                      return (
                        <>
                          <rect x={pos.x - labelW / 2} y={badgeY} width={labelW} height="14" rx="3" fill="#3b82f6" />
                          <text x={pos.x} y={badgeY + 10} textAnchor="middle" fill="white" fontSize="8" fontWeight="600">{el.label}</text>
                        </>
                      );
                    })()}
                  </>
                )}
                {/* Crosshair + coordinate tooltip while dragging */}
                {isDrag && (
                  <>
                    <line x1={pos.x} y1="0" x2={pos.x} y2={svgH} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.25" />
                    <line x1="0" y1={pos.y} x2={svgW} y2={pos.y} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.25" />
                    <rect x={pos.x + 14} y={pos.y - 22} width="64" height="18" rx="4" fill="#1e293b" opacity="0.9" />
                    <text x={pos.x + 46} y={pos.y - 10} textAnchor="middle" fill="white" fontSize="8" fontWeight="500">
                      {pos.x}, {pos.y}
                    </text>
                    {/* Snap indicator */}
                    {(guides.x !== undefined || guides.y !== undefined) && (
                      <>
                        <rect x={pos.x + 14} y={pos.y - 6} width="42" height="12" rx="3" fill="#22c55e" opacity="0.9" />
                        <text x={pos.x + 35} y={pos.y + 3} textAnchor="middle" fill="white" fontSize="7" fontWeight="700">SNAP</text>
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// ── Editor tab definitions ──
type EditorTab = "general" | "layout" | "typography" | "colors" | "background" | "elements" | "content" | "signers" | "advanced";

const EDITOR_TABS: { id: EditorTab; label: string; icon: any }[] = [
  { id: "general", label: "Tổng quan", icon: Settings },
  { id: "layout", label: "Bố cục", icon: Layout },
  { id: "typography", label: "Typography", icon: Type },
  { id: "colors", label: "Màu sắc", icon: Palette },
  { id: "background", label: "Nền & Viền", icon: Image },
  { id: "elements", label: "Thành phần", icon: Layers },
  { id: "content", label: "Nội dung", icon: FileText },
  { id: "signers", label: "Chữ ký", icon: PenTool },
  { id: "advanced", label: "Nâng cao", icon: Sparkles },
];

// ── Smart presets ──
const SMART_PRESETS: { label: string; icon: any; color: string; desc: string; apply: Partial<CertTemplate> }[] = [
  {
    label: "Geleximco Chính thống", icon: Building2, color: "#990803",
    desc: "Phôi chuẩn Tập đoàn với viền vàng, seal và QR",
    apply: { primaryColor: "#990803", accentColor: "#c8a84e", style: "classic", bgPattern: "border", fontFamily: "serif", hasCornerOrnaments: true, hasSeal: true, hasQR: true, hasLogo: true, dividerStyle: "ornate", hasRibbon: false, headerText: "TẬP ĐOÀN GELEXIMCO", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO", category: "general" },
  },
  {
    label: "ABBank - Ngân hàng", icon: Landmark, color: "#0ea5e9",
    desc: "Dành cho khối Ngân hàng ABBank, hiện đại chuyên nghiệp",
    apply: { primaryColor: "#0c4a6e", accentColor: "#0ea5e9", style: "modern", bgPattern: "gradient", fontFamily: "sans", hasTopBar: true, topBarHeight: 6, hasSeal: false, hasQR: true, hasLogo: true, hasWatermark: true, dividerStyle: "line", headerText: "NGÂN HÀNG TMCP AN BÌNH", subHeaderText: "TRAINING CERTIFICATE", category: "banking" },
  },
  {
    label: "Năng lượng", icon: Flame, color: "#f59e0b",
    desc: "Nhiệt điện Thăng Long, Xi măng Thăng Long",
    apply: { primaryColor: "#92400e", accentColor: "#f59e0b", style: "classic", bgPattern: "border", fontFamily: "serif", hasSeal: true, hasQR: true, hasLogo: true, hasCornerOrnaments: true, dividerStyle: "diamond", headerText: "NHIỆT ĐIỆN THĂNG LONG", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO", category: "energy" },
  },
  {
    label: "Xây dựng & BĐS", icon: HardHat, color: "#dc2626",
    desc: "Khối BĐS và Xây dựng Geleximco",
    apply: { primaryColor: "#7f1d1d", accentColor: "#dc2626", style: "classic", bgPattern: "border", fontFamily: "serif", hasSeal: true, hasQR: true, hasLogo: true, dividerStyle: "ornate", headerText: "BĐS GELEXIMCO", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO", category: "construction" },
  },
  {
    label: "Compliance & ISO", icon: Shield, color: "#16a34a",
    desc: "Tuân thủ pháp luật, ISO, An toàn lao động",
    apply: { primaryColor: "#14532d", accentColor: "#16a34a", style: "elegant", bgPattern: "ornate", fontFamily: "serif", hasSeal: true, hasQR: true, hasLogo: true, hasCornerOrnaments: true, dividerStyle: "laurel", hasRibbon: true, ribbonText: "CERTIFIED", headerText: "TẬP ĐOÀN GELEXIMCO", subHeaderText: "CHỨNG NHẬN TUÂN THỦ", category: "compliance" },
  },
  {
    label: "Khoáng sản", icon: HardHat, color: "#78716c",
    desc: "Khoáng sản Geleximco, An toàn mỏ",
    apply: { primaryColor: "#44403c", accentColor: "#a8a29e", style: "classic", bgPattern: "border", fontFamily: "serif", hasSeal: true, hasQR: true, hasLogo: true, dividerStyle: "ornate", headerText: "KHOÁNG SẢN GELEXIMCO", subHeaderText: "CHỨNG CHỈ AN TOÀN", category: "mining" },
  },
  {
    label: "Bảo hiểm AAA", icon: Shield, color: "#7c3aed",
    desc: "Bảo hiểm AAA, phong cách sang trọng",
    apply: { primaryColor: "#4c1d95", accentColor: "#7c3aed", style: "elegant", bgPattern: "ornate", fontFamily: "display", hasSeal: true, hasQR: true, hasLogo: true, hasCornerOrnaments: true, dividerStyle: "laurel", headerText: "BẢO HIỂM AAA", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO", category: "insurance" },
  },
  {
    label: "Onboarding Tối giản", icon: BookOpen, color: "#6b7280",
    desc: "Khóa hội nhập nhân viên mới, đơn giản gọn nhẹ",
    apply: { primaryColor: "#374151", accentColor: "#990803", style: "minimal", bgPattern: "none", fontFamily: "sans", hasSeal: false, hasQR: false, hasLogo: true, hasWatermark: false, dividerStyle: "line", signerLayout: "center-only", headerText: "GELEXIMCO", subHeaderText: "CERTIFICATE", category: "onboarding" },
  },
];

// ── Preview sample data sets ──
const PREVIEW_SAMPLES = [
  { name: "Nguyễn Văn A", course: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", score: 92, date: "15/01/2026", expiry: "15/01/2027", no: "GXC-LD-2026-00001" },
  { name: "Trần Thị Bích Ngọc", course: "An toàn Lao động trong Xây dựng & Khai khoáng", score: 85, date: "10/03/2026", expiry: "10/03/2027", no: "GXC-ATLD-2026-00042" },
  { name: "Phạm Minh Tuấn", course: "Phòng chống Rửa tiền (AML)", score: 95, date: "01/02/2026", expiry: "01/02/2027", no: "GXC-AML-2026-00015" },
  { name: "Lê Hoàng Vũ", course: "Onboarding - Chào mừng Thành viên mới", score: 100, date: "20/03/2026", expiry: "", no: "GXC-OB-2026-00234" },
];

// ── Main Component ──
export function CertTemplateManager() {
  const [templates, setTemplates] = useState<CertTemplate[]>(DEFAULT_TEMPLATES);
  const [showEditor, setShowEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<EditorTab>("general");
  const [previewSampleIdx, setPreviewSampleIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showPresetPanel, setShowPresetPanel] = useState(false);
  const [canvasMode, setCanvasMode] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  // Undo/Redo history
  const hist = useHistory(null);
  const editing = hist.current;

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!showEditor) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); hist.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) { e.preventDefault(); hist.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); hist.redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showEditor, hist.undo, hist.redo]);

  const sample = PREVIEW_SAMPLES[previewSampleIdx];

  const filtered = useMemo(() => {
    return templates.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.tags || []).some(tag => tag.includes(q));
      const matchCat = categoryFilter === "all" || (t.category || "general") === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [templates, searchQuery, categoryFilter]);

  const openEditor = (tpl: CertTemplate | null) => {
    const initial: CertTemplate = tpl ? { ...tpl } : {
      id: `T${Date.now()}`, name: "Phôi mới", description: "",
      primaryColor: "#990803", accentColor: "#c8a84e", style: "classic",
      hasQR: true, hasSeal: true, hasLogo: true, hasWatermark: false,
      bgPattern: "border",
      signer1Name: "Nguyễn Văn Minh", signer1Title: "Giám đốc Đào tạo",
      signer2Name: "Vũ Văn Tiền", signer2Title: "Chủ tịch Tập đoàn",
      headerText: "TẬP ĐOÀN GELEXIMCO", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO",
      footerNote: "Chứng chỉ có giá trị trong toàn Tập đoàn",
      isDefault: false, createdAt: new Date().toISOString().split("T")[0], usageCount: 0,
      orientation: "landscape", fontFamily: "serif", hasCornerOrnaments: true,
      hasDividerOrnament: true, dividerStyle: "ornate", showScore: true, showDates: true, showCertNo: true,
      completionLabel: "đã hoàn thành xuất sắc khóa đào tạo",
      signerLayout: "2-sides", category: "general", version: 1, tags: [],
    };
    hist.reset(initial);
    setEditorTab("general");
    setShowEditor(true);
    setShowPresetPanel(false);
    setCanvasMode(false);
  };

  const saveTemplate = () => {
    if (!editing) return;
    const updated = { ...editing, lastModified: new Date().toISOString().split("T")[0], version: (editing.version || 1) + (templates.find(t => t.id === editing.id) ? 1 : 0) };
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === updated.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = updated; return copy; }
      return [...prev, updated];
    });
    setShowEditor(false);
  };

  const confirm = useConfirm();
  const deleteTemplate = async (id: string) => {
    const tpl = templates.find(t => t.id === id);
    const ok = await confirm({
      title: "Xóa phôi chứng chỉ?",
      message: `Bạn có chắc muốn xóa phôi "${tpl?.name || ""}"? Các chứng chỉ đã cấp sẽ không bị ảnh hưởng.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      import("sonner").then(m => m.toast.success("Đã xóa phôi chứng chỉ"));
    }
  };

  const duplicateTemplate = (tpl: CertTemplate) => {
    const dup: CertTemplate = { ...tpl, id: `T${Date.now()}`, name: tpl.name + " (Bản sao)", isDefault: false, usageCount: 0, createdAt: new Date().toISOString().split("T")[0], version: 1 };
    setTemplates(prev => [...prev, dup]);
  };

  const setDefault = (id: string) => {
    setTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === id })));
  };

  const updateField = useCallback((field: string, value: any) => {
    if (!editing) return;
    hist.push({ ...editing, [field]: value } as CertTemplate);
  }, [editing, hist.push]);

  const applyPreset = useCallback((preset: Partial<CertTemplate>) => {
    if (!editing) return;
    hist.push({ ...editing, ...preset } as CertTemplate);
    setShowPresetPanel(false);
  }, [editing, hist.push]);

  const handleCanvasDragEnd = useCallback((target: DragTarget, x: number, y: number) => {
    if (!editing || !target) return;
    const fieldMap: Record<string, string> = {
      logo: "logoXY", qr: "qrXY", seal: "sealXY",
      header: "headerXY", subtitle: "subtitleXY",
      signer1: "signer1XY", signer2: "signer2XY", signer3: "signer3XY",
    };
    hist.push({ ...editing, [fieldMap[target]]: { x, y } } as CertTemplate);
  }, [editing, hist.push]);

  // ════════════════════════════════════════
  // ── EDITOR VIEW ──
  // ════════════════════════════════════════
  if (showEditor && editing) {
    const isNew = !templates.find(t => t.id === editing.id);

    return (
      <div className="space-y-4">
        {/* Editor header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button onClick={() => { setShowEditor(false); }} className="p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>
                {isNew ? "Tạo Phôi Chứng chỉ mới" : `Chỉnh sửa: ${editing.name}`}
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                Mọi thay đổi hiển thị trực tiếp trên preview • v{editing.version || 1}
                {editing.lastModified && ` • Sửa lần cuối: ${editing.lastModified}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* Undo/Redo */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <button onClick={hist.undo} disabled={!hist.canUndo} title="Undo (Ctrl+Z)"
                className={`p-2 rounded-md transition-colors cursor-pointer ${hist.canUndo ? "hover:bg-card text-foreground" : "text-gray-300 cursor-not-allowed"}`}>
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={hist.redo} disabled={!hist.canRedo} title="Redo (Ctrl+Shift+Z)"
                className={`p-2 rounded-md transition-colors cursor-pointer ${hist.canRedo ? "hover:bg-card text-foreground" : "text-gray-300 cursor-not-allowed"}`}>
                <Redo2 className="w-4 h-4" />
              </button>
              <span className="px-1.5 text-muted-foreground" style={{ fontSize: "9px" }}>{hist.currentIndex + 1}/{hist.historyLength}</span>
            </div>
            {/* Canvas mode toggle + snap controls */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5 gap-0.5">
              <button onClick={() => setCanvasMode(!canvasMode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${canvasMode ? "bg-blue-500 text-white" : "text-muted-foreground hover:bg-card"}`}
                style={{ fontSize: "11px", fontWeight: canvasMode ? 600 : 400 }}>
                <Move className="w-3.5 h-3.5" /> Canvas
              </button>
              {canvasMode && (
                <>
                  <button onClick={() => setSnapEnabled(!snapEnabled)} title="Snap to grid & alignment"
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${snapEnabled ? "bg-green-500 text-white" : "text-muted-foreground hover:bg-card"}`}
                    style={{ fontSize: "10px", fontWeight: 600 }}>
                    <Grid3X3 className="w-3 h-3" /> Snap
                  </button>
                  <button onClick={() => setShowGrid(!showGrid)} title="Show grid overlay"
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors cursor-pointer ${showGrid ? "bg-gray-600 text-white" : "text-muted-foreground hover:bg-card"}`}
                    style={{ fontSize: "10px", fontWeight: 600 }}>
                    Grid
                  </button>
                </>
              )}
            </div>
            <button onClick={() => setShowPresetPanel(!showPresetPanel)} className="flex items-center gap-1.5 px-3 py-2 bg-[#c8a84e]/10 text-[#c8a84e] rounded-lg hover:bg-[#c8a84e]/20 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Zap className="w-3.5 h-3.5" /> Smart Preset
            </button>
            <button onClick={() => { setShowEditor(false); }} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={saveTemplate} className="px-5 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
              {isNew ? "Tạo phôi" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Smart Preset Panel */}
        {showPresetPanel && (
          <div className="bg-gradient-to-r from-[#c8a84e]/5 to-[#990803]/5 rounded-xl border border-[#c8a84e]/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#c8a84e]" />
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>Smart Presets — Áp dụng nhanh cho đơn vị</h4>
              <button onClick={() => setShowPresetPanel(false)} className="ml-auto p-1 hover:bg-secondary rounded cursor-pointer"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {SMART_PRESETS.map((preset, i) => {
                const Icon = preset.icon;
                return (
                  <button key={i} onClick={() => applyPreset(preset.apply)}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:border-[#c8a84e]/40 hover:shadow-md transition-all cursor-pointer text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${preset.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: preset.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{preset.label}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{preset.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Editor tabs + controls (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Tab bar */}
            <div className="flex gap-1 overflow-x-auto bg-secondary/30 rounded-xl p-1 border border-border" style={{ scrollbarWidth: "none" }}>
              {EDITOR_TABS.map(tab => {
                const isActive = editorTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setEditorTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${isActive ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
                    style={{ fontSize: "11px", fontWeight: isActive ? 600 : 400 }}>
                    <Icon className="w-3.5 h-3.5" style={isActive ? { color: "#990803" } : {}} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1 space-y-3">

              {/* ── GENERAL ── */}
              {editorTab === "general" && (
                <>
                  <Section title="Thông tin cơ bản" icon={Settings}>
                    <Field label="Tên phôi *">
                      <input type="text" value={editing.name} onChange={e => updateField("name", e.target.value)}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
                    </Field>
                    <Field label="Mô tả">
                      <textarea value={editing.description} onChange={e => updateField("description", e.target.value)} rows={2}
                        className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none resize-none" style={{ fontSize: "12px" }} />
                    </Field>
                    <Field label="Danh mục">
                      <select value={editing.category || "general"} onChange={e => updateField("category", e.target.value)}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                        {[
                          { v: "general", l: "Chung - Tập đoàn" }, { v: "banking", l: "Ngân hàng" }, { v: "energy", l: "Năng lượng" },
                          { v: "construction", l: "Xây dựng & BĐS" }, { v: "mining", l: "Khoáng sản" }, { v: "insurance", l: "Bảo hiểm" },
                          { v: "onboarding", l: "Onboarding" }, { v: "compliance", l: "Compliance & ISO" },
                        ].map(opt => <option key={opt.v} value={opt.v}>{opt.l}</option>)}
                      </select>
                    </Field>
                    <Field label="Tags (phân cách bằng dấu phẩy)">
                      <input type="text" value={(editing.tags || []).join(", ")} onChange={e => updateField("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        placeholder="VD: chính thức, tập đoàn, lãnh đạo"
                        className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
                    </Field>
                  </Section>
                  <Section title="Kiểu thiết kế" icon={Palette}>
                    <div className="grid grid-cols-2 gap-2">
                      {(["classic", "modern", "elegant", "minimal"] as const).map(style => (
                        <button key={style} onClick={() => updateField("style", style)}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${editing.style === style ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-border hover:border-gray-300"}`}>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: editing.style === style ? 600 : 400 }}>
                            {style === "classic" ? "Truyền thống" : style === "modern" ? "Hiện đại" : style === "elegant" ? "Sang trọng" : "Tối giản"}
                          </p>
                          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "9px" }}>
                            {style === "classic" ? "Viền vàng, seal, trang trọng" : style === "modern" ? "Gradient, gọn gàng" : style === "elegant" ? "Hoa văn tinh tế" : "Không viền, đơn giản"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ── LAYOUT ── */}
              {editorTab === "layout" && (
                <>
                  <Section title="Hướng giấy" icon={Layout}>
                    <div className="grid grid-cols-2 gap-3">
                      {(["landscape", "portrait"] as const).map(orient => (
                        <button key={orient} onClick={() => updateField("orientation", orient)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-center ${(editing.orientation || "landscape") === orient ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-border hover:border-gray-300"}`}>
                          <div className={`mx-auto border-2 rounded ${orient === "landscape" ? "w-16 h-11" : "w-11 h-16"}`}
                            style={{ borderColor: (editing.orientation || "landscape") === orient ? "#990803" : "#d1d5db" }} />
                          <p className="text-foreground mt-2" style={{ fontSize: "12px", fontWeight: (editing.orientation || "landscape") === orient ? 600 : 400 }}>
                            {orient === "landscape" ? "Ngang (Landscape)" : "Dọc (Portrait)"}
                          </p>
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Vị trí thành phần" icon={Grid3X3}>
                    <Field label="Vị trí Logo">
                      <div className="grid grid-cols-3 gap-2">
                        {(["top-left", "top-center", "top-right"] as const).map(pos => (
                          <button key={pos} onClick={() => updateField("logoPosition", pos)}
                            className={`py-2 rounded-lg border-2 transition-all cursor-pointer ${(editing.logoPosition || "top-center") === pos ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-gray-300"}`}
                            style={{ fontSize: "11px", fontWeight: (editing.logoPosition || "top-center") === pos ? 600 : 400 }}>
                            {pos === "top-left" ? "Trái" : pos === "top-center" ? "Giữa" : "Phải"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Vị trí QR Code">
                      <div className="grid grid-cols-3 gap-2">
                        {(["bottom-right", "bottom-left", "top-right"] as const).map(pos => (
                          <button key={pos} onClick={() => updateField("qrPosition", pos)}
                            className={`py-2 rounded-lg border-2 transition-all cursor-pointer ${(editing.qrPosition || "bottom-right") === pos ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-gray-300"}`}
                            style={{ fontSize: "11px", fontWeight: (editing.qrPosition || "bottom-right") === pos ? 600 : 400 }}>
                            {pos === "bottom-right" ? "Dưới phải" : pos === "bottom-left" ? "Dưới trái" : "Trên phải"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Vị trí Con dấu (Seal)">
                      <div className="grid grid-cols-2 gap-2">
                        {(["between-signers", "center", "left", "right"] as const).map(pos => (
                          <button key={pos} onClick={() => updateField("sealPosition", pos)}
                            className={`py-2 rounded-lg border-2 transition-all cursor-pointer ${(editing.sealPosition || "between-signers") === pos ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-gray-300"}`}
                            style={{ fontSize: "10px", fontWeight: (editing.sealPosition || "between-signers") === pos ? 600 : 400 }}>
                            {pos === "between-signers" ? "Giữa 2 CK" : pos === "center" ? "Giữa" : pos === "left" ? "Trái" : "Phải"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <SliderField label="Kích thước Logo" value={editing.logoSize || 28} min={16} max={50}
                      onChange={v => updateField("logoSize", v)} unit="px" />
                    <SliderField label="Kích thước QR" value={editing.qrSize || 22} min={16} max={40}
                      onChange={v => updateField("qrSize", v)} unit="px" />
                    <SliderField label="Kích thước Seal" value={editing.sealSize || 28} min={16} max={45}
                      onChange={v => updateField("sealSize", v)} unit="px" />
                    {/* Custom drag positions */}
                    {(editing.logoXY || editing.qrXY || editing.sealXY || editing.headerXY || editing.subtitleXY || editing.signer1XY || editing.signer2XY) && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Move className="w-3.5 h-3.5 text-blue-500" />
                          <p className="text-blue-700" style={{ fontSize: "11px", fontWeight: 600 }}>Vị trí tùy chỉnh (Canvas drag)</p>
                        </div>
                        <div className="space-y-1.5">
                          {([
                            { key: "logoXY" as const, label: "Logo" },
                            { key: "qrXY" as const, label: "QR" },
                            { key: "sealXY" as const, label: "Seal" },
                            { key: "headerXY" as const, label: "Header" },
                            { key: "subtitleXY" as const, label: "Title" },
                            { key: "signer1XY" as const, label: "CK1" },
                            { key: "signer2XY" as const, label: "CK2" },
                            { key: "signer3XY" as const, label: "CK3" },
                          ]).filter(item => editing[item.key]).map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                              <span className="text-blue-600" style={{ fontSize: "10px" }}>{item.label}: ({(editing[item.key] as any).x}, {(editing[item.key] as any).y})</span>
                              <button onClick={() => { const n = { ...editing }; delete (n as any)[item.key]; hist.push(n); }} className="text-blue-400 hover:text-blue-600 cursor-pointer" style={{ fontSize: "9px" }}>Reset</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Section>
                </>
              )}

              {/* ── TYPOGRAPHY ── */}
              {editorTab === "typography" && (
                <Section title="Kiểu chữ & Kích thước" icon={Type}>
                  <Field label="Font chữ">
                    <div className="grid grid-cols-1 gap-2">
                      {([
                        { v: "serif", l: "Serif (Cổ điển)", sample: "Georgia, Times New Roman" },
                        { v: "sans", l: "Sans-serif (Hiện đại)", sample: "Segoe UI, Helvetica" },
                        { v: "display", l: "Display (Trang trọng)", sample: "Palatino, Georgia" },
                        { v: "mono", l: "Monospace (Kỹ thuật)", sample: "Courier New, Consolas" },
                        { v: "handwriting", l: "Handwriting (Chữ viết tay)", sample: "Brush Script" },
                      ] as const).map(font => (
                        <button key={font.v} onClick={() => updateField("fontFamily", font.v)}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${(editing.fontFamily || "serif") === font.v ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-border hover:border-gray-300"}`}>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: (editing.fontFamily || "serif") === font.v ? 600 : 400 }}>{font.l}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{font.sample}</p>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <SliderField label="Cỡ tiêu đề chính" value={editing.titleSize || 26} min={18} max={36}
                    onChange={v => updateField("titleSize", v)} unit="px" />
                  <SliderField label="Cỡ tiêu đề phụ" value={editing.subtitleSize || 13} min={9} max={18}
                    onChange={v => updateField("subtitleSize", v)} unit="px" />
                  <SliderField label="Cỡ tên học viên" value={editing.nameSize || 26} min={18} max={36}
                    onChange={v => updateField("nameSize", v)} unit="px" />
                  <SliderField label="Cỡ nội dung" value={editing.bodySize || 11} min={8} max={16}
                    onChange={v => updateField("bodySize", v)} unit="px" />
                  <SliderField label="Khoảng cách chữ tiêu đề" value={editing.letterSpacing ?? 4} min={0} max={12}
                    onChange={v => updateField("letterSpacing", v)} unit="px" />
                </Section>
              )}

              {/* ── COLORS ── */}
              {editorTab === "colors" && (
                <>
                  <Section title="Bảng màu" icon={Palette}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Màu chính (Primary)">
                        <div className="flex items-center gap-2">
                          <input type="color" value={editing.primaryColor} onChange={e => updateField("primaryColor", e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                          <input type="text" value={editing.primaryColor} onChange={e => updateField("primaryColor", e.target.value)}
                            className="flex-1 px-2 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none font-mono" style={{ fontSize: "12px" }} />
                        </div>
                      </Field>
                      <Field label="Màu nhấn (Accent)">
                        <div className="flex items-center gap-2">
                          <input type="color" value={editing.accentColor} onChange={e => updateField("accentColor", e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0" />
                          <input type="text" value={editing.accentColor} onChange={e => updateField("accentColor", e.target.value)}
                            className="flex-1 px-2 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none font-mono" style={{ fontSize: "12px" }} />
                        </div>
                      </Field>
                    </div>
                  </Section>
                  <Section title="Preset màu nhanh" icon={Sparkles}>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { pc: "#990803", ac: "#c8a84e", l: "Geleximco" },
                        { pc: "#1e293b", ac: "#3b82f6", l: "Blue Modern" },
                        { pc: "#1a1a2e", ac: "#c8a84e", l: "Dark Gold" },
                        { pc: "#374151", ac: "#990803", l: "Neutral Red" },
                        { pc: "#0f766e", ac: "#fbbf24", l: "Teal Gold" },
                        { pc: "#4c1d95", ac: "#7c3aed", l: "Royal Purple" },
                        { pc: "#92400e", ac: "#f59e0b", l: "Amber Warm" },
                        { pc: "#0c4a6e", ac: "#0ea5e9", l: "Sky Blue" },
                        { pc: "#14532d", ac: "#22c55e", l: "Emerald" },
                      ].map((p, i) => (
                        <button key={i} onClick={() => { updateField("primaryColor", p.pc); updateField("accentColor", p.ac); }}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-border hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer">
                          <div className="flex gap-1">
                            <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: p.pc }} />
                            <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: p.ac }} />
                          </div>
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{p.l}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ── BACKGROUND ── */}
              {editorTab === "background" && (
                <>
                  <Section title="Hoa văn nền" icon={Image}>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { v: "border", l: "Viền khung", d: "Viền vàng + hoa góc" },
                        { v: "gradient", l: "Gradient", d: "Nền chuyển màu tinh tế" },
                        { v: "ornate", l: "Hoa văn", d: "Viền ornate cổ điển" },
                        { v: "none", l: "Không", d: "Nền trắng thuần" },
                      ] as const).map(bg => (
                        <button key={bg.v} onClick={() => updateField("bgPattern", bg.v)}
                          className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${editing.bgPattern === bg.v ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-border hover:border-gray-300"}`}>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: editing.bgPattern === bg.v ? 600 : 400 }}>{bg.l}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{bg.d}</p>
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Đường phân cách" icon={Minus}>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { v: "ornate", l: "Ornate" }, { v: "line", l: "Đường thẳng" }, { v: "dots", l: "Chấm" },
                        { v: "diamond", l: "Kim cương" }, { v: "laurel", l: "Vòng nguyệt" },
                      ] as const).map(dv => (
                        <button key={dv.v} onClick={() => updateField("dividerStyle", dv.v)}
                          className={`py-2 rounded-lg border-2 transition-all cursor-pointer ${(editing.dividerStyle || "ornate") === dv.v ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-gray-300"}`}
                          style={{ fontSize: "11px", fontWeight: (editing.dividerStyle || "ornate") === dv.v ? 600 : 400 }}>
                          {dv.l}
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Trang trí bổ sung" icon={Sparkles}>
                    {[
                      { k: "hasCornerOrnaments", l: "Hoa góc (Corner Ornaments)", d: "Họa tiết trang trí 4 góc" },
                      { k: "hasTopBar", l: "Thanh màu trên (Top Bar)", d: "Dải màu nhấn ở đầu trang" },
                      { k: "hasBottomBar", l: "Thanh màu dưới (Bottom Bar)", d: "Dải màu nhấn ở chân trang" },
                    ].map(item => (
                      <ToggleRow key={item.k} checked={(editing as any)[item.k] || false}
                        onChange={v => updateField(item.k, v)} label={item.l} desc={item.d} />
                    ))}
                    {editing.hasTopBar && (
                      <SliderField label="Chiều cao Top/Bottom Bar" value={editing.topBarHeight || 6} min={2} max={16}
                        onChange={v => updateField("topBarHeight", v)} unit="px" />
                    )}
                    <SliderField label="Độ đậm viền" value={editing.borderThickness || 3} min={1} max={6}
                      onChange={v => updateField("borderThickness", v)} unit="px" />
                  </Section>
                </>
              )}

              {/* ── ELEMENTS ── */}
              {editorTab === "elements" && (
                <>
                  <Section title="Thành phần chứng chỉ" icon={Layers}>
                    {[
                      { k: "hasLogo", l: "Logo Geleximco", d: "Biểu tượng 'G' phía trên tiêu đề", i: Award },
                      { k: "hasSeal", l: "Con dấu (Seal)", d: "Seal chính thống giữa khu vực chữ ký", i: Shield },
                      { k: "hasQR", l: "QR Code xác thực", d: "Mã QR để xác thực tính hợp lệ", i: Hash },
                      { k: "hasWatermark", l: "Watermark GELEXIMCO", d: "Chữ 'GELEXIMCO' mờ xoay 30° làm nền", i: Eye },
                    ].map(item => {
                      const Icon = item.i;
                      return (
                        <div key={item.k} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${(editing as any)[item.k] ? "border-[#990803]/20 bg-[#990803]/3" : "border-border"}`}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (editing as any)[item.k] ? "#99080310" : "#f3f4f6" }}>
                            <Icon className="w-4 h-4" style={{ color: (editing as any)[item.k] ? "#990803" : "#9ca3af" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{item.l}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.d}</p>
                          </div>
                          <button onClick={() => updateField(item.k, !(editing as any)[item.k])} className="cursor-pointer shrink-0">
                            {(editing as any)[item.k]
                              ? <ToggleRight className="w-8 h-5 text-[#990803]" />
                              : <ToggleLeft className="w-8 h-5 text-gray-300" />}
                          </button>
                        </div>
                      );
                    })}
                  </Section>
                  <Section title="Ribbon (Dải trang trí)" icon={Tag}>
                    <ToggleRow checked={editing.hasRibbon || false} onChange={v => updateField("hasRibbon", v)}
                      label="Hiện Ribbon" desc="Dải ribbon góc phải trên với text tùy chỉnh" />
                    {editing.hasRibbon && (
                      <Field label="Nội dung Ribbon">
                        <input type="text" value={editing.ribbonText || ""} onChange={e => updateField("ribbonText", e.target.value)}
                          placeholder="VD: EXCELLENCE, CERTIFIED, PREMIUM..."
                          className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
                      </Field>
                    )}
                  </Section>
                </>
              )}

              {/* ── CONTENT ── */}
              {editorTab === "content" && (
                <>
                  <Section title="Tiêu đề & Phụ đề" icon={FileText}>
                    <Field label="Tiêu đề chính (Header)">
                      <input type="text" value={editing.headerText} onChange={e => updateField("headerText", e.target.value)}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
                    </Field>
                    <Field label="Tiêu đề phụ (Sub-header)">
                      <input type="text" value={editing.subHeaderText} onChange={e => updateField("subHeaderText", e.target.value)}
                        className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
                    </Field>
                    <Field label="Mẫu câu chứng nhận">
                      <input type="text" value={editing.completionLabel || ""} onChange={e => updateField("completionLabel", e.target.value)}
                        placeholder="đã hoàn thành xuất sắc khóa đào tạo"
                        className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {["đã hoàn thành xuất sắc khóa đào tạo", "has successfully completed", "đã hoàn thành chương trình", "đã vượt qua kỳ thi chứng nhận"].map(txt => (
                          <button key={txt} onClick={() => updateField("completionLabel", txt)}
                            className="px-2 py-0.5 bg-secondary rounded text-muted-foreground hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "9px" }}>
                            {txt.length > 30 ? txt.slice(0, 30) + "..." : txt}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Ghi chú cuối trang (Footer)">
                      <input type="text" value={editing.footerNote} onChange={e => updateField("footerNote", e.target.value)}
                        className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
                    </Field>
                  </Section>
                  <Section title="Hiển thị thông tin" icon={Eye}>
                    {[
                      { k: "showScore", l: "Điểm số", d: "Hiển thị kết quả đạt được" },
                      { k: "showDates", l: "Ngày cấp & Hiệu lực", d: "Ngày cấp, ngày hết hạn" },
                      { k: "showCertNo", l: "Số chứng chỉ", d: "Mã số chứng chỉ (GXC-xxx)" },
                    ].map(item => (
                      <ToggleRow key={item.k} checked={(editing as any)[item.k] ?? true}
                        onChange={v => updateField(item.k, v)} label={item.l} desc={item.d} />
                    ))}
                  </Section>
                </>
              )}

              {/* ── SIGNERS ── */}
              {editorTab === "signers" && (
                <>
                  <Section title="Bố cục chữ ký" icon={Users}>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { v: "2-sides", l: "2 bên", d: "Trái + Phải" },
                        { v: "3-across", l: "3 cột", d: "3 người ký" },
                        { v: "center-only", l: "Giữa", d: "1 người ký" },
                      ] as const).map(opt => (
                        <button key={opt.v} onClick={() => updateField("signerLayout", opt.v)}
                          className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${(editing.signerLayout || "2-sides") === opt.v ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-border hover:border-gray-300"}`}>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: (editing.signerLayout || "2-sides") === opt.v ? 600 : 400 }}>{opt.l}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{opt.d}</p>
                        </button>
                      ))}
                    </div>
                  </Section>
                  <Section title="Người ký 1" icon={PenTool}>
                    <Field label="Họ tên"><input type="text" value={editing.signer1Name} onChange={e => updateField("signer1Name", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                    <Field label="Chức danh"><input type="text" value={editing.signer1Title} onChange={e => updateField("signer1Title", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                  </Section>
                  {(editing.signerLayout || "2-sides") !== "center-only" && (
                    <Section title="Người ký 2" icon={PenTool}>
                      <Field label="Họ tên"><input type="text" value={editing.signer2Name} onChange={e => updateField("signer2Name", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                      <Field label="Chức danh"><input type="text" value={editing.signer2Title} onChange={e => updateField("signer2Title", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                    </Section>
                  )}
                  {(editing.signerLayout || "2-sides") === "3-across" && (
                    <Section title="Người ký 3" icon={PenTool}>
                      <Field label="Họ tên"><input type="text" value={editing.signer3Name || ""} onChange={e => updateField("signer3Name", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                      <Field label="Chức danh"><input type="text" value={editing.signer3Title || ""} onChange={e => updateField("signer3Title", e.target.value)} className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} /></Field>
                    </Section>
                  )}
                </>
              )}

              {/* ── ADVANCED ── */}
              {editorTab === "advanced" && (
                <>
                  <Section title="Xuất & Import cấu hình" icon={FileText}>
                    <div className="flex gap-2">
                      <button onClick={() => { copyToClipboard(JSON.stringify(editing, null, 2)); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                        <Copy className="w-3.5 h-3.5" /> Copy JSON
                      </button>
                      <button onClick={() => { import("sonner").then(m => m.toast.info("Đang nhập cấu hình template từ JSON...")); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                        <FileText className="w-3.5 h-3.5" /> Import JSON
                      </button>
                    </div>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: "9px" }}>
                      Sao chép cấu hình JSON để chia sẻ hoặc sao lưu mẫu phôi
                    </p>
                  </Section>
                  <Section title="Thông tin phiên bản" icon={RotateCw}>
                    <div className="space-y-2">
                      {[
                        { l: "ID", v: editing.id },
                        { l: "Phiên bản", v: `v${editing.version || 1}` },
                        { l: "Tạo lúc", v: editing.createdAt },
                        { l: "Sửa lần cuối", v: editing.lastModified || "—" },
                        { l: "Số lần sử dụng", v: `${editing.usageCount}` },
                      ].map(info => (
                        <div key={info.l} className="flex items-center justify-between">
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{info.l}</span>
                          <span className="text-foreground font-mono" style={{ fontSize: "11px", fontWeight: 500 }}>{info.v}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* Right: Live Preview (7 cols) */}
          <div className="lg:col-span-7">
            <div className="sticky top-0 space-y-3">
              <div className={`rounded-2xl border p-5 transition-colors ${canvasMode ? "bg-blue-50/30 border-blue-200" : "bg-secondary/30 border-border"}`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {canvasMode ? "🎯 Canvas — Drag Logo, QR, Seal, Header, Title, CK" : "Preview trực tiếp"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" style={{ background: editing.primaryColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" style={{ background: editing.accentColor }} />
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                        {editing.style} • {editing.fontFamily || "serif"} • {(editing.orientation || "landscape") === "portrait" ? "Dọc" : "Ngang"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 items-center">
                    {/* Reset positions */}
                    {canvasMode && (editing.logoXY || editing.qrXY || editing.sealXY || editing.headerXY || editing.subtitleXY || editing.signer1XY || editing.signer2XY || editing.signer3XY) && (
                      <button onClick={() => {
                        if (!editing) return;
                        const reset = { ...editing };
                        delete reset.logoXY; delete reset.qrXY; delete reset.sealXY;
                        delete reset.headerXY; delete reset.subtitleXY;
                        delete reset.signer1XY; delete reset.signer2XY; delete reset.signer3XY;
                        hist.push(reset);
                      }} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-center cursor-pointer hover:bg-blue-200 transition-colors" style={{ fontSize: "9px", fontWeight: 600 }}>
                        Reset tất cả
                      </button>
                    )}
                    {/* Sample data switcher */}
                    {PREVIEW_SAMPLES.map((_, i) => (
                      <button key={i} onClick={() => setPreviewSampleIdx(i)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${previewSampleIdx === i ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                        style={{ fontSize: "9px", fontWeight: 700 }}>{i + 1}</button>
                    ))}
                  </div>
                </div>
                <InteractiveCertCanvas
                  template={editing}
                  studentName={sample.name}
                  courseName={sample.course}
                  score={sample.score}
                  issuedDate={sample.date}
                  expiryDate={sample.expiry}
                  certNo={sample.no}
                  canvasMode={canvasMode}
                  snapEnabled={snapEnabled}
                  showGrid={showGrid}
                  onDragEnd={handleCanvasDragEnd}
                />
                {/* Canvas hint */}
                {canvasMode && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                    <Move className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <p className="text-blue-700" style={{ fontSize: "10px" }}>
                      Kéo thả <strong>Logo, QR, Seal, Header, Title, Chữ ký</strong> trực tiếp.
                      {snapEnabled ? " Snap đang BẬT (xanh lá = đã snap)." : ""}
                      {" "}Undo: <kbd className="px-1 py-0.5 bg-white rounded text-blue-600" style={{ fontSize: "9px" }}>Ctrl+Z</kbd>
                    </p>
                  </div>
                )}
              </div>
              {/* Current sample info */}
              <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: 500 }}>Dữ liệu mẫu #{previewSampleIdx + 1}: {sample.name}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{sample.course} • {sample.score}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  // ── TEMPLATE GRID/LIST ──
  // ════════════════════════════════════════
  const categories = [
    { v: "all", l: "Tất cả" }, { v: "general", l: "Tập đoàn" }, { v: "banking", l: "Ngân hàng" },
    { v: "energy", l: "Năng lượng" }, { v: "construction", l: "Xây dựng" }, { v: "mining", l: "Khoáng sản" },
    { v: "insurance", l: "Bảo hiểm" }, { v: "onboarding", l: "Onboarding" }, { v: "compliance", l: "Compliance" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5 text-[#990803]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>Quản lý Phôi Chứng chỉ</h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
              Thiết kế phôi thông minh: Bố cục, Typography, Màu sắc, Hoa văn, Trang trí, Chữ ký đa người, Smart Presets theo đơn vị.
              Hiện có <strong>{templates.length}</strong> mẫu phôi.
            </p>
          </div>
          <button onClick={() => openEditor(null)} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer shrink-0" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Tạo phôi mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, tag..."
            className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
        </div>
        <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categories.map(cat => (
            <button key={cat.v} onClick={() => setCategoryFilter(cat.v)}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${categoryFilter === cat.v ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
              style={{ fontSize: "11px", fontWeight: categoryFilter === cat.v ? 600 : 400 }}>
              {cat.l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.map(tpl => (
          <div key={tpl.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group">
            <div className="p-4 bg-secondary/20">
              <CertMiniPreview template={tpl} />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-foreground flex-1 truncate" style={{ fontSize: "14px", fontWeight: 600 }}>{tpl.name}</h4>
                {tpl.isDefault && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#c8a84e]/10 text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>
                    <Star className="w-2.5 h-2.5" /> Mặc định
                  </span>
                )}
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{tpl.description}</p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: tpl.primaryColor }} />
                  <div className="w-3 h-3 rounded-full border border-gray-200" style={{ background: tpl.accentColor }} />
                </div>
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                  {tpl.style === "classic" ? "Truyền thống" : tpl.style === "modern" ? "Hiện đại" : tpl.style === "elegant" ? "Sang trọng" : "Tối giản"}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>&bull; {tpl.usageCount} lần dùng</span>
                {tpl.version && tpl.version > 1 && (
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>&bull; v{tpl.version}</span>
                )}
              </div>

              {/* Feature badges */}
              <div className="flex gap-1.5 flex-wrap">
                {tpl.hasLogo && <Badge>Logo</Badge>}
                {tpl.hasSeal && <Badge>Seal</Badge>}
                {tpl.hasQR && <Badge>QR</Badge>}
                {tpl.hasWatermark && <Badge>Watermark</Badge>}
                {tpl.hasRibbon && <Badge>Ribbon</Badge>}
                {tpl.hasCornerOrnaments && <Badge>Hoa góc</Badge>}
                {(tpl.orientation || "landscape") === "portrait" && <Badge>Dọc</Badge>}
              </div>

              {/* Tags */}
              {tpl.tags && tpl.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-[#990803]/5 text-[#990803]" style={{ fontSize: "9px" }}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                <button onClick={() => openEditor(tpl)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                  <Edit3 className="w-3 h-3 text-muted-foreground" /> Sửa
                </button>
                <button onClick={() => duplicateTemplate(tpl)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                  <Copy className="w-3 h-3 text-muted-foreground" /> Sao chép
                </button>
                {!tpl.isDefault && (
                  <>
                    <button onClick={() => setDefault(tpl.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-[#c8a84e]/10 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                      <Star className="w-3 h-3 text-[#c8a84e]" /> Mặc định
                    </button>
                    <button onClick={() => deleteTemplate(tpl.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button onClick={() => openEditor(null)} className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 py-16 hover:border-[#990803]/30 hover:bg-[#990803]/3 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-[#990803]/10 transition-colors">
            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-[#990803]" />
          </div>
          <div className="text-center">
            <p className="text-muted-foreground group-hover:text-[#990803]" style={{ fontSize: "13px", fontWeight: 600 }}>Tạo phôi mới</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Smart Presets + Editor toàn diện</p>
          </div>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// ── Helper Components ──
// ════════════════════════════════════════
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#990803]" />
        <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "9px", fontWeight: 500 }}>
      {children}
    </span>
  );
}

function ToggleRow({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="relative shrink-0">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-10 h-[22px] rounded-full transition-colors ${checked ? "bg-[#990803]" : "bg-gray-300"}`}>
          <div className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </div>
      <div>
        <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{label}</p>
        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{desc}</p>
      </div>
    </label>
  );
}

function SliderField({ label, value, min, max, onChange, unit }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{label}</span>
        <div className="flex items-center gap-1.5">
          <input type="number" value={value} onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-14 px-1.5 py-1 bg-input-background rounded border-0 text-center focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px", fontWeight: 600 }} />
          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#990803]"
        style={{ background: `linear-gradient(to right, #990803 ${pct}%, #e5e7eb ${pct}%)` }} />
    </div>
  );
}
