import { useMemo, useState } from "react";
import {
  TrendingUp, Download, Calendar, Filter, DollarSign,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { procurementEntries, FUNDING_SOURCES, SCHOOL_TIERS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVNDCompact } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  PROCUREMENT COST ANALYTICS (Authority)                          */
/*  Chi phí đầu tư thiết bị theo khối trường × nguồn kinh phí        */
/* ================================================================ */

const FUND_COLOR: Record<typeof FUNDING_SOURCES[number], string> = {
  "Ngân sách":  "#2563eb",
  "Học phí":    "#c8a84e",
  "Xã hội hóa": "#16a34a",
};

export function ProcurementCostAnalytics() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";

  const [year, setYear] = useState(2026);
  const years = Array.from(new Set(procurementEntries.map((p) => p.year))).sort();

  const filtered = useMemo(
    () => procurementEntries.filter((p) => p.year === year && p.province === myProvince),
    [year, myProvince]
  );

  const totalAmount = filtered.reduce((s, p) => s + p.amountVND, 0);
  const byFund = useMemo(() => {
    return FUNDING_SOURCES.map((f) => ({
      name: f,
      value: Math.round(filtered.filter((p) => p.fundingSource === f).reduce((s, p) => s + p.amountVND, 0) / 1_000_000),
      fill: FUND_COLOR[f],
    }));
  }, [filtered]);

  const byTierAndFund = useMemo(() => {
    return SCHOOL_TIERS.map((tier) => {
      const row: Record<string, number | string> = { tier };
      FUNDING_SOURCES.forEach((f) => {
        row[f] = Math.round(filtered
          .filter((p) => p.schoolTier === tier && p.fundingSource === f)
          .reduce((s, p) => s + p.amountVND, 0) / 1_000_000);
      });
      return row;
    });
  }, [filtered]);

  const yoyComparison = useMemo(() => {
    return years.map((y) => {
      const yearSum = procurementEntries
        .filter((p) => p.year === y && p.province === myProvince)
        .reduce((s, p) => s + p.amountVND, 0);
      return { year: `${y}`, total: Math.round(yearSum / 1_000_000_000) };
    });
  }, [years, myProvince]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={TrendingUp}
        title="Thống kê Chi phí Mua sắm"
        subtitle={`Chi phí đầu tư thiết bị STEM theo khối trường × nguồn kinh phí tại ${myProvince} — làm căn cứ lập dự toán.`}
        accentColor="#7c3aed"
        actions={
          <>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
              style={{ fontSize: "13px" }}>
              {years.map((y) => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <button onClick={() => toast.success(`Xuất báo cáo dự toán ${year}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất dự toán
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label={`Tổng chi ${year}`} value={formatVNDCompact(totalAmount)} color="#7c3aed" change="+12%" trend="up" />
        {FUNDING_SOURCES.map((f) => {
          const sum = filtered.filter((p) => p.fundingSource === f).reduce((s, p) => s + p.amountVND, 0);
          return (
            <KpiCard key={f} icon={Calendar} label={f} value={formatVNDCompact(sum)} color={FUND_COLOR[f]}
              subtitle={`${totalAmount ? Math.round(sum / totalAmount * 100) : 0}% tổng`} />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* YoY trend */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Tổng chi mua sắm theo năm (tỷ VND)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yoyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v} tỷ`} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {yoyComparison.map((y, i) => (
                  <Cell key={i} fill={y.year === `${year}` ? "#7c3aed" : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Funding source pie */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Cơ cấu nguồn kinh phí {year} (triệu VND)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byFund} dataKey="value" cx="50%" cy="50%"
                innerRadius={50} outerRadius={90} paddingAngle={3}
                label={(e) => e.value.toLocaleString()}>
                {byFund.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu VND`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {byFund.map((d) => (
              <div key={d.name} className="flex items-center gap-2" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.fill }} />
                <span className="flex-1 text-muted-foreground">{d.name}</span>
                <strong>{d.value.toLocaleString()} triệu</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tier × Fund stacked bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Filter className="w-4 h-4 inline mr-1.5" />
          Chi phí {year} theo Khối trường × Nguồn kinh phí (triệu VND)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byTierAndFund}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {FUNDING_SOURCES.map((f) => (
              <Bar key={f} dataKey={f} stackId="a" fill={FUND_COLOR[f]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProcurementCostAnalytics;
