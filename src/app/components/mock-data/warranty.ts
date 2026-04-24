import type { WarrantyTicket, WarrantyStatus } from "./types";
import { equipment } from "./equipment";

/* ================================================================ */
/*  WARRANTY TICKETS — 30 ticket với đầy đủ status                   */
/* ================================================================ */

const STATUSES: WarrantyStatus[] = [
  "new", "accepted", "awaiting_part", "in_progress", "resolved", "rejected", "closed",
];

const ISSUES = [
  "Không nguồn khi cắm điện",
  "Cảm biến hoạt động sai",
  "Pin sạc không giữ được lâu",
  "Màn hình hiển thị sọc, vỡ điểm ảnh",
  "Bánh răng kẹt, không quay",
  "Không kết nối Wifi được",
  "Đèn LED cháy 1 dãy",
  "Bộ nhớ đầy không ghi thêm được",
  "Motor servo kêu to bất thường",
  "Mất 1 module cảm biến từ lúc nhập kho",
];

const brokenOrMissing = equipment.filter(
  (e) => e.status === "broken" || e.status === "missing" || e.status === "warning"
);

export const warrantyTickets: WarrantyTicket[] = brokenOrMissing.slice(0, 30).map((eq, i) => {
  const status = STATUSES[i % STATUSES.length];
  const reportedAt = new Date(Date.now() - (i + 1) * 3 * 86400_000).toISOString();
  const slaDue = new Date(Date.now() + (7 - (i % 7)) * 86400_000).toISOString();
  return {
    id: `WT-${String(i + 1).padStart(4, "0")}`,
    ticketNo: `WT-2026-${String(i + 1).padStart(4, "0")}`,
    equipmentId: eq.id,
    schoolId: eq.schoolId,
    reportedBy: "U-TCH-01",
    reportedAt,
    issue: ISSUES[i % ISSUES.length],
    photos: [],
    status,
    assignedTo: status === "new" ? undefined : "U-SUP-WR-0" + ((i % 3) + 1),
    slaDueAt: slaDue,
    resolutionNote:
      status === "resolved" || status === "closed"
        ? "Đã thay module mới, kiểm tra vận hành OK."
        : undefined,
    history: [
      { at: reportedAt, by: "U-TCH-01", status: "new", note: "Khởi tạo" },
      ...(status !== "new"
        ? [{ at: new Date(Date.parse(reportedAt) + 86400_000).toISOString(), by: "U-SUP-01", status: "accepted" as WarrantyStatus, note: "NCC tiếp nhận" }]
        : []),
      ...(["in_progress", "resolved", "closed"].includes(status)
        ? [{ at: new Date(Date.parse(reportedAt) + 2 * 86400_000).toISOString(), by: "U-SUP-WR-01", status: "in_progress" as WarrantyStatus, note: "Đã cử kỹ thuật viên" }]
        : []),
      ...(["resolved", "closed"].includes(status)
        ? [{ at: new Date(Date.parse(reportedAt) + 4 * 86400_000).toISOString(), by: "U-SUP-WR-01", status: "resolved" as WarrantyStatus, note: "Hoàn tất sửa chữa" }]
        : []),
    ],
  };
});

export function ticketsBySchool(schoolId: string) {
  return warrantyTickets.filter((t) => t.schoolId === schoolId);
}
