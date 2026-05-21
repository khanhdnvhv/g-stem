import { FlaskConical, Star, Calendar, Download, ExternalLink, Plus, FileText } from "lucide-react";

const MOCK_PROJECTS = [
  {
    id: 1, title: "Robot Phân Loại Rác Thông Minh", program: "CT5", phase: "Báo cáo cuối", subject: "Lập trình & Kỹ thuật",
    date: "Tháng 5/2026", score: 95, status: "completed",
    desc: "Xây dựng robot sử dụng cảm biến màu sắc để tự động phân loại rác hữu cơ và vô cơ.",
    tags: ["Arduino", "Cảm biến", "Python"],
  },
  {
    id: 2, title: "Trạm Khí Tượng Mini", program: "CT5", phase: "Đang thực hiện", subject: "Khoa học TN & Lập trình",
    date: "Tháng 4–6/2026", score: null, status: "inprogress",
    desc: "Thiết kế và lập trình trạm đo nhiệt độ, độ ẩm, áp suất không khí hiển thị lên màn hình LCD.",
    tags: ["IoT", "ESP32", "Scratch"],
  },
  {
    id: 3, title: "Mô Hình Lọc Nước Bằng Cát & Than", program: "CT3", phase: "Hoàn thành", subject: "Khoa học TN",
    date: "Tháng 2/2026", score: 88, status: "completed",
    desc: "Nghiên cứu và mô hình hóa hệ thống lọc nước đơn giản từ cát, sỏi và than hoạt tính.",
    tags: ["Hoá học", "Môi trường"],
  },
];

const STATUS_BADGE = {
  completed:  { label: "Hoàn thành", color: "#16a34a", bg: "#F0FDF4" },
  inprogress: { label: "Đang làm",   color: "#f59e0b", bg: "#FFFBEB" },
};

export default function StudentPortfolio() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Portfolio NCKH (CT5)</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Hồ sơ nghiên cứu khoa học — Chương trình CT5</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg,#7a0602,#990803)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(153,8,3,0.25)" }}>
          <Plus style={{ width: 14, height: 14 }} /> Dự án mới
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Tổng dự án", val: MOCK_PROJECTS.length, icon: FlaskConical, color: "#990803", bg: "#FFF8F8" },
          { label: "Hoàn thành",  val: MOCK_PROJECTS.filter(p => p.status === "completed").length, icon: Star, color: "#16a34a", bg: "#F0FDF4" },
          { label: "Đang thực hiện", val: MOCK_PROJECTS.filter(p => p.status === "inprogress").length, icon: Calendar, color: "#f59e0b", bg: "#FFFBEB" },
          { label: "Điểm TB", val: "91.5", icon: Star, color: "#c8a84e", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${s.color}20`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MOCK_PROJECTS.map(proj => {
          const st = STATUS_BADGE[proj.status as keyof typeof STATUS_BADGE];
          return (
            <div key={proj.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: "20px 22px", transition: "box-shadow 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: "#FFF8F8", color: "#990803", border: "1px solid rgba(153,8,3,0.2)" }}>{proj.program}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: st.bg, color: st.color }}>{st.label}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{proj.phase}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>{proj.title}</h3>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 12px" }}>{proj.desc}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {proj.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99, background: "#f3f4f6", color: "#374151" }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#9ca3af" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><FileText style={{ width: 12, height: 12 }} />{proj.subject}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar style={{ width: 12, height: 12 }} />{proj.date}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                  {proj.score !== null ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: "#990803" }}>{proj.score}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af" }}>điểm</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>—</div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Download style={{ width: 15, height: 15, color: "#6b7280" }} />
                    </button>
                    <button style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <ExternalLink style={{ width: 15, height: 15, color: "#6b7280" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
