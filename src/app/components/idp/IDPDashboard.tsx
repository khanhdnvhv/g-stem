import { useState, useMemo } from "react";
import {
  Search, Filter, Users, Target, TrendingUp, CheckCircle2,
  Clock, Eye, ChevronRight, BarChart3, AlertTriangle,
} from "lucide-react";
import {
  MOCK_IDPS, IDP_STATUS_CONFIG, COMPETENCY_CATEGORIES, getIDPStats,
  type IndividualDevelopmentPlan, type IDPStatus,
} from "./mock-data";

interface IDPDashboardProps {
  onSelectIDP: (id: string) => void;
}

export function IDPDashboard({ onSelectIDP }: IDPDashboardProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<IDPStatus | "all">("all");

  const stats = getIDPStats();

  const filtered = useMemo(() => {
    return MOCK_IDPS.filter(idp => {
      if (search) {
        const q = search.toLowerCase();
        if (!idp.employeeName.toLowerCase().includes(q) &&
            !idp.employeeDept.toLowerCase().includes(q) &&
            !idp.employeeSubsidiary.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && idp.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterStatus]);

  // Competency gap analysis (aggregated)
  const gapData = useMemo(() => {
    const map: Record<string, { name: string; totalGap: number; count: number; category: string }> = {};
    MOCK_IDPS.forEach(idp => {
      idp.competencies.forEach(c => {
        if (!map[c.name]) map[c.name] = { name: c.name, totalGap: 0, count: 0, category: c.category };
        map[c.name].totalGap += (c.targetLevel - c.currentLevel);
        map[c.name].count += 1;
      });
    });
    return Object.values(map).sort((a, b) => (b.totalGap / b.count) - (a.totalGap / a.count)).slice(0, 8);
  }, []);

  const maxGap = Math.max(...gapData.map(d => d.totalGap / d.count));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng IDP", value: stats.total, icon: Users, color: "#990803" },
          { label: "Đang thực hiện", value: stats.inProgress, icon: Clock, color: "#2563eb" },
          { label: "Hoàn thành", value: stats.completed, icon: CheckCircle2, color: "#16a34a" },
          { label: "Tiến độ TB", value: `${stats.avgProgress}%`, icon: TrendingUp, color: "#c8a84e" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "12" }}>
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-gray-800" style={{ fontSize: "20px", fontWeight: 700 }}>{s.value}</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap Analysis Chart + IDP List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gap Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4 text-[#c8a84e]" /> Khoảng cách Năng lực
          </h3>
          <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>Top năng lực cần phát triển (trung bình gap)</p>

          {/* Custom SVG horizontal bar chart */}
          <svg width="100%" height={gapData.length * 32 + 10} viewBox={`0 0 260 ${gapData.length * 32 + 10}`} preserveAspectRatio="xMidYMid meet">
            {gapData.map((d, i) => {
              const avgGap = d.totalGap / d.count;
              const barW = maxGap > 0 ? (avgGap / maxGap) * 140 : 0;
              const catCfg = COMPETENCY_CATEGORIES[d.category];
              const y = i * 32 + 5;
              return (
                <g key={d.name}>
                  <text x="0" y={y + 12} fill="#6b7280" style={{ fontSize: "10px" }}>{d.name}</text>
                  <rect x="110" y={y + 2} width={barW} height="14" rx="3"
                    fill={catCfg?.color || "#990803"} opacity="0.7" />
                  <text x={115 + barW} y={y + 13} fill="#374151" style={{ fontSize: "10px", fontWeight: 600 }}>
                    {avgGap.toFixed(1)}
                  </text>
                  <text x="255" y={y + 13} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>
                    {d.count}명
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* IDP List */}
        <div className="lg:col-span-2 space-y-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm nhân viên, phòng ban..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "13px" }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
              style={{ fontSize: "12px" }}
            >
              <option value="all">Tất cả trạng thái</option>
              {(Object.keys(IDP_STATUS_CONFIG) as IDPStatus[]).map(st => (
                <option key={st} value={st}>{IDP_STATUS_CONFIG[st].label}</option>
              ))}
            </select>
          </div>

          {/* IDP Cards */}
          {filtered.map(idp => {
            const stCfg = IDP_STATUS_CONFIG[idp.status];
            const totalGoals = idp.goals.length;
            const completedGoals = idp.goals.filter(g => g.status === "completed").length;

            return (
              <div
                key={idp.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
                onClick={() => onSelectIDP(idp.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ fontSize: "12px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                  >
                    {idp.employeeAvatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-800 group-hover:text-[#990803] transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>
                        {idp.employeeName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                        {stCfg.label}
                      </span>
                      <span className="text-gray-300" style={{ fontSize: "10px" }}>{idp.cycle}</span>
                    </div>
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>
                      {idp.employeeTitle} • {idp.employeeDept} • {idp.employeeSubsidiary}
                    </p>

                    {/* Progress */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${idp.overallProgress}%`,
                            background: idp.overallProgress === 100 ? "#16a34a" : "linear-gradient(90deg, #990803, #c8a84e)",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: idp.overallProgress === 100 ? "#16a34a" : "#374151" }}>
                        {idp.overallProgress}%
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-1.5 text-gray-400" style={{ fontSize: "11px" }}>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {completedGoals}/{totalGoals} mục tiêu</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {idp.competencies.length} năng lực</span>
                      <span>QL: {idp.managerName}</span>
                    </div>
                  </div>

                  {/* Mini competency bars */}
                  <div className="shrink-0 hidden sm:block">
                    <div className="flex gap-0.5">
                      {idp.competencies.slice(0, 5).map(c => {
                        const catCfg = COMPETENCY_CATEGORIES[c.category];
                        return (
                          <div key={c.id} className="flex flex-col items-center gap-0.5" title={`${c.name}: ${c.currentLevel}→${c.targetLevel}`}>
                            <div className="w-3 rounded-t" style={{ height: `${c.targetLevel * 6}px`, backgroundColor: catCfg?.color || "#e5e7eb", opacity: 0.2 }} />
                            <div className="w-3 rounded-t" style={{ height: `${c.currentLevel * 6}px`, backgroundColor: catCfg?.color || "#990803", marginTop: `-${c.targetLevel * 6}px` }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400" style={{ fontSize: "14px" }}>Không tìm thấy IDP nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
