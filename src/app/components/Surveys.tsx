import React from "react";
import {
  ClipboardList, BarChart3, Plus, Send, TrendingUp, Users, Calendar,
  Clock, Target, Award, CheckCircle2, AlertTriangle, Lightbulb,
  Star, FileText, Bell, ChevronRight, Zap, Brain,
  Flame, Gift, History,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { SurveyList } from "./surveys/SurveyList";
import { SurveyBuilder } from "./surveys/SurveyBuilder";
import { SurveyResults } from "./surveys/SurveyResults";
import { SurveyTake } from "./surveys/SurveyTake";
import {
  MOCK_SURVEYS, CATEGORY_CONFIG, STATUS_CONFIG,
  getPendingSurveys, getSurveyCompletionRate, getDaysRemaining,
  SV001_NPS, SV001_AI_INSIGHTS, LEARNER_SURVEY_HISTORY,
  type Survey, type SurveyCategory,
} from "./surveys/mock-data";
import { toast } from "@/app/lib/toast";

type View = "list" | "builder" | "results" | "take";

export function Surveys() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const isLearner = role === "learner";

  const [view, setView] = React.useState<View>("list");
  const [selectedSurveyId, setSelectedSurveyId] = React.useState<string | null>(null);

  const handleSelectSurvey = (id: string) => {
    setSelectedSurveyId(id);
    if (isLearner) {
      const survey = MOCK_SURVEYS.find(s => s.id === id);
      if (survey?.status === "active") setView("take");
      else setView("results");
    } else {
      setView("results");
    }
  };

  const handleBack = () => { setView("list"); setSelectedSurveyId(null); };

  const pendingSurveys = getPendingSurveys();

  return (
    <div className="space-y-4">
      {view === "list" && (
        <>
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-6 h-6 text-[#990803]" />
                <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
                  {isLearner ? "Khảo sát Đào tạo" : "Quản lý Khảo sát"}
                </h1>
              </div>
              <p className="text-gray-500" style={{ fontSize: "13px" }}>
                {isLearner
                  ? `Tham gia khảo sát để góp ý cải thiện chất lượng đào tạo`
                  : isInstructor
                  ? "Khảo sát đánh giá từ học viên và quản lý khảo sát khóa học của bạn"
                  : "Tạo, quản lý và phân tích khảo sát đánh giá đào tạo toàn tập đoàn"}
              </p>
            </div>
            {(isAdmin || isInstructor) && (
              <button onClick={() => setView("builder")} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Plus className="w-4 h-4" /> Tạo khảo sát
              </button>
            )}
          </div>

          {/* Role-based Dashboard */}
          {isAdmin && <AdminDashboard onSelectSurvey={handleSelectSurvey} />}
          {isInstructor && <InstructorDashboard onSelectSurvey={handleSelectSurvey} />}
          {isLearner && <LearnerDashboard onSelectSurvey={handleSelectSurvey} pendingSurveys={pendingSurveys} />}

          {/* Survey List */}
          <SurveyList
            onSelectSurvey={handleSelectSurvey}
            onCreateNew={() => setView("builder")}
            isAdmin={isAdmin || isInstructor}
          />
        </>
      )}

      {view === "builder" && <SurveyBuilder onBack={handleBack} />}
      {view === "results" && selectedSurveyId && <SurveyResults surveyId={selectedSurveyId} onBack={handleBack} />}
      {view === "take" && selectedSurveyId && <SurveyTake surveyId={selectedSurveyId} onBack={handleBack} />}
    </div>
  );
}

/* ================================================================ */
/*  ADMIN DASHBOARD                                                  */
/* ================================================================ */

function AdminDashboard({ onSelectSurvey }: { onSelectSurvey: (id: string) => void }) {
  const activeSurveys = MOCK_SURVEYS.filter(s => s.status === "active");
  const totalResponses = MOCK_SURVEYS.reduce((s, sv) => s + sv.responseCount, 0);
  const avgRate = Math.round(MOCK_SURVEYS.filter(s => s.targetCount > 0).reduce((s, sv) => s + getSurveyCompletionRate(sv), 0) / Math.max(MOCK_SURVEYS.filter(s => s.targetCount > 0).length, 1));

  // Category distribution for donut
  const catCounts = MOCK_SURVEYS.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  // Response trend (last 7 days)
  const trendData = [320, 280, 410, 195, 380, 290, 145];
  const trendMax = Math.max(...trendData, 1);
  const trendDays = ["07/03", "08/03", "09/03", "10/03", "11/03", "12/03", "13/03"];

  // Urgency alerts
  const urgentSurveys = activeSurveys.filter(s => {
    const days = getDaysRemaining(s.endDate);
    return days >= 0 && days <= 3;
  });

  const lowResponseSurveys = activeSurveys.filter(s => getSurveyCompletionRate(s) < 40);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng khảo sát", value: MOCK_SURVEYS.length, icon: ClipboardList, color: "#990803", sub: `${activeSurveys.length} đang mở` },
          { label: "Tổng phản hồi", value: totalResponses.toLocaleString(), icon: Users, color: "#2563eb", sub: "Tất cả khảo sát" },
          { label: "Tỷ lệ phản hồi TB", value: `${avgRate}%`, icon: Target, color: "#16a34a", sub: "Trung bình" },
          { label: "NPS Trung bình", value: `+${SV001_NPS.score}`, icon: TrendingUp, color: "#c8a84e", sub: "Net Promoter Score" },
          { label: "AI Insights", value: SV001_AI_INSIGHTS.length, icon: Brain, color: "#7c3aed", sub: "Gợi ý thông minh" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
              <span className="text-gray-300" style={{ fontSize: "10px" }}>{s.sub}</span>
            </div>
            <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Response Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <BarChart3 className="w-4 h-4 text-[#990803]" /> Xu hướng phản hồi 7 ngày
            </h3>
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Tổng: {trendData.reduce((a, b) => a + b, 0)} phản hồi</span>
          </div>
          <svg width="100%" height="140" viewBox="0 0 500 140" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <g key={i}>
                <line x1="40" y1={120 - pct * 100} x2="480" y2={120 - pct * 100} stroke="#f0f0f0" strokeWidth="1" />
                <text x="35" y={124 - pct * 100} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>{Math.round(trendMax * pct)}</text>
              </g>
            ))}
            {/* Bars */}
            {trendData.map((val, i) => {
              const x = 60 + i * 62;
              const h = (val / trendMax) * 100;
              return (
                <g key={i}>
                  <rect x={x} y={120 - h} width="36" height={h} rx="4" fill="#990803" opacity={0.75 + (i === trendData.length - 1 ? 0.25 : 0)} />
                  <text x={x + 18} y={115 - h} textAnchor="middle" fill="#990803" style={{ fontSize: "10px", fontWeight: 600 }}>{val}</text>
                  <text x={x + 18} y={135} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>{trendDays[i]}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* AI Insights Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Brain className="w-4 h-4 text-purple-500" /> AI Insights
          </h3>
          <div className="space-y-2">
            {SV001_AI_INSIGHTS.slice(0, 4).map(insight => {
              const iconMap = { positive: CheckCircle2, warning: AlertTriangle, suggestion: Lightbulb, trend: TrendingUp };
              const colorMap = { positive: "#16a34a", warning: "#f59e0b", suggestion: "#2563eb", trend: "#7c3aed" };
              const Icon = iconMap[insight.type];
              const color = colorMap[insight.type];
              return (
                <div key={insight.id} className="p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                  <div className="flex items-start gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
                    <div className="min-w-0">
                      <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{insight.title}</p>
                      <p className="text-gray-400 line-clamp-2" style={{ fontSize: "10.5px", lineHeight: 1.4 }}>{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 ml-5">
                    <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${insight.confidence}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-gray-300" style={{ fontSize: "9px" }}>{insight.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {(urgentSurveys.length > 0 || lowResponseSurveys.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {urgentSurveys.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-700" style={{ fontSize: "13px", fontWeight: 600 }}>Sắp hết hạn ({urgentSurveys.length})</span>
              </div>
              <div className="space-y-1.5">
                {urgentSurveys.map(s => (
                  <button key={s.id} onClick={() => onSelectSurvey(s.id)} className="w-full flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                    <span className="text-gray-700 truncate" style={{ fontSize: "12px" }}>{s.title}</span>
                    <span className="text-red-500 shrink-0 ml-2" style={{ fontSize: "10px", fontWeight: 600 }}>{getDaysRemaining(s.endDate)} ngày</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {lowResponseSurveys.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700" style={{ fontSize: "13px", fontWeight: 600 }}>Tỷ lệ phản hồi thấp ({lowResponseSurveys.length})</span>
              </div>
              <div className="space-y-1.5">
                {lowResponseSurveys.map(s => (
                  <button key={s.id} onClick={() => onSelectSurvey(s.id)} className="w-full flex items-center justify-between p-2 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                    <span className="text-gray-700 truncate" style={{ fontSize: "12px" }}>{s.title}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-amber-600" style={{ fontSize: "10px", fontWeight: 600 }}>{getSurveyCompletionRate(s)}%</span>
                      <button onClick={e => { e.stopPropagation(); toast.success(`Đã gửi nhắc nhở cho ${s.targetCount - s.responseCount} người`); }} className="px-2 py-0.5 bg-amber-500 text-white rounded cursor-pointer" style={{ fontSize: "9px", fontWeight: 600 }}>
                        Nhắc nhở
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ theo danh mục</h3>
        <div className="flex items-center gap-6">
          {/* Donut chart */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            {(() => {
              const total = Object.values(catCounts).reduce((a, b) => a + b, 0);
              let cum = 0;
              const entries = Object.entries(catCounts);
              return entries.map(([cat, count], i) => {
                const pct = count / total;
                const startAngle = cum * 2 * Math.PI - Math.PI / 2;
                cum += pct;
                const endAngle = cum * 2 * Math.PI - Math.PI / 2;
                const largeArc = pct > 0.5 ? 1 : 0;
                const x1 = 60 + 45 * Math.cos(startAngle);
                const y1 = 60 + 45 * Math.sin(startAngle);
                const x2 = 60 + 45 * Math.cos(endAngle);
                const y2 = 60 + 45 * Math.sin(endAngle);
                const color = CATEGORY_CONFIG[cat as SurveyCategory]?.color || "#64748b";
                return <path key={cat} d={`M 60 60 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={color} opacity={0.75} />;
              });
            })()}
            <circle cx="60" cy="60" r="28" fill="white" />
            <text x="60" y="58" textAnchor="middle" fill="#374151" style={{ fontSize: "16px", fontWeight: 700 }}>{MOCK_SURVEYS.length}</text>
            <text x="60" y="70" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>Khảo sát</text>
          </svg>
          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(catCounts).map(([cat, count]) => {
              const cfg = CATEGORY_CONFIG[cat as SurveyCategory];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cfg?.color || "#64748b" }} />
                  <div>
                    <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>{cfg?.label}</span>
                    <span className="text-gray-400 ml-1" style={{ fontSize: "11px" }}>({count})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  INSTRUCTOR DASHBOARD                                             */
/* ================================================================ */

function InstructorDashboard({ onSelectSurvey }: { onSelectSurvey: (id: string) => void }) {
  // Mock instructor's surveys
  const mySurveys = MOCK_SURVEYS.filter(s => s.category === "instructor_eval" || s.courseId);
  const evalSurveys = MOCK_SURVEYS.filter(s => s.category === "instructor_eval");
  const avgRating = 4.35;
  const totalFeedback = evalSurveys.reduce((s, sv) => s + sv.responseCount, 0);

  // Performance trend
  const perfData = [4.1, 4.2, 4.15, 4.3, 4.35];
  const perfLabels = ["Q1/25", "Q2/25", "Q3/25", "Q4/25", "Q1/26"];
  const perfMin = 3.8;
  const perfMax = 4.6;

  return (
    <div className="space-y-4">
      {/* Instructor KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Điểm đánh giá TB", value: avgRating.toFixed(1), icon: Star, color: "#c8a84e", sub: "/5.0 sao" },
          { label: "Tổng phản hồi", value: totalFeedback, icon: Users, color: "#2563eb", sub: `${evalSurveys.length} khảo sát` },
          { label: "Khảo sát liên quan", value: mySurveys.length, icon: ClipboardList, color: "#990803", sub: "Khóa học của bạn" },
          { label: "NPS Giảng viên", value: "+58", icon: TrendingUp, color: "#16a34a", sub: "Xuất sắc" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{s.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-2 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 text-[#16a34a]" /> Xu hướng đánh giá
          </h3>
          <svg width="100%" height="130" viewBox="0 0 320 130" preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            {[3.8, 4.0, 4.2, 4.4, 4.6].map((v, i) => (
              <g key={i}>
                <line x1="40" y1={110 - ((v - perfMin) / (perfMax - perfMin)) * 90} x2="300" y2={110 - ((v - perfMin) / (perfMax - perfMin)) * 90} stroke="#f0f0f0" strokeWidth="1" />
                <text x="35" y={114 - ((v - perfMin) / (perfMax - perfMin)) * 90} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>{v.toFixed(1)}</text>
              </g>
            ))}
            {/* Line & dots */}
            <polyline
              fill="none" stroke="#c8a84e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              points={perfData.map((v, i) => `${60 + i * 58},${110 - ((v - perfMin) / (perfMax - perfMin)) * 90}`).join(" ")}
            />
            {perfData.map((v, i) => {
              const x = 60 + i * 58;
              const y = 110 - ((v - perfMin) / (perfMax - perfMin)) * 90;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="white" stroke="#c8a84e" strokeWidth="2.5" />
                  <text x={x} y={y - 10} textAnchor="middle" fill="#c8a84e" style={{ fontSize: "10px", fontWeight: 700 }}>{v.toFixed(1)}</text>
                  <text x={x} y="125" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>{perfLabels[i]}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* My Course Surveys */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <FileText className="w-4 h-4 text-[#990803]" /> Khảo sát khóa học của tôi
          </h3>
          <div className="space-y-2">
            {mySurveys.slice(0, 4).map(s => {
              const stCfg = STATUS_CONFIG[s.status];
              const rate = getSurveyCompletionRate(s);
              return (
                <button key={s.id} onClick={() => onSelectSurvey(s.id)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-all text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[s.category].bg }}>
                    <ClipboardList className="w-5 h-5" style={{ color: CATEGORY_CONFIG[s.category].color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{s.responseCount}/{s.targetCount}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                      <circle cx="16" cy="16" r="13" fill="none" stroke={rate >= 70 ? "#16a34a" : rate >= 40 ? "#f59e0b" : "#e5e7eb"} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${rate * 0.817} 81.7`} transform="rotate(-90 16 16)" />
                      <text x="16" y="18" textAnchor="middle" fill="#374151" style={{ fontSize: "8px", fontWeight: 700 }}>{rate}%</text>
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Strengths/Weaknesses */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-2 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Zap className="w-4 h-4 text-amber-500" /> Phân tích điểm mạnh & cần cải thiện
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-700 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>💪 Điểm mạnh</p>
            {[
              { item: "Kiến thức chuyên môn", score: 4.6 },
              { item: "Tương tác với học viên", score: 4.5 },
              { item: "Sử dụng ví dụ thực tế", score: 4.4 },
            ].map(s => (
              <div key={s.item} className="flex items-center justify-between py-1">
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{s.item}</span>
                <span className="text-green-600" style={{ fontSize: "12px", fontWeight: 700 }}>{s.score}/5</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-amber-700 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>📈 Cần cải thiện</p>
            {[
              { item: "Quản lý thời gian", score: 3.8 },
              { item: "Tài liệu cập nhật", score: 3.9 },
              { item: "Hỗ trợ sau khóa học", score: 3.7 },
            ].map(s => (
              <div key={s.item} className="flex items-center justify-between py-1">
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{s.item}</span>
                <span className="text-amber-600" style={{ fontSize: "12px", fontWeight: 700 }}>{s.score}/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  LEARNER DASHBOARD                                                */
/* ================================================================ */

function LearnerDashboard({ onSelectSurvey, pendingSurveys }: { onSelectSurvey: (id: string) => void; pendingSurveys: Survey[] }) {
  const history = LEARNER_SURVEY_HISTORY;
  const totalPoints = history.reduce((s, h) => s + h.pointsEarned, 0);
  const streak = 3; // mock

  return (
    <div className="space-y-4">
      {/* Gamification banner */}
      <div className="bg-gradient-to-r from-[#990803] to-[#7a0602] rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.7, fontWeight: 600 }}>Điểm tích lũy khảo sát</p>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>{totalPoints} <span style={{ fontSize: "14px", fontWeight: 400, opacity: 0.7 }}>điểm</span></p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <Flame className="w-4 h-4 text-orange-300" />
                <p style={{ fontSize: "18px", fontWeight: 700 }}>{streak}</p>
              </div>
              <p style={{ fontSize: "10px", opacity: 0.6 }}>Chuỗi ngày</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                <p style={{ fontSize: "18px", fontWeight: 700 }}>{history.length}</p>
              </div>
              <p style={{ fontSize: "10px", opacity: 0.6 }}>Đã hoàn thành</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="w-4 h-4 text-blue-300" />
                <p style={{ fontSize: "18px", fontWeight: 700 }}>{pendingSurveys.length}</p>
              </div>
              <p style={{ fontSize: "10px", opacity: 0.6 }}>Đang chờ</p>
            </div>
          </div>
        </div>
        {/* Point progress to next reward */}
        <div className="mt-4 bg-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "11px", opacity: 0.8 }}>Tiến trình: Huy hiệu "Người đóng góp tích cực"</span>
            <span style={{ fontSize: "11px", fontWeight: 600 }}>{totalPoints}/50 điểm</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#c8a84e] rounded-full transition-all" style={{ width: `${Math.min(100, (totalPoints / 50) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Pending Surveys */}
      {pendingSurveys.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Send className="w-4 h-4 text-[#990803]" />
            <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Khảo sát đang chờ ({pendingSurveys.length})</span>
          </div>
          <div className="space-y-2">
            {pendingSurveys.map(s => {
              const catCfg = CATEGORY_CONFIG[s.category];
              const daysLeft = getDaysRemaining(s.endDate);
              const isUrgent = daysLeft >= 0 && daysLeft <= 3;
              return (
                <button key={s.id} onClick={() => onSelectSurvey(s.id)} className="w-full flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#990803]/30 hover:shadow-sm transition-all cursor-pointer text-left group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: catCfg.bg }}>
                    <ClipboardList className="w-5 h-5" style={{ color: catCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 group-hover:text-[#990803] transition-colors" style={{ fontSize: "13px", fontWeight: 600 }}>{s.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>{s.questions.length} câu hỏi</span>
                      {s.avgCompletionMinutes && <span className="text-gray-400" style={{ fontSize: "11px" }}>~{s.avgCompletionMinutes} phút</span>}
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>+{s.questions.length >= 5 ? 20 : 10} điểm</span>
                      {isUrgent && <span className="text-red-500 flex items-center gap-0.5" style={{ fontSize: "10px", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> {daysLeft} ngày nữa</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1.5 bg-[#990803] text-white rounded-lg group-hover:bg-[#7a0602] transition-colors" style={{ fontSize: "12px", fontWeight: 600 }}>Tham gia</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#990803]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Lịch sử tham gia</span>
          </div>
          <div className="space-y-2">
            {history.map(h => {
              const catCfg = CATEGORY_CONFIG[h.category];
              return (
                <div key={h.surveyId} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-600 truncate" style={{ fontSize: "12px" }}>{h.surveyTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 500, color: catCfg.color, backgroundColor: catCfg.bg }}>{catCfg.label}</span>
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{h.completedAt}</span>
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{h.timeSpentMinutes}p</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#c8a84e]/10 rounded-full shrink-0">
                    <Gift className="w-3 h-3 text-[#c8a84e]" />
                    <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 700 }}>+{h.pointsEarned}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}