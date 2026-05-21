import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, Zap, Star } from "lucide-react";

/* ─── Challenge data ─────────────────────────────────────────────────────── */
const CHALLENGE = {
  emoji:       "🌡️",
  title:       "Đo Nhiệt Độ Nóng & Lạnh",
  desc:        "Dùng nhiệt kế đo nhiệt độ nước nóng và nước lạnh, sau đó vẽ biểu đồ cột để so sánh kết quả!",
  xp:          50,
  color:       "#16a34a",
  bg:          "#F0FDF4",
  border:      "#86EFAC",
  subject:     "Khoa Học TN + Toán",
  difficulty:  "Trung bình",
  time:        "30–45 phút",

  materials: [
    { icon:"🌡️", item:"Nhiệt kế (nhờ cô giáo hoặc bố mẹ)" },
    { icon:"🥤", item:"2 ly nước — 1 ly nước ấm, 1 ly nước lạnh có đá" },
    { icon:"📄", item:"Giấy trắng A4 + bút chì và bút màu" },
    { icon:"📏", item:"Thước kẻ để vẽ biểu đồ cho thẳng" },
  ],

  steps: [
    {
      title: "Chuẩn bị 2 ly nước",
      desc:  "Nhờ bố mẹ hoặc cô giáo chuẩn bị 1 ly nước ấm và 1 ly nước lạnh có đá. Đặt 2 ly cạnh nhau trên bàn.",
      tip:   "⚠️ Cẩn thận nước nóng — nhờ người lớn giúp nhé!",
    },
    {
      title: "Đo và ghi nhiệt độ",
      desc:  "Nhúng nhiệt kế vào ly nước ấm, đợi 30 giây rồi đọc số. Ghi vào vở: nước ấm = __°C. Làm tương tự với ly nước lạnh.",
      tip:   "💡 Đừng chạm đầu nhiệt kế vào thành ly!",
    },
    {
      title: "Vẽ biểu đồ cột",
      desc:  "Dùng thước vẽ 2 cột trên giấy: cột trái = nước ấm (tô màu đỏ/cam), cột phải = nước lạnh (tô màu xanh). Chiều cao cột tương ứng với nhiệt độ.",
      tip:   "🎨 Tô màu đẹp và viết số nhiệt độ lên từng cột!",
    },
    {
      title: "Viết nhận xét",
      desc:  "Bên dưới biểu đồ, viết 2–3 câu: Nước nào nóng hơn? Chênh lệch bao nhiêu độ? Em học được gì từ thí nghiệm này?",
      tip:   "✏️ Viết bằng chữ của em, không cần hoàn hảo!",
    },
  ],

  submitTask: {
    title: "Nộp kết quả thử thách",
    desc:  "Chụp ảnh nhiệt kế đang hiển thị kết quả và ảnh biểu đồ cột em đã vẽ. Nộp cả 2 ảnh lên hệ thống!",
    requirements: [
      "Ảnh nhiệt kế trong ly nước (hoặc sau khi đo xong)",
      "Ảnh biểu đồ cột em đã vẽ tay",
      "Viết nhiệt độ 2 loại nước trong phần mô tả",
    ],
  },
};

/* ─── Step card ──────────────────────────────────────────────────────────── */
function StepCard({ step, index, color }: {
  step: typeof CHALLENGE.steps[0]; index: number; color: string;
}) {
  return (
    <div style={{ display:"flex", gap:14, padding:"16px 18px", background:"#fff", borderRadius:14, border:"1px solid #e5e7eb" }}>
      <div style={{ width:36, height:36, borderRadius:"50%", background:color, color:"#fff", fontSize:16, fontWeight:900, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {index + 1}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:800, color:"#111827", marginBottom:5 }}>{step.title}</div>
        <div style={{ fontSize:13, color:"#374151", lineHeight:1.65, marginBottom:8 }}>{step.desc}</div>
        <div style={{ fontSize:11, color:color, background:color+"12", padding:"6px 12px", borderRadius:9, fontWeight:600, lineHeight:1.5 }}>
          {step.tip}
        </div>
      </div>
    </div>
  );
}

