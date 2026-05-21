import { ClipboardList, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

const MOCK_EXERCISES = [
  { id: 1, title: "Phiếu bài tập Toán tư duy – Tuần 3", subject: "Toán", deadline: "Hôm nay, 23:59", status: "pending", questions: 10, color: "#990803" },
  { id: 2, title: "Bài thực hành Khoa học: Thí nghiệm nước", subject: "Khoa học TN", deadline: "Ngày mai, 22:00", status: "pending", questions: 5, color: "#16a34a" },
  { id: 3, title: "Phiếu lập trình Scratch – Bài 7", subject: "Lập trình", deadline: "24/05/2026", status: "done", questions: 8, color: "#7c3aed" },
  { id: 4, title: "Từ vựng STEM Tiếng Anh – Unit 4", subject: "Tiếng Anh", deadline: "22/05/2026", status: "done", questions: 20, color: "#c8a84e" },
  { id: 5, title: "Bài tập Kỹ thuật: Thiết kế cầu", subject: "Kỹ thuật", deadline: "30/05/2026", status: "pending", questions: 6, color: "#f59e0b" },
];

const STATUS = {
  pending: { label: "Chưa nộp", color: "#f59e0b", bg: "#FFFBEB", icon: AlertCircle },
  done:    { label: "Đã nộp",   color: "#16a34a", bg: "#F0FDF4", icon: CheckCircle2 },
};

export default function StudentExercises() {
  const pending = MOCK_EXERCISES.filter(e => e.status === "pending");
  const done    = MOCK_EXERCISES.filter(e => e.status === "done");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Phiếu bài tập</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Bài tập & phiếu thực hành từ giáo viên</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Cần nộp", val: pending.length, color: "#f59e0b", bg: "#FFFBEB" },
          { label: "Đã hoàn thành", val: done.length, color: "#16a34a", bg: "#F0FDF4" },
          { label: "Tổng cộng", val: MOCK_EXERCISES.length, color: "#990803", bg: "#FFF8F8" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "14px 18px", border: `1px solid ${s.color}20` }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle style={{ width: 14, height: 14, color: "#f59e0b" }} /> Cần nộp ({pending.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pending.map(ex => {
            const s = STATUS[ex.status as keyof typeof STATUS];
            return (
              <div key={ex.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: `3px solid ${ex.color}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <ClipboardList style={{ width: 18, height: 18, color: ex.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ex.title}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, display: "flex", gap: 12 }}>
                    <span>{ex.subject}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#f59e0b" }}><Clock style={{ width: 11, height: 11 }} />{ex.deadline}</span>
                    <span>{ex.questions} câu</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
                <ChevronRight style={{ width: 15, height: 15, color: "#d1d5db" }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Done */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 style={{ width: 14, height: 14, color: "#16a34a" }} /> Đã hoàn thành ({done.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {done.map(ex => {
            const s = STATUS[ex.status as keyof typeof STATUS];
            return (
              <div key={ex.id} style={{ background: "#fafafa", border: "1px solid #f3f4f6", borderLeft: `3px solid ${ex.color}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", opacity: 0.75 }}>
                <ClipboardList style={{ width: 18, height: 18, color: ex.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{ex.title}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, display: "flex", gap: 12 }}>
                    <span>{ex.subject}</span><span>{ex.questions} câu</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
