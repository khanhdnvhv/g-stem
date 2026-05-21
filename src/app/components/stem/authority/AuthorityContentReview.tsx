import { useState, useMemo } from "react";
import {
  ShieldCheck, Download, Search, CheckCircle2,
  XCircle, Clock, Eye, FileText, Video, FlaskConical,
  ArrowRight, Building2, ClipboardCheck,
} from "lucide-react";
import { useAuth } from "./authority-ui";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  AUTHORITY CONTENT REVIEW — Kiểm duyệt Học liệu STEM             */
/* ================================================================ */

const ACCENT = "#7c3aed";

type ReviewStatus = "pending" | "approved" | "rejected";
type ContentType = "video" | "document" | "lab" | "exam";

interface CriteriaItem {
  label: string;
  checked: boolean;
}

interface ContentItem {
  id:          string;
  title:       string;
  type:        ContentType;
  program:     string;
  subject:     string;
  gradeLevel:  string;
  submittedBy: string;  // NCC name
  submittedAt: string;
  status:      ReviewStatus;
  note?:       string;
  fileSize:    string;
  criteria:    CriteriaItem[];
}

const DEFAULT_CRITERIA = (): CriteriaItem[] => [
  { label: "Bám sát chuẩn kiến thức khung chương trình CT1–CT5", checked: false },
  { label: "Phù hợp cấp học và lứa tuổi học sinh",              checked: false },
  { label: "Chất lượng kỹ thuật đạt yêu cầu (video/tài liệu)",  checked: false },
  { label: "Không vi phạm bản quyền và nội dung cấm",           checked: false },
];

const INITIAL_CONTENT: ContentItem[] = [
  { id:"C001", title:"Bài giảng Toán STEM: Phương trình bậc 2 trong thực tiễn", type:"video",    program:"CT1", subject:"Toán STEM",     gradeLevel:"THCS 9",     submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-15", status:"pending",  fileSize:"245 MB", criteria: DEFAULT_CRITERIA() },
  { id:"C002", title:"Tài liệu Lab: Thí nghiệm phản ứng Axit-Bazơ",            type:"lab",      program:"CT1", subject:"Hóa STEM",      gradeLevel:"THCS 8",     submittedBy:"NXB Giáo dục Việt Nam",  submittedAt:"2026-05-14", status:"pending",  fileSize:"12 MB",  criteria: DEFAULT_CRITERIA() },
  { id:"C003", title:"Bộ đề thi Robotic CT4 — Học kỳ 2",                       type:"exam",     program:"CT4", subject:"Robotic",       gradeLevel:"THPT 11",    submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-13", status:"pending",  fileSize:"3 MB",   criteria: DEFAULT_CRITERIA() },
  { id:"C004", title:"Video hướng dẫn lắp ráp mạch điện IoT cơ bản",           type:"video",    program:"CT4", subject:"IoT",           gradeLevel:"THPT 10",    submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-12", status:"pending",  fileSize:"380 MB", criteria: DEFAULT_CRITERIA() },
  { id:"C005", title:"Slide bài giảng: Liên môn Toán-Lý trong công trình cầu", type:"document", program:"CT2", subject:"Toán-Lý STEM",  gradeLevel:"THPT 10",    submittedBy:"ĐH Sư phạm Hà Nội",     submittedAt:"2026-05-12", status:"pending",  fileSize:"18 MB",  criteria: DEFAULT_CRITERIA() },
  { id:"C006", title:"Đề cương NCKH: Nghiên cứu vật liệu tái chế",             type:"document", program:"CT5", subject:"NCKH",          gradeLevel:"THPT 11",    submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-11", status:"approved", note:"Nội dung chuẩn, phù hợp khung CT5",            fileSize:"8 MB",   criteria: DEFAULT_CRITERIA().map(c => ({ ...c, checked: true })) },
  { id:"C007", title:"Bài giảng Khoa học TN STEM: Hệ sinh thái rừng",          type:"video",    program:"CT1", subject:"Sinh STEM",     gradeLevel:"THCS 7",     submittedBy:"NXB Giáo dục Việt Nam",  submittedAt:"2026-05-10", status:"approved", note:"Đạt chuẩn nội dung, được phép sử dụng toàn quốc", fileSize:"210 MB", criteria: DEFAULT_CRITERIA().map(c => ({ ...c, checked: true })) },
  { id:"C008", title:"Tài liệu hướng dẫn CLB Sáng tạo — Chủ đề Môi trường",   type:"document", program:"CT3", subject:"CLB Sáng tạo",  gradeLevel:"Tiểu học 5", submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-09", status:"approved", note:"Phù hợp cấp Tiểu học, đạt yêu cầu",            fileSize:"5 MB",   criteria: DEFAULT_CRITERIA().map(c => ({ ...c, checked: true })) },
  { id:"C009", title:"Video thực hành AI: Nhận diện hình ảnh với Python",       type:"video",    program:"CT4", subject:"AI & Lập trình",gradeLevel:"THPT 12",    submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-08", status:"rejected", note:"Nội dung vượt chuẩn CT4 cấp THPT — yêu cầu điều chỉnh", fileSize:"155 MB", criteria: DEFAULT_CRITERIA() },
  { id:"C010", title:"Bộ câu hỏi trắc nghiệm Lý STEM Chương 3",                type:"exam",     program:"CT1", subject:"Lý STEM",       gradeLevel:"THPT 10",    submittedBy:"ĐH Sư phạm TP.HCM",     submittedAt:"2026-05-07", status:"rejected", note:"Thiếu đáp án và thang điểm — trả lại NCC",         fileSize:"2 MB",   criteria: DEFAULT_CRITERIA() },
  { id:"C011", title:"Slide: Dự án Nghiên cứu — Năng lượng mặt trời",          type:"document", program:"CT5", subject:"Dự án NC",      gradeLevel:"THPT 12",    submittedBy:"ĐH Sư phạm Hà Nội",     submittedAt:"2026-05-16", status:"pending",  fileSize:"24 MB",  criteria: DEFAULT_CRITERIA() },
  { id:"C012", title:"Video Lab: Lập trình Arduino điều khiển động cơ",         type:"video",    program:"CT4", subject:"Robotic",       gradeLevel:"THCS 9",     submittedBy:"Geleximco STEM (NCC)",   submittedAt:"2026-05-16", status:"pending",  fileSize:"290 MB", criteria: DEFAULT_CRITERIA() },
];

const TYPE_CFG: Record<ContentType, { icon: typeof FileText; color: string; label: string }> = {
  video:    { icon: Video,       color: "#2563eb", label: "Video" },
  document: { icon: FileText,    color: "#c8a84e", label: "Tài liệu" },
  lab:      { icon: FlaskConical,color: "#16a34a", label: "Lab" },
  exam:     { icon: FileText,    color: "#dc2626", label: "Đề thi" },
};

const STATUS_CFG: Record<ReviewStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: "Chờ duyệt",  color: "#d97706", bg: "#fffbeb" },
  approved: { label: "Đã duyệt",   color: "#16a34a", bg: "#f0fdf4" },
  rejected: { label: "Từ chối",    color: "#dc2626", bg: "#fef2f2" },
};

const PROGRAM_COLORS: Record<string, string> = {
  CT1:"#64748b", CT2:"#0891b2", CT3:"#7c3aed", CT4:"#dc2626", CT5:"#059669",
};

type Tab = "pending" | "approved" | "rejected";

export function AuthorityContentReview() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [showRejectBox, setShowRejectBox] = useState<string | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);

  function toggleCriteria(itemId: string, idx: number) {
    setItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      const criteria = item.criteria.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
      return { ...item, criteria };
    }));
  }

  const pendingCount  = items.filter(i => i.status === "pending").length;
  const approvedCount = items.filter(i => i.status === "approved").length;
  const rejectedCount = items.filter(i => i.status === "rejected").length;

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchTab = i.status === tab;
      const matchSearch = !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.submittedBy.toLowerCase().includes(search.toLowerCase()) ||
        i.subject.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [items, tab, search]);

  function approve(id: string) {
    const item = items.find((i) => i.id === id);
    const allChecked = item?.criteria.every((c) => c.checked);
    if (!allChecked) {
      toast.warning("Vui lòng hoàn thành đầy đủ tiêu chí thẩm định trước khi duyệt");
      setExpandedCriteria(id);
      return;
    }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "approved", note: "Đạt chuẩn — Cho phép sử dụng tại các trường" } : i));
    toast.success("Đã duyệt học liệu — NCC sẽ được thông báo");
  }

  function reject(id: string) {
    const note = rejectNote[id] || "Không đạt yêu cầu nội dung";
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "rejected", note } : i));
    setShowRejectBox(null);
    toast.error("Đã trả lại NCC — Yêu cầu chỉnh sửa và nộp lại");
  }

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "pending",  label: "Chờ duyệt",  count: pendingCount },
    { id: "approved", label: "Đã duyệt",   count: approvedCount },
    { id: "rejected", label: "Từ chối",    count: rejectedCount },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title={`Kiểm duyệt Học liệu STEM — ${myProvince}`}
        subtitle="Duyệt học liệu từ nhà cung cấp và giáo viên trước khi cho phép sử dụng tại các trường"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo kiểm duyệt")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* Flow banner */}
      <div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4">
        <p className="text-xs font-semibold text-purple-700 mb-3 uppercase tracking-wide">Quy trình thẩm định học liệu STEM</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: Building2,       label: "NCC nộp học liệu",          sub: "Geleximco, NXB, ĐH Sư phạm",  color: "#6366f1" },
            { icon: ClipboardCheck,  label: "Bộ thẩm định chuyên môn",   sub: "Đối chiếu khung CT1–CT5",      color: "#7c3aed" },
            { icon: CheckCircle2,    label: "Quyết định",                 sub: "Duyệt / Trả lại NCC chỉnh sửa",color: "#16a34a" },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-purple-100 shadow-sm">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: step.color + "18" }}>
                    <Icon className="w-4 h-4" style={{ color: step.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{step.label}</p>
                    <p className="text-[10px] text-gray-500">{step.sub}</p>
                  </div>
                </div>
                {idx < 2 && <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Clock}        label="Chờ duyệt"   value={pendingCount}  color="#d97706" subtitle="cần xử lý" />
        <KpiCard icon={CheckCircle2} label="Đã duyệt"    value={approvedCount} color="#16a34a" />
        <KpiCard icon={XCircle}      label="Từ chối"     value={rejectedCount} color="#dc2626" />
        <KpiCard icon={ShieldCheck}  label="Tổng học liệu" value={items.length} color={ACCENT} />
      </div>

      {/* Tab + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              style={tab === t.id
                ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--muted-foreground)" }}
            >
              {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.id ? ACCENT + "15" : "transparent", color: tab === t.id ? ACCENT : "var(--muted-foreground)" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm học liệu, môn, người gửi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm w-60 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      {/* Content list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">
            Không có học liệu nào
          </div>
        )}
        {filtered.map((item) => {
          const typeCfg = TYPE_CFG[item.type];
          const TypeIcon = typeCfg.icon;
          const statusCfg = STATUS_CFG[item.status];
          return (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: typeCfg.color + "15" }}>
                  <TypeIcon className="w-5 h-5" style={{ color: typeCfg.color }} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{ color: statusCfg.color, background: statusCfg.bg }}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold text-white"
                      style={{ background: PROGRAM_COLORS[item.program] }}>
                      {item.program}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.subject}</span>
                    <span className="text-xs text-muted-foreground">{item.gradeLevel}</span>
                    <span className="text-xs text-muted-foreground">· {typeCfg.label} · {item.fileSize}</span>
                  </div>

                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span className="font-medium text-foreground">{item.submittedBy}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{item.submittedAt}</span>
                  </div>

                  {item.note && (
                    <p className="text-xs mt-2 px-2 py-1 rounded-lg"
                      style={{ background: statusCfg.bg, color: statusCfg.color }}>
                      {item.note}
                    </p>
                  )}

                  {/* Criteria checklist for pending items */}
                  {item.status === "pending" && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedCriteria(expandedCriteria === item.id ? null : item.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:text-purple-900"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        Tiêu chí thẩm định
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          {item.criteria.filter(c => c.checked).length}/{item.criteria.length}
                        </span>
                      </button>
                      {expandedCriteria === item.id && (
                        <div className="mt-2 space-y-1.5 p-3 rounded-lg bg-purple-50 border border-purple-100">
                          {item.criteria.map((c, idx) => (
                            <label key={idx} className="flex items-start gap-2 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={c.checked}
                                onChange={() => toggleCriteria(item.id, idx)}
                                className="mt-0.5 accent-purple-600"
                              />
                              <span className={`text-xs ${c.checked ? "text-gray-500 line-through" : "text-gray-700"}`}>
                                {c.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reject note input */}
                  {showRejectBox === item.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Lý do từ chối..."
                        value={rejectNote[item.id] || ""}
                        onChange={(e) => setRejectNote((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-red-200"
                        autoFocus
                      />
                      <button onClick={() => reject(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600">
                        Xác nhận từ chối
                      </button>
                      <button onClick={() => setShowRejectBox(null)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted">
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toast.info(`Xem trước: ${item.title}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Xem
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() => approve(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white hover:opacity-90 transition-opacity"
                        style={{ background: "#16a34a" }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Duyệt
                      </button>
                      <button
                        onClick={() => setShowRejectBox(item.id === showRejectBox ? null : item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white hover:opacity-90 transition-opacity"
                        style={{ background: "#dc2626" }}
                      >
                        <XCircle className="w-3 h-3" /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
