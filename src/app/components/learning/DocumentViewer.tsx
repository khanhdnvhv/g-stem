import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText, Search, ZoomIn, ZoomOut, Highlighter, Bookmark,
  BookmarkCheck, MessageSquare, MessageSquarePlus, Printer, Download,
  PanelLeft, X, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast,
  ArrowUp, ArrowDown, Eye, Send, Trash2, Plus, CornerDownRight,
  Reply, FileSpreadsheet, FileDown, Quote, Type,
} from "lucide-react";
import type { Lesson } from "./types";

/* ─── Types for Document Viewer ─── */
type DocAnnotation = { id: string; page: number; paraIdx: number; text: string; selectedText?: string; author: string; initials: string; time: string; color: "yellow" | "blue" | "red" | "green"; replies: { id: string; author: string; initials: string; text: string; time: string }[] };
type DocBookmark = { page: number; label: string; createdAt: string };

/* ─── Document Viewer (Enhanced) ─── */
export function DocumentViewer({ lesson, onContentReady }: { lesson: Lesson; onContentReady?: (ready: boolean) => void }) {
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
    { id: "a3", page: 3, paraIdx: 0, selectedText: "thiết lập KPI, OKR và các hệ thống đo lường hiệu suất", text: "KPI/OKR nên được tích hợp trực tiếp vào dashboard LMS để tracking realtime thay vì review hàng quý.", author: "Phạm Đức Thắng", initials: "PĐ", time: "10:45, 07/03/2026", color: "red", replies: [
      { id: "r3a", author: "Nguyễn Văn Minh", initials: "NM", text: "Module OKR tracking đang được phát triển, dự kiến Q2/2026.", time: "11:30, 07/03/2026" },
      { id: "r3b", author: "Trần Thị Hoa", initials: "TH", text: "Cần thêm tính năng alert khi KPI dưới ngưỡng.", time: "13:00, 07/03/2026" }
    ] },
    { id: "a4", page: 4, paraIdx: 2, selectedText: "200 cặp mentor-mentee xuyên đơn vị", text: "Chương trình Mentoring rất hiệu quả! Đề xuất mở rộng cho cấp Chuyên viên chính.", author: "Vũ Thị Mai", initials: "VM", time: "16:00, 08/03/2026", color: "green", replies: [] },
    { id: "a5", page: 9, paraIdx: 0, text: "Đánh giá 360 cần đảm bảo tính ẩn danh. Một số đơn vị phản ánh nhân sự ngại đánh giá cấp trên.", author: "Đỗ Qu���c Hùng", initials: "QH", time: "09:00, 09/03/2026", color: "red", replies: [
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
      if (!showSelAnnotInput) setTextSelection(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length < 2) return;

    const anchorNode = selection.anchorNode;
    if (!anchorNode || !docContentRef.current) return;

    let el: HTMLElement | null = anchorNode.nodeType === 3 ? anchorNode.parentElement : anchorNode as HTMLElement;
    let paraIdx = -1;
    while (el && el !== docContentRef.current) {
      const idx = el.getAttribute?.("data-para-idx");
      if (idx !== null && idx !== undefined) { paraIdx = parseInt(idx, 10); break; }
      el = el.parentElement;
    }
    if (paraIdx === -1) return;

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

  /* ── Content ready tracking ── */
  useEffect(() => {
    if (onContentReady && readPages.size >= Math.ceil(totalPages * 0.8)) {
      onContentReady(true);
    }
  }, [readPages.size, onContentReady]);

  /* ── Fit modes ── */
  const applyFit = (mode: "width" | "page" | "custom") => {
    setFitMode(mode);
    if (mode === "width") setZoom(115);
    else if (mode === "page") setZoom(85);
  };

  /* ── Annotation helpers ── */
  const pageAnnotations = annotations.filter((a) => a.page === currentPage);
  const totalAnnotations = annotations.length;
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
    const annoSelections = paraIdx !== undefined ? pageAnnotations.filter((a) => a.paraIdx === paraIdx && a.selectedText).map((a) => ({
      text: a.selectedText!, color: a.color === "yellow" ? "bg-yellow-100/80 underline decoration-yellow-400 decoration-wavy decoration-1" : a.color === "blue" ? "bg-blue-100/80 underline decoration-blue-400 decoration-wavy decoration-1" : a.color === "red" ? "bg-red-100/80 underline decoration-red-400 decoration-wavy decoration-1" : "bg-green-100/80 underline decoration-green-400 decoration-wavy decoration-1"
    })) : [];
    const hasAnnoSel = annoSelections.length > 0;
    if (!highlightsOn && !searchQ && !hasAnnoSel) return text;
    let parts: { text: string; highlight?: string }[] = [{ text }];
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
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showThumbnails ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => setShowThumbnails(!showThumbnails)} title="Bảng mục lục">
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-gray-700 hidden sm:inline truncate max-w-[200px]" style={{ fontSize: "13px", fontWeight: 500 }}>{lesson.title.replace("Tài liệu: ", "")}</span>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>PDF &bull; 2.4 MB</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${showSearch ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100); }} title="Tìm kiếm (Ctrl+F)">
            <Search className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.max(50, z - 25)); setFitMode("custom"); }}><ZoomOut className="w-4 h-4" /></button>
          <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600" style={{ fontSize: "11px", fontWeight: 500, minWidth: "42px", textAlign: "center" }}>{zoom}%</span>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => { setZoom((z) => Math.min(200, z + 25)); setFitMode("custom"); }}><ZoomIn className="w-4 h-4" /></button>
          <div className="w-px h-5 bg-gray-200" />
          <button className={`px-2 py-1 rounded cursor-pointer transition-colors ${fitMode === "width" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 600 }} onClick={() => applyFit(fitMode === "width" ? "custom" : "width")} title="Vừa chiều rộng">Rộng</button>
          <button className={`px-2 py-1 rounded cursor-pointer transition-colors ${fitMode === "page" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 600 }} onClick={() => applyFit(fitMode === "page" ? "custom" : "page")} title="Vừa trang">Trang</button>
          <div className="w-px h-5 bg-gray-200" />
          <button className={`p-1.5 rounded cursor-pointer transition-colors ${highlightsOn ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-200"}`} onClick={() => setHighlightsOn(!highlightsOn)} title={highlightsOn ? "Tắt highlight" : "Bật highlight"}>
            <Highlighter className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${isBookmarked(currentPage) ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => toggleBookmark(currentPage)} title={isBookmarked(currentPage) ? "Bỏ bookmark trang này" : "Bookmark trang này"}>
            <Bookmark className={`w-4 h-4 ${isBookmarked(currentPage) ? "fill-current" : ""}`} />
          </button>
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${showBookmarkPanel ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowBookmarkPanel(!showBookmarkPanel); setShowAnnotationPanel(false); }} title="Danh sách bookmark">
            <BookmarkCheck className="w-4 h-4" />
            {bookmarks.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#c8a84e] text-white rounded-full flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{bookmarks.length}</span>}
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button className={`p-1.5 rounded cursor-pointer transition-colors relative ${showAnnotationPanel ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`} onClick={() => { setShowAnnotationPanel(!showAnnotationPanel); setShowBookmarkPanel(false); }} title="Ghi chú & Bình luận">
            <MessageSquare className="w-4 h-4" />
            {totalAnnotations > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>{totalAnnotations}</span>}
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer" onClick={() => window.print()} title="In tài liệu">
            <Printer className="w-4 h-4" />
          </button>
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
                    <div className="aspect-[3/4] bg-white p-2 relative">
                      <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5">
                        {isBkmk && <Bookmark className="w-2.5 h-2.5 text-[#c8a84e] fill-current" />}
                        {pgAnnoCount > 0 && <div className="w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{pgAnnoCount}</div>}
                        {isRead && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                        {isSearchHit && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                      </div>
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
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
                  </div>
                )}

                {/* Text selection annotation input popover */}
                {textSelection && showSelAnnotInput && (
                  <div className="absolute z-30 bg-white border border-blue-300 rounded-xl shadow-2xl p-3 w-80 -translate-x-1/2" style={{ top: textSelection.rect.top - 8, left: textSelection.rect.left }} onClick={(e) => e.stopPropagation()}>
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
                      <div className={`flex gap-2 ${hasPAnno ? "pl-3 border-l-2 border-blue-300" : ""}`}>
                        <div className="flex-1">
                          <p className={`text-gray-700 transition-colors ${isAnnotating ? "bg-yellow-50 rounded px-1 -mx-1" : ""}`} style={{ fontSize: "13px", lineHeight: 1.8 }}>
                            {renderParagraph(para, pageInfo.highlights, searchActive ? searchQuery : undefined, i)}
                          </p>
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
                        <button
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${isAnnotating ? "bg-blue-500 text-white shadow-md" : "bg-transparent text-transparent group-hover/para:bg-blue-100 group-hover/para:text-blue-500"}`}
                          onClick={() => { setAnnotatingPara(isAnnotating ? null : i); setTimeout(() => annotationInputRef.current?.focus(), 100); }}
                          title="Thêm ghi chú"
                          style={{ marginTop: "2px" }}
                        >
                          <MessageSquarePlus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isAnnotating && (
                        <div className="mt-2 ml-3 bg-white border border-blue-200 rounded-lg shadow-lg p-3 z-10 relative" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>Thêm ghi chú tại đoạn {i + 1}</span>
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
                            <button className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer disabled:opacity-40" style={{ fontSize: "11px", fontWeight: 600 }} onClick={() => submitAnnotation()} disabled={!annotationText.trim()}>
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-1">
                    <button className="flex-1 py-1 rounded-md cursor-pointer transition-colors bg-white shadow-sm text-gray-700" style={{ fontSize: "10px", fontWeight: 600 }}>Trang {currentPage}</button>
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
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full ${cMap.dot} text-white flex items-center justify-center shrink-0`} style={{ fontSize: "9px", fontWeight: 700 }}>{a.initials}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{a.author}</span>
                              <p className="text-gray-400 truncate" style={{ fontSize: "9px" }}>Đoạn {a.paraIdx + 1} &bull; {a.time}</p>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5" onClick={() => deleteAnnotation(a.id)} title="Xóa"><Trash2 className="w-3 h-3" /></button>
                          </div>
                          {a.selectedText && (
                            <div className="flex items-start gap-1.5 mt-1.5 p-1.5 bg-amber-50/80 border border-amber-200/60 rounded">
                              <Quote className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-amber-700 line-clamp-2" style={{ fontSize: "10px", lineHeight: 1.3, fontStyle: "italic" }}>"{a.selectedText}"</p>
                            </div>
                          )}
                          <p className="text-gray-700 mt-1.5" style={{ fontSize: "12px", lineHeight: 1.5 }}>{a.text}</p>
                        </div>

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
