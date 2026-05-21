import { Upload, FileVideo, Image, FileText, CheckCircle2, Clock, Plus } from "lucide-react";
import { useState } from "react";

const MOCK_SUBMISSIONS = [
  { id: 1, title: "Mô hình cầu treo – CT4 Kỳ 2", subject: "Kỹ thuật", type: "video", submittedAt: "15/05/2026", status: "reviewed", score: 92, teacher: "Cô Lan" },
  { id: 2, title: "Robot phân loại rác mini", subject: "Lập trình", type: "video", submittedAt: "10/05/2026", status: "reviewed", score: 88, teacher: "Thầy Minh" },
  { id: 3, title: "Poster thí nghiệm nước sạch", subject: "Khoa học", type: "image", submittedAt: "20/05/2026", status: "pending", score: null, teacher: null },
];

const TYPE_ICON = { video: FileVideo, image: Image, doc: FileText };
const STATUS_LABEL = { reviewed: { label: "Đã chấm", color: "#16a34a", bg: "#F0FDF4" }, pending: { label: "Chờ chấm", color: "#f59e0b", bg: "#FFFBEB" } };

export default function StudentSubmitProduct() {
  const [dragging, setDragging] = useState(false);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Nộp sản phẩm STEM</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Nộp video, ảnh, báo cáo dự án STEM của em</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? "#990803" : "#e5e7eb"}`,
          borderRadius: 16,
          padding: "36px 24px",
          textAlign: "center",
          background: dragging ? "#FFF8F8" : "#fafafa",
          marginBottom: 24,
          transition: "all 0.2s",
          cursor: "pointer",
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FFF8F8", border: "1px solid rgba(153,8,3,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Upload style={{ width: 24, height: 24, color: "#990803" }} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Kéo thả hoặc chọn file</div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>Hỗ trợ video (mp4, mov), ảnh (jpg, png), tài liệu (pdf) — Tối đa 500MB</div>
        <button style={{ padding: "9px 22px", borderRadius: 10, background: "linear-gradient(135deg,#7a0602,#990803)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 3px 10px rgba(153,8,3,0.25)" }}>
          <Plus style={{ width: 14, height: 14 }} /> Chọn file nộp
        </button>
      </div>

      {/* Submission history */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Lịch sử nộp bài</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_SUBMISSIONS.map(s => {
            const Icon = TYPE_ICON[s.type as keyof typeof TYPE_ICON] ?? FileText;
            const st = STATUS_LABEL[s.status as keyof typeof STATUS_LABEL];
            return (
              <div key={s.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#FFF8F8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon style={{ width: 20, height: 20, color: "#990803" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, display: "flex", gap: 12 }}>
                    <span>{s.subject}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock style={{ width: 11, height: 11 }} />{s.submittedAt}</span>
                    {s.teacher && <span>{s.teacher}</span>}
                  </div>
                </div>
                {s.score !== null ? (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#990803" }}>{s.score}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>điểm</div>
                  </div>
                ) : null}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
