import { BookMarked, Plus, Search, Calendar, ChevronRight, Tag } from "lucide-react";
import { useState } from "react";

const MOCK_NOTES = [
  { id: 1, title: "Thí nghiệm: Pin chanh 🍋", subject: "Khoa học TN", date: "16/05/2026", tags: ["điện", "thí nghiệm"], preview: "Vật liệu cần: 2 quả chanh, dây đồng, kẽm, đèn LED nhỏ. Kết quả: đèn sáng nhờ phản ứng hoá học..." },
  { id: 2, title: "Bài toán logic: Tháp Hà Nội", subject: "Toán tư duy", date: "14/05/2026", tags: ["đệ quy", "thuật toán"], preview: "Công thức: f(n) = 2^n - 1. Với n=3 cần 7 bước. Giải thích..." },
  { id: 3, title: "Ghi chú Scratch: vòng lặp mãi", subject: "Lập trình", date: "12/05/2026", tags: ["vòng lặp", "scratch"], preview: "Khối 'lặp mãi' khác với 'lặp 10 lần' ở chỗ không có điều kiện dừng..." },
  { id: 4, title: "Từ vựng STEM Unit 3", subject: "Tiếng Anh", date: "10/05/2026", tags: ["từ vựng"], preview: "Hypothesis = giả thuyết, Experiment = thí nghiệm, Result = kết quả..." },
];

const SUBJECT_COLORS: Record<string, string> = {
  "Khoa học TN": "#16a34a",
  "Toán tư duy": "#990803",
  "Lập trình": "#7c3aed",
  "Tiếng Anh": "#c8a84e",
};

export default function StudentNotebook() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_NOTES.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Sổ tay thực hành điện tử</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Ghi chép, nhật ký thí nghiệm & bài học của em</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg,#7a0602,#990803)", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 10px rgba(153,8,3,0.25)" }}>
          <Plus style={{ width: 14, height: 14 }} /> Trang mới
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#9ca3af" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm trong sổ tay..."
          style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 40, borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Notes grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
        {/* Add new card */}
        <div style={{ border: "2px dashed #e5e7eb", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 160, background: "#fafafa" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFF8F8", border: "1px solid rgba(153,8,3,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Plus style={{ width: 18, height: 18, color: "#990803" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Thêm ghi chú mới</span>
        </div>

        {filtered.map(note => {
          const subjectColor = SUBJECT_COLORS[note.subject] ?? "#990803";
          return (
            <div
              key={note.id}
              style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, transition: "box-shadow 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.4 }}>{note.title}</div>
                <BookMarked style={{ width: 16, height: 16, color: subjectColor, flexShrink: 0, marginTop: 2 }} />
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{note.preview}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {note.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: `${subjectColor}12`, color: subjectColor, display: "flex", alignItems: "center", gap: 3 }}>
                    <Tag style={{ width: 9, height: 9 }} />{tag}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <div style={{ fontSize: 10, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar style={{ width: 11, height: 11 }} />{note.date}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: `${subjectColor}10`, color: subjectColor }}>{note.subject}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
