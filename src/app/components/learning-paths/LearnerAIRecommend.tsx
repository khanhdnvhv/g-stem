import { useState } from "react";
import {
  Sparkles, Brain, Target, BookOpen, Clock, Users, Star, AlertCircle,
  ArrowRight, ChevronDown, ChevronUp, Route, PlayCircle,
  TrendingUp, Zap, Lightbulb, Award, CheckCircle2, RefreshCw,
} from "lucide-react";
import { aiRecommendations, mockPathsFull, mockEnrollments } from "./mock-data";
import { mockCourses } from "../mock-data";
import { useAuth } from "../AuthContext";

// Match score gauge
function MatchGauge({ score }: { score: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 80 ? "#27ae60" : score >= 60 ? "#f59e0b" : "#e74c3c";

  return (
    <svg viewBox="0 0 80 80" style={{ width: 80, height: 80 }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${pct * circ} ${circ}`} transform="rotate(-90 40 40)" />
      <text x="40" y="38" textAnchor="middle" fill="currentColor" style={{ fontSize: "14px", fontWeight: 700 }}>{score}%</text>
      <text x="40" y="50" textAnchor="middle" fill="#6b7194" style={{ fontSize: "7px" }}>phù hợp</text>
    </svg>
  );
}

export function LearnerAIRecommend() {
  const { user } = useAuth();
  const [expandedRec, setExpandedRec] = useState<string | null>(aiRecommendations[0]?.pathId || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const myEnrollments = mockEnrollments.filter(e => e.userId === "U003");
  const [extraEnrolled, setExtraEnrolled] = useState<Set<string>>(new Set());
  const myPathIds = new Set([...myEnrollments.map(e => e.pathId), ...extraEnrolled]);
  const handleEnrollPath = (pathId: string) => {
    setExtraEnrolled(prev => new Set(prev).add(pathId));
    import("sonner").then(m => m.toast.success("Đã đăng ký lộ trình thành công!"));
  };

  const handleRefresh = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-xl p-6 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <circle key={i} cx={Math.random() * 400} cy={Math.random() * 200}
                r={Math.random() * 30 + 5} fill="white" opacity={0.1 + Math.random() * 0.2} />
            ))}
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>AI Đề xuất Lộ trình</h2>
              <p className="text-white/70" style={{ fontSize: "13px" }}>Phân tích cá nhân hóa cho {user?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/60" style={{ fontSize: "10px" }}>Vị trí hiện tại</p>
              <p className="text-white" style={{ fontSize: "12px", fontWeight: 500 }}>{user?.position}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/60" style={{ fontSize: "10px" }}>Đơn vị</p>
              <p className="text-white" style={{ fontSize: "12px", fontWeight: 500 }}>{user?.subsidiary?.split("(")[0].trim()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/60" style={{ fontSize: "10px" }}>Đã hoàn thành</p>
              <p className="text-white" style={{ fontSize: "12px", fontWeight: 500 }}>{myEnrollments.filter(e => e.status === "completed").length} lộ trình</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/60" style={{ fontSize: "10px" }}>Tổng giờ học</p>
              <p className="text-white" style={{ fontSize: "12px", fontWeight: 500 }}>{myEnrollments.reduce((s, e) => s + e.totalHoursSpent, 0)}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c8a84e]" />
          <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            {aiRecommendations.length} lộ trình được đề xuất
          </span>
        </div>
        <button onClick={handleRefresh}
          className={`flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer ${isAnalyzing ? "opacity-50" : ""}`}
          style={{ fontSize: "12px" }}>
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
          {isAnalyzing ? "Đang phân tích..." : "Phân tích lại"}
        </button>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {aiRecommendations.map((rec, rank) => {
          const path = mockPathsFull.find(p => p.id === rec.pathId);
          if (!path) return null;
          const isExpanded = expandedRec === rec.pathId;
          const isEnrolled = myPathIds.has(rec.pathId);
          const pathCourses = path.courseIds.map(id => mockCourses.find(c => c.id === id)).filter(Boolean);

          return (
            <div key={rec.pathId}
              className={`bg-card rounded-xl border overflow-hidden transition-all ${
                rank === 0 ? "border-[#c8a84e] shadow-lg" : "border-border hover:shadow-md"
              }`}>
              {/* Top recommendation badge */}
              {rank === 0 && (
                <div className="bg-gradient-to-r from-[#c8a84e] to-[#d4b85e] px-4 py-1.5 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#990803]" />
                  <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>ĐỀ XUẤT HÀNG ĐẦU</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    rank === 0 ? "bg-gradient-to-br from-[#c8a84e] to-[#d4b85e] text-[#990803]" : "bg-[#990803]/10 text-[#990803]"
                  }`} style={{ fontSize: "16px", fontWeight: 700 }}>
                    #{rank + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isEnrolled && (
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700" style={{ fontSize: "10px", fontWeight: 500 }}>Đã đăng ký</span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "10px" }}>{path.level}</span>
                    </div>
                    <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{path.title}</h3>

                    {/* AI Reason */}
                    <div className="mt-2 p-3 bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-lg border border-[#c8a84e]/10">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-[#c8a84e] shrink-0 mt-0.5" />
                        <p className="text-foreground" style={{ fontSize: "12px" }}>{rec.reason}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-[#990803]/10 text-[#990803] rounded-lg" style={{ fontSize: "11px", fontWeight: 500 }}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 mt-3">
                      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                        <BookOpen className="w-3.5 h-3.5" /> {path.totalCourses} khóa
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                        <Clock className="w-3.5 h-3.5" /> {path.totalDuration}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                        <Users className="w-3.5 h-3.5" /> {path.enrolledCount} người
                      </span>
                      {path.avgRating > 0 && (
                        <span className="flex items-center gap-1 text-[#c8a84e]" style={{ fontSize: "12px" }}>
                          <Star className="w-3.5 h-3.5 fill-[#c8a84e]" /> {path.avgRating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="shrink-0">
                    <MatchGauge score={rec.matchScore} />
                  </div>
                </div>

                {/* Expandable section */}
                <button onClick={() => setExpandedRec(isExpanded ? null : rec.pathId)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground mt-3 cursor-pointer"
                  style={{ fontSize: "12px" }}>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isExpanded ? "Thu gọn" : "Xem chi tiết lộ trình"}
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border space-y-3">
                    <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{path.description}</p>

                    {/* Milestones */}
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px" }}>CẤU TRÚC LỘ TRÌNH</p>
                      <div className="space-y-0">
                        {path.milestones.map((m, idx) => {
                          const mCourses = m.courseIds.map(id => mockCourses.find(c => c.id === id)).filter(Boolean);
                          return (
                            <div key={m.id} className="relative">
                              {idx < path.milestones.length - 1 && (
                                <div className="absolute left-[11px] top-[28px] bottom-0 w-0.5 bg-[#990803]/20" />
                              )}
                              <div className="flex items-start gap-2.5 pb-3">
                                <div className="w-6 h-6 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0 z-10"
                                  style={{ fontSize: "10px", fontWeight: 700 }}>{idx + 1}</div>
                                <div>
                                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{m.title}</p>
                                  {mCourses.map(c => c && (
                                    <div key={c.id} className="flex items-center gap-2 mt-1">
                                      <img src={c.thumbnail} alt="" className="w-6 h-6 rounded object-cover" />
                                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{c.title} ({c.duration})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prereqs */}
                    {path.prerequisites.length > 0 && (
                      <div className="p-2.5 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="text-yellow-800" style={{ fontSize: "11px", fontWeight: 500 }}>
                            Yêu cầu hoàn thành: {path.prerequisites.map(pid => mockPathsFull.find(p => p.id === pid)?.title).filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex gap-2">
                      <button onClick={() => { if (!isEnrolled) handleEnrollPath(rec.pathId); }} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${isEnrolled ? "bg-green-600 text-white" : "bg-[#990803] text-white hover:bg-[#990803]/90"}`}
                        style={{ fontSize: "13px", fontWeight: 500 }}>
                        {isEnrolled ? (
                          <><PlayCircle className="w-4 h-4" /> Tiếp tục học</>
                        ) : (
                          <><Route className="w-4 h-4" /> Đăng ký ngay</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Career Development Insight */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#990803]" />
          <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Lộ trình Phát triển Nghề nghiệp</h3>
        </div>
        <div className="flex items-center justify-between">
          {[
            { label: user?.position || "Vị trí hiện tại", done: true },
            { label: "Chuyên viên Cao cấp", done: false, active: true },
            { label: "Trưởng nhóm", done: false },
            { label: "Phó phòng", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.done ? "bg-green-500 text-white" :
                  step.active ? "bg-[#990803] text-white ring-4 ring-[#990803]/20" :
                  "bg-secondary text-muted-foreground"
                }`}>
                  {step.done ? <CheckCircle2 className="w-5 h-5" /> :
                    <span style={{ fontSize: "12px", fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <p className={`mt-1.5 text-center ${step.active ? "text-[#990803]" : "text-muted-foreground"}`}
                  style={{ fontSize: "11px", fontWeight: step.active ? 600 : 400 }}>
                  {step.label}
                </p>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-1.5 ${step.done ? "bg-green-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[#990803]/5 rounded-lg border border-[#990803]/10">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#c8a84e] shrink-0 mt-0.5" />
            <p className="text-foreground" style={{ fontSize: "12px" }}>
              <span style={{ fontWeight: 600 }}>AI Insight:</span> Hoàn thành "Lộ trình Quản lý Cấp trung" sẽ giúp bạn đáp ứng 87% yêu cầu
              cho vị trí Chuyên viên Cao cấp. Kết hợp với kinh nghiệm 2 năm tại ABBank, bạn sẽ đủ điều kiện xét thăng tiến trong Q3/2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}