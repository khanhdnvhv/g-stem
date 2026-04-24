/* ================================================================ */
/*  Format helpers — STEM Platform                                   */
/* ================================================================ */

/** Format số tiền VND rút gọn: 1_250_000_000 → "1,25 tỷ" */
export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (amount >= 1_000_000)     return (amount / 1_000_000).toFixed(1).replace(/\.?0+$/, "") + " triệu";
  if (amount >= 1_000)          return (amount / 1_000).toFixed(0) + "k";
  return amount.toString();
}

/** Format số tiền VND đầy đủ: 1_250_000_000 → "1.250.000.000 ₫" */
export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

/** Format số lớn: 2_150_000 → "2,15 triệu" */
export function formatNumberCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + " triệu";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.?0+$/, "") + "k";
  return n.toString();
}

/** Format ngày tương đối: "3 ngày trước" */
export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffD = Math.floor(diffMs / 86400000);
  if (diffD === 0) return "Hôm nay";
  if (diffD === 1) return "Hôm qua";
  if (diffD < 0) return `Còn ${Math.abs(diffD)} ngày`;
  if (diffD < 30) return `${diffD} ngày trước`;
  if (diffD < 365) return `${Math.floor(diffD / 30)} tháng trước`;
  return `${Math.floor(diffD / 365)} năm trước`;
}

/** Format ngày ngắn: "24/04/2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

/** Format giờ ngày: "14:32 — 24/04" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mi} — ${dd}/${mm}`;
}
