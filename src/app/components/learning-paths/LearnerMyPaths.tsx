import { useState } from "react";
import { Link } from "react-router";
import {
  Clock, BookOpen, CheckCircle2, PlayCircle, AlertCircle, Award,
  ChevronRight, Calendar, Target, TrendingUp, Flame, BarChart3,
} from "lucide-react";
import { mockEnrollments, mockPathsFull } from "./mock-data";
import { mockCourses } from "../mock-data";
import type { PathEnrollment, LearningPathFull } from "./types";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  in_progress: { label: "Đang học", color: "#2e86de", bg: "#2e86de10", icon: PlayCircle },
  completed: { label: "Hoàn thành", color: "#27ae60", bg: "#27ae6010", icon: CheckCircle2 },
  overdue: { label: "Quá hạn", color: "#e74c3c", bg: "#e74c3c10", icon: AlertCircle },
  not_started: { label: "Chưa bắt đầu", color: "#6b7280", bg: "#6b728010", icon: Clock },
};

export function LearnerMyPaths() {
  const [filter, setFilter] = useState("all");

  // Learner is U003
  const myEnrollments = mockEnrollments.filter(e => e.userId === "U003");
  const filtered = filter === "all" ? myEnrollments : myEnrollments.filter(e => e.status === filter);

  const inProgress = myEnrollments.filter(e => e.status === "in_progress");
  const completed = myEnrollments.filter(e => e.status === "completed");
  const totalHours = myEnrollments.reduce((s, e) => s + e.totalHoursSpent, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Đang học", value: inProgress.length, icon: PlayCircle, color: "#2e86de" },
          { label: "Hoàn thành", value: completed.length, icon: CheckCircle2, color: "#27ae60" },
          { label: "Tổng giờ học", value: `${totalHours}h`, icon: Clock, color: "#f59e0b" },
          { label: "Chứng chỉ", value: myEnrollments.filter(e => e.certificateIssued).length, icon: Award, color: "#c8a84e" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.label}</span>
            </div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "all", label: `Tất cả (${myEnrollments.length})` },
          { key: "in_progress", label: `Đang học (${inProgress.length})` },
          { key: "completed", label: `Hoàn thành (${completed.length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filter === f.key ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Path Cards */}
      <div className="space-y-4">
        {filtered.map(enrollment => {
          const path = mockPathsFull.find(p => p.id === enrollment.pathId);
          if (!path) return null;
          const sc = STATUS_CONFIG[enrollment.status];
          const StatusIcon = sc.icon;
          const currentCourse = mockCourses.find(c => c.id === enrollment.currentCourseId);
          const currentMilestone = path.milestones.find(m => m.id === enrollment.currentMilestoneId);

          return (
            <div key={enrollment.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all">
              {/* Top gradient */}
              <div className="h-1.5 bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: `${enrollment.progress}%` }} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Status + Path title */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: sc.color, background: sc.bg }}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                      {path.mandatory && (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700" style={{ fontSize: "10px", fontWeight: 500 }}>Bắt buộc</span>
                      )}
                      {enrollment.certificateIssued && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#c8a84e]/10 text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 500 }}>
                          <Award className="w-3 h-3" /> Đã cấp chứng chỉ
                        </span>
                      )}
                    </div>
                    <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{path.title}</h3>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{path.description}</p>
                  </div>

                  {/* Progress circle */}
                  <div className="shrink-0">
                    <svg viewBox="0 0 60 60" style={{ width: 60, height: 60 }}>
                      <circle cx="30" cy="30" r="25" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                      <circle cx="30" cy="30" r="25" fill="none" stroke={enrollment.progress === 100 ? "#27ae60" : "#990803"}
                        strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={`${(enrollment.progress / 100) * 157} 157`}
                        transform="rotate(-90 30 30)" />
                      <text x="30" y="33" textAnchor="middle" fill="currentColor" style={{ fontSize: "12px", fontWeight: 700 }}>
                        {enrollment.progress}%
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-5 mt-3">
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <BookOpen className="w-3.5 h-3.5" /> {enrollment.completedCourses}/{enrollment.totalCourses} khóa
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <Clock className="w-3.5 h-3.5" /> {enrollment.totalHoursSpent} giờ
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <Calendar className="w-3.5 h-3.5" /> Bắt đầu: {enrollment.enrolledDate}
                  </span>
                  {enrollment.deadline && (
                    <span className={`flex items-center gap-1 ${new Date(enrollment.deadline) < new Date() ? "text-red-500" : "text-muted-foreground"}`}
                      style={{ fontSize: "12px" }}>
                      <Target className="w-3.5 h-3.5" /> Hạn: {enrollment.deadline}
                    </span>
                  )}
                </div>

                {/* Milestone Progress */}
                <div className="mt-4">
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px" }}>TIẾN ĐỘ CỘT MỐC</p>
                  <div className="flex items-center gap-1">
                    {path.milestones.map((m, idx) => {
                      const isCurrent = m.id === enrollment.currentMilestoneId;
                      const isPast = idx < path.milestones.findIndex(x => x.id === enrollment.currentMilestoneId);
                      const isComplete = enrollment.status === "completed" || isPast;

                      return (
                        <div key={m.id} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isComplete ? "bg-green-500 text-white" :
                              isCurrent ? "bg-[#990803] text-white ring-4 ring-[#990803]/20" :
                              "bg-secondary text-muted-foreground"
                            }`} style={{ fontSize: "11px", fontWeight: 700 }}>
                              {isComplete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <p className={`mt-1 text-center ${isCurrent ? "text-[#990803]" : "text-muted-foreground"}`}
                              style={{ fontSize: "10px", fontWeight: isCurrent ? 600 : 400 }}>
                              {m.title}
                            </p>
                          </div>
                          {idx < path.milestones.length - 1 && (
                            <div className={`w-full h-0.5 mx-1 ${isComplete ? "bg-green-500" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Current course / Action */}
                {enrollment.status === "in_progress" && currentCourse && (
                  <div className="mt-4 p-3 bg-[#990803]/5 rounded-lg border border-[#990803]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={currentCourse.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                            Đang học{currentMilestone ? ` • ${currentMilestone.title}` : ""}
                          </p>
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{currentCourse.title}</p>
                        </div>
                      </div>
                      <Link to={`/courses/${currentCourse.id}/learn`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
                        style={{ fontSize: "12px", fontWeight: 500 }}>
                        <PlayCircle className="w-4 h-4" /> Tiếp tục
                      </Link>
                    </div>
                  </div>
                )}

                {enrollment.status === "completed" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-green-800" style={{ fontSize: "13px", fontWeight: 500 }}>Lộ trình đã hoàn thành!</p>
                        <p className="text-green-600" style={{ fontSize: "11px" }}>
                          Hoàn thành {enrollment.totalCourses} khóa trong {enrollment.totalHoursSpent} giờ
                          {enrollment.certificateIssued && " • Chứng chỉ đã được cấp"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>
            {filter === "all" ? "Bạn chưa tham gia lộ trình nào" : "Không có lộ trình phù hợp"}
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Khám phá các lộ trình đào tạo phù hợp với bạn</p>
        </div>
      )}
    </div>
  );
}
