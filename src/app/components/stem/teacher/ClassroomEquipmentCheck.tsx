import { useState } from "react";
import {
  Activity, CheckCircle2, AlertTriangle, QrCode, Send,
  Camera, Clock, Wrench,
} from "lucide-react";
import { equipmentBySchool, tenantsByType } from "../../mock-data/index";
import type { Equipment } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { EquipmentStatusBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  CLASSROOM EQUIPMENT CHECK (Teacher)                              */
/*  Đầu tiết giáo viên check thiết bị + báo hỏng nhanh               */
/* ================================================================ */

export function ClassroomEquipmentCheck() {
  const { user: _user } = useAuth();
  const schoolId = tenantsByType.school[0].id;
  const equipment = equipmentBySchool(schoolId).slice(0, 10);

  const [checkState, setCheckState] = useState<Record<string, "ok" | "issue" | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const markStatus = (id: string, status: "ok" | "issue") => {
    setCheckState((prev) => ({ ...prev, [id]: prev[id] === status ? null : status }));
  };

  const checkedOk = Object.values(checkState).filter((v) => v === "ok").length;
  const checkedIssue = Object.values(checkState).filter((v) => v === "issue").length;
  const remaining = equipment.length - checkedOk - checkedIssue;

  const handleSubmit = () => {
    if (checkedIssue > 0) {
      toast.warning(`Đã gửi ${checkedIssue} báo cáo lỗi thiết bị lên hệ thống trường.`);
    } else {
      toast.success(`Đã xác nhận ${checkedOk} thiết bị hoạt động tốt. Tiết học có thể bắt đầu.`);
    }
    setCheckState({}); setNotes({});
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Activity}
        title="Kiểm tra Thiết bị tại lớp"
        subtitle="Kiểm tra số lượng, chất lượng thiết bị đầu tiết học STEM và báo cáo nhanh khi có sự cố."
        accentColor="#0891b2"
        actions={
          <button onClick={() => toast.info("Quét QR thiết bị để check-in nhanh")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <QrCode className="w-4 h-4" /> Quét QR
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Activity} label="Thiết bị cần check" value={equipment.length} color="#0891b2" />
        <KpiCard icon={CheckCircle2} label="Đã xác nhận OK" value={checkedOk} color="#16a34a" />
        <KpiCard icon={AlertTriangle} label="Phát hiện sự cố" value={checkedIssue} color="#dc2626" />
        <KpiCard icon={Clock} label="Còn lại" value={remaining} color="#f59e0b" />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <p style={{ fontSize: "13px", fontWeight: 600 }}>Danh sách thiết bị tiết hôm nay</p>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            (Phòng STEM 1 — Lớp 8A — 13:00)
          </span>
        </div>
        <div className="divide-y divide-border">
          {equipment.map((eq) => {
            const state = checkState[eq.id];
            return (
              <div key={eq.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>{eq.name}</p>
                      <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{eq.serial}</span>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      {eq.category} · {eq.location} · <EquipmentStatusBadge status={eq.status} size="xs" />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markStatus(eq.id, "ok")}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        state === "ok"
                          ? "bg-[#16a34a] text-white border-[#16a34a]"
                          : "bg-card border-border hover:bg-secondary"
                      }`}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" /> OK
                    </button>
                    <button
                      onClick={() => markStatus(eq.id, "issue")}
                      className={`px-3 py-1.5 rounded-lg border transition-all ${
                        state === "issue"
                          ? "bg-[#dc2626] text-white border-[#dc2626]"
                          : "bg-card border-border hover:bg-secondary"
                      }`}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      <AlertTriangle className="w-4 h-4 inline mr-1" /> Sự cố
                    </button>
                  </div>
                </div>
                {state === "issue" && (
                  <div className="mt-2 pl-2 flex items-center gap-2">
                    <input
                      value={notes[eq.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [eq.id]: e.target.value })}
                      placeholder="Mô tả sự cố (vd: không sạc được, cảm biến lỗi...)"
                      className="flex-1 px-3 py-1.5 bg-input-background border border-border rounded outline-none"
                      style={{ fontSize: "12px" }}
                    />
                    <button onClick={() => toast.info("Chụp ảnh bằng camera thiết bị")}
                      className="p-1.5 rounded border border-border hover:bg-secondary">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-4">
        <button
          onClick={handleSubmit}
          disabled={checkedOk + checkedIssue === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0891b2] text-white rounded-lg hover:opacity-90 shadow-lg disabled:opacity-50"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {checkedIssue > 0 ? (
            <><Wrench className="w-4 h-4" /> Gửi báo cáo sự cố ({checkedIssue} thiết bị)</>
          ) : (
            <><Send className="w-4 h-4" /> Xác nhận {checkedOk} thiết bị OK — Bắt đầu tiết</>
          )}
        </button>
      </div>
    </div>
  );
}

export default ClassroomEquipmentCheck;
