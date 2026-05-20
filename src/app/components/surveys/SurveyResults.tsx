import React from "react";
import {
  ArrowLeft, Download, Users, Calendar, Clock,
  TrendingUp, Star, BarChart3, MessageSquare,
  Brain, CheckCircle2, AlertTriangle, Lightbulb, Building2,
  Send, RefreshCw, Sparkles,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import {
  MOCK_SURVEYS, CATEGORY_CONFIG, STATUS_CONFIG,
  SV001_RATINGS, SV001_CHOICES, SV001_NPS, SV001_TEXT, SV001_TREND,
  SV001_SUBSIDIARY_BREAKDOWN, SV001_AI_INSIGHTS,
  getSurveyCompletionRate, getDaysRemaining,
  type Survey, type AggregatedRating, type AggregatedChoice, type AggregatedNPS, type AggregatedText,
  type SubsidiaryBreakdown, type AIInsight, type ResponseTrendPoint,
} from "./mock-data";
import { useAuth } from "../AuthContext";

interface SurveyResultsProps {
  surveyId: string;
  onBack: () => void;
}

export function SurveyResults({ surveyId, onBack }: SurveyResultsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const survey = MOCK_SURVEYS.find(s => s.id === surveyId) || MOCK_SURVEYS[0];
  const catCfg = CATEGORY_CONFIG[survey.category];
  const stCfg = STATUS_CONFIG[survey.status];
  const rate = getSurveyCompletionRate(survey);
  const daysLeft = getDaysRemaining(survey.endDate);

  const ratings = SV001_RATINGS;
  const choices = SV001_CHOICES;
  const nps = SV001_NPS;
  const textData = SV001_TEXT;
  const trend = SV001_TREND;
  const subsidiaryData = SV001_SUBSIDIARY_BREAKDOWN;
  const aiInsights = SV001_AI_INSIGHTS;

  const overallAvg = React.useMemo(() => {
    if (ratings.length === 0) return 0;
    return +(ratings.reduce((s, r) => s + r.average, 0) / ratings.length).toFixed(2);
  }, [ratings]);

  const [activeTab, setActiveTab] = React.useState<"overview" | "detail" | "subsidiary" | "ai">("overview");

  const tabs = [
    { id: "overview" as const, label: "Tổng quan", icon: BarChart3 },
    { id: "detail" as const, label: "Chi tiết câu hỏi", icon: MessageSquare },
    ...(isAdmin ? [
      { id: "subsidiary" as const, label: "Theo đơn vị", icon: Building2 },
      { id: "ai" as const, label: "AI Phân tích", icon: Brain },
    ] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer mt-0.5 shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="min-w-0">
            <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{survey.title}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="px-1.5 py-0.5 rounded-full" style={{ color: catCfg.color, backgroundColor: catCfg.bg, fontSize: "10px", fontWeight: 600 }}>{catCfg.label}</span>
              <span className="px-1.5 py-0.5 rounded-full" style={{ color: stCfg.color, backgroundColor: stCfg.bg, fontSize: "10px", fontWeight: 600 }}>{stCfg.label}</span>
              <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}><Users className="w-3 h-3" /> {survey.responseCount}/{survey.targetCount}</span>
              {survey.startDate && <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}><Calendar className="w-3 h-3" /> {survey.startDate} — {survey.endDate}</span>}
              {survey.status === "active" && daysLeft >= 0 && (
                <span className={`flex items-center gap-1 ${daysLeft <= 3 ? "text-red-500" : "text-amber-500"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                  <Clock className="w-3 h-3" /> {daysLeft} ngày còn lại
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && survey.status === "active" && (
            <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px" }}
              onClick={() => toast.success(`Đã gửi nhắc nhở cho ${survey.targetCount - survey.responseCount} người chưa phản hồi`)}>
              <Send className="w-3.5 h-3.5" /> Nhắc nhở
            </button>
          )}
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px" }}
            onClick={() => toast.success("Đang xuất báo cáo khảo sát...")}>
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard label="Tỷ lệ phản hồi" value={`${rate}%`} color="#990803" sub={`${survey.responseCount}/${survey.targetCount}`} />
        <KPICard label="Điểm TB tổng thể" value={overallAvg.toFixed(1)} color="#c8a84e" sub="/5.0 sao" icon={<Star className="w-4 h-4" style={{ color: "#c8a84e" }} />} />
        <KPICard label="NPS Score" value={nps.score > 0 ? `+${nps.score}` : String(nps.score)} color={nps.score >= 50 ? "#16a34a" : nps.score >= 0 ? "#f59e0b" : "#dc2626"} sub="Net Promoter Score" />
        <KPICard label="Câu hỏi" value={String(survey.questions.length)} color="#2563eb" sub={`${survey.questions.filter(q => q.required).length} bắt buộc`} />
        <KPICard label="Thời gian TB" value={`${survey.avgCompletionMinutes || 8}p`} color="#7c3aed" sub="hoàn thành" icon={<Clock className="w-4 h-4" style={{ color: "#7c3aed" }} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400 }}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab ratings={ratings} choices={choices} nps={nps} textData={textData} trend={trend} responseCount={survey.responseCount} />}
      {activeTab === "detail" && <DetailTab ratings={ratings} choices={choices} nps={nps} textData={textData} responseCount={survey.responseCount} />}
      {activeTab === "subsidiary" && <SubsidiaryTab data={subsidiaryData} />}
      {activeTab === "ai" && <AITab insights={aiInsights} />}
    </div>
  );
}

/* ─── KPI Card ─── */
function KPICard({ label, value, color, sub, icon }: { label: string; value: string; color: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon || <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
        <span className="text-gray-400" style={{ fontSize: "11px" }}>{label}</span>
      </div>
      <p style={{ fontSize: "24px", fontWeight: 700, color }}>{value}</p>
      <p className="text-gray-300 mt-0.5" style={{ fontSize: "10.5px" }}>{sub}</p>
    </div>
  );
}

/* ================================================================ */
/*  OVERVIEW TAB                                                     */
/* ================================================================ */
function OverviewTab({ ratings, choices, nps, textData, trend, responseCount }: {
  ratings: AggregatedRating[];
  choices: AggregatedChoice[];
  nps: AggregatedNPS;
  textData: AggregatedText;
  trend: ResponseTrendPoint[];
  responseCount: number;
}) {
  const trendMax = Math.max(...trend.map(t => t.count), 1);

  return (
    <div className="space-y-4">
      {/* Response Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          <TrendingUp className="w-4 h-4 text-[#990803]" /> Xu hướng phản hồi theo ngày
        </h3>
        <svg width="100%" height="120" viewBox="0 0 500 120" preserveAspectRatio="xMidYMid meet">
          {/* Area fill */}
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#990803" stopOpacity="0" />
            </linearGradient>
          </defs>
          {trend.length > 1 && (
            <path
              d={`M ${40 + 0 * ((460 - 40) / (trend.length - 1))} ${100 - (trend[0].count / trendMax) * 80} ${trend.map((t, i) => `L ${40 + i * ((460 - 40) / (trend.length - 1))} ${100 - (t.count / trendMax) * 80}`).join(" ")} L ${40 + (trend.length - 1) * ((460 - 40) / (trend.length - 1))} 100 L 40 100 Z`}
              fill="url(#trendGrad)"
            />
          )}
          {/* Line */}
          {trend.length > 1 && (
            <polyline
              fill="none" stroke="#990803" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              points={trend.map((t, i) => `${40 + i * ((460 - 40) / (trend.length - 1))},${100 - (t.count / trendMax) * 80}`).join(" ")}
            />
          )}
          {/* Dots & labels */}
          {trend.map((t, i) => {
            const x = 40 + i * ((460 - 40) / (trend.length - 1));
            const y = 100 - (t.count / trendMax) * 80;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="white" stroke="#990803" strokeWidth="2" />
                <text x={x} y={y - 8} textAnchor="middle" fill="#990803" style={{ fontSize: "9px", fontWeight: 600 }}>{t.count}</text>
                <text x={x} y="115" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{t.date}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Rating Summary + NPS side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rating bars */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Star className="w-4 h-4 text-[#c8a84e]" /> Đánh giá sao
          </h3>
          <div className="space-y-4">
            {ratings.map(r => <RatingChart key={r.questionId} data={r} />)}
          </div>
        </div>

        {/* NPS Gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 text-[#16a34a]" /> NPS Score
          </h3>
          <NPSChart data={nps} />
        </div>
      </div>

      {/* Word Cloud + Sentiment */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Sparkles className="w-4 h-4 text-purple-500" /> Phân tích văn bản
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sentiment summary */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-3" style={{ fontSize: "11px", fontWeight: 600 }}>Phân tích cảm xúc</p>
            {(() => {
              const positive = textData.responses.filter(r => r.sentiment === "positive").length;
              const neutral = textData.responses.filter(r => r.sentiment === "neutral").length;
              const negative = textData.responses.filter(r => r.sentiment === "negative").length;
              const total = textData.responses.length;
              return (
                <div className="space-y-2">
                  {[
                    { label: "Tích cực", count: positive, color: "#16a34a", emoji: "😊" },
                    { label: "Trung lập", count: neutral, color: "#f59e0b", emoji: "😐" },
                    { label: "Tiêu cực", count: negative, color: "#dc2626", emoji: "😟" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="flex items-center gap-1 text-gray-600" style={{ fontSize: "11px" }}>{s.emoji} {s.label}</span>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: s.color }}>{s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${total > 0 ? (s.count / total) * 100 : 0}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          {/* Word Cloud */}
          <div className="lg:col-span-2 p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-3" style={{ fontSize: "11px", fontWeight: 600 }}>Từ khóa nổi bật</p>
            <div className="flex flex-wrap gap-1.5">
              {textData.wordCloud.map(w => {
                const size = Math.max(10, Math.min(20, 9 + (w.count / textData.wordCloud[0].count) * 11));
                const opacity = 0.4 + (w.count / textData.wordCloud[0].count) * 0.6;
                return (
                  <span key={w.word} className="text-[#990803] px-1.5 py-0.5 rounded hover:bg-[#990803]/10 transition-colors cursor-default" style={{ fontSize: `${size}px`, fontWeight: w.count > 20 ? 600 : 400, opacity }} title={`${w.word}: ${w.count} lần`}>
                    {w.word}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  DETAIL TAB                                                       */
/* ================================================================ */
function DetailTab({ ratings, choices, nps, textData, responseCount }: {
  ratings: AggregatedRating[];
  choices: AggregatedChoice[];
  nps: AggregatedNPS;
  textData: AggregatedText;
  responseCount: number;
}) {
  return (
    <div className="space-y-4">
      {/* Ratings */}
      {ratings.map(r => (
        <div key={r.questionId} className="bg-white rounded-xl border border-gray-200 p-4">
          <RatingChart data={r} />
        </div>
      ))}

      {/* Choices */}
      {choices.map(c => (
        <div key={c.questionId} className="bg-white rounded-xl border border-gray-200 p-4">
          <ChoiceChart data={c} />
        </div>
      ))}

      {/* NPS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          <TrendingUp className="w-4 h-4 text-[#16a34a]" /> {nps.questionText}
        </h3>
        <NPSChart data={nps} />
      </div>

      {/* Text */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          <MessageSquare className="w-4 h-4 text-[#990803]" /> {textData.questionText}
        </h3>
        <TextResponses data={textData} />
      </div>
    </div>
  );
}

/* ================================================================ */
/*  SUBSIDIARY TAB                                                   */
/* ================================================================ */
function SubsidiaryTab({ data }: { data: SubsidiaryBreakdown[] }) {
  const maxResp = Math.max(...data.map(d => d.targetCount), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Building2 className="w-4 h-4 text-[#990803]" /> Phân tích theo đơn vị thành viên
        </h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {["Đơn vị", "Phản hồi", "Tỷ lệ", "Điểm TB", "NPS"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(d => {
                const rate = Math.round((d.responseCount / d.targetCount) * 100);
                return (
                  <tr key={d.subsidiary} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="text-gray-700" style={{ fontSize: "12.5px", fontWeight: 500 }}>{d.subsidiary}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-600" style={{ fontSize: "12px" }}>{d.responseCount}/{d.targetCount}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: rate >= 80 ? "#16a34a" : rate >= 50 ? "#f59e0b" : "#dc2626" }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: rate >= 80 ? "#16a34a" : rate >= 50 ? "#f59e0b" : "#dc2626" }}>{rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" style={{ color: "#c8a84e", fill: "#c8a84e" }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: d.avgRating >= 4 ? "#16a34a" : d.avgRating >= 3 ? "#f59e0b" : "#dc2626" }}>{d.avgRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span style={{ fontSize: "12px", fontWeight: 700, color: d.npsScore >= 50 ? "#16a34a" : d.npsScore >= 0 ? "#f59e0b" : "#dc2626" }}>
                        {d.npsScore > 0 ? "+" : ""}{d.npsScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh điểm đánh giá TB</h3>
        <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
          {data.map((d, i) => {
            const y = 10 + i * 24;
            const barW = (d.avgRating / 5) * 280;
            const color = d.avgRating >= 4.3 ? "#16a34a" : d.avgRating >= 4 ? "#c8a84e" : "#f59e0b";
            return (
              <g key={d.subsidiary}>
                <text x="140" y={y + 14} textAnchor="end" fill="#6b7280" style={{ fontSize: "10px" }}>{d.subsidiary.length > 18 ? d.subsidiary.slice(0, 18) + "…" : d.subsidiary}</text>
                <rect x="150" y={y + 2} width={barW} height="16" rx="3" fill={color} opacity="0.75" />
                <text x={155 + barW} y={y + 14} fill={color} style={{ fontSize: "10px", fontWeight: 700 }}>{d.avgRating.toFixed(1)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  AI TAB                                                           */
/* ================================================================ */
function AITab({ insights }: { insights: AIInsight[] }) {
  const [generating, setGenerating] = React.useState(false);

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); toast.success("Đã cập nhật phân tích AI mới nhất"); }, 2000);
  };

  const iconMap: Record<AIInsight["type"], React.ElementType> = { positive: CheckCircle2, warning: AlertTriangle, suggestion: Lightbulb, trend: TrendingUp };
  const colorMap: Record<AIInsight["type"], string> = { positive: "#16a34a", warning: "#f59e0b", suggestion: "#2563eb", trend: "#7c3aed" };
  const bgMap: Record<AIInsight["type"], string> = { positive: "#16a34a08", warning: "#f59e0b08", suggestion: "#2563eb08", trend: "#7c3aed08" };
  const labelMap: Record<AIInsight["type"], string> = { positive: "Điểm tích cực", warning: "Cảnh báo", suggestion: "Gợi ý", trend: "Xu hướng" };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>Phân tích thông minh (AI)</h3>
          </div>
          <button onClick={handleRegenerate} disabled={generating} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-1.5 disabled:opacity-50" style={{ fontSize: "12px", fontWeight: 500 }}>
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Đang phân tích..." : "Phân tích lại"}
          </button>
        </div>
        <p className="text-gray-500" style={{ fontSize: "12px" }}>AI phân tích {insights.length} insights từ dữ liệu khảo sát, giúp bạn đưa ra quyết định nhanh hơn.</p>
      </div>

      <div className="space-y-3">
        {insights.map(insight => {
          const Icon = iconMap[insight.type];
          const color = colorMap[insight.type];
          const bg = bgMap[insight.type];
          const label = labelMap[insight.type];
          return (
            <div key={insight.id} className="bg-white rounded-xl border border-gray-200 p-4" style={{ borderLeftWidth: "4px", borderLeftColor: color }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 700, color, backgroundColor: bg }}>{label}</span>
                    <span className="text-gray-300" style={{ fontSize: "10px" }}>Độ tin cậy: {insight.confidence}%</span>
                  </div>
                  <h4 className="text-gray-800 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>{insight.title}</h4>
                  <p className="text-gray-500" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>{insight.description}</p>
                  {insight.relatedQuestions && insight.relatedQuestions.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>Câu hỏi liên quan:</span>
                      {insight.relatedQuestions.map(q => (
                        <span key={q} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" style={{ fontSize: "10px", fontWeight: 600 }}>{q}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${insight.confidence * 1.005} 100.5`} transform="rotate(-90 20 20)" />
                    <text x="20" y="22" textAnchor="middle" fill={color} style={{ fontSize: "10px", fontWeight: 700 }}>{insight.confidence}%</text>
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Recommendation Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Sparkles className="w-4 h-4 text-[#c8a84e]" /> Đề xuất hành động
        </h3>
        <div className="space-y-2">
          {[
            { action: "Bổ sung case study thực tế Geleximco vào module tiếp theo", priority: "Cao", color: "#dc2626" },
            { action: "Gửi nhắc nhở cho Hải Phòng Thermal và Geleximco Mining", priority: "Cao", color: "#dc2626" },
            { action: "Lên kế hoạch buổi follow-up 1 tháng sau khóa học", priority: "TB", color: "#f59e0b" },
            { action: "Cập nhật tài liệu tham khảo với sách mới hơn", priority: "TB", color: "#f59e0b" },
            { action: "Đánh giá lại thời lượng khóa học (nhiều phản hồi muốn dài hơn)", priority: "Thấp", color: "#6b7280" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <span className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>
              <span className="flex-1 text-gray-700" style={{ fontSize: "12.5px" }}>{a.action}</span>
              <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "9px", fontWeight: 700, color: a.color, backgroundColor: a.color + "12" }}>{a.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  CHART SUB-COMPONENTS                                             */
/* ================================================================ */

function RatingChart({ data }: { data: AggregatedRating }) {
  const total = data.distribution.reduce((s, v) => s + v, 0);
  const starColor = data.average >= 4 ? "#16a34a" : data.average >= 3 ? "#f59e0b" : "#dc2626";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600" style={{ fontSize: "13px", fontWeight: 500 }}>{data.questionText}</span>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: "18px", fontWeight: 700, color: starColor }}>{data.average.toFixed(1)}</span>
          <span className="text-gray-300" style={{ fontSize: "11px" }}>/5</span>
        </div>
      </div>
      <div className="flex gap-0.5 h-5 rounded-full overflow-hidden mb-1">
        {data.distribution.map((count, i) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          const colors = ["#dc2626", "#f97316", "#eab308", "#84cc16", "#16a34a"];
          return pct > 0 ? (
            <div key={i} className="transition-all hover:opacity-80" style={{ width: `${pct}%`, backgroundColor: colors[i], minWidth: pct > 0 ? "4px" : 0 }} title={`${i + 1} sao: ${count} (${pct.toFixed(0)}%)`} />
          ) : null;
        })}
      </div>
      <div className="flex justify-between">
        {data.distribution.map((count, i) => (
          <span key={i} className="text-gray-300" style={{ fontSize: "9px" }}>{i + 1}⭐ {count}</span>
        ))}
      </div>
    </div>
  );
}

function ChoiceChart({ data }: { data: AggregatedChoice }) {
  const maxCount = Math.max(...data.options.map(o => o.count));

  return (
    <div>
      <p className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 500 }}>{data.questionText}</p>
      <div className="space-y-2">
        {data.options.map(opt => (
          <div key={opt.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-gray-500" style={{ fontSize: "11.5px" }}>{opt.label}</span>
              <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 600 }}>{opt.count} ({opt.percentage}%)</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${(opt.count / maxCount) * 100}%`, background: "linear-gradient(90deg, #990803, #c8a84e)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NPSChart({ data }: { data: AggregatedNPS }) {
  const total = data.promoters + data.passives + data.detractors;
  const maxDist = Math.max(...data.distribution);
  const score = data.score;
  const normalized = (score + 100) / 200;
  const W = 280, H = 80, cx = W / 2, cy = H - 5, r = 60;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col items-center">
        <svg width="100%" height={H + 15} viewBox={`0 0 ${W} ${H + 15}`} preserveAspectRatio="xMidYMid meet">
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#f0f0f0" strokeWidth="10" strokeLinecap="round" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx - r * Math.cos(Math.PI * 0.35)} ${cy - r * Math.sin(Math.PI * 0.35)}`} fill="none" stroke="#dc2626" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          <path d={`M ${cx - r * Math.cos(Math.PI * 0.35)} ${cy - r * Math.sin(Math.PI * 0.35)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI * 0.35)} ${cy - r * Math.sin(Math.PI * 0.35)}`} fill="none" stroke="#f59e0b" strokeWidth="10" opacity="0.3" />
          <path d={`M ${cx + r * Math.cos(Math.PI * 0.35)} ${cy - r * Math.sin(Math.PI * 0.35)} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#16a34a" strokeWidth="10" strokeLinecap="round" opacity="0.3" />
          {(() => {
            const angle = Math.PI - normalized * Math.PI;
            const nx = cx + (r - 8) * Math.cos(angle);
            const ny = cy - (r - 8) * Math.sin(angle);
            return <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1a1d2e" strokeWidth="2.5" strokeLinecap="round" />;
          })()}
          <circle cx={cx} cy={cy} r="4" fill="#1a1d2e" />
          <text x={cx} y={cy - 18} textAnchor="middle" fill={score >= 50 ? "#16a34a" : score >= 0 ? "#f59e0b" : "#dc2626"} style={{ fontSize: "24px", fontWeight: 700 }}>{score > 0 ? `+${score}` : score}</text>
          <text x={cx - r + 5} y={cy + 12} textAnchor="start" fill="#64748b" style={{ fontSize: "8px" }}>-100</text>
          <text x={cx + r - 5} y={cy + 12} textAnchor="end" fill="#64748b" style={{ fontSize: "8px" }}>+100</text>
        </svg>
        <div className="flex items-center gap-4 mt-2">
          {[
            { label: "Phản đối", count: data.detractors, pct: Math.round((data.detractors / total) * 100), color: "#dc2626" },
            { label: "Trung lập", count: data.passives, pct: Math.round((data.passives / total) * 100), color: "#f59e0b" },
            { label: "Ủng hộ", count: data.promoters, pct: Math.round((data.promoters / total) * 100), color: "#16a34a" },
          ].map(g => (
            <div key={g.label} className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{g.label}</span>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: g.color }}>{g.pct}%</p>
              <p className="text-gray-300" style={{ fontSize: "9px" }}>{g.count} người</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-gray-500 mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>Phân bổ điểm NPS</p>
        <svg width="100%" height="120" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
          {data.distribution.map((count, i) => {
            const barW = 20;
            const gap = 5.5;
            const x = i * (barW + gap) + 5;
            const barH = maxDist > 0 ? (count / maxDist) * 80 : 0;
            const color = i <= 6 ? "#dc2626" : i <= 8 ? "#f59e0b" : "#16a34a";
            return (
              <g key={i}>
                <rect x={x} y={90 - barH} width={barW} height={barH} rx="3" fill={color} opacity="0.7" />
                <text x={x + barW / 2} y={105} textAnchor="middle" fill="#64748b" style={{ fontSize: "9px" }}>{i}</text>
                <text x={x + barW / 2} y={87 - barH} textAnchor="middle" fill="#6b7194" style={{ fontSize: "8px" }}>{count}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function TextResponses({ data }: { data: AggregatedText }) {
  const [showAll, setShowAll] = React.useState(false);
  const visible = showAll ? data.responses : data.responses.slice(0, 5);

  const sentimentConfig = {
    positive: { color: "#16a34a", bg: "#16a34a12", label: "Tích cực", emoji: "😊" },
    neutral: { color: "#f59e0b", bg: "#f59e0b12", label: "Trung lập", emoji: "😐" },
    negative: { color: "#dc2626", bg: "#dc262612", label: "Tiêu cực", emoji: "😟" },
  };

  return (
    <div className="space-y-2">
      {visible.map((resp, i) => {
        const sc = resp.sentiment ? sentimentConfig[resp.sentiment] : sentimentConfig.neutral;
        return (
          <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "9px", fontWeight: 700 }}>
              {resp.respondent.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>"{resp.text}"</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-300" style={{ fontSize: "10px" }}>{resp.respondent} • {resp.date}</p>
                {resp.sentiment && (
                  <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, color: sc.color, backgroundColor: sc.bg }}>{sc.emoji} {sc.label}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {data.responses.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
          {showAll ? "Thu gọn" : `Xem thêm ${data.responses.length - 5} phản hồi`}
        </button>
      )}
    </div>
  );
}