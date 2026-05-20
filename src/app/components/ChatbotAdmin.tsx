import { useAuth } from "./AuthContext";
import { toast } from "@/app/lib/toast";
import { useState } from "react";
import {
  Bot, Search, Settings, Activity, MessageCircle, Brain,
  Zap, TrendingUp, Users, Clock, CheckCircle, AlertTriangle,
  BookOpen, Database, Plus, Edit, Trash2, Play, Pause,
  RefreshCw, BarChart3, Eye, Globe, Shield, ThumbsUp,
  ThumbsDown, Filter, Download, Upload, Star, Lightbulb,
  FileText, HelpCircle, Target, Layers,
} from "lucide-react";

// ─── Types ───
interface KnowledgeSource {
  id: string;
  name: string;
  type: "course" | "wiki" | "faq" | "policy" | "custom";
  documents: number;
  lastIndexed: string;
  status: "indexed" | "indexing" | "error" | "pending";
  coverage: number;
}

interface ConversationSample {
  id: string;
  userQuery: string;
  botResponse: string;
  confidence: number;
  source: string;
  rating: "positive" | "negative" | "neutral";
  timestamp: string;
  user: string;
  userRole: "admin" | "instructor" | "learner";
}

interface Intent {
  id: string;
  name: string;
  description: string;
  examples: string[];
  responses: number;
  accuracy: number;
  category: string;
}

// ─── Mock Data ───
const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { id: "KS01", name: "Khóa học LMS", type: "course", documents: 156, lastIndexed: "12/03/2026 06:00", status: "indexed", coverage: 95 },
  { id: "KS02", name: "Wiki Nội bộ", type: "wiki", documents: 85, lastIndexed: "12/03/2026 06:00", status: "indexed", coverage: 88 },
  { id: "KS03", name: "FAQ Đào tạo", type: "faq", documents: 230, lastIndexed: "12/03/2026 06:00", status: "indexed", coverage: 98 },
  { id: "KS04", name: "Chính sách & Quy trình", type: "policy", documents: 42, lastIndexed: "11/03/2026 22:00", status: "indexed", coverage: 92 },
  { id: "KS05", name: "Hướng dẫn Sử dụng LMS", type: "custom", documents: 28, lastIndexed: "12/03/2026 06:00", status: "indexed", coverage: 100 },
  { id: "KS06", name: "Thư viện Chứng chỉ", type: "custom", documents: 18, lastIndexed: "10/03/2026 23:00", status: "pending", coverage: 70 },
];

