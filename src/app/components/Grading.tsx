import { useState, useCallback, useMemo } from "react";
import {
  ClipboardCheck, ListChecks, PenTool, Ruler, Table2, BarChart3,
  History, Building2, ShieldCheck,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { GradingQueue } from "./grading/GradingQueue";
import { GradingPanel } from "./grading/GradingPanel";
import { RubricManager } from "./grading/RubricManager";
import { Gradebook } from "./grading/Gradebook";
import { GradeAnalytics } from "./grading/GradeAnalytics";
import { GradingHistory } from "./grading/GradingHistory";
import { EnterpriseGradeView } from "./grading/EnterpriseGradeView";
import { GradeManagement } from "./grading/GradeManagement";
import { LearnerGrades } from "./grading/LearnerGrades";
import { getPendingCount } from "./grading/mock-data";

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
  instructorOnly?: boolean;
}

const ALL_TABS: TabDef[] = [
  { id: "queue", label: "Chờ chấm", icon: ListChecks, badge: String(getPendingCount()), instructorOnly: true },
  { id: "panel", label: "Chấm chi tiết", icon: PenTool, instructorOnly: true },
  { id: "rubric", label: "Rubric", icon: Ruler, instructorOnly: true },
  { id: "gradebook", label: "Sổ điểm", icon: Table2, instructorOnly: true },
  { id: "analytics", label: "Phân tích", icon: BarChart3, instructorOnly: true },
  { id: "history", label: "Lịch sử", icon: History, instructorOnly: true },
  { id: "enterprise", label: "Tổng quan Tập đoàn", icon: Building2, adminOnly: true },
  { id: "management", label: "Quản lý & Phê duyệt", icon: ShieldCheck, adminOnly: true },
];

export function Grading() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLearner = user?.role === "learner";
  const defaultTab = isAdmin ? "enterprise" : "queue";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Learner gets a completely different view
  if (isLearner) {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
              Kết quả & Điểm số
            </h1>
          </div>
          <p className="text-gray-500" style={{ fontSize: "13px" }}>
            Xem điểm số, nhận xét và theo dõi tiến trình học tập của bạn
          </p>
        </div>
        <LearnerGrades />
      </div>
    );
  }

  const visibleTabs = useMemo(() =>
    ALL_TABS.filter(t => {
      if (t.adminOnly && !isAdmin) return false;
      if (t.instructorOnly && isAdmin) return true; // admin can see instructor tabs too
      if (t.instructorOnly) return true;
      return true;
    }),
    [isAdmin]
  );

  const handleOpenGrading = useCallback((submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setActiveTab("panel");
  }, []);

  const handleBackToQueue = useCallback(() => {
    setSelectedSubmissionId(null);
    setActiveTab("queue");
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "queue":
        return <GradingQueue onOpenGrading={handleOpenGrading} isAdmin={isAdmin} />;
      case "panel":
        return <GradingPanel submissionId={selectedSubmissionId} onBack={handleBackToQueue} isAdmin={isAdmin} />;
      case "rubric":
        return <RubricManager isAdmin={isAdmin} />;
      case "gradebook":
        return <Gradebook isAdmin={isAdmin} />;
      case "analytics":
        return <GradeAnalytics isAdmin={isAdmin} />;
      case "history":
        return <GradingHistory isAdmin={isAdmin} />;
      case "enterprise":
        return <EnterpriseGradeView />;
      case "management":
        return <GradeManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-6 h-6 text-[#990803]" />
          <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
            {isAdmin ? "Quản lý Điểm số Tập đoàn" : "Chấm điểm Bài nộp"}
          </h1>
        </div>
        <p className="text-gray-500" style={{ fontSize: "13px" }}>
          {isAdmin
            ? "Giám sát toàn bộ điểm số, hiệu suất giảng viên và chính sách chấm điểm toàn Tập đoàn"
            : "Quản lý, chấm điểm bài nộp và theo dõi tiến độ học viên các khóa học của bạn"
          }
        </p>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5 overflow-x-auto pb-px scrollbar-hide">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap border-b-2 transition-all cursor-pointer
                  ${isActive
                    ? "border-[#990803] text-[#990803]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
                style={{ fontSize: "12.5px", fontWeight: isActive ? 600 : 500 }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-600"}`}
                    style={{ fontSize: "10px", fontWeight: 700 }}
                  >
                    {tab.badge}
                  </span>
                )}
                {tab.adminOnly && (
                  <span className="px-1 py-0.5 rounded bg-purple-50 text-purple-600" style={{ fontSize: "9px", fontWeight: 600 }}>
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderContent()}</div>
    </div>
  );
}
