import { useState } from "react";
import {
  Bot, MessageCircle, Sparkles, PenTool, Target,
  Send, User, Lightbulb, CheckCircle2, TrendingUp,
  AlertCircle, BookOpen,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { STEM_PROGRAMS, lessons } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  AI-BUDDY PANEL — 4 tab: Chat / Recommend / Grade / Analyze      */
/* ================================================================ */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

const STARTER_CHAT: ChatMessage[] = [
  {
    role: "assistant",
    content: "Xin chào! Tôi là AI-Buddy — trợ lý AI của Geleximco STEM. Tôi có thể giúp bạn soạn giáo án, chấm bài, phân tích năng lực HS và gợi ý bài học. Bạn cần hỗ trợ gì hôm nay?",
    at: new Date().toISOString(),
  },
];

const QUICK_PROMPTS = [
  "Gợi ý ý tưởng bài giảng CT3 cho HS lớp 8",
  "Tôi cần soạn giáo án Robotic cơ bản, có dàn ý nào không?",
  "Phân tích điểm mạnh của học sinh Lê Hoàng Nam",
  "Đánh giá chất lượng CT5 — đề tài NCKH đầu tiên",
  "Tóm tắt điểm mấu chốt Thông tư 38/2023 về thiết bị",
];

function AIBuddyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(STARTER_CHAT);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: text, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: generateMockReply(text),
        at: new Date().toISOString(),
      }]);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col h-[560px]">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700 }}>AI-Buddy Chat</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              <span className="inline-block w-2 h-2 rounded-full bg-[#16a34a] mr-1" />
              Online · v1.5.2
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{
                backgroundColor: m.role === "user" ? "#990803" : "#7c3aed",
                color: "white",
              }}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-xl px-3 py-2 max-w-[75%] ${
                m.role === "user" ? "bg-[#990803] text-white" : "bg-secondary"
              }`}>
                <p style={{ fontSize: "12.5px", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
              placeholder="Hỏi AI-Buddy..."
              className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "13px" }} />
            <button onClick={() => send(input)}
              className="px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <p style={{ fontSize: "12.5px", fontWeight: 700 }}>Gợi ý câu hỏi nhanh</p>
          <div className="mt-3 space-y-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="w-full text-left p-2 bg-secondary/40 hover:bg-secondary rounded-lg transition-all"
                style={{ fontSize: "11.5px" }}>
                <Sparkles className="w-3 h-3 text-[#7c3aed] inline mr-1" />
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#c8a84e]/5 rounded-xl border border-border p-4">
          <Bot className="w-6 h-6 text-[#7c3aed] mb-2" />
          <p style={{ fontSize: "12.5px", fontWeight: 700 }}>AI-Buddy có thể</p>
          <ul className="text-muted-foreground mt-1 space-y-1" style={{ fontSize: "11.5px", lineHeight: 1.6 }}>
            <li>✓ Soạn giáo án CT1-CT5 theo SGK</li>
            <li>✓ Gợi ý bài tập cá nhân hóa</li>
            <li>✓ Chấm bài tự luận, trắc nghiệm</li>
            <li>✓ Phân tích hồ sơ năng lực HS</li>
            <li>✓ Tóm tắt Thông tư, CV Bộ GD&ĐT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function generateMockReply(q: string): string {
  const qLow = q.toLowerCase();
  if (qLow.includes("giáo án") || qLow.includes("soạn"))
    return "Tôi có thể giúp bạn soạn giáo án. Hãy cho tôi biết:\n1. Chương trình CT1-CT5 nào?\n2. Cấp học (lớp mấy)?\n3. Bộ môn hoặc chủ đề cụ thể?\n\nBạn cũng có thể mở Lesson Plan Builder để tôi đồng hành soạn từng phần với bạn.";
  if (qLow.includes("robotic") || qLow.includes("ct4"))
    return "CT4 — Robotic/AI/Trải nghiệm phù hợp THCS, THPT. Dàn ý đề xuất:\n\n1. Khởi động (10p): cho HS xem video robot Mbot lách vật cản\n2. Kiến thức (15p): khái niệm cảm biến siêu âm, vòng lặp, điều kiện\n3. Thực hành nhóm (45p): lập trình robot né chướng ngại vật\n4. Trình bày & đánh giá (20p): từng nhóm demo, chấm theo 3 tiêu chí\n\nCần tôi chuẩn bị giáo án chi tiết hơn không?";
  if (qLow.includes("phân tích") || qLow.includes("nam"))
    return "Phân tích học sinh Lê Hoàng Nam (Lớp 8A):\n• Điểm mạnh: CT1 Tích hợp nội môn (8.5), Hợp tác nhóm (85%)\n• Điểm yếu: Giải quyết vấn đề (68%), CT5 NCKH chưa đủ kinh nghiệm\n• Đề xuất: tăng cường bài tập tình huống, tham gia CLB Sáng tạo CT3\n• Dự đoán 3 tháng: có thể tăng điểm TB từ 8.3 lên 8.7";
  if (qLow.includes("ct5") || qLow.includes("nckh"))
    return "CT5 NCKH cho HS lần đầu tiên — tiêu chí đánh giá:\n• Tính khoa học (30%): có cơ sở lý thuyết\n• Tính thực tiễn (25%): giải quyết vấn đề cụ thể\n• Tính sáng tạo (25%): cách tiếp cận mới\n• Khả năng trình bày (20%): báo cáo rõ ràng\n\nGợi ý đề tài: lọc nước từ thực vật, cách nhiệt tái chế, giảm tiếng ồn.";
  if (qLow.includes("thông tư") || qLow.includes("38"))
    return "Thông tư 38/2023 của Bộ GD&ĐT về thiết bị dạy học STEM:\n\n• Danh mục thiết bị tối thiểu theo cấp học\n• Tiêu chí đạt chuẩn kỹ thuật\n• Quy trình mua sắm và nghiệm thu\n• Trách nhiệm duy trì, bảo trì\n\nHệ thống tự động tổng hợp dữ liệu thiết bị từ Data Lake và xuất biểu mẫu theo đúng Thông tư.";
  return "Cảm ơn bạn đã hỏi. Đây là phản hồi mô phỏng từ AI-Buddy — khi tích hợp backend Claude API sẽ trả lời thật theo context của bạn. Hãy thử các câu hỏi gợi ý bên phải để xem demo đầy đủ.";
}

function AIBuddyRecommend() {
  const [program, setProgram] = useState<StemProgram>("CT2");
  const suggestions = lessons.filter((l) => l.programCode === program).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#2563eb]/5 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#7c3aed]" />
          <p style={{ fontSize: "14px", fontWeight: 700 }}>Gợi ý bài học cá nhân hóa</p>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          AI-Buddy phân tích hồ sơ học sinh và lịch sử tương tác để đề xuất nội dung phù hợp nhất.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Chương trình:</span>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => {
          const p = STEM_PROGRAMS[c];
          const active = program === c;
          return (
            <button key={c} onClick={() => setProgram(c)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active ? { backgroundColor: p.color } : {}),
              }}>
              {c} · {p.shortName}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((l, i) => (
          <div key={l.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md">
            <div className="flex">
              <img src={l.thumbnail} alt={l.title} className="w-24 h-full object-cover shrink-0" />
              <div className="p-3 flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <ProgramBadge code={l.programCode} size="xs" />
                  <span className="px-1.5 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded" style={{ fontSize: "9px", fontWeight: 700 }}>
                    AI GỢI Ý #{i + 1}
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{l.title}</p>
                <p className="text-muted-foreground line-clamp-2 mt-0.5" style={{ fontSize: "11px" }}>
                  {l.description}
                </p>
                <div className="mt-2 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                  Phù hợp: {Math.round(85 + (i * 7) % 14)}% · {l.durationMinutes}p
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIBuddyGrade() {
  const [submission, setSubmission] = useState("");
  const [graded, setGraded] = useState(false);

  const handleGrade = () => {
    if (!submission.trim()) { toast.warning("Vui lòng nhập bài làm"); return; }
    setTimeout(() => setGraded(true), 600);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#16a34a]/10 to-[#c8a84e]/5 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <PenTool className="w-5 h-5 text-[#16a34a]" />
          <p style={{ fontSize: "14px", fontWeight: 700 }}>Chấm bài thông minh</p>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          Dán bài tự luận của HS vào khung dưới. AI-Buddy chấm theo rubric CT, kèm nhận xét cá nhân hóa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground mb-2" style={{ fontSize: "11.5px", fontWeight: 600 }}>BÀI LÀM CỦA HỌC SINH</p>
          <textarea value={submission} onChange={(e) => setSubmission(e.target.value)}
            placeholder="Dán bài tự luận vào đây..."
            rows={10}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
            style={{ fontSize: "13px" }} />
          <button onClick={handleGrade}
            className="mt-3 w-full px-4 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Sparkles className="w-4 h-4 inline mr-1" /> AI chấm ngay
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-muted-foreground mb-2" style={{ fontSize: "11.5px", fontWeight: 600 }}>KẾT QUẢ CHẤM</p>
          {graded ? (
            <div className="space-y-3">
              <div className="text-center p-4 bg-[#16a34a]/10 rounded-lg">
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Điểm đề xuất</p>
                <p className="text-[#16a34a]" style={{ fontSize: "36px", fontWeight: 800 }}>8.5/10</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Nội dung", score: 85, max: 100 },
                  { label: "Tính khoa học", score: 80, max: 100 },
                  { label: "Sáng tạo", score: 90, max: 100 },
                  { label: "Trình bày", score: 88, max: 100 },
                ].map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span style={{ fontSize: "11.5px" }}>{c.label}</span>
                      <span style={{ fontSize: "11.5px", fontWeight: 600 }}>{c.score}/{c.max}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-[#16a34a]" style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#7c3aed]/5 border border-[#7c3aed]/30 rounded-lg">
                <p style={{ fontSize: "11px", fontWeight: 600 }}>
                  <Bot className="w-3 h-3 inline mr-1 text-[#7c3aed]" /> Nhận xét AI-Buddy:
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
                  Bài làm có cấu trúc rõ ràng, đặt vấn đề tốt. Điểm mạnh ở phần sáng tạo với ý tưởng
                  độc đáo. Cần bổ sung thêm dẫn chứng khoa học, trích dẫn nguồn để tăng tính khoa học.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12" style={{ fontSize: "12px" }}>
              <PenTool className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Dán bài làm và bấm "AI chấm ngay" để xem kết quả</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AIBuddyAnalyze() {
  const skills = [
    { skill: "Sáng tạo", value: 82 },
    { skill: "Tư duy phản biện", value: 75 },
    { skill: "Hợp tác", value: 88 },
    { skill: "Giao tiếp", value: 70 },
    { skill: "Giải quyết vấn đề", value: 78 },
    { skill: "Tư duy kỹ sư", value: 72 },
  ];

  const programScores = (Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => ({
    code: c,
    name: STEM_PROGRAMS[c].shortName,
    score: 6.5 + ((c.charCodeAt(0) * 7) % 30) / 10,
    fill: STEM_PROGRAMS[c].color,
  }));

  const strong = skills.reduce((a, b) => a.value > b.value ? a : b);
  const weak = skills.reduce((a, b) => a.value < b.value ? a : b);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-[#c8a84e]/10 to-[#990803]/5 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-[#c8a84e]" />
          <p style={{ fontSize: "14px", fontWeight: 700 }}>Phân tích hồ sơ năng lực</p>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          AI-Buddy tổng hợp dữ liệu từ bài làm, điểm thi, tương tác để phân tích 6 năng lực cốt lõi STEM.
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#2563eb]/5 rounded-xl border border-[#7c3aed]/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-[#7c3aed]" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: "13.5px", fontWeight: 700 }}>AI-Buddy nhận định</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
              Học sinh có năng lực nổi bật ở <strong className="text-[#16a34a]">{strong.skill} ({strong.value}%)</strong>.
              Điểm mạnh nhất ở <strong>Chương trình {programScores.reduce((a, b) => a.score > b.score ? a : b).name}</strong>.
              Cần củng cố kỹ năng <strong className="text-[#dc2626]">{weak.skill} ({weak.value}%)</strong> bằng
              bài tập tình huống thực tế. Khuyến nghị tham gia thêm CLB Sáng tạo CT3 và dự án nhóm
              để phát huy thế mạnh hợp tác.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Target className="w-4 h-4 inline mr-1.5" /> 6 năng lực cốt lõi
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={skills}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Năng lực" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 inline mr-1.5" /> Điểm theo chương trình
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={programScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Lightbulb className="w-4 h-4 inline mr-1.5 text-[#c8a84e]" />
          Khuyến nghị phát triển
        </h3>
        <div className="space-y-2">
          {[
            { icon: CheckCircle2, color: "#16a34a", label: "Phát huy CT4 Robotic → tham gia Hackathon tháng 5", priority: "Cao" },
            { icon: AlertCircle, color: "#f59e0b", label: "Củng cố Giao tiếp → bài thuyết trình nhóm hàng tuần", priority: "Trung bình" },
            { icon: BookOpen, color: "#2563eb", label: "Đọc thêm tài liệu CT5 NCKH để sẵn sàng dự án lớp 9", priority: "Trung bình" },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-secondary/40 rounded-lg">
              <r.icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: r.color }} />
              <div className="flex-1">
                <p style={{ fontSize: "12.5px", fontWeight: 500 }}>{r.label}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded" style={{
                  fontSize: "10px", fontWeight: 600,
                  color: r.color, backgroundColor: r.color + "15",
                }}>
                  Ưu tiên: {r.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AIBuddyPanel() {
  const [tab, setTab] = useState<"chat" | "recommend" | "grade" | "analyze">("chat");
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Bot}
        title="AI-Buddy — Trợ lý Giáo dục STEM"
        subtitle={`Xin chào ${user?.name?.split(" ").slice(-2).join(" ") || ""}. Chat, chấm bài, gợi ý và phân tích — tất cả trong một.`}
        accentColor="#7c3aed"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded" style={{ fontSize: "11px", fontWeight: 700 }}>
            <Bot className="w-3 h-3" /> v1.5.2 · Claude-powered
          </span>
        }
      />

      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
        {[
          { id: "chat",      label: "Chat",          icon: MessageCircle },
          { id: "recommend", label: "Gợi ý bài",     icon: Sparkles },
          { id: "grade",     label: "Chấm bài",      icon: PenTool },
          { id: "analyze",   label: "Phân tích HS",  icon: Target },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              tab === t.id ? "bg-[#7c3aed] text-white shadow-sm" : "hover:bg-secondary"
            }`}
            style={{ fontSize: "12.5px", fontWeight: tab === t.id ? 600 : 500 }}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chat" && <AIBuddyChat />}
      {tab === "recommend" && <AIBuddyRecommend />}
      {tab === "grade" && <AIBuddyGrade />}
      {tab === "analyze" && <AIBuddyAnalyze />}
    </div>
  );
}

export default AIBuddyPanel;
