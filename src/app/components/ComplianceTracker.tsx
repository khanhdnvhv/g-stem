import { useState } from "react";
import { ShieldCheck, BarChart3, Grid3X3, FileSearch } from "lucide-react";
import { ComplianceOverview } from "./compliance/ComplianceOverview";
import { ComplianceMatrix } from "./compliance/ComplianceMatrix";
import { ComplianceDetail } from "./compliance/ComplianceDetail";

type View = "overview" | "matrix" | "detail";
type Tab = "overview" | "matrix";

export function ComplianceTracker() {
  const [view, setView] = useState<View>("overview");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const handleSelectProgram = (id: string) => {
    setSelectedProgramId(id);
    setView("detail");
  };

  const handleBack = () => {
    setView(activeTab);
    setSelectedProgramId("");
  };

  const tabs = [
    { id: "overview" as Tab, label: "Tổng quan", icon: BarChart3 },
    { id: "matrix" as Tab, label: "Ma trận Tuân thủ", icon: Grid3X3 },
  ];

  return (
    <div className="space-y-4">
      {/* Header — hide when in detail view */}
      {view !== "detail" && (
        <>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-[#990803]" />
              <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
                Đào tạo Bắt buộc & Tuân thủ
              </h1>
            </div>
            <p className="text-gray-500" style={{ fontSize: "13px" }}>
              Theo dõi tuân thủ đào tạo bắt buộc toàn tập đoàn — An toàn, Pháp luật, Tài chính, CNTT, Đạo đức
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-0.5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setView(tab.id); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                      isActive ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      {view === "overview" && <ComplianceOverview onSelectProgram={handleSelectProgram} />}
      {view === "matrix" && <ComplianceMatrix onSelectProgram={handleSelectProgram} />}
      {view === "detail" && <ComplianceDetail programId={selectedProgramId} onBack={handleBack} />}
    </div>
  );
}
