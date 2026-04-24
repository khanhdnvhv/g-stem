import type { ReactNode } from "react";
import type {
  StemProgram, StemPackageTier, TenantType,
  EquipmentStatus, WarrantyStatus, OrderStatus,
} from "../../mock-data/types";
import { STEM_PROGRAMS, STEM_TIERS } from "../../mock-data/constants";
import { tenantTypeLabelsMap } from "../../AuthContext";

/* ================================================================ */
/*  STEM Badges — tái sử dụng xuyên suốt Phase 3-7                   */
/* ================================================================ */

function Chip({ color, bg, children, size = "sm" }: {
  color: string; bg: string; children: ReactNode; size?: "xs" | "sm" | "md";
}) {
  const pad = size === "xs" ? "px-1.5 py-0.5" : size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  const fs = size === "xs" ? 9 : size === "md" ? 12 : 10;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${pad}`}
      style={{ fontSize: `${fs}px`, color, backgroundColor: bg, fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

export function ProgramBadge({ code, size = "sm", showName = false }: {
  code: StemProgram; size?: "xs" | "sm" | "md"; showName?: boolean;
}) {
  const meta = STEM_PROGRAMS[code];
  return (
    <Chip color={meta.color} bg={meta.color + "15"} size={size}>
      <span>{code}</span>
      {showName && <span className="opacity-80">· {meta.shortName}</span>}
    </Chip>
  );
}

export function TierBadge({ tier, size = "sm", showName = true }: {
  tier: StemPackageTier; size?: "xs" | "sm" | "md"; showName?: boolean;
}) {
  const meta = STEM_TIERS[tier];
  return (
    <Chip color={meta.color} bg={meta.color + "15"} size={size}>
      {showName ? meta.shortName : meta.tier}
    </Chip>
  );
}

export function TenantBadge({ type, size = "sm" }: {
  type: TenantType; size?: "xs" | "sm" | "md";
}) {
  const meta = tenantTypeLabelsMap[type];
  return (
    <Chip color={meta.color} bg={meta.color + "15"} size={size}>
      {meta.short}
    </Chip>
  );
}

const EQUIPMENT_STATUS_META: Record<EquipmentStatus, { label: string; color: string }> = {
  ok: { label: "Hoạt động tốt", color: "#16a34a" },
  warning: { label: "Cần kiểm tra", color: "#f59e0b" },
  broken: { label: "Hỏng hóc", color: "#dc2626" },
  missing: { label: "Thất lạc", color: "#64748b" },
};

export function EquipmentStatusBadge({ status, size = "sm" }: {
  status: EquipmentStatus; size?: "xs" | "sm" | "md";
}) {
  const meta = EQUIPMENT_STATUS_META[status];
  return <Chip color={meta.color} bg={meta.color + "15"} size={size}>{meta.label}</Chip>;
}

const WARRANTY_STATUS_META: Record<WarrantyStatus, { label: string; color: string }> = {
  new:            { label: "Mới",                color: "#2563eb" },
  accepted:       { label: "Đã tiếp nhận",       color: "#0891b2" },
  awaiting_part:  { label: "Chờ phụ kiện",       color: "#f59e0b" },
  in_progress:    { label: "Đang xử lý",         color: "#7c3aed" },
  resolved:       { label: "Đã xử lý",           color: "#16a34a" },
  rejected:       { label: "Từ chối",            color: "#dc2626" },
  closed:         { label: "Đóng",               color: "#64748b" },
};

export function WarrantyStatusBadge({ status, size = "sm" }: {
  status: WarrantyStatus; size?: "xs" | "sm" | "md";
}) {
  const meta = WARRANTY_STATUS_META[status];
  return <Chip color={meta.color} bg={meta.color + "15"} size={size}>{meta.label}</Chip>;
}

export const WARRANTY_STATUS_LIST = Object.keys(WARRANTY_STATUS_META) as WarrantyStatus[];
export { WARRANTY_STATUS_META };

const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  draft:      { label: "Nháp",         color: "#64748b" },
  pending:    { label: "Chờ duyệt",    color: "#f59e0b" },
  approved:   { label: "Đã duyệt",     color: "#0891b2" },
  delivering: { label: "Đang giao",    color: "#7c3aed" },
  delivered:  { label: "Đã giao",      color: "#16a34a" },
  cancelled:  { label: "Đã hủy",       color: "#dc2626" },
};

export function OrderStatusBadge({ status, size = "sm" }: {
  status: OrderStatus; size?: "xs" | "sm" | "md";
}) {
  const meta = ORDER_STATUS_META[status];
  return <Chip color={meta.color} bg={meta.color + "15"} size={size}>{meta.label}</Chip>;
}

export const ORDER_STATUS_LIST = Object.keys(ORDER_STATUS_META) as OrderStatus[];
export { ORDER_STATUS_META };

export function DataQualityBadge({ quality4D, size = "sm" }: {
  quality4D: { dung: boolean; du: boolean; sach: boolean; song: boolean };
  size?: "xs" | "sm" | "md";
}) {
  const items = [
    { key: "dung", label: "Đúng", color: "var(--dq-correct)" },
    { key: "du", label: "Đủ", color: "var(--dq-complete)" },
    { key: "sach", label: "Sạch", color: "var(--dq-clean)" },
    { key: "song", label: "Sống", color: "var(--dq-alive)" },
  ] as const;
  const fs = size === "xs" ? 9 : 10;
  return (
    <div className="inline-flex items-center gap-1">
      {items.map((it) => (
        <span
          key={it.key}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded"
          style={{
            fontSize: `${fs}px`,
            fontWeight: 600,
            color: quality4D[it.key] ? it.color : "var(--muted-foreground)",
            backgroundColor: quality4D[it.key] ? `${it.color.replace("var(", "rgb(from var(").replace(")", ") r g b / 0.1)")}` : "var(--secondary)",
            border: `1px solid ${quality4D[it.key] ? it.color : "transparent"}`,
            opacity: quality4D[it.key] ? 1 : 0.5,
          }}
        >
          {quality4D[it.key] ? "✓" : "○"} {it.label}
        </span>
      ))}
    </div>
  );
}
