import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, Link } from "react-router";
import {
  Factory, AlertTriangle, BarChart2, ScrollText,
  CheckCircle, Clock, Search, X, ChevronLeft, ChevronRight,
  MoreHorizontal, Eye, Edit2, Ban, RotateCcw, Plus, XCircle,
  Loader2, AlertCircle,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { formatDate } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { NccSuspendModal } from "./NccSuspendModal";

/* ================================================================ */
/*  TYPES & CONSTANTS                                               */
/* ================================================================ */
type NccStatus = "active" | "suspended" | "trial";
type NccType   = "content" | "device" | "both";

interface NccRecord {
  id:                string;
  code:              string;
  name:              string;
  status:            NccStatus;
  nccType:           NccType;
  programs:          number;
  materials:         number;
  schools:           number;
  pendingViolations: number;
  onboardedAt:       string;
}

const NCC_TYPE_CFG: Record<NccType, { label: string; color: string; bg: string }> = {
  content: { label: "Nội dung",         color: "#1d4ed8", bg: "#dbeafe" },
  device:  { label: "Thiết bị",         color: "#c2410c", bg: "#ffedd5" },
  both:    { label: "Nội dung & TB",    color: "#7c3aed", bg: "#ede9fe" },
};

const NCC_STATUS_CFG: Record<NccStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "Đang hoạt động", color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  suspended: { label: "Tạm ngừng",      color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  trial:     { label: "Dùng thử",       color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
};

const AVATAR_COLORS = [
  "#1d4ed8","#0e7490","#15803d","#7c3aed","#c2410c","#b45309","#be185d","#0369a1",
];

function getInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/* ================================================================ */
/*  MOCK DATA — NCC                                                  */
/* ================================================================ */
const NCC_RECORDS: NccRecord[] = [
  { id: "NCC-01", code: "GLX-STEM", name: "Geleximco STEM",             status: "active",    nccType: "both",    programs: 12, materials: 145, schools: 38, pendingViolations: 0, onboardedAt: "2024-01-10T00:00:00Z" },
  { id: "NCC-02", code: "NXT-EDU",  name: "Nexta Education",            status: "active",    nccType: "content", programs: 5,  materials: 63,  schools: 12, pendingViolations: 2, onboardedAt: "2024-07-01T00:00:00Z" },
  { id: "NCC-03", code: "PNS-EDU",  name: "Công ty CP Phương Nam STEM", status: "trial",     nccType: "device",  programs: 2,  materials: 18,  schools: 3,  pendingViolations: 0, onboardedAt: "2025-01-15T00:00:00Z" },
  { id: "NCC-04", code: "VST-EDU",  name: "VSTech Education",           status: "active",    nccType: "both",    programs: 8,  materials: 92,  schools: 25, pendingViolations: 1, onboardedAt: "2024-05-20T00:00:00Z" },
  { id: "NCC-05", code: "ELI-STEM", name: "Elios STEM Solutions",       status: "suspended", nccType: "device",  programs: 3,  materials: 22,  schools: 7,  pendingViolations: 0, onboardedAt: "2024-09-01T00:00:00Z" },
  { id: "NCC-06", code: "KNO-EDU",  name: "Knowify VN",                 status: "active",    nccType: "content", programs: 7,  materials: 88,  schools: 21, pendingViolations: 0, onboardedAt: "2024-03-15T00:00:00Z" },
  { id: "NCC-07", code: "STM-PRO",  name: "STEM Pro Academy",           status: "trial",     nccType: "content", programs: 1,  materials: 9,   schools: 2,  pendingViolations: 0, onboardedAt: "2025-03-01T00:00:00Z" },
  { id: "NCC-08", code: "EDL-VN",   name: "Edutechlab Vietnam",         status: "active",    nccType: "both",    programs: 6,  materials: 71,  schools: 18, pendingViolations: 0, onboardedAt: "2024-06-10T00:00:00Z" },
];

/* ================================================================ */
/*  MOCK DATA — dùng cho ContentMonitorTab & ViolationsTab          */
/* ================================================================ */
interface NccInfo { id: string; stemTier: string; contractStatus: "active" | "expired" | "pending"; contractEnd: string; }

const NCC_INFO: Record<string, NccInfo> = {
  "NCC-01": { id: "NCC-01", stemTier: "Full (CT1–CT5)",        contractStatus: "active",  contractEnd: "2027-06-30" },
  "NCC-02": { id: "NCC-02", stemTier: "Nội dung (CT1–CT3)",    contractStatus: "active",  contractEnd: "2026-12-31" },
  "NCC-03": { id: "NCC-03", stemTier: "Thiết bị (CT4)",        contractStatus: "pending", contractEnd: "2026-09-30" },
  "NCC-04": { id: "NCC-04", stemTier: "Full (CT1–CT4)",        contractStatus: "active",  contractEnd: "2027-03-31" },
  "NCC-05": { id: "NCC-05", stemTier: "Thiết bị (CT4–CT5)",    contractStatus: "expired", contractEnd: "2025-12-31" },
  "NCC-06": { id: "NCC-06", stemTier: "Nội dung (CT1–CT3)",    contractStatus: "active",  contractEnd: "2026-08-31" },
  "NCC-07": { id: "NCC-07", stemTier: "Nội dung (CT1)",        contractStatus: "pending", contractEnd: "2026-06-30" },
  "NCC-08": { id: "NCC-08", stemTier: "Full (CT1–CT4)",        contractStatus: "active",  contractEnd: "2026-11-30" },
};

const CONTRACT_STATUS_CFG = {
  active:  { label: "Còn hiệu lực", color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  expired: { label: "Hết hạn",      color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  pending: { label: "Chờ ký",       color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
};

interface ProgramDetail { id: string; name: string; grades: string; materialCount: number; schoolCount: number; }
const NCC_PROGRAMS: Record<string, ProgramDetail[]> = {
  "NCC-01": [
    { id: "P001", name: "STEM Toán Tư duy",          grades: "Lớp 1–3",   materialCount: 24, schoolCount: 18 },
    { id: "P002", name: "Khoa học Khám phá",         grades: "Lớp 4–6",   materialCount: 31, schoolCount: 22 },
    { id: "P003", name: "Lập trình Scratch",         grades: "Lớp 4–6",   materialCount: 18, schoolCount: 15 },
    { id: "P004", name: "Robotics Cơ bản",           grades: "Lớp 7–9",   materialCount: 29, schoolCount: 12 },
    { id: "P005", name: "STEM Hoá – Sinh tích hợp", grades: "Lớp 7–9",   materialCount: 22, schoolCount: 9  },
    { id: "P006", name: "AI & Data Cơ bản",          grades: "Lớp 10–12", materialCount: 21, schoolCount: 8  },
  ],
  "NCC-02": [
    { id: "P011", name: "Toán Tư duy Nâng cao",      grades: "Lớp 4–6",   materialCount: 15, schoolCount: 7 },
    { id: "P012", name: "Python Starter",            grades: "Lớp 7–9",   materialCount: 19, schoolCount: 4 },
    { id: "P013", name: "STEM Vật lý Ứng dụng",     grades: "Lớp 10–12", materialCount: 29, schoolCount: 1 },
  ],
  "NCC-03": [
    { id: "P021", name: "Robotics Lego EV3",         grades: "Lớp 4–9",   materialCount: 12, schoolCount: 2 },
    { id: "P022", name: "Mạch điện & Arduino",       grades: "Lớp 7–9",   materialCount: 6,  schoolCount: 1 },
  ],
  "NCC-04": [
    { id: "P031", name: "STEM Toán Tư duy",          grades: "Lớp 1–6",   materialCount: 28, schoolCount: 15 },
    { id: "P032", name: "VSTech Robotics",           grades: "Lớp 7–9",   materialCount: 22, schoolCount: 6  },
    { id: "P033", name: "Khoa học Máy tính",         grades: "Lớp 4–9",   materialCount: 19, schoolCount: 8  },
    { id: "P034", name: "AI Phổ thông",              grades: "Lớp 10–12", materialCount: 23, schoolCount: 7  },
  ],
  "NCC-05": [
    { id: "P041", name: "ELIOS Bot Kit",             grades: "Lớp 4–9",   materialCount: 14, schoolCount: 4 },
    { id: "P042", name: "Smart Home STEM",           grades: "Lớp 7–12",  materialCount: 8,  schoolCount: 3 },
  ],
  "NCC-06": [
    { id: "P051", name: "Knowify Math",              grades: "Lớp 1–6",   materialCount: 22, schoolCount: 13 },
    { id: "P052", name: "Knowify Science",           grades: "Lớp 4–9",   materialCount: 31, schoolCount: 8  },
    { id: "P053", name: "Knowify Code",              grades: "Lớp 7–12",  materialCount: 35, schoolCount: 5  },
  ],
  "NCC-07": [
    { id: "P061", name: "STEM Pro Toán",             grades: "Lớp 1–6",   materialCount: 9,  schoolCount: 2 },
  ],
  "NCC-08": [
    { id: "P071", name: "EduLab Robotics",           grades: "Lớp 4–9",   materialCount: 18, schoolCount: 9 },
    { id: "P072", name: "EduLab Code",               grades: "Lớp 7–12",  materialCount: 25, schoolCount: 7 },
    { id: "P073", name: "EduLab AI Track",           grades: "Lớp 10–12", materialCount: 28, schoolCount: 6 },
  ],
};

interface SchoolSample { id: string; name: string; province: string; }
const NCC_SCHOOL_SAMPLE: Record<string, SchoolSample[]> = {
  "NCC-01": [
    { id: "s01", name: "TH Ngô Quyền",              province: "Hà Nội"    },
    { id: "s02", name: "THCS Cầu Giấy",             province: "Hà Nội"    },
    { id: "s03", name: "THPT Lê Hồng Phong",        province: "TP. HCM"   },
    { id: "s04", name: "THCS Trần Phú",             province: "Đà Nẵng"   },
    { id: "s05", name: "TH Nguyễn Trãi",            province: "Hải Phòng" },
  ],
  "NCC-02": [
    { id: "s11", name: "TH Đống Đa",                province: "Hà Nội"    },
    { id: "s12", name: "THCS Bình Thạnh",           province: "TP. HCM"   },
    { id: "s13", name: "THPT Nguyễn Du",            province: "Bình Dương" },
  ],
  "NCC-03": [
    { id: "s21", name: "THCS Ngô Sĩ Liên",          province: "Hà Nội"  },
    { id: "s22", name: "TH Kim Đồng",               province: "TP. HCM" },
  ],
  "NCC-04": [
    { id: "s31", name: "TH Quang Trung",             province: "Hà Nội"   },
    { id: "s32", name: "THCS Hoàng Văn Thụ",        province: "TP. HCM"  },
    { id: "s33", name: "THPT Chuyên Hà Nội",        province: "Hà Nội"   },
    { id: "s34", name: "TH Lê Lợi",                 province: "Đà Nẵng"  },
    { id: "s35", name: "THCS Tân Bình",             province: "TP. HCM"  },
  ],
  "NCC-05": [
    { id: "s41", name: "THCS Lý Tự Trọng",          province: "Cần Thơ" },
    { id: "s42", name: "TH Nguyễn Du",              province: "Hà Nội"  },
  ],
  "NCC-06": [
    { id: "s51", name: "TH Chu Văn An",              province: "Hà Nội"  },
    { id: "s52", name: "THCS Đoàn Thị Điểm",        province: "Hà Nội"  },
    { id: "s53", name: "THPT Nguyễn Siêu",          province: "Hà Nội"  },
    { id: "s54", name: "TH Trương Định",             province: "TP. HCM" },
  ],
  "NCC-07": [
    { id: "s61", name: "TH Hoàng Hoa Thám",         province: "Hà Nội"  },
    { id: "s62", name: "TH Phan Chu Trinh",         province: "Đà Nẵng" },
  ],
  "NCC-08": [
    { id: "s71", name: "THCS Huỳnh Khương Ninh",    province: "TP. HCM"   },
    { id: "s72", name: "TH Lý Thái Tổ",             province: "Hà Nội"   },
    { id: "s73", name: "THPT Lưu Hữu Phước",        province: "Cần Thơ"  },
    { id: "s74", name: "THCS Nguyễn Công Trứ",      province: "Hải Phòng" },
  ],
};

type StemPkg = "CT1" | "CT2" | "CT3" | "CT4" | "CT5";
type PkgStatus = "active" | "pending" | "none";
const STEM_PKGS: StemPkg[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
const STEM_PKG_CFG: Record<StemPkg, { desc: string; color: string; bg: string }> = {
  CT1: { desc: "Nền tảng · K1–3",   color: "#1d4ed8", bg: "#dbeafe" },
  CT2: { desc: "Cơ bản · K4–6",     color: "#0e7490", bg: "#cffafe" },
  CT3: { desc: "Trung cấp · K7–9",  color: "#15803d", bg: "#dcfce7" },
  CT4: { desc: "Nâng cao · K10–12", color: "#7c3aed", bg: "#ede9fe" },
  CT5: { desc: "Chuyên sâu",        color: "#c2410c", bg: "#ffedd5" },
};
const INIT_PKG_MATRIX: Record<string, Record<StemPkg, PkgStatus>> = {
  "NCC-01": { CT1: "active", CT2: "active",  CT3: "active",  CT4: "active",  CT5: "active" },
  "NCC-02": { CT1: "active", CT2: "active",  CT3: "active",  CT4: "none",    CT5: "none"   },
  "NCC-03": { CT1: "none",   CT2: "none",    CT3: "none",    CT4: "active",  CT5: "none"   },
  "NCC-04": { CT1: "active", CT2: "active",  CT3: "pending", CT4: "active",  CT5: "none"   },
  "NCC-05": { CT1: "none",   CT2: "none",    CT3: "none",    CT4: "active",  CT5: "active" },
  "NCC-06": { CT1: "active", CT2: "active",  CT3: "active",  CT4: "none",    CT5: "none"   },
  "NCC-07": { CT1: "active", CT2: "none",    CT3: "none",    CT4: "none",    CT5: "none"   },
  "NCC-08": { CT1: "active", CT2: "active",  CT3: "active",  CT4: "active",  CT5: "none"   },
};

interface ViolationRecord { id: string; nccId: string; nccName: string; type: string; description: string; detectedAt: string; status: "open" | "resolved" | "pending"; }

const MOCK_VIOLATIONS: ViolationRecord[] = [
  { id: "V-001", nccId: "NCC-02", nccName: "Nexta Education",   type: "Nội dung không phù hợp",  description: "Học liệu môn Toán lớp 6 chứa nội dung chưa được duyệt theo CT GDPT 2018", detectedAt: "2026-04-15T09:00:00Z", status: "open" },
  { id: "V-002", nccId: "NCC-02", nccName: "Nexta Education",   type: "Vi phạm bản quyền",        description: "Sử dụng hình ảnh minh hoạ không có giấy phép trong module CT2",             detectedAt: "2026-03-20T14:00:00Z", status: "resolved" },
  { id: "V-003", nccId: "NCC-04", nccName: "VSTech Education",  type: "Thông tin sai lệch",       description: "Mô tả gói STEM CT3 không khớp với nội dung thực tế được cung cấp",         detectedAt: "2026-04-28T10:00:00Z", status: "pending" },
];

/* ================================================================ */
/*  ACTION MENU                                                     */
/* ================================================================ */
function ActionMenu({ ncc, onSuspend, onActivate }: {
  ncc: NccRecord;
  onSuspend: (reason: string) => void;
  onActivate: () => void;
}) {
  const [open, setOpen]               = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canSuspend = ncc.status === "active" || ncc.status === "trial";

  return (
    <>
      {suspendModal && (
        <NccSuspendModal
          nccName={ncc.name}
          onConfirm={(reason) => { setSuspendModal(false); onSuspend(reason); }}
          onClose={() => setSuspendModal(false)}
        />
      )}

      <div ref={ref} className="relative">
        <button onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-card border border-border rounded-xl shadow-lg py-1 text-[12.5px]">
            <Link to={`/admin/suppliers/${ncc.id}`}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors w-full text-left"
              onClick={() => setOpen(false)}>
              <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết
            </Link>
            <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors w-full text-left"
              onClick={() => { setOpen(false); toast.info("Tính năng đang phát triển"); }}>
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" /> Chỉnh sửa
            </button>
            <div className="border-t border-border my-1" />
            {canSuspend ? (
              <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 text-red-600 transition-colors w-full text-left"
                onClick={() => { setOpen(false); setSuspendModal(true); }}>
                <Ban className="w-3.5 h-3.5" /> Đình chỉ
              </button>
            ) : (
              <button className="flex items-center gap-2.5 px-3 py-2 hover:bg-green-50 text-green-700 transition-colors w-full text-left"
                onClick={() => { setOpen(false); onActivate(); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Kích hoạt lại
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/* ================================================================ */
/*  SKELETON ROW                                                    */
/* ================================================================ */
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-border last:border-0">
      <td className="px-4 py-3"><div className="w-8 h-8 bg-secondary rounded-lg" /></td>
      <td className="px-4 py-3"><div className="space-y-1.5"><div className="h-3 w-28 bg-secondary rounded" /><div className="h-2 w-16 bg-secondary rounded" /></div></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-secondary rounded" /></td>
      <td className="px-4 py-3"><div className="h-5 w-24 bg-secondary rounded-full" /></td>
      {[1,2,3,4].map((i) => <td key={i} className="px-4 py-3 text-center"><div className="h-3 w-8 bg-secondary rounded mx-auto" /></td>)}
      <td className="px-4 py-3"><div className="h-5 w-24 bg-secondary rounded-full" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-secondary rounded" /></td>
      <td className="px-4 py-3" />
    </tr>
  );
}

/* ================================================================ */
/*  ONBOARD DRAWER                                                  */
/* ================================================================ */
type CodeStatus = "idle" | "checking" | "ok" | "taken";

const makeInitForm = () => ({
  name:          "",
  code:          "",
  nccTypes:      new Set<"content" | "device">(),
  taxCode:       "",
  address:       "",
  legalRepName:  "",
  legalRepTitle: "",
  contactEmail:  "",
  contactPhone:  "",
  internalNote:  "",
  adminEmail:    "",
});

type OnboardForm = ReturnType<typeof makeInitForm>;

function validateForm(form: OnboardForm, codeStatus: CodeStatus): Record<string, string> {
  const e: Record<string, string> = {};
  if (!form.name.trim())          e.name = "Bắt buộc";
  else if (form.name.length > 200) e.name = "Tối đa 200 ký tự";

  if (!form.code.trim())          e.code = "Bắt buộc";
  else if (!/^[A-Z0-9_-]+$/.test(form.code)) e.code = "Chỉ dùng chữ hoa, số, gạch dưới, gạch ngang";
  else if (codeStatus === "taken") e.code = "Mã đã tồn tại trong hệ thống";
  else if (codeStatus !== "ok")    e.code = "Cần kiểm tra tính hợp lệ (blur ra khỏi ô)";

  if (form.nccTypes.size === 0)   e.nccTypes = "Chọn ít nhất một loại";

  if (form.taxCode && !/^\d{10}$|^\d{13}$/.test(form.taxCode))
    e.taxCode = "MST phải có 10 hoặc 13 chữ số";

  if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
    e.contactEmail = "Định dạng email không hợp lệ";

  if (form.contactPhone && !/^(0[35789]\d{8})$/.test(form.contactPhone))
    e.contactPhone = "SĐT không hợp lệ (VD: 0912345678)";

  if (!form.adminEmail.trim())    e.adminEmail = "Bắt buộc";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail))
    e.adminEmail = "Định dạng email không hợp lệ";

  return e;
}

function OnboardDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm]               = useState<OnboardForm>(makeInitForm);
  const [codeStatus, setCodeStatus]   = useState<CodeStatus>("idle");
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const codeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) { setForm(makeInitForm()); setCodeStatus("idle"); setErrors({}); setShowDiscard(false); }
  }, [open]);

  const set = <K extends keyof OnboardForm>(k: K, v: OnboardForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const hasData = !!(form.name || form.code || form.adminEmail || form.address || form.taxCode);

  /* -- code unique check -- */
  const checkCode = () => {
    if (!form.code || !/^[A-Z0-9_-]+$/.test(form.code)) return;
    setCodeStatus("checking");
    if (codeTimer.current) clearTimeout(codeTimer.current);
    codeTimer.current = setTimeout(() => {
      const existing = NCC_RECORDS.map((r) => r.code);
      setCodeStatus(existing.includes(form.code) ? "taken" : "ok");
    }, 800);
  };

  /* -- cancel -- */
  const handleCancel = () => {
    if (hasData) setShowDiscard(true);
    else onClose();
  };
  const confirmDiscard = () => { setShowDiscard(false); onClose(); };

  /* -- submit -- */
  const handleSubmit = () => {
    const errs = validateForm(form, codeStatus);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Onboard NCC thành công — Email kích hoạt đã gửi đến admin NCC");
      onClose();
    }, 1200);
  };

  const F = "w-full px-3 py-2 border rounded-lg bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-[#92400e]/30 focus:border-[#92400e] placeholder:text-muted-foreground/60";
  const fieldCls = (k: string) => `${F} ${errors[k] ? "border-red-400" : "border-border"}`;
  const L = "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide";
  const Err = ({ k }: { k: string }) => errors[k]
    ? <p className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{errors[k]}</p>
    : null;

  const SectionHead = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 pt-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={handleCancel} />}

      <div className={`fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#92400e18" }}>
              <Factory className="w-4 h-4" style={{ color: "#92400e" }} />
            </div>
            <div>
              <p className="font-semibold text-[14px]">Onboard NCC mới</p>
              <p className="text-[11px] text-muted-foreground">Trạng thái mặc định: Dùng thử</p>
            </div>
          </div>
          <button onClick={handleCancel} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── 1. THÔNG TIN CƠ BẢN ── */}
          <SectionHead title="Thông tin cơ bản" />

          {/* Tên */}
          <div className="space-y-1">
            <label className={L}>Tên NCC <span className="text-red-500">*</span></label>
            <div className="relative">
              <input className={fieldCls("name")} maxLength={200}
                placeholder="Tên đầy đủ của nhà cung cấp"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/60">
                {form.name.length}/200
              </span>
            </div>
            <Err k="name" />
          </div>

          {/* Mã */}
          <div className="space-y-1">
            <label className={L}>Mã NCC <span className="text-red-500">*</span>
              <span className="ml-1 normal-case font-normal text-[10px]">(chữ hoa, số, gạch dưới, gạch ngang)</span>
            </label>
            <div className="relative">
              <input className={fieldCls("code")} placeholder="VD: STEM-ABC"
                value={form.code}
                onChange={(e) => {
                  set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""));
                  setCodeStatus("idle");
                  setErrors((p) => { const n = { ...p }; delete n.code; return n; });
                }}
                onBlur={checkCode}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {codeStatus === "checking" && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                {codeStatus === "ok"       && <CheckCircle className="w-4 h-4 text-green-500" />}
                {codeStatus === "taken"    && <AlertCircle className="w-4 h-4 text-red-500" />}
              </span>
            </div>
            {codeStatus === "ok"    && <p className="text-[11px] text-green-600">Mã hợp lệ, chưa được sử dụng</p>}
            {codeStatus === "taken" && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Mã đã tồn tại trong hệ thống</p>}
            {codeStatus !== "ok" && codeStatus !== "taken" && <Err k="code" />}
          </div>

          {/* Loại NCC */}
          <div className="space-y-1.5">
            <label className={L}>Loại NCC <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              {(["content", "device"] as const).map((t) => {
                const cfg = NCC_TYPE_CFG[t];
                const checked = form.nccTypes.has(t);
                return (
                  <label key={t} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors flex-1 justify-center
                    ${checked ? "border-[#92400e]/60 bg-[#92400e]/5" : "border-border hover:bg-secondary/40"}`}>
                    <input type="checkbox" checked={checked}
                      onChange={() => {
                        const next = new Set(form.nccTypes);
                        checked ? next.delete(t) : next.add(t);
                        set("nccTypes", next);
                        setErrors((p) => { const n = { ...p }; delete n.nccTypes; return n; });
                      }}
                      className="accent-[#92400e] w-3.5 h-3.5" />
                    <span className="text-[12.5px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </label>
                );
              })}
            </div>
            <Err k="nccTypes" />
          </div>

          {/* ── 2. PHÁP LÝ & LIÊN HỆ ── */}
          <SectionHead title="Pháp lý & Liên hệ" />

          {/* MST */}
          <div className="space-y-1">
            <label className={L}>Mã số thuế <span className="text-[10px] font-normal normal-case">(10 hoặc 13 chữ số)</span></label>
            <input className={fieldCls("taxCode")} placeholder="0101234567"
              value={form.taxCode} onChange={(e) => set("taxCode", e.target.value.replace(/\D/g, ""))} />
            <Err k="taxCode" />
          </div>

          {/* Địa chỉ */}
          <div className="space-y-1">
            <label className={L}>Địa chỉ doanh nghiệp</label>
            <input className={fieldCls("address")} placeholder="Số nhà, đường, phường, quận, tỉnh/thành"
              value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>

          {/* Người đại diện */}
          <div className="space-y-1">
            <label className={L}>Người đại diện pháp lý</label>
            <div className="flex gap-2">
              <input className={`${F} border-border flex-1`} placeholder="Họ và tên"
                value={form.legalRepName} onChange={(e) => set("legalRepName", e.target.value)} />
              <input className={`${F} border-border w-32`} placeholder="Chức vụ"
                value={form.legalRepTitle} onChange={(e) => set("legalRepTitle", e.target.value)} />
            </div>
          </div>

          {/* Email + SĐT */}
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <label className={L}>Email liên hệ</label>
              <input type="email" className={fieldCls("contactEmail")} placeholder="contact@company.vn"
                value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              <Err k="contactEmail" />
            </div>
            <div className="space-y-1 w-36">
              <label className={L}>Điện thoại</label>
              <input type="tel" className={fieldCls("contactPhone")} placeholder="09xxxxxxxx"
                value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
              <Err k="contactPhone" />
            </div>
          </div>

          {/* ── 3. TÀI KHOẢN ADMIN ── */}
          <SectionHead title="Tài khoản Admin NCC" />

          <div className="space-y-1">
            <label className={L}>Email tài khoản Admin <span className="text-red-500">*</span></label>
            <input type="email" className={fieldCls("adminEmail")} placeholder="admin@company.vn"
              value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} />
            <p className="text-[11px] text-muted-foreground">Tài khoản Admin NCC sẽ được tạo và nhận email kích hoạt</p>
            <Err k="adminEmail" />
          </div>

          <div className="space-y-1">
            <label className={L}>Ghi chú nội bộ <span className="text-[10px] font-normal normal-case">(ẩn với NCC)</span></label>
            <textarea className={`${F} border-border resize-none`} rows={3} placeholder="Ghi chú cho SysAdmin…"
              value={form.internalNote} onChange={(e) => set("internalNote", e.target.value)} />
          </div>

          {/* Summary errors */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Vui lòng kiểm tra lại {Object.keys(errors).length} trường còn lỗi trước khi gửi.</p>
            </div>
          )}
        </div>

        {/* Discard confirm banner */}
        {showDiscard && (
          <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center gap-3 text-[12.5px] shrink-0">
            <span className="flex-1 text-amber-800 font-medium">Huỷ sẽ mất tất cả dữ liệu đã nhập. Xác nhận?</span>
            <button onClick={() => setShowDiscard(false)}
              className="px-3 py-1.5 border border-amber-300 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors">
              Tiếp tục nhập
            </button>
            <button onClick={confirmDiscard}
              className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-medium hover:bg-amber-800 transition-colors">
              Bỏ thay đổi
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0">
          <button type="button" onClick={handleCancel}
            className="flex-1 py-2 border border-border rounded-lg text-[13px] font-medium hover:bg-secondary transition-colors">
            Huỷ
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60 transition-colors"
            style={{ backgroundColor: "#990803" }}>
            {submitting
              ? <span className="flex items-center justify-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang onboard…</span>
              : "Onboard NCC"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  TAB: DANH SÁCH NCC                                              */
/* ================================================================ */
const PAGE_SIZE = 5;

function NccListTab() {
  const [records, setRecords]         = useState<NccRecord[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [filterType, setFilterType]   = useState<NccType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<NccStatus | "all">("all");
  const [page, setPage]               = useState(1);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fake initial load
  useEffect(() => {
    const t = setTimeout(() => { setRecords(NCC_RECORDS); setIsLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  // Debounce search
  const handleSearch = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebounced(val); setPage(1); }, 400);
  };

  // Reset page when filters change
  const applyType = (v: NccType | "all") => { setFilterType(v); setPage(1); };
  const applyStatus = (v: NccStatus | "all") => { setFilterStatus(v); setPage(1); };

  const hasFilter = search !== "" || filterType !== "all" || filterStatus !== "all";
  const clearFilter = () => { setSearch(""); setDebounced(""); setFilterType("all"); setFilterStatus("all"); setPage(1); };

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return records.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.code.toLowerCase().includes(q)) return false;
      if (filterType !== "all"   && r.nccType !== filterType)   return false;
      if (filterStatus !== "all" && r.status !== filterStatus)  return false;
      return true;
    });
  }, [records, debouncedSearch, filterType, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSuspend = (id: string, reason: string) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: "suspended" } : r));
    toast.info(`Đã đình chỉ NCC — ${reason.slice(0, 50)}${reason.length > 50 ? "…" : ""}`);
  };
  const handleActivate = (id: string) => {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: "active" } : r));
    toast.success("Đã kích hoạt lại NCC");
  };

  const SELECT = "px-2.5 py-1.5 border border-border rounded-lg bg-background text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#92400e]/40";

  return (
    <>
      <OnboardDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="space-y-5">
        <PageHeader
          icon={Factory}
          title="Danh sách NCC"
          subtitle="Quản lý toàn bộ nhà cung cấp — nội dung, thiết bị và hợp đồng."
          accentColor="#92400e"
          actions={
            <button onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-semibold text-white"
              style={{ backgroundColor: "#92400e" }}>
              <Plus className="w-3.5 h-3.5" /> Onboard NCC mới
            </button>
          }
        />
        <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
            <input
              className="w-full pl-8 pr-8 py-1.5 border border-border rounded-lg bg-background text-[12.5px] focus:outline-none focus:ring-1 focus:ring-[#92400e]/40 placeholder:text-muted-foreground/60"
              placeholder="Tìm theo tên hoặc mã NCC"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => handleSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Loại NCC */}
          <select className={SELECT} value={filterType}
            onChange={(e) => applyType(e.target.value as NccType | "all")}>
            <option value="all">Tất cả loại</option>
            <option value="content">Nội dung</option>
            <option value="device">Thiết bị</option>
            <option value="both">Nội dung & Thiết bị</option>
          </select>

          {/* Trạng thái */}
          <select className={SELECT} value={filterStatus}
            onChange={(e) => applyStatus(e.target.value as NccStatus | "all")}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm ngừng</option>
            <option value="trial">Dùng thử</option>
          </select>

          {/* Clear filters */}
          {hasFilter && (
            <button onClick={clearFilter}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Xoá bộ lọc
            </button>
          )}

        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left w-10" />
                <th className="px-4 py-2.5 text-left">Nhà cung cấp</th>
                <th className="px-4 py-2.5 text-left">Mã NCC</th>
                <th className="px-4 py-2.5 text-left">Loại</th>
                <th className="px-4 py-2.5 text-center">Chương trình</th>
                <th className="px-4 py-2.5 text-center">Học liệu</th>
                <th className="px-4 py-2.5 text-center">Trường dùng</th>
                <th className="px-4 py-2.5 text-center">Vi phạm chờ</th>
                <th className="px-4 py-2.5 text-left">Trạng thái</th>
                <th className="px-4 py-2.5 text-left">Onboard</th>
                <th className="px-4 py-2.5 text-right w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={11}>
                    <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
                      <Factory className="w-10 h-10 opacity-20" />
                      <p className="text-[13px] font-medium">Không tìm thấy NCC nào</p>
                      {hasFilter && (
                        <button onClick={clearFilter}
                          className="text-[12px] text-[#92400e] hover:underline">
                          Xoá bộ lọc để xem tất cả
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((ncc) => {
                  const typeCfg   = NCC_TYPE_CFG[ncc.nccType];
                  const statusCfg = NCC_STATUS_CFG[ncc.status];
                  const initials  = getInitials(ncc.name);
                  const bgColor   = avatarColor(ncc.id);

                  return (
                    <tr key={ncc.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Avatar */}
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                          style={{ backgroundColor: bgColor }}>
                          {initials}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <Link to={`/admin/organizations/${ncc.id}`}
                          className="font-semibold hover:text-[#92400e] hover:underline transition-colors">
                          {ncc.name}
                        </Link>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3 font-mono text-muted-foreground text-[11px]">{ncc.code}</td>

                      {/* Loại badge */}
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                          style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}>
                          {typeCfg.label}
                        </span>
                      </td>

                      {/* Programs */}
                      <td className="px-4 py-3 text-center font-semibold">{ncc.programs}</td>

                      {/* Materials */}
                      <td className="px-4 py-3 text-center">{ncc.materials}</td>

                      {/* Schools */}
                      <td className="px-4 py-3 text-center">{ncc.schools}</td>

                      {/* Violations */}
                      <td className="px-4 py-3 text-center">
                        {ncc.pendingViolations > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[11px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            {ncc.pendingViolations}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                          style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: statusCfg.dot }} />
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Onboarded */}
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(ncc.onboardedAt)}</td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          ncc={ncc}
                          onSuspend={(reason) => handleSuspend(ncc.id, reason)}
                          onActivate={() => handleActivate(ncc.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between text-[12px] text-muted-foreground">
            <span>
              Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} trong{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span> kết quả
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 rounded text-[11.5px] font-medium transition-colors
                    ${safePage === i + 1
                      ? "text-white"
                      : "hover:bg-secondary"}`}
                  style={safePage === i + 1 ? { backgroundColor: "#92400e" } : {}}>
                  {i + 1}
                </button>
              ))}
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  NCC CONTENT DETAIL DRAWER                                       */
/* ================================================================ */
function NccContentDrawer({ ncc, onClose }: { ncc: NccRecord; onClose: () => void }) {
  const programs    = NCC_PROGRAMS[ncc.id] ?? [];
  const schools     = NCC_SCHOOL_SAMPLE[ncc.id] ?? [];
  const info        = NCC_INFO[ncc.id];
  const contractCfg = info ? CONTRACT_STATUS_CFG[info.contractStatus] : null;
  const typeCfg     = NCC_TYPE_CFG[ncc.nccType];
  const statusCfg   = NCC_STATUS_CFG[ncc.status];
  const initials    = getInitials(ncc.name);
  const bgColor     = avatarColor(ncc.id);

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[15px] font-bold shrink-0"
            style={{ backgroundColor: bgColor }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] truncate">{ncc.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-[11px] text-muted-foreground">{ncc.code}</span>
              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}>{typeCfg.label}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                {statusCfg.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Stat mini-cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Chương trình", value: ncc.programs,  color: "#6d28d9" },
              { label: "Học liệu",     value: ncc.materials, color: "#0e7490" },
              { label: "Trường dùng",  value: ncc.schools,   color: "#15803d" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-secondary/50 rounded-xl p-3 text-center">
                <p className="font-bold text-[22px] leading-none" style={{ color }}>{value}</p>
                <p className="text-[11px] text-muted-foreground mt-1.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Contract */}
          {contractCfg && info && (
            <div className="rounded-xl border border-border p-4 space-y-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Hợp đồng</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ color: contractCfg.color, backgroundColor: contractCfg.bg }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: contractCfg.dot }} />
                  {contractCfg.label}
                </span>
                <span className="text-[12px] text-muted-foreground">Hết hạn: {formatDate(info.contractEnd)}</span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Gói STEM: <span className="font-medium text-foreground">{info.stemTier}</span>
              </p>
            </div>
          )}

          {/* Violations warning */}
          {ncc.pendingViolations > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[12.5px] text-red-700 font-medium">
                {ncc.pendingViolations} vi phạm đang chờ xử lý
              </p>
            </div>
          )}

          {/* Programs list */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
              Chương trình học ({programs.length})
            </p>
            {programs.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground italic pl-1">Chưa có chương trình nào</p>
            ) : (
              <div className="space-y-2">
                {programs.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-secondary/40 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[13px]">{p.name}</p>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">{p.grades}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-[13px]">{p.materialCount}</p>
                        <p className="text-[10px] text-muted-foreground">học liệu</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[13px]">{p.schoolCount}</p>
                        <p className="text-[10px] text-muted-foreground">trường</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schools sample */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
              Mẫu trường đang sử dụng ({ncc.schools} trường)
            </p>
            <div className="space-y-1.5">
              {schools.map((s) => (
                <div key={s.id}
                  className="flex items-center justify-between bg-secondary/40 rounded-xl px-4 py-2.5">
                  <p className="font-medium text-[12.5px]">{s.name}</p>
                  <span className="text-[11px] text-muted-foreground">{s.province}</span>
                </div>
              ))}
              {ncc.schools > schools.length && (
                <p className="text-[11px] text-muted-foreground pl-2">
                  và {ncc.schools - schools.length} trường khác…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  TAB: GIÁM SÁT NỘI DUNG & GÓI STEM                             */
/* ================================================================ */
function ContentMonitorTab() {
  const [selectedNcc, setSelectedNcc] = useState<NccRecord | null>(null);
  const [pkgMatrix, setPkgMatrix]     = useState<Record<string, Record<StemPkg, PkgStatus>>>(INIT_PKG_MATRIX);

  const totalPrograms  = NCC_RECORDS.reduce((s, n) => s + n.programs,  0);
  const totalMaterials = NCC_RECORDS.reduce((s, n) => s + n.materials, 0);
  const totalSchools   = NCC_RECORDS.reduce((s, n) => s + n.schools,   0);

  const handlePkgToggle = (nccId: string, pkg: StemPkg, current: PkgStatus) => {
    const next: PkgStatus = current === "none" ? "active" : "none";
    setPkgMatrix((prev) => ({ ...prev, [nccId]: { ...prev[nccId], [pkg]: next } }));
    const nccName = NCC_RECORDS.find((n) => n.id === nccId)?.name ?? nccId;
    toast[next === "active" ? "success" : "info"](
      next === "active" ? `Đã cấp ${pkg} cho ${nccName}` : `Đã thu hồi ${pkg} khỏi ${nccName}`
    );
  };

  const handlePkgApprove = (nccId: string, pkg: StemPkg) => {
    setPkgMatrix((prev) => ({ ...prev, [nccId]: { ...prev[nccId], [pkg]: "active" } }));
    const nccName = NCC_RECORDS.find((n) => n.id === nccId)?.name ?? nccId;
    toast.success(`Đã duyệt ${pkg} cho ${nccName}`);
  };

  return (
    <>
    {selectedNcc && <NccContentDrawer ncc={selectedNcc} onClose={() => setSelectedNcc(null)} />}
    <div className="space-y-6">
      <PageHeader
        icon={BarChart2}
        title="Giám sát nội dung & Gói STEM"
        subtitle="Theo dõi chương trình học, học liệu và phân bổ gói STEM của từng nhà cung cấp."
        accentColor="#0e7490"
      />

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Tổng chương trình",  value: totalPrograms,  color: "#6d28d9", sub: "trên toàn hệ thống" },
          { label: "Tổng học liệu",      value: totalMaterials, color: "#0e7490", sub: "đã xuất bản"        },
          { label: "Trường đang dùng",   value: totalSchools,   color: "#15803d", sub: "lượt triển khai"    },
          { label: "Vi phạm đang mở",    value: MOCK_VIOLATIONS.filter((v) => v.status === "open").length,
                                         color: "#dc2626",      sub: "cần xử lý"                          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground text-[11px]">{label}</p>
            <p className="font-bold text-[22px] mt-0.5 leading-none" style={{ color }}>{value}</p>
            <p className="text-[10.5px] text-muted-foreground mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Section 1: NCC table ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-[13px]">Thống kê nội dung theo NCC</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Click vào hàng để xem chi tiết chương trình học và trường sử dụng</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-[11px] font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Nhà cung cấp</th>
                <th className="px-4 py-2.5 text-left">Loại</th>
                <th className="px-4 py-2.5 text-center">Chương trình</th>
                <th className="px-4 py-2.5 text-center">Học liệu</th>
                <th className="px-4 py-2.5 text-center">Trường dùng</th>
                <th className="px-4 py-2.5 text-left">Gói STEM</th>
                <th className="px-4 py-2.5 text-left">Hợp đồng</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {NCC_RECORDS.map((ncc) => {
                const typeCfg     = NCC_TYPE_CFG[ncc.nccType];
                const info        = NCC_INFO[ncc.id];
                const contractCfg = info ? CONTRACT_STATUS_CFG[info.contractStatus] : null;
                return (
                  <tr key={ncc.id}
                    className="cursor-pointer transition-colors hover:bg-secondary/20"
                    onClick={() => setSelectedNcc(ncc)}>
                    <td className="px-4 py-3 font-medium">{ncc.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                        style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}>
                        {typeCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{ncc.programs}</td>
                    <td className="px-4 py-3 text-center">{ncc.materials}</td>
                    <td className="px-4 py-3 text-center">{ncc.schools}</td>
                    <td className="px-4 py-3 text-[11.5px] text-muted-foreground">{info?.stemTier ?? "—"}</td>
                    <td className="px-4 py-3">
                      {contractCfg && info ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ color: contractCfg.color, backgroundColor: contractCfg.bg }}>
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: contractCfg.dot }} />
                            {contractCfg.label}
                          </span>
                          <p className="text-[10.5px] text-muted-foreground mt-0.5">HH: {formatDate(info.contractEnd)}</p>
                        </div>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: Package matrix ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-[13px]">Ma trận gói STEM (CT1–CT5)</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Quản lý quyền cung cấp nội dung theo từng chương trình khung</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold min-w-[160px]">Nhà cung cấp</th>
                {STEM_PKGS.map((pkg) => {
                  const cfg = STEM_PKG_CFG[pkg];
                  return (
                    <th key={pkg} className="px-3 py-3 text-center min-w-[108px]">
                      <div className="text-[11.5px] font-bold" style={{ color: cfg.color }}>{pkg}</div>
                      <div className="text-[10px] font-normal">{cfg.desc}</div>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-center text-[11px] font-semibold w-20">Tổng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {NCC_RECORDS.map((ncc) => {
                const pkgs         = pkgMatrix[ncc.id] ?? {} as Record<StemPkg, PkgStatus>;
                const activeCount  = STEM_PKGS.filter((p) => pkgs[p] === "active").length;
                const pendingCount = STEM_PKGS.filter((p) => pkgs[p] === "pending").length;
                return (
                  <tr key={ncc.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[12.5px]">{ncc.name}</p>
                      <p className="text-[10.5px] font-mono text-muted-foreground">{ncc.code}</p>
                    </td>
                    {STEM_PKGS.map((pkg) => {
                      const cfg    = STEM_PKG_CFG[pkg];
                      const status = pkgs[pkg] ?? "none";
                      return (
                        <td key={pkg} className="px-3 py-3 text-center">
                          {status === "active" && (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ color: cfg.color, backgroundColor: cfg.bg }}>Đã cấp</span>
                              <button onClick={() => handlePkgToggle(ncc.id, pkg, status)}
                                className="text-[10px] text-red-400 hover:text-red-600 hover:underline transition-colors">
                                Thu hồi
                              </button>
                            </div>
                          )}
                          {status === "pending" && (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                                Chờ duyệt
                              </span>
                              <button onClick={() => handlePkgApprove(ncc.id, pkg)}
                                className="text-[10px] text-green-600 hover:underline font-medium transition-colors">
                                Duyệt
                              </button>
                            </div>
                          )}
                          {status === "none" && (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[11px] text-muted-foreground/40">—</span>
                              <button onClick={() => handlePkgToggle(ncc.id, pkg, status)}
                                className="text-[10px] text-[#0e7490] hover:underline transition-colors">
                                Cấp
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      <span className="font-semibold text-[12px]" style={{ color: activeCount > 0 ? "#15803d" : "#94a3b8" }}>
                        {activeCount}
                        {pendingCount > 0 && <span className="text-amber-500 ml-0.5">+{pendingCount}</span>}
                        /5
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

/* ================================================================ */
/*  TAB: XỬ LÝ VI PHẠM                                             */
/* ================================================================ */
function ViolationsTab() {
  const STATUS_CFG = {
    open:     { label: "Đang xử lý",    color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
    resolved: { label: "Đã giải quyết", color: "#15803d", bg: "#dcfce7", icon: CheckCircle   },
    pending:  { label: "Chờ xem xét",   color: "#b45309", bg: "#fef3c7", icon: Clock         },
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ScrollText}
        title="Xử lý vi phạm"
        subtitle="Theo dõi và xử lý các vi phạm nội dung, bản quyền từ nhà cung cấp."
        accentColor="#dc2626"
      />
      <div className="grid grid-cols-3 gap-3">
        {(["open", "pending", "resolved"] as const).map((s) => {
          const cfg   = STATUS_CFG[s];
          const count = MOCK_VIOLATIONS.filter((v) => v.status === s).length;
          return (
            <div key={s} className="rounded-xl border border-border p-4 flex items-center gap-3"
              style={{ backgroundColor: cfg.bg + "60" }}>
              <cfg.icon className="w-5 h-5 shrink-0" style={{ color: cfg.color }} />
              <div>
                <p className="text-[11px] text-muted-foreground">{cfg.label}</p>
                <p className="font-bold text-[18px]" style={{ color: cfg.color }}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {MOCK_VIOLATIONS.map((v) => {
          const cfg = STATUS_CFG[v.status];
          return (
            <div key={v.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    <cfg.icon className="w-3 h-3" /> {cfg.label}
                  </span>
                  <span className="text-[12px] font-semibold text-red-700">{v.type}</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0">{v.id}</span>
              </div>
              <p className="text-[12.5px]">{v.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Factory className="w-3 h-3" /> {v.nccName}
                </span>
                <span>Phát hiện: {formatDate(v.detectedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN                                                            */
/* ================================================================ */
export function SupplierManagement() {
  const { pathname } = useLocation();
  if (pathname === "/admin/suppliers/content")    return <ContentMonitorTab />;
  if (pathname === "/admin/suppliers/violations") return <ViolationsTab />;
  return <NccListTab />;
}
