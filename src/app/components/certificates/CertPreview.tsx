import { Award } from "lucide-react";

// ── Shared Types ──
export interface CertTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  style: "classic" | "modern" | "elegant" | "minimal";
  hasQR: boolean;
  hasSeal: boolean;
  hasLogo: boolean;
  hasWatermark: boolean;
  bgPattern: "border" | "gradient" | "ornate" | "none";
  signer1Name: string;
  signer1Title: string;
  signer2Name: string;
  signer2Title: string;
  headerText: string;
  subHeaderText: string;
  footerNote: string;
  isDefault: boolean;
  createdAt: string;
  usageCount: number;

  // ── V2 Extended Fields (all optional for backward compat) ──
  orientation?: "landscape" | "portrait";
  paperSize?: "a4" | "letter" | "custom";
  customWidth?: number;
  customHeight?: number;

  // Typography
  fontFamily?: "serif" | "sans" | "mono" | "display" | "handwriting";
  titleSize?: number;        // px for SVG
  subtitleSize?: number;
  bodySize?: number;
  nameSize?: number;
  letterSpacing?: number;

  // Advanced background
  bgPattern2?: "certificate-border" | "double-line" | "greek-key" | "floral-corner" | "ribbon-top" | "wave-bottom" | "dots" | "none";
  borderThickness?: number;  // 1-5
  borderRadius?: number;     // 0-20
  bgOpacity?: number;        // 0-100

  // Decorative elements
  hasRibbon?: boolean;
  ribbonText?: string;
  hasCornerOrnaments?: boolean;
  hasDividerOrnament?: boolean;
  dividerStyle?: "line" | "ornate" | "dots" | "diamond" | "laurel";
  hasTopBar?: boolean;
  topBarHeight?: number;
  hasBottomBar?: boolean;

  // Element positions
  logoPosition?: "top-center" | "top-left" | "top-right";
  logoSize?: number;           // 20-60
  qrPosition?: "bottom-right" | "bottom-left" | "top-right";
  qrSize?: number;             // 30-60
  sealPosition?: "center" | "left" | "right" | "between-signers";
  sealSize?: number;           // 20-50

  // Content options
  showScore?: boolean;
  showDates?: boolean;
  showCertNo?: boolean;
  showValidity?: boolean;
  bodyTemplate?: string;       // Custom certification text
  completionLabel?: string;    // "hoàn thành xuất sắc" / "đã hoàn thành" / etc

  // Multi-signer (3rd)
  signer3Name?: string;
  signer3Title?: string;
  signerLayout?: "2-sides" | "3-across" | "center-only";

  // Organization
  tags?: string[];
  category?: "general" | "banking" | "energy" | "construction" | "mining" | "insurance" | "onboarding" | "compliance";
  version?: number;
  lastModified?: string;

  // ── V3 Drag-and-drop absolute positions (override preset positions) ──
  logoXY?: { x: number; y: number };
  qrXY?: { x: number; y: number };
  sealXY?: { x: number; y: number };
  headerXY?: { x: number; y: number };
  subtitleXY?: { x: number; y: number };
  signer1XY?: { x: number; y: number };
  signer2XY?: { x: number; y: number };
  signer3XY?: { x: number; y: number };
}

export interface CertRecord {
  id: string;
  certificateNo: string;
  studentId: string;
  studentName: string;
  courseName: string;
  courseId: string;
  category: string;
  department: string;
  subsidiary: string;
  score: number;
  passingScore: number;
  completedAt: string;
  issuedAt: string;
  expiryDate: string;
  status: "issued" | "pending" | "expired" | "revoked";
  templateId: string;
  downloadCount: number;
  verificationUrl: string;
}

