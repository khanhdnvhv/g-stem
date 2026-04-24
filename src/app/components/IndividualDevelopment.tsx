import { useState } from "react";
import {
  Target, Users, Plus, ArrowLeft, Star, Briefcase,
  Calendar, MessageSquare, User, Award, ChevronRight,
  Edit3, CheckCircle, Clock,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { IDPDashboard } from "./idp/IDPDashboard";
import { IDPEditor } from "./idp/IDPEditor";
import { IDPTimeline } from "./idp/IDPTimeline";
import { CompetencyRadar } from "./idp/CompetencyRadar";
import {
  MOCK_IDPS, IDP_STATUS_CONFIG, COMPETENCY_CATEGORIES, LEVEL_LABELS,
  GOAL_STATUS_CONFIG, PRIORITY_CONFIG,
  type IndividualDevelopmentPlan,
} from "./idp/mock-data";

type View = "dashboard" | "detail" | "editor" | "my_idp";

export function IndividualDevelopment() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isLearner = role === "learner";

  const [view, setView] = useState<View>(isLearner ? "my_idp" : "dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectIDP = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleBack = () => {
    setView(isLearner ? "my_idp" : "dashboard");
    setSelectedId(null);
  };

  // For learner, show their own IDP (use first mock as demo)
  const myIdp = MOCK_IDPS[0]; // Demo: Nguyễn Minh Tuấn's IDP
  const selectedIdp = MOCK_IDPS.find(i => i.id === selectedId) || myIdp;

  return (
    <div className="space-y-4">
      {/* Page Header (only on dashboard/my_idp views) */}
      {(view === "dashboard" || view === "my_idp") && (
        <>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-6 h-6 text-[#990803]" />
                <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
                  {isLearner ? "Kế hoạch Phát triển của tôi" : "Quản lý IDP"}
                </h1>
              </div>
              <p className="text-gray-500" style={{ fontSize: "13px" }}>
                {isLearner
                  ? "Kế hoạch phát triển cá nhân — theo dõi năng lực, mục tiêu và hoạt động phát triển"
                  : "Quản lý kế hoạch phát triển cá nhân toàn tập đoàn — năng lực, mục tiêu, gap analysis"
                }
              </p>
            </div>
            {(isAdmin || !isLearner) && (
              <button
                onClick={() => setView("editor")}
                className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                <Plus className="w-3.5 h-3.5" /> Tạo IDP mới
              </button>
            )}
          </div>
        </>
      )}

      {/* Views */}
      {view === "dashboard" && (
        <IDPDashboard onSelectIDP={handleSelectIDP} />
      )}

      {view === "editor" && (
        <IDPEditor onBack={handleBack} />
      )}

      {(view === "detail" || view === "my_idp") && (
        <IDPDetailView
          idp={view === "my_idp" ? myIdp : selectedIdp}
          onBack={view === "my_idp" ? undefined : handleBack}
          isOwner={view === "my_idp" || (user?.name === selectedIdp?.employeeName)}
          isAdmin={isAdmin}
          isLearner={isLearner}
          onEdit={() => setView("editor")}
        />
      )}
    </div>
  );
}

// ─── IDP Detail View ───

function IDPDetailView({
  idp, onBack, isOwner, isAdmin, isLearner, onEdit,
}: {
  idp: IndividualDevelopmentPlan;
  onBack?: () => void;
  isOwner: boolean;
  isAdmin: boolean;
  isLearner: boolean;
  onEdit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "competencies" | "goals" | "feedback">("overview");
  const [feedbackText, setFeedbackText] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState<string[]>([]);
  const stCfg = IDP_STATUS_CONFIG[idp.status];

  const totalGoals = idp.goals.length;
  const completedGoals = idp.goals.filter(g => g.status === "completed").length;
  const totalActivities = idp.goals.reduce((s, g) => s + g.activities.length, 0);
  const completedActivities = idp.goals.reduce((s, g) => s + g.activities.filter(a => a.status === "completed").length, 0);
  const totalHours = idp.goals.reduce((s, g) => s + g.activities.reduce((h, a) => h + a.hours, 0), 0);
  const completedHours = idp.goals.reduce((s, g) => s + g.activities.filter(a => a.status === "completed").reduce((h, a) => h + a.hours, 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer mt-0.5">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
          )}

          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ fontSize: "16px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
          >
            {idp.employeeAvatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{idp.employeeName}</span>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                {stCfg.label}
              </span>
              <span className="text-gray-400" style={{ fontSize: "12px" }}>{idp.cycle}</span>
            </div>
            <p className="text-gray-500" style={{ fontSize: "13px" }}>
              {idp.employeeTitle} • {idp.employeeDept} • {idp.employeeSubsidiary}
            </p>
            <div className="flex items-center gap-4 mt-2 text-gray-400" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> QL: {idp.managerName}</span>
              {idp.mentorName && <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Mentor: {idp.mentorName}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Cập nhật: {idp.updatedAt}</span>
            </div>

            {/* Overall progress */}
            <div className="flex items-center gap-3 mt-3 max-w-md">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${idp.overallProgress}%`,
                    background: idp.overallProgress === 100 ? "#16a34a" : "linear-gradient(90deg, #990803, #c8a84e)",
                  }}
                />
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: idp.overallProgress === 100 ? "#16a34a" : "#374151" }}>
                {idp.overallProgress}%
              </span>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <button onClick={onEdit} className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "12px" }}>
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Mục tiêu" value={`${completedGoals}/${totalGoals}`} sub="hoàn thành" color="#990803" />
        <StatCard label="Hoạt động" value={`${completedActivities}/${totalActivities}`} sub="hoàn thành" color="#2563eb" />
        <StatCard label="Giờ học" value={`${completedHours}/${totalHours}`} sub="giờ" color="#c8a84e" />
        <StatCard label="Năng lực" value={`${idp.competencies.length}`} sub={`Gap TB: ${(idp.competencies.reduce((s, c) => s + (c.targetLevel - c.currentLevel), 0) / Math.max(idp.competencies.length, 1)).toFixed(1)}`} color="#16a34a" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5">
          {([
            { id: "overview" as const, label: "Tổng quan" },
            { id: "competencies" as const, label: "Năng lực" },
            { id: "goals" as const, label: "Mục tiêu" },
            { id: "feedback" as const, label: "Phản hồi" },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border-b-2 transition-all cursor-pointer ${activeTab === tab.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              style={{ fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Biểu đồ Năng lực</h3>
            <CompetencyRadar competencies={idp.competencies} size={300} />
          </div>

          {/* Career & Self Assessment */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-gray-700 flex items-center gap-1.5 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Star className="w-4 h-4 text-[#c8a84e]" /> Mục tiêu nghề nghiệp
              </h3>
              <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.6 }}>{idp.careerAspiration}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-gray-700 flex items-center gap-1.5 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                <User className="w-4 h-4 text-[#990803]" /> Tự đánh giá
              </h3>
              <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.6 }}>{idp.selfAssessment}</p>
            </div>
            {/* Goals summary SVG */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Tiến độ Mục tiêu</h3>
              <div className="space-y-2">
                {idp.goals.map(g => {
                  const gStCfg = GOAL_STATUS_CONFIG[g.status];
                  const pCfg = PRIORITY_CONFIG[g.priority];
                  return (
                    <div key={g.id} className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: gStCfg.color }} />
                      <span className="text-gray-600 flex-1 truncate" style={{ fontSize: "12px" }}>{g.title}</span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                        <div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.progress === 100 ? "#16a34a" : "#990803" }} />
                      </div>
                      <span className="text-gray-500 shrink-0" style={{ fontSize: "11px", fontWeight: 600, minWidth: "28px", textAlign: "right" }}>{g.progress}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "competencies" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Radar Năng lực</h3>
            <CompetencyRadar competencies={idp.competencies} size={320} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Chi tiết Năng lực</h3>
            <div className="space-y-3">
              {idp.competencies.map(c => {
                const catCfg = COMPETENCY_CATEGORIES[c.category];
                const gap = c.targetLevel - c.currentLevel;
                return (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{c.name}</span>
                        <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 600, color: catCfg?.color, backgroundColor: catCfg?.bg }}>
                          {catCfg?.label}
                        </span>
                      </div>
                      <span
                        className="px-1.5 py-0.5 rounded-full"
                        style={{ fontSize: "9px", fontWeight: 700, color: gap > 2 ? "#dc2626" : gap > 1 ? "#f59e0b" : "#16a34a", backgroundColor: gap > 2 ? "#dc262612" : gap > 1 ? "#f59e0b12" : "#16a34a12" }}
                      >
                        Gap: {gap}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: "10px", width: "50px" }}>Hiện tại</span>
                      <div className="flex gap-0.5 flex-1">
                        {([1, 2, 3, 4, 5] as const).map(lv => (
                          <div
                            key={lv}
                            className="flex-1 h-4 rounded"
                            style={{ backgroundColor: lv <= c.currentLevel ? "#990803" : "#e5e7eb", opacity: lv <= c.currentLevel ? 0.8 : 0.3 }}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 600, width: "45px" }}>{LEVEL_LABELS[c.currentLevel]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400" style={{ fontSize: "10px", width: "50px" }}>Mục tiêu</span>
                      <div className="flex gap-0.5 flex-1">
                        {([1, 2, 3, 4, 5] as const).map(lv => (
                          <div
                            key={lv}
                            className="flex-1 h-4 rounded"
                            style={{ backgroundColor: lv <= c.targetLevel ? "#c8a84e" : "#e5e7eb", opacity: lv <= c.targetLevel ? 0.8 : 0.3 }}
                          />
                        ))}
                      </div>
                      <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600, width: "45px" }}>{LEVEL_LABELS[c.targetLevel]}</span>
                    </div>
                    <p className="text-gray-300 mt-1" style={{ fontSize: "9px" }}>Trọng số: {c.weight}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <IDPTimeline goals={idp.goals} />
      )}

      {activeTab === "feedback" && (
        <div className="space-y-4">
          {idp.managerFeedback && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>
                  {idp.managerName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{idp.managerName}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>Quản lý trực tiếp • {idp.updatedAt}</p>
                </div>
              </div>
              <p className="text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                {idp.managerFeedback}
              </p>
            </div>
          )}

          {idp.hrNotes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>HR</div>
                <div>
                  <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Phòng Nhân sự</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>HR Notes</p>
                </div>
              </div>
              <p className="text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                {idp.hrNotes}
              </p>
            </div>
          )}

          {/* Add feedback form */}
          {(isAdmin || !isLearner) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                <MessageSquare className="w-4 h-4 text-[#990803]" /> Thêm nhận xét
              </h3>
              {submittedFeedback.map((fb, i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-100 rounded-lg mb-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3 h-3 text-green-600" />
                    <span className="text-green-700" style={{ fontSize: "10px", fontWeight: 600 }}>Nhận xét của bạn — Vừa xong</span>
                  </div>
                  <p className="text-gray-600" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>{fb}</p>
                </div>
              ))}
              <textarea
                placeholder="Nhập nhận xét, đánh giá hoặc hướng dẫn cho nhân viên..."
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
                style={{ fontSize: "13px" }}
              />
              <div className="flex justify-end mt-2">
                <button onClick={() => { if (!feedbackText.trim()) return; setSubmittedFeedback(prev => [...prev, feedbackText.trim()]); setFeedbackText(""); import("sonner").then(m => m.toast.success("Đã gửi nhận xét thành công!")); }} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer disabled:opacity-50" style={{ fontSize: "12px", fontWeight: 600 }} disabled={!feedbackText.trim()}>
                  Gửi nhận xét
                </button>
              </div>
            </div>
          )}

          {!idp.managerFeedback && !idp.hrNotes && isLearner && (
            <div className="text-center py-12">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>Chưa có phản hồi từ quản lý</p>
              <p className="text-gray-300 mt-1" style={{ fontSize: "12px" }}>Phản hồi sẽ hiển thị khi quản lý đánh giá IDP của bạn</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-gray-400 mb-1" style={{ fontSize: "11px" }}>{label}</p>
      <p style={{ fontSize: "22px", fontWeight: 700, color }}>{value}</p>
      <p className="text-gray-300" style={{ fontSize: "10px" }}>{sub}</p>
    </div>
  );
}