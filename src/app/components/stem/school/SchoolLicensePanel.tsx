import { useState } from "react";
import {
  KeyRound, Plus, Search, RefreshCw, Download, UserPlus,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { licensesByTenant, tenantsByType } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SCHOOL LICENSE PANEL — phân bổ license còn lại cho GV/HS         */
/* ================================================================ */

export function SchoolLicensePanel() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const licenses = licensesByTenant(tenantId);
  const [search, setSearch] = useState("");

  const filtered = licenses.filter((l) =>
    !search || l.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
    l.productName.toLowerCase().includes(search.toLowerCase())
  );

  const active = licenses.filter((l) => !l.revokedAt).length;
  const totalSeats = licenses.reduce((s, l) => s + l.seats, 0);
  const usedSeats = licenses.reduce((s, l) => s + l.seatsUsed, 0);
  const remainingSeats = totalSeats - usedSeats;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={KeyRound}
        title="License & Tài khoản"
        subtitle="Phân bổ giấy phép sử dụng phần mềm học tập cho giáo viên và học sinh."
        accentColor="#2563eb"
        actions={
          <>
            <button onClick={() => toast.success("Phân bổ license hàng loạt cho danh sách HS")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <UserPlus className="w-4 h-4" /> Phân bổ hàng loạt
            </button>
            <button onClick={() => toast.info("Xuất Excel danh sách license đang sử dụng")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound} label="License đã cấp" value={licenses.length} color="#2563eb" />
        <KpiCard icon={CheckCircle2} label="Seats đang dùng" value={`${usedSeats}/${totalSeats}`} color="#16a34a" subtitle={`${totalSeats ? Math.round(usedSeats / totalSeats * 100) : 0}%`} />
        <KpiCard icon={Plus} label="Seats còn trống" value={remainingSeats} color="#c8a84e" />
        <KpiCard icon={AlertTriangle} label="License sắp hết hạn" value={
          licenses.filter((l) => !l.revokedAt && new Date(l.expiresAt).getTime() - Date.now() < 60 * 86400_000).length
        } color="#f59e0b" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm license / sản phẩm..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Sản phẩm</th>
              <th className="px-4 py-2.5">License key</th>
              <th className="px-4 py-2.5">Loại</th>
              <th className="px-4 py-2.5">Seats đang dùng</th>
              <th className="px-4 py-2.5">Hết hạn</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.slice(0, 30).map((l) => {
              const usage = l.seats > 0 ? Math.round((l.seatsUsed / l.seats) * 100) : 0;
              return (
                <tr key={l.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3" style={{ fontWeight: 500 }}>{l.productName}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.licenseKey}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded" style={{
                      fontSize: "10px", fontWeight: 600,
                      color: l.type === "site" ? "#7c3aed" : l.type === "per_user" ? "#0891b2" : "#f59e0b",
                      backgroundColor: l.type === "site" ? "#7c3aed15" : l.type === "per_user" ? "#0891b215" : "#f59e0b15",
                    }}>
                      {l.type === "per_user" ? "Per user" : l.type === "per_device" ? "Per device" : "Site"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {l.seats > 0 ? (
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 500 }}>{l.seatsUsed}/{l.seats}</p>
                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
                          <div className="h-full"
                            style={{
                              width: `${usage}%`,
                              backgroundColor: usage > 90 ? "#dc2626" : usage > 70 ? "#f59e0b" : "#16a34a",
                            }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Không giới hạn</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {formatRelative(l.expiresAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast.info(`Gán thêm học sinh / giáo viên vào license ${l.licenseKey}`)}
                      className="p-1.5 hover:bg-secondary rounded" title="Gán thêm">
                      <UserPlus className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => toast.info(`Gia hạn license`)}
                      className="p-1.5 hover:bg-secondary rounded ml-1" title="Gia hạn">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchoolLicensePanel;