const CONVERSATIONS: ConversationSample[] = [
  {
    id: "CV01", userQuery: "Làm sao để đăng ký khóa học Lãnh đạo 4.0?",
    botResponse: "Bạn có thể đăng ký khóa 'Lãnh đạo 4.0' bằng cách vào Khóa học → tìm kiếm → Đăng ký. Khóa này dành cho cấp quản lý trở lên, cần phê duyệt từ Line Manager.",
    confidence: 95, source: "FAQ Đào tạo", rating: "positive", timestamp: "12/03/2026 09:30", user: "Nguyễn Minh Anh", userRole: "learner",
  },
  {
    id: "CV02", userQuery: "Tôi quên mật khẩu, phải làm sao?",
    botResponse: "Bạn có thể reset mật khẩu qua Azure AD SSO tại portal.geleximco.vn hoặc liên hệ IT Helpdesk ext.1234.",
    confidence: 98, source: "FAQ Đào tạo", rating: "positive", timestamp: "12/03/2026 09:15", user: "Trần Văn Bình", userRole: "learner",
  },
  {
    id: "CV03", userQuery: "Deadline khóa ATLĐ bắt buộc là khi nào?",
    botResponse: "Deadline khóa An toàn Lao động bắt buộc cho đợt Q1/2026 là 31/03/2026. Bạn đã hoàn thành 75%. Hãy hoàn thành 2 bài kiểm tra còn lại trước hạn.",
    confidence: 92, source: "Khóa học LMS", rating: "positive", timestamp: "12/03/2026 08:45", user: "Lê Quang Dũng", userRole: "learner",
  },
  {
    id: "CV04", userQuery: "Chính sách hỗ trợ học phí cho nhân viên thế nào?",
    botResponse: "Theo chính sách TC-2024-015, Geleximco hỗ trợ 100% học phí cho khóa đào tạo bắt buộc, 70% cho khóa chuyên môn được phê duyệt, và 50% cho khóa tự chọn.",
    confidence: 88, source: "Chính sách & Quy trình", rating: "positive", timestamp: "12/03/2026 08:30", user: "Phạm Thị Lan", userRole: "learner",
  },
  {
    id: "CV05", userQuery: "Làm sao export danh sách học viên theo đơn vị?",
    botResponse: "Xin lỗi, tôi chưa có đủ thông tin để hướng dẫn chi tiết. Bạn có thể vào Báo cáo → Tạo Báo cáo mới → chọn 'Học viên theo Đơn vị'.",
    confidence: 62, source: "Hướng dẫn Sử dụng LMS", rating: "negative", timestamp: "12/03/2026 08:00", user: "Đỗ Thanh Hương", userRole: "instructor",
  },
  {
    id: "CV06", userQuery: "Cách tạo bài kiểm tra nhiều lựa chọn?",
    botResponse: "Vào Kiểm tra & Đánh giá → Tạo bài thi mới → Thêm câu hỏi → chọn loại 'Multiple Choice'. Bạn có thể import từ Question Bank hoặc tạo mới.",
    confidence: 94, source: "Hướng dẫn Sử dụng LMS", rating: "positive", timestamp: "11/03/2026 16:30", user: "Ngô Trung Kiên", userRole: "instructor",
  },
  {
    id: "CV07", userQuery: "Giải thích thuật toán xếp hạng leaderboard",
    botResponse: "Tôi không có thông tin về thuật toán xếp hạng chi tiết. Vui lòng liên hệ Admin để được hỗ trợ.",
    confidence: 35, source: "—", rating: "negative", timestamp: "11/03/2026 15:00", user: "Trần Thị Hương", userRole: "instructor",
  },
  {
    id: "CV08", userQuery: "Thống kê bao nhiêu người hoàn thành khóa Excel VBA tháng này?",
    botResponse: "Theo dữ liệu hiện tại, khóa Excel & VBA Automation có 45 học viên hoàn thành trong tháng 03/2026 (tăng 15% so với T2). Tỷ lệ đạt: 92%.",
    confidence: 90, source: "Khóa học LMS", rating: "positive", timestamp: "11/03/2026 14:00", user: "Bùi Thị Hà", userRole: "instructor",
  },
];

const INTENTS: Intent[] = [
  { id: "I01", name: "course_enrollment", description: "Đăng ký / hủy đăng ký khóa học", examples: ["Đăng ký khóa...", "Cách tham gia khóa..."], responses: 1250, accuracy: 96, category: "Khóa học" },
  { id: "I02", name: "password_reset", description: "Reset mật khẩu / vấn đề đăng nhập", examples: ["Quên mật khẩu", "Không đăng nhập được"], responses: 890, accuracy: 99, category: "Tài khoản" },
  { id: "I03", name: "deadline_inquiry", description: "Hỏi deadline khóa học / bài thi", examples: ["Deadline khi nào?", "Hạn hoàn thành..."], responses: 780, accuracy: 94, category: "Khóa học" },
  { id: "I04", name: "certificate_status", description: "Tra cứu trạng thái chứng chỉ", examples: ["Chứng chỉ của tôi?", "Khi nào nhận cert..."], responses: 560, accuracy: 92, category: "Chứng chỉ" },
  { id: "I05", name: "policy_info", description: "Thông tin chính sách đào tạo", examples: ["Chính sách hỗ trợ?", "Quy trình đề xuất..."], responses: 420, accuracy: 88, category: "Chính sách" },
  { id: "I06", name: "report_request", description: "Yêu cầu báo cáo / thống kê", examples: ["Thống kê hoàn thành?", "Báo cáo tháng..."], responses: 350, accuracy: 85, category: "Báo cáo" },
  { id: "I07", name: "technical_support", description: "Hỗ trợ kỹ thuật LMS", examples: ["Lỗi video", "Không load được..."], responses: 680, accuracy: 90, category: "Kỹ thuật" },
  { id: "I08", name: "learning_path_info", description: "Thông tin lộ trình đào tạo", examples: ["Lộ trình cho tôi?", "Khóa nào tiếp theo?"], responses: 290, accuracy: 87, category: "Lộ trình" },
];

