import {
  CheckCircle, Circle, Clock, AlertTriangle, XCircle,
  BookOpen, Heart, Briefcase, Award, Users, Lightbulb, GraduationCap, RefreshCw,
} from "lucide-react";
import {
  type DevelopmentGoal, type DevelopmentActivity, type ActivityType,
  GOAL_STATUS_CONFIG, ACTIVITY_TYPE_CONFIG,
} from "./mock-data";

interface IDPTimelineProps {
  goals: DevelopmentGoal[];
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  course: BookOpen,
  mentoring: Heart,
  project: Briefcase,
  certification: Award,
  workshop: Users,
  self_study: Lightbulb,
  coaching: GraduationCap,
  rotation: RefreshCw,
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "in_progress": return <Clock className="w-4 h-4 text-blue-500" />;
    case "overdue": return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case "cancelled": return <XCircle className="w-4 h-4 text-gray-400" />;
    default: return <Circle className="w-4 h-4 text-gray-300" />;
  }
}

export function IDPTimeline({ goals }: IDPTimelineProps) {
  // Sort goals by priority then status
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { overdue: 0, in_progress: 1, not_started: 2, completed: 3, cancelled: 4 };
  const sortedGoals = [...goals].sort((a, b) =>
    statusOrder[a.status] - statusOrder[b.status] || priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div className="space-y-4">
      {sortedGoals.map((goal, gIdx) => {
        const stCfg = GOAL_STATUS_CONFIG[goal.status];
        const totalHours = goal.activities.reduce((s, a) => s + a.hours, 0);
        const completedHours = goal.activities
          .filter(a => a.status === "completed")
          .reduce((s, a) => s + a.hours, 0);

        return (
          <div key={goal.id} className="relative">
            {/* Goal header */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status indicator */}
                  <div className="mt-0.5">
                    <StatusIcon status={goal.status} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{goal.title}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                        {stCfg.label}
                      </span>
                    </div>
                    <p className="text-gray-400 line-clamp-2" style={{ fontSize: "12px" }}>{goal.description}</p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${goal.progress}%`,
                            background: goal.progress === 100 ? "#16a34a" : goal.status === "overdue" ? "#dc2626" : "linear-gradient(90deg, #990803, #c8a84e)",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: goal.progress === 100 ? "#16a34a" : "#374151" }}>
                        {goal.progress}%
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-gray-400" style={{ fontSize: "11px" }}>
                      <span>{goal.startDate} — {goal.targetDate}</span>
                      <span>{goal.activities.length} hoạt động</span>
                      <span>{completedHours}/{totalHours}h</span>
                    </div>

                    {goal.managerNotes && (
                      <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-amber-700" style={{ fontSize: "11px" }}>
                          <span style={{ fontWeight: 600 }}>Nhận xét quản lý:</span> {goal.managerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activities list */}
              {goal.activities.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="px-4 py-2">
                    <span className="text-gray-400" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>
                      HOẠT ĐỘNG PHÁT TRIỂN
                    </span>
                  </div>
                  <div className="px-4 pb-3 space-y-1">
                    {goal.activities.map((act, aIdx) => {
                      const actCfg = ACTIVITY_TYPE_CONFIG[act.type];
                      const ActIcon = ACTIVITY_ICONS[act.type];
                      const actStCfg = GOAL_STATUS_CONFIG[act.status];

                      return (
                        <div key={act.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          {/* Timeline dot */}
                          <div className="relative">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: actCfg.color + "12" }}
                            >
                              <ActIcon className="w-3.5 h-3.5" style={{ color: actCfg.color }} />
                            </div>
                            {/* Connecting line */}
                            {aIdx < goal.activities.length - 1 && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-1.5 bg-gray-200" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 truncate" style={{ fontSize: "12.5px", fontWeight: 500 }}>{act.title}</span>
                              <span className="px-1.5 py-0.5 rounded-full shrink-0" style={{ fontSize: "8px", fontWeight: 600, color: actCfg.color, backgroundColor: actCfg.color + "12" }}>
                                {actCfg.label}
                              </span>
                            </div>
                            <p className="text-gray-400 truncate" style={{ fontSize: "10.5px" }}>{act.description}</p>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: actStCfg.color, backgroundColor: actStCfg.bg }}>
                              {actStCfg.label}
                            </span>
                            <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>
                              {act.completedDate ? `✓ ${act.completedDate}` : `Hạn: ${act.dueDate}`}
                            </p>
                            <p className="text-gray-300" style={{ fontSize: "9px" }}>{act.hours}h</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