/* ─── Submit box ─────────────────────────────────────────────────────────── */
function SubmitBox({ color, bg }: { color: string; bg: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [description, setDescription] = useState("");

  if (submitted) {
    return (
      <div style={{ background:"#f0fdf4", border:"2px solid #86efac", borderRadius:16, padding:"48px 24px", textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:12 }}>🎉</div>
        <div style={{ fontSize:20, fontWeight:900, color:"#16a34a", marginBottom:8 }}>Nộp thử thách thành công!</div>
        <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, marginBottom:20 }}>
          Em đã hoàn thành STEM Challenge hôm nay!<br />
          Cô/thầy sẽ nhận xét và trao <strong style={{ color:"#16a34a" }}>+50 XP</strong> cho em sớm nhé!
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#dcfce7", borderRadius:12, padding:"10px 20px", fontSize:13, fontWeight:700, color:"#16a34a" }}>
          <Zap style={{ width:16, height:16 }} /> +50 XP đang chờ được duyệt
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {/* Task description */}
      <div style={{ background:bg, border:`1.5px solid ${color}30`, borderRadius:14, padding:"18px" }}>
        <div style={{ fontSize:14, fontWeight:800, color, marginBottom:8 }}>
          📋 {CHALLENGE.submitTask.title}
        </div>
        <div style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:12 }}>
          {CHALLENGE.submitTask.desc}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {CHALLENGE.submitTask.requirements.map((req, i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:color, color:"#fff", fontSize:11, fontWeight:800, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>{i + 1}</div>
              <div style={{ fontSize:12, color:"#374151", lineHeight:1.5 }}>{req}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload */}
      <div
        style={{ border:`2px dashed ${color}50`, borderRadius:14, padding:"36px 20px", textAlign:"center", background:"#fafafa", cursor:"pointer", transition:"background .2s" }}
        onMouseEnter={e => { e.currentTarget.style.background = bg; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; }}
      >
        <div style={{ fontSize:40, marginBottom:8 }}>📸</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#374151", marginBottom:4 }}>Kéo & thả ảnh vào đây</div>
        <div style={{ fontSize:12, color:"#9ca3af", marginBottom:14 }}>JPG, PNG · Tối đa 10MB mỗi ảnh · Nộp 2 ảnh</div>
        <button style={{ padding:"8px 22px", borderRadius:9, background:color, color:"#fff", border:"none", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          Chọn ảnh từ máy
        </button>
      </div>

      {/* Description */}
      <div>
        <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#374151", marginBottom:6 }}>
          Nhiệt độ đo được <span style={{ color:"#9ca3af", fontWeight:400 }}>(bắt buộc)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ví dụ: Nước ấm = 65°C, Nước lạnh = 8°C. Nước ấm nóng hơn nước lạnh 57 độ..."
          style={{ width:"100%", minHeight:88, padding:"10px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:13, color:"#374151", resize:"vertical", outline:"none", fontFamily:"inherit", boxSizing:"border-box", lineHeight:1.6 }}
        />
      </div>

      <button
        onClick={() => setSubmitted(true)}
        style={{ padding:"14px", borderRadius:12, fontSize:15, fontWeight:900, background:`linear-gradient(135deg,${color}dd,${color})`, color:"#fff", border:"none", cursor:"pointer", boxShadow:`0 4px 14px ${color}40`, fontFamily:"inherit" }}>
        🚀 Nộp Thử Thách!
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
type Tab = "guide" | "submit";

export default function STEMChallengeDetail() {
  const [tab, setTab] = useState<Tab>("guide");
  const { color, bg, border } = CHALLENGE;

  return (
    <div style={{ maxWidth:780, margin:"0 auto" }}>
      {/* Back */}
      <Link to="/student/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"#6b7280", textDecoration:"none", marginBottom:18 }}>
        <ArrowLeft style={{ width:15, height:15 }} /> Trang chủ
      </Link>

      {/* Header card */}
      <div style={{ background:`linear-gradient(135deg,${bg},#dcfce7)`, border:`2px solid ${border}`, borderRadius:20, padding:"22px 24px", marginBottom:16, boxShadow:`0 6px 24px ${color}20` }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
          <div style={{ width:72, height:72, borderRadius:20, background:"#fff", border:`2px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:42, flexShrink:0, boxShadow:`0 4px 12px ${color}20` }}>
            {CHALLENGE.emoji}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:800, color:"#fff", background:color, padding:"4px 12px", borderRadius:99, boxShadow:`0 2px 8px ${color}40` }}>
                <Zap style={{ width:12, height:12 }} /> +{CHALLENGE.xp} XP
              </span>
              <span style={{ fontSize:11, color:color, background:"#fff", fontWeight:700, padding:"3px 10px", borderRadius:99, border:`1px solid ${border}` }}>
                {CHALLENGE.subject}
              </span>
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, color:"#14532d", marginBottom:8, lineHeight:1.3 }}>{CHALLENGE.title}</h1>
            <p style={{ fontSize:13, color:"#166534", lineHeight:1.65, marginBottom:12 }}>{CHALLENGE.desc}</p>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:color, fontWeight:700 }}>
                <Clock style={{ width:13, height:13 }} /> {CHALLENGE.time}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:color, fontWeight:700 }}>
                <Star style={{ width:13, height:13 }} /> {CHALLENGE.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {([
          { id:"guide",  label:"📋 Hướng dẫn" },
          { id:"submit", label:"📤 Nộp sản phẩm" },
        ] as { id:Tab; label:string }[]).map(t => {
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:"10px 22px", borderRadius:11, border:"none", fontSize:13, fontWeight: isActive ? 800 : 600,
              background: isActive ? color : "#f3f4f6",
              color: isActive ? "#fff" : "#6b7280",
              cursor:"pointer", boxShadow: isActive ? `0 2px 8px ${color}40` : "none",
              transition:"all .15s",
            }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Guide tab */}
      {tab === "guide" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Materials */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:"18px" }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#111827", marginBottom:12 }}>🛒 Chuẩn bị dụng cụ</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {CHALLENGE.materials.map((m, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:bg, borderRadius:10, border:`1px solid ${border}` }}>
                  <span style={{ fontSize:22 }}>{m.icon}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#166534", lineHeight:1.4 }}>{m.item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div style={{ fontSize:14, fontWeight:800, color:"#111827", marginBottom:10 }}>🔬 Các bước thực hiện</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {CHALLENGE.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} color={color} />
              ))}
            </div>
          </div>

          {/* CTA to submit */}
          <button
            onClick={() => setTab("submit")}
            style={{ padding:"14px", borderRadius:12, fontSize:15, fontWeight:900, background:`linear-gradient(135deg,${color}dd,${color})`, color:"#fff", border:"none", cursor:"pointer", boxShadow:`0 4px 14px ${color}40`, fontFamily:"inherit", marginTop:4 }}>
            ✅ Đã làm xong! Nộp sản phẩm →
          </button>
        </div>
      )}

      {/* Submit tab */}
      {tab === "submit" && (
        <SubmitBox color={color} bg={bg} />
      )}
    </div>
  );
}