export interface CertApproval {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  subsidiary: string;
  courseId: string;
  courseName: string;
  score: number;
  completedAt: string;
  requestedAt: string;
  conditions: { label: string; met: boolean }[];
  instructorApproved: boolean | null;
  instructorName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface VerificationLog {
  id: string;
  certificateNo: string;
  studentName: string;
  verifiedAt: string;
  source: "qr" | "web" | "api";
  result: "valid" | "expired" | "revoked" | "not_found";
  ipAddress: string;
}

export interface IssuanceRule {
  id: string;
  courseName: string;
  category: string;
  templateId: string;
  templateName: string;
  conditions: {
    completionRequired: boolean;
    minScore: number;
    certExamRequired: boolean;
    instructorApproval: boolean;
  };
  validity: "permanent" | "1year" | "2year" | "custom";
  validityDays?: number;
  renewalPolicy: "retake_exam" | "retake_course" | "auto" | "none";
  approvalWorkflow: "auto" | "instructor" | "manager" | "director";
  codeFormat: string;
  emailNotify: boolean;
  isActive: boolean;
}

// ── Font family map ──
const FONT_MAP: Record<string, string> = {
  serif: "'Georgia', 'Times New Roman', serif",
  sans: "'Segoe UI', 'Helvetica Neue', sans-serif",
  mono: "'Courier New', Consolas, monospace",
  display: "'Georgia', 'Palatino', serif",
  handwriting: "'Brush Script MT', 'Segoe Script', cursive",
};

// ── Default Templates ──
export const DEFAULT_TEMPLATES: CertTemplate[] = [
  {
    id: "T1", name: "Geleximco Classic", description: "Mẫu truyền thống với viền vàng và seal chính thống",
    primaryColor: "#990803", accentColor: "#c8a84e", style: "classic",
    hasQR: true, hasSeal: true, hasLogo: true, hasWatermark: false,
    bgPattern: "border",
    signer1Name: "Nguyễn Văn Minh", signer1Title: "Giám đốc Đào tạo",
    signer2Name: "Vũ Văn Tiền", signer2Title: "Chủ tịch Tập đoàn",
    headerText: "TẬP ĐOÀN GELEXIMCO", subHeaderText: "CHỨNG CHỈ ĐÀO TẠO",
    footerNote: "Chứng chỉ có giá trị trong toàn Tập đoàn",
    isDefault: true, createdAt: "2025-01-15", usageCount: 842,
    orientation: "landscape", fontFamily: "serif", hasCornerOrnaments: true,
    hasDividerOrnament: true, dividerStyle: "ornate", showScore: true, showDates: true, showCertNo: true,
    completionLabel: "đã hoàn thành xuất sắc khóa đào tạo",
    category: "general", version: 3, tags: ["chính thức", "tập đoàn"],
  },
  {
    id: "T2", name: "Modern Professional", description: "Phong cách hiện đại với gradient xanh",
    primaryColor: "#1e293b", accentColor: "#3b82f6", style: "modern",
    hasQR: true, hasSeal: false, hasLogo: true, hasWatermark: true,
    bgPattern: "gradient",
    signer1Name: "Trần Thị Hương", signer1Title: "Trưởng phòng Nhân sự",
    signer2Name: "Nguyễn Văn Minh", signer2Title: "Giám đốc Đào tạo",
    headerText: "GELEXIMCO GROUP", subHeaderText: "TRAINING CERTIFICATE",
    footerNote: "This certificate is verified digitally",
    isDefault: false, createdAt: "2025-03-20", usageCount: 234,
    orientation: "landscape", fontFamily: "sans", hasTopBar: true, topBarHeight: 8,
    dividerStyle: "line", showScore: true, showDates: true, showCertNo: true,
    completionLabel: "has successfully completed the training program",
    category: "general", version: 2, tags: ["hiện đại", "song ngữ"],
  },
  {
    id: "T3", name: "Elegant Gold", description: "Sang trọng với viền vàng ornate",
    primaryColor: "#1a1a2e", accentColor: "#c8a84e", style: "elegant",
    hasQR: true, hasSeal: true, hasLogo: true, hasWatermark: false,
    bgPattern: "ornate",
    signer1Name: "Nguyễn Văn Minh", signer1Title: "Giám đốc Đào tạo",
    signer2Name: "Vũ Văn Tiền", signer2Title: "Chủ tịch Tập đoàn",
    headerText: "TẬP ĐOÀN GELEXIMCO", subHeaderText: "CHỨNG NHẬN ĐÀO TẠO",
    footerNote: "Chứng chỉ được bảo vệ bằng chữ ký số",
    isDefault: false, createdAt: "2025-06-01", usageCount: 156,
    orientation: "landscape", fontFamily: "display", hasCornerOrnaments: true,
    hasDividerOrnament: true, dividerStyle: "laurel", hasRibbon: true, ribbonText: "EXCELLENCE",
    showScore: true, showDates: true, showCertNo: true,
    completionLabel: "đã hoàn thành xuất sắc khóa đào tạo",
    category: "general", version: 2, tags: ["sang trọng", "lãnh đạo"],
  },
  {
    id: "T4", name: "Minimal Clean", description: "Tối giản, phù hợp in ấn",
    primaryColor: "#374151", accentColor: "#990803", style: "minimal",
    hasQR: false, hasSeal: false, hasLogo: true, hasWatermark: false,
    bgPattern: "none",
    signer1Name: "Nguyễn Văn Minh", signer1Title: "Giám đốc Đào tạo",
    signer2Name: "", signer2Title: "",
    headerText: "GELEXIMCO", subHeaderText: "CERTIFICATE",
    footerNote: "",
    isDefault: false, createdAt: "2025-08-10", usageCount: 78,
    orientation: "landscape", fontFamily: "sans", dividerStyle: "line",
    showScore: false, showDates: true, showCertNo: true, signerLayout: "center-only",
    completionLabel: "has completed",
    category: "onboarding", version: 1, tags: ["tối giản", "onboarding"],
  },
];

// ── Helper: resolve defaults ──
function r(tpl: CertTemplate) {
  return {
    orientation: tpl.orientation || "landscape",
    fontFamily: FONT_MAP[tpl.fontFamily || "serif"],
    titleSize: tpl.titleSize || 26,
    subtitleSize: tpl.subtitleSize || 13,
    bodySize: tpl.bodySize || 11,
    nameSize: tpl.nameSize || 26,
    letterSpacing: tpl.letterSpacing ?? 4,
    borderThickness: tpl.borderThickness || 3,
    bgOpacity: (tpl.bgOpacity ?? 100) / 100,
    logoPosition: tpl.logoPosition || "top-center",
    logoSize: tpl.logoSize || 28,
    qrPosition: tpl.qrPosition || "bottom-right",
    qrSize: tpl.qrSize || 22,
    sealPosition: tpl.sealPosition || "between-signers",
    sealSize: tpl.sealSize || 28,
    dividerStyle: tpl.dividerStyle || "ornate",
    showScore: tpl.showScore ?? true,
    showDates: tpl.showDates ?? true,
    showCertNo: tpl.showCertNo ?? true,
    completionLabel: tpl.completionLabel || "đã hoàn thành xuất sắc khóa đào tạo",
    signerLayout: tpl.signerLayout || "2-sides",
    topBarHeight: tpl.topBarHeight || 6,
  };
}

// ── SVG Preview Component ──
export function CertificatePreviewSVG({
  template,
  studentName = "Nguyễn Văn A",
  courseName = "Khóa đào tạo mẫu",
  score = 85,
  issuedDate = "15/01/2026",
  expiryDate = "15/01/2027",
  certNo = "GXC-2026-00001",
  compact = false,
}: {
  template: CertTemplate;
  studentName?: string;
  courseName?: string;
  score?: number;
  issuedDate?: string;
  expiryDate?: string;
  certNo?: string;
  compact?: boolean;
}) {
  const isPortrait = (template.orientation || "landscape") === "portrait";
  const w = isPortrait ? 566 : 800;
  const h = isPortrait ? 800 : 566;
  const pc = template.primaryColor;
  const ac = template.accentColor;
  const d = r(template);
  const cx = w / 2;

  // Vertical layout positions (adaptive for portrait vs landscape)
  const logoY = isPortrait ? 80 : 72;
  const headerY = isPortrait ? 135 : 122;
  const subtitleY = isPortrait ? 175 : 158;
  const dividerY = isPortrait ? 210 : 195;
  const certLabelY = isPortrait ? 240 : 225;
  const nameY = isPortrait ? 285 : 262;
  const nameDivY = isPortrait ? 300 : 275;
  const bodyY = isPortrait ? 325 : 300;
  const courseY = isPortrait ? 355 : 325;
  const infoY = isPortrait ? 385 : 350;
  const certNoY = isPortrait ? 420 : 385;
  const footerY = isPortrait ? 445 : 405;
  const signerY = isPortrait ? 540 : 465;

  return (
    <div className={`relative bg-white rounded-xl overflow-hidden shadow-lg ${compact ? "" : "shadow-xl"}`} style={{ aspectRatio: isPortrait ? "0.707/1" : "1.414/1" }}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width={w} height={h} fill="white" />

        {/* ── Background Patterns ── */}
        {template.bgPattern === "border" && (
          <g opacity={d.bgOpacity}>
            <rect x="15" y="15" width={w - 30} height={h - 30} fill="none" stroke={ac} strokeWidth={d.borderThickness} />
            <rect x="20" y="20" width={w - 40} height={h - 40} fill="none" stroke={ac} strokeWidth="1" opacity="0.4" />
            {/* Corner circles */}
            {[[30, 30], [w - 30, 30], [30, h - 30], [w - 30, h - 30]].map(([cx2, cy2], i) => (
              <g key={i}>
                <circle cx={cx2} cy={cy2} r="8" fill="none" stroke={ac} strokeWidth="1.5" />
                <circle cx={cx2} cy={cy2} r="3" fill={ac} />
              </g>
            ))}
            <line x1="50" y1="50" x2={w - 50} y2="50" stroke={ac} strokeWidth="0.5" opacity="0.3" />
            <line x1="50" y1={h - 50} x2={w - 50} y2={h - 50} stroke={ac} strokeWidth="0.5" opacity="0.3" />
          </g>
        )}
        {template.bgPattern === "gradient" && (
          <g opacity={d.bgOpacity}>
            <defs>
              <linearGradient id={`bg-grad-${template.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={pc} stopOpacity="0.03" />
                <stop offset="100%" stopColor={ac} stopOpacity="0.06" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={w} height={h} fill={`url(#bg-grad-${template.id})`} />
            {template.hasTopBar && (
              <rect x="0" y="0" width={w} height={d.topBarHeight} fill={ac} />
            )}
            {template.hasBottomBar && (
              <rect x="0" y={h - d.topBarHeight} width={w} height={d.topBarHeight} fill={ac} opacity="0.3" />
            )}
          </g>
        )}
        {template.bgPattern === "ornate" && (
          <g opacity={d.bgOpacity}>
            <rect x="20" y="20" width={w - 40} height={h - 40} fill="none" stroke={ac} strokeWidth="2" />
            <rect x="25" y="25" width={w - 50} height={h - 50} fill="none" stroke={ac} strokeWidth="0.5" opacity="0.3" />
            <path d={`M100,20 Q${cx},55 ${w - 100},20`} fill="none" stroke={ac} strokeWidth="1.5" opacity="0.4" />
            <path d={`M100,${h - 20} Q${cx},${h - 55} ${w - 100},${h - 20}`} fill="none" stroke={ac} strokeWidth="1.5" opacity="0.4" />
            <path d={`M20,150 Q55,${h / 2} 20,${h - 150}`} fill="none" stroke={ac} strokeWidth="1" opacity="0.3" />
            <path d={`M${w - 20},150 Q${w - 55},${h / 2} ${w - 20},${h - 150}`} fill="none" stroke={ac} strokeWidth="1" opacity="0.3" />
          </g>
        )}

        {/* ── Corner Ornaments ── */}
        {template.hasCornerOrnaments && (
          <g opacity="0.25" stroke={ac} strokeWidth="1.5" fill="none">
            {/* Top-left */}
            <path d="M40,60 Q40,40 60,40" />
            <path d="M40,75 Q40,40 75,40" />
            {/* Top-right */}
            <path d={`M${w - 40},60 Q${w - 40},40 ${w - 60},40`} />
            <path d={`M${w - 40},75 Q${w - 40},40 ${w - 75},40`} />
            {/* Bottom-left */}
            <path d={`M40,${h - 60} Q40,${h - 40} 60,${h - 40}`} />
            <path d={`M40,${h - 75} Q40,${h - 40} 75,${h - 40}`} />
            {/* Bottom-right */}
            <path d={`M${w - 40},${h - 60} Q${w - 40},${h - 40} ${w - 60},${h - 40}`} />
            <path d={`M${w - 40},${h - 75} Q${w - 40},${h - 40} ${w - 75},${h - 40}`} />
          </g>
        )}

        {/* ── Ribbon (top-right corner) ── */}
        {template.hasRibbon && template.ribbonText && (
          <g>
            <defs>
              <clipPath id={`ribbon-clip-${template.id}`}>
                <rect x="0" y="0" width={w} height={h} />
              </clipPath>
            </defs>
            <g clipPath={`url(#ribbon-clip-${template.id})`}>
              <rect x={w - 120} y="-20" width="160" height="36" fill={ac} transform={`rotate(45, ${w - 40}, -2)`} />
              <text x={w - 40} y="6" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" letterSpacing="1.5"
                transform={`rotate(45, ${w - 40}, -2)`}>{template.ribbonText}</text>
            </g>
          </g>
        )}

        {/* ── Top Bar ── */}
        {template.hasTopBar && template.bgPattern !== "gradient" && (
          <rect x="0" y="0" width={w} height={d.topBarHeight} fill={ac} />
        )}
        {template.hasBottomBar && template.bgPattern !== "gradient" && (
          <rect x="0" y={h - d.topBarHeight} width={w} height={d.topBarHeight} fill={ac} opacity="0.3" />
        )}

        {/* ── Watermark ── */}
        {template.hasWatermark && (
          <text x={cx} y={h / 2} textAnchor="middle" fill={pc} fontSize={isPortrait ? "80" : "100"} fontWeight="900" opacity="0.03"
            transform={`rotate(-30, ${cx}, ${h / 2})`}>GELEXIMCO</text>
        )}

        {/* ── Logo ── */}
        {template.hasLogo && (() => {
          const lx = template.logoXY ? template.logoXY.x : (d.logoPosition === "top-left" ? 70 : d.logoPosition === "top-right" ? w - 70 : cx);
          const ly = template.logoXY ? template.logoXY.y : logoY;
          const ls = d.logoSize;
          return (
            <g data-drag-id="logo">
              <circle cx={lx} cy={ly} r={ls} fill={pc} opacity="0.1" />
              <circle cx={lx} cy={ly} r={ls - 4} fill="none" stroke={pc} strokeWidth="0.5" opacity="0.15" />
              <text x={lx} y={ly + 7} textAnchor="middle" fill={pc} fontSize={ls * 0.7} fontWeight="900"
                style={{ fontFamily: d.fontFamily }}>G</text>
            </g>
          );
        })()}

        {/* ── Header Text ── */}
        <text x={template.headerXY?.x ?? cx} y={template.headerXY?.y ?? headerY} textAnchor="middle" fill={pc} fontSize={d.subtitleSize} fontWeight="600"
          letterSpacing={d.letterSpacing} style={{ fontFamily: d.fontFamily }} data-drag-id="header">{template.headerText}</text>
        <text x={template.subtitleXY?.x ?? cx} y={template.subtitleXY?.y ?? subtitleY} textAnchor="middle" fill={pc} fontSize={d.titleSize} fontWeight="800"
          style={{ fontFamily: d.fontFamily }} data-drag-id="subtitle">{template.subHeaderText}</text>

        {/* Subtitle decoration */}
        {template.style !== "minimal" && (
          <text x={template.subtitleXY?.x ?? cx} y={(template.subtitleXY?.y ?? subtitleY) + 20} textAnchor="middle" fill={ac} fontSize="10" letterSpacing="2"
            style={{ fontFamily: d.fontFamily }}>TRAINING CERTIFICATE</text>
        )}

        {/* ── Divider ── */}
        {(() => {
          const ds = d.dividerStyle;
          const dx1 = cx - 150;
          const dx2 = cx + 150;
          if (ds === "line") return <line x1={dx1} y1={dividerY} x2={dx2} y2={dividerY} stroke={ac} strokeWidth="1" />;
          if (ds === "dots") return (
            <g>
              {Array.from({ length: 15 }).map((_, i) => (
                <circle key={i} cx={dx1 + i * (300 / 14)} cy={dividerY} r="1.5" fill={ac} opacity={i === 7 ? 1 : 0.4} />
              ))}
            </g>
          );
          if (ds === "diamond") return (
            <g>
              <line x1={dx1} y1={dividerY} x2={cx - 12} y2={dividerY} stroke={ac} strokeWidth="0.8" />
              <rect x={cx - 5} y={dividerY - 5} width="10" height="10" fill={ac} transform={`rotate(45, ${cx}, ${dividerY})`} />
              <line x1={cx + 12} y1={dividerY} x2={dx2} y2={dividerY} stroke={ac} strokeWidth="0.8" />
            </g>
          );
          if (ds === "laurel") return (
            <g opacity="0.5">
              <line x1={dx1} y1={dividerY} x2={cx - 20} y2={dividerY} stroke={ac} strokeWidth="0.8" />
              {/* Left laurel leaf */}
              <path d={`M${cx - 18},${dividerY} Q${cx - 12},${dividerY - 8} ${cx - 4},${dividerY}`} fill="none" stroke={ac} strokeWidth="1" />
              <path d={`M${cx - 18},${dividerY} Q${cx - 12},${dividerY + 8} ${cx - 4},${dividerY}`} fill="none" stroke={ac} strokeWidth="1" />
              {/* Right laurel leaf */}
              <path d={`M${cx + 18},${dividerY} Q${cx + 12},${dividerY - 8} ${cx + 4},${dividerY}`} fill="none" stroke={ac} strokeWidth="1" />
              <path d={`M${cx + 18},${dividerY} Q${cx + 12},${dividerY + 8} ${cx + 4},${dividerY}`} fill="none" stroke={ac} strokeWidth="1" />
              <line x1={cx + 20} y1={dividerY} x2={dx2} y2={dividerY} stroke={ac} strokeWidth="0.8" />
            </g>
          );
          // ornate (default)
          return (
            <g>
              <line x1={dx1} y1={dividerY} x2={dx2} y2={dividerY} stroke={ac} strokeWidth="1" />
              <circle cx={cx} cy={dividerY} r="3" fill={ac} />
            </g>
          );
        })()}

        {/* ── Content ── */}
        <text x={cx} y={certLabelY} textAnchor="middle" fill="#6b7280" fontSize={d.bodySize}
          style={{ fontFamily: d.fontFamily }}>Chứng nhận rằng</text>

        <text x={cx} y={nameY} textAnchor="middle" fill={pc} fontSize={d.nameSize} fontWeight="700"
          style={{ fontFamily: d.fontFamily }}>
          {studentName.length > 30 ? studentName.slice(0, 30) + "..." : studentName}
        </text>
        <line x1={cx - 200} y1={nameDivY} x2={cx + 200} y2={nameDivY} stroke={ac} strokeWidth="0.5" />

        <text x={cx} y={bodyY} textAnchor="middle" fill="#6b7280" fontSize={d.bodySize}
          style={{ fontFamily: d.fontFamily }}>{d.completionLabel}</text>

        <text x={cx} y={courseY} textAnchor="middle" fill={pc} fontSize="14" fontWeight="600"
          style={{ fontFamily: d.fontFamily }}>
          "{courseName.length > 45 ? courseName.slice(0, 45) + "..." : courseName}"
        </text>

        {/* Info line */}
        {(d.showScore || d.showDates) && (
          <text x={cx} y={infoY} textAnchor="middle" fill="#9ca3af" fontSize="10"
            style={{ fontFamily: d.fontFamily }}>
            {[
              d.showScore && `Kết quả: ${score}%`,
              d.showDates && `Ngày cấp: ${issuedDate}`,
              d.showDates && `Hiệu lực đến: ${expiryDate}`,
            ].filter(Boolean).join(" | ")}
          </text>
        )}

        {/* Certificate Number */}
        {d.showCertNo && (
          <text x={cx} y={certNoY} textAnchor="middle" fill={ac} fontSize="10" fontWeight="600"
            style={{ fontFamily: d.fontFamily }}>Số: {certNo}</text>
        )}

        {/* Footer note */}
        {template.footerNote && (
          <text x={cx} y={footerY} textAnchor="middle" fill="#9ca3af" fontSize="8" fontStyle="italic"
            style={{ fontFamily: d.fontFamily }}>{template.footerNote}</text>
        )}

        {/* ── Signers ── */}
        {(() => {
          const sl = d.signerLayout;
          const sy = signerY;
          if (sl === "center-only" && template.signer1Name) {
            const s1x = template.signer1XY?.x ?? cx;
            const s1y = template.signer1XY?.y ?? sy;
            return (
              <g data-drag-id="signer1">
                <text x={s1x} y={s1y} textAnchor="middle" fill={pc} fontSize="12" fontWeight="600" fontStyle="italic" style={{ fontFamily: d.fontFamily }}>{template.signer1Name}</text>
                <line x1={s1x - 90} y1={s1y + 10} x2={s1x + 90} y2={s1y + 10} stroke="#d1d5db" strokeWidth="0.5" />
                <text x={s1x} y={s1y + 25} textAnchor="middle" fill="#6b7280" fontSize="9" style={{ fontFamily: d.fontFamily }}>{template.signer1Title}</text>
              </g>
            );
          }
          if (sl === "3-across") {
            const defPositions = [w * 0.2, cx, w * 0.8];
            const defY = sy;
            const signers = [
              { name: template.signer1Name, title: template.signer1Title, xy: template.signer1XY, dragId: "signer1" },
              { name: template.signer2Name, title: template.signer2Title, xy: template.signer2XY, dragId: "signer2" },
              { name: template.signer3Name || "", title: template.signer3Title || "", xy: template.signer3XY, dragId: "signer3" },
            ].filter(s => s.name);
            return signers.map((s, i) => {
              const sx = s.xy?.x ?? defPositions[i];
              const sy2 = s.xy?.y ?? defY;
              return (
                <g key={i} data-drag-id={s.dragId}>
                  <text x={sx} y={sy2} textAnchor="middle" fill={pc} fontSize="11" fontWeight="600" fontStyle="italic" style={{ fontFamily: d.fontFamily }}>{s.name}</text>
                  <line x1={sx - 70} y1={sy2 + 10} x2={sx + 70} y2={sy2 + 10} stroke="#d1d5db" strokeWidth="0.5" />
                  <text x={sx} y={sy2 + 25} textAnchor="middle" fill="#6b7280" fontSize="8" style={{ fontFamily: d.fontFamily }}>{s.title}</text>
                </g>
              );
            });
          }
          // 2-sides (default)
          const s1x = template.signer1XY?.x ?? (w * 0.26);
          const s1y = template.signer1XY?.y ?? sy;
          const s2x = template.signer2XY?.x ?? (w * 0.74);
          const s2y = template.signer2XY?.y ?? sy;
          return (
            <>
              {template.signer1Name && (
                <g data-drag-id="signer1">
                  <text x={s1x} y={s1y} textAnchor="middle" fill={pc} fontSize="12" fontWeight="600" fontStyle="italic" style={{ fontFamily: d.fontFamily }}>{template.signer1Name}</text>
                  <line x1={s1x - 90} y1={s1y + 10} x2={s1x + 90} y2={s1y + 10} stroke="#d1d5db" strokeWidth="0.5" />
                  <text x={s1x} y={s1y + 25} textAnchor="middle" fill="#6b7280" fontSize="9" style={{ fontFamily: d.fontFamily }}>{template.signer1Title}</text>
                </g>
              )}
              {template.signer2Name && (
                <g data-drag-id="signer2">
                  <text x={s2x} y={s2y} textAnchor="middle" fill={pc} fontSize="12" fontWeight="600" fontStyle="italic" style={{ fontFamily: d.fontFamily }}>{template.signer2Name}</text>
                  <line x1={s2x - 90} y1={s2y + 10} x2={s2x + 90} y2={s2y + 10} stroke="#d1d5db" strokeWidth="0.5" />
                  <text x={s2x} y={s2y + 25} textAnchor="middle" fill="#6b7280" fontSize="9" style={{ fontFamily: d.fontFamily }}>{template.signer2Title}</text>
                </g>
              )}
            </>
          );
        })()}

        {/* ── Seal ── */}
        {template.hasSeal && (() => {
          const sp = d.sealPosition;
          const ss = d.sealSize;
          const sx = template.sealXY ? template.sealXY.x : (sp === "left" ? w * 0.2 : sp === "right" ? w * 0.8 : cx);
          const sy2 = template.sealXY ? template.sealXY.y : (signerY - 10);
          return (
            <g transform={`translate(${sx}, ${sy2})`} data-drag-id="seal">
              <circle r={ss} fill="none" stroke={ac} strokeWidth="2" opacity="0.4" />
              <circle r={ss - 6} fill="none" stroke={ac} strokeWidth="0.8" opacity="0.3" />
              <circle r={ss - 12} fill="none" stroke={ac} strokeWidth="0.4" opacity="0.2" />
              <text textAnchor="middle" y="-3" fill={ac} fontSize="6" fontWeight="700" opacity="0.4">GELEXIMCO</text>
              <text textAnchor="middle" y="7" fill={ac} fontSize="5" opacity="0.3">SEAL</text>
            </g>
          );
        })()}

        {/* ── QR Code ── */}
        {template.hasQR && (() => {
          const qs = d.qrSize;
          const qp = d.qrPosition;
          const qx = template.qrXY ? template.qrXY.x : (qp === "bottom-left" ? 45 + qs : qp === "top-right" ? w - 45 - qs : w - 45 - qs);
          const qy = template.qrXY ? template.qrXY.y : (qp === "top-right" ? 45 + qs : h - 45 - qs);
          return (
            <g transform={`translate(${qx}, ${qy})`} data-drag-id="qr">
              <rect x={-qs} y={-qs} width={qs * 2} height={qs * 2} rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="0.5" />
              {[[-0.55, -0.55], [-0.27, -0.55], [0, -0.55], [0.27, -0.55], [-0.55, -0.27], [0.27, -0.27],
                [-0.55, 0], [0, 0], [0.27, 0], [-0.55, 0.27], [-0.27, 0.27], [0, 0.27], [0.27, 0.27],
              ].map(([rx, ry], i) => (
                <rect key={i} x={rx * qs} y={ry * qs} width={qs * 0.2} height={qs * 0.2} fill="#374151" opacity="0.5" rx="0.5" />
              ))}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Compact card preview ──
export function CertMiniPreview({ template }: { template: CertTemplate }) {
  const isPortrait = (template.orientation || "landscape") === "portrait";
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200"
      style={{
        aspectRatio: isPortrait ? "0.707/1" : "1.414/1",
        background: `linear-gradient(135deg, ${template.primaryColor}08, ${template.accentColor}08)`,
      }}>
      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 relative">
        {/* Top bar indicator */}
        {template.hasTopBar && (
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: template.accentColor }} />
        )}
        {/* Ribbon indicator */}
        {template.hasRibbon && (
          <div className="absolute top-0 right-0 w-4 h-4" style={{
            background: `linear-gradient(135deg, transparent 50%, ${template.accentColor} 50%)`,
          }} />
        )}
        {template.hasLogo && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${template.primaryColor}15` }}>
            <span style={{ fontSize: "8px", fontWeight: 800, color: template.primaryColor }}>G</span>
          </div>
        )}
        <span className="text-gray-400" style={{ fontSize: "6px", letterSpacing: "1px" }}>{template.subHeaderText}</span>
        <div className="w-8 h-px my-0.5" style={{ background: template.accentColor, opacity: 0.4 }} />
        <span className="text-gray-500" style={{ fontSize: "7px" }}>Tên học viên</span>
        <span className="text-gray-400" style={{ fontSize: "5px" }}>Khóa đào tạo</span>
        <div className="flex gap-2 mt-1">
          {template.hasSeal && <div className="w-3 h-3 rounded-full border" style={{ borderColor: `${template.accentColor}60` }} />}
          {template.hasQR && <div className="w-3 h-3 rounded-sm bg-gray-200" />}
        </div>
        {/* Orientation indicator */}
        {isPortrait && (
          <span className="text-gray-300" style={{ fontSize: "4px" }}>PORTRAIT</span>
        )}
      </div>
    </div>
  );
}

// ── Status helpers ──
export const STATUS_CONFIG = {
  issued: { label: "Đã cấp", color: "#22c55e", bg: "#22c55e15" },
  pending: { label: "Chờ cấp", color: "#f59e0b", bg: "#f59e0b15" },
  expired: { label: "Hết hạn", color: "#6b7280", bg: "#6b728015" },
  revoked: { label: "Thu hồi", color: "#ef4444", bg: "#ef444415" },
};