const TYPE_ICONS = {
  course: { icon: BookOpen, color: "#990803" },
  wiki: { icon: FileText, color: "#2563eb" },
  faq: { icon: HelpCircle, color: "#16a34a" },
  policy: { icon: Shield, color: "#7c3aed" },
  custom: { icon: Layers, color: "#ea580c" },
};

export function ChatbotAdmin() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "knowledge" | "conversations" | "intents" | "settings">("overview");
  const [search, setSearch] = useState("");

  const totalConvs = 4520;
  const todayConvs = 156;
  const avgConfidence = Math.round(CONVERSATIONS.reduce((s, c) => s + c.confidence, 0) / CONVERSATIONS.length);
  const satisfactionRate = Math.round((CONVERSATIONS.filter(c => c.rating === "positive").length / CONVERSATIONS.length) * 100);
  const totalDocs = KNOWLEDGE_SOURCES.reduce((s, k) => s + k.documents, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Quản trị GelBot AI</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Cấu hình, huấn luyện và giám sát AI Chatbot hỗ trợ đào tạo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600" style={{ fontSize: "11px", fontWeight: 600 }}>GelBot Online</span>
          </div>
          <button onClick={() => { toast.info("Đang re-index tất cả nguồn tri thức..."); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" /> Re-index
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng hội thoại", value: totalConvs.toLocaleString(), icon: MessageCircle, color: "#990803" },
          { label: "Hôm nay", value: todayConvs, icon: Zap, color: "#2563eb" },
          { label: "Độ tin cậy TB", value: `${avgConfidence}%`, icon: Brain, color: "#c8a84e" },
          { label: "Hài lòng", value: `${satisfactionRate}%`, icon: ThumbsUp, color: "#16a34a" },
          { label: "Tài liệu", value: totalDocs, icon: Database, color: "#7c3aed" },
          { label: "Intents", value: INTENTS.length, icon: Target, color: "#ea580c" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Tổng quan", icon: BarChart3 },
          { id: "knowledge" as const, label: "Knowledge Base", icon: Database },
          { id: "conversations" as const, label: "Hội thoại", icon: MessageCircle },
          { id: "intents" as const, label: "Intents", icon: Target },
          { id: "settings" as const, label: "Cài đặt", icon: Settings },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab conversations={CONVERSATIONS} intents={INTENTS} />}
      {tab === "knowledge" && <KnowledgeTab sources={KNOWLEDGE_SOURCES} />}
      {tab === "conversations" && <ConversationsTab conversations={CONVERSATIONS} search={search} setSearch={setSearch} />}
      {tab === "intents" && <IntentsTab intents={INTENTS} />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ conversations, intents }: { conversations: ConversationSample[]; intents: Intent[] }) {
  // Conversation volume by hour
  const hourData = [12, 18, 8, 4, 2, 3, 15, 35, 62, 78, 85, 72, 45, 58, 70, 65, 52, 38, 25, 18, 12, 8, 5, 3];
  const maxHour = Math.max(...hourData);

  // Confidence distribution
  const confBuckets = [0, 0, 0, 0, 0]; // <40, 40-60, 60-80, 80-90, 90+
  conversations.forEach(c => {
    if (c.confidence >= 90) confBuckets[4]++;
    else if (c.confidence >= 80) confBuckets[3]++;
    else if (c.confidence >= 60) confBuckets[2]++;
    else if (c.confidence >= 40) confBuckets[1]++;
    else confBuckets[0]++;
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Volume Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Lượng Hội thoại theo Giờ (Hôm nay)</h3>
          <svg width="100%" height="100" viewBox="0 0 520 100" preserveAspectRatio="xMidYMid meet">
            {hourData.map((count, h) => {
              const x = 10 + (h / 23) * 490;
              const barH = maxHour > 0 ? (count / maxHour) * 70 : 0;
              return (
                <g key={h}>
                  <rect x={x - 7} y={75 - barH} width="14" height={barH} rx="2" fill="#990803" opacity={0.3 + (count / maxHour) * 0.7} />
                  {h % 3 === 0 && <text x={x} y={90} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{h}h</text>}
                  {count === maxHour && <text x={x} y={70 - barH} textAnchor="middle" fill="#990803" style={{ fontSize: "8px", fontWeight: 700 }}>{count}</text>}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Độ Tin cậy</h3>
          <div className="space-y-2">
            {["<40%", "40-60%", "60-80%", "80-90%", "90%+"].map((label, i) => {
              const colors = ["#ef4444", "#ea580c", "#c8a84e", "#2563eb", "#16a34a"];
              const maxB = Math.max(...confBuckets);
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-12 text-gray-500 text-right shrink-0" style={{ fontSize: "10px" }}>{label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${maxB > 0 ? (confBuckets[i] / maxB) * 100 : 0}%`, backgroundColor: colors[i] }} />
                  </div>
                  <span className="w-6 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{confBuckets[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Intents */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Top Intents Phổ biến</h3>
          <div className="space-y-1.5">
            {intents.slice(0, 5).map((intent, i) => {
              const maxR = Math.max(...intents.map(it => it.responses));
              return (
                <div key={intent.id} className="flex items-center gap-2">
                  <span className="w-4 text-gray-300 text-right" style={{ fontSize: "10px", fontWeight: 700 }}>#{i + 1}</span>
                  <span className="w-32 text-gray-600 truncate" style={{ fontSize: "11px" }}>{intent.description}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#990803]" style={{ width: `${(intent.responses / maxR) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{intent.responses}</span>
                  <span className="w-10 text-right" style={{ fontSize: "10px", fontWeight: 600, color: intent.accuracy >= 90 ? "#16a34a" : "#ea580c" }}>{intent.accuracy}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Ratings */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Đánh giá Gần đây</h3>
          <div className="space-y-1.5">
            {conversations.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                {c.rating === "positive" ? <ThumbsUp className="w-3 h-3 text-green-500 shrink-0 mt-0.5" /> :
                 c.rating === "negative" ? <ThumbsDown className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> :
                 <Minus className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 truncate" style={{ fontSize: "11px" }}>"{c.userQuery}"</p>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>{c.user} • Confidence: {c.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satisfaction Trend (mini) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Xu hướng Hài lòng 7 Ngày</h3>
        <SatisfactionTrendChart />
      </div>
    </div>
  );
}

function Minus(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

// ─── Satisfaction Trend Chart ───
function SatisfactionTrendChart() {
  const data = [
    { day: "T2", positive: 82, negative: 8, neutral: 10 },
    { day: "T3", positive: 85, negative: 6, neutral: 9 },
    { day: "T4", positive: 80, negative: 10, neutral: 10 },
    { day: "T5", positive: 88, negative: 5, neutral: 7 },
    { day: "T6", positive: 86, negative: 7, neutral: 7 },
    { day: "T7", positive: 90, negative: 4, neutral: 6 },
    { day: "CN", positive: 75, negative: 12, neutral: 13 },
  ];
  const W = 520, H = 100, pL = 35, pR = 10, pT = 10, pB = 20;
  const cW = W - pL - pR, cH = H - pT - pB;

  return (
    <svg width="100%" height="100" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[0, 25, 50, 75, 100].map(v => {
        const y = pT + cH - (v / 100) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={pL - 4} y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}%</text>
          </g>
        );
      })}
      {/* Positive line */}
      <polyline points={data.map((d, i) => `${pL + (i / (data.length - 1)) * cW},${pT + cH - (d.positive / 100) * cH}`).join(" ")} fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
      {/* Negative line */}
      <polyline points={data.map((d, i) => `${pL + (i / (data.length - 1)) * cW},${pT + cH - (d.negative / 100) * cH}`).join(" ")} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />
      {/* Points + labels */}
      {data.map((d, i) => {
        const x = pL + (i / (data.length - 1)) * cW;
        return (
          <g key={i}>
            <circle cx={x} cy={pT + cH - (d.positive / 100) * cH} r="3" fill="#16a34a" />
            <circle cx={x} cy={pT + cH - (d.negative / 100) * cH} r="2" fill="#ef4444" />
            <text x={x} y={H - 4} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{d.day}</text>
          </g>
        );
      })}
      <text x={W - 60} y={pT + 5} fill="#16a34a" style={{ fontSize: "8px" }}>— Hài lòng</text>
      <text x={W - 60} y={pT + 15} fill="#ef4444" style={{ fontSize: "8px" }}>-- Không hài lòng</text>
    </svg>
  );
}

// ─── Knowledge Tab ───
function KnowledgeTab({ sources }: { sources: KnowledgeSource[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Nguồn tri thức mà GelBot sử dụng để trả lời</p>
        <button onClick={() => { toast.info("Thêm nguồn tri thức mới..."); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Plus className="w-3 h-3" /> Thêm nguồn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sources.map(src => {
          const tCfg = TYPE_ICONS[src.type];
          const TIcon = tCfg.icon;
          const stColor = src.status === "indexed" ? "#16a34a" : src.status === "indexing" ? "#2563eb" : src.status === "error" ? "#ef4444" : "#c8a84e";
          const stLabel = src.status === "indexed" ? "Đã index" : src.status === "indexing" ? "Đang index..." : src.status === "error" ? "Lỗi" : "Chờ index";
          return (
            <div key={src.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tCfg.color + "10" }}>
                  <TIcon className="w-5 h-5" style={{ color: tCfg.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{src.name}</h4>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: stColor, backgroundColor: stColor + "10" }}>{stLabel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                    <span>{src.documents} tài liệu</span>
                    <span>Coverage: {src.coverage}%</span>
                    <span>Cập nhật: {src.lastIndexed}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${src.coverage}%`, backgroundColor: tCfg.color }} />
                    </div>
                    <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{src.coverage}%</span>
                  </div>
                </div>
                <button onClick={() => { toast.info(`Re-index: ${src.name}...`); }} className="p-1 text-gray-300 hover:text-[#990803] cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Conversations Tab ───
function ConversationsTab({ conversations, search, setSearch }: { conversations: ConversationSample[]; search: string; setSearch: (s: string) => void }) {
  const [filterRating, setFilterRating] = useState("all");
  const filtered = conversations.filter(c => {
    if (search && !c.userQuery.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRating !== "all" && c.rating !== filterRating) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm hội thoại..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả đánh giá</option>
          <option value="positive">Hài lòng</option>
          <option value="negative">Không hài lòng</option>
          <option value="neutral">Trung lập</option>
        </select>
      </div>

      {filtered.map(c => {
        const ratingIcon = c.rating === "positive" ? ThumbsUp : c.rating === "negative" ? ThumbsDown : Activity;
        const ratingColor = c.rating === "positive" ? "#16a34a" : c.rating === "negative" ? "#ef4444" : "#6b7280";
        const RIcon = ratingIcon;
        const confColor = c.confidence >= 80 ? "#16a34a" : c.confidence >= 60 ? "#ea580c" : "#ef4444";
        return (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
            {/* User query */}
            <div className="flex items-start gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center shrink-0" style={{ fontSize: "7px", fontWeight: 700 }}>
                {c.user.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>{c.user}</span>
                  <span className="text-gray-300" style={{ fontSize: "9px" }}>{c.timestamp}</span>
                </div>
                <p className="text-gray-800 bg-blue-50 px-3 py-1.5 rounded-lg inline-block" style={{ fontSize: "12px" }}>"{c.userQuery}"</p>
              </div>
            </div>
            {/* Bot response */}
            <div className="flex items-start gap-2 ml-8">
              <div className="w-6 h-6 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg" style={{ fontSize: "12px" }}>{c.botResponse}</p>
                <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                  <span className="flex items-center gap-0.5" style={{ color: confColor }}>
                    <Brain className="w-2.5 h-2.5" /> Confidence: {c.confidence}%
                  </span>
                  <span className="flex items-center gap-0.5"><Database className="w-2.5 h-2.5" /> {c.source}</span>
                  <span className="flex items-center gap-0.5" style={{ color: ratingColor }}>
                    <RIcon className="w-2.5 h-2.5" /> {c.rating === "positive" ? "Hài lòng" : c.rating === "negative" ? "Không hài lòng" : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Intents Tab ───
function IntentsTab({ intents }: { intents: Intent[] }) {
  const maxR = Math.max(...intents.map(i => i.responses));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Các intent (ý định) mà GelBot nhận diện</p>
        <button onClick={() => { toast.info("Thêm Intent mới..."); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Plus className="w-3 h-3" /> Thêm Intent
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_2fr_80px_80px_80px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          {["Intent", "Mô tả", "Responses", "Accuracy", "Danh mục"].map(h => (
            <span key={h} className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        {intents.map(intent => (
          <div key={intent.id} className="grid grid-cols-[1fr_2fr_80px_80px_80px] gap-2 px-4 py-2.5 border-b border-gray-100 hover:bg-gray-50 items-center">
            <span className="font-mono text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>{intent.name}</span>
            <span className="text-gray-600" style={{ fontSize: "11px" }}>{intent.description}</span>
            <div className="flex items-center gap-1">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#990803]" style={{ width: `${(intent.responses / maxR) * 100}%` }} />
              </div>
              <span className="text-gray-500" style={{ fontSize: "10px" }}>{intent.responses}</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: intent.accuracy >= 90 ? "#16a34a" : "#ea580c" }}>{intent.accuracy}%</span>
            <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-center" style={{ fontSize: "9px" }}>{intent.category}</span>
            <button onClick={() => { toast.info("Chỉnh sửa intent..."); }} className="p-1 text-gray-300 hover:text-[#990803] cursor-pointer"><Edit className="w-3 h-3" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Tab ───
function SettingsTab() {
  const [behaviors, setBehaviors] = useState([
    { label: "Tên Bot", value: "GelBot", active: true },
    { label: "Greeting Message", value: "Xin chào! Tôi là GelBot, trợ lý AI của Geleximco LMS. Tôi có thể giúp gì cho bạn?", active: true },
    { label: "Role-specific responses", value: "Bật — Phản hồi khác nhau cho Admin / Giảng viên / Học viên", active: true },
    { label: "Auto-suggest follow-ups", value: "Bật — Gợi ý 3 câu hỏi liên quan sau mỗi phản hồi", active: true },
    { label: "Proactive notifications", value: "Bật — Nhắc deadline, khóa mới, gợi ý học tập", active: false },
  ]);

  const toggleBehavior = (idx: number) => {
    setBehaviors(prev => prev.map((b, i) => i === idx ? { ...b, active: !b.active } : b));
    toast.success(`Đã ${behaviors[idx].active ? "tắt" : "bật"} ${behaviors[idx].label}`);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Cấu hình AI Model</h3>
        <div className="space-y-3">
          {[
            { label: "AI Model", value: "GPT-4o Mini (Azure)", desc: "Model ngôn ngữ chính" },
            { label: "Temperature", value: "0.3", desc: "Độ sáng tạo (thấp = chính xác hơn)" },
            { label: "Max Tokens", value: "1,024", desc: "Giới hạn độ dài phản hồi" },
            { label: "Language", value: "Vietnamese (vi-VN)", desc: "Ngôn ngữ mặc định" },
            { label: "Fallback Action", value: "Chuyển tới IT Helpdesk", desc: "Khi không trả lời được" },
            { label: "Confidence Threshold", value: "60%", desc: "Ngưỡng tối thiểu để trả lời" },
          ].map((cfg, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{cfg.label}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{cfg.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 font-mono" style={{ fontSize: "12px" }}>{cfg.value}</span>
                <button onClick={() => { toast.info(`Chỉnh sửa: ${cfg.label}`); }} className="p-1 text-gray-300 hover:text-[#990803] cursor-pointer"><Edit className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Hành vi & Personas</h3>
        <div className="space-y-2">
          {behaviors.map((opt, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{opt.label}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{opt.value}</p>
              </div>
              <div onClick={() => toggleBehavior(i)} className={`w-8 h-4 rounded-full cursor-pointer relative ${opt.active ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${opt.active ? "left-[18px]" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Lịch Re-index Tự động</h3>
        <div className="flex items-center gap-3 text-gray-500" style={{ fontSize: "12px" }}>
          <span>Tần suất:</span>
          <span className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded font-mono" style={{ fontSize: "12px" }}>Hàng ngày 06:00</span>
          <span className="text-gray-300">|</span>
          <span>Lần cuối: 12/03/2026 06:00:45</span>
          <span className="text-gray-300">|</span>
          <span className="text-green-600" style={{ fontWeight: 500 }}>✓ Thành công</span>
        </div>
      </div>
    </div>
  );
}