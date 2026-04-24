import { useState } from "react";
import {
  ArrowLeft, Save, Send, Plus, Trash2, Target, Briefcase,
  Calendar, Clock, CheckCircle, Star, AlertCircle,
  BookOpen, Heart, Award, Users, Lightbulb, GraduationCap, RefreshCw,
} from "lucide-react";
import {
  COMPETENCY_CATEGORIES, LEVEL_LABELS, ACTIVITY_TYPE_CONFIG,
  type Competency, type CompetencyLevel, type DevelopmentGoal,
  type DevelopmentActivity, type ActivityType,
} from "./mock-data";
import { useConfirm } from "../ConfirmDialog";

interface IDPEditorProps {
  onBack: () => void;
}

export function IDPEditor({ onBack }: IDPEditorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saved, setSaved] = useState(false);

  // Step 1: Self Assessment
  const [careerAspiration, setCareerAspiration] = useState("");
  const [selfAssessment, setSelfAssessment] = useState("");
  const [cycle, setCycle] = useState("Q2/2026");

  // Step 2: Competencies
  const [competencies, setCompetencies] = useState<Competency[]>([
    { id: "C1", name: "Tư duy chiến lược", category: "leadership", currentLevel: 3, targetLevel: 4, weight: 15 },
    { id: "C2", name: "Chuyên môn nghiệp vụ", category: "technical", currentLevel: 3, targetLevel: 5, weight: 20 },
    { id: "C3", name: "Kỹ năng giao tiếp", category: "soft_skill", currentLevel: 3, targetLevel: 4, weight: 15 },
  ]);

  // Step 3: Goals
  const [goals, setGoals] = useState<Partial<DevelopmentGoal>[]>([]);

  const addCompetency = () => {
    setCompetencies(prev => [...prev, {
      id: `C${Date.now()}`,
      name: "",
      category: "core",
      currentLevel: 2 as CompetencyLevel,
      targetLevel: 4 as CompetencyLevel,
      weight: 10,
    }]);
  };

  const updateComp = (idx: number, updates: Partial<Competency>) => {
    setCompetencies(prev => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const confirmDlg = useConfirm();
  const removeComp = async (idx: number) => {
    const c = competencies[idx];
    const ok = await confirmDlg({
      title: "Xóa năng lực?",
      message: `Bạn có chắc muốn xóa năng lực "${c?.name || ""}" khỏi kế hoạch phát triển?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setCompetencies(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const addGoal = () => {
    setGoals(prev => [...prev, {
      id: `G${Date.now()}`,
      title: "",
      description: "",
      priority: "medium",
      startDate: "",
      targetDate: "",
      activities: [],
    }]);
  };

  const updateGoal = (idx: number, updates: Partial<DevelopmentGoal>) => {
    setGoals(prev => prev.map((g, i) => i === idx ? { ...g, ...updates } : g));
  };

  const removeGoal = async (idx: number) => {
    const g = goals[idx];
    const ok = await confirmDlg({
      title: "Xóa mục tiêu phát triển?",
      message: `Bạn có chắc muốn xóa mục tiêu "${g?.title || ""}" và tất cả hoạt động liên quan?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setGoals(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const addActivity = (goalIdx: number) => {
    setGoals(prev => prev.map((g, i) => {
      if (i !== goalIdx) return g;
      const acts = [...(g.activities || [])];
      acts.push({
        id: `A${Date.now()}`,
        type: "course",
        title: "",
        description: "",
        status: "not_started",
        dueDate: "",
        hours: 0,
      });
      return { ...g, activities: acts };
    }));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>Tạo Kế hoạch Phát triển Cá nhân</h2>
            <p className="text-gray-400" style={{ fontSize: "12px" }}>Chu kỳ {cycle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
            {saved ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Đã lưu</> : <><Save className="w-3.5 h-3.5" /> Lưu nháp</>}
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đã gửi IDP để phê duyệt!")); onBack(); }} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Send className="w-3.5 h-3.5" /> Gửi duyệt
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {([
          { s: 1 as const, label: "Tự đánh giá", icon: Star },
          { s: 2 as const, label: "Năng lực", icon: Target },
          { s: 3 as const, label: "Mục tiêu & Hoạt động", icon: Briefcase },
        ]).map((st, idx) => {
          const Icon = st.icon;
          const isActive = step === st.s;
          const isDone = step > st.s;
          return (
            <div key={st.s} className="flex items-center gap-2">
              <button
                onClick={() => setStep(st.s)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${
                  isActive ? "border-[#990803] bg-[#990803]/5 text-[#990803]" :
                  isDone ? "border-green-300 bg-green-50 text-green-600" :
                  "border-gray-200 text-gray-400"
                }`}
                style={{ fontSize: "12px", fontWeight: isActive ? 600 : 400 }}
              >
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                {st.label}
              </button>
              {idx < 2 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          );
        })}
      </div>

      {/* Step 1: Self Assessment */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-gray-700" style={{ fontSize: "15px", fontWeight: 600 }}>Tự đánh giá & Định hướng phát triển</h3>

            <div>
              <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>
                Chu kỳ đánh giá
              </label>
              <select
                value={cycle}
                onChange={e => setCycle(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none"
                style={{ fontSize: "13px" }}
              >
                <option>Q2/2026</option>
                <option>Q3/2026</option>
                <option>Q4/2026</option>
                <option>Annual 2026</option>
              </select>
            </div>

            <div>
              <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>
                Mục tiêu nghề nghiệp (Career Aspiration) *
              </label>
              <textarea
                value={careerAspiration}
                onChange={e => setCareerAspiration(e.target.value)}
                placeholder="Mô tả mục tiêu nghề nghiệp ngắn hạn (6-12 tháng) và dài hạn (2-3 năm)..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
                style={{ fontSize: "13px" }}
              />
            </div>

            <div>
              <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>
                Tự đánh giá điểm mạnh & điểm cần cải thiện *
              </label>
              <textarea
                value={selfAssessment}
                onChange={e => setSelfAssessment(e.target.value)}
                placeholder="Mô tả thế mạnh hiện tại và những lĩnh vực cần phát triển thêm..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
              Tiếp tục: Năng lực →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Competencies */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700" style={{ fontSize: "15px", fontWeight: 600 }}>Khung năng lực</h3>
              <button onClick={addCompetency} className="px-3 py-1.5 border border-[#990803]/30 text-[#990803] rounded-lg hover:bg-[#990803]/5 cursor-pointer flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                <Plus className="w-3 h-3" /> Thêm năng lực
              </button>
            </div>

            <div className="space-y-3">
              {competencies.map((comp, idx) => (
                <div key={comp.id} className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={comp.name}
                      onChange={e => updateComp(idx, { name: e.target.value })}
                      placeholder="Tên năng lực..."
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#990803]/20"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    />
                    <select
                      value={comp.category}
                      onChange={e => updateComp(idx, { category: e.target.value as any })}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-600 cursor-pointer focus:outline-none"
                      style={{ fontSize: "11px" }}
                    >
                      {Object.entries(COMPETENCY_CATEGORIES).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeComp(idx)} className="p-1 text-gray-300 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>Hiện tại:</span>
                      <div className="flex gap-0.5">
                        {([1, 2, 3, 4, 5] as CompetencyLevel[]).map(lv => (
                          <button
                            key={lv}
                            onClick={() => updateComp(idx, { currentLevel: lv })}
                            className={`w-7 h-7 rounded-lg text-center cursor-pointer transition-colors ${comp.currentLevel >= lv ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-400"}`}
                            style={{ fontSize: "11px", fontWeight: 600 }}
                            title={LEVEL_LABELS[lv]}
                          >
                            {lv}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>Mục tiêu:</span>
                      <div className="flex gap-0.5">
                        {([1, 2, 3, 4, 5] as CompetencyLevel[]).map(lv => (
                          <button
                            key={lv}
                            onClick={() => updateComp(idx, { targetLevel: lv })}
                            className={`w-7 h-7 rounded-lg text-center cursor-pointer transition-colors ${comp.targetLevel >= lv ? "bg-[#c8a84e] text-white" : "bg-gray-100 text-gray-400"}`}
                            style={{ fontSize: "11px", fontWeight: 600 }}
                            title={LEVEL_LABELS[lv]}
                          >
                            {lv}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>Trọng số:</span>
                      <input
                        type="number"
                        value={comp.weight}
                        onChange={e => updateComp(idx, { weight: Number(e.target.value) })}
                        className="w-14 px-2 py-1 border border-gray-200 rounded-lg bg-white text-center text-gray-700 focus:outline-none"
                        style={{ fontSize: "12px" }}
                        min={0} max={100}
                      />
                      <span className="text-gray-300" style={{ fontSize: "10px" }}>%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>
              ← Quay lại
            </button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
              Tiếp tục: Mục tiêu →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals & Activities */}
      {step === 3 && (
        <div className="space-y-4">
          {goals.map((goal, gIdx) => (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>Mục tiêu #{gIdx + 1}</span>
                <button onClick={() => removeGoal(gIdx)} className="p-1 text-gray-300 hover:text-red-500 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                value={goal.title || ""}
                onChange={e => updateGoal(gIdx, { title: e.target.value })}
                placeholder="Tiêu đề mục tiêu..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "14px", fontWeight: 500 }}
              />
              <textarea
                value={goal.description || ""}
                onChange={e => updateGoal(gIdx, { description: e.target.value })}
                placeholder="Mô tả chi tiết mục tiêu..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none resize-none"
                style={{ fontSize: "13px" }}
              />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <input type="text" value={goal.startDate || ""} onChange={e => updateGoal(gIdx, { startDate: e.target.value })} placeholder="Ngày bắt đầu" className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 focus:outline-none" style={{ fontSize: "12px", width: "110px" }} />
                  <span className="text-gray-300">—</span>
                  <input type="text" value={goal.targetDate || ""} onChange={e => updateGoal(gIdx, { targetDate: e.target.value })} placeholder="Hạn hoàn thành" className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 focus:outline-none" style={{ fontSize: "12px", width: "110px" }} />
                </div>
                <select
                  value={goal.priority || "medium"}
                  onChange={e => updateGoal(gIdx, { priority: e.target.value as any })}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
                  style={{ fontSize: "12px" }}
                >
                  <option value="critical">Ưu tiên cao nhất</option>
                  <option value="high">Quan trọng</option>
                  <option value="medium">Bình thường</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              {/* Activities */}
              {(goal.activities || []).length > 0 && (
                <div className="pl-3 border-l-2 border-gray-200 space-y-2">
                  {(goal.activities || []).map((act, aIdx) => (
                    <div key={act.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <select
                        value={act.type}
                        onChange={e => {
                          const newActs = [...(goal.activities || [])];
                          newActs[aIdx] = { ...newActs[aIdx], type: e.target.value as ActivityType };
                          updateGoal(gIdx, { activities: newActs });
                        }}
                        className="px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 cursor-pointer focus:outline-none"
                        style={{ fontSize: "11px" }}
                      >
                        {(Object.keys(ACTIVITY_TYPE_CONFIG) as ActivityType[]).map(t => (
                          <option key={t} value={t}>{ACTIVITY_TYPE_CONFIG[t].icon} {ACTIVITY_TYPE_CONFIG[t].label}</option>
                        ))}
                      </select>
                      <input
                        value={act.title}
                        onChange={e => {
                          const newActs = [...(goal.activities || [])];
                          newActs[aIdx] = { ...newActs[aIdx], title: e.target.value };
                          updateGoal(gIdx, { activities: newActs });
                        }}
                        placeholder="Tên hoạt động..."
                        className="flex-1 px-2 py-1 border border-gray-200 rounded bg-white text-gray-700 focus:outline-none"
                        style={{ fontSize: "12px" }}
                      />
                      <input
                        type="number"
                        value={act.hours}
                        onChange={e => {
                          const newActs = [...(goal.activities || [])];
                          newActs[aIdx] = { ...newActs[aIdx], hours: Number(e.target.value) };
                          updateGoal(gIdx, { activities: newActs });
                        }}
                        className="w-14 px-2 py-1 border border-gray-200 rounded bg-white text-center text-gray-700 focus:outline-none"
                        style={{ fontSize: "12px" }}
                        placeholder="Giờ"
                      />
                      <span className="text-gray-300" style={{ fontSize: "10px" }}>h</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => addActivity(gIdx)} className="text-[#990803] hover:underline cursor-pointer flex items-center gap-1 ml-3" style={{ fontSize: "12px" }}>
                <Plus className="w-3 h-3" /> Thêm hoạt động
              </button>
            </div>
          ))}

          <button
            onClick={addGoal}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#990803]/30 hover:text-[#990803] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" /> Thêm mục tiêu phát triển
          </button>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "13px" }}>
              ← Quay lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}