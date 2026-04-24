import { useState } from "react";
import {
  MessageCircle, Phone, Plus, CheckCircle2, Clock, AlertCircle,
  Calendar as CalendarIcon, User, Smile, Meh, Frown,
} from "lucide-react";
import { tenantsByType } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  CUSTOMER CARE — Ticket chăm sóc khách hàng định kỳ              */
/* ================================================================ */

interface CareTicket {
  id: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  type: "follow_up" | "complaint" | "renewal" | "feedback";
  status: "open" | "scheduled" | "resolved";
  createdAt: string;
  sentiment: "positive" | "neutral" | "negative";
  lastNote: string;
}

function generateCareTickets(): CareTicket[] {
  const types: CareTicket["type"][] = ["follow_up", "complaint", "renewal", "feedback"];
  const statuses: CareTicket["status"][] = ["open", "scheduled", "resolved"];
  const sentiments: CareTicket["sentiment"][] = ["positive", "neutral", "negative"];
  const subjects: Record<CareTicket["type"], string[]> = {
    follow_up: ["Hỏi thăm 30 ngày sau triển khai", "Theo dõi triển khai gói Nâng cao", "Check-in định kỳ Q1/2026"],
    complaint: ["Khiếu nại: thiết bị hỏng nhanh", "Phản ánh: GV chưa được tập huấn đủ"],
    renewal:   ["Gia hạn hợp đồng 2026-2027", "Mở rộng lên gói Nâng cao"],
    feedback:  ["Phản hồi sau chương trình tập huấn", "Đề xuất cải thiện tài liệu CT3"],
  };

  const tickets: CareTicket[] = [];
  const schools = tenantsByType.school;
  let idx = 1;
  for (let i = 0; i < 15; i++) {
    const school = schools[i % schools.length];
    const type = types[i % types.length];
    const subj = subjects[type][i % subjects[type].length];
    const status = statuses[i % statuses.length];
    const sentiment = sentiments[(i + 2) % sentiments.length];
    tickets.push({
      id: `CT-${String(idx).padStart(4, "0")}`,
      schoolId: school.id,
      schoolName: school.name,
      subject: subj,
      type,
      status,
      createdAt: new Date(Date.now() - (i + 1) * 86400_000 * 2).toISOString(),
      sentiment,
      lastNote: status === "resolved"
        ? "Đã gọi điện xác nhận, khách hài lòng với cách xử lý."
        : "Đã gửi email theo dõi, chờ phản hồi.",
    });
    idx++;
  }
  return tickets;
}

const TYPE_META = {
  follow_up: { label: "Theo dõi",   color: "#0891b2" },
  complaint: { label: "Khiếu nại",  color: "#dc2626" },
  renewal:   { label: "Gia hạn",    color: "#16a34a" },
  feedback:  { label: "Phản hồi",   color: "#c8a84e" },
} as const;

const STATUS_META = {
  open:      { label: "Mở",         color: "#f59e0b", icon: AlertCircle },
  scheduled: { label: "Đã lên lịch", color: "#0891b2", icon: Clock },
  resolved:  { label: "Đã xử lý",    color: "#16a34a", icon: CheckCircle2 },
} as const;

const SENTIMENT_META = {
  positive: { icon: Smile, color: "#16a34a" },
  neutral:  { icon: Meh,   color: "#f59e0b" },
  negative: { icon: Frown, color: "#dc2626" },
} as const;

export function CustomerCare() {
  const { user: _user } = useAuth();
  const [tickets] = useState<CareTicket[]>(generateCareTickets);
  const [statusFilter, setStatusFilter] = useState<CareTicket["status"] | "all">("all");

  const filtered = tickets.filter((t) => statusFilter === "all" || t.status === statusFilter);

  const openCount = tickets.filter((t) => t.status === "open").length;
  const scheduled = tickets.filter((t) => t.status === "scheduled").length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={MessageCircle}
        title="Chăm sóc Khách hàng"
        subtitle="Quy trình chăm sóc khách hàng định kỳ, tiếp nhận phản hồi và duy trì mối quan hệ."
        actions={
          <button
            onClick={() => toast.success("Tạo ticket chăm sóc mới")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Tạo ticket
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={MessageCircle} label="Tổng ticket" value={tickets.length} color="#c8a84e" />
        <KpiCard icon={AlertCircle} label="Đang mở" value={openCount} color="#f59e0b" />
        <KpiCard icon={Clock} label="Đã lên lịch" value={scheduled} color="#0891b2" />
        <KpiCard icon={CheckCircle2} label="Đã xử lý" value={resolved} color="#16a34a" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({tickets.length})
        </button>
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
          const meta = STATUS_META[k];
          const count = tickets.filter((t) => t.status === k).length;
          return (
            <button
              key={k}
              onClick={() => setStatusFilter(k)}
              className={`px-3 py-2 rounded-lg border ${
                statusFilter === k ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(statusFilter === k ? { backgroundColor: meta.color } : {}),
              }}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {filtered.map((t) => {
          const typeMeta = TYPE_META[t.type];
          const statusMeta = STATUS_META[t.status];
          const sentMeta = SENTIMENT_META[t.sentiment];
          const StatusIcon = statusMeta.icon;
          const SentIcon = sentMeta.icon;
          return (
            <div key={t.id} className="p-4 hover:bg-secondary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: typeMeta.color + "15" }}
                >
                  <MessageCircle className="w-4 h-4" style={{ color: typeMeta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p style={{ fontSize: "13px", fontWeight: 600 }}>{t.subject}</p>
                    <span className="px-2 py-0.5 rounded" style={{
                      fontSize: "10px", fontWeight: 600,
                      color: typeMeta.color, backgroundColor: typeMeta.color + "15",
                    }}>
                      {typeMeta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded" style={{
                      fontSize: "10px", fontWeight: 600,
                      color: statusMeta.color, backgroundColor: statusMeta.color + "15",
                    }}>
                      <StatusIcon className="w-3 h-3" />
                      {statusMeta.label}
                    </span>
                  </div>
                  <p className="text-foreground mt-1" style={{ fontSize: "11.5px", fontWeight: 500 }}>
                    <User className="w-3 h-3 inline mr-1" />
                    {t.schoolName}
                  </p>
                  <p className="text-muted-foreground mt-1 line-clamp-1" style={{ fontSize: "11.5px" }}>
                    {t.lastNote}
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                    <CalendarIcon className="w-3 h-3 inline mr-1" />
                    Tạo {formatRelative(t.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SentIcon className="w-5 h-5" style={{ color: sentMeta.color }} />
                  <button
                    onClick={() => toast.info(`Gọi ${t.schoolName}`)}
                    className="p-1.5 hover:bg-secondary rounded"
                    title="Gọi"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toast.info(`Xem lịch sử ticket ${t.id}`)}
                    className="p-1.5 hover:bg-secondary rounded"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CustomerCare;